PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    website TEXT,
    tax_id TEXT,
    payment_terms INTEGER DEFAULT 30,
    credit_limit DECIMAL(15, 2),
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
INSERT INTO clients VALUES(1,'company-1','Test Client','John Doe','john@test.com','555-1234',NULL,NULL,NULL,NULL,'US',NULL,NULL,30,NULL,NULL,1,'2025-10-08 07:55:35','2025-10-08 07:55:35');
INSERT INTO clients VALUES(2,'company-1','marksman roofing and cladding','paul maryweather','admin@marksman-roofing.co.uk','07433322234','135 nothingam','nothingam','','n18ed','US',NULL,NULL,30,NULL,NULL,1,'2025-10-08 08:41:58','2025-10-08 08:41:58');
COMMIT;
