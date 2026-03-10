const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

function normalizeName(name) {
  return String(name || '').trim().slice(0, 24);
}

function normalizeLanguage(language) {
  return language === 'nl' ? 'nl' : 'en';
}

function nameMemberKey(name) {
  return Buffer.from(String(name || '').toLowerCase(), 'utf8').toString('base64url');
}

function userHistoryKey(memberKey, language) {
  return `wordlee:user:${language}:${memberKey}`;
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

function parseHistoryMap(result) {
  if (!result) return [];

  let entries = [];
  if (Array.isArray(result)) {
    for (let i = 0; i < result.length; i += 2) {
      entries.push([result[i], result[i + 1]]);
    }
  } else if (typeof result === 'object') {
    entries = Object.entries(result);
  }

  return entries
    .map(([dateKey, raw]) => {
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return {
          dateKey,
          attempts: Number(parsed?.attempts),
          submittedAt: Number(parsed?.submittedAt),
          durationMs: parsed?.durationMs === null || parsed?.durationMs === undefined ? null : Number(parsed?.durationMs)
        };
      } catch {
        return null;
      }
    })
    .filter((x) => x && Number.isInteger(x.attempts) && x.attempts >= 1 && x.attempts <= 6);
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const name = normalizeName(req.query?.name);
    if (!name || name.length < 2) {
      return res.status(400).json({ error: 'Vul een geldige naam in (minimaal 2 tekens).' });
    }

    const language = normalizeLanguage(req.query?.language);
    const memberKey = nameMemberKey(name);
    const key = userHistoryKey(memberKey, language);

    const mapResult = await kvCommand(['HGETALL', key]);
    const history = parseHistoryMap(mapResult);

    const isBetterRecord = (a, b) => {
      if (!b) return true;
      if (a.attempts !== b.attempts) return a.attempts < b.attempts;

      const aDuration = Number.isInteger(a.durationMs) ? a.durationMs : Number.MAX_SAFE_INTEGER;
      const bDuration = Number.isInteger(b.durationMs) ? b.durationMs : Number.MAX_SAFE_INTEGER;
      if (aDuration !== bDuration) return aDuration < bDuration;

      const aSubmittedAt = Number.isInteger(a.submittedAt) ? a.submittedAt : 0;
      const bSubmittedAt = Number.isInteger(b.submittedAt) ? b.submittedAt : 0;
      return aSubmittedAt > bSubmittedAt;
    };

    let bestRecord = null;
    for (const entry of history) {
      if (isBetterRecord(entry, bestRecord)) bestRecord = entry;
    }

    const records = history
      .map((entry) => ({
        ...entry,
        isPR: !!bestRecord
          && entry.dateKey === bestRecord.dateKey
          && Number(entry.attempts) === Number(bestRecord.attempts)
          && Number(entry.submittedAt || 0) === Number(bestRecord.submittedAt || 0)
      }))
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
      .slice(0, 30);
    return res.status(200).json({ name, language, records });
  } catch (error) {
    console.error('Wordlee history error:', error);
    if (String(error.message || '').includes('KV_NOT_CONFIGURED')) {
      return res.status(500).json({ error: 'KV env vars ontbreken op de server.' });
    }
    return res.status(500).json({ error: 'Kon historie niet ophalen.' });
  }
};
