const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

function normalizeLanguage(language) {
  return language === 'nl' ? 'nl' : 'en';
}

function normalizeQuery(query) {
  return String(query || '').trim().toLowerCase().slice(0, 24);
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

async function collectPlayerNames(language) {
  const namesMap = new Map();
  let cursor = '0';
  let loops = 0;

  do {
    const result = await kvCommand(['SCAN', cursor, 'MATCH', `wordlee:names:*:${language}`, 'COUNT', '200']);
    const nextCursor = Array.isArray(result) ? String(result[0] || '0') : '0';
    const keys = Array.isArray(result?.[1]) ? result[1] : [];

    for (const key of keys) {
      const rawMap = await kvCommand(['HGETALL', key]);
      const entries = Array.isArray(rawMap)
        ? rawMap.reduce((acc, value, index) => {
            if (index % 2 === 0) acc.push([value, rawMap[index + 1]]);
            return acc;
          }, [])
        : Object.entries(rawMap || {});

      for (const [, value] of entries) {
        const name = String(value || '').trim();
        if (!name) continue;
        const normalized = name.toLowerCase();
        if (!namesMap.has(normalized)) namesMap.set(normalized, name);
      }
    }

    cursor = nextCursor;
    loops += 1;
  } while (cursor !== '0' && loops < 25);

  return Array.from(namesMap.values()).sort((a, b) => a.localeCompare(b, 'nl'));
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const language = normalizeLanguage(req.query?.language);
    const query = normalizeQuery(req.query?.q);

    const all = await collectPlayerNames(language);
    const filtered = query
      ? all.filter((name) => name.toLowerCase().includes(query))
      : all;

    return res.status(200).json({ language, players: filtered.slice(0, 200) });
  } catch (error) {
    console.error('Wordlee players error:', error);
    if (String(error.message || '').includes('KV_NOT_CONFIGURED')) {
      return res.status(500).json({ error: 'KV env vars ontbreken op de server.' });
    }
    return res.status(500).json({ error: 'Kon spelerslijst niet ophalen.' });
  }
};
