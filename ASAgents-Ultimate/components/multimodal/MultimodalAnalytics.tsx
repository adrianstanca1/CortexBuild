// Multimodal Analytics and Insights Dashboard
// Usage patterns, processing metrics, and AI-generated insights

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Activity, FileText, Image, Music, Video, File, Users, Clock, Zap, Brain } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalContent: number;
    totalProcessingTime: number;
    averageProcessingTime: number;
    successRate: number;
    storageUsed: number;
    activeUsers: number;
  };
  contentDistribution: Array<{
    type: string;
    count: number;
    size: number;
    color: string;
  }>;
  processingMetrics: Array<{
    date: string;
    processed: number;
    failed: number;
    avgTime: number;
  }>;
  usagePatterns: Array<{
    hour: number;
    uploads: number;
    searches: number;
    views: number;
  }>;
  qualityMetrics: Array<{
    type: string;
    avgConfidence: number;
    avgQuality: number;
  }>;
  insights: Array<{
    id: string;
    type: 'trend' | 'anomaly' | 'recommendation';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    timestamp: string;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
    growth: number;
  }>;
  performanceMetrics: {
    cacheHitRate: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  };
}

interface MultimodalAnalyticsProps {
  timeRange: '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange: (range: '24h' | '7d' | '30d' | '90d') => void;
}

const COLORS = {
  text: '#3B82F6',
  image: '#10B981',
  audio: '#F59E0B',
  video: '#EF4444',
  document: '#8B5CF6',
  mixed: '#6B7280'
};

