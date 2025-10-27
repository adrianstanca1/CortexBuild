/**
 * Queue Service for Agent Execution Jobs
 * Provides database-based queue management for parallel processing
 */

import { db } from '../database';

export interface AgentJob {
  id?: string;
  agent_id: string;
  user_id: string;
  company_id: string;
  payload: any;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  created_at?: string;
  updated_at?: string;
}

export class QueueService {
  /**
   * Add a job to the execution queue
   */
  static async addJob(job: Omit<AgentJob, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const stmt = db.prepare(`
      INSERT INTO agent_execution_queue (
        id, agent_id, user_id, company_id, payload, priority, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
    `);

    stmt.run(
      id,
      job.agent_id,
      job.user_id,
      job.company_id,
      JSON.stringify(job.payload),
      job.priority || 1
    );

    return id;
  }

  /**
   * Get job by ID
   */
  static async getJob(jobId: string): Promise<AgentJob | null> {
    const stmt = db.prepare(`
      SELECT * FROM agent_execution_queue WHERE id = ?
    `);

    const job = stmt.get(jobId) as any;
    if (!job) return null;

    return {
      ...job,
      payload: JSON.parse(job.payload || '{}'),
      result: job.result ? JSON.parse(job.result) : undefined
    };
  }

  /**
   * Update job status
   */
  static async updateJobStatus(
    jobId: string,
    status: AgentJob['status'],
    result?: any,
    error?: string
  ): Promise<void> {
    const stmt = db.prepare(`
      UPDATE agent_execution_queue
      SET status = ?, result = ?, error = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(
      status,
      result ? JSON.stringify(result) : null,
      error || null,
      jobId
    );
  }

  /**
   * Get next pending job (for worker processing)
   */
  static async getNextPendingJob(): Promise<AgentJob | null> {
    const stmt = db.prepare(`
      SELECT * FROM agent_execution_queue
      WHERE status = 'pending'
      ORDER BY priority DESC, created_at ASC
      LIMIT 1
    `);

    const job = stmt.get() as any;
    if (!job) return null;

    return {
      ...job,
      payload: JSON.parse(job.payload || '{}')
    };
  }

  /**
   * Get jobs by status
   */
  static async getJobsByStatus(status: AgentJob['status'], limit = 50): Promise<AgentJob[]> {
    const stmt = db.prepare(`
      SELECT * FROM agent_execution_queue
      WHERE status = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const jobs = stmt.all(status, limit) as any[];
    return jobs.map(job => ({
      ...job,
      payload: JSON.parse(job.payload || '{}'),
      result: job.result ? JSON.parse(job.result) : undefined
    }));
  }

  /**
   * Get jobs by user
   */
  static async getJobsByUser(userId: string, limit = 50): Promise<AgentJob[]> {
    const stmt = db.prepare(`
      SELECT * FROM agent_execution_queue
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const jobs = stmt.all(userId, limit) as any[];
    return jobs.map(job => ({
      ...job,
      payload: JSON.parse(job.payload || '{}'),
      result: job.result ? JSON.parse(job.result) : undefined
    }));
  }

  /**
   * Clean up old completed jobs (older than specified days)
   */
  static async cleanupOldJobs(daysOld = 30): Promise<number> {
    const stmt = db.prepare(`
      DELETE FROM agent_execution_queue
      WHERE status IN ('completed', 'failed')
      AND created_at < datetime('now', '-${daysOld} days')
    `);

    const result = stmt.run();
    return result.changes;
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    const stmt = db.prepare(`
      SELECT
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        COUNT(*) as total
      FROM agent_execution_queue
    `);

    return stmt.get() as any;
  }

  /**
   * Reset stuck jobs (processing jobs that haven't been updated in the last 10 minutes)
   */
  static async resetStuckJobs(): Promise<number> {
    const stmt = db.prepare(`
      UPDATE agent_execution_queue
      SET status = 'pending', updated_at = datetime('now')
      WHERE status = 'processing'
      AND updated_at < datetime('now', '-10 minutes')
    `);

    const result = stmt.run();
    return result.changes;
  }
}