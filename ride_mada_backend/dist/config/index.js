"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAdmin = exports.cloudinary = exports.prisma = void 0;
var db_1 = require("./db");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return __importDefault(db_1).default; } });
var cloudinary_1 = require("./cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return __importDefault(cloudinary_1).default; } });
var firebase_1 = require("./firebase");
Object.defineProperty(exports, "firebaseAdmin", { enumerable: true, get: function () { return __importDefault(firebase_1).default; } });
//# sourceMappingURL=index.js.map