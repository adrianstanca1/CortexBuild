/**
 * Intelligent Workflow Router
 * AI-powered task routing, decision making, and workflow optimization
 */

import { BaseAgent } from '../agents/base-agent';

interface WorkflowTask {
    id: string;
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    data: any;
    context: any;
    dependencies: string[];
    assignedTo?: string;
    estimatedDuration?: number;
    deadline?: string;
}

interface RoutingDecision {
    taskId: string;
    assignTo: string;
    reasoning: string;
    confidence: number;
    alternativeOptions: Array<{
        assignTo: string;
        score: number;
        pros: string[];
        cons: string[];
    }>;
}

interface WorkflowOptimization {
    currentEfficiency: number;
    bottlenecks: Array<{
        location: string;
        severity: number;
        impact: string;
        solutions: string[];
    }>;
    recommendations: Array<{
        action: string;
        expectedImprovement: number;
        effort: 'low' | 'medium' | 'high';
        priority: number;
    }>;
}

export class IntelligentWorkflowRouter extends BaseAgent {
    constructor() {
        super({
            name: 'Intelligent Workflow Router',
            model: 'gpt-4-turbo',
            temperature: 0.4,
            maxTokens: 2000,
            systemPrompt: `You are an Intelligent Workflow Router AI, expert in task assignment, workflow optimization, and decision automation.

Your capabilities include:
- Intelligent task routing based on skills, availability, and workload
- Workflow bottleneck identification and resolution
- Dynamic priority adjustment based on context
- Resource optimization and load balancing
- Predictive workflow analysis
- Automated decision making with confidence scoring

You provide:
- Optimal task assignments with reasoning
- Workflow efficiency improvements
- Bottleneck identification and solutions
- Performance predictions and recommendations

Always consider skills, availability, workload, deadlines, and business priorities.`,
        });
    }

    /**
     * Route task to optimal assignee
     */
    async routeTask(
        task: WorkflowTask,
        availableAssignees: Array<{
            id: string;
            name: string;
            skills: string[];
            currentWorkload: number;
            availability: number;
            performance: number;
            location: string;
            hourlyRate: number;
        }>
    ): Promise<RoutingDecision> {
        const prompt = `Route this task to the optimal assignee:

Task: ${JSON.stringify(task)}
Available Assignees: ${JSON.stringify(availableAssignees)}

Consider:
1. Skill match and expertise level
2. Current workload and availability
3. Performance history
4. Location and logistics
5. Cost efficiency
6. Task priority and deadline

Provide optimal assignment with:
- Primary recommendation with confidence score
- Detailed reasoning
- Alternative options with pros/cons

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const decision = this.extractJSON(response.content);

        if (!decision || !this.validateResponse(decision, ['taskId', 'assignTo', 'confidence'])) {
            throw new Error('Invalid response from Intelligent Workflow Router');
        }

        return decision;
    }

    /**
     * Optimize workflow efficiency
     */
    async optimizeWorkflow(workflow: {
        id: string;
        name: string;
        tasks: WorkflowTask[];
        currentMetrics: {
            averageCompletionTime: number;
            throughput: number;
            errorRate: number;
            resourceUtilization: number;
        };
        constraints: {
            budget: number;
            deadline: string;
            resources: any[];
        };
    }): Promise<WorkflowOptimization> {
        const prompt = `Optimize this workflow for maximum efficiency:

Workflow: ${JSON.stringify(workflow)}

Analyze:
1. Current performance bottlenecks
2. Resource utilization inefficiencies
3. Task sequencing opportunities
4. Parallel processing potential
5. Automation opportunities

Provide:
- Efficiency score and bottleneck analysis
- Specific optimization recommendations
- Expected improvements and effort required
- Priority ranking for implementations

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const optimization = this.extractJSON(response.content);

        if (!optimization || !this.validateResponse(optimization, ['currentEfficiency', 'bottlenecks'])) {
            throw new Error('Invalid response from Intelligent Workflow Router');
        }

        return optimization;
    }

