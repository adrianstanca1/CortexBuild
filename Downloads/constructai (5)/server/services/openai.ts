/**
 * OpenAI Integration Service
 * Handles code generation, analysis, and test generation
 */

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface CodeGenerationRequest {
    prompt: string;
    language?: string;
    framework?: string;
    context?: string;
}

interface CodeAnalysisRequest {
    code: string;
    language?: string;
    analysisType?: 'security' | 'performance' | 'best-practices' | 'all';
}

interface TestGenerationRequest {
    code: string;
    language?: string;
    testFramework?: string;
    coverage?: number;
}

/**
 * Generate code from natural language description
 */
export async function generateCode(request: CodeGenerationRequest): Promise<string> {
    try {
        const prompt = buildCodeGenerationPrompt(request);
        
        const message = await openai.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        const content = message.content[0];
        if (content.type === 'text') {
            return content.text;
        }
        throw new Error('Unexpected response type from OpenAI');
    } catch (error) {
        console.error('Code generation error:', error);
        throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Analyze code for security, performance, and best practices
 */
export async function analyzeCode(request: CodeAnalysisRequest): Promise<{
    security: string[];
    performance: string[];
    bestPractices: string[];
    summary: string;
}> {
    try {
        const prompt = buildCodeAnalysisPrompt(request);
        
        const message = await openai.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        const content = message.content[0];
        if (content.type === 'text') {
            return parseAnalysisResponse(content.text);
        }
        throw new Error('Unexpected response type from OpenAI');
    } catch (error) {
        console.error('Code analysis error:', error);
        throw new Error(`Failed to analyze code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate tests for code
 */
export async function generateTests(request: TestGenerationRequest): Promise<string> {
    try {
        const prompt = buildTestGenerationPrompt(request);
        
        const message = await openai.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        const content = message.content[0];
        if (content.type === 'text') {
            return content.text;
        }
        throw new Error('Unexpected response type from OpenAI');
    } catch (error) {
        console.error('Test generation error:', error);
        throw new Error(`Failed to generate tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate documentation for code
 */
export async function generateDocumentation(code: string, language: string = 'typescript'): Promise<string> {
    try {
        const message = await openai.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            messages: [
                {
                    role: 'user',
                    content: `Generate comprehensive documentation for the following ${language} code:\n\n${code}\n\nInclude:\n1. Function/class descriptions\n2. Parameters and return types\n3. Usage examples\n4. Edge cases\n5. Performance considerations`
                }
            ]
        });

        const content = message.content[0];
        if (content.type === 'text') {
            return content.text;
        }
        throw new Error('Unexpected response type from OpenAI');
    } catch (error) {
        console.error('Documentation generation error:', error);
        throw new Error(`Failed to generate documentation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Build code generation prompt
 */
function buildCodeGenerationPrompt(request: CodeGenerationRequest): string {
    const language = request.language || 'typescript';
    const framework = request.framework ? ` using ${request.framework}` : '';
    const context = request.context ? `\n\nContext:\n${request.context}` : '';

    return `Generate ${language} code${framework} for the following requirement:\n\n${request.prompt}${context}\n\nProvide clean, well-structured, production-ready code with proper error handling and comments.`;
}

/**
 * Build code analysis prompt
 */
function buildCodeAnalysisPrompt(request: CodeAnalysisRequest): string {
    const language = request.language || 'typescript';
    const analysisType = request.analysisType || 'all';

    let analysisInstructions = '';
    if (analysisType === 'all') {
        analysisInstructions = 'Analyze for security vulnerabilities, performance issues, and best practices violations.';
    } else if (analysisType === 'security') {
        analysisInstructions = 'Analyze for security vulnerabilities and potential security issues.';
    } else if (analysisType === 'performance') {
        analysisInstructions = 'Analyze for performance issues and optimization opportunities.';
    } else if (analysisType === 'best-practices') {
        analysisInstructions = 'Analyze for best practices violations and code quality issues.';
    }

    return `${analysisInstructions}\n\nCode to analyze (${language}):\n\n${request.code}\n\nProvide findings in JSON format with categories: security, performance, bestPractices, and summary.`;
}

/**
 * Build test generation prompt
 */
function buildTestGenerationPrompt(request: TestGenerationRequest): string {
    const language = request.language || 'typescript';
    const testFramework = request.testFramework || 'jest';
    const coverage = request.coverage || 80;

    return `Generate ${testFramework} tests for the following ${language} code with at least ${coverage}% coverage:\n\n${request.code}\n\nInclude:\n1. Unit tests for all functions\n2. Edge case tests\n3. Error handling tests\n4. Integration tests where applicable\n\nProvide complete, runnable test code.`;
}

/**
 * Parse analysis response
 */
function parseAnalysisResponse(response: string): {
    security: string[];
    performance: string[];
    bestPractices: string[];
    summary: string;
} {
    try {
        // Try to extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                security: parsed.security || [],
                performance: parsed.performance || [],
                bestPractices: parsed.bestPractices || [],
                summary: parsed.summary || response
            };
        }
    } catch (e) {
        console.error('Failed to parse analysis response:', e);
    }

    // Fallback: return response as summary
    return {
        security: [],
        performance: [],
        bestPractices: [],
        summary: response
    };
}

/**
 * Calculate token usage and cost
 */
export function calculateTokenCost(inputTokens: number, outputTokens: number, model: string = 'claude-3-5-sonnet-20241022'): {
    totalTokens: number;
    estimatedCost: number;
    breakdown: { input: number; output: number };
} {
    // Claude 3.5 Sonnet pricing (as of 2024)
    const inputCostPer1kTokens = 0.003; // $3 per 1M tokens
    const outputCostPer1kTokens = 0.015; // $15 per 1M tokens

    const inputCost = (inputTokens / 1000) * inputCostPer1kTokens;
    const outputCost = (outputTokens / 1000) * outputCostPer1kTokens;
    const totalCost = inputCost + outputCost;

    return {
        totalTokens: inputTokens + outputTokens,
        estimatedCost: totalCost,
        breakdown: {
            input: inputTokens,
            output: outputTokens
        }
    };
}

export default {
    generateCode,
    analyzeCode,
    generateTests,
    generateDocumentation,
    calculateTokenCost
};

