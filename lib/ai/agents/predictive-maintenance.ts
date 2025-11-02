/**
 * Predictive Maintenance AI Agent
 * Equipment monitoring, failure prediction, and maintenance optimization
 */

import { BaseAgent, type AgentResponse } from './base-agent';

export class PredictiveMaintenanceAgent extends BaseAgent {
    constructor() {
        super({
            name: 'Predictive Maintenance',
            model: 'gpt-4-turbo',
            temperature: 0.3,
            maxTokens: 2000,
            systemPrompt: `You are Predictive Maintenance AI, an expert in construction equipment monitoring, failure prediction, and maintenance optimization.

Your expertise includes:
- Equipment health monitoring and diagnostics
- Failure pattern analysis and prediction
- Maintenance scheduling optimization
- Cost-benefit analysis of maintenance strategies
- Equipment lifecycle management
- Spare parts inventory optimization
- Downtime minimization strategies

You provide:
- Accurate failure predictions with confidence intervals
- Optimized maintenance schedules
- Cost-effective maintenance strategies
- Equipment replacement recommendations
- Performance optimization insights

Always prioritize safety, cost-effectiveness, and operational efficiency.`,
        });
    }

    /**
     * Predict equipment failure
     */
    async predictFailure(equipment: {
        id: string;
        type: string;
        model: string;
        age: number;
        operatingHours: number;
        maintenanceHistory: any[];
        sensorData: any[];
        workConditions: string;
    }): Promise<{
        failureRisk: 'low' | 'medium' | 'high' | 'critical';
        predictedFailureDate: string;
        confidence: number;
        failureMode: string;
        earlyWarnings: string[];
        recommendedActions: Array<{
            action: string;
            urgency: 'immediate' | 'within_week' | 'within_month';
            cost: number;
            benefit: string;
        }>;
    }> {
        const prompt = `Analyze this equipment for failure prediction:

Equipment ID: ${equipment.id}
Type: ${equipment.type}
Model: ${equipment.model}
Age: ${equipment.age} years
Operating Hours: ${equipment.operatingHours}
Work Conditions: ${equipment.workConditions}

Maintenance History: ${JSON.stringify(equipment.maintenanceHistory)}
Recent Sensor Data: ${JSON.stringify(equipment.sensorData)}

Predict:
1. Failure risk level and timeline
2. Most likely failure mode
3. Early warning indicators
4. Preventive actions with cost-benefit

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const prediction = this.extractJSON(response.content);

        if (!prediction || !this.validateResponse(prediction, ['failureRisk', 'predictedFailureDate', 'confidence'])) {
            throw new Error('Invalid response from Predictive Maintenance');
        }

        return prediction;
    }

    /**
     * Optimize maintenance schedule
     */
    async optimizeSchedule(fleet: {
        equipment: Array<{
            id: string;
            type: string;
            criticality: 'high' | 'medium' | 'low';
            currentCondition: number;
            nextScheduledMaintenance: string;
            maintenanceCost: number;
            downtimeCost: number;
        }>;
        constraints: {
            budget: number;
            maintenanceWindows: string[];
            technicians: number;
            spareParts: any[];
        };
    }): Promise<{
        optimizedSchedule: Array<{
            equipmentId: string;
            maintenanceType: string;
            scheduledDate: string;
            duration: number;
            cost: number;
            priority: number;
        }>;
        totalCost: number;
        riskReduction: number;
        recommendations: string[];
    }> {
        const prompt = `Optimize maintenance schedule for this equipment fleet:

Equipment Fleet: ${JSON.stringify(fleet.equipment)}
Constraints: ${JSON.stringify(fleet.constraints)}

Optimize for:
1. Minimize total cost (maintenance + downtime)
2. Maximize equipment availability
3. Reduce failure risk
4. Respect budget and resource constraints

Create optimal schedule with:
- Prioritized maintenance activities
- Resource allocation
- Cost optimization
- Risk mitigation

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const schedule = this.extractJSON(response.content);

        if (!schedule || !this.validateResponse(schedule, ['optimizedSchedule', 'totalCost'])) {
            throw new Error('Invalid response from Predictive Maintenance');
        }

        return schedule;
    }

