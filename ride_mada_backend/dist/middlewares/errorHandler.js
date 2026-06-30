"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const multer_1 = __importDefault(require("multer"));
const errorHandler = (err, _req, res, _next) => {
    const isDev = process.env.NODE_ENV !== 'production';
    if (err instanceof multer_1.default.MulterError) {
        return res.status(400).json({
            success: false,
            message: err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop volumineux (max 5 Mo)' : err.message,
        });
    }
    const statusCode = err?.statusCode ?? 500;
    const message = isDev && err instanceof Error
        ? err.message
        : statusCode >= 500
            ? 'Erreur interne du serveur'
            : err instanceof Error
                ? err.message
                : 'Erreur';
    if (isDev && err instanceof Error) {
        console.error('[ERROR]', err.message, err.stack);
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(isDev && err instanceof Error && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map