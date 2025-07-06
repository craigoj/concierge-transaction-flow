import type { VercelRequest, VercelResponse } from '@vercel/node';

interface PerformanceAlert {
  metric: string;
  value: number;
  threshold: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const alert: PerformanceAlert = req.body;
    
    // Validate required fields
    if (!alert.metric || !alert.value || !alert.threshold) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Log performance alert with structured data
    const alertData = {
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      rating: alert.rating,
      exceedsBy: alert.value - alert.threshold,
      exceedsPercent: Math.round(((alert.value - alert.threshold) / alert.threshold) * 100),
      url: alert.url,
      timestamp: new Date(alert.timestamp).toISOString(),
      environment: process.env.VERCEL_ENV || 'unknown',
      region: process.env.VERCEL_REGION || 'unknown'
    };

    // Log to console (will appear in Vercel logs)
    console.warn('🚨 Performance Alert:', JSON.stringify(alertData, null, 2));

    // Here you could integrate with various monitoring services:
    
    // 1. Send to Sentry
    // if (process.env.SENTRY_DSN) {
    //   await sendToSentry(alertData);
    // }

    // 2. Send to Slack
    // if (process.env.SLACK_WEBHOOK_URL) {
    //   await sendToSlack(alertData);
    // }

    // 3. Send to custom logging service
    // if (process.env.CUSTOM_LOGGING_ENDPOINT) {
    //   await sendToCustomLogger(alertData);
    // }

    // 4. Store in database for analysis
    // if (process.env.DATABASE_URL) {
    //   await storeInDatabase(alertData);
    // }

    // For now, we'll just acknowledge receipt
    res.status(200).json({ 
      success: true, 
      message: 'Performance alert received',
      alertId: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

  } catch (error) {
    console.error('Performance alert processing error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper functions for various integrations (commented out but ready to use)

/*
async function sendToSentry(alertData: any) {
  // Sentry integration
  const Sentry = require('@sentry/node');
  
  Sentry.captureException(new Error(`Performance threshold exceeded: ${alertData.metric}`), {
    tags: {
      type: 'performance_alert',
      metric: alertData.metric,
      environment: alertData.environment
    },
    extra: alertData
  });
}

async function sendToSlack(alertData: any) {
  // Slack webhook integration
  const message = {
    text: "🚨 Performance Alert",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Performance Alert: ${alertData.metric}*\n` +
                `Value: ${alertData.value}ms\n` +
                `Threshold: ${alertData.threshold}ms\n` +
                `Exceeds by: ${alertData.exceedsBy}ms (${alertData.exceedsPercent}%)\n` +
                `URL: ${alertData.url}\n` +
                `Environment: ${alertData.environment}`
        }
      }
    ]
  };

  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
}

async function sendToCustomLogger(alertData: any) {
  // Custom logging service integration
  await fetch(process.env.CUSTOM_LOGGING_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CUSTOM_LOGGING_TOKEN}`
    },
    body: JSON.stringify({
      level: 'warning',
      message: 'Performance threshold exceeded',
      data: alertData
    })
  });
}

async function storeInDatabase(alertData: any) {
  // Database storage for performance alerts
  // This could integrate with Supabase or another database
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase
    .from('performance_alerts')
    .insert([alertData]);
}
*/