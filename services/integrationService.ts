// CortexBuild Integration Service - Connects all platform services
import { dataService } from './dataService';
import { analyticsService } from './analyticsService';
import { teamService } from './teamService';
import { timeTrackingService } from './timeTrackingService';
import { notificationService } from './notificationService';
import { schedulingService } from './schedulingService';
import { aiMLService } from './aiMLService';
import { qualitySafetyService } from './qualitySafetyService';
import { businessIntelligenceService } from './businessIntelligenceService';
import { workflowAutomationService } from './workflowAutomationService';
import { utilityService } from './utilityService';

export interface ServiceHealth {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
  responseTime: number;
  errorCount: number;
  uptime: number;
}

export interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'down';
  services: ServiceHealth[];
  lastUpdated: string;
  activeUsers: number;
  systemLoad: number;
  memoryUsage: number;
}

export interface IntegrationEvent {
  id: string;
  type: string;
  source: string;
  target?: string;
  data: any;
  timestamp: string;
  processed: boolean;
  retryCount: number;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
}

class IntegrationService {
  private eventQueue: IntegrationEvent[] = [];
  private webhooks: WebhookEndpoint[] = [];
  private serviceHealthCache: Map<string, ServiceHealth> = new Map();

  constructor() {
    this.initializeIntegrations();
    this.startHealthMonitoring();
  }

  private initializeIntegrations() {
    // Initialize webhook endpoints
    this.webhooks = [
      {
        id: 'webhook-1',
        name: 'Project Updates',
        url: 'https://api.example.com/webhooks/projects',
        events: ['project.created', 'project.updated', 'project.completed'],
        secret: 'webhook_secret_123',
        enabled: true,
        successCount: 45,
        failureCount: 2
      },
      {
        id: 'webhook-2',
        name: 'Task Notifications',
        url: 'https://api.example.com/webhooks/tasks',
        events: ['task.created', 'task.assigned', 'task.completed'],
        secret: 'webhook_secret_456',
        enabled: true,
        successCount: 128,
        failureCount: 0
      }
    ];
  }

  private startHealthMonitoring() {
    // Start periodic health checks
    setInterval(() => {
      this.checkSystemHealth();
    }, 30000); // Check every 30 seconds
  }

  // System Health Monitoring
  async getSystemStatus(): Promise<SystemStatus> {
    const services = await this.checkAllServices();
    const overall = this.calculateOverallHealth(services);
    
    return {
      overall,
      services,
      lastUpdated: new Date().toISOString(),
      activeUsers: Math.floor(Math.random() * 50) + 10, // Mock data
      systemLoad: Math.random() * 100,
      memoryUsage: Math.random() * 80 + 20
    };
  }

  private async checkAllServices(): Promise<ServiceHealth[]> {
    const services = [
      'dataService',
      'analyticsService',
      'teamService',
      'timeTrackingService',
      'notificationService',
      'schedulingService',
      'aiMLService',
      'qualitySafetyService',
      'businessIntelligenceService',
      'workflowAutomationService'
    ];

    const healthChecks = await Promise.all(
      services.map(service => this.checkServiceHealth(service))
    );

    return healthChecks;
  }

  private async checkServiceHealth(serviceName: string): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Simulate health check
      await this.delay(Math.random() * 100);
      
      const responseTime = Date.now() - startTime;
      const health: ServiceHealth = {
        serviceName,
        status: responseTime < 100 ? 'healthy' : 'degraded',
        lastCheck: new Date().toISOString(),
        responseTime,
        errorCount: Math.floor(Math.random() * 3),
        uptime: 99.5 + Math.random() * 0.5
      };

