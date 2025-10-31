-- Phase 1: Enterprise Core Database Schema
-- Created: 31 October 2025
-- Description: Gantt charts, WBS, advanced documents, financial management
-- ============================================================================
-- GANTT CHART & PROJECT SCHEDULING
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_tasks_gantt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES project_tasks_gantt(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    duration INTEGER,
    -- in days
    progress DECIMAL(5, 2) DEFAULT 0 CHECK (
        progress >= 0
        AND progress <= 100
    ),
    type TEXT CHECK (
        type IN ('task', 'milestone', 'project', 'summary')
    ),
    resource_allocation JSONB DEFAULT '[]'::jsonb,
    dependencies JSONB DEFAULT '[]'::jsonb,
    -- array of task IDs
    critical_path BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'medium' CHECK (
        priority IN ('low', 'medium', 'high', 'critical')
    ),
    description TEXT,
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_gantt_project ON project_tasks_gantt(project_id);
CREATE INDEX idx_gantt_parent ON project_tasks_gantt(parent_id);
CREATE INDEX idx_gantt_dates ON project_tasks_gantt(start_date, end_date);
CREATE TABLE IF NOT EXISTS gantt_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    predecessor_task_id UUID REFERENCES project_tasks_gantt(id) ON DELETE CASCADE,
    successor_task_id UUID REFERENCES project_tasks_gantt(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'finish_to_start' CHECK (
        type IN (
            'finish_to_start',
            'start_to_start',
            'finish_to_finish',
            'start_to_finish'
        )
    ),
    lag INTEGER DEFAULT 0,
    -- lag in days
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(predecessor_task_id, successor_task_id)
);
-- ============================================================================
-- WORK BREAKDOWN STRUCTURE (WBS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS wbs_structure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES wbs_structure(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    -- e.g., "1.2.3"
    name TEXT NOT NULL,
    description TEXT,
    level INTEGER NOT NULL CHECK (level >= 0),
    cost_budget DECIMAL(15, 2) DEFAULT 0,
    schedule_budget INTERVAL,
    actual_cost DECIMAL(15, 2) DEFAULT 0,
    actual_duration INTERVAL,
    percentage_complete DECIMAL(5, 2) DEFAULT 0 CHECK (
        percentage_complete >= 0
        AND percentage_complete <= 100
    ),
    status TEXT DEFAULT 'not_started' CHECK (
        status IN (
            'not_started',
            'in_progress',
            'completed',
            'on_hold',
            'cancelled'
        )
    ),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, code)
);
CREATE INDEX idx_wbs_project ON wbs_structure(project_id);
CREATE INDEX idx_wbs_parent ON wbs_structure(parent_id);
CREATE INDEX idx_wbs_code ON wbs_structure(project_id, code);
CREATE TABLE IF NOT EXISTS wbs_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wbs_id UUID REFERENCES wbs_structure(id) ON DELETE CASCADE,
    resource_type TEXT CHECK (
        resource_type IN ('labor', 'material', 'equipment', 'subcontract')
    ),
    resource_id UUID,
    -- references various resource tables
    quantity DECIMAL(15, 2) NOT NULL,
    unit TEXT,
    unit_cost DECIMAL(15, 2),
    total_cost DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * COALESCE(unit_cost, 0)) STORED,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_wbs_resources_wbs ON wbs_resources(wbs_id);
-- ============================================================================
-- ADVANCED DOCUMENT MANAGEMENT
-- ============================================================================
CREATE TABLE IF NOT EXISTS drawing_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drawing_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    revision_number TEXT NOT NULL,
    date_revision TIMESTAMP,
    description TEXT,
    superseded_by UUID REFERENCES drawing_revisions(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(drawing_id, revision_number)
);
CREATE TABLE IF NOT EXISTS drawing_transmittals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    transmittal_number TEXT UNIQUE NOT NULL,
    date_sent TIMESTAMP DEFAULT NOW(),
    from_company_id UUID REFERENCES companies(id),
    to_company_id UUID REFERENCES companies(id),
    subject TEXT,
    description TEXT,
    drawings JSONB DEFAULT '[]'::jsonb,
    -- array of drawing IDs
    status TEXT DEFAULT 'sent' CHECK (
        status IN ('sent', 'received', 'acknowledged', 'rejected')
    ),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_transmittals_project ON drawing_transmittals(project_id);
CREATE INDEX idx_transmittals_status ON drawing_transmittals(status);
-- Document annotations/markups
CREATE TABLE IF NOT EXISTS document_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER,
    annotation_type TEXT CHECK (
        annotation_type IN (
            'highlight',
            'note',
            'circle',
            'rectangle',
            'arrow',
            'text',
            'stamp'
        )
    ),
    coordinates JSONB NOT NULL,
    -- {x, y, width, height} or similar
    content TEXT,
    color TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_annotations_document ON document_annotations(document_id);
