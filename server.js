const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const fs = require('node:fs');
const tmi = require('tmi.js');
const crypto = require('node:crypto');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const SCORE_FACTOR = 10 ** 13;
const DURATION_MULTIPLIER = 1000;
const LEGACY_SUBMITTED_AT_THRESHOLD = 10 ** 10;

const STREAM_DEFAULT_CHANNEL = String(process.env.STREAM_CHANNEL || 'jaymianlee').toLowerCase();
const STREAM_PLATFORM_KEYS = ['twitch', 'tiktok', 'youtube'];
const streamMessages = [];

const TWITCH_BOT_TOKEN_PATH = '/home/jay/.openclaw/credentials/twitch.bot_token.json';
const TWITCH_BOT_USERNAME = process.env.TWITCH_BOT_USERNAME || 'JaymianLeeBot';
let twitchBridgeState = { connected: false, error: null, startedAt: null };

const YT_CLIENT_ID_PATH = '/home/jay/.openclaw/credentials/youtube.client_id';
const YT_CLIENT_SECRET_PATH = '/home/jay/.openclaw/credentials/youtube.client_secret';
const YT_TOKEN_PATH = '/home/jay/.openclaw/credentials/youtube.user_token.json';
const YT_STATE_PATH = '/home/jay/.openclaw/credentials/youtube.oauth_state';
const YT_REDIRECT_URI = process.env.YT_REDIRECT_URI || 'https://jaymian-lee.nl/api/stream/youtube/callback';

function loadYoutubeClientCreds() {
  if (!fs.existsSync(YT_CLIENT_ID_PATH) || !fs.existsSync(YT_CLIENT_SECRET_PATH)) return null;
  return {
    clientId: String(fs.readFileSync(YT_CLIENT_ID_PATH, 'utf8')).trim(),
    clientSecret: String(fs.readFileSync(YT_CLIENT_SECRET_PATH, 'utf8')).trim()
  };
}

function startTwitchChatBridge() {
  try {
    if (!fs.existsSync(TWITCH_BOT_TOKEN_PATH)) {
      twitchBridgeState = { connected: false, error: 'token-missing', startedAt: Date.now() };
      return;
    }

    const token = JSON.parse(fs.readFileSync(TWITCH_BOT_TOKEN_PATH, 'utf8'))?.access_token;
    if (!token) {
      twitchBridgeState = { connected: false, error: 'token-invalid', startedAt: Date.now() };
      return;
    }

    const client = new tmi.Client({
      options: { debug: false },
      identity: {
        username: TWITCH_BOT_USERNAME,
        password: `oauth:${token}`
      },
      channels: [`#${STREAM_DEFAULT_CHANNEL}`]
    });

    client.on('connected', () => {
      twitchBridgeState = { connected: true, error: null, startedAt: Date.now() };
      pushStreamMessage({
        platform: 'twitch',
        author: 'StreamBot',
        text: `Verbonden met Twitch chat: ${STREAM_DEFAULT_CHANNEL}`,
        timestamp: Date.now()
      });
    });

    client.on('disconnected', (reason) => {
      twitchBridgeState = { connected: false, error: String(reason || 'disconnected'), startedAt: Date.now() };
    });

    client.on('message', (channel, tags, message, self) => {
      if (self) return;
      pushStreamMessage({
        platform: 'twitch',
        author: tags?.['display-name'] || tags?.username || 'viewer',
        text: String(message || ''),
        timestamp: Date.now()
      });
    });

    client.connect().catch((error) => {
      twitchBridgeState = { connected: false, error: String(error?.message || error), startedAt: Date.now() };
    });
  } catch (error) {
    twitchBridgeState = { connected: false, error: String(error?.message || error), startedAt: Date.now() };
  }
}

function pushStreamMessage({ platform, author, text, timestamp = Date.now() }) {
  const safePlatform = STREAM_PLATFORM_KEYS.includes(platform) ? platform : 'twitch';
  const safeAuthor = String(author || 'viewer').slice(0, 40);
  const safeText = String(text || '').slice(0, 500);
  const safeTimestamp = Number.isFinite(timestamp) ? timestamp : Date.now();

  if (!safeText.trim()) return;

  streamMessages.push({
    id: `${safePlatform}-${safeTimestamp}-${Math.random().toString(36).slice(2, 8)}`,
    platform: safePlatform,
    author: safeAuthor,
    text: safeText,
    timestamp: safeTimestamp
  });

  if (streamMessages.length > 500) {
    streamMessages.splice(0, streamMessages.length - 500);
  }
}

