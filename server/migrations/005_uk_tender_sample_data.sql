-- Sample UK Tender Data
-- Realistic construction tenders for demonstration

-- Get the first company_id and user_id for relationships
-- In production, these would be actual company/user records

-- Sample Tender 1: Major Hospital Construction - Birmingham
INSERT OR IGNORE INTO tenders (
    id, reference_number, title, description, organisation_name,
    contact_name, contact_email, contact_phone,
    tender_type, cpv_codes, contract_value_min, contract_value_max, currency,
    location, region, postcode,
    published_date, deadline_date, start_date, end_date, estimated_duration_months,
    status, source, source_url,
    sector, work_category,
    ai_summary, ai_match_score, complexity_score
) VALUES (
    'tender-001',
    'CF-2025-001',
    'New Build Hospital - Emergency Department Extension',
    'Construction of a new 4-storey emergency department extension including A&E facilities, imaging department, and associated infrastructure. Total building area approximately 8,500m². Includes mechanical, electrical, and plumbing works, external works, and landscaping.',
    'Birmingham University Hospitals NHS Foundation Trust',
    'Sarah Mitchell', 'procurement@uhb.nhs.uk', '+44 121 371 2000',
    'open', '["45000000-7", "45200000-9", "45300000-0"]', 18000000, 22000000, 'GBP',
    'Birmingham', 'West Midlands', 'B15 2TH',
    '2025-10-01 09:00:00', '2025-11-15 17:00:00', '2026-01-15', '2027-06-30', 18,
    'open', 'contracts_finder', 'https://www.contractsfinder.service.gov.uk/notice/cf-2025-001',
    'construction', 'new_build',
    'Large-scale NHS hospital extension project requiring extensive experience in healthcare construction. Complex MEP requirements and strict infection control standards.',
    95, 9
);

-- Sample Tender 2: Road Infrastructure - Manchester
INSERT OR IGNORE INTO tenders (
    id, reference_number, title, description, organisation_name,
    contact_name, contact_email, contact_phone,
    tender_type, cpv_codes, contract_value_min, contract_value_max, currency,
    location, region, postcode,
    published_date, deadline_date, start_date, end_date, estimated_duration_months,
    status, source, source_url,
    sector, work_category,
    ai_summary, ai_match_score, complexity_score
) VALUES (
    'tender-002',
    'CF-2025-002',
    'A56 Junction Improvement Works',
    'Design and construction of major junction improvements including traffic signal upgrades, new pedestrian crossings, cycle lanes, street lighting, drainage improvements, and associated highway works. Project includes night-time working requirements.',
    'Greater Manchester Combined Authority',
    'David Thompson', 'd.thompson@greatermanchester-ca.gov.uk', '+44 161 244 1100',
    'restricted', '["45000000-7", "45233000-9", "45316100-6"]', 3500000, 4200000, 'GBP',
    'Manchester', 'North West', 'M1 2WD',
    '2025-10-05 09:00:00', '2025-11-20 12:00:00', '2026-02-01', '2026-09-30', 8,
    'open', 'contracts_finder', 'https://www.contractsfinder.service.gov.uk/notice/cf-2025-002',
    'civil_engineering', 'refurbishment',
    'Highway infrastructure project requiring traffic management expertise and experience with night-time operations. Environmental considerations for noise and air quality.',
    88, 7
);

