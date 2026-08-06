import json, os
from PIL import Image

base = os.path.dirname(os.path.abspath(__file__))
man = json.load(open(os.path.join(base, 'sticker-manifest.json')))
CELL, COLS, ROWS = man['CELL'], man['COLS'], man['ROWS']
outdir = os.path.join(base, 'mm-png', 'stickers')
os.makedirs(outdir, exist_ok=True)

sheets = {}
n = 0
for s in man['stickers']:
    sh = s['sheet']
    if sh not in sheets:
        p = os.path.join(base, 'mm-png', 'sheets', f'stickersheet-{sh:02d}.png')
        sheets[sh] = Image.open(p).convert('RGBA')
    img = sheets[sh]
    x, y = s['col'] * CELL, s['row'] * CELL
    crop = img.crop((x, y, x + CELL, y + CELL))
    crop.save(os.path.join(outdir, s['name'] + '.png'))
    n += 1
print('sliced', n, 'stickers')
