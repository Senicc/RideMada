"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicle = exports.updateVehicle = exports.getMyVehicles = exports.addVehicle = void 0;
const db_1 = __importDefault(require("../config/db"));
async function getDriverIdForUser(userId) {
    const driver = await db_1.default.driver.findUnique({ where: { userId } });
    return driver?.id ?? null;
}
const addVehicle = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const driverId = await getDriverIdForUser(userId);
    if (!driverId) {
        return res.status(400).json({ success: false, message: 'Profil conducteur introuvable' });
    }
    const { brand, model, color, plate, seats, type } = req.body;
    const vehicle = await db_1.default.vehicle.create({
        data: {
            driverId,
            brand,
            model,
            color,
            plate,
            seats,
            type,
        },
    });
    res.status(201).json({ success: true, vehicle });
};
exports.addVehicle = addVehicle;
const getMyVehicles = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const driverId = await getDriverIdForUser(userId);
    if (!driverId) {
        return res.status(400).json({ success: false, message: 'Profil conducteur introuvable' });
    }
    const vehicles = await db_1.default.vehicle.findMany({
        where: { driverId },
    });
    res.json({ success: true, vehicles });
};
exports.getMyVehicles = getMyVehicles;
const updateVehicle = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const driverId = await getDriverIdForUser(userId);
    if (!driverId) {
        return res.status(400).json({ success: false, message: 'Profil conducteur introuvable' });
    }
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
        return res.status(400).json({ success: false, message: 'Identifiant véhicule manquant' });
    }
    const existing = await db_1.default.vehicle.findUnique({ where: { id } });
    if (!existing || existing.driverId !== driverId) {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    const { brand, model, color, plate, seats, type, isActive } = req.body;
    const vehicle = await db_1.default.vehicle.update({
        where: { id },
        data: {
            ...(brand !== undefined && { brand }),
            ...(model !== undefined && { model }),
            ...(color !== undefined && { color }),
            ...(plate !== undefined && { plate }),
            ...(seats !== undefined && { seats }),
            ...(type !== undefined && { type }),
            ...(isActive !== undefined && { isActive }),
        },
    });
    res.json({ success: true, vehicle });
};
exports.updateVehicle = updateVehicle;
const deleteVehicle = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const driverId = await getDriverIdForUser(userId);
    if (!driverId) {
        return res.status(400).json({ success: false, message: 'Profil conducteur introuvable' });
    }
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
        return res.status(400).json({ success: false, message: 'Identifiant véhicule manquant' });
    }
    const existing = await db_1.default.vehicle.findUnique({ where: { id } });
    if (!existing || existing.driverId !== driverId) {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    await db_1.default.vehicle.delete({ where: { id } });
    res.json({ success: true, message: 'Véhicule supprimé' });
};
exports.deleteVehicle = deleteVehicle;
//# sourceMappingURL=vehicle.controller.js.map