-- Sample Tender 3: School Refurbishment - London
INSERT OR IGNORE INTO tenders (
    id, reference_number, title, description, organisation_name,
    contact_name, contact_email, contact_phone,
    tender_type, cpv_codes, contract_value_min, contract_value_max, currency,
    location, region, postcode,
    published_date, deadline_date, start_date, end_date, estimated_duration_months,
    status, source, source_url,
    sector, work_category,
    ai_summary, ai_match_score, complexity_score
) VALUES (
    'tender-003',
    'CF-2025-003',
    'Secondary School Modernisation Programme - Phase 1',
    'Comprehensive refurbishment of existing secondary school including new science laboratories, upgraded IT infrastructure, replacement windows, roof renewal, heating system replacement, and internal remodelling. Works to be completed during school holidays where possible.',
    'London Borough of Southwark',
    'Emma Roberts', 'construction.procurement@southwark.gov.uk', '+44 20 7525 5000',
    'open', '["45000000-7", "45214000-3", "45310000-3"]', 5500000, 6800000, 'GBP',
    'London', 'London', 'SE1 5RS',
    '2025-10-10 09:00:00', '2025-11-30 17:00:00', '2026-04-01', '2027-08-31', 17,
    'open', 'contracts_finder', 'https://www.contractsfinder.service.gov.uk/notice/cf-2025-003',
    'construction', 'refurbishment',
    'Education sector refurbishment requiring phased delivery around school term times. Enhanced DBS checks required for all site operatives. Strong H&S track record essential.',
    82, 6
);

-- Sample Tender 4: Residential Development - Edinburgh
INSERT OR IGNORE INTO tenders (
    id, reference_number, title, description, organisation_name,
    contact_name, contact_email, contact_phone,
    tender_type, cpv_codes, contract_value_min, contract_value_max, currency,
    location, region, postcode,
    published_date, deadline_date, start_date, end_date, estimated_duration_months,
    status, source, source_url,
    sector, work_category,
    ai_summary, ai_match_score, complexity_score
) VALUES (
    'tender-004',
    'CF-2025-004',
    'Affordable Housing Development - 120 Units',
    'Design and build of mixed-use affordable housing development comprising 120 residential units (mix of 1, 2, and 3-bed apartments and houses), community facilities, landscaping, and associated infrastructure. Sustainability and energy efficiency are key requirements with BREEAM Excellent target.',
    'City of Edinburgh Council',
    'James MacLeod', 'housing.procurement@edinburgh.gov.uk', '+44 131 200 2000',
    'framework', '["45000000-7", "45200000-9", "45262300-4"]', 24000000, 28000000, 'GBP',
    'Edinburgh', 'Scotland', 'EH1 1YJ',
    '2025-10-03 09:00:00', '2025-12-05 12:00:00', '2026-03-01', '2028-03-31', 24,
    'open', 'contracts_finder', 'https://www.contractsfinder.service.gov.uk/notice/cf-2025-004',
    'construction', 'new_build',
    'Significant affordable housing project with sustainability focus. Requires proven track record in residential development and experience with Scottish Building Standards. Strong local supply chain preferred.',
    91, 8
);

-- Sample Tender 5: Water Treatment Facility - Leeds
INSERT OR IGNORE INTO tenders (
    id, reference_number, title, description, organisation_name,
    contact_name, contact_email, contact_phone,
    tender_type, cpv_codes, contract_value_min, contract_value_max, currency,
    location, region, postcode,
    published_date, deadline_date, start_date, end_date, estimated_duration_months,
    status, source, source_url,
    sector, work_category,
    ai_summary, ai_match_score, complexity_score
) VALUES (
    'tender-005',
    'CF-2025-005',
    'Water Treatment Works Upgrade',
    'Upgrade and expansion of existing water treatment facility including new filtration systems, chemical dosing equipment, control systems, and associated civil engineering works. Project requires specialist water industry experience and working within live operational environment.',
    'Yorkshire Water Services Ltd',
    'Rachel Turner', 'procurement@yorkshirewater.co.uk', '+44 345 124 2424',
    'restricted', '["45000000-7", "45232400-6", "45252127-4"]', 8500000, 10200000, 'GBP',
    'Leeds', 'Yorkshire and the Humber', 'LS1 4AP',
    '2025-09-28 09:00:00', '2025-11-10 17:00:00', '2026-01-20', '2027-03-31', 14,
    'open', 'contracts_finder', 'https://www.contractsfinder.service.gov.uk/notice/cf-2025-005',
    'building_services', 'refurbishment',
    'Specialist water treatment project requiring proven experience in water industry. Complex M&E installation in operational environment. CDM regulations and confined space working expertise essential.',
    87, 8
);

