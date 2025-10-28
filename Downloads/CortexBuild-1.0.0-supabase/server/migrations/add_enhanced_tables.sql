-- Enhanced Tables Migration for CortexBuild
-- Adds missing tables for complete functionality

-- ============================================
-- CHAT & COMMUNICATION
-- ============================================

-- Chat history for AI conversations
CREATE TABLE IF NOT EXISTS chat_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata TEXT, -- JSON: tokens, model, cost, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_history_conversation ON chat_history(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_company ON chat_history(company_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    type TEXT NOT NULL, -- task_assigned, rfi_response, budget_alert, etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT, -- Deep link to related resource
    is_read BOOLEAN DEFAULT 0,
    is_archived BOOLEAN DEFAULT 0,
    priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
    metadata TEXT, -- JSON: additional data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- ============================================
-- AUDIT & COMPLIANCE
-- ============================================

-- Comprehensive audit log
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    company_id TEXT NOT NULL,
    action TEXT NOT NULL, -- create, update, delete, view, export
    entity_type TEXT NOT NULL, -- project, task, invoice, etc.
    entity_id TEXT NOT NULL,
    changes TEXT, -- JSON: before/after snapshot
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- CONSTRUCTION-SPECIFIC
-- ============================================

-- Change orders
CREATE TABLE IF NOT EXISTS change_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    co_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reason TEXT, -- design change, site condition, owner request, etc.
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'approved', 'rejected', 'executed')),
    cost_impact DECIMAL(15, 2) DEFAULT 0,
    schedule_impact_days INTEGER DEFAULT 0,
    requested_by TEXT,
    approved_by TEXT,
    submitted_date DATE,
    approved_date DATE,
    executed_date DATE,
    attachments TEXT, -- JSON array of document IDs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_change_orders_project ON change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);

-- Safety incidents
CREATE TABLE IF NOT EXISTS safety_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    incident_number TEXT UNIQUE NOT NULL,
    incident_type TEXT NOT NULL, -- near_miss, first_aid, recordable, lost_time, fatality
    severity TEXT NOT NULL CHECK(severity IN ('minor', 'moderate', 'serious', 'critical')),
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    incident_date DATETIME NOT NULL,
    reported_by TEXT NOT NULL,
    affected_person TEXT,
    witnesses TEXT, -- JSON array
    root_cause TEXT,
    corrective_actions TEXT,
    preventive_actions TEXT,
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'investigating', 'resolved', 'closed')),
    osha_recordable BOOLEAN DEFAULT 0,
    days_lost INTEGER DEFAULT 0,
    attachments TEXT, -- JSON array of photo/document IDs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_safety_incidents_project ON safety_incidents(project_id);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_date ON safety_incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_type ON safety_incidents(incident_type);

