// Local filesystem storage provider. Writes files to
// apps/web/public/uploads/{folder?}/{filename}. Next.js serves
// anything under public/ at the URL root, so the resulting
// /uploads/... path is fetchable from the browser.
//
// Used by default when CLOUDINARY_* env vars are not set.
//
// In monorepo dev, process.cwd() returns the apps/web folder
// because that's where `next dev` is invoked. In production
// (Vercel), cwd is also the app root. So path.join(cwd,
// 'public', 'uploads') lands inside apps/web/public/uploads.
// We resolve the public dir at call time (not module load) so
// any cwd changes are picked up correctly.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import type { StorageProvider, UploadInput, UploadResult } from './index';

function resolvePublicUploads(): string {
  // Walk up from cwd until we find a folder that contains a
  // 'public' directory. Robust against cwd changes (Vercel
  // sometimes sets cwd to the repo root, not the app dir).
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(dir, 'public'))) {
      return path.join(dir, 'public', 'uploads');
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback: cwd-relative. Will fail at write time if path is wrong.
  return path.join(process.cwd(), 'public', 'uploads');
}

function safeName(filename: string): string {
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
}

export const localProvider: StorageProvider = {
  name: 'local',
  async upload(input: UploadInput): Promise<UploadResult> {
    const publicUploads = resolvePublicUploads();
    const dir = input.folder ? path.join(publicUploads, input.folder) : publicUploads;
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
    const publicUploads = resolvePublicUploads();
    const candidates = [
      path.join(publicUploads, storageId),
      path.join(publicUploads, 'resumes', storageId),
    ];
    for (const candidate of candidates) {
      await fs.unlink(candidate).catch(() => {});
    }
  },
};
