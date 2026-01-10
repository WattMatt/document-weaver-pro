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

    // WM Compliance app URL
    const wmComplianceUrl = 'https://wm-compliance.lovable.app'
    
    // Fetch templates from WM Compliance app's edge function
    // The wm-compliance app needs to have a 'templates' edge function deployed
    // Try the Supabase functions endpoint pattern first
    let templatesResponse = await fetch(`${wmComplianceUrl}/functions/v1/templates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${wmComplianceApiKey}`,
        'Content-Type': 'application/json',
      },
    })

    // Fallback: try direct api route
    if (!templatesResponse.ok) {
      templatesResponse = await fetch(`${wmComplianceUrl}/api/templates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${wmComplianceApiKey}`,
          'Content-Type': 'application/json',
        },
      })
    }

    // If the templates endpoint doesn't exist, return discovery info
    if (!templatesResponse.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Connected to WM Compliance app - API endpoints not yet configured',
          connection: {
            url: wmComplianceUrl,
            status: 'connected',
            apiKeyConfigured: true,
          },
          discovery: {
            note: 'Template API endpoints not found on WM Compliance app.',
            triedEndpoints: ['/functions/v1/templates', '/api/templates'],
            suggestion: 'Create a "templates" edge function in your WM Compliance app that exposes available PDF templates.'
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
          url: wmComplianceUrl,
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
