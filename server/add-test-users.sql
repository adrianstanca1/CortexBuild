-- Add test users for Developer Dashboard
-- All passwords are hashed versions of their respective passwords

-- Company for ASC Cladding
INSERT OR IGNORE INTO companies (id, name) VALUES
('company-asc', 'ASC Cladding Ltd');

-- Company for ConstructCo (already exists but adding for completeness)
INSERT OR IGNORE INTO companies (id, name) VALUES
('company-1', 'ConstructCo');

-- User 1: Super Admin (adrian.stanca1@gmail.com)
-- Password: parola123
INSERT OR REPLACE INTO users (id, email, password_hash, name, role, company_id) VALUES
('user-superadmin', 'adrian.stanca1@gmail.com', '$2b$10$DRNY1m5Ht2NprGvrnvkefObctlBmF4lYRfh6bv8I3Ayp/i6IwP5qW', 'Adrian Stanca', 'super_admin', 'company-1');

-- User 2: Admin (adrian@ascladdingltd.co.uk)
-- Password: lolozania1
INSERT OR REPLACE INTO users (id, email, password_hash, name, role, company_id) VALUES
('user-admin-asc', 'adrian@ascladdingltd.co.uk', '$2b$10$ZT8F562b27NxXiw10KYZMuMDfGR2oChv4Fw5HHVL1QhxHBXy5/vbu', 'Adrian ASC', 'admin', 'company-asc');

-- User 3: Developer (dev@constructco.com)
-- Password: password123
INSERT OR REPLACE INTO users (id, email, password_hash, name, role, company_id) VALUES
('user-dev', 'dev@constructco.com', '$2b$10$Ri1Vt/60hAte7/x0j9Aiv.OCNXB5DLVCAsh1eByE7idr7wSnA7ODS', 'Developer User', 'developer', 'company-1');

