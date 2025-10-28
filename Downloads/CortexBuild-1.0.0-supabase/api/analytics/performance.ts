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
      scope, // company, project, team, individual
      entity_id,
      timeframe = '30d',
      metrics
    } = req.query;

    if (!scope) {
      return res.status(400).json({
        success: false,
        error: 'scope is required (company, project, team, individual)'
      });
    }

    const metricsArray = metrics ? (metrics as string).split(',') : ['all'];

    // Performance metrics calculation
    const performanceData: any = {
      scope,
      entity_id,
      timeframe,
      generated_at: new Date().toISOString()
    };

    // Overall performance score (0-100)
    const calculatePerformanceScore = () => {
      return {
        overall_score: 87,
        breakdown: {
          schedule_performance: 92, // On-time delivery rate
          cost_performance: 85, // Budget adherence
          quality_performance: 88, // Defect rate, rework percentage
          safety_performance: 95, // Safety incident rate
          productivity_performance: 84 // Output vs. input
        },
        grade: 'B+',
        rank: '12 out of 45', // Compared to similar projects
        percentile: 73
      };
    };

    // Schedule performance
    const schedulePerformance = () => {
      return {
        planned_vs_actual: {
          planned_completion_date: '2026-12-31',
          current_forecast: '2026-11-20',
          variance_days: -41,
          variance_percentage: -5.6
        },
        milestone_performance: {
          total_milestones: 12,
          completed_on_time: 8,
          completed_late: 2,
          in_progress: 2,
          on_time_rate: 80
        },
        critical_path_health: {
          status: 'on-track',
          buffer_days: 15,
          risk_level: 'low',
          bottlenecks: []
        },
        schedule_performance_index: 1.06 // SPI > 1 = ahead of schedule
      };
    };

    // Cost performance
    const costPerformance = () => {
      return {
        budget_vs_actual: {
          total_budget: 125000000,
          spent_to_date: 43750000,
          committed: 12500000,
          remaining: 68750000,
          variance: -3000000,
          variance_percentage: -2.4
        },
        cost_breakdown: {
          labor: { budgeted: 45000000, actual: 18750000, variance: -1250000 },
          materials: { budgeted: 60000000, actual: 20000000, variance: -1500000 },
          equipment: { budgeted: 15000000, actual: 4000000, variance: -250000 },
          subcontractors: { budgeted: 5000000, actual: 1000000, variance: 0 }
        },
        burn_rate: {
          daily_average: 245000,
          monthly_average: 7350000,
          projected_final_cost: 124500000
        },
        cost_performance_index: 1.024 // CPI > 1 = under budget
      };
    };

    // Quality performance
    const qualityPerformance = () => {
      return {
        defect_rate: {
          total_inspections: 450,
          defects_found: 23,
          defect_rate: 5.1, // percentage
          industry_average: 8.2,
          performance: 'above_average'
        },
        rework: {
          rework_hours: 150,
          total_hours: 2840,
          rework_percentage: 5.3,
          cost_of_rework: 18750,
          trend: 'decreasing'
        },
        inspection_results: {
          passed_first_time: 385,
          failed: 65,
          first_time_pass_rate: 85.6
        },
        quality_score: 88
      };
    };

    // Safety performance
    const safetyPerformance = () => {
      return {
        incident_rate: {
          total_incidents: 2,
          recordable_incidents: 0,
          lost_time_incidents: 0,
          near_misses: 5,
          total_hours_worked: 45000,
          incident_rate_per_100k_hours: 4.4,
          industry_average: 8.9
        },
        safety_audits: {
          total_audits: 12,
          passed: 11,
          compliance_rate: 91.7
        },
        safety_training: {
          required_trainings: 240,
          completed: 232,
          compliance_rate: 96.7
        },
        safety_score: 95
      };
    };

    // Productivity performance
    const productivityPerformance = () => {
      return {
        output_metrics: {
          tasks_completed: 132,
          planned_tasks: 150,
          completion_rate: 88,
          velocity: 15.2 // tasks per week
        },
        efficiency: {
          productive_hours: 2408,
          total_hours: 2840,
          efficiency_rate: 84.8,
          idle_time_percentage: 15.2
        },
        resource_utilization: {
          labor_utilization: 87.5,
          equipment_utilization: 78.3,
          material_efficiency: 94.2
        },
        productivity_index: 1.12, // Output / Input ratio
        trend: 'improving'
      };
    };

    // Team performance (if scope is team or individual)
    const teamPerformance = () => {
      return {
        team_metrics: {
          total_members: 24,
          active_members: 18,
          utilization_rate: 87,
          turnover_rate: 5.2,
          satisfaction_score: 8.4
        },
        collaboration: {
          cross_team_tasks: 45,
          collaboration_score: 82,
          communication_effectiveness: 88
        },
        skill_development: {
          certifications_earned: 12,
          training_hours: 480,
          skill_improvement_rate: 15
        },
        top_performers: [
          { name: 'Engineer Mike', tasks_completed: 42, efficiency: 94.5 },
          { name: 'Sarah Chen', tasks_completed: 38, efficiency: 91.2 }
        ]
      };
    };

    // Industry benchmarking
    const benchmarking = () => {
      return {
        industry_comparison: {
          your_performance: 87,
          industry_average: 75,
          top_10_percent: 92,
          position: 'above_average'
        },
        regional_comparison: {
          your_rank: 8,
          total_companies: 45,
          region: 'North America'
        },
        similar_projects: {
          avg_schedule_performance: 85,
          avg_cost_performance: 82,
          avg_quality_score: 84,
          your_advantage: '+3.2%'
        }
      };
    };

    // Build response based on requested metrics
    if (metricsArray.includes('all') || metricsArray.includes('overall')) {
      performanceData.overall = calculatePerformanceScore();
    }

    if (metricsArray.includes('all') || metricsArray.includes('schedule')) {
      performanceData.schedule = schedulePerformance();
    }

    if (metricsArray.includes('all') || metricsArray.includes('cost')) {
      performanceData.cost = costPerformance();
    }

    if (metricsArray.includes('all') || metricsArray.includes('quality')) {
      performanceData.quality = qualityPerformance();
    }

    if (metricsArray.includes('all') || metricsArray.includes('safety')) {
      performanceData.safety = safetyPerformance();
    }

    if (metricsArray.includes('all') || metricsArray.includes('productivity')) {
      performanceData.productivity = productivityPerformance();
    }

    if ((metricsArray.includes('all') || metricsArray.includes('team')) &&
        (scope === 'team' || scope === 'company')) {
      performanceData.team = teamPerformance();
    }

    if (metricsArray.includes('all') || metricsArray.includes('benchmarking')) {
      performanceData.benchmarking = benchmarking();
    }

    // Key insights and recommendations
    performanceData.insights = [
      {
        type: 'positive',
        category: 'schedule',
        message: 'Project is ahead of schedule by 41 days',
        impact: 'high',
        confidence: 0.92
      },
      {
        type: 'warning',
        category: 'cost',
        message: 'Budget variance of -2.4% detected in materials category',
        impact: 'medium',
        confidence: 0.87,
        recommendation: 'Review material procurement and pricing strategies'
      },
      {
        type: 'positive',
        category: 'safety',
        message: 'Safety incident rate 50% below industry average',
        impact: 'high',
        confidence: 0.95
      }
    ];

    performanceData.recommendations = [
      {
        priority: 'high',
        category: 'cost',
        action: 'Optimize material procurement process',
        expected_impact: 'Save $500K',
        effort: 'medium',
        timeframe: '2 weeks'
      },
      {
        priority: 'medium',
        category: 'productivity',
        action: 'Implement automated scheduling tool',
        expected_impact: 'Increase velocity by 15%',
        effort: 'high',
        timeframe: '1 month'
      }
    ];

    console.log(`📊 Generated performance analytics for ${scope} for ${user.email}`);

    return res.status(200).json({
      success: true,
      performance: performanceData
    });

  } catch (error: any) {
    console.error('❌ Performance API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
