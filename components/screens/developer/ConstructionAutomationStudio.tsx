import React, { useMemo, useState } from 'react';
import {
    Play,
    StopCircle,
    RefreshCw,
    Activity,
    Terminal,
    Cpu,
    Database,
    Cloud,
    Zap,
    GitBranch,
    Shield,
    Layers,
    Globe,
    Rocket,
    Settings,
    Server,
    Tool,
    BarChart3,
    ClipboardList,
    Puzzle,
    FileCode,
    Box,
    Workflow,
    Plug,
    TestTube,
    Share2,
    Bot
} from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '../../../types';

interface ConstructionAutomationStudioProps {
    currentUser: User;
}

type EnvironmentStatus = 'running' | 'stopped' | 'provisioning';

type ConsoleLogType = 'command' | 'info' | 'success' | 'error';

interface VirtualEnvironment {
    id: string;
    name: string;
    type: string;
    status: EnvironmentStatus;
    cpuUsage: number;
    memoryUsage: number;
    automations: number;
    connectors: string[];
    lastDeployed: string;
    region: string;
}

interface AutomationWorkflow {
    id: string;
    name: string;
    description: string;
    status: 'running' | 'paused' | 'draft';
    successRate: number;
    lastRun: string;
    environmentId: string;
    trigger: string;
    procoreObjects: string[];
    actions: string[];
}

interface MarketplaceApp {
    id: string;
    name: string;
    category: string;
    summary: string;
    author: string;
    compatibility: string[];
    rating: number;
    installs: number;
}

interface ConsoleLog {
    id: string;
    type: ConsoleLogType;
    message: string;
    timestamp: string;
}

interface WorkspaceTemplate {
    id: string;
    name: string;
    description: string;
    stack: string[];
    services: string[];
    readyIn: string;
    estimatedCost: string;
}

type WorkspaceStatus = 'provisioning' | 'ready' | 'hibernated';

interface WorkspaceInstance {
    id: string;
    name: string;
    templateId: string;
    status: WorkspaceStatus;
    region: string;
    url: string;
    created: string;
    services: string[];
}

interface PipelineRun {
    id: string;
    name: string;
    status: 'passed' | 'running' | 'failed';
    lastRun: string;
    duration: string;
    checks: string[];
}

interface ConnectorSummary {
    id: string;
    name: string;
    type: 'Trigger' | 'Action' | 'Bidirectional';
    coverage: string;
    certification: 'Procore Certified' | 'Beta' | 'Internal';
    description: string;
}

interface AgentMonitor {
    id: string;
    name: string;
    owner: string;
    status: 'online' | 'sleeping' | 'degraded';
    lastEvent: string;
    uptimeHours: number;
}

interface WebhookRoute {
    id: string;
    name: string;
    events: string[];
    health: 'healthy' | 'warning' | 'paused';
    latencyMs: number;
}

const initialEnvironments: VirtualEnvironment[] = [
    {
        id: 'automation-core',
        name: 'Automation Core',
        type: 'n8n Orchestration',
        status: 'running',
        cpuUsage: 62,
        memoryUsage: 71,
        automations: 18,
        connectors: ['Procore RFIs', 'Procore Observations', 'Teams Notifications'],
        lastDeployed: '5 minutes ago',
        region: 'us-central'
    },
    {
        id: 'field-sync',
        name: 'Field Sync Runtime',
        type: 'Edge Automation Cluster',
        status: 'running',
        cpuUsage: 38,
        memoryUsage: 44,
        automations: 9,
        connectors: ['Procore Daily Logs', 'Trimble Connect', 'Email Digest'],
        lastDeployed: '42 minutes ago',
        region: 'us-west'
    },
    {
        id: 'design-review',
        name: 'Design Review QA',
        type: 'Isolated Sandbox',
        status: 'stopped',
        cpuUsage: 0,
        memoryUsage: 0,
        automations: 4,
        connectors: ['Procore Submittals', 'SharePoint Plans'],
        lastDeployed: '2 days ago',
        region: 'eu-central'
    }
];

const automationWorkflows: AutomationWorkflow[] = [
    {
        id: 'rfi-safety',
        name: 'RFI Safety Escalation',
        description: 'Monitors high-risk RFIs, runs AI review, and escalates to safety managers with mitigation tasks.',
        status: 'running',
        successRate: 99,
        lastRun: '3 minutes ago',
        environmentId: 'automation-core',
        trigger: 'Procore RFI created with risk score > 70',
        procoreObjects: ['RFIs', 'Observations', 'Daily Logs'],
        actions: ['AI classification & risk scoring', 'Generate mitigation tasks', 'Notify safety manager on Teams']
    },
    {
        id: 'submittal-fastlane',
        name: 'Submittal Fastlane',
        description: 'Routes design submittals through AI-driven spec comparison and pushes updates to VDC teams.',
        status: 'running',
        successRate: 96,
        lastRun: '12 minutes ago',
        environmentId: 'field-sync',
        trigger: 'Procore Submittal status changes to “For Review”',
        procoreObjects: ['Submittals', 'Documents'],
        actions: ['Compare against master spec', 'Sync delta report to Trimble', 'Notify discipline leads']
    },
    {
        id: 'closeout-metrics',
        name: 'Closeout Metrics Board',
        description: 'Aggregates punch, inspections, and cost data into a live PowerBI dashboard every hour.',
        status: 'paused',
        successRate: 93,
        lastRun: '1 hour ago',
        environmentId: 'design-review',
        trigger: 'Hourly timer',
        procoreObjects: ['Punch Items', 'Inspections', 'Budget'],
        actions: ['Extract and normalize datasets', 'Publish dataset to warehouse', 'Refresh PowerBI semantic model']
    }
];

