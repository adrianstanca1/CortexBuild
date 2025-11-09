# CortexBuild - Login Credentials

## Database Configuration

- **Database**: SQLite (better-sqlite3)
- **Database File**: `cortexbuild.db`

## User Accounts

### 🔐 Super Admin

- **Email**: `adrian.stanca1@gmail.com`
- **Password**: `parola123`
- **Role**: `super_admin`
- **Company**: `company-1` (ConstructCo)
- **Access**: Full platform access, all companies

### 👔 Company Admin #1

- **Email**: `adrian@ascladdingltd.co.uk`
- **Password**: `Lolozania1`
- **Role**: `company_admin`
- **Company**: `company-2` (Metro Builders)
- **Access**: Full access to company-2

### 💻 Developer

- **Email**: `dev@constructco.com`
- **Password**: `parola123`
- **Role**: `developer`
- **Company**: `company-1` (ConstructCo)
- **Access**: SDK Developer Platform, Automation Studio

### 👷 Supervisor

- **Email**: `mike@constructco.com`
- **Password**: `password123`
- **Role**: `supervisor`
- **Company**: `company-1` (ConstructCo)
- **Access**: Project oversight

## Application URLs

### Development

- **Frontend**: <http://localhost:3000>
- **Backend API**: <http://localhost:3001>
- **Subscription API**: <http://localhost:3001/api/subscriptions>

### Production

- **URL**: TBD (Vercel deployment)

## Quick Start Commands

```bash
# Reset database (delete and recreate)
rm -f cortexbuild.db cortexbuild.db-shm cortexbuild.db-wal
npm run server

# Start both servers
npm run dev:all

# Start backend only
npm run server

# Start frontend only
npm run dev
```

## Testing Login

```bash
# Test Super Admin login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"adrian.stanca1@gmail.com","password":"parola123"}'

# Test Company Admin login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"adrian@ascladdingltd.co.uk","password":"Lolozania1"}'

# Test Developer login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@constructco.com","password":"parola123"}'
```

## Database Schema Location

- Main schema: `server/database.ts` (initDatabase function)
- Schema SQL: `server/schema.sql`
- Migrations: `server/migrations/`

## Notes

- All passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens include: userId, email, companyId
- Token expiration: 24 hours
- Multi-tenant architecture with row-level security (company_id filtering)

## Last Updated

**Date**: October 10, 2025
**Status**: ✅ All credentials tested and working
