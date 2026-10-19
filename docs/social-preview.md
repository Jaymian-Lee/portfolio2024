# Portfolio social preview

The versioned artwork is `public/social/jaymian-lee-share-v1.png` (1200 × 630,
PNG). It was generated with the built-in image generation tool. The final image
contains no portrait or people, following the owner's requested direction.

Research used the existing portfolio homepage, local content and
`src/styles/design-system.css`: warm paper, near-black, lime, electric blue,
Bungee-style display lettering and the established “Nothing is impossible.” motto.
Abstract code and layout building blocks communicate full-stack/product work.

`src/data/social-preview.json` supplies shared artwork metadata to the client and
static HTML generator. The public HTML template also includes the image so
crawlers receive it before JavaScript runs. Personal pages use this default;
project case studies retain their own images. The actual portrait in Person
structured data remains the person's photo rather than the marketing banner.

Increment the asset filename and shared config when replacing it; keep the public
HTML template aligned. Validate the Vercel-style build and its generated route
HTML so both English and Dutch links work without JavaScript.

## Exact generation prompt

```text
Use case: ads-marketing. Create a finished premium personal portfolio social sharing banner for Jaymian-Lee Reinartz, a full-stack developer and independent product builder. Landscape 1.91:1, ideally 1536x806, final export 1200x630. No people, no faces, no heads, no portraits, no human silhouettes or body parts.
Design language from existing portfolio: warm paper #f3f1eb, near black #17191d, punchy flat lime #ceff3c accents, tiny electric blue #315cf5 detail. Bold squared rounded display type inspired by Bungee. Clean contemporary editorial graphic design, confident independent maker aesthetic.
Left 62%: small name in uppercase two lines at upper left "JAYMIAN-LEE" / "REINARTZ". Huge crisp near-black headline exact text "NOTHING IS" / "IMPOSSIBLE." in two lines. Place a flat lime rectangular highlight behind "IMPOSSIBLE." Beneath, clear smaller line "Full-stack developer. Product builder." Bottom left small "jaymian-lee.nl". Beautiful deliberate kerning and whitespace, large text stays readable at thumbnail scale.
Right 38%: an art-directed abstract sculptural software/product-building illustration: three modular matte near-black and warm-white rectangular slabs with fine borders assembled into a compact architectural stack, one upright slab with large elegant simple blue code brackets "</>", a second with minimal geometric window/layout shapes in black and white, and one vivid lime cube joining the composition. Subtle isometric perspective, crisp architectural edges, minimal physical depth, restrained soft contact shading, tactile paper/material quality. A large flat lime circle behind these forms anchors composition. Forms visually convey building products from code without any fake dashboards or small labels. One tiny blue four-point spark is the only decoration. Mature playful portfolio branding, highly polished design.
Keep all text at least 60px from canvas edges and never overlap it with objects. Full bleed square corners. Avoid people absolutely, stock photography, laptops, robots, fake metrics, CTA buttons, extra slogans, social media chrome, gradients, generic SaaS dashboards, scattered decorative clutter. Exact text only.
```
