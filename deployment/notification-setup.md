# Deployment Notification & Alert Setup Guide

## Overview

This guide covers setting up comprehensive deployment notifications and alerts for the Concierge Transaction Flow application across multiple platforms and services.

## 1. GitHub Actions Notifications

### Slack Integration
Add these secrets to your GitHub repository:
- `SLACK_WEBHOOK_URL`: Your Slack incoming webhook URL
- `SLACK_CHANNEL`: Target channel (e.g., `#deployments`)

Update your GitHub Actions workflow:

```yaml
# .github/workflows/deployment-notifications.yml
name: Deployment Notifications

on:
  workflow_run:
    workflows: ["CI/CD Pipeline"]
    types:
      - completed

jobs:
  notify-deployment:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion != 'cancelled' }}
    
    steps:
      - name: Get workflow details
        id: workflow
        run: |
          echo "status=${{ github.event.workflow_run.conclusion }}" >> $GITHUB_OUTPUT
          echo "commit=${{ github.event.workflow_run.head_sha }}" >> $GITHUB_OUTPUT
          echo "branch=${{ github.event.workflow_run.head_branch }}" >> $GITHUB_OUTPUT
          echo "actor=${{ github.event.workflow_run.triggering_actor.login }}" >> $GITHUB_OUTPUT

      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ steps.workflow.outputs.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          channel: ${{ secrets.SLACK_CHANNEL }}
          fields: repo,message,commit,author,action,eventName,ref,workflow
          custom_payload: |
            {
              "attachments": [{
                "color": "${{ steps.workflow.outputs.status == 'success' && 'good' || 'danger' }}",
                "title": "🚀 Deployment ${{ steps.workflow.outputs.status == 'success' && 'Successful' || 'Failed' }}",
                "fields": [
                  {
                    "title": "Repository",
                    "value": "${{ github.repository }}",
                    "short": true
                  },
                  {
                    "title": "Branch",
                    "value": "${{ steps.workflow.outputs.branch }}",
                    "short": true
                  },
                  {
                    "title": "Commit",
                    "value": "<https://github.com/${{ github.repository }}/commit/${{ steps.workflow.outputs.commit }}|${{ steps.workflow.outputs.commit }}>",
                    "short": true
                  },
                  {
                    "title": "Author",
                    "value": "${{ steps.workflow.outputs.actor }}",
                    "short": true
                  },
                  {
                    "title": "Deployment URL",
                    "value": "https://concierge-transaction-flow.vercel.app",
                    "short": false
                  }
                ]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Discord Integration
For Discord notifications, add these secrets:
- `DISCORD_WEBHOOK_URL`: Your Discord webhook URL

```yaml
      - name: Send Discord notification
        if: always()
        uses: tsickert/discord-webhook@v5.3.0
        with:
          webhook-url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          content: |
            **🚀 Deployment Update**
            
            **Repository:** ${{ github.repository }}
            **Branch:** ${{ steps.workflow.outputs.branch }}
            **Status:** ${{ steps.workflow.outputs.status == 'success' && '✅ Success' || '❌ Failed' }}
            **Commit:** [${{ steps.workflow.outputs.commit }}](https://github.com/${{ github.repository }}/commit/${{ steps.workflow.outputs.commit }})
            **Author:** ${{ steps.workflow.outputs.actor }}
            
            **Live URL:** https://concierge-transaction-flow.vercel.app
```

### Email Notifications
Using GitHub's built-in email notifications:

```yaml
      - name: Send email notification
        if: failure()
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 587
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: "🚨 Deployment Failed: ${{ github.repository }}"
          body: |
            Deployment failed for repository: ${{ github.repository }}
            
            Branch: ${{ steps.workflow.outputs.branch }}
            Commit: ${{ steps.workflow.outputs.commit }}
            Author: ${{ steps.workflow.outputs.actor }}
            
            View logs: https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}
          to: ${{ secrets.NOTIFICATION_EMAIL }}
          from: "GitHub Actions <noreply@yourdomain.com>"
```

## 2. Vercel Integration Notifications

### Vercel Webhook Setup
Configure webhooks in Vercel dashboard for deployment events:

```javascript
// api/vercel-webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

interface VercelDeploymentEvent {
  type: 'deployment.created' | 'deployment.succeeded' | 'deployment.failed' | 'deployment.canceled';
  payload: {
    deployment: {
      id: string;
      url: string;
      name: string;
      source: string;
      state: string;
      creator: {
        username: string;
      };
      target: string;
    };
    project: {
      name: string;
    };
    team?: {
      name: string;
    };
  };
  createdAt: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['x-vercel-signature'] as string;
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha1', process.env.VERCEL_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event: VercelDeploymentEvent = req.body;
    
