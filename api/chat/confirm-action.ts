/**
 * Chat Action Confirmation API
 * Handles confirmation and execution of pending actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCompanyContext } from '@/lib/middleware/companyContext';
import { setCompanyContext } from '@/lib/supabase/client';
import { ChatTools } from '@/lib/ai/chat-tools';
import type { ChatContext } from '@/lib/ai/gemini-client';

export async function POST(req: NextRequest) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const body = await req.json();
            const { actionId, confirmationToken, confirmed } = body;

            if (!actionId) {
                return NextResponse.json(
                    { error: 'Action ID is required' },
                    { status: 400 }
                );
            }

            const client = await setCompanyContext(context.companyId);

            // Get pending action
            const { data: action, error: actionError } = await client
                .from('chat_actions')
                .select('*')
                .eq('id', actionId)
                .eq('company_id', context.companyId)
                .eq('status', 'pending')
                .single();

            if (actionError || !action) {
                return NextResponse.json(
                    { error: 'Action not found or already processed' },
                    { status: 404 }
                );
            }

            // Validate confirmation token
            if (action.confirmation_token && action.confirmation_token !== confirmationToken) {
                return NextResponse.json(
                    { error: 'Invalid confirmation token' },
                    { status: 403 }
                );
            }

            // If user cancelled
            if (!confirmed) {
                await client
                    .from('chat_actions')
                    .update({ status: 'cancelled' })
                    .eq('id', actionId);

                return NextResponse.json({
                    success: true,
                    message: 'Action cancelled',
                });
            }

            // Get user details for context
            const { data: userData } = await client
                .from('users')
                .select('name, role, company:companies(name)')
                .eq('id', context.userId)
                .single();

            // Build chat context
            const chatContext: ChatContext = {
                userId: context.userId,
                companyId: context.companyId,
                userName: userData?.name || 'Unknown',
                companyName: userData?.company?.name || 'Unknown Company',
                userRole: userData?.role || 'user',
            };

            // Execute action
            const tools = new ChatTools(chatContext);
            const result = await tools.executeTool(
                action.action_type,
                { ...action.params, confirmed: true }
            );

            // Update action status
            await client
                .from('chat_actions')
                .update({
                    status: result.success ? 'executed' : 'failed',
                    result: result.data || { error: result.error },
                    executed_at: new Date().toISOString(),
                })
                .eq('id', actionId);

            // Log to audit
            await client.from('audit_logs').insert({
                company_id: context.companyId,
                user_id: context.userId,
                action: `chat_action_${result.success ? 'executed' : 'failed'}`,
                entity_type: 'chat_action',
                entity_id: actionId,
                new_values: {
                    action_type: action.action_type,
                    result: result.success,
                },
            });

            return NextResponse.json({
                success: result.success,
                data: result.data,
                message: result.message,
                error: result.error,
            });
        } catch (error: any) {
            console.error('Confirm action error:', error);
            return NextResponse.json(
                { error: error.message || 'Failed to confirm action' },
                { status: 500 }
            );
        }
    });
}

