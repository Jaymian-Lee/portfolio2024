const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const SCORE_FACTOR = 10 ** 13;

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

function leaderboardKey(dateKey, language) {
  return `wordlee:lb:${dateKey}:${language}`;
}

function leaderboardNamesKey(dateKey, language) {
  return `wordlee:names:${dateKey}:${language}`;
}

function compositeScore(attempts, submittedAt) {
  return attempts * SCORE_FACTOR + submittedAt;
}

function decodeAttempts(score) {
  const n = Number(score || 0);
  return Math.floor(n / SCORE_FACTOR);
}

async function kvCommand(command) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error('KV_NOT_CONFIGURED');
  }

  const response = await fetch(`${KV_REST_API_URL}/${command.join('/')}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.error) {
    throw new Error(json.error || `KV command failed: ${command[0]}`);
  }

  return json.result;
}

async function kvPipeline(commands) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error('KV_NOT_CONFIGURED');
  }

  const response = await fetch(`${KV_REST_API_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commands)
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.error || !Array.isArray(json.result)) {
    throw new Error(json.error || 'KV pipeline failed');
  }

  return json.result.map((item) => {
    if (item?.error) throw new Error(item.error);
    return item?.result;
  });
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
    submittedAt: scores[index] % SCORE_FACTOR
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

      if (!name || name.length < 2) {
        return res.status(400).json({ error: 'Vul een geldige naam in (minimaal 2 tekens).' });
      }

      if (!dateKey) {
        return res.status(400).json({ error: 'Ongeldige datum. Gebruik YYYY-MM-DD.' });
      }

      if (!Number.isInteger(attempts) || attempts < 1 || attempts > 6) {
        return res.status(400).json({ error: 'Ongeldige score.' });
      }

      const now = Date.now();
      const nameKey = name.toLowerCase();
      const key = leaderboardKey(dateKey, language);
      const namesKey = leaderboardNamesKey(dateKey, language);

      const [existingScoreRaw] = await kvPipeline([['ZSCORE', key, nameKey]]);
      const existingAttempts = existingScoreRaw ? decodeAttempts(existingScoreRaw) : null;

      if (existingAttempts === null || attempts < existingAttempts) {
        const score = compositeScore(attempts, now);
        await kvPipeline([
          ['ZADD', key, String(score), nameKey],
          ['HSET', namesKey, nameKey, name]
        ]);
      }

      const top3 = await getTop3(dateKey, language);
      return res.status(200).json({ ok: true, dateKey, language, top3 });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Wordlee leaderboard error:', error);
    if (String(error.message || '').includes('KV_NOT_CONFIGURED')) {
      return res.status(500).json({ error: 'KV env vars ontbreken op de server.' });
    }
    return res.status(500).json({ error: 'Kon scorebord niet verwerken.' });
  }
};
