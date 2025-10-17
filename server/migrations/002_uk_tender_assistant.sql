-- ============================================================================
-- UK Tender Assistant Module
-- Procurement Act 2023 Compliant
-- ============================================================================

-- Tenders Table
CREATE TABLE IF NOT EXISTS tenders (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL, -- 'contracts-finder', 'find-tender', 'scotland', 'wales'
  external_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  value REAL,
  currency TEXT DEFAULT 'GBP',
  contract_type TEXT CHECK(contract_type IN ('main-contractor', 'subcontractor', 'services', 'goods')),
  location TEXT,
  postcode TEXT,
  region TEXT, -- 'England', 'Scotland', 'Wales', 'Northern Ireland'
  deadline DATETIME,
  published_date DATETIME,
  procurement_act_compliant BOOLEAN DEFAULT 1,
  keywords TEXT, -- JSON array
  documents TEXT, -- JSON array of URLs
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  buyer_organization TEXT,
  cpv_codes TEXT, -- JSON array of CPV codes
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'closed', 'awarded', 'canceled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tender Alerts
CREATE TABLE IF NOT EXISTS tender_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  keywords TEXT, -- JSON array
  location TEXT,
  regions TEXT, -- JSON array
  min_value REAL,
  max_value REAL,
  contract_types TEXT, -- JSON array
  frequency TEXT DEFAULT 'instant' CHECK(frequency IN ('instant', 'daily', 'weekly')),
  last_sent DATETIME,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Generated Bids
CREATE TABLE IF NOT EXISTS generated_bids (
  id TEXT PRIMARY KEY,
  tender_id TEXT,
  company_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  compliance_score INTEGER,
  compliance_checks TEXT, -- JSON
  social_value_score INTEGER,
  sustainability_score INTEGER,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'reviewed', 'submitted', 'won', 'lost', 'withdrawn')),
  submitted_at DATETIME,
  decision_date DATETIME,
  feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE SET NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Cost Estimates
CREATE TABLE IF NOT EXISTS cost_estimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tender_id TEXT,
  generated_bid_id TEXT,
  company_id TEXT NOT NULL,
  materials REAL DEFAULT 0,
  labor REAL DEFAULT 0,
  equipment REAL DEFAULT 0,
  subcontractors REAL DEFAULT 0,
  overheads REAL DEFAULT 0,
  profit_margin REAL DEFAULT 0,
  vat REAL DEFAULT 0,
  total REAL DEFAULT 0,
  breakdown TEXT, -- JSON detailed breakdown
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE SET NULL,
  FOREIGN KEY (generated_bid_id) REFERENCES generated_bids(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Tender Collaborations
CREATE TABLE IF NOT EXISTS tender_collaborations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tender_id TEXT NOT NULL,
  lead_company_id TEXT NOT NULL,
  partner_company_id TEXT NOT NULL,
  role TEXT, -- 'main-contractor', 'subcontractor', 'supplier'
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'active', 'completed')),
  agreed_scope TEXT,
  agreed_value REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (partner_company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Market Intelligence
CREATE TABLE IF NOT EXISTS market_intelligence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_type TEXT NOT NULL, -- 'trend', 'competitor', 'pricing', 'success_factor'
  region TEXT,
  sector TEXT, -- 'cladding', 'roofing', 'construction'
  data TEXT NOT NULL, -- JSON
  period_start DATE,
  period_end DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Saved Searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  filters TEXT NOT NULL, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_deadline ON tenders(deadline);
CREATE INDEX IF NOT EXISTS idx_tenders_location ON tenders(location);
CREATE INDEX IF NOT EXISTS idx_tenders_value ON tenders(value);
CREATE INDEX IF NOT EXISTS idx_tenders_source ON tenders(source);
CREATE INDEX IF NOT EXISTS idx_tender_alerts_user ON tender_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_tender_alerts_company ON tender_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_tender_alerts_active ON tender_alerts(active);
CREATE INDEX IF NOT EXISTS idx_generated_bids_tender ON generated_bids(tender_id);
CREATE INDEX IF NOT EXISTS idx_generated_bids_company ON generated_bids(company_id);
CREATE INDEX IF NOT EXISTS idx_generated_bids_status ON generated_bids(status);
CREATE INDEX IF NOT EXISTS idx_cost_estimates_tender ON cost_estimates(tender_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_tender ON tender_collaborations(tender_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_lead ON tender_collaborations(lead_company_id);

-- Seed sample tender data (for testing)
INSERT OR IGNORE INTO tenders (id, source, external_id, title, description, value, contract_type, location, postcode, region, deadline, published_date, buyer_organization, status)
VALUES
  ('tender-001', 'contracts-finder', 'CF-2025-001', 'Hospital Cladding Upgrade - Birmingham', 'Replacement of external cladding for Queen Elizabeth Hospital. Must comply with latest fire safety regulations.', 250000, 'main-contractor', 'Birmingham', 'B15 2TH', 'England', datetime('now', '+30 days'), datetime('now'), 'NHS Birmingham', 'open'),
  ('tender-002', 'contracts-finder', 'CF-2025-002', 'School Roofing Project - Manchester', 'Complete roof replacement for primary school. Energy efficient materials required.', 180000, 'main-contractor', 'Manchester', 'M1 4BT', 'England', datetime('now', '+45 days'), datetime('now'), 'Manchester City Council', 'open'),
  ('tender-003', 'find-tender', 'FT-2025-003', 'Office Building Cladding - London', 'Modern cladding installation for new office development. Sustainable materials preferred.', 450000, 'subcontractor', 'London', 'EC1A 1BB', 'England', datetime('now', '+20 days'), datetime('now'), 'Property Developers Ltd', 'open'),
  ('tender-004', 'scotland', 'SC-2025-004', 'Social Housing Renovation - Edinburgh', 'External wall insulation and cladding for 50 social housing units.', 320000, 'main-contractor', 'Edinburgh', 'EH1 1YZ', 'Scotland', datetime('now', '+35 days'), datetime('now'), 'Edinburgh Council', 'open');
