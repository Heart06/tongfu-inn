const path=require('path');
const esbuild=require(process.env.ESBUILD_MODULE||'esbuild');
const fs=require('fs');const base=__dirname;
esbuild.buildSync({entryPoints:[path.join(base,'tmp/app.js')],bundle:true,format:'iife',target:['chrome61','es2017'],outfile:path.join(base,'build/app.js'),minify:true,logLevel:'warning'});
// Compile compatibility CSS with the same browser target. Unsupported layout features have local fallbacks.
for(const f of fs.readdirSync(path.join(base,'build')).filter(f=>f.endsWith('.css'))){const p=path.join(base,'build',f);const r=esbuild.transformSync(fs.readFileSync(p,'utf8'),{loader:'css',target:'chrome61',minify:true});fs.writeFileSync(p,r.code);}
