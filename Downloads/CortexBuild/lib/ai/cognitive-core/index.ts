/**
 * Cognitive Core - AI Brain of ConstructAI
 * Proactive, analytical, and strategic intelligence system
 */

import { PatternDetector } from './pattern-detector';
import { RootCauseAnalyzer } from './root-cause-analyzer';
import { ActionGenerator } from './action-generator';
import type {
    AgentEvent,
    CognitiveResponse,
    CognitiveConfig,
    HistoricalContext,
    DetectedPattern,
    RootCauseHypothesis,
} from './types';

export class CognitiveCore {
    private patternDetector: PatternDetector;
    private rootCauseAnalyzer: RootCauseAnalyzer;
    private actionGenerator: ActionGenerator;
    private config: CognitiveConfig;

    constructor(config?: Partial<CognitiveConfig>) {
        this.config = {
            patternDetection: {
                minOccurrences: 2,
                timeWindowDays: 7,
                confidenceThreshold: 0.7,
                ...config?.patternDetection,
            },
            rootCauseAnalysis: {
                maxQueries: 5,
                queryTimeout: 30000,
                minConfidence: 0.6,
                ...config?.rootCauseAnalysis,
            },
            actionGeneration: {
                maxActionsPerLevel: 5,
                requireApproval: true,
                autoExecute: ['notification', 'alert'],
                ...config?.actionGeneration,
            },
            notifications: {
                channels: ['email', 'sms', 'in_app'],
                escalationRules: {
                    low: ['in_app'],
                    medium: ['in_app', 'email'],
                    high: ['in_app', 'email', 'sms'],
                    critical: ['in_app', 'email', 'sms', 'urgent'],
                    systemic: ['in_app', 'email', 'sms', 'urgent'],
                },
                ...config?.notifications,
            },
        };

        this.patternDetector = new PatternDetector(this.config.patternDetection);
        this.rootCauseAnalyzer = new RootCauseAnalyzer(this.config.rootCauseAnalysis);
        this.actionGenerator = new ActionGenerator(this.config.actionGeneration);
    }

