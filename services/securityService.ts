// CortexBuild Advanced Security & Compliance Service
import { User } from '../types';

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'data_access' | 'data_export' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userName?: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  details: any;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'authorization' | 'data_protection' | 'network' | 'compliance';
  rules: SecurityRule[];
  enabled: boolean;
  enforced: boolean;
  lastUpdated: string;
  updatedBy: string;
  violations: number;
}

export interface SecurityRule {
  id: string;
  name: string;
  condition: string;
  action: 'allow' | 'deny' | 'warn' | 'log' | 'require_approval';
  parameters: any;
  enabled: boolean;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  requirements: ComplianceRequirement[];
  applicableRoles: string[];
  lastAssessment?: string;
  complianceScore: number;
  status: 'compliant' | 'partial' | 'non_compliant' | 'unknown';
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  mandatory: boolean;
  controls: ComplianceControl[];
  evidence: ComplianceEvidence[];
  status: 'met' | 'partial' | 'not_met' | 'not_applicable';
  lastReviewed?: string;
  reviewedBy?: string;
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  type: 'preventive' | 'detective' | 'corrective';
  automated: boolean;
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  lastExecuted?: string;
  status: 'active' | 'inactive' | 'failed';
}

export interface ComplianceEvidence {
  id: string;
  type: 'document' | 'screenshot' | 'log' | 'certificate' | 'audit_report';
  name: string;
  description: string;
  fileUrl?: string;
  collectedAt: string;
  collectedBy: string;
  validUntil?: string;
}

export interface SecurityAudit {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'compliance' | 'penetration_test';
  scope: string[];
  auditor: string;
  startDate: string;
  endDate?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  findings: AuditFinding[];
  recommendations: AuditRecommendation[];
  overallRating: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'poor';
}

export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  evidence: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assignedTo?: string;
  dueDate?: string;
  resolvedAt?: string;
}

export interface AuditRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  estimatedEffort: string;
  estimatedCost?: number;
  implementationSteps: string[];
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
}

export interface ThreatIntelligence {
  id: string;
  type: 'malware' | 'phishing' | 'vulnerability' | 'breach' | 'insider_threat';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  indicators: ThreatIndicator[];
  mitigations: string[];
  affectedSystems: string[];
  publishedAt: string;
  expiresAt?: string;
  actionRequired: boolean;
}

export interface ThreatIndicator {
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'file_signature';
  value: string;
  confidence: number;
  context: string;
}

export interface SecurityMetrics {
  period: { start: string; end: string };
  events: {
    total: number;
    byType: { [type: string]: number };
    bySeverity: { [severity: string]: number };
    resolved: number;
    avgResolutionTime: number;
  };
  compliance: {
    overallScore: number;
    byFramework: { [framework: string]: number };
    requirementsMet: number;
    totalRequirements: number;
  };
  vulnerabilities: {
    total: number;
    bySeverity: { [severity: string]: number };
    resolved: number;
    avgTimeToResolve: number;
  };
  incidents: {
    total: number;
    resolved: number;
    avgImpact: string;
    trends: { [period: string]: number };
  };
}

class SecurityService {
  private events: SecurityEvent[] = [];
  private policies: SecurityPolicy[] = [];
  private frameworks: ComplianceFramework[] = [];
  private audits: SecurityAudit[] = [];
  private threats: ThreatIntelligence[] = [];

  constructor() {
    this.initializeMockData();
    this.startSecurityMonitoring();
  }