    // Process different event types
    switch (event.type) {
      case 'deployment.succeeded':
        await handleSuccessfulDeployment(event);
        break;
      case 'deployment.failed':
        await handleFailedDeployment(event);
        break;
      case 'deployment.created':
        await handleDeploymentStart(event);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleSuccessfulDeployment(event: VercelDeploymentEvent) {
  const { deployment, project } = event.payload;
  
  // Send success notification
  await sendSlackNotification({
    color: 'good',
    title: '🚀 Deployment Successful',
    fields: [
      { title: 'Project', value: project.name, short: true },
      { title: 'Environment', value: deployment.target, short: true },
      { title: 'URL', value: `https://${deployment.url}`, short: false },
      { title: 'Deployed by', value: deployment.creator.username, short: true }
    ]
  });
}

async function handleFailedDeployment(event: VercelDeploymentEvent) {
  const { deployment, project } = event.payload;
  
  // Send failure notification
  await sendSlackNotification({
    color: 'danger',
    title: '❌ Deployment Failed',
    fields: [
      { title: 'Project', value: project.name, short: true },
      { title: 'Environment', value: deployment.target, short: true },
      { title: 'Deployment ID', value: deployment.id, short: true },
      { title: 'Deployed by', value: deployment.creator.username, short: true }
    ]
  });
}

async function handleDeploymentStart(event: VercelDeploymentEvent) {
  const { deployment, project } = event.payload;
  
  // Send start notification (optional)
  await sendSlackNotification({
    color: 'warning',
    title: '⏳ Deployment Started',
    fields: [
      { title: 'Project', value: project.name, short: true },
      { title: 'Environment', value: deployment.target, short: true },
      { title: 'Deployed by', value: deployment.creator.username, short: true }
    ]
  });
}

async function sendSlackNotification(attachment: any) {
  if (!process.env.SLACK_WEBHOOK_URL) return;

  try {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [attachment]
      })
    });
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}
```

## 3. Performance Alert Notifications

Enhance the performance alert system:

```typescript
// Enhanced api/performance-alert.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ... existing code ...

  try {
    const alert: PerformanceAlert = req.body;
    
    // Determine alert severity
    const severity = calculateSeverity(alert);
    
    // Send notifications based on severity
    if (severity === 'critical') {
      await Promise.all([
        sendSlackAlert(alert, severity),
        sendEmailAlert(alert, severity),
        logToPagerDuty(alert)
      ]);
    } else if (severity === 'warning') {
      await sendSlackAlert(alert, severity);
    }

    res.status(200).json({ success: true, severity });
  } catch (error) {
    // ... error handling ...
  }
}

function calculateSeverity(alert: PerformanceAlert): 'info' | 'warning' | 'critical' {
  const exceedsPercent = ((alert.value - alert.threshold) / alert.threshold) * 100;
  
  if (exceedsPercent > 100) return 'critical'; // More than 2x threshold
  if (exceedsPercent > 50) return 'warning';   // 50%+ over threshold
  return 'info';
}

async function sendSlackAlert(alert: PerformanceAlert, severity: string) {
  const colors = {
    info: '#36a64f',
    warning: '#ffb84d',
    critical: '#ff0000'
  };

  const message = {
    attachments: [{
      color: colors[severity as keyof typeof colors],
      title: `🚨 Performance Alert - ${severity.toUpperCase()}`,
      fields: [
        { title: 'Metric', value: alert.metric, short: true },
        { title: 'Value', value: `${alert.value}ms`, short: true },
        { title: 'Threshold', value: `${alert.threshold}ms`, short: true },
        { title: 'Exceeds by', value: `${alert.value - alert.threshold}ms`, short: true },
        { title: 'URL', value: alert.url, short: false },
        { title: 'Environment', value: process.env.VERCEL_ENV || 'unknown', short: true }
      ],
      footer: 'Performance Monitoring',
      ts: Math.floor(alert.timestamp / 1000)
    }]
  };

  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
}
```

## 4. Uptime Monitoring

### UptimeRobot Integration
Configure UptimeRobot or similar service:

```javascript
// api/uptime-webhook.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { monitorFriendlyName, monitorURL, alertType, alertDetails } = req.body;

  const isDown = alertType === '1'; // 1 = down, 2 = up
  
  await sendSlackNotification({
    color: isDown ? 'danger' : 'good',
    title: isDown ? '🔴 Site Down' : '🟢 Site Recovered',
    fields: [
      { title: 'Monitor', value: monitorFriendlyName, short: true },
      { title: 'URL', value: monitorURL, short: true },
      { title: 'Details', value: alertDetails, short: false }
    ]
  });

  res.status(200).json({ received: true });
}
```

## 5. Error Tracking Integration

### Sentry Notifications
Configure Sentry webhooks for error alerts:

```javascript
// api/sentry-webhook.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, data } = req.body;

  if (action === 'created' && data.issue) {
    const issue = data.issue;
    
    await sendSlackNotification({
      color: 'danger',
      title: '🐛 New Error Detected',
      fields: [
        { title: 'Title', value: issue.title, short: false },
        { title: 'Level', value: issue.level, short: true },
        { title: 'Count', value: issue.count.toString(), short: true },
        { title: 'Environment', value: issue.environment || 'unknown', short: true },
        { title: 'URL', value: issue.permalink, short: false }
      ]
    });
  }

  res.status(200).json({ received: true });
}
```

## 6. Environment Variables Setup

Add these environment variables to your Vercel project:

```env
# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_CHANNEL=#deployments