      this.serviceHealthCache.set(serviceName, health);
      return health;
    } catch (error) {
      const health: ServiceHealth = {
        serviceName,
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        errorCount: 1,
        uptime: 0
      };

      this.serviceHealthCache.set(serviceName, health);
      return health;
    }
  }

  private calculateOverallHealth(services: ServiceHealth[]): 'healthy' | 'degraded' | 'down' {
    const downServices = services.filter(s => s.status === 'down').length;
    const degradedServices = services.filter(s => s.status === 'degraded').length;

    if (downServices > 0) return 'down';
    if (degradedServices > services.length * 0.3) return 'degraded';
    return 'healthy';
  }

  private async checkSystemHealth(): Promise<void> {
    try {
      await this.checkAllServices();
    } catch (error) {
      console.error('System health check failed:', error);
    }
  }

  // Event Management
  async publishEvent(type: string, source: string, data: any, target?: string): Promise<void> {
    const event: IntegrationEvent = {
      id: utilityService.generateId('event'),
      type,
      source,
      target,
      data,
      timestamp: new Date().toISOString(),
      processed: false,
      retryCount: 0
    };

    this.eventQueue.push(event);
    await this.processEvent(event);
  }

  private async processEvent(event: IntegrationEvent): Promise<void> {
    try {
      // Process internal event handlers
      await this.handleInternalEvent(event);
      
      // Trigger webhooks
      await this.triggerWebhooks(event);
      
      event.processed = true;
    } catch (error) {
      console.error('Event processing failed:', error);
      event.retryCount++;
      
      if (event.retryCount < 3) {
        // Retry after delay
        setTimeout(() => this.processEvent(event), 5000 * event.retryCount);
      }
    }
  }

  private async handleInternalEvent(event: IntegrationEvent): Promise<void> {
    switch (event.type) {
      case 'project.created':
        await this.handleProjectCreated(event.data);
        break;
      case 'task.assigned':
        await this.handleTaskAssigned(event.data);
        break;
      case 'inspection.completed':
        await this.handleInspectionCompleted(event.data);
        break;
      // Add more event handlers as needed
    }
  }

  private async handleProjectCreated(projectData: any): Promise<void> {
    // Auto-create initial project schedule
    try {
      await schedulingService.createProjectSchedule(projectData.id, {
        name: `${projectData.name} Schedule`,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        phases: [],
        milestones: [],
        criticalPath: [],
        totalDuration: 0,
        bufferTime: 14,
        riskLevel: 'medium'
      });

      // Send welcome notification
      await notificationService.createNotification({
        userId: projectData.managerId,
        type: 'project_created',
        title: 'New Project Created',
        message: `Project "${projectData.name}" has been created successfully`,
        data: { projectId: projectData.id },
        priority: 'medium'
      });
    } catch (error) {
      console.error('Failed to handle project creation:', error);
    }
  }

  private async handleTaskAssigned(taskData: any): Promise<void> {
    try {
      // Send assignment notification
      await notificationService.createNotification({
        userId: taskData.assignedToId,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned task: ${taskData.title}`,
        data: { taskId: taskData.id },
        priority: 'high'
      });

      // Update team workload
      await teamService.updateMemberWorkload(taskData.assignedToId, {
        taskId: taskData.id,
        estimatedHours: taskData.estimatedHours || 8,
        priority: taskData.priority
      });
    } catch (error) {
      console.error('Failed to handle task assignment:', error);
    }
  }

  private async handleInspectionCompleted(inspectionData: any): Promise<void> {
    try {
      // Update quality metrics
      await businessIntelligenceService.updateKPI('kpi-quality-score', inspectionData.overallScore);

      // Generate AI insights if quality score is low
      if (inspectionData.overallScore < 80) {
        await aiMLService.generateRecommendations({
          projectId: inspectionData.projectId,
          type: 'quality_improvement'
        });
      }
    } catch (error) {
      console.error('Failed to handle inspection completion:', error);
    }
  }

  // Webhook Management
  async triggerWebhooks(event: IntegrationEvent): Promise<void> {
    const relevantWebhooks = this.webhooks.filter(
      webhook => webhook.enabled && webhook.events.includes(event.type)
    );

    for (const webhook of relevantWebhooks) {
      try {
        await this.callWebhook(webhook, event);
        webhook.successCount++;
        webhook.lastTriggered = new Date().toISOString();
      } catch (error) {
        webhook.failureCount++;
        console.error(`Webhook ${webhook.name} failed:`, error);
      }
    }
  }

  private async callWebhook(webhook: WebhookEndpoint, event: IntegrationEvent): Promise<void> {
    // Simulate webhook call
    await this.delay(100);
    
    const payload = {
      event: event.type,
      data: event.data,
      timestamp: event.timestamp,
      signature: this.generateWebhookSignature(event, webhook.secret)
    };

    console.log(`Webhook ${webhook.name} called with:`, payload);
  }

  private generateWebhookSignature(event: IntegrationEvent, secret: string): string {
    // Simple signature generation (in production, use proper HMAC)
    return `sha256=${Buffer.from(JSON.stringify(event.data) + secret).toString('base64')}`;
  }

  async getWebhooks(): Promise<WebhookEndpoint[]> {
    return [...this.webhooks];
  }

  async createWebhook(webhook: Omit<WebhookEndpoint, 'id' | 'successCount' | 'failureCount'>): Promise<WebhookEndpoint> {
    const newWebhook: WebhookEndpoint = {
      ...webhook,
      id: utilityService.generateId('webhook'),
      successCount: 0,
      failureCount: 0
    };

    this.webhooks.push(newWebhook);
    return newWebhook;
  }

  // Data Synchronization
  async syncAllData(): Promise<{
    success: boolean;
    syncedServices: string[];
    errors: string[];
  }> {
    const services = ['analytics', 'team', 'scheduling', 'quality'];
    const syncedServices: string[] = [];
    const errors: string[] = [];

    for (const service of services) {
      try {
        await this.syncServiceData(service);
        syncedServices.push(service);
      } catch (error) {
        errors.push(`${service}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      syncedServices,
      errors
    };
  }

  private async syncServiceData(serviceName: string): Promise<void> {
    // Simulate data synchronization
    await this.delay(500);
    
    switch (serviceName) {
      case 'analytics':
        // Sync analytics data
        break;
      case 'team':
        // Sync team data
        break;
      case 'scheduling':
        // Sync scheduling data
        break;
      case 'quality':
        // Sync quality data
        break;
    }
  }

  // API Integration
  async callExternalAPI(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    // Simulate external API call
    await this.delay(200);
    
    return {
      success: true,
      data: { message: `API call to ${endpoint} successful` },
      timestamp: new Date().toISOString()
    };
  }

  // Backup and Recovery
  async createSystemBackup(): Promise<{
    backupId: string;
    size: number;
    createdAt: string;
    downloadUrl: string;
  }> {
    const backupId = utilityService.generateId('backup');
    
    // Simulate backup creation
    await this.delay(2000);
    
    return {
      backupId,
      size: Math.floor(Math.random() * 1000000000) + 100000000, // 100MB - 1GB
      createdAt: new Date().toISOString(),
      downloadUrl: `/api/backups/${backupId}/download`
    };
  }

  async restoreFromBackup(backupId: string): Promise<{
    success: boolean;
    restoredAt: string;
    affectedServices: string[];
  }> {
    // Simulate backup restoration
    await this.delay(3000);
    
    return {
      success: true,
      restoredAt: new Date().toISOString(),
      affectedServices: ['dataService', 'analyticsService', 'teamService']
    };
  }

  // Performance Monitoring
  async getPerformanceMetrics(): Promise<{
    responseTime: { [endpoint: string]: number };
    throughput: { [service: string]: number };
    errorRates: { [service: string]: number };
    resourceUsage: {
      cpu: number;
      memory: number;
      disk: number;
      network: number;
    };
  }> {
    return {
      responseTime: {
        '/api/projects': Math.random() * 100 + 50,
        '/api/tasks': Math.random() * 80 + 30,
        '/api/analytics': Math.random() * 200 + 100
      },
      throughput: {
        dataService: Math.random() * 1000 + 500,
        analyticsService: Math.random() * 500 + 200,
        teamService: Math.random() * 300 + 100
      },
      errorRates: {
        dataService: Math.random() * 2,
        analyticsService: Math.random() * 1,
        teamService: Math.random() * 0.5
      },
      resourceUsage: {
        cpu: Math.random() * 80 + 10,
        memory: Math.random() * 70 + 20,
        disk: Math.random() * 60 + 30,
        network: Math.random() * 50 + 10
      }
    };
  }

  // Utility Methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Service Registry
  getAvailableServices(): string[] {
    return [
      'dataService',
      'analyticsService',
      'teamService',
      'timeTrackingService',
      'notificationService',
      'schedulingService',
      'aiMLService',
      'qualitySafetyService',
      'businessIntelligenceService',
      'workflowAutomationService',
      'utilityService'
    ];
  }

  async testServiceConnectivity(serviceName: string): Promise<boolean> {
    try {
      const health = await this.checkServiceHealth(serviceName);
      return health.status !== 'down';
    } catch (error) {
      return false;
    }
  }
}

export const integrationService = new IntegrationService();
export default integrationService;
