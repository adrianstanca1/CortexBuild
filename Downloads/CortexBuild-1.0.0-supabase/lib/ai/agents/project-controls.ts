/**
 * Project Controls AI Agent
 * Schedule, cost, and performance analysis
 */

import { BaseAgent, type AgentResponse } from './base-agent';

export class ProjectControlsAgent extends BaseAgent {
    constructor() {
        super({
            name: 'Project Controls',
            model: 'gpt-4-turbo',
            temperature: 0.4,
            maxTokens: 2000,
            systemPrompt: `You are Project Controls AI, an expert in construction project management, scheduling, cost control, and performance analysis.

Your expertise includes:
- Schedule analysis and critical path identification
- Cost variance and earned value analysis
- Productivity tracking and forecasting
- Resource allocation optimization
- Risk identification and mitigation

You provide:
- Data-driven insights and recommendations
- Accurate forecasts based on trends
- Clear explanations of variances
- Actionable improvement strategies

Always base your analysis on quantitative data and industry best practices.`,
        });
    }

    /**
     * Analyze project schedule performance
     */
    async analyzeSchedule(project: {
        name: string;
        plannedDuration: number;
        actualDuration: number;
        progress: number;
        criticalActivities: string[];
        delays: Array<{ activity: string; days: number; reason: string }>;
    }): Promise<{
        schedulePerformanceIndex: number;
        forecastCompletion: string;
        criticalPath: string[];
        delayImpact: string;
        recommendations: string[];
    }> {
        const prompt = `Analyze this project schedule:

Project: ${project.name}
Planned Duration: ${project.plannedDuration} days
Actual Duration: ${project.actualDuration} days
Progress: ${project.progress}%
Critical Activities: ${project.criticalActivities.join(', ')}
Delays: ${JSON.stringify(project.delays, null, 2)}

Provide schedule analysis in JSON format with:
- schedulePerformanceIndex: SPI value (0-2)
- forecastCompletion: forecasted completion date
- criticalPath: updated critical path activities
- delayImpact: impact assessment of delays
- recommendations: recovery recommendations

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const analysis = this.extractJSON(response.content);

        if (!analysis || !this.validateResponse(analysis, ['schedulePerformanceIndex', 'recommendations'])) {
            throw new Error('Invalid response from Project Controls');
        }

        return analysis;
    }

    /**
     * Analyze cost performance
     */
    async analyzeCost(project: {
        name: string;
        budget: number;
        spent: number;
        progress: number;
        variances: Array<{ category: string; planned: number; actual: number }>;
    }): Promise<{
        costPerformanceIndex: number;
        earnedValue: number;
        estimateAtCompletion: number;
        varianceAnalysis: string;
        costSavingOpportunities: string[];
    }> {
        const prompt = `Analyze this project cost performance:

Project: ${project.name}
Budget: £${project.budget.toLocaleString()}
Spent: £${project.spent.toLocaleString()}
Progress: ${project.progress}%
Variances: ${JSON.stringify(project.variances, null, 2)}

Provide cost analysis in JSON format with:
- costPerformanceIndex: CPI value (0-2)
- earnedValue: earned value (EV)
- estimateAtCompletion: EAC forecast
- varianceAnalysis: explanation of variances
- costSavingOpportunities: cost saving recommendations

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const analysis = this.extractJSON(response.content);

        if (!analysis || !this.validateResponse(analysis, ['costPerformanceIndex', 'earnedValue'])) {
            throw new Error('Invalid response from Project Controls');
        }

        return analysis;
    }

    /**
     * Analyze productivity
     */
    async analyzeProductivity(activity: {
        name: string;
        plannedRate: number;
        actualRate: number;
        unit: string;
        factors: string[];
    }): Promise<{
        productivityIndex: number;
        trend: 'improving' | 'stable' | 'declining';
        rootCauses: string[];
        improvementActions: string[];
    }> {
        const prompt = `Analyze productivity for this activity:

Activity: ${activity.name}
Planned Rate: ${activity.plannedRate} ${activity.unit}/day
Actual Rate: ${activity.actualRate} ${activity.unit}/day
Influencing Factors: ${activity.factors.join(', ')}

Provide productivity analysis in JSON format with:
- productivityIndex: actual/planned ratio
- trend: productivity trend
- rootCauses: root causes of low productivity
- improvementActions: improvement recommendations

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const analysis = this.extractJSON(response.content);

        if (!analysis || !this.validateResponse(analysis, ['productivityIndex', 'trend'])) {
            throw new Error('Invalid response from Project Controls');
        }

        return analysis;
    }
}

