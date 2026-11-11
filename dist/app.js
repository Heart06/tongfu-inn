import {initRoomMinimap} from './room-minimap.js';
import {initGuide} from './guide.js';
import {initGuestMemories} from './guest-memories.js';
import {initHallMemories} from './hall-memories.js';
import {initWomenMemories} from './women-memories.js';
import {initRoofMemories} from './roof-memories.js';
import {initCourtyardMemories} from './courtyard-memories.js';
const types={character:'人物',scene:'场景',object:'物件',story:'故事',relationship:'关系'};
const fileNames={character:'characters',scene:'scenes',object:'objects',story:'stories',relationship:'relationships'};
const data={};let historyStack=[],visited=new Set(),filter='explore',lastFocus=null,currentMap='hall',timeOfDay='day',storyNight=false;
const dialog=document.querySelector('#archive'),panel=document.querySelector('#panel');
const archiveViews=new Map();let renderedArchiveRoute='',guideTargetRoute=null,highlightedGuideNode=null;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(kind,id)=>`#${kind}:${id}`;
const lookup=(kind,id)=>data[kind]?.find(x=>x.id===id);
const relatedHTML=item=>{
 const groups=Object.keys(types).map(kind=>{const refs=item.related.filter(r=>r.kind===kind);if(!refs.length)return '';return `<div class="related"><h3>相关${kind==='relationship'?'关系':types[kind]}</h3><div class="related-links">${refs.map(r=>{const t=lookup(kind,r.id);return t?`<a href="${link(kind,r.id)}">${escape(t.title)}</a>`:''}).join('')}</div></div>`});return groups.join('');
};
const sections=item=>`<div class="sections">${item.sections.map(x=>`<section><h3>${escape(x.title)}</h3><p>${escape(x.text)}</p></section>`).join('')}</div>`;
const tags=item=>item.keywords?.length?`<div class="tags">${item.keywords.map(x=>`<span>${escape(x)}</span>`).join('')}</div>`:'';
const sourcesHTML=item=>item.sources?.length?`<details class="sources"><summary>资料来源</summary>${item.sources.map(s=>`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.label)}</a>`).join('')}</details>`:'';
function directory(kind,period=null){
 const entries=data[kind];
 const portraitHTML=item=>item.image&&!item.portrait?.contextOnly?`<img class="character-thumb" style="object-position:${escape(item.portrait?.focus||'50%')} top" src="${escape(item.portrait?.image||item.image)}" alt="" loading="lazy">`:`<span class="character-nameplate" aria-hidden="true">${escape(item.title.slice(0,2))}</span>`;
 const cards=entries.map((item,i)=>`<a href="${link(kind,item.id)}"${kind==='character'?` data-character-entry data-search="${escape([item.title,item.role,item.summary,...(item.keywords||[])].join(' '))}" data-group="${escape(item.archiveGroup)}"`:''}><span class="num">${String(i+1).padStart(2,'0')}</span>${kind==='character'?portraitHTML(item):''}<span><span class="entry-name">${escape(item.title)}</span><span class="summary">${escape(kind==='character'?item.role:item.summary)}</span>${kind==='character'&&item.dailyActivities?.[period]?`<span class="daily-location">${period==='night'?'夜晚':'白天'} · ${escape(maps[item.dailyActivities[period].mapId].title)}</span>`:''}</span><span class="entry-meta">${kind==='story'?escape(item.contentType):'查看档案'}</span></a>`).join('');
 const controls=kind==='character'?`<div class="character-finder"><label for="character-search">找一位老朋友</label><input type="search" id="character-search" placeholder="输入姓名、身份或故事线索" autocomplete="off"><div class="character-groups" role="group" aria-label="按人物分类">${['全部','同福六人','七侠镇熟人','江湖来客与亲友'].map((g,i)=>`<button type="button" data-character-group="${g}" aria-pressed="${i===0}">${g}</button>`).join('')}</div><p id="character-result-count" role="status">共 ${entries.length} 份人物档案</p></div>`:'';
 return `<div class="sheet-body"><span class="eyebrow">同福客栈 / ${String(entries.length).padStart(2,'0')} ${kind==='character'?'份人物档案':'个展品'}</span><h2 id="panel-title">${types[kind]}志</h2><p class="lead">${{character:'熟悉的掌柜伙计，来过的江湖过客，还有他们放不下的亲友。',scene:'同一间客栈，有公共的热闹，也有私人的片刻。',story:'从一件小事开始，重新认识一个人。'}[kind]}</p>${controls}<div class="directory">${cards}</div>${kind==='character'?'<p id="character-no-results" hidden>没有找到这位朋友，试试别名或身份。</p>':''}${kind==='scene'?'<p class="thematic-note">场景里的物件，也有各自的故事。</p><div class="related-links">'+data.object.map(o=>`<a href="${link('object',o.id)}">${escape(o.title)}</a>`).join('')+'</div>':''}</div>`;
}
function costumesHTML(item){
 if(!item.costumes?.length)return '';
 return `<section class="costume-gallery" aria-label="${escape(item.title)}造型档案"><h3>造型档案</h3>${item.costumes.map(c=>`<article class="costume-entry"><h4>${escape(c.title)}</h4><figure><a class="costume-photo" href="${escape(c.image)}" target="_blank" rel="noopener noreferrer" aria-label="放大${escape(c.title)}参考图（新窗口）"><img src="${escape(c.image)}" alt="${escape(c.alt)}" loading="lazy"><span>放大参考图</span></a><figcaption>${escape(c.caption)}</figcaption></figure><dl>${c.details.map(d=>`<div><dt>${escape(d.label)}</dt><dd>${escape(d.text)}</dd></div>`).join('')}</dl><p class="costume-source">${escape(c.sourceNote)}</p></article>`).join('')}</section>`;
}
function sceneContextHTML(item,sceneId,period=null){
 const activity=item.dailyActivities?.[period];
 const context=activity?{...item.sceneContexts?.[activity.mapId],...activity}:item.sceneContexts?.[sceneId];if(!context)return '';
 const refs=(context.related||[]).filter(r=>lookup(r.kind,r.id));
 return `<section class="scene-context" aria-label="${escape(context.title)}"><h3>${escape(context.title)}</h3><p>${escape(context.text)}</p>${activity?`<p class="daily-location">${period==='night'?'夜晚':'白天'} · ${escape(maps[activity.mapId].title)}</p>${activity.mapId!==sceneId?`<button class="enter-scene" data-enter-map="${activity.mapId}">去${escape(maps[activity.mapId].title)}找${escape(item.title)}</button>`:''}`:''}<div class="related-links">${refs.map(r=>`<a href="${link(r.kind,r.id)}">${escape(lookup(r.kind,r.id).title)}</a>`).join('')}</div>${context.note?`<p class="context-note">${escape(context.note)}</p>`:''}</section>`;
}

