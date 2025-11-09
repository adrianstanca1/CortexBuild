# Automation Studio Module - Developer Dashboard Integration

## Executive Summary

**Module Name**: Automation Studio  
**Parent Component**: `DeveloperDashboardScreen.tsx`  
**Integration Type**: New Dashboard Tab with Modular Card-Based Layout  
**Architecture Pattern**: Widget System - All features as collapsible, draggable, configurable cards

### Key Outcomes
1. **Zero-code automation** - Visual flow builder embedded as dashboard widget
2. **Procurement automation** (PRIORITY 1) - RFQ/Bid/PO management cards with approval workflows
3. **Universal AI Assistant** (PRIORITY 2) - Cmd+K palette + chat widget on all tabs

---

## 1. Dashboard Integration Architecture

### Tab Structure in DeveloperDashboardScreen.tsx

```
Developer Dashboard (existing)
├── Overview (existing)
├── Modules (existing)
├── Workflows (existing)
├── API Keys (existing)
├── Analytics (existing)
├── Documentation (existing)
└── 🆕 Automation Studio ⭐ NEW
    ├── 📊 Quick Actions Card (top row)
    ├── 🔄 Active Flows Card (top row)
    ├── 🎯 Flow Builder Canvas (main content - collapsible)
    ├── 🛒 Procurement Pipeline (3-column card)
    ├── 📱 Mobile Apps (gallery card)
    ├── 🤖 Agent Marketplace (grid card)
    ├── 🔌 Connectors (list card)
    └── 📈 Automation Analytics (charts card)
```

### Widget Layout Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  Developer Dashboard > Automation Studio                   [+New]│
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐  │
│  │ Quick Actions    │  │ Active Flows     │  │ AI Assistant │  │
│  │ • New Flow       │  │ ▶ 3 Running      │  │ [Cmd+K]      │  │
│  │ • New RFQ        │  │ ⏸ 2 Paused       │  │ Ask me...    │  │
│  │ • New Mobile App │  │ ✓ 12 Completed   │  │              │  │
│  └──────────────────┘  └──────────────────┘  └─────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🎯 Flow Builder Canvas                          [Expand] [↕] ││
│  │                                                                │
│  │  ┌─────┐      ┌─────┐      ┌─────┐      ┌─────┐            │
│  │  │START│─────▶│ IF  │─────▶│ API │─────▶│ END │            │
│  │  └─────┘      └─────┘      └─────┘      └─────┘            │
│  │                                                                │
│  │  [+ Trigger] [+ Condition] [+ Action] [AI Generate]          │
│  └────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🛒 Procurement Pipeline                        [Filter] [↕]  ││
│  ├────────────┬────────────────┬────────────────────────────────┤│
│  │ RFQs (8)   │ Bids (24)      │ Purchase Orders (12)          ││
│  │            │                │                                ││
│  │ □ RFQ-001  │ ✓ BID-045 Won  │ PO-078 Approved $45K          ││
│  │ □ RFQ-002  │ ⧗ BID-046 Pend │ PO-079 Awaiting Delivery      ││
│  │ + New RFQ  │ + Submit Bid   │ + Create PO                   ││
│  └────────────┴────────────────┴────────────────────────────────┘│
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐  │
│  │ 📱 Mobile Apps   │  │ 🤖 Marketplace   │  │ 🔌 Connectors│  │
│  │ 3 Published      │  │ 12 Installed     │  │ 8 Active     │  │
│  │ [+ New App]      │  │ [Browse]         │  │ [+ Add]      │  │
│  └──────────────────┘  └──────────────────┘  └─────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Widget Component Architecture

### Base Widget Component

```typescript
// components/automation/widgets/BaseWidget.tsx
interface WidgetProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  collapsible?: boolean;
  expandable?: boolean;
  defaultCollapsed?: boolean;
  actions?: WidgetAction[];
  children: React.ReactNode;
}

interface WidgetAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const BaseWidget: React.FC<WidgetProps> = ({
  id,
  title,
  icon,
  collapsible = true,
  expandable = false,
  defaultCollapsed = false,
  actions = [],
  children
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className={`widget-card ${collapsed ? 'collapsed' : ''} ${expanded ? 'expanded' : ''}`}
      data-widget-id={id}
    >
      <div className="widget-header">
        <div className="widget-title">
          {icon}
          <h3>{title}</h3>
        </div>
        <div className="widget-actions">
          {actions.map(action => (
            <button 
              key={action.label}
              onClick={action.onClick}
              className={`widget-action ${action.variant || 'secondary'}`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
          {expandable && (
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? <Minimize2 /> : <Maximize2 />}
            </button>
          )}
          {collapsible && (
            <button onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ChevronDown /> : <ChevronUp />}
            </button>
          )}
        </div>
      </div>
      {!collapsed && (
        <div className="widget-content">
          {children}
        </div>
      )}
    </div>
  );
};
```

