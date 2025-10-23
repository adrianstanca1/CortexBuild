# 🧪 CortexBuild Platform - Comprehensive Testing Guide

## 📋 **Testing Overview**

This guide will help you test all 17 management systems across 5 major feature options.

**Deployment URL**: https://constructai-5-5s2nmvfir-adrian-b7e84541.vercel.app

---

## 🔐 **Step 1: Authentication Testing**

### Test Login Flow
1. **Navigate to the app**
   - Open: https://constructai-5-5s2nmvfir-adrian-b7e84541.vercel.app
   - Should see login screen

2. **Test Login**
   - Enter email and password
   - Click "Sign In"
   - Should redirect to dashboard
   - ✅ **Expected**: Successful login, see main dashboard

3. **Test User Roles**
   - Login as Super Admin
   - Login as Company Admin
   - Login as Developer
   - ✅ **Expected**: Different permissions and menu options

---

## 📊 **Step 2: Option 1 - Admin Management Screens**

### 2.1 User Management
**Access**: Admin menu → User Management

**Tests**:
- [ ] View all users in table
- [ ] Search users by name/email
- [ ] Filter by role (Super Admin, Company Admin, Developer)
- [ ] Filter by status (Active, Inactive)
- [ ] Click "Add User" button
- [ ] Fill form: name, email, role, company
- [ ] Submit and verify user appears in list
- [ ] Click Edit on a user
- [ ] Update user details
- [ ] Save and verify changes
- [ ] Delete a user (with confirmation)
- [ ] Check stats cards update (Total, Active, Inactive)

**✅ Expected Results**:
- All CRUD operations work
- Filters update list in real-time
- Stats cards show correct counts
- Toast notifications on success/error

---

### 2.2 Company Management
**Access**: Admin menu → Company Management

**Tests**:
- [ ] View all companies
- [ ] Search companies by name
- [ ] Filter by status (Active, Inactive, Trial)
- [ ] Add new company
- [ ] Edit company details
- [ ] Delete company
- [ ] View company stats (Total, Active, Trial)

**✅ Expected Results**:
- Company list displays correctly
- CRUD operations work
- Stats update in real-time

---

### 2.3 Billing & Payments
**Access**: Admin menu → Billing & Payments

**Tests**:
- [ ] View Subscriptions tab
- [ ] View Invoices tab
- [ ] View Payments tab
- [ ] View Revenue tab
- [ ] Create new subscription
- [ ] Create invoice
- [ ] Add invoice items
- [ ] Finalize invoice
- [ ] Record payment
- [ ] Filter by status
- [ ] Search functionality

**✅ Expected Results**:
- All tabs load correctly
- Revenue metrics display
- Invoice workflow works end-to-end

---

### 2.4 Analytics & Reports
**Access**: Admin menu → Analytics & Reports

**Tests**:
- [ ] View Overview tab - check all 4 metrics
- [ ] View Revenue tab - check revenue breakdown
- [ ] View Projects tab - check project metrics
- [ ] View Users tab - check user growth
- [ ] Change date range (7, 30, 90 days)
- [ ] Verify metrics update with date range

**✅ Expected Results**:
- All metrics display correctly
- Trend indicators show (↑ or ↓)
- Date range filter works

---

## 🏗️ **Step 3: Option 2 - Core Construction Features**

### 3.1 Projects Management
**Access**: Construction menu → Projects Management

**Tests**:
- [ ] View all projects
- [ ] Search projects
- [ ] Filter by status (Planning, Active, On Hold, Completed)
- [ ] Filter by priority (Critical, High, Medium, Low)
- [ ] Add new project with budget and dates
- [ ] Edit project details
- [ ] Delete project
- [ ] View project stats

**✅ Expected Results**:
- Project cards display with progress bars
- Budget tracking shows correctly
- Status badges color-coded

---

### 3.2 Tasks Management
**Access**: Construction menu → Tasks Management

**Tests**:
- [ ] View all tasks
- [ ] Filter by status (To Do, In Progress, Completed)
- [ ] Filter by priority
- [ ] Assign task to user
- [ ] Set due date
- [ ] Update task status
- [ ] Delete task
- [ ] View task stats

**✅ Expected Results**:
- Task assignment works
- Status updates reflect immediately
- Priority badges display correctly