function seedStreamMessages() {
  if (streamMessages.length > 0) return;

  const now = Date.now();
  pushStreamMessage({
    platform: 'twitch',
    author: 'StreamBot',
    text: `Chat gekoppeld voor ${STREAM_DEFAULT_CHANNEL}.`,
    timestamp: now - 25000
  });
  pushStreamMessage({
    platform: 'youtube',
    author: 'Info',
    text: 'YouTube bron staat klaar voor API-koppeling.',
    timestamp: now - 16000
  });
  pushStreamMessage({
    platform: 'tiktok',
    author: 'Info',
    text: 'TikTok bron staat klaar voor API-koppeling.',
    timestamp: now - 11000
  });
}

seedStreamMessages();
startTwitchChatBridge();

const knowledgeBase = `You are Jaymian-Lee's portfolio assistant.

Core behavior:
- Be concise, practical, warm, and direct.
- Use clear short paragraphs and bullets when helpful.
- Never invent achievements, clients, numbers, or timelines.
- If something is uncertain, say that clearly and suggest contacting Jay.

About Jaymian-Lee:
- Full stack developer focused on AI automation and ecommerce growth.
- Based in Limburg, Netherlands.
- Builds practical digital products with strong UX and maintainable architecture.
- Specializations include AI workflows, chatbot automation, integrations, and product engineering.
- Also develops custom PrestaShop modules and WordPress plugins.

Projects and links:
- Corthex: https://corthex.app
  - Positioning: AI automation and practical workflow systems.
  - Role: Co-Founder.
  - Timeline: 2026 to present.
- Botforger: https://botforger.com
  - Positioning: early chatbot and automation foundation.
  - Role: Founder.
  - Timeline: 2025 to 2026.
  - Important: Botforger was merged into Corthex.
- Vizualy: https://vizualy.nl
  - Positioning: visual communication and presentation focused product concept.
- Refacthor: https://refacthor.nl
  - Positioning: refactoring, code quality, and sustainable architecture.

Output constraints:
- Keep answers useful and specific to Jay and the website.
- Do not disclose secrets or implementation internals unless asked.
- Use English or Dutch to match user language.`;

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
    ...decodeScoreMeta(scores[index])
  }));
}

async function getPlayers(language, query = '') {
  const namesMap = new Map();
  let cursor = '0';
  let loops = 0;

  do {
    const scanResult = await kvCommand(['SCAN', cursor, 'MATCH', `wordlee:names:*:${language}`, 'COUNT', '200']);
    const nextCursor = Array.isArray(scanResult) ? String(scanResult[0] || '0') : '0';
    const keys = Array.isArray(scanResult?.[1]) ? scanResult[1] : [];

    for (const key of keys) {
      const rawMap = await kvCommand(['HGETALL', key]);
      const entries = Array.isArray(rawMap)
        ? rawMap.reduce((acc, value, index) => {
            if (index % 2 === 0) acc.push([value, rawMap[index + 1]]);
            return acc;
          }, [])
        : Object.entries(rawMap || {});

      for (const [memberKey, value] of entries) {
        const name = String(value || '').trim();
        if (!name) continue;

        const historyCount = Number(await kvCommand(['HLEN', `wordlee:user:${language}:${memberKey}`]));
        if (!Number.isFinite(historyCount) || historyCount < 1) continue;

        const normalized = name.toLowerCase();
        if (!namesMap.has(normalized)) namesMap.set(normalized, name);
      }
    }

    cursor = nextCursor;
    loops += 1;
  } while (cursor !== '0' && loops < 25);

  const all = Array.from(namesMap.values()).sort((a, b) => a.localeCompare(b, 'nl'));
  if (!query) return all.slice(0, 200);
  return all.filter((name) => name.toLowerCase().includes(query)).slice(0, 200);
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    model,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    hasKv: Boolean(KV_REST_API_URL && KV_REST_API_TOKEN)
  });
});

