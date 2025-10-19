-- UK Tender Assistant System Schema
-- Complete database schema for UK construction tender management

-- Tenders Table - Stores UK construction tenders from various sources
CREATE TABLE IF NOT EXISTS tenders (
    id TEXT PRIMARY KEY,
    reference_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    organisation_name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,

    -- Tender Details
    tender_type TEXT NOT NULL, -- 'open', 'restricted', 'framework', 'negotiated'
    cpv_codes TEXT, -- JSON array of CPV codes
    contract_value_min REAL,
    contract_value_max REAL,
    currency TEXT DEFAULT 'GBP',

    -- Location
    location TEXT,
    region TEXT,
    postcode TEXT,
    latitude REAL,
    longitude REAL,

    -- Dates
    published_date DATETIME,
    deadline_date DATETIME NOT NULL,
    start_date DATETIME,
    end_date DATETIME,
    estimated_duration_months INTEGER,

    -- Status
    status TEXT DEFAULT 'open', -- 'open', 'closed', 'awarded', 'cancelled'

    -- Source
    source TEXT DEFAULT 'contracts_finder', -- 'contracts_finder', 'find_a_tender', 'manual'
    source_url TEXT,
    documents_url TEXT,

    -- Classification
    sector TEXT, -- 'construction', 'civil_engineering', 'building_services', etc.
    work_category TEXT, -- 'new_build', 'refurbishment', 'maintenance', etc.

    -- AI Enhancement
    ai_summary TEXT,
    ai_match_score REAL,
    ai_risk_assessment TEXT,
    complexity_score INTEGER, -- 1-10

    -- Metadata
    company_id TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tender Alerts - User subscriptions to tender notifications
CREATE TABLE IF NOT EXISTS tender_alerts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_id TEXT NOT NULL,

    -- Alert Criteria
    name TEXT NOT NULL,
    keywords TEXT, -- JSON array
    cpv_codes TEXT, -- JSON array
    regions TEXT, -- JSON array
    min_value REAL,
    max_value REAL,
    sectors TEXT, -- JSON array

    -- Notification Settings
    email_enabled INTEGER DEFAULT 1,
    push_enabled INTEGER DEFAULT 1,
    frequency TEXT DEFAULT 'immediate', -- 'immediate', 'daily', 'weekly'

    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Generated Bids - AI-generated bid documents
CREATE TABLE IF NOT EXISTS generated_bids (
    id TEXT PRIMARY KEY,
    tender_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    user_id TEXT NOT NULL,

    -- Bid Information
    bid_title TEXT NOT NULL,
    bid_reference TEXT,
    bid_amount REAL,
    currency TEXT DEFAULT 'GBP',

    -- Document Content
    executive_summary TEXT,
    company_overview TEXT,
    technical_approach TEXT,
    methodology TEXT,
    quality_assurance TEXT,
    health_safety TEXT,
    environmental_considerations TEXT,
    team_structure TEXT,
    timeline TEXT,
    pricing_breakdown TEXT, -- JSON

    -- AI Generation
    ai_model TEXT,
    generation_time_seconds REAL,
    ai_confidence_score REAL,
    suggestions TEXT, -- JSON array of AI suggestions

    -- Status
    status TEXT DEFAULT 'draft', -- 'draft', 'review', 'submitted', 'won', 'lost'
    submitted_date DATETIME,
    outcome TEXT,
    outcome_date DATETIME,
    feedback TEXT,

    -- Version Control
    version INTEGER DEFAULT 1,
    parent_bid_id TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tender_id) REFERENCES tenders(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_bid_id) REFERENCES generated_bids(id)
);

