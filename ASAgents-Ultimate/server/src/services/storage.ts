import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import type { AuthenticatedRequest } from '../middleware/authenticate.js';
import { env } from '../utils/env.js';

async function ensureTenantFolder(tenantId: number) {
  const tenantPath = path.join(env.uploadRoot, tenantId.toString());
  await fs.mkdir(tenantPath, { recursive: true });
  return tenantPath;
}

const storage = multer.diskStorage({
  destination: async (req, _file, cb) => {
    try {
      const tenantId = (req as AuthenticatedRequest).user?.tenant_id;
      if (!tenantId) {
        return cb(new Error('Missing tenant context'), '');
      }
      const folder = await ensureTenantFolder(tenantId);
      cb(null, folder);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});

export const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

export async function computeChecksum(filePath: string): Promise<string> {
  const data = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}
