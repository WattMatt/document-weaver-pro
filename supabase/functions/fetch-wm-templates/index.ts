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
    const wmComplianceTemplatesUrl = 'https://oltzgidkjxwsukvkomof.supabase.co/functions/v1/templates'
    
    // Fetch templates from WM Compliance edge function
    const templatesResponse = await fetch(wmComplianceTemplatesUrl, {
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
            url: wmComplianceTemplatesUrl,
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
    
    return new Response(
      JSON.stringify({
        success: true,
        connection: {
          url: wmComplianceTemplatesUrl,
          status: 'connected',
        },
        templates: templatesData.templates || templatesData,
        reports: templatesData.reports || []
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
