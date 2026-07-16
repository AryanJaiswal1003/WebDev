from PIL import Image
from pathlib import Path

base = Path(__file__).resolve().parent / 'Images'
for path in base.glob('*.webp'):
    img = Image.open(path)
    target = path.with_suffix('.webp')
    if path.name in {'logo.webp'}:
        img = img.resize((180, 108), Image.Resampling.LANCZOS)
    elif path.name == 'hero-image.webp':
        img = img.resize((800, 450), Image.Resampling.LANCZOS)
    elif path.name.startswith('img_'):
        img = img.resize((600, 400), Image.Resampling.LANCZOS)
    else:
        img = img.resize((img.width // 2, img.height // 2), Image.Resampling.LANCZOS)
    img.save(target, format='WEBP', quality=70, optimize=True)
    print(f'optimized {path.name} -> {target.name}')