---

### 3.3 Daily Logs Management
**Access**: Construction menu → Daily Logs

**Tests**:
- [ ] View daily logs
- [ ] Create new log entry
- [ ] Add weather information
- [ ] Add work performed notes
- [ ] Filter by date range
- [ ] Edit log entry
- [ ] Delete log

**✅ Expected Results**:
- Logs display by date
- Weather tracking works
- Notes save correctly

---

### 3.4 RFI Management
**Access**: Construction menu → RFI Management

**Tests**:
- [ ] View all RFIs
- [ ] Create new RFI
- [ ] Assign to user
- [ ] Set priority
- [ ] Update status (Open, In Review, Answered, Closed)
- [ ] Add response
- [ ] Filter by status
- [ ] Delete RFI

**✅ Expected Results**:
- RFI workflow complete
- Status transitions work
- Responses save correctly

---

### 3.5 Documents Management
**Access**: Construction menu → Documents

**Tests**:
- [ ] View all documents
- [ ] Upload new document (PDF, image, etc.)
- [ ] Categorize document (Plans, Contracts, Reports, Photos, Other)
- [ ] Download document
- [ ] Delete document
- [ ] Filter by category
- [ ] Search documents

**✅ Expected Results**:
- File upload to Supabase Storage works
- Download links work
- Categories filter correctly

---

## 🛍️ **Step 4: Option 3 - Marketplace Features**

### 4.1 Marketplace Management
**Access**: Marketplace menu → Marketplace Management

**Tests**:
- [ ] View Apps tab - all marketplace apps
- [ ] View Installations tab
- [ ] View Reviews tab
- [ ] View Earnings tab
- [ ] Submit new app
- [ ] Approve/reject app (admin)
- [ ] Install app
- [ ] Write review
- [ ] Rate app (1-5 stars)
- [ ] Track earnings

**✅ Expected Results**:
- App submission workflow works
- Review system functional
- Earnings tracked correctly

---

### 4.2 Developer Dashboard
**Access**: Marketplace menu → Developer Dashboard

**Tests**:
- [ ] View Overview tab - revenue, installs, ratings
- [ ] View Earnings tab - earnings breakdown
- [ ] View Apps tab - your published apps
- [ ] View Reviews tab - app reviews
- [ ] View Payouts tab - payout history
- [ ] Request payout
- [ ] Change date range
- [ ] View top performing apps

**✅ Expected Results**:
- All metrics display correctly
- Payout request works
- Charts show data

---

### 4.3 App Discovery
**Access**: Marketplace menu → App Discovery

**Tests**:
- [ ] View featured apps section
- [ ] Search for apps
- [ ] Filter by category
- [ ] Filter by pricing (Free, One-time, Subscription)
- [ ] Filter by minimum rating
- [ ] Sort by Popular, Rating, Recent, Name
- [ ] Install an app
- [ ] View app details

**✅ Expected Results**:
- Featured apps display (100+ installs OR 4.5+ rating)
- Filters work in combination
- Install button works

---

## 👥 **Step 5: Option 4 - Company Admin Features**

### 5.1 Team Management ⭐ NEW!
**Access**: Company menu → Team Management

**Tests**:
- [ ] View all team members
- [ ] Check stats cards (Total, Active, On Leave, Inactive)
- [ ] Search members by name/email
- [ ] Filter by role (Developer, Designer, PM, QA, Admin)
- [ ] Filter by department (Engineering, Design, Product, Operations, Sales)
- [ ] Filter by status (Active, Inactive, On Leave)
- [ ] Click "Add Member"
- [ ] Fill form: name, email, role, department, phone, status
- [ ] Submit and verify member appears
- [ ] Click Edit on member
- [ ] Update member details
- [ ] Save changes
- [ ] Delete member (with confirmation)
- [ ] View performance metrics (tasks completed, projects)

**✅ Expected Results**:
- Member list displays with avatars
- Role badges color-coded
- Performance metrics show
- Modals work correctly
- Stats update in real-time

---

### 5.2 Project Dashboard ⭐ NEW!
**Access**: Company menu → Project Dashboard

