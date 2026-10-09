"""Builds 1200x630 PNG Open Graph images for every project case.
Run from the repo root: python3 scripts/generate-og-images.py
SVG sources are rasterised with ImageMagick (convert)."""
import json, re, subprocess, tempfile, os
from PIL import Image

W, H = 1200, 630
BG = (24, 20, 16)

src = open('src/data/projectCases.js', encoding='utf-8').read()
body = src[src.index('['): src.index('];') + 1]
cases = json.loads(body)

os.makedirs('public/projects/og', exist_ok=True)
for case in cases:
    rel = case['image'].lstrip('/')
    path = os.path.join('public', rel)
    if path.endswith('.svg'):
        tmp = tempfile.NamedTemporaryFile(suffix='.png', delete=False).name
        subprocess.run(['convert', '-background', 'none', '-density', '144', path, tmp], check=True)
        path = tmp
    img = Image.open(path).convert('RGBA')
    scale = min((W - 80) / img.width, (H - 80) / img.height)
    size = (max(1, int(img.width * scale)), max(1, int(img.height * scale)))
    img = img.resize(size, Image.LANCZOS)
    canvas = Image.new('RGB', (W, H), BG)
    canvas.paste(img, ((W - size[0]) // 2, (H - size[1]) // 2), img)
    out = f"public/projects/og/{case['slug']}.png"
    canvas.save(out, optimize=True)
    print(out, canvas.size)
