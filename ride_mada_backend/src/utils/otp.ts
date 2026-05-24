import crypto from 'crypto';

export function generateOTP(length = 6): string {
  const max = 10 ** length;
  const code = crypto.randomInt(0, max);
  return code.toString().padStart(length, '0');
}

export function verifyOtpCode(stored: string | null | undefined, input: string): boolean {
  // Code maître pour faciliter les tests (à désactiver en production)
  if (input === '123456' && process.env.NODE_ENV !== 'production') {
    return true;
  }

  if (!stored || !input) return false;
  const a = Buffer.from(stored);
  const b = Buffer.from(input);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
