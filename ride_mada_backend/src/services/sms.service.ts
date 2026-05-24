export const sendOTPSMS = async (phone: string, otp: string) => {
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

// Service MVola / Orange Money (à étendre)
export const initiateMobileMoneyPayment = async (phone: string, amount: number, orderId: string) => {
  // Intégration réelle via API officielle
  console.log(`[Mobile Money] Paiement de ${amount} Ar demandé sur ${phone}`);
  return { success: true, transactionRef: `TX_${Date.now()}` };
};