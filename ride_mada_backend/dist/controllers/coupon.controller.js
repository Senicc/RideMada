"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateCoupon = exports.listCoupons = exports.createCoupon = exports.validateCoupon = void 0;
const db_1 = __importDefault(require("../config/db"));
const adminLog_1 = require("../utils/adminLog");
const validateCoupon = async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ success: false, message: 'Code requis' });
    }
    const coupon = await db_1.default.coupon.findFirst({
        where: { code: code.toUpperCase(), isActive: true, validUntil: { gt: new Date() } },
    });
    if (!coupon || coupon.timesUsed >= coupon.usageLimit) {
        return res.status(404).json({ success: false, message: 'Code promo invalide ou expiré' });
    }
    res.json({
        success: true,
        coupon: {
            code: coupon.code,
            discount: Number(coupon.discount),
            type: coupon.type,
        },
    });
};
exports.validateCoupon = validateCoupon;
const createCoupon = async (req, res) => {
    const adminId = req.user?.id;
    const { code, discount, type, validUntil, usageLimit } = req.body;
    const coupon = await db_1.default.coupon.create({
        data: {
            code: code.toUpperCase(),
            discount,
            type: type ?? 'FIXED',
            validUntil: new Date(validUntil),
            usageLimit: usageLimit ?? 100,
        },
    });
    if (adminId) {
        await (0, adminLog_1.logAdminAction)(adminId, 'CREATE_COUPON', coupon.id, { code: coupon.code });
    }
    res.status(201).json({
        success: true,
        coupon: { ...coupon, discount: Number(coupon.discount) },
    });
};
exports.createCoupon = createCoupon;
const listCoupons = async (_req, res) => {
    const coupons = await db_1.default.coupon.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({
        success: true,
        coupons: coupons.map((c) => ({ ...c, discount: Number(c.discount) })),
    });
};
exports.listCoupons = listCoupons;
const deactivateCoupon = async (req, res) => {
    const adminId = req.user?.id;
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
        return res.status(400).json({ success: false, message: 'Identifiant manquant' });
    }
    const coupon = await db_1.default.coupon.update({
        where: { id },
        data: { isActive: false },
    });
    if (adminId) {
        await (0, adminLog_1.logAdminAction)(adminId, 'DEACTIVATE_COUPON', id);
    }
    res.json({ success: true, coupon: { ...coupon, discount: Number(coupon.discount) } });
};
exports.deactivateCoupon = deactivateCoupon;
//# sourceMappingURL=coupon.controller.js.map