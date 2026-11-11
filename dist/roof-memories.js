import {storyPersonTip,storyPersonAria} from './story-person.js';
import {initStoryBookmark} from './story-bookmark.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function initRoofMemories({lookup,navigate,getMap,getTime,setTime}){
 const root=document.querySelector('#roof-memories'),map=document.querySelector('#map');
 (map.closest('.map-wrap').querySelector('.memory-dock')||map.closest('.map-wrap')).prepend(root);
 let memories,poses;
 try{const responses=await Promise.all([fetch('data/roof-memories.json'),fetch('data/roof-poses.json')]);if(responses.some(r=>!r.ok))throw Error('Roof stories unavailable');[memories,poses]=await Promise.all(responses.map(r=>r.json()));}catch(error){console.error(error);root.textContent='屋顶夜话暂未打开，请刷新后再试。';return;}
 const roofScenes=Object.fromEntries(memories.map(m=>[m.id,{...m,time:'night',stamp:`第${m.episode}集 · ${m.sceneType||'屋顶夜话'}`,caption:m.note}]));
 const chapters=memories.filter(m=>lookup('story',m.id)).map(m=>({id:m.id,label:`第${m.episode}集 · ${m.title}`}));
 if(!chapters.length)return;
 let active=null,previousTime=null,selectedPerson=null,collapsed=false,indices=chapters.map((_,i)=>i);
 const moods=[...new Set(memories.map(m=>m.mood))];
 root.classList.add('guest-memories');
 root.innerHTML=`<div class="memory-intro"><div><span class="eyebrow">屋顶 · 夜话</span><h2>夜深了，坐下来聊一会儿。</h2></div><button id="roof-memory-open" aria-expanded="false" aria-controls="roof-memory-reader">听听屋顶的夜话 →</button></div><div id="roof-memory-reader" hidden><div class="memory-toolbar"><span class="memory-stamp" id="roof-memory-position"></span><label class="memory-person-picker"><span class="sr-only">按心情选择夜话</span><select id="roof-memory-person" aria-label="按心情选择夜话"><option value="">全部夜话</option>${moods.map(n=>`<option>${esc(n)}</option>`).join('')}</select></label><button data-roof-action="story">故事·出处 ↗</button><button id="roof-memory-fold" aria-expanded="true" aria-controls="roof-memory-controls">收起故事轴</button><button data-roof-action="exit">回到现在 ×</button></div><div id="roof-memory-controls"><label class="sr-only" for="roof-memory-chapter">选择屋顶往事</label><select id="roof-memory-chapter" aria-label="选择屋顶往事"></select><p id="roof-memory-summary" class="memory-summary" aria-live="polite"></p><div class="memory-scrubber"><button id="roof-memory-prev" aria-label="上一段屋顶往事">←</button><label class="sr-only" for="roof-memory-range">拖动，翻屋顶往事</label><input id="roof-memory-range" type="range" min="0" step="1" value="0"><button id="roof-memory-next" aria-label="下一段屋顶往事">→</button></div></div></div>`;
 const q=s=>root.querySelector(s),selector=q('#roof-memory-chapter'),range=q('#roof-memory-range');
 const stage=document.createElement('section');stage.id='roof-memory-stage';stage.hidden=true;
 stage.innerHTML='<div class="roof-memory-people"></div><div class="roof-memory-caption"><span id="roof-memory-voice" aria-live="polite"></span><button id="roof-memory-archive" hidden>人物志 ↗</button></div>';
 map.append(stage);
 const people=stage.querySelector('.roof-memory-people'),voice=stage.querySelector('#roof-memory-voice'),archive=stage.querySelector('#roof-memory-archive');
 function refreshOptions(){selector.innerHTML=indices.map(i=>`<option value="${chapters[i].id}">${esc(chapters[i].label)}</option>`).join('');range.max=String(indices.length-1);}
 function enter(id=selector.value){
  const index=chapters.findIndex(c=>c.id===id);if(getMap()!=='roof'||!indices.includes(index))return;
  if(!active)previousTime=getTime();
  active=id;const scene=roofScenes[id],position=indices.indexOf(index);selector.value=id;range.value=String(position);
  q('#roof-memory-reader').hidden=false;q('#roof-memory-open').setAttribute('aria-expanded','true');root.classList.add('is-open');
  q('#roof-memory-position').textContent=`屋顶夜话 · ${position+1}/${indices.length}`;
  q('#roof-memory-summary').textContent=lookup('story',id).summary;
  q('#roof-memory-prev').disabled=position===0;q('#roof-memory-next').disabled=position===indices.length-1;
  range.setAttribute('aria-valuetext',chapters[index].label);setTime(scene.time);
  stage.hidden=false;map.classList.add('roof-story-active');stage.setAttribute('aria-label',scene.stamp+'像素场景');
  selectedPerson=null;archive.hidden=true;voice.textContent=scene.caption;
  people.innerHTML=scene.people.map((person,i)=>{
   const pose=poses[person.poseKey||person.id];if(!pose)return '';
   const height=person.h||24,top=person.feetY!==undefined?person.feetY-height:person.hipY-height*pose.anchor;
   return `<button class="roof-memory-person story-person" data-roof-person="${i}" style="--rx:${person.x}%;--rt:${top}%;--rh:${height}%;--rr:${pose.width/pose.height}" aria-label="${storyPersonAria(person)}" aria-pressed="false"><span class="roof-pose" style="transform:scaleX(${person.flip?-1:1})"><img src="${esc(pose.image)}" alt="${esc(person.name)}${person.feetY!==undefined?'站在屋顶上':'坐在屋脊上'}" style="width:${pose.atlasWidth/pose.width*100}%;height:${pose.atlasHeight/pose.height*100}%;left:${-pose.x/pose.width*100}%;top:${-pose.y/pose.height*100}%"></span>${storyPersonTip(person,top)}</button>`;
  }).join('');
  people.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{const p=scene.people[Number(b.dataset.roofPerson)];selectedPerson=p;voice.textContent=p.text;archive.hidden=!lookup('character',p.id);archive.textContent=p.name+'的人物志 ↗';people.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
 }
 function leave(restore=true){
  const savedTime=previousTime;active=null;previousTime=null;selectedPerson=null;stage.hidden=true;map.classList.remove('roof-story-active');root.classList.remove('is-open');
  q('#roof-memory-reader').hidden=true;q('#roof-memory-open').setAttribute('aria-expanded','false');collapsed=false;q('#roof-memory-controls').hidden=false;q('#roof-memory-fold').textContent='收起故事轴';q('#roof-memory-fold').setAttribute('aria-expanded','true');
  q('#roof-memory-person').value='';indices=chapters.map((_,i)=>i);refreshOptions();
  if(restore&&savedTime)setTime(savedTime);
 }
 archive.addEventListener('click',()=>{if(selectedPerson)navigate('character:'+selectedPerson.id);});
 selector.addEventListener('change',()=>enter(selector.value));range.addEventListener('input',()=>enter(chapters[indices[Number(range.value)]].id));
 q('#roof-memory-open').onclick=()=>{enter(chapters[indices[0]].id);range.focus({preventScroll:true});};
 q('#roof-memory-person').onchange=()=>{const person=q('#roof-memory-person').value;indices=chapters.map((c,i)=>!person||roofScenes[c.id].mood===person?i:-1).filter(i=>i>=0);refreshOptions();enter(chapters[indices[0]].id);};
 q('#roof-memory-fold').onclick=()=>{collapsed=!collapsed;q('#roof-memory-controls').hidden=collapsed;q('#roof-memory-fold').textContent=collapsed?'展开故事轴':'收起故事轴';q('#roof-memory-fold').setAttribute('aria-expanded',String(!collapsed));};
 const step=delta=>{const position=indices.indexOf(chapters.findIndex(c=>c.id===active)),next=indices[position+delta];if(next!==undefined)enter(chapters[next].id);};
 q('#roof-memory-prev').onclick=()=>step(-1);q('#roof-memory-next').onclick=()=>step(1);
 q('[data-roof-action="story"]').onclick=()=>{if(active)navigate('story:'+active);};
 q('[data-roof-action="exit"]').onclick=()=>{leave();q('#roof-memory-open').focus({preventScroll:true});};
 function sync(){root.hidden=getMap()!=='roof';if(root.hidden&&active)leave();else if(active&&getTime()!==roofScenes[active].time)leave(false);}
 refreshOptions();initStoryBookmark({root,open:q('#roof-memory-open'),chapter:q('#roof-memory-chapter'),reader:q('#roof-memory-reader'),fold:q('#roof-memory-fold'),exit:q('[data-roof-action="exit"]')});new MutationObserver(sync).observe(map,{attributes:true,attributeFilter:['data-schedule']});sync();
 return {exit:leave};
}
