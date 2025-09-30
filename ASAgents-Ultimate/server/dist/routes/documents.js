import path from 'node:path';
import { Router } from 'express';
import { upload, computeChecksum } from '../services/storage.js';
import { authenticateUser } from '../middleware/authenticate.js';
import { pool } from '../services/db.js';
const router = Router();
router.post('/', authenticateUser, upload.single('document'), async (req, res) => {
    if (!req.file || !req.user) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const checksum = await computeChecksum(req.file.path);
    const storedName = path.basename(req.file.path);
    const [result] = await pool.execute(`INSERT INTO documents (tenant_id, owner_id, project_id, original_name, stored_name, mime_type, size_bytes, storage_path, checksum)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        req.user.tenant_id,
        req.user.sub,
        req.body.projectId ?? null,
        req.file.originalname,
        storedName,
        req.file.mimetype,
        req.file.size,
        req.file.path,
        checksum
    ]);
    return res.status(201).json({
        id: result.insertId,
        originalName: req.file.originalname,
        storedName,
        path: req.file.path,
        checksum
    });
});
router.get('/', authenticateUser, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }
    const [rows] = await pool.query(`SELECT id, original_name, storage_path, mime_type, size_bytes, uploaded_at
     FROM documents WHERE tenant_id = ? ORDER BY uploaded_at DESC LIMIT 200`, [req.user.tenant_id]);
    return res.json(rows);
});
router.delete('/:id', authenticateUser, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }
    const [rows] = await pool.query(`SELECT storage_path FROM documents WHERE id = ? AND tenant_id = ?`, [req.params.id, req.user.tenant_id]);
    if (!rows[0]) {
        return res.status(404).json({ message: 'Document not found' });
    }
    await pool.execute(`DELETE FROM documents WHERE id = ? AND tenant_id = ?`, [req.params.id, req.user.tenant_id]);
    return res.status(204).send();
});
export default router;
