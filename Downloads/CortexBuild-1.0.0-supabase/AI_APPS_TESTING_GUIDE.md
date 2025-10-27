# 🎯 AI Apps Testing Guide
## Test Your 4 New AI-Powered Marketplace Apps

---

## ✅ Setup Complete!

Your development environment is ready:

- ✅ **4 AI apps** created and committed
- ✅ **Database migration** executed successfully
- ✅ **Dev servers** running on:
  - Frontend: http://localhost:3002
  - Backend: http://localhost:3001
- ✅ **AI integration guide** created
- ✅ **Build successful** (7.21s)

---

## 🚀 How to Test the Apps

### Step 1: Access Your CortexBuild Application

Open your browser and navigate to:
```
http://localhost:3002
```

### Step 2: Login

Use your existing credentials or create a test user.

### Step 3: Navigate to AI Tools

From the main dashboard:
1. Click on **"AI Tools"** in the navigation menu
2. You should see 4 AI tool cards:
   - 📷 Quality Control Vision
   - 📄 Document Intelligence
   - ⚠️ Risk Assessment AI
   - 💰 Cost Optimization

---

## 🧪 Testing Each App

### 1. Quality Control Vision AI 📷

**What it does:** AI-powered image analysis for construction quality assessment

**Test Steps:**
1. Click on **"Quality Control Vision"** card
2. Upload a construction photo (any JPG/PNG image will work)
3. Click **"Analyze Quality"**
4. Review the AI-generated analysis:
   - Overall quality score
   - Detected defects (if any)
   - Compliance score
   - Detailed recommendations
   - Visual markers on the image

**Expected Result:**
- Processing time: ~2 seconds (mock)
- Detection results with confidence scores
- Color-coded severity levels
- Actionable recommendations for each finding

**Current Status:** ✅ Mock data (ready for real Google Vision API integration)

---

### 2. Document Intelligence 📄

**What it does:** Extract insights from construction documents using OCR and AI

**Test Steps:**
1. Click on **"Document Intelligence"** card
2. Upload a document (PDF, DOC, DOCX, or image)
3. Click **"Extract Data"**
4. Review extracted information:
   - Document type classification
   - Extracted fields with confidence scores
   - Key dates and deadlines
   - Financial data (if applicable)
   - Compliance review

**Expected Result:**
- Document classified automatically (invoice/contract/permit)
- Key data extracted and structured
- Confidence scores for each field
- Financial summary (for invoices/contracts)
- Compliance status and recommendations

**Current Status:** ✅ Mock data (ready for Google Document AI integration)

---

### 3. Risk Assessment AI ⚠️

**What it does:** Predictive analytics for project risk management

**Test Steps:**
1. Click on **"Risk Assessment AI"** card
2. The app auto-analyzes on load
3. Or click **"Refresh Analysis"** to re-run
4. Review comprehensive risk report:
   - Overall risk score (0-100)
   - Risk level classification
   - Schedule and budget predictions
   - 6 risk factor categories with detailed analysis
   - Prioritized recommendations
   - Risk score timeline

**Expected Result:**
- Overall risk score with color-coded severity
- Detailed risk factors across 6 categories:
  - Schedule delays
  - Budget overruns
  - Safety concerns
  - Quality issues
  - Resource shortages
  - Compliance gaps
- Each risk includes:
  - Severity level
  - Probability score
  - Impact assessment
  - Risk indicators
  - Mitigation strategies
  - Current trend (improving/stable/worsening)

**Current Status:** ✅ Mock data (ready for OpenAI GPT-4 or Google Gemini integration)

---

### 4. Cost Optimization AI 💰

**What it does:** AI-driven cost analysis and budget optimization

**Test Steps:**
1. Click on **"Cost Optimization"** card
2. App auto-analyzes on load
3. Or click **"Refresh Analysis"** to re-run
4. Review optimization opportunities:
   - Budget health dashboard
   - AI cost predictions
   - Optimization opportunities (6+ suggestions)
   - Cost breakdown by category
   - Cost trends and forecasting
   - Industry benchmarks

**Expected Result:**
- Real-time budget health metrics
- Predicted final cost with confidence score
- 6+ optimization opportunities with:
  - Potential savings (£££)
  - Effort and impact levels
  - ROI percentage
  - Step-by-step implementation guide
- Visual cost trend charts
- Performance vs industry benchmarks

**Current Status:** ✅ Mock data (ready for OpenAI GPT-4 integration)

---

## 📊 Database Verification

Verify the apps were added to your marketplace database:

```bash
sqlite3 cortexbuild.db "SELECT id, name, category, icon, status FROM sdk_apps WHERE id LIKE '%ai%';"
```

**Expected Output:**
```
cost-optimization-ai-001|Cost Optimization AI|Financial|💰|published
document-intelligence-ai-001|Document Intelligence|AI & Automation|📄|published
quality-control-vision-ai-001|Quality Control Vision AI|AI & Automation|📷|published
risk-assessment-ai-001|Risk Assessment AI|Analytics & Reporting|⚠️|published
```

---

## 🔧 Troubleshooting

### Apps Not Showing in AI Tools Menu

**Check:**
1. Verify migration ran successfully:
   ```bash
   sqlite3 cortexbuild.db "SELECT COUNT(*) FROM sdk_apps WHERE id LIKE '%ai%';"
   ```
   Should return: `4`

