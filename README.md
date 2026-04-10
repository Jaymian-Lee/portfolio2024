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
npm run start:client
```

## Build
```bash
npm run build
```

## Production start
Na een build serveert `npm start` de Express API en de React build vanuit dezelfde service.

## SEO notes
- Primary production domain: `https://jaymian-lee.nl`
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
1. Gebruik Node 20+.
2. Laat de builder `npm install` of `npm ci` uitvoeren en daarna `npm run build`.
3. Start de app met `npm start`.
4. Zet `OPENAI_API_KEY` (en optioneel `OPENAI_MODEL`) in de runtime env.
5. Deze repo kan nu frontend en API uit dezelfde service serveren.