const marketplaceApps: MarketplaceApp[] = [
    {
        id: 'prefab-kit',
        name: 'Prefab Progress Kit',
        category: 'Field Automation',
        summary: 'Syncs prefab milestones from the shop floor into Procore tasks with QA checklists.',
        author: 'ForgeLab Studios',
        compatibility: ['Automation Core', 'Field Sync'],
        rating: 4.8,
        installs: 412
    },
    {
        id: 'ai-safety-copilot',
        name: 'AI Safety Co-Pilot',
        category: 'AI Assistants',
        summary: 'Guided incident analysis, auto-generated toolbox talks, and predictive risk monitoring.',
        author: 'CortexBuild Labs',
        compatibility: ['Automation Core'],
        rating: 4.9,
        installs: 268
    },
    {
        id: 'cost-forecast',
        name: 'Cost Forecast Guardian',
        category: 'Financial Intelligence',
        summary: 'Automates cost-to-complete forecasting and syncs deltas into ERPs.',
        author: 'Northbeam Digital',
        compatibility: ['Automation Core', 'Design Review QA'],
        rating: 4.7,
        installs: 196
    }
];

const workspaceTemplates: WorkspaceTemplate[] = [
    {
        id: 'procore-automation-stack',
        name: 'Procore Automation Stack',
        description: 'Full-stack environment with Procore sandbox, Supabase, and automation SDK.',
        stack: ['Node 20', 'Python 3.11', 'Temporal Workers'],
        services: ['Supabase Sandbox', 'Redis Stream', 'Vault Dev'],
        readyIn: '92 seconds',
        estimatedCost: '$0.42 / hr'
    },
    {
        id: 'field-edge-cluster',
        name: 'Field Edge Cluster',
        description: 'Edge-optimized runtime for jobsite devices and offline workflows.',
        stack: ['Node 18', 'Rust Workers'],
        services: ['NATS Jetstream', 'Edge Cache', 'AI Vision Runtime'],
        readyIn: '2 minutes',
        estimatedCost: '$0.28 / hr'
    },
    {
        id: 'marketplace-sandbox',
        name: 'Marketplace Release Sandbox',
        description: 'Isolated QA environment for marketplace submissions and regression tests.',
        stack: ['Node 20', 'Playwright', 'Vitest'],
        services: ['Supabase QA', 'Mock Procore', 'Stripe Test'],
        readyIn: '75 seconds',
        estimatedCost: '$0.19 / hr'
    }
];

const initialWorkspaceInstances: WorkspaceInstance[] = [
    {
        id: 'ws-101',
        name: 'Automation Core Dev',
        templateId: 'procore-automation-stack',
        status: 'ready',
        region: 'us-central',
        url: 'https://dev-shell.cortexbuild.dev/ws-101',
        created: '12 minutes ago',
        services: ['Supabase Sandbox', 'Redis Stream', 'Vault Dev']
    },
    {
        id: 'ws-202',
        name: 'Marketplace QA',
        templateId: 'marketplace-sandbox',
        status: 'hibernated',
        region: 'us-west',
        url: 'https://qa.cortexbuild.dev/ws-202',
        created: '1 hour ago',
        services: ['Supabase QA', 'Mock Procore', 'Stripe Test']
    }
];

const initialPipelineRuns: PipelineRun[] = [
    {
        id: 'pipe-1',
        name: 'RFI Safety Escalation',
        status: 'passed',
        lastRun: '7 minutes ago',
        duration: '3m 24s',
        checks: ['Unit Tests', 'n8n Flow Simulation', 'Security Scan', 'Procore Sandbox Replay']
    },
    {
        id: 'pipe-2',
        name: 'AI Safety Co-Pilot',
        status: 'running',
        lastRun: 'in progress',
        duration: '—',
        checks: ['Smoke Tests', 'Marketplace QA', 'Contract Review']
    },
    {
        id: 'pipe-3',
        name: 'Cost Forecast Guardian',
        status: 'failed',
        lastRun: '25 minutes ago',
        duration: '5m 11s',
        checks: ['Unit Tests', 'ERP Contract Test', 'Performance Budget']
    }
];

const connectorLibrary: ConnectorSummary[] = [
    {
        id: 'procore-rfis',
        name: 'Procore RFIs',
        type: 'Bidirectional',
        coverage: 'RFIs, Custom Fields, Attachments',
        certification: 'Procore Certified',
        description: 'Sync RFI events, update status, and attach AI-reviewed documents automatically.'
    },
    {
        id: 'autodesk-acc',
        name: 'Autodesk ACC',
        type: 'Action',
        coverage: 'Docs, Issues, Reviews',
        certification: 'Beta',
        description: 'Push curated documents and comments to Autodesk Construction Cloud projects.'
    },
    {
        id: 'slack-events',
        name: 'Slack Events',
        type: 'Trigger',
        coverage: 'Channels, Threads',
        certification: 'Internal',
        description: 'React to keywords or slash commands and feed updates to field teams instantly.'
    },
    {
        id: 'sap-erp',
        name: 'SAP ERP',
        type: 'Action',
        coverage: 'Cost Codes, Forecasts',
        certification: 'Procore Certified',
        description: 'Publish managed cost forecasts downstream to accounting systems with approvals.'
    }
];

