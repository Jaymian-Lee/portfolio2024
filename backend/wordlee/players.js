const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const isKvConfigured = Boolean(KV_REST_API_URL && KV_REST_API_TOKEN);

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
  const raw = await kvCommand(['HGETALL', `wordlee:players:${language}`]);
  const values = Array.isArray(raw) ? raw.filter((_, index) => index % 2 === 1) : Object.values(raw || {});
  return Array.from(new Set(values.map((name) => String(name || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'nl'));
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const language = normalizeLanguage(req.query?.language);
    const query = normalizeQuery(req.query?.q);

    if (!isKvConfigured) {
      return res.status(200).json({ language, players: [], storage: 'unavailable' });
    }

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
