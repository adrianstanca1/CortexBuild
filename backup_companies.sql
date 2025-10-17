PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE companies (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
INSERT INTO companies VALUES('company-1','ConstructCo','2025-10-08 07:46:15','2025-10-08 07:46:15');
COMMIT;
