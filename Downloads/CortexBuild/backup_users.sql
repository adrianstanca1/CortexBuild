PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
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
INSERT INTO users VALUES('user-1','adrian.stanca1@gmail.com','$2b$10$3ge1v.VX/8ORtGSido2zAOqVpcfmrXK8UbsL10WCaWAneoT5LBhCe','Adrian Stanca','super_admin',NULL,'company-1','2025-10-08 07:46:15','2025-10-08 07:46:15');
INSERT INTO users VALUES('user-2','casey@constructco.com','$2b$10$mOUixDNuaoE.cw3QqwE4ueUcGi1lXv/Y.aBGc4lfk4sOF2IiNhb4u','Casey Johnson','company_admin',NULL,'company-1','2025-10-08 07:46:16','2025-10-08 07:46:16');
INSERT INTO users VALUES('user-3','mike@constructco.com','$2b$10$Ne2G9zf96hDwmqzP5yiLlunlrBITbYms41lzKeeEeOdmy/aoEQE/C','Mike Wilson','supervisor',NULL,'company-1','2025-10-08 07:46:16','2025-10-08 07:46:16');
COMMIT;