---

## 3. Core Widgets Specifications

### 3.1 Flow Builder Canvas Widget

```typescript
// components/automation/widgets/FlowBuilderWidget.tsx
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background,
  MiniMap 
} from 'reactflow';

interface FlowBuilderWidgetProps {
  flowId?: string;
  mode?: 'edit' | 'view' | 'test';
}

export const FlowBuilderWidget: React.FC<FlowBuilderWidgetProps> = ({
  flowId,
  mode = 'edit'
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const nodeTypes = {
    trigger: TriggerNode,
    condition: ConditionNode,
    action: ActionNode,
    aiTool: AIToolNode,
    approval: ApprovalNode,
    loop: LoopNode,
    parallel: ParallelNode
  };

  return (
    <BaseWidget
      id="flow-builder"
      title="Flow Builder"
      icon={<Workflow />}
      expandable={true}
      actions={[
        {
          icon: <Save />,
          label: 'Save',
          onClick: handleSave,
          variant: 'primary'
        },
        {
          icon: <Play />,
          label: 'Test Run',
          onClick: handleTestRun,
          variant: 'secondary'
        },
        {
          icon: <Sparkles />,
          label: 'AI Generate',
          onClick: handleAIGenerate,
          variant: 'primary'
        }
      ]}
    >
      <div className="flow-builder-container">
        <div className="node-palette">
          <h4>Drag to Canvas</h4>
          <NodePaletteItem type="trigger" icon={<Zap />} label="Trigger" />
          <NodePaletteItem type="condition" icon={<GitBranch />} label="Condition" />
          <NodePaletteItem type="action" icon={<Play />} label="Action" />
          <NodePaletteItem type="aiTool" icon={<Brain />} label="AI Tool" />
          <NodePaletteItem type="approval" icon={<CheckSquare />} label="Approval" />
        </div>

        <div className="flow-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background />
            <MiniMap />
          </ReactFlow>
        </div>

        <div className="node-config-panel">
          {selectedNode && (
            <NodeConfigPanel node={selectedNode} onChange={handleNodeUpdate} />
          )}
        </div>
      </div>
    </BaseWidget>
  );
};
```

**Node Types:**

```typescript
// Trigger Node
interface TriggerNodeData {
  triggerType: 'webhook' | 'schedule' | 'event' | 'manual';
  config: {
    schedule?: string; // cron
    eventType?: string;
    webhookUrl?: string;
  };
}

// Condition Node
interface ConditionNodeData {
  operator: 'if' | 'switch' | 'filter';
  conditions: Array<{
    field: string;
    operator: '==' | '!=' | '>' | '<' | 'contains' | 'regex';
    value: any;
  }>;
  logic: 'AND' | 'OR';
}

// Action Node
interface ActionNodeData {
  actionType: 'http' | 'database' | 'email' | 'notification' | 'ai' | 'custom';
  config: {
    endpoint?: string;
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  };
}

// AI Tool Node
interface AIToolNodeData {
  toolType: 'chat' | 'classification' | 'extraction' | 'generation' | 'embedding';
  model: string;
  prompt: string;
  parameters: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
}
```

---

### 3.2 Procurement Pipeline Widget (HIGHEST PRIORITY)

```typescript
// components/automation/widgets/ProcurementPipelineWidget.tsx
export const ProcurementPipelineWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rfqs' | 'bids' | 'pos'>('rfqs');
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  return (
    <BaseWidget
      id="procurement-pipeline"
      title="Procurement Pipeline"
      icon={<ShoppingCart />}
      actions={[
        {
          icon: <Plus />,
          label: 'New RFQ',
          onClick: () => setShowNewRFQModal(true),
          variant: 'primary'
        },
        {
          icon: <Filter />,
          label: 'Filter',
          onClick: () => setShowFilters(true)
        }
      ]}
    >
      <div className="procurement-pipeline">
        <div className="pipeline-tabs">
          <button 
            className={activeTab === 'rfqs' ? 'active' : ''}
            onClick={() => setActiveTab('rfqs')}
          >
            📋 RFQs ({rfqs.length})
          </button>
          <button 
            className={activeTab === 'bids' ? 'active' : ''}
            onClick={() => setActiveTab('bids')}
          >
            📝 Bids ({bids.length})
          </button>
          <button 
            className={activeTab === 'pos' ? 'active' : ''}
            onClick={() => setActiveTab('pos')}
          >
            📦 Purchase Orders ({purchaseOrders.length})
          </button>
        </div>

        <div className="pipeline-content">
          {activeTab === 'rfqs' && (
            <RFQKanbanBoard rfqs={rfqs} onUpdate={handleRFQUpdate} />
          )}
          {activeTab === 'bids' && (
            <BidsTable bids={bids} onSubmit={handleBidSubmit} />
          )}
          {activeTab === 'pos' && (
            <PurchaseOrdersList pos={purchaseOrders} onCreate={handlePOCreate} />
          )}
        </div>
      </div>
    </BaseWidget>
  );
};
```

