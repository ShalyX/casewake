from pathlib import Path
import sys, urllib.request, json, shutil, html

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

root=Path(__file__).resolve().parents[1]
assets=root/"web/public/brand/rouse"
evidence=root/"evidence/brand-rouse"
out=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else root/"output/rouse-brand-kit"
for p in (assets,evidence,out): p.mkdir(parents=True,exist_ok=True)
fontfile=evidence/"ArchivoBlack-Regular.ttf"
for name,url in [
 ("ArchivoBlack-Regular.ttf","https://raw.githubusercontent.com/google/fonts/main/ofl/archivoblack/ArchivoBlack-Regular.ttf"),
 ("OFL.txt","https://raw.githubusercontent.com/google/fonts/main/ofl/archivoblack/OFL.txt")]:
 p=evidence/name
 if not p.exists():p.write_bytes(urllib.request.urlopen(url,timeout=45).read())
font=TTFont(fontfile); glyphs=font.getGlyphSet();cmap=font.getBestCmap()
colors={"ink":"#0e1212","surface":"#17201c","paper":"#f5f5ef","recall":"#c8ed9b","failure":"#ef8b6e","muted":"#a1aaa5","line":"#34403d"}
# Two matching stepped cuts make one retained counter, rather than two linked objects.
mark="M8 6H24V16C29 10 35 6 43 6H58V28C58 35 54 39 47 39H42V31H46V22H36C29 22 24 27 24 35V62H8Z"
def svg(body,w,h,title="Rouse",background=None):
 bg=f'<rect width="{w}" height="{h}" fill="{background}"/>' if background else ""
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{html.escape(title)}">{bg}{body}</svg>'
def markbody(color="currentColor"):
 return f'<path fill="{color}" fill-rule="evenodd" d="{mark}"/>'
paths=[]; cursor=0; bounds=BoundsPen(glyphs)
for char in "ouse":glyphs[cmap[ord(char)]].draw(bounds)
ymax=bounds.bounds[3];scale=56/ymax
for char in "ouse":
 name=cmap[ord(char)];pen=SVGPathPen(glyphs);glyphs[name].draw(pen)
 paths.append(f'<path d="{pen.getCommands()}" transform="translate({cursor},0)"/>')
 cursor+=font["hmtx"][name][0]-13
wordwidth=round(61+cursor*scale+4)
def wordbody(color="currentColor"):
 return '<g fill="'+color+'">'+markbody(color)+f'<g transform="translate(61,62) scale({scale},-{scale})">{"".join(paths)}</g></g>'
for name,color in [("dark",colors["ink"]),("light",colors["paper"])]:
 (assets/f"mark-{name}.svg").write_text(svg(markbody(color),64,64))
 (assets/f"wordmark-{name}.svg").write_text(svg(wordbody(color),wordwidth,72))