-- ============================================================================
-- FINANCIAL MANAGEMENT
-- ============================================================================
-- CSI MasterFormat Reference Table
CREATE TABLE IF NOT EXISTS csi_masterformat (
    code TEXT PRIMARY KEY,
    division_number TEXT,
    division_title TEXT,
    section_number TEXT,
    section_title TEXT,
    level INTEGER,
    parent_code TEXT REFERENCES csi_masterformat(code)
);
CREATE TABLE IF NOT EXISTS project_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    budget_name TEXT NOT NULL,
    budget_type TEXT CHECK (budget_type IN ('master', 'revised', 'forecast')),
    cost_code TEXT REFERENCES csi_masterformat(code),
    cost_code_name TEXT,
    category TEXT CHECK (
        category IN (
            'labor',
            'material',
            'equipment',
            'subcontract',
            'overhead',
            'other'
        )
    ),
    budget_amount DECIMAL(15, 2) NOT NULL,
    committed_amount DECIMAL(15, 2) DEFAULT 0,
    spent_amount DECIMAL(15, 2) DEFAULT 0,
    forecast_amount DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_budgets_project ON project_budgets(project_id);
CREATE INDEX idx_budgets_cost_code ON project_budgets(cost_code);
-- Contracts
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    -- prime or subcontractor
    contract_number TEXT UNIQUE NOT NULL,
    contract_type TEXT CHECK (
        contract_type IN (
            'prime',
            'subcontract',
            'purchase_order',
            'service'
        )
    ),
    contract_amount DECIMAL(15, 2) NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'draft' CHECK (
        status IN (
            'draft',
            'active',
            'completed',
            'terminated',
            'cancelled'
        )
    ),
    terms JSONB DEFAULT '{}'::jsonb,
    retainage_percentage DECIMAL(5, 2) DEFAULT 0,
    insurance_required JSONB DEFAULT '[]'::jsonb,
    bonds_required JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_contracts_project ON contracts(project_id);
CREATE INDEX idx_contracts_company ON contracts(company_id);
-- Change Orders
CREATE TABLE IF NOT EXISTS change_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    change_order_number TEXT NOT NULL,
    date_requested DATE DEFAULT CURRENT_DATE,
    date_approved DATE,
    description TEXT NOT NULL,
    reason TEXT,
    cost_impact DECIMAL(15, 2) NOT NULL DEFAULT 0,
    schedule_impact_days INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'rejected', 'voided')
    ),
    approved_by UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(contract_id, change_order_number)
);
CREATE INDEX idx_change_orders_contract ON change_orders(contract_id);
-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES companies(id),
    po_number TEXT UNIQUE NOT NULL,
    date_ordered DATE DEFAULT CURRENT_DATE,
    date_required DATE,
    status TEXT DEFAULT 'draft' CHECK (
        status IN (
            'draft',
            'pending',
            'approved',
            'ordered',
            'received',
            'closed',
            'cancelled'
        )
    ),
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    terms TEXT,
    delivery_location TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_po_project ON purchase_orders(project_id);
CREATE INDEX idx_po_vendor ON purchase_orders(vendor_id);
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    quantity DECIMAL(15, 2) NOT NULL,
    unit TEXT,
    unit_cost DECIMAL(15, 2) NOT NULL,
    cost_code TEXT REFERENCES csi_masterformat(code),
    delivery_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_po_items_po ON purchase_order_items(po_id);
-- Payment Applications
CREATE TABLE IF NOT EXISTS payment_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    application_number TEXT NOT NULL,
    application_date DATE DEFAULT CURRENT_DATE,
    work_performed_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    stored_materials_amount DECIMAL(15, 2) DEFAULT 0,
    retainage_held DECIMAL(15, 2) DEFAULT 0,
    retention_percentage DECIMAL(5, 2) DEFAULT 0,
    total_billed_amount DECIMAL(15, 2) GENERATED ALWAYS AS (
        work_performed_amount + COALESCE(stored_materials_amount, 0) - COALESCE(retainage_held, 0)
    ) STORED,
    previous_payments_received DECIMAL(15, 2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (
        status IN (
            'draft',
            'submitted',
            'reviewed',
            'approved',
            'paid',
            'rejected'
        )
    ),
    submitted_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, application_number)
);
CREATE INDEX idx_payment_apps_project ON payment_applications(project_id);
CREATE TABLE IF NOT EXISTS payment_application_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_app_id UUID REFERENCES payment_applications(id) ON DELETE CASCADE,
    cost_code TEXT,
    description TEXT NOT NULL,
    scheduled_amount DECIMAL(15, 2) DEFAULT 0,
    previously_billed DECIMAL(15, 2) DEFAULT 0,
    current_billed DECIMAL(15, 2) NOT NULL DEFAULT 0,
    percent_complete DECIMAL(5, 2) DEFAULT 0,
    work_performed TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_payment_items_app ON payment_application_line_items(payment_app_id);
