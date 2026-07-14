const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || '';

let liffInitialized = false;

export async function initLiff(): Promise<void> {
  if (!LIFF_ID) return;
  if (liffInitialized) return;

  try {
    const liff = await import('@line/liff');
    await liff.default.init({ liffId: LIFF_ID });
    liffInitialized = true;
  } catch {
    // LIFF init failed — likely running outside LINE
  }
}

export function isLiffAvailable(): boolean {
  return !!LIFF_ID;
}

export function isInLiffApp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.has('liff.state') || !!document.cookie.includes('liff');
  } catch {
    return false;
  }
}
