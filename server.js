const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

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

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    model,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    hasKv: Boolean(KV_REST_API_URL && KV_REST_API_TOKEN)
  });
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
    const { messages } = req.body || {};

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

    const response = await client.responses.create({
      model,
      input: [
        { role: 'system', content: knowledgeBase },
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
