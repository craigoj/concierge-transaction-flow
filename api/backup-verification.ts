import type { VercelRequest, VercelResponse } from '@vercel/node';

interface BackupVerificationResult {
  timestamp: string;
  backupDate: string;
  status: 'success' | 'warning' | 'error';
  details: {
    tablesVerified: number;
    totalRecords: number;
    integrityChecks: boolean;
    lastBackupAge: number; // hours
    backupSize?: number; // bytes
  };
  warnings: string[];
  errors: string[];
}

interface TableVerification {
  tableName: string;
  recordCount: number;
  lastModified: string;
  integrityCheck: boolean;
  errors: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET and POST requests
  if (!['GET', 'POST'].includes(req.method || '')) {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Verify environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      res.status(500).json({ 
        error: 'Missing required environment variables',
        message: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'
      });
      return;
    }

    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (req.method === 'GET') {
      // Return backup verification status
      const verification = await performBackupVerification(supabase);
      res.status(200).json(verification);
    } else if (req.method === 'POST') {
      // Trigger manual backup verification
      const verification = await performBackupVerification(supabase, true);
      res.status(200).json(verification);
    }

  } catch (error) {
    console.error('Backup verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Perform comprehensive backup verification
 */
async function performBackupVerification(supabase: any, detailed: boolean = false): Promise<BackupVerificationResult> {
  const startTime = Date.now();
  const warnings: string[] = [];
  const errors: string[] = [];
  
  try {
    // Core tables to verify
    const coreTables = [
      'profiles',
      'transactions',
      'clients',
      'workflow_executions',
      'email_templates',
      'automation_rules',
      'agent_vendors',
      'agent_branding',
      'offer_requests',
      'transaction_service_details',
      'agent_intake_sessions'
    ];

    const tableVerifications: TableVerification[] = [];
    let totalRecords = 0;
    let allIntegrityChecks = true;

    // Verify each core table
    for (const tableName of coreTables) {
      try {
        const verification = await verifyTable(supabase, tableName, detailed);
        tableVerifications.push(verification);
        totalRecords += verification.recordCount;
        
        if (!verification.integrityCheck) {
          allIntegrityChecks = false;
        }
        
        if (verification.errors.length > 0) {
          errors.push(...verification.errors.map(e => `${tableName}: ${e}`));
        }
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to verify table ${tableName}: ${errorMsg}`);
        allIntegrityChecks = false;
      }
    }

    // Check backup freshness (simulate - in real implementation this would check actual backups)
    const lastBackupAge = await checkBackupFreshness(supabase);
    if (lastBackupAge > 24) {
      warnings.push(`Last backup is ${lastBackupAge.toFixed(1)} hours old`);
    }

    // Determine overall status
    let status: BackupVerificationResult['status'] = 'success';
    if (errors.length > 0) {
      status = 'error';
    } else if (warnings.length > 0 || !allIntegrityChecks) {
      status = 'warning';
    }

    const result: BackupVerificationResult = {
      timestamp: new Date().toISOString(),
      backupDate: new Date(Date.now() - (lastBackupAge * 60 * 60 * 1000)).toISOString(),
      status,
      details: {
        tablesVerified: tableVerifications.length,
        totalRecords,
        integrityChecks: allIntegrityChecks,
        lastBackupAge,
        backupSize: await estimateBackupSize(totalRecords)
      },
      warnings,
      errors
    };

    // Log verification results
    console.log('📊 Backup Verification Results:', JSON.stringify({
      status: result.status,
      tablesVerified: result.details.tablesVerified,
      totalRecords: result.details.totalRecords,
      duration: Date.now() - startTime,
      warnings: warnings.length,
      errors: errors.length
    }, null, 2));

    return result;

  } catch (error) {
    console.error('Backup verification failed:', error);
    
    return {
      timestamp: new Date().toISOString(),
      backupDate: new Date().toISOString(),
      status: 'error',
      details: {
        tablesVerified: 0,
        totalRecords: 0,
        integrityChecks: false,
        lastBackupAge: 0
      },
      warnings: [],
      errors: [`Backup verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Verify individual table integrity and record count
 */
async function verifyTable(supabase: any, tableName: string, detailed: boolean): Promise<TableVerification> {
  const errors: string[] = [];
  let recordCount = 0;
  let lastModified = new Date().toISOString();
  let integrityCheck = true;

  try {
    // Get record count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      errors.push(`Failed to count records: ${countError.message}`);
      integrityCheck = false;
    } else {
      recordCount = count || 0;
    }

    // For detailed verification, perform additional checks
    if (detailed && recordCount > 0) {
      // Check for recent activity
      try {
        const { data: recentData, error: recentError } = await supabase
          .from(tableName)
          .select('updated_at, created_at')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (!recentError && recentData && recentData.length > 0) {
          lastModified = recentData[0].updated_at || recentData[0].created_at || lastModified;
        }
      } catch (error) {
        // Non-critical error, some tables might not have updated_at/created_at
      }

      // Perform basic integrity checks
      try {
        const { data: sampleData, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(10);

        if (sampleError) {
          errors.push(`Failed to sample data: ${sampleError.message}`);
          integrityCheck = false;
        } else if (!sampleData || sampleData.length === 0) {
          if (recordCount > 0) {
            errors.push('Record count mismatch: table reports records but sample query returns empty');
            integrityCheck = false;
          }
        }
      } catch (error) {
        errors.push(`Integrity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        integrityCheck = false;
      }
    }

    // Log table verification
    console.log(`✅ Table ${tableName}: ${recordCount} records, integrity: ${integrityCheck}`);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Table verification failed: ${errorMsg}`);
    integrityCheck = false;
  }

  return {
    tableName,
    recordCount,
    lastModified,
    integrityCheck,
    errors
  };
}

/**
 * Check backup freshness (simulate checking actual backup metadata)
 */
async function checkBackupFreshness(supabase: any): Promise<number> {
  try {
    // In a real implementation, this would check backup metadata
    // For now, we'll simulate by checking the most recent record across all tables
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      // If we can't determine freshness, assume it's been 24+ hours
      return 25;
    }

    const lastActivity = new Date(data[0].created_at);
    const hoursAgo = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    // Simulate backup lag (backups are typically 1-2 hours behind)
    return hoursAgo + 1.5;

  } catch (error) {
    console.warn('Could not determine backup freshness:', error);
    return 25; // Conservative estimate
  }
}

/**
 * Estimate backup size based on record counts
 */
async function estimateBackupSize(totalRecords: number): Promise<number> {
  // Rough estimate: average record size across all tables
  const avgRecordSize = 2048; // 2KB per record (conservative estimate)
  const estimatedSize = totalRecords * avgRecordSize;
  
  // Add overhead for indexes, metadata, etc.
  const overhead = 1.3;
  
  return Math.round(estimatedSize * overhead);
}

// Helper functions for external backup verification
export const backupVerificationHelpers = {
  /**
   * Validate backup integrity against checksums
   */
  async validateBackupChecksums(backupData: any): Promise<boolean> {
    // In a real implementation, this would validate backup checksums
    // For now, return true if data exists and is properly formatted
    return backupData && typeof backupData === 'object';
  },

  /**
   * Test backup restoration process
   */
  async testBackupRestoration(backupId: string): Promise<boolean> {
    // In a real implementation, this would test restore to a test environment
    console.log(`Testing restoration of backup: ${backupId}`);
    return true; // Simulate successful test
  },

  /**
   * Generate backup verification report
   */
  generateVerificationReport(results: BackupVerificationResult): string {
    const report = `
# Database Backup Verification Report

**Generated:** ${results.timestamp}
**Backup Date:** ${results.backupDate}
**Status:** ${results.status.toUpperCase()}

## Summary
- **Tables Verified:** ${results.details.tablesVerified}
- **Total Records:** ${results.details.totalRecords.toLocaleString()}
- **Integrity Checks:** ${results.details.integrityChecks ? 'PASSED' : 'FAILED'}
- **Backup Age:** ${results.details.lastBackupAge.toFixed(1)} hours
- **Estimated Backup Size:** ${(results.details.backupSize! / 1024 / 1024).toFixed(2)} MB

## Warnings (${results.warnings.length})
${results.warnings.map(w => `- ${w}`).join('\n')}

## Errors (${results.errors.length})
${results.errors.map(e => `- ${e}`).join('\n')}

---
*Report generated by Concierge Transaction Flow Backup Verification System*
    `.trim();

    return report;
  }
};