**Tests**:
- [ ] View dashboard stats (Total, Active, Avg Progress, Budget Usage)
- [ ] View all project cards
- [ ] Check progress bars on each project
- [ ] Check budget usage bars (green/orange/red)
- [ ] Search projects
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Change date range (7, 30, 90, 365 days)
- [ ] Click "View Details" on project
- [ ] Click "Edit" on project
- [ ] Click "Refresh" button
- [ ] Verify metrics update

**✅ Expected Results**:
- Project cards display beautifully
- Progress bars show correct percentages
- Budget bars color-coded based on usage
- Stats cards accurate
- Filters work correctly

---

## 🔔 **Step 6: Option 5 - Real-Time Features**

### 6.1 Notifications Center ⭐ NEW!
**Access**: Real-time menu → Notifications Center

**Tests**:
- [ ] View all notifications
- [ ] Check stats (Total, Unread, Urgent, Archived)
- [ ] Search notifications
- [ ] Filter by type (Tasks, Projects, Messages, Meetings, Documents, Team, Payments, System)
- [ ] Filter by priority (Urgent, High, Normal, Low)
- [ ] Toggle "Unread Only"
- [ ] Click "Mark as Read" on notification
- [ ] Click "Mark All Read"
- [ ] Click "Archive" on notification
- [ ] Toggle "Show Archived"
- [ ] Delete notification (with confirmation)
- [ ] Verify real-time updates (create notification in another tab)

**✅ Expected Results**:
- Notifications display with correct icons
- Priority badges show (Urgent has red ring)
- Unread notifications highlighted
- Real-time subscription works
- Time-ago formatting correct ("Just now", "5m ago")
- Stats update automatically

---

## 🧪 **Step 7: Integration Testing**

### Cross-Feature Tests
- [ ] Create project → Create tasks for project → Assign to team member
- [ ] Create team member → Assign tasks → Check performance metrics
- [ ] Submit app → Get notification → Review in marketplace
- [ ] Create invoice → Record payment → Check analytics
- [ ] Upload document → Link to project → Download
- [ ] Create RFI → Assign → Answer → Close → Check notifications

**✅ Expected Results**:
- Data flows between features
- Notifications trigger correctly
- Stats update across dashboards

---

## 📱 **Step 8: Responsive Design Testing**

### Test on Different Devices
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**✅ Expected Results**:
- Layout adapts to screen size
- Buttons remain clickable
- Text readable
- No horizontal scroll

---

## ⚡ **Step 9: Performance Testing**

### Load Time Tests
- [ ] Initial page load < 3 seconds
- [ ] Navigation between screens < 1 second
- [ ] Search results appear < 500ms
- [ ] Filter updates < 300ms

**✅ Expected Results**:
- Fast loading times
- Smooth transitions
- No lag on interactions

---

## 🔒 **Step 10: Security Testing**

### Permission Tests
- [ ] Super Admin can access all features
- [ ] Company Admin cannot access super admin features
- [ ] Developer can only see their apps
- [ ] Users can only see their company data

**✅ Expected Results**:
- RLS policies enforced
- Unauthorized access blocked
- Proper error messages

---

## 📝 **Testing Checklist Summary**

### Option 1: Admin Management (4 systems)
- [ ] User Management
- [ ] Company Management
- [ ] Billing & Payments
- [ ] Analytics & Reports

### Option 2: Construction Features (5 systems)
- [ ] Projects Management
- [ ] Tasks Management
- [ ] Daily Logs
- [ ] RFI Management
- [ ] Documents Management

### Option 3: Marketplace (3 systems)
- [ ] Marketplace Management
- [ ] Developer Dashboard
- [ ] App Discovery

### Option 4: Company Admin (2 systems)
- [ ] Team Management ⭐
- [ ] Project Dashboard ⭐

### Option 5: Real-Time (1 system)
- [ ] Notifications Center ⭐

---

## 🐛 **Bug Reporting Template**

If you find any issues, report them using this format:

```
**Feature**: [e.g., Team Management]
**Issue**: [Brief description]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Screenshot**: [If applicable]
```

---

## ✅ **Test Results**

Mark each system as you test:
- ✅ = Passed
- ⚠️ = Passed with minor issues
- ❌ = Failed
- ⏭️ = Skipped

---

**Happy Testing! 🚀**