**RFQ Card Component:**

```typescript
// components/automation/procurement/RFQCard.tsx
interface RFQCardProps {
  rfq: RFQ;
  onUpdate: (rfqId: string, updates: Partial<RFQ>) => void;
}

export const RFQCard: React.FC<RFQCardProps> = ({ rfq, onUpdate }) => {
  return (
    <div className="rfq-card" data-status={rfq.status}>
      <div className="rfq-header">
        <span className="rfq-number">{rfq.number}</span>
        <StatusBadge status={rfq.status} />
      </div>
      
      <div className="rfq-content">
        <h4>{rfq.title}</h4>
        <p>{rfq.description}</p>
        
        <div className="rfq-meta">
          <div className="meta-item">
            <Calendar size={16} />
            <span>Due: {formatDate(rfq.dueDate)}</span>
          </div>
          <div className="meta-item">
            <DollarSign size={16} />
            <span>Budget: ${rfq.estimatedValue.toLocaleString()}</span>
          </div>
          <div className="meta-item">
            <Users size={16} />
            <span>{rfq.vendors?.length || 0} vendors</span>
          </div>
        </div>
      </div>

      <div className="rfq-actions">
        <button onClick={() => handleViewDetails(rfq.id)}>
          <Eye size={16} /> View
        </button>
        <button onClick={() => handleSendToVendors(rfq.id)}>
          <Send size={16} /> Send
        </button>
        {rfq.bids?.length >= 3 && (
          <button 
            className="btn-primary"
            onClick={() => handleReviewBids(rfq.id)}
          >
            <CheckCircle size={16} /> Review {rfq.bids.length} Bids
          </button>
        )}
      </div>

      {/* 3-Bid Enforcement Indicator */}
      {rfq.status === 'open' && (
        <div className="bid-counter">
          <span className={rfq.bids?.length >= 3 ? 'complete' : 'pending'}>
            {rfq.bids?.length || 0}/3 bids received
          </span>
          {rfq.bids?.length < 3 && (
            <span className="help-text">
              ⚠️ 3 bids required for compliance
            </span>
          )}
        </div>
      )}
    </div>
  );
};
```

---

### 3.3 Universal Assistant Widget (SECOND PRIORITY)

```typescript
// components/automation/widgets/UniversalAssistantWidget.tsx
export const UniversalAssistantWidget: React.FC = () => {
  const [mode, setMode] = useState<'palette' | 'chat'>('palette');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Action[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setMode('palette');
        // Show modal
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <>
      {/* Floating Button */}
      <button 
        className="universal-assistant-trigger"
        onClick={() => setMode('chat')}
      >
        <Sparkles size={20} />
        <span>AI Assistant</span>
        <kbd>⌘K</kbd>
      </button>

      {/* Command Palette Modal */}
      {mode === 'palette' && (
        <CommandPalette
          query={query}
          suggestions={suggestions}
          onSelect={handleActionSelect}
          onClose={() => setMode(null)}
        />
      )}

      {/* Chat Widget */}
      {mode === 'chat' && (
        <BaseWidget
          id="universal-assistant"
          title="AI Assistant"
          icon={<Bot />}
          actions={[
            {
              icon: <Terminal />,
              label: 'Command Palette',
              onClick: () => setMode('palette')
            }
          ]}
        >
          <div className="assistant-chat">
            <div className="chat-messages">
              {chatHistory.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
            
            <div className="chat-input">
              <textarea
                placeholder="Ask me anything or type a command..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={handleSend}>
                <Send size={20} />
              </button>
            </div>

            <div className="quick-actions">
              <button onClick={() => executeAction('create_rfq')}>
                📋 Create RFQ
              </button>
              <button onClick={() => executeAction('review_bids')}>
                📝 Review Bids
              </button>
              <button onClick={() => executeAction('create_flow')}>
                🔄 New Flow
              </button>
              <button onClick={() => executeAction('deploy_app')}>
                📱 Deploy App
              </button>
            </div>
          </div>
        </BaseWidget>
      )}
    </>
  );
};
```

**Function Calling Schema:**