(assets/"mark.svg").write_text(svg(markbody(),64,64))
(assets/"wordmark.svg").write_text(svg(wordbody(),wordwidth,72))
(assets/"favicon.svg").write_text(svg('<g transform="translate(5,4) scale(.84)">'+markbody(colors["recall"])+'</g>',64,64,background=colors["ink"]))
(assets/"avatar.svg").write_text(svg('<g transform="translate(55,48) scale(6.3)">'+markbody(colors["paper"])+'</g>',512,512,background=colors["ink"]))
manifest={"name":"Rouse","concept":"Retained counter","version":"1.0","colors":colors,"wordmark":{"width":wordwidth,"height":72,"lettering":"Custom retained-counter r with outlined Archivo Black ouse"},"sizes":{"markMinimum":16,"preferredMark":24,"wordmarkMinimumWidth":104},"fontSources":{"wordmark":"https://github.com/google/fonts/tree/main/ofl/archivoblack","interface":"Existing Space Grotesk / DM Sans / DM Mono roles preserved"},"status":"Brand asset family; application integration follows separately"}
(assets/"tokens.json").write_text(json.dumps(manifest,indent=2)+"\n")
M=markbody()
W=wordbody()
swatches="".join(f'<div><i style="background:{v}"></i><b>{k}</b><code>{v}</code></div>' for k,v in colors.items())
tests="".join(f'<div><svg width="{s}" height="{s}" viewBox="0 0 64 64">{M}</svg><small>{s}px</small></div>' for s in [16,20,24,32,64])
wordsvg=svg(W,wordwidth,72)
social=f'''<!doctype html><meta charset="utf-8"><style>*{{box-sizing:border-box}}body{{margin:0;width:1200px;height:630px;background:#0e1212;color:#f5f5ef;font:24px Arial,sans-serif;overflow:hidden}}main{{padding:58px 66px;position:relative;height:100%}}.wm svg{{width:275px;height:auto}}.label{{font:13px monospace;letter-spacing:.12em;color:#a1aaa5}}h1{{font-size:70px;line-height:1.04;letter-spacing:-.045em;max-width:810px;margin:55px 0 22px}}p{{color:#b9c2b8;max-width:650px;font-size:22px;line-height:1.5}}.bottom{{position:absolute;bottom:48px;left:66px;right:66px;border-top:1px solid #34403d;padding-top:20px;display:flex;justify-content:space-between;font:14px monospace;color:#c8ed9b}}.wm{{display:flex;justify-content:space-between;align-items:center}}</style><main><div class="wm">{wordsvg}<span class="label">REVIEWED RESOLUTION MEMORY / SUI</span></div><h1>The next failure shouldn't start from zero.</h1><p>Preserve the reviewed resolution.<br>Recall its evidence when a compatible failure returns.</p><div class="bottom"><span>CHAIN EVIDENCE → HUMAN REVIEW → RECALLED RESOLUTION</span><span>TATUM × WALRUS MEMORY</span></div></main>'''
board=f'''<!doctype html><html lang="en"><meta charset="utf-8"><title>Rouse — brand kit</title><link rel="icon" href="favicon.svg"><style>
*{{box-sizing:border-box}}body{{margin:0;background:#e9e9e1;color:#0e1212;font:16px Arial,sans-serif}}main{{max-width:1440px;margin:auto;padding:54px 64px}}.eyebrow{{font:11px monospace;letter-spacing:.13em}}.opening{{display:grid;grid-template-columns:1.2fr 1fr;gap:80px;padding:48px 0 50px;border-bottom:2px solid}}.opening svg{{width:100%;height:auto}}h1{{font-size:34px;line-height:1.13;letter-spacing:-.04em;margin:0 0 18px}}p{{line-height:1.6;color:#48524b}}.section{{padding:38px 0;border-bottom:1px solid #9a9f93}}h2{{font-size:25px;letter-spacing:-.035em;margin:0 0 22px}}.spread{{display:grid;grid-template-columns:1fr 1fr;gap:30px}}.dark,.light{{padding:40px;min-height:230px;display:flex;align-items:center;justify-content:center}}.dark{{background:#0e1212;color:#f5f5ef}}.light{{background:#f5f5ef;color:#0e1212}}.dark svg,.light svg{{width:310px;max-width:100%;height:auto}}.sizes{{display:flex;gap:45px;align-items:end;height:110px}}.sizes div{{display:flex;flex-direction:column;align-items:center;gap:16px}}small,code{{font:11px monospace}}.swatches{{display:flex;gap:16px}}.swatches div{{flex:1}}.swatches i{{display:block;height:70px;border:1px solid #0002;margin-bottom:12px}}.swatches b,.swatches code{{display:block;margin:5px 0;font-size:11px}}.type{{display:grid;grid-template-columns:1fr 1fr;gap:36px}}.type strong{{font-size:38px;letter-spacing:-.04em}}.type .mono{{font:19px monospace;line-height:1.8}}.heroapp{{background:#0e1212;color:#f5f5ef;padding:34px 40px;position:relative}}.heroapp svg{{width:165px;height:auto}}.heroapp h3{{font-size:44px;letter-spacing:-.045em;max-width:600px;margin:38px 0 20px}}.heroapp p{{color:#a1aaa5;max-width:500px}}.labelrow{{margin-top:32px;display:flex;gap:22px;color:#c8ed9b;font:11px monospace;border-top:1px solid #34403d;padding-top:20px}}.notes{{font:12px/1.7 monospace}}.palettecompare{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}}.palettecompare div{{padding:22px;min-height:130px}}footer{{padding-top:30px;font:11px/1.8 monospace}}@media(max-width:700px){{main{{padding:30px 22px}}.opening,.spread,.type,.palettecompare{{grid-template-columns:1fr;gap:24px}}.opening{{padding-top:30px}}.swatches{{flex-wrap:wrap}}.swatches div{{flex:1 1 25%}}.sizes{{gap:22px}}}}
</style><main><div class="eyebrow">ROUSE / BRAND KIT 1.0 / 07 NOV 2026</div><section class="opening"><div>{wordsvg}</div><div><h1>Useful knowledge,<br>ready to return.</h1><p>Evidence-backed memory for recurring Sui transaction failures. Rouse retains a human-reviewed resolution with its source, then recalls it for a compatible failure.</p><span class="eyebrow">THE NAME IS LOCKED. THE PURPOSE IS UNCHANGED.</span></div></section><section class="section"><h2>01 / Retained counter</h2><div class="spread"><div><svg width="150" height="150" viewBox="0 0 64 64">{M}</svg><p>A lowercase r holds one stepped opening. The recurring cut gives the mark its structure: something from the earlier case remains useful.</p><p>One silhouette. No linked objects, approval badge or automatic-repair symbolism.</p></div><div class="sizes">{tests}</div></div></section><section class="section"><h2>02 / Positive and reverse</h2><div class="spread"><div class="light">{wordsvg}</div><div class="dark">{wordsvg}</div></div></section><section class="section"><h2>03 / Functional color</h2><div class="swatches">{swatches}</div><p>Graphite keeps continuity with the working evidence console. Lime marks recalled evidence and available actions; orange identifies failed execution. Brand marks remain legible in one color.</p><div class="palettecompare"><div style="background:#0e1212;color:#c8ed9b"><b>Selected / Trace instrument</b><p style="color:#a1aaa5">Existing product continuity. Color has a state-related job.</p></div><div style="background:#f5f1e7;color:#183b65"><b>Compared / Case register</b><p>Light oyster and cobalt. Readable; risks looking like documentation.</p></div><div style="background:#382e3a;color:#e5d6ae"><b>Compared / Retained knowledge</b><p style="color:#e5d6ae">Aubergine and flax. Distinct warmth; weaker console continuity.</p></div></div></section><section class="section"><h2>04 / Type has a job</h2><div class="type"><div><strong>Investigate. Remember.</strong><p>Space Grotesk / interface headings<br>DM Sans / instructions and reviewed procedures</p></div><div class="mono">SOURCE → REVIEW → RECALL<br>8dT1…JLiA / HvDz…APHV<p style="font:16px Arial,sans-serif">DM Mono / digest, checkpoint, namespace and blob provenance.<br>Wordmark: custom r + outlined Archivo Black. No runtime font dependency.</p></div></div></section><section class="section"><h2>05 / Product and social use</h2><div class="heroapp">{wordsvg}<h3>The next failure shouldn't start from zero.</h3><p>Preserve the reviewed resolution. Recall its evidence when a compatible failure returns.</p><div class="labelrow"><span>CHAIN EVIDENCE</span><span>HUMAN REVIEW</span><span>RECALLED RESOLUTION</span></div></div><p class="notes">Brand application specimen, not a screenshot of deployed UI. The production app remains on its verified Casewake release until the Rouse implementation/release phase.</p></section><section class="section"><h2>06 / Use rules</h2><div class="spread notes"><div>Minimum standalone mark: 16px; prefer 24px.<br>Minimum wordmark width: 104px.<br>Clear space: at least 1/4 of mark height.<br>Use supplied SVG paths; do not typeset a substitute logo.<br>Square avatars use the dedicated 512px artwork.</div><div>No stretch, rotation, glow or gradient.<br>No checkmark or “automatically fixed” claim.<br>No sponsor logo in the Rouse wordmark.<br>Observed, simulation-tested and human-reviewed stay distinct.<br>Historical Casewake evidence and immutable blobs retain their provenance.</div></div></section><footer>Internal identity selection after concept exploration and critique. The existing same-name memory project was disclosed before the user's explicit name lock. This kit makes no claim of exclusive rights. Technical product acceptance and final page art direction remain separate gates.</footer></main></html>'''
# The closed first vector read as p. The open stepped shoulder above preserves r.
fontdir=assets/"fonts"
fontdir.mkdir(exist_ok=True)
for family,name,file in [
 ("spacegrotesk","SpaceGrotesk.ttf","SpaceGrotesk%5Bwght%5D.ttf"),
 ("dmsans","DMSans.ttf","DMSans%5Bopsz,wght%5D.ttf"),
 ("dmmono","DMMono.ttf","DMMono-Regular.ttf")]:
 for target,url in [
  (name,"https://raw.githubusercontent.com/google/fonts/main/ofl/"+family+"/"+file),
  (family+"-OFL.txt","https://raw.githubusercontent.com/google/fonts/main/ofl/"+family+"/OFL.txt")]:
  p=fontdir/target
  if not p.exists():p.write_bytes(urllib.request.urlopen(url,timeout=45).read())