app.get('/api/stream/youtube/auth/url', (req, res) => {
  const creds = loadYoutubeClientCreds();
  if (!creds?.clientId) {
    return res.status(500).json({ error: 'YouTube client credentials ontbreken.' });
  }

  const state = crypto.randomBytes(16).toString('hex');
  fs.writeFileSync(YT_STATE_PATH, state);

  const params = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: YT_REDIRECT_URI,
    response_type: 'code',
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent',
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    state
  });

  return res.json({
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    redirectUri: YT_REDIRECT_URI
  });
});

app.get('/api/stream/youtube/callback', async (req, res) => {
  try {
    const code = String(req.query.code || '');
    const state = String(req.query.state || '');
    const expectedState = fs.existsSync(YT_STATE_PATH) ? String(fs.readFileSync(YT_STATE_PATH, 'utf8')).trim() : '';

    if (!code || !state || state !== expectedState) {
      return res.status(400).send('Ongeldige YouTube OAuth callback (state/code).');
    }

    const creds = loadYoutubeClientCreds();
    if (!creds?.clientId || !creds?.clientSecret) {
      return res.status(500).send('YouTube client credentials ontbreken.');
    }

    const tokenBody = new URLSearchParams({
      code,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      redirect_uri: YT_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody.toString()
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.access_token) {
      return res.status(500).send(`Token exchange failed: ${JSON.stringify(data).slice(0, 240)}`);
    }

    fs.writeFileSync(YT_TOKEN_PATH, JSON.stringify({ ...data, obtained_at: Date.now() }, null, 2));
    try { fs.chmodSync(YT_TOKEN_PATH, 0o600); } catch {}

    return res.status(200).send('YouTube is gekoppeld. Je kunt dit venster sluiten.');
  } catch (error) {
    return res.status(500).send(`YouTube callback error: ${String(error?.message || error)}`);
  }
});

app.get('/api/stream/chat/config', (req, res) => {
  res.json({
    channel: STREAM_DEFAULT_CHANNEL,
    platforms: {
      twitch: {
        enabled: true,
        mode: twitchBridgeState.connected ? 'connected' : 'ready',
        connected: twitchBridgeState.connected,
        error: twitchBridgeState.error
      },
      tiktok: { enabled: true, mode: 'ready' },
      youtube: {
        enabled: true,
        mode: fs.existsSync(YT_TOKEN_PATH) ? 'connected' : 'ready',
        connected: fs.existsSync(YT_TOKEN_PATH)
      }
    }
  });
});

app.get('/api/stream/twitch/live', async (req, res) => {
  try {
    const response = await fetch(`https://decapi.me/twitch/uptime/${STREAM_DEFAULT_CHANNEL}`);
    const text = String(await response.text()).trim();
    const lowered = text.toLowerCase();
    const isLive = Boolean(text) && !lowered.includes('not live') && !lowered.includes('offline');

    return res.json({
      channel: STREAM_DEFAULT_CHANNEL,
      live: isLive,
      uptime: text,
      checkedAt: Date.now()
    });
  } catch (error) {
    return res.status(502).json({
      channel: STREAM_DEFAULT_CHANNEL,
      live: null,
      error: 'Kon Twitch live status niet ophalen.'
    });
  }
});

app.get('/api/stream/chat/messages', (req, res) => {
  const rawPlatforms = String(req.query.platforms || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const requestedPlatforms = rawPlatforms.length
    ? rawPlatforms.filter((value) => STREAM_PLATFORM_KEYS.includes(value))
    : STREAM_PLATFORM_KEYS;

  const limit = Math.min(300, Math.max(1, Number(req.query.limit) || 100));

  const filtered = streamMessages
    .filter((message) => requestedPlatforms.includes(message.platform))
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-limit);

  return res.json({
    channel: STREAM_DEFAULT_CHANNEL,
    platforms: requestedPlatforms,
    messages: filtered
  });
});

app.post('/api/stream/chat/mock', (req, res) => {
  const platform = String(req.body?.platform || 'twitch').toLowerCase();
  const author = String(req.body?.author || 'viewer');
  const text = String(req.body?.text || '').trim();

  if (!text) {
    return res.status(400).json({ error: 'Berichttekst ontbreekt.' });
  }

  pushStreamMessage({ platform, author, text, timestamp: Date.now() });
  return res.json({ ok: true });
});

app.get('/api/wordlee/leaderboard', async (req, res) => {
  try {
    const dateKey = normalizeDateKey(req.query.date);
    if (!dateKey) {
      return res.status(400).json({ error: 'Ongeldige datum. Gebruik YYYY-MM-DD.' });
    }

    const language = normalizeLanguage(req.query.language);
    const top3 = await getTop3(dateKey, language);

    return res.json({ dateKey, language, top3 });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    if (String(error.message || '').includes('KV_NOT_CONFIGURED')) {
      return res.status(500).json({ error: 'KV env vars ontbreken op de server.' });
    }
    return res.status(500).json({ error: 'Kon scorebord niet ophalen.' });
  }
});

app.get('/api/wordlee/players', async (req, res) => {
  try {
    const language = normalizeLanguage(req.query.language);
    const query = String(req.query.q || '').trim().toLowerCase().slice(0, 24);
    const players = await getPlayers(language, query);
    return res.json({ language, players });
  } catch (error) {
    console.error('Players GET error:', error);
    if (String(error.message || '').includes('KV_NOT_CONFIGURED')) {
      return res.status(500).json({ error: 'KV env vars ontbreken op de server.' });
    }
    return res.status(500).json({ error: 'Kon spelerslijst niet ophalen.' });
  }
});

app.post('/api/wordlee/leaderboard', async (req, res) => {
  try {
    const name = normalizeName(req.body?.name);
    const dateKey = normalizeDateKey(req.body?.dateKey);
    const language = normalizeLanguage(req.body?.language);
    const attempts = Number(req.body?.attempts);
    const durationMs = req.body?.durationMs === null || req.body?.durationMs === undefined ? null : Number(req.body?.durationMs);

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
    const nameKey = name.toLowerCase();
    const key = leaderboardKey(dateKey, language);
    const namesKey = leaderboardNamesKey(dateKey, language);

    const [existingScoreRaw] = await kvPipeline([
      ['ZSCORE', key, nameKey]
    ]);

    const existingAttempts = existingScoreRaw ? decodeAttempts(existingScoreRaw) : null;
    const existingMeta = existingScoreRaw ? decodeScoreMeta(existingScoreRaw) : { durationMs: null };

    if (
        existingAttempts === null ||
        attempts < existingAttempts ||
        (attempts === existingAttempts &&
          (existingMeta.durationMs === null || (durationMs !== null && durationMs < existingMeta.durationMs)))
      ) {
        const score = compositeScore(attempts, durationMs, now);
      await kvPipeline([
        ['ZADD', key, String(score), nameKey],
        ['HSET', namesKey, nameKey, name]
      ]);
    }

    const top3 = await getTop3(dateKey, language);
    return res.json({ ok: true, dateKey, language, top3 });
  } catch (error) {
    console.error('Leaderboard POST error:', error);
    if (String(error.message || '').includes('KV_NOT_CONFIGURED')) {
      return res.status(500).json({ error: 'KV env vars ontbreken op de server.' });
    }
    return res.status(500).json({ error: 'Kon score niet opslaan.' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OPENAI_API_KEY ontbreekt op de server. Voeg deze toe aan je environment en herstart de API.'
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Geen geldige chatgeschiedenis ontvangen.' });
    }

    const safeMessages = messages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12);

    if (safeMessages.length === 0) {
      return res.status(400).json({ error: 'Geen bruikbare berichten gevonden.' });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const safeContext = context && typeof context === 'object'
      ? JSON.stringify(context).slice(0, 14000)
      : null;

    const systemInput = [{ role: 'system', content: knowledgeBase }];

    if (safeContext) {
      systemInput.push({
        role: 'system',
        content:
          `Website runtime context (from browser localStorage/state, use when relevant):\n${safeContext}\n` +
          'Use this context to answer questions about recent scores, game state, and personal site details. '
      });
    }

    const response = await client.responses.create({
      model,
      input: [
        ...systemInput,
        ...safeMessages.map((m) => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.5
    });

    const answer = response.output_text?.trim();

    if (!answer) {
      return res.status(502).json({ error: 'Geen antwoord ontvangen van het model.' });
    }

    return res.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Er ging iets mis bij het ophalen van een AI-antwoord. Probeer het opnieuw.'
    });
  }
});

app.listen(port, () => {
  console.log(`Portfolio API draait op http://localhost:${port}`);
});
