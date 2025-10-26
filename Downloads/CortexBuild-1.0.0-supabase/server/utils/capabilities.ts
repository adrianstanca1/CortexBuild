import Database from 'better-sqlite3';

type RoleKey = 'super_admin' | 'developer' | 'company_admin' | string;

interface CapabilityConfig {
  canAccessSandbox: boolean;
  canPublishModules: boolean;
  maxSandboxRunsPerDay: number; // -1 means unlimited
  maxActiveApps: number; // -1 unlimited
  maxActiveWorkflows: number; // -1 unlimited
}

export interface SandboxUsageCounts {
  sandboxRunsToday: number;
  activeApps: number;
  activeWorkflows: number;
}

export type RoleExperienceAction =
  | 'sandbox'
  | 'builder'
  | 'workflows'
  | 'publish'
  | 'apiKeys'
  | 'marketplace'
  | 'docs';

export type RoleExperienceIcon =
  | 'rocket'
  | 'sparkles'
  | 'workflow'
  | 'shield'
  | 'store'
  | 'key'
  | 'book'
  | 'zap';

export interface RoleExperienceQuickAction {
  id: string;
  label: string;
  description: string;
  action: RoleExperienceAction;
  icon: RoleExperienceIcon;
  intent: 'primary' | 'secondary' | 'warning';
  enabled: boolean;
  disabledReason?: string;
}

export interface RoleExperienceGuardrail {
  id: string;
  title: string;
  status: 'clear' | 'warning' | 'blocked';
  message: string;
  helper?: string;
  icon: RoleExperienceIcon;
}

export interface RoleExperienceProgram {
  id: string;
  title: string;
  summary: string;
  action: RoleExperienceAction;
  ctaLabel: string;
  locked: boolean;
  lockedReason?: string;
  stat?: string;
  icon: RoleExperienceIcon;
}

export interface RoleExperience {
  role: RoleKey;
  headline: string;
  subheading: string;
  quickActions: RoleExperienceQuickAction[];
  guardrails: RoleExperienceGuardrail[];
  programs: RoleExperienceProgram[];
}

const DEFAULT_CAPABILITIES: Record<RoleKey, CapabilityConfig> = {
  super_admin: {
    canAccessSandbox: true,
    canPublishModules: true,
    maxSandboxRunsPerDay: -1,
    maxActiveApps: -1,
    maxActiveWorkflows: -1
  },
  developer: {
    canAccessSandbox: true,
    canPublishModules: true,
    maxSandboxRunsPerDay: 100,
    maxActiveApps: -1,
    maxActiveWorkflows: -1
  },
  company_admin: {
    canAccessSandbox: true,
    canPublishModules: false,
    maxSandboxRunsPerDay: 15,
    maxActiveApps: 10,
    maxActiveWorkflows: 10
  }
};

export const getCapabilitiesForRole = (role: RoleKey): CapabilityConfig => {
  return DEFAULT_CAPABILITIES[role] ?? {
    canAccessSandbox: false,
    canPublishModules: false,
    maxSandboxRunsPerDay: 0,
    maxActiveApps: 0,
    maxActiveWorkflows: 0
  };
};

export const getSandboxUsageCounts = (db: Database.Database, userId: string): SandboxUsageCounts => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const runsTodayRow = db
    .prepare('SELECT COUNT(*) as count FROM sandbox_runs WHERE user_id = ? AND created_at >= ?')
    .get(userId, todayIso) as any;

  const activeAppsRow = db
    .prepare('SELECT COUNT(*) as count FROM sdk_apps WHERE developer_id = ? AND status IN (\'draft\', \'pending_review\', \'approved\')')
    .get(userId) as any;

  const activeWorkflowsRow = db
    .prepare('SELECT COUNT(*) as count FROM sdk_workflows WHERE developer_id = ? AND is_active = 1')
    .get(userId) as any;

  return {
    sandboxRunsToday: runsTodayRow?.count ?? 0,
    activeApps: activeAppsRow?.count ?? 0,
    activeWorkflows: activeWorkflowsRow?.count ?? 0
  };
};

export const enforceSandboxRunQuota = (
  db: Database.Database,
  user: any,
  capabilities: CapabilityConfig
) => {
  if (!capabilities.canAccessSandbox) {
    const error: any = new Error('Sandbox access is not enabled for this role');
    error.status = 403;
    throw error;
  }

  if (capabilities.maxSandboxRunsPerDay < 0) {
    return;
  }

  const usage = getSandboxUsageCounts(db, user.id);
  if (usage.sandboxRunsToday >= capabilities.maxSandboxRunsPerDay) {
    const error: any = new Error('Daily sandbox run limit reached');
    error.status = 429;
    throw error;
  }
};

