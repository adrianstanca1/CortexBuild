import express from 'express';
import { upload, getFileInfo, SUPPORTED_FILE_TYPES } from '../middleware/upload';
import { getDatabase } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const router = express.Router();
const unlinkAsync = promisify(fs.unlink);

// Upload single file
router.post('/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { projectId, companyId, userId, type = 'other', description } = req.body;

    if (!companyId || !userId) {
      // Clean up uploaded file if validation fails
      await unlinkAsync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Company ID and User ID are required'
      });
    }

    const db = getDatabase();
    const fileInfo = getFileInfo(req.file);
    const documentId = uuidv4();

    // Store file metadata in database
    const query = `
      INSERT INTO documents (
        id, project_id, company_id, name, type, file_url, file_size, mime_type, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const relativePath = path.relative(path.join(__dirname, '../../'), req.file.path);
    
    await db.run(query, [
      documentId,
      projectId || null,
      companyId,
      req.file.originalname,
      type,
      relativePath,
      req.file.size,
      req.file.mimetype,
      userId
    ]);

    res.json({
      success: true,
      data: {
        id: documentId,
        filename: fileInfo.filename,
        originalName: fileInfo.originalName,
        size: fileInfo.size,
        mimetype: fileInfo.mimetype,
        category: fileInfo.category,
        url: `/api/uploads/file/${documentId}`
      },
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file on error
    if (req.file) {
      try {
        await unlinkAsync(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload multiple files
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { projectId, companyId, userId, type = 'other' } = req.body;

    if (!companyId || !userId) {
      // Clean up uploaded files if validation fails
      for (const file of req.files) {
        try {
          await unlinkAsync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
      return res.status(400).json({
        success: false,
        message: 'Company ID and User ID are required'
      });
    }

    const db = getDatabase();
    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        const fileInfo = getFileInfo(file);
        const documentId = uuidv4();

        const query = `
          INSERT INTO documents (
            id, project_id, company_id, name, type, file_url, file_size, mime_type, uploaded_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const relativePath = path.relative(path.join(__dirname, '../../'), file.path);
        
        await db.run(query, [
          documentId,
          projectId || null,
          companyId,
          file.originalname,
          type,
          relativePath,
          file.size,
          file.mimetype,
          userId
        ]);

        uploadedFiles.push({
          id: documentId,
          filename: fileInfo.filename,
          originalName: fileInfo.originalName,
          size: fileInfo.size,
          mimetype: fileInfo.mimetype,
          category: fileInfo.category,
          url: `/api/uploads/file/${documentId}`
        });

      } catch (error) {
        console.error('Error processing file:', file.originalname, error);
        // Clean up this file
        try {
          await unlinkAsync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
    }

    res.json({
      success: true,
      data: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    
    // Clean up files on error
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          await unlinkAsync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve uploaded files
router.get('/file/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const document = await db.get(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const filePath = path.join(__dirname, '../../', document.file_url);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${document.name}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving file'
    });
  }
});

// Get file metadata
router.get('/metadata/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const document = await db.get(
      `SELECT d.*, u.first_name, u.last_name, p.name as project_name, c.name as company_name
       FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       LEFT JOIN projects p ON d.project_id = p.id
       LEFT JOIN companies c ON d.company_id = c.id
       WHERE d.id = ?`,
      [id]
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: document.id,
        name: document.name,
        type: document.type,
        size: document.file_size,
        mimeType: document.mime_type,
        uploadedBy: {
          id: document.uploaded_by,
          name: `${document.first_name} ${document.last_name}`
        },
        project: document.project_id ? {
          id: document.project_id,
          name: document.project_name
        } : null,
        company: {
          id: document.company_id,
          name: document.company_name
        },
        createdAt: document.created_at,
        updatedAt: document.updated_at,
        url: `/api/uploads/file/${document.id}`
      }
    });

  } catch (error) {
    console.error('Metadata fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file metadata'
    });
  }
});

// List files with filtering
router.get('/list', async (req, res) => {
  try {
    const { 
      projectId, 
      companyId, 
      type, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    const db = getDatabase();
    let whereConditions = [];
    let params: any[] = [];

    if (projectId) {
      whereConditions.push('d.project_id = ?');
      params.push(projectId);
    }

    if (companyId) {
      whereConditions.push('d.company_id = ?');
      params.push(companyId);
    }

    if (type) {
      whereConditions.push('d.type = ?');
      params.push(type);
    }

    if (search) {
      whereConditions.push('d.name LIKE ?');
      params.push(`%${search}%`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const offset = (Number(page) - 1) * Number(limit);

    const query = `
      SELECT d.*, u.first_name, u.last_name, p.name as project_name, c.name as company_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN companies c ON d.company_id = c.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM documents d
      ${whereClause}
    `;

    const [documents, countResult] = await Promise.all([
      db.all(query, [...params, Number(limit), offset]),
      db.get(countQuery, params)
    ]);

    const total = countResult?.total || 0;
    const pages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.file_size,
        mimeType: doc.mime_type,
        uploadedBy: {
          id: doc.uploaded_by,
          name: `${doc.first_name} ${doc.last_name}`
        },
        project: doc.project_id ? {
          id: doc.project_id,
          name: doc.project_name
        } : null,
        company: {
          id: doc.company_id,
          name: doc.company_name
        },
        createdAt: doc.created_at,
        url: `/api/uploads/file/${doc.id}`
      })),
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages
      }
    });

  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing files'
    });
  }
});

// Delete file
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Should be passed from auth middleware

    const db = getDatabase();

    // Get file info before deletion
    const document = await db.get(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Optional: Check if user has permission to delete (implement based on your auth logic)
    // if (document.uploaded_by !== userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Not authorized to delete this file'
    //   });
    // }

    // Delete from database
    await db.run('DELETE FROM documents WHERE id = ?', [id]);

    // Delete physical file
    const filePath = path.join(__dirname, '../../', document.file_url);
    if (fs.existsSync(filePath)) {
      await unlinkAsync(filePath);
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
});

// Get supported file types
router.get('/supported-types', (req, res) => {
  const typesByCategory = {
    documents: [],
    images: [],
    drawings: []
  };

  for (const [key, config] of Object.entries(SUPPORTED_FILE_TYPES)) {
    const category = config.category === 'other' ? 'documents' : config.category;
    if (category in typesByCategory) {
      (typesByCategory as any)[category].push({
        name: key,
        mimeTypes: config.mimeTypes,
        extensions: config.extensions,
        maxSize: config.maxSize
      });
    }
  }

  res.json({
    success: true,
    data: typesByCategory
  });
});

export default router;