const initialAgentRuntimes: AgentMonitor[] = [
    {
        id: 'agent-1',
        name: 'Site Safety Copilot',
        owner: 'Safety Innovation',
        status: 'online',
        lastEvent: 'Responded to incident INC-482 in 2.1s',
        uptimeHours: 137
    },
    {
        id: 'agent-2',
        name: 'Design Spec Reviewer',
        owner: 'VDC Ops',
        status: 'sleeping',
        lastEvent: 'Awaiting new submittal in queue',
        uptimeHours: 89
    },
    {
        id: 'agent-3',
        name: 'Prefabrication Optimizer',
        owner: 'Manufacturing Integration',
        status: 'degraded',
        lastEvent: 'Warning: sensor feed latency exceeds SLA',
        uptimeHours: 212
    }
];

const initialWebhookRoutes: WebhookRoute[] = [
    {
        id: 'webhook-1',
        name: 'Procore Daily Log Capture',
        events: ['daily_log.created', 'daily_log.updated'],
        health: 'healthy',
        latencyMs: 184
    },
    {
        id: 'webhook-2',
        name: 'ERP Cost Delta Broadcast',
        events: ['forecast.updated'],
        health: 'warning',
        latencyMs: 652
    },
    {
        id: 'webhook-3',
        name: 'Marketplace Telemetry Collector',
        events: ['automation.deployed', 'automation.failed'],
        health: 'healthy',
        latencyMs: 97
    }
];

const consolePresetLogs: ConsoleLog[] = [
    {
        id: 'log-1',
        type: 'info',
        message: '[automation-core] Runtime healthy, 18 workflows deployed.',
        timestamp: '09:14:03'
    },
    {
        id: 'log-2',
        type: 'success',
        message: '[rfi-safety] Completed execution in 2.8s (response: mitigations generated).',
        timestamp: '09:14:15'
    },
    {
        id: 'log-3',
        type: 'info',
        message: '[submittal-fastlane] Trigger queued by Submittal #SF-1024.',
        timestamp: '09:15:02'
    }
];

const logStyles: Record<ConsoleLogType, string> = {
    command: 'text-blue-300',
    info: 'text-slate-300',
    success: 'text-emerald-400',
    error: 'text-rose-400'
};

