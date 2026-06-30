/** Champs utilisateur sûrs pour les réponses API (sans secrets). */
export declare const publicUserSelect: {
    readonly id: true;
    readonly name: true;
    readonly phone: true;
    readonly email: true;
    readonly photo: true;
    readonly role: true;
    readonly isVerified: true;
    readonly rating: true;
    readonly createdAt: true;
};
export declare function stripSensitiveUser<T extends Record<string, unknown>>(user: T): Omit<T, "password" | "fcmToken" | "otpCode" | "otpExpires">;
//# sourceMappingURL=userPublic.d.ts.map