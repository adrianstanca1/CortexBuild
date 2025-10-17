/**
 * Pattern Detection Engine
 * Detects recurring patterns and anomalies in agent events
 */

import type { AgentEvent, DetectedPattern, RiskLevel, HistoricalContext } from './types';

export class PatternDetector {
    private minOccurrences: number;
    private timeWindowDays: number;
    private confidenceThreshold: number;

    constructor(config: {
        minOccurrences?: number;
        timeWindowDays?: number;
        confidenceThreshold?: number;
    } = {}) {
        this.minOccurrences = config.minOccurrences || 2;
        this.timeWindowDays = config.timeWindowDays || 7;
        this.confidenceThreshold = config.confidenceThreshold || 0.7;
    }

    /**
     * Analyze new event against historical context
     */
    async analyzeEvent(
        event: AgentEvent,
        historicalContext: HistoricalContext
    ): Promise<DetectedPattern | null> {
        // Get relevant historical events
        const relevantEvents = this.getRelevantEvents(event, historicalContext);

        if (relevantEvents.length < this.minOccurrences) {
            return null; // Not enough occurrences to form a pattern
        }

        // Detect pattern type
        const patternType = this.detectPatternType(event, relevantEvents);

        // Calculate confidence
        const confidence = this.calculateConfidence(relevantEvents);

        if (confidence < this.confidenceThreshold) {
            return null; // Confidence too low
        }

        // Assess risk level
        const riskLevel = this.assessRiskLevel(event, relevantEvents);

        // Extract affected entities
        const affectedEntities = this.extractAffectedEntities(relevantEvents);

        return {
            id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            patternType,
            occurrences: relevantEvents,
            frequency: relevantEvents.length,
            timespan: {
                start: new Date(Math.min(...relevantEvents.map(e => e.timestamp.getTime()))),
                end: new Date(Math.max(...relevantEvents.map(e => e.timestamp.getTime()))),
            },
            confidence,
            riskLevel,
            affectedEntities,
        };
    }

    /**
     * Get events relevant to the current event
     */
    private getRelevantEvents(
        event: AgentEvent,
        context: HistoricalContext
    ): AgentEvent[] {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.timeWindowDays);

