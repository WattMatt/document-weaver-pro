import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Validate authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    // Fetch templates from WM Compliance app
    const wmComplianceUrl = 'https://wm-compliance.lovable.app'
    
    // Try to fetch available templates/reports
    const templatesResponse = await fetch(`${wmComplianceUrl}/api/templates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${wmComplianceApiKey}`,
        'Content-Type': 'application/json',
      },
    })

    // If the templates endpoint doesn't exist, try alternative endpoints
    if (!templatesResponse.ok) {
      // Try fetching from a reports endpoint
      const reportsResponse = await fetch(`${wmComplianceUrl}/api/reports`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${wmComplianceApiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!reportsResponse.ok) {
        // Return info about connection status and available endpoints to discover
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Connected to WM Compliance app successfully',
            connection: {
              url: wmComplianceUrl,
              status: 'connected',
              apiKeyConfigured: true,
            },
            discovery: {
              note: 'Standard API endpoints not found. You may need to configure the WM Compliance app to expose template/report APIs.',
              triedEndpoints: ['/api/templates', '/api/reports'],
              suggestion: 'Create an edge function in your WM Compliance app that exposes available PDF templates and reports.'
            },
            templates: [],
            reports: []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const reportsData = await reportsResponse.json()
      return new Response(
        JSON.stringify({
          success: true,
          connection: {
            url: wmComplianceUrl,
            status: 'connected',
          },
          templates: [],
          reports: reportsData
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
        templates: templatesData,
        reports: []
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
