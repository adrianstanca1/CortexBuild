// CortexBuild - AI Chat Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { authenticateToken } from '../auth-supabase';
import { getOpenAIClient, generateGeminiResponse } from '../services/ai';

export function createAIChatRoutes(supabase: SupabaseClient) {
  const router = Router();

  // AI Chat endpoint
  router.post('/chat', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { message, mode, conversationId, history } = req.body;
      const user = (req as any).user;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const userId = user.id;
      const companyId = user.company_id || user.companyId;

      // Get user context from database
      const { data: userProjects } = await supabase
        .from('projects')
        .select(`
          *,
          companies!projects_company_id_fkey(id, name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentTasks } = await supabase
        .from('project_tasks_gantt')
        .select('*')
        .eq('project_id', userProjects?.[0]?.id || '')
        .order('created_at', { ascending: false })
        .limit(10);

      // Transform data
      const projects = (userProjects || []).map((p: any) => {
        const companies = Array.isArray(p.companies) ? p.companies[0] : p.companies;
        return {
          ...p,
          company_name: companies?.name || null
        };
      });

      const tasks = recentTasks || [];

      // Build context-aware system prompt
      let systemPrompt = `You are an advanced AI assistant for CortexBuild, a construction management platform. 
You have access to the user's project data and can provide intelligent insights.

User: ${user.name} (${user.email})
Company: ${user.company?.name || 'Company'}
Role: ${user.role}

Current Projects: ${projects.length}
Recent Tasks: ${recentTasks?.length || 0}
`;

      if (mode === 'analyze') {
        systemPrompt += `\nMode: ANALYSIS - Provide detailed data analysis and insights.`;
      } else if (mode === 'predict') {
        systemPrompt += `\nMode: PREDICTION - Use available data to make informed predictions about project outcomes, timelines, and costs.`;
      } else {
        systemPrompt += `\nMode: CHAT - Engage in helpful conversation and answer questions.`;
      }

      // Add project context if available
      if (projects.length > 0) {
        systemPrompt += `\n\nActive Projects:\n`;
        projects.forEach((p: any) => {
          systemPrompt += `- ${p.name} (Status: ${p.status}, Budget: $${p.budget || 'N/A'})\n`;
        });
      }

      // Prepare conversation history
      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ];

      if (history && Array.isArray(history)) {
        history.slice(-10).forEach((msg: any) => {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({
              role: msg.role,
              content: msg.content
            });
          }
        });
      }

      messages.push({
        role: 'user',
        content: message
      });

      // Call Gemini AI
      const context = {
        projects: projects,
        tasks: tasks,
        mode: mode
      };

      const response = await generateGeminiResponse(message, context, userId, companyId);

      // Log AI request
      try {
        await supabase
          .from('ai_requests')
          .insert({
            user_id: userId,
            company_id: companyId,
            model: 'gemini-pro',
            prompt: message,
            response: response,
            tokens_used: Math.ceil(message.length / 4), // Approximate token count
            cost: 0.001 // Approximate cost for Gemini
          });
      } catch (logError) {
        console.warn('Failed to log AI request:', logError);
      }

      res.json({
        success: true,
        response,
        context: {
          mode,
          projectsCount: projects.length,
          tasksCount: recentTasks?.length || 0,
          tokensUsed: Math.ceil(message.length / 4) // Approximate token count
        }
      });

    } catch (error: any) {
      console.error('AI Chat error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process AI request'
      });
    }
  });

  // Get AI conversation history
  router.get('/conversations', authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const { data: conversations, error } = await supabase
        .from('ai_requests')
        .select('id, model, prompt, response, tokens_used, cost, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      res.json({
        success: true,
        conversations: conversations || []
      });
    } catch (error: any) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to load conversations'
      });
    }
  });

  // Get AI usage stats
  router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const companyId = user.company_id || user.companyId;

      // Get usage stats for user
      const { data: userStats } = await supabase
        .from('ai_requests')
        .select('tokens_used, cost')
        .eq('user_id', user.id);

      // Get usage stats for company
      const { data: companyStats } = await supabase
        .from('ai_requests')
        .select('tokens_used, cost')
        .eq('company_id', companyId);

      const userTotalTokens = (userStats || []).reduce((sum: number, s: any) => sum + (s.tokens_used || 0), 0);
      const userTotalCost = (userStats || []).reduce((sum: number, s: any) => sum + (s.cost || 0), 0);

      const companyTotalTokens = (companyStats || []).reduce((sum: number, s: any) => sum + (s.tokens_used || 0), 0);
      const companyTotalCost = (companyStats || []).reduce((sum: number, s: any) => sum + (s.cost || 0), 0);

      res.json({
        success: true,
        stats: {
          user: {
            requests: userStats?.length || 0,
            totalTokens: userTotalTokens,
            totalCost: userTotalCost
          },
          company: {
            requests: companyStats?.length || 0,
            totalTokens: companyTotalTokens,
            totalCost: companyTotalCost
          }
        }
      });
    } catch (error: any) {
      console.error('Get AI stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to load stats'
      });
    }
  });

  return router;
}
