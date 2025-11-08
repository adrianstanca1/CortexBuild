// CortexBuild Advanced AI & Machine Learning Service
import { Project, Task, User, RFI } from '../types';

export interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'forecasting' | 'nlp';
  version: string;
  accuracy: number;
  lastTrained: string;
  status: 'training' | 'ready' | 'updating' | 'error';
  description: string;
  features: string[];
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
    mse?: number;
    rmse?: number;
  };
}

export interface Prediction {
  id: string;
  modelId: string;
  input: any;
  prediction: any;
  confidence: number;
  timestamp: string;
  explanation: string[];
  alternatives?: { value: any; confidence: number }[];
}

export interface AIInsight {
  id: string;
  type: 'risk' | 'opportunity' | 'optimization' | 'anomaly' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  category: 'schedule' | 'budget' | 'quality' | 'safety' | 'resource' | 'performance';
  data: any;
  recommendations: {
    action: string;
    priority: number;
    estimatedImpact: string;
    effort: string;
  }[];
  createdAt: string;
  expiresAt?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'schedule' | 'event' | 'condition' | 'threshold';
    config: any;
  };
  conditions: {
    field: string;
    operator: 'equals' | 'greater' | 'less' | 'contains' | 'between';
    value: any;
  }[];
  actions: {
    type: 'notification' | 'task_creation' | 'status_update' | 'assignment' | 'escalation';
    config: any;
  }[];
  enabled: boolean;
  lastExecuted?: string;
  executionCount: number;
  successRate: number;
}

export interface SmartRecommendation {
  id: string;
  type: 'task_assignment' | 'resource_allocation' | 'schedule_optimization' | 'cost_reduction' | 'quality_improvement';
  title: string;
  description: string;
  rationale: string;
  confidence: number;
  potentialImpact: {
    timeline: number; // days saved/added
    cost: number; // cost impact
    quality: number; // quality score impact
    risk: number; // risk score impact
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    timeRequired: string;
    resources: string[];
    steps: string[];
  };
  data: any;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
}

class AIMLService {
  private models: MLModel[] = [];
  private predictions: Prediction[] = [];
  private insights: AIInsight[] = [];
  private automationRules: AutomationRule[] = [];
  private recommendations: SmartRecommendation[] = [];

  constructor() {
    this.initializeMockModels();
    this.initializeMockData();
  }

  private initializeMockModels() {
    this.models = [
      {
        id: 'model-delay-prediction',
        name: 'Project Delay Predictor',
        type: 'classification',
        version: '2.1.0',
        accuracy: 87.3,
        lastTrained: '2024-10-10T00:00:00Z',
        status: 'ready',
        description: 'Predicts likelihood of project delays based on historical data and current metrics',
        features: ['budget_variance', 'team_size', 'complexity_score', 'weather_impact', 'resource_availability'],
        metrics: {
          precision: 0.89,
          recall: 0.85,
          f1Score: 0.87
        }
      },
      {
        id: 'model-cost-forecasting',
        name: 'Cost Forecasting Engine',
        type: 'regression',
        version: '1.8.2',
        accuracy: 92.1,
        lastTrained: '2024-10-08T00:00:00Z',
        status: 'ready',
        description: 'Forecasts project costs and identifies potential budget overruns',
        features: ['project_size', 'material_costs', 'labor_rates', 'complexity', 'location_factor'],
        metrics: {
          precision: 0.92,
          recall: 0.91,
          f1Score: 0.91,
          mse: 0.08,
          rmse: 0.28
        }
      },
      {
        id: 'model-quality-assessment',
        name: 'Quality Risk Analyzer',
        type: 'classification',
        version: '1.5.1',
        accuracy: 84.7,
        lastTrained: '2024-10-05T00:00:00Z',
        status: 'ready',
        description: 'Identifies potential quality issues before they occur',
        features: ['rfi_rate', 'rework_frequency', 'inspection_scores', 'team_experience', 'material_quality'],
        metrics: {
          precision: 0.86,
          recall: 0.83,
          f1Score: 0.84
        }
      },
      {
        id: 'model-resource-optimizer',
        name: 'Resource Optimization AI',
        type: 'clustering',
        version: '2.0.3',
        accuracy: 89.5,
        lastTrained: '2024-10-12T00:00:00Z',
        status: 'ready',
        description: 'Optimizes resource allocation across projects and teams',
        features: ['skill_match', 'availability', 'workload', 'performance_history', 'project_requirements'],
        metrics: {
          precision: 0.90,
          recall: 0.89,
          f1Score: 0.89
        }
      },
      {
        id: 'model-sentiment-analysis',
        name: 'Team Sentiment Analyzer',
        type: 'nlp',
        version: '1.3.0',
        accuracy: 78.9,
        lastTrained: '2024-10-01T00:00:00Z',
        status: 'ready',
        description: 'Analyzes team communication and sentiment to predict collaboration issues',
        features: ['message_tone', 'response_time', 'collaboration_frequency', 'feedback_sentiment'],
        metrics: {
          precision: 0.81,
          recall: 0.77,
          f1Score: 0.79
        }
      }
    ];
  }

