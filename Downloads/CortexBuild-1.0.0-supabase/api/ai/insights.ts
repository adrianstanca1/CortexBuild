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

// AI-powered insight generation
function generateInsights(context: any) {
  const insights = [];

  // Budget Analysis
  if (context.budget_utilization > 90) {
    insights.push({
      id: `insight-${Date.now()}-1`,
      type: 'warning',
      category: 'budget',
      title: 'Critical Budget Alert',
      description: `Project is at ${context.budget_utilization}% budget utilization. Immediate action required.`,
      impact: 'high',
      confidence: 95,
      recommendations: [
        {
          action: 'Review and reduce non-essential expenses',
          priority: 'high',
          estimated_savings: 250000
        },
        {
          action: 'Renegotiate vendor contracts',
          priority: 'high',
          estimated_savings: 180000
        },
        {
          action: 'Implement value engineering review',
          priority: 'medium',
          estimated_savings: 320000
        }
      ],
      data_points: ['budget_utilization', 'remaining_budget', 'burn_rate']
    });
  } else if (context.budget_utilization > 75) {
    insights.push({
      id: `insight-${Date.now()}-2`,
      type: 'info',
      category: 'budget',
      title: 'Budget Monitoring Required',
      description: `Project at ${context.budget_utilization}% budget. Monitor closely to prevent overruns.`,
      impact: 'medium',
      confidence: 88,
      recommendations: [
        {
          action: 'Weekly budget review meetings',
          priority: 'medium',
          estimated_savings: 0
        },
        {
          action: 'Implement tighter cost controls',
          priority: 'medium',
          estimated_savings: 150000
        }
      ],
      data_points: ['budget_utilization', 'projected_cost']
    });
  }

  // Schedule Performance
  const schedulePerformanceIndex = context.progress / (context.budget_utilization || 1);
  if (schedulePerformanceIndex < 0.9) {
    insights.push({
      id: `insight-${Date.now()}-3`,
      type: 'warning',
      category: 'schedule',
      title: 'Schedule Delay Detected',
      description: `Schedule Performance Index: ${schedulePerformanceIndex.toFixed(2)}. Project is behind schedule relative to spend.`,
      impact: 'high',
      confidence: 91,
      recommendations: [
        {
          action: 'Add resources to critical path activities',
          priority: 'high',
          estimated_impact: 'Recover 2-3 weeks'
        },
        {
          action: 'Implement overtime for key trades',
          priority: 'high',
          estimated_impact: 'Accelerate by 15%'
        },
        {
          action: 'Review and optimize workflow',
          priority: 'medium',
          estimated_impact: 'Improve efficiency by 10%'
        }
      ],
      data_points: ['progress', 'budget_utilization', 'timeline']
    });
  }

  // Team Performance
  if (context.team_utilization > 95) {
    insights.push({
      id: `insight-${Date.now()}-4`,
      type: 'info',
      category: 'team',
      title: 'Team Overutilization Risk',
      description: `Team utilization at ${context.team_utilization}%. Risk of burnout and quality issues.`,
      impact: 'medium',
      confidence: 85,
      recommendations: [
        {
          action: 'Hire additional team members',
          priority: 'high',
          estimated_impact: 'Reduce utilization to 80%'
        },
        {
          action: 'Redistribute workload',
          priority: 'medium',
          estimated_impact: 'Balance team capacity'
        },
        {
          action: 'Review project scope for efficiency gains',
          priority: 'low',
          estimated_impact: 'Reduce effort by 5-10%'
        }
      ],
      data_points: ['team_utilization', 'billable_rate', 'productivity']
    });
  }

  // Task Management
  if (context.overdue_tasks > 5) {
    insights.push({
      id: `insight-${Date.now()}-5`,
      type: 'warning',
      category: 'tasks',
      title: 'Multiple Overdue Tasks',
      description: `${context.overdue_tasks} tasks are overdue. This may impact project timeline.`,
      impact: 'high',
      confidence: 93,
      recommendations: [
        {
          action: 'Prioritize and reassign overdue tasks',
          priority: 'high',
          estimated_impact: 'Complete within 1 week'
        },
        {
          action: 'Review task dependencies',
          priority: 'medium',
          estimated_impact: 'Identify blockers'
        },
        {
          action: 'Implement daily standup meetings',
          priority: 'medium',
          estimated_impact: 'Improve coordination'
        }
      ],
      data_points: ['overdue_tasks', 'task_completion_rate']
    });
  }

  // Predictive Success Analysis
  const successScore = calculateSuccessProbability(context);
  insights.push({
    id: `insight-${Date.now()}-6`,
    type: 'success',
    category: 'predictive',
    title: 'Project Success Forecast',
    description: `Based on current metrics, project has ${successScore}% probability of on-time, on-budget completion.`,
    impact: 'low',
    confidence: 82,
    recommendations: [
      {
        action: 'Maintain current pace and quality standards',
        priority: 'medium',
        estimated_impact: 'Sustain success trajectory'
      },
      {
        action: 'Document and replicate successful practices',
        priority: 'low',
        estimated_impact: 'Knowledge transfer'
      }
    ],
    data_points: ['all_metrics'],
    predictions: {
      completion_date: context.estimated_completion,
      final_cost: context.projected_cost,
      quality_score: 87
    }
  });

  // Cash Flow Analysis
  if (context.outstanding_invoices > 1000000) {
    insights.push({
      id: `insight-${Date.now()}-7`,
      type: 'warning',
      category: 'financial',
      title: 'Cash Flow Attention Needed',
      description: `$${(context.outstanding_invoices / 1000000).toFixed(1)}M in outstanding invoices. May impact liquidity.`,
      impact: 'high',
      confidence: 90,
      recommendations: [
        {
          action: 'Accelerate collections on overdue invoices',
          priority: 'high',
          estimated_impact: 'Improve cash flow by $800K'
        },
        {
          action: 'Review payment terms with clients',
          priority: 'medium',
          estimated_impact: 'Reduce DSO by 5 days'
        },
        {
          action: 'Implement automated payment reminders',
          priority: 'low',
          estimated_impact: 'Faster collections'
        }
      ],
      data_points: ['outstanding_invoices', 'payment_terms', 'avg_payment_days']
    });
  }

  return insights;
}