```typescript
const assistantFunctions = [
  {
    name: 'create_rfq',
    description: 'Create a new Request for Quotation',
    parameters: {
      title: 'string',
      description: 'string',
      category: 'string',
      estimatedValue: 'number',
      dueDate: 'string',
      vendors: 'string[]'
    }
  },
  {
    name: 'review_bids',
    description: 'Review and compare bids for an RFQ',
    parameters: {
      rfqId: 'string',
      criteria: 'string[]' // ['price', 'quality', 'timeline', 'vendor_rating']
    }
  },
  {
    name: 'create_flow',
    description: 'Generate an automation flow from natural language',
    parameters: {
      description: 'string',
      domain: 'string' // 'procurement' | 'finance' | 'scheduling'
    }
  },
  {
    name: 'generate_report',
    description: 'Generate a report or analytics view',
    parameters: {
      reportType: 'string',
      dateRange: 'object',
      filters: 'object'
    }
  },
  {
    name: 'search_knowledge',
    description: 'Search across projects, documents, and workflows',
    parameters: {
      query: 'string',
      scope: 'string[]' // ['projects', 'docs', 'flows', 'vendors']
    }
  }
];
```

---

### 3.4 Mobile App Builder Widget

```typescript
// components/automation/widgets/MobileAppBuilderWidget.tsx
export const MobileAppBuilderWidget: React.FC = () => {
  const [apps, setApps] = useState<MobileApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<MobileApp | null>(null);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  return (
    <BaseWidget
      id="mobile-app-builder"
      title="Mobile App Builder"
      icon={<Smartphone />}
      expandable={true}
      actions={[
        {
          icon: <Plus />,
          label: 'New App',
          onClick: handleNewApp,
          variant: 'primary'
        }
      ]}
    >
      <div className="mobile-app-builder">
        {/* App List */}
        <div className="app-list">
          {apps.map(app => (
            <div 
              key={app.id}
              className={`app-item ${selectedApp?.id === app.id ? 'active' : ''}`}
              onClick={() => setSelectedApp(app)}
            >
              <div className="app-icon">
                {app.icon || <Smartphone />}
              </div>
              <div className="app-info">
                <h4>{app.name}</h4>
                <span className="app-status">{app.status}</span>
              </div>
              <div className="app-stats">
                <span>{app.screens?.length || 0} screens</span>
                <span>{app.installs || 0} installs</span>
              </div>
            </div>
          ))}
        </div>

        {/* Screen Composer */}
        {selectedApp && (
          <div className="screen-composer">
            <div className="composer-toolbar">
              <select value={selectedScreen} onChange={e => setSelectedScreen(e.target.value)}>
                {selectedApp.screens.map(screen => (
                  <option key={screen.id} value={screen.id}>{screen.name}</option>
                ))}
              </select>
              <button onClick={handleAddScreen}>
                <Plus size={16} /> Add Screen
              </button>
            </div>

            <div className="composer-canvas">
              {/* Component Palette */}
              <div className="component-palette">
                <h4>Components</h4>
                <DraggableComponent type="list" icon={<List />} label="List" />
                <DraggableComponent type="form" icon={<FileText />} label="Form" />
                <DraggableComponent type="button" icon={<Square />} label="Button" />
                <DraggableComponent type="card" icon={<CreditCard />} label="Card" />
                <DraggableComponent type="chart" icon={<BarChart />} label="Chart" />
                <DraggableComponent type="map" icon={<MapPin />} label="Map" />
              </div>

              {/* Phone Preview */}
              <div className="phone-preview">
                <div className={`device-frame ${previewMode}`}>
                  <MobileScreenPreview 
                    screen={getCurrentScreen()}
                    data={previewData}
                  />
                </div>
                <div className="preview-controls">
                  <button onClick={() => setPreviewMode('mobile')}>📱</button>
                  <button onClick={() => setPreviewMode('tablet')}>📱</button>
                  <button onClick={() => setPreviewMode('desktop')}>💻</button>
                </div>
              </div>

              {/* Properties Panel */}
              <div className="properties-panel">
                <h4>Properties</h4>
                {selectedComponent && (
                  <ComponentPropertiesEditor 
                    component={selectedComponent}
                    onChange={handleComponentUpdate}
                  />
                )}
              </div>
            </div>

            <div className="composer-actions">
              <button onClick={handleSave}>
                <Save size={16} /> Save
              </button>
              <button onClick={handlePreview}>
                <Eye size={16} /> Preview
              </button>
              <button onClick={handlePublish} className="btn-primary">
                <Rocket size={16} /> Publish PWA
              </button>
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};
```

---

### 3.5 Agent Marketplace Widget

