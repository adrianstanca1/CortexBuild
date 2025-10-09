import Database from 'better-sqlite3';

type RoleKey = 'super_admin' | 'developer' | 'company_admin' | string;

interface CapabilityConfig {
  canAccessSandbox: boolean;
  canPublishModules: boolean;
  maxSandboxRunsPerDay: number; // -1 means unlimited
  maxActiveApps: number; // -1 unlimited
  maxActiveWorkflows: number; // -1 unlimited
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

export const getSandboxUsageCounts = (db: Database.Database, userId: string) => {
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
