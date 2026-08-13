declare module 'qrcode' {
  export interface QRCodeToDataURLOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    type?: 'image/png' | 'image/jpeg' | 'image/webp';
    quality?: number;
    margin?: number;
    width?: number;
    color?: { dark?: string; light?: string };
  }

  export function toDataURL(text: string | URL, options?: QRCodeToDataURLOptions): Promise<string>;
  export function toDataURL(
    text: string | URL,
    options: QRCodeToDataURLOptions,
    callback: (err: Error | null, url: string) => void,
  ): void;
  export function toString(text: string | URL, options?: QRCodeToDataURLOptions): Promise<string>;
}
