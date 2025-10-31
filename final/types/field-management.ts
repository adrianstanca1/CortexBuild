// 🏗️ Field Management Types
// Comprehensive field management types inspired by Fieldwire and Procore

export interface PunchList {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: PunchCategory;
  priority: Priority;
  status: PunchStatus;
  assignedTo: string;
  assignedCompany: string;
  dueDate: Date;
  location: PunchLocation;
  trade: string;
  room: string;
  floor: string;
  photos: Photo[];
  attachments: Attachment[];
  drawingMarkup?: DrawingMarkup;
  resolution?: PunchResolution;
  verificationPhotos: Photo[];
  comments: Comment[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  verifiedAt?: Date;
}

export interface DailyReport {
  id: string;
  projectId: string;
  date: Date;
  reportedBy: string;
  weather: WeatherCondition;
  temperature: {
    high: number;
    low: number;
    unit: 'F' | 'C';
  };
  crew: CrewInfo[];
  workPerformed: WorkActivity[];
  materials: MaterialDelivery[];
  equipment: EquipmentUsage[];
  safety: SafetyObservation[];
  visitors: Visitor[];
  delays: Delay[];
  issues: DailyIssue[];
  photos: Photo[];
  notes: string;
  submittedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: TaskType;
  category: TaskCategory;
  priority: Priority;
  status: TaskStatus;
  assignedTo: string[];
  assignedCompany: string;
  dueDate: Date;
  estimatedHours: number;
  actualHours: number;
  location: TaskLocation;
  trade: string;
  phase: string;
  prerequisites: string[];
  dependencies: string[];
  photos: Photo[];
  attachments: Attachment[];
  comments: Comment[];
  timeEntries: TimeEntry[];
  materials: MaterialRequirement[];
  equipment: EquipmentRequirement[];
  safetyRequirements: SafetyRequirement[];
  qualityChecks: QualityCheck[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Inspection {
  id: string;
  projectId: string;
  type: InspectionType;
  title: string;
  description: string;
  inspector: string;
  inspectorCompany: string;
  scheduledDate: Date;
  actualDate?: Date;
  status: InspectionStatus;
  location: InspectionLocation;
  trade: string;
  phase: string;
  checklist: InspectionChecklistItem[];
  findings: InspectionFinding[];
  photos: Photo[];
  attachments: Attachment[];
  result: InspectionResult;
  followUpRequired: boolean;
  followUpTasks: string[];
  comments: Comment[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  size: number;
  mimeType: string;
  location?: GeoLocation;
  timestamp: Date;
  metadata: PhotoMetadata;
  tags: string[];
  annotations: PhotoAnnotation[];
  uploadedBy: string;
  uploadedAt: Date;
}

export interface PhotoMetadata {
  width: number;
  height: number;
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  focalLength?: string;
  flash?: boolean;
  orientation?: number;
}

export interface PhotoAnnotation {
  id: string;
  type: 'arrow' | 'circle' | 'rectangle' | 'text' | 'measurement';
  coordinates: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  text?: string;
  color: string;
  strokeWidth: number;
  createdBy: string;
  createdAt: Date;
}

export interface DrawingMarkup {
  id: string;
  drawingId: string;
  type: 'pin' | 'area' | 'line' | 'text' | 'measurement';
  coordinates: MarkupCoordinates;
  content: string;
  color: string;
  strokeWidth: number;
  photos: string[];
  attachments: string[];
  comments: Comment[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarkupCoordinates {
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  date: Date;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  breakTime: number; // minutes
  overtimeHours: number;
  description: string;
  location: string;
  costCode: string;
  billable: boolean;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrewInfo {
  id: string;
  name: string;
  company: string;
  trade: string;
  role: string;
  hoursWorked: number;
  overtimeHours: number;
  present: boolean;
  notes?: string;
}

export interface WorkActivity {
  id: string;
  description: string;
  trade: string;
  location: string;
  crew: string[];
  hoursSpent: number;
  percentComplete: number;
  materials: string[];
  equipment: string[];
  notes?: string;
}

export interface MaterialDelivery {
  id: string;
  supplier: string;
  description: string;
  quantity: number;
  unit: string;
  deliveryTime: Date;
  receivedBy: string;
  location: string;
  condition: 'good' | 'damaged' | 'incomplete';
  notes?: string;
  photos: string[];
}

export interface EquipmentUsage {
  id: string;
  equipmentId: string;
  equipmentName: string;
  operator: string;
  hoursUsed: number;
  fuelUsed?: number;
  location: string;
  condition: 'good' | 'needs_maintenance' | 'broken';
  notes?: string;
}

export interface SafetyObservation {
  id: string;
  type: 'incident' | 'near_miss' | 'hazard' | 'positive_observation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  involvedPersons: string[];
  witnessess: string[];
  immediateActions: string;
  followUpRequired: boolean;
  followUpActions: string[];
  photos: string[];
  reportedBy: string;
  reportedAt: Date;
}

export interface Visitor {
  id: string;
  name: string;
  company: string;
  purpose: string;
  escortedBy: string;
  checkInTime: Date;
  checkOutTime?: Date;
  safetyBriefing: boolean;
  ppeProvided: string[];
  areasVisited: string[];
}

export interface Delay {
  id: string;
  type: DelayType;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  impact: DelayImpact;
  costImpact: number;
  responsibleParty: string;
  mitigation: string;
  photos: string[];
}

export interface QualityCheck {
  id: string;
  type: string;
  description: string;
  criteria: string;
  result: 'pass' | 'fail' | 'conditional';
  notes?: string;
  photos: string[];
  checkedBy: string;
  checkedAt: Date;
}

export interface InspectionChecklistItem {
  id: string;
  description: string;
  requirement: string;
  result: 'pass' | 'fail' | 'n/a' | 'conditional';
  notes?: string;
  photos: string[];
  correctionRequired: boolean;
  correctionDescription?: string;
}

export interface InspectionFinding {
  id: string;
  type: 'deficiency' | 'non_compliance' | 'observation' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  requirement: string;
  correctionRequired: boolean;
  correctionDescription?: string;
  dueDate?: Date;
  assignedTo?: string;
  photos: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'verified';
}

// Enums
export enum PunchCategory {
  ARCHITECTURAL = 'architectural',
  STRUCTURAL = 'structural',
  MECHANICAL = 'mechanical',
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  HVAC = 'hvac',
  FIRE_SAFETY = 'fire_safety',
  LANDSCAPING = 'landscaping',
  CLEANUP = 'cleanup',
  OTHER = 'other'
}

export enum PunchStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  READY_FOR_REVIEW = 'ready_for_review',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum TaskType {
  CONSTRUCTION = 'construction',
  INSPECTION = 'inspection',
  DELIVERY = 'delivery',
  MEETING = 'meeting',
  DOCUMENTATION = 'documentation',
  SAFETY = 'safety',
  CLEANUP = 'cleanup',
  OTHER = 'other'
}

export enum TaskCategory {
  SITE_PREP = 'site_prep',
  FOUNDATION = 'foundation',
  FRAMING = 'framing',
  ROOFING = 'roofing',
  SIDING = 'siding',
  WINDOWS_DOORS = 'windows_doors',
  INSULATION = 'insulation',
  DRYWALL = 'drywall',
  FLOORING = 'flooring',
  PAINTING = 'painting',
  FIXTURES = 'fixtures',
  FINAL_CLEANUP = 'final_cleanup'
}

export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum InspectionType {
  FOUNDATION = 'foundation',
  FRAMING = 'framing',
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  MECHANICAL = 'mechanical',
  INSULATION = 'insulation',
  DRYWALL = 'drywall',
  FINAL = 'final',
  FIRE_SAFETY = 'fire_safety',
  ACCESSIBILITY = 'accessibility',
  ENVIRONMENTAL = 'environmental'
}

export enum InspectionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PASSED = 'passed',
  FAILED = 'failed',
  CONDITIONAL = 'conditional',
  CANCELLED = 'cancelled'
}

export enum InspectionResult {
  PASS = 'pass',
  FAIL = 'fail',
  CONDITIONAL = 'conditional',
  INCOMPLETE = 'incomplete'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum DelayType {
  WEATHER = 'weather',
  MATERIAL = 'material',
  EQUIPMENT = 'equipment',
  LABOR = 'labor',
  PERMIT = 'permit',
  INSPECTION = 'inspection',
  DESIGN = 'design',
  COORDINATION = 'coordination',
  OTHER = 'other'
}

export enum DelayImpact {
  NONE = 'none',
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical'
}

export enum WeatherCondition {
  CLEAR = 'clear',
  PARTLY_CLOUDY = 'partly_cloudy',
  CLOUDY = 'cloudy',
  LIGHT_RAIN = 'light_rain',
  HEAVY_RAIN = 'heavy_rain',
  SNOW = 'snow',
  FOG = 'fog',
  WIND = 'wind',
  EXTREME_HEAT = 'extreme_heat',
  EXTREME_COLD = 'extreme_cold'
}

// Location interfaces
export interface PunchLocation {
  building?: string;
  floor?: string;
  room?: string;
  area?: string;
  coordinates?: GeoLocation;
  drawingReference?: {
    drawingId: string;
    x: number;
    y: number;
  };
}

export interface TaskLocation {
  building?: string;
  floor?: string;
  area?: string;
  coordinates?: GeoLocation;
}

export interface InspectionLocation {
  building?: string;
  floor?: string;
  area?: string;
  coordinates?: GeoLocation;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
}

// Additional interfaces
export interface Comment {
  id: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface PunchResolution {
  description: string;
  resolvedBy: string;
  resolvedAt: Date;
  verificationRequired: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  photos: string[];
}

export interface MaterialRequirement {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  supplier?: string;
  deliveryDate?: Date;
  status: 'pending' | 'ordered' | 'delivered' | 'installed';
}

export interface EquipmentRequirement {
  id: string;
  description: string;
  type: string;
  quantity: number;
  startDate: Date;
  endDate: Date;
  operator?: string;
  status: 'pending' | 'reserved' | 'on_site' | 'in_use' | 'returned';
}

export interface SafetyRequirement {
  id: string;
  description: string;
  type: 'ppe' | 'training' | 'permit' | 'procedure';
  mandatory: boolean;
  verificationRequired: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface DailyIssue {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  impact: string;
  resolution?: string;
  assignedTo?: string;
  status: 'open' | 'in_progress' | 'resolved';
}

// Mobile-specific interfaces
export interface OfflineData {
  punchLists: PunchList[];
  tasks: Task[];
  photos: Photo[];
  drawings: Drawing[];
  lastSync: Date;
}

export interface Drawing {
  id: string;
  projectId: string;
  name: string;
  number: string;
  discipline: string;
  version: string;
  url: string;
  thumbnailUrl: string;
  scale: string;
  size: DrawingSize;
  layers: DrawingLayer[];
  markups: DrawingMarkup[];
  lastModified: Date;
}

export interface DrawingSize {
  width: number;
  height: number;
  units: 'mm' | 'in' | 'ft';
}

export interface DrawingLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  lineWeight: number;
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'punch' | 'task' | 'photo' | 'timeEntry' | 'dailyReport';
  entityId: string;
  data: any;
  timestamp: Date;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
  error?: string;
}
