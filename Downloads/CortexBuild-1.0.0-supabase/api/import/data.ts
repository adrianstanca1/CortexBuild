import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

const verifyAuth = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
};

// Parse CSV data
function parseCSV(csvData: string): any[] {
  const lines = csvData.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });

    rows.push(row);
  }

  return rows;
}

// Validate imported data
function validateData(data: any[], entityType: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(data) || data.length === 0) {
    errors.push('Data must be a non-empty array');
    return { valid: false, errors };
  }

  // Validate based on entity type
  switch (entityType) {
    case 'tasks':
      data.forEach((item, index) => {
        if (!item.title) errors.push(`Row ${index + 1}: title is required`);
        if (!item.project_id) errors.push(`Row ${index + 1}: project_id is required`);
        if (item.status && !['todo', 'in-progress', 'completed', 'blocked'].includes(item.status)) {
          errors.push(`Row ${index + 1}: invalid status value`);
        }
        if (item.priority && !['low', 'medium', 'high', 'critical'].includes(item.priority)) {
          errors.push(`Row ${index + 1}: invalid priority value`);
        }
      });
      break;

    case 'projects':
      data.forEach((item, index) => {
        if (!item.name) errors.push(`Row ${index + 1}: name is required`);
        if (!item.company_id) errors.push(`Row ${index + 1}: company_id is required`);
        if (item.status && !['planning', 'active', 'on-hold', 'completed', 'cancelled'].includes(item.status)) {
          errors.push(`Row ${index + 1}: invalid status value`);
        }
      });
      break;

    case 'clients':
      data.forEach((item, index) => {
        if (!item.name) errors.push(`Row ${index + 1}: name is required`);
        if (!item.company_id) errors.push(`Row ${index + 1}: company_id is required`);
        if (item.email && !item.email.includes('@')) {
          errors.push(`Row ${index + 1}: invalid email format`);
        }
      });
      break;

    case 'time_entries':
      data.forEach((item, index) => {
        if (!item.user_id) errors.push(`Row ${index + 1}: user_id is required`);
        if (!item.project_id) errors.push(`Row ${index + 1}: project_id is required`);
        if (!item.duration_minutes || isNaN(Number(item.duration_minutes))) {
          errors.push(`Row ${index + 1}: duration_minutes must be a number`);
        }
      });
      break;

    default:
      errors.push(`Unsupported entity type: ${entityType}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const user = verifyAuth(req);

    // Check permissions - only admins can import data
    if (user.role !== 'super_admin' && user.role !== 'company_admin') {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    const {
      entity_type, // tasks, projects, clients, time_entries
      format = 'json', // json, csv
      data,
      csv_data,
      mode = 'create', // create, update, upsert
      dry_run = false // If true, validate only without importing
    } = req.body;

    if (!entity_type) {
      return res.status(400).json({
        success: false,
        error: 'entity_type is required (tasks, projects, clients, time_entries)'
      });
    }

    let importData: any[] = [];

    // Parse data based on format
    if (format === 'csv') {
      if (!csv_data) {
        return res.status(400).json({ success: false, error: 'csv_data is required for CSV format' });
      }
      importData = parseCSV(csv_data);
    } else if (format === 'json') {
      if (!data) {
        return res.status(400).json({ success: false, error: 'data is required for JSON format' });
      }
      importData = Array.isArray(data) ? data : [data];
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported format. Use json or csv' });
    }

    // Validate data
    const validation = validateData(importData, entity_type);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        validation_errors: validation.errors
      });
    }

    // If dry run, return validation results without importing
    if (dry_run) {
      return res.status(200).json({
        success: true,
        message: 'Validation passed (dry run)',
        records_to_import: importData.length,
        preview: importData.slice(0, 5), // Show first 5 records
        validation: {
          valid: true,
          errors: []
        }
      });
    }

    // Perform import
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as any[]
    };

    // In production, this would interact with the database
    for (const item of importData) {
      try {
        // Add metadata
        const enrichedItem = {
          ...item,
          id: item.id || `${entity_type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          imported_at: new Date().toISOString(),
          imported_by: user.userId,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (mode === 'create') {
          // Create new record
          // In production: await db.create(entity_type, enrichedItem)
          results.created++;
        } else if (mode === 'update') {
          // Update existing record
          // In production: await db.update(entity_type, enrichedItem)
          results.updated++;
        } else if (mode === 'upsert') {
          // Create or update
          // In production: await db.upsert(entity_type, enrichedItem)
          results.created++;
        }

      } catch (error: any) {
        results.failed++;
        results.errors.push({
          item,
          error: error.message
        });
      }
    }

    console.log(`📥 Imported ${results.created + results.updated} ${entity_type} for ${user.email}`);

    // Create activity log
    const activity = {
      type: 'data_import',
      entity_type,
      user_id: user.userId,
      records_imported: results.created + results.updated,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: 'Import completed',
      results,
      activity,
      summary: {
        total_records: importData.length,
        successful: results.created + results.updated,
        failed: results.failed
      }
    });

  } catch (error: any) {
    console.error('❌ Import API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
