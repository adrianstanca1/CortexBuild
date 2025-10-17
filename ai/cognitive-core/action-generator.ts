/**
 * Strategic Action Generator
 * Generates multi-level action plans based on root cause analysis
 */

import type {
    RootCauseHypothesis,
    StrategicAction,
    ActionPriority,
} from './types';

export class ActionGenerator {
    private maxActionsPerLevel: number;

    constructor(config: { maxActionsPerLevel?: number } = {}) {
        this.maxActionsPerLevel = config.maxActionsPerLevel || 5;
    }

    /**
     * Generate complete strategic action plan
     */
    generateActionPlan(hypothesis: RootCauseHypothesis): {
        summary: string;
        immediateActions: StrategicAction[];
        shortTermActions: StrategicAction[];
        strategicActions: StrategicAction[];
    } {
        const summary = this.generateSummary(hypothesis);
        const immediateActions = this.generateImmediateActions(hypothesis);
        const shortTermActions = this.generateShortTermActions(hypothesis);
        const strategicActions = this.generateStrategicActions(hypothesis);

        return {
            summary,
            immediateActions,
            shortTermActions,
            strategicActions,
        };
    }

    /**
     * Generate executive summary
     */
    private generateSummary(hypothesis: RootCauseHypothesis): string {
        const entity = hypothesis.pattern.affectedEntities[0];
        const riskLevel = hypothesis.riskAssessment.level.toUpperCase();
        
        let summary = `**${riskLevel} RISK DETECTED**: ${hypothesis.pattern.patternType.replace(/_/g, ' ').toUpperCase()}\n\n`;
        summary += `**Entity**: ${entity.name}\n`;
        summary += `**Pattern**: ${hypothesis.pattern.frequency} incidents in ${this.getDaysBetween(hypothesis.pattern.timespan.start, hypothesis.pattern.timespan.end)} days\n`;
        summary += `**Confidence**: ${Math.round(hypothesis.confidence * 100)}%\n\n`;
        summary += `**Root Cause Analysis**:\n${hypothesis.hypothesis}\n\n`;
        summary += `**Impact Areas**: ${hypothesis.riskAssessment.impactAreas.join(', ')}\n\n`;
        
        if (hypothesis.riskAssessment.financialImpact) {
            const fi = hypothesis.riskAssessment.financialImpact;
            summary += `**Financial Impact**: ${fi.currency} ${fi.min.toLocaleString()} - ${fi.max.toLocaleString()}\n\n`;
        }

        summary += `**Recommended Actions**: ${this.getActionCount(hypothesis)} actions across 3 priority levels`;

        return summary;
    }

    /**
     * Generate immediate actions (safety/critical)
     */
    private generateImmediateActions(hypothesis: RootCauseHypothesis): StrategicAction[] {
        const actions: StrategicAction[] = [];
        const entity = hypothesis.pattern.affectedEntities[0];

        // Safety violation immediate actions
        if (hypothesis.pattern.patternType === 'safety_violation') {
            actions.push({
                id: `action_immediate_${Date.now()}_1`,
                priority: 'immediate',
                category: 'safety',
                title: 'STOP WORK ORDER',
                description: `Immediately halt all work by ${entity.name} until safety compliance is verified`,
                steps: [
                    {
                        order: 1,
                        action: `Issue Stop Work Order to ${entity.name}`,
                        assignedTo: 'Site Manager',
                        deadline: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                    },
                    {
                        order: 2,
                        action: 'Deploy HSE Sentinel AI for immediate site verification',
                        assignedTo: 'HSE Officer',
                        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
                    },
                    {
                        order: 3,
                        action: 'Photograph and document all safety violations',
                        assignedTo: 'HSE Officer',
                        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
                    },
                    {
                        order: 4,
                        action: 'Verify installation of all required safety measures',
                        assignedTo: 'HSE Officer',
                        deadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
                        dependencies: ['action_immediate_1_step_2'],
                    },
                ],
                expectedOutcome: 'Work area secured, safety violations corrected, zero risk of accident',
                risks: ['Work stoppage may cause schedule delays', 'Subcontractor may dispute order'],
                estimatedCost: 0,
                estimatedDuration: '4 hours',
            });

            actions.push({
                id: `action_immediate_${Date.now()}_2`,
                priority: 'immediate',
                category: 'safety',
                title: 'Emergency Safety Briefing',
                description: `Conduct mandatory safety briefing for all ${entity.name} personnel`,
                steps: [
                    {
                        order: 1,
                        action: 'Assemble all subcontractor personnel',
                        assignedTo: 'Site Manager',
                        deadline: new Date(Date.now() + 3 * 60 * 60 * 1000),
                    },
                    {
                        order: 2,
                        action: 'Review safety violations and consequences',
                        assignedTo: 'HSE Officer',
                        deadline: new Date(Date.now() + 3 * 60 * 60 * 1000),
                    },
                    {
                        order: 3,
                        action: 'Obtain signed acknowledgment from all workers',
                        assignedTo: 'HSE Officer',
                        deadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
                    },
                ],
                expectedOutcome: 'All personnel aware of safety requirements and consequences',
                risks: [],
                estimatedDuration: '2 hours',
            });
        }

        return actions.slice(0, this.maxActionsPerLevel);
    }

