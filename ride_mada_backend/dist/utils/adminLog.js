"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAdminAction = logAdminAction;
const db_1 = __importDefault(require("../config/db"));
async function logAdminAction(adminId, action, targetId, details) {
    try {
        await db_1.default.adminLog.create({
            data: {
                adminId,
                action,
                targetId: targetId ?? null,
                details: details,
            },
        });
    }
    catch (error) {
        console.error('[AdminLog]', error);
    }
}
//# sourceMappingURL=adminLog.js.map