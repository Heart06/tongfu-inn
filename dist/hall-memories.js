import {storyPersonTip,storyPersonAria} from './story-person.js';
import {initStoryBookmark} from './story-bookmark.js';
import {hallScenes} from './hall-scenes.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function initHallMemories({lookup,navigate,getMap,getTime,setTime}){
 const root=document.querySelector('#hall-memories'),map=document.querySelector('#map');
 (map.closest('.map-wrap').querySelector('.memory-dock')||map.closest('.map-wrap')).prepend(root);
 const chapters=[
  {id:'hall-heartvoices',label:'第61集 · 一桌人的内心小剧场'},
  {id:'hall-mother-mahjong',label:'第4集 · 老太太又和了'},
  {id:'hall-floor-night',label:'第42集 · 在大堂打地铺的那一夜'},
  {id:'scholar',label:'第29集 · 一个书生与姬无命'},
  {id:'guest-shiniang',label:'第11集 · 从扬州来的贵客'},
  {id:'arrival',label:'第1集 · 小郭留下来的起点'},
  {id:'ordinary',label:'客栈日常 · 普通的一天'}
 ].filter(c=>lookup('story',c.id)&&hallScenes[c.id]);
 if(!chapters.length)return;
 let active=null,previousTime=null,selectedPerson=null,collapsed=false,indices=chapters.map((_,i)=>i);
 const peopleNames=[...new Set(chapters.flatMap(c=>hallScenes[c.id].people.map(p=>p.name)))];
 root.classList.add('guest-memories');
 root.innerHTML=`<div class="memory-intro"><div><span class="eyebrow">大堂 · 往事簿</span><h2>一屋子人，共同过的日子。</h2></div><button id="hall-memory-open" aria-expanded="false" aria-controls="hall-memory-reader">看看这里的往事 →</button></div><div id="hall-memory-reader" hidden><div class="memory-toolbar"><span class="memory-stamp" id="hall-memory-position"></span><label class="memory-person-picker"><span class="sr-only">按人物查找大堂往事</span><select id="hall-memory-person" aria-label="按人物查找大堂往事"><option value="">全部人物</option>${peopleNames.map(n=>`<option>${esc(n)}</option>`).join('')}</select></label><button data-hall-action="story">故事·剧照 ↗</button><button id="hall-memory-fold" aria-expanded="true" aria-controls="hall-memory-controls">收起故事轴</button><button data-hall-action="exit">回到现在 ×</button></div><div id="hall-memory-controls"><label class="sr-only" for="hall-memory-chapter">选择大堂往事</label><select id="hall-memory-chapter" aria-label="选择大堂往事"></select><p id="hall-memory-summary" class="memory-summary" aria-live="polite"></p><div class="memory-scrubber"><button id="hall-memory-prev" aria-label="上一段大堂往事">←</button><label class="sr-only" for="hall-memory-range">拖动，翻大堂往事</label><input id="hall-memory-range" type="range" min="0" step="1" value="0"><button id="hall-memory-next" aria-label="下一段大堂往事">→</button></div></div></div>`;
 const q=s=>root.querySelector(s),selector=q('#hall-memory-chapter'),range=q('#hall-memory-range');
 const thoughts=document.createElement('div');thoughts.id='hall-memory-thoughts';thoughts.hidden=true;
 q('#hall-memory-reader').append(thoughts);
 const stage=document.createElement('section');stage.id='hall-memory-stage';stage.hidden=true;
 stage.innerHTML='<img class="hall-story-art" alt=""><div class="hall-memory-people"></div><div class="hall-memory-caption"><span id="hall-memory-voice" aria-live="polite"></span><button id="hall-memory-archive" hidden>人物志 ↗</button></div>';
 map.append(stage);
 const art=stage.querySelector('img'),people=stage.querySelector('.hall-memory-people'),voice=stage.querySelector('#hall-memory-voice'),archive=stage.querySelector('#hall-memory-archive');
 const nextThought=document.createElement('button');nextThought.type='button';nextThought.id='hall-memory-next-thought';nextThought.hidden=true;nextThought.textContent='下一个人的心声 →';
 stage.querySelector('.hall-memory-caption').append(nextThought);
 function selectPerson(index){
  const scene=hallScenes[active],p=scene?.people[index];if(!p)return;
  selectedPerson=p;voice.textContent=p.text;archive.hidden=!lookup('character',p.id);archive.textContent=p.name+'的人物志 ↗';
  people.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.hallPerson)===index)));
  const thoughtPicker=thoughts.querySelector('select');if(thoughtPicker)thoughtPicker.value=String(index);
 }
 nextThought.onclick=()=>{const scene=hallScenes[active];if(scene?.thoughts)selectPerson((scene.people.indexOf(selectedPerson)+1)%scene.people.length);};
 function refreshOptions(){selector.innerHTML=indices.map(i=>`<option value="${chapters[i].id}">${esc(chapters[i].label)}</option>`).join('');range.max=String(indices.length-1);}
 function enter(id=selector.value){
  const index=chapters.findIndex(c=>c.id===id);if(getMap()!=='hall'||!indices.includes(index))return;
  if(!active)previousTime=getTime();
  active=id;const scene=hallScenes[id],position=indices.indexOf(index);selector.value=id;range.value=String(position);
  q('#hall-memory-reader').hidden=false;q('#hall-memory-open').setAttribute('aria-expanded','true');root.classList.add('is-open');
  q('#hall-memory-position').textContent=`大堂往事 · ${position+1}/${indices.length}`;
  q('#hall-memory-summary').textContent=lookup('story',id).summary;
  q('#hall-memory-prev').disabled=position===0;q('#hall-memory-next').disabled=position===indices.length-1;
  range.setAttribute('aria-valuetext',chapters[index].label);setTime(scene.time);
  stage.hidden=false;map.classList.add('hall-story-active');stage.setAttribute('aria-label',scene.stamp+'像素场景');
  art.src=scene.image;art.alt=scene.alt;selectedPerson=null;archive.hidden=true;voice.textContent=scene.caption;
  people.innerHTML=scene.people.map((p,i)=>`<button class="hall-memory-person story-person" data-hall-person="${i}" style="--hx:${p.x}%;--hy:${p.y}%;--hh:${p.h||18}%;--hw:${p.w||5}%" aria-label="${storyPersonAria(p)}" aria-pressed="false">${storyPersonTip(p,p.y-(p.h||18)/2)}</button>`).join('');
  people.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>selectPerson(Number(b.dataset.hallPerson))));
  thoughts.hidden=nextThought.hidden=!scene.thoughts;
  thoughts.innerHTML=scene.thoughts?'<label for="hall-thought-person">听谁的心声</label><select id="hall-thought-person"><option value="" disabled selected>挑一个人…</option>'+scene.people.map((p,i)=>`<option value="${i}">${esc(p.name)}</option>`).join('')+'</select>':'';
  const thoughtPicker=thoughts.querySelector('select');if(thoughtPicker)thoughtPicker.onchange=()=>selectPerson(Number(thoughtPicker.value));
 }
 function leave(restore=true){
  const savedTime=previousTime;active=null;previousTime=null;selectedPerson=null;stage.hidden=true;thoughts.hidden=nextThought.hidden=true;thoughts.innerHTML='';map.classList.remove('hall-story-active');root.classList.remove('is-open');
  q('#hall-memory-reader').hidden=true;q('#hall-memory-open').setAttribute('aria-expanded','false');collapsed=false;q('#hall-memory-controls').hidden=false;q('#hall-memory-fold').textContent='收起故事轴';q('#hall-memory-fold').setAttribute('aria-expanded','true');
  q('#hall-memory-person').value='';indices=chapters.map((_,i)=>i);refreshOptions();
  if(restore&&savedTime)setTime(savedTime);
 }
 archive.addEventListener('click',()=>{if(selectedPerson)navigate('character:'+selectedPerson.id);});
 selector.addEventListener('change',()=>enter(selector.value));range.addEventListener('input',()=>enter(chapters[indices[Number(range.value)]].id));
 q('#hall-memory-open').onclick=()=>{enter(chapters[indices[0]].id);range.focus({preventScroll:true});};
 q('#hall-memory-person').onchange=()=>{const person=q('#hall-memory-person').value;indices=chapters.map((c,i)=>!person||hallScenes[c.id].people.some(p=>p.name===person)?i:-1).filter(i=>i>=0);refreshOptions();enter(chapters[indices[0]].id);};
 q('#hall-memory-fold').onclick=()=>{collapsed=!collapsed;q('#hall-memory-controls').hidden=collapsed;q('#hall-memory-fold').textContent=collapsed?'展开故事轴':'收起故事轴';q('#hall-memory-fold').setAttribute('aria-expanded',String(!collapsed));};
 const step=delta=>{const position=indices.indexOf(chapters.findIndex(c=>c.id===active)),next=indices[position+delta];if(next!==undefined)enter(chapters[next].id);};
 q('#hall-memory-prev').onclick=()=>step(-1);q('#hall-memory-next').onclick=()=>step(1);
 q('[data-hall-action="story"]').onclick=()=>{if(active)navigate('story:'+active);};
 q('[data-hall-action="exit"]').onclick=()=>{leave();q('#hall-memory-open').focus({preventScroll:true});};
 art.addEventListener('error',()=>{if(!active)return;leave();q('#hall-memory-open').textContent='画面暂未打开，点击重试';});
 function sync(){root.hidden=getMap()!=='hall';if(root.hidden&&active)leave();else if(active&&getTime()!==hallScenes[active].time)leave(false);}
 refreshOptions();initStoryBookmark({root,open:q('#hall-memory-open'),chapter:q('#hall-memory-chapter'),reader:q('#hall-memory-reader'),fold:q('#hall-memory-fold'),exit:q('[data-hall-action="exit"]')});new MutationObserver(sync).observe(map,{attributes:true,attributeFilter:['data-schedule']});sync();
 return {exit:leave};
}
