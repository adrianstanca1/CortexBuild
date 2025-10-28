-- Additional Construction-Specific SDK Templates
-- This adds 15 more templates to the existing 15, bringing total to 30

INSERT INTO sdk_templates (id, name, slug, description, category, icon, preview_image, code_files, features, ai_enhanced, difficulty_level, estimated_time_minutes) VALUES

-- Safety & Compliance Templates
('Safety Incident Reporter', 'Real-time safety incident reporting with photo upload, witness statements, and automatic notifications to safety officers', 'safety', 
'import React, { useState } from ''react'';
import { Camera, AlertTriangle, Users, FileText } from ''lucide-react'';

export const SafetyIncidentReporter = () => {
  const [incident, setIncident] = useState({
    type: '''',
    severity: '''',
    location: '''',
    description: '''',
    witnesses: [],
    photos: []
  });

  const handleSubmit = async () => {
    // Submit incident report
    await fetch(''/api/safety/incidents'', {
      method: ''POST'',
      body: JSON.stringify(incident)
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Report Safety Incident</h2>
      {/* Form fields */}
    </div>
  );
};', 
'intermediate', '3-4 hours', 'safety,compliance,reporting,photos', 
'["Photo upload", "Witness management", "Severity classification", "Auto-notifications", "GPS location"]', 
'https://images.unsplash.com/photo-1581092160562-40aa08e78837'),

('OSHA Compliance Checker', 'Automated OSHA compliance checklist with daily inspections, violation tracking, and corrective action management', 'safety', 
'import React, { useState, useEffect } from ''react'';
import { CheckSquare, XSquare, AlertCircle } from ''lucide-react'';

export const OSHAComplianceChecker = () => {
  const [checklist, setChecklist] = useState([]);
  const [violations, setViolations] = useState([]);

  useEffect(() => {
    loadDailyChecklist();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">OSHA Daily Inspection</h2>
      {/* Checklist items */}
    </div>
  );
};', 
'intermediate', '4-5 hours', 'safety,compliance,OSHA,inspections', 
'["Daily checklists", "Violation tracking", "Corrective actions", "Photo evidence", "Compliance reports"]', 
'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122'),

-- Equipment & Asset Management
('Equipment Maintenance Tracker', 'Track equipment maintenance schedules, service history, and predict maintenance needs using AI', 'equipment', 
'import React, { useState } from ''react'';
import { Wrench, Calendar, TrendingUp } from ''lucide-react'';

export const EquipmentMaintenanceTracker = () => {
  const [equipment, setEquipment] = useState([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);

  const predictMaintenance = async (equipmentId) => {
    // AI-powered maintenance prediction
    const response = await fetch(''/api/ai/predict-maintenance'', {
      method: ''POST'',
      body: JSON.stringify({ equipmentId })
    });
    return response.json();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Equipment Maintenance</h2>
      {/* Equipment list and schedule */}
    </div>
  );
};', 
'advanced', '5-6 hours', 'equipment,maintenance,AI,predictive', 
'["Maintenance scheduling", "Service history", "AI predictions", "Cost tracking", "Downtime alerts"]', 
'https://images.unsplash.com/photo-1581092160562-40aa08e78837'),

('Tool Checkout System', 'Digital tool checkout system with QR codes, usage tracking, and automatic return reminders', 'equipment', 
'import React, { useState } from ''react'';
import { QrCode, Tool, Clock, User } from ''lucide-react'';

export const ToolCheckoutSystem = () => {
  const [tools, setTools] = useState([]);
  const [checkouts, setCheckouts] = useState([]);

  const scanQRCode = async () => {
    // QR code scanning logic
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tool Checkout</h2>
      {/* QR scanner and checkout form */}
    </div>
  );
};', 
'beginner', '2-3 hours', 'equipment,tools,QR,tracking', 
'["QR code scanning", "Checkout tracking", "Return reminders", "Usage reports", "Tool location"]', 
'https://images.unsplash.com/photo-1581092160562-40aa08e78837'),

-- Project Management
('Change Order Manager', 'Streamline change order requests with approval workflows, cost impact analysis, and client notifications', 'project-management', 
'import React, { useState } from ''react'';
import { FileEdit, DollarSign, CheckCircle, XCircle } from ''lucide-react'';

export const ChangeOrderManager = () => {
  const [changeOrders, setChangeOrders] = useState([]);
  const [approvalWorkflow, setApprovalWorkflow] = useState([]);

  const calculateCostImpact = (changeOrder) => {
    // Cost impact calculation
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Change Orders</h2>
      {/* Change order list and approval workflow */}
    </div>
  );
};', 
'intermediate', '4-5 hours', 'project-management,change-orders,approvals', 
'["Approval workflows", "Cost impact analysis", "Client notifications", "Document attachments", "Audit trail"]', 
'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'),

('Daily Progress Reporter', 'Automated daily progress reports with photo documentation, weather conditions, and crew attendance', 'project-management', 
'import React, { useState } from ''react'';
import { Camera, Cloud, Users, FileText } from ''lucide-react'';

export const DailyProgressReporter = () => {
  const [report, setReport] = useState({
    date: new Date(),
    weather: '''',
    crew: [],
    progress: '''',
    photos: [],
    issues: []
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Daily Progress Report</h2>
      {/* Report form */}
    </div>
  );
};', 
'beginner', '2-3 hours', 'project-management,reporting,daily', 
'["Photo documentation", "Weather tracking", "Crew attendance", "Progress notes", "Issue logging"]', 
'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'),

-- Financial Management
('Budget Variance Analyzer', 'Real-time budget vs actual analysis with AI-powered forecasting and variance alerts', 'financial', 
'import React, { useState, useEffect } from ''react'';
import { TrendingUp, TrendingDown, AlertTriangle } from ''lucide-react'';

export const BudgetVarianceAnalyzer = () => {
  const [budget, setBudget] = useState({});
  const [actual, setActual] = useState({});
  const [forecast, setForecast] = useState({});

  const analyzeBudget = async () => {
    // AI-powered budget analysis
    const response = await fetch(''/api/ai/analyze-budget'', {
      method: ''POST'',
      body: JSON.stringify({ budget, actual })
    });
    return response.json();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Budget Analysis</h2>
      {/* Budget charts and variance reports */}
    </div>
  );
};', 
'advanced', '5-6 hours', 'financial,budget,AI,forecasting', 
'["Real-time analysis", "AI forecasting", "Variance alerts", "Cost breakdown", "Trend visualization"]', 
'https://images.unsplash.com/photo-1554224155-6726b3ff858f'),

('Expense Receipt Scanner', 'AI-powered receipt scanning with automatic categorization, OCR, and expense report generation', 'financial', 
'import React, { useState } from ''react'';
import { Camera, FileText, Tag } from ''lucide-react'';

export const ExpenseReceiptScanner = () => {
  const [receipts, setReceipts] = useState([]);

  const scanReceipt = async (image) => {
    // AI OCR for receipt scanning
    const response = await fetch(''/api/ai/scan-receipt'', {
      method: ''POST'',
      body: JSON.stringify({ image })
    });
    return response.json();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Expense Scanner</h2>
      {/* Camera and receipt list */}
    </div>
  );
};', 
'intermediate', '3-4 hours', 'financial,expenses,AI,OCR', 
'["AI OCR scanning", "Auto-categorization", "Expense reports", "Receipt storage", "Tax compliance"]', 
'https://images.unsplash.com/photo-1554224155-6726b3ff858f'),

-- Quality Control
('Punch List Manager', 'Digital punch list with photo annotations, assignment tracking, and completion verification', 'quality', 
'import React, { useState } from ''react'';
import { CheckSquare, Camera, User, Calendar } from ''lucide-react'';

export const PunchListManager = () => {
  const [punchItems, setPunchItems] = useState([]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Punch List</h2>
      {/* Punch list items */}
    </div>
  );
};', 
'beginner', '2-3 hours', 'quality,punch-list,inspections', 
'["Photo annotations", "Assignment tracking", "Completion verification", "Priority levels", "Status updates"]', 
'https://images.unsplash.com/photo-1581092160562-40aa08e78837'),

('Quality Inspection Checklist', 'Customizable quality inspection checklists with pass/fail criteria and defect tracking', 'quality', 
'import React, { useState } from ''react'';
import { ClipboardCheck, XCircle, CheckCircle } from ''lucide-react'';

export const QualityInspectionChecklist = () => {
  const [inspections, setInspections] = useState([]);
  const [defects, setDefects] = useState([]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quality Inspection</h2>
      {/* Inspection checklist */}
    </div>
  );
};', 
'intermediate', '3-4 hours', 'quality,inspections,checklists', 
'["Custom checklists", "Pass/fail criteria", "Defect tracking", "Photo evidence", "Inspection reports"]', 
'https://images.unsplash.com/photo-1581092160562-40aa08e78837'),

-- Communication & Collaboration
('Site Meeting Minutes', 'AI-powered meeting minutes with action item extraction, attendee tracking, and follow-up reminders', 'communication', 
'import React, { useState } from ''react'';
import { Users, FileText, Bell, CheckSquare } from ''lucide-react'';

export const SiteMeetingMinutes = () => {
  const [meetings, setMeetings] = useState([]);
  const [actionItems, setActionItems] = useState([]);

  const extractActionItems = async (transcript) => {
    // AI extraction of action items
    const response = await fetch(''/api/ai/extract-actions'', {
      method: ''POST'',
      body: JSON.stringify({ transcript })
    });
    return response.json();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Meeting Minutes</h2>
      {/* Meeting details and action items */}
    </div>
  );
};', 
'advanced', '4-5 hours', 'communication,meetings,AI,collaboration', 
'["AI action extraction", "Attendee tracking", "Follow-up reminders", "Meeting templates", "Distribution lists"]', 
'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'),

('RFI Response Tracker', 'Track RFI responses with automatic reminders, response time analytics, and searchable history', 'communication', 
'import React, { useState } from ''react'';
import { MessageSquare, Clock, Search, TrendingUp } from ''lucide-react'';

export const RFIResponseTracker = () => {
  const [rfis, setRfis] = useState([]);
  const [analytics, setAnalytics] = useState({});

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">RFI Tracker</h2>
      {/* RFI list and analytics */}
    </div>
  );
};', 
'intermediate', '3-4 hours', 'communication,RFI,tracking,analytics', 
'["Response tracking", "Auto-reminders", "Response time analytics", "Searchable history", "Status updates"]', 
'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'),

-- Scheduling & Planning
('Look-Ahead Scheduler', '3-week look-ahead schedule with constraint analysis, resource leveling, and weather integration', 'scheduling', 
'import React, { useState } from ''react'';
import { Calendar, Cloud, Users, AlertTriangle } from ''lucide-react'';

export const LookAheadScheduler = () => {
  const [schedule, setSchedule] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [weather, setWeather] = useState({});

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">3-Week Look-Ahead</h2>
      {/* Schedule calendar */}
    </div>
  );
};', 
'advanced', '5-6 hours', 'scheduling,planning,weather,resources', 
'["3-week planning", "Constraint analysis", "Resource leveling", "Weather integration", "Critical path"]', 
'https://images.unsplash.com/photo-1506784983877-45594efa4cbe'),

('Crew Assignment Optimizer', 'AI-powered crew assignment optimization based on skills, availability, and project requirements', 'scheduling', 
'import React, { useState } from ''react'';
import { Users, Zap, Calendar } from ''lucide-react'';

export const CrewAssignmentOptimizer = () => {
  const [crews, setCrews] = useState([]);
  const [projects, setProjects] = useState([]);

  const optimizeAssignments = async () => {
    // AI optimization
    const response = await fetch(''/api/ai/optimize-crews'', {
      method: ''POST'',
      body: JSON.stringify({ crews, projects })
    });
    return response.json();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Crew Optimizer</h2>
      {/* Crew assignments */}
    </div>
  );
};', 
'advanced', '5-6 hours', 'scheduling,AI,optimization,crews', 
'["AI optimization", "Skill matching", "Availability tracking", "Workload balancing", "Cost optimization"]', 
'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'),

-- Document Management
('Blueprint Version Control', 'Version control system for blueprints with change tracking, markup tools, and distribution management', 'documents', 
'import React, { useState } from ''react'';
import { FileText, GitBranch, Edit, Share2 } from ''lucide-react'';

export const BlueprintVersionControl = () => {
  const [blueprints, setBlueprints] = useState([]);
  const [versions, setVersions] = useState([]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Blueprint Versions</h2>
      {/* Version list and viewer */}
    </div>
  );
};', 
'advanced', '5-6 hours', 'documents,blueprints,version-control', 
'["Version tracking", "Change history", "Markup tools", "Distribution lists", "Comparison view"]', 
'https://images.unsplash.com/photo-1503387762-592deb58ef4e');

-- Update template count
UPDATE sqlite_sequence SET seq = 30 WHERE name = 'sdk_templates';

