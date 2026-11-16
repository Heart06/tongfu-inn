from pathlib import Path
import zipfile,hashlib,re,json
p=Path(__file__).resolve().parent;b=p/'build';out=p/'release/tongfu-inn-1.0.0.zip'
out.parent.mkdir(exist_ok=True)
assert (b/'index.html').exists()
content='\n'.join(f.read_text() for f in b.iterdir() if f.suffix in ['.js','.html','.css'])
for pat in [r'\bfetch\(',r'\bXMLHttpRequest\b',r'navigator.clipboard',r'\beval\(',r'new Function\(',r'target="_blank"',r'type="module"']:
 assert not re.search(pat,content),pat
refs=set(re.findall(r'assets/[A-Za-z0-9_./-]+\.(?:webp|jpg|jpeg|png)',content))
assert all((b/r).exists() for r in refs),'Missing asset'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for f in sorted(b.rglob('*')):
  if f.is_file():z.write(f,f.relative_to(b))
assert out.stat().st_size<10_000_000
print(json.dumps({'bytes':out.stat().st_size,'images':len(refs),'sha256':hashlib.sha256(out.read_bytes()).hexdigest()},indent=2))