-- Equipment tracking
CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    equipment_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- heavy equipment, tools, vehicles, etc.
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_date DATE,
    purchase_cost DECIMAL(15, 2),
    current_value DECIMAL(15, 2),
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'in-use', 'maintenance', 'retired')),
    location TEXT,
    current_project_id INTEGER,
    gps_coordinates TEXT, -- lat, lng JSON
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_interval_days INTEGER DEFAULT 90,
    qr_code TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (current_project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_equipment_company ON equipment(company_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_project ON equipment(current_project_id);

-- Equipment usage log
CREATE TABLE IF NOT EXISTS equipment_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    checkout_date DATETIME NOT NULL,
    checkin_date DATETIME,
    hours_used DECIMAL(8, 2),
    condition_at_checkout TEXT CHECK(condition_at_checkout IN ('excellent', 'good', 'fair', 'poor')),
    condition_at_return TEXT CHECK(condition_at_return IN ('excellent', 'good', 'fair', 'poor')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_equipment_usage_equipment ON equipment_usage(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_usage_project ON equipment_usage(project_id);

-- Material inventory
CREATE TABLE IF NOT EXISTS material_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    project_id INTEGER, -- NULL if warehouse stock
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- concrete, steel, lumber, fixtures, etc.
    unit_of_measure TEXT NOT NULL, -- ea, lf, sf, cy, ton, etc.
    quantity_on_hand DECIMAL(12, 2) DEFAULT 0,
    minimum_quantity DECIMAL(12, 2) DEFAULT 0,
    unit_cost DECIMAL(12, 2),
    total_value DECIMAL(15, 2),
    location TEXT,
    supplier_id INTEGER,
    last_order_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES subcontractors(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_material_inventory_company ON material_inventory(company_id);
CREATE INDEX IF NOT EXISTS idx_material_inventory_project ON material_inventory(project_id);
CREATE INDEX IF NOT EXISTS idx_material_inventory_sku ON material_inventory(sku);

-- Material transactions
CREATE TABLE IF NOT EXISTS material_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('purchase', 'usage', 'transfer', 'adjustment', 'return')),
    quantity DECIMAL(12, 2) NOT NULL,
    unit_cost DECIMAL(12, 2),
    from_location TEXT,
    to_location TEXT,
    project_id INTEGER,
    user_id TEXT NOT NULL,
    po_id INTEGER, -- Reference to purchase order if applicable
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES material_inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_material_transactions_material ON material_transactions(material_id);
CREATE INDEX IF NOT EXISTS idx_material_transactions_project ON material_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_material_transactions_date ON material_transactions(created_at);

-- Quality inspections
CREATE TABLE IF NOT EXISTS quality_inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    inspection_number TEXT UNIQUE NOT NULL,
    inspection_type TEXT NOT NULL, -- framing, electrical, plumbing, final, etc.
    area_location TEXT NOT NULL,
    inspector_name TEXT NOT NULL,
    inspector_company TEXT,
    inspection_date DATETIME NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'in-progress', 'passed', 'failed', 'conditional')),
    result TEXT CHECK(result IN ('pass', 'fail', 'conditional')),
    deficiencies TEXT, -- JSON array of issues found
    deficiencies_resolved BOOLEAN DEFAULT 0,
    re_inspection_required BOOLEAN DEFAULT 0,
    re_inspection_date DATE,
    notes TEXT,
    photos TEXT, -- JSON array of photo IDs
    documents TEXT, -- JSON array of document IDs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quality_inspections_project ON quality_inspections(project_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_date ON quality_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_status ON quality_inspections(status);

-- ============================================
-- IOT & SENSOR DATA
-- ============================================

-- IoT sensor data
CREATE TABLE IF NOT EXISTS sensor_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    sensor_id TEXT NOT NULL,
    sensor_type TEXT NOT NULL, -- gps, temperature, humidity, air_quality, vibration, etc.
    value DECIMAL(12, 4) NOT NULL,
    unit TEXT NOT NULL,
    location TEXT,
    gps_coordinates TEXT, -- lat, lng JSON
    metadata TEXT, -- JSON: additional sensor info
    timestamp DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sensor_data_project ON sensor_data(project_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_sensor ON sensor_data(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_sensor_data_type ON sensor_data(sensor_type);

-- ============================================
-- ENHANCED FILE MANAGEMENT
-- ============================================

-- File uploads (complements existing documents table)
CREATE TABLE IF NOT EXISTS file_uploads (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    project_id INTEGER,
    uploader_id TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    stored_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    file_hash TEXT, -- SHA-256 for deduplication
    thumbnail_path TEXT,
    category TEXT, -- drawing, photo, document, model, etc.
    tags TEXT, -- JSON array
    is_public BOOLEAN DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    virus_scanned BOOLEAN DEFAULT 0,
    virus_scan_result TEXT,
    metadata TEXT, -- JSON: EXIF data, dimensions, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_file_uploads_company ON file_uploads(company_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_project ON file_uploads(project_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_hash ON file_uploads(file_hash);
CREATE INDEX IF NOT EXISTS idx_file_uploads_category ON file_uploads(category);

-- ============================================
-- REPORTING & ANALYTICS
-- ============================================

-- Daily logs / field reports
CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    log_date DATE NOT NULL,
    weather_conditions TEXT,
    temperature_high INTEGER,
    temperature_low INTEGER,
    work_performed TEXT NOT NULL,
    crew_count INTEGER,
    equipment_on_site TEXT, -- JSON array
    materials_delivered TEXT, -- JSON array
    visitors TEXT, -- JSON array
    safety_incidents TEXT, -- JSON array of incident IDs
    delays TEXT,
    issues TEXT,
    photos TEXT, -- JSON array of photo IDs
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(project_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_project ON daily_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(log_date);

-- Weekly progress reports
CREATE TABLE IF NOT EXISTS weekly_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    overall_progress INTEGER DEFAULT 0,
    work_completed TEXT NOT NULL,
    work_planned TEXT NOT NULL,
    issues_risks TEXT,
    budget_status TEXT,
    schedule_status TEXT,
    safety_summary TEXT,
    photos TEXT, -- JSON array
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_project ON weekly_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_date ON weekly_reports(week_start_date);

-- ============================================
-- BIM & 3D MODELS
-- ============================================

-- BIM models
CREATE TABLE IF NOT EXISTS bim_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    model_name TEXT NOT NULL,
    file_id TEXT NOT NULL, -- Reference to file_uploads
    file_format TEXT NOT NULL, -- ifc, rvt, nwd, etc.
    version TEXT DEFAULT '1.0',
    discipline TEXT, -- architectural, structural, mep, etc.
    model_date DATE,
    file_size INTEGER,
    thumbnail_url TEXT,
    viewer_url TEXT, -- URL to 3D viewer
    metadata TEXT, -- JSON: model stats, element counts, etc.
    uploaded_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES file_uploads(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bim_models_project ON bim_models(project_id);

-- Clash detection results
CREATE TABLE IF NOT EXISTS clash_detections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    model_id INTEGER NOT NULL,
    clash_name TEXT NOT NULL,
    severity TEXT DEFAULT 'medium' CHECK(severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'reviewing', 'resolved', 'approved')),
    element_1 TEXT NOT NULL, -- Element ID
    element_2 TEXT NOT NULL, -- Element ID
    clash_point TEXT, -- JSON: x, y, z coordinates
    description TEXT,
    assigned_to TEXT,
    resolution TEXT,
    resolved_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES bim_models(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_clash_detections_model ON clash_detections(model_id);
CREATE INDEX IF NOT EXISTS idx_clash_detections_status ON clash_detections(status);

-- ============================================
-- COMPLETION
-- ============================================

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL,
    description TEXT,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_version (version, description) VALUES ('2.0.0', 'Enhanced tables migration - Chat, Notifications, Audit, Construction-specific, IoT, BIM');
