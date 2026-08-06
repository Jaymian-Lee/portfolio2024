const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const { evaluateGuess, getDailyWord, getTodayKey, normalizeWord } = require('./game');
const isKvConfigured = Boolean(KV_REST_API_URL && KV_REST_API_TOKEN);
const SCORE_FACTOR = 10 ** 13;
const DURATION_MULTIPLIER = 1000;
const LEGACY_SUBMITTED_AT_THRESHOLD = 10 ** 10;
const overviewCache = new Map();

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

function playerIndexKey(language) {
  return `wordlee:players:${language}`;
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

function isCheatScore(attempts, durationMs) {
  return attempts === 1 && Number.isInteger(durationMs) && durationMs >= 0 && durationMs < 1000;
}

function compareLeaderboardEntries(a, b) {
  const aFailed = a.result === 'failed';
  const bFailed = b.result === 'failed';
  if (aFailed !== bFailed) return aFailed ? 1 : -1;
  if (a.attempts !== b.attempts) return a.attempts - b.attempts;

  const aDuration = Number.isInteger(a.durationMs) ? a.durationMs : Number.MAX_SAFE_INTEGER;
  const bDuration = Number.isInteger(b.durationMs) ? b.durationMs : Number.MAX_SAFE_INTEGER;
  if (aDuration !== bDuration) return aDuration - bDuration;

  return Number(a.submittedAt || 0) - Number(b.submittedAt || 0);
}

async function getTop3(dateKey, language) {
  const key = leaderboardKey(dateKey, language);
  const namesKey = leaderboardNamesKey(dateKey, language);

  const zrangeResult = await kvCommand(['zrange', key, '0', '-1', 'WITHSCORES']);
  const pairs = Array.isArray(zrangeResult) ? zrangeResult : [];
  if (pairs.length === 0) return [];

  const members = [];
  const scores = [];
  for (let i = 0; i < pairs.length; i += 2) {
    members.push(String(pairs[i]));
    scores.push(Number(pairs[i + 1]));
  }

  const names = await kvCommand(['hmget', namesKey, ...members]);
  const historyRecords = await Promise.all(
    members.map(async (member) => {
      try {
        const raw = await kvCommand(['HGET', userHistoryKey(member, language), dateKey]);
        return raw ? JSON.parse(String(raw)) : null;
      } catch {
        return null;
      }
    })
  );

  const ranked = members.map((member, index) => ({
    name: (Array.isArray(names) ? names[index] : null) || member,
    attempts: decodeAttempts(scores[index]),
    ...decodeScoreMeta(scores[index]),
    result: historyRecords[index]?.result === 'failed'
      ? 'failed'
      : (historyRecords[index]?.result === 'won' ? 'won' : (decodeAttempts(scores[index]) >= 6 ? 'failed' : 'won'))
  }));

  return ranked
    .filter((entry) => !isCheatScore(entry.attempts, entry.durationMs))
    .sort(compareLeaderboardEntries)
    .slice(0, 3);
}

function getMonthDateKeys(dateKey) {
  const base = new Date(`${dateKey}T00:00:00`);
  const year = base.getFullYear();
  const month = base.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, index) => `${year}-${String(month + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`);
}

function getWeekDateKeys(dateKey) {
  const monday = new Date(`${dateKey}T00:00:00`);
  monday.setDate(monday.getDate() + (monday.getDay() === 0 ? -6 : 1 - monday.getDay()));
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
  });
}

