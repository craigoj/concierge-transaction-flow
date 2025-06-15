
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function refreshGoogleToken(refreshToken: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Google token')
  }

  return await response.json()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { transactionId, eventType, eventDate, title, description } = await req.json()

    // Get transaction details
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .select('*, profiles!transactions_agent_id_fkey(*)')
      .eq('id', transactionId)
      .single()

    if (transactionError || !transaction) {
      throw new Error('Transaction not found')
    }

    // Get calendar integration for the agent
    const { data: integration, error: integrationError } = await supabaseClient
      .from('calendar_integrations')
      .select('*')
      .eq('user_id', transaction.agent_id)
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      console.log('No calendar integration found for agent')
      return new Response(
        JSON.stringify({ success: false, message: 'No calendar integration' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Check if token needs refresh
    let accessToken = integration.access_token
    const tokenExpiry = new Date(integration.token_expires_at)
    const now = new Date()

    if (tokenExpiry <= now) {
      const refreshedTokens = await refreshGoogleToken(integration.refresh_token)
      accessToken = refreshedTokens.access_token
      
      // Update tokens in database
      const expiresAt = new Date(Date.now() + refreshedTokens.expires_in * 1000).toISOString()
      await supabaseClient
        .from('calendar_integrations')
        .update({
          access_token: accessToken,
          token_expires_at: expiresAt,
        })
        .eq('id', integration.id)
    }

    // Create Google Calendar event
    const event = {
      summary: title,
      description: description,
      start: {
        date: eventDate,
        timeZone: 'America/New_York',
      },
      end: {
        date: eventDate,
        timeZone: 'America/New_York',
      },
      location: transaction.property_address,
    }

    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!calendarResponse.ok) {
      throw new Error(`Google Calendar API error: ${await calendarResponse.text()}`)
    }

    const createdEvent = await calendarResponse.json()

    // Store event in our database
    const { error: eventError } = await supabaseClient
      .from('calendar_events')
      .insert({
        transaction_id: transactionId,
        calendar_integration_id: integration.id,
        external_event_id: createdEvent.id,
        event_type: eventType,
        event_date: eventDate,
        title: title,
        description: description,
      })

    if (eventError) {
      console.error('Failed to store calendar event:', eventError)
    }

    return new Response(
      JSON.stringify({ success: true, eventId: createdEvent.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