function calculateSuccessProbability(context: any): number {
  let score = 100;

  // Budget factor (30%)
  const budgetScore = Math.max(0, 100 - Math.abs(context.budget_utilization - context.progress));
  score = score * 0.3 + budgetScore * 0.3;

  // Schedule factor (30%)
  const scheduleScore = context.progress >= 50 ? 100 : context.progress * 2;
  score += scheduleScore * 0.3;

  // Quality factor (20%)
  const qualityScore = 100 - (context.safety_incidents * 10);
  score += Math.max(0, qualityScore) * 0.2;

  // Team factor (20%)
  const teamScore = Math.min(100, context.team_utilization);
  score += teamScore * 0.2;

  return Math.round(Math.max(0, Math.min(100, score)));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = verifyAuth(req);

    if (req.method === 'GET') {
      const { project_id } = req.query;

      // Simulate gathering project context for AI analysis
      const projectContext = {
        project_id: project_id || 'proj-1',
        budget_utilization: 87,
        progress: 54,
        team_utilization: 87,
        overdue_tasks: 12,
        outstanding_invoices: 2300000,
        safety_incidents: 1,
        estimated_completion: '2026-11-20',
        projected_cost: 122500000
      };

      // Generate AI insights
      const insights = generateInsights(projectContext);

      // Advanced analytics
      const analytics = {
        risk_assessment: {
          overall_risk: 'medium',
          risk_score: 34,
          risk_factors: [
            {
              factor: 'Budget overrun risk',
              severity: 'medium',
              probability: 45,
              impact: 'high'
            },
            {
              factor: 'Schedule delay risk',
              severity: 'low',
              probability: 25,
              impact: 'medium'
            },
            {
              factor: 'Resource availability',
              severity: 'low',
              probability: 15,
              impact: 'low'
            }
          ]
        },
        trends: {
          budget_trend: 'increasing',
          schedule_trend: 'stable',
          productivity_trend: 'improving',
          quality_trend: 'stable'
        },
        benchmarking: {
          vs_industry_average: {
            budget_performance: '+12%',
            schedule_performance: '+8%',
            safety_performance: '+35%'
          },
          vs_company_average: {
            budget_performance: '+5%',
            schedule_performance: '+3%',
            quality_score: '+10%'
          }
        },
        optimization_opportunities: [
          {
            area: 'Procurement',
            potential_savings: 450000,
            effort: 'medium',
            timeframe: '30-60 days'
          },
          {
            area: 'Labor efficiency',
            potential_savings: 280000,
            effort: 'low',
            timeframe: '15-30 days'
          },
          {
            area: 'Material waste reduction',
            potential_savings: 120000,
            effort: 'low',
            timeframe: '7-14 days'
          }
        ]
      };

      console.log(`🤖 Generated ${insights.length} AI insights for ${user.email}`);

      return res.status(200).json({
        success: true,
        data: {
          insights,
          analytics,
          generated_at: new Date().toISOString(),
          confidence_level: 87,
          data_quality: 'high'
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ AI Insights API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
