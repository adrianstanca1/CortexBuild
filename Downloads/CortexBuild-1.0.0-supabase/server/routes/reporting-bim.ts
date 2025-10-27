/**
 * Reporting & BIM API Routes
 * Handles daily logs, weekly reports, BIM models, clash detection, and sensor data
 */

import { Router } from 'express';
import type { Database } from 'better-sqlite3';
import { getCurrentUser } from '../auth';
import { v4 as uuidv4 } from 'uuid';

export function createReportingBIMRoutes(db: Database) {
  const router = Router();

  // ============================================
  // DAILY LOGS API
  // ============================================

  // Get daily logs
  router.get('/daily-logs', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { projectId, startDate, endDate } = req.query;

      let query = `SELECT * FROM daily_logs WHERE company_id = ?`;
      const params: any[] = [user.companyId];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }

      if (startDate) {
        query += ' AND log_date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND log_date <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY log_date DESC';

      const logs = db.prepare(query).all(...params);

      res.json({ success: true, logs });
    } catch (error: any) {
      console.error('Get daily logs error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get single daily log
  router.get('/daily-logs/:id', getCurrentUser, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const log = db.prepare(`
        SELECT * FROM daily_logs
        WHERE id = ? AND company_id = ?
      `).get(id, user.companyId);

      if (!log) {
        return res.status(404).json({ error: 'Daily log not found' });
      }

      res.json({ success: true, log });
    } catch (error: any) {
      console.error('Get daily log error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create daily log
  router.post('/daily-logs', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const {
        projectId,
        logDate,
        weatherConditions,
        temperatureHigh,
        temperatureLow,
        workPerformed,
        crewCount,
        equipmentOnSite,
        materialsDelivered,
        visitors,
        safetyIncidents,
        delays,
        issues,
        photos
      } = req.body;

      // Check if log already exists for this project and date
      const existing = db.prepare(`
        SELECT id FROM daily_logs
        WHERE project_id = ? AND log_date = ?
      `).get(projectId, logDate);

      if (existing) {
        return res.status(400).json({ error: 'Daily log already exists for this date' });
      }

      const result = db.prepare(`
        INSERT INTO daily_logs (
          company_id, project_id, log_date, weather_conditions,
          temperature_high, temperature_low, work_performed, crew_count,
          equipment_on_site, materials_delivered, visitors, safety_incidents,
          delays, issues, photos, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        user.companyId,
        projectId,
        logDate,
        weatherConditions || null,
        temperatureHigh || null,
        temperatureLow || null,
        workPerformed,
        crewCount || null,
        equipmentOnSite ? JSON.stringify(equipmentOnSite) : null,
        materialsDelivered ? JSON.stringify(materialsDelivered) : null,
        visitors ? JSON.stringify(visitors) : null,
        safetyIncidents ? JSON.stringify(safetyIncidents) : null,
        delays || null,
        issues || null,
        photos ? JSON.stringify(photos) : null,
        user.userId
      );

      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error: any) {
      console.error('Create daily log error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update daily log
  router.put('/daily-logs/:id', getCurrentUser, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const {
        weatherConditions,
        temperatureHigh,
        temperatureLow,
        workPerformed,
        crewCount,
        delays,
        issues
      } = req.body;

      db.prepare(`
        UPDATE daily_logs
        SET weather_conditions = ?, temperature_high = ?, temperature_low = ?,
            work_performed = ?, crew_count = ?, delays = ?, issues = ?,
            updated_at = datetime('now')
        WHERE id = ? AND company_id = ?
      `).run(
        weatherConditions || null,
        temperatureHigh || null,
        temperatureLow || null,
        workPerformed,
        crewCount || null,
        delays || null,
        issues || null,
        id,
        user.companyId
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update daily log error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // WEEKLY REPORTS API
  // ============================================

  // Get weekly reports
  router.get('/weekly-reports', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { projectId, startDate, endDate } = req.query;

      let query = `SELECT * FROM weekly_reports WHERE company_id = ?`;
      const params: any[] = [user.companyId];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }

      if (startDate) {
        query += ' AND week_start_date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND week_end_date <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY week_start_date DESC';

      const reports = db.prepare(query).all(...params);

      res.json({ success: true, reports });
    } catch (error: any) {
      console.error('Get weekly reports error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create weekly report
  router.post('/weekly-reports', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const {
        projectId,
        weekStartDate,
        weekEndDate,
        overallProgress,
        workCompleted,
        workPlanned,
        issuesRisks,
        budgetStatus,
        scheduleStatus,
        safetySummary,
        photos
      } = req.body;

      const result = db.prepare(`
        INSERT INTO weekly_reports (
          company_id, project_id, week_start_date, week_end_date,
          overall_progress, work_completed, work_planned, issues_risks,
          budget_status, schedule_status, safety_summary, photos,
          created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        user.companyId,
        projectId,
        weekStartDate,
        weekEndDate,
        overallProgress || 0,
        workCompleted,
        workPlanned,
        issuesRisks || null,
        budgetStatus || null,
        scheduleStatus || null,
        safetySummary || null,
        photos ? JSON.stringify(photos) : null,
        user.userId
      );

      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error: any) {
      console.error('Create weekly report error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // BIM MODELS API
  // ============================================

  // Get BIM models
  router.get('/bim-models', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { projectId, discipline } = req.query;

      let query = `SELECT * FROM bim_models WHERE company_id = ?`;
      const params: any[] = [user.companyId];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }

      if (discipline) {
        query += ' AND discipline = ?';
        params.push(discipline);
      }

      query += ' ORDER BY created_at DESC';

      const models = db.prepare(query).all(...params);

      res.json({ success: true, models });
    } catch (error: any) {
      console.error('Get BIM models error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create BIM model
  router.post('/bim-models', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const {
        projectId,
        modelName,
        fileId,
        fileFormat,
        version,
        discipline,
        modelDate,
        fileSize,
        thumbnailUrl,
        viewerUrl,
        metadata
      } = req.body;

      const result = db.prepare(`
        INSERT INTO bim_models (
          company_id, project_id, model_name, file_id, file_format,
          version, discipline, model_date, file_size, thumbnail_url,
          viewer_url, metadata, uploaded_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        user.companyId,
        projectId,
        modelName,
        fileId,
        fileFormat,
        version || '1.0',
        discipline || null,
        modelDate || null,
        fileSize || null,
        thumbnailUrl || null,
        viewerUrl || null,
        metadata ? JSON.stringify(metadata) : null,
        user.userId
      );

      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error: any) {
      console.error('Create BIM model error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // CLASH DETECTION API
  // ============================================

  // Get clash detections
  router.get('/clash-detections', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { projectId, modelId, status, severity } = req.query;

      let query = `SELECT * FROM clash_detections WHERE company_id = ?`;
      const params: any[] = [user.companyId];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }

      if (modelId) {
        query += ' AND model_id = ?';
        params.push(modelId);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      if (severity) {
        query += ' AND severity = ?';
        params.push(severity);
      }

      query += ' ORDER BY severity DESC, created_at DESC';

      const clashes = db.prepare(query).all(...params);

      res.json({ success: true, clashes });
    } catch (error: any) {
      console.error('Get clash detections error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create clash detection
  router.post('/clash-detections', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const {
        projectId,
        modelId,
        clashName,
        severity,
        element1,
        element2,
        clashPoint,
        description,
        assignedTo
      } = req.body;

      const result = db.prepare(`
        INSERT INTO clash_detections (
          company_id, project_id, model_id, clash_name, severity,
          element_1, element_2, clash_point, description, assigned_to,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        user.companyId,
        projectId,
        modelId,
        clashName,
        severity || 'medium',
        element1,
        element2,
        clashPoint ? JSON.stringify(clashPoint) : null,
        description || null,
        assignedTo || null
      );

      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error: any) {
      console.error('Create clash detection error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update clash detection status
  router.put('/clash-detections/:id', getCurrentUser, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const { status, resolution, resolvedDate } = req.body;

      db.prepare(`
        UPDATE clash_detections
        SET status = ?, resolution = ?, resolved_date = ?, updated_at = datetime('now')
        WHERE id = ? AND company_id = ?
      `).run(
        status,
        resolution || null,
        resolvedDate || null,
        id,
        user.companyId
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update clash detection error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // IOT SENSOR DATA API
  // ============================================

  // Get sensor data
  router.get('/sensor-data', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { projectId, sensorId, sensorType, startTime, endTime, limit = 1000 } = req.query;

      let query = `SELECT * FROM sensor_data WHERE company_id = ?`;
      const params: any[] = [user.companyId];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }

      if (sensorId) {
        query += ' AND sensor_id = ?';
        params.push(sensorId);
      }

      if (sensorType) {
        query += ' AND sensor_type = ?';
        params.push(sensorType);
      }

      if (startTime) {
        query += ' AND timestamp >= ?';
        params.push(startTime);
      }

      if (endTime) {
        query += ' AND timestamp <= ?';
        params.push(endTime);
      }

      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(Number(limit));

      const data = db.prepare(query).all(...params);

      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Get sensor data error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create sensor data (bulk insert)
  router.post('/sensor-data/bulk', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { projectId, readings } = req.body;

      if (!Array.isArray(readings)) {
        return res.status(400).json({ error: 'readings must be an array' });
      }

      const stmt = db.prepare(`
        INSERT INTO sensor_data (
          company_id, project_id, sensor_id, sensor_type, value, unit,
          location, gps_coordinates, metadata, timestamp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      const transaction = db.transaction((readings: any[]) => {
        for (const reading of readings) {
          stmt.run(
            user.companyId,
            projectId,
            reading.sensorId,
            reading.sensorType,
            reading.value,
            reading.unit,
            reading.location || null,
            reading.gpsCoordinates ? JSON.stringify(reading.gpsCoordinates) : null,
            reading.metadata ? JSON.stringify(reading.metadata) : null,
            reading.timestamp
          );
        }
      });

      transaction(readings);

      res.json({ success: true, count: readings.length });
    } catch (error: any) {
      console.error('Bulk insert sensor data error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get sensor data aggregations (for charts)
  router.get('/sensor-data/aggregations', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { projectId, sensorId, sensorType, interval = 'hour', startTime, endTime } = req.query;

      // Define time grouping based on interval
      let timeFormat = '%Y-%m-%d %H:00:00'; // hour
      if (interval === 'day') timeFormat = '%Y-%m-%d';
      if (interval === 'minute') timeFormat = '%Y-%m-%d %H:%M:00';

      let query = `
        SELECT
          strftime('${timeFormat}', timestamp) as time_bucket,
          sensor_type,
          AVG(value) as avg_value,
          MIN(value) as min_value,
          MAX(value) as max_value,
          COUNT(*) as reading_count
        FROM sensor_data
        WHERE company_id = ?
      `;
      const params: any[] = [user.companyId];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }

      if (sensorId) {
        query += ' AND sensor_id = ?';
        params.push(sensorId);
      }

      if (sensorType) {
        query += ' AND sensor_type = ?';
        params.push(sensorType);
      }

      if (startTime) {
        query += ' AND timestamp >= ?';
        params.push(startTime);
      }

      if (endTime) {
        query += ' AND timestamp <= ?';
        params.push(endTime);
      }

      query += ' GROUP BY time_bucket, sensor_type ORDER BY time_bucket DESC';

      const aggregations = db.prepare(query).all(...params);

      res.json({ success: true, aggregations });
    } catch (error: any) {
      console.error('Get sensor aggregations error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // FILE UPLOADS API
  // ============================================

  // Get file uploads
  router.get('/files', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { projectId, category } = req.query;

      let query = `SELECT * FROM file_uploads WHERE company_id = ?`;
      const params: any[] = [user.companyId];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' ORDER BY created_at DESC';

      const files = db.prepare(query).all(...params);

      res.json({ success: true, files });
    } catch (error: any) {
      console.error('Get file uploads error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create file upload record
  router.post('/files', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const {
        projectId,
        originalFilename,
        storedFilename,
        filePath,
        fileSize,
        mimeType,
        fileHash,
        thumbnailPath,
        category,
        tags,
        isPublic,
        metadata
      } = req.body;

      const id = uuidv4();

      const result = db.prepare(`
        INSERT INTO file_uploads (
          id, company_id, project_id, uploader_id, original_filename,
          stored_filename, file_path, file_size, mime_type, file_hash,
          thumbnail_path, category, tags, is_public, metadata,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        id,
        user.companyId,
        projectId || null,
        user.userId,
        originalFilename,
        storedFilename,
        filePath,
        fileSize,
        mimeType,
        fileHash || null,
        thumbnailPath || null,
        category || 'document',
        tags ? JSON.stringify(tags) : null,
        isPublic || 0,
        metadata ? JSON.stringify(metadata) : null
      );

      res.json({ success: true, id });
    } catch (error: any) {
      console.error('Create file upload error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