async function getOverview(dateKey, language) {
  const cacheKey = `${language}:${dateKey}`;
  const cached = overviewCache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < 60_000) return cached.value;

  const weekDateKeys = getWeekDateKeys(dateKey);
  const overviewDateKeys = Array.from(new Set([...getMonthDateKeys(dateKey), ...weekDateKeys]));
  const rows = await Promise.all(overviewDateKeys.map(async (key) => ({ dateKey: key, entries: await getTop3(key, language) })));
  const top3 = rows.find((row) => row.dateKey === dateKey)?.entries || [];
  const monthlyWorldRecord = rows
    .filter((row) => row.entries[0])
    .map((row) => ({ ...row.entries[0], dateKey: row.dateKey }))
    .sort((a, b) => compareLeaderboardEntries(a, b) || a.dateKey.localeCompare(b.dateKey))[0] || null;
  const weeklyTopDays = weekDateKeys
    .map((key) => rows.find((row) => row.dateKey === key) || { dateKey: key, entries: [] })
    .filter((row) => row.entries.length > 0)
    .map((row) => ({
      ...row,
      word: row.dateKey < getTodayKey() ? getDailyWord(language, row.dateKey).toUpperCase() : null
    }));
  const value = { top3, monthlyWorldRecord, weeklyTopDays };
  overviewCache.set(cacheKey, { createdAt: Date.now(), value });
  return value;
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const dateKey = normalizeDateKey(req.query?.date);
      if (!dateKey) {
        return res.status(400).json({ error: 'Ongeldige datum. Gebruik YYYY-MM-DD.' });
      }

      const language = normalizeLanguage(req.query?.language);
      if (!isKvConfigured) {
        return res.status(200).json({ dateKey, language, top3: [], storage: 'unavailable' });
      }
      if (req.query?.overview === '1') {
        return res.status(200).json({ dateKey, language, ...(await getOverview(dateKey, language)) });
      }
      const top3 = await getTop3(dateKey, language);
      return res.status(200).json({ dateKey, language, top3 });
    }

    if (req.method === 'POST') {
      if (!isKvConfigured) {
        return res.status(503).json({ error: 'Scorebordopslag is nog niet geconfigureerd.' });
      }
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const name = normalizeName(body?.name);
      const dateKey = normalizeDateKey(body?.dateKey);
      const language = normalizeLanguage(body?.language);
      const durationMs = body?.durationMs === null || body?.durationMs === undefined ? null : Number(body?.durationMs);
      const guesses = Array.isArray(body?.guesses)
        ? body.guesses.map(normalizeWord).filter((guess) => /^[a-z]{5}$/.test(guess)).slice(0, 6)
        : [];

      if (!name || name.length < 2) {
        return res.status(400).json({ error: 'Vul een geldige naam in (minimaal 2 tekens).' });
      }

      if (!dateKey) {
        return res.status(400).json({ error: 'Ongeldige datum. Gebruik YYYY-MM-DD.' });
      }

      if (guesses.length < 1 || guesses.length > 6) {
        return res.status(400).json({ error: 'Ongeldige score.' });
      }

      if (durationMs !== null && (!Number.isInteger(durationMs) || durationMs < 0 || durationMs > 86400000)) {
        return res.status(400).json({ error: 'Ongeldige tijd.' });
      }

      const answer = getDailyWord(language, dateKey);
      const solvedAt = guesses.findIndex((guess) => guess === answer);
      if (solvedAt >= 0 && solvedAt !== guesses.length - 1) {
        return res.status(400).json({ error: 'Ongeldige spelreeks.' });
      }
      if (solvedAt < 0 && guesses.length < 6) {
        return res.status(400).json({ error: 'Rond eerst alle pogingen af.' });
      }
      const attempts = guesses.length;
      const status = solvedAt >= 0 ? 'won' : 'failed';
      const evaluations = guesses.map((guess) => evaluateGuess(guess, answer));

      if (attempts === 1 && durationMs !== null && durationMs < 1000) {
        return res.status(400).json({ error: 'Verdachte score geweigerd.' });
      }

      const now = Date.now();
      const memberKey = nameMemberKey(name);
      const key = leaderboardKey(dateKey, language);
      const namesKey = leaderboardNamesKey(dateKey, language);
      const existingStoredName = await kvCommand(['HGET', namesKey, memberKey]);
      const canonicalName = normalizeName(existingStoredName) || name;

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
        await kvCommand(['HSET', namesKey, memberKey, canonicalName]);
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
        JSON.stringify({ dateKey, language, attempts: historyAttempts, durationMs, submittedAt: now, result: status, guesses, evaluations })
      ]);
      await kvCommand(['HSET', playerIndexKey(language), memberKey, canonicalName]);
      overviewCache.clear();

      const top3 = await getTop3(dateKey, language);
      return res.status(200).json({ ok: true, dateKey, language, top3, result: status });
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
