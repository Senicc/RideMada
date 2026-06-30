"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.directions = exports.autocomplete = exports.reverse = exports.geocode = void 0;
const googleMaps_service_1 = require("../services/googleMaps.service");
const geocode = async (req, res) => {
    const address = String(req.query.address ?? '').trim();
    if (!address) {
        return res.status(400).json({ success: false, message: 'address requis' });
    }
    const result = await (0, googleMaps_service_1.geocodeAddress)(address);
    res.json({ success: true, ...result });
};
exports.geocode = geocode;
const reverse = async (req, res) => {
    const lat = parseFloat(String(req.query.lat));
    const lng = parseFloat(String(req.query.lng));
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return res.status(400).json({ success: false, message: 'lat et lng requis' });
    }
    const result = await (0, googleMaps_service_1.reverseGeocode)(lat, lng);
    res.json({ success: true, lat, lng, ...result });
};
exports.reverse = reverse;
const autocomplete = async (req, res) => {
    const input = String(req.query.input ?? '').trim();
    if (input.length < 2) {
        return res.json({ success: true, suggestions: [] });
    }
    const suggestions = await (0, googleMaps_service_1.autocompleteAddress)(input);
    res.json({ success: true, suggestions });
};
exports.autocomplete = autocomplete;
const directions = async (req, res) => {
    const originLat = parseFloat(String(req.query.originLat));
    const originLng = parseFloat(String(req.query.originLng));
    const destLat = parseFloat(String(req.query.destLat));
    const destLng = parseFloat(String(req.query.destLng));
    if ([originLat, originLng, destLat, destLng].some(Number.isNaN)) {
        return res.status(400).json({ success: false, message: 'Coordonnées invalides' });
    }
    const result = await (0, googleMaps_service_1.getDirections)(originLat, originLng, destLat, destLng);
    if (!result) {
        return res.status(404).json({ success: false, message: 'Itinéraire introuvable' });
    }
    res.json({ success: true, route: result });
};
exports.directions = directions;
//# sourceMappingURL=map.controller.js.map