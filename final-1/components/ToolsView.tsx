// full contents of components/ToolsView.tsx

import React, { useState } from 'react';
// FIX: Imported correct types
import { User, View, Permission, Role } from '../types';
import { hasPermission } from '../services/auth';
import { Card } from './ui/Card';
import { AIAdvisor } from './AIAdvisor';
import { BidPackageGenerator } from './BidPackageGenerator';
import { CostEstimator } from './CostEstimator';
import { DailySummaryGenerator } from './DailySummaryGenerator';
import { FundingBot } from './FundingBot';
import { RiskBot } from './RiskBot';
import { SafetyAnalysis } from './SafetyAnalysis';
import { AISiteInspector } from './AISiteInspector';
import { WorkforcePlanner } from './WorkforcePlanner';
import { ResourceScheduler } from './ResourceScheduler';

interface ToolsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  setActiveView: (view: View) => void;
}

type Tool = 'ai-advisor' | 'bid-generator' | 'cost-estimator' | 'daily-summary' | 'funding-bot' | 'risk-bot' | 'safety-analysis' | 'site-inspector' | 'workforce-planner' | 'resource-scheduler';

interface ToolConfig {
    id: Tool;
    name: string;
    description: string;
    icon: React.ReactNode;
    component: React.ReactNode;
    permission: boolean;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ user, addToast, setActiveView }) => {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);

    const toolDefinitions: ToolConfig[] = [
        { id: 'ai-advisor', name: 'AI Advisor', description: 'Chat with an AI expert on project management.', icon: '💬', component: <AIAdvisor user={user} addToast={addToast} onBack={() => setActiveTool(null)} />, permission: true },
        { id: 'bid-generator', name: 'Bid Package Generator', description: 'Generate professional bid packages and cover letters.', icon: '📝', component: <BidPackageGenerator user={user} addToast={addToast} onBack={() => setActiveTool(null)} />, permission: true },
        { id: 'cost-estimator', name: 'Cost Estimator', description: 'Estimate project costs based on specifications.', icon: '🧮', component: <CostEstimator user={user} addToast={addToast} onBack={() => setActiveTool(null)} />, permission: true },
        { id: 'daily-summary', name: 'Daily Summary Generator', description: 'AI-powered daily progress reports.', icon: '📰', component: <DailySummaryGenerator user={user} addToast={addToast} onBack={() => setActiveTool(null)} />, permission: true },
        { id: 'funding-bot', name: 'FundingBot', description: 'Discover grants and funding opportunities.', icon: '💰', component: <FundingBot user={user} addToast={addToast} onBack={() => setActiveTool(null)} />, permission: true },
        { id: 'risk-bot', name: 'RiskBot', description: 'Analyze documents for compliance and financial risks.', icon: '⚠️', component: <RiskBot user={user} addToast={addToast} onBack={() => setActiveTool(null)} />, permission: true },
        { id: 'safety-analysis', name: 'Safety Analysis', description: 'Identify trends from safety incident reports.', icon: '🛡️', component: <SafetyAnalysis user={user} addToast={addToast} />, permission: true },
        { id: 'site-inspector', name: 'AI Site Inspector', description: 'Analyze site photos for progress and hazards.', icon: '📸', component: <AISiteInspector user={user} addToast={addToast} onBack={() => setActiveTool(null)} />, permission: true },
        // FIX: Used Permission enum for checks
        { id: 'workforce-planner', name: 'Workforce Planner', description: 'Plan and allocate personnel to projects.', icon: '👥', component: <WorkforcePlanner user={user} addToast={addToast} />, permission: hasPermission(user, Permission.MANAGE_TEAM) },
        { id: 'resource-scheduler', name: 'Resource Scheduler', description: 'View team and equipment schedules.', icon: '🗓️', component: <ResourceScheduler user={user} addToast={addToast} />, permission: hasPermission(user, Permission.MANAGE_EQUIPMENT) },
    ];
    
    const availableTools = toolDefinitions.filter(t => t.permission);
    const currentTool = availableTools.find(t => t.id === activeTool);

    if (currentTool) {
        return (
            <div>
                 <button onClick={() => setActiveTool(null)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
                    &larr; Back to all tools
                </button>
                {currentTool.component}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTools.map(tool => (
                    <Card key={tool.id} onClick={() => setActiveTool(tool.id)} className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all">
                        <div className="text-3xl mb-2">{tool.icon}</div>
                        <h3 className="font-bold text-lg">{tool.name}</h3>
                        <p className="text-sm text-slate-600">{tool.description}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
};