/**
 * Seed Test Data for Phase 1 Features
 * Creates sample Gantt tasks, WBS nodes, and budgets for testing
 */

import { ganttAPI, wbsAPI, financialAPI } from '../lib/api-client';

export async function seedTestData(projectId: string | number) {
  console.log(`Seeding test data for project ${projectId}...`);

  try {
    // 1. Create sample Gantt tasks
    const ganttTasks = [
      {
        name: 'Project Start',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        duration: 0,
        progress: 100,
        type: 'milestone',
        priority: 'high',
        critical_path: true,
        description: 'Project kickoff milestone'
      },
      {
        name: 'Site Preparation',
        start_date: new Date(Date.now() + 1 * 86400000).toISOString(),
        end_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        duration: 7,
        progress: 0,
        type: 'task',
        priority: 'high',
        critical_path: true,
        description: 'Clear and prepare construction site'
      },
      {
        name: 'Foundation Work',
        start_date: new Date(Date.now() + 8 * 86400000).toISOString(),
        end_date: new Date(Date.now() + 21 * 86400000).toISOString(),
        duration: 14,
        progress: 0,
        type: 'task',
        priority: 'critical',
        critical_path: true,
        description: 'Pour foundation and allow curing'
      },
      {
        name: 'Framing',
        start_date: new Date(Date.now() + 22 * 86400000).toISOString(),
        end_date: new Date(Date.now() + 45 * 86400000).toISOString(),
        duration: 24,
        progress: 0,
        type: 'task',
        priority: 'high',
        critical_path: true,
        description: 'Frame all walls and roof structure'
      },
      {
        name: 'MEP Rough-in',
        start_date: new Date(Date.now() + 35 * 86400000).toISOString(),
        end_date: new Date(Date.now() + 60 * 86400000).toISOString(),
        duration: 26,
        progress: 0,
        type: 'task',
        priority: 'high',
        critical_path: false,
        description: 'Mechanical, electrical, plumbing rough-in'
      },
      {
        name: 'Inspections Complete',
        start_date: new Date(Date.now() + 61 * 86400000).toISOString(),
        end_date: new Date(Date.now() + 61 * 86400000).toISOString(),
        duration: 0,
        progress: 0,
        type: 'milestone',
        priority: 'high',
        critical_path: true,
        description: 'All rough-in inspections passed'
      }
    ];

    console.log('Creating Gantt tasks...');
    for (const task of ganttTasks) {
      await ganttAPI.createTask(projectId, task);
    }

    // 2. Create sample WBS nodes
    const wbsNodes = [
      {
        code: '1',
        name: 'General Requirements',
        description: 'Project overhead and general conditions',
        level: 1,
        cost_budget: 50000,
        actual_cost: 0,
        percentage_complete: 0,
        status: 'not_started'
      },
      {
        code: '1.1',
        name: 'Site Utilities',
        description: 'Temporary utilities and facilities',
        level: 2,
        cost_budget: 25000,
        actual_cost: 0,
        percentage_complete: 0,
        status: 'not_started'
      },
      {
        code: '1.2',
        name: 'Project Management',
        description: 'Project management and supervision',
        level: 2,
        cost_budget: 25000,
        actual_cost: 0,
        percentage_complete: 0,
        status: 'not_started'
      },
      {
        code: '03',
        name: 'Concrete',
        description: 'Concrete work and foundations',
        level: 1,
        cost_budget: 150000,
        actual_cost: 0,
        percentage_complete: 0,
        status: 'not_started'
      },
      {
        code: '03.30',
        name: 'Cast-in-Place Concrete',
        description: 'Foundation and slab pouring',
        level: 2,
        cost_budget: 120000,
        actual_cost: 0,
        percentage_complete: 0,
        status: 'not_started'
      },
      {
        code: '09',
        name: 'Finishes',
        description: 'Interior and exterior finishes',
        level: 1,
        cost_budget: 100000,
        actual_cost: 0,
        percentage_complete: 0,
        status: 'not_started'
      }
    ];

    console.log('Creating WBS nodes...');
    for (const node of wbsNodes) {
      await wbsAPI.createNode(projectId, node);
    }

    // 3. Create sample budgets
    const budgets = [
      {
        budget_name: 'Labor - General Requirements',
        budget_type: 'master',
        cost_code: '01 00 00',
        cost_code_name: 'General Requirements',
        category: 'labor',
        budget_amount: 30000,
        committed_amount: 0,
        spent_amount: 0,
        forecast_amount: 30000
      },
      {
        budget_name: 'Materials - Concrete',
        budget_type: 'master',
        cost_code: '03 30 00',
        cost_code_name: 'Cast-in-Place Concrete',
        category: 'material',
        budget_amount: 80000,
        committed_amount: 0,
        spent_amount: 0,
        forecast_amount: 82000
      },
      {
        budget_name: 'Equipment - Site Prep',
        budget_type: 'master',
        cost_code: '01 00 00',
        cost_code_name: 'General Requirements',
        category: 'equipment',
        budget_amount: 20000,
        committed_amount: 0,
        spent_amount: 0,
        forecast_amount: 18000
      },
      {
        budget_name: 'Subcontract - Electrical',
        budget_type: 'master',
        cost_code: '26 00 00',
        cost_code_name: 'Electrical',
        category: 'subcontract',
        budget_amount: 50000,
        committed_amount: 0,
        spent_amount: 0,
        forecast_amount: 50000
      },
      {
        budget_name: 'Subcontract - Plumbing',
        budget_type: 'master',
        cost_code: '22 00 00',
        cost_code_name: 'Plumbing',
        category: 'subcontract',
        budget_amount: 40000,
        committed_amount: 0,
        spent_amount: 0,
        forecast_amount: 42000
      }
    ];

    console.log('Creating budget lines...');
    for (const budget of budgets) {
      await financialAPI.createBudget(projectId, budget);
    }

    console.log('✅ Test data seeded successfully!');
    return { success: true, message: 'Test data created' };
  } catch (error: any) {
    console.error('Error seeding test data:', error);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectId = process.argv[2] || '1';
  seedTestData(projectId);
}