```typescript
// components/automation/widgets/AgentMarketplaceWidget.tsx
export const AgentMarketplaceWidget: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [installedAgents, setInstalledAgents] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'installed' | 'available'>('all');

  return (
    <BaseWidget
      id="agent-marketplace"
      title="Agent Marketplace"
      icon={<Store />}
      actions={[
        {
          icon: <Upload />,
          label: 'Publish Agent',
          onClick: handlePublishAgent
        }
      ]}
    >
      <div className="agent-marketplace">
        {/* Filter Bar */}
        <div className="marketplace-filters">
          <div className="filter-tabs">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All Agents
            </button>
            <button 
              className={filter === 'installed' ? 'active' : ''}
              onClick={() => setFilter('installed')}
            >
              Installed ({installedAgents.length})
            </button>
            <button 
              className={filter === 'available' ? 'active' : ''}
              onClick={() => setFilter('available')}
            >
              Available
            </button>
          </div>
          
          <input 
            type="search"
            placeholder="Search agents..."
            className="marketplace-search"
          />
        </div>

        {/* Agent Grid */}
        <div className="agent-grid">
          {getFilteredAgents().map(agent => (
            <div key={agent.id} className="agent-card">
              <div className="agent-header">
                <div className="agent-icon">{agent.icon}</div>
                <div className="agent-badges">
                  {agent.verified && <span className="badge verified">✓ Verified</span>}
                  {agent.featured && <span className="badge featured">⭐ Featured</span>}
                </div>
              </div>

              <div className="agent-content">
                <h4>{agent.name}</h4>
                <p>{agent.description}</p>
                
                <div className="agent-meta">
                  <span>v{agent.version}</span>
                  <span>⭐ {agent.rating}/5</span>
                  <span>📥 {agent.installs}</span>
                </div>

                <div className="agent-tags">
                  {agent.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="agent-actions">
                {installedAgents.includes(agent.id) ? (
                  <>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleConfigure(agent.id)}
                    >
                      <Settings size={16} /> Configure
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => handleUninstall(agent.id)}
                    >
                      <Trash2 size={16} /> Uninstall
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn-primary"
                    onClick={() => handleInstall(agent.id)}
                  >
                    <Download size={16} /> Install
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseWidget>
  );
};
```

---

## 4. Database Schema for Automation Studio

