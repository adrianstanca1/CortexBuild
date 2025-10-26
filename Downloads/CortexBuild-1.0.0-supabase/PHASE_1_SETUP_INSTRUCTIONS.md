# Phase 1 Setup Instructions

## 🚀 Supabase Database Setup

### 1. Run SQL Script

Execute the SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of supabase-phase1-setup.sql
-- This will create all necessary tables, policies, and functions
```

### 2. Verify Tables Created

Check that these tables exist in your Supabase dashboard:

- ✅ `notifications`
- ✅ `notification_preferences`
- ✅ `file_uploads`
- ✅ Storage buckets: `project-files`, `avatars`, `company-logos`

### 3. Test RLS Policies

Verify Row Level Security is enabled and policies are working:

- Users can only see their own notifications
- Users can only access their company's files
- System can create notifications

## 🔧 Environment Variables

Ensure these are set in your Vercel project:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Features Implemented

### ✅ Real-time Notifications

- **NotificationBell** component in header
- Real-time updates via Supabase Realtime
- Mark as read/unread functionality
- Delete notifications
- Browser notifications (with permission)

### ✅ File Upload & Storage

- **FileUpload** component with drag & drop
- Progress tracking during upload
- File validation (size, type)
- Supabase Storage integration
- Company-based folder structure

### ✅ API Endpoints

- `/api/notifications` - CRUD operations
- JWT authentication required
- Error handling and validation

## 🧪 Testing Instructions

### Test Notifications

1. Login to the application
2. Look for the bell icon in the header
3. Click to open notification panel
4. Test mark as read/unread
5. Test delete functionality

### Test File Upload

1. Go to Projects page
2. Click "Upload Files" button
3. Drag & drop files or click to select
4. Verify upload progress
5. Check files appear in Supabase Storage

### Test Real-time Features

1. Open two browser windows
2. Create a notification in one window
3. Verify it appears in the other window
4. Test mark as read in one window
5. Verify status updates in the other

## 🐛 Troubleshooting

### Notifications not appearing

- Check Supabase RLS policies
- Verify user authentication
- Check browser console for errors
- Ensure Supabase Realtime is enabled

### File upload failing

- Check file size limits (100MB max)
- Verify file type restrictions
- Check Supabase Storage policies
- Verify network connectivity

### Build errors

- Run `npm run build` to check for TypeScript errors
- Check all imports are correct
- Verify environment variables are set

## 📊 Next Steps

Phase 1 is complete! Ready for:

- Phase 2: Enhanced functionality
- Phase 3: AI & automation  
- Phase 4: Mobile & integrations

**Status**: ✅ Production Ready
