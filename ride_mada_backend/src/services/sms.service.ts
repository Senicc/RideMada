export const sendOTPSMS = async (phone: string, otp: string) => {
  // En production : Intégration MVola, Orange Money SMS, ou API comme AfricasTalking / BulkSMS
  console.log(`[SMS] OTP envoyé au ${phone} → Code: ${otp}`);

  // Exemple simulation
  return {
    success: true,
    message: `OTP ${otp} envoyé à ${phone}`
  };
};

// Service MVola / Orange Money (à étendre)
export const initiateMobileMoneyPayment = async (phone: string, amount: number, orderId: string) => {
  // Intégration réelle via API officielle
  console.log(`[Mobile Money] Paiement de ${amount} Ar demandé sur ${phone}`);
  return { success: true, transactionRef: `TX_${Date.now()}` };
};