        return context.events.filter(e => {
            // Must be within time window
            if (e.timestamp < cutoffDate) return false;

            // Must be same agent type
            if (e.agentType !== event.agentType) return false;

            // Must be same event type or similar
            if (e.eventType !== event.eventType) return false;

            // Must involve same entity (if applicable)
            if (event.entity && e.entity) {
                if (e.entity.type === event.entity.type && e.entity.id === event.entity.id) {
                    return true;
                }
            }

            // Must be same location (if applicable)
            if (event.location && e.location === event.location) {
                return true;
            }

            return false;
        });
    }

    /**
     * Detect the type of pattern
     */
    private detectPatternType(
        event: AgentEvent,
        relevantEvents: AgentEvent[]
    ): DetectedPattern['patternType'] {
        // Safety violations
        if (event.agentType === 'hse_sentinel' && event.severity === 'critical') {
            return 'safety_violation';
        }

        // Performance degradation
        if (event.agentType === 'project_controls') {
            const hasDelays = relevantEvents.some(e => 
                e.data.status === 'delayed' || e.data.productivity < 80
            );
            if (hasDelays) return 'performance_degradation';
        }

        // Cost overruns
        if (event.agentType === 'financial_forecaster') {
            const hasCostIssues = relevantEvents.some(e =>
                e.data.variance > 0 || e.data.overbudget === true
            );
            if (hasCostIssues) return 'cost_overrun';
        }

        // Schedule delays
        if (event.data.delayed || event.data.behindSchedule) {
            return 'schedule_delay';
        }

        // Default to recurring issue
        return 'recurring_issue';
    }

    /**
     * Calculate confidence score for pattern
     */
    private calculateConfidence(events: AgentEvent[]): number {
        // Base confidence on frequency
        let confidence = Math.min(events.length / 5, 1.0); // Max at 5 occurrences

        // Increase confidence if events are recent
        const recentEvents = events.filter(e => {
            const daysSince = (Date.now() - e.timestamp.getTime()) / (1000 * 60 * 60 * 24);
            return daysSince <= 3;
        });
        confidence += (recentEvents.length / events.length) * 0.2;

        // Increase confidence if events are consistent
        const severities = events.map(e => e.severity);
        const uniqueSeverities = new Set(severities);
        if (uniqueSeverities.size === 1) {
            confidence += 0.1;
        }

        return Math.min(confidence, 1.0);
    }

    /**
     * Assess risk level based on pattern
     */
    private assessRiskLevel(
        event: AgentEvent,
        relevantEvents: AgentEvent[]
    ): RiskLevel {
        // Critical severity = high risk minimum
        if (event.severity === 'critical') {
            // 3+ critical events = systemic risk
            if (relevantEvents.length >= 3) {
                return 'systemic';
            }
            return 'critical';
        }

        // Warning severity
        if (event.severity === 'warning') {
            // 3+ warnings = high risk
            if (relevantEvents.length >= 3) {
                return 'high';
            }
            // 2 warnings = medium risk
            if (relevantEvents.length >= 2) {
                return 'medium';
            }
        }

        // Safety-related = always elevated
        if (event.agentType === 'hse_sentinel') {
            return relevantEvents.length >= 2 ? 'high' : 'medium';
        }

        return 'low';
    }

    /**
     * Extract all affected entities from events
     */
    private extractAffectedEntities(events: AgentEvent[]): Array<{
        type: string;
        id: string;
        name: string;
    }> {
        const entities = new Map<string, { type: string; id: string; name: string }>();

        events.forEach(event => {
            if (event.entity) {
                const key = `${event.entity.type}_${event.entity.id}`;
                entities.set(key, event.entity);
            }
        });

        return Array.from(entities.values());
    }

    /**
     * Analyze trends in pattern
     */
    analyzeTrend(pattern: DetectedPattern): {
        direction: 'improving' | 'stable' | 'worsening';
        velocity: number;
        prediction: string;
    } {
        const events = pattern.occurrences.sort((a, b) => 
            a.timestamp.getTime() - b.timestamp.getTime()
        );

        // Calculate time between events
        const intervals: number[] = [];
        for (let i = 1; i < events.length; i++) {
            const interval = events[i].timestamp.getTime() - events[i - 1].timestamp.getTime();
            intervals.push(interval);
        }

        // Average interval
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

        // Trend direction
        let direction: 'improving' | 'stable' | 'worsening' = 'stable';
        if (intervals.length >= 2) {
            const recentInterval = intervals[intervals.length - 1];
            if (recentInterval < avgInterval * 0.7) {
                direction = 'worsening'; // Events happening more frequently
            } else if (recentInterval > avgInterval * 1.3) {
                direction = 'improving'; // Events happening less frequently
            }
        }

        // Velocity (events per day)
        const timespan = pattern.timespan.end.getTime() - pattern.timespan.start.getTime();
        const days = timespan / (1000 * 60 * 60 * 24);
        const velocity = pattern.frequency / days;

        // Prediction
        let prediction = '';
        if (direction === 'worsening') {
            const nextEventDays = Math.round(avgInterval / (1000 * 60 * 60 * 24) * 0.7);
            prediction = `Next occurrence predicted in ${nextEventDays} days if trend continues`;
        } else if (direction === 'improving') {
            prediction = 'Pattern appears to be resolving';
        } else {
            const nextEventDays = Math.round(avgInterval / (1000 * 60 * 60 * 24));
            prediction = `Next occurrence predicted in ${nextEventDays} days`;
        }

        return { direction, velocity, prediction };
    }
}

