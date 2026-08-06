const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

const STREAM_CHANNEL = String(process.env.STREAM_CHANNEL || 'jaymianlee').toLowerCase();
const STREAM_PLATFORM_KEYS = ['twitch', 'tiktok', 'youtube'];
const STREAM_MESSAGES_KEY = 'stream:messages:v1';

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.status(status).json(body);
}

function parsePlatforms(raw) {
  const parsed = String(raw || '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  const valid = parsed.filter((p) => STREAM_PLATFORM_KEYS.includes(p));
  return valid.length ? valid : STREAM_PLATFORM_KEYS;
}

async function kvCommand(command) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error('KV_NOT_CONFIGURED');
  }

  const response = await fetch(`${KV_REST_API_URL}/${command.join('/')}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.error) {
    throw new Error(data?.error || `KV command failed: ${command[0]}`);
  }
  return data?.result;
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

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.error || !Array.isArray(data?.result)) {
    throw new Error(data?.error || 'KV pipeline failed');
  }

  return data.result.map((r) => {
    if (r?.error) throw new Error(r.error);
    return r?.result;
  });
}

function sanitizeMessage(input = {}) {
  const platform = STREAM_PLATFORM_KEYS.includes(String(input.platform || '').toLowerCase())
    ? String(input.platform).toLowerCase()
    : 'twitch';

  const author = String(input.author || 'viewer').slice(0, 48);
  const username = input.username ? String(input.username).slice(0, 48) : null;
  const text = String(input.text || '').slice(0, 500);
  const timestamp = Number.isFinite(Number(input.timestamp)) ? Number(input.timestamp) : Date.now();
  const metadata = input.metadata && typeof input.metadata === 'object' ? input.metadata : {};

  return {
    id: `${platform}-${timestamp}-${Math.random().toString(36).slice(2, 9)}`,
    platform,
    author,
    username,
    text,
    timestamp,
    metadata
  };
}

module.exports = {
  STREAM_CHANNEL,
  STREAM_PLATFORM_KEYS,
  STREAM_MESSAGES_KEY,
  json,
  parsePlatforms,
  kvCommand,
  kvPipeline,
  sanitizeMessage
};
