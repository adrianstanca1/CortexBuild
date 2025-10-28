/**
 * Root Cause Analyzer
 * Performs cross-agent queries to determine root causes
 */

import type {
    DetectedPattern,
    CrossAgentQuery,
    CrossAgentResponse,
    RootCauseHypothesis,
    AgentType,
    RiskLevel
} from './types';

export class RootCauseAnalyzer {
    private maxQueries: number;
    private queryTimeout: number;
    private minConfidence: number;

    constructor(config: {
        maxQueries?: number;
        queryTimeout?: number;
        minConfidence?: number;
    } = {}) {
        this.maxQueries = config.maxQueries || 5;
        this.queryTimeout = config.queryTimeout || 30000; // 30 seconds
        this.minConfidence = config.minConfidence || 0.6;
    }

    /**
     * Analyze root cause of detected pattern
     */
    async analyze(pattern: DetectedPattern): Promise<RootCauseHypothesis> {
        // Generate cross-agent queries based on pattern
        const queries = this.generateQueries(pattern);

        // Execute queries in parallel
        const responses = await this.executeQueries(queries);

        // Synthesize hypothesis from responses
        const hypothesis = this.synthesizeHypothesis(pattern, responses);

        // Assess risk
        const riskAssessment = this.assessRisk(pattern, responses);

        return {
            id: `hypothesis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            pattern,
            hypothesis,
            supportingEvidence: responses,
            confidence: this.calculateHypothesisConfidence(responses),
            riskAssessment,
            generatedAt: new Date(),
        };
    }

    /**
     * Generate relevant queries based on pattern type
     */
    private generateQueries(pattern: DetectedPattern): CrossAgentQuery[] {
        const queries: CrossAgentQuery[] = [];
        const entity = pattern.affectedEntities[0]; // Primary affected entity

        // Safety violation pattern
        if (pattern.patternType === 'safety_violation') {
            // Query project controls about schedule pressure
            queries.push({
                targetAgent: 'project_controls',
                question: `What is the current status of activities for ${entity.name}? Are there any delays or productivity issues?`,
                context: {
                    entityType: entity.type,
                    entityId: entity.id,
                    patternType: pattern.patternType,
                },
                priority: 'urgent',
            });

            // Query financial forecaster about contract structure
            queries.push({
                targetAgent: 'financial_forecaster',
                question: `What is the contract structure for ${entity.name}? Are there financial penalties for delays?`,
                context: {
                    entityType: entity.type,
                    entityId: entity.id,
                },
                priority: 'urgent',
            });

            // Query commercial guardian about contract compliance
            queries.push({
                targetAgent: 'commercial_guardian',
                question: `Has ${entity.name} had previous contract violations or performance issues?`,
                context: {
                    entityType: entity.type,
                    entityId: entity.id,
                },
                priority: 'normal',
            });
        }

        // Performance degradation pattern
        if (pattern.patternType === 'performance_degradation') {
            queries.push({
                targetAgent: 'financial_forecaster',
                question: `What is the budget status and cash flow for ${entity.name}?`,
                context: {
                    entityType: entity.type,
                    entityId: entity.id,
                },
                priority: 'urgent',
            });

            queries.push({
                targetAgent: 'quality_inspector',
                question: `Are there quality issues affecting ${entity.name}'s work?`,
                context: {
                    entityType: entity.type,
                    entityId: entity.id,
                },
                priority: 'normal',
            });
        }

        // Cost overrun pattern
        if (pattern.patternType === 'cost_overrun') {
            queries.push({
                targetAgent: 'project_controls',
                question: `What are the scope changes and variations for ${entity.name}?`,
                context: {
                    entityType: entity.type,
                    entityId: entity.id,
                },
                priority: 'urgent',
            });

            queries.push({
                targetAgent: 'commercial_guardian',
                question: `What claims or disputes are active for ${entity.name}?`,
                context: {
                    entityType: entity.type,
                    entityId: entity.id,
                },
                priority: 'normal',
            });
        }

        return queries.slice(0, this.maxQueries);
    }

    /**
     * Execute cross-agent queries
     * In production, this would call actual AI agents
     */
    private async executeQueries(queries: CrossAgentQuery[]): Promise<CrossAgentResponse[]> {
        const responses: CrossAgentResponse[] = [];

        for (const query of queries) {
            try {
                // Simulate agent response (in production, call actual AI agent)
                const response = await this.queryAgent(query);
                responses.push(response);
            } catch (error) {
                console.error(`Failed to query ${query.targetAgent}:`, error);
            }
        }

        return responses;
    }

    /**
     * Query a specific agent (simulated for now)
     */
    private async queryAgent(query: CrossAgentQuery): Promise<CrossAgentResponse> {
        // TODO: Implement actual AI agent calls
        // For now, return simulated response based on agent type

        const simulatedResponses: Record<AgentType, any> = {
            project_controls: {
                answer: 'Activity is 3 days behind schedule. Productivity is 20% below planned.',
                data: {
                    status: 'delayed',
                    delayDays: 3,
                    productivity: 80,
                    plannedProductivity: 100,
                },
                confidence: 0.9,
            },
            financial_forecaster: {
                answer: 'Contract is fixed-price with £1,000/day delay penalties.',
                data: {
                    contractType: 'fixed_price',
                    penaltyPerDay: 1000,
                    currency: 'GBP',
                    totalPenaltyRisk: 3000,
                },
                confidence: 0.95,
            },
            commercial_guardian: {
                answer: 'No previous violations recorded. First-time issue.',
                data: {
                    previousViolations: 0,
                    contractCompliance: 'good',
                },
                confidence: 0.85,
            },
            hse_sentinel: {
                answer: 'Safety compliance historically good until this week.',
                data: {
                    complianceScore: 85,
                    recentIncidents: 3,
                },
                confidence: 0.9,
            },
            quality_inspector: {
                answer: 'No quality issues detected in recent inspections.',
                data: {
                    qualityScore: 92,
                    defects: 0,
                },
                confidence: 0.88,
            },
        };

        return {
            agentType: query.targetAgent,
            question: query.question,
            ...simulatedResponses[query.targetAgent],
            timestamp: new Date(),
        };
    }

    /**
     * Synthesize hypothesis from agent responses
     */
    private synthesizeHypothesis(
        pattern: DetectedPattern,
        responses: CrossAgentResponse[]
    ): string {
        // Extract key insights from responses
        const insights: string[] = [];

        responses.forEach(response => {
            if (response.agentType === 'project_controls' && response.data.delayDays > 0) {
                insights.push(`${response.data.delayDays} days behind schedule`);
                insights.push(`productivity ${response.data.productivity}% of planned`);
            }

            if (response.agentType === 'financial_forecaster' && response.data.penaltyPerDay) {
                insights.push(`facing £${response.data.penaltyPerDay}/day penalties`);
                insights.push(`total penalty risk: £${response.data.totalPenaltyRisk}`);
            }
        });

        // Build hypothesis based on pattern type
        const entity = pattern.affectedEntities[0];
        let hypothesis = '';

        if (pattern.patternType === 'safety_violation') {
            hypothesis = `${entity.name} is exhibiting recurring safety violations (${pattern.frequency} incidents in ${this.getDaysBetween(pattern.timespan.start, pattern.timespan.end)} days). `;
            
            if (insights.length > 0) {
                hypothesis += `Analysis reveals the entity is ${insights.join(', ')}. `;
            }

            hypothesis += `This pattern suggests the subcontractor is under financial pressure and attempting to "cut corners" by skipping safety procedures to recover lost time. `;
            hypothesis += `This behavior exposes the project to imminent risk of serious accident and potential legal consequences.`;
        }

        if (pattern.patternType === 'performance_degradation') {
            hypothesis = `${entity.name} shows declining performance with ${insights.join(', ')}. `;
            hypothesis += `Root cause likely involves resource constraints, skill gaps, or external pressures affecting work quality.`;
        }

        if (pattern.patternType === 'cost_overrun') {
            hypothesis = `${entity.name} experiencing cost overruns. ${insights.join(', ')}. `;
            hypothesis += `Likely causes include scope creep, inefficient processes, or unforeseen complications.`;
        }

        return hypothesis;
    }

    /**
     * Calculate confidence in hypothesis
     */
    private calculateHypothesisConfidence(responses: CrossAgentResponse[]): number {
        if (responses.length === 0) return 0;

        const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
        
        // Boost confidence if multiple agents agree
        const agreementBonus = Math.min(responses.length / 5, 0.2);
        
        return Math.min(avgConfidence + agreementBonus, 1.0);
    }

    /**
     * Assess risk based on hypothesis
     */
    private assessRisk(
        pattern: DetectedPattern,
        responses: CrossAgentResponse[]
    ): RootCauseHypothesis['riskAssessment'] {
        const impactAreas: string[] = [];
        const potentialConsequences: string[] = [];
        let financialImpact: { min: number; max: number; currency: string } | undefined;

        // Safety risks
        if (pattern.patternType === 'safety_violation') {
            impactAreas.push('Worker Safety', 'Legal Compliance', 'Project Reputation');
            potentialConsequences.push(
                'Serious injury or fatality',
                'HSE enforcement action',
                'Project shutdown',
                'Legal liability',
                'Reputational damage'
            );
        }

        // Financial risks
        const financialResponse = responses.find(r => r.agentType === 'financial_forecaster');
        if (financialResponse?.data.totalPenaltyRisk) {
            impactAreas.push('Project Budget', 'Cash Flow');
            financialImpact = {
                min: financialResponse.data.totalPenaltyRisk,
                max: financialResponse.data.totalPenaltyRisk * 2,
                currency: financialResponse.data.currency || 'GBP',
            };
            potentialConsequences.push(`Financial penalties up to £${financialImpact.max}`);
        }

        // Schedule risks
        const scheduleResponse = responses.find(r => r.agentType === 'project_controls');
        if (scheduleResponse?.data.delayDays > 0) {
            impactAreas.push('Project Schedule', 'Milestone Delivery');
            potentialConsequences.push(
                `${scheduleResponse.data.delayDays}+ days delay`,
                'Cascade effect on dependent activities',
                'Client dissatisfaction'
            );
        }

        return {
            level: pattern.riskLevel,
            impactAreas,
            potentialConsequences,
            financialImpact,
        };
    }

    /**
     * Helper: Get days between dates
     */
    private getDaysBetween(start: Date, end: Date): number {
        const diff = end.getTime() - start.getTime();
        return Math.round(diff / (1000 * 60 * 60 * 24));
    }
}

