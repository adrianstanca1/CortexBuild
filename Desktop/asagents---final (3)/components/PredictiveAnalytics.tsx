import React, { useState, useEffect } from 'react';
import { Project, Todo, Timesheet, User, TodoStatus } from '../types';
import { api } from '../services/apiService';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressIndicators';
import { Alert } from './ui/Alert';

interface PredictiveAnalyticsProps {
  project: Project;
  todos: Todo[];
  timesheets: Timesheet[];
  user: User;
}

interface Prediction {
  type: 'completion' | 'budget' | 'risk' | 'resource';
  severity: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  confidence: number;
  predictedDate?: Date;
  predictedValue?: number;
  recommendation: string;
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  project,
  todos,
  timesheets,
  user
}) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generatePredictions();
  }, [project, todos, timesheets]);

  const generatePredictions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newPredictions: Prediction[] = [];

      // 1. Project Completion Prediction
      const completedTasks = todos.filter(t => t.status === TodoStatus.DONE).length;
      const totalTasks = todos.length;
      const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
      
      if (completionRate > 0) {
        const startDate = new Date(project.startDate);
        const now = new Date();
        const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const estimatedTotalDays = daysElapsed / completionRate;
        const daysRemaining = Math.ceil(estimatedTotalDays - daysElapsed);
        const predictedEndDate = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
        
        let severity: 'success' | 'warning' | 'error' = 'success';
        let recommendation = 'Project is on track. Continue current pace.';
        
        if (daysRemaining > 90) {
          severity = 'warning';
          recommendation = 'Consider adding more resources or adjusting scope to meet timeline.';
        } else if (daysRemaining > 120) {
          severity = 'error';
          recommendation = 'Significant delays predicted. Urgent intervention required.';
        }

        newPredictions.push({
          type: 'completion',
          severity,
          title: 'Project Completion Forecast',
          description: `Based on current progress (${Math.round(completionRate * 100)}%), project is predicted to complete in ${daysRemaining} days.`,
          confidence: Math.min(completionRate * 100 + 20, 95),
          predictedDate: predictedEndDate,
          recommendation
        });
      }

      // 2. Budget Overrun Prediction
      const budgetUsed = (project.actualCost / project.budget) * 100;
      const taskProgress = completionRate * 100;
      
      if (budgetUsed > taskProgress + 10) {
        const burnRate = budgetUsed / taskProgress;
        const predictedTotal = project.budget * burnRate;
        const overrun = predictedTotal - project.budget;
        
        newPredictions.push({
          type: 'budget',
          severity: overrun > project.budget * 0.2 ? 'error' : 'warning',
          title: 'Budget Overrun Warning',
          description: `Current spending pace suggests ${Math.round((burnRate - 1) * 100)}% over budget. Predicted total: £${Math.round(predictedTotal).toLocaleString()}.`,
          confidence: 75,
          predictedValue: predictedTotal,
          recommendation: 'Review expenses and implement cost controls. Consider scope adjustments.'
        });
      } else if (budgetUsed < taskProgress * 0.7) {
        newPredictions.push({
          type: 'budget',
          severity: 'success',
          title: 'Budget Performance Excellent',
          description: `Project is significantly under budget. ${Math.round(taskProgress - budgetUsed)}% budget cushion available.`,
          confidence: 80,
          recommendation: 'Consider investing in quality improvements or additional scope.'
        });
      }

      // 3. Resource Bottleneck Detection
      const recentTimesheets = timesheets.filter(ts => {
        const tsDate = new Date(ts.clockIn);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return tsDate >= weekAgo;
      });

      if (recentTimesheets.length < 5 && todos.filter(t => t.status !== TodoStatus.DONE).length > 10) {
        newPredictions.push({
          type: 'resource',
          severity: 'warning',
          title: 'Resource Shortage Detected',
          description: `Low activity detected with ${todos.filter(t => t.status !== TodoStatus.DONE).length} pending tasks. Team may be understaffed.`,
          confidence: 70,
          recommendation: 'Consider adding more team members or redistributing workload.'
        });
      }

      // 4. Risk Assessment using AI
      try {
        const aiPredictions = await api.predictProjectRisks(project.id, {
          completionRate,
          budgetUsage: budgetUsed,
          teamSize: recentTimesheets.length,
          taskCount: todos.length
        });

        if (aiPredictions && aiPredictions.risks) {
          aiPredictions.risks.forEach((risk: any) => {
            newPredictions.push({
              type: 'risk',
              severity: risk.severity,
              title: risk.title,
              description: risk.description,
              confidence: risk.confidence,
              recommendation: risk.recommendation
            });
          });
        }
      } catch (aiError) {
        // AI prediction failed, continue with rule-based predictions
        console.warn('AI predictions unavailable, using rule-based analysis');
      }

      // 5. Task Velocity Analysis
      const lastWeekCompleted = todos.filter(t => {
        if (t.status === TodoStatus.DONE && t.completedAt) {
          const completedDate = new Date(t.completedAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return completedDate >= weekAgo;
        }
        return false;
      }).length;

      const remainingTasks = todos.filter(t => t.status !== TodoStatus.DONE).length;
      const weeksToComplete = lastWeekCompleted > 0 ? Math.ceil(remainingTasks / lastWeekCompleted) : 0;

      if (lastWeekCompleted === 0 && remainingTasks > 0) {
        newPredictions.push({
          type: 'completion',
          severity: 'error',
          title: 'Zero Task Velocity',
          description: 'No tasks completed in the past week. Project has stalled.',
          confidence: 95,
          recommendation: 'Immediate action required. Review blockers and team availability.'
        });
      } else if (weeksToComplete > 12) {
        newPredictions.push({
          type: 'completion',
          severity: 'warning',
          title: 'Low Task Velocity',
          description: `At current pace (${lastWeekCompleted} tasks/week), ${weeksToComplete} weeks needed to complete remaining tasks.`,
          confidence: 80,
          recommendation: 'Increase task completion rate or adjust timeline expectations.'
        });
      }

      setPredictions(newPredictions);
    } catch (err) {
      setError('Failed to generate predictions. Using basic analysis.');
      // Generate basic predictions even on error
      setPredictions([{
        type: 'info',
        severity: 'info',
        title: 'Analysis Available',
        description: 'Basic project analysis is available. AI predictions temporarily unavailable.',
        confidence: 50,
        recommendation: 'Monitor project metrics manually and consult with project manager.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-slate-600">Analyzing project data...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">🔮 Predictive Analytics</h3>
            <p className="text-sm text-slate-500 mt-1">AI-powered insights and forecasts</p>
          </div>
          <button
            onClick={generatePredictions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh Analysis
          </button>
        </div>

        {error && (
          <Alert type="warning" message={error} className="mb-4" />
        )}

        <div className="space-y-4">
          {predictions.length === 0 ? (
            <Alert
              type="info"
              title="No Predictions Available"
              message="Insufficient data to generate predictions. Complete more tasks and track progress to enable forecasting."
            />
          ) : (
            predictions.map((prediction, index) => (
              <Alert
                key={index}
                type={prediction.severity}
                title={prediction.title}
                message={prediction.description}
              >
                <div className="mt-3 space-y-2">
                  {prediction.predictedDate && (
                    <div className="text-sm">
                      <span className="font-semibold">Predicted Date:</span>{' '}
                      {prediction.predictedDate.toLocaleDateString('en-GB', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                  {prediction.predictedValue !== undefined && (
                    <div className="text-sm">
                      <span className="font-semibold">Predicted Value:</span>{' '}
                      £{Math.round(prediction.predictedValue).toLocaleString()}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Confidence:</span>
                    <div className="flex-1">
                      <ProgressBar
                        progress={prediction.confidence}
                        height="h-2"
                        color={prediction.confidence >= 80 ? 'bg-green-500' : prediction.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'}
                      />
                    </div>
                    <span className="text-sm font-medium">{Math.round(prediction.confidence)}%</span>
                  </div>
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm font-semibold text-slate-700 mb-1">💡 Recommendation:</p>
                    <p className="text-sm text-slate-600">{prediction.recommendation}</p>
                  </div>
                </div>
              </Alert>
            ))
          )}
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="p-6">
        <h4 className="font-semibold text-slate-700 mb-4">Prediction Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{predictions.length}</p>
            <p className="text-sm text-slate-600 mt-1">Total Insights</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {predictions.filter(p => p.severity === 'success').length}
            </p>
            <p className="text-sm text-slate-600 mt-1">Positive</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">
              {predictions.filter(p => p.severity === 'warning').length}
            </p>
            <p className="text-sm text-slate-600 mt-1">Warnings</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">
              {predictions.filter(p => p.severity === 'error').length}
            </p>
            <p className="text-sm text-slate-600 mt-1">Critical</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