  private initializeMockData() {
    const now = new Date();

    // Initialize security events
    this.events = [
      {
        id: 'event-1',
        type: 'failed_login',
        severity: 'medium',
        userId: 'unknown',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: { country: 'UK', city: 'London' },
        details: { attempts: 3, targetUser: 'admin@cortexbuild.com' },
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        id: 'event-2',
        type: 'data_export',
        severity: 'low',
        userId: 'user-1',
        userName: 'John Manager',
        ipAddress: '192.168.1.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: { country: 'UK', city: 'London' },
        details: { exportType: 'project_data', recordCount: 150 },
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        resolved: true,
        resolvedBy: 'system',
        resolvedAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString()
      }
    ];

    // Initialize security policies
    this.policies = [
      {
        id: 'policy-password',
        name: 'Password Policy',
        description: 'Enforces strong password requirements',
        category: 'authentication',
        rules: [
          {
            id: 'rule-1',
            name: 'Minimum Length',
            condition: 'password.length >= 8',
            action: 'deny',
            parameters: { minLength: 8 },
            enabled: true
          },
          {
            id: 'rule-2',
            name: 'Complexity Requirements',
            condition: 'password.hasUppercase && password.hasLowercase && password.hasNumbers',
            action: 'deny',
            parameters: { requireUppercase: true, requireLowercase: true, requireNumbers: true },
            enabled: true
          }
        ],
        enabled: true,
        enforced: true,
        lastUpdated: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: 'admin',
        violations: 12
      }
    ];

    // Initialize compliance frameworks
    this.frameworks = [
      {
        id: 'gdpr',
        name: 'GDPR (General Data Protection Regulation)',
        description: 'EU data protection regulation compliance',
        version: '2018',
        requirements: [
          {
            id: 'gdpr-1',
            title: 'Data Protection by Design',
            description: 'Implement data protection measures from the design phase',
            category: 'Data Protection',
            mandatory: true,
            controls: [
              {
                id: 'control-1',
                name: 'Privacy Impact Assessment',
                description: 'Conduct privacy impact assessments for new features',
                type: 'preventive',
                automated: false,
                frequency: 'quarterly',
                status: 'active'
              }
            ],
            evidence: [
              {
                id: 'evidence-1',
                type: 'document',
                name: 'Privacy Policy',
                description: 'Current privacy policy document',
                collectedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                collectedBy: 'compliance-officer'
              }
            ],
            status: 'met',
            lastReviewed: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            reviewedBy: 'compliance-officer'
          }
        ],
        applicableRoles: ['admin', 'compliance_officer', 'data_controller'],
        lastAssessment: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        complianceScore: 85,
        status: 'compliant'
      }
    ];

    // Initialize security audits
    this.audits = [
      {
        id: 'audit-1',
        name: 'Q4 2024 Security Assessment',
        type: 'internal',
        scope: ['authentication', 'data_protection', 'network_security'],
        auditor: 'Internal Security Team',
        startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        findings: [
          {
            id: 'finding-1',
            title: 'Weak Password Policy Enforcement',
            description: 'Some users are still using weak passwords despite policy requirements',
            severity: 'medium',
            category: 'Authentication',
            evidence: 'Password audit revealed 15% of users with non-compliant passwords',
            recommendation: 'Implement automated password strength checking and forced updates',
            status: 'in_progress',
            assignedTo: 'security-team',
            dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        recommendations: [
          {
            id: 'rec-1',
            title: 'Implement Multi-Factor Authentication',
            description: 'Deploy MFA for all user accounts to enhance security',
            priority: 'high',
            category: 'Authentication',
            estimatedEffort: '2-3 weeks',
            estimatedCost: 5000,
            implementationSteps: [
              'Select MFA provider',
              'Configure MFA system',
              'Train users',
              'Gradual rollout'
            ],
            status: 'approved'
          }
        ],
        overallRating: 'good'
      }
    ];

    // Initialize threat intelligence
    this.threats = [
      {
        id: 'threat-1',
        type: 'vulnerability',
        title: 'Critical Node.js Vulnerability',
        description: 'Remote code execution vulnerability in Node.js versions < 18.19.0',
        severity: 'critical',
        source: 'CVE Database',
        indicators: [
          {
            type: 'hash',
            value: 'sha256:abc123...',
            confidence: 0.95,
            context: 'Malicious payload signature'
          }
        ],
        mitigations: [
          'Update Node.js to version 18.19.0 or later',
          'Review and validate all user inputs',
          'Implement additional input sanitization'
        ],
        affectedSystems: ['web-server', 'api-server'],
        publishedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        actionRequired: true
      }
    ];
  }

  private startSecurityMonitoring() {
    // Start periodic security monitoring
    setInterval(() => {
      this.performSecurityChecks();
    }, 60000); // Every minute
  }

  private performSecurityChecks() {
    // Simulate security monitoring
    const now = new Date();
    
    // Random security event generation for demonstration
    if (Math.random() < 0.1) { // 10% chance
      const eventTypes = ['login', 'data_access', 'permission_denied'];
      const severities = ['low', 'medium', 'high'];
      
      const event: SecurityEvent = {
        id: `event-${Date.now()}`,
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)] as any,
        severity: severities[Math.floor(Math.random() * severities.length)] as any,
        userId: `user-${Math.floor(Math.random() * 5) + 1}`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (compatible; SecurityMonitor/1.0)',
        location: { country: 'UK', city: 'London' },
        details: { automated: true },
        timestamp: now.toISOString(),
        resolved: false
      };

      this.events.push(event);
      
      // Keep only last 1000 events
      if (this.events.length > 1000) {
        this.events = this.events.slice(-1000);
      }
    }
  }

