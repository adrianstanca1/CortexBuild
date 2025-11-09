import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../../middleware/auth';
import * as projectService from './project.service';
import { createProjectSchema, updateProjectSchema } from './project.schemas';

export const projectRouter = Router();
projectRouter.use(authenticate);

projectRouter.get('/', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const projects = await projectService.listProjects(req.user.tenantId);
  res.json({
    projects: projects.map((project) => ({
      ...project,
      budget: Number(project.budget)
    }))
  });
});

projectRouter.post('/', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const project = await projectService.createProject(req.user.tenantId, parsed.data);
  res.status(201).json({ project: { ...project, budget: Number(project.budget) } });
});

projectRouter.put('/:projectId', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const project = await projectService.updateProject(req.params.projectId, req.user.tenantId, parsed.data);
    res.json({ project: { ...project, budget: Number(project.budget) } });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});
