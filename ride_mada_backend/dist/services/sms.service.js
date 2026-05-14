"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateMobileMoneyPayment = exports.sendOTPSMS = void 0;
const sendOTPSMS = async (phone, otp) => {
    // En production : Intégration MVola, Orange Money SMS, ou API comme AfricasTalking / BulkSMS
    console.log(`[SMS] OTP envoyé au ${phone} → Code: ${otp}`);
    // Exemple simulation
    return {
        success: true,
        message: `OTP ${otp} envoyé à ${phone}`
    };
};
exports.sendOTPSMS = sendOTPSMS;
// Service MVola / Orange Money (à étendre)
const initiateMobileMoneyPayment = async (phone, amount, orderId) => {
    // Intégration réelle via API officielle
    console.log(`[Mobile Money] Paiement de ${amount} Ar demandé sur ${phone}`);
    return { success: true, transactionRef: `TX_${Date.now()}` };
};
exports.initiateMobileMoneyPayment = initiateMobileMoneyPayment;
//# sourceMappingURL=sms.service.js.map