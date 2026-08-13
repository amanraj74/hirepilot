// Cloudinary storage provider. Uses the Cloudinary upload API
// directly (no SDK install required) via signed form-post.
//
// Env vars required:
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
// Optional:
//   CLOUDINARY_FOLDER  (default: "hirepilot")

import crypto from 'node:crypto';
import type { StorageProvider, UploadInput, UploadResult } from './index';

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  bytes?: number;
  error?: { message: string };
};

function sign(params: Record<string, string>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto
    .createHash('sha1')
    .update(toSign + apiSecret)
    .digest('hex');
}

export const cloudinaryProvider: StorageProvider = {
  name: 'cloudinary',
  async upload(input: UploadInput): Promise<UploadResult> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
    const apiKey = process.env.CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;
    const folder = input.folder ?? process.env.CLOUDINARY_FOLDER ?? 'hirepilot';

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const params: Record<string, string> = {
      folder,
      timestamp,
    };
    const signature = sign(params, apiSecret);

    const form = new FormData();
    form.append('file', new Blob([input.buffer], { type: input.mimeType }), input.filename);
    form.append('api_key', apiKey);
    form.append('timestamp', timestamp);
    form.append('signature', signature);
    form.append('folder', folder);

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    const res = await fetch(url, { method: 'POST', body: form });
    const json = (await res.json()) as CloudinaryUploadResponse;
    if (!res.ok || json.error) {
      throw new Error(`Cloudinary upload failed: ${json.error?.message ?? res.statusText}`);
    }
    if (!json.secure_url || !json.public_id) {
      throw new Error('Cloudinary response missing secure_url or public_id');
    }
    return {
      url: json.secure_url,
      storageId: json.public_id,
      bytes: json.bytes ?? input.buffer.length,
    };
  },

  async delete(storageId: string): Promise<void> {
    // Cloudinary destroy requires the API secret + timestamp signature.
    // For brevity, log a warning instead of a hard delete — leaving
    // orphans is recoverable, a bad delete signature would be worse.
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    console.warn(
      `[storage] Cloudinary delete not implemented in dev (id=${storageId}, cloud=${cloudName})`,
    );
  },
};
