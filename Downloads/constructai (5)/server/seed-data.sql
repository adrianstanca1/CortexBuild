-- Create core tables (users, companies, sessions)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT,
    company_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Insert company
INSERT OR IGNORE INTO companies (id, name) VALUES ('company-1', 'ConstructCo');

-- Insert users (password: password123)
INSERT OR IGNORE INTO users (id, email, password_hash, name, role, company_id) VALUES 
('user-1', 'adrian.stanca1@gmail.com', '$2b$10$84qfBVGh6GWAvEqhUKjy9uyu0xAWEQesDAN/qDj/i42G69DUH5VJu', 'Adrian Stanca', 'super_admin', 'company-1'),
('user-2', 'casey@constructco.com', '$2b$10$84qfBVGh6GWAvEqhUKjy9uyu0xAWEQesDAN/qDj/i42G69DUH5VJu', 'Casey Johnson', 'admin', 'company-1'),
('user-3', 'mike@constructco.com', '$2b$10$84qfBVGh6GWAvEqhUKjy9uyu0xAWEQesDAN/qDj/i42G69DUH5VJu', 'Mike Wilson', 'manager', 'company-1');

-- Insert sample clients
INSERT OR IGNORE INTO clients (company_id, name, contact_name, email, phone, address, city, state, zip_code, payment_terms, is_active) VALUES
('company-1', 'Canary Wharf Development Ltd', 'James Thompson', 'james@canarywharf.co.uk', '+44 20 7123 4567', '1 Canada Square', 'London', 'England', 'E14 5AB', 30, 1),
('company-1', 'Thames Riverside Properties', 'Sarah Mitchell', 'sarah@thamesriverside.co.uk', '+44 20 7234 5678', '25 Riverside Walk', 'London', 'England', 'SE1 9PP', 30, 1),
('company-1', 'Manchester City Centre Ltd', 'David Brown', 'david@manchestercity.co.uk', '+44 161 234 5678', '50 Deansgate', 'Manchester', 'England', 'M3 2EG', 45, 1),
('company-1', 'Birmingham Shopping Complex', 'Emma Wilson', 'emma@birminghamshop.co.uk', '+44 121 234 5678', '100 Bull Street', 'Birmingham', 'England', 'B4 6AF', 30, 1);

-- Insert sample projects (GBP budgets)
INSERT OR IGNORE INTO projects (company_id, name, description, project_number, status, priority, start_date, end_date, budget, actual_cost, address, city, state, zip_code, client_id, progress) VALUES
('company-1', 'Canary Wharf Tower Extension', 'Modern 15-story office tower with retail space', 'PRJ-2024-001', 'active', 'high', '2024-01-15', '2025-12-31', 12500000, 8375000, '1 Canada Square', 'London', 'England', 'E14 5AB', 1, 67),
('company-1', 'Thames Riverside Development', 'Luxury residential complex with 200 units', 'PRJ-2024-002', 'active', 'high', '2024-03-01', '2025-09-30', 8900000, 4005000, '25 Riverside Walk', 'London', 'England', 'SE1 9PP', 2, 45),
('company-1', 'Manchester City Centre', 'Mixed-use development with offices and retail', 'PRJ-2024-003', 'planning', 'medium', '2024-06-01', '2026-03-31', 6200000, 930000, '50 Deansgate', 'Manchester', 'England', 'M3 2EG', 3, 15),
('company-1', 'Birmingham Shopping Complex', 'Modern shopping centre renovation', 'PRJ-2024-004', 'on-hold', 'medium', '2024-04-15', '2025-08-31', 7800000, 2340000, '100 Bull Street', 'Birmingham', 'England', 'B4 6AF', 4, 30);

-- Insert sample RFIs
INSERT OR IGNORE INTO rfis (project_id, subject, description, status, priority, submitted_by, assigned_to, due_date) VALUES
(1, 'Foundation Specifications', 'Need clarification on foundation depth requirements for tower extension', 'open', 'high', 1, 2, '2024-10-15'),
(1, 'Material Substitution', 'Request approval for alternative cladding material', 'in-review', 'medium', 2, 1, '2024-10-20'),
(2, 'Electrical Layout', 'Clarification needed on electrical panel locations', 'open', 'medium', 1, 3, '2024-10-18');