const ConstructionAutomationStudio: React.FC<ConstructionAutomationStudioProps> = ({ currentUser }) => {
    const [environments, setEnvironments] = useState<VirtualEnvironment[]>(initialEnvironments);
    const [activeEnvId, setActiveEnvId] = useState<string>('automation-core');
    const [logs, setLogs] = useState<ConsoleLog[]>(consolePresetLogs);
    const [command, setCommand] = useState('deploy automation-core --with-blueprint rfi-safety');
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('rfi-safety');
    const [workspaceInstances, setWorkspaceInstances] = useState<WorkspaceInstance[]>(initialWorkspaceInstances);
    const [pipelines, setPipelines] = useState<PipelineRun[]>(initialPipelineRuns);
    const [agents, setAgents] = useState<AgentMonitor[]>(initialAgentRuntimes);
    const [webhooks, setWebhooks] = useState<WebhookRoute[]>(initialWebhookRoutes);

    const handleSelectWorkflow = (workflowId: string) => {
        const workflow = automationWorkflows.find((item) => item.id === workflowId);
        if (!workflow) {
            return;
        }
        setSelectedWorkflowId(workflowId);
        setActiveEnvId(workflow.environmentId);
    };

    const activeEnvironment = useMemo(
        () => environments.find((env) => env.id === activeEnvId) ?? environments[0],
        [environments, activeEnvId]
    );

    const selectedWorkflow = useMemo(
        () => automationWorkflows.find((workflow) => workflow.id === selectedWorkflowId) ?? automationWorkflows[0],
        [selectedWorkflowId]
    );

    const selectedWorkflowEnvironment = useMemo(
        () =>
            selectedWorkflow
                ? environments.find((environment) => environment.id === selectedWorkflow.environmentId) ?? undefined
                : undefined,
        [environments, selectedWorkflow]
    );

    const environmentForConsole = useMemo(() => {
        if (selectedWorkflowEnvironment && selectedWorkflow?.environmentId === activeEnvId) {
            return selectedWorkflowEnvironment;
        }

        return activeEnvironment;
    }, [selectedWorkflowEnvironment, selectedWorkflow, activeEnvironment, activeEnvId]);

    const totals = useMemo(() => {
        const runningAutomations = automationWorkflows.filter((workflow) => workflow.status === 'running').length;
        const totalConnectors = environments.reduce((sum, env) => sum + env.connectors.length, 0);
        const averageSuccessRate = Math.round(
            automationWorkflows.reduce((sum, workflow) => sum + workflow.successRate, 0) / automationWorkflows.length
        );
        const activeWorkspaces = workspaceInstances.filter((workspace) => workspace.status === 'ready').length;
        return { runningAutomations, totalConnectors, averageSuccessRate, activeWorkspaces };
    }, [environments, workspaceInstances]);

    const addLog = (type: ConsoleLogType, message: string) => {
        setLogs((previous) => [
            ...previous.slice(-199),
            {
                id: `log-${Date.now()}`,
                type,
                message,
                timestamp: new Date().toLocaleTimeString()
            }
        ]);
    };

    const updateEnvironmentStatus = (environmentId: string, status: EnvironmentStatus, cpuUsage?: number, memoryUsage?: number) => {
        setEnvironments((prev) =>
            prev.map((environment) =>
                environment.id === environmentId
                    ? {
                        ...environment,
                        status,
                        cpuUsage: cpuUsage ?? environment.cpuUsage,
                        memoryUsage: memoryUsage ?? environment.memoryUsage
                    }
                    : environment
            )
        );
    };

    const updateWorkspaceStatus = (workspaceId: string, status: WorkspaceStatus, overrides: Partial<WorkspaceInstance> = {}) => {
        setWorkspaceInstances((previous) =>
            previous.map((workspace) =>
                workspace.id === workspaceId
                    ? {
                        ...workspace,
                        status,
                        ...overrides
                    }
                    : workspace
            )
        );
    };

    const handleEnvironmentAction = (environmentId: string, action: 'start' | 'stop' | 'restart') => {
        const environment = environments.find((env) => env.id === environmentId);
        if (!environment) {
            return;
        }

        if (action === 'stop' && environment.status === 'stopped') {
            toast('Environment already stopped');
            return;
        }

        if (action === 'start' && environment.status === 'running') {
            toast('Environment already running');
            return;
        }

        const actionLabel = action === 'restart' ? 'Restarting' : action === 'stop' ? 'Stopping' : 'Starting';
        addLog('info', `[${environment.name}] ${actionLabel.toLowerCase()} environment...`);
        updateEnvironmentStatus(environmentId, 'provisioning', environment.cpuUsage, environment.memoryUsage);

        setTimeout(() => {
            if (action === 'stop') {
                updateEnvironmentStatus(environmentId, 'stopped', 0, 0);
                addLog('success', `[${environment.name}] Environment shut down cleanly.`);
                toast.success(`${environment.name} stopped`);
            } else {
                updateEnvironmentStatus(environmentId, 'running', environment.cpuUsage || 45, environment.memoryUsage || 52);
                addLog('success', `[${environment.name}] Environment ready. Pipelines synced.`);
                toast.success(`${environment.name} ready`);
            }
        }, 950);
    };

    const handleExecuteCommand = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!command.trim()) {
            return;
        }
        const trimmed = command.trim();
        addLog('command', `$ ${trimmed}`);

        if (trimmed.includes('deploy') && trimmed.includes('automation-core')) {
            addLog('info', '[automation-core] Validating Procore credentials...');
            setTimeout(() => {
                addLog('success', '[automation-core] Deployment completed. Version 1.7.3 promoted to production.');
            }, 600);
        } else if (trimmed.startsWith('test workflow')) {
            addLog('info', `[${selectedWorkflow.name}] Running test execution in sandbox...`);
            setTimeout(() => addLog('success', `[${selectedWorkflow.name}] Test succeeded in 3.1s.`), 700);
        } else if (trimmed.startsWith('logs')) {
            addLog('info', `[${activeEnvironment.name}] Streaming last 20 log lines...`);
        } else {
            addLog('info', `Command '${trimmed}' acknowledged.`);
        }

        setCommand('');
    };

    const handleProvisionWorkspace = (template: WorkspaceTemplate) => {
        const workspaceId = `ws-${Date.now().toString().slice(-4)}`;
        addLog('command', `$ workspace create ${template.id}`);
        addLog('info', `[workspace ${workspaceId}] Provisioning ${template.name}...`);
        const newWorkspace: WorkspaceInstance = {
            id: workspaceId,
            name: `${template.name.split(' ')[0]} Workspace`,
            templateId: template.id,
            status: 'provisioning',
            region: activeEnvironment?.region ?? 'us-central',
            url: `https://dev.cortexbuild.dev/${workspaceId}`,
            created: 'just now',
            services: template.services
        };
        setWorkspaceInstances((previous) => [newWorkspace, ...previous]);
        toast.loading(`Provisioning ${template.name}`, { id: workspaceId });
        setTimeout(() => {
            updateWorkspaceStatus(workspaceId, 'ready', { created: 'a moment ago' });
            toast.success(`${template.name} workspace ready`, { id: workspaceId });
            addLog('success', `[workspace ${workspaceId}] Environment ready. IDE & runtimes online.`);
        }, 1400);
    };

    const handleWorkspaceAction = (workspaceId: string, action: 'resume' | 'hibernate') => {
        const workspace = workspaceInstances.find((instance) => instance.id === workspaceId);
        if (!workspace) {
            return;
        }

        if (action === 'hibernate') {
            if (workspace.status === 'hibernated') {
                toast(`Workspace already hibernated`);
                return;
            }
            addLog('info', `[${workspace.name}] Hibernating workspace services...`);
            updateWorkspaceStatus(workspaceId, 'hibernated');
            toast.success(`${workspace.name} hibernated`);
            return;
        }

        addLog('info', `[${workspace.name}] Resuming workspace...`);
        updateWorkspaceStatus(workspaceId, 'provisioning');
        toast.loading(`Resuming ${workspace.name}`, { id: workspaceId });
        setTimeout(() => {
            updateWorkspaceStatus(workspaceId, 'ready', { created: 'just restarted' });
            toast.success(`${workspace.name} resumed`, { id: workspaceId });
            addLog('success', `[${workspace.name}] Workspace health restored.`);
        }, 1200);
    };

    const handleRunPipeline = (pipelineId: string) => {
        const pipeline = pipelines.find((item) => item.id === pipelineId);
        if (!pipeline) {
            return;
        }
        addLog('info', `[pipeline] Running ${pipeline.name} release checks...`);
        setPipelines((previous) =>
            previous.map((item) =>
                item.id === pipelineId
                    ? {
                        ...item,
                        status: 'running',
                        lastRun: 'in progress',
                        duration: '—'
                    }
                    : item
            )
        );
        setTimeout(() => {
            const succeeded = pipeline.status !== 'failed';
            setPipelines((previous) =>
                previous.map((item) =>
                    item.id === pipelineId
                        ? {
                            ...item,
                            status: succeeded ? 'passed' : 'failed',
                            lastRun: succeeded ? 'just now' : '2 mins ago',
                            duration: succeeded ? '4m 02s' : '5m 11s'
                        }
                        : item
                )
            );
            addLog(succeeded ? 'success' : 'error', `[pipeline] ${pipeline.name} ${succeeded ? 'passed' : 'failed'} checks.`);
            toast[succeeded ? 'success' : 'error'](`${pipeline.name} ${succeeded ? 'passed' : 'failed'}`);
        }, 1400);
    };

    const handleRestartAgent = (agentId: string) => {
        const agent = agents.find((item) => item.id === agentId);
        if (!agent) {
            return;
        }
        addLog('info', `[agent] Restarting ${agent.name} runtime...`);
        setAgents((previous) =>
            previous.map((item) =>
                item.id === agentId
                    ? {
                        ...item,
                        status: 'online',
                        uptimeHours: 0,
                        lastEvent: 'Agent runtime restarted cleanly'
                    }
                    : item
            )
        );
        toast.success(`${agent.name} restarted`);
    };

    const handleResetWebhook = (webhookId: string) => {
        const route = webhooks.find((item) => item.id === webhookId);
        if (!route) {
            return;
        }
        addLog('info', `[webhook] Resetting delivery buffer for ${route.name}...`);
        setWebhooks((previous) =>
            previous.map((item) =>
                item.id === webhookId
                    ? {
                        ...item,
                        health: 'healthy',
                        latencyMs: Math.max(120, Math.round(item.latencyMs * 0.6))
                    }
                    : item
            )
        );
        toast.success(`${route.name} normalized`);
    };

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Construction Automation Studio</h1>
                        <p className="text-sm text-slate-600">
                            A unified Procore-integrated automation environment blending n8n-style orchestration with developer-grade tooling.
                            Manage virtual runtimes, build flows, test with live consoles, and publish to the construction marketplace.
                        </p>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Signed in as</p>
                        <p className="text-sm font-medium text-blue-900">{currentUser.name}</p>
                        <p className="text-xs text-blue-700">Developer tenant access</p>
                    </div>
                </div>
            </header>

            <section className="grid gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Active Automations</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-900">{totals.runningAutomations}</p>
                        </div>
                        <Zap className="h-6 w-6 text-amber-500" />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Across {environments.length} runtimes</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Connector Coverage</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-900">{totals.totalConnectors}</p>
                        </div>
                        <Layers className="h-6 w-6 text-indigo-500" />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Procore + partner integrations</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Success Rate</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-900">{totals.averageSuccessRate}%</p>
                        </div>
                        <Activity className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Past 24h execution metrics</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Active Workspaces</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-900">{totals.activeWorkspaces}</p>
                        </div>
                        <Box className="h-6 w-6 text-sky-500" />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Dev shells with live consoles</p>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Virtual Environments</h2>
                                <p className="text-xs text-slate-500">Provision and monitor isolated automation runtimes.</p>
                            </div>
                            <Server className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="mt-4 space-y-3">
                            {environments.map((environment) => (
                                <button
                                    key={environment.id}
                                    type="button"
                                    onClick={() => setActiveEnvId(environment.id)}
                                    className={`w-full rounded-xl border p-4 text-left transition-shadow ${activeEnvId === environment.id
                                        ? 'border-blue-400 bg-blue-50 shadow'
                                        : 'border-slate-200 hover:border-blue-200 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{environment.name}</p>
                                            <p className="text-xs text-slate-500">{environment.type}</p>
                                        </div>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${environment.status === 'running'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : environment.status === 'stopped'
                                                    ? 'bg-slate-200 text-slate-600'
                                                    : 'bg-amber-100 text-amber-700'
                                                }`}
                                        >
                                            {environment.status === 'running' ? 'Running' : environment.status === 'stopped' ? 'Stopped' : 'Provisioning'}
                                        </span>
                                    </div>
                                    <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                                        <div className="rounded-lg bg-white/70 p-2">
                                            <p className="text-[10px] uppercase text-slate-500">CPU</p>
                                            <p className="text-sm font-semibold text-slate-900">{environment.cpuUsage}%</p>
                                        </div>
                                        <div className="rounded-lg bg-white/70 p-2">
                                            <p className="text-[10px] uppercase text-slate-500">Memory</p>
                                            <p className="text-sm font-semibold text-slate-900">{environment.memoryUsage}%</p>
                                        </div>
                                        <div className="rounded-lg bg-white/70 p-2">
                                            <p className="text-[10px] uppercase text-slate-500">Automations</p>
                                            <p className="text-sm font-semibold text-slate-900">{environment.automations}</p>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-[11px] text-slate-500">Last deployed {environment.lastDeployed} • {environment.region}</p>
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-2">
                            <button
                                type="button"
                                onClick={() => handleEnvironmentAction(activeEnvironment.id, 'start')}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500"
                            >
                                <Play className="h-4 w-4" /> Start
                            </button>
                            <button
                                type="button"
                                onClick={() => handleEnvironmentAction(activeEnvironment.id, 'stop')}
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                            >
                                <StopCircle className="h-4 w-4" /> Stop
                            </button>
                            <button
                                type="button"
                                onClick={() => handleEnvironmentAction(activeEnvironment.id, 'restart')}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500"
                            >
                                <RefreshCw className="h-4 w-4" /> Restart
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Procore Connector Health</h3>
                                <p className="text-xs text-slate-500">Automated checks across submittals, RFIs, and daily logs.</p>
                            </div>
                            <Shield className="h-5 w-5 text-emerald-500" />
                        </div>
                        <dl className="mt-4 space-y-3 text-sm">
                            {environmentForConsole.connectors.map((connector) => (
                                <div key={connector} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <ClipboardList className="h-4 w-4 text-slate-500" />
                                        <span className="font-medium text-slate-800">{connector}</span>
                                    </div>
                                    <span className="text-xs font-medium text-emerald-600">Healthy</span>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>

                <div className="xl:col-span-2 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-black p-4 shadow-inner">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-100">
                                <Terminal className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wide text-slate-400">Automation Console</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                <span className="inline-flex items-center gap-1"><Cpu className="h-3 w-3" /> {environmentForConsole.cpuUsage}%</span>
                                <span className="inline-flex items-center gap-1"><Database className="h-3 w-3" /> {environmentForConsole.memoryUsage}%</span>
                                <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" /> {environmentForConsole.region}</span>
                            </div>
                        </div>
                        <div className="mt-4 h-56 overflow-y-auto rounded-lg bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-100">
                            {logs.map((log) => (
                                <div key={log.id} className={logStyles[log.type]}>
                                    <span className="mr-2 text-slate-500">[{log.timestamp}]</span>
                                    <span>{log.message}</span>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleExecuteCommand} className="mt-3 flex items-center gap-2">
                            <span className="text-slate-400">$</span>
                            <input
                                value={command}
                                onChange={(event) => setCommand(event.target.value)}
                                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                                placeholder="Type a command (deploy, test workflow, logs, workspace create)"
                            />
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                            >
                                <Play className="h-4 w-4" /> Run
                            </button>
                        </form>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Deployment Insights</h3>
                                <p className="text-xs text-slate-500">Automated tests, AI code reviews, and promotion checks.</p>
                            </div>
                            <BarChart3 className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <p className="text-[11px] uppercase text-slate-500">Automated Checks</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">128</p>
                                <p className="text-[11px] text-slate-500">24h pipeline validations</p>
                            </div>
                            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <p className="text-[11px] uppercase text-slate-500">AI Fix Suggestions</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">12</p>
                                <p className="text-[11px] text-slate-500">Ready for review</p>
                            </div>
                            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <p className="text-[11px] uppercase text-slate-500">Release Confidence</p>
                                <p className="mt-1 text-lg font-semibold text-emerald-600">98%</p>
                                <p className="text-[11px] text-slate-500">Automated scoring</p>
                            </div>
                        </div>
                        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                            Latest: Automation Core promoted after 44 integration tests, 12 blueprint regressions, and 3 live Procore sandbox validations.
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Workflow Orchestrator</h3>
                            <p className="text-xs text-slate-500">Drag, connect, and deploy flows just like n8n—prewired for Procore data models.</p>
                        </div>
                        <Settings className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {automationWorkflows.map((workflow) => (
                            <button
                                key={workflow.id}
                                type="button"
                                onClick={() => handleSelectWorkflow(workflow.id)}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${selectedWorkflowId === workflow.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-200'
                                    }`}
                            >
                                {workflow.name}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-4">
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                            <p className="text-[11px] uppercase text-slate-500">Trigger</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{selectedWorkflow.trigger}</p>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                            <p className="text-[11px] uppercase text-slate-500">Environment</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{selectedWorkflowEnvironment?.name ?? activeEnvironment.name}</p>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                            <p className="text-[11px] uppercase text-slate-500">Success Rate</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{selectedWorkflow.successRate}%</p>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                            <p className="text-[11px] uppercase text-slate-500">Last Run</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{selectedWorkflow.lastRun}</p>
                        </div>
                    </div>
                    <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Tool className="h-5 w-5 text-slate-500" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Automation Graph</p>
                                    <p className="text-xs text-slate-500">Visually inspect the nodes and runtime wiring.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                                onClick={() => toast.success('Workflow exported as blueprint.json')}
                            >
                                Export Blueprint
                            </button>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-4">
                            <div className="rounded-lg bg-white p-4 shadow-sm">
                                <p className="text-[11px] uppercase text-amber-500">Procore Trigger</p>
                                <p className="text-sm font-semibold text-slate-900">{selectedWorkflow.trigger}</p>
                            </div>
                            {selectedWorkflow.actions.map((action, index) => (
                                <div key={action} className="rounded-lg bg-white p-4 shadow-sm">
                                    <p className="text-[11px] uppercase text-slate-500">Step {index + 1}</p>
                                    <p className="text-sm font-semibold text-slate-900">{action}</p>
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-[11px] text-slate-500">
                            Connected Procore objects: {selectedWorkflow.procoreObjects.join(', ')}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Marketplace Publishing</h3>
                                <p className="text-xs text-slate-500">Package automations and launch them to CortexBuild partners.</p>
                            </div>
                            <Rocket className="h-5 w-5 text-purple-500" />
                        </div>
                        <ol className="mt-4 space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">1</span>
                                <div>
                                    <p className="font-medium text-slate-800">Blueprint Validation</p>
                                    <p className="text-xs text-slate-500">Automated QA runs on each Procore integration point.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">2</span>
                                <div>
                                    <p className="font-medium text-slate-800">Security & Compliance</p>
                                    <p className="text-xs text-slate-500">SOC 2 controls, secrets scanning, role coverage review.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">3</span>
                                <div>
                                    <p className="font-medium text-slate-800">Marketplace Launch</p>
                                    <p className="text-xs text-slate-500">Coordinate pricing, trials, and deployment targets.</p>
                                </div>
                            </li>
                        </ol>
                        <button
                            type="button"
                            onClick={() => toast.success('Marketplace submission queued for review')}
                            className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                        >
                            Submit New Automation Package
                        </button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="text-base font-semibold text-slate-900">Connected Data Sources</h3>
                        <div className="mt-3 space-y-3 text-sm">
                            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <Cloud className="h-4 w-4 text-slate-500" />
                                    <span className="font-medium text-slate-800">Procore Production</span>
                                </div>
                                <span className="text-xs font-semibold text-emerald-600">Live</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <GitBranch className="h-4 w-4 text-slate-500" />
                                    <span className="font-medium text-slate-800">Automation Git Repo</span>
                                </div>
                                <span className="text-xs font-semibold text-blue-600">Main @ 9b3c2f</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4 text-slate-500" />
                                    <span className="font-medium text-slate-800">Warehouse Lakehouse</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-600">Synced 6m ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Construction App Marketplace</h3>
                            <p className="text-xs text-slate-500">Discover installable automation packages purpose-built for field teams.</p>
                        </div>
                        <Globe className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        {marketplaceApps.map((app) => (
                            <div key={app.id} className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900">{app.name}</h4>
                                        <p className="text-[11px] uppercase text-slate-500">{app.category}</p>
                                    </div>
                                    <Shield className="h-4 w-4 text-emerald-500" />
                                </div>
                                <p className="mt-2 text-xs text-slate-600">{app.summary}</p>
                                <div className="mt-3 space-y-1 text-[11px] text-slate-500">
                                    <p>Author • {app.author}</p>
                                    <p>Compatibility • {app.compatibility.join(', ')}</p>
                                    <p>Rating • {app.rating.toFixed(1)} ⭐ ({app.installs} installs)</p>
                                </div>
                                <button
                                    type="button"
                                    className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                                    onClick={() => toast.success(`${app.name} added to developer tenant`)}
                                >
                                    <Puzzle className="h-4 w-4" /> Install Blueprint
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="text-base font-semibold text-slate-900">AI Co-Pilot Suggestions</h3>
                        <ul className="mt-3 space-y-3 text-xs text-slate-600">
                            <li className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <p className="font-medium text-slate-800">Add incident photo classifier</p>
                                <p>Use Gemini Vision to triage safety images before raising Procore observations.</p>
                            </li>
                            <li className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <p className="font-medium text-slate-800">Expose webhook for partner ERPs</p>
                                <p>Auto-provision secure tokens and deliver cost events downstream.</p>
                            </li>
                            <li className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <p className="font-medium text-slate-800">Bundle RFIs + Submittals</p>
                                <p>Create a marketplace collection for design coordination workflows.</p>
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="text-base font-semibold text-slate-900">Runtime Activity</h3>
                        <ul className="mt-3 space-y-2 text-xs text-slate-600">
                            <li className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                <span className="font-medium text-slate-700">RFIs processed</span>
                                <span className="text-emerald-600">+32 (1h)</span>
                            </li>
                            <li className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                <span className="font-medium text-slate-700">Webhooks delivered</span>
                                <span className="text-emerald-600">99.7% success</span>
                            </li>
                            <li className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                <span className="font-medium text-slate-700">Blueprint deploys</span>
                                <span className="text-slate-700">4 today</span>
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="text-base font-semibold text-slate-900">Compliance Checklist</h3>
                        <ul className="mt-3 space-y-2 text-xs text-slate-600">
                            <li className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-emerald-500" /> SOC 2 scope updated with automation endpoints
                            </li>
                            <li className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-emerald-500" /> Procore OAuth secrets rotated 4 hours ago
                            </li>
                            <li className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-emerald-500" /> Webhook retries configured with exponential backoff
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Workspace Templates</h3>
                            <p className="text-xs text-slate-500">Spin up isolated developer shells with all construction services prewired.</p>
                        </div>
                        <Box className="h-5 w-5 text-sky-500" />
                    </div>
                    <div className="mt-4 space-y-3">
                        {workspaceTemplates.map((template) => (
                            <div key={template.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900">{template.name}</h4>
                                        <p className="text-[11px] uppercase text-slate-500">{template.stack.join(' • ')}</p>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-600">{template.readyIn}</span>
                                </div>
                                <p className="mt-2 text-xs text-slate-600">{template.description}</p>
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {template.services.map((service) => (
                                        <span key={service} className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
                                            {service}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                                    <span>{template.estimatedCost}</span>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                                        onClick={() => handleProvisionWorkspace(template)}
                                    >
                                        <Rocket className="h-4 w-4" /> Provision
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Active Workspaces</h3>
                            <p className="text-xs text-slate-500">Open VS Code, automation runtimes, and tunnel URLs in one click.</p>
                        </div>
                        <Terminal className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="mt-4 space-y-3">
                        {workspaceInstances.map((workspace) => {
                            const template = workspaceTemplates.find((item) => item.id === workspace.templateId);
                            const badgeClasses =
                                workspace.status === 'ready'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : workspace.status === 'hibernated'
                                        ? 'bg-slate-200 text-slate-600'
                                        : 'bg-amber-100 text-amber-700';
                            return (
                                <div key={workspace.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{workspace.name}</p>
                                            <p className="text-[11px] text-slate-500">
                                                {template?.name ?? 'Custom Template'} • {workspace.region} • {workspace.created}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClasses}`}>
                                            {workspace.status === 'ready'
                                                ? 'Ready'
                                                : workspace.status === 'hibernated'
                                                    ? 'Hibernated'
                                                    : 'Provisioning'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-1 text-[11px] text-slate-600">
                                        {workspace.services.map((service) => (
                                            <span key={service} className="rounded-full bg-white px-2 py-1 shadow-sm">
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                                        <a
                                            href={workspace.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-500"
                                        >
                                            <Terminal className="h-3.5 w-3.5" /> Open shell
                                        </a>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleWorkspaceAction(workspace.id, 'hibernate')}
                                                disabled={workspace.status !== 'ready'}
                                                className="rounded-lg border border-slate-200 px-3 py-1 font-medium text-slate-700 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Hibernate
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleWorkspaceAction(workspace.id, 'resume')}
                                                disabled={workspace.status === 'ready' || workspace.status === 'provisioning'}
                                                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 font-medium text-blue-700 hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Resume
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Automation Release Pipeline</h3>
                            <p className="text-xs text-slate-500">n8n-style flow validations, AI code reviews, and marketplace gating.</p>
                        </div>
                        <Workflow className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="mt-4 space-y-3">
                        {pipelines.map((pipeline) => {
                            const statusClasses =
                                pipeline.status === 'passed'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : pipeline.status === 'running'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-rose-100 text-rose-700';
                            return (
                                <div key={pipeline.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{pipeline.name}</p>
                                            <p className="text-[11px] text-slate-500">
                                                {pipeline.lastRun === 'in progress' ? 'Running checks...' : `Last run ${pipeline.lastRun} • ${pipeline.duration}`}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusClasses}`}>
                                            {pipeline.status === 'passed'
                                                ? 'Passed'
                                                : pipeline.status === 'running'
                                                    ? 'Running'
                                                    : 'Failed'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-1 text-[11px] text-slate-600">
                                        {pipeline.checks.map((check) => (
                                            <span key={check} className="rounded-full bg-white px-2 py-1 shadow-sm">
                                                <TestTube className="mr-1 inline h-3 w-3 text-amber-500" />
                                                {check}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex items-center justify-end">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:border-emerald-300"
                                            onClick={() => handleRunPipeline(pipeline.id)}
                                        >
                                            <Play className="h-4 w-4" /> Run checks
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Connector Library</h3>
                            <p className="text-xs text-slate-500">Production-ready Procore + partner integrations.</p>
                        </div>
                        <Plug className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="mt-4 space-y-3">
                        {connectorLibrary.map((connector) => (
                            <div key={connector.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900">{connector.name}</h4>
                                        <p className="text-[11px] uppercase text-slate-500">{connector.type}</p>
                                    </div>
                                    <span className="text-[11px] font-semibold text-emerald-600">{connector.certification}</span>
                                </div>
                                <p className="mt-2 text-xs text-slate-600">{connector.description}</p>
                                <p className="mt-3 text-[11px] text-slate-500">Coverage • {connector.coverage}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Agent Operations Center</h3>
                            <p className="text-xs text-slate-500">Manage AI co-pilots, n8n nodes, and runtime uptime guarantees.</p>
                        </div>
                        <Bot className="h-5 w-5 text-violet-500" />
                    </div>
                    <div className="mt-4 space-y-3">
                        {agents.map((agent) => {
                            const statusClasses =
                                agent.status === 'online'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : agent.status === 'sleeping'
                                        ? 'bg-slate-200 text-slate-600'
                                        : 'bg-rose-100 text-rose-700';
                            return (
                                <div key={agent.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                                            <p className="text-[11px] text-slate-500">{agent.owner}</p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusClasses}`}>
                                            {agent.status === 'online' ? 'Online' : agent.status === 'sleeping' ? 'Sleeping' : 'Degraded'}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-600">{agent.lastEvent}</p>
                                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                                        <span>Uptime • {agent.uptimeHours}h</span>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:border-violet-300"
                                            onClick={() => handleRestartAgent(agent.id)}
                                        >
                                            <RefreshCw className="h-4 w-4" /> Restart
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Webhook Delivery Health</h3>
                            <p className="text-xs text-slate-500">Track Procore + ERP event fan-out latency and retries.</p>
                        </div>
                        <Share2 className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="mt-4 space-y-3">
                        {webhooks.map((route) => {
                            const badgeClasses =
                                route.health === 'healthy'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : route.health === 'warning'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-slate-200 text-slate-600';
                            return (
                                <div key={route.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{route.name}</p>
                                            <p className="text-[11px] text-slate-500">{route.events.join(', ')}</p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClasses}`}>
                                            {route.health === 'healthy' ? 'Healthy' : route.health === 'warning' ? 'Warning' : 'Paused'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                                        <span>p95 latency • {route.latencyMs}ms</span>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:border-amber-300"
                                            onClick={() => handleResetWebhook(route.id)}
                                        >
                                            <RefreshCw className="h-4 w-4" /> Normalize
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Launch Checklist</h3>
                        <p className="text-xs text-slate-500">Everything required to promote automation suites into production tenants.</p>
                    </div>
                    <FileCode className="h-5 w-5 text-slate-500" />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                        <p className="text-[11px] uppercase text-slate-500">Blueprint Docs</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">Auto-generated with API schema references.</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                        <p className="text-[11px] uppercase text-slate-500">Field Testing</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">Live pilot feedback captured from site crews.</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                        <p className="text-[11px] uppercase text-slate-500">Change Management</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">Release notes synced into training hub.</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                        <p className="text-[11px] uppercase text-slate-500">Go-Live Automation</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">Sequenced deployment tasks triggered by approval.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ConstructionAutomationStudio;
