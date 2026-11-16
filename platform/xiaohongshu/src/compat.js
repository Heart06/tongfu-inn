(function(){
 if(!Element.prototype.replaceChildren)Element.prototype.replaceChildren=function(){while(this.firstChild)this.removeChild(this.firstChild);for(var i=0;i<arguments.length;i++)this.appendChild(typeof arguments[i]==='string'?document.createTextNode(arguments[i]):arguments[i]);};
 window.addEventListener('error',function(e){document.body.setAttribute('data-app-error',String(e.message));});
 window.addEventListener('unhandledrejection',function(e){document.body.setAttribute('data-app-error',String(e.reason));});
 if(!Array.prototype.flatMap)Object.defineProperty(Array.prototype,'flatMap',{configurable:true,writable:true,value:function(fn,ctx){return this.reduce(function(out,x,i,arr){return out.concat(fn.call(ctx,x,i,arr));},[]);}});
 var gap=document.createElement('div');gap.style.cssText='display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden';gap.appendChild(document.createElement('div'));gap.appendChild(document.createElement('div'));document.body.appendChild(gap);document.body.classList.toggle('no-flex-gap',gap.scrollHeight!==1);gap.remove();

 if(!Object.fromEntries)Object.fromEntries=function(entries){return entries.reduce(function(out,pair){out[pair[0]]=pair[1];return out;},{});};
 var dialog=document.getElementById('archive');
 if(typeof dialog.showModal!=='function'){
  dialog.showModal=function(){dialog.setAttribute('open','');dialog.open=true;};
  dialog.close=function(){dialog.removeAttribute('open');dialog.open=false;};
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&dialog.open){e.preventDefault();document.getElementById('close').click();}});
 }
 function syncDialog(){document.body.classList.toggle('archive-open',dialog.hasAttribute('open'));}
 new MutationObserver(syncDialog).observe(dialog,{attributes:true,attributeFilter:['open']});
 var toggle=document.querySelector('.minimap-toggle');
 function syncMap(){document.querySelector('.scene-viewport').classList.toggle('minimap-expanded',toggle.getAttribute('aria-expanded')==='true');}
 new MutationObserver(syncMap).observe(toggle,{attributes:true,attributeFilter:['aria-expanded']});syncMap();
 // Only browsers lacking aspect-ratio need measured sprite widths. No pose coordinates change.
 var supportsRatio=window.CSS&&CSS.supports&&CSS.supports('aspect-ratio','1 / 1');
 if(!supportsRatio){
  function ratios(){document.querySelectorAll('.map-figure,.figure-target,.memory-figure,.roof-memory-person,.courtyard-memory-person,.courtyard-memory-artwork').forEach(function(el){
   if(el.classList.contains('courtyard-person-hitbox')||el.closest('.uses-scene-image')&&el.classList.contains('memory-figure'))return;
   var cs=getComputedStyle(el),str=cs.getPropertyValue('--figure-ratio')||cs.getPropertyValue('--mr')||cs.getPropertyValue('--rr'),parts=str.trim().split('/'),ratio=Number(parts[0])/(Number(parts[1])||1);
   if(ratio>0)el.style.width=(el.offsetHeight*ratio)+'px';
  });}
  var queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){
 if(!Element.prototype.replaceChildren)Element.prototype.replaceChildren=function(){while(this.firstChild)this.removeChild(this.firstChild);for(var i=0;i<arguments.length;i++)this.appendChild(typeof arguments[i]==='string'?document.createTextNode(arguments[i]):arguments[i]);};queued=false;ratios();});}
  new MutationObserver(schedule).observe(document.getElementById('map'),{childList:true,subtree:true});window.addEventListener('resize',schedule);schedule();
 }
 // Links to external sources remain visible as citations, never leave the container.
 document.addEventListener('click',function(e){var a=e.target.closest('a[href]');if(a&&/^https?:/i.test(a.getAttribute('href')))e.preventDefault();});
})();
