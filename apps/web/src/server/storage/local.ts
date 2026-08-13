// Local filesystem storage provider. Writes files to
// apps/web/public/uploads/{folder?/}{filename}. Next.js serves
// anything under public/ at the URL root, so the resulting
// /uploads/... path is fetchable from the browser.
//
// Used by default when CLOUDINARY_* env vars are not set.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import type { StorageProvider, UploadInput, UploadResult } from './index';

const PUBLIC_UPLOADS = path.join(process.cwd(), 'public', 'uploads');

function safeName(filename: string): string {
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
}

export const localProvider: StorageProvider = {
  name: 'local',
  async upload(input: UploadInput): Promise<UploadResult> {
    const dir = input.folder ? path.join(PUBLIC_UPLOADS, input.folder) : PUBLIC_UPLOADS;
    await fs.mkdir(dir, { recursive: true });
    const storedFilename = `${randomBytes(8).toString('hex')}-${safeName(input.filename)}`;
    const fullPath = path.join(dir, storedFilename);
    await fs.writeFile(fullPath, input.buffer);
    const urlPath = input.folder
      ? `/uploads/${input.folder}/${storedFilename}`
      : `/uploads/${storedFilename}`;
    return {
      url: urlPath,
      storageId: storedFilename,
      bytes: input.buffer.length,
    };
  },

  async delete(storageId: string): Promise<void> {
    // Best-effort: try a few likely locations.
    const candidates = [
      path.join(PUBLIC_UPLOADS, storageId),
      path.join(PUBLIC_UPLOADS, 'resumes', storageId),
    ];
    for (const candidate of candidates) {
      await fs.unlink(candidate).catch(() => {});
    }
  },
};
