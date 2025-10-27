/**
 * Worker Process for Parallel Agent Execution
 * Handles agent execution jobs from the queue
 */

import { fork } from 'child_process';
import { db } from './database';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AgentJob {
  id: string;
  agent_id: string;
  user_id: string;
  company_id: string;
  payload: any;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

class AgentWorker {
  private isRunning = false;
  private maxConcurrentJobs = 3;
  private activeJobs = new Set<string>();

  constructor() {
    this.setupSignalHandlers();
  }

  private setupSignalHandlers() {
    process.on('SIGTERM', () => {
      console.log('🛑 Worker received SIGTERM, shutting down gracefully...');
      this.shutdown();
    });

    process.on('SIGINT', () => {
      console.log('🛑 Worker received SIGINT, shutting down gracefully...');
      this.shutdown();
    });
  }

  private shutdown() {
    this.isRunning = false;
    console.log('👋 Worker shutdown complete');
    process.exit(0);
  }

  async start() {
    console.log('🚀 Starting Agent Worker Process...');
    this.isRunning = true;

    while (this.isRunning) {
      try {
        await this.processJobs();
        // Wait 1 second before checking for new jobs
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('❌ Worker error:', error);
        // Wait 5 seconds before retrying after an error
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private async processJobs() {
    if (this.activeJobs.size >= this.maxConcurrentJobs) {
      return; // Max concurrent jobs reached
    }

    // Get next pending job from queue
    const job = await this.getNextJob();
    if (!job) {
      return; // No jobs available
    }

    this.activeJobs.add(job.id);
    console.log(`⚡ Processing job ${job.id} for agent ${job.agent_id}`);

    try {
      // Mark job as processing
      await this.updateJobStatus(job.id, 'processing');

      // Execute the agent job
      const result = await this.executeAgentJob(job);

      // Mark job as completed
      await this.updateJobStatus(job.id, 'completed', result);

      console.log(`✅ Job ${job.id} completed successfully`);
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);
      await this.updateJobStatus(job.id, 'failed', null, error.message);
    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  private async getNextJob(): Promise<AgentJob | null> {
    try {
      const stmt = db.prepare(`
        SELECT * FROM agent_execution_queue
        WHERE status = 'pending'
        ORDER BY priority DESC, created_at ASC
        LIMIT 1
      `);

      const job = stmt.get() as AgentJob | undefined;
      return job || null;
    } catch (error) {
      console.error('Error getting next job:', error);
      return null;
    }
  }

  private async updateJobStatus(
    jobId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    result?: any,
    error?: string
  ) {
    try {
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
    } catch (updateError) {
      console.error('Error updating job status:', updateError);
    }
  }

  private async executeAgentJob(job: AgentJob): Promise<any> {
    // Create a child process to execute the agent
    return new Promise((resolve, reject) => {
      const workerPath = path.join(__dirname, 'agent-executor.js');

      const child = fork(workerPath, [], {
        env: {
          ...process.env,
          AGENT_JOB_ID: job.id,
          AGENT_ID: job.agent_id,
          USER_ID: job.user_id,
          COMPANY_ID: job.company_id,
          JOB_PAYLOAD: JSON.stringify(job.payload)
        }
      });

      let result: any = null;
      let error: string | null = null;

      child.on('message', (message) => {
        if (message.type === 'result') {
          result = message.data;
        } else if (message.type === 'error') {
          error = message.error;
        }
      });

      child.on('exit', (code) => {
        if (code === 0 && !error) {
          resolve(result);
        } else {
          reject(new Error(error || `Agent execution failed with code ${code}`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Agent execution timed out'));
      }, 5 * 60 * 1000);
    });
  }
}

// Start the worker if this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new AgentWorker();
  worker.start().catch(console.error);
}

export { AgentWorker };