/**
 * AI Agents
 * 6 specialized AI agents for construction industry
 */

import { aiService, AIMessage } from './aiService';

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  capabilities: string[];
  defaultProvider: 'openai' | 'gemini' | 'claude';
}

export interface AgentExecutionOptions {
  input: string;
  context?: Record<string, any>;
  provider?: 'openai' | 'gemini' | 'claude';
}

export interface AgentExecutionResult {
  output: string;
  agent: string;
  provider: string;
  confidence?: number;
  recommendations?: string[];
  metadata?: Record<string, any>;
}

/**
 * 1. HSE Sentinel - Health & Safety Agent
 */
class HSESentinelAgent {
  private agent: AIAgent = {
    id: 'hse-sentinel',
    name: 'HSE Sentinel',
    description: 'Predictive health & safety agent that correlates incidents, weather, and workforce data',
    icon: '🛡️',
    capabilities: [
      'Risk scoring and prediction',
      'Incident pattern analysis',
      'Safety recommendations',
      'Weather impact assessment',
      'Compliance monitoring',
    ],
    defaultProvider: 'openai',
  };

  async execute(options: AgentExecutionOptions): Promise<AgentExecutionResult> {
    const provider = options.provider || this.agent.defaultProvider;

    const systemPrompt = `You are the HSE Sentinel, an expert in construction health, safety, and environmental protection.
Your role is to analyze safety data, predict risks, and provide actionable recommendations to prevent incidents.
Consider factors like weather conditions, workforce patterns, equipment status, and historical incident data.
Always prioritize worker safety and regulatory compliance.`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: options.input },
    ];

    if (options.context) {
      messages.push({
        role: 'user',
        content: `Additional context: ${JSON.stringify(options.context, null, 2)}`,
      });
    }

    const response = await aiService.generateCompletion({
      provider,
      messages,
      temperature: 0.3, // Lower temperature for safety-critical analysis
      maxTokens: 1500,
    });

    return {
      output: response.content,
      agent: this.agent.name,
      provider: response.provider,
      confidence: 0.85,
      metadata: { agentId: this.agent.id },
    };
  }
}

/**
 * 2. Commercial Guardian - Contract & Cost Agent
 */
class CommercialGuardianAgent {
  private agent: AIAgent = {
    id: 'commercial-guardian',
    name: 'Commercial Guardian',
    description: 'Monitors commercial exposure, contract notices, and variation claims',
    icon: '📊',
    capabilities: [
      'Contract analysis',
      'Cost variance tracking',
      'Claim identification',
      'Budget forecasting',
      'Commercial risk assessment',
    ],
    defaultProvider: 'claude', // Claude excels at document analysis
  };

  async execute(options: AgentExecutionOptions): Promise<AgentExecutionResult> {
    const provider = options.provider || this.agent.defaultProvider;

    const systemPrompt = `You are the Commercial Guardian, an expert in construction contracts, cost management, and commercial risk.
Your role is to analyze contracts, identify potential claims, track cost variances, and protect commercial interests.
Consider contract terms, payment schedules, variations, and market conditions.
Provide clear recommendations for commercial actions and risk mitigation.`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: options.input },
    ];

    if (options.context) {
      messages.push({
        role: 'user',
        content: `Financial context: ${JSON.stringify(options.context, null, 2)}`,
      });
    }

    const response = await aiService.generateCompletion({
      provider,
      messages,
      temperature: 0.2, // Very low temperature for financial accuracy
      maxTokens: 2000,
    });

    return {
      output: response.content,
      agent: this.agent.name,
      provider: response.provider,
      confidence: 0.9,
      metadata: { agentId: this.agent.id },
    };
  }
}

/**
 * 3. Quality Inspector - Quality Assurance Agent
 */
class QualityInspectorAgent {
  private agent: AIAgent = {
    id: 'quality-inspector',
    name: 'Quality Inspector',
    description: 'Reviews photos, checklists, and reports quality issues automatically',
    icon: '🧪',
    capabilities: [
      'Photo analysis',
      'Defect detection',
      'Quality scoring',
      'Remediation recommendations',
      'Compliance verification',
    ],
    defaultProvider: 'gemini', // Gemini excels at vision tasks
  };