-- Insert sample invoices (GBP amounts)
INSERT OR IGNORE INTO invoices (company_id, project_id, client_id, invoice_number, issue_date, due_date, status, subtotal, tax, total, notes) VALUES
('company-1', 1, 1, 'INV-2024-001', '2024-09-01', '2024-10-01', 'paid', 250000, 50000, 300000, 'Phase 1 completion payment'),
('company-1', 1, 1, 'INV-2024-002', '2024-10-01', '2024-11-01', 'sent', 375000, 75000, 450000, 'Phase 2 progress payment'),
('company-1', 2, 2, 'INV-2024-003', '2024-09-15', '2024-10-15', 'paid', 180000, 36000, 216000, 'Foundation work completed'),
('company-1', 2, 2, 'INV-2024-004', '2024-10-01', '2024-11-01', 'pending', 220000, 44000, 264000, 'Structural steel installation');

-- Insert sample time entries
INSERT OR IGNORE INTO time_entries (project_id, user_id, date, hours, description, billable, hourly_rate) VALUES
(1, 1, '2024-10-07', 8.5, 'Site inspection and progress review', 1, 125),
(1, 2, '2024-10-07', 7.0, 'Coordination with subcontractors', 1, 95),
(2, 1, '2024-10-08', 6.5, 'Client meeting and design review', 1, 125),
(2, 3, '2024-10-08', 8.0, 'Foundation inspection', 1, 85);

-- Insert sample subcontractors
INSERT OR IGNORE INTO subcontractors (company_id, name, contact_name, email, phone, trade, rating, is_active) VALUES
('company-1', 'London Steel Works Ltd', 'Robert Taylor', 'robert@londonsteel.co.uk', '+44 20 7345 6789', 'Structural Steel', 4.8, 1),
('company-1', 'Thames Electrical Services', 'Lisa Anderson', 'lisa@thameselec.co.uk', '+44 20 7456 7890', 'Electrical', 4.5, 1),
('company-1', 'Manchester Plumbing Co', 'Tom Harris', 'tom@manchesterplumb.co.uk', '+44 161 345 6789', 'Plumbing', 4.7, 1);

-- Insert sample purchase orders (GBP amounts)
INSERT OR IGNORE INTO purchase_orders (company_id, project_id, vendor_name, po_number, order_date, delivery_date, status, total_amount, notes) VALUES
('company-1', 1, 'London Steel Works Ltd', 'PO-2024-001', '2024-09-01', '2024-10-15', 'delivered', 450000, 'Structural steel for tower extension'),
('company-1', 1, 'Thames Electrical Services', 'PO-2024-002', '2024-09-15', '2024-11-01', 'pending', 180000, 'Electrical materials and fixtures'),
('company-1', 2, 'Manchester Plumbing Co', 'PO-2024-003', '2024-10-01', '2024-10-30', 'ordered', 95000, 'Plumbing supplies for residential units');

-- Insert sample documents
INSERT OR IGNORE INTO documents (project_id, name, type, file_path, file_size, uploaded_by) VALUES
(1, 'Tower Extension Plans.pdf', 'drawing', '/uploads/tower-plans.pdf', 2457600, 1),
(1, 'Safety Inspection Report.pdf', 'report', '/uploads/safety-report.pdf', 1048576, 2),
(2, 'Residential Layout.dwg', 'drawing', '/uploads/residential-layout.dwg', 3145728, 1);

-- Insert sample tasks
INSERT OR IGNORE INTO tasks (project_id, title, description, status, priority, assigned_to, due_date, estimated_hours, progress) VALUES
(1, 'Foundation Inspection', 'Complete final foundation inspection before steel installation', 'completed', 'high', 2, '2024-09-30', 16, 100),
(1, 'Steel Frame Installation', 'Install structural steel frame for floors 1-5', 'in-progress', 'high', 2, '2024-10-31', 320, 65),
(2, 'Site Preparation', 'Clear and prepare construction site', 'completed', 'high', 3, '2024-03-15', 80, 100),
(2, 'Foundation Work', 'Pour foundation for residential building', 'in-progress', 'high', 3, '2024-10-20', 240, 75);

-- Insert sample milestones
INSERT OR IGNORE INTO milestones (project_id, name, description, due_date, status, progress) VALUES
(1, 'Foundation Complete', 'All foundation work completed and inspected', '2024-09-30', 'completed', 100),
(1, 'Steel Frame Complete', 'Structural steel installation finished', '2024-11-30', 'in-progress', 65),
(2, 'Site Preparation', 'Site cleared and ready for construction', '2024-03-31', 'completed', 100),
(2, 'Foundation Complete', 'Foundation poured and cured', '2024-10-31', 'in-progress', 75);

