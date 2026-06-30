export type MobileMoneyProvider = 'MVOLA' | 'ORANGE' | 'AIRTEL';

export interface MobileMoneyResult {
  success: boolean;
  transactionRef: string;
  provider: MobileMoneyProvider;
  instructions: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

const PROVIDER_USSD: Record<MobileMoneyProvider, string> = {
  MVOLA: '*111*1*MERCHANT*{amount}#',
  ORANGE: '#144*1*MERCHANT*{amount}#',
  AIRTEL: '*436*MERCHANT*{amount}#',
};

async function callProviderApi(
  provider: MobileMoneyProvider,
  phone: string,
  amount: number,
  reference: string,
): Promise<MobileMoneyResult> {
  const merchantId = process.env[`${provider}_MERCHANT_ID`];
  const apiKey = process.env[`${provider}_API_KEY`];
  const apiUrl = process.env[`${provider}_API_URL`];

  if (merchantId && apiKey && apiUrl) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          merchantId,
          phone,
          amount,
          reference,
          currency: 'MGA',
        }),
      });
      const data = (await res.json()) as { transactionId?: string; status?: string; message?: string };
      if (res.ok && data.transactionId) {
        return {
          success: true,
          transactionRef: data.transactionId,
          provider,
          instructions: data.message ?? 'Confirmez le paiement sur votre téléphone',
          status: 'PROCESSING',
        };
      }
    } catch (error) {
      console.error(`[${provider}]`, error);
    }
  }

  const ref = `${provider}_${Date.now()}_${reference.slice(0, 8)}`;
  const ussd = PROVIDER_USSD[provider].replace('{amount}', String(Math.round(amount)));
  return {
    success: true,
    transactionRef: ref,
    provider,
    instructions: `Composez ${ussd} depuis le ${phone}, réf: ${ref}`,
    status: process.env.NODE_ENV === 'production' ? 'PROCESSING' : 'COMPLETED',
  };
}

export async function initiateMobileMoneyPayment(
  provider: MobileMoneyProvider,
  phone: string,
  amount: number,
  paymentId: string,
): Promise<MobileMoneyResult> {
  const normalized = phone.replace(/\s/g, '');
  if (!/^(\+?261|0)\d{9}$/.test(normalized)) {
    throw new Error('Numéro mobile money invalide');
  }
  return callProviderApi(provider, normalized, amount, paymentId);
}

export async function verifyMobileMoneyWebhook(
  provider: MobileMoneyProvider,
  payload: Record<string, unknown>,
): Promise<{ transactionRef: string; status: 'COMPLETED' | 'FAILED' } | null> {
  const secret = process.env[`${provider}_WEBHOOK_SECRET`];
  if (secret && payload.secret !== secret) return null;

  const ref = String(payload.transactionRef ?? payload.transactionId ?? '');
  const status = String(payload.status ?? '').toUpperCase();
  if (!ref) return null;

  if (['SUCCESS', 'COMPLETED', 'OK'].includes(status)) {
    return { transactionRef: ref, status: 'COMPLETED' };
  }
  if (['FAILED', 'CANCELLED', 'ERROR'].includes(status)) {
    return { transactionRef: ref, status: 'FAILED' };
  }
  return null;
}
