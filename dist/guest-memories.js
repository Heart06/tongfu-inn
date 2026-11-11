import {storyPersonTip,storyPersonAria} from './story-person.js';
import {initStoryBookmark} from './story-bookmark.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function initGuestMemories({lookup,navigate,getMap}){
 const root=document.querySelector('#guest-memories'),map=document.querySelector('#map');
 (map.closest('.map-wrap').querySelector('.memory-dock')||map.closest('.map-wrap')).prepend(root);
 let memories,actions={};
 try{const [r,a]=await Promise.all([fetch('data/guest-memories.json'),fetch('data/guest-actions.json')]);if(!r.ok)throw Error('Guest memories unavailable');memories=await r.json();if(a.ok)actions=await a.json();}catch(e){console.error(e);root.innerHTML='<p>客房往事暂未打开，请刷新后再试。</p>';const sync=()=>{root.hidden=getMap()!=='guest-room';};new MutationObserver(sync).observe(map,{attributes:true,attributeFilter:['data-schedule']});sync();return;}
 let active=-1,indices=memories.map((_,i)=>i),collapsed=false;
 const stage=document.createElement('div');stage.id='memory-stage';stage.hidden=true;map.append(stage);
 const guests=[...new Set(memories.flatMap(m=>m.cast.map(c=>c.name)))];
 root.innerHTML=`<div class="memory-intro"><div><span class="eyebrow">客房 · 往事簿</span><h2>来客与日常，故事都在这里。</h2></div><button id="memory-open" aria-expanded="false" aria-controls="memory-reader">看看这里的往事 →</button></div><div id="memory-reader" hidden><div class="memory-toolbar"><span class="memory-stamp" id="memory-position"></span><label class="memory-person-picker"><span class="sr-only">按人物查找</span><select id="memory-person" aria-label="按人物查找"><option value="">全部人物</option>${guests.map(g=>`<option>${esc(g)}</option>`).join('')}</select></label><button id="memory-detail">故事·剧照 ↗</button><button id="memory-fold" aria-expanded="true" aria-controls="memory-controls">收起故事轴</button><button id="memory-now">回到现在 ×</button></div><div id="memory-controls"><label class="sr-only" for="memory-chapter">选择一段往事</label><select id="memory-chapter" aria-label="选择一段往事"></select><p id="memory-summary" class="memory-summary" aria-live="polite"></p><div class="memory-scrubber"><button id="memory-prev" aria-label="上一段往事">←</button><label class="sr-only" for="memory-range">拖动，翻一段往事</label><input id="memory-range" type="range" min="0" max="${memories.length-1}" step="1" value="0"><button id="memory-next" aria-label="下一段往事">→</button></div></div></div>`;
 const q=s=>root.querySelector(s),range=q('#memory-range'),chapter=q('#memory-chapter');
 function refreshOptions(){chapter.innerHTML=indices.map(i=>`<option value="${i}">第${memories[i].episode}集 · ${esc(memories[i].guest)} · ${esc(memories[i].title)}</option>`).join('');range.max=String(indices.length-1);}
 function roomProp(p){
  const art=p.type==='gift-boxes'?`<svg viewBox="0 0 150 110" aria-hidden="true"><g stroke="#674327" stroke-width="3" stroke-linejoin="miter"><path fill="#ae7443" d="M6 48 61 34 85 47 30 62Z"/><path fill="#7d4d2e" d="M6 48v43l24 15V62Z"/><path fill="#a56b3f" d="m30 62 55-15v44l-55 15Z"/><path fill="#d1a15a" d="m30 49 10-3 25 14-11 3v37l-10 3V60Z"/><path fill="#bc8750" d="m77 23 39-11 28 17-42 13Z"/><path fill="#80512e" d="M77 23v41l25 14V42Z"/><path fill="#aa7441" d="m102 42 42-13v41l-42 8Z"/><path fill="#d0a15d" d="m95 18 10-3 29 16-10 3-29-16v43l-9-5V22Z"/></g></svg>`:`<svg viewBox="0 0 100 80" aria-hidden="true"><path fill="#68547d" stroke="#3c304b" stroke-width="4" d="M20 24 43 17 49 30 62 15 78 28 88 65 13 67Z"/><path fill="#a08ab5" d="m43 17 6 13-11 32h20L49 30l13-15-8 3-5-8Z"/></svg>`;
  return `<div class="memory-room-prop" style="left:${p.x}%;top:${p.y}%;width:${p.w}%" role="img" aria-label="${esc(p.label)}">${art}</div>`;
 }
 function renderStage(m){
  if(!m||getMap()!=='guest-room'){stage.hidden=true;stage.innerHTML='';map.classList.remove('memory-active');return;}
  map.classList.add('memory-active');stage.hidden=false;stage.setAttribute('aria-label',`第${m.episode}集 · ${m.title} · 客房情境`);
  const figures=m.cast.map((c,i)=>{
   const pose=lookup('character',c.id)?.mapPresence,action=actions[c.actionKey],frame=action||c.imageFrame;
   let sprite='',ratio=c.artRatio||.5;
   if(frame){ratio=frame.width/frame.height;sprite=`<span class="memory-sprite-crop"><img src="${esc(action?frame.image:c.image)}" alt="${esc(c.name)}${esc(c.actionLabel||'')}" style="width:${frame.atlasWidth/frame.width*100}%;height:${frame.atlasHeight/frame.height*100}%;left:${-frame.x/frame.width*100}%;top:${-frame.y/frame.height*100}%"></span>`;}
   else if(c.image)sprite=`<img class="memory-guest-art" src="${esc(c.image)}" alt="${esc(c.name)}${esc(c.actionLabel||'')}">`;
   else if(pose){ratio=pose.width/pose.cropHeight;sprite=`<span class="memory-sprite-crop"><img src="${esc(pose.image)}" alt="${esc(c.name)}" style="width:${pose.atlasWidth/pose.width*100}%;left:${-pose.cropX/pose.width*100}%;top:${-pose.cropY/pose.cropHeight*100}%"></span>`;}
   if(m.sceneImage)sprite='<span class="scene-image-target"></span>';
   if(!sprite)return '';
   return `<button class="memory-figure story-person" style="--mx:${c.x}%;--my:${c.y}%;--mh:${c.h||20}%;--mr:${ratio};z-index:${Math.round(c.y)}" data-memory-person="${i}" aria-label="${storyPersonAria(c)}" aria-pressed="false"><span class="memory-pose-image" style="transform:scaleX(${c.flip?-1:1})">${sprite}</span>${storyPersonTip(c,c.y-(c.h||20))}</button>`;
  }).join('');
  stage.classList.toggle('uses-scene-image',Boolean(m.sceneImage));
  stage.innerHTML=`${m.sceneImage?`<img class="memory-original-frame" src="${esc(m.sceneImage)}" alt="第${m.episode}集：${esc(m.title)}">`:''}${(m.props||[]).map(roomProp).join('')}${figures}<div class="memory-scene-caption"><div><small class="memory-scene-type">客房情境</small><strong>第${m.episode}集 · ${esc(m.title)}</strong><span id="memory-action-voice" aria-live="polite">${esc(m.sceneNote)}</span></div><button id="memory-person-archive" hidden></button></div>`;
  const voice=stage.querySelector('#memory-action-voice'),archive=stage.querySelector('#memory-person-archive');let selected=null;
  stage.querySelectorAll('[data-memory-person]').forEach(b=>b.onclick=()=>{selected=m.cast[Number(b.dataset.memoryPerson)];voice.textContent=selected.actionText||m.sceneNote;archive.hidden=!lookup('character',selected.id);archive.textContent=selected.name+'的人物志 ↗';stage.querySelectorAll('[data-memory-person]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  archive.onclick=()=>{if(selected&&lookup('character',selected.id))navigate('character:'+selected.id);};
 }
 function select(index){
  if(getMap()!=='guest-room'||!Number.isInteger(index)||!indices.includes(index))return;
  active=index;const m=memories[index],position=indices.indexOf(index);
  q('#memory-reader').hidden=false;q('#memory-open').setAttribute('aria-expanded','true');root.classList.add('is-open');
  q('#memory-position').textContent=`客房往事 · ${position+1}/${indices.length}`;
  q('#memory-summary').textContent=m.summary;chapter.value=String(index);range.value=String(position);
  range.setAttribute('aria-valuetext',`第${m.episode}集，${m.guest}，${m.title}`);
  q('#memory-prev').disabled=position===0;q('#memory-next').disabled=position===indices.length-1;
  renderStage(m);
 }
 function reset(){active=-1;collapsed=false;indices=memories.map((_,i)=>i);q('#memory-person').value='';refreshOptions();q('#memory-reader').hidden=true;q('#memory-open').setAttribute('aria-expanded','false');root.classList.remove('is-open','is-collapsed');q('#memory-controls').hidden=false;q('#memory-fold').textContent='收起故事轴';q('#memory-fold').setAttribute('aria-expanded','true');renderStage(null);}
 q('#memory-open').onclick=()=>{[...new Set(Object.values(actions).map(a=>a.image))].forEach(src=>{const image=new Image();image.src=src;});select(indices[0]);range.focus({preventScroll:true});};
 q('#memory-now').onclick=()=>{reset();q('#memory-open').focus({preventScroll:true});};
 q('#memory-fold').onclick=()=>{collapsed=!collapsed;q('#memory-controls').hidden=collapsed;root.classList.toggle('is-collapsed',collapsed);q('#memory-fold').textContent=collapsed?'展开故事轴':'收起故事轴';q('#memory-fold').setAttribute('aria-expanded',String(!collapsed));};
 range.addEventListener('input',()=>select(indices[Number(range.value)]));chapter.onchange=()=>select(Number(chapter.value));
 q('#memory-person').onchange=()=>{const person=q('#memory-person').value;indices=memories.map((m,i)=>!person||m.cast.some(c=>c.name===person)?i:-1).filter(i=>i>=0);refreshOptions();select(indices[0]);};
 q('#memory-prev').onclick=()=>select(indices[indices.indexOf(active)-1]);q('#memory-next').onclick=()=>select(indices[indices.indexOf(active)+1]);
 q('#memory-detail').onclick=()=>{if(active>=0)navigate('story:'+memories[active].storyId);};
 function sync(){root.hidden=getMap()!=='guest-room';if(root.hidden)reset();else if(active>=0)renderStage(memories[active]);}
 refreshOptions();initStoryBookmark({root,open:q('#memory-open'),chapter:q('#memory-chapter'),reader:q('#memory-reader'),fold:q('#memory-fold'),exit:q('#memory-now')});new MutationObserver(sync).observe(map,{attributes:true,attributeFilter:['data-schedule']});sync();
}
