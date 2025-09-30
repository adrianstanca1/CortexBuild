-- Seed data for ASAgents multi-tenant environment
-- Replace placeholder hashed passwords with bcrypt hashes generated via `npm run hash-password -- <password>` in the server project.

INSERT INTO tenants (id, name, slug, plan, contact_email, contact_phone, address, billing_reference)
VALUES
  (1, 'Northwind Ventures', 'northwind', 'enterprise', 'ops@northwind.example', '+44 20 7946 0123', JSON_OBJECT('line1', '45 Riverbank Way', 'city', 'London', 'postcode', 'EC2N 2DB', 'country', 'GB'), 'NW-ENT-001'),
  (2, 'Acme Construction', 'acme', 'growth', 'finance@acme.example', '+44 20 3000 1212', JSON_OBJECT('line1', '17 Clay Street', 'city', 'Manchester', 'postcode', 'M1 2WX', 'country', 'GB'), 'AC-GR-045');

INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role, status)
VALUES
  (1, 1, 'owner@northwind.example', '$2b$12$REPLACE_WITH_HASH', 'Dana', 'Owens', 'owner', 'active'),
  (2, 1, 'analyst@northwind.example', '$2b$12$REPLACE_WITH_HASH', 'Mohammed', 'Shah', 'analyst', 'active'),
  (3, 2, 'owner@acme.example', '$2b$12$REPLACE_WITH_HASH', 'Louise', 'Campbell', 'owner', 'active');

INSERT INTO projects (tenant_id, owner_id, code, name, description, status, budget, start_date)
VALUES
  (1, 1, 'NW-PLAT-2025', 'Platform Upgrade', 'Modernise data lake and client portal.', 'active', 250000.00, '2025-01-15'),
  (2, 3, 'AC-SITE-RED', 'City Redevelopment', 'Redevelopment of central plaza with new amenities.', 'active', 410000.00, '2025-02-01');

INSERT INTO invoices (tenant_id, project_id, client_name, client_email, amount_due, amount_paid, currency, due_date, issued_date, status, notes)
VALUES
  (1, 1, 'Globex', 'ap@globex.example', 78000.00, 52000.00, 'GBP', '2025-03-15', '2025-02-15', 'sent', 'Phase 2 milestone'),
  (2, 2, 'Metro Council', 'finance@metro.gov', 156000.00, 0.00, 'GBP', '2025-03-31', '2025-02-01', 'sent', 'Initial mobilisation invoice');

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
VALUES
  (1, 'AI advisory sprint', 1, 52000.00),
  (1, 'Data retention uplift', 1, 26000.00),
  (2, 'Site mobilisation crew', 2, 30000.00),
  (2, 'Materials and logistics', 1, 96000.00);

INSERT INTO documents (tenant_id, owner_id, project_id, original_name, stored_name, mime_type, size_bytes, storage_path, checksum)
VALUES
  (1, 2, 1, 'Phase2-SOW.pdf', 'Phase2-SOW.pdf', 'application/pdf', 182400, 'docs/1/Phase2-SOW.pdf', 'REPLACE_WITH_SHA256'),
  (2, 3, 2, 'Planning-Approval.pdf', 'Planning-Approval.pdf', 'application/pdf', 324000, 'docs/2/Planning-Approval.pdf', 'REPLACE_WITH_SHA256');
