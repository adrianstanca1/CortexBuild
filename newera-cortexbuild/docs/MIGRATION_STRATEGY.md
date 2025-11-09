# Migration Strategy — CortexBuild ➜ NewEra-CortexBuild

## Objectives
- Preserve current customer data/workflows while unlocking new modular architecture.
- Allow staged migration: feature-by-feature or tenant-by-tenant.
- Minimize downtime; provide coexistence during transition.

## Approach
1. **Data Layer**
   - Stand up Postgres schemas mirroring current SQLite models.
   - Build ETL scripts (in `scripts/migrate-sqlite-to-pg.ts`) to export/import.
   - Apply row hashing + audit tables to verify parity.
2. **API Compatibility**
   - Introduce API Gateway that routes legacy endpoints to old server while gradually switching to new services.
   - Provide tRPC/REST wrappers with versioning (`/api/v2`).
3. **Front-End Bridge**
   - Embed NewEra micro-frontend modules inside existing shell via iframe/federation for early adopters.
   - Deliver feature toggles so tenants can opt-in per module.
4. **Automation & AI**
   - Run automation engine in parallel; sync tasks/events back into legacy DB until cutover.
5. **Cutover Plan**
   - Dry-run migrations in staging with golden dataset.
   - Schedule maintenance window, lock writes, perform final delta migration, switch DNS/app config.

## Tooling
- Snapshot scripts (`scripts/backup-*`) to capture SQLite states.
- Migration dashboard to track tenant readiness, data checksum, feature completeness.
- Rollback scripts stored in `scripts/rollback`.
