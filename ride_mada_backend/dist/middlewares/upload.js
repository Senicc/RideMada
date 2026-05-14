"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpload = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("../utils/cloudinary");
const storage = multer_1.default.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Seules les images sont autorisées'));
        }
    }
});
// Middleware pour uploader directement sur Cloudinary
const handleUpload = async (req, res, next) => {
    if (!req.file)
        return next();
    try {
        const result = await (0, cloudinary_1.uploadToCloudinary)(req.file);
        const merged = {
            ...((req.body && typeof req.body === 'object' && req.body !== null)
                ? req.body
                : {}),
        };
        merged.photo = result.secure_url;
        req.body = merged;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.handleUpload = handleUpload;
//# sourceMappingURL=upload.js.map