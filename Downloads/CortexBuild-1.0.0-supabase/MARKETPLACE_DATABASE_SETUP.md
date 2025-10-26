# 🛒 Marketplace Database Setup Guide

Complete guide for setting up the CortexBuild Marketplace with Supabase

---

## 📋 Overview

The marketplace system includes:
- **10 Categories** for organizing modules
- **Module Management** with versioning and reviews
- **User & Company Installations** tracking
- **Reviews & Ratings** system
- **Analytics** for tracking usage
- **Admin Review Process** for quality control

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Name**: cortexbuild-marketplace
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for setup

### Step 2: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire content from: `supabase/MARKETPLACE_COMPLETE_SCHEMA.sql`
4. Paste into SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Wait for completion (should take 10-15 seconds)
7. Verify: You should see ✅ "Success. No rows returned"

### Step 3: Configure Environment Variables

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `VITE_SUPABASE_SERVICE_ROLE_KEY`

3. Create/update `.env.local` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Secret (for API endpoints)
JWT_SECRET=cortexbuild-secret-2025
```

### Step 4: Verify Setup

Run the application and test:

```bash
# Start development server
npm run dev

# In browser, navigate to marketplace
# Should see 6 pre-loaded modules
```

---

## 📊 Database Schema Overview

### Core Tables

#### 1. `marketplace_categories`
Organizes modules into categories

**Key Fields:**
- `id` - Unique identifier
- `name` - Category name
- `slug` - URL-friendly identifier
- `icon` - Emoji icon
- `display_order` - Sort order

**Seed Data:** 10 categories pre-loaded

#### 2. `marketplace_modules`
Main module/app information

**Key Fields:**
- `id` - Unique identifier
- `name`, `slug` - Module identification
- `description`, `long_description` - Module details
- `version` - Current version
- `category_id` - Foreign key to categories
- `developer_id` - Creator's user ID
- `price`, `pricing_model` - Pricing information
- `status` - draft, pending_review, published, etc.
- `is_public`, `is_featured` - Visibility flags
- `icon`, `cover_image`, `screenshots` - Media
- `features`, `tags` - JSON arrays
- `downloads`, `rating_average`, `rating_count` - Statistics
- `published_at` - Publication timestamp

**Seed Data:** 6 featured modules pre-loaded

#### 3. `user_module_installations`
Tracks individual user installations

**Key Fields:**
- `id` - Installation ID
- `user_id` - User who installed
- `module_id` - Installed module
- `version` - Installed version
- `status` - active, inactive, uninstalled
- `config` - JSON configuration
- `installed_at`, `last_used_at` - Timestamps

#### 4. `company_module_installations`
Tracks company-wide installations

Similar to user installations but for entire companies

#### 5. `module_reviews`
User reviews and ratings

**Key Fields:**
- `id` - Review ID
- `module_id` - Module being reviewed
- `user_id` - Reviewer
- `rating` - 1-5 stars
- `title`, `comment` - Review content
- `helpful_count`, `unhelpful_count` - Helpfulness
- `is_verified_purchase` - Auto-set if user installed
- `is_public` - Visibility flag

#### 6. `module_review_history`
Admin review workflow tracking

**Key Fields:**
- `id` - Review record ID
- `module_id` - Module under review
- `reviewer_id` - Admin who reviewed
- `previous_status`, `new_status` - Status change
- `feedback` - Admin feedback
- `security_check`, `quality_check`, `documentation_check` - Checklist

#### 7. `module_analytics`
Usage analytics and tracking

**Key Fields:**
- `id` - Event ID
- `module_id` - Related module
- `user_id`, `company_id` - Who triggered event
- `event_type` - view, install, uninstall, launch, etc.
- `event_data` - JSON extra data
- `created_at` - Timestamp

#### 8. `module_versions`
Version history for modules

**Key Fields:**
- `id` - Version ID
- `module_id` - Parent module
- `version` - Version string (e.g., "1.2.0")
- `changelog` - What changed
- `downloads` - Downloads for this version
- `is_active`, `is_stable` - Status flags

---

## 🔐 Row Level Security (RLS)

The schema includes comprehensive RLS policies:

### Public Access
- ✅ Anyone can view active categories
- ✅ Anyone can view published modules
- ✅ Anyone can view public reviews

### Authenticated Access
- ✅ Users can view their own installations
- ✅ Users can install modules
- ✅ Users can create/edit/delete their own reviews
- ✅ Developers can manage their own modules

### Admin Access
- ✅ Super admins can manage all content
- ✅ Admins can review submitted modules

---

## 🎯 API Endpoints

### Categories

**GET** `/api/marketplace/categories`
- Fetches all active categories
- Includes module count per category
- No auth required

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-proj-mgmt",
      "name": "Project Management",
      "slug": "project-management",
      "description": "Tools for managing construction projects",
      "icon": "📋",
      "count": 15
    }
  ],
  "source": "supabase"
}
```

### Modules

