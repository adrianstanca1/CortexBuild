import React, { useState } from 'react';
import { User, Permission, View } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DailySummaryGenerator } from './DailySummaryGenerator';
import { RiskBot } from './RiskBot';
import { FundingBot } from './FundingBot';
import { BidPackageGenerator } from './BidPackageGenerator';
import { CostEstimator } from './CostEstimator';
import { SafetyAnalysis } from './SafetyAnalysis';
import { WorkforcePlanner } from './WorkforcePlanner';
import { AISiteInspector } from './AISiteInspector';
import { hasPermission } from '../services/auth';

interface ToolsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  setActiveView: (view: View) => void;
}

type Tool =
  | 'summary'
  | 'risk'
  | 'funding'
  | 'bid'
  | 'cost'
  | 'safety'
  | 'planner'
  | 'inspector';

interface ToolConfig {
  id: Tool;
  name: string;
  description: string;
  component: React.FC<any>;
  permission: boolean;
  icon: string;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ user, addToast, setActiveView }) => {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  const commonProps = { user, addToast, onBack: () => setActiveTool(null) };

  const toolDefinitions: ToolConfig[] = [
    { 
      id: 'summary', 
      name: 'Daily Summary Generator', 
      description: 'AI-powered daily progress reports and summaries.', 
      component: DailySummaryGenerator, 
      permission: true,
      icon: '📝'
    },
    { 
      id: 'planner', 
      name: 'Workforce Planner', 
      description: 'Drag-and-drop operatives onto projects with smart scheduling.', 
      component: WorkforcePlanner, 
      permission: hasPermission(user, Permission.MANAGE_TEAM),
      icon: '👥'
    },
    { 
      id: 'risk', 
      name: 'RiskBot', 
      description: 'AI-powered compliance and financial risk analysis.', 
      component: RiskBot, 
      permission: true,
      icon: '⚠️'
    },
    { 
      id: 'funding', 
      name: 'FundingBot', 
      description: 'Discover grants and funding opportunities for your projects.', 
      component: FundingBot, 
      permission: true,
      icon: '💰'
    },
    { 
      id: 'bid', 
      name: 'Bid Package Generator', 
      description: 'AI-generated bid packages and cover letters.', 
      component: BidPackageGenerator, 
      permission: hasPermission(user, Permission.MANAGE_PROJECTS),
      icon: '📄'
    },
    { 
      id: 'cost', 
      name: 'Cost Estimator', 
      description: 'Get AI-powered high-level project cost estimates.', 
      component: CostEstimator, 
      permission: true,
      icon: '💵'
    },
    { 
      id: 'safety', 
      name: 'Safety Analysis', 
      description: 'Identify trends and patterns from safety incident data.', 
      component: SafetyAnalysis, 
      permission: hasPermission(user, Permission.VIEW_SAFETY_REPORTS),
      icon: '🛡️'
    },
    { 
      id: 'inspector', 
      name: 'AI Site Inspector', 
      description: 'Analyze site photos for progress tracking and safety concerns.', 
      component: AISiteInspector, 
      permission: true,
      icon: '📸'
    },
  ];
  
  const tools = toolDefinitions.filter(t => t.permission);

  const ActiveToolComponent = tools.find(t => t.id === activeTool)?.component;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {activeTool && <Button variant="ghost" onClick={() => setActiveTool(null)}>&larr; All Tools</Button>}
        <div>
          <h2 className="text-3xl font-bold text-slate-800">
            {activeTool ? tools.find(t => t.id === activeTool)?.name : 'AI Tools & Utilities'}
          </h2>
          {!activeTool && (
            <p className="text-slate-600 mt-1">
              {tools.length} powerful AI tools available • All tools active and ready
            </p>
          )}
        </div>
      </div>

      {ActiveToolComponent ? (
        <ActiveToolComponent {...commonProps} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map(tool => (
            <Card 
              key={tool.id} 
              onClick={() => setActiveTool(tool.id)} 
              className="cursor-pointer hover:shadow-lg hover:border-sky-500/50 transition-all flex flex-col relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-sky-400/10 to-transparent rounded-bl-full"></div>
              <div className="flex-grow">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{tool.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-sky-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{tool.description}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  ✓ Active
                </span>
                <span className="text-sm font-semibold text-sky-600 group-hover:translate-x-1 transition-transform">
                  Launch Tool &rarr;
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