-- Cost Estimates - Detailed cost breakdowns for bids
CREATE TABLE IF NOT EXISTS cost_estimates (
    id TEXT PRIMARY KEY,
    bid_id TEXT,
    tender_id TEXT,
    company_id TEXT NOT NULL,
    user_id TEXT NOT NULL,

    -- Estimate Details
    estimate_name TEXT NOT NULL,
    description TEXT,
    total_cost REAL NOT NULL,
    currency TEXT DEFAULT 'GBP',

    -- Cost Breakdown (JSON)
    labour_costs TEXT, -- JSON with detailed breakdown
    materials_costs TEXT, -- JSON with detailed breakdown
    equipment_costs TEXT, -- JSON with detailed breakdown
    subcontractor_costs TEXT, -- JSON with detailed breakdown
    overhead_costs TEXT, -- JSON with detailed breakdown
    profit_margin REAL,
    contingency_percentage REAL DEFAULT 5.0,

    -- AI Analysis
    ai_suggestions TEXT,
    market_comparison TEXT,
    risk_factors TEXT, -- JSON array

    -- Timeline
    estimate_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    valid_until DATETIME,

    status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'rejected'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (bid_id) REFERENCES generated_bids(id),
    FOREIGN KEY (tender_id) REFERENCES tenders(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tender Collaborations - Team collaboration on bids
CREATE TABLE IF NOT EXISTS tender_collaborations (
    id TEXT PRIMARY KEY,
    bid_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    company_id TEXT NOT NULL,

    -- Role & Permissions
    role TEXT NOT NULL, -- 'lead', 'contributor', 'reviewer', 'viewer'
    sections_assigned TEXT, -- JSON array of sections

    -- Activity
    last_contribution DATETIME,
    contributions_count INTEGER DEFAULT 0,
    comments TEXT, -- JSON array of comments

    -- Status
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'removed'
    invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME,

    FOREIGN KEY (bid_id) REFERENCES generated_bids(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Market Intelligence - Historical data for insights
CREATE TABLE IF NOT EXISTS market_intelligence (
    id TEXT PRIMARY KEY,

    -- Tender Reference
    tender_id TEXT,
    organisation_name TEXT NOT NULL,

    -- Award Information
    contract_title TEXT NOT NULL,
    contract_value REAL,
    currency TEXT DEFAULT 'GBP',
    winning_bidder TEXT,
    award_date DATETIME,

    -- Analysis
    sector TEXT,
    region TEXT,
    cpv_codes TEXT, -- JSON array
    competition_level INTEGER, -- Number of bids received

    -- Insights
    success_factors TEXT,
    pricing_insights TEXT,
    ai_analysis TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tender_id) REFERENCES tenders(id)
);

-- Saved Searches - Quick access to common searches
CREATE TABLE IF NOT EXISTS saved_searches (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_id TEXT NOT NULL,

    name TEXT NOT NULL,
    description TEXT,

    -- Search Criteria (stored as JSON)
    search_criteria TEXT NOT NULL,

    -- Settings
    is_favorite INTEGER DEFAULT 0,
    use_count INTEGER DEFAULT 0,
    last_used DATETIME,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Tender Documents - Store uploaded/downloaded tender documents
CREATE TABLE IF NOT EXISTS tender_documents (
    id TEXT PRIMARY KEY,
    tender_id TEXT NOT NULL,

    -- Document Details
    document_name TEXT NOT NULL,
    document_type TEXT, -- 'specification', 'drawing', 'contract', 'form', 'other'
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT,

    -- Source
    source_url TEXT,
    uploaded_by TEXT,

    -- AI Processing
    ai_extracted_text TEXT,
    ai_key_points TEXT, -- JSON array
    ai_requirements TEXT, -- JSON array

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tender_id) REFERENCES tenders(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenders_deadline ON tenders(deadline_date);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_company ON tenders(company_id);
CREATE INDEX IF NOT EXISTS idx_tenders_published ON tenders(published_date);
CREATE INDEX IF NOT EXISTS idx_tenders_region ON tenders(region);
CREATE INDEX IF NOT EXISTS idx_tenders_sector ON tenders(sector);

CREATE INDEX IF NOT EXISTS idx_tender_alerts_user ON tender_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_tender_alerts_active ON tender_alerts(is_active);

CREATE INDEX IF NOT EXISTS idx_generated_bids_tender ON generated_bids(tender_id);
CREATE INDEX IF NOT EXISTS idx_generated_bids_company ON generated_bids(company_id);
CREATE INDEX IF NOT EXISTS idx_generated_bids_status ON generated_bids(status);

CREATE INDEX IF NOT EXISTS idx_cost_estimates_bid ON cost_estimates(bid_id);
CREATE INDEX IF NOT EXISTS idx_cost_estimates_tender ON cost_estimates(tender_id);

CREATE INDEX IF NOT EXISTS idx_tender_collaborations_bid ON tender_collaborations(bid_id);
CREATE INDEX IF NOT EXISTS idx_tender_collaborations_user ON tender_collaborations(user_id);

CREATE INDEX IF NOT EXISTS idx_market_intelligence_org ON market_intelligence(organisation_name);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_sector ON market_intelligence(sector);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);

CREATE INDEX IF NOT EXISTS idx_tender_documents_tender ON tender_documents(tender_id);