**GET** `/api/marketplace/modules`
- Fetches published modules
- Supports filtering and sorting
- Includes installation status for current user

**Query Parameters:**
- `category` - Filter by category slug
- `search` - Search in name/description
- `featured` - Show only featured (true/false)
- `sort` - Sort by: popular, rating, newest

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "module-proj-mgmt-1",
      "name": "Project Management Pro",
      "description": "Comprehensive project tracking",
      "price": 0,
      "pricing_model": "free",
      "rating_average": 4.8,
      "downloads": 1250,
      "is_installed": true,
      "category": "project-management"
    }
  ],
  "total": 6,
  "source": "supabase"
}
```

**POST** `/api/marketplace/modules`
- Install a module
- Creates installation record
- Tracks analytics
- Auto-increments download count

**Request Body:**
```json
{
  "moduleId": "module-proj-mgmt-1"
}
```

### Installed Modules

**GET** `/api/marketplace/installed`
- Fetches user's installed modules
- Includes module details
- Ordered by installation date

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "module-1",
      "installation_id": "install-123",
      "name": "Project Management",
      "version": "1.0.0",
      "status": "active",
      "installed_at": "2025-01-15T10:00:00Z",
      "category": "project-management"
    }
  ],
  "source": "supabase"
}
```

### Reviews

**GET** `/api/marketplace/reviews?moduleId=module-1`
- Fetch reviews for a module
- Includes user information
- Ordered by date (newest first)

**POST** `/api/marketplace/reviews`
- Create a review
- Auto-detects verified purchase
- Updates module rating automatically

**Request Body:**
```json
{
  "moduleId": "module-1",
  "rating": 5,
  "title": "Excellent tool!",
  "comment": "This has revolutionized our workflow..."
}
```

**PATCH** `/api/marketplace/reviews?reviewId=review-123`
- Update your own review

**DELETE** `/api/marketplace/reviews?reviewId=review-123`
- Delete your own review

---

## 🔄 Automatic Features

### Auto-Update Module Ratings
When a review is created/updated, the module's rating is automatically recalculated using database triggers.

### Auto-Increment Downloads
When a module is installed, the download count is automatically incremented.

### Auto-Track Analytics
Installation events are automatically tracked in the analytics table.

### Auto-Verify Purchases
Reviews from users who installed the module are automatically marked as "verified purchase".

---

## 🧪 Testing the Setup

### 1. Check Tables Created

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'marketplace_%'
  OR table_name LIKE '%_module_%';
```

Should return 8 tables.

### 2. Check Seed Data

```sql
-- Check categories
SELECT COUNT(*) FROM marketplace_categories;
-- Should return: 10

-- Check modules
SELECT COUNT(*) FROM marketplace_modules WHERE status = 'published';
-- Should return: 6
```

### 3. Test API Endpoints

```bash
# Get categories (requires auth token)
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/marketplace/categories

# Get modules
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/marketplace/modules?featured=true
```

---

## 🐛 Troubleshooting

### Issue: "Database not configured" error

**Solution:**
- Verify environment variables are set in `.env.local`
- Restart development server after adding env vars
- Check Supabase project is active

### Issue: "Relation does not exist" error

**Solution:**
- Re-run the complete schema SQL
- Check you're in the correct Supabase project
- Verify SQL executed without errors

### Issue: "Permission denied" errors

**Solution:**
- Check RLS policies are enabled
- Verify user authentication is working
- Use service_role key for server-side operations

### Issue: Mock data showing instead of Supabase data

**Solution:**
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_SERVICE_ROLE_KEY` are set
- Verify API endpoints can connect to Supabase
- Check browser console for connection errors

---

## 📈 Performance Optimization

The schema includes indexes on:
- Category slugs
- Module status, visibility flags
- Installation user/module IDs
- Review module IDs and ratings
- Analytics event types and timestamps

All foreign keys have indexes for optimal JOIN performance.

---

## 🔒 Security Best Practices

1. **Never expose service_role key** - Only use in server-side code
2. **Use anon key** - For client-side Supabase connections
3. **Validate user input** - All API endpoints validate inputs
4. **Row Level Security** - Enabled on all tables
5. **JWT validation** - All API routes require authentication

---

## 🚀 Production Deployment

### Vercel Environment Variables

In Vercel project settings, add:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-production-secret
```

### Database Backups

Enable automatic backups in Supabase:
1. Go to Settings → Database
2. Enable "Point-in-Time Recovery" (paid plans)
3. Or schedule manual backups

---

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Schema SQL executed successfully
- [ ] Environment variables configured
- [ ] Application starts without errors
- [ ] Can fetch categories from API
- [ ] Can fetch modules from API
- [ ] Can install a module
- [ ] Review system works
- [ ] Analytics tracking enabled

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs (Dashboard → Logs)
3. Verify environment variables
4. Review this guide
5. Check API endpoint responses

---

**🎉 Marketplace setup complete! Happy building!**
