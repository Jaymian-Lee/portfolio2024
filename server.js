const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const leaderboardFile = path.join(__dirname, 'data', 'wordlee-leaderboard.json');

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

Website structure and features:
- Portfolio sections include hero, services, case studies, experience, selected work, connect, and contact.
- The site includes a multilingual preloader that ends on the word Jaymian-Lee.
- The site includes Wordlee, a daily word game with separate EN/NL daily words and progress.
- On mobile there is a popup for Wordlee that appears once per day.
- Theme and language toggles are available across portfolio and Wordlee pages.

Social and contact:
- Email: info@jaymian-lee.nl
- LinkedIn: https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/
- GitHub: https://github.com/Jaymian-Lee
- Twitch: https://twitch.tv/jaymianlee
- YouTube: https://www.youtube.com/@JaymianLee
- Instagram: https://www.instagram.com/jaymianlee_/

Output constraints:
- Keep answers useful and specific to Jay and the website.
- Do not disclose secrets or implementation internals unless asked.
- Use English or Dutch to match user language.`;

function ensureLeaderboardFile() {
  const dir = path.dirname(leaderboardFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(leaderboardFile)) fs.writeFileSync(leaderboardFile, JSON.stringify({ days: {} }, null, 2));
}

function readLeaderboard() {
  ensureLeaderboardFile();
  try {
    const raw = fs.readFileSync(leaderboardFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.days || typeof parsed.days !== 'object') {
      return { days: {} };
    }
    return parsed;
  } catch {
    return { days: {} };
  }
}

function writeLeaderboard(data) {
  ensureLeaderboardFile();
  fs.writeFileSync(leaderboardFile, JSON.stringify(data, null, 2));
}

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

app.get('/api/health', (req, res) => {
  res.json({ ok: true, model, hasApiKey: Boolean(process.env.OPENAI_API_KEY) });
});

app.get('/api/wordlee/leaderboard', (req, res) => {
  const dateKey = normalizeDateKey(req.query.date);
  if (!dateKey) {
    return res.status(400).json({ error: 'Ongeldige datum. Gebruik YYYY-MM-DD.' });
  }

  const language = normalizeLanguage(req.query.language);
  const data = readLeaderboard();
  const entries = data.days?.[dateKey]?.[language] || [];
  const top3 = entries
    .slice()
    .sort((a, b) => a.attempts - b.attempts || a.submittedAt - b.submittedAt)
    .slice(0, 3)
    .map(({ name, attempts, submittedAt }) => ({ name, attempts, submittedAt }));

  return res.json({ dateKey, language, top3 });
});

app.post('/api/wordlee/leaderboard', (req, res) => {
  const name = normalizeName(req.body?.name);
  const dateKey = normalizeDateKey(req.body?.dateKey);
  const language = normalizeLanguage(req.body?.language);
  const attempts = Number(req.body?.attempts);

  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Vul een geldige naam in (minimaal 2 tekens).' });
  }

  if (!dateKey) {
    return res.status(400).json({ error: 'Ongeldige datum. Gebruik YYYY-MM-DD.' });
  }

  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 6) {
    return res.status(400).json({ error: 'Ongeldige score.' });
  }

  const data = readLeaderboard();
  data.days = data.days || {};
  data.days[dateKey] = data.days[dateKey] || { en: [], nl: [] };
  data.days[dateKey][language] = data.days[dateKey][language] || [];

  const entries = data.days[dateKey][language];
  const normalizedNameKey = name.toLowerCase();
  const now = Date.now();

  const existingIndex = entries.findIndex((entry) => String(entry.name || '').toLowerCase() === normalizedNameKey);
  if (existingIndex >= 0) {
    const current = entries[existingIndex];
    if (attempts < current.attempts) {
      entries[existingIndex] = { ...current, name, attempts, submittedAt: now };
    }
  } else {
    entries.push({ name, attempts, submittedAt: now });
  }

  data.days[dateKey][language] = entries
    .slice()
    .sort((a, b) => a.attempts - b.attempts || a.submittedAt - b.submittedAt)
    .slice(0, 50);

  writeLeaderboard(data);

  const top3 = data.days[dateKey][language]
    .slice(0, 3)
    .map(({ name: entryName, attempts: entryAttempts, submittedAt }) => ({
      name: entryName,
      attempts: entryAttempts,
      submittedAt
    }));

  return res.json({ ok: true, dateKey, language, top3 });
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
