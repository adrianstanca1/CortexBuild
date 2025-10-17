/**
 * Cognitive Core API - Process Event
 * Endpoint for AI agents to submit events for cognitive analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { CognitiveCore } from '@/lib/ai/cognitive-core';
import type { AgentEvent, HistoricalContext } from '@/lib/ai/cognitive-core';
import { withCompanyContext } from '@/lib/middleware/companyContext';
import { setCompanyContext } from '@/lib/supabase/client';

/**
 * POST /api/cognitive/process-event
 * Submit an event for cognitive analysis
 */
export async function POST(req: NextRequest) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const body = await req.json();

            // Validate event
            if (!body.event || !body.event.agentType || !body.event.eventType) {
                return NextResponse.json(
                    { error: 'Invalid event data' },
                    { status: 400 }
                );
            }

            const event: AgentEvent = {
                ...body.event,
                timestamp: new Date(body.event.timestamp || Date.now()),
            };

            // Get historical context from database
            const historicalContext = await getHistoricalContext(
                context.companyId,
                event.entity?.id || 'unknown'
            );

            // Initialize Cognitive Core
            const cognitiveCore = new CognitiveCore();

            // Process event
            const response = await cognitiveCore.processEvent(event, historicalContext);

            if (!response) {
                return NextResponse.json({
                    message: 'Event processed, no significant pattern detected',
                    pattern: null,
                });
            }

            // Store cognitive response in database
            await storeCognitiveResponse(context.companyId, response);

            // Send notifications
            await sendNotifications(response.notifications);

            return NextResponse.json({
                message: 'Cognitive analysis complete',
                response: {
                    id: response.id,
                    riskLevel: response.rootCauseAnalysis.hypothesis.riskAssessment.level,
                    patternType: response.detectedPattern.patternType,
                    confidence: response.rootCauseAnalysis.hypothesis.confidence,
                    actionsGenerated: {
                        immediate: response.strategicPlan.immediateActions.length,
                        shortTerm: response.strategicPlan.shortTermActions.length,
                        strategic: response.strategicPlan.strategicActions.length,
                    },
                },
            });

        } catch (error) {
            console.error('Cognitive process error:', error);
            return NextResponse.json(
                { error: 'Failed to process event' },
                { status: 500 }
            );
        }
    });
}

/**
 * Get historical context for pattern detection
 */
async function getHistoricalContext(
    companyId: string,
    entityId: string
): Promise<HistoricalContext> {
    const client = await setCompanyContext(companyId);

    // Get events from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: events } = await client
        .from('agent_events')
        .select('*')
        .eq('company_id', companyId)
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: false });

    const { data: patterns } = await client
        .from('detected_patterns')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'active');

    const { data: hypotheses } = await client
        .from('root_cause_hypotheses')
        .select('*')
        .eq('company_id', companyId)
        .gte('generated_at', thirtyDaysAgo.toISOString());

    return {
        projectId: entityId,
        timeWindow: {
            start: thirtyDaysAgo,
            end: new Date(),
        },
        events: (events || []).map(e => ({
            ...e,
            timestamp: new Date(e.timestamp),
        })),
        patterns: patterns || [],
        previousHypotheses: hypotheses || [],
    };
}

/**
 * Store cognitive response in database
 */
async function storeCognitiveResponse(
    companyId: string,
    response: any
): Promise<void> {
    const client = await setCompanyContext(companyId);

    // Store pattern
    await client.from('detected_patterns').insert({
        company_id: companyId,
        pattern_type: response.detectedPattern.patternType,
        frequency: response.detectedPattern.frequency,
        confidence: response.detectedPattern.confidence,
        risk_level: response.detectedPattern.riskLevel,
        data: response.detectedPattern,
        status: 'active',
    });

    // Store hypothesis
    await client.from('root_cause_hypotheses').insert({
        company_id: companyId,
        hypothesis: response.rootCauseAnalysis.hypothesis.hypothesis,
        confidence: response.rootCauseAnalysis.hypothesis.confidence,
        risk_level: response.rootCauseAnalysis.hypothesis.riskAssessment.level,
        data: response.rootCauseAnalysis.hypothesis,
    });

    // Store actions
    const allActions = [
        ...response.strategicPlan.immediateActions,
        ...response.strategicPlan.shortTermActions,
        ...response.strategicPlan.strategicActions,
    ];

    for (const action of allActions) {
        await client.from('strategic_actions').insert({
            company_id: companyId,
            priority: action.priority,
            category: action.category,
            title: action.title,
            description: action.description,
            status: 'pending',
            data: action,
        });
    }
}

/**
 * Send notifications
 */
async function sendNotifications(notifications: any[]): Promise<void> {
    // TODO: Implement actual notification sending
    // For now, just log
    notifications.forEach(notification => {
        console.log(`[Notification] ${notification.channel} to ${notification.recipient}:`);
        console.log(notification.message);
    });
}

