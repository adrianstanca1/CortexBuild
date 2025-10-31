// 🏗️ Advanced Project Management Types
// Based on Procore and Fieldwire functionality

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  phases: ProjectPhaseTemplate[];
  defaultBudget: BudgetTemplate;
  defaultTeam: TeamRoleTemplate[];
  customFields: CustomField[];
  workflows: WorkflowTemplate[];
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
}

export interface ProjectPhaseTemplate {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  dependencies: string[];
  milestones: MilestoneTemplate[];
  deliverables: DeliverableTemplate[];
  requiredRoles: string[];
}

export interface MilestoneTemplate {
  id: string;
  name: string;
  description: string;
  type: MilestoneType;
  criticalPath: boolean;
  deliverables: string[];
}

export interface BudgetTemplate {
  totalBudget: number;
  costCodes: CostCodeTemplate[];
  contingency: number;
  escalation: number;
}

export interface CostCodeTemplate {
  code: string;
  name: string;
  category: CostCategory;
  budgetAmount: number;
  unit: string;
  quantity: number;
  unitCost: number;
}

export interface ProjectBudget {
  id: string;
  projectId: string;
  version: string;
  status: BudgetStatus;
  originalBudget: number;
  currentBudget: number;
  actualCost: number;
  commitments: number;
  forecastToComplete: number;
  contingency: number;
  costCodes: CostCode[];
  changeOrders: ChangeOrder[];
  approvals: BudgetApproval[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CostCode {
  id: string;
  code: string;
  name: string;
  category: CostCategory;
  phase: string;
  budgetAmount: number;
  actualCost: number;
  commitments: number;
  forecastToComplete: number;
  variance: number;
  percentComplete: number;
  unit: string;
  quantity: number;
  unitCost: number;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  subcontractorCost: number;
  otherCost: number;
}

export interface ChangeOrder {
  id: string;
  number: string;
  title: string;
  description: string;
  type: ChangeOrderType;
  status: ChangeOrderStatus;
  requestedBy: string;
  assignedTo: string;
  reason: ChangeOrderReason;
  costImpact: number;
  scheduleImpact: number; // days
  costCodes: string[];
  attachments: Attachment[];
  approvals: ChangeOrderApproval[];
  workflow: WorkflowState;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}

export interface ProjectSchedule {
  id: string;
  projectId: string;
  name: string;
  version: string;
  status: ScheduleStatus;
  startDate: Date;
  endDate: Date;
  baselineStartDate: Date;
  baselineEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  activities: ScheduleActivity[];
  milestones: Milestone[];
  criticalPath: string[];
  resources: ResourceAssignment[];
  calendars: WorkCalendar[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleActivity {
  id: string;
  wbsCode: string;
  name: string;
  description: string;
  type: ActivityType;
  status: ActivityStatus;
  duration: number;
  originalDuration: number;
  remainingDuration: number;
  percentComplete: number;
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  predecessors: ActivityDependency[];
  successors: ActivityDependency[];
  resources: ResourceAssignment[];
  costCodes: string[];
  location: string;
  phase: string;
  responsible: string;
  constraints: ActivityConstraint[];
  notes: string;
  attachments: Attachment[];
}

export interface ResourceAssignment {
  id: string;
  resourceId: string;
  resourceType: ResourceType;
  resourceName: string;
  role: string;
  units: number;
  cost: number;
  startDate: Date;
  endDate: Date;
  actualHours: number;
  plannedHours: number;
  remainingHours: number;
  overtimeHours: number;
  availability: number;
}

export interface ProjectRisk {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: RiskCategory;
  type: RiskType;
  probability: RiskProbability;
  impact: RiskImpact;
  riskScore: number;
  status: RiskStatus;
  owner: string;
  identifiedBy: string;
  identifiedDate: Date;
  mitigationPlan: string;
  contingencyPlan: string;
  costImpact: number;
  scheduleImpact: number;
  qualityImpact: RiskImpact;
  safetyImpact: RiskImpact;
  mitigationActions: RiskAction[];
  reviews: RiskReview[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectIssue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: Priority;
  severity: IssueSeverity;
  status: IssueStatus;
  reportedBy: string;
  assignedTo: string;
  dueDate: Date;
  resolution: string;
  rootCause: string;
  preventiveActions: string;
  costImpact: number;
  scheduleImpact: number;
  relatedRisks: string[];
  relatedChangeOrders: string[];
  attachments: Attachment[];
  comments: Comment[];
  workflow: WorkflowState;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface QualityControlPlan {
  id: string;
  projectId: string;
  name: string;
  version: string;
  status: QCPlanStatus;
  scope: string;
  objectives: string[];
  standards: QualityStandard[];
  inspectionPoints: InspectionPoint[];
  testingRequirements: TestingRequirement[];
  deliverables: QCDeliverable[];
  roles: QCRole[];
  procedures: QCProcedure[];
  approvals: QCApproval[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InspectionPoint {
  id: string;
  name: string;
  description: string;
  type: InspectionType;
  phase: string;
  activity: string;
  criteria: InspectionCriteria[];
  frequency: InspectionFrequency;
  responsible: string;
  required: boolean;
  holdPoint: boolean;
  witnessPoint: boolean;
  documentation: DocumentationRequirement[];
}

export interface ProjectMetrics {
  id: string;
  projectId: string;
  date: Date;
  schedule: ScheduleMetrics;
  cost: CostMetrics;
  quality: QualityMetrics;
  safety: SafetyMetrics;
  productivity: ProductivityMetrics;
  team: TeamMetrics;
  risk: RiskMetrics;
}

export interface ScheduleMetrics {
  plannedProgress: number;
  actualProgress: number;
  scheduleVariance: number;
  schedulePerformanceIndex: number;
  criticalPathDelay: number;
  milestonesOnTrack: number;
  milestonesDelayed: number;
  activitiesCompleted: number;
  activitiesInProgress: number;
  activitiesNotStarted: number;
}

export interface CostMetrics {
  budgetedCostOfWork: number;
  actualCostOfWork: number;
  earnedValue: number;
  costVariance: number;
  scheduleVariance: number;
  costPerformanceIndex: number;
  schedulePerformanceIndex: number;
  estimateAtCompletion: number;
  estimateToComplete: number;
  varianceAtCompletion: number;
}

// Enums
export enum ProjectCategory {
  COMMERCIAL = 'commercial',
  RESIDENTIAL = 'residential',
  INDUSTRIAL = 'industrial',
  INFRASTRUCTURE = 'infrastructure',
  RENOVATION = 'renovation',
  MAINTENANCE = 'maintenance'
}

export enum MilestoneType {
  START = 'start',
  FINISH = 'finish',
  DELIVERY = 'delivery',
  APPROVAL = 'approval',
  PAYMENT = 'payment',
  INSPECTION = 'inspection'
}

export enum BudgetStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  CLOSED = 'closed'
}

export enum CostCategory {
  LABOR = 'labor',
  MATERIAL = 'material',
  EQUIPMENT = 'equipment',
  SUBCONTRACTOR = 'subcontractor',
  OTHER = 'other',
  OVERHEAD = 'overhead',
  PROFIT = 'profit'
}

export enum ChangeOrderType {
  ADDITION = 'addition',
  DELETION = 'deletion',
  MODIFICATION = 'modification',
  TIME_EXTENSION = 'time_extension',
  CREDIT = 'credit'
}

export enum ChangeOrderStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented'
}

export enum ChangeOrderReason {
  DESIGN_CHANGE = 'design_change',
  SCOPE_CHANGE = 'scope_change',
  UNFORESEEN_CONDITIONS = 'unforeseen_conditions',
  OWNER_REQUEST = 'owner_request',
  REGULATORY_CHANGE = 'regulatory_change',
  MATERIAL_SUBSTITUTION = 'material_substitution',
  ERROR_OMISSION = 'error_omission'
}

export enum ActivityType {
  TASK = 'task',
  MILESTONE = 'milestone',
  SUMMARY = 'summary',
  HAMMOCK = 'hammock',
  LOE = 'loe' // Level of Effort
}

export enum ActivityStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled'
}

export enum ResourceType {
  LABOR = 'labor',
  EQUIPMENT = 'equipment',
  MATERIAL = 'material',
  COST = 'cost'
}

export enum RiskCategory {
  TECHNICAL = 'technical',
  SCHEDULE = 'schedule',
  COST = 'cost',
  QUALITY = 'quality',
  SAFETY = 'safety',
  ENVIRONMENTAL = 'environmental',
  REGULATORY = 'regulatory',
  COMMERCIAL = 'commercial'
}

export enum RiskProbability {
  VERY_LOW = 1,
  LOW = 2,
  MEDIUM = 3,
  HIGH = 4,
  VERY_HIGH = 5
}

export enum RiskImpact {
  VERY_LOW = 1,
  LOW = 2,
  MEDIUM = 3,
  HIGH = 4,
  VERY_HIGH = 5
}

export enum RiskStatus {
  IDENTIFIED = 'identified',
  ASSESSED = 'assessed',
  MITIGATED = 'mitigated',
  CLOSED = 'closed',
  REALIZED = 'realized'
}