2. Check tool definitions are updated:
   ```bash
   grep -A 5 "AI_TOOLS" tool-definitions.ts
   ```

3. Clear browser cache and refresh

### Dev Server Not Running

**Restart servers:**
```bash
# Kill existing processes
pkill -f "vite"
pkill -f "tsx server"

# Restart
npm run dev:all
```

### Build Errors

**Check dependencies:**
```bash
npm install
npm run build
```

---

## 🎨 Customization

### Update Mock Data

Each app has realistic mock data in its analyze function. To customize:

**Quality Control Vision:**
- File: `/components/apps/QualityControlVisionApp.tsx`
- Function: `analyzeImage()` (Line ~65)
- Mock data: `mockDetections` array (Line ~71)

**Document Intelligence:**
- File: `/components/apps/DocumentIntelligenceApp.tsx`
- Function: `analyzeDocument()` (Line ~78)
- Mock data: `mockDocumentType`, `extractedFields` (Line ~94-120)

**Risk Assessment:**
- File: `/components/apps/RiskAssessmentAIApp.tsx`
- Function: `analyzeRisks()` (Line ~74)
- Mock data: `mockAssessment` object (Line ~84)

**Cost Optimization:**
- File: `/components/apps/CostOptimizationApp.tsx`
- Function: `analyzeCosts()` (Line ~108)
- Mock data: `mockAnalysis` object (Line ~118)

---

## 📱 Mobile Testing

All apps are **fully responsive**. Test on mobile:

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select device (iPhone, iPad, etc.)
4. Test all 4 apps on different screen sizes

---

## 🔐 Authentication Testing

Apps require authentication. Test different user roles:

**Super Admin:**
- Access: All 4 apps
- Can install/uninstall apps

**Company Admin:**
- Access: All 4 apps (if company has subscriptions)
- Can manage company app installations

**Project Manager:**
- Access: Risk Assessment, Cost Optimization (typically)
- Limited to apps assigned by admin

**Field Worker:**
- Access: Quality Control Vision (typically)
- Mobile-optimized interface

---

## 📈 Performance Testing

### Load Time Testing

```bash
# Test build size
npm run build
ls -lh dist/assets/*.js

# Check lazy loading
# Open browser DevTools > Network
# Navigate to AI Tools page
# Only app-specific chunks should load
```

**Expected:**
- Initial load: ~250KB (gzipped)
- Per-app lazy load: ~50-80KB each
- Total for all 4 apps: ~450KB (only if all opened)

### API Response Time

With real AI APIs, typical response times:
- Quality Control Vision: 2-5 seconds
- Document Intelligence: 3-8 seconds
- Risk Assessment: 5-10 seconds
- Cost Optimization: 4-8 seconds

---

## 🚀 Next Steps

### 1. Integrate Real AI APIs

Follow the comprehensive guide:
```
AI_API_INTEGRATION_GUIDE.md
```

### 2. Add Backend Routes

Create `/server/routes/ai-services.ts` with secure API endpoints.

### 3. Update Environment Variables

Add your API keys:
```env
GOOGLE_CLOUD_VISION_API_KEY=your-key
GOOGLE_CLOUD_DOCUMENT_AI_PROCESSOR_ID=your-processor
OPENAI_API_KEY=sk-your-key
```

### 4. Implement Usage Tracking

Track API costs and user quotas for billing.

### 5. Add Pricing Plans

Integrate Stripe for subscription billing:
- Basic: £299/month (1 app)
- Professional: £499/month (all 4 apps)
- Enterprise: Custom pricing

### 6. Deploy to Production

```bash
# Build for production
npm run build

# Deploy to Vercel
npm run vercel:prod

# Or deploy to your hosting provider
```

---

## ✅ Testing Checklist

- [ ] All 4 apps accessible from AI Tools menu
- [ ] Quality Control Vision uploads and analyzes images
- [ ] Document Intelligence uploads and analyzes documents
- [ ] Risk Assessment displays comprehensive risk analysis
- [ ] Cost Optimization shows budget and optimization data
- [ ] All apps display loading states during analysis
- [ ] Results display correctly with proper formatting
- [ ] Apps are responsive on mobile devices
- [ ] Navigation works (back button, breadcrumbs)
- [ ] Error states handled gracefully
- [ ] Apps work across different browsers (Chrome, Firefox, Safari)

---

## 📞 Support

For questions or issues:

1. Check the AI API Integration Guide
2. Review app source code with inline comments
3. Check browser console for errors
4. Verify database migration completed
5. Contact: dev@cortexbuild.io

---

## 🎉 Success Metrics

Your AI apps are successful when:

- ✅ Users can complete analysis tasks in < 10 seconds
- ✅ AI accuracy meets or exceeds industry standards (>90%)
- ✅ User engagement increases (daily active users up 30%+)
- ✅ Customer satisfaction scores improve
- ✅ Revenue from AI features covers API costs + 300% margin
- ✅ Apps receive 4+ star ratings in marketplace

---

**Happy Testing!** 🚀

Your CortexBuild v2.0 AI-powered marketplace apps are ready to revolutionize construction management!

---

*Last Updated: October 27, 2024*
*CortexBuild Development Team*