  // Security Events
  async getSecurityEvents(filters: {
    type?: string;
    severity?: string;
    userId?: string;
    resolved?: boolean;
    dateRange?: { start: string; end: string };
  } = {}): Promise<SecurityEvent[]> {
    let filtered = [...this.events];

    if (filters.type) {
      filtered = filtered.filter(event => event.type === filters.type);
    }

    if (filters.severity) {
      filtered = filtered.filter(event => event.severity === filters.severity);
    }

    if (filters.userId) {
      filtered = filtered.filter(event => event.userId === filters.userId);
    }

    if (filters.resolved !== undefined) {
      filtered = filtered.filter(event => event.resolved === filters.resolved);
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= start && eventDate <= end;
      });
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async resolveSecurityEvent(eventId: string, resolvedBy: string, notes?: string): Promise<boolean> {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return false;

    event.resolved = true;
    event.resolvedBy = resolvedBy;
    event.resolvedAt = new Date().toISOString();
    event.notes = notes;

    return true;
  }

  // Security Policies
  async getSecurityPolicies(): Promise<SecurityPolicy[]> {
    return [...this.policies];
  }

  async updateSecurityPolicy(policyId: string, updates: Partial<SecurityPolicy>): Promise<boolean> {
    const policy = this.policies.find(p => p.id === policyId);
    if (!policy) return false;

    Object.assign(policy, updates);
    policy.lastUpdated = new Date().toISOString();

    return true;
  }

  // Compliance Management
  async getComplianceFrameworks(): Promise<ComplianceFramework[]> {
    return [...this.frameworks];
  }

  async updateComplianceRequirement(
    frameworkId: string, 
    requirementId: string, 
    updates: Partial<ComplianceRequirement>
  ): Promise<boolean> {
    const framework = this.frameworks.find(f => f.id === frameworkId);
    if (!framework) return false;

    const requirement = framework.requirements.find(r => r.id === requirementId);
    if (!requirement) return false;

    Object.assign(requirement, updates);
    requirement.lastReviewed = new Date().toISOString();

    // Recalculate compliance score
    framework.complianceScore = this.calculateComplianceScore(framework);

    return true;
  }

  // Security Audits
  async getSecurityAudits(): Promise<SecurityAudit[]> {
    return [...this.audits];
  }

  async createSecurityAudit(audit: Omit<SecurityAudit, 'id'>): Promise<SecurityAudit> {
    const newAudit: SecurityAudit = {
      ...audit,
      id: `audit-${Date.now()}`
    };

    this.audits.push(newAudit);
    return newAudit;
  }

  // Threat Intelligence
  async getThreatIntelligence(): Promise<ThreatIntelligence[]> {
    return [...this.threats];
  }

  async getActiveThreatsByType(type: string): Promise<ThreatIntelligence[]> {
    const now = new Date();
    return this.threats.filter(threat => 
      threat.type === type && 
      (!threat.expiresAt || new Date(threat.expiresAt) > now)
    );
  }