    /**
     * Process new event from AI agent
     * This is the main entry point for the Cognitive Core
     */
    async processEvent(
        event: AgentEvent,
        historicalContext: HistoricalContext
    ): Promise<CognitiveResponse | null> {
        console.log(`[Cognitive Core] Processing event: ${event.eventType} from ${event.agentType}`);

        // STEP 1: Pattern Detection
        const pattern = await this.patternDetector.analyzeEvent(event, historicalContext);

        if (!pattern) {
            console.log('[Cognitive Core] No significant pattern detected');
            return null; // No pattern detected, no action needed
        }

        console.log(`[Cognitive Core] Pattern detected: ${pattern.patternType} (${pattern.frequency} occurrences, ${Math.round(pattern.confidence * 100)}% confidence)`);

        // Analyze trend
        const trend = this.patternDetector.analyzeTrend(pattern);
        console.log(`[Cognitive Core] Trend: ${trend.direction}, ${trend.prediction}`);

        // STEP 2: Root Cause Analysis
        console.log('[Cognitive Core] Initiating root cause analysis...');
        const hypothesis = await this.rootCauseAnalyzer.analyze(pattern);

        console.log(`[Cognitive Core] Hypothesis generated (${Math.round(hypothesis.confidence * 100)}% confidence):`);
        console.log(hypothesis.hypothesis);

        // STEP 3: Strategic Action Generation
        console.log('[Cognitive Core] Generating strategic action plan...');
        const actionPlan = this.actionGenerator.generateActionPlan(hypothesis);

        console.log(`[Cognitive Core] Action plan generated:`);
        console.log(`- ${actionPlan.immediateActions.length} immediate actions`);
        console.log(`- ${actionPlan.shortTermActions.length} short-term actions`);
        console.log(`- ${actionPlan.strategicActions.length} strategic actions`);

        // STEP 4: Generate Notifications
        const notifications = this.generateNotifications(hypothesis, actionPlan);

        // STEP 5: Create Cognitive Response
        const response: CognitiveResponse = {
            id: `cognitive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            triggerEvent: event,
            detectedPattern: pattern,
            rootCauseAnalysis: {
                queries: [], // Populated by RootCauseAnalyzer
                responses: hypothesis.supportingEvidence,
                hypothesis,
            },
            strategicPlan: actionPlan,
            notifications,
            generatedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        };

        console.log('[Cognitive Core] Cognitive response generated successfully');

        return response;
    }

    /**
     * Generate notifications based on risk level
     */
    private generateNotifications(
        hypothesis: RootCauseHypothesis,
        actionPlan: ReturnType<ActionGenerator['generateActionPlan']>
    ): CognitiveResponse['notifications'] {
        const notifications: CognitiveResponse['notifications'] = [];
        const riskLevel = hypothesis.riskAssessment.level;
        const channels = this.config.notifications.escalationRules[riskLevel];

        // Notification to Project Manager
        notifications.push({
            recipient: 'project_manager',
            channel: channels.includes('urgent') ? 'urgent' : 'email',
            message: this.formatNotificationMessage(hypothesis, actionPlan),
            priority: riskLevel === 'systemic' || riskLevel === 'critical' ? 'critical' : 'high',
        });

        // Notification to HSE Officer (if safety-related)
        if (hypothesis.pattern.patternType === 'safety_violation') {
            notifications.push({
                recipient: 'hse_officer',
                channel: 'urgent',
                message: `URGENT: Recurring safety violations detected. Immediate action required.`,
                priority: 'critical',
            });
        }

        // Notification to Commercial Manager (if commercial-related)
        if (actionPlan.shortTermActions.some(a => a.category === 'commercial')) {
            notifications.push({
                recipient: 'commercial_manager',
                channel: 'email',
                message: `Contract violation notice required for ${hypothesis.pattern.affectedEntities[0].name}`,
                priority: 'high',
            });
        }

        // Notification to Project Director (if systemic risk)
        if (riskLevel === 'systemic') {
            notifications.push({
                recipient: 'project_director',
                channel: 'urgent',
                message: `SYSTEMIC RISK: ${hypothesis.pattern.patternType.toUpperCase()} - Board escalation required`,
                priority: 'critical',
            });
        }

        return notifications;
    }

    /**
     * Format notification message
     */
    private formatNotificationMessage(
        hypothesis: RootCauseHypothesis,
        actionPlan: ReturnType<ActionGenerator['generateActionPlan']>
    ): string {
        const entity = hypothesis.pattern.affectedEntities[0];
        
        let message = `🚨 COGNITIVE CORE ALERT\n\n`;
        message += `Risk Level: ${hypothesis.riskAssessment.level.toUpperCase()}\n`;
        message += `Pattern: ${hypothesis.pattern.patternType.replace(/_/g, ' ').toUpperCase()}\n`;
        message += `Entity: ${entity.name}\n`;
        message += `Confidence: ${Math.round(hypothesis.confidence * 100)}%\n\n`;
        message += `Root Cause:\n${hypothesis.hypothesis}\n\n`;
        message += `Immediate Actions Required:\n`;
        
        actionPlan.immediateActions.forEach((action, i) => {
            message += `${i + 1}. ${action.title}\n`;
        });

        message += `\nView full strategic plan in ConstructAI dashboard.`;

        return message;
    }

    /**
     * Get cognitive insights for dashboard
     */
    async getInsights(projectId: string): Promise<{
        activePatterns: DetectedPattern[];
        activeHypotheses: RootCauseHypothesis[];
        riskSummary: {
            systemic: number;
            critical: number;
            high: number;
            medium: number;
            low: number;
        };
    }> {
        // TODO: Implement database queries
        // For now, return empty state
        return {
            activePatterns: [],
            activeHypotheses: [],
            riskSummary: {
                systemic: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
            },
        };
    }

    /**
     * Simulate event processing (for testing)
     */
    async simulateScenario(): Promise<CognitiveResponse | null> {
        // Simulate the HSE Sentinel scenario from your description
        const events: AgentEvent[] = [
            {
                id: 'event_1',
                agentType: 'hse_sentinel',
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                eventType: 'safety_violation',
                severity: 'critical',
                location: 'Floor 5, North Zone',
                entity: {
                    type: 'subcontractor',
                    id: 'sub_001',
                    name: 'Instal Pro SRL',
                },
                data: {
                    violation: 'Missing edge protection',
                    area: 'Floor 5',
                },
            },
            {
                id: 'event_2',
                agentType: 'hse_sentinel',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                eventType: 'safety_violation',
                severity: 'critical',
                location: 'Floor 5, North Zone',
                entity: {
                    type: 'subcontractor',
                    id: 'sub_001',
                    name: 'Instal Pro SRL',
                },
                data: {
                    violation: 'Missing edge protection',
                    area: 'Floor 5',
                },
            },
            {
                id: 'event_3',
                agentType: 'hse_sentinel',
                timestamp: new Date(), // Today
                eventType: 'safety_violation',
                severity: 'critical',
                location: 'Floor 5, North Zone',
                entity: {
                    type: 'subcontractor',
                    id: 'sub_001',
                    name: 'Instal Pro SRL',
                },
                data: {
                    violation: 'Missing edge protection',
                    area: 'Floor 5',
                },
            },
        ];

        const historicalContext: HistoricalContext = {
            projectId: 'proj_001',
            timeWindow: {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: new Date(),
            },
            events: events.slice(0, 2), // Previous events
            patterns: [],
            previousHypotheses: [],
        };

        return this.processEvent(events[2], historicalContext);
    }
}

// Export types
export * from './types';
export { PatternDetector } from './pattern-detector';
export { RootCauseAnalyzer } from './root-cause-analyzer';
export { ActionGenerator } from './action-generator';

