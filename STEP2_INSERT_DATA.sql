-- Step 2: Insert Data

-- Insert default company
INSERT INTO companies (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'ASC Cladding Ltd');

-- Insert test users (password for both is 'parola123')
INSERT INTO users (id, email, password_hash, name, role, company_id) 
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        'adrian.stanca1@gmail.com',
        '$2b$10$OZuOTyrSx0yeQfX.UygHiujjFP731Mjcl1z9fwORSC6sSpVZiobi.',
        'Adrian Stanca',
        'super_admin',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'dev@constructco.com',
        '$2b$10$OZuOTyrSx0yeQfX.UygHiujjFP731Mjcl1z9fwORSC6sSpVZiobi.',
        'Developer User',
        'developer',
        '00000000-0000-0000-0000-000000000001'
    );

