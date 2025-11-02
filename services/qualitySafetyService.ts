// CortexBuild Quality Control & Safety Management Service
import { User, Project } from '../types';

export interface QualityInspection {
  id: string;
  projectId: string;
  inspectionType: 'quality' | 'safety' | 'compliance' | 'environmental';
  title: string;
  description: string;
  inspectorId: string;
  inspectorName: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  location: string;
  checklist: ChecklistItem[];
  findings: Finding[];
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  photos: string[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  requirement: string;
  status: 'pass' | 'fail' | 'na' | 'pending';
  notes?: string;
  photos?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Finding {
  id: string;
  type: 'defect' | 'non-compliance' | 'safety-hazard' | 'improvement' | 'observation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  category: string;
  photos: string[];
  correctiveAction: string;
  assignedToId?: string;
  dueDate?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'verified' | 'closed';
  createdAt: string;
  resolvedAt?: string;
}

export interface SafetyIncident {
  id: string;
  projectId: string;
  incidentType: 'near-miss' | 'injury' | 'property-damage' | 'environmental' | 'security';
  severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
  title: string;
  description: string;
  location: string;
  dateOccurred: string;
  reportedBy: string;
  reportedAt: string;
  personsInvolved: string[];
  witnesses: string[];
  immediateActions: string;
  rootCause?: string;
  correctiveActions: CorrectiveAction[];
  preventiveActions: PreventiveAction[];
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  investigatorId?: string;
  photos: string[];
  documents: string[];
}

export interface CorrectiveAction {
  id: string;
  description: string;
  assignedToId: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completedAt?: string;
  notes?: string;
}

export interface PreventiveAction {
  id: string;
  description: string;
  implementationDate: string;
  responsibleParty: string;
  status: 'planned' | 'implementing' | 'implemented' | 'monitoring';
  effectiveness?: 'low' | 'medium' | 'high';
}

export interface QualityMetrics {
  period: { start: string; end: string };
  inspections: {
    total: number;
    completed: number;
    passed: number;
    failed: number;
    averageScore: number;
  };
  findings: {
    total: number;
    open: number;
    resolved: number;
    byType: { [type: string]: number };
    bySeverity: { [severity: string]: number };
  };
  incidents: {
    total: number;
    byType: { [type: string]: number };
    bySeverity: { [severity: string]: number };
    resolved: number;
  };
  trends: {
    qualityTrend: 'improving' | 'stable' | 'declining';
    safetyTrend: 'improving' | 'stable' | 'declining';
    complianceRate: number;
  };
}

export interface ComplianceStandard {
  id: string;
  name: string;
  description: string;
  category: 'safety' | 'quality' | 'environmental' | 'building-code';
  requirements: ComplianceRequirement[];
  applicableProjects: string[];
  lastUpdated: string;
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  mandatory: boolean;
  checkpoints: string[];
  documentation: string[];
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
}

class QualitySafetyService {
  private inspections: QualityInspection[] = [];
  private incidents: SafetyIncident[] = [];
  private complianceStandards: ComplianceStandard[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Initialize mock inspections
    this.inspections = [
      {
        id: 'insp-1',
        projectId: 'project-1',
        inspectionType: 'quality',
        title: 'Facade Installation Quality Check - Floor 15-20',
        description: 'Comprehensive quality inspection of facade panel installation',
        inspectorId: 'user-2',
        inspectorName: 'Adrian ASC',
        scheduledDate: now.toISOString(),
        completedDate: now.toISOString(),
        status: 'completed',
        location: 'Canary Wharf Tower - Floors 15-20',
        checklist: [
          {
            id: 'check-1',
            category: 'Installation',
            item: 'Panel Alignment',
            requirement: 'All panels must be aligned within 2mm tolerance',
            status: 'pass',
            notes: 'All panels properly aligned',
            priority: 'high'
          },
          {
            id: 'check-2',
            category: 'Safety',
            item: 'Fall Protection',
            requirement: 'All workers must use proper fall protection equipment',
            status: 'pass',
            priority: 'critical'
          },
          {
            id: 'check-3',
            category: 'Quality',
            item: 'Sealant Application',
            requirement: 'Sealant must be applied continuously with no gaps',
            status: 'fail',
            notes: 'Minor gaps found in sealant on Floor 17',
            priority: 'medium'
          }
        ],
        findings: [
          {
            id: 'find-1',
            type: 'defect',
            severity: 'medium',
            title: 'Sealant Gaps on Floor 17',
            description: 'Small gaps in sealant application found on 3 panels',
            location: 'Floor 17, East facade',
            category: 'Weatherproofing',
            photos: ['photo1.jpg', 'photo2.jpg'],
            correctiveAction: 'Re-apply sealant to affected areas',
            assignedToId: 'user-3',
            dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'open',
            createdAt: now.toISOString()
          }
        ],
        overallScore: 85,
        riskLevel: 'low',
        photos: ['inspection1.jpg', 'inspection2.jpg'],
        documents: ['inspection-report.pdf'],
        createdAt: yesterday.toISOString(),
        updatedAt: now.toISOString()
      }
    ];

    // Initialize mock incidents
    this.incidents = [
      {
        id: 'inc-1',
        projectId: 'project-1',
        incidentType: 'near-miss',
        severity: 'moderate',
        title: 'Near Miss - Falling Tool',
        description: 'A hammer fell from Floor 18 but no one was injured as the area was cordoned off',
        location: 'Canary Wharf Tower - Floor 18',
        dateOccurred: yesterday.toISOString(),
        reportedBy: 'John Worker',
        reportedAt: yesterday.toISOString(),
        personsInvolved: ['John Worker'],
        witnesses: ['Jane Supervisor'],
        immediateActions: 'Area secured, tool tethering checked on all floors',
        rootCause: 'Tool tether was not properly secured',
        correctiveActions: [
          {
            id: 'ca-1',
            description: 'Retrain all workers on proper tool tethering procedures',
            assignedToId: 'user-2',
            dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'in-progress'
          }
        ],
        preventiveActions: [
          {
            id: 'pa-1',
            description: 'Implement daily tool tether inspections',
            implementationDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            responsibleParty: 'Safety Officer',
            status: 'planned'
          }
        ],
        status: 'investigating',
        investigatorId: 'user-2',
        photos: ['incident1.jpg'],
        documents: ['incident-report.pdf']
      }
    ];

    // Initialize compliance standards
    this.complianceStandards = [
      {
        id: 'std-1',
        name: 'CDM Regulations 2015',
        description: 'Construction (Design and Management) Regulations 2015',
        category: 'safety',
        requirements: [
          {
            id: 'req-1',
            title: 'Principal Designer Duties',
            description: 'Ensure health and safety is considered during design phase',
            mandatory: true,
            checkpoints: ['Design risk assessment', 'Pre-construction information'],
            documentation: ['Design risk register', 'Health and safety file'],
            frequency: 'once'
          }
        ],
        applicableProjects: ['project-1'],
        lastUpdated: '2024-01-01T00:00:00Z'
      }
    ];
  }

  // Get quality inspections
  async getInspections(filters: {
    projectId?: string;
    inspectionType?: string;
    status?: string;
    inspectorId?: string;
    dateRange?: { start: string; end: string };
  } = {}): Promise<QualityInspection[]> {
    let filtered = [...this.inspections];

    if (filters.projectId) {
      filtered = filtered.filter(insp => insp.projectId === filters.projectId);
    }

    if (filters.inspectionType) {
      filtered = filtered.filter(insp => insp.inspectionType === filters.inspectionType);
    }

    if (filters.status) {
      filtered = filtered.filter(insp => insp.status === filters.status);
    }

    if (filters.inspectorId) {
      filtered = filtered.filter(insp => insp.inspectorId === filters.inspectorId);
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filtered = filtered.filter(insp => {
        const date = new Date(insp.scheduledDate);
        return date >= start && date <= end;
      });
    }

    return filtered.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }

  // Create new inspection
  async createInspection(inspection: Omit<QualityInspection, 'id' | 'createdAt' | 'updatedAt'>): Promise<QualityInspection> {
    const now = new Date().toISOString();
    const newInspection: QualityInspection = {
      ...inspection,
      id: `insp-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    this.inspections.push(newInspection);
    return newInspection;
  }

  // Update inspection
  async updateInspection(id: string, updates: Partial<QualityInspection>): Promise<QualityInspection | null> {
    const index = this.inspections.findIndex(insp => insp.id === id);
    if (index === -1) return null;

    this.inspections[index] = {
      ...this.inspections[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.inspections[index];
  }

  // Get safety incidents
  async getIncidents(filters: {
    projectId?: string;
    incidentType?: string;
    severity?: string;
    status?: string;
    dateRange?: { start: string; end: string };
  } = {}): Promise<SafetyIncident[]> {
    let filtered = [...this.incidents];

    if (filters.projectId) {
      filtered = filtered.filter(inc => inc.projectId === filters.projectId);
    }

    if (filters.incidentType) {
      filtered = filtered.filter(inc => inc.incidentType === filters.incidentType);
    }

    if (filters.severity) {
      filtered = filtered.filter(inc => inc.severity === filters.severity);
    }

    if (filters.status) {
      filtered = filtered.filter(inc => inc.status === filters.status);
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filtered = filtered.filter(inc => {
        const date = new Date(inc.dateOccurred);
        return date >= start && date <= end;
      });
    }

    return filtered.sort((a, b) => new Date(b.dateOccurred).getTime() - new Date(a.dateOccurred).getTime());
  }

  // Create safety incident
  async createIncident(incident: Omit<SafetyIncident, 'id'>): Promise<SafetyIncident> {
    const newIncident: SafetyIncident = {
      ...incident,
      id: `inc-${Date.now()}`
    };

    this.incidents.push(newIncident);
    return newIncident;
  }

  // Update incident
  async updateIncident(id: string, updates: Partial<SafetyIncident>): Promise<SafetyIncident | null> {
    const index = this.incidents.findIndex(inc => inc.id === id);
    if (index === -1) return null;

    this.incidents[index] = {
      ...this.incidents[index],
      ...updates
    };

    return this.incidents[index];
  }

  // Get quality metrics
  async getQualityMetrics(projectId?: string, period?: { start: string; end: string }): Promise<QualityMetrics> {
    const defaultPeriod = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    };

    const actualPeriod = period || defaultPeriod;
    
    let inspections = this.inspections;
    let incidents = this.incidents;

    if (projectId) {
      inspections = inspections.filter(insp => insp.projectId === projectId);
      incidents = incidents.filter(inc => inc.projectId === projectId);
    }

    // Filter by period
    const start = new Date(actualPeriod.start);
    const end = new Date(actualPeriod.end);
    
    inspections = inspections.filter(insp => {
      const date = new Date(insp.scheduledDate);
      return date >= start && date <= end;
    });

    incidents = incidents.filter(inc => {
      const date = new Date(inc.dateOccurred);
      return date >= start && date <= end;
    });

    // Calculate metrics
    const totalInspections = inspections.length;
    const completedInspections = inspections.filter(insp => insp.status === 'completed').length;
    const passedInspections = inspections.filter(insp => insp.status === 'completed' && insp.overallScore >= 80).length;
    const failedInspections = completedInspections - passedInspections;
    const averageScore = completedInspections > 0 
      ? inspections.filter(insp => insp.status === 'completed').reduce((sum, insp) => sum + insp.overallScore, 0) / completedInspections
      : 0;

    const allFindings = inspections.flatMap(insp => insp.findings);
    const totalFindings = allFindings.length;
    const openFindings = allFindings.filter(finding => finding.status === 'open' || finding.status === 'in-progress').length;
    const resolvedFindings = totalFindings - openFindings;

    const findingsByType: { [type: string]: number } = {};
    const findingsBySeverity: { [severity: string]: number } = {};
    
    allFindings.forEach(finding => {
      findingsByType[finding.type] = (findingsByType[finding.type] || 0) + 1;
      findingsBySeverity[finding.severity] = (findingsBySeverity[finding.severity] || 0) + 1;
    });

    const incidentsByType: { [type: string]: number } = {};
    const incidentsBySeverity: { [severity: string]: number } = {};
    
    incidents.forEach(incident => {
      incidentsByType[incident.incidentType] = (incidentsByType[incident.incidentType] || 0) + 1;
      incidentsBySeverity[incident.severity] = (incidentsBySeverity[incident.severity] || 0) + 1;
    });

    const resolvedIncidents = incidents.filter(inc => inc.status === 'resolved' || inc.status === 'closed').length;

    return {
      period: actualPeriod,
      inspections: {
        total: totalInspections,
        completed: completedInspections,
        passed: passedInspections,
        failed: failedInspections,
        averageScore: Math.round(averageScore * 10) / 10
      },
      findings: {
        total: totalFindings,
        open: openFindings,
        resolved: resolvedFindings,
        byType: findingsByType,
        bySeverity: findingsBySeverity
      },
      incidents: {
        total: incidents.length,
        byType: incidentsByType,
        bySeverity: incidentsBySeverity,
        resolved: resolvedIncidents
      },
      trends: {
        qualityTrend: averageScore >= 85 ? 'improving' : averageScore >= 75 ? 'stable' : 'declining',
        safetyTrend: incidents.length <= 2 ? 'improving' : incidents.length <= 5 ? 'stable' : 'declining',
        complianceRate: completedInspections > 0 ? (passedInspections / completedInspections) * 100 : 0
      }
    };
  }

  // Get compliance standards
  async getComplianceStandards(category?: string): Promise<ComplianceStandard[]> {
    let standards = [...this.complianceStandards];
    
    if (category) {
      standards = standards.filter(std => std.category === category);
    }

    return standards;
  }

  // Generate quality report
  async generateQualityReport(projectId: string, period: { start: string; end: string }): Promise<{
    summary: QualityMetrics;
    inspections: QualityInspection[];
    incidents: SafetyIncident[];
    recommendations: string[];
  }> {
    const summary = await this.getQualityMetrics(projectId, period);
    const inspections = await this.getInspections({ projectId, dateRange: period });
    const incidents = await this.getIncidents({ projectId, dateRange: period });

    const recommendations = [];
    
    if (summary.inspections.averageScore < 80) {
      recommendations.push('Increase quality control measures and inspector training');
    }
    
    if (summary.incidents.total > 3) {
      recommendations.push('Review and enhance safety protocols');
    }
    
    if (summary.findings.open > summary.findings.resolved) {
      recommendations.push('Accelerate resolution of open findings');
    }

    return {
      summary,
      inspections,
      incidents,
      recommendations
    };
  }
}

export const qualitySafetyService = new QualitySafetyService();
export default qualitySafetyService;
