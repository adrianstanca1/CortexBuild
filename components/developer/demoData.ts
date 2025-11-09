export interface DemoWorkflowPreset {
  id: string;
  name: string;
  summary: string;
  command: string;
  category: string;
  steps: string[];
  payload: Record<string, unknown>;
  resultSummary: string;
}

export interface DemoSdkAppPreset {
  id: string;
  name: string;
  description: string;
  command: string;
  icon: string;
  category: string;
  color: string;
  logs: string[];
}

export const DEMO_WORKFLOW_PRESETS: DemoWorkflowPreset[] = [
  {
    id: 'wf-rfi-digest',
    name: 'Morning RFI Digest',
    summary: 'Compile all open RFIs into a single Slack summary for project managers each morning.',
    command: 'workflow run wf-rfi-digest',
    category: 'communication',
    steps: [
      'Fetch open RFIs created in the last 24 hours',
      'Group RFIs by project owner and priority',
      'Generate Slack-friendly markdown summary',
      'Schedule message for 07:00 in #project-updates'
    ],
    payload: {
      channel: '#project-updates',
      deliveryTime: '07:00',
      includeAttachments: true
    },
    resultSummary: '4 open RFIs collated and scheduled for delivery to #project-updates.'
  },
  {
    id: 'wf-safety-morning',
    name: 'Daily Safety Standup',
    summary: 'Remind site supervisors about mandatory safety checks with a quick status poll.',
    command: 'workflow run wf-safety-morning',
    category: 'safety',
    steps: [
      'Pull today\'s schedule and locate active site supervisors',
      'Send SMS checklist with three mandatory confirmations',
      'Collect responses and flag missing acknowledgements',
      'Post aggregated status to Safety Command Center dashboard'
    ],
    payload: {
      checklistItems: ['PPE inspection', 'Equipment lockout', 'Hot work permits'],
      escalationMinutes: 45
    },
    resultSummary: 'Safety SMS sent to 6 supervisors. 5 confirmed, 1 pending escalation.'
  },
  {
    id: 'wf-cost-watch',
    name: 'Cost Overrun Watch',
    summary: 'Track actuals vs budget and alert finance if variance exceeds 5%.',
    command: 'workflow run wf-cost-watch',
    category: 'finance',
    steps: [
      'Aggregate yesterday\'s cost entries for active projects',
      'Compare cumulative spend against phase budgets',
      'Highlight variances above threshold',
      'Email finance ops with CSV snapshot'
    ],
    payload: {
      thresholdPercent: 5,
      recipients: ['finops@cortexbuild.com']
    },
    resultSummary: '1 project breached variance threshold. Finance ops notified with CSV export.'
  },
  {
    id: 'wf-timesheet-rollup',
    name: 'Timesheet Rollup',
    summary: 'Consolidate craft labour timesheets into a weekly dashboard card.',
    command: 'workflow run wf-timesheet-rollup',
    category: 'operations',
    steps: [
      'Collect submitted timesheets waiting for approval',
      'Normalize hours by trade and cost code',
      'Push summary metrics to Operations Dashboard API',
      'Notify project managers about outstanding approvals'
    ],
    payload: {
      dashboardWidget: 'labour-hours',
      autoApproveUnderHours: 2
    },
    resultSummary: '9 pending timesheets rolled up. 3 PMs alerted for approval.'
  }
];

export const DEMO_SDK_APPS: DemoSdkAppPreset[] = [
  {
    id: 'app-sandbox-orchestrator',
    name: 'Sandbox Orchestrator',
    description: 'Launch developer sandbox runs and replay workflow presets in one click.',
    command: 'app run app-sandbox-orchestrator',
    icon: '🧪',
    category: 'developer',
    color: 'teal',
    logs: [
      'Bootstrapping sandbox environment…',
      'Validating developer token…',
      'Loading workflow presets (4 found)…',
      'Sandbox Orchestrator ready. Type "workflow list" to explore presets.'
    ]
  }
];

export const findDemoWorkflow = (id: string) =>
  DEMO_WORKFLOW_PRESETS.find((workflow) => workflow.id === id);

export const findDemoSdkApp = (id: string) =>
  DEMO_SDK_APPS.find((app) => app.id === id);
