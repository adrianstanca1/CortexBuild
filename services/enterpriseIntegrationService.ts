// CortexBuild Enterprise Integration Hub
export interface IntegrationProvider {
  id: string;
  name: string;
  type: 'erp' | 'crm' | 'accounting' | 'hr' | 'project' | 'communication' | 'storage' | 'analytics' | 'custom';
  category: 'finance' | 'operations' | 'hr' | 'communication' | 'storage' | 'analytics' | 'productivity';
  description: string;
  logo: string;
  website: string;
  status: 'active' | 'inactive' | 'deprecated' | 'beta';
  features: string[];
  pricing: PricingTier[];
  authentication: AuthenticationMethod;
  endpoints: APIEndpoint[];
  webhooks: WebhookConfig[];
  dataMapping: DataMapping[];
  compliance: ComplianceStandard[];
}

export interface PricingTier {
  name: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  limits: { [key: string]: number };
}

export interface AuthenticationMethod {
  type: 'oauth2' | 'api-key' | 'basic' | 'jwt' | 'custom';
  scopes?: string[];
  redirectUrl?: string;
  tokenEndpoint?: string;
  authEndpoint?: string;
  refreshable: boolean;
  expiresIn?: number;
}

export interface APIEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  description: string;
  parameters: APIParameter[];
  response: APIResponse;
  rateLimit?: RateLimit;
  authentication: boolean;
}

export interface APIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example?: any;
  validation?: ValidationRule[];
}

export interface APIResponse {
  schema: any;
  examples: { [statusCode: string]: any };
  headers?: { [key: string]: string };
}

export interface RateLimit {
  requests: number;
  period: 'second' | 'minute' | 'hour' | 'day';
  burst?: number;
}

export interface WebhookConfig {
  event: string;
  url: string;
  method: 'POST' | 'PUT';
  headers: { [key: string]: string };
  payload: any;
  retryPolicy: RetryPolicy;
  security: WebhookSecurity;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;
  maxDelay: number;
}

export interface WebhookSecurity {
  signatureHeader: string;
  algorithm: 'sha256' | 'sha1' | 'md5';
  secret: string;
  verifySSL: boolean;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transformation?: DataTransformation;
  validation?: ValidationRule[];
  required: boolean;
}

export interface DataTransformation {
  type: 'format' | 'calculate' | 'lookup' | 'conditional' | 'custom';
  config: any;
  script?: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface ComplianceStandard {
  name: string;
  version: string;
  description: string;
  requirements: string[];
  certified: boolean;
  certificationDate?: string;
}

export interface IntegrationConnection {
  id: string;
  providerId: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  credentials: EncryptedCredentials;
  configuration: IntegrationConfig;
  lastSync: string;
  syncFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  dataFlow: 'bidirectional' | 'inbound' | 'outbound';
  errorLog: IntegrationError[];
  metrics: IntegrationMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedCredentials {
  encrypted: string;
  algorithm: string;
  keyId: string;
  expiresAt?: string;
}

export interface IntegrationConfig {
  syncSettings: SyncSettings;
  fieldMappings: { [key: string]: string };
  filters: DataFilter[];
  transformations: DataTransformation[];
  notifications: NotificationSettings;
  errorHandling: ErrorHandlingConfig;
}

export interface SyncSettings {
  enabled: boolean;
  direction: 'bidirectional' | 'inbound' | 'outbound';
  frequency: string;
  batchSize: number;
  conflictResolution: 'source-wins' | 'target-wins' | 'manual' | 'timestamp';
  deletionHandling: 'sync' | 'mark' | 'ignore';
}

export interface DataFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'in' | 'not-in';
  value: any;
  active: boolean;
}

export interface NotificationSettings {
  onSuccess: boolean;
  onError: boolean;
  onWarning: boolean;
  channels: ('email' | 'slack' | 'webhook' | 'sms')[];
  recipients: string[];
}

export interface ErrorHandlingConfig {
  retryAttempts: number;
  retryDelay: number;
  escalationThreshold: number;
  fallbackAction: 'stop' | 'continue' | 'rollback';
  notifyOnError: boolean;
}

export interface IntegrationError {
  id: string;
  timestamp: string;
  type: 'authentication' | 'network' | 'validation' | 'transformation' | 'business-logic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: any;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface IntegrationMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  dataVolume: number;
  lastSyncDuration: number;
  errorRate: number;
  uptime: number;
}

export interface DataSyncJob {
  id: string;
  connectionId: string;
  type: 'full' | 'incremental' | 'delta';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errors: IntegrationError[];
  progress: number;
  logs: SyncLog[];
}

export interface SyncLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

class EnterpriseIntegrationService {
  private providers: IntegrationProvider[] = [];
  private connections: IntegrationConnection[] = [];
  private syncJobs: DataSyncJob[] = [];

