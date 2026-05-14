"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockUser = exports.getStatistics = exports.approveDriver = exports.getPendingDrivers = exports.getAllUsers = void 0;
const db_1 = __importDefault(require("../config/db"));
const getAllUsers = async (req, res) => {
    const users = await db_1.default.user.findMany({
        include: { driver: true }
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
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
        return res.status(400).json({ success: false, message: 'Identifiant conducteur manquant' });
    }
    const driver = await db_1.default.driver.update({
        where: { id },
        data: { isApproved: true },
    });
    res.json({ success: true, driver });
};
exports.approveDriver = approveDriver;
const getStatistics = async (req, res) => {
    const totalUsers = await db_1.default.user.count();
    const totalRides = await db_1.default.ride.count();
    const totalBookings = await db_1.default.booking.count();
    res.json({
        success: true,
        stats: { totalUsers, totalRides, totalBookings }
    });
};
exports.getStatistics = getStatistics;
const blockUser = async (req, res) => {
    // Implémenter logique de blocage
    res.json({ success: true, message: "Utilisateur bloqué" });
};
exports.blockUser = blockUser;
//# sourceMappingURL=admin.controller.js.map