/**
 * AI Routes
 * Endpoints for OpenAI integration
 */

import { Router, Request, Response } from 'express';
import * as openaiService from '../services/openai';

const router = Router();

/**
 * POST /api/ai/generate-code
 * Generate code from natural language description
 */
router.post('/generate-code', async (req: Request, res: Response) => {
    try {
        const { prompt, language, framework, context } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const code = await openaiService.generateCode({
            prompt,
            language: language || 'typescript',
            framework,
            context
        });

        res.json({
            success: true,
            code,
            language: language || 'typescript'
        });
    } catch (error) {
        console.error('Code generation error:', error);
        res.status(500).json({
            error: 'Failed to generate code',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * POST /api/ai/analyze-code
 * Analyze code for security, performance, and best practices
 */
router.post('/analyze-code', async (req: Request, res: Response) => {
    try {
        const { code, language, analysisType } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const analysis = await openaiService.analyzeCode({
            code,
            language: language || 'typescript',
            analysisType: analysisType || 'all'
        });

        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        console.error('Code analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze code',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * POST /api/ai/generate-tests
 * Generate tests for code
 */
router.post('/generate-tests', async (req: Request, res: Response) => {
    try {
        const { code, language, testFramework, coverage } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const tests = await openaiService.generateTests({
            code,
            language: language || 'typescript',
            testFramework: testFramework || 'jest',
            coverage: coverage || 80
        });

        res.json({
            success: true,
            tests,
            testFramework: testFramework || 'jest'
        });
    } catch (error) {
        console.error('Test generation error:', error);
        res.status(500).json({
            error: 'Failed to generate tests',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * POST /api/ai/generate-documentation
 * Generate documentation for code
 */
router.post('/generate-documentation', async (req: Request, res: Response) => {
    try {
        const { code, language } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const documentation = await openaiService.generateDocumentation(
            code,
            language || 'typescript'
        );

        res.json({
            success: true,
            documentation
        });
    } catch (error) {
        console.error('Documentation generation error:', error);
        res.status(500).json({
            error: 'Failed to generate documentation',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * POST /api/ai/calculate-cost
 * Calculate token usage and cost
 */
router.post('/calculate-cost', (req: Request, res: Response) => {
    try {
        const { inputTokens, outputTokens, model } = req.body;

        if (inputTokens === undefined || outputTokens === undefined) {
            return res.status(400).json({ error: 'inputTokens and outputTokens are required' });
        }

        const cost = openaiService.calculateTokenCost(
            inputTokens,
            outputTokens,
            model
        );

        res.json({
            success: true,
            cost
        });
    } catch (error) {
        console.error('Cost calculation error:', error);
        res.status(500).json({
            error: 'Failed to calculate cost',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /api/ai/health
 * Check AI service health
 */
router.get('/health', (req: Request, res: Response) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const isConfigured = !!apiKey;

    res.json({
        success: true,
        service: 'OpenAI',
        configured: isConfigured,
        model: 'claude-3-5-sonnet-20241022',
        status: isConfigured ? 'ready' : 'not-configured'
    });
});

export default router;