    /**
     * Generate short-term actions (commercial/operational)
     */
    private generateShortTermActions(hypothesis: RootCauseHypothesis): StrategicAction[] {
        const actions: StrategicAction[] = [];
        const entity = hypothesis.pattern.affectedEntities[0];

        if (hypothesis.pattern.patternType === 'safety_violation') {
            actions.push({
                id: `action_short_${Date.now()}_1`,
                priority: 'short_term',
                category: 'commercial',
                title: 'Contract Violation Notice',
                description: `Issue formal notice of contract breach to ${entity.name}`,
                steps: [
                    {
                        order: 1,
                        action: 'Commercial Guardian AI to draft violation notice',
                        assignedTo: 'Commercial Manager',
                        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                    },
                    {
                        order: 2,
                        action: 'Legal review of notice',
                        assignedTo: 'Legal Team',
                        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
                    },
                    {
                        order: 3,
                        action: 'Serve notice to subcontractor management',
                        assignedTo: 'Commercial Manager',
                        deadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
                    },
                ],
                expectedOutcome: 'Formal documentation of violations, legal protection established',
                risks: ['May damage relationship', 'Potential dispute'],
                estimatedDuration: '3 days',
            });

            actions.push({
                id: `action_short_${Date.now()}_2`,
                priority: 'short_term',
                category: 'operational',
                title: 'Corrective Action Meeting',
                description: `Emergency meeting with ${entity.name} management to develop corrective action plan`,
                steps: [
                    {
                        order: 1,
                        action: 'Schedule meeting with subcontractor senior management',
                        assignedTo: 'Project Manager',
                        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    },
                    {
                        order: 2,
                        action: 'Present pattern analysis and root cause findings',
                        assignedTo: 'Project Manager',
                        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
                    },
                    {
                        order: 3,
                        action: 'Develop and agree corrective action plan',
                        assignedTo: 'Project Manager',
                        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
                    },
                    {
                        order: 4,
                        action: 'Establish monitoring and reporting requirements',
                        assignedTo: 'Project Manager',
                        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
                    },
                ],
                expectedOutcome: 'Agreed corrective action plan with clear accountability',
                risks: ['Subcontractor may not commit to plan'],
                estimatedDuration: '2 days',
            });
        }

        return actions.slice(0, this.maxActionsPerLevel);
    }

    /**
     * Generate strategic actions (long-term/preventive)
     */
    private generateStrategicActions(hypothesis: RootCauseHypothesis): StrategicAction[] {
        const actions: StrategicAction[] = [];
        const entity = hypothesis.pattern.affectedEntities[0];

        actions.push({
            id: `action_strategic_${Date.now()}_1`,
            priority: 'strategic',
            category: 'strategic',
            title: 'Risk Register Update',
            description: 'Update project risk register with new insights',
            steps: [
                {
                    order: 1,
                    action: `Escalate risk: "${hypothesis.pattern.patternType}" to ${hypothesis.riskAssessment.level} level`,
                    assignedTo: 'Risk Manager',
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
                {
                    order: 2,
                    action: 'Update risk mitigation strategies',
                    assignedTo: 'Risk Manager',
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
                {
                    order: 3,
                    action: 'Present to project board',
                    assignedTo: 'Project Director',
                    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                },
            ],
            expectedOutcome: 'Risk register reflects current project reality',
            risks: [],
            estimatedDuration: '2 weeks',
        });

        actions.push({
            id: `action_strategic_${Date.now()}_2`,
            priority: 'strategic',
            category: 'strategic',
            title: 'Contingency Planning',
            description: `Develop contingency plan for potential ${entity.name} contract termination`,
            steps: [
                {
                    order: 1,
                    action: 'Project Controls AI to model impact of contract termination',
                    assignedTo: 'Planning Manager',
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
                {
                    order: 2,
                    action: 'Identify alternative subcontractors',
                    assignedTo: 'Procurement Manager',
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
                {
                    order: 3,
                    action: 'Estimate cost and schedule impact of transition',
                    assignedTo: 'Commercial Manager',
                    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                },
                {
                    order: 4,
                    action: 'Prepare contingency budget request',
                    assignedTo: 'Project Manager',
                    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                },
            ],
            expectedOutcome: 'Ready-to-execute contingency plan if needed',
            risks: ['May signal lack of confidence to client'],
            estimatedCost: 50000,
            estimatedDuration: '2 weeks',
        });

        return actions.slice(0, this.maxActionsPerLevel);
    }

    /**
     * Get total action count
     */
    private getActionCount(hypothesis: RootCauseHypothesis): number {
        // Estimate based on risk level
        const baseActions = 6; // 2 immediate, 2 short-term, 2 strategic
        
        if (hypothesis.riskAssessment.level === 'systemic' || hypothesis.riskAssessment.level === 'critical') {
            return baseActions + 3;
        }
        
        return baseActions;
    }

    /**
     * Helper: Get days between dates
     */
    private getDaysBetween(start: Date, end: Date): number {
        const diff = end.getTime() - start.getTime();
        return Math.round(diff / (1000 * 60 * 60 * 24));
    }
}

