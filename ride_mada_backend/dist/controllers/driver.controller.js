"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriverProfile = exports.getDriverStatus = exports.updateDriverLocation = exports.becomeDriver = void 0;
const db_1 = __importDefault(require("../config/db"));
const becomeDriver = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }
        const { documents } = req.body;
        const driver = await db_1.default.driver.upsert({
            where: { userId },
            update: { documents, isApproved: false },
            create: {
                userId,
                documents,
                isApproved: false,
            },
        });
        res.json({ success: true, driver });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.becomeDriver = becomeDriver;
const updateDriverLocation = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const { lat, lng } = req.body;
    await db_1.default.driver.update({
        where: { userId },
        data: { currentLat: lat, currentLng: lng, status: 'ONLINE' },
    });
    res.json({ success: true });
};
exports.updateDriverLocation = updateDriverLocation;
const getDriverStatus = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const driver = await db_1.default.driver.findUnique({
        where: { userId },
        select: { status: true, currentLat: true, currentLng: true, isApproved: true },
    });
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Profil conducteur introuvable' });
    }
    res.json({ success: true, driver });
};
exports.getDriverStatus = getDriverStatus;
const getDriverProfile = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const driver = await db_1.default.driver.findUnique({
        where: { userId },
        include: { user: true, vehicles: true },
    });
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Profil conducteur introuvable' });
    }
    res.json({ success: true, driver });
};
exports.getDriverProfile = getDriverProfile;
//# sourceMappingURL=driver.controller.js.map