-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_gantt_tasks_updated_at BEFORE
UPDATE ON project_tasks_gantt FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wbs_updated_at BEFORE
UPDATE ON wbs_structure FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transmittals_updated_at BEFORE
UPDATE ON drawing_transmittals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_annotations_updated_at BEFORE
UPDATE ON document_annotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE
UPDATE ON project_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE
UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_change_orders_updated_at BEFORE
UPDATE ON change_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_po_updated_at BEFORE
UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_apps_updated_at BEFORE
UPDATE ON payment_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE project_tasks_gantt ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE wbs_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE wbs_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawing_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawing_transmittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_application_line_items ENABLE ROW LEVEL SECURITY;
-- Policy function for company-based access
CREATE OR REPLACE FUNCTION get_user_company_id() RETURNS UUID AS $$
SELECT company_id
FROM users
WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;
-- Gantt tasks policies
CREATE POLICY "Users can view gantt tasks in their company projects" ON project_tasks_gantt FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM projects p
            WHERE p.id = project_tasks_gantt.project_id
                AND p.company_id = get_user_company_id()
        )
    );
CREATE POLICY "Users can insert gantt tasks in their company projects" ON project_tasks_gantt FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM projects p
            WHERE p.id = project_tasks_gantt.project_id
                AND p.company_id = get_user_company_id()
        )
    );
CREATE POLICY "Users can update gantt tasks in their company projects" ON project_tasks_gantt FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM projects p
            WHERE p.id = project_tasks_gantt.project_id
                AND p.company_id = get_user_company_id()
        )
    );
CREATE POLICY "Users can delete gantt tasks in their company projects" ON project_tasks_gantt FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM projects p
        WHERE p.id = project_tasks_gantt.project_id
            AND p.company_id = get_user_company_id()
    )
);
-- Similar policies for other tables (abbreviated for brevity)
-- In production, add full RLS policies for all tables
-- ============================================================================
-- INSERT CSI MASTERFORMAT DATA
-- ============================================================================
INSERT INTO csi_masterformat (
        code,
        division_number,
        division_title,
        section_number,
        section_title,
        level
    )
VALUES (
        '01',
        '01',
        'General Requirements',
        NULL,
        NULL,
        1
    ),
    (
        '01 00 00',
        '01',
        'General Requirements',
        '00',
        'General',
        2
    ),
    (
        '01 10 00',
        '01',
        'General Requirements',
        '10',
        'Summary',
        3
    ),
    (
        '01 20 00',
        '01',
        'General Requirements',
        '20',
        'Allowances',
        3
    ),
    (
        '01 30 00',
        '01',
        'General Requirements',
        '30',
        'Administrative Requirements',
        3
    ),
    ('03 00 00', '03', 'Concrete', '00', 'General', 2),
    (
        '03 10 00',
        '03',
        'Concrete',
        '10',
        'Concrete Materials',
        3
    ),
    (
        '03 20 00',
        '03',
        'Concrete',
        '20',
        'Concrete Reinforcing',
        3
    ),
    (
        '03 30 00',
        '03',
        'Concrete',
        '30',
        'Cast-in-Place Concrete',
        3
    ),
    ('04 00 00', '04', 'Masonry', '00', 'General', 2),
    (
        '04 20 00',
        '04',
        'Masonry',
        '20',
        'Unit Masonry',
        3
    ),
    ('05 00 00', '05', 'Metals', '00', 'General', 2),
    (
        '05 10 00',
        '05',
        'Metals',
        '10',
        'Structural Metal Framing',
        3
    ),
    (
        '05 20 00',
        '05',
        'Metals',
        '20',
        'Metal Joists',
        3
    ),
    (
        '06 00 00',
        '06',
        'Wood, Plastics, and Composites',
        '00',
        'General',
        2
    ),
    (
        '06 10 00',
        '06',
        'Wood, Plastics, and Composites',
        '10',
        'Rough Carpentry',
        3
    ),
    ('09 00 00', '09', 'Finishes', '00', 'General', 2),
    (
        '09 20 00',
        '09',
        'Finishes',
        '20',
        'Plaster and Gypsum Board',
        3
    ),
    ('09 30 00', '09', 'Finishes', '30', 'Tiling', 3),
    ('22 00 00', '22', 'Plumbing', '00', 'General', 2),
    ('23 00 00', '23', 'HVAC', '00', 'General', 2),
    (
        '26 00 00',
        '26',
        'Electrical',
        '00',
        'General',
        2
    ) ON CONFLICT (code) DO NOTHING;
-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE project_tasks_gantt IS 'Gantt chart tasks for project scheduling';
COMMENT ON TABLE gantt_dependencies IS 'Dependencies between gantt tasks';
COMMENT ON TABLE wbs_structure IS 'Work Breakdown Structure for projects';
COMMENT ON TABLE csi_masterformat IS 'CSI MasterFormat cost codes reference';
COMMENT ON TABLE project_budgets IS 'Project budgets with CSI cost codes';
COMMENT ON TABLE contracts IS 'Contracts (prime, subcontract, PO, service)';
COMMENT ON TABLE change_orders IS 'Contract change orders';
COMMENT ON TABLE purchase_orders IS 'Purchase orders for materials/equipment';
COMMENT ON TABLE payment_applications IS 'Payment applications/requests';
COMMENT ON TABLE drawing_transmittals IS 'Drawing transmittals between parties';