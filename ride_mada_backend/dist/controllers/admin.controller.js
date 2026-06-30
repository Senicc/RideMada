"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminLogs = exports.getPayments = exports.blockUser = exports.unblockUser = exports.resolveReport = exports.getReports = exports.getActiveRides = exports.getStatistics = exports.rejectDriver = exports.approveDriver = exports.getPendingDrivers = exports.getAllUsers = void 0;
const db_1 = __importDefault(require("../config/db"));
const userPublic_1 = require("../utils/userPublic");
const adminLog_1 = require("../utils/adminLog");
const getAllUsers = async (req, res) => {
    const users = await db_1.default.user.findMany({
        select: {
            ...userPublic_1.publicUserSelect,
            isBlocked: true,
            driver: { select: { id: true, isApproved: true, status: true } },
        },
        take: 100,
        orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, users });
};
exports.getAllUsers = getAllUsers;
const getPendingDrivers = async (req, res) => {
    const drivers = await db_1.default.driver.findMany({
        where: { isApproved: false },
        include: { user: true }
    });
    res.json({ success: true, drivers });
};
exports.getPendingDrivers = getPendingDrivers;
const approveDriver = async (req, res) => {
    const adminId = req.user?.id;
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
        return res.status(400).json({ success: false, message: 'Identifiant conducteur manquant' });
    }
    const driver = await db_1.default.driver.update({
        where: { id },
        data: { isApproved: true },
    });
    await db_1.default.user.update({
        where: { id: driver.userId },
        data: { role: 'DRIVER' },
    });
    if (adminId) {
        await (0, adminLog_1.logAdminAction)(adminId, 'APPROVE_DRIVER', id);
    }
    res.json({ success: true, driver });
};
exports.approveDriver = approveDriver;
const rejectDriver = async (req, res) => {
    const adminId = req.user?.id;
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
        return res.status(400).json({ success: false, message: 'Identifiant conducteur manquant' });
    }
    const driver = await db_1.default.driver.delete({ where: { id } }).catch(() => null);
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Conducteur introuvable' });
    }
    if (adminId) {
        await (0, adminLog_1.logAdminAction)(adminId, 'REJECT_DRIVER', id);
    }
    res.json({ success: true, message: 'Candidature rejetée' });
};
exports.rejectDriver = rejectDriver;
const getStatistics = async (_req, res) => {
    const [totalUsers, totalDrivers, approvedDrivers, pendingDrivers, totalRides, activeRides, totalBookings, pendingReports, revenueAgg,] = await Promise.all([
        db_1.default.user.count(),
        db_1.default.driver.count(),
        db_1.default.driver.count({ where: { isApproved: true } }),
        db_1.default.driver.count({ where: { isApproved: false } }),
        db_1.default.ride.count(),
        db_1.default.ride.count({ where: { status: 'ACTIVE' } }),
        db_1.default.booking.count(),
        db_1.default.report.count({ where: { status: 'PENDING' } }),
        db_1.default.payment.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true },
        }),
    ]);
    res.json({
        success: true,
        stats: {
            totalUsers,
            totalDrivers,
            approvedDrivers,
            pendingDrivers,
            totalRides,
            activeRides,
            totalBookings,
            pendingReports,
            totalRevenue: Number(revenueAgg._sum.amount ?? 0),
        },
    });
};
exports.getStatistics = getStatistics;
const getActiveRides = async (_req, res) => {
    const rides = await db_1.default.ride.findMany({
        where: { status: { in: ['PENDING', 'ACTIVE'] } },
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            driver: { include: { user: { select: { id: true, name: true, phone: true } } } },
            vehicle: true,
            bookings: { include: { passenger: { select: { id: true, name: true, phone: true } } } },
        },
    });
    res.json({ success: true, rides });
};
exports.getActiveRides = getActiveRides;
const getReports = async (_req, res) => {
    const reports = await db_1.default.report.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            reporter: { select: { id: true, name: true, phone: true } },
            reported: { select: { id: true, name: true, phone: true } },
        },
    });
    res.json({ success: true, reports });
};
exports.getReports = getReports;
const resolveReport = async (req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
        return res.status(400).json({ success: false, message: 'Identifiant signalement manquant' });
    }
    const report = await db_1.default.report.update({
        where: { id },
        data: { status: 'RESOLVED' },
    });
    res.json({ success: true, report });
};
exports.resolveReport = resolveReport;
const unblockUser = async (req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
        return res.status(400).json({ success: false, message: 'Identifiant utilisateur manquant' });
    }
    const user = await db_1.default.user.update({
        where: { id },
        data: { isBlocked: false },
        select: { id: true, name: true, phone: true, isBlocked: true },
    });
    res.json({ success: true, message: 'Utilisateur débloqué', user });
};
exports.unblockUser = unblockUser;
const blockUser = async (req, res) => {
    const adminId = req.user?.id;
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
        return res.status(400).json({ success: false, message: 'Identifiant utilisateur manquant' });
    }
    const user = await db_1.default.user.update({
        where: { id },
        data: { isBlocked: true },
        select: { id: true, name: true, phone: true, isBlocked: true },
    });
    if (adminId) {
        await (0, adminLog_1.logAdminAction)(adminId, 'BLOCK_USER', id);
    }
    res.json({ success: true, message: 'Utilisateur bloqué', user });
};
exports.blockUser = blockUser;
const getPayments = async (_req, res) => {
    const payments = await db_1.default.payment.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, phone: true } },
            booking: { include: { ride: true } },
            rideRequest: true,
        },
    });
    res.json({
        success: true,
        payments: payments.map((p) => ({ ...p, amount: Number(p.amount) })),
    });
};
exports.getPayments = getPayments;
const getAdminLogs = async (_req, res) => {
    const logs = await db_1.default.adminLog.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { id: true, name: true } } },
    });
    res.json({ success: true, logs });
};
exports.getAdminLogs = getAdminLogs;
//# sourceMappingURL=admin.controller.js.map