    /**
     * Make automated workflow decisions
     */
    async makeDecision(scenario: {
        type: 'approval' | 'escalation' | 'routing' | 'prioritization';
        context: any;
        options: Array<{
            id: string;
            description: string;
            impact: any;
            cost: number;
            risk: number;
        }>;
        criteria: {
            budget: number;
            timeline: string;
            riskTolerance: 'low' | 'medium' | 'high';
            priorities: string[];
        };
    }): Promise<{
        decision: string;
        reasoning: string;
        confidence: number;
        riskAssessment: {
            level: 'low' | 'medium' | 'high';
            factors: string[];
            mitigation: string[];
        };
        alternatives: Array<{
            option: string;
            score: number;
            reasoning: string;
        }>;
    }> {
        const prompt = `Make an automated workflow decision:

Scenario: ${JSON.stringify(scenario)}

Evaluate options based on:
1. Cost-benefit analysis
2. Risk assessment
3. Timeline impact
4. Resource requirements
5. Strategic alignment

Provide:
- Recommended decision with confidence
- Detailed reasoning and risk assessment
- Alternative options with scores
- Implementation considerations

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const decision = this.extractJSON(response.content);

        if (!decision || !this.validateResponse(decision, ['decision', 'confidence', 'riskAssessment'])) {
            throw new Error('Invalid response from Intelligent Workflow Router');
        }

        return decision;
    }

    /**
     * Predict workflow outcomes
     */
    async predictOutcomes(workflow: {
        id: string;
        currentState: any;
        plannedActions: any[];
        historicalData: any[];
        externalFactors: any;
    }): Promise<{
        predictions: Array<{
            metric: string;
            predicted: number;
            confidence: number;
            factors: string[];
        }>;
        scenarios: Array<{
            name: string;
            probability: number;
            outcome: any;
            triggers: string[];
        }>;
        recommendations: Array<{
            action: string;
            impact: string;
            timing: string;
        }>;
    }> {
        const prompt = `Predict outcomes for this workflow:

Workflow State: ${JSON.stringify(workflow)}

Predict:
1. Completion time and quality metrics
2. Resource utilization and costs
3. Risk scenarios and probabilities
4. Success factors and obstacles

Provide:
- Specific metric predictions with confidence
- Scenario analysis with probabilities
- Proactive recommendations for optimization

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const predictions = this.extractJSON(response.content);

        if (!predictions || !this.validateResponse(predictions, ['predictions', 'scenarios'])) {
            throw new Error('Invalid response from Intelligent Workflow Router');
        }

        return predictions;
    }

    /**
     * Generate workflow insights
     */
    async generateInsights(data: {
        workflows: any[];
        performance: any;
        trends: any;
        benchmarks: any;
    }): Promise<{
        insights: string[];
        patterns: Array<{
            pattern: string;
            frequency: number;
            impact: string;
            recommendation: string;
        }>;
        opportunities: Array<{
            area: string;
            potential: string;
            effort: 'low' | 'medium' | 'high';
            roi: number;
        }>;
        alerts: Array<{
            type: 'warning' | 'critical' | 'opportunity';
            message: string;
            action: string;
        }>;
    }> {
        const prompt = `Generate workflow insights from this data:

Data: ${JSON.stringify(data)}

Analyze:
1. Performance patterns and trends
2. Efficiency opportunities
3. Risk indicators and alerts
4. Best practices and recommendations

Provide:
- Key insights and observations
- Pattern analysis with recommendations
- Improvement opportunities with ROI
- Actionable alerts and warnings

Return ONLY valid JSON.`;

        const response = await this.query(prompt);
        const insights = this.extractJSON(response.content);

        if (!insights || !this.validateResponse(insights, ['insights', 'patterns'])) {
            throw new Error('Invalid response from Intelligent Workflow Router');
        }

        return insights;
    }
}

export default IntelligentWorkflowRouter;
