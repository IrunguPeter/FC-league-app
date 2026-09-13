const LIVE_BASE_URL = 'https://payment.intasend.com/api/v1';
const TEST_BASE_URL = 'https://sandbox.intasend.com/api/v1';

export function getIntaSendConfig() {
  const publishableKey = process.env.INTASEND_PUBLISHABLE_KEY;
  const secretKey = process.env.INTASEND_SECRET_KEY;
  const testMode = process.env.INTASEND_TEST_MODE === 'true';
  if (!publishableKey || !secretKey) {
    const error = new Error('IntaSend is not configured. Add INTASEND_PUBLISHABLE_KEY and INTASEND_SECRET_KEY in Vercel.');
    error.statusCode = 503;
    throw error;
  }
  return { publishableKey, secretKey, baseUrl: testMode ? TEST_BASE_URL : LIVE_BASE_URL };
}

export async function intasendRequest(path, body, { secretKey, baseUrl }) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secretKey}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || data.message || 'IntaSend request failed.');
    error.statusCode = response.status;
    throw error;
  }
  return data;
}

export function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json').json(body);
}
