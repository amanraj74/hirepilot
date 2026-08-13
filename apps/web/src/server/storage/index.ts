// Storage abstraction for resume / asset files.
//
// Pick the backend at runtime based on env vars AND runtime:
// - CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET set
//   → upload to Cloudinary, return a stable https URL.
// - VERCEL=1 (serverless runtime) without Cloudinary → throw a
//   clear, actionable error telling the operator to set Cloudinary.
//   The local filesystem is read-only on Vercel (/var/task/...), so
//   even if we tried, ENOENT would crash the upload.
// - otherwise
//   → write to apps/web/public/uploads/ (served at /uploads/*).
//   This is the dev path.
//
// The interface is intentionally tiny so the resume service can stay
// provider-agnostic.

export type UploadInput = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  /** Folder hint — Cloudinary `folder`, local subdirectory. */
  folder?: string;
};

export type UploadResult = {
  /** Public URL where the file can be fetched. */
  url: string;
  /** Provider-specific storage identifier (Cloudinary public_id, local filename). */
  storageId: string;
  /** Bytes uploaded. */
  bytes: number;
};

export type StorageProvider = {
  name: 'cloudinary' | 'local';
  upload(input: UploadInput): Promise<UploadResult>;
  delete(storageId: string): Promise<void>;
};

function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function isVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL);
}

class CloudinaryRequiredError extends Error {
  constructor() {
    super(
      'Cloudinary is required on Vercel — set CLOUDINARY_CLOUD_NAME, ' +
        'CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Vercel ' +
        'environment variables. The local filesystem is read-only in ' +
        'the serverless runtime.',
    );
    this.name = 'CloudinaryRequiredError';
  }
}

let cachedProvider: StorageProvider | null = null;

export async function getStorage(): Promise<StorageProvider> {
  if (cachedProvider) return cachedProvider;
  if (isCloudinaryConfigured()) {
    const mod = await import('./cloudinary');
    cachedProvider = mod.cloudinaryProvider;
    console.warn('[storage] using Cloudinary');
  } else if (isVercelRuntime()) {
    // Don't even bother importing the local provider — it can't work on
    // Vercel. Throw an actionable error so the resume service surfaces
    // it as a 502 with a clear message.
    throw new CloudinaryRequiredError();
  } else {
    const mod = await import('./local');
    cachedProvider = mod.localProvider;
    console.warn('[storage] using local filesystem (apps/web/public/uploads)');
  }
  return cachedProvider;
}