  async execute(options: AgentExecutionOptions): Promise<AgentExecutionResult> {
    const provider = options.provider || this.agent.defaultProvider;

    const systemPrompt = `You are the Quality Inspector, an expert in construction quality control and inspection.
Your role is to analyze images, documents, and checklists to identify quality issues and ensure compliance.
Consider building codes, specification requirements, industry standards, and best practices.
Provide detailed defect descriptions and clear remediation instructions.`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: options.input },
    ];

    if (options.context) {
      messages.push({
        role: 'user',
        content: `Inspection context: ${JSON.stringify(options.context, null, 2)}`,
      });
    }

    const response = await aiService.generateCompletion({
      provider,
      messages,
      temperature: 0.4,
      maxTokens: 1500,
    });

    return {
      output: response.content,
      agent: this.agent.name,
      provider: response.provider,
      confidence: 0.82,
      metadata: { agentId: this.agent.id },
    };
  }

  async analyzeImage(imageUrl: string, inspectionType: string): Promise<AgentExecutionResult> {
    const prompt = `Analyze this construction site image for ${inspectionType}.
Identify any quality issues, safety concerns, or non-compliance with standards.
Provide a detailed assessment with specific remediation steps.`;

    const analysis = await aiService.analyzeImage({
      provider: 'gemini',
      imageUrl,
      prompt,
    });

    return {
      output: analysis,
      agent: this.agent.name,
      provider: 'gemini',
      confidence: 0.78,
      metadata: {
        agentId: this.agent.id,
        inspectionType,
        imageUrl,
      },
    };
  }
}

/**
 * 4. Project Assistant - General Project Help Agent
 */
class ProjectAssistantAgent {
  private agent: AIAgent = {
    id: 'project-assistant',
    name: 'Project Assistant',
    description: 'General purpose assistant for project planning, scheduling, and coordination',
    icon: '🏗️',
    capabilities: [
      'Schedule optimization',
      'Resource allocation',
      'Task prioritization',
      'Team coordination',
      'Progress tracking',
    ],
    defaultProvider: 'openai',
  };

  async execute(options: AgentExecutionOptions): Promise<AgentExecutionResult> {
    const provider = options.provider || this.agent.defaultProvider;

    const systemPrompt = `You are the Project Assistant, an expert in construction project management and coordination.
Your role is to help with planning, scheduling, resource allocation, and team coordination.
Consider project timelines, dependencies, resource availability, and critical path.
Provide practical, actionable advice that project managers can implement immediately.`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: options.input },
    ];

    if (options.context) {
      messages.push({
        role: 'user',
        content: `Project context: ${JSON.stringify(options.context, null, 2)}`,
      });
    }

    const response = await aiService.generateCompletion({
      provider,
      messages,
      temperature: 0.5,
      maxTokens: 1500,
    });

    return {
      output: response.content,
      agent: this.agent.name,
      provider: response.provider,
      confidence: 0.88,
      metadata: { agentId: this.agent.id },
    };
  }
}

/**
 * 5. Financial Advisor - Budget & Cash Flow Agent
 */
class FinancialAdvisorAgent {
  private agent: AIAgent = {
    id: 'financial-advisor',
    name: 'Financial Advisor',
    description: 'Analyzes budgets, forecasts cash flow, and optimizes financial performance',
    icon: '💰',
    capabilities: [
      'Budget analysis',
      'Cash flow forecasting',
      'Cost optimization',
      'Financial reporting',
      'Profitability analysis',
    ],
    defaultProvider: 'claude',
  };

