
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NODE_ENV === 'production' ? "https://your-domain.com" : "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 1000;

// Input validation
const CreateEventSchema = z.object({
  transactionId: z.string().uuid(),
  eventType: z.string().min(1).max(50),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

async function refreshGoogleToken(refreshToken: string) {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Google token')
  }

  return await response.json()
}

serve(async (req) => {
  const startTime = Date.now();
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  
  console.log(`[${new Date().toISOString()}] ${req.method} request from IP: ${clientIP}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Validate request body
    const requestBody = await req.json();
    const { transactionId, eventType, eventDate, title, description } = CreateEventSchema.parse(requestBody);

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

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Calendar event created successfully in ${duration}ms`);

    return new Response(
      JSON.stringify({ success: true, eventId: createdEvent.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Error creating calendar event (${duration}ms):`, {
      error: error.message,
      stack: error.stack,
      ip: clientIP
    });
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes("Rate limit") ? 429 : 
               error.message.includes("not found") ? 404 : 500,
      },
    )
  }
})
