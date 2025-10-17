/**
 * Chat API Endpoint
 * Handles messages to/from the Gemini AI chatbot
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCompanyContext } from '@/lib/middleware/companyContext';
import { setCompanyContext, getUserCompanyId } from '@/lib/supabase/client';
import { getGeminiChatbot, type ChatContext } from '@/lib/ai/gemini-client';
import { ChatTools } from '@/lib/ai/chat-tools';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const body = await req.json();
            const { message, sessionId, currentPage } = body;

            if (!message || typeof message !== 'string') {
                return NextResponse.json(
                    { error: 'Message is required' },
                    { status: 400 }
                );
            }

            const client = await setCompanyContext(context.companyId);

            // Get user details
            const { data: userData } = await client
                .from('users')
                .select('name, role, company:companies(name)')
                .eq('id', context.userId)
                .single();

            if (!userData) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            // Get available data for context
            const [projectsData, clientsData, invoicesData] = await Promise.all([
                client.from('projects').select('id, name, status, priority, progress').eq('company_id', context.companyId).limit(10),
                client.from('clients').select('id, name, status').eq('company_id', context.companyId).limit(10),
                client.from('invoices').select('id, invoice_number, status, amount').eq('company_id', context.companyId).limit(10),
            ]);

            // Build chat context
            const chatContext: ChatContext = {
                userId: context.userId,
                companyId: context.companyId,
                userName: userData.name,
                companyName: userData.company?.name || 'Unknown Company',
                userRole: userData.role,
                currentPage,
                availableData: {
                    projects: projectsData.data || [],
                    clients: clientsData.data || [],
                    invoices: invoicesData.data || [],
                },
            };

            // Get or create session ID
            const activeSessionId = sessionId || uuidv4();

            // Get chat history for this session
            const { data: history } = await client
                .from('chat_history')
                .select('role, content, created_at')
                .eq('session_id', activeSessionId)
                .eq('company_id', context.companyId)
                .order('created_at', { ascending: true })
                .limit(20);

            // Initialize chatbot with context and history
            const chatbot = getGeminiChatbot();
            await chatbot.initializeChat(chatContext, history || []);

            // Send message and get response
            const response = await chatbot.sendMessage(message, chatContext);

            // Execute tool calls if any
            let toolResults: any[] = [];
            let pendingConfirmations: any[] = [];

            if (response.toolCalls && response.toolCalls.length > 0) {
                const tools = new ChatTools(chatContext);

                for (const toolCall of response.toolCalls) {
                    const result = await tools.executeTool(toolCall.name, toolCall.parameters);

                    if (result.requiresConfirmation) {
                        // Save pending action for confirmation
                        const { data: actionData } = await client.from('chat_actions').insert({
                            company_id: context.companyId,
                            user_id: context.userId,
                            session_id: activeSessionId,
                            action_type: toolCall.name,
                            params: toolCall.parameters,
                            status: 'pending',
                            confirmation_token: result.confirmationToken,
                        }).select().single();

                        pendingConfirmations.push({
                            actionId: actionData?.id,
                            tool: toolCall.name,
                            message: result.message,
                            warning: result.warning,
                            confirmationToken: result.confirmationToken,
                        });
                    } else {
                        // Execute immediately
                        toolResults.push({
                            tool: toolCall.name,
                            ...result,
                        });

                        // Log executed action
                        if (result.success) {
                            await client.from('chat_actions').insert({
                                company_id: context.companyId,
                                user_id: context.userId,
                                session_id: activeSessionId,
                                action_type: toolCall.name,
                                params: toolCall.parameters,
                                result: result.data,
                                status: 'executed',
                                executed_at: new Date().toISOString(),
                            });
                        }
                    }
                }
            }

            // Save user message to history
            await client.from('chat_history').insert({
                company_id: context.companyId,
                user_id: context.userId,
                session_id: activeSessionId,
                role: 'user',
                content: message,
                metadata: { currentPage },
            });

            // Save assistant response to history
            await client.from('chat_history').insert({
                company_id: context.companyId,
                user_id: context.userId,
                session_id: activeSessionId,
                role: 'assistant',
                content: response.message,
                metadata: {
                    toolCalls: response.toolCalls,
                    toolResults,
                },
            });

            // Log to audit
            await client.from('audit_logs').insert({
                company_id: context.companyId,
                user_id: context.userId,
                action: 'chat_message',
                entity_type: 'chat',
                entity_id: activeSessionId,
                new_values: {
                    message: message.substring(0, 100),
                    hasToolCalls: (response.toolCalls?.length || 0) > 0,
                },
            });

            return NextResponse.json({
                success: true,
                data: {
                    message: response.message,
                    sessionId: activeSessionId,
                    toolResults,
                    pendingConfirmations,
                    requiresConfirmation: pendingConfirmations.length > 0,
                    metadata: response.metadata,
                },
            });
        } catch (error: any) {
            console.error('Chat API error:', error);
            return NextResponse.json(
                { error: error.message || 'Failed to process message' },
                { status: 500 }
            );
        }
    });
}

/**
 * Get chat history for a session
 */
export async function GET(req: NextRequest) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const { searchParams } = req.nextUrl;
            const sessionId = searchParams.get('sessionId');

            if (!sessionId) {
                return NextResponse.json(
                    { error: 'Session ID is required' },
                    { status: 400 }
                );
            }

            const client = await setCompanyContext(context.companyId);

            const { data, error } = await client
                .from('chat_history')
                .select('*')
                .eq('session_id', sessionId)
                .eq('company_id', context.companyId)
                .order('created_at', { ascending: true });

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                data,
            });
        } catch (error: any) {
            console.error('Get chat history error:', error);
            return NextResponse.json(
                { error: error.message || 'Failed to get chat history' },
                { status: 500 }
            );
        }
    });
}

/**
 * Delete chat session
 */
export async function DELETE(req: NextRequest) {
    return withCompanyContext(req, async (req, context) => {
        try {
            const { searchParams } = req.nextUrl;
            const sessionId = searchParams.get('sessionId');

            if (!sessionId) {
                return NextResponse.json(
                    { error: 'Session ID is required' },
                    { status: 400 }
                );
            }

            const client = await setCompanyContext(context.companyId);

            const { error } = await client
                .from('chat_history')
                .delete()
                .eq('session_id', sessionId)
                .eq('company_id', context.companyId);

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Chat session deleted',
            });
        } catch (error: any) {
            console.error('Delete chat session error:', error);
            return NextResponse.json(
                { error: error.message || 'Failed to delete chat session' },
                { status: 500 }
            );
        }
    });
}

