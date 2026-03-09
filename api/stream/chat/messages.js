const { STREAM_CHANNEL, STREAM_MESSAGES_KEY, json, kvCommand, parsePlatforms } = require('../_shared');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  try {
    const limit = Math.min(300, Math.max(1, Number(req.query.limit) || 120));
    const platforms = parsePlatforms(req.query.platforms);

    const raw = await kvCommand(['lrange', STREAM_MESSAGES_KEY, '0', String(limit * 3)]).catch(() => []);
    const all = (Array.isArray(raw) ? raw : [])
      .map((row) => {
        try { return JSON.parse(row); } catch { return null; }
      })
      .filter(Boolean)
      .filter((msg) => platforms.includes(msg.platform))
      .sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0))
      .slice(-limit);

    return json(res, 200, {
      channel: STREAM_CHANNEL,
      platforms,
      messages: all
    });
  } catch (error) {
    return json(res, 500, { error: 'Kon chatberichten niet ophalen.' });
  }
};
