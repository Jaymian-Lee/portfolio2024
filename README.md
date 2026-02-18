# portfolio2024

Vernieuwde portfolio-site met:
- Focus op producten/projecten (Corthex, Botforger, Vizualy, Refacthor)
- Overzicht van maatwerk in PrestaShop en WordPress
- Ingebouwde AI-chat-assistent via moderne OpenAI Responses API
- Subtiele scroll UX (progress indicator + reveal animaties)
- SEO baseline met metadata, structured data, robots en sitemap

## Stack
- React (CRA)
- Express API (`/api/chat`)
- OpenAI Node SDK (`responses.create`)

## Installatie
```bash
npm install
```

## Environment variabelen
Maak `.env` op basis van `.env.example`.

Verplicht:
- `OPENAI_API_KEY`

Optioneel:
- `OPENAI_MODEL` (default: `gpt-4.1-mini`)
- `PORT` (default API: `3001`)

## Local development
Start frontend + API tegelijk:
```bash
npm run dev
```

Los starten:
```bash
npm run start:api
npm start
```

## Build
```bash
npm run build
```

## SEO notes
- Primary production domain: `https://jaymianlee.com`
- Canonical URL staat in `public/index.html`
- Robots file: `public/robots.txt`
- Sitemap file: `public/sitemap.xml` → live op `/sitemap.xml`
- Structured data (JSON-LD) bevat `Person`, `WebSite`, en `ProfessionalService`

Als je op een ander domein deployt:
1. Update canonical en OG URL in `public/index.html`
2. Update `Sitemap:` regel in `public/robots.txt`
3. Update `<loc>` in `public/sitemap.xml`
4. Zorg dat Search Console property overeenkomt met het live domein

## Foutafhandeling AI
- Als `OPENAI_API_KEY` ontbreekt geeft `/api/chat` een duidelijke foutmelding terug.
- Frontend toont deze fout netjes in de chat-sectie.

## Deploy (kort)
1. Deploy frontend als statische React build (`npm run build`).
2. Deploy `server.js` als Node service.
3. Zet `OPENAI_API_KEY` (en optioneel `OPENAI_MODEL`) in server env.
4. Zorg dat frontend `/api/*` naar de Node service routed (reverse proxy of zelfde domein).