# Email Notifications
NOTIFICATION_EMAIL=team@yourdomain.com
EMAIL_USERNAME=your-smtp-username
EMAIL_PASSWORD=your-smtp-password

# Webhook Security
VERCEL_WEBHOOK_SECRET=your-webhook-secret
SENTRY_WEBHOOK_SECRET=your-sentry-webhook-secret

# PagerDuty (optional)
PAGERDUTY_INTEGRATION_KEY=your-pagerduty-key

# Custom Logging (optional)
CUSTOM_LOGGING_ENDPOINT=https://your-logging-service.com/webhook
CUSTOM_LOGGING_TOKEN=your-logging-token
```

## 7. GitHub Repository Secrets

Add these secrets to your GitHub repository (Settings → Secrets):

```
SLACK_WEBHOOK_URL
DISCORD_WEBHOOK_URL
NOTIFICATION_EMAIL
EMAIL_USERNAME
EMAIL_PASSWORD
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

## 8. Notification Testing

Create a test script to verify all notification channels:

```bash
#!/bin/bash
# scripts/test-notifications.sh

echo "Testing notification channels..."

# Test Slack notification
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🧪 Test notification from Concierge Transaction Flow"}' \
  $SLACK_WEBHOOK_URL

# Test performance alert
curl -X POST -H 'Content-type: application/json' \
  --data '{
    "metric": "LCP",
    "value": 3000,
    "threshold": 2500,
    "rating": "poor",
    "timestamp": '$(date +%s000)',
    "url": "https://concierge-transaction-flow.vercel.app",
    "userAgent": "Test"
  }' \
  https://concierge-transaction-flow.vercel.app/api/performance-alert

echo "Test notifications sent!"
```

## 9. Monitoring Dashboard

Create a simple monitoring dashboard:

```typescript
// src/pages/MonitoringDashboard.tsx
import React, { useEffect, useState } from 'react';
import { performanceMonitor } from '@/lib/performance-monitoring';

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<any>({});
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Get performance summary
    const summary = performanceMonitor.getPerformanceSummary();
    setMetrics(summary);

    // Fetch recent alerts
    fetchRecentAlerts();
  }, []);

  const fetchRecentAlerts = async () => {
    try {
      const response = await fetch('/api/get-recent-alerts');
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Monitoring</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(metrics).map(([metric, data]: [string, any]) => (
          <div key={metric} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg">{metric}</h3>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(data.average)}ms
            </p>
            <p className="text-sm text-gray-600">
              {data.count} measurements
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
        {alerts.length === 0 ? (
          <p className="text-gray-600">No recent alerts</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4">
                <p className="font-medium">{alert.metric} threshold exceeded</p>
                <p className="text-sm text-gray-600">
                  {alert.value}ms (threshold: {alert.threshold}ms)
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

## 10. Implementation Checklist

### Initial Setup (30 minutes)
- [ ] Configure Slack webhook URL
- [ ] Add GitHub repository secrets
- [ ] Set up Vercel environment variables
- [ ] Create notification workflows

### Advanced Features (45 minutes)
- [ ] Implement Vercel webhook handler
- [ ] Set up performance alert notifications
- [ ] Configure uptime monitoring
- [ ] Create error tracking integration

### Testing & Validation (15 minutes)
- [ ] Test all notification channels
- [ ] Verify webhook endpoints
- [ ] Check alert thresholds
- [ ] Monitor notification delivery

This comprehensive notification setup ensures you're immediately informed of any issues with your deployment while providing detailed context for faster resolution.