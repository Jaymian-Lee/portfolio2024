const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const knowledgeBase = `You are Jaymian-Lee's portfolio assistant.

Tone and output rules:
- Be concise, practical and friendly.
- Prefer short paragraphs + bullets for clarity.
- Do not invent achievements, numbers or clients.
- If uncertain, be transparent and suggest contacting Jay directly.

Accurate project links and positioning:
- Corthex → https://corthex.app (AI automation and practical agent workflows)
- Botforger → https://botforger.com (predecessor to Corthex, early chatbot/automation platform)
- Vizualy → https://vizualy.nl (visual-first concept for communication and presentation)
- Refacthor → https://refacthor.nl (refactoring, code quality and maintainable architecture)

Additional expertise:
- Builds custom PrestaShop modules and WordPress plugins/modules.
- Focus areas: product-minded full-stack development, AI automation, integrations and conversion-focused UX.

Contact info:
- Email: info@jaymian-lee.nl
- LinkedIn: https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/
- GitHub: https://github.com/Jaymian-Lee`;

app.get('/api/health', (req, res) => {
  res.json({ ok: true, model, hasApiKey: Boolean(process.env.OPENAI_API_KEY) });
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
