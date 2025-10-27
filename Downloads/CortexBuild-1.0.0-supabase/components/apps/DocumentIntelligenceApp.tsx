import React, { useState, useRef } from 'react';
import { DocumentIcon, CheckCircleIcon, ClockIcon, CurrencyPoundIcon, CalendarIcon } from '../Icons';

interface DocumentIntelligenceAppProps {
  userId: string;
  companyId: string;
  projectId?: string;
}

interface ExtractedData {
  documentType: 'invoice' | 'contract' | 'permit' | 'drawing' | 'report' | 'other';
  confidence: number;
  extractedFields: {
    [key: string]: {
      value: string;
      confidence: number;
      location?: { page: number; bbox: number[] };
    };
  };
  keyDates?: Array<{
    label: string;
    date: string;
    importance: 'high' | 'medium' | 'low';
  }>;
  financialData?: Array<{
    label: string;
    amount: number;
    currency: string;
  }>;
  compliance?: {
    status: 'compliant' | 'non-compliant' | 'requires_review';
    issues: string[];
    recommendations: string[];
  };
}

interface AnalysisResult {
  status: 'success' | 'error';
  data: ExtractedData | null;
  summary: string;
  processingTime: number;
  pageCount: number;
}

const DocumentIntelligenceApp: React.FC<DocumentIntelligenceAppProps> = ({
  userId,
  companyId,
  projectId
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    const startTime = Date.now();

    try {
      // Simulate API delay for OCR/AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock extracted data based on document type (simulated AI analysis)
      const mockDocumentType = selectedFile.name.toLowerCase().includes('invoice') ? 'invoice' :
                              selectedFile.name.toLowerCase().includes('contract') ? 'contract' :
                              selectedFile.name.toLowerCase().includes('permit') ? 'permit' :
                              'other';

      let extractedFields: any = {};
      let keyDates: any[] = [];
      let financialData: any[] = [];
      let compliance: any = null;

      // Simulate different extraction based on document type
      if (mockDocumentType === 'invoice') {
        extractedFields = {
          'invoice_number': { value: 'INV-2024-0156', confidence: 0.98 },
          'invoice_date': { value: '2024-10-26', confidence: 0.95 },
          'due_date': { value: '2024-11-26', confidence: 0.93 },
          'vendor_name': { value: 'ABC Construction Supplies Ltd', confidence: 0.97 },
          'total_amount': { value: '£25,847.50', confidence: 0.99 },
          'tax_amount': { value: '£4,307.92', confidence: 0.96 },
          'payment_terms': { value: 'Net 30', confidence: 0.88 }
        };
        keyDates = [
          { label: 'Invoice Date', date: '2024-10-26', importance: 'medium' as const },
          { label: 'Payment Due', date: '2024-11-26', importance: 'high' as const }
        ];
        financialData = [
          { label: 'Subtotal', amount: 21539.58, currency: 'GBP' },
          { label: 'VAT (20%)', amount: 4307.92, currency: 'GBP' },
          { label: 'Total', amount: 25847.50, currency: 'GBP' }
        ];
      } else if (mockDocumentType === 'contract') {
        extractedFields = {
          'contract_number': { value: 'CNT-2024-789', confidence: 0.96 },
          'contract_date': { value: '2024-09-15', confidence: 0.98 },
          'contractor': { value: 'BuildRight Construction Ltd', confidence: 0.99 },
          'contract_value': { value: '£485,000.00', confidence: 0.97 },
          'project_duration': { value: '18 months', confidence: 0.92 },
          'retention_percentage': { value: '5%', confidence: 0.89 },
          'payment_schedule': { value: 'Monthly in arrears', confidence: 0.85 }
        };
        keyDates = [
          { label: 'Contract Start', date: '2024-10-01', importance: 'high' as const },
          { label: 'Completion Due', date: '2026-04-01', importance: 'high' as const },
          { label: 'First Payment', date: '2024-10-31', importance: 'medium' as const }
        ];
        financialData = [
          { label: 'Contract Value', amount: 485000, currency: 'GBP' },
          { label: 'Retention (5%)', amount: 24250, currency: 'GBP' }
        ];
        compliance = {
          status: 'compliant' as const,
          issues: [],
          recommendations: [
            'Ensure all insurance certificates are current',
            'Schedule regular progress meetings as per clause 12.3',
            'Review payment milestones quarterly'
          ]
        };
      } else if (mockDocumentType === 'permit') {
        extractedFields = {
          'permit_number': { value: 'BLD-2024-5678', confidence: 0.98 },
          'permit_type': { value: 'Building Permit - New Construction', confidence: 0.96 },
          'issue_date': { value: '2024-10-15', confidence: 0.97 },
          'expiry_date': { value: '2025-10-15', confidence: 0.95 },
          'project_address': { value: '123 High Street, London', confidence: 0.93 },
          'approved_by': { value: 'London Borough Planning Department', confidence: 0.91 }
        };
        keyDates = [
          { label: 'Permit Issued', date: '2024-10-15', importance: 'medium' as const },
          { label: 'Permit Expires', date: '2025-10-15', importance: 'high' as const },
          { label: 'First Inspection Due', date: '2024-11-01', importance: 'high' as const }
        ];
        compliance = {
          status: 'compliant' as const,
          issues: [],
          recommendations: [
            'Schedule building inspections before expiry',
            'Ensure permit is visible on site',
            'Review condition 7 regarding drainage'
          ]
        };
      }

      const mockResult: AnalysisResult = {
        status: 'success',
        data: {
          documentType: mockDocumentType,
          confidence: 0.94,
          extractedFields,
          keyDates: keyDates.length > 0 ? keyDates : undefined,
          financialData: financialData.length > 0 ? financialData : undefined,
          compliance: compliance || undefined
        },
        summary: `Successfully extracted ${Object.keys(extractedFields).length} fields from ${mockDocumentType} document with ${Math.round(0.94 * 100)}% confidence.`,
        processingTime: Date.now() - startTime,
        pageCount: Math.floor(Math.random() * 5) + 1
      };

      setAnalysisResult(mockResult);

      // In real implementation, save to database
      // await saveDocumentAnalysis(userId, companyId, projectId, mockResult);

    } catch (error) {
      console.error('Analysis error:', error);
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

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'invoice': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'permit': return 'bg-green-100 text-green-800';
      case 'drawing': return 'bg-orange-100 text-orange-800';
      case 'report': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'non-compliant': return 'text-red-600 bg-red-50';
      case 'requires_review': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center space-x-3">
          <DocumentIcon className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Intelligence</h1>
            <p className="text-sm text-gray-500">Extract insights from construction documents and blueprints</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Upload Section */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  >
                    <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload</p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, PNG, JPG</p>
                    <p className="text-xs text-gray-500">up to 25MB</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <DocumentIcon className="w-10 h-10 text-purple-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={analyzeDocument}
                        disabled={isAnalyzing}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Extract Data'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setAnalysisResult(null);
                        }}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Remove File
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* AI Capabilities */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Extraction Capabilities</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span>Text Extraction (OCR)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span>Data Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span>Key Dates Detection</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span>Financial Data</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span>Compliance Review</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span>Auto-Categorization</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Results Section */}
            <div className="lg:col-span-2 space-y-4">
              {analysisResult && analysisResult.data && (
                <>
                  {/* Summary Card */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Extraction Summary</h2>
                        <p className="text-sm text-gray-600">{analysisResult.summary}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDocumentTypeColor(analysisResult.data.documentType)}`}>
                        {analysisResult.data.documentType.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Confidence</p>
                        <p className="text-xl font-bold text-gray-900">
                          {Math.round(analysisResult.data.confidence * 100)}%
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Fields Extracted</p>
                        <p className="text-xl font-bold text-gray-900">
                          {Object.keys(analysisResult.data.extractedFields).length}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Processing Time</p>
                        <p className="text-xl font-bold text-gray-900">
                          {(analysisResult.processingTime / 1000).toFixed(1)}s
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Extracted Fields */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Fields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(analysisResult.data.extractedFields).map(([key, field]) => (
                        <div key={key} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600 uppercase">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-500">{Math.round(field.confidence * 100)}%</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{field.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Dates */}
                  {analysisResult.data.keyDates && analysisResult.data.keyDates.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Key Dates</h3>
                      </div>
                      <div className="space-y-3">
                        {analysisResult.data.keyDates.map((dateItem, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{dateItem.label}</p>
                              <p className="text-xs text-gray-600">{new Date(dateItem.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              dateItem.importance === 'high' ? 'bg-red-100 text-red-800' :
                              dateItem.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {dateItem.importance.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financial Data */}
                  {analysisResult.data.financialData && analysisResult.data.financialData.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <CurrencyPoundIcon className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
                      </div>
                      <div className="space-y-2">
                        {analysisResult.data.financialData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                            <span className="text-lg font-bold text-gray-900">
                              {item.currency === 'GBP' && '£'}
                              {item.amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compliance */}
                  {analysisResult.data.compliance && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Review</h3>
                      <div className={`inline-flex items-center px-3 py-2 rounded-lg mb-4 ${getComplianceColor(analysisResult.data.compliance.status)}`}>
                        <span className="font-medium">{analysisResult.data.compliance.status.replace(/_/g, ' ').toUpperCase()}</span>
                      </div>

                      {analysisResult.data.compliance.recommendations.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-blue-900 mb-2">Recommendations:</p>
                          <ul className="space-y-1">
                            {analysisResult.data.compliance.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-blue-800 flex items-start">
                                <span className="mr-2">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {!analysisResult && !isAnalyzing && (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <DocumentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Upload a document to extract data and insights</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-700 font-medium">Analyzing document with AI...</p>
                  <p className="text-sm text-gray-500 mt-2">Performing OCR and data extraction</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentIntelligenceApp;
