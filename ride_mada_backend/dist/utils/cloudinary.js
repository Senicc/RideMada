"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const fs_1 = __importDefault(require("fs"));
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
function uploadBuffer(buffer) {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader
            .upload_stream({ folder: 'ridemada/profiles', transformation: [{ width: 400, crop: 'limit' }] }, (error, result) => (error ? reject(error) : resolve(result)))
            .end(buffer);
    });
}
const uploadToCloudinary = async (file) => {
    if (file.buffer) {
        return uploadBuffer(file.buffer);
    }
    if (file.path) {
        try {
            const result = await cloudinary_1.v2.uploader.upload(file.path, {
                folder: 'ridemada/profiles',
                transformation: [{ width: 400, crop: 'limit' }],
            });
            return result;
        }
        finally {
            fs_1.default.unlink(file.path, () => undefined);
        }
    }
    throw new Error('Fichier invalide pour upload');
};
exports.uploadToCloudinary = uploadToCloudinary;
//# sourceMappingURL=cloudinary.js.map