  constructor() {
    this.initializeProviders();
    this.initializeMockConnections();
  }

  private initializeProviders(): void {
    this.providers = [
      {
        id: 'sage-300',
        name: 'Sage 300',
        type: 'erp',
        category: 'finance',
        description: 'Enterprise Resource Planning system for construction companies',
        logo: '/integrations/sage-300.png',
        website: 'https://www.sage.com/en-gb/products/sage-300/',
        status: 'active',
        features: ['Financial Management', 'Project Accounting', 'Inventory Management'],
        pricing: [
          {
            name: 'Professional',
            price: 299,
            currency: 'GBP',
            period: 'monthly',
            features: ['Basic ERP', 'Financial Reports'],
            limits: { users: 10, projects: 100 }
          }
        ],
        authentication: {
          type: 'api-key',
          refreshable: false
        },
        endpoints: [
          {
            name: 'Get Projects',
            method: 'GET',
            url: '/api/v1/projects',
            description: 'Retrieve all projects',
            parameters: [],
            response: { schema: {}, examples: {} },
            authentication: true
          }
        ],
        webhooks: [],
        dataMapping: [],
        compliance: [
          {
            name: 'SOX',
            version: '2002',
            description: 'Sarbanes-Oxley Act compliance',
            requirements: ['Financial reporting', 'Internal controls'],
            certified: true,
            certificationDate: '2024-01-01'
          }
        ]
      },
      {
        id: 'microsoft-365',
        name: 'Microsoft 365',
        type: 'communication',
        category: 'productivity',
        description: 'Comprehensive productivity and collaboration suite',
        logo: '/integrations/microsoft-365.png',
        website: 'https://www.microsoft.com/en-gb/microsoft-365',
        status: 'active',
        features: ['Email', 'Calendar', 'Teams', 'SharePoint', 'OneDrive'],
        pricing: [
          {
            name: 'Business Premium',
            price: 18.40,
            currency: 'GBP',
            period: 'monthly',
            features: ['Full Office Suite', 'Teams', 'SharePoint'],
            limits: { users: 300, storage: 1000 }
          }
        ],
        authentication: {
          type: 'oauth2',
          scopes: ['https://graph.microsoft.com/.default'],
          redirectUrl: 'https://cortexbuild.com/auth/microsoft/callback',
          tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          authEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
          refreshable: true,
          expiresIn: 3600
        },
        endpoints: [
          {
            name: 'Get Calendar Events',
            method: 'GET',
            url: 'https://graph.microsoft.com/v1.0/me/events',
            description: 'Retrieve calendar events',
            parameters: [
              {
                name: 'startDateTime',
                type: 'string',
                required: false,
                description: 'Start date for events',
                example: '2024-01-01T00:00:00Z'
              }
            ],
            response: { schema: {}, examples: {} },
            authentication: true,
            rateLimit: { requests: 10000, period: 'hour' }
          }
        ],
        webhooks: [
          {
            event: 'calendar.event.created',
            url: 'https://cortexbuild.com/webhooks/microsoft/calendar',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            payload: {},
            retryPolicy: {
              maxRetries: 3,
              backoffStrategy: 'exponential',
              initialDelay: 1000,
              maxDelay: 30000
            },
            security: {
              signatureHeader: 'X-Microsoft-Signature',
              algorithm: 'sha256',
              secret: 'webhook-secret',
              verifySSL: true
            }
          }
        ],
        dataMapping: [
          {
            sourceField: 'subject',
            targetField: 'title',
            required: true
          },
          {
            sourceField: 'start.dateTime',
            targetField: 'startDate',
            transformation: {
              type: 'format',
              config: { from: 'ISO8601', to: 'YYYY-MM-DD HH:mm:ss' }
            },
            required: true
          }
        ],
        compliance: [
          {
            name: 'GDPR',
            version: '2018',
            description: 'General Data Protection Regulation',
            requirements: ['Data encryption', 'Right to be forgotten'],
            certified: true,
            certificationDate: '2024-01-01'
          }
        ]
      },
      {
        id: 'autodesk-bim360',
        name: 'Autodesk BIM 360',
        type: 'project',
        category: 'operations',
        description: 'Construction project management and collaboration platform',
        logo: '/integrations/bim360.png',
        website: 'https://www.autodesk.com/products/bim-360/',
        status: 'active',
        features: ['Document Management', 'Model Coordination', 'Field Management'],
        pricing: [
          {
            name: 'Build',
            price: 35,
            currency: 'GBP',
            period: 'monthly',
            features: ['Document Management', 'RFIs', 'Issues'],
            limits: { projects: 50, storage: 100 }
          }
        ],
        authentication: {
          type: 'oauth2',
          scopes: ['data:read', 'data:write'],
          refreshable: true,
          expiresIn: 3600
        },
        endpoints: [],
        webhooks: [],
        dataMapping: [],
        compliance: []
      }
    ];
  }

