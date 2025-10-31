// 🏗️ Document Management Types
// Comprehensive document management types inspired by Procore and Fieldwire

export interface Document {
  id: string;
  projectId: string;
  name: string;
  description: string;
  type: DocumentType;
  category: DocumentCategory;
  discipline: string;
  version: string;
  status: DocumentStatus;
  file: FileInfo;
  metadata: DocumentMetadata;
  permissions: DocumentPermission[];
  workflow: WorkflowState;
  revisions: DocumentRevision[];
  markups: DocumentMarkup[];
  comments: DocumentComment[];
  tags: string[];
  customFields: CustomFieldValue[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  archivedAt?: Date;
}

export interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  checksum: string;
  storageLocation: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface DocumentMetadata {
  title?: string;
  subject?: string;
  author?: string;
  keywords?: string[];
  pageCount?: number;
  dimensions?: {
    width: number;
    height: number;
    units: 'mm' | 'in' | 'ft';
  };
  scale?: string;
  drawingNumber?: string;
  sheetNumber?: string;
  revisionNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  language?: string;
  format?: string;
}

export interface DocumentPermission {
  id: string;
  userId?: string;
  roleId?: string;
  companyId?: string;
  permissions: DocumentAction[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

export interface WorkflowState {
  id: string;
  workflowId: string;
  currentStep: WorkflowStep;
  status: WorkflowStatus;
  assignedTo: string[];
  dueDate?: Date;
  startedAt: Date;
  completedAt?: Date;
  history: WorkflowHistory[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: WorkflowStepType;
  order: number;
  required: boolean;
  assigneeType: 'user' | 'role' | 'company';
  assignees: string[];
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  timeLimit?: number; // hours
  escalation?: WorkflowEscalation;
}

export interface DocumentRevision {
  id: string;
  version: string;
  description: string;
  changes: RevisionChange[];
  file: FileInfo;
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  supersedes?: string;
}

export interface RevisionChange {
  id: string;
  type: ChangeType;
  description: string;
  location?: string;
  impact: ChangeImpact;
  reason: string;
  affectedSections: string[];
}

export interface DocumentMarkup {
  id: string;
  documentId: string;
  pageNumber: number;
  type: MarkupType;
  coordinates: MarkupCoordinates;
  content: string;
  color: string;
  strokeWidth: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  layer: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  replies: MarkupReply[];
  status: MarkupStatus;
  assignedTo?: string;
  dueDate?: Date;
}

export interface MarkupCoordinates {
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Point[];
  radius?: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface MarkupReply {
  id: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: Date;
  attachments: string[];
}

export interface DocumentComment {
  id: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string;
  replies: DocumentComment[];
  attachments: string[];
  mentions: string[];
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface RFI {
  id: string;
  projectId: string;
  number: string;
  title: string;
  description: string;
  question: string;
  priority: Priority;
  status: RFIStatus;
  category: RFICategory;
  discipline: string;
  requestedBy: string;
  requestedCompany: string;
  assignedTo: string;
  assignedCompany: string;
  dueDate: Date;
  response?: RFIResponse;
  relatedDocuments: string[];
  relatedDrawings: string[];
  attachments: string[];
  photos: string[];
  markups: DocumentMarkup[];
  comments: DocumentComment[];
  workflow: WorkflowState;
  costImpact?: number;
  scheduleImpact?: number;
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
  closedAt?: Date;
}

export interface RFIResponse {
  id: string;
  content: string;
  respondedBy: string;
  respondedAt: Date;
  attachments: string[];
  photos: string[];
  markups: DocumentMarkup[];
  followUpRequired: boolean;
  followUpActions: string[];
}

export interface Submittal {
  id: string;
  projectId: string;
  number: string;
  title: string;
  description: string;
  type: SubmittalType;
  category: SubmittalCategory;
  discipline: string;
  specification: string;
  submittedBy: string;
  submittedCompany: string;
  reviewedBy: string[];
  status: SubmittalStatus;
  priority: Priority;
  dueDate: Date;
  submissionDate: Date;
  reviewDate?: Date;
  approvalDate?: Date;
  documents: SubmittalDocument[];
  reviews: SubmittalReview[];
  comments: DocumentComment[];
  workflow: WorkflowState;
  deliveryMethod: DeliveryMethod;
  copies: number;
  distributionList: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmittalDocument {
  id: string;
  documentId: string;
  name: string;
  type: string;
  version: string;
  required: boolean;
  received: boolean;
  approved: boolean;
  comments?: string;
}

export interface SubmittalReview {
  id: string;
  reviewedBy: string;
  reviewedAt: Date;
  status: ReviewStatus;
  comments: string;
  markups: DocumentMarkup[];
  attachments: string[];
  actionRequired: boolean;
  actions: ReviewAction[];
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  number: string;
  title: string;
  description: string;
  type: ChangeOrderType;
  reason: ChangeOrderReason;
  status: ChangeOrderStatus;
  priority: Priority;
  requestedBy: string;
  assignedTo: string;
  costImpact: number;
  scheduleImpact: number; // days
  scope: ChangeOrderScope;
  justification: string;
  relatedDocuments: string[];
  relatedRFIs: string[];
  relatedSubmittals: string[];
  attachments: string[];
  approvals: ChangeOrderApproval[];
  workflow: WorkflowState;
  implementation: ChangeOrderImplementation;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  implementedAt?: Date;
}

export interface ChangeOrderScope {
  addedWork: ScopeItem[];
  deletedWork: ScopeItem[];
  modifiedWork: ScopeItem[];
  materials: MaterialChange[];
  labor: LaborChange[];
  equipment: EquipmentChange[];
}

export interface ScopeItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  costCode: string;
  phase: string;
  location: string;
}

export interface MaterialChange {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier: string;
  deliveryDate?: Date;
}

export interface LaborChange {
  id: string;
  trade: string;
  hours: number;
  rate: number;
  totalCost: number;
  crew: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface EquipmentChange {
  id: string;
  description: string;
  quantity: number;
  duration: number; // hours
  rate: number;
  totalCost: number;
  operator?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ChangeOrderApproval {
  id: string;
  approverType: 'owner' | 'architect' | 'engineer' | 'contractor';
  approver: string;
  status: ApprovalStatus;
  comments?: string;
  conditions?: string[];
  approvedAt?: Date;
  signature?: string;
}

export interface ChangeOrderImplementation {
  status: ImplementationStatus;
  startDate?: Date;
  completionDate?: Date;
  actualCost?: number;
  actualScheduleImpact?: number;
  notes?: string;
  photos: string[];
  verifiedBy?: string;
  verifiedAt?: Date;
}

// Enums
export enum DocumentType {
  DRAWING = 'drawing',
  SPECIFICATION = 'specification',
  CONTRACT = 'contract',
  REPORT = 'report',
  PHOTO = 'photo',
  MANUAL = 'manual',
  CERTIFICATE = 'certificate',
  PERMIT = 'permit',
  CORRESPONDENCE = 'correspondence',
  FORM = 'form',
  OTHER = 'other'
}

export enum DocumentCategory {
  ARCHITECTURAL = 'architectural',
  STRUCTURAL = 'structural',
  MECHANICAL = 'mechanical',
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  CIVIL = 'civil',
  LANDSCAPE = 'landscape',
  FIRE_PROTECTION = 'fire_protection',
  SECURITY = 'security',
  TELECOMMUNICATIONS = 'telecommunications',
  GENERAL = 'general'
}

export enum DocumentStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  SUPERSEDED = 'superseded',
  ARCHIVED = 'archived',
  REJECTED = 'rejected'
}

export enum DocumentAction {
  VIEW = 'view',
  DOWNLOAD = 'download',
  EDIT = 'edit',
  DELETE = 'delete',
  COMMENT = 'comment',
  MARKUP = 'markup',
  APPROVE = 'approve',
  PUBLISH = 'publish',
  ARCHIVE = 'archive',
  SHARE = 'share'
}

export enum WorkflowStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum WorkflowStepType {
  REVIEW = 'review',
  APPROVAL = 'approval',
  NOTIFICATION = 'notification',
  TASK = 'task',
  DECISION = 'decision'
}

export enum MarkupType {
  ANNOTATION = 'annotation',
  HIGHLIGHT = 'highlight',
  ARROW = 'arrow',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  LINE = 'line',
  POLYLINE = 'polyline',
  POLYGON = 'polygon',
  TEXT = 'text',
  STAMP = 'stamp',
  MEASUREMENT = 'measurement',
  CLOUD = 'cloud'
}

export enum MarkupStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum ChangeType {
  ADDITION = 'addition',
  DELETION = 'deletion',
  MODIFICATION = 'modification',
  CLARIFICATION = 'clarification',
  CORRECTION = 'correction'
}

export enum ChangeImpact {
  NONE = 'none',
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum RFIStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESPONDED = 'responded',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export enum RFICategory {
  DESIGN_CLARIFICATION = 'design_clarification',
  SPECIFICATION_CLARIFICATION = 'specification_clarification',
  MATERIAL_SUBSTITUTION = 'material_substitution',
  CONSTRUCTION_METHOD = 'construction_method',
  COORDINATION = 'coordination',
  FIELD_CONDITION = 'field_condition',
  CODE_COMPLIANCE = 'code_compliance',
  OTHER = 'other'
}

export enum SubmittalType {
  SHOP_DRAWINGS = 'shop_drawings',
  PRODUCT_DATA = 'product_data',
  SAMPLES = 'samples',
  CERTIFICATES = 'certificates',
  TEST_REPORTS = 'test_reports',
  OPERATION_MANUALS = 'operation_manuals',
  WARRANTY = 'warranty',
  OTHER = 'other'
}

export enum SubmittalCategory {
  ARCHITECTURAL = 'architectural',
  STRUCTURAL = 'structural',
  MECHANICAL = 'mechanical',
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  FIRE_PROTECTION = 'fire_protection',
  SPECIALTY = 'specialty'
}

export enum SubmittalStatus {
  NOT_SUBMITTED = 'not_submitted',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  APPROVED_WITH_COMMENTS = 'approved_with_comments',
  REJECTED = 'rejected',
  RESUBMIT = 'resubmit'
}

export enum ReviewStatus {
  APPROVED = 'approved',
  APPROVED_WITH_COMMENTS = 'approved_with_comments',
  REJECTED = 'rejected',
  REVISE_AND_RESUBMIT = 'revise_and_resubmit'
}

export enum DeliveryMethod {
  ELECTRONIC = 'electronic',
  HARD_COPY = 'hard_copy',
  BOTH = 'both'
}

export enum ChangeOrderType {
  ADDITION = 'addition',
  DELETION = 'deletion',
  MODIFICATION = 'modification',
  TIME_EXTENSION = 'time_extension',
  CREDIT = 'credit'
}

export enum ChangeOrderReason {
  DESIGN_CHANGE = 'design_change',
  SCOPE_CHANGE = 'scope_change',
  UNFORESEEN_CONDITIONS = 'unforeseen_conditions',
  OWNER_REQUEST = 'owner_request',
  REGULATORY_CHANGE = 'regulatory_change',
  MATERIAL_SUBSTITUTION = 'material_substitution',
  ERROR_OMISSION = 'error_omission',
  VALUE_ENGINEERING = 'value_engineering'
}

export enum ChangeOrderStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
  CANCELLED = 'cancelled'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONDITIONAL = 'conditional'
}

export enum ImplementationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified'
}

// Additional interfaces
export interface WorkflowHistory {
  id: string;
  stepId: string;
  action: string;
  performedBy: string;
  performedAt: Date;
  comments?: string;
  attachments: string[];
}

export interface WorkflowAction {
  id: string;
  name: string;
  type: 'approve' | 'reject' | 'request_changes' | 'forward' | 'notify';
  nextStep?: string;
  required: boolean;
}

export interface WorkflowCondition {
  id: string;
  type: 'approval_count' | 'role_approval' | 'time_limit' | 'custom';
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface WorkflowEscalation {
  enabled: boolean;
  timeLimit: number; // hours
  escalateTo: string[];
  notificationMessage: string;
}

export interface CustomFieldValue {
  fieldId: string;
  value: any;
}

export interface ReviewAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
}

// Document search and filtering
export interface DocumentFilter {
  type?: DocumentType[];
  category?: DocumentCategory[];
  status?: DocumentStatus[];
  discipline?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  createdBy?: string[];
  searchQuery?: string;
}

export interface DocumentSearchResult {
  documents: Document[];
  totalCount: number;
  facets: {
    types: { [key: string]: number };
    categories: { [key: string]: number };
    statuses: { [key: string]: number };
    disciplines: { [key: string]: number };
    tags: { [key: string]: number };
  };
}
