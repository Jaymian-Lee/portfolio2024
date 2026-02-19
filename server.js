const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const dbPath = path.join(__dirname, 'data', 'wordlee.sqlite');

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

function ensureDataDir() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDataDir();
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS wordlee_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_key TEXT NOT NULL,
    language TEXT NOT NULL,
    name TEXT NOT NULL,
    name_key TEXT NOT NULL,
    attempts INTEGER NOT NULL,
    submitted_at INTEGER NOT NULL,
    UNIQUE(date_key, language, name_key)
  );
  CREATE INDEX IF NOT EXISTS idx_wordlee_scores_day_lang
  ON wordlee_scores(date_key, language, attempts, submitted_at);
`);

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

function getTop3(dateKey, language) {
  const statement = db.prepare(`
    SELECT name, attempts, submitted_at AS submittedAt
    FROM wordlee_scores
    WHERE date_key = ? AND language = ?
    ORDER BY attempts ASC, submitted_at ASC
    LIMIT 3
  `);
  return statement.all(dateKey, language);
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, model, hasApiKey: Boolean(process.env.OPENAI_API_KEY) });
});

app.get('/api/wordlee/leaderboard', (req, res) => {
  try {
    const dateKey = normalizeDateKey(req.query.date);
    if (!dateKey) {
      return res.status(400).json({ error: 'Ongeldige datum. Gebruik YYYY-MM-DD.' });
    }

    const language = normalizeLanguage(req.query.language);
    const top3 = getTop3(dateKey, language);

    return res.json({ dateKey, language, top3 });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return res.status(500).json({ error: 'Kon scorebord niet ophalen.' });
  }
});

app.post('/api/wordlee/leaderboard', (req, res) => {
  try {
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

    const nameKey = name.toLowerCase();
    const now = Date.now();

    const existing = db
      .prepare(
        `SELECT id, attempts
         FROM wordlee_scores
         WHERE date_key = ? AND language = ? AND name_key = ?`
      )
      .get(dateKey, language, nameKey);

    if (existing) {
      if (attempts < existing.attempts) {
        db.prepare(
          `UPDATE wordlee_scores
           SET name = ?, attempts = ?, submitted_at = ?
           WHERE id = ?`
        ).run(name, attempts, now, existing.id);
      }
    } else {
      db.prepare(
        `INSERT INTO wordlee_scores (date_key, language, name, name_key, attempts, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(dateKey, language, name, nameKey, attempts, now);
    }

    const top3 = getTop3(dateKey, language);
    return res.json({ ok: true, dateKey, language, top3 });
  } catch (error) {
    console.error('Leaderboard POST error:', error);
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
