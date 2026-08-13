// Storage abstraction for resume / asset files.
//
// Pick the backend at runtime based on env vars:
// - CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET set
//   → upload to Cloudinary, return a stable https URL.
// - otherwise
//   → write to apps/web/public/uploads/ (served at /uploads/*).
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

let cachedProvider: StorageProvider | null = null;

export async function getStorage(): Promise<StorageProvider> {
  if (cachedProvider) return cachedProvider;
  if (isCloudinaryConfigured()) {
    const mod = await import('./cloudinary');
    cachedProvider = mod.cloudinaryProvider;
    console.warn('[storage] using Cloudinary');
  } else {
    const mod = await import('./local');
    cachedProvider = mod.localProvider;
    console.warn('[storage] using local filesystem (apps/web/public/uploads)');
  }
  return cachedProvider;
}
