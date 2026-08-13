// TOTP (RFC 6238) helpers for two-factor authentication.
//
// Backed by `otplib` for the crypto + `qrcode` for the QR image.
// Secrets and backup codes are stored hashed on the User's
// TwoFactorAuth row. We never persist the raw TOTP secret or
// recovery code.

import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { createHash } from 'node:crypto';

// 30s time step, 1-step tolerance on each side → ±30s drift OK.
const TOTP_CONFIG = {
  step: 30,
  window: 1,
  digits: 6,
} as const;

export function generateSecret(): string {
  return authenticator.generateSecret();
}

export function verifyTotp(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token: token.trim(), secret, ...TOTP_CONFIG });
  } catch {
    return false;
  }
}

export async function buildQrDataUri(account: string, secret: string): Promise<string> {
  const otpauth = authenticator.keyuri(account, 'HirePilot', secret);
  // 256x256 PNG, dark indigo on white. Margin=2 keeps the QR scannable
  // on phone cameras even at small render sizes.
  return qrcode.toDataURL(otpauth, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
    color: { dark: '#1e1b4b', light: '#ffffff' },
  });
}

const BACKUP_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1
const BACKUP_CODE_LEN = 10;

function randomBackupCode(): string {
  // 10 chars from a 32-symbol alphabet → ~50 bits of entropy per code.
  // 10 codes per user → ~500 bits, plenty to defeat a single online guess.
  const bytes = new Uint8Array(BACKUP_CODE_LEN);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < BACKUP_CODE_LEN; i++) {
    out += BACKUP_CODE_ALPHABET[bytes[i]! % BACKUP_CODE_ALPHABET.length];
  }
  return out;
}

export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => randomBackupCode());
}

export function hashBackupCode(code: string): string {
  // SHA-256 is fine here: codes are 50+ bits of entropy so brute force
  // is impractical; we just don't want the raw codes sitting in the DB.
  const normalized = code.trim().toUpperCase();
  // Synchronous SHA-256 via node:crypto — works in Node + Edge runtime.
  return createHash('sha256').update(normalized).digest('hex');
}

export function verifyBackupCode(code: string, hashedCodes: string[]): boolean {
  const target = hashBackupCode(code);
  // Constant-time compare to avoid timing leaks.
  let match = false;
  for (const h of hashedCodes) {
    let diff = h.length === target.length ? 0 : 1;
    const len = Math.min(h.length, target.length);
    for (let i = 0; i < len; i++) {
      diff |= h.charCodeAt(i) ^ target.charCodeAt(i);
    }
    if (diff === 0) match = true;
  }
  return match;
}
