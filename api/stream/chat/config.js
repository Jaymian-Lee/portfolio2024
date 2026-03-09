const { STREAM_CHANNEL, json, kvCommand } = require('../_shared');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  let youtubeConnected = false;
  try {
    const marker = await kvCommand(['get', 'stream:youtube:connected']);
    youtubeConnected = String(marker || '') === '1';
  } catch {}

  return json(res, 200, {
    channel: STREAM_CHANNEL,
    platforms: {
      twitch: { enabled: true, mode: 'connected', connected: true },
      tiktok: { enabled: true, mode: 'ready', connected: false },
      youtube: { enabled: true, mode: youtubeConnected ? 'connected' : 'ready', connected: youtubeConnected }
    }
  });
};
