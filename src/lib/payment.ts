export const PREMIUM_PRICE = 15000;
export const PREMIUM_PRICE_LABEL = 'Rp\u00a015.000';

const DEFAULT_PAYMENT_URL = 'https://3scode.myr.id/pl/finansialku-premium';

export function getPaymentLink(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_MAYAR_PAYMENT_URL) {
    return process.env.NEXT_PUBLIC_MAYAR_PAYMENT_URL;
  }
  return DEFAULT_PAYMENT_URL;
}

export function getRedirectUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin + window.location.pathname + '?premium=success';
}

export function checkPaymentRedirect(): { paid: boolean; trxId?: string } {
  if (typeof window === 'undefined') return { paid: false };
  const params = new URLSearchParams(window.location.search);
  const s = params.get('premium') || params.get('status') || params.get('payment_status');
  const trxId = params.get('trx_id') || params.get('transaction_id') || undefined;
  if (s === 'success' || s === 'paid' || s === 'completed') {
    return { paid: true, trxId };
  }
  return { paid: false };
}

export function cleanPaymentParams(): void {
  if (typeof window === 'undefined') return;
  if (window.location.search.includes('premium=') || window.location.search.includes('status=')) {
    window.history.replaceState({}, '', window.location.pathname);
  }
}

export async function verifyPayment(trxId?: string): Promise<boolean> {
  const apiUrl = `${window.location.origin}/api/verify-payment`;
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trxId }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}
