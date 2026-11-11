import {storyPersonTip,storyPersonAria} from './story-person.js';
import {initStoryBookmark} from './story-bookmark.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function initCourtyardMemories({lookup,navigate,getMap,getTime,setTime}){
 const root=document.querySelector('#courtyard-memories'),map=document.querySelector('#map');
 (map.closest('.map-wrap').querySelector('.memory-dock')||map.closest('.map-wrap')).prepend(root);
 let memories,poses;
 try{const responses=await Promise.all([fetch('data/courtyard-memories.json'),fetch('data/courtyard-poses.json')]);if(responses.some(r=>!r.ok))throw Error('Roof stories unavailable');[memories,poses]=await Promise.all(responses.map(r=>r.json()));}catch(error){console.error(error);root.textContent='后院往事暂未打开，请刷新后再试。';return;}
 const courtyardScenes=Object.fromEntries(memories.map(m=>[m.id,{...m,time:m.time,stamp:`第${m.episode}集 · ${m.sceneType||'后院往事'}`,caption:m.note}]));
 const chapters=memories.filter(m=>lookup('story',m.id)).map(m=>({id:m.id,label:`第${m.episode}集 · ${m.title}`}));
 if(!chapters.length)return;
 let active=null,previousTime=null,selectedPerson=null,collapsed=false,indices=chapters.map((_,i)=>i);
 const moods=[...new Set(memories.map(m=>m.mood))];
 root.classList.add('guest-memories');
 root.innerHTML=`<div class="memory-intro"><div><span class="eyebrow">后院 · 往事簿</span><h2>井边、磨台旁，都是日子。</h2></div><button id="courtyard-memory-open" aria-expanded="false" aria-controls="courtyard-memory-reader">看看后院的往事 →</button></div><div id="courtyard-memory-reader" hidden><div class="memory-toolbar"><span class="memory-stamp" id="courtyard-memory-position"></span><label class="memory-person-picker"><span class="sr-only">按类型查找后院往事</span><select id="courtyard-memory-person" aria-label="按类型查找后院往事"><option value="">全部往事</option>${moods.map(n=>`<option>${esc(n)}</option>`).join('')}</select></label><button data-courtyard-action="story">故事·出处 ↗</button><button id="courtyard-memory-fold" aria-expanded="true" aria-controls="courtyard-memory-controls">收起故事轴</button><button data-courtyard-action="exit">回到现在 ×</button></div><div id="courtyard-memory-controls"><label class="sr-only" for="courtyard-memory-chapter">选择后院往事</label><select id="courtyard-memory-chapter" aria-label="选择后院往事"></select><p id="courtyard-memory-summary" class="memory-summary" aria-live="polite"></p><div class="memory-scrubber"><button id="courtyard-memory-prev" aria-label="上一段后院往事">←</button><label class="sr-only" for="courtyard-memory-range">拖动，翻后院往事</label><input id="courtyard-memory-range" type="range" min="0" step="1" value="0"><button id="courtyard-memory-next" aria-label="下一段后院往事">→</button></div></div></div>`;
 const q=s=>root.querySelector(s),selector=q('#courtyard-memory-chapter'),range=q('#courtyard-memory-range');
 const stage=document.createElement('section');stage.id='courtyard-memory-stage';stage.hidden=true;
 stage.innerHTML='<img class="courtyard-composed-art" hidden alt=""><div class="courtyard-memory-people"></div><div class="courtyard-memory-caption"><span id="courtyard-memory-voice" aria-live="polite"></span><button id="courtyard-memory-archive" hidden>人物志 ↗</button></div>';
 map.append(stage);
 const people=stage.querySelector('.courtyard-memory-people'),voice=stage.querySelector('#courtyard-memory-voice'),archive=stage.querySelector('#courtyard-memory-archive');
 function refreshOptions(){selector.innerHTML=indices.map(i=>`<option value="${chapters[i].id}">${esc(chapters[i].label)}</option>`).join('');range.max=String(indices.length-1);}
 function enter(id=selector.value){
  const index=chapters.findIndex(c=>c.id===id);if(getMap()!=='courtyard'||!indices.includes(index))return;
  if(!active)previousTime=getTime();
  active=id;const scene=courtyardScenes[id],position=indices.indexOf(index);selector.value=id;range.value=String(position);
  q('#courtyard-memory-reader').hidden=false;q('#courtyard-memory-open').setAttribute('aria-expanded','true');root.classList.add('is-open');
  q('#courtyard-memory-position').textContent=`后院往事 · ${position+1}/${indices.length}`;
  q('#courtyard-memory-summary').textContent=lookup('story',id).summary;
  q('#courtyard-memory-prev').disabled=position===0;q('#courtyard-memory-next').disabled=position===indices.length-1;
  range.setAttribute('aria-valuetext',chapters[index].label);setTime(scene.time);
  stage.hidden=false;map.classList.add('courtyard-story-active');stage.setAttribute('aria-label',scene.stamp+'像素场景');
  selectedPerson=null;archive.hidden=true;voice.textContent=scene.caption;
  const composed=stage.querySelector('.courtyard-composed-art');composed.hidden=!scene.backgroundImage;map.classList.toggle('courtyard-scene-composed',Boolean(scene.backgroundImage));if(scene.backgroundImage){composed.src=scene.backgroundImage;composed.alt=scene.backgroundAlt;}
  const artwork=scene.artwork,artPose=artwork&&poses[artwork.poseKey];
  const artHTML=artPose?`<div class="courtyard-memory-artwork" role="img" aria-label="${esc(artwork.alt)}" style="--rx:${artwork.x}%;--rt:${artwork.feetY-artwork.h}%;--rh:${artwork.h}%;--rr:${artPose.width/artPose.height};z-index:${Math.round(artwork.feetY)}"><span class="courtyard-pose" style="clip-path:${artPose.clipPath||'none'}"><img src="${esc(artPose.image)}" alt="" style="width:${artPose.atlasWidth/artPose.width*100}%;height:${artPose.atlasHeight/artPose.height*100}%;left:${-artPose.x/artPose.width*100}%;top:${-artPose.y/artPose.height*100}%"></span></div>`:'';
  people.innerHTML=artHTML+scene.people.map((person,i)=>{
   const pose=poses[person.poseKey||person.id];if(!pose)return '';
   const height=person.h||24,top=person.feetY-height;
   return `<button class="courtyard-memory-person story-person${person.hideSprite?' courtyard-person-hitbox':''}" data-courtyard-person="${i}" style="--rx:${person.x}%;--rt:${top}%;--rh:${height}%;--rr:${pose.width/pose.height};${person.hitWidth?`width:${person.hitWidth}%;`:''}z-index:${person.hideSprite?90:person.zIndex||Math.round(person.feetY)}" aria-label="${storyPersonAria(person)}" aria-pressed="false">${person.hideSprite?'':`<span class="courtyard-pose" style="transform:scaleX(${person.flip?-1:1});clip-path:${pose.clipPath||'none'}"><img src="${esc(pose.image)}" alt="${esc(person.name)}${esc(person.actionLabel||'的故事动作')}" style="width:${pose.atlasWidth/pose.width*100}%;height:${pose.atlasHeight/pose.height*100}%;left:${-pose.x/pose.width*100}%;top:${-pose.y/pose.height*100}%"></span>`}${storyPersonTip(person,top)}</button>`;
  }).join('');
  people.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{const p=scene.people[Number(b.dataset.courtyardPerson)];selectedPerson=p;voice.textContent=p.text;archive.hidden=!lookup('character',p.id);archive.textContent=p.name+'的人物志 ↗';people.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
 }
 function leave(restore=true){
  const savedTime=previousTime;active=null;previousTime=null;selectedPerson=null;stage.hidden=true;map.classList.remove('courtyard-story-active','courtyard-scene-composed');root.classList.remove('is-open');
  q('#courtyard-memory-reader').hidden=true;q('#courtyard-memory-open').setAttribute('aria-expanded','false');collapsed=false;q('#courtyard-memory-controls').hidden=false;q('#courtyard-memory-fold').textContent='收起故事轴';q('#courtyard-memory-fold').setAttribute('aria-expanded','true');
  q('#courtyard-memory-person').value='';indices=chapters.map((_,i)=>i);refreshOptions();
  if(restore&&savedTime)setTime(savedTime);
 }
 archive.addEventListener('click',()=>{if(selectedPerson)navigate('character:'+selectedPerson.id);});
 selector.addEventListener('change',()=>enter(selector.value));range.addEventListener('input',()=>enter(chapters[indices[Number(range.value)]].id));
 q('#courtyard-memory-open').onclick=()=>{enter(chapters[indices[0]].id);range.focus({preventScroll:true});};
 q('#courtyard-memory-person').onchange=()=>{const person=q('#courtyard-memory-person').value;indices=chapters.map((c,i)=>!person||courtyardScenes[c.id].mood===person?i:-1).filter(i=>i>=0);refreshOptions();enter(chapters[indices[0]].id);};
 q('#courtyard-memory-fold').onclick=()=>{collapsed=!collapsed;q('#courtyard-memory-controls').hidden=collapsed;q('#courtyard-memory-fold').textContent=collapsed?'展开故事轴':'收起故事轴';q('#courtyard-memory-fold').setAttribute('aria-expanded',String(!collapsed));};
 const step=delta=>{const position=indices.indexOf(chapters.findIndex(c=>c.id===active)),next=indices[position+delta];if(next!==undefined)enter(chapters[next].id);};
 q('#courtyard-memory-prev').onclick=()=>step(-1);q('#courtyard-memory-next').onclick=()=>step(1);
 q('[data-courtyard-action="story"]').onclick=()=>{if(active)navigate('story:'+active);};
 q('[data-courtyard-action="exit"]').onclick=()=>{leave();q('#courtyard-memory-open').focus({preventScroll:true});};
 function sync(){root.hidden=getMap()!=='courtyard';if(root.hidden&&active)leave();else if(active&&getTime()!==courtyardScenes[active].time)leave(false);}
 refreshOptions();initStoryBookmark({root,open:q('#courtyard-memory-open'),chapter:q('#courtyard-memory-chapter'),reader:q('#courtyard-memory-reader'),fold:q('#courtyard-memory-fold'),exit:q('[data-courtyard-action="exit"]')});new MutationObserver(sync).observe(map,{attributes:true,attributeFilter:['data-schedule']});sync();
 return {exit:leave};
}