  // Security Metrics
  async getSecurityMetrics(period: { start: string; end: string }): Promise<SecurityMetrics> {
    const start = new Date(period.start);
    const end = new Date(period.end);

    const periodEvents = this.events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= start && eventDate <= end;
    });

    const eventsByType: { [type: string]: number } = {};
    const eventsBySeverity: { [severity: string]: number } = {};

    periodEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
    });

    const resolvedEvents = periodEvents.filter(e => e.resolved);
    const avgResolutionTime = resolvedEvents.length > 0
      ? resolvedEvents.reduce((sum, event) => {
          if (event.resolvedAt) {
            return sum + (new Date(event.resolvedAt).getTime() - new Date(event.timestamp).getTime());
          }
          return sum;
        }, 0) / resolvedEvents.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    const overallComplianceScore = this.frameworks.length > 0
      ? this.frameworks.reduce((sum, f) => sum + f.complianceScore, 0) / this.frameworks.length
      : 0;

    const complianceByFramework: { [framework: string]: number } = {};
    this.frameworks.forEach(framework => {
      complianceByFramework[framework.name] = framework.complianceScore;
    });

    const totalRequirements = this.frameworks.reduce((sum, f) => sum + f.requirements.length, 0);
    const requirementsMet = this.frameworks.reduce((sum, f) => 
      sum + f.requirements.filter(r => r.status === 'met').length, 0
    );

    return {
      period,
      events: {
        total: periodEvents.length,
        byType: eventsByType,
        bySeverity: eventsBySeverity,
        resolved: resolvedEvents.length,
        avgResolutionTime
      },
      compliance: {
        overallScore: overallComplianceScore,
        byFramework: complianceByFramework,
        requirementsMet,
        totalRequirements
      },
      vulnerabilities: {
        total: this.threats.filter(t => t.type === 'vulnerability').length,
        bySeverity: this.threats.reduce((acc, threat) => {
          if (threat.type === 'vulnerability') {
            acc[threat.severity] = (acc[threat.severity] || 0) + 1;
          }
          return acc;
        }, {} as { [severity: string]: number }),
        resolved: 0, // Mock data
        avgTimeToResolve: 72 // Mock data in hours
      },
      incidents: {
        total: periodEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length,
        resolved: resolvedEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length,
        avgImpact: 'medium',
        trends: { 'last_week': 5, 'this_week': 3 }
      }
    };
  }

  // Risk Assessment
  async performRiskAssessment(): Promise<{
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: Array<{
      factor: string;
      risk: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      mitigation: string;
    }>;
    recommendations: string[];
  }> {
    const unresolvedCritical = this.events.filter(e => !e.resolved && e.severity === 'critical').length;
    const unresolvedHigh = this.events.filter(e => !e.resolved && e.severity === 'high').length;
    const activeCriticalThreats = this.threats.filter(t => t.severity === 'critical' && t.actionRequired).length;

    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (unresolvedCritical > 0 || activeCriticalThreats > 0) {
      overallRisk = 'critical';
    } else if (unresolvedHigh > 2) {
      overallRisk = 'high';
    } else if (unresolvedHigh > 0) {
      overallRisk = 'medium';
    }

    const riskFactors = [
      {
        factor: 'Unresolved Security Events',
        risk: unresolvedCritical > 0 ? 'critical' as const : unresolvedHigh > 0 ? 'high' as const : 'low' as const,
        description: `${unresolvedCritical} critical and ${unresolvedHigh} high severity events unresolved`,
        mitigation: 'Prioritize resolution of critical and high severity security events'
      },
      {
        factor: 'Compliance Status',
        risk: this.frameworks.some(f => f.complianceScore < 70) ? 'high' as const : 'low' as const,
        description: 'Some compliance frameworks below acceptable threshold',
        mitigation: 'Address compliance gaps and update controls'
      }
    ];

    const recommendations = [
      'Implement automated threat detection and response',
      'Conduct regular security awareness training',
      'Establish incident response procedures',
      'Perform regular vulnerability assessments'
    ];

    return { overallRisk, riskFactors, recommendations };
  }

  // Private helper methods
  private calculateComplianceScore(framework: ComplianceFramework): number {
    if (framework.requirements.length === 0) return 0;

    const scores = framework.requirements.map(req => {
      switch (req.status) {
        case 'met': return 100;
        case 'partial': return 50;
        case 'not_met': return 0;
        case 'not_applicable': return 100;
        default: return 0;
      }
    });

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }
}

export const securityService = new SecurityService();
export default securityService;
