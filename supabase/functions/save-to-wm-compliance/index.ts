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

    // Parse request body
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { template, action = 'save' } = body

    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Template data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // WM Compliance Supabase edge function URL
    const wmComplianceBaseUrl = 'https://oltzgidkjxwsukvkomof.supabase.co/functions/v1'
    
    // Prepare template data for WM Compliance
    const templatePayload = {
      id: template.sourceTemplateId || template.id,
      name: template.name.replace(' (Imported)', ''),
      description: template.description,
      elements: template.elements,
      pageSize: template.pageSize,
      orientation: template.orientation,
      updatedAt: new Date().toISOString(),
      updatedBy: 'DocBuilder',
      sourceDocBuilderId: template.id,
    }

    // Send to WM Compliance
    const saveResponse = await fetch(`${wmComplianceBaseUrl}/save-template`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${wmComplianceApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template: templatePayload,
        action,
      }),
    })

    // Check if the endpoint exists
    if (saveResponse.status === 404) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Save endpoint not configured on WM Compliance',
          suggestion: 'Create a "save-template" edge function in your WM Compliance app to receive template updates.',
          endpointRequired: '/functions/v1/save-template',
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text()
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save template to WM Compliance',
          details: errorText,
          statusCode: saveResponse.status,
        }),
        { status: saveResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await saveResponse.json()
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Template saved to WM Compliance',
        result,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error saving to WM Compliance:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ 
        error: 'Failed to save template to WM Compliance',
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
