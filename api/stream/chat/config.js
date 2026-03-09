const { STREAM_CHANNEL, STREAM_MESSAGES_KEY, json, kvCommand } = require('../_shared');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  let youtubeConnected = false;
  let twitchConnected = false;
  try {
    const marker = await kvCommand(['get', 'stream:youtube:connected']);
    youtubeConnected = String(marker || '') === '1';
  } catch {}

  try {
    const rows = await kvCommand(['lrange', STREAM_MESSAGES_KEY, '0', '80']);
    const now = Date.now();
    twitchConnected = (Array.isArray(rows) ? rows : []).some((row) => {
      try {
        const msg = JSON.parse(row);
        return msg?.platform === 'twitch' && Number(msg?.timestamp || 0) > now - 180000;
      } catch {
        return false;
      }
    });
  } catch {}

  return json(res, 200, {
    channel: STREAM_CHANNEL,
    platforms: {
      twitch: { enabled: true, mode: twitchConnected ? 'connected' : 'ready', connected: twitchConnected },
      tiktok: { enabled: true, mode: 'ready', connected: false },
      youtube: { enabled: true, mode: youtubeConnected ? 'connected' : 'ready', connected: youtubeConnected }
    }
  });
};
