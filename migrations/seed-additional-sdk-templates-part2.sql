-- Additional Construction-Specific SDK Templates (Part 2 of 2)

INSERT INTO sdk_templates (id, name, slug, description, category, icon, preview_image, code_files, features, ai_enhanced, difficulty_level, estimated_time_minutes) VALUES

('tpl_expense_scanner_01', 'Expense Receipt Scanner', 'expense-receipt-scanner',
'AI-powered receipt scanning with automatic categorization, OCR, and expense report generation',
'financial', 'Camera', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
'[{"name":"ExpenseReceiptScanner.tsx","content":"import React, { useState } from ''react'';\nimport { Camera, FileText, Tag } from ''lucide-react'';\n\nexport const ExpenseReceiptScanner = () => {\n  const [receipts, setReceipts] = useState([]);\n\n  const scanReceipt = async (image) => {\n    const response = await fetch(''/api/ai/scan-receipt'', {\n      method: ''POST'',\n      body: JSON.stringify({ image })\n    });\n    return response.json();\n  };\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">Expense Scanner</h2>\n    </div>\n  );\n};"}]',
'["AI OCR scanning", "Auto-categorization", "Expense reports", "Receipt storage", "Tax compliance"]',
1, 'intermediate', 210),

-- Quality Control Templates

('tpl_punch_list_01', 'Punch List Manager', 'punch-list-manager',
'Digital punch list with photo annotations, assignment tracking, and completion verification',
'quality', 'CheckSquare', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837',
'[{"name":"PunchListManager.tsx","content":"import React, { useState } from ''react'';\nimport { CheckSquare, Camera, User, Calendar } from ''lucide-react'';\n\nexport const PunchListManager = () => {\n  const [punchItems, setPunchItems] = useState([]);\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">Punch List</h2>\n    </div>\n  );\n};"}]',
'["Photo annotations", "Assignment tracking", "Completion verification", "Priority levels", "Status updates"]',
1, 'beginner', 150),

('tpl_quality_inspection_01', 'Quality Inspection Checklist', 'quality-inspection-checklist',
'Customizable quality inspection checklists with pass/fail criteria and defect tracking',
'quality', 'ClipboardCheck', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837',
'[{"name":"QualityInspectionChecklist.tsx","content":"import React, { useState } from ''react'';\nimport { ClipboardCheck, XCircle, CheckCircle } from ''lucide-react'';\n\nexport const QualityInspectionChecklist = () => {\n  const [inspections, setInspections] = useState([]);\n  const [defects, setDefects] = useState([]);\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">Quality Inspection</h2>\n    </div>\n  );\n};"}]',
'["Custom checklists", "Pass/fail criteria", "Defect tracking", "Photo evidence", "Inspection reports"]',
1, 'intermediate', 210),

-- Communication & Collaboration Templates

('tpl_meeting_minutes_01', 'Site Meeting Minutes', 'site-meeting-minutes',
'AI-powered meeting minutes with action item extraction, attendee tracking, and follow-up reminders',
'communication', 'Users', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
'[{"name":"SiteMeetingMinutes.tsx","content":"import React, { useState } from ''react'';\nimport { Users, FileText, Bell, CheckSquare } from ''lucide-react'';\n\nexport const SiteMeetingMinutes = () => {\n  const [meetings, setMeetings] = useState([]);\n  const [actionItems, setActionItems] = useState([]);\n\n  const extractActionItems = async (transcript) => {\n    const response = await fetch(''/api/ai/extract-actions'', {\n      method: ''POST'',\n      body: JSON.stringify({ transcript })\n    });\n    return response.json();\n  };\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">Meeting Minutes</h2>\n    </div>\n  );\n};"}]',
'["AI action extraction", "Attendee tracking", "Follow-up reminders", "Meeting templates", "Distribution lists"]',
1, 'advanced', 270),

('tpl_rfi_tracker_01', 'RFI Response Tracker', 'rfi-response-tracker',
'Track RFI responses with automatic reminders, response time analytics, and searchable history',
'communication', 'MessageSquare', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
'[{"name":"RFIResponseTracker.tsx","content":"import React, { useState } from ''react'';\nimport { MessageSquare, Clock, Search, TrendingUp } from ''lucide-react'';\n\nexport const RFIResponseTracker = () => {\n  const [rfis, setRfis] = useState([]);\n  const [analytics, setAnalytics] = useState({});\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">RFI Tracker</h2>\n    </div>\n  );\n};"}]',
'["Response tracking", "Auto-reminders", "Response time analytics", "Searchable history", "Status updates"]',
1, 'intermediate', 210),

-- Scheduling & Planning Templates

('tpl_lookahead_schedule_01', 'Look-Ahead Scheduler', 'look-ahead-scheduler',
'3-week look-ahead schedule with constraint analysis, resource leveling, and weather integration',
'scheduling', 'Calendar', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe',
'[{"name":"LookAheadScheduler.tsx","content":"import React, { useState } from ''react'';\nimport { Calendar, Cloud, Users, AlertTriangle } from ''lucide-react'';\n\nexport const LookAheadScheduler = () => {\n  const [schedule, setSchedule] = useState([]);\n  const [constraints, setConstraints] = useState([]);\n  const [weather, setWeather] = useState({});\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">3-Week Look-Ahead</h2>\n    </div>\n  );\n};"}]',
'["3-week planning", "Constraint analysis", "Resource leveling", "Weather integration", "Critical path"]',
1, 'advanced', 330),

('tpl_crew_optimizer_01', 'Crew Assignment Optimizer', 'crew-assignment-optimizer',
'AI-powered crew assignment optimization based on skills, availability, and project requirements',
'scheduling', 'Users', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
'[{"name":"CrewAssignmentOptimizer.tsx","content":"import React, { useState } from ''react'';\nimport { Users, Zap, Calendar } from ''lucide-react'';\n\nexport const CrewAssignmentOptimizer = () => {\n  const [crews, setCrews] = useState([]);\n  const [projects, setProjects] = useState([]);\n\n  const optimizeAssignments = async () => {\n    const response = await fetch(''/api/ai/optimize-crews'', {\n      method: ''POST'',\n      body: JSON.stringify({ crews, projects })\n    });\n    return response.json();\n  };\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">Crew Optimizer</h2>\n    </div>\n  );\n};"}]',
'["AI optimization", "Skill matching", "Availability tracking", "Workload balancing", "Cost optimization"]',
1, 'advanced', 330),

-- Document Management Templates

('tpl_blueprint_version_01', 'Blueprint Version Control', 'blueprint-version-control',
'Version control system for blueprints with change tracking, markup tools, and distribution management',
'documents', 'FileText', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e',
'[{"name":"BlueprintVersionControl.tsx","content":"import React, { useState } from ''react'';\nimport { FileText, GitBranch, Edit, Share2 } from ''lucide-react'';\n\nexport const BlueprintVersionControl = () => {\n  const [blueprints, setBlueprints] = useState([]);\n  const [versions, setVersions] = useState([]);\n\n  return (\n    <div className=\"p-6\">\n      <h2 className=\"text-2xl font-bold mb-4\">Blueprint Versions</h2>\n    </div>\n  );\n};"}]',
'["Version tracking", "Change history", "Markup tools", "Distribution lists", "Comparison view"]',
1, 'advanced', 330);

