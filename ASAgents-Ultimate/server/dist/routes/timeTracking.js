import { Router } from 'express';
import { authenticateUser } from '../middleware/authenticate.js';
import { TimeTrackingService } from '../services/timeTrackingService.js';
import { logger } from '../utils/logger.js';
/**
 * Time Tracking API Routes
 * Provides comprehensive time tracking functionality
 */
const router = Router();
// Start a new time entry
router.post('/start', authenticateUser, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.sub;
        const { taskId, projectId, description, tags, billable, hourlyRate } = req.body;
        if (!tenantId || !userId) {
            return res.status(400).json({ message: 'Invalid user context' });
        }
        if (!description) {
            return res.status(400).json({ message: 'Description is required' });
        }
        const timeEntry = await TimeTrackingService.startTimeEntry(tenantId, userId, {
            taskId,
            projectId,
            description,
            tags,
            billable,
            hourlyRate
        });
        return res.status(201).json(timeEntry);
    }
    catch (error) {
        logger.error({ error, userId: req.user?.sub }, 'Failed to start time entry');
        return res.status(500).json({
            message: 'Failed to start time entry',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Stop a time entry
router.post('/stop/:timeEntryId', authenticateUser, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.sub;
        const { timeEntryId } = req.params;
        if (!tenantId || !userId) {
            return res.status(400).json({ message: 'Invalid user context' });
        }
        const timeEntry = await TimeTrackingService.stopTimeEntry(tenantId, parseInt(timeEntryId), userId);
        return res.json(timeEntry);
    }
    catch (error) {
        logger.error({ error, timeEntryId: req.params.timeEntryId }, 'Failed to stop time entry');
        return res.status(500).json({
            message: 'Failed to stop time entry',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get current running time entry
router.get('/current', authenticateUser, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.sub;
        if (!tenantId || !userId) {
            return res.status(400).json({ message: 'Invalid user context' });
        }
        const currentEntry = await TimeTrackingService.getCurrentTimeEntry(tenantId, userId);
        return res.json(currentEntry);
    }
    catch (error) {
        logger.error({ error, userId: req.user?.sub }, 'Failed to get current time entry');
        return res.status(500).json({
            message: 'Failed to get current time entry',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get time entries with filters
router.get('/entries', authenticateUser, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.sub;
        const { startDate, endDate, projectId, taskId, billable, limit = '50', offset = '0' } = req.query;
        if (!tenantId || !userId) {
            return res.status(400).json({ message: 'Invalid user context' });
        }
        const filters = {
            startDate: startDate,
            endDate: endDate,
            projectId: projectId ? parseInt(projectId) : undefined,
            taskId: taskId ? parseInt(taskId) : undefined,
            billable: billable === 'true' ? true : billable === 'false' ? false : undefined,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };
        const result = await TimeTrackingService.getTimeEntries(tenantId, userId, filters);
        return res.json(result);
    }
    catch (error) {
        logger.error({ error, userId: req.user?.sub }, 'Failed to get time entries');
        return res.status(500).json({
            message: 'Failed to get time entries',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get time tracking summary for a period
router.get('/summary', authenticateUser, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.sub;
        const { startDate, endDate } = req.query;
        if (!tenantId || !userId) {
            return res.status(400).json({ message: 'Invalid user context' });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }
        const summary = await TimeTrackingService.getTimeTrackingSummary(tenantId, userId, startDate, endDate);
        return res.json(summary);
    }
    catch (error) {
        logger.error({ error, userId: req.user?.sub }, 'Failed to get time tracking summary');
        return res.status(500).json({
            message: 'Failed to get time tracking summary',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get productivity insights
router.get('/insights', authenticateUser, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.sub;
        const { days = '30' } = req.query;
        if (!tenantId || !userId) {
            return res.status(400).json({ message: 'Invalid user context' });
        }
        const insights = await TimeTrackingService.getProductivityInsights(tenantId, userId, parseInt(days));
        return res.json(insights);
    }
    catch (error) {
        logger.error({ error, userId: req.user?.sub }, 'Failed to get productivity insights');
        return res.status(500).json({
            message: 'Failed to get productivity insights',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get team time tracking summary (for managers)
router.get('/team/summary', authenticateUser, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const { startDate, endDate, projectId } = req.query;
        if (!tenantId) {
            return res.status(400).json({ message: 'Invalid user context' });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }
        // This would require additional implementation for team-level access control
        // For now, returning a placeholder response
        return res.json({
            message: 'Team time tracking summary endpoint - implementation pending',
            filters: { startDate, endDate, projectId }
        });
    }
    catch (error) {
        logger.error({ error, tenantId: req.user?.tenant_id }, 'Failed to get team time tracking summary');
        return res.status(500).json({
            message: 'Failed to get team time tracking summary',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get time tracking analytics for specific project
router.get('/project/:projectId/analytics', authenticateUser, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.sub;
        const { projectId } = req.params;
        const { startDate, endDate } = req.query;
        if (!tenantId || !userId) {
            return res.status(400).json({ message: 'Invalid user context' });
        }
        // Default to last 30 days if no dates provided
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        const filters = {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            projectId: parseInt(projectId)
        };
        const result = await TimeTrackingService.getTimeEntries(tenantId, userId, filters);
        // Calculate project-specific analytics
        const totalHours = result.entries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;
        const billableHours = result.entries
            .filter(entry => entry.billable)
            .reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;
        const analytics = {
            projectId: parseInt(projectId),
            period: { startDate: filters.startDate, endDate: filters.endDate },
            totalEntries: result.entries.length,
            totalHours,
            billableHours,
            nonBillableHours: totalHours - billableHours,
            averageSessionLength: result.entries.length > 0
                ? (result.entries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / result.entries.length) / 60
                : 0,
            entries: result.entries
        };
        return res.json(analytics);
    }
    catch (error) {
        logger.error({ error, projectId: req.params.projectId }, 'Failed to get project time tracking analytics');
        return res.status(500).json({
            message: 'Failed to get project analytics',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Export time entries to CSV
router.get('/export', authenticateUser, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.sub;
        const { startDate, endDate, format = 'json' } = req.query;
        if (!tenantId || !userId) {
            return res.status(400).json({ message: 'Invalid user context' });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }
        const filters = {
            startDate: startDate,
            endDate: endDate
        };
        const result = await TimeTrackingService.getTimeEntries(tenantId, userId, filters);
        if (format === 'csv') {
            // Generate CSV format
            const csvHeader = 'Date,Start Time,End Time,Duration (hours),Description,Project,Task,Billable,Rate,Earnings\n';
            const csvRows = result.entries.map(entry => {
                const duration = (entry.duration || 0) / 60;
                const earnings = entry.billable && entry.hourlyRate ? duration * entry.hourlyRate : 0;
                return [
                    entry.startTime.split('T')[0],
                    entry.startTime.split('T')[1]?.split('.')[0] || '',
                    entry.endTime?.split('T')[1]?.split('.')[0] || '',
                    duration.toFixed(2),
                    `"${entry.description}"`,
                    entry.projectId || '',
                    entry.taskId || '',
                    entry.billable ? 'Yes' : 'No',
                    entry.hourlyRate || '',
                    earnings.toFixed(2)
                ].join(',');
            }).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="time-entries-${startDate}-${endDate}.csv"`);
            return res.send(csvHeader + csvRows);
        }
        return res.json(result);
    }
    catch (error) {
        logger.error({ error, userId: req.user?.sub }, 'Failed to export time entries');
        return res.status(500).json({
            message: 'Failed to export time entries',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
export default router;
