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

// Generate trend data for different metrics
function generateTrendData(metric: string, period: number = 30): any[] {
  const data = [];
  const today = new Date();

  for (let i = period - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    let value = 0;
    let change = 0;

    switch (metric) {
      case 'project_completion':
        value = 35 + Math.random() * 10 - 5 + (period - i) * 0.5;
        change = Math.random() * 4 - 2;
        break;

      case 'task_velocity':
        value = 15 + Math.random() * 5;
        change = Math.random() * 3 - 1.5;
        break;

      case 'budget_burn_rate':
        value = 2500000 + Math.random() * 500000;
        change = Math.random() * 200000 - 100000;
        break;

      case 'team_productivity':
        value = 82 + Math.random() * 10 - 5;
        change = Math.random() * 3 - 1.5;
        break;

      case 'rfi_response_time':
        value = 2.5 + Math.random() * 1 - 0.5;
        change = Math.random() * 0.5 - 0.25;
        break;

      case 'safety_incidents':
        value = Math.floor(Math.random() * 3);
        change = Math.random() * 2 - 1;
        break;

      default:
        value = Math.random() * 100;
    }

    data.push({
      date: dateStr,
      value: Math.round(value * 100) / 100,
      change: Math.round(change * 100) / 100,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    });
  }

  return data;
}

// Calculate trend statistics
function calculateTrendStats(data: any[]): any {
  const values = data.map(d => d.value);
  const changes = data.map(d => d.change);

  const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const totalChange = changes.reduce((sum, c) => sum + c, 0);
  const avgChange = totalChange / changes.length;

  // Calculate trend direction
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
  const overallTrend = secondHalfAvg > firstHalfAvg ? 'improving' : secondHalfAvg < firstHalfAvg ? 'declining' : 'stable';

  return {
    avg_value: Math.round(avgValue * 100) / 100,
    min_value: Math.round(minValue * 100) / 100,
    max_value: Math.round(maxValue * 100) / 100,
    total_change: Math.round(totalChange * 100) / 100,
    avg_change: Math.round(avgChange * 100) / 100,
    overall_trend: overallTrend,
    volatility: Math.round((maxValue - minValue) / avgValue * 10000) / 100 // percentage
  };
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

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const user = verifyAuth(req);
    const {
      metric,
      period = '30', // days
      company_id,
      project_id,
      compare_to // previous period
    } = req.query;

    const periodDays = parseInt(period as string);

    if (!metric) {
      return res.status(400).json({
        success: false,
        error: 'metric is required (project_completion, task_velocity, budget_burn_rate, team_productivity, rfi_response_time, safety_incidents, all)'
      });
    }

    let trends: any = {};

    if (metric === 'all') {
      // Get all metrics
      const metrics = [
        'project_completion',
        'task_velocity',
        'budget_burn_rate',
        'team_productivity',
        'rfi_response_time',
        'safety_incidents'
      ];

      for (const m of metrics) {
        const data = generateTrendData(m, periodDays);
        trends[m] = {
          data,
          stats: calculateTrendStats(data),
          latest: data[data.length - 1]
        };
      }
    } else {
      // Get specific metric
      const data = generateTrendData(metric as string, periodDays);
      trends[metric as string] = {
        data,
        stats: calculateTrendStats(data),
        latest: data[data.length - 1]
      };
    }

    // Compare to previous period if requested
    if (compare_to === 'previous') {
      Object.keys(trends).forEach(metricKey => {
        const previousData = generateTrendData(metricKey, periodDays);
        const currentStats = trends[metricKey].stats;
        const previousStats = calculateTrendStats(previousData);

        trends[metricKey].comparison = {
          period: 'previous',
          change: Math.round((currentStats.avg_value - previousStats.avg_value) * 100) / 100,
          change_percentage: Math.round(((currentStats.avg_value - previousStats.avg_value) / previousStats.avg_value) * 10000) / 100,
          improved: currentStats.avg_value > previousStats.avg_value
        };
      });
    }

    console.log(`📈 Fetched trend data for ${metric} (${periodDays} days) for ${user.email}`);

    return res.status(200).json({
      success: true,
      trends,
      meta: {
        period_days: periodDays,
        start_date: new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        metrics_included: Object.keys(trends),
        generated_at: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Trends API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