```sql
-- Automation Flows
CREATE TABLE automation_flows (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  developer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'procurement' | 'finance' | 'scheduling' | 'custom'
  definition TEXT NOT NULL, -- JSON: nodes + edges
  status TEXT DEFAULT 'draft', -- 'draft' | 'active' | 'paused' | 'archived'
  version INTEGER DEFAULT 1,
  trigger_config TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (developer_id) REFERENCES users(id)
);

-- Flow Runs (execution history)
CREATE TABLE automation_flow_runs (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL,
  status TEXT NOT NULL, -- 'running' | 'completed' | 'failed' | 'cancelled'
  trigger_source TEXT, -- 'manual' | 'schedule' | 'webhook' | 'event'
  input_data TEXT, -- JSON
  output_data TEXT, -- JSON
  error_message TEXT,
  started_at DATETIME NOT NULL,
  completed_at DATETIME,
  duration_ms INTEGER,
  FOREIGN KEY (flow_id) REFERENCES automation_flows(id) ON DELETE CASCADE
);

-- RFQs (Request for Quotation)
CREATE TABLE rfqs (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  project_id TEXT,
  number TEXT NOT NULL UNIQUE, -- RFQ-001, RFQ-002, etc.
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'materials' | 'equipment' | 'services' | 'labor'
  estimated_value DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft' | 'open' | 'closed' | 'awarded' | 'cancelled'
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- RFQ Line Items
CREATE TABLE rfq_line_items (
  id TEXT PRIMARY KEY,
  rfq_id TEXT NOT NULL,
  item_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  specifications TEXT,
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
);

-- Vendors
CREATE TABLE vendors (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  category TEXT[], -- ['materials', 'equipment', 'services']
  rating DECIMAL(3,2) DEFAULT 0, -- 0-5 stars
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active' | 'suspended' | 'blacklisted'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Bids
CREATE TABLE bids (
  id TEXT PRIMARY KEY,
  rfq_id TEXT NOT NULL,
  vendor_id TEXT NOT NULL,
  number TEXT NOT NULL UNIQUE, -- BID-001, BID-002, etc.
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  delivery_timeline TEXT, -- "2 weeks", "30 days", etc.
  notes TEXT,
  attachments TEXT[], -- File URLs
  status TEXT DEFAULT 'submitted', -- 'submitted' | 'under_review' | 'accepted' | 'rejected'
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  reviewed_by TEXT,
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Bid Line Items
CREATE TABLE bid_line_items (
  id TEXT PRIMARY KEY,
  bid_id TEXT NOT NULL,
  rfq_line_item_id TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  notes TEXT,
  FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE,
  FOREIGN KEY (rfq_line_item_id) REFERENCES rfq_line_items(id)
);

-- Purchase Orders
CREATE TABLE purchase_orders (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  project_id TEXT,
  rfq_id TEXT,
  bid_id TEXT,
  vendor_id TEXT NOT NULL,
  number TEXT NOT NULL UNIQUE, -- PO-001, PO-002, etc.
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft', -- 'draft' | 'approved' | 'sent' | 'acknowledged' | 'delivered' | 'cancelled'
  approval_status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  approved_by TEXT,
  approved_at DATETIME,
  delivery_address TEXT,
  delivery_date DATE,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id),
  FOREIGN KEY (bid_id) REFERENCES bids(id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Mobile Apps
CREATE TABLE mobile_apps (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  developer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- URL or emoji
  screens TEXT NOT NULL, -- JSON array of screen definitions
  theme TEXT, -- JSON: colors, fonts, etc.
  status TEXT DEFAULT 'draft', -- 'draft' | 'published' | 'archived'
  pwa_url TEXT,
  installs INTEGER DEFAULT 0,
  version TEXT DEFAULT '1.0.0',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (developer_id) REFERENCES users(id)
);

-- Agents/Widgets
CREATE TABLE automation_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL, -- 'procurement' | 'finance' | 'analytics' | 'productivity'
  version TEXT NOT NULL,
  author TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[], -- ['ai', 'procurement', 'automation']
  code TEXT NOT NULL, -- React component code
  config_schema TEXT, -- JSON schema for settings
  permissions TEXT[], -- ['read:projects', 'write:rfqs', etc.]
  rating DECIMAL(3,2) DEFAULT 0,
  installs INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active' | 'deprecated' | 'removed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Installed Agents (per company)
CREATE TABLE installed_agents (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  config TEXT, -- JSON: user settings
  enabled BOOLEAN DEFAULT TRUE,
  installed_by TEXT NOT NULL,
  installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (agent_id) REFERENCES automation_agents(id),
  FOREIGN KEY (installed_by) REFERENCES users(id),
  UNIQUE(company_id, agent_id)
);

-- Connectors
CREATE TABLE automation_connectors (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'quickbooks' | 'slack' | 'email' | 'webhook' | 'custom'
  credentials TEXT NOT NULL, -- Encrypted JSON
  config TEXT, -- JSON
  status TEXT DEFAULT 'active', -- 'active' | 'error' | 'disabled'
  last_sync_at DATETIME,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Create Indexes
CREATE INDEX idx_flows_company ON automation_flows(company_id, status);
CREATE INDEX idx_flow_runs_flow ON automation_flow_runs(flow_id, status);
CREATE INDEX idx_rfqs_company ON rfqs(company_id, status);
CREATE INDEX idx_rfqs_project ON rfqs(project_id);
CREATE INDEX idx_bids_rfq ON bids(rfq_id);
CREATE INDEX idx_bids_vendor ON bids(vendor_id);
CREATE INDEX idx_pos_company ON purchase_orders(company_id, status);
CREATE INDEX idx_pos_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_mobile_apps_company ON mobile_apps(company_id);
CREATE INDEX idx_installed_agents_company ON installed_agents(company_id);
```

---

## 5. API Endpoints

### 5.1 Flow Management

```typescript
// POST /api/automation/flows - Create new flow
{
  "name": "Auto-RFQ Approval",
  "description": "Automatically approve RFQs under $10K",
  "category": "procurement",
  "definition": {
    "nodes": [...],
    "edges": [...]
  }
}

// GET /api/automation/flows - List all flows
// GET /api/automation/flows/:id - Get flow details
// PUT /api/automation/flows/:id - Update flow
// DELETE /api/automation/flows/:id - Delete flow
// POST /api/automation/flows/:id/execute - Manual execution
// GET /api/automation/flows/:id/runs - Get execution history
```

### 5.2 Procurement

```typescript
// POST /api/automation/rfqs - Create RFQ
{
  "title": "Steel Beams for Tower A",
  "category": "materials",
  "estimatedValue": 45000,
  "dueDate": "2025-11-01",
  "lineItems": [
    {
      "description": "I-Beam 12x6x20ft",
      "quantity": 50,
      "unit": "pieces",
      "specifications": "ASTM A992 Grade 50"
    }
  ],
  "vendors": ["vendor-1", "vendor-2", "vendor-3"]
}

// GET /api/automation/rfqs - List RFQs with filters
// GET /api/automation/rfqs/:id - Get RFQ details
// POST /api/automation/rfqs/:id/send - Send to vendors
// GET /api/automation/rfqs/:id/bids - Get all bids for RFQ

// POST /api/automation/bids - Submit bid (vendor)
// PUT /api/automation/bids/:id/review - Review bid
// POST /api/automation/bids/:id/accept - Accept bid

// POST /api/automation/purchase-orders - Create PO from bid
// POST /api/automation/purchase-orders/:id/approve - Approve PO
// POST /api/automation/purchase-orders/:id/send - Send to vendor
```

