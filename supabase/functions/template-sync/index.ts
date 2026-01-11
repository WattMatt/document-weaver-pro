import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface TemplatePayload {
  id?: string
  name: string
  description?: string
  elements: any[]
  pageSize?: string
  orientation?: string
  layoutType?: string
  sourceApp?: string
  externalId?: string
  metadata?: Record<string, any>
}

interface WebhookPayload {
  event: 'template.created' | 'template.updated' | 'template.deleted'
  timestamp: string
  template: any
  source: string
}

async function sendWebhook(payload: WebhookPayload) {
  const webhookUrl = Deno.env.get('DOCBUILDER_WEBHOOK_URL')
  if (!webhookUrl) {
    console.log('No webhook URL configured, skipping notification')
    return
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sync-Key': Deno.env.get('DOCBUILDER_SYNC_KEY') || '',
      },
      body: JSON.stringify(payload),
    })
    console.log('Webhook sent:', response.status)
  } catch (error) {
    console.error('Webhook failed:', error)
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate API key
    const syncKey = req.headers.get('x-sync-key')
    const expectedKey = Deno.env.get('DOCBUILDER_SYNC_KEY')

    if (!expectedKey || syncKey !== expectedKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role for full access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // Handle GET requests
    if (req.method === 'GET') {
      if (action === 'list') {
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .order('updated_at', { ascending: false })

        if (error) throw error

        const templates = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          elements: t.elements,
          pageSize: t.page_size,
          orientation: t.orientation,
          layoutType: t.layout_type,
          sourceApp: t.source_app,
          externalId: t.external_id,
          metadata: t.metadata,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        }))

        return new Response(
          JSON.stringify({ success: true, data: { templates, count: templates.length } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'get') {
        const id = url.searchParams.get('id')
        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing id parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('id', id)
          .maybeSingle()

        if (error) throw error
        if (!data) {
          return new Response(
            JSON.stringify({ success: false, error: 'Template not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: data.id,
              name: data.name,
              description: data.description,
              elements: data.elements,
              pageSize: data.page_size,
              orientation: data.orientation,
              layoutType: data.layout_type,
              sourceApp: data.source_app,
              externalId: data.external_id,
              metadata: data.metadata,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action. Use: list, get' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle POST requests
    if (req.method === 'POST') {
      const body = await req.json()
      const postAction = body.action

      if (postAction === 'create') {
        const template: TemplatePayload = body.template
        if (!template || !template.name) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing template data' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data, error } = await supabase
          .from('templates')
          .insert({
            name: template.name,
            description: template.description || null,
            elements: template.elements || [],
            page_size: template.pageSize || 'A4',
            orientation: template.orientation || 'portrait',
            layout_type: template.layoutType || 'document',
            source_app: template.sourceApp || 'api',
            external_id: template.externalId || null,
            metadata: template.metadata || {},
          })
          .select()
          .single()

        if (error) throw error

        // Send webhook notification
        await sendWebhook({
          event: 'template.created',
          timestamp: new Date().toISOString(),
          template: data,
          source: 'docbuilder',
        })

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (postAction === 'update') {
        const template: TemplatePayload = body.template
        if (!template || !template.id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing template id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData: any = {}
        if (template.name) updateData.name = template.name
        if (template.description !== undefined) updateData.description = template.description
        if (template.elements) updateData.elements = template.elements
        if (template.pageSize) updateData.page_size = template.pageSize
        if (template.orientation) updateData.orientation = template.orientation
        if (template.layoutType) updateData.layout_type = template.layoutType
        if (template.sourceApp) updateData.source_app = template.sourceApp
        if (template.externalId !== undefined) updateData.external_id = template.externalId
        if (template.metadata) updateData.metadata = template.metadata

        const { data, error } = await supabase
          .from('templates')
          .update(updateData)
          .eq('id', template.id)
          .select()
          .single()

        if (error) throw error

        // Send webhook notification
        await sendWebhook({
          event: 'template.updated',
          timestamp: new Date().toISOString(),
          template: data,
          source: 'docbuilder',
        })

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (postAction === 'delete') {
        const id = body.id
        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing template id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get template before delete for webhook
        const { data: existing } = await supabase
          .from('templates')
          .select('*')
          .eq('id', id)
          .maybeSingle()

        const { error } = await supabase
          .from('templates')
          .delete()
          .eq('id', id)

        if (error) throw error

        // Send webhook notification
        if (existing) {
          await sendWebhook({
            event: 'template.deleted',
            timestamp: new Date().toISOString(),
            template: existing,
            source: 'docbuilder',
          })
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Template deleted' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action. Use: create, update, delete' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
