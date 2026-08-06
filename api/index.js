// Route every API URL through one Vercel Serverless Function. The Hobby plan
// allows at most 12 functions, while this portfolio exposes more endpoints.
const handlers = {
  'chat': () => require('../backend/chat'),
  'health': () => require('../backend/health'),
  'stream/chat/config': () => require('../backend/stream/chat/config'),
  'stream/chat/ingest': () => require('../backend/stream/chat/ingest'),
  'stream/chat/messages': () => require('../backend/stream/chat/messages'),
  'stream/chat/mock': () => require('../backend/stream/chat/mock'),
  'stream/twitch/live': () => require('../backend/stream/twitch/live'),
  'wordlee/guess': () => require('../backend/wordlee/guess'),
  'wordlee/history': () => require('../backend/wordlee/history'),
  'wordlee/leaderboard': () => require('../backend/wordlee/leaderboard'),
  'wordlee/players': () => require('../backend/wordlee/players'),
  'wordlee/validate-word': () => require('../backend/wordlee/validate-word')
};

function getRoute(req) {
  const rewrittenPath = req.query?.path;
  if (typeof rewrittenPath === 'string' && rewrittenPath) {
    return rewrittenPath.replace(/^\/+|\/+$/g, '');
  }

  const pathname = String(req.url || '').split('?')[0];
  return pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '');
}

module.exports = async function handler(req, res) {
  const loadHandler = handlers[getRoute(req)];

  if (!loadHandler) {
    return res.status(404).json({ error: 'API route not found' });
  }

  return loadHandler()(req, res);
};