### 5.3 Mobile Apps

```typescript
// POST /api/automation/mobile-apps - Create app
// PUT /api/automation/mobile-apps/:id - Update app
// POST /api/automation/mobile-apps/:id/publish - Publish as PWA
// GET /api/automation/mobile-apps/:id/qr - Get QR code
```

### 5.4 Agent Marketplace

```typescript
// GET /api/automation/agents - List available agents
// POST /api/automation/agents/install - Install agent
// DELETE /api/automation/agents/:id/uninstall - Uninstall
// PUT /api/automation/agents/:id/config - Update agent config
```

---

## 6. Implementation in DeveloperDashboardScreen.tsx

### Adding the Automation Studio Tab

```typescript
// In DeveloperDashboardScreen.tsx

const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

type DashboardTab = 
  | 'overview' 
  | 'modules' 
  | 'workflows' 
  | 'api-keys' 
  | 'analytics' 
  | 'documentation'
  | 'automation'; // 🆕 NEW

// Add to navigation
<div className="dashboard-tabs">
  {/* ... existing tabs ... */}
  <button
    className={`tab ${activeTab === 'automation' ? 'active' : ''}`}
    onClick={() => setActiveTab('automation')}
  >
    <Zap size={20} />
    <span>Automation Studio</span>
    <span className="badge new">New</span>
  </button>
</div>

// Add to content area
{activeTab === 'automation' && (
  <div className="automation-studio-tab">
    <AutomationStudioDashboard />
  </div>
)}
```

### AutomationStudioDashboard Component

```typescript
// components/automation/AutomationStudioDashboard.tsx
export const AutomationStudioDashboard: React.FC = () => {
  return (
    <div className="automation-studio">
      {/* Top Row - Quick Stats */}
      <div className="widget-row">
        <QuickActionsWidget />
        <ActiveFlowsWidget />
        <UniversalAssistantWidget />
      </div>

      {/* Flow Builder - Expandable */}
      <FlowBuilderWidget />

      {/* Procurement Pipeline - PRIORITY */}
      <ProcurementPipelineWidget />

      {/* Bottom Row - Secondary Widgets */}
      <div className="widget-row">
        <MobileAppBuilderWidget />
        <AgentMarketplaceWidget />
        <ConnectorsWidget />
      </div>

      {/* Analytics */}
      <AutomationAnalyticsWidget />
    </div>
  );
};
```

---

## 7. Styling & Layout

```css
/* styles/automation-studio.css */

.automation-studio {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.widget-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.widget-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.widget-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.widget-card.expanded {
  grid-column: 1 / -1;
  min-height: 600px;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.widget-actions {
  display: flex;
  gap: 8px;
}

.widget-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.widget-action.primary {
  background: #3b82f6;
  color: white;
}

.widget-action.secondary {
  background: #f3f4f6;
  color: #374151;
}

/* Flow Builder Canvas */
.flow-builder-container {
  display: grid;
  grid-template-columns: 200px 1fr 280px;
  gap: 16px;
  height: 600px;
}

.node-palette {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
}

.flow-canvas {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
}

/* Procurement Pipeline */
.procurement-pipeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pipeline-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.pipeline-tabs button {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
}

.pipeline-tabs button.active {
  color: #3b82f6;
  border-bottom: 2px solid #3b82f6;
  margin-bottom: -2px;
}

.rfq-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.rfq-card[data-status="open"] {
  border-left: 4px solid #10b981;
}

.rfq-card[data-status="closed"] {
  border-left: 4px solid #6b7280;
}

/* Universal Assistant */
.universal-assistant-trigger {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  z-index: 1000;
}

.assistant-chat {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.quick-actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

/* Mobile App Builder */
.mobile-app-builder {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
}

.phone-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.device-frame {
  width: 375px;
  height: 667px;
  border: 8px solid #1f2937;
  border-radius: 36px;
  background: white;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.device-frame.mobile {
  width: 375px;
  height: 667px;
}

.device-frame.tablet {
  width: 768px;
  height: 1024px;
}

/* Agent Marketplace */
.agent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.agent-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.agent-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.agent-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 16px;
}

.agent-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.tag {
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 12px;
  color: #6b7280;
}

.badge.new {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge.verified {
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.badge.featured {
  background: #f59e0b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
}
```

---

## 8. Implementation Priority Checklist

