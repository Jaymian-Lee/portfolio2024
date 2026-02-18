const OpenAI = require('openai');

const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const knowledgeBase = `You are Jaymian-Lee's portfolio assistant. Keep answers concise, clear, and helpful.

Facts about Jaymian-Lee and projects:
- Corthex: AI-first software and automation initiative focused on practical business value.
- Botforger: predecessor to Corthex, focused on chatbot automation and early agent workflows.
- Vizualy: visual/creative product concept focused on presentation and user-facing clarity.
- Refacthor: development concept focused on refactoring quality, maintainability, and speed.
- Also builds custom PrestaShop modules and WordPress modules/plugins for business workflows.
- Portfolio focus: product-minded full-stack development, AI automation, integrations, and UX that converts.

If asked about contact:
- Website contact CTA uses info@jaymian-lee.nl.
- LinkedIn: https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/
- GitHub: https://github.com/Jaymian-Lee

If information is uncertain, say so transparently and suggest contacting Jay directly.`;

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

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model,
      input: [
        { role: 'system', content: knowledgeBase },
        ...messages.map((m) => ({ role: m.role, content: m.content }))
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
