# IONOS Deployment Playbook

This guide documents how to provision and operate the multi-tenant ASAgents stack on IONOS infrastructure. Use it alongside `DEPLOYMENT.md` when promoting the production build.

## 1. MariaDB / MySQL setup

1. Sign in to the [IONOS Control Panel](https://login.ionos.co.uk/) and create a **MariaDB/MySQL** database instance.
2. Whitelist your office IP (and the backend server IP) under **Remote Access** if required.
3. Create a database user (e.g. `asagents`) with a strong password and grant it full privileges on the new database.
4. From your workstation or CI runner, import the schema and seed data:

   ```bash
   mysql -h <db_host> -u asagents -p <db_name> < docs/db/schema.sql
   mysql -h <db_host> -u asagents -p <db_name> < docs/db/seed.sql
   ```

5. Replace placeholder password hashes and document checksums in `seed.sql` before import.
6. For tenant-specific CSV files, run `LOAD DATA INFILE` statements grouped by tenant (ensure `tenant_id` is populated in every row) so data remains isolated.

## 2. Backend deployment

1. Provision a **Node.js** capable webspace (Cloud Server or Managed Stack) and install Node 20+.
2. Copy the `server/` folder to the host and run `npm install --production`.
3. Create an `.env` by copying `server/.env.example` and filling in the IONOS database credentials plus JWT secrets.
4. Build the TypeScript project: `npm run build`.
5. Configure a process manager (PM2/systemd) to run `node --env-file=/path/to/.env dist/index.js`.
6. Ensure the webspace firewall allows inbound traffic on the chosen API port (default `4000`). If using the Managed Node.js product, configure the internal port in the dashboard.
7. Update the IONOS **Reverse Proxy** or **App** configuration so `https://api.asagents.co.uk` (or your preferred subdomain) points to the Node process.

### Multi-tenant considerations

- Every API route enforces the `tenant_id` from the authenticated JWT, so never trust request bodies for tenant context.
- Uploads land in `docs/<tenant_id>/` relative to `UPLOAD_ROOT`. Ensure the OS user running the Node process has write access and that the directory is backed up.
- When importing legacy data, populate the `tenants` table first, then `users`, followed by `projects`, `invoices`, etc., to satisfy foreign keys.

## 3. File storage on IONOS

1. Create the root directory defined by `UPLOAD_ROOT` (default `docs`) on the server.
2. Grant the Node.js runtime user read/write permissions and restrict others (`chmod 750`).
3. Optionally mount an Object Storage bucket (via `s3fs` or `rclone`) at the same path for redundant storage; the backend writes to disk transparently.
4. Confirm the `/api/documents` endpoints can create directories per tenant and persist uploads.

## 4. React frontend deployment

1. Build the UI locally or via CI: `npm run build`.
2. Upload the contents of `dist/` to your IONOS webspace public directory (e.g. `htdocs/`).
3. Ensure `public/.htaccess` or the IONOS SPA routing setting rewrites unmatched routes to `index.html`.
4. Set `VITE_API_BASE_URL=https://api.asagents.co.uk` in the environment that generates the build so the frontend targets the hosted backend.

## 5. Domain & DNS

1. In the IONOS DNS zone, create an **A record** pointing `asagents.co.uk` and `www.asagents.co.uk` to the webspace IP.
2. Create a **CNAME** for `api.asagents.co.uk` targeting the backend host if it differs.
3. Allow DNS propagation (can take up to 24 hours) before issuing certificates.

## 6. Security hardening

- Enable HTTPS in the IONOS dashboard (Let's Encrypt). Cover both the frontend root domain and API subdomain.
- After TLS is active, set `FORCE_HTTPS=1` in your reverse proxy or add an Express middleware to redirect HTTP to HTTPS if traffic can reach the backend directly.
- Rotate JWT secrets annually or on incident response.
- Enforce strong passwords and use the `/api/auth/change-password` route to allow users to rotate credentials.

## 7. Automated backups

### Database

- Schedule daily dumps using the IONOS backup tool or a cron job such as:
  ```bash
  mysqldump -h <db_host> -u backup_user -p'<password>' <db_name> \
    | gzip > /var/backups/asagents/db-$(date +%F).sql.gz
  ```
- Retain at least 14 days of rolling backups and sync them to Object Storage.

### File storage

- Use `rsync` or `rclone` nightly to copy `docs/` into an Object Storage bucket, maintaining tenant folder structure.
- Track backup activity in the `backup_jobs` table for visibility. Populate `location` with the destination URI (e.g. `s3://asagents-backups/docs/`).

## 8. Post-deploy validation checklist

1. Hit `https://api.asagents.co.uk/api/system/health` to confirm database connectivity.
2. Log in via the frontend and ensure the JWT cookie/local storage flow works with the hosted API.
3. Upload a sample document for each tenant and verify it appears in the database with the correct `tenant_id` and `storage_path`.
4. Create and pay a test invoice to confirm transactional updates.
5. Trigger a password change and ensure the hash updates in the database.
6. Confirm HTTPS locks in the browser address bar and note the certificate expiry date for calendar reminders.

Document any deviations or issues in the release ticket so they can be addressed before the next deployment.