fontcss='''@font-face{font-family:"Rouse Heading";src:url("fonts/SpaceGrotesk.ttf") format("truetype");font-weight:300 700;font-display:swap}
@font-face{font-family:"Rouse Body";src:url("fonts/DMSans.ttf") format("truetype");font-weight:100 1000;font-display:swap}
@font-face{font-family:"Rouse Mono";src:url("fonts/DMMono.ttf") format("truetype");font-weight:400;font-display:swap}
h1,h2,h3,.type strong{font-family:"Rouse Heading",sans-serif}
'''
for key in ["board","social"]:
 value=locals()[key]
 value=value.replace("<style>","<style>"+fontcss,1).replace("Arial,sans-serif",'"Rouse Body",Arial,sans-serif').replace("monospace",'"Rouse Mono",monospace')
 value=value.replace("A lowercase r holds one stepped opening.","A lowercase r keeps an open, stepped counter.").replace("The recurring cut gives the mark its structure","The shoulder cut gives the mark its structure")
 if key=="board":board=value
 else:social=value
smallword=wordsvg.replace('width="'+str(wordwidth)+'" height="72"','width="104" height="23"',1)
board=board.replace('<h2>03 / Functional color</h2>','<h2>03 / Functional color</h2>')
board=board.replace('<div class="dark">'+wordsvg+'</div></div></section>','<div class="dark">'+wordsvg+'</div></div><p>Minimum wordmark / 104px</p>'+smallword+'</section>')
board=board.replace("Internal identity selection after concept exploration and critique. The existing same-name memory project was disclosed before the user's explicit name lock. This kit makes no claim of exclusive rights. Technical product acceptance and final page art direction remain separate gates.","Rouse identity system / retained counter. Supporting evidence and concept critique are recorded in the brand review. Technical product acceptance and final page art direction remain separate gates.")
# Outlined lettering inherits foreground; no web font can silently change a logo.
for name,text in [("index.html",board),("social-preview.html",social)]:
 (assets/name).write_text(text,encoding="utf-8")
for p in assets.iterdir():
 if p.is_file():shutil.copyfile(p,out/p.name)
shutil.copyfile(evidence/"OFL.txt",out/"FONT-LICENSE.txt")
shutil.copytree(fontdir,out/"fonts",dirs_exist_ok=True)
print(json.dumps({"assets":str(assets),"outputs":str(out),"wordmarkWidth":wordwidth,"fontSourceBytes":fontfile.stat().st_size}))
