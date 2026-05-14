"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserReviews = exports.createReview = void 0;
const db_1 = __importDefault(require("../config/db"));
const createReview = async (req, res) => {
    const reviewerId = req.user?.id;
    if (!reviewerId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const { rideId, reviewedId, rating, comment } = req.body;
    const review = await db_1.default.review.create({
        data: {
            reviewerId,
            reviewedId,
            rideId,
            rating,
            comment,
        },
    });
    res.status(201).json({ success: true, review });
};
exports.createReview = createReview;
const getUserReviews = async (req, res) => {
    const reviewedId = typeof req.params.userId === 'string' ? req.params.userId : req.params.userId?.[0];
    if (!reviewedId) {
        return res.status(400).json({ success: false, message: 'userId requis' });
    }
    const reviews = await db_1.default.review.findMany({
        where: { reviewedId },
        include: { reviewer: { select: { name: true, photo: true } } },
    });
    res.json({ success: true, reviews });
};
exports.getUserReviews = getUserReviews;
//# sourceMappingURL=review.controller.js.map