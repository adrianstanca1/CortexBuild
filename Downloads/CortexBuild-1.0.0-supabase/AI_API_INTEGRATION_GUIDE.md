# AI API Integration Guide
## Integrating Real AI Services into CortexBuild Marketplace Apps

This guide explains how to replace the mock AI functions in your 4 marketplace apps with real AI API integrations.

---

## 📋 Table of Contents

1. [Quality Control Vision AI](#1-quality-control-vision-ai)
2. [Document Intelligence](#2-document-intelligence)
3. [Risk Assessment AI](#3-risk-assessment-ai)
4. [Cost Optimization AI](#4-cost-optimization-ai)
5. [Environment Setup](#environment-setup)
6. [API Key Management](#api-key-management)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Cost Optimization](#cost-optimization)

---

## 1. Quality Control Vision AI

### Current Mock Implementation
Location: `/components/apps/QualityControlVisionApp.tsx` (Line ~65)

```typescript
const analyzeImage = async () => {
  // Currently returns mock data
  const mockDetections = [...]
}
```

### Real AI Integration Options

#### Option A: Google Cloud Vision API (Recommended)

**Setup:**
```bash
npm install @google-cloud/vision
```

**Environment Variables:**
```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_VISION_API_KEY=your-api-key
```

**Implementation:**
```typescript
import vision from '@google-cloud/vision';

const analyzeImage = async () => {
  if (!selectedImage || !selectedFile) return;

  setIsAnalyzing(true);
  const startTime = Date.now();

  try {
    // Initialize the Vision API client
    const client = new vision.ImageAnnotatorClient({
      apiKey: import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY
    });

    // Read the file as base64
    const imageBuffer = await selectedFile.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Perform multiple detection types
    const [labelDetection] = await client.labelDetection({
      image: { content: base64Image }
    });

    const [objectDetection] = await client.objectLocalization({
      image: { content: base64Image }
    });

    const [safeSearch] = await client.safeSearchDetection({
      image: { content: base64Image }
    });

    // Transform API results to your DetectionResult format
    const detections: DetectionResult[] = [];

    // Process labels for quality assessment
    labelDetection.labelAnnotations?.forEach(label => {
      if (label.score && label.score > 0.7) {
        // Detect defects based on labels
        if (['crack', 'damage', 'defect', 'corrosion'].some(term =>
          label.description?.toLowerCase().includes(term))) {
          detections.push({
            category: 'defect',
            severity: label.score > 0.9 ? 'high' : 'medium',
            description: `Detected: ${label.description}`,
            confidence: label.score,
            recommendations: [
              'Inspect area immediately',
              'Document with additional photos',
              'Consult structural engineer if severe'
            ]
          });
        }
      }
    });

    // Process objects for compliance checking
    objectDetection.localizedObjectAnnotations?.forEach(obj => {
      if (obj.score && obj.score > 0.7) {
        const bbox = obj.boundingPoly?.normalizedVertices;
        if (bbox && bbox[0]) {
          detections.push({
            category: 'progress',
            severity: 'low',
            description: `Detected: ${obj.name}`,
            confidence: obj.score,
            location: {
              x: (bbox[0].x || 0) * 100,
              y: (bbox[0].y || 0) * 100
            },
            recommendations: ['Continue as planned']
          });
        }
      }
    });

    // Calculate summary metrics
    const criticalIssues = detections.filter(d => d.severity === 'critical').length;
    const totalDefects = detections.filter(d => d.category === 'defect').length;
    const complianceScore = Math.max(0, 100 - (totalDefects * 10));

    setAnalysisResult({
      status: 'success',
      detections,
      summary: {
        totalDefects,
        criticalIssues,
        complianceScore,
        overallQuality: complianceScore > 90 ? 'excellent' :
                       complianceScore > 70 ? 'good' :
                       complianceScore > 50 ? 'fair' : 'poor'
      },
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Vision API error:', error);
    setAnalysisResult({
      status: 'error',
      detections: [],
      summary: { totalDefects: 0, criticalIssues: 0, complianceScore: 0, overallQuality: 'poor' },
      processingTime: Date.now() - startTime
    });
  } finally {
    setIsAnalyzing(false);
  }
};
```

#### Option B: AWS Rekognition

**Setup:**
```bash
npm install @aws-sdk/client-rekognition
```

**Implementation:**
```typescript
import { RekognitionClient, DetectLabelsCommand, DetectModerationLabelsCommand } from '@aws-sdk/client-rekognition';

const analyzeImage = async () => {
  const client = new RekognitionClient({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
    }
  });

  const imageBuffer = await selectedFile.arrayBuffer();

  const detectCommand = new DetectLabelsCommand({
    Image: { Bytes: new Uint8Array(imageBuffer) },
    MaxLabels: 20,
    MinConfidence: 70
  });

  const response = await client.send(detectCommand);
  // Process response.Labels similar to Google Vision
};
```

---

## 2. Document Intelligence

### Current Mock Implementation
Location: `/components/apps/DocumentIntelligenceApp.tsx` (Line ~78)

### Real AI Integration Options

#### Option A: Google Document AI (Recommended)

**Setup:**
```bash
npm install @google-cloud/documentai
```

**Environment Variables:**
```env
GOOGLE_CLOUD_DOCUMENT_AI_PROJECT_ID=your-project-id
GOOGLE_CLOUD_DOCUMENT_AI_LOCATION=us
GOOGLE_CLOUD_DOCUMENT_AI_PROCESSOR_ID=your-processor-id
```

**Implementation:**
```typescript
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

const analyzeDocument = async () => {
  if (!selectedFile) return;

  setIsAnalyzing(true);
  const startTime = Date.now();

  try {
    const client = new DocumentProcessorServiceClient({
      apiKey: import.meta.env.VITE_GOOGLE_CLOUD_DOCUMENT_AI_API_KEY
    });

    // Convert file to base64
    const arrayBuffer = await selectedFile.arrayBuffer();
    const content = Buffer.from(arrayBuffer).toString('base64');

    // Process document
    const name = `projects/${import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID}/locations/${import.meta.env.VITE_GOOGLE_CLOUD_LOCATION}/processors/${import.meta.env.VITE_GOOGLE_CLOUD_PROCESSOR_ID}`;

    const request = {
      name,
      rawDocument: {
        content,
        mimeType: selectedFile.type
      }
    };

    const [result] = await client.processDocument(request);
    const { document } = result;

    if (!document) {
      throw new Error('No document returned from API');
    }

    // Extract text
    const text = document.text || '';

    // Extract entities (names, dates, amounts)
    const extractedFields: any = {};
    document.entities?.forEach(entity => {
      const key = entity.type?.replace(/\s+/g, '_').toLowerCase() || 'unknown';
      extractedFields[key] = {
        value: entity.mentionText || '',
        confidence: entity.confidence || 0
      };
    });

    // Classify document type
    let documentType: 'invoice' | 'contract' | 'permit' | 'other' = 'other';
    if (text.toLowerCase().includes('invoice')) documentType = 'invoice';
    else if (text.toLowerCase().includes('contract') || text.toLowerCase().includes('agreement')) documentType = 'contract';
    else if (text.toLowerCase().includes('permit')) documentType = 'permit';

    // Extract dates
    const dateRegex = /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g;
    const dates = text.match(dateRegex) || [];

    // Extract financial amounts
    const amountRegex = /[£$€]\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g;
    const amounts = text.match(amountRegex) || [];

    const keyDates = dates.slice(0, 3).map((date, idx) => ({
      label: `Date ${idx + 1}`,
      date: date,
      importance: 'medium' as const
    }));

    const financialData = amounts.slice(0, 3).map((amount, idx) => ({
      label: `Amount ${idx + 1}`,
      amount: parseFloat(amount.replace(/[£$€,]/g, '')),
      currency: amount.includes('£') ? 'GBP' : amount.includes('$') ? 'USD' : 'EUR'
    }));

    setAnalysisResult({
      status: 'success',
      data: {
        documentType,
        confidence: 0.95,
        extractedFields,
        keyDates: keyDates.length > 0 ? keyDates : undefined,
        financialData: financialData.length > 0 ? financialData : undefined
      },
      summary: `Successfully extracted ${Object.keys(extractedFields).length} fields from ${documentType}`,
      processingTime: Date.now() - startTime,
      pageCount: document.pages?.length || 1
    });

  } catch (error) {
    console.error('Document AI error:', error);
    setAnalysisResult({
      status: 'error',
      data: null,
      summary: 'Failed to analyze document',
      processingTime: Date.now() - startTime,
      pageCount: 0
    });
  } finally {
    setIsAnalyzing(false);
  }
};
```

#### Option B: Azure Form Recognizer

**Setup:**
```bash
npm install @azure/ai-form-recognizer
```

**Implementation:**
```typescript
import { AzureKeyCredential, DocumentAnalysisClient } from '@azure/ai-form-recognizer';

const analyzeDocument = async () => {
  const client = new DocumentAnalysisClient(
    import.meta.env.VITE_AZURE_FORM_RECOGNIZER_ENDPOINT,
    new AzureKeyCredential(import.meta.env.VITE_AZURE_FORM_RECOGNIZER_KEY)
  );

  const arrayBuffer = await selectedFile.arrayBuffer();
  const poller = await client.beginAnalyzeDocument(
    'prebuilt-document',
    new Uint8Array(arrayBuffer)
  );

  const result = await poller.pollUntilDone();
  // Process result.documents
};
```

---

## 3. Risk Assessment AI

### Current Mock Implementation
Location: `/components/apps/RiskAssessmentAIApp.tsx` (Line ~74)

### Real AI Integration Options

#### Option A: Custom ML Model with OpenAI GPT-4

**Setup:**
```bash
npm install openai
```

**Implementation:**
```typescript
import OpenAI from 'openai';

const analyzeRisks = async () => {
  setIsAnalyzing(true);

  try {
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Only for demo, use backend in production
    });

    // Fetch project data from your database
    const projectData = await fetch(`/api/projects/${projectId}`).then(r => r.json());
    const tasks = await fetch(`/api/projects/${projectId}/tasks`).then(r => r.json());
    const budget = await fetch(`/api/projects/${projectId}/budget`).then(r => r.json());

    // Create comprehensive prompt
    const prompt = `Analyze the following construction project for risks:

Project: ${projectData.name}
Budget: £${projectData.budget}
Current Spend: £${budget.currentSpend}
Tasks Completed: ${tasks.filter((t: any) => t.status === 'completed').length}/${tasks.length}
Days Elapsed: ${Math.floor((Date.now() - new Date(projectData.startDate).getTime()) / (1000 * 60 * 60 * 24))}
Target Duration: ${projectData.duration} days

Overdue Tasks: ${tasks.filter((t: any) => new Date(t.dueDate) < new Date() && t.status !== 'completed').length}

Please provide a comprehensive risk assessment with:
1. Overall risk score (0-100)
2. Specific risk factors across categories: schedule, budget, quality, safety, compliance, resources
3. For each risk: severity (low/medium/high/critical), probability (0-1), impact (0-1), description, and indicators
4. Predictions for schedule delay, budget overrun, and safety incidents
5. Actionable recommendations

Format response as JSON.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert construction project risk analyst with 20 years of experience. Provide detailed, actionable risk assessments based on project data.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    // Transform OpenAI response to your RiskAssessment format
    setAssessment({
      overallRiskScore: analysis.overallRiskScore || 50,
      riskLevel: analysis.riskLevel || 'moderate',
      riskFactors: analysis.riskFactors || [],
      predictions: analysis.predictions || {},
      recommendations: analysis.recommendations || [],
      timeline: analysis.timeline || []
    });

  } catch (error) {
    console.error('Risk analysis error:', error);
  } finally {
    setIsAnalyzing(false);
  }
};
```

#### Option B: Google Gemini with Structured Output

**Implementation:**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const analyzeRisks = async () => {
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  // Similar prompt structure as OpenAI
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const analysis = JSON.parse(text);
  // Transform to RiskAssessment format
};
```

---

## 4. Cost Optimization AI

### Current Mock Implementation
Location: `/components/apps/CostOptimizationApp.tsx` (Line ~108)

### Real AI Integration

**Implementation with OpenAI:**
```typescript
import OpenAI from 'openai';

const analyzeCosts = async () => {
  setIsAnalyzing(true);

  try {
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    // Fetch comprehensive financial data
    const projectId = selectedProject;
    const budget = await fetch(`/api/projects/${projectId}/budget`).then(r => r.json());
    const transactions = await fetch(`/api/projects/${projectId}/transactions`).then(r => r.json());
    const resources = await fetch(`/api/projects/${projectId}/resources`).then(r => r.json());

    const prompt = `Analyze this construction project's costs and identify optimization opportunities:

Total Budget: £${budget.total}
Current Spend: £${budget.spent}
Committed: £${budget.committed}
Remaining: £${budget.remaining}

Cost Breakdown:
- Labor: £${budget.breakdown.labor} (${budget.laborHours} hours)
- Materials: £${budget.breakdown.materials}
- Equipment: £${budget.breakdown.equipment}
- Subcontractors: £${budget.breakdown.subcontractors}
- Overhead: £${budget.breakdown.overhead}

Recent Transactions: ${JSON.stringify(transactions.slice(0, 10))}

Provide:
1. Budget health assessment with forecast at completion
2. Cost breakdown analysis with variance explanations
3. 5-8 specific optimization opportunities with:
   - Category (labor/materials/equipment/schedule/overhead)
   - Title and description
   - Potential savings amount
   - Effort level (low/medium/high)
   - Impact level (low/medium/high)
   - Priority (low/medium/high/critical)
   - Implementation steps
   - ROI percentage
4. Cost predictions with confidence scores
5. Industry benchmark comparison

Format as JSON matching the CostAnalysis interface.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a construction cost optimization expert specializing in identifying savings opportunities and improving project profitability.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5
    });

    const costAnalysis = JSON.parse(completion.choices[0].message.content || '{}');
    setAnalysis(costAnalysis);

  } catch (error) {
    console.error('Cost analysis error:', error);
  } finally {
    setIsAnalyzing(false);
  }
};
```

---

## Environment Setup

### 1. Create Backend API Routes

Instead of calling AI APIs directly from the frontend (which exposes API keys), create secure backend routes:

**Create:** `/server/routes/ai-services.ts`

```typescript
import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Quality Control Vision endpoint
router.post('/vision/analyze', authenticateToken, async (req, res) => {
  try {
    const { imageBase64, projectId } = req.body;
    const userId = req.user.id;

    // Call Google Vision API server-side
    const client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    const [result] = await client.labelDetection({
      image: { content: imageBase64 }
    });

    // Log API usage
    await logAPIUsage(userId, 'vision-api', result);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Vision API error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// Document Intelligence endpoint
router.post('/document/analyze', authenticateToken, async (req, res) => {
  try {
    const { documentBase64, projectId } = req.body;
    // Similar implementation
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

export default router;
```

### 2. Update Frontend to Use Backend Routes

```typescript
// In QualityControlVisionApp.tsx
const analyzeImage = async () => {
  try {
    const base64Image = selectedImage.split(',')[1]; // Remove data:image/... prefix

    const response = await fetch('/api/ai-services/vision/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        imageBase64: base64Image,
        projectId: projectId
      })
    });

    const result = await response.json();
    // Process result
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
```

---

## API Key Management

### Secure API Key Storage

**Backend (.env file):**
```env
# AI Service API Keys
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_VISION_API_KEY=your-api-key
GOOGLE_CLOUD_DOCUMENT_AI_PROCESSOR_ID=your-processor-id

OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1

AZURE_FORM_RECOGNIZER_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_FORM_RECOGNIZER_KEY=your-azure-key
```

### Environment Variable Validation

```typescript
// server/config/validateEnv.ts
export function validateAIEnv() {
  const required = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'OPENAI_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

---

## Error Handling

### Comprehensive Error Handling Pattern

```typescript
const analyzeWithRetry = async (
  analyzeFn: () => Promise<any>,
  maxRetries = 3
): Promise<any> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await analyzeFn();
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      if (error.code === 'RATE_LIMIT_EXCEEDED' && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Handle specific errors
      if (error.code === 'INVALID_API_KEY') {
        throw new Error('Invalid API key. Please check your configuration.');
      }

      if (error.code === 'QUOTA_EXCEEDED') {
        throw new Error('API quota exceeded. Please upgrade your plan or try again later.');
      }

      // If not retryable or max retries reached, throw
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }

  throw lastError;
};
```

---

## Rate Limiting

### Implement Rate Limiting Middleware

```typescript
// server/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const aiAPILimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each user to 100 requests per window
  message: 'Too many AI API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Store in Redis for distributed systems
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:ai:'
  })
});

// Apply to AI routes
app.use('/api/ai-services', aiAPILimiter);
```

---

## Cost Optimization

### Track API Usage

```typescript
// server/utils/apiUsageTracking.ts
export async function logAPIUsage(
  userId: string,
  service: string,
  requestData: any
) {
  const cost = calculateAPIUsage(service, requestData);

  await db.query(`
    INSERT INTO api_usage_logs (user_id, service, cost, timestamp, metadata)
    VALUES (?, ?, ?, ?, ?)
  `, [userId, service, cost, new Date(), JSON.stringify(requestData)]);

  // Check if user is approaching quota
  const monthlyUsage = await getMonthlyUsage(userId);
  if (monthlyUsage > USAGE_WARNING_THRESHOLD) {
    await sendUsageWarningEmail(userId, monthlyUsage);
  }
}

function calculateAPIUsage(service: string, data: any): number {
  switch (service) {
    case 'vision-api':
      return 0.0015; // $0.0015 per image
    case 'document-ai':
      return 0.01 * (data.pageCount || 1); // $0.01 per page
    case 'openai-gpt4':
      return (data.promptTokens * 0.00003 + data.completionTokens * 0.00006);
    default:
      return 0;
  }
}
```

### Caching Strategy

```typescript
// server/utils/aiCache.ts
import Redis from 'redis';

const redis = Redis.createClient();

export async function getCachedAnalysis(
  key: string,
  analyzeFn: () => Promise<any>,
  ttl = 3600 // 1 hour
): Promise<any> {
  // Check cache first
  const cached = await redis.get(`ai:${key}`);
  if (cached) {
    console.log('Cache hit for', key);
    return JSON.parse(cached);
  }

  // If not cached, run analysis
  const result = await analyzeFn();

  // Cache the result
  await redis.setex(`ai:${key}`, ttl, JSON.stringify(result));

  return result;
}

// Usage:
const analysis = await getCachedAnalysis(
  `vision:${fileHash}`,
  () => analyzeImageWithVisionAPI(image),
  7200 // Cache for 2 hours
);
```

---

## Testing Your Integration

### 1. Test with Sample Data

```bash
# Test Vision API
curl -X POST http://localhost:3001/api/ai-services/vision/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "..."}'

# Test Document AI
curl -X POST http://localhost:3001/api/ai-services/document/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentBase64": "..."}'
```

### 2. Monitor API Usage

```typescript
// Add monitoring endpoint
router.get('/usage/summary', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  const usage = await db.query(`
    SELECT
      service,
      COUNT(*) as request_count,
      SUM(cost) as total_cost,
      DATE(timestamp) as date
    FROM api_usage_logs
    WHERE user_id = ?
    AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY service, DATE(timestamp)
    ORDER BY date DESC
  `, [userId]);

  res.json({ usage });
});
```

---

## Production Checklist

- [ ] Move all API calls to backend routes
- [ ] Implement proper error handling and retries
- [ ] Add rate limiting per user/company
- [ ] Set up API usage tracking and billing
- [ ] Implement caching for repeated requests
- [ ] Add monitoring and alerting (Sentry, DataDog)
- [ ] Test with production API quotas
- [ ] Document API costs and optimize usage
- [ ] Implement user-facing usage dashboards
- [ ] Add fallback mechanisms for API failures

---

## Support & Resources

### API Documentation Links

- **Google Cloud Vision:** https://cloud.google.com/vision/docs
- **Google Document AI:** https://cloud.google.com/document-ai/docs
- **OpenAI API:** https://platform.openai.com/docs
- **AWS Rekognition:** https://docs.aws.amazon.com/rekognition/
- **Azure Form Recognizer:** https://learn.microsoft.com/azure/ai-services/form-recognizer/

### Cost Estimates

| Service | Cost per Request | Monthly Volume (1000 users) | Est. Monthly Cost |
|---------|------------------|----------------------------|-------------------|
| Google Vision API | $0.0015/image | 50,000 images | $75 |
| Google Document AI | $0.01/page | 20,000 pages | $200 |
| OpenAI GPT-4 | $0.03/1K tokens | 10M tokens | $300 |
| **Total** | | | **~$575/month** |

---

## Questions?

For integration support, contact: support@cortexbuild.io

Last Updated: October 27, 2024
