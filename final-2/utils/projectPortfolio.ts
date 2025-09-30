import { Project, ProjectPortfolioSummary, ProjectStatus, UpcomingProjectDeadline } from '../types';

export const PROJECT_STATUS_ORDER: ReadonlyArray<ProjectStatus> = [
  'PLANNING',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
];

const isProjectStatus = (value: unknown): value is ProjectStatus =>
  typeof value === 'string' && PROJECT_STATUS_ORDER.includes(value as ProjectStatus);

const normaliseStatus = (status: unknown): ProjectStatus => {
  if (isProjectStatus(status)) {
    return status;
  }

  if (typeof status === 'string') {
    const canonical = status.replace(/\s+/g, '_').toUpperCase();
    if (isProjectStatus(canonical)) {
      return canonical;
    }
  }

  return 'PLANNING';
};

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed !== '') {
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
};

export const computeProjectPortfolioSummary = (
  projects: Array<Partial<Project>>
): ProjectPortfolioSummary => {
  const statusBreakdown = PROJECT_STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<ProjectStatus, number>
  );

  let pipelineValue = 0;
  let totalActualCost = 0;
  let activeProjects = 0;
  let completedProjects = 0;
  let atRiskProjects = 0;
  let progressSum = 0;
  let progressCount = 0;
  const deadlines: UpcomingProjectDeadline[] = [];

  const now = new Date();
  const nowTime = now.getTime();
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  projects.forEach((project, index) => {
    const status = normaliseStatus(project.status);
    statusBreakdown[status] = (statusBreakdown[status] ?? 0) + 1;

    if (status === 'ACTIVE') {
      activeProjects += 1;
    }

    if (status === 'COMPLETED') {
      completedProjects += 1;
    }

    const budget = toFiniteNumber(project.budget) ?? 0;
    pipelineValue += budget;

    const actualCost = toFiniteNumber(project.actualCost ?? project.spent) ?? 0;
    totalActualCost += actualCost;

    if (budget > 0 && actualCost > budget) {
      atRiskProjects += 1;
    }

    const progressValue = toFiniteNumber(project.progress);
    if (progressValue !== null) {
      progressSum += progressValue;
      progressCount += 1;
    }

    if (project.endDate) {
      const parsedEndDate = new Date(project.endDate);
      if (!Number.isNaN(parsedEndDate.getTime())) {
        const daysRemaining = Math.ceil((parsedEndDate.getTime() - nowTime) / millisecondsPerDay);
        const id = project.id != null ? String(project.id) : `project-${index}`;
        const name = project.name ?? 'Untitled project';
        const includeInSchedule = status !== 'COMPLETED' && status !== 'CANCELLED';
        const isOverdue = daysRemaining < 0 && status !== 'COMPLETED';

        if (includeInSchedule) {
          deadlines.push({
            id,
            name,
            endDate: parsedEndDate.toISOString(),
            daysRemaining,
            status,
            isOverdue,
          });
        }
      }
    }
  });

  deadlines.sort((a, b) => a.daysRemaining - b.daysRemaining);

  const overdueProjects = deadlines.filter(deadline => deadline.isOverdue).length;
  const totalProjects = projects.length;
  const averageProgress = progressCount > 0 ? progressSum / progressCount : 0;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    atRiskProjects,
    overdueProjects,
    pipelineValue,
    totalActualCost,
    budgetVariance: pipelineValue - totalActualCost,
    averageProgress,
    statusBreakdown,
    upcomingDeadlines: deadlines.slice(0, 5),
  };
};
