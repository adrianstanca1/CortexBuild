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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const user = verifyAuth(req);
    const {
      report_type,
      format = 'pdf',
      company_id,
      project_id,
      date_from,
      date_to,
      include_charts = 'true'
    } = req.query;

    if (!report_type) {
      return res.status(400).json({
        success: false,
        error: 'report_type is required (project_summary, financial_overview, task_progress, time_tracking, comprehensive)'
      });
    }

    // Generate report based on type
    let reportData: any = {};

    switch (report_type) {
      case 'project_summary':
        reportData = {
          title: 'Project Summary Report',
          generated_at: new Date().toISOString(),
          generated_by: user.email,
          period: { from: date_from, to: date_to },
          summary: {
            total_projects: 12,
            active_projects: 8,
            completed_projects: 3,
            on_hold_projects: 1,
            total_budget: 125000000,
            total_spent: 43750000,
            avg_completion: 54
          },
          projects: [
            {
              name: 'Metropolis Tower',
              status: 'active',
              progress: 35,
              budget: 125000000,
              spent: 43750000,
              health_score: 87,
              start_date: '2025-01-01',
              estimated_completion: '2026-12-31'
            }
          ]
        };
        break;

      case 'financial_overview':
        reportData = {
          title: 'Financial Overview Report',
          generated_at: new Date().toISOString(),
          generated_by: user.email,
          period: { from: date_from, to: date_to },
          summary: {
            total_revenue: 145000000,
            total_expenses: 67500000,
            net_profit: 77500000,
            profit_margin: 53.4,
            outstanding_invoices: 135625,
            total_paid: 103075
          },
          invoices: {
            total: 2,
            draft: 0,
            sent: 1,
            paid: 1,
            overdue: 0
          },
          expenses_by_category: {
            labor: 25000000,
            materials: 32500000,
            equipment: 8000000,
            subcontractors: 2000000
          }
        };
        break;

      case 'task_progress':
        reportData = {
          title: 'Task Progress Report',
          generated_at: new Date().toISOString(),
          generated_by: user.email,
          period: { from: date_from, to: date_to },
          summary: {
            total_tasks: 245,
            completed: 132,
            in_progress: 85,
            todo: 28,
            overdue: 12,
            completion_rate: 54,
            on_time_rate: 89
          },
          by_priority: {
            critical: { total: 15, completed: 8 },
            high: { total: 45, completed: 28 },
            medium: { total: 120, completed: 68 },
            low: { total: 65, completed: 28 }
          },
          by_project: [
            {
              project: 'Metropolis Tower',
              total: 156,
              completed: 84,
              completion_rate: 54
            }
          ]
        };
        break;

      case 'time_tracking':
        reportData = {
          title: 'Time Tracking Report',
          generated_at: new Date().toISOString(),
          generated_by: user.email,
          period: { from: date_from, to: date_to },
          summary: {
            total_hours: 2840,
            billable_hours: 2408,
            non_billable_hours: 432,
            billable_rate: 84.8,
            total_amount: 301000,
            avg_hourly_rate: 125
          },
          by_user: [
            {
              user: 'Engineer Mike',
              hours: 510,
              billable: 510,
              amount: 63750,
              rate: 125
            }
          ],
          by_project: [
            {
              project: 'Metropolis Tower',
              hours: 1850,
              amount: 231250
            }
          ]
        };
        break;

      case 'comprehensive':
        reportData = {
          title: 'Comprehensive Construction Report',
          generated_at: new Date().toISOString(),
          generated_by: user.email,
          period: { from: date_from, to: date_to },
          executive_summary: {
            total_projects: 12,
            active_projects: 8,
            total_budget: 125000000,
            total_spent: 67500000,
            budget_variance: -3000000,
            overall_health: 87
          },
          financial: {
            revenue: 145000000,
            expenses: 67500000,
            profit: 77500000,
            margin: 53.4
          },
          operations: {
            tasks_completed: 132,
            tasks_total: 245,
            milestones_achieved: 3,
            rfis_answered: 12,
            documents_uploaded: 145
          },
          team: {
            total_members: 24,
            active_today: 18,
            utilization_rate: 87,
            total_hours: 2840
          },
          risks: [
            {
              type: 'schedule',
              severity: 'medium',
              description: '12 tasks are overdue',
              recommendation: 'Review task assignments and deadlines'
            },
            {
              type: 'budget',
              severity: 'low',
              description: 'Budget variance of -2.4%',
              recommendation: 'Monitor material costs closely'
            }
          ],
          predictions: {
            estimated_completion: '2026-11-20',
            success_probability: 89,
            final_budget_projection: 124500000
          }
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid report_type. Supported: project_summary, financial_overview, task_progress, time_tracking, comprehensive'
        });
    }

    const filename = `${report_type}_report_${new Date().toISOString().split('T')[0]}`;

    console.log(`📊 Generating ${report_type} report in ${format} format for ${user.email}`);

    // Return data in requested format
    switch (format) {
      case 'pdf':
        // In production, use a PDF generation library
        return res.status(501).json({
          success: false,
          error: 'PDF export not yet implemented. Use JSON format.',
          tip: 'You can generate PDFs client-side from the JSON data using libraries like jsPDF or pdfmake'
        });

      case 'html':
        // Generate HTML report
        const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>${reportData.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2563eb; }
    .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #2563eb; color: white; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>${reportData.title}</h1>
  <p><strong>Generated:</strong> ${reportData.generated_at}</p>
  <p><strong>By:</strong> ${reportData.generated_by}</p>
  <div class="summary">
    <h2>Summary</h2>
    <pre>${JSON.stringify(reportData.summary, null, 2)}</pre>
  </div>
  <div class="footer">
    <p>CortexBuild Platform v2.0 - Enterprise Construction Management</p>
  </div>
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `inline; filename="${filename}.html"`);
        return res.status(200).send(htmlReport);

      case 'json':
      default:
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        return res.status(200).json({
          success: true,
          report: reportData,
          meta: {
            report_type,
            format: 'json',
            generated_at: new Date().toISOString(),
            generated_by: user.email
          }
        });
    }

  } catch (error: any) {
    console.error('❌ Export reports API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
