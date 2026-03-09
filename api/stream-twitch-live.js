const { STREAM_CHANNEL, json } = require('./stream/_shared');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  try {
    const response = await fetch(`https://decapi.me/twitch/uptime/${STREAM_CHANNEL}`);
    const text = String(await response.text()).trim();
    const lowered = text.toLowerCase();
    const live = Boolean(text) && !lowered.includes('not live') && !lowered.includes('offline');
    return json(res, 200, { channel: STREAM_CHANNEL, live, uptime: text, checkedAt: Date.now() });
  } catch {
    return json(res, 502, { channel: STREAM_CHANNEL, live: null, error: 'Kon Twitch live status niet ophalen.' });
  }
};
