"""Derive licensed WOFF2 delivery files without modifying canonical source fonts."""
from pathlib import Path
import sys,json
if len(sys.argv)>1:sys.path.insert(0,sys.argv[1])
from fontTools import subset
root=Path(__file__).resolve().parents[1];out=root/'web/public/fonts';out.mkdir(exist_ok=True)
for name in ['SpaceGrotesk','DMSans','DMMono']:
    options=subset.Options();options.flavor='woff2';options.layout_features=['*']
    font=subset.load_font(str(root/f'web/public/brand/rouse/fonts/{name}.ttf'),options)
    sub=subset.Subsetter(options=options);sub.populate(unicodes=list(range(0x20,0x100))+list(range(0x2000,0x2070))+list(range(0x2190,0x2200))+[0x2713,0x25a0]);sub.subset(font)
    subset.save_font(font,str(out/f'{name}.woff2'),options)
sizes={p.name:p.stat().st_size for p in out.glob('*.woff2')};assert sum(sizes.values())<=250000
(out/'README.md').write_text('Rouse web-delivery subsets of the unmodified canonical Space Grotesk, DM Sans and DM Mono sources. OFL licenses remain in ../brand/rouse/fonts/. Rebuild with scripts/build-rouse-webfonts.py and fonttools + brotli. Latin and UI punctuation/arrows/check glyphs; other scripts fall back to system fonts.\n')
print(json.dumps({'bytes':sizes,'total':sum(sizes.values())}))
