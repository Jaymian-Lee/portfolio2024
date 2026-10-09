const OpenAI = require('openai');

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
- Deurwebshop: https://www.deurwebshop.nl/
  - Jay works on this new door-sales project at MartijnKozijn. Stock doors, made-to-measure models, dimension finder and choice guide.
  - Renewed 3D configurator with model-specific dimensions/options, calculated price, rotation, zoom and opening the door. Preview is indicative; technical details require confirmation.
  - Role: Developer at MartijnKozijn. No separate start date, ownership claim or performance metrics established.
- Corthex: https://corthex.app
  - Business-aware AI chatbots that can look up customer and order details, show products and add items to a basket through connected tools.
  - Role: Co-Founder.
  - Timeline: 2026 to present.
- Botforger: https://botforger.com
  - Positioning: early chatbot and automation foundation.
  - Role: Founder.
  - Timeline: 2025 to 2026.
  - Important: Botforger was merged into Corthex.
- Vizualy: https://vizualy.nl
  - AI visualisation of furniture, stairs, frames and doors in a photo of a room or façade. Before/after slider and quote requests. In development; pilot at a first company.
- Slecto: https://slecto.app
  - Guided selling, forms and email marketing in one. Started May 2026; fully working and already in use, still in development.
- Sjmoeleboek: https://sjmoeleboek.nl
  - Free Limburg carnival web app, with groups, Sjmoelkaarten, Sjmoeldex and AI editor Dirk. iOS/Android planned, not released.
- Publion: https://github.com/Jaymian-Lee/publion
  - Public WordPress AI content plugin: planning, SEO briefs, reviewed article drafts and images. Links to Search Console and GA4; no ranking promises.
- Woonproblemen: https://woonproblemen.nl
  - AI content experiment fed by real sources; measures SEO/GEO. No proven traffic or ranking claims.
- Refacthor: https://refacthor.nl
  - Positioning: refactoring, code quality, and sustainable architecture.

Website structure and features:
- Portfolio sections include hero, services, case studies, experience, selected work, connect, and contact.
- The site includes a multilingual preloader that ends on the word Jaymian-Lee.
- The site includes Word-Lee, a daily word game with separate EN/NL daily words and progress.
- There is a popup for Word-Lee that appears once per day.
- Theme and language toggles are available across portfolio and Wordly pages.

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


function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
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

function leaderboardKey(dateKey, language) {
  return `wordlee:lb:${dateKey}:${language}`;
}

function leaderboardNamesKey(dateKey, language) {
  return `wordlee:names:${dateKey}:${language}`;
}

async function kvCommand(command) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;

  const encoded = command.map((part) => encodeURIComponent(String(part)));
  const response = await fetch(`${KV_REST_API_URL}/${encoded.join('/')}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.error) return null;
  return json.result;
}

async function getTop3(dateKey, language) {
  const zrangeResult = await kvCommand(['zrange', leaderboardKey(dateKey, language), '0', '2', 'WITHSCORES']);
  const pairs = Array.isArray(zrangeResult) ? zrangeResult : [];
  if (!pairs.length) return [];

  const members = [];
  const scores = [];
  for (let i = 0; i < pairs.length; i += 2) {
    members.push(String(pairs[i]));
    scores.push(Number(pairs[i + 1]));
  }

  const names = await kvCommand(['hmget', leaderboardNamesKey(dateKey, language), ...members]);

  return members.map((member, index) => ({
    rank: index + 1,
    name: (Array.isArray(names) ? names[index] : null) || member,
    attempts: decodeAttempts(scores[index]),
    ...decodeScoreMeta(scores[index])
  }));
}

async function buildWordleeContext() {
  const dateKey = getTodayKey();
  const [nlTop3, enTop3] = await Promise.all([getTop3(dateKey, 'nl'), getTop3(dateKey, 'en')]);
  return `Word-Lee live leaderboard context (today ${dateKey}):
- NL top3: ${JSON.stringify(nlTop3)}
- EN top3: ${JSON.stringify(enTop3)}
If user asks about standings/winners, use this data. If arrays are empty, say no submitted scores yet.`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OPENAI_API_KEY ontbreekt op de server. Voeg deze toe aan je environment en herstart de API.'
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { messages } = body;

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
    const wordleeContext = await buildWordleeContext();

    const response = await client.responses.create({
      model,
      input: [
        { role: 'system', content: knowledgeBase },
        { role: 'system', content: wordleeContext },
        ...safeMessages.map((m) => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.5
    });

    const answer = response.output_text?.trim();

    if (!answer) {
      return res.status(502).json({ error: 'Geen antwoord ontvangen van het model.' });
    }

    return res.status(200).json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Er ging iets mis bij het ophalen van een AI-antwoord. Probeer het opnieuw.'
    });
  }
};