  private initializeMockConnections(): void {
    this.connections = [
      {
        id: 'conn-sage-001',
        providerId: 'sage-300',
        name: 'Main Sage 300 Connection',
        status: 'connected',
        credentials: {
          encrypted: 'encrypted-credentials-data',
          algorithm: 'AES-256-GCM',
          keyId: 'key-001'
        },
        configuration: {
          syncSettings: {
            enabled: true,
            direction: 'bidirectional',
            frequency: 'daily',
            batchSize: 100,
            conflictResolution: 'timestamp',
            deletionHandling: 'mark'
          },
          fieldMappings: {
            'project_code': 'projectId',
            'project_name': 'name',
            'budget': 'totalBudget'
          },
          filters: [],
          transformations: [],
          notifications: {
            onSuccess: true,
            onError: true,
            onWarning: false,
            channels: ['email'],
            recipients: ['admin@company.com']
          },
          errorHandling: {
            retryAttempts: 3,
            retryDelay: 5000,
            escalationThreshold: 5,
            fallbackAction: 'stop',
            notifyOnError: true
          }
        },
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        syncFrequency: 'daily',
        dataFlow: 'bidirectional',
        errorLog: [],
        metrics: {
          totalSyncs: 45,
          successfulSyncs: 43,
          failedSyncs: 2,
          averageSyncTime: 120,
          dataVolume: 15000,
          lastSyncDuration: 95,
          errorRate: 4.4,
          uptime: 95.6
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Public API Methods
  async getAvailableProviders(category?: string): Promise<IntegrationProvider[]> {
    let providers = [...this.providers];
    
    if (category) {
      providers = providers.filter(p => p.category === category);
    }

    return providers.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getProvider(id: string): Promise<IntegrationProvider | null> {
    return this.providers.find(p => p.id === id) || null;
  }

  async createConnection(
    providerId: string,
    name: string,
    credentials: any,
    configuration: Partial<IntegrationConfig>
  ): Promise<IntegrationConnection> {
    const provider = await this.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    // Encrypt credentials
    const encryptedCredentials: EncryptedCredentials = {
      encrypted: this.encryptCredentials(credentials),
      algorithm: 'AES-256-GCM',
      keyId: 'key-001'
    };

    const connection: IntegrationConnection = {
      id: `conn-${providerId}-${Date.now()}`,
      providerId,
      name,
      status: 'pending',
      credentials: encryptedCredentials,
      configuration: this.mergeWithDefaults(configuration),
      lastSync: new Date().toISOString(),
      syncFrequency: 'daily',
      dataFlow: 'bidirectional',
      errorLog: [],
      metrics: {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        averageSyncTime: 0,
        dataVolume: 0,
        lastSyncDuration: 0,
        errorRate: 0,
        uptime: 100
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Test connection
    const testResult = await this.testConnection(connection);
    connection.status = testResult.success ? 'connected' : 'error';

    if (!testResult.success) {
      connection.errorLog.push({
        id: `error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'authentication',
        severity: 'high',
        message: testResult.error || 'Connection test failed',
        details: testResult,
        resolved: false
      });
    }

    this.connections.push(connection);
    return connection;
  }

  async getConnections(): Promise<IntegrationConnection[]> {
    return [...this.connections];
  }

  async getConnection(id: string): Promise<IntegrationConnection | null> {
    return this.connections.find(c => c.id === id) || null;
  }

  async updateConnection(
    id: string,
    updates: Partial<IntegrationConnection>
  ): Promise<IntegrationConnection | null> {
    const connectionIndex = this.connections.findIndex(c => c.id === id);
    if (connectionIndex === -1) return null;

    this.connections[connectionIndex] = {
      ...this.connections[connectionIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.connections[connectionIndex];
  }

  async deleteConnection(id: string): Promise<boolean> {
    const connectionIndex = this.connections.findIndex(c => c.id === id);
    if (connectionIndex === -1) return false;

    this.connections.splice(connectionIndex, 1);
    return true;
  }

  async testConnection(connection: IntegrationConnection): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock test result
      const success = Math.random() > 0.1; // 90% success rate
      
      return {
        success,
        error: success ? undefined : 'Authentication failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async startSync(connectionId: string, type: 'full' | 'incremental' = 'incremental'): Promise<DataSyncJob> {
    const connection = await this.getConnection(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const syncJob: DataSyncJob = {
      id: `sync-${Date.now()}`,
      connectionId,
      type,
      status: 'pending',
      startTime: new Date().toISOString(),
      recordsProcessed: 0,
      recordsSuccessful: 0,
      recordsFailed: 0,
      errors: [],
      progress: 0,
      logs: []
    };

    this.syncJobs.push(syncJob);

    // Start sync process
    this.executeSyncJob(syncJob);

    return syncJob;
  }

  async getSyncJobs(connectionId?: string): Promise<DataSyncJob[]> {
    let jobs = [...this.syncJobs];
    
    if (connectionId) {
      jobs = jobs.filter(job => job.connectionId === connectionId);
    }

    return jobs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  async getSyncJob(id: string): Promise<DataSyncJob | null> {
    return this.syncJobs.find(job => job.id === id) || null;
  }

  async cancelSyncJob(id: string): Promise<boolean> {
    const job = await this.getSyncJob(id);
    if (!job || job.status !== 'running') return false;

    job.status = 'cancelled';
    job.endTime = new Date().toISOString();
    job.duration = new Date(job.endTime).getTime() - new Date(job.startTime).getTime();

    return true;
  }

  // Private helper methods
  private encryptCredentials(credentials: any): string {
    // Mock encryption - in real implementation, use proper encryption
    return Buffer.from(JSON.stringify(credentials)).toString('base64');
  }

  private mergeWithDefaults(config: Partial<IntegrationConfig>): IntegrationConfig {
    return {
      syncSettings: {
        enabled: true,
        direction: 'bidirectional',
        frequency: 'daily',
        batchSize: 100,
        conflictResolution: 'timestamp',
        deletionHandling: 'mark',
        ...config.syncSettings
      },
      fieldMappings: config.fieldMappings || {},
      filters: config.filters || [],
      transformations: config.transformations || [],
      notifications: {
        onSuccess: false,
        onError: true,
        onWarning: false,
        channels: ['email'],
        recipients: [],
        ...config.notifications
      },
      errorHandling: {
        retryAttempts: 3,
        retryDelay: 5000,
        escalationThreshold: 5,
        fallbackAction: 'stop',
        notifyOnError: true,
        ...config.errorHandling
      }
    };
  }

  private async executeSyncJob(job: DataSyncJob): Promise<void> {
    job.status = 'running';
    job.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Sync job started'
    });

    try {
      // Simulate sync process
      const totalRecords = Math.floor(Math.random() * 1000) + 100;
      
      for (let i = 0; i < totalRecords; i++) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 10));
        
        job.recordsProcessed = i + 1;
        job.progress = Math.round((i + 1) / totalRecords * 100);
        
        // Simulate occasional failures
        if (Math.random() < 0.05) { // 5% failure rate
          job.recordsFailed++;
          job.errors.push({
            id: `error-${Date.now()}-${i}`,
            timestamp: new Date().toISOString(),
            type: 'validation',
            severity: 'medium',
            message: `Validation failed for record ${i}`,
            details: { recordId: i },
            resolved: false
          });
        } else {
          job.recordsSuccessful++;
        }
      }

      job.status = 'completed';
      job.logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Sync completed. Processed: ${job.recordsProcessed}, Successful: ${job.recordsSuccessful}, Failed: ${job.recordsFailed}`
      });

    } catch (error) {
      job.status = 'failed';
      job.errors.push({
        id: `error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'business-logic',
        severity: 'critical',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
        resolved: false
      });
      
      job.logs.push({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      job.endTime = new Date().toISOString();
      job.duration = new Date(job.endTime).getTime() - new Date(job.startTime).getTime();
      
      // Update connection metrics
      const connection = await this.getConnection(job.connectionId);
      if (connection) {
        connection.metrics.totalSyncs++;
        if (job.status === 'completed') {
          connection.metrics.successfulSyncs++;
        } else {
          connection.metrics.failedSyncs++;
        }
        connection.metrics.errorRate = (connection.metrics.failedSyncs / connection.metrics.totalSyncs) * 100;
        connection.metrics.lastSyncDuration = job.duration || 0;
        connection.lastSync = job.endTime || new Date().toISOString();
      }
    }
  }
}

export const enterpriseIntegrationService = new EnterpriseIntegrationService();
export default enterpriseIntegrationService;
