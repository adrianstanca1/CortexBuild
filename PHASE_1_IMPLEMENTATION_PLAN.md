# 🎯 PHASE 1: ENTERPRISE CORE - Implementation Plan

**Duration:** 4 weeks  
**Priority:** CRITICAL  
**Target:** Complete enterprise-grade core functionality

---

## 📋 **WEEK 1: PROJECT MANAGEMENT ADVANCED**

### **Day 1-2: Gantt Chart Implementation**

**Dependencies:**

```bash
npm install react-gantt-chart @dhtmlx/tree @dhtmlx/gantt
```

**Components to Create:**

```
src/components/projects/
├── GanttChart.tsx
├── GanttToolbar.tsx
├── TaskEditor.tsx
└── ResourceLoader.tsx
```

**Database Schema:**

```sql
-- Add to projects migration
CREATE TABLE project_tasks_gantt (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  parent_id UUID REFERENCES project_tasks_gantt(id),
  name TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  duration INTEGER, -- in days
  progress DECIMAL DEFAULT 0,
  type TEXT, -- 'task', 'milestone', 'project'
  resource_allocation JSONB,
  dependencies JSONB, -- array of task IDs
  critical_path BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE gantt_dependencies (
  id UUID PRIMARY KEY,
  predecessor_task_id UUID REFERENCES project_tasks_gantt(id),
  successor_task_id UUID REFERENCES project_tasks_gantt(id),
  type TEXT, -- 'finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'
  lag INTEGER DEFAULT 0, -- lag in days
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Backend Routes:**

```
server/routes/projects-gantt.ts
├── GET /api/projects/:id/gantt
├── POST /api/projects/:id/gantt/tasks
├── PUT /api/projects/:id/gantt/tasks/:taskId
├── DELETE /api/projects/:id/gantt/tasks/:taskId
├── POST /api/projects/:id/gantt/dependencies
├── GET /api/projects/:id/gantt/critical-path
└── POST /api/projects/:id/gantt/optimize
```

---

### **Day 3-4: WBS (Work Breakdown Structure)**

**Components:**

```
src/components/projects/
├── WBSBuilder.tsx
├── WBSNode.tsx
└── WBSEditor.tsx
```

**Database Schema:**

```sql
CREATE TABLE wbs_structure (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  parent_id UUID REFERENCES wbs_structure(id),
  code TEXT NOT NULL, -- e.g., "1.2.3"
  name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL,
  cost_budget DECIMAL,
  schedule_budget INTERVAL,
  actual_cost DECIMAL,
  actual_duration INTERVAL,
  percentage_complete DECIMAL DEFAULT 0,
  status TEXT, -- 'not_started', 'in_progress', 'completed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wbs_resources (
  id UUID PRIMARY KEY,
  wbs_id UUID REFERENCES wbs_structure(id),
  resource_type TEXT, -- 'labor', 'material', 'equipment'
  resource_id UUID,
  quantity DECIMAL,
  unit_cost DECIMAL,
  total_cost DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Backend Routes:**

```
server/routes/wbs.ts
├── GET /api/projects/:id/wbs
├── POST /api/projects/:id/wbs/nodes
├── PUT /api/projects/:id/wbs/nodes/:nodeId
├── DELETE /api/projects/:id/wbs/nodes/:nodeId
└── GET /api/projects/:id/wbs/summary
```

---

### **Day 5: Critical Path Analysis**

**Algorithm Implementation:**

```
src/lib/projects/critical-path.ts
```

**Features:**

- Forward pass (Early Start/Finish)
- Backward pass (Late Start/Finish)
- Total Float calculation
- Critical path identification
- Schedule compression options

---

### **Day 6-7: Resource Leveling & Loading**

**Components:**

```
src/components/projects/
├── ResourceLoader.tsx
└── ResourceLeveler.tsx
```

**Features:**

- Resource allocation per task
- Resource capacity management
- Over-allocation detection
- Automated leveling algorithms
- Resource histograms

---

## 📋 **WEEK 2: DOCUMENT MANAGEMENT ENTERPRISE**

### **Day 1-2: Advanced Document Viewer**

**Dependencies:**

```bash
npm install react-pdf pdf-lib react-image-annotate
```

**Components:**

```
src/components/documents/
├── AdvancedViewer.tsx
├── PDFViewer.tsx
├── MarkupTools.tsx
├── DrawingTools.tsx
└── ComparisonTool.tsx
```

**Features:**

- Multi-page PDF viewing
- Zoom & pan
- Markup tools (redline, highlight, text)
- Comments with coordinates
- Drawing tools (circle, rectangle, arrow)
- Compare two versions side-by-side
- Print & export annotations

---

### **Day 3: OCR Integration**

**Dependencies:**

```bash
npm install tesseract.js
```

**Implementation:**

```
src/lib/documents/ocr.ts
```

**Features:**

- Extract text from scanned PDFs
- Index for searchability
- Multi-language support
- Batch processing
- Confidence scoring

---

### **Day 4-5: Drawing Management**

**Components:**

```
src/components/drawings/
├── DrawingViewer.tsx
├── RevisionManager.tsx
├── TransmittalTool.tsx
└── ViewMarkup.tsx
```

**Database Schema:**

```sql
CREATE TABLE drawing_revisions (
  id UUID PRIMARY KEY,
  drawing_id UUID REFERENCES documents(id),
  revision_number TEXT NOT NULL,
  date_revision TIMESTAMP,
  description TEXT,
  superseded_by UUID REFERENCES drawing_revisions(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE drawing_transmittals (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  transmittal_number TEXT UNIQUE,
  date_sent TIMESTAMP,
  from_company_id UUID REFERENCES companies(id),
  to_company_id UUID REFERENCES companies(id),
  subject TEXT,
  description TEXT,
  drawings JSONB, -- array of drawing IDs
  status TEXT, -- 'sent', 'received', 'acknowledged', 'rejected'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### **Day 6-7: Advanced Search & Templates**

**Features:**

- Full-text search
- Advanced filters (date, type, author, tags)
- Saved searches
- Document templates library
- Automated naming conventions
- Bulk operations

---

## 📋 **WEEK 3: FINANCIAL MANAGEMENT COMPLETE**

### **Day 1-2: Budget Framework**

**Database Schema:**

```sql
CREATE TABLE project_budgets (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  budget_name TEXT NOT NULL,
  budget_type TEXT, -- 'master', 'revised', 'forecast'
  cost_code TEXT NOT NULL, -- CSI MasterFormat
  cost_code_name TEXT,
  category TEXT, -- 'labor', 'material', 'equipment', 'subcontract', 'other'
  budget_amount DECIMAL NOT NULL,
  committed_amount DECIMAL DEFAULT 0,
  spent_amount DECIMAL DEFAULT 0,
  remaining_amount DECIMAL GENERATED ALWAYS AS (budget_amount - committed_amount - spent_amount) STORED,
  forecast_amount DECIMAL,
  variance_amount DECIMAL GENERATED ALWAYS AS (forecast_amount - budget_amount) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CSI MasterFormat Reference Table
CREATE TABLE csi_masterformat (
  code TEXT PRIMARY KEY,
  division_number TEXT,
  division_title TEXT,
  section_number TEXT,
  section_title TEXT,
  level INTEGER
);
```

**Components:**

```
src/components/financial/
├── BudgetManager.tsx
├── BudgetEditor.tsx
├── CostCodeSelector.tsx
└── BudgetSummary.tsx
```

---

### **Day 3: Contract Management**

**Database Schema:**

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  company_id UUID REFERENCES companies(id), -- prime or subcontractor
  contract_number TEXT UNIQUE,
  contract_type TEXT, -- 'prime', 'subcontract', 'purchase_order'
  contract_amount DECIMAL NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT, -- 'draft', 'active', 'completed', 'terminated'
  terms JSONB,
  retainage_percentage DECIMAL,
  insurance_required JSONB,
  bonds_required JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE change_orders (
  id UUID PRIMARY KEY,
  contract_id UUID REFERENCES contracts(id),
  change_order_number TEXT NOT NULL,
  date_requested DATE,
  date_approved DATE,
  description TEXT,
  reason TEXT,
  cost_impact DECIMAL NOT NULL,
  schedule_impact_days INTEGER,
  status TEXT, -- 'pending', 'approved', 'rejected', 'voided'
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Components:**

```
src/components/contracts/
├── ContractManager.tsx
├── ContractEditor.tsx
├── ChangeOrderManager.tsx
└── ChangeOrderWorkflow.tsx
```

---

### **Day 4: Purchase Orders**

**Database Schema:**

```sql
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  vendor_id UUID REFERENCES companies(id),
  po_number TEXT UNIQUE,
  date_ordered DATE,
  date_required DATE,
  status TEXT, -- 'draft', 'pending', 'approved', 'ordered', 'received', 'closed'
  total_amount DECIMAL NOT NULL,
  terms TEXT,
  delivery_location TEXT,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY,
  po_id UUID REFERENCES purchase_orders(id),
  item_description TEXT,
  quantity DECIMAL NOT NULL,
  unit_cost DECIMAL NOT NULL,
  total_cost DECIMAL GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  cost_code TEXT,
  delivery_date DATE
);
```

---

### **Day 5: Payment Applications**

**Components:**

```
src/components/billing/
├── PaymentApplicationManager.tsx
├── ProgressBilling.tsx
├── AIABilling.tsx
└── RetainageCalculator.tsx
```

**Database Schema:**

```sql
CREATE TABLE payment_applications (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  period_start_date DATE,
  period_end_date DATE,
  application_number TEXT NOT NULL,
  application_date DATE,
  work_performed_amount DECIMAL NOT NULL,
  stored_materials_amount DECIMAL,
  retainage_held DECIMAL,
  retention_percentage DECIMAL,
  total_billed_amount DECIMAL,
  previous_payments_received DECIMAL DEFAULT 0,
  current_payment_due DECIMAL GENERATED ALWAYS AS (total_billed_amount - previous_payments_received) STORED,
  status TEXT, -- 'draft', 'submitted', 'reviewed', 'approved', 'paid', 'rejected'
  submitted_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_application_line_items (
  id UUID PRIMARY KEY,
  payment_app_id UUID REFERENCES payment_applications(id),
  cost_code TEXT,
  description TEXT,
  scheduled_amount DECIMAL,
  previously_billed DECIMAL DEFAULT 0,
  current_billed DECIMAL NOT NULL,
  to_date_billed DECIMAL GENERATED ALWAYS AS (previously_billed + current_billed) STORED,
  percent_complete DECIMAL,
  work_performed TEXT
);
```

---

### **Day 6-7: Financial Analytics**

**Components:**

```
src/components/analytics/
├── CashFlowForecaster.tsx
├── EarnedValueAnalysis.tsx
├── JobCostReport.tsx
└── ProfitabilityDashboard.tsx
```

**Features:**

- Cash flow projection
- Earned value analysis (EV, PV, AC, SPI, CPI)
- Cost performance indicators
- Budget variance analysis
- Profitability by project/cost code
- Trend analysis

---

## 📋 **WEEK 4: PORTFOLIO & REPORTING**

### **Day 1-2: Portfolio Management**

**Components:**

```
src/components/portfolio/
├── PortfolioDashboard.tsx
├── PortfolioHealth.tsx
├── ResourceAllocation.tsx
└── StrategicAlignment.tsx
```

**Features:**

- Multi-project overview
- Portfolio health indicators
- Resource allocation across projects
- Strategic alignment tracking
- Risk assessment
- Revenue forecasting

---

### **Day 3-4: Report Builder**

**Dependencies:**

```bash
npm install jspdf jspdf-autotable @tanstack/react-query
```

**Components:**

```
src/components/reports/
├── ReportBuilder.tsx
├── ReportTemplate.tsx
├── ReportScheduler.tsx
└── ReportExporter.tsx
```

**Features:**

- Visual report builder
- Drag-and-drop components
- Custom calculations
- Report templates
- Scheduled reports
- PDF & Excel export
- Email distribution

---

### **Day 5-7: Testing & Polish**

**Tasks:**

- End-to-end testing
- Performance optimization
- Bug fixes
- Documentation
- User training materials
- Demo preparation

---

## 📦 **DEPENDENCIES TO INSTALL**

```bash
# Gantt & Charts
npm install react-gantt-chart @dhtmlx/gantt @dhtmlx/tree recharts d3

# Document Management
npm install react-pdf pdf-lib react-image-annotate tesseract.js

# Financial Calculations
npm install decimal.js currency.js date-fns accounting

# Reports
npm install jspdf jspdf-autotable xlsx file-saver

# UI Components
npm install @radix-ui/react-select @radix-ui/react-dialog
npm install @radix-ui/react-popover @radix-ui/react-tabs
npm install recharts react-table @tanstack/react-table
```

---

## 🗄️ **DATABASE MIGRATIONS**

Create migration file:

```bash
supabase migration new phase_1_enterprise_core
```

All SQL schemas from above sections.

---

## ✅ **COMPLETION CRITERIA**

### **Week 1 Success:**

- ✅ Gantt chart fully functional
- ✅ WBS builder working
- ✅ Critical path calculation accurate
- ✅ Resource leveling operational

### **Week 2 Success:**

- ✅ Document viewer with markup
- ✅ OCR processing working
- ✅ Drawing revisions tracked
- ✅ Transmittals functional

### **Week 3 Success:**

- ✅ Budget framework complete
- ✅ Contracts managed properly
- ✅ Change orders workflow works
- ✅ Payment applications accurate

### **Week 4 Success:**

- ✅ Portfolio dashboard live
- ✅ Report builder functional
- ✅ All tests passing
- ✅ Documentation complete

---

## 🎯 **PHASE 1 DELIVERABLES**

1. ✅ Advanced Project Management
2. ✅ Enterprise Document Management
3. ✅ Complete Financial Framework
4. ✅ Portfolio Management
5. ✅ Reporting Suite
6. ✅ Database Migrations
7. ✅ API Documentation
8. ✅ User Documentation

---

## 🚀 **READY TO START!**

**Next:** Begin Week 1 implementation  
**Goal:** Complete Phase 1 in 4 weeks  
**Status:** Ready for development

---

*Let's build enterprise-grade features! 🏗️*
