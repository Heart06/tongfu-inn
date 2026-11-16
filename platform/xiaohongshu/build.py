from pathlib import Path
import json,re,shutil,subprocess,os,zipfile
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
SRC=ROOT/'dist'; OUT=HERE/'build'; TMP=HERE/'tmp'
OUT.mkdir(exist_ok=True);TMP.mkdir(exist_ok=True)
for folder in (OUT/'assets',):folder.mkdir(exist_ok=True)
# Preserve atlas dimensions/crop coordinates and transparency. Re-encode only.
def compress(p):
 out=OUT/p.relative_to(SRC);out.parent.mkdir(parents=True,exist_ok=True)
 cached=OUT/'media'/p.relative_to(SRC/'assets')
 if os.environ.get('SKIP_IMAGES') and cached.exists():
  shutil.copy2(cached,out);return out.stat().st_size
 if os.environ.get('SKIP_IMAGES') and out.exists():return out.stat().st_size
 im=Image.open(p)
 if p.suffix=='.webp':
  if im.mode=='RGB' and im.width>1500:im.thumbnail((1120,1120))
  im.save(out,'WEBP',quality=58,method=4)
 else:
  im=im.convert('RGB');im.thumbnail((960,960));im.save(out,'JPEG',quality=72,optimize=True)
 return out.stat().st_size
images=[p for p in (SRC/'assets').rglob('*') if p.is_file()]
with ThreadPoolExecutor(max_workers=6) as ex: sizes=list(ex.map(compress,images))
print('Images',len(sizes),'bytes',sum(sizes),flush=True)
data={str(p.relative_to(SRC)):json.loads(p.read_text()) for p in (SRC/'data').glob('*.json')}
(TMP/'offline-data.js').write_text('export const offlineData='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\nexport function readPackagedData(path){return Promise.resolve({ok:Object.prototype.hasOwnProperty.call(offlineData,path),json:()=>Promise.resolve(offlineData[path])});}\n')
for p in SRC.glob('*.js'):
 if p.name=='contact.js':continue
 s=p.read_text()
 if 'fetch(' in s:s="import {readPackagedData} from './offline-data.js';\n"+s.replace('fetch(', 'readPackagedData(')
 # Sources remain identifiable, but are not outward navigation in the container.
 s=s.replace('target="_blank" rel="noopener noreferrer"','')
 s=s.replace('<a href="${escape(s.url)}" >${escape(s.label)}</a>','<span class="source-citation">${escape(s.label)}</span>')
 s=re.sub(r'<a href="\$\{escape\((?:p|wide)\.sourceUrl\)\}" >([^<]+)</a>',r'<span>\1</span>',s)
 # ES2017 runtime alternatives.
 s=s.replace('historyStack.at(-2)','historyStack[historyStack.length-2]').replace('historyStack.at(-1)','historyStack[historyStack.length-1]').replace('saved.at(-1)','saved[saved.length-1]')
 s=s.replace("Object.fromEntries(rooms.map(b=>[b.dataset.map,b.querySelector('.tm-name').textContent]))","rooms.reduce((acc,b)=>{acc[b.dataset.map]=b.querySelector('.tm-name').textContent;return acc;},{})")
 if p.name=='app.js':
  s=s.replace("document.querySelector('#back').onclick=backArchive","document.querySelector('#back').addEventListener('click',backArchive)").replace("document.querySelector('#close').onclick=dismissArchive","document.querySelector('#close').addEventListener('click',dismissArchive)")
  s=s.replace('同福客栈 · 武林外传线上博物馆','七侠镇往事馆 · 武林外传线上博物馆').replace(' · 同福客栈博物馆',' · 七侠镇往事馆')
  s=s.replace('const data={};','let miniRoute="";const data={};')
  s=s.replace('location.hash.slice(1)','miniRoute').replace('if(location.hash)','if(miniRoute)')
  s=s.replace("history.pushState(archiveHistoryState(),'','#'+route)","miniRoute=route")
  s=s.replace("history.replaceState(archiveHistoryState(),'','#'+historyStack[historyStack.length-1])","miniRoute=historyStack[historyStack.length-1]")
  s=s.replace("history.replaceState(null,'',location.pathname)","miniRoute=''")
  # Top-level await becomes an async initializer before bundling as a classic script.
  lines=s.splitlines();imports=[x for x in lines if x.startswith('import ')];body=[x for x in lines if not x.startswith('import ')]
  s='\n'.join(imports)+'\n(async function(){\n'+'\n'.join(body)+'\n})();'
 (TMP/p.name).write_text(s)
for p in SRC.glob('*.css'):
 s=p.read_text()
 # Explicit physical edges and a baseline value before modern math functions.
 def inset(m):
  v=m.group(1).split();v=(v*4)[:4] if len(v)==1 else ([v[0],v[1],v[0],v[1]] if len(v)==2 else ([v[0],v[1],v[2],v[1]] if len(v)==3 else v))
  return ';'.join(k+':'+v[i] for i,k in enumerate(['top','right','bottom','left']))+';inset:'+m.group(1)
 s=re.sub(r'inset:([^;}]+)',inset,s)
 s=re.sub(r'clamp\(([^,]+),[^,]+,[^)]+\)',lambda m:m.group(1),s) # fixed readable baseline
 s=s.replace(':focus-visible',':focus').replace('body:has(dialog[open])','body.archive-open')
 # grid-gap supported before gap; flex fallback handled by runtime capability test.
 s=re.sub(r'(?<![-\w])gap:([^;}]+)',r'grid-gap:\1;gap:\1',s)
 (OUT/p.name).write_text(s)
html=(SRC/'index.html').read_text().replace('initial-scale=1"','initial-scale=1, viewport-fit=cover"')
html=re.sub(r'<script[^>]+src="contact.js"[^>]*></script>','',html)
html=html.replace('<script type="module" src="app.js"></script>','<script src="compat.js"></script><script src="app.js"></script>')
html=html.replace('</head>','<link rel="stylesheet" href="mobile.css"></head>')
html=re.sub(r'<div class="footer-connect".*?</div></div>', '<div class="footer-connect"><span>Sarah · 非官方同人创作</span></div></div>',html,flags=re.S)
html=html.replace('<div class="map-tools">','<p class="orientation-hint">横过来看，客栈更完整</p><div class="map-tools">')
# Product branding only; story text and the inn's own name remain unchanged.
html=html.replace('<title>同福客栈 · 武林外传线上博物馆</title>','<title>七侠镇往事馆 · 武林外传线上博物馆</title>')
html=html.replace('<span class="seal">同福</span><span>同福客栈<small>','<span class="seal">七侠</span><span>七侠镇往事馆<small>')
html=html.replace('<strong>同福客栈</strong>','<strong>七侠镇往事馆</strong>').replace('<span class="footer-seal" aria-hidden="true">同福</span>','<span class="footer-seal" aria-hidden="true">七侠</span>')
html=html.replace('同福客栈 · 馆藏手记','七侠镇往事馆 · 馆藏手记')
(OUT/'index.html').write_text(html)
for p in (HERE/'src').glob('*'):shutil.copy2(p,OUT/p.name)
# Use the platform-recognized assets directory with explicit relative paths.
for p in list(TMP.glob('*.js'))+list(OUT.glob('*.css'))+[OUT/'index.html']:
 p.write_text(p.read_text().replace('assets/','./assets/'))
if (OUT/'media').exists():shutil.rmtree(OUT/'media')
print('Prepared source',flush=True)
