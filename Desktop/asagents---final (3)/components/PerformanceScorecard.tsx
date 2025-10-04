import React, { useState, useEffect, useMemo } from 'react';
import { User, Todo, Timesheet, Project, TodoStatus } from '../types';
import { api } from '../services/apiService';
import { Card } from './ui/Card';
import { ProgressRing, ProgressBar } from './ui/ProgressIndicators';
import { StatCard } from './ui/StatCards';

interface PerformanceScorecardProps {
  user: User;
  timeframe?: 'week' | 'month' | 'quarter';
}

interface PerformanceMetrics {
  productivityScore: number;
  tasksCompleted: number;
  tasksCompletedOnTime: number;
  avgTasksPerDay: number;
  hoursWorked: number;
  attendanceRate: number;
  qualityScore: number;
  collaborationScore: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
}

interface TeamPerformance {
  userId: number;
  userName: string;
  score: number;
  tasksCompleted: number;
  hoursWorked: number;
}

export const PerformanceScorecard: React.FC<PerformanceScorecardProps> = ({
  user,
  timeframe = 'month'
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    productivityScore: 0,
    tasksCompleted: 0,
    tasksCompletedOnTime: 0,
    avgTasksPerDay: 0,
    hoursWorked: 0,
    attendanceRate: 0,
    qualityScore: 0,
    collaborationScore: 0,
    trend: 'neutral',
    trendValue: 0
  });
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  useEffect(() => {
    calculateMetrics();
  }, [user, selectedTimeframe]);

  const getDaysInTimeframe = () => {
    switch (selectedTimeframe) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      default: return 30;
    }
  };

  const calculateMetrics = async () => {
    setIsLoading(true);
    try {
      const days = getDaysInTimeframe();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch user data
      const [allTodos, timesheets, projects] = await Promise.all([
        api.getTodosByUser(user.id),
        api.getTimesheetsByUser(user.id),
        api.getProjectsByUser(user.id)
      ]);

      // Filter by timeframe
      const recentTodos = allTodos.filter((todo: Todo) => {
        if (todo.completedAt) {
          return new Date(todo.completedAt) >= startDate;
        }
        return false;
      });

      const recentTimesheets = timesheets.filter((ts: Timesheet) => {
        return new Date(ts.clockIn) >= startDate;
      });

      // Calculate metrics
      const tasksCompleted = recentTodos.filter((t: Todo) => t.status === TodoStatus.DONE).length;
      
      const tasksOnTime = recentTodos.filter((t: Todo) => {
        if (t.status === TodoStatus.DONE && t.dueDate && t.completedAt) {
          return new Date(t.completedAt) <= new Date(t.dueDate);
        }
        return false;
      }).length;

      const totalHours = recentTimesheets.reduce((sum: number, ts: Timesheet) => {
        if (ts.clockOut) {
          const hours = (new Date(ts.clockOut).getTime() - new Date(ts.clockIn).getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0);

      const avgTasksPerDay = tasksCompleted / days;
      const expectedDays = days;
      const workedDays = new Set(recentTimesheets.map((ts: Timesheet) => 
        new Date(ts.clockIn).toDateString()
      )).size;
      const attendanceRate = (workedDays / expectedDays) * 100;

      // Quality score based on on-time completion
      const qualityScore = tasksCompleted > 0 ? (tasksOnTime / tasksCompleted) * 100 : 100;

      // Collaboration score (simplified - based on comments and team interaction)
      const tasksWithComments = recentTodos.filter((t: Todo) => 
        t.comments && t.comments.length > 0
      ).length;
      const collaborationScore = tasksCompleted > 0 
        ? Math.min((tasksWithComments / tasksCompleted) * 100, 100)
        : 0;

      // Overall productivity score (weighted average)
      const productivityScore = Math.round(
        (avgTasksPerDay * 10) * 0.3 +
        qualityScore * 0.3 +
        Math.min(attendanceRate, 100) * 0.25 +
        collaborationScore * 0.15
      );

      // Calculate trend (compare to previous period)
      const previousStart = new Date(startDate);
      previousStart.setDate(previousStart.getDate() - days);
      const previousTodos = allTodos.filter((todo: Todo) => {
        if (todo.completedAt) {
          const completedDate = new Date(todo.completedAt);
          return completedDate >= previousStart && completedDate < startDate;
        }
        return false;
      });
      const previousCompleted = previousTodos.filter((t: Todo) => t.status === TodoStatus.DONE).length;
      const trendValue = previousCompleted > 0 
        ? ((tasksCompleted - previousCompleted) / previousCompleted) * 100
        : 0;
      const trend: 'up' | 'down' | 'neutral' = 
        trendValue > 5 ? 'up' : trendValue < -5 ? 'down' : 'neutral';

      setMetrics({
        productivityScore,
        tasksCompleted,
        tasksCompletedOnTime: tasksOnTime,
        avgTasksPerDay: Number(avgTasksPerDay.toFixed(1)),
        hoursWorked: Number(totalHours.toFixed(1)),
        attendanceRate: Number(attendanceRate.toFixed(0)),
        qualityScore: Number(qualityScore.toFixed(0)),
        collaborationScore: Number(collaborationScore.toFixed(0)),
        trend,
        trendValue: Number(Math.abs(trendValue).toFixed(1))
      });

      // If user has permission, load team performance
      if (user.companyId) {
        try {
          const allUsers = await api.getUsersByCompany(user.companyId);
          const teamScores: TeamPerformance[] = [];

          for (const teamMember of allUsers.slice(0, 10)) { // Limit to top 10
            const memberTodos = await api.getTodosByUser(teamMember.id);
            const memberTimesheets = await api.getTimesheetsByUser(teamMember.id);
            
            const memberRecentTodos = memberTodos.filter((todo: Todo) => {
              if (todo.completedAt) {
                return new Date(todo.completedAt) >= startDate;
              }
              return false;
            });

            const memberCompleted = memberRecentTodos.filter((t: Todo) => 
              t.status === TodoStatus.DONE
            ).length;

            const memberHours = memberTimesheets
              .filter((ts: Timesheet) => new Date(ts.clockIn) >= startDate)
              .reduce((sum: number, ts: Timesheet) => {
                if (ts.clockOut) {
                  const hours = (new Date(ts.clockOut).getTime() - new Date(ts.clockIn).getTime()) / (1000 * 60 * 60);
                  return sum + hours;
                }
                return sum;
              }, 0);

            const memberScore = Math.round((memberCompleted * 10) + (memberHours / 2));

            teamScores.push({
              userId: teamMember.id,
              userName: teamMember.name,
              score: memberScore,
              tasksCompleted: memberCompleted,
              hoursWorked: Number(memberHours.toFixed(1))
            });
          }

          teamScores.sort((a, b) => b.score - a.score);
          setTeamPerformance(teamScores);
        } catch (err) {
          console.warn('Could not load team performance');
        }
      }

    } catch (error) {
      console.error('Failed to calculate metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-slate-600">Loading performance data...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">📈 Performance Scorecard</h3>
            <p className="text-sm text-slate-500 mt-1">Your productivity metrics and insights</p>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'quarter'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col items-center justify-center py-6">
            <ProgressRing
              progress={metrics.productivityScore}
              size={160}
              strokeWidth={14}
              color={metrics.productivityScore >= 80 ? '#10b981' : metrics.productivityScore >= 60 ? '#f59e0b' : '#ef4444'}
              label="Overall"
            />
            <div className="mt-4 text-center">
              <p className={`text-2xl font-bold ${getScoreColor(metrics.productivityScore)}`}>
                {getScoreLabel(metrics.productivityScore)}
              </p>
              {metrics.trend !== 'neutral' && (
                <div className={`flex items-center justify-center gap-1 mt-2 text-sm ${
                  metrics.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.trend === 'up' ? '↑' : '↓'}
                  <span>{metrics.trendValue}% vs previous period</span>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2 space-y-4">
            <StatCard
              title="Tasks Completed"
              value={metrics.tasksCompleted}
              change={metrics.trendValue}
              trend={metrics.trend}
              subtitle={`${metrics.avgTasksPerDay} per day average`}
              color="text-blue-600"
            />
            <StatCard
              title="Hours Worked"
              value={`${metrics.hoursWorked}h`}
              subtitle={`${metrics.attendanceRate}% attendance rate`}
              color="text-purple-600"
            />
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Quality Score</span>
              <span className={`text-sm font-semibold ${getScoreColor(metrics.qualityScore)}`}>
                {metrics.qualityScore}%
              </span>
            </div>
            <ProgressBar progress={metrics.qualityScore} color="bg-green-500" />
            <p className="text-xs text-slate-500">
              {metrics.tasksCompletedOnTime} of {metrics.tasksCompleted} tasks on time
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Attendance</span>
              <span className={`text-sm font-semibold ${getScoreColor(metrics.attendanceRate)}`}>
                {metrics.attendanceRate}%
              </span>
            </div>
            <ProgressBar progress={metrics.attendanceRate} color="bg-blue-500" />
            <p className="text-xs text-slate-500">
              Consistent presence over {selectedTimeframe}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Collaboration</span>
              <span className={`text-sm font-semibold ${getScoreColor(metrics.collaborationScore)}`}>
                {metrics.collaborationScore}%
              </span>
            </div>
            <ProgressBar progress={metrics.collaborationScore} color="bg-purple-500" />
            <p className="text-xs text-slate-500">
              Team engagement and communication
            </p>
          </div>
        </div>
      </Card>

      {/* Team Leaderboard */}
      {teamPerformance.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold text-slate-700 mb-4">🏆 Team Leaderboard</h4>
          <div className="space-y-3">
            {teamPerformance.map((member, index) => (
              <div
                key={member.userId}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  member.userId === user.id ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700">
                    {member.userName}
                    {member.userId === user.id && (
                      <span className="ml-2 text-xs text-blue-600">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {member.tasksCompleted} tasks • {member.hoursWorked}h worked
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-800">{member.score}</p>
                  <p className="text-xs text-slate-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <h4 className="font-semibold text-slate-700 mb-3">💡 Performance Insights</h4>
        <div className="space-y-2 text-sm text-slate-600">
          {metrics.productivityScore >= 80 && (
            <p>• Excellent work! You're performing above expectations.</p>
          )}
          {metrics.qualityScore >= 90 && (
            <p>• Outstanding quality! {metrics.tasksCompletedOnTime} tasks completed on time.</p>
          )}
          {metrics.avgTasksPerDay < 1 && (
            <p>• Consider focusing on completing at least 1-2 tasks daily to improve productivity.</p>
          )}
          {metrics.attendanceRate < 70 && (
            <p>• Attendance could be improved. Consistent presence boosts team collaboration.</p>
          )}
          {metrics.trend === 'up' && (
            <p>• Great progress! You've improved {metrics.trendValue}% compared to last period.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
