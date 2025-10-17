import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface WorkflowRecord {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  version: string | null;
  definition: string;
  is_active: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowRunRecord {
  id: string;
  workflow_id: string;
  company_id: string;
  status: string;
  trigger: string | null;
  input_payload: string | null;
  output_payload: string | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const mapWorkflowRow = (row: WorkflowRecord) => ({
  id: row.id,
  companyId: row.company_id,
  name: row.name,
  description: row.description ?? '',
  version: row.version ?? '1.0.0',
  definition: row.definition ? JSON.parse(row.definition) : {},
  isActive: row.is_active === 1,
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const mapWorkflowRunRow = (row: WorkflowRunRecord) => ({
  id: row.id,
  workflowId: row.workflow_id,
  companyId: row.company_id,
  status: row.status,
  trigger: row.trigger ? JSON.parse(row.trigger) : undefined,
  input: row.input_payload ? JSON.parse(row.input_payload) : undefined,
  output: row.output_payload ? JSON.parse(row.output_payload) : undefined,
  error: row.error_message ?? undefined,
  startedAt: row.started_at,
  completedAt: row.completed_at ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const listWorkflows = (
  db: Database.Database,
  companyId: string,
  includeInactive = true
) => {
  const rows = db.prepare(`
    SELECT * FROM workflows
    WHERE company_id = ?
      ${includeInactive ? '' : 'AND is_active = 1'}
    ORDER BY name ASC
  `).all(companyId) as WorkflowRecord[];

  return rows.map(mapWorkflowRow);
};

export const listAllWorkflows = (db: Database.Database, limit = 100) => {
  const rows = db.prepare(`
    SELECT * FROM workflows
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit) as WorkflowRecord[];

  return rows.map(mapWorkflowRow);
};

export const getWorkflow = (db: Database.Database, workflowId: string) => {
  const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(workflowId) as WorkflowRecord | undefined;
  return workflow ? mapWorkflowRow(workflow) : undefined;
};

export const createWorkflow = (
  db: Database.Database,
  companyId: string,
  payload: { name: string; description?: string; definition: any; createdBy?: string }
) => {
  const id = `wf-${uuidv4()}`;
  db.prepare(`
    INSERT INTO workflows (id, company_id, name, description, version, definition, is_active, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    companyId,
    payload.name,
    payload.description ?? '',
    '1.0.0',
    JSON.stringify(payload.definition ?? {}),
    1,
    payload.createdBy ?? null
  );

  const record = db.prepare('SELECT * FROM workflows WHERE id = ?').get(id) as WorkflowRecord;
  return mapWorkflowRow(record);
};

export const updateWorkflow = (
  db: Database.Database,
  workflowId: string,
  companyId: string,
  updates: { name?: string; description?: string; definition?: any; version?: string; isActive?: boolean }
) => {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }

  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }

  if (updates.definition !== undefined) {
    fields.push('definition = ?');
    values.push(JSON.stringify(updates.definition));
  }

  if (updates.version !== undefined) {
    fields.push('version = ?');
    values.push(updates.version);
  }

  if (updates.isActive !== undefined) {
    fields.push('is_active = ?');
    values.push(updates.isActive ? 1 : 0);
  }

  if (fields.length === 0) {
    return getWorkflow(db, workflowId);
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(workflowId, companyId);

  db.prepare(`
    UPDATE workflows
    SET ${fields.join(', ')}
    WHERE id = ? AND company_id = ?
  `).run(...values);

  return getWorkflow(db, workflowId);
};

export const toggleWorkflow = (
  db: Database.Database,
  workflowId: string,
  companyId: string,
  isActive: boolean
) => {
  db.prepare(`
    UPDATE workflows
    SET is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND company_id = ?
  `).run(isActive ? 1 : 0, workflowId, companyId);

  return getWorkflow(db, workflowId);
};

const recordWorkflowRunStep = (
  db: Database.Database,
  runId: string,
  index: number,
  step: any,
  input: any,
  output: any,
  status: string,
  error?: string
) => {
  db.prepare(`
    INSERT INTO workflow_run_steps (
      id, run_id, step_index, step_type, name, status,
      input_payload, output_payload, error_message, started_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(
    `wf-step-${uuidv4()}`,
    runId,
    index,
    step.type ?? 'action',
    step.name ?? `Step ${index + 1}`,
    status,
    JSON.stringify(input ?? {}),
    JSON.stringify(output ?? {}),
    error ?? null
  );
};

export const runWorkflow = (
  db: Database.Database,
  workflowId: string,
  companyId: string,
  trigger: any,
  inputPayload: any
) => {
  const workflow = db.prepare('SELECT * FROM workflows WHERE id = ? AND company_id = ?')
    .get(workflowId, companyId) as WorkflowRecord | undefined;

  if (!workflow) {
    throw new Error('Workflow not found');
  }

  const definition = workflow.definition ? JSON.parse(workflow.definition) : {};
  const steps: any[] = Array.isArray(definition.steps) ? definition.steps : [];

  const runId = `wf-run-${uuidv4()}`;
  const startedAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO workflow_runs (id, workflow_id, company_id, status, trigger, input_payload, started_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(
    runId,
    workflowId,
    companyId,
    'running',
    JSON.stringify(trigger ?? {}),
    JSON.stringify(inputPayload ?? {}),
    startedAt
  );

  let status: 'success' | 'failed' = 'success';
  let outputPayload: any = {};
  let errorMessage: string | undefined;

  try {
    steps.forEach((step, index) => {
      const stepInput = index === 0 ? inputPayload : outputPayload;

      // Simulate step processing
      const stepOutput = {
        stepId: step.id ?? `step-${index + 1}`,
        message: `${step.type ?? 'action'} executed successfully`,
        details: {
          ...step,
          timestamp: new Date().toISOString()
        }
      };

      recordWorkflowRunStep(db, runId, index, step, stepInput, stepOutput, 'success');
      outputPayload = { ...outputPayload, [`step_${index + 1}`]: stepOutput };
    });
  } catch (error: any) {
    status = 'failed';
    errorMessage = error?.message ?? 'Workflow execution failed';
    recordWorkflowRunStep(
      db,
      runId,
      steps.length,
      { type: 'error-handler', name: 'Error Capture' },
      {},
      {},
      'failed',
      errorMessage
    );
  }

  db.prepare(`
    UPDATE workflow_runs
    SET status = ?, output_payload = ?, error_message = ?, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    status,
    JSON.stringify(outputPayload),
    errorMessage ?? null,
    runId
  );

  const run = db.prepare('SELECT * FROM workflow_runs WHERE id = ?').get(runId) as WorkflowRunRecord;
  return mapWorkflowRunRow(run);
};

export const listWorkflowRuns = (
  db: Database.Database,
  workflowId: string,
  companyId: string,
  limit = 20
) => {
  const rows = db.prepare(`
    SELECT * FROM workflow_runs
    WHERE workflow_id = ? AND company_id = ?
    ORDER BY started_at DESC
    LIMIT ?
  `).all(workflowId, companyId, limit) as WorkflowRunRecord[];

  return rows.map(mapWorkflowRunRow);
};

export const listWorkflowRunSteps = (
  db: Database.Database,
  runId: string
) => {
  return db.prepare(`
    SELECT *
    FROM workflow_run_steps
    WHERE run_id = ?
    ORDER BY step_index ASC
  `).all(runId).map((row: any) => ({
    id: row.id,
    runId: row.run_id,
    index: row.step_index,
    type: row.step_type,
    name: row.name,
    status: row.status,
    input: row.input_payload ? JSON.parse(row.input_payload) : undefined,
    output: row.output_payload ? JSON.parse(row.output_payload) : undefined,
    error: row.error_message ?? undefined,
    startedAt: row.started_at,
    completedAt: row.completed_at
  }));
};

export const listTemplates = (db: Database.Database) => {
  return db.prepare('SELECT * FROM workflow_templates ORDER BY category, name').all().map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description ?? '',
    icon: row.icon ?? '⚙️',
    difficulty: row.difficulty ?? 'intermediate',
    definition: row.definition ? JSON.parse(row.definition) : {}
  }));
};

export const getBuilderBlocks = () => {
  return [
    {
      id: 'trigger-scheduled',
      type: 'trigger',
      label: 'Scheduled Trigger',
      description: 'Runs on a cron schedule.',
      configSchema: { cron: { type: 'string', required: true } }
    },
    {
      id: 'trigger-event',
      type: 'trigger',
      label: 'Event Trigger',
      description: 'Runs when a platform event occurs (e.g., RFI created).',
      configSchema: { event: { type: 'string', required: true } }
    },
    {
      id: 'action-notify',
      type: 'action',
      label: 'Send Notification',
      description: 'Send email, Slack, or in-app notifications.',
      configSchema: {
        channel: { type: 'string', enum: ['email', 'slack', 'in_app'], required: true },
        target: { type: 'string', required: true }
      }
    },
    {
      id: 'action-task',
      type: 'action',
      label: 'Create Task',
      description: 'Create a follow-up task with due dates and assignments.',
      configSchema: {
        title: { type: 'string', required: true },
        assigneeRole: { type: 'string', required: true },
        dueInDays: { type: 'number', default: 3 }
      }
    },
    {
      id: 'action-agent',
      type: 'action',
      label: 'Invoke Agent',
      description: 'Call an AI agent and use the response in downstream steps.',
      configSchema: {
        agentId: { type: 'string', required: true },
        inputMapping: { type: 'object', required: false }
      }
    }
  ];
};
