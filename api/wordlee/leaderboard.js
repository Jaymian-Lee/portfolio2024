const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const SCORE_FACTOR = 10 ** 13;
const DURATION_MULTIPLIER = 1000;
const LEGACY_SUBMITTED_AT_THRESHOLD = 10 ** 10;

function normalizeName(name) {
  return String(name || '').trim().slice(0, 24);
}

function normalizeDateKey(dateKey) {
  const value = String(dateKey || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function normalizeLanguage(language) {
  return language === 'nl' ? 'nl' : 'en';
}

function nameMemberKey(name) {
  return Buffer.from(String(name || '').toLowerCase(), 'utf8').toString('base64url');
}

function leaderboardKey(dateKey, language) {
  return `wordlee:lb:${dateKey}:${language}`;
}

function leaderboardNamesKey(dateKey, language) {
  return `wordlee:names:${dateKey}:${language}`;
}

function userHistoryKey(memberKey, language) {
  return `wordlee:user:${language}:${memberKey}`;
}

function compositeScore(attempts, durationMs, submittedAt) {
  const safeDuration = Number.isInteger(durationMs) && durationMs >= 0
    ? Math.min(durationMs, Math.floor((SCORE_FACTOR - 1) / DURATION_MULTIPLIER))
    : Math.floor((SCORE_FACTOR - 1) / DURATION_MULTIPLIER);
  const tieBreaker = Number.isInteger(submittedAt) ? Math.max(0, submittedAt % DURATION_MULTIPLIER) : 0;
  return attempts * SCORE_FACTOR + safeDuration * DURATION_MULTIPLIER + tieBreaker;
}

function decodeAttempts(score) {
  const n = Number(score || 0);
  return Math.floor(n / SCORE_FACTOR);
}

function decodeScoreMeta(score) {
  const n = Number(score || 0);
  const lower = n % SCORE_FACTOR;
  if (lower > LEGACY_SUBMITTED_AT_THRESHOLD) {
    return { durationMs: null, submittedAt: lower };
  }
  return {
    durationMs: Math.floor(lower / DURATION_MULTIPLIER),
    submittedAt: null
  };
}

async function kvCommand(command) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error('KV_NOT_CONFIGURED');
  }

  const encoded = command.map((part) => encodeURIComponent(String(part)));
  const response = await fetch(`${KV_REST_API_URL}/${encoded.join('/')}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.error) {
    throw new Error(json.error || `KV command failed: ${command[0]}`);
  }

  return json.result;
}

async function getTop3(dateKey, language) {
  const key = leaderboardKey(dateKey, language);
  const namesKey = leaderboardNamesKey(dateKey, language);

  const zrangeResult = await kvCommand(['zrange', key, '0', '2', 'WITHSCORES']);
  const pairs = Array.isArray(zrangeResult) ? zrangeResult : [];
  if (pairs.length === 0) return [];

  const members = [];
  const scores = [];
  for (let i = 0; i < pairs.length; i += 2) {
    members.push(String(pairs[i]));
    scores.push(Number(pairs[i + 1]));
  }

  const names = await kvCommand(['hmget', namesKey, ...members]);

  return members.map((member, index) => ({
    name: (Array.isArray(names) ? names[index] : null) || member,
    attempts: decodeAttempts(scores[index]),
    ...decodeScoreMeta(scores[index])
  }));
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const dateKey = normalizeDateKey(req.query?.date);
      if (!dateKey) {
        return res.status(400).json({ error: 'Ongeldige datum. Gebruik YYYY-MM-DD.' });
      }

      const language = normalizeLanguage(req.query?.language);
      const top3 = await getTop3(dateKey, language);
      return res.status(200).json({ dateKey, language, top3 });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const name = normalizeName(body?.name);
      const dateKey = normalizeDateKey(body?.dateKey);
      const language = normalizeLanguage(body?.language);
      const attempts = Number(body?.attempts);
      const durationMs = body?.durationMs === null || body?.durationMs === undefined ? null : Number(body?.durationMs);

      if (!name || name.length < 2) {
        return res.status(400).json({ error: 'Vul een geldige naam in (minimaal 2 tekens).' });
      }

      if (!dateKey) {
        return res.status(400).json({ error: 'Ongeldige datum. Gebruik YYYY-MM-DD.' });
      }

      if (!Number.isInteger(attempts) || attempts < 1 || attempts > 6) {
        return res.status(400).json({ error: 'Ongeldige score.' });
      }

      if (durationMs !== null && (!Number.isInteger(durationMs) || durationMs < 0 || durationMs > 86400000)) {
        return res.status(400).json({ error: 'Ongeldige tijd.' });
      }

      const now = Date.now();
      const memberKey = nameMemberKey(name);
      const key = leaderboardKey(dateKey, language);
      const namesKey = leaderboardNamesKey(dateKey, language);

      const existingScoreRaw = await kvCommand(['ZSCORE', key, memberKey]);
      const existingAttempts = existingScoreRaw ? decodeAttempts(existingScoreRaw) : null;
      const existingMeta = existingScoreRaw ? decodeScoreMeta(existingScoreRaw) : { durationMs: null };

      if (
        existingAttempts === null ||
        attempts < existingAttempts ||
        (attempts === existingAttempts &&
          (existingMeta.durationMs === null || (durationMs !== null && durationMs < existingMeta.durationMs)))
      ) {
        const score = compositeScore(attempts, durationMs, now);
        await kvCommand(['ZADD', key, String(score), memberKey]);
        await kvCommand(['HSET', namesKey, memberKey, name]);
      }

      const historyKey = userHistoryKey(memberKey, language);
      const existingHistoryRaw = await kvCommand(['HGET', historyKey, dateKey]);
      let historyAttempts = attempts;

      if (existingHistoryRaw) {
        try {
          const parsed = JSON.parse(existingHistoryRaw);
          if (Number.isInteger(parsed?.attempts)) {
            historyAttempts = Math.min(parsed.attempts, attempts);
          }
        } catch {
          historyAttempts = attempts;
        }
      }

      await kvCommand([
        'HSET',
        historyKey,
        dateKey,
        JSON.stringify({ dateKey, language, attempts: historyAttempts, durationMs, submittedAt: now })
      ]);

      const top3 = await getTop3(dateKey, language);
      return res.status(200).json({ ok: true, dateKey, language, top3 });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Wordlee leaderboard error:', error);
    if (String(error.message || '').includes('KV_NOT_CONFIGURED')) {
      return res.status(500).json({ error: 'KV env vars ontbreken op de server.' });
    }
    return res.status(500).json({ error: 'Kon scorebord niet verwerken.', detail: String(error.message || error) });
  }
};
