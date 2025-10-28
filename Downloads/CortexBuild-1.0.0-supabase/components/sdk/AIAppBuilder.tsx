import React, { useState } from 'react';
import { Sparkles, Code, Eye, Save, Play, Download, MessageSquare, CheckCircle, AlertTriangle, TestTube, BarChart3 } from 'lucide-react';
import { DeveloperChatbot } from './DeveloperChatbot';
import { CodeSandbox } from './CodeSandbox';

interface AIAppBuilderProps {
  subscriptionTier: string;
}

export const AIAppBuilder: React.FC<AIAppBuilderProps> = ({ subscriptionTier }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [generatingTests, setGeneratingTests] = useState(false);
  const [tests, setTests] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    setAnalysis(null);
    setTests('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/sdk/ai/generate-app', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, subscriptionTier })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedCode(data.code);
        setExplanation(data.explanation || '');
      } else {
        alert(data.error || 'Failed to generate app');
      }
    } catch (error) {
      console.error('Failed to generate app:', error);
      alert('Failed to generate app. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnalyzeCode = async () => {
    if (!generatedCode) return;

    setAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/sdk/ai/analyze-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: generatedCode })
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.data);
      } else {
        alert(data.error || 'Failed to analyze code');
      }
    } catch (error) {
      console.error('Failed to analyze code:', error);
      alert('Failed to analyze code. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateTests = async () => {
    if (!generatedCode) return;

    setGeneratingTests(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/sdk/ai/generate-tests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: generatedCode })
      });

      const data = await response.json();
      if (data.success) {
        setTests(data.tests);
      } else {
        alert(data.error || 'Failed to generate tests');
      }
    } catch (error) {
      console.error('Failed to generate tests:', error);
      alert('Failed to generate tests. Please try again.');
    } finally {
      setGeneratingTests(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">AI App Builder</h2>
        </div>
        <p className="text-gray-600">
          Describe your app in natural language, and AI will generate the complete code for you.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe Your App
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={6}
          placeholder="Example: Create an invoice approval workflow with 3-step authorization. Include email notifications at each step and a dashboard showing pending approvals."
        />

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {subscriptionTier === 'free' && '⚠️ Upgrade to generate apps'}
            {subscriptionTier === 'starter' && '✓ Basic generation available'}
            {subscriptionTier === 'pro' && '✓ Advanced generation with AI assistance'}
            {subscriptionTier === 'enterprise' && '✓ Unlimited generation with priority processing'}
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || subscriptionTier === 'free'}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${generating || subscriptionTier === 'free'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate App</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Code Section with Live Sandbox */}
      {generatedCode && (
        <div className="space-y-4">
          {/* Code Sandbox with Live Preview */}
          <CodeSandbox
            code={generatedCode}
            language="typescript"
            onCodeChange={(newCode) => setGeneratedCode(newCode)}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleAnalyzeCode}
              disabled={analyzing}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{analyzing ? 'Analyzing...' : 'Analyze Code'}</span>
            </button>
            <button
              type="button"
              onClick={handleGenerateTests}
              disabled={generatingTests}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <TestTube className="w-4 h-4" />
              <span>{generatingTests ? 'Generating...' : 'Generate Tests'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Explanation Section */}
      {explanation && (
        <div className="bg-blue-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Explanation</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{explanation}</p>
        </div>
      )}

      {/* Code Analysis Section */}
      {analysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Code Analysis</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Quality Score:</span>
              <span className={`text-2xl font-bold ${analysis.score >= 80 ? 'text-green-600' :
                analysis.score >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                {analysis.score}/100
              </span>
            </div>
          </div>

          {analysis.issues && analysis.issues.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-red-700 mb-2 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Issues Found ({analysis.issues.length})</span>
              </h4>
              <ul className="space-y-2">
                {analysis.issues.map((issue: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-red-600 mt-1">•</span>
                    <span className="text-gray-700">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-700 mb-2 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Suggestions ({analysis.suggestions.length})</span>
              </h4>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Generated Tests Section */}
      {tests && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-teal-600 px-6 py-4 flex items-center space-x-3">
            <TestTube className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Generated Tests</span>
          </div>
          <div className="p-6 bg-gray-900 overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono">
              <code>{tests}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {showPreview && generatedCode && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Play className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
          </div>
          <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50">
            <p className="text-center text-gray-500">
              Preview functionality coming soon. Your app will render here in real-time.
            </p>
          </div>
        </div>
      )}

      {/* AI Chat Assistant */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
        </div>

        <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
          {chatMessages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Ask me anything about your app or request modifications!
            </p>
          ) : (
            chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-2 rounded-lg ${msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask AI to modify your app..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={subscriptionTier === 'free'}
          />
          <button
            disabled={subscriptionTier === 'free'}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${subscriptionTier === 'free'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            Send
          </button>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Prompts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Create a daily safety inspection checklist with photo upload and signature capture',
            'Build a material tracking system with barcode scanning and inventory alerts',
            'Generate a subcontractor performance dashboard with ratings and analytics',
            'Create an RFI management system with auto-response suggestions'
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example)}
              className="text-left p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors"
            >
              <p className="text-sm text-gray-700">{example}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Developer Chatbot */}
      <DeveloperChatbot subscriptionTier={subscriptionTier} />
    </div>
  );
};