-- Sample Tender 6: Commercial Office Fit-Out - Bristol
INSERT OR IGNORE INTO tenders (
    id, reference_number, title, description, organisation_name,
    contact_name, contact_email, contact_phone,
    tender_type, cpv_codes, contract_value_min, contract_value_max, currency,
    location, region, postcode,
    published_date, deadline_date, start_date, end_date, estimated_duration_months,
    status, source, source_url,
    sector, work_category,
    ai_summary, ai_match_score, complexity_score
) VALUES (
    'tender-006',
    'CF-2025-006',
    'Grade A Office Space - Interior Fit-Out',
    'High-quality interior fit-out of 15,000 sq ft office space over 3 floors. Includes reception area, open plan offices, meeting rooms, breakout areas, IT infrastructure, kitchen facilities, and toilets. Modern, flexible workspace design with sustainable materials.',
    'Bristol City Council',
    'Michael Davies', 'm.davies@bristol.gov.uk', '+44 117 922 2000',
    'open', '["45000000-7", "45400000-1", "45410000-4"]', 2200000, 2800000, 'GBP',
    'Bristol', 'South West', 'BS1 5TR',
    '2025-10-08 09:00:00', '2025-11-25 17:00:00', '2026-01-10', '2026-06-30', 6,
    'open', 'contracts_finder', 'https://www.contractsfinder.service.gov.uk/notice/cf-2025-006',
    'construction', 'refurbishment',
    'Premium office fit-out requiring high-quality finishes and fast-track delivery. Experience with occupied buildings and minimal disruption working essential. Strong design coordination capability needed.',
    78, 5
);

-- Insert sample tender alerts
INSERT OR IGNORE INTO tender_alerts (
    id, user_id, company_id, name,
    keywords, cpv_codes, regions,
    min_value, max_value, sectors,
    email_enabled, push_enabled, frequency, is_active
) VALUES
(
    'alert-001',
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM companies LIMIT 1),
    'Major Construction Projects - Midlands',
    '["hospital", "school", "infrastructure"]',
    '["45000000-7", "45200000-9"]',
    '["West Midlands", "East Midlands"]',
    5000000, 50000000,
    '["construction", "civil_engineering"]',
    1, 1, 'daily', 1
),
(
    'alert-002',
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM companies LIMIT 1),
    'Healthcare Projects',
    '["NHS", "hospital", "healthcare", "medical"]',
    '["45000000-7"]',
    '["London", "South East"]',
    1000000, 30000000,
    '["construction"]',
    1, 1, 'immediate', 1
);

-- Insert sample market intelligence
INSERT OR IGNORE INTO market_intelligence (
    id, organisation_name, contract_title,
    contract_value, currency, winning_bidder, award_date,
    sector, region, cpv_codes,
    success_factors, pricing_insights
) VALUES
(
    'mi-001',
    'Birmingham University Hospitals NHS Foundation Trust',
    'New Cardiac Centre Construction',
    28500000, 'GBP', 'Laing O''Rourke', '2024-06-15',
    'construction', 'West Midlands', '["45000000-7", "45200000-9"]',
    'Strong healthcare experience, innovative BIM approach, excellent H&S record',
    'Competitive pricing with value engineering proposals. Average £3,350/m² for healthcare construction in region.'
),
(
    'mi-002',
    'Transport for London',
    'Station Accessibility Improvements Programme',
    15200000, 'GBP', 'BAM Construct UK', '2024-03-20',
    'civil_engineering', 'London', '["45000000-7", "45233000-9"]',
    'Rail industry expertise, track record with TfL, strong safety culture',
    'Framework agreement pricing model. £1,900/m² average for station works. Night-time working premium 35%.'
);
