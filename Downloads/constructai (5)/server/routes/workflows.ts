import { Router } from 'express';
import Database from 'better-sqlite3';
import * as auth from '../auth';

const router = Router();

// Database helper
const getDb = () => {
  return new Database('./cortexbuild.db');
};

// Initialize workflow tables
const initWorkflowTables = (db: Database.Database) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      nodes TEXT NOT NULL,
      connections TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      company_id TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workflow_executions (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,
      error_message TEXT,
      execution_data TEXT,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id)
    );

    CREATE TABLE IF NOT EXISTS workflow_execution_logs (
      id TEXT PRIMARY KEY,
      execution_id TEXT NOT NULL,
      node_id TEXT NOT NULL,
      status TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      data TEXT,
      error_message TEXT,
      FOREIGN KEY (execution_id) REFERENCES workflow_executions(id)
    );
  `);
};

// Initialize tables on first import
const db = getDb();
initWorkflowTables(db);
db.close();

// GET /api/workflows - List all workflows
router.get('/', auth.authenticateToken, (req: any, res) => {
  try {
    const db = getDb();
    const { user } = req;
    
    let query = 'SELECT * FROM workflows';
    const params: any[] = [];
    
    if (user.role !== 'super_admin') {
      query += ' WHERE company_id = ?';
      params.push(user.company_id);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const stmt = db.prepare(query);
    const workflows = stmt.all(...params);
    
    // Parse JSON fields
    const parsedWorkflows = workflows.map(workflow => ({
      ...workflow,
      nodes: JSON.parse(workflow.nodes || '[]'),
      connections: JSON.parse(workflow.connections || '[]')
    }));
    
    db.close();
    res.json({ success: true, data: parsedWorkflows });
  } catch (err) {
    console.error('Get workflows error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// POST /api/workflows - Create new workflow
router.post('/', auth.authenticateToken, (req: any, res) => {
  try {
    const db = getDb();
    const { user } = req;
    const { name, description, nodes, connections } = req.body;
    
    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      INSERT INTO workflows (id, name, description, nodes, connections, company_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      workflowId,
      name,
      description || '',
      JSON.stringify(nodes || []),
      JSON.stringify(connections || []),
      user.company_id,
      user.id
    ];
    
    const stmt = db.prepare(query);
    stmt.run(...params);
    
    db.close();
    res.status(201).json({ 
      success: true, 
      message: 'Workflow created successfully',
      workflow: { id: workflowId, name, description, nodes, connections }
    });
  } catch (err) {
    console.error('Create workflow error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// GET /api/workflows/:id - Get specific workflow
router.get('/:id', auth.authenticateToken, (req: any, res) => {
  try {
    const db = getDb();
    const { user } = req;
    const { id } = req.params;
    
    let query = 'SELECT * FROM workflows WHERE id = ?';
    const params = [id];
    
    if (user.role !== 'super_admin') {
      query += ' AND company_id = ?';
      params.push(user.company_id);
    }
    
    const stmt = db.prepare(query);
    const workflow = stmt.get(...params);
    
    if (!workflow) {
      db.close();
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }
    
    // Parse JSON fields
    const parsedWorkflow = {
      ...workflow,
      nodes: JSON.parse(workflow.nodes || '[]'),
      connections: JSON.parse(workflow.connections || '[]')
    };
    
    db.close();
    res.json({ success: true, data: parsedWorkflow });
  } catch (err) {
    console.error('Get workflow error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// PUT /api/workflows/:id - Update workflow
router.put('/:id', auth.authenticateToken, (req: any, res) => {
  try {
    const db = getDb();
    const { user } = req;
    const { id } = req.params;
    const { name, description, nodes, connections, isActive } = req.body;
    
    // Check if workflow exists and user has permission
    let checkQuery = 'SELECT id FROM workflows WHERE id = ?';
    const checkParams = [id];
    
    if (user.role !== 'super_admin') {
      checkQuery += ' AND company_id = ?';
      checkParams.push(user.company_id);
    }
    
    const checkStmt = db.prepare(checkQuery);
    const workflow = checkStmt.get(...checkParams);
    
    if (!workflow) {
      db.close();
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }
    
    const updateQuery = `
      UPDATE workflows 
      SET name = ?, description = ?, nodes = ?, connections = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const updateStmt = db.prepare(updateQuery);
    updateStmt.run(name, description, JSON.stringify(nodes), JSON.stringify(connections), isActive ? 1 : 0, id);
    
    db.close();
    res.json({ 
      success: true, 
      message: 'Workflow updated successfully',
      workflow: { id, name, description, nodes, connections, isActive }
    });
  } catch (err) {
    console.error('Update workflow error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// DELETE /api/workflows/:id - Delete workflow
router.delete('/:id', auth.authenticateToken, (req: any, res) => {
  try {
    const db = getDb();
    const { user } = req;
    const { id } = req.params;
    
    // Check if workflow exists and user has permission
    let checkQuery = 'SELECT id FROM workflows WHERE id = ?';
    const checkParams = [id];
    
    if (user.role !== 'super_admin') {
      checkQuery += ' AND company_id = ?';
      checkParams.push(user.company_id);
    }
    
    const checkStmt = db.prepare(checkQuery);
    const workflow = checkStmt.get(...checkParams);
    
    if (!workflow) {
      db.close();
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }
    
    const deleteStmt = db.prepare('DELETE FROM workflows WHERE id = ?');
    deleteStmt.run(id);
    
    db.close();
    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (err) {
    console.error('Delete workflow error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// POST /api/workflows/:id/run - Execute workflow manually
router.post('/:id/run', auth.authenticateToken, (req: any, res) => {
  try {
    const db = getDb();
    const { user } = req;
    const { id } = req.params;

    // Check if workflow exists and user has permission
    let checkQuery = 'SELECT * FROM workflows WHERE id = ? AND is_active = 1';
    const checkParams = [id];

    if (user.role !== 'super_admin') {
      checkQuery += ' AND company_id = ?';
      checkParams.push(user.company_id);
    }

    const checkStmt = db.prepare(checkQuery);
    const workflow = checkStmt.get(...checkParams);

    if (!workflow) {
      db.close();
      return res.status(404).json({ success: false, error: 'Workflow not found or inactive' });
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const insertStmt = db.prepare(`
      INSERT INTO workflow_executions (id, workflow_id, status, execution_data)
      VALUES (?, ?, ?, ?)
    `);
    insertStmt.run(executionId, id, 'running', JSON.stringify({ triggered_by: user.id }));

    db.close();
    res.json({
      success: true,
      message: 'Workflow execution started',
      executionId
    });
  } catch (err) {
    console.error('Run workflow error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// GET /api/workflows/:id/executions - Get workflow execution history
router.get('/:id/executions', auth.authenticateToken, (req: any, res) => {
  try {
    const db = getDb();
    const { user } = req;
    const { id } = req.params;

    // Check if workflow exists and user has permission
    let checkQuery = 'SELECT id FROM workflows WHERE id = ?';
    const checkParams = [id];

    if (user.role !== 'super_admin') {
      checkQuery += ' AND company_id = ?';
      checkParams.push(user.company_id);
    }

    const checkStmt = db.prepare(checkQuery);
    const workflow = checkStmt.get(...checkParams);

    if (!workflow) {
      db.close();
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const executionsStmt = db.prepare(`
      SELECT * FROM workflow_executions
      WHERE workflow_id = ?
      ORDER BY started_at DESC
      LIMIT 50
    `);
    const executions = executionsStmt.all(id);

    db.close();
    res.json({ success: true, data: executions });
  } catch (err) {
    console.error('Get executions error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// GET /api/workflows/:id/executions/:executionId - Get specific execution
router.get('/:id/executions/:executionId', auth.authenticateToken, (req: any, res) => {
  try {
    const db = getDb();
    const { user } = req;
    const { id, executionId } = req.params;

    // Check if workflow exists and user has permission
    let checkQuery = 'SELECT id FROM workflows WHERE id = ?';
    const checkParams = [id];

    if (user.role !== 'super_admin') {
      checkQuery += ' AND company_id = ?';
      checkParams.push(user.company_id);
    }

    const checkStmt = db.prepare(checkQuery);
    const workflow = checkStmt.get(...checkParams);

    if (!workflow) {
      db.close();
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const executionStmt = db.prepare(`
      SELECT * FROM workflow_executions
      WHERE id = ? AND workflow_id = ?
    `);
    const execution = executionStmt.get(executionId, id);

    if (!execution) {
      db.close();
      return res.status(404).json({ success: false, error: 'Execution not found' });
    }

    const logsStmt = db.prepare(`
      SELECT * FROM workflow_execution_logs
      WHERE execution_id = ?
      ORDER BY timestamp ASC
    `);
    const logs = logsStmt.all(executionId);

    db.close();
    res.json({
      success: true,
      data: {
        ...execution,
        logs,
        execution_data: JSON.parse(execution.execution_data || '{}')
      }
    });
  } catch (err) {
    console.error('Get execution error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

export default router;
