// Follow the canonical room state, including doors and guided visits.
export function initRoomMinimap(){
 const root=document.querySelector('.room-minimap');if(!root)return;
 const toggle=root.querySelector('.minimap-toggle'),panel=root.querySelector('.tm-panel');
 const mobile=matchMedia('(max-width:760px)');
 const rooms=[...root.querySelectorAll('[data-map]')];
 const names=Object.fromEntries(rooms.map(b=>[b.dataset.map,b.querySelector('.tm-name').textContent]));
 function showFloor(id){
  root.querySelectorAll('[data-floor]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.floor===id)));
  root.querySelectorAll('[data-plan]').forEach(p=>p.hidden=p.dataset.plan!==id);
 }
 function sync(){
  const id=document.body.dataset.room||'hall';
  rooms.forEach(b=>{const active=b.dataset.map===id;b.setAttribute('aria-pressed',String(active));b.setAttribute('aria-label',names[b.dataset.map]+(active?'，当前位置':''));b.querySelector('.tm-location')?.remove();if(active){const dot=document.createElement('i');dot.className='tm-location';dot.setAttribute('aria-hidden','true');b.append(dot);}});
  const selected=rooms.find(b=>b.dataset.map===id);if(selected)showFloor(selected.closest('[data-plan]').dataset.plan);
  root.querySelector('.tm-live').textContent='当前位置：'+names[id];
 }
 function setOpen(open,focus=false){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.querySelector('span').innerHTML=open?'−':'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z M9 3v16 M15 5v16"/></svg>';toggle.setAttribute('aria-label',open?'收起客栈地图':'展开客栈地图');if(focus)toggle.focus({preventScroll:true});}
 toggle.addEventListener('click',()=>setOpen(panel.hidden));
 root.addEventListener('click',e=>{const floor=e.target.closest('[data-floor]');if(floor)showFloor(floor.dataset.floor);if(e.target.closest('[data-map]')&&mobile.matches)setOpen(false,true);});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();e.stopPropagation();setOpen(false,true);}});
 document.addEventListener('pointerdown',e=>{if(mobile.matches&&!panel.hidden&&!root.contains(e.target))setOpen(false);});
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-room']});
 sync();setOpen(!mobile.matches);
}