### Phase 1: Foundation (Week 1)
- [ ] Create base widget system (`BaseWidget.tsx`)
- [ ] Add Automation Studio tab to `DeveloperDashboardScreen.tsx`
- [ ] Create database tables (flows, rfqs, bids, pos, vendors)
- [ ] Implement basic API routes structure
- [ ] Add authentication & RBAC for automation features

### Phase 2: Procurement Module (Week 2-3) **HIGHEST PRIORITY**
- [ ] Build `ProcurementPipelineWidget` with 3-column layout
- [ ] Create RFQ creation form and card component
- [ ] Implement vendor management
- [ ] Build bid submission and review UI
- [ ] Add 3-bid enforcement logic
- [ ] Create PO generation from accepted bids
- [ ] Add approval workflow (dual-control)
- [ ] Build analytics dashboard (spend, lead time, vendor scores)

### Phase 3: Universal Assistant (Week 4) **SECOND PRIORITY**
- [ ] Implement Cmd+K command palette
- [ ] Build chat widget with AI integration
- [ ] Add function calling for actions (create RFQ, review bids, etc.)
- [ ] Implement contextual suggestions
- [ ] Add quick action buttons
- [ ] Integrate across all dashboard tabs

### Phase 4: Flow Builder (Week 5-6)
- [ ] Integrate React Flow library
- [ ] Create node type components (Trigger, Condition, Action, AI Tool)
- [ ] Build node palette with drag-drop
- [ ] Implement canvas with zoom/pan controls
- [ ] Add node configuration panel
- [ ] Build AI-powered flow generation
- [ ] Implement flow execution engine
- [ ] Add testing sandbox with mock data

### Phase 5: Mobile App Builder (Week 7-8)
- [ ] Create screen composer UI
- [ ] Build component palette (List, Form, Button, Card, Chart)
- [ ] Implement drag-drop screen builder
- [ ] Add phone preview with device frames
- [ ] Build properties panel for components
- [ ] Implement data binding to flows/APIs
- [ ] Add PWA generation
- [ ] Create QR code distribution

### Phase 6: Agent Marketplace (Week 9)
- [ ] Build agent packaging system
- [ ] Create marketplace UI with grid layout
- [ ] Implement install/uninstall flows
- [ ] Add agent configuration panel
- [ ] Build discovery with search/filters
- [ ] Add ratings and reviews
- [ ] Implement versioning system
- [ ] Create developer publishing flow

### Phase 7: Polish & Launch (Week 10)
- [ ] Add loading states and error handling
- [ ] Implement real-time updates (WebSocket)
- [ ] Add notifications for workflow events
- [ ] Build comprehensive analytics
- [ ] Create user documentation
- [ ] Add onboarding tour
- [ ] Performance optimization
- [ ] Security audit
- [ ] Launch to production! 🚀

---

## 9. Key Features Summary

### ✅ What This Delivers

1. **Zero-Code Automation**
   - Visual flow builder with drag-drop nodes
   - AI-powered flow generation from natural language
   - Pre-built templates for common workflows
   - Testing sandbox with mock data
   - Versioning and rollback

2. **Procurement Automation** (PRIORITY)
   - RFQ creation and distribution
   - Vendor management with scoring
   - Bid collection and comparison
   - 3-bid enforcement for compliance
   - PO generation with approval flows
   - Delivery tracking
   - Spend analytics

3. **Universal AI Assistant** (PRIORITY)
   - Cmd+K command palette
   - Natural language commands
   - Function calling to all platform APIs
   - Contextual suggestions
   - Multi-turn conversations
   - Policy guardrails

4. **No-Code Mobile Apps**
   - Visual screen composer
   - Component library (Lists, Forms, Charts, Maps)
   - PWA generation
   - Offline-first with sync
   - QR code distribution
   - Role-based menus

5. **Agent Marketplace**
   - Installable widgets/modules
   - Semantic versioning
   - Permission system
   - Discovery with ratings
   - Safe upgrades
   - Developer publishing

---

## 10. Technical Stack

### Frontend Dependencies (Add to package.json)
```json
{
  "dependencies": {
    "reactflow": "^11.10.0",
    "lucide-react": "^0.300.0",
    "@dnd-kit/core": "^6.0.8",
    "@dnd-kit/sortable": "^7.0.2",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^2.30.0"
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "node-cron": "^3.0.2",
    "ioredis": "^5.3.2",
    "bull": "^4.11.5"
  }
}
```

---

## 11. Next Steps

1. **Review & Approve** this specification
2. **Create Phase 1 tasks** in todo list
3. **Begin implementation** with base widget system
4. **Iterate weekly** with user feedback

---

**Total Estimated Timeline**: 10 weeks  
**Team Size**: 2-3 developers  
**Lines of Code**: ~15,000-20,000  

This modular approach allows incremental delivery - each widget can be developed, tested, and deployed independently! 🚀
