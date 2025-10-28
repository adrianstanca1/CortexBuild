import { Router } from 'express';
import type { Database } from 'better-sqlite3';
import { getCurrentUser } from '../auth';
import { getOpenAIClient } from '../services/ai';

export function createAIChatRoutes(db: Database) {
  const router = Router();

  // AI Chat endpoint
  router.post('/chat', getCurrentUser, async (req, res) => {
    try {
      const { message, mode, conversationId, history } = req.body;
      const user = (req as any).user;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get user context from database
      const userProjects = db.prepare(`
        SELECT p.*, c.name as company_name
        FROM projects p
        LEFT JOIN companies c ON p.company_id = c.id
        WHERE p.company_id = ?
        ORDER BY p.created_at DESC
        LIMIT 5
      `).all(user.companyId);

      const recentTasks = db.prepare(`
        SELECT * FROM tasks
        WHERE company_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `).all(user.companyId);

      // Build context-aware system prompt
      let systemPrompt = `You are an advanced AI assistant for CortexBuild, a construction management platform. 
You have access to the user's project data and can provide intelligent insights.

User: ${user.name} (${user.email})
Company: ${user.companyName}
Role: ${user.role}

Current Projects: ${userProjects.length}
Recent Tasks: ${recentTasks.length}
`;

      if (mode === 'analyze') {
        systemPrompt += `\nMode: ANALYSIS - Provide detailed data analysis and insights.`;
      } else if (mode === 'predict') {
        systemPrompt += `\nMode: PREDICTION - Use available data to make informed predictions about project outcomes, timelines, and costs.`;
      } else {
        systemPrompt += `\nMode: CHAT - Engage in helpful conversation and answer questions.`;
      }

      // Add project context if available
      if (userProjects.length > 0) {
        systemPrompt += `\n\nActive Projects:\n`;
        userProjects.forEach((p: any) => {
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

      // Call OpenAI
      const openai = getOpenAIClient(true); // Use SDK user key
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: mode === 'predict' ? 0.3 : mode === 'analyze' ? 0.5 : 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

      // Log AI request
      db.prepare(`
        INSERT INTO ai_requests (
          user_id, company_id, model, prompt, response, 
          tokens_used, cost, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        user.userId,
        user.companyId,
        'gpt-4-turbo-preview',
        message,
        response,
        completion.usage?.total_tokens || 0,
        ((completion.usage?.total_tokens || 0) * 0.00003) // Approximate cost
      );

      res.json({
        success: true,
        response,
        context: {
          mode,
          projectsCount: userProjects.length,
          tasksCount: recentTasks.length,
          tokensUsed: completion.usage?.total_tokens || 0
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
  router.get('/conversations', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;

      const conversations = db.prepare(`
        SELECT 
          id,
          model,
          prompt,
          response,
          tokens_used,
          cost,
          created_at
        FROM ai_requests
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `).all(user.userId);

      res.json({
        success: true,
        conversations
      });

    } catch (error: any) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get AI usage statistics
  router.get('/usage', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;

      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total_requests,
          SUM(tokens_used) as total_tokens,
          SUM(cost) as total_cost,
          AVG(tokens_used) as avg_tokens_per_request
        FROM ai_requests
        WHERE user_id = ?
      `).get(user.userId) as any;

      const recentRequests = db.prepare(`
        SELECT 
          model,
          tokens_used,
          cost,
          created_at
        FROM ai_requests
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `).all(user.userId);

      res.json({
        success: true,
        stats: {
          totalRequests: stats.total_requests || 0,
          totalTokens: stats.total_tokens || 0,
          totalCost: stats.total_cost || 0,
          avgTokensPerRequest: Math.round(stats.avg_tokens_per_request || 0)
        },
        recentRequests
      });

    } catch (error: any) {
      console.error('Get AI usage error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Smart suggestions based on context
  router.post('/suggest', getCurrentUser, async (req, res) => {
    try {
      const { context, type } = req.body;
      const user = (req as any).user;

      let prompt = '';

      switch (type) {
        case 'project_name':
          prompt = `Suggest 5 professional project names for a construction project with these details: ${JSON.stringify(context)}. Return only the names as a JSON array.`;
          break;
        case 'task_breakdown':
          prompt = `Break down this project into key tasks: ${JSON.stringify(context)}. Return as a JSON array of task objects with name, description, and estimated_hours.`;
          break;
        case 'budget_estimate':
          prompt = `Provide a budget estimate for this project: ${JSON.stringify(context)}. Return as JSON with categories and amounts.`;
          break;
        case 'risk_analysis':
          prompt = `Analyze potential risks for this project: ${JSON.stringify(context)}. Return as JSON array of risks with severity and mitigation strategies.`;
          break;
        default:
          return res.status(400).json({ error: 'Invalid suggestion type' });
      }

      const openai = getOpenAIClient(true);
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a construction project management expert. Provide concise, actionable suggestions in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content || '[]';
      
      try {
        const suggestions = JSON.parse(response);
        res.json({
          success: true,
          suggestions
        });
      } catch {
        res.json({
          success: true,
          suggestions: response
        });
      }

    } catch (error: any) {
      console.error('AI Suggest error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

