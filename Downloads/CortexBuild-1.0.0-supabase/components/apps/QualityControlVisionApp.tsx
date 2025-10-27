import React, { useState, useRef } from 'react';
import { CameraIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '../Icons';

interface QualityControlVisionAppProps {
  userId: string;
  companyId: string;
  projectId?: string;
}

interface DetectionResult {
  category: 'defect' | 'compliance' | 'progress';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
  location?: { x: number; y: number };
  recommendations?: string[];
}

interface AnalysisResult {
  status: 'success' | 'error';
  detections: DetectionResult[];
  summary: {
    totalDefects: number;
    criticalIssues: number;
    complianceScore: number;
    overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  processingTime: number;
}

const QualityControlVisionApp: React.FC<QualityControlVisionAppProps> = ({
  userId,
  companyId,
  projectId
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisResult(null); // Reset previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage || !selectedFile) return;

    setIsAnalyzing(true);
    const startTime = Date.now();

    try {
      // In a real implementation, this would call Google Vision API or similar
      // For now, we'll simulate AI analysis with realistic results

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulated AI detection results
      const mockDetections: DetectionResult[] = [
        {
          category: 'defect',
          severity: 'high',
          description: 'Concrete surface cracking detected in wall section',
          confidence: 0.92,
          location: { x: 45, y: 30 },
          recommendations: [
            'Inspect crack depth and width',
            'Consult structural engineer if crack exceeds 0.3mm',
            'Consider epoxy injection repair'
          ]
        },
        {
          category: 'compliance',
          severity: 'medium',
          description: 'Rebar spacing appears inconsistent with specifications',
          confidence: 0.78,
          location: { x: 60, y: 50 },
          recommendations: [
            'Verify against structural drawings',
            'Measure actual spacing at multiple points',
            'Document findings for QA review'
          ]
        },
        {
          category: 'progress',
          severity: 'low',
          description: 'Formwork installation 85% complete',
          confidence: 0.95,
          recommendations: [
            'Continue as planned',
            'Schedule inspection before concrete pour'
          ]
        },
        {
          category: 'defect',
          severity: 'critical',
          description: 'Potential water damage or moisture intrusion detected',
          confidence: 0.88,
          location: { x: 25, y: 70 },
          recommendations: [
            'Immediate investigation required',
            'Check for active leaks or water sources',
            'Dry affected areas before proceeding',
            'Document with additional photos'
          ]
        }
      ];

      const criticalIssues = mockDetections.filter(d => d.severity === 'critical').length;
      const totalDefects = mockDetections.filter(d => d.category === 'defect').length;
      const complianceScore = Math.round((1 - (mockDetections.filter(d => d.category === 'compliance').length / 10)) * 100);

      let overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
      if (criticalIssues > 0 || totalDefects > 3) {
        overallQuality = 'poor';
      } else if (totalDefects > 1 || complianceScore < 80) {
        overallQuality = 'fair';
      } else if (complianceScore < 95) {
        overallQuality = 'good';
      } else {
        overallQuality = 'excellent';
      }

      setAnalysisResult({
        status: 'success',
        detections: mockDetections,
        summary: {
          totalDefects,
          criticalIssues,
          complianceScore,
          overallQuality
        },
        processingTime: Date.now() - startTime
      });

      // In real implementation, save results to database
      // await saveAnalysisResults(userId, companyId, projectId, analysisResult);

    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult({
        status: 'error',
        detections: [],
        summary: {
          totalDefects: 0,
          criticalIssues: 0,
          complianceScore: 0,
          overallQuality: 'poor'
        },
        processingTime: Date.now() - startTime
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center space-x-3">
          <CameraIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quality Control Vision AI</h1>
            <p className="text-sm text-gray-500">AI-powered image analysis for construction quality assessment</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Image Upload & Preview */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Construction Photo</h2>

                {!selectedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, HEIC up to 10MB</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="w-full rounded-lg border"
                      />
                      {analysisResult && analysisResult.detections.map((detection, idx) =>
                        detection.location && (
                          <div
                            key={idx}
                            className={`absolute w-6 h-6 rounded-full border-2 ${
                              detection.severity === 'critical' ? 'border-red-500 bg-red-500' :
                              detection.severity === 'high' ? 'border-orange-500 bg-orange-500' :
                              detection.severity === 'medium' ? 'border-yellow-500 bg-yellow-500' :
                              'border-green-500 bg-green-500'
                            } opacity-70 animate-pulse`}
                            style={{
                              left: `${detection.location.x}%`,
                              top: `${detection.location.y}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                        )
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Change Photo
                      </button>
                      <button
                        onClick={analyzeImage}
                        disabled={isAnalyzing}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Quality'}
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* AI Capabilities */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Detection Capabilities</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span>Defect Detection</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span>Compliance Checking</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span>Progress Monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span>Safety Hazards</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span>Material Quality</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span>Workmanship Review</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Analysis Results */}
            <div className="space-y-4">
              {analysisResult && (
                <>
                  {/* Summary Card */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Overall Quality</p>
                        <p className={`text-2xl font-bold ${getQualityColor(analysisResult.summary.overallQuality)}`}>
                          {analysisResult.summary.overallQuality.charAt(0).toUpperCase() + analysisResult.summary.overallQuality.slice(1)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Compliance Score</p>
                        <p className={`text-2xl font-bold ${
                          analysisResult.summary.complianceScore >= 90 ? 'text-green-600' :
                          analysisResult.summary.complianceScore >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {analysisResult.summary.complianceScore}%
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Defects</p>
                        <p className="text-2xl font-bold text-gray-900">{analysisResult.summary.totalDefects}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Critical Issues</p>
                        <p className={`text-2xl font-bold ${
                          analysisResult.summary.criticalIssues > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {analysisResult.summary.criticalIssues}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Processing time: {analysisResult.processingTime}ms
                    </div>
                  </div>

                  {/* Detections List */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Detections ({analysisResult.detections.length})
                    </h2>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {analysisResult.detections.map((detection, idx) => (
                        <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {detection.severity === 'critical' || detection.severity === 'high' ? (
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                              ) : detection.category === 'defect' ? (
                                <XCircleIcon className="w-5 h-5 text-orange-600" />
                              ) : (
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                              )}
                              <span className="text-sm font-medium text-gray-900">{detection.description}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(detection.severity)}`}>
                              {detection.severity.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 mb-2">
                            <span className="text-xs text-gray-600">
                              Category: <span className="font-medium">{detection.category}</span>
                            </span>
                            <span className="text-xs text-gray-600">
                              Confidence: <span className="font-medium">{Math.round(detection.confidence * 100)}%</span>
                            </span>
                          </div>

                          {detection.recommendations && detection.recommendations.length > 0 && (
                            <div className="mt-3 bg-blue-50 rounded p-3">
                              <p className="text-xs font-medium text-blue-900 mb-2">Recommendations:</p>
                              <ul className="space-y-1">
                                {detection.recommendations.map((rec, recIdx) => (
                                  <li key={recIdx} className="text-xs text-blue-800 flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {!analysisResult && !isAnalyzing && (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <CameraIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Upload and analyze a photo to see AI-powered quality insights</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-700 font-medium">Analyzing image with AI...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityControlVisionApp;
