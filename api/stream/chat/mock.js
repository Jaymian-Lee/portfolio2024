const { STREAM_MESSAGES_KEY, json, kvPipeline, sanitizeMessage } = require('../_shared');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    const message = sanitizeMessage(req.body || {});
    if (!String(message.text || '').trim()) {
      return json(res, 400, { error: 'Berichttekst ontbreekt.' });
    }

    await kvPipeline([
      ['LPUSH', STREAM_MESSAGES_KEY, JSON.stringify(message)],
      ['LTRIM', STREAM_MESSAGES_KEY, '0', '499']
    ]);

    return json(res, 200, { ok: true, message });
  } catch {
    return json(res, 500, { error: 'Kon mock-bericht niet opslaan.' });
  }
};
