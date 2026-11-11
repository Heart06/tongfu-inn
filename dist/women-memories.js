import {storyPersonTip,storyPersonAria} from './story-person.js';
import {initStoryBookmark} from './story-bookmark.js';
import {womenScenes} from './women-scenes.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function initWomenMemories({lookup,navigate,getMap,getTime,setTime}){
 const root=document.querySelector('#women-memories'),map=document.querySelector('#map');
 (map.closest('.map-wrap').querySelector('.memory-dock')||map.closest('.map-wrap')).prepend(root);
 const chapters=Object.entries(womenScenes).filter(([id])=>lookup('story',id)).map(([id,s])=>({id,label:s.stamp}));
 if(!chapters.length)return;
 let active=null,previousTime=null,selectedPerson=null;
 root.innerHTML='<div class="memory-intro"><button id="women-memory-open">这里发生过……</button></div><div id="women-memory-reader" hidden><div class="memory-toolbar"><button data-women-action="story">读故事 ↗</button><button id="women-memory-fold" aria-expanded="true" hidden>收起故事轴</button><button data-women-action="exit">回到现在 ×</button></div><div id="women-memory-controls"><label for="women-memory-chapter" class="sr-only">选择女寝往事</label><select id="women-memory-chapter">'+chapters.map(c=>`<option value="${c.id}">${esc(c.label)}</option>`).join('')+'</select></div></div>';
 const q=s=>root.querySelector(s),selector=q('#women-memory-chapter');
 const stage=document.createElement('section');stage.id='women-memory-stage';stage.hidden=true;
 stage.innerHTML='<img class="hall-story-art" alt=""><span class="women-headband-lettering" hidden aria-hidden="true">必胜</span><div class="women-memory-people"></div><div class="hall-memory-caption"><span id="women-memory-voice" aria-live="polite"></span><button id="women-memory-archive" hidden>人物志 ↗</button></div>';
 map.append(stage);
 const art=stage.querySelector('img'),people=stage.querySelector('.women-memory-people'),voice=stage.querySelector('#women-memory-voice'),archive=stage.querySelector('#women-memory-archive');
 function enter(id){
  if(getMap()!=='women-room'||!womenScenes[id])return;
  if(!active)previousTime=getTime();active=id;const scene=womenScenes[id];selector.value=id;selectedPerson=null;
  q('#women-memory-reader').hidden=false;root.classList.add('is-open');setTime(scene.time);
  stage.hidden=false;stage.setAttribute('aria-label',scene.stamp+'像素场景');map.classList.add('women-story-active');
  art.src=scene.image;art.alt=scene.alt;voice.textContent=scene.caption;archive.hidden=true;stage.querySelector('.women-headband-lettering').hidden=id!=='women-wait-bai';
  people.innerHTML=scene.people.map((p,i)=>`<button class="hall-memory-person story-person" data-women-person="${i}" style="--hx:${p.x}%;--hy:${p.y}%;--hh:${p.h}%;--hw:${p.w}%" aria-label="${storyPersonAria(p)}" aria-pressed="false">${storyPersonTip(p,p.y-p.h/2)}</button>`).join('');
  people.querySelectorAll('button').forEach(b=>b.onclick=()=>{selectedPerson=scene.people[Number(b.dataset.womenPerson)];voice.textContent=selectedPerson.text;archive.hidden=!lookup('character',selectedPerson.id);archive.textContent=selectedPerson.name+'的人物志 ↗';people.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
 }
 function leave(restore=true){
  const saved=previousTime;active=null;previousTime=null;selectedPerson=null;stage.hidden=true;archive.hidden=true;map.classList.remove('women-story-active');root.classList.remove('is-open');q('#women-memory-reader').hidden=true;
  if(restore&&saved)setTime(saved);
 }
 selector.onchange=()=>enter(selector.value);
 q('#women-memory-fold').onclick=()=>{q('#women-memory-controls').hidden=true;q('#women-memory-fold').setAttribute('aria-expanded','false');};
 q('[data-women-action="story"]').onclick=()=>{if(active)navigate('story:'+active);};
 q('[data-women-action="exit"]').onclick=()=>{leave();q('#women-memory-open').focus({preventScroll:true});};
 archive.onclick=()=>{if(selectedPerson)navigate('character:'+selectedPerson.id);};
 art.onerror=()=>{if(active){leave();q('#women-memory-open').textContent='画面暂未打开，点击重试';}};
 const sync=()=>{root.hidden=getMap()!=='women-room';if(root.hidden&&active)leave();else if(active&&getTime()!==womenScenes[active].time)leave(false);};
 initStoryBookmark({root,open:q('#women-memory-open'),chapter:selector,reader:q('#women-memory-reader'),fold:q('#women-memory-fold'),exit:q('[data-women-action="exit"]')});
 new MutationObserver(sync).observe(map,{attributes:true,attributeFilter:['data-schedule']});sync();
 return {exit:leave};
}
