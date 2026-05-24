/** Champs utilisateur sûrs pour les réponses API (sans secrets). */
export const publicUserSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  photo: true,
  role: true,
  isVerified: true,
  rating: true,
  createdAt: true,
} as const;

export function stripSensitiveUser<T extends Record<string, unknown>>(user: T) {
  const { password, otpCode, otpExpires, fcmToken, ...safe } = user;
  return safe;
}
