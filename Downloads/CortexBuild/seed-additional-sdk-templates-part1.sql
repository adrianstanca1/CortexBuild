-- Additional Construction-Specific SDK Templates (Part 1 of 2)
-- Safety & Compliance Templates

INSERT INTO sdk_templates (id, name, slug, description, category, icon, preview_image, code_files, features, ai_enhanced, difficulty_level, estimated_time_minutes) VALUES

('tpl_safety_incident_01', 'Safety Incident Reporter', 'safety-incident-reporter', 
'Real-time safety incident reporting with photo upload, witness statements, and automatic notifications to safety officers', 
'safety', 'AlertTriangle', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837',
'[{"name":"SafetyIncidentReporter.tsx","content":"import React, { useState } from ''react'';\nimport { Camera, AlertTriangle, Users, FileText } from ''lucide-react'';\n\nexport const SafetyIncidentReporter = () => {\n  const [incident, setIncident] = useState({\n    type: '''',\n    severity: '''',\n    location: '''',\n    description: '''',\n    witnesses: [],\n    photos: []\n  });\n\n  const handleSubmit = async () => {\n    await fetch(''/api/safety/incidents'', {\n      method: ''POST'',\n      body: JSON.stringify(incident)\n    });\n  };\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">Report Safety Incident</h2>\n    </div>\n  );\n};"}]',
'["Photo upload", "Witness management", "Severity classification", "Auto-notifications", "GPS location"]',
1, 'intermediate', 210),

('tpl_osha_compliance_01', 'OSHA Compliance Checker', 'osha-compliance-checker',
'Automated OSHA compliance checklist with daily inspections, violation tracking, and corrective action management',
'safety', 'CheckSquare', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
'[{"name":"OSHAComplianceChecker.tsx","content":"import React, { useState, useEffect } from ''react'';\nimport { CheckSquare, XSquare, AlertCircle } from ''lucide-react'';\n\nexport const OSHAComplianceChecker = () => {\n  const [checklist, setChecklist] = useState([]);\n  const [violations, setViolations] = useState([]);\n\n  useEffect(() => {\n    loadDailyChecklist();\n  }, []);\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">OSHA Daily Inspection</h2>\n    </div>\n  );\n};"}]',
'["Daily checklists", "Violation tracking", "Corrective actions", "Photo evidence", "Compliance reports"]',
1, 'intermediate', 270),

-- Equipment & Asset Management Templates

('tpl_equipment_maint_01', 'Equipment Maintenance Tracker', 'equipment-maintenance-tracker',
'Track equipment maintenance schedules, service history, and predict maintenance needs using AI',
'equipment', 'Wrench', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837',
'[{"name":"EquipmentMaintenanceTracker.tsx","content":"import React, { useState } from ''react'';\nimport { Wrench, Calendar, TrendingUp } from ''lucide-react'';\n\nexport const EquipmentMaintenanceTracker = () => {\n  const [equipment, setEquipment] = useState([]);\n  const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);\n\n  const predictMaintenance = async (equipmentId) => {\n    const response = await fetch(''/api/ai/predict-maintenance'', {\n      method: ''POST'',\n      body: JSON.stringify({ equipmentId })\n    });\n    return response.json();\n  };\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">Equipment Maintenance</h2>\n    </div>\n  );\n};"}]',
'["Maintenance scheduling", "Service history", "AI predictions", "Cost tracking", "Downtime alerts"]',
1, 'advanced', 330),

('tpl_tool_checkout_01', 'Tool Checkout System', 'tool-checkout-system',
'Digital tool checkout system with QR codes, usage tracking, and automatic return reminders',
'equipment', 'Tool', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837',
'[{"name":"ToolCheckoutSystem.tsx","content":"import React, { useState } from ''react'';\nimport { QrCode, Tool, Clock, User } from ''lucide-react'';\n\nexport const ToolCheckoutSystem = () => {\n  const [tools, setTools] = useState([]);\n  const [checkouts, setCheckouts] = useState([]);\n\n  const scanQRCode = async () => {\n    // QR code scanning logic\n  };\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">Tool Checkout</h2>\n    </div>\n  );\n};"}]',
'["QR code scanning", "Checkout tracking", "Return reminders", "Usage reports", "Tool location"]',
1, 'beginner', 150),

-- Project Management Templates

('tpl_change_order_01', 'Change Order Manager', 'change-order-manager',
'Streamline change order requests with approval workflows, cost impact analysis, and client notifications',
'project-management', 'FileEdit', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
'[{"name":"ChangeOrderManager.tsx","content":"import React, { useState } from ''react'';\nimport { FileEdit, DollarSign, CheckCircle, XCircle } from ''lucide-react'';\n\nexport const ChangeOrderManager = () => {\n  const [changeOrders, setChangeOrders] = useState([]);\n  const [approvalWorkflow, setApprovalWorkflow] = useState([]);\n\n  const calculateCostImpact = (changeOrder) => {\n    // Cost impact calculation\n  };\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">Change Orders</h2>\n    </div>\n  );\n};"}]',
'["Approval workflows", "Cost impact analysis", "Client notifications", "Document attachments", "Audit trail"]',
1, 'intermediate', 270),

('tpl_daily_progress_01', 'Daily Progress Reporter', 'daily-progress-reporter',
'Automated daily progress reports with photo documentation, weather conditions, and crew attendance',
'project-management', 'FileText', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
'[{"name":"DailyProgressReporter.tsx","content":"import React, { useState } from ''react'';\nimport { Camera, Cloud, Users, FileText } from ''lucide-react'';\n\nexport const DailyProgressReporter = () => {\n  const [report, setReport] = useState({\n    date: new Date(),\n    weather: '''',\n    crew: [],\n    progress: '''',\n    photos: [],\n    issues: []\n  });\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">Daily Progress Report</h2>\n    </div>\n  );\n};"}]',
'["Photo documentation", "Weather tracking", "Crew attendance", "Progress notes", "Issue logging"]',
1, 'beginner', 150),

-- Financial Management Templates

('tpl_budget_variance_01', 'Budget Variance Analyzer', 'budget-variance-analyzer',
'Real-time budget vs actual analysis with AI-powered forecasting and variance alerts',
'financial', 'TrendingUp', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
'[{"name":"BudgetVarianceAnalyzer.tsx","content":"import React, { useState, useEffect } from ''react'';\nimport { TrendingUp, TrendingDown, AlertTriangle } from ''lucide-react'';\n\nexport const BudgetVarianceAnalyzer = () => {\n  const [budget, setBudget] = useState({});\n  const [actual, setActual] = useState({});\n  const [forecast, setForecast] = useState({});\n\n  const analyzeBudget = async () => {\n    const response = await fetch(''/api/ai/analyze-budget'', {\n      method: ''POST'',\n      body: JSON.stringify({ budget, actual })\n    });\n    return response.json();\n  };\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">Budget Analysis</h2>\n    </div>\n  );\n};"}]',
'["Real-time analysis", "AI forecasting", "Variance alerts", "Cost breakdown", "Trend visualization"]',
1, 'advanced', 330);

