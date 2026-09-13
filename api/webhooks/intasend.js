import { json } from '../_lib/intasend.js';
import { getAdminApp } from '../_lib/firebase-admin.js';
import admin from 'firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  const payload = req.body || {};
  const expected = process.env.INTASEND_WEBHOOK_CHALLENGE;
  if (!expected || payload.challenge !== expected) return json(res, 401, { error: 'Invalid webhook challenge.' });
  const reference = payload.api_ref;
  if (!reference) return json(res, 400, { error: 'Missing payment reference.' });
  try {
    const db = getAdminApp().firestore();
    const leagueId = String(payload.comment || '').match(/FC League entry:\s*([^\s]+)/)?.[1];
    const record = { reference, state: payload.state || 'PENDING', provider: payload.provider || null, amount: Number(payload.value || payload.amount || 0), currency: payload.currency || 'KES', account: payload.account || null, failedReason: payload.failed_reason || null, updatedAt: admin.firestore.FieldValue.serverTimestamp(), raw: payload };
    await db.doc(`paymentEvents/${reference}`).set(record, { merge: true });
    if (leagueId) await db.doc(`sessions/${leagueId}/payments/${reference}`).set(record, { merge: true });
    const payoutLeagueId = String(payload.narrative || payload.comment || '').match(/FC League prize:\s*([^\s]+)/)?.[1];
    if (payoutLeagueId) {
      await db.doc(`sessions/${payoutLeagueId}/private/payout`).set({
        status: payload.state === 'COMPLETE' ? 'complete' : payload.state === 'FAILED' ? 'failed' : 'pending',
        reference,
        failedReason: payload.failed_reason || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    return json(res, 200, { received: true });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Webhook processing failed.' });
  }
}