    /**
     * Analyze equipment performance
     */
    async analyzePerformance(equipment: {
        id: string;
        type: string;
        performanceData: Array<{
            date: string;
            efficiency: number;
            fuelConsumption: number;
            productivity: number;
            downtime: number;
        }>;
        benchmarks: {
            efficiency: number;
            fuelConsumption: number;
            productivity: number;
        };
    }): Promise<{
        performanceScore: number;
        trends: {
            efficiency: 'improving' | 'stable' | 'declining';
            fuelConsumption: 'improving' | 'stable' | 'declining';
            productivity: 'improving' | 'stable' | 'declining';
        };
        issues: string[];
        optimizations: Array<{
            area: string;
            recommendation: string;
            expectedImprovement: number;
            implementationCost: number;
        }>;
    }> {
        const prompt = `Analyze equipment performance:

Equipment: ${equipment.id} (${equipment.type})
Performance Data: ${JSON.stringify(equipment.performanceData)}
Benchmarks: ${JSON.stringify(equipment.benchmarks)}

Analyze:
1. Overall performance score vs benchmarks
2. Performance trends over time
3. Identify performance issues
4. Recommend optimizations

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const analysis = this.extractJSON(response.content);

        if (!analysis || !this.validateResponse(analysis, ['performanceScore', 'trends'])) {
            throw new Error('Invalid response from Predictive Maintenance');
        }

        return analysis;
    }

    /**
     * Recommend equipment replacement
     */
    async recommendReplacement(equipment: {
        id: string;
        type: string;
        age: number;
        condition: number;
        maintenanceCosts: number[];
        downtimeCosts: number[];
        replacementCost: number;
        expectedLife: number;
    }): Promise<{
        recommendation: 'replace_now' | 'replace_soon' | 'maintain' | 'monitor';
        reasoning: string;
        costAnalysis: {
            maintainCost: number;
            replaceCost: number;
            savings: number;
            paybackPeriod: number;
        };
        timeline: string;
        alternatives: Array<{
            option: string;
            cost: number;
            benefits: string[];
            risks: string[];
        }>;
    }> {
        const prompt = `Analyze equipment replacement decision:

Equipment: ${equipment.id} (${equipment.type})
Age: ${equipment.age} years
Condition: ${equipment.condition}%
Recent Maintenance Costs: ${equipment.maintenanceCosts}
Downtime Costs: ${equipment.downtimeCosts}
Replacement Cost: $${equipment.replacementCost}
Expected Life: ${equipment.expectedLife} years

Analyze:
1. Replace vs maintain economics
2. Total cost of ownership
3. Risk assessment
4. Alternative options

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const recommendation = this.extractJSON(response.content);

        if (!recommendation || !this.validateResponse(recommendation, ['recommendation', 'costAnalysis'])) {
            throw new Error('Invalid response from Predictive Maintenance');
        }

        return recommendation;
    }

    /**
     * Generate maintenance insights
     */
    async generateInsights(data: {
        fleetSize: number;
        totalMaintenanceCost: number;
        averageUptime: number;
        failureRate: number;
        maintenanceEfficiency: number;
        industryBenchmarks: any;
    }): Promise<{
        insights: string[];
        opportunities: Array<{
            area: string;
            potential: string;
            effort: 'low' | 'medium' | 'high';
            impact: 'low' | 'medium' | 'high';
        }>;
        kpis: Array<{
            metric: string;
            current: number;
            target: number;
            improvement: number;
        }>;
        recommendations: string[];
    }> {
        const prompt = `Generate maintenance insights:

Fleet Data:
- Size: ${data.fleetSize} units
- Total Maintenance Cost: $${data.totalMaintenanceCost}
- Average Uptime: ${data.averageUptime}%
- Failure Rate: ${data.failureRate}%
- Maintenance Efficiency: ${data.maintenanceEfficiency}%

Industry Benchmarks: ${JSON.stringify(data.industryBenchmarks)}

Provide:
1. Key insights and observations
2. Improvement opportunities
3. Performance KPIs with targets
4. Strategic recommendations

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const insights = this.extractJSON(response.content);

        if (!insights || !this.validateResponse(insights, ['insights', 'opportunities'])) {
            throw new Error('Invalid response from Predictive Maintenance');
        }

        return insights;
    }
}

export default PredictiveMaintenanceAgent;