function referencePhotosHTML(item){return item.referencePhotos?.length?`<section class="memory-reference-gallery"><h3>原剧剧照 · 造型对照</h3>${item.referencePhotos.map(p=>`<figure><img src="${escape(p.image)}" alt="${escape(p.name)}原剧造型参考" loading="lazy"><figcaption>${escape(p.caption)} <a href="${escape(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">剧照来源 ↗</a></figcaption></figure>`).join('')}</section>`:'';}

function heartvoicesDetail(item){
 const [wide,...rest]=item.referencePhotos||[];
 const figure=wide?`<figure class="story-opening-still"><img src="${escape(wide.image)}" alt="${escape(wide.name)}" width="640" height="384" fetchpriority="high"><figcaption>${escape(wide.caption)} <a href="${escape(wide.sourceUrl)}" target="_blank" rel="noopener noreferrer">剧照出处</a></figcaption></figure>`:'';
 return `<article class="sheet-body story-reading-pilot"><header class="story-reading-header"><span class="eyebrow">大堂往事 · 第61集</span><h2 id="panel-title">${escape(item.title)}</h2><p class="lead">${escape(item.summary)}</p></header>${figure}<div class="story-reading-body">${sections({...item,sections:item.sections.map(section=>({...section,text:section.text.replace('原剧截图就在下方。','开篇宽镜头与下方展开的剧照，可一起对照。')}))})}<details class="story-more-stills"><summary>再看 ${rest.length} 张原剧剧照</summary>${referencePhotosHTML({...item,referencePhotos:rest})}</details>${relatedHTML(item)}${sourcesHTML(item)}</div></article>`;
}
function detail(kind,item,sceneId=null,period=null){
 if(kind==='story'&&item.id==='hall-heartvoices')return heartvoicesDetail(item);
 let content=(item.mapId?`<button class="enter-scene" data-enter-map="${item.mapId}">进入${maps[item.mapId].title}地图</button>`:"")+(kind==='character'?sceneContextHTML(item,sceneId,period)+catchphrasesHTML(item):'')+sections(item)+referencePhotosHTML(item)+costumesHTML(item)+relatedHTML(item)+sourcesHTML(item);
 if(kind==='character'){const portrait=item.portrait;return `<div class="portrait-layout"><div class="portrait-side">${portrait?`<figure class="character-photo${portrait.landscape?' portrait-landscape':''}"><div class="portrait-photo-frame"><img class="character-art" src="${escape(portrait.image)}" alt="${escape(portrait.alt)}"></div><figcaption><span class="photo-kind">${escape(portrait.kind)}</span><p>${escape(portrait.caption)}</p><a class="portrait-source" href="${escape(portrait.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escape(portrait.sourceLabel)} ↗</a></figcaption></figure>`:`<div class="character-calligraphy" aria-hidden="true">${escape(item.title)}</div><p>${escape(item.title)} · ${escape(item.role)}</p>`}</div><div class="portrait-copy"><span class="eyebrow">人物志 / ${escape(item.archiveGroup||'江湖来客与亲友')}</span><h2 id="panel-title">${escape(item.title)}</h2><p class="role">${escape(item.role)}</p>${tags(item)}<p class="lead">${escape(item.summary)}</p>${content}</div></div>`;}
 return `<article class="sheet-body"><span class="eyebrow">${types[kind]}档案${item.contentType?' / '+item.contentType:''}</span><h2 id="panel-title">${escape(item.title)}</h2>${kind==='relationship'?`<p class="thematic-note">${escape(item.relationshipType)}</p>`:''}<p class="lead">${escape(item.summary)}</p>${tags(item)}${content}</article>`;
}
function catchphrasesHTML(item){
 if(!item.catchphrases?.length)return '';
 return `<section class="catchphrases" aria-label="${escape(item.title)}口头禅与招牌台词"><h3>口头禅与招牌台词</h3>${item.catchphrases.map(q=>`<figure><blockquote>${escape(q.text)}</blockquote><figcaption>${escape(q.type)}</figcaption></figure>`).join('')}</section>`;
}
function connectionDiagram(){
 const nodes={
  'guest-room':[180,65,'客房','已开放一间'],roof:[650,65,'屋顶','前往屋顶'],upper:[400,175,'二层走廊','L 形走廊'],'owner-room':[650,175,'掌柜房','右侧走廊入口'],
  'left-alley':[150,310,'左侧小巷','跃窗落点'],hall:[400,345,'大堂','前台 · 主桌 · 大门'],street:[150,455,'门前街边','对面是怡红酒楼'],courtyard:[400,495,'后院','连接厨房与寝室'],
  kitchen:[650,420,'厨房','男寝可直接穿门'],'men-room':[650,570,'男寝','秀才与大嘴'],'women-room':[400,660,'女寝','小贝与小郭']
 };
 const paths={
  'guest-room|upper':'M220 97L365 143','roof|upper':'M610 97L435 143','owner-room|upper':'M580 175H470','hall|upper':'M400 313V207',
  'left-alley|upper':'M330 175H150V278','left-alley|street':'M150 342V423','hall|street':'M330 345H245V439H220','courtyard|street':'M220 471H285V511H330','courtyard|hall':'M400 377V463',
  'courtyard|kitchen':'M470 495H530V420H580','courtyard|men-room':'M470 495H530V570H580','courtyard|women-room':'M400 527V628','kitchen|men-room':'M650 452V538'
 };
 const pairs=new Map();
 for(const [from,links] of Object.entries(mapConnections))for(const id of Object.keys(links)){const to=mapAliases[id]||id,key=[from,to].sort().join('|');if(!pairs.has(key))pairs.set(key,[]);pairs.get(key).push([from,to]);}
 const edges=[...pairs].map(([key,directions])=>{const jump=key==='left-alley|upper',guide=key==='roof|upper';return `<path data-from="${directions[0][0]}" data-to="${directions[0][1]}" data-direction="${directions.length===2?'both':'one'}" d="${paths[key]}" class="${jump?'jump-edge':guide?'guide-edge':'room-edge'}"${jump?' marker-end="url(#jump-arrow)"':''}/>`;}).join('');
 return `<div class="connection-scroll"><svg class="connection-map" viewBox="0 0 800 720" aria-labelledby="connection-title connection-desc"><title id="connection-title">同福客栈场景连通图</title><desc id="connection-desc">实线表示双向通道。二层窗口单向跃到左侧小巷，小巷连门前街边，街边从正门进大堂。门前右侧路口直接连接后院，厨房与男寝直接相通。屋顶以虚线导览通路连接二层，具体入口尚未核实。</desc><defs><marker id="jump-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#aa453a"/></marker></defs><g fill="none">${edges}</g><text class="edge-note" x="172" y="240">单向跃窗</text><text class="edge-note" x="534" y="112">导览通路</text><text class="edge-note" x="230" y="545">右侧路口</text>${Object.entries(nodes).map(([id,[x,y,title,note]])=>`<a href="#scene:${id}" data-enter-map="${id}" aria-label="进入${title}地图"><g transform="translate(${x},${y})"><rect x="-70" y="-32" width="140" height="64" rx="4"/><text class="node-title" text-anchor="middle" y="-3">${title}</text><text class="node-note" text-anchor="middle" y="19">${note}</text></g></a>`).join('')}</svg></div><div class="connection-key"><span><i class="key-both"></i>双向通道</span><span><i class="key-jump"></i>单向跃窗</span><span><i class="key-guide"></i>屋顶导览通路</span></div>`;
}
function layout(){return `<div class="sheet-body"><span class="eyebrow">同福客栈 / 空间关系</span><h2 id="panel-title">客栈各处怎么相通</h2><p class="lead">跃窗落在左侧小巷，门前右侧路口直达后院。</p>${connectionDiagram()}<p class="layout-note">点场景可进入地图；手机上可横向滑动。点场景可进入；另外两间客房暂未开放。</p><h3>大堂内部</h3><p>前台、主桌、大门正面相对。</p><svg class="layout-map" viewBox="0 0 800 520" role="img" aria-label="前台、主桌与大门同轴。楼梯紧挨前台，有两段楼梯、中间缓步台与二层平台。后院入口与关公像在右侧墙面。"><g fill="none" stroke="#8c7256" stroke-width="2"><path d="M745 240V45H55V475H745V330"/><path d="M400 50V474" stroke="#b3463b" stroke-dasharray="8 6"/><path d="M285 80H520V135H285Z" fill="#d6b48a"/><path d="M355 215H445V365H355Z" fill="#d6b48a"/><path d="M335 430H465V475H335Z" fill="#d6b48a"/><path d="M600 45H705V90H600Z" fill="#e5d0aa"/><path d="M600 90H650V150H600ZM520 150H650V200H520ZM520 200H570V300H520Z"/><path d="M520 135V150M520 220H570M520 240H570M520 260H570M520 280H570M600 110H650M600 130H650"/><path d="M745 240L690 290" stroke="#aa453a" stroke-width="3"/><path d="M55 465H335M465 465H745"/></g><g text-anchor="middle"><text x="400" y="114">前台</text><text x="400" y="290">主桌</text><text x="400" y="459">大门</text><text x="653" y="75">二层平台</text><text x="625" y="119">第二段</text><text x="585" y="181">中间缓步台</text><text x="548" y="325">第一段</text><text x="681" y="220">关公像</text><text x="681" y="340">右墙 · 后院入口</text><text x="172" y="265">大堂</text></g></svg><p class="layout-note">楼梯紧挨前台，通往后院的门开在右侧墙上；主桌的长边朝向前台和大门。这张示意图表达空间关系，不代表剧中的摄影机位。</p></div>`;}
function renderRoute(){const route=decodeURIComponent(location.hash.slice(1));
 document.querySelectorAll('.mast nav a').forEach(a=>{const active=a.getAttribute('href')==='#'+(route.split(':')[0]||'');if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});if(!route){if(dialog.open)dialog.close();historyStack=[];renderedArchiveRoute='';storyNight=false;refreshTime();document.title='同福客栈 · 武林外传线上博物馆';return;}
 let html;const [kind,id]=route.split(':');storyNight=kind==='story'&&nightStories.has(id);refreshTime();
 if(route==='layout')html=layout();else if(!id&&['character','scene','story'].includes(kind))html=directory(kind,scenePeriod());else{let item=lookup(kind,id);if(!item){html='<div id="panel-error"><h2 id="panel-title">这页手记没有找到</h2><p>回到客栈，再找一位老朋友。</p><a href="#">回到地图</a></div>';}else{html=detail(kind,item,currentMap,scenePeriod());visited.add(`${kind}:${id}`);updateVisited();document.title=`${item.title} · 同福客栈博物馆`;}}
 panel.innerHTML=(storyNight?`<p class="story-time-note">夜间故事${timeOfDay==='day'?' · 关闭后恢复白天':''}</p>`:'')+html;document.querySelector('#back').hidden=historyStack.length<2;
 if(kind==='character'&&!id) initCharacterFinder();
 if(!id)document.title=`${types[kind]||'客栈空间'}${types[kind]?'志':''} · 同福客栈博物馆`;
 const previous=historyStack.at(-2);const closeButton=document.querySelector('#close');
 const closeLabel=previous?(types[previous]?'返回'+types[previous]+'志':'返回上一页'):'关闭';
 closeButton.innerHTML=`${closeLabel} <span aria-hidden="true">×</span>`;closeButton.setAttribute('aria-label',previous?closeLabel:'关闭档案，回到客栈');
 if(!dialog.open){lastFocus=document.activeElement;dialog.showModal();}const view=archiveViews.get(route);renderedArchiveRoute=route;
 const focusLink=view?.focusHref?[...panel.querySelectorAll('a[href]')].find(a=>a.getAttribute('href')===view.focusHref&&!a.hidden):null;
 (focusLink||document.querySelector('#close')).focus({preventScroll:true});dialog.scrollTop=view?.scrollTop||0;
}
function initCharacterFinder(){
 const search=panel.querySelector('#character-search');if(!search)return;
 const saved=archiveViews.get('character');search.value=saved?.query||'';let selected=saved?.group||'全部';
 const update=()=>{
  const query=search.value.trim().toLocaleLowerCase();let count=0;
  panel.querySelectorAll('[data-character-entry]').forEach(entry=>{
   const matches=(selected==='全部'||entry.dataset.group===selected)&&entry.dataset.search.toLocaleLowerCase().includes(query);
   entry.hidden=!matches;if(matches)count++;
  });
  panel.querySelector('#character-result-count').textContent=`找到 ${count} 份人物档案`;
  panel.querySelector('#character-no-results').hidden=count!==0;
 };
 panel.querySelectorAll('[data-character-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.characterGroup===selected)));
 update();search.addEventListener('input',update);
 panel.querySelectorAll('[data-character-group]').forEach(button=>button.addEventListener('click',()=>{
  selected=button.dataset.characterGroup;
  panel.querySelectorAll('[data-character-group]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  update();
 }));
}
function rememberArchiveView(){
 if(!renderedArchiveRoute||!dialog.open)return;
 const search=panel.querySelector('#character-search');
 archiveViews.set(renderedArchiveRoute,{
  scrollTop:dialog.scrollTop,
  query:search?.value||'',
  group:panel.querySelector('[data-character-group][aria-pressed="true"]')?.dataset.characterGroup||'全部',
  focusHref:panel.contains(document.activeElement)?document.activeElement.closest('a[href]')?.getAttribute('href'):null
 });
}
function archiveHistoryState(){return {...history.state,archiveRoutes:[...historyStack]};}
function navigate(route){
 const current=decodeURIComponent(location.hash.slice(1));if(route===current)return;
 rememberArchiveView();if(!route){close();return;}
 if(!historyStack.length&&current)historyStack.push(current);
 historyStack.push(route);history.pushState(archiveHistoryState(),'','#'+route);renderRoute();
}
function backArchive(){
 if(historyStack.length<2){close();return;}
 rememberArchiveView();historyStack.pop();history.replaceState(archiveHistoryState(),'','#'+historyStack.at(-1));renderRoute();
}
function dismissArchive(){if(historyStack.length>1)backArchive();else close();}
document.addEventListener('click',e=>{const entry=e.target.closest('[data-enter-map]');if(entry){e.preventDefault();close();switchMap(entry.dataset.enterMap);return;}const a=e.target.closest('a[href^="#"]');if(a){e.preventDefault();navigate(a.getAttribute('href').slice(1));}});
window.addEventListener('popstate',()=>{rememberArchiveView();const route=decodeURIComponent(location.hash.slice(1));const saved=history.state?.archiveRoutes;historyStack=Array.isArray(saved)&&saved.at(-1)===route?[...saved]:(route?[route]:[]);renderRoute();});
document.querySelector('#back').onclick=backArchive;
const close=()=>{rememberArchiveView();renderedArchiveRoute='';historyStack=[];history.replaceState(null,'',location.pathname);dialog.close();storyNight=false;refreshTime();document.title='同福客栈 · 武林外传线上博物馆';lastFocus?.focus();};
document.querySelector('#close').onclick=dismissArchive;dialog.addEventListener('cancel',e=>{e.preventDefault();dismissArchive();});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismissArchive();}});
function updateVisited(){document.querySelector('#visit-count').textContent=visited.size?`这次停留 · 看过 ${visited.size} 处`:'';document.querySelectorAll('.hotspot').forEach(b=>b.classList.toggle('seen',visited.has(b.dataset.route)));}
const icons={character:'<circle cx="12" cy="6" r="3"/><path d="M6 21v-5a6 6 0 0 1 12 0v5M8 21h8"/>',scene:'<path d="m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7"/>',object:'<rect x="5" y="5" width="14" height="14"/><path d="M5 10h14M10 5v14"/>',story:'<path d="M3 5q5-2 9 1 4-3 9-1v15q-5-2-9 1-4-3-9-1ZM12 6v15"/>'};
const placements=[
['character','xiangyu',42,41],['character','zhantang',38,63],['character','furong',27,60],['character','xiucai',56,44],['character','dazui',77,47],['character','xiaobei',67,42],['character','xing',18,68],['character','yan',78,67],
['scene','hall',59,55],['scene','counter',44,34],['scene','courtyard',88.2,40],['scene','upper',72,18],['scene','entrance',50,85],
['object','abacus',33,30],['object','ledger',48,31],['object','wine',69,37],['object','main-table',50,54],['object','stairs',62,31],['object','hall-guandi',82.8,32],['object','hall-blue-bands',46,14],
['story','arrival',44,88],['story','scholar',47,64],['story','past',36,61],['story','love',37,45],['story','huilan-story',76,43],['story','xiaobei-story',71,10],['story','trouble',61,70],['story','ordinary',52,69]];
const maps={
 'left-alley':{figureHeight:170,title:'客栈左侧小巷',art:'assets/left-alley-notices-day-v01.webp',description:'二层窗口跃下的落点在左侧小巷 · 沿巷口到门前街边，再进大堂上楼',points:[['scene','street',20,82],['scene','upper-window',64,30]]},
 roof:{figureHeight:390,title:'客栈屋顶',art:'assets/roof-night-v02.webp',description:'屋脊坐一会儿 · 翻看第24、36、40、62、68集的夜话与心事 · 左侧返回二层',points:[['scene','upper',9,84],['character','xiangyu',44.5,41],['character','zhantang',55.5,41],['object','roof-tiles',50,76],['object','roof-ridge',50,41],['story','roof-love',25,66],['story','roof-talk',77,66],['story','midautumn',50,80]]},
 street:{figureHeight:160,title:'客栈门前街道',art:'assets/street-v05.webp',description:'对面是怡红酒楼 · 面向客栈：左侧进小巷，右侧通后院，正门回大堂',points:[['scene','hall',36.5,62],['character','xiaomi',31.8,77],['object','street-bench',26,73],['object','street-tea-stall',20,78],['object','street-jar',63,73],['scene','left-alley',6,70],['scene','courtyard',49,66],['object','street-lanterns',42.5,51],['scene','yihong',79,67],['object','yihong-lions',70.5,75]]},
 'guest-room':{figureHeight:235,title:'客房',art:'assets/guest-room-v01.webp',description:'窗下木榻、红屏风与茶桌 · 从右侧房门回二层走廊',points:[['scene','upper',89,57],['object','guest-sleeping-couch',49,36],['object','guest-screen',68,33],['object','guest-tea-table',49,48],['object','guest-settee',28,73],['object','guest-door-lions',93,48]]},
 'owner-room':{figureHeight:235,title:'掌柜房',art:'assets/owner-room-v01.webp',description:'原剧粉色床帐、黄绿隔帘与窗边陈设 · 从前景返回二层右侧走廊',points:[['character','xiangyu',27,83],['scene','upper',53,94],['object','owner-canopy-bed',32,34],['object','owner-cabinet',49,41],['object','owner-tea-table',50,69],['object','owner-standing-lamp',57,41],['object','owner-window-console',74,45]]},
 upper:{figureHeight:170,title:'二层走廊',art:'assets/upper-aligned-day-v01.webp',description:'L 形走廊：客房在上方，掌柜房在右侧，通向左侧小巷的窗口在左端· 屋顶已开放',points:[['scene','hall',72,43],['scene','guest-room',32,25],['scene','guest-rooms',50,25],['scene','guest-rooms',67,25],['scene','owner-room',90,59],['scene','upper-window',20,19],['scene','roof-access',80,28]]},
 hall:{figureHeight:170,title:'大堂',art:'assets/map-v4.webp',description:'柜台旁上二层 · 蓝布门帘通向后院，关公像在通口左侧',points:placements},
 courtyard:{figureHeight:175,title:'后院',art:'assets/courtyard-v04.webp',description:'左侧院门回大堂 · 院外通路可直接回门前街边',points:[['character','furong',45,70],['character','dazui',53,54],['character','wushuang',76,64],['scene','street',96,62],['scene','hall',10,32],['scene','kitchen',55,19],['scene','women-room',26,74],['scene','men-room',78,33],['object','well',62,45],['object','stone-mill',41,45],['object','stable',21,35],['object','chicken-coop',71,36],['story','ordinary',61,67]]},
 kitchen:{figureHeight:225,title:'后厨',art:'assets/kitchen-v05.webp',description:'前侧砖灶与蒸笼、右侧备菜区 · 后门回后院，左侧门直通男寝',points:[['character','dazui',83,69],['scene','courtyard',46,38],['scene','men-room',12,46],['object','stove',25,68],['object','prep-table',88,54],['object','cleaver',89,56],['object','kitchen-cupboard',76,36],['story','ordinary',63,85],['story','huilan-story',73,82]]},
 'women-room':{figureHeight:240,title:'女寝 · 小贝与小郭',art:'assets/women-room-v03.webp',description:'小贝与小郭合住的房间 · 从右后侧房门回后院',points:[['character','xiaobei',33,79],['character','furong',64,69],['scene','courtyard',71,41],['object','shared-platform',32,43],['object','room-wardrobe',12,50],['object','xiaobei-desk',44,60],['object','room-washstand',55,44],['object','room-tea-table',85,54],['story','xiaobei-story',21,84]]},
 'men-room':{figureHeight:225,title:'男寝 · 秀才与大嘴',art:'assets/men-room-v02.webp',description:'左侧木床、右侧砖炕 · 后门回后院，右侧门直通厨房',points:[['character','xiucai',35,78],['character','dazui',74,80],['scene','courtyard',36,39],['scene','kitchen',86,52],['object','men-wood-bed',18,53],['object','men-brick-kang',61,45],['object','men-bookcase',18,33],['object','men-table',47,60],['object','men-washstand',76,48],['story','scholar',20,78],['story','huilan-story',84,85]]}
};
const nightStories=new Set(['roof-love','roof-talk','midautumn','hall-floor-night']);
const nightArt={hall:'assets/hall-night-v01.webp',upper:'assets/upper-aligned-night-v01.webp','owner-room':'assets/owner-room-night-v01.webp','guest-room':'assets/guest-room-night-v01.webp','left-alley':'assets/left-alley-notices-night-v01.webp',street:'assets/street-night-v01.webp',courtyard:'assets/courtyard-night-v01.webp',kitchen:'assets/kitchen-night-v01.webp','women-room':'assets/women-room-night-v01.webp','men-room':'assets/men-room-night-v01.webp',roof:'assets/roof-night-v02.webp'};
maps.roof.dayArt='assets/roof-day-v01.webp';
const outdoorMaps=new Set(['roof','street','left-alley','courtyard']);
const mapAliases={entrance:'street','upper-window':'left-alley','roof-access':'roof'};
const mapConnections={roof:{upper:'回二层走廊'},street:{hall:'进门回大堂','left-alley':'转入左侧小巷',courtyard:'从右侧路口去后院'},'left-alley':{street:'沿巷口到门前街边'},hall:{courtyard:'去后院',upper:'上二层',entrance:'出门到街边'},upper:{'roof-access':'上屋顶','upper-window':'跃窗到左侧小巷',hall:'下楼回大堂','owner-room':'进掌柜房','guest-room':'进客房'},'guest-room':{upper:'回二层走廊'},'owner-room':{upper:'回二层走廊'},courtyard:{street:'沿院外通路回门前街边',hall:'回大堂',kitchen:'进后厨','women-room':'进女寝','men-room':'进男寝'},kitchen:{courtyard:'回后院','men-room':'穿门进男寝'},'women-room':{courtyard:'回后院'},'men-room':{courtyard:'回后院',kitchen:'穿门进厨房'}};
const mapActivities={roof:{xiangyu:'与老白并坐聊天',zhantang:'陪掌柜坐一会儿'},street:{xiaomi:'坐在客栈门旁乞讨'},'owner-room':{xiangyu:'在自己的房间歇一会儿'},courtyard:{furong:'提桶干活',dazui:'取水歇一会儿',wushuang:'整理布巾'},kitchen:{dazui:'在备菜桌旁备菜'},'women-room':{xiaobei:'抱着布老虎玩',furong:'在房里叠布巾'},'men-room':{xiucai:'在读书桌旁捧书阅读',dazui:'歇一会儿'}};
function pointsForMap(mapId,period){
 const base=maps[mapId].points;if(!period)return base;
 const scheduled=data.character.filter(c=>c.dailyActivities?.[period]);
 const ids=new Set(scheduled.map(c=>c.id));
 return [...base.filter(p=>p[0]!=='character'||!ids.has(p[1])),...scheduled.filter(c=>c.dailyActivities[period].mapId===mapId).map(c=>['character',c.id,c.dailyActivities[period].x,c.dailyActivities[period].y])];
}
function poseForCharacter(id,mapId,period){
 const c=lookup('character',id),activity=c.dailyActivities?.[period];
 return {...c.mapPresence,...c.scenePoses?.[mapId],...(activity?.mapId===mapId?activity.pose:{})};
}
function activityForCharacter(id,mapId,period){const c=lookup('character',id),activity=c.dailyActivities?.[period];return activity?.mapId===mapId?activity.activity:(mapActivities[mapId]?.[id]||c.mapPresence.activity);}
function scenePeriod(){return storyNight?'night':timeOfDay;}
function refreshTime(){
 const period=scenePeriod(),m=maps[currentMap],label=period==='night'?'夜晚':'白天';
 const img=document.querySelector('.map-art'),art=period==='night'?nightArt[currentMap]:(m.dayArt||m.art),canvas=document.querySelector('#map');
 if(img.getAttribute('src')!==art){
  canvas.classList.add('lighting-loading');document.querySelector('#map-loading').textContent='正在打开场景…';
  img.onload=()=>{canvas.classList.remove('lighting-loading');document.querySelector('#map-loading').textContent='';};
  img.onerror=()=>{document.querySelector('#map-loading').textContent='场景图暂时没有打开，请切换场景或刷新再试。';};
  img.src=art;
 }
 document.querySelector('#map').dataset.time=period;
 document.querySelector('#map').dataset.light=outdoorMaps.has(currentMap)?'outdoor':'indoor';
 document.querySelector('#time-label').textContent=`七侠镇 · ${label}`;
 const timeToggle=document.querySelector('#time-toggle');if(timeToggle){timeToggle.setAttribute('aria-checked',String(period==='night'));timeToggle.setAttribute('title',period==='night'?'切换到白天':'切换到夜晚');}
 document.querySelector('#time-status').textContent=storyNight&&timeOfDay==='day'?'夜间故事 · 关闭后恢复白天':'';
 const scheduleKey=`${currentMap}:${period}`;if(canvas.dataset.schedule!==scheduleKey){hotspots();updateVisited();canvas.dataset.schedule=scheduleKey;}
 document.querySelector('#map-caption').textContent=currentMap==='roof'?`${period==='night'?'月下':'日光下'}坐一会儿 · 翻看第24、36、40、62、68集的夜话与心事 · 左侧返回二层`:m.description;
}
function setTime(period){if(!['day','night'].includes(period))return;timeOfDay=period;refreshTime();}
function switchMap(id){if(!maps[id])return;currentMap=id;document.body?.setAttribute?.('data-room',id);const hotspotOptions=document.querySelector('.hotspot-options');if(hotspotOptions)hotspotOptions.open=id!=='hall';const m=maps[id],img=document.querySelector('.map-art');img.alt=id==='hall'?'同福客栈大堂：右墙后院入口，楼梯紧挨前台':m.description;document.querySelector('.map-corner small').textContent=m.title;document.querySelector('#current-room-title').textContent=m.title;document.querySelectorAll('[data-map]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.map===id)));refreshTime();}

document.querySelectorAll('[data-map]').forEach(b=>b.onclick=()=>switchMap(b.dataset.map));
document.querySelector('#time-toggle')?.addEventListener('click',()=>setTime(timeOfDay==='day'?'night':'day'));
function hotspots(){
 document.querySelector('#map-labels').innerHTML=currentMap==='street'?'<span class="street-sign">同福客栈</span><span class="yihong-sign">怡红酒楼</span>':'';
 const points=pointsForMap(currentMap,scenePeriod());
 // Size against the scene's own doorway/furniture scale, preserving relative stature.
 const scenePose=id=>poseForCharacter(id,currentMap,scenePeriod());
 const figureStyle=(id,y)=>{const pose=scenePose(id);const depth=Math.min(1.18,Math.max(.90,1+(y-55)*.006));const height=maps[currentMap].figureHeight*(pose.height/72)*depth*(pose.stanceScale??1)/941*100;const bottom=y+height*(1-(pose.anchorY??1));return `--figure-height:${height.toFixed(3)}%;--figure-ratio:${pose.width}/${pose.cropHeight};--figure-bottom:${bottom.toFixed(3)}%`;};
 document.querySelector('#figures').innerHTML=points.filter(p=>p[0]==='character').sort((a,b)=>a[3]-b[3]).map(([,id,x,y])=>{const c=lookup('character',id);const pose=scenePose(id);return `<span class="map-figure" data-character="${id}" style="--x:${x}%;--y:${y}%;${figureStyle(id,y)}"><span class="sprite-art" style="aspect-ratio:${pose.width}/${pose.cropHeight}${pose.mirror?';transform:scaleX(-1)':''}"><img src="${pose.image||'assets/tongfu-idle-v03.webp'}" alt="" style="width:${pose.atlasWidth/pose.width*100}%;left:${-pose.cropX/pose.width*100}%;top:${-pose.cropY/pose.cropHeight*100}%"></span></span>`;}).join('');
 document.querySelector('#hotspots').innerHTML=points.map(([kind,id,x,y])=>{const item=lookup(kind,id);const portal=kind==='scene'&&Boolean(mapConnections[currentMap]?.[id]);const person=kind==='character',main=kind==='object'&&id==='main-table';return `<button class="hotspot ${person?'figure-target':''} ${main?'gathering-target':''} ${portal?'portal-target':''} ${currentMap==='upper'&&kind==='scene'&&!portal?'waypoint-target':''}" data-kind="${kind}" data-connection="${portal?[currentMap,id].sort().join('-'):''}" data-target-map="${portal?(mapAliases[id]||id):''}" data-route="${kind}:${id}" style="--x:${x}%;--y:${y}%;--c:var(--${main?'story':kind})${person?`;${figureStyle(id,y)}`:''}" aria-label="${types[kind]}：${escape(item.title)}${person?' · '+escape(currentMap==='hall'?item.mapPresence.area:maps[currentMap].title):''}">${person?'':`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[main?'story':kind]}</svg>`}<span class="tip">${portal?mapConnections[currentMap][id]:escape(item.title)}${main?' · 大家坐一起':person?' · '+escape(activityForCharacter(id,currentMap,scenePeriod())):''}</span></button>`;}).join('');
 document.querySelectorAll('.hotspot').forEach(b=>b.onclick=()=>{if(b.classList.contains('portal-target'))switchMap(b.dataset.targetMap);else navigate(b.dataset.route);});
 applyFilter();if(guideTargetRoute)highlightGuideTarget(guideTargetRoute);
}
function applyFilter(){document.querySelectorAll('[data-filter]').forEach(t=>t.setAttribute('aria-pressed',String(t.dataset.filter===filter)));document.querySelectorAll('.hotspot').forEach(h=>{if(h.classList.contains('portal-target')){h.hidden=false;return;}h.hidden=filter==='explore'?(currentMap!=='hall'?false:!(h.dataset.kind==='character'||h.dataset.route==='object:main-table'||h.classList.contains('portal-target'))):filter!=='all'&&h.dataset.kind!==filter;});document.querySelector('#map').classList.toggle('secondary-view',!['all','explore','character'].includes(filter));}
function highlightGuideTarget(route){
 document.querySelectorAll('.guide-target').forEach(el=>el.classList.remove('guide-target'));
 applyFilter();guideTargetRoute=route;
 const target=route?[...document.querySelectorAll('.hotspot')].find(el=>el.dataset.route===route):null;
 if(target){target.hidden=false;target.classList.add('guide-target');if(highlightedGuideNode!==target){const scroll=document.querySelector('#map-scroll');scroll.scrollLeft=Math.max(0,target.offsetLeft-scroll.clientWidth/2);}}
 highlightedGuideNode=target;
}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;applyFilter();const options=document.querySelector('.hotspot-options');if(currentMap==='hall'&&options){options.open=false;const summary=options.querySelector('summary');summary.textContent=filter==='explore'?'显示热点':'显示热点 · '+b.textContent.trim();summary.focus({preventScroll:true});}});
document.querySelector('.hotspot-options')?.addEventListener('keydown',e=>{if(e.key==='Escape'){e.currentTarget.open=false;e.currentTarget.querySelector('summary').focus({preventScroll:true});}});
document.querySelector('#zoom').onclick=()=>{const zoom=document.querySelector('#map').classList.toggle('zoomed');document.querySelector('#zoom').textContent=zoom?'看全景':'看近些';if(zoom){const scroll=document.querySelector('#map-scroll');scroll.scrollLeft=(scroll.scrollWidth-scroll.clientWidth)/2;}};
try{await Promise.all(Object.entries(fileNames).map(async([kind,file])=>{const response=await fetch(`data/${file}.json`);if(!response.ok)throw Error(`Failed ${file}`);data[kind]=await response.json();}));
 // Derive bidirectional links from canonical relation and story records.
 for(const c of data.character){for(const r of data.relationship)if(r.memberCharacters.includes(c.id)){if(!c.related.some(x=>x.kind==='relationship'&&x.id===r.id))c.related.push({kind:'relationship',id:r.id});};for(const s of data.story)if(s.characters.includes(c.id)){if(!c.related.some(x=>x.kind==='story'&&x.id===s.id))c.related.push({kind:'story',id:s.id});};for(const s of data.scene)if(s.related.some(r=>r.kind==='character'&&r.id===c.id)){if(!c.related.some(x=>x.kind==='scene'&&x.id===s.id))c.related.push({kind:'scene',id:s.id});};}
 switchMap('hall');initRoomMinimap();const hallMemory=initHallMemories({lookup,navigate,getMap:()=>currentMap,getTime:()=>timeOfDay,setTime});await initGuestMemories({lookup,navigate,getMap:()=>currentMap});const roofMemory=await initRoofMemories({lookup,navigate,getMap:()=>currentMap,getTime:()=>timeOfDay,setTime});const courtyardMemory=await initCourtyardMemories({lookup,navigate,getMap:()=>currentMap,getTime:()=>timeOfDay,setTime});const womenMemory=initWomenMemories({lookup,navigate,getMap:()=>currentMap,getTime:()=>timeOfDay,setTime});initGuide({maps,lookup,highlightTarget:highlightGuideTarget,switchMap,setTime:t=>{womenMemory?.exit(false);hallMemory?.exit(false);roofMemory?.exit(false);courtyardMemory?.exit(false);setTime(t);},navigate,close,getMap:()=>currentMap,getTime:()=>scenePeriod()});document.querySelector('#map-loading').textContent='';if(location.hash){historyStack=[location.hash.slice(1)];renderRoute();}const scroll=document.querySelector('#map-scroll');if(innerWidth<760)scroll.scrollLeft=(scroll.scrollWidth-scroll.clientWidth)/2;
}catch(e){document.querySelector('#map-loading').textContent='客栈手记暂时没有打开，请刷新再试。';console.error(e);}