  private initializeMockData() {
    const now = new Date();
    
    // Initialize mock insights
    this.insights = [
      {
        id: 'insight-1',
        type: 'risk',
        title: 'High Risk of Schedule Delay Detected',
        description: 'Project Canary Wharf Tower shows 73% probability of 2-week delay based on current progress and resource allocation patterns.',
        confidence: 0.73,
        impact: 'high',
        urgency: 'high',
        category: 'schedule',
        data: {
          projectId: 'project-1',
          predictedDelay: 14,
          keyFactors: ['resource_shortage', 'weather_impact', 'complexity_increase']
        },
        recommendations: [
          {
            action: 'Increase team size by 2 skilled workers',
            priority: 1,
            estimatedImpact: 'Reduce delay risk by 40%',
            effort: 'Medium - Requires hiring or reallocation'
          },
          {
            action: 'Implement parallel work streams for critical path',
            priority: 2,
            estimatedImpact: 'Accelerate timeline by 5-7 days',
            effort: 'High - Requires schedule restructuring'
          }
        ],
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'insight-2',
        type: 'opportunity',
        title: 'Cost Optimization Opportunity Identified',
        description: 'Material procurement optimization could save £15,000-£25,000 on current projects through bulk purchasing and supplier consolidation.',
        confidence: 0.85,
        impact: 'medium',
        urgency: 'medium',
        category: 'budget',
        data: {
          potentialSavings: 20000,
          affectedProjects: ['project-1', 'project-2'],
          optimizationAreas: ['material_procurement', 'supplier_consolidation']
        },
        recommendations: [
          {
            action: 'Consolidate orders with primary suppliers',
            priority: 1,
            estimatedImpact: '12-15% cost reduction on materials',
            effort: 'Low - Requires procurement process adjustment'
          }
        ],
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Initialize mock automation rules
    this.automationRules = [
      {
        id: 'rule-1',
        name: 'Automatic Task Assignment',
        description: 'Automatically assign tasks to team members based on skills and availability',
        trigger: {
          type: 'event',
          config: { event: 'task_created' }
        },
        conditions: [
          { field: 'task.assignedToId', operator: 'equals', value: null },
          { field: 'task.priority', operator: 'greater', value: 'medium' }
        ],
        actions: [
          {
            type: 'assignment',
            config: { method: 'ai_recommendation', fallback: 'team_lead' }
          }
        ],
        enabled: true,
        lastExecuted: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        executionCount: 47,
        successRate: 94.7
      },
      {
        id: 'rule-2',
        name: 'Budget Alert System',
        description: 'Send alerts when project budget variance exceeds threshold',
        trigger: {
          type: 'threshold',
          config: { metric: 'budget_variance', threshold: 10 }
        },
        conditions: [
          { field: 'project.status', operator: 'equals', value: 'active' }
        ],
        actions: [
          {
            type: 'notification',
            config: { recipients: ['project_manager', 'finance_team'], priority: 'high' }
          }
        ],
        enabled: true,
        executionCount: 12,
        successRate: 100
      }
    ];

    // Initialize mock recommendations
    this.recommendations = [
      {
        id: 'rec-1',
        type: 'task_assignment',
        title: 'Optimize Task Assignment for Facade Installation',
        description: 'AI analysis suggests reassigning facade installation tasks to maximize efficiency and reduce completion time.',
        rationale: 'Based on skill matching, current workload, and historical performance data, Adrian ASC shows 89% compatibility with facade work and has 15% available capacity.',
        confidence: 0.89,
        potentialImpact: {
          timeline: -3,
          cost: -2500,
          quality: 5,
          risk: -10
        },
        implementation: {
          difficulty: 'easy',
          timeRequired: '30 minutes',
          resources: ['project_manager'],
          steps: [
            'Review current task assignments',
            'Reassign facade tasks to Adrian ASC',
            'Update project timeline',
            'Notify team of changes'
          ]
        },
        data: {
          taskIds: ['task-1'],
          recommendedAssignee: 'user-2',
          currentAssignee: 'user-3'
        },
        createdAt: now.toISOString(),
        status: 'pending'
      }
    ];
  }

  // Get all available ML models
  async getModels(): Promise<MLModel[]> {
    return this.models;
  }

  // Get model by ID
  async getModel(modelId: string): Promise<MLModel | null> {
    return this.models.find(model => model.id === modelId) || null;
  }

  // Make prediction using a specific model
  async makePrediction(modelId: string, input: any): Promise<Prediction> {
    const model = await this.getModel(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // Simulate AI prediction
    let prediction: any;
    let confidence: number;
    let explanation: string[] = [];

    switch (model.type) {
      case 'classification':
        prediction = Math.random() > 0.5 ? 'high_risk' : 'low_risk';
        confidence = 0.7 + Math.random() * 0.25;
        explanation = [
          `Based on ${model.features.length} key features`,
          `Model accuracy: ${model.accuracy}%`,
          'Historical pattern analysis applied'
        ];
        break;
      
      case 'regression':
        prediction = Math.random() * 100000 + 50000; // Cost prediction
        confidence = 0.8 + Math.random() * 0.15;
        explanation = [
          'Regression analysis on historical cost data',
          'Market factor adjustments applied',
          'Seasonal variations considered'
        ];
        break;
      
      default:
        prediction = 'unknown';
        confidence = 0.5;
        explanation = ['Generic prediction'];
    }

    const newPrediction: Prediction = {
      id: `pred-${Date.now()}`,
      modelId,
      input,
      prediction,
      confidence: Math.round(confidence * 100) / 100,
      timestamp: new Date().toISOString(),
      explanation
    };

    this.predictions.push(newPrediction);
    return newPrediction;
  }

  // Get AI insights for projects
  async getInsights(filters: {
    type?: string;
    category?: string;
    impact?: string;
    projectId?: string;
  } = {}): Promise<AIInsight[]> {
    let filteredInsights = [...this.insights];

    if (filters.type) {
      filteredInsights = filteredInsights.filter(insight => insight.type === filters.type);
    }

    if (filters.category) {
      filteredInsights = filteredInsights.filter(insight => insight.category === filters.category);
    }

    if (filters.impact) {
      filteredInsights = filteredInsights.filter(insight => insight.impact === filters.impact);
    }

    if (filters.projectId) {
      filteredInsights = filteredInsights.filter(insight => 
        insight.data?.projectId === filters.projectId
      );
    }

    return filteredInsights.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Generate smart recommendations
  async generateRecommendations(context: {
    projectId?: string;
    userId?: string;
    type?: string;
  } = {}): Promise<SmartRecommendation[]> {
    // In a real implementation, this would use ML models to generate recommendations
    return this.recommendations.filter(rec => {
      if (context.type && rec.type !== context.type) return false;
      if (context.projectId && rec.data?.projectId !== context.projectId) return false;
      return true;
    });
  }

  // Get automation rules
  async getAutomationRules(): Promise<AutomationRule[]> {
    return this.automationRules;
  }

  // Create new automation rule
  async createAutomationRule(rule: Omit<AutomationRule, 'id' | 'executionCount' | 'successRate'>): Promise<AutomationRule> {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      executionCount: 0,
      successRate: 0
    };

    this.automationRules.push(newRule);
    return newRule;
  }

  // Execute automation rule
  async executeAutomationRule(ruleId: string, context: any): Promise<boolean> {
    const rule = this.automationRules.find(r => r.id === ruleId);
    if (!rule || !rule.enabled) return false;

    // Check conditions
    const conditionsMet = rule.conditions.every(condition => {
      const value = this.getValueFromContext(context, condition.field);
      return this.evaluateCondition(value, condition.operator, condition.value);
    });

    if (!conditionsMet) return false;

    // Execute actions
    for (const action of rule.actions) {
      await this.executeAction(action, context);
    }

    // Update execution stats
    rule.executionCount++;
    rule.lastExecuted = new Date().toISOString();
    
    return true;
  }

  // Train or retrain a model
  async trainModel(modelId: string, trainingData: any[]): Promise<MLModel> {
    const model = await this.getModel(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // Simulate training process
    model.status = 'training';
    
    // Simulate training time
    setTimeout(() => {
      model.status = 'ready';
      model.lastTrained = new Date().toISOString();
      model.accuracy = Math.min(95, model.accuracy + Math.random() * 2);
      model.version = this.incrementVersion(model.version);
    }, 5000);

    return model;
  }

  // Get prediction history
  async getPredictionHistory(modelId?: string): Promise<Prediction[]> {
    let predictions = [...this.predictions];
    
    if (modelId) {
      predictions = predictions.filter(pred => pred.modelId === modelId);
    }

    return predictions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Private helper methods
  private getValueFromContext(context: any, field: string): any {
    const parts = field.split('.');
    let value = context;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  private evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals': return value === expected;
      case 'greater': return value > expected;
      case 'less': return value < expected;
      case 'contains': return String(value).includes(String(expected));
      case 'between': return Array.isArray(expected) && value >= expected[0] && value <= expected[1];
      default: return false;
    }
  }

  private async executeAction(action: any, context: any): Promise<void> {
    // Simulate action execution
    console.log(`Executing action: ${action.type}`, action.config, context);
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }
}

export const aiMLService = new AIMLService();
export default aiMLService;