const MultimodalAnalytics: React.FC<MultimodalAnalyticsProps> = ({
  timeRange,
  onTimeRangeChange
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'uploads' | 'processing' | 'quality' | 'usage'>('uploads');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from an analytics API
      const mockData: AnalyticsData = {
        overview: {
          totalContent: 15420,
          totalProcessingTime: 2847000, // milliseconds
          averageProcessingTime: 1850,
          successRate: 97.3,
          storageUsed: 2.4 * 1024 * 1024 * 1024, // 2.4GB
          activeUsers: 342
        },
        contentDistribution: [
          { type: 'Images', count: 8234, size: 1.2 * 1024 * 1024 * 1024, color: COLORS.image },
          { type: 'Documents', count: 3421, size: 0.8 * 1024 * 1024 * 1024, color: COLORS.document },
          { type: 'Videos', count: 1876, size: 0.3 * 1024 * 1024 * 1024, color: COLORS.video },
          { type: 'Audio', count: 1234, size: 0.08 * 1024 * 1024 * 1024, color: COLORS.audio },
          { type: 'Text', count: 655, size: 0.02 * 1024 * 1024 * 1024, color: COLORS.text }
        ],
        processingMetrics: [
          { date: '2024-01-01', processed: 234, failed: 12, avgTime: 1650 },
          { date: '2024-01-02', processed: 287, failed: 8, avgTime: 1720 },
          { date: '2024-01-03', processed: 312, failed: 15, avgTime: 1890 },
          { date: '2024-01-04', processed: 298, failed: 6, avgTime: 1580 },
          { date: '2024-01-05', processed: 345, failed: 11, avgTime: 1750 },
          { date: '2024-01-06', processed: 389, failed: 9, avgTime: 1680 },
          { date: '2024-01-07', processed: 421, failed: 7, avgTime: 1620 }
        ],
        usagePatterns: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          uploads: Math.floor(Math.random() * 50) + 10,
          searches: Math.floor(Math.random() * 80) + 20,
          views: Math.floor(Math.random() * 120) + 30
        })),
        qualityMetrics: [
          { type: 'Image Analysis', avgConfidence: 0.89, avgQuality: 0.92 },
          { type: 'Text Analysis', avgConfidence: 0.94, avgQuality: 0.88 },
          { type: 'Audio Analysis', avgConfidence: 0.82, avgQuality: 0.85 },
          { type: 'Video Analysis', avgConfidence: 0.78, avgQuality: 0.81 },
          { type: 'Document Analysis', avgConfidence: 0.91, avgQuality: 0.89 }
        ],
        insights: [
          {
            id: '1',
            type: 'trend',
            title: 'Video Processing Surge',
            description: 'Video uploads increased by 45% this week, primarily during evening hours.',
            impact: 'high',
            timestamp: '2024-01-07T15:30:00Z'
          },
          {
            id: '2',
            type: 'recommendation',
            title: 'Cache Optimization Opportunity',
            description: 'Implementing aggressive caching for image thumbnails could reduce response time by 30%.',
            impact: 'medium',
            timestamp: '2024-01-07T12:15:00Z'
          },
          {
            id: '3',
            type: 'anomaly',
            title: 'Processing Time Spike',
            description: 'Audio processing times increased by 25% on January 3rd, possibly due to complex content.',
            impact: 'low',
            timestamp: '2024-01-03T18:45:00Z'
          }
        ],
        topTags: [
          { tag: 'construction', count: 1234, growth: 12.5 },
          { tag: 'blueprint', count: 987, growth: 8.3 },
          { tag: 'safety', count: 765, growth: 15.2 },
          { tag: 'equipment', count: 654, growth: -2.1 },
          { tag: 'progress', count: 543, growth: 22.7 }
        ],
        performanceMetrics: {
          cacheHitRate: 0.73,
          averageResponseTime: 245,
          errorRate: 0.027,
          throughput: 1250
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'anomaly': return <Activity className="w-4 h-4" />;
      case 'recommendation': return <Brain className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Multimodal Analytics</h2>
        <div className="flex gap-2">
          {(['24h', '7d', '30d', '90d'] as const).map((range) => (
            <button
              type="button"
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1 rounded text-sm ${timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Total Content</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalContent.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Avg Processing</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatDuration(analyticsData.overview.averageProcessingTime)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-gray-600">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.successRate}%</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Storage Used</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatBytes(analyticsData.overview.storageUsed)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="text-sm text-gray-600">Active Users</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeUsers}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <span className="text-sm text-gray-600">Cache Hit Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{Math.round(analyticsData.performanceMetrics.cacheHitRate * 100)}%</p>
        </div>
      </div>

      {/* Content Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Content Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.contentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analyticsData.contentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Processing Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.processingMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="processed" stroke="#10B981" name="Processed" />
              <Line type="monotone" dataKey="failed" stroke="#EF4444" name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Usage Patterns */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">24-Hour Usage Patterns</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.usagePatterns}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="uploads" fill="#3B82F6" name="Uploads" />
            <Bar dataKey="searches" fill="#10B981" name="Searches" />
            <Bar dataKey="views" fill="#F59E0B" name="Views" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quality Metrics and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Quality Metrics</h3>
          <div className="space-y-4">
            {analyticsData.qualityMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{metric.type}</span>
                <div className="flex gap-4">
                  <span className="text-sm">
                    Confidence: <span className="font-semibold">{Math.round(metric.avgConfidence * 100)}%</span>
                  </span>
                  <span className="text-sm">
                    Quality: <span className="font-semibold">{Math.round(metric.avgQuality * 100)}%</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
          <div className="space-y-3">
            {analyticsData.insights.map((insight) => (
              <div key={insight.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  {getInsightIcon(insight.type)}
                  <span className="font-medium text-sm">{insight.title}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getImpactColor(insight.impact)}`}>
                    {insight.impact}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Tags */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Trending Tags</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {analyticsData.topTags.map((tag, index) => (
            <div key={index} className="text-center">
              <div className="text-lg font-bold text-gray-900">{tag.count}</div>
              <div className="text-sm text-gray-600">{tag.tag}</div>
              <div className={`text-xs ${tag.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tag.growth >= 0 ? '+' : ''}{tag.growth}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultimodalAnalytics;