  async execute(options: AgentExecutionOptions): Promise<AgentExecutionResult> {
    const provider = options.provider || this.agent.defaultProvider;

    const systemPrompt = `You are the Financial Advisor, an expert in construction finance and cost management.
Your role is to analyze budgets, forecast cash flow, identify cost savings, and improve profitability.
Consider revenue streams, cost structures, payment terms, and financial risks.
Provide specific financial recommendations with quantified impacts.`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: options.input },
    ];

    if (options.context) {
      messages.push({
        role: 'user',
        content: `Financial data: ${JSON.stringify(options.context, null, 2)}`,
      });
    }

    const response = await aiService.generateCompletion({
      provider,
      messages,
      temperature: 0.2,
      maxTokens: 2000,
    });

    return {
      output: response.content,
      agent: this.agent.name,
      provider: response.provider,
      confidence: 0.91,
      metadata: { agentId: this.agent.id },
    };
  }
}

/**
 * 6. Document Processor - OCR & Data Extraction Agent
 */
class DocumentProcessorAgent {
  private agent: AIAgent = {
    id: 'document-processor',
    name: 'Document Processor',
    description: 'Automated document processing with OCR and intelligent data extraction',
    icon: '📄',
    capabilities: [
      'OCR text extraction',
      'Form field extraction',
      'Invoice processing',
      'Contract parsing',
      'Document classification',
    ],
    defaultProvider: 'claude',
  };

  async execute(options: AgentExecutionOptions): Promise<AgentExecutionResult> {
    const provider = options.provider || this.agent.defaultProvider;

    const systemPrompt = `You are the Document Processor, an expert in extracting structured data from construction documents.
Your role is to read documents, extract key information, and organize it into structured formats.
Handle invoices, contracts, RFIs, submittals, and other construction documents.
Extract dates, amounts, parties, terms, and other critical information accurately.`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: options.input },
    ];

    if (options.context) {
      messages.push({
        role: 'user',
        content: `Document context: ${JSON.stringify(options.context, null, 2)}`,
      });
    }

    const response = await aiService.generateCompletion({
      provider,
      messages,
      temperature: 0.1, // Very low temperature for data extraction
      maxTokens: 2000,
    });

    return {
      output: response.content,
      agent: this.agent.name,
      provider: response.provider,
      confidence: 0.93,
      metadata: { agentId: this.agent.id },
    };
  }

  async processDocument(documentText: string, documentType: string): Promise<Record<string, any>> {
    const prompt = `Extract structured data from this ${documentType} document:

${documentText}

Return the extracted data in JSON format with all relevant fields.`;

    const result = await this.execute({ input: prompt });

    try {
      // Try to parse JSON from the response
      const jsonMatch = result.output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse JSON from document processor:', error);
    }

    return { rawOutput: result.output };
  }
}

/**
 * Agent Registry
 */
class AIAgentRegistry {
  private agents: Map<string, any> = new Map();

  constructor() {
    // Initialize all agents
    this.agents.set('hse-sentinel', new HSESentinelAgent());
    this.agents.set('commercial-guardian', new CommercialGuardianAgent());
    this.agents.set('quality-inspector', new QualityInspectorAgent());
    this.agents.set('project-assistant', new ProjectAssistantAgent());
    this.agents.set('financial-advisor', new FinancialAdvisorAgent());
    this.agents.set('document-processor', new DocumentProcessorAgent());
  }

  getAgent(agentId: string): any {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    return agent;
  }

  getAllAgents(): AIAgent[] {
    return Array.from(this.agents.values()).map(agent => agent.agent);
  }

  async executeAgent(
    agentId: string,
    options: AgentExecutionOptions
  ): Promise<AgentExecutionResult> {
    const agent = this.getAgent(agentId);
    return agent.execute(options);
  }
}

// Export singleton instance
export const aiAgentRegistry = new AIAgentRegistry();

// Export individual agents for direct use
export const hseSentinel = aiAgentRegistry.getAgent('hse-sentinel');
export const commercialGuardian = aiAgentRegistry.getAgent('commercial-guardian');
export const qualityInspector = aiAgentRegistry.getAgent('quality-inspector');
export const projectAssistant = aiAgentRegistry.getAgent('project-assistant');
export const financialAdvisor = aiAgentRegistry.getAgent('financial-advisor');
export const documentProcessor = aiAgentRegistry.getAgent('document-processor');

