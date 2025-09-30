import { describe, expect, it } from 'vitest';
import { computeProjectPortfolioSummary } from './projectPortfolio';

const dayInMs = 24 * 60 * 60 * 1000;

describe('computeProjectPortfolioSummary', () => {
  it('aggregates metrics and classifies overdue projects', () => {
    const now = Date.now();
    const summary = computeProjectPortfolioSummary([
      {
        id: 'a',
        name: 'Office fit-out',
        status: 'ACTIVE',
        budget: 100_000,
        actualCost: 80_000,
        progress: 50,
        endDate: new Date(now + 3 * dayInMs).toISOString(),
      },
      {
        id: 'b',
        name: 'Warehouse expansion',
        status: 'ACTIVE',
        budget: 50_000,
        actualCost: 60_000,
        progress: 80,
        endDate: new Date(now - 2 * dayInMs).toISOString(),
      },
      {
        id: 'c',
        name: 'Residential complex',
        status: 'COMPLETED',
        budget: 75_000,
        actualCost: 74_000,
        progress: 100,
        endDate: new Date(now - 10 * dayInMs).toISOString(),
      },
      {
        id: 'd',
        name: 'Infrastructure upgrade',
        status: 'PLANNING',
        budget: 90_000,
        actualCost: 0,
        progress: 0,
        endDate: new Date(now + 30 * dayInMs).toISOString(),
      },
    ]);

    expect(summary.totalProjects).toBe(4);
    expect(summary.activeProjects).toBe(2);
    expect(summary.completedProjects).toBe(1);
    expect(summary.atRiskProjects).toBe(1);
    expect(summary.overdueProjects).toBe(1);
    expect(summary.statusBreakdown.ACTIVE).toBe(2);
    expect(summary.statusBreakdown.COMPLETED).toBe(1);
    expect(summary.statusBreakdown.PLANNING).toBe(1);
    expect(summary.pipelineValue).toBe(315_000);
    expect(summary.totalActualCost).toBe(214_000);
    expect(summary.budgetVariance).toBe(101_000);
    expect(summary.averageProgress).toBeCloseTo((50 + 80 + 100 + 0) / 4);
    expect(summary.upcomingDeadlines.length).toBeGreaterThan(0);
    expect(summary.upcomingDeadlines[0].id).toBe('b');
    expect(summary.upcomingDeadlines[0].isOverdue).toBe(true);
  });

  it('limits deadlines and orders them by urgency', () => {
    const now = Date.now();
    const projects = Array.from({ length: 6 }).map((_, index) => ({
      id: `${index}`,
      name: `Project ${index}`,
      status: 'ACTIVE' as const,
      budget: 10_000,
      actualCost: 5_000,
      progress: 40,
      endDate: new Date(now + (index - 3) * dayInMs).toISOString(),
    }));

    const summary = computeProjectPortfolioSummary(projects);

    expect(summary.upcomingDeadlines).toHaveLength(5);
    expect(summary.upcomingDeadlines[0].id).toBe('0');
    expect(summary.upcomingDeadlines[summary.upcomingDeadlines.length - 1].id).toBe('4');
    expect(summary.overdueProjects).toBe(3);
  });

  it('returns zeroed metrics when no projects are provided', () => {
    const summary = computeProjectPortfolioSummary([]);

    expect(summary.totalProjects).toBe(0);
    expect(summary.activeProjects).toBe(0);
    expect(summary.statusBreakdown.ACTIVE).toBe(0);
    expect(summary.upcomingDeadlines).toHaveLength(0);
    expect(summary.pipelineValue).toBe(0);
    expect(summary.budgetVariance).toBe(0);
  });
});
