const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {

    // Get the WM Compliance API key from secrets
    const wmComplianceApiKey = Deno.env.get('WM_COMPLIANCE_API_KEY')
    
    if (!wmComplianceApiKey) {
      return new Response(
        JSON.stringify({ error: 'WM Compliance API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body for optional filters
    let filters = {}
    if (req.method === 'POST') {
      try {
        filters = await req.json()
      } catch {
        // No body or invalid JSON, use defaults
      }
    }

    // WM Compliance Supabase edge function URL
    const wmComplianceBaseUrl = 'https://oltzgidkjxwsukvkomof.supabase.co/functions/v1'
    
    // Check if fetching a specific template or listing all
    const { templateId } = filters as { templateId?: string }
    
    if (templateId) {
      // Fetch specific template with elements
      const templateResponse = await fetch(`${wmComplianceBaseUrl}/templates?id=${templateId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${wmComplianceApiKey}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!templateResponse.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to fetch template details',
            statusCode: templateResponse.status,
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      const templateData = await templateResponse.json()
      
      return new Response(
        JSON.stringify({
          success: true,
          template: templateData.template || templateData,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Fetch all templates list
    const templatesResponse = await fetch(`${wmComplianceBaseUrl}/templates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${wmComplianceApiKey}`,
        'Content-Type': 'application/json',
      },
    })

    // If the templates endpoint doesn't exist, return discovery info
    if (!templatesResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Could not connect to WM Compliance templates API',
          connection: {
            url: wmComplianceBaseUrl,
            status: 'error',
            statusCode: templatesResponse.status,
          },
          templates: [],
          reports: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const templatesData = await templatesResponse.json()
    
    // Parse inspectionTemplates from the response (this is the array WM Compliance returns)
    const inspectionTemplates = templatesData.inspectionTemplates || []
    const reportTypes = templatesData.reportTypes || []
    
    // Map inspection templates to a standard format
    const templates = inspectionTemplates.map((t: any) => ({
      id: t.id,
      name: t.name || t.title || 'Untitled Template',
      description: t.description || '',
      category: t.category || 'Inspection',
      type: t.type,
      fields: t.fields,
      sections: t.sections,
    }))
    
    return new Response(
      JSON.stringify({
        success: true,
        connection: {
          url: `${wmComplianceBaseUrl}/templates`,
          status: 'connected',
        },
        templates,
        reportTypes,
        raw: templatesData, // Include raw data for debugging
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error fetching WM Compliance templates:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch templates from WM Compliance',
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
