"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateMobileMoneyPayment = exports.sendOTPSMS = void 0;
const sendOTPSMS = async (phone, otp) => {
    if (process.env.NODE_ENV === 'production') {
        // Intégrer MVola / Orange / AfricasTalking ici
        return { success: true, message: `OTP envoyé à ${phone}` };
    }
    console.log(`[DEV SMS] OTP pour ${phone}`);
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