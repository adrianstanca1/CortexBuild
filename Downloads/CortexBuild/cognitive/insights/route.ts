/**
 * Cognitive Insights API
 * Get AI insights for dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCompanyContext } from '@/lib/middleware/companyContext';
import { setCompanyContext } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const { searchParams } = req.nextUrl;
            const projectId = searchParams.get('projectId');

            const client = await setCompanyContext(context.companyId);

            // Get active patterns
            let patternsQuery = client
                .from('detected_patterns')
                .select('*')
                .eq('company_id', context.companyId)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(10);

            const { data: patterns, error: patternsError } = await patternsQuery;

            if (patternsError) {
                console.error('Failed to fetch patterns:', patternsError);
            }

            // Get active hypotheses
            const { data: hypotheses, error: hypothesesError } = await client
                .from('root_cause_hypotheses')
                .select('*')
                .eq('company_id', context.companyId)
                .order('generated_at', { ascending: false })
                .limit(10);

            if (hypothesesError) {
                console.error('Failed to fetch hypotheses:', hypothesesError);
            }

            // Calculate risk summary
            const riskSummary = {
                systemic: (patterns || []).filter((p: any) => p.risk_level === 'systemic').length,
                critical: (patterns || []).filter((p: any) => p.risk_level === 'critical').length,
                high: (patterns || []).filter((p: any) => p.risk_level === 'high').length,
                medium: (patterns || []).filter((p: any) => p.risk_level === 'medium').length,
                low: (patterns || []).filter((p: any) => p.risk_level === 'low').length,
            };

            // Get strategic actions
            const { data: actions, error: actionsError } = await client
                .from('strategic_actions')
                .select('*')
                .eq('company_id', context.companyId)
                .in('status', ['pending', 'in_progress'])
                .order('priority', { ascending: true })
                .limit(20);

            if (actionsError) {
                console.error('Failed to fetch actions:', actionsError);
            }

            // Group actions by priority
            const actionsByPriority = {
                immediate: (actions || []).filter((a: any) => a.priority === 'immediate'),
                short_term: (actions || []).filter((a: any) => a.priority === 'short_term'),
                strategic: (actions || []).filter((a: any) => a.priority === 'strategic'),
            };

            return NextResponse.json({
                data: {
                    activePatterns: patterns || [],
                    activeHypotheses: hypotheses || [],
                    riskSummary,
                    actions: actionsByPriority,
                    summary: {
                        totalPatterns: (patterns || []).length,
                        totalHypotheses: (hypotheses || []).length,
                        totalActions: (actions || []).length,
                        highestRisk: riskSummary.systemic > 0 ? 'systemic' :
                                     riskSummary.critical > 0 ? 'critical' :
                                     riskSummary.high > 0 ? 'high' :
                                     riskSummary.medium > 0 ? 'medium' : 'low',
                    },
                },
            });
        } catch (error) {
            console.error('Cognitive insights error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch insights' },
                { status: 500 }
            );
        }
    });
}

