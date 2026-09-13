import { getIntaSendConfig, intasendRequest, json } from '../_lib/intasend.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const { leagueId, playerName, phoneNumber, email, entryFee } = req.body || {};
    if (!leagueId || !playerName || !/^254\d{9}$/.test(String(phoneNumber || '')) || !Number.isFinite(entryFee) || entryFee <= 0) {
      return json(res, 400, { error: 'A league ID, player name, Kenyan phone number, and valid entry fee are required.' });
    }
    const config = getIntaSendConfig();
    const reference = `fc-league-${leagueId}-${Date.now()}`;
    const data = await intasendRequest('/checkout/', {
      amount: entryFee,
      currency: 'KES',
      phone_number: phoneNumber,
      email: email || undefined,
      first_name: String(playerName).slice(0, 80),
      api_ref: reference,
      comment: `FC League entry: ${leagueId}`,
      method: '',
      mobile_tarrif: 'CUSTOMER-PAYS',
      card_tarrif: 'CUSTOMER-PAYS',
      host: process.env.APP_URL || 'https://fc-league-app.vercel.app',
      redirect_url: `${process.env.APP_URL || 'https://fc-league-app.vercel.app'}/?payment=return&league=${encodeURIComponent(leagueId)}`,
    }, config);
    return json(res, 200, { checkoutUrl: data.url, reference, state: 'PENDING' });
  } catch (error) {
    return json(res, error.statusCode || 500, { error: error.message || 'Unable to create checkout.' });
  }
}
