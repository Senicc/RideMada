"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReport = void 0;
const db_1 = __importDefault(require("../config/db"));
const createReport = async (req, res) => {
    const reporterId = req.user?.id;
    if (!reporterId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const { reportedId, reason } = req.body;
    if (!reportedId || !reason?.trim()) {
        return res.status(400).json({ success: false, message: 'reportedId et reason requis' });
    }
    if (reportedId === reporterId) {
        return res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous signaler vous-même' });
    }
    const report = await db_1.default.report.create({
        data: { reporterId, reportedId, reason: reason.trim().slice(0, 1000) },
    });
    res.status(201).json({ success: true, report });
};
exports.createReport = createReport;
//# sourceMappingURL=report.controller.js.map