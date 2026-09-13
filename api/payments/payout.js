import { getIntaSendConfig, intasendRequest, json } from '../_lib/intasend.js';
import { getAdminApp, requireUser } from '../_lib/firebase-admin.js';
import admin from 'firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const host = await requireUser(req);
    const { leagueId, winnerName, winnerPhone, amount } = req.body || {};
    if (!leagueId || !winnerName || !/^254\d{9}$/.test(String(winnerPhone || '')) || !Number.isFinite(amount) || amount <= 0) {
      return json(res, 400, { error: 'League, winner, Kenyan phone number, and payout amount are required.' });
    }
    const db = getAdminApp().firestore();
    const sessionRef = db.doc(`sessions/${leagueId}`);
    const payoutRef = db.doc(`sessions/${leagueId}/private/payout`);
    const sessionSnap = await sessionRef.get();
    if (!sessionSnap.exists || sessionSnap.data().ownerId !== host.uid) return json(res, 403, { error: 'Only the league host can release funds.' });
    const session = sessionSnap.data();
    if (!session.paid?.enabled) return json(res, 400, { error: 'This is not a paid league.' });
    if (Math.round(Number(session.paid.prizePool)) !== Math.round(amount)) return json(res, 400, { error: 'Payout amount does not match the league prize pool.' });
    const existing = await payoutRef.get();
    if (existing.exists && ['pending', 'complete'].includes(existing.data().status)) return json(res, 409, { error: 'Prize release has already been started.', payout: existing.data() });
    await payoutRef.set({ status: 'pending', winnerName, winnerPhone, amount, releasedBy: host.uid, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

    const config = getIntaSendConfig();
    const initiated = await intasendRequest('/send-money/initiate/', { currency: 'KES', requires_approval: 'YES', transactions: [{ name: winnerName, account: winnerPhone, amount: String(amount), narrative: `FC League prize: ${leagueId}` }] }, config);
    const approved = await intasendRequest('/send-money/approve/', initiated, config);
    const reference = approved.tracking_id || approved.transaction_id || initiated.tracking_id || initiated.transaction_id || leagueId;
    await payoutRef.set({ status: 'submitted', reference, providerResponse: approved, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return json(res, 200, { status: 'submitted', reference });
  } catch (error) {
    return json(res, error.statusCode || 500, { error: error.message || 'Unable to release prize.' });
  }
}