const ROLE_COPY: Record<RoleKey, { headline: string; subheading: string }> = {
  super_admin: {
    headline: 'Super Admin Launchpad',
    subheading: 'Full-access controls with unlimited sandbox capacity and publishing rights.'
  },
  developer: {
    headline: 'Developer Sprint Hub',
    subheading: 'Ship modules faster with guided sandbox runs and BuilderKit programs.'
  },
  company_admin: {
    headline: 'Company Sandbox',
    subheading: 'Validate tenant automations with safe guardrails and upgrade paths.'
  }
};

const formatQuotaLabel = (used: number, limit: number) => {
  if (limit < 0) return 'Unlimited capacity';
  const remaining = Math.max(limit - used, 0);
  return `${remaining} of ${limit} remaining`;
};

const determineQuotaStatus = (remaining: number, limit: number) => {
  if (limit < 0) return 'clear';
  if (remaining <= 0) return 'blocked';
  if (remaining <= 1) return 'warning';
  return 'clear';
};

export const buildRoleExperience = (
  role: RoleKey,
  capabilities: CapabilityConfig,
  usage: SandboxUsageCounts
): RoleExperience => {
  const copy = ROLE_COPY[role] ?? {
    headline: 'Developer Environment',
    subheading: 'Track sandbox capacity, guardrails, and onboarding programs tailored to your role.'
  };

  const runsLimit = capabilities.maxSandboxRunsPerDay ?? 0;
  const runsUsed = usage.sandboxRunsToday ?? 0;
  const runsRemaining = runsLimit < 0 ? Number.POSITIVE_INFINITY : Math.max(runsLimit - runsUsed, 0);

  const maxApps = capabilities.maxActiveApps ?? -1;
  const appsUsed = usage.activeApps ?? 0;
  const appsRemaining = maxApps < 0 ? Number.POSITIVE_INFINITY : Math.max(maxApps - appsUsed, 0);

  const maxWorkflows = capabilities.maxActiveWorkflows ?? -1;
  const workflowsUsed = usage.activeWorkflows ?? 0;
  const workflowsRemaining =
    maxWorkflows < 0 ? Number.POSITIVE_INFINITY : Math.max(maxWorkflows - workflowsUsed, 0);

  const sandboxOpen = capabilities.canAccessSandbox && (runsLimit < 0 || runsRemaining > 0);
  const publishEnabled = capabilities.canPublishModules === true;
  const quickActions: RoleExperienceQuickAction[] = [
    {
      id: 'sandbox-run',
      label: 'Run Sandbox Simulation',
      description: 'Validate modules with production-safe mocks and result logs.',
      action: 'sandbox',
      icon: 'rocket',
      intent: 'primary',
      enabled: sandboxOpen,
      disabledReason: sandboxOpen
        ? undefined
        : capabilities.canAccessSandbox
          ? 'Daily sandbox quota reached — upgrade for more capacity.'
          : 'Sandbox access disabled for this role.'
    },
    {
      id: 'launch-builder',
      label: 'Open BuilderKit',
      description: 'Design automations with guided nodes and AI-assisted configs.',
      action: 'builder',
      icon: 'sparkles',
      intent: 'secondary',
      enabled: true
    },
    {
      id: 'workflow-automation',
      label: 'Automate Workflow',
      description: 'Activate reusable pipelines with audit-ready execution logs.',
      action: 'workflows',
      icon: 'workflow',
      intent: 'secondary',
      enabled: maxWorkflows < 0 || workflowsRemaining > 0,
      disabledReason:
        maxWorkflows >= 0 && workflowsRemaining <= 0
          ? 'Workflow slots exhausted — archive or upgrade to add more.'
          : undefined
    },
    {
      id: 'publish-marketplace',
      label: 'Publish to Marketplace',
      description: publishEnabled
        ? 'Promote modules to tenants and unlock revenue share.'
        : 'Publishing restricted — request Super Admin approval.',
      action: 'publish',
      icon: 'store',
      intent: publishEnabled ? 'secondary' : 'warning',
      enabled: publishEnabled,
      disabledReason: publishEnabled ? undefined : 'Publishing rights are disabled for this role.'
    },
    {
      id: 'manage-api-keys',
      label: 'Manage API Keys',
      description: 'Rotate secrets, enforce scopes, and monitor usage alerts.',
      action: 'apiKeys',
      icon: 'key',
      intent: 'secondary',
      enabled: true
    }
  ];

  const guardrails: RoleExperienceGuardrail[] = [
    {
      id: 'sandbox-capacity',
      title: 'Sandbox Capacity',
      status: sandboxOpen
        ? runsRemaining <= 2 && runsLimit >= 0
          ? 'warning'
          : 'clear'
        : 'blocked',
      message:
        runsLimit < 0
          ? 'Unlimited sandbox runs available.'
          : formatQuotaLabel(runsUsed, runsLimit),
      helper:
        runsLimit < 0
          ? 'Super Admin roles receive unrestricted simulation capacity.'
          : sandboxOpen
            ? 'Runs reset daily at 00:00 UTC.'
            : 'Contact a Super Admin to extend sandbox allocation.',
      icon: 'rocket'
    },
    {
      id: 'publishing-rights',
      title: 'Publishing Rights',
      status: publishEnabled ? 'clear' : role === 'company_admin' ? 'warning' : 'blocked',
      message: publishEnabled ? 'Can submit modules for review.' : 'Publishing currently locked.',
      helper: publishEnabled
        ? 'Approved modules appear in the organisation marketplace instantly.'
        : 'Request Super Admin approval to unlock publishing.',
      icon: 'store'
    },
    {
      id: 'app-quota',
      title: 'Active App Slots',
      status: determineQuotaStatus(appsRemaining, maxApps),
      message:
        maxApps < 0
          ? 'Unlimited active applications.'
          : appsRemaining > 0
            ? formatQuotaLabel(appsUsed, maxApps)
            : 'No app slots remaining.',
      helper:
        maxApps < 0
          ? 'Enterprise and Super Admin tiers maintain unlimited module portfolios.'
          : appsRemaining > 0
            ? 'Archive an app or upgrade to unlock more slots.'
            : 'Reach out to upgrade or retire unused applications.',
      icon: 'zap'
    },
    {
      id: 'workflow-quota',
      title: 'Workflow Capacity',
      status: determineQuotaStatus(workflowsRemaining, maxWorkflows),
      message:
        maxWorkflows < 0
          ? 'Unlimited active workflows.'
          : workflowsRemaining > 0
            ? formatQuotaLabel(workflowsUsed, maxWorkflows)
            : 'Workflow quota reached.',
      helper:
        maxWorkflows < 0
          ? 'Advanced tiers unlock unlimited automation pipelines.'
          : workflowsRemaining > 0
            ? 'Deactivate unused workflows to free capacity.'
            : 'Upgrade your plan to orchestrate more workflows.',
      icon: 'workflow'
    }
  ];

  const programs: RoleExperienceProgram[] = [
    {
      id: 'builder-fast-track',
      title: 'BuilderKit Fast Track',
      summary: 'Launch your first automation using curated templates and validation checklists.',
      action: 'builder',
      ctaLabel: sandboxOpen ? 'Open BuilderKit' : 'Sandbox Locked',
      locked: !sandboxOpen,
      lockedReason: sandboxOpen ? undefined : 'Daily sandbox quota reached. Try again tomorrow or upgrade.',
      stat: 'Avg launch time • 12m',
      icon: 'sparkles'
    },
    {
      id: 'sandbox-playbook',
      title: 'Sandbox Playbook',
      summary: 'Step-by-step sequence to iterate, simulate, and promote modules safely.',
      action: 'docs',
      ctaLabel: 'View Checklist',
      locked: false,
      stat: runsLimit < 0 ? 'Unlimited capacity' : formatQuotaLabel(runsUsed, runsLimit),
      icon: 'shield'
    },
    {
      id: 'marketplace-pro',
      title: 'Marketplace Accelerator',
      summary: 'Grow revenue with launch campaigns, telemetry, and partner enablement assets.',
      action: publishEnabled ? 'marketplace' : 'docs',
      ctaLabel: publishEnabled ? 'Open Marketplace' : 'Request Access',
      locked: !publishEnabled,
      lockedReason: publishEnabled ? undefined : 'Publishing rights required. Contact a Super Admin.',
      stat: 'Top creators • +38% ARR',
      icon: 'store'
    }
  ];

  return {
    role,
    headline: copy.headline,
    subheading: copy.subheading,
    quickActions,
    guardrails,
    programs
  };
};
