import React, { useState } from 'react';
// FIX: Corrected import path to be relative.
import { User, Permission } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DailySummaryGenerator } from './DailySummaryGenerator';
import { RiskBot } from './RiskBot';
import { FundingBot } from './FundingBot';
import { BidPackageGenerator } from './BidPackageGenerator';
import { CostEstimator } from './CostEstimator';
import { SafetyAnalysis } from './SafetyAnalysis';
import { WorkforcePlanner } from './WorkforcePlanner';
import { hasPermission } from '../services/auth';
// import { AISiteInspector } from './AISiteInspector'; // Uncomment when component is ready

interface ToolsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  setActiveView: (view: any) => void;
}

type Tool =
  | 'summary'
  | 'risk'
  | 'funding'
  | 'bid'
  | 'cost'
  | 'safety'
  | 'planner';
  // | 'inspector';

interface ToolConfig {
  id: Tool;
  name: string;
  description: string;
  component: React.FC<any>;
  permission: boolean;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ user, addToast, setActiveView }) => {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  const commonProps = { user, addToast, onBack: () => setActiveTool(null) };

  // FIX: The array of tool definitions is now explicitly typed as ToolConfig[] before being filtered.
  // This provides TypeScript with the necessary context to correctly type the 'id' property
  // as the 'Tool' literal union type, resolving the assignment error.
  const toolDefinitions: ToolConfig[] = [
    { id: 'summary', name: 'Daily Summary Generator', description: 'AI-powered daily progress reports.', component: DailySummaryGenerator, permission: true },
    { id: 'planner', name: 'Workforce Planner', description: 'Drag-and-drop operatives onto projects.', component: WorkforcePlanner, permission: hasPermission(user, Permission.MANAGE_TEAM) },
    { id: 'risk', name: 'RiskBot', description: 'Analyze text for compliance and financial risks.', component: RiskBot, permission: true },
    { id: 'funding', name: 'FundingBot', description: 'Discover grants and funding opportunities.', component: FundingBot, permission: true },
    { id: 'bid', name: 'Bid Package Generator', description: 'Draft bid packages and cover letters.', component: BidPackageGenerator, permission: hasPermission(user, Permission.MANAGE_PROJECTS) },
    { id: 'cost', name: 'Cost Estimator', description: 'Get high-level project cost estimates.', component: CostEstimator, permission: true },
    { id: 'safety', name: 'Safety Analysis', description: 'Identify trends from safety incident data.', component: SafetyAnalysis, permission: hasPermission(user, Permission.VIEW_SAFETY_REPORTS) },
    // { id: 'inspector', name: 'AI Site Inspector', description: 'Analyze site photos for progress and safety.', component: AISiteInspector, permission: true },
  ];
  
  const tools = toolDefinitions.filter(t => t.permission);

  const ActiveToolComponent = tools.find(t => t.id === activeTool)?.component;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {activeTool && <Button variant="ghost" onClick={() => setActiveTool(null)}>&larr; All Tools</Button>}
        <h2 className="text-3xl font-bold text-slate-800">
          {activeTool ? tools.find(t => t.id === activeTool)?.name : 'AI Tools'}
        </h2>
      </div>

      {ActiveToolComponent ? (
        <ActiveToolComponent {...commonProps} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map(tool => (
            <Card key={tool.id} onClick={() => setActiveTool(tool.id)} className="cursor-pointer hover:shadow-lg hover:border-sky-500/50 transition-all flex flex-col">
              <div className="flex-grow">
                <h3 className="font-bold text-lg text-slate-800">{tool.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{tool.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t text-right">
                <span className="text-sm font-semibold text-sky-600">Launch Tool &rarr;</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};