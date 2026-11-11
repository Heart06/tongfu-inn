export const tourStops=[
 {map:'street',time:'day',title:'先认认门',text:'客官，欢迎来同福客栈！先认认咱的门脸，对面就是怡红酒楼。门旁的小米也有自己的故事。',links:['character:xiaomi','object:sign']},
 {map:'hall',time:'day',title:'大堂里认识伙计',text:'来来来，额带你进大堂。额管这家店，老白招呼客人，秀才帮着记账。想认识他们，还是先看看额的算盘？',links:['character:zhantang','object:abacus','object:main-table']},
 {map:'courtyard',time:'day',title:'后院的日常',text:'这边是后院。小郭正忙着干活，井、洗衣盆和石磨也都在这里。客栈里的日子，就落在这些小事上。',links:['character:furong','object:well']},
 {map:'kitchen',time:'day',title:'大嘴的厨房',text:'饭菜得看大嘴的手艺。这是他的灶台和备菜桌；厨房与男寝有门相通，等会儿额带你看看。',links:['character:dazui','object:stove']},
 {map:'men-room',time:'day',title:'秀才和大嘴的房间',text:'从厨房穿过来，就是秀才和大嘴住的男寝。木床、砖炕，还有读书桌，看看各自怎么安顿日子。',links:['object:men-wood-bed','object:men-brick-kang','object:men-table']},
 {map:'women-room',time:'day',title:'小郭和小贝的房间',text:'这是小郭和小贝的房间。小贝白天还得做功课，额可得管着她。看看书桌，再看看炕台上叠好的被褥。',links:['character:xiaobei','object:xiaobei-desk','object:shared-platform']},
 {map:'upper',time:'day',title:'上二层认路',text:'上楼后先认路：客房在这排走廊，额的房间在右侧。左端的窗口跃下去是左侧小巷，可不是正门。',links:['scene:guest-room','scene:owner-room']},
 {map:'guest-room',time:'day',title:'客官歇脚的地方',text:'客官要住店，就看看这间客房。窗下木榻、折屏和茶桌，各有各的位置，慢慢看。',links:['object:guest-sleeping-couch','object:guest-screen']},
 {map:'owner-room',time:'day',title:'掌柜的房间',text:'这里是额的房间，在右侧走廊。床帐、柜子和圆茶桌，把额在客栈里的私人生活也留了下来。',links:['object:owner-canopy-bed','object:owner-tea-table']},
 {map:'left-alley',time:'day',title:'窗口外的小巷',text:'这是二层窗口外的左侧小巷。看看左墙的告示，沿巷口能到门前街边；从正门进去才能回大堂上楼。',links:['scene:upper-window']},
 {map:'roof',time:'night',title:'月下坐一会儿',text:'逛到这里，换个夜晚的光景吧。额和老白坐在屋脊上，聊聊心事。这里收了几段不同集数的夜话，你挑一段看看。',links:['story:roof-love','story:roof-talk','story:midautumn']}
];

const stopDetails={
 street:{notes:[['门前怎么走','面对同福客栈：正门进大堂，右侧路口去后院，左侧进小巷。怡红酒楼在街对面，当前只开放外观。'],['值得细看','同福的灰砖木门面与怡红的彩绘檐梁形成对照；门旁长凳、灯笼和茶棚也能单独查看。']],links:['scene:street','scene:yihong','character:xiaomi','object:sign','object:street-bench','object:street-tea-stall','object:street-lanterns','story:xing-secret']},
 hall:{notes:[['大堂的主轴','前台、纵向主桌和正门正面相对。楼梯紧挨前台，分两段，经中间缓步台到二层平台。'],['右墙的通口','关公像与挂蓝布帘的后院门在右侧墙面。这里的后院入口与厨房是不同的空间。'],['人物分工','湘玉经营客栈，老白跑堂，秀才记账；点人物志还能查看关系、口头禅和服装。'],['大堂里的往事','第42集，大家在这里打地铺，听老白给小贝讲故事。大堂地图边缘的“这里发生过……”，也收着秀才应对姬无命和小郭初来的故事。']],links:['scene:counter','character:xiangyu','character:zhantang','character:xiucai','object:abacus','object:ledger','object:main-table','object:stairs','object:hall-guandi','story:hall-floor-night','story:ordinary','story:past']},
 courtyard:{notes:[['院子连接哪里','大堂右墙门到后院；后院连接厨房、男寝和女寝。门前右侧还可走院外通路来到后院。'],['日常物件','水井、洗衣盆、石磨、马厩和鸡笼分别有档案。小郭与无双的劳动和分工也值得一起看。']],links:['scene:courtyard','character:furong','character:wushuang','object:well','object:washbasin','object:stone-mill','object:stable','object:chicken-coop','story:arrival','story:help']},
 kitchen:{notes:[['两处入口','厨房可以从后院进入，也能穿门直接到男寝；不用绕回院子。'],['从灶台看到备菜桌','前侧砖灶上放蒸笼，右墙安排备菜桌，后侧是碗柜与格窗。菜刀是厨子的备菜工具。']],links:['scene:kitchen','character:dazui','object:stove','object:prep-table','object:cleaver','object:kitchen-cupboard','story:huilan-story']},
 'men-room':{notes:[['谁住在这里','秀才与大嘴合住。'],['两条出路','后墙门回后院，右侧门直接到厨房。读书桌、书架、洗漱架与床铺可以分别点开。']],links:['scene:men-room','character:xiucai','character:dazui','object:men-wood-bed','object:men-brick-kang','object:men-table','object:men-bookcase','object:men-washstand','story:scholar']},
 'women-room':{notes:[['谁住在这里','小贝与小郭合住，从后院进入，离开也回到后院。白天的小贝在做功课，夜晚两人在房间歇息。'],['房间里的细节','炕台铺席、低柜叠花被。窗台泥老虎与脸谱、柱上彩色纸玩具，和桌上的书页、笔筒、红烛一起呈现日常生活。']],links:['scene:women-room','character:xiaobei','character:furong','object:shared-platform','object:room-wardrobe','object:xiaobei-desk','object:room-washstand','object:room-tea-table','story:xiaobei-story','story:love']},
 upper:{notes:[['二层的房门','三处客房入口沿横向走廊排列，左侧一间已开放。掌柜房入口在右侧走廊，走道围着大堂挑空区呈 L 形。'],['向下看大堂','从栏杆向下看：前台、纵向主桌、大门同轴；楼梯紧挨前台，后院通口与关公像在右墙。'],['窗口与屋顶','左端窗口单向跃到左侧小巷；回二层需绕到正门上楼。']],links:['scene:upper','scene:guest-rooms','scene:guest-room','scene:owner-room','scene:upper-window','scene:roof-access','object:stairs']},
 'guest-room':{notes:[['家具布局','后墙格窗下是叠被木榻，右侧立红木折屏与置物架。中央茶桌配圆凳，前侧另有木坐榻与长条木案。'],['门内与门外','房门回二层横向走廊。']],links:['scene:guest-room','object:guest-sleeping-couch','object:guest-screen','object:guest-tea-table','object:guest-settee','object:guest-door-lions']},
 'owner-room':{notes:[['掌柜的私人空间','房门开在二层右侧走廊。第15集里有粉色床帐与黄绿隔帘，床旁木柜上放着箱子。'],['床边与窗下','圆茶桌、红布罩落地灯、格窗下木案上的小佛像、瓷瓶和木盒，都有对应档案。']],links:['scene:owner-room','character:xiangyu','object:owner-canopy-bed','object:owner-cabinet','object:owner-tea-table','object:owner-standing-lamp','object:owner-window-console','story:xiaobei-story']},
 'left-alley':{notes:[['跃窗落在哪里','二层左端窗口的落点是客栈左侧小巷，和正门街边分开。左墙上贴着旧纸告示。'],['怎么返回','沿巷口到门前街边，经正门回大堂，再上楼。']],links:['scene:left-alley','scene:upper-window','scene:street','scene:entrance','object:sign']},
 roof:{notes:[['坐在屋脊上','掌柜与老白坐在屋脊上，暂时放下忙碌，陪彼此聊一会儿。'],['三段不同的夜话','第24集是小郭与秀才谈喜欢；第36集是秀才与无双夜话；第40集是中秋思乡与“如果当初”。'],['回二层','沿返回入口回到二层走廊。打开夜间故事会切换夜景，关闭后恢复你选择的时段。']],links:['scene:roof','object:roof-ridge','object:roof-tiles','character:xiangyu','character:zhantang','story:roof-love','story:roof-talk','story:midautumn']}
};
for(const stop of tourStops){stop.recommended=stop.links.slice(0,3);Object.assign(stop,stopDetails[stop.map]);}
const focusStops={
 street:['character:xiaomi','看看门旁的小米','客官，先看看门旁的小米。他常坐在这里，七侠镇的消息也听了不少。'],
 hall:['character:zhantang','认识跑堂的老白','这位是老白，客人进门都得先招呼。点点他，听听跑堂之外的故事。'],
 courtyard:['object:well','看看院里的水井','到了后院，先看这口井。打水、洗衣，客栈的日常都离不开它。'],
 kitchen:['character:dazui','认识厨子大嘴','饭菜得看大嘴的手艺。他在备菜桌旁忙着，点点他，看看这位厨子的牵挂。'],
 'men-room':['object:men-wood-bed','看看男寝的木床','秀才和大嘴合住在这里。先看看这张木床，房里还有另一侧的砖炕。'],
 'women-room':['object:xiaobei-desk','看看小贝的书桌','小郭和小贝住这间。先看看书桌，小贝白天的功课可不能落下。'],
 upper:['scene:guest-room','看看客房入口','客房沿横向走廊排开。看额指的这扇门，里头已经可以进去看看。'],
 'guest-room':['object:guest-sleeping-couch','看看窗下木榻','住店的客官就在这里歇脚。先看窗下的木榻，被褥也叠在这儿。'],
 'owner-room':['object:owner-canopy-bed','看看掌柜的床帐','这是额的房间。先看看粉色床帐，和大堂里的忙碌是两种光景。'],
 'left-alley':['scene:upper-window','认认二层窗口','抬头看看二层窗口，跃下来会落在这条小巷。回去得绕到街边，再进正门。'],
 roof:['object:roof-ridge','看看大家坐的屋脊','逛到夜里，在屋脊上坐一会儿。额和老白的心事，就留在这些夜话里。']
};
for(const stop of tourStops){const [route,label,text]=focusStops[stop.map];stop.primary=route;stop.primaryLabel=label;stop.text=text;stop.recommended=[route];}

export function initGuide(api){
 const host=document.querySelector('#guide');
 let index=-1,minimized=false;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const portrait=api.lookup('character','xiangyu').image;
 function buttons(routes){return routes.map(route=>{const [kind,id]=route.split(':'),item=api.lookup(kind,id);return item?`<button data-guide-route="${route}">${esc(item.title)}</button>`:'';}).join('');}
 function render(){
  const active=index>=0;host.classList?.toggle?.('is-floating',active);host.classList?.toggle?.('is-minimized',active&&minimized);document.body?.classList?.toggle?.('guide-running',active);const stop=tourStops[index],atStop=active&&api.getMap()===stop.map&&api.getTime()===stop.time;
  api.highlightTarget?.(atStop?stop.primary:null);
  const more=atStop?`<details class="guide-details"><summary>这站还有什么</summary>${stop.notes.map(([title,text])=>`<section><h3>${esc(title)}</h3><p>${esc(text)}</p></section>`).join('')}<div class="guide-actions">${['scene','character','object','story'].map(kind=>{const routes=stop.links.filter(r=>r.startsWith(kind+':')&&!stop.recommended.includes(r));return routes.length?`<div class="guide-link-group"><h3>${{scene:'场景',character:'人物',object:'物件',story:'故事'}[kind]}</h3><div>${buttons(routes)}</div></div>`:'';}).join('')}</div></details>`:'';
  host.innerHTML=active?`<div class="guide-portrait"><p class="guide-bubble">${esc(atStop?stop.text:'客官，你先看看。想接着逛，随时回到这一站。')}</p><img src="${esc(portrait)}" alt="掌柜佟湘玉"><span>佟湘玉 · 你的向导</span></div><div class="guide-copy"><div class="guide-heading"><span class="guide-progress">${index+1}/${tourStops.length}</span><h2 id="guide-title" tabindex="-1">${esc(stop.title)}</h2><div class="guide-window-actions"><button data-guide="collapse" aria-label="${minimized?'展开讲解':'收起讲解'}" aria-expanded="${!minimized}"><span class="guide-label-full">${minimized?'展开讲解':'收起讲解'}</span><span class="guide-label-short" aria-hidden="true">${minimized?'展开':'收起'}</span></button><button data-guide="exit" aria-label="退出导览，自己随便逛"><span class="guide-label-full">自己随便逛</span><span class="guide-label-short" aria-hidden="true">退出</span></button></div></div><div class="guide-controls"><div class="guide-actions guide-recommended">${atStop?`<button class="guide-primary" data-guide-route="${esc(stop.primary)}">${esc(stop.primaryLabel)}</button>`:`<button data-guide="return">继续这一站 · ${esc(api.maps[stop.map].title)}</button>`}</div>${more}<div class="guide-navigation"><button data-guide="prev" ${index===0?'disabled':''}>上一站</button><span>${stop.time==='night'?'夜晚':'白天'} · ${esc(api.maps[stop.map].title)}</span><button data-guide="${index===tourStops.length-1?'finish':'next'}">${index===tourStops.length-1?'逛完了':'下一站 · '+esc(api.maps[tourStops[index+1].map].title.replace('客栈','').split(' · ')[0])}</button></div></div></div>`:`<div class="guide-intro"><h2 id="guide-title" tabindex="-1">想怎么逛同福客栈？</h2><p>${index===-2?'先自己走走，想听介绍随时叫额。':'让掌柜领你逛逛，也可以自己慢慢看。'}</p></div><div class="guide-mode"><button data-guide="start">掌柜带你逛</button><button data-guide="free" aria-pressed="${index===-2}">自己随便逛</button></div>`;
 }

 function go(next){index=next;minimized=false;const stop=tourStops[index];api.close();api.setTime(stop.time);api.switchMap(stop.map);render();host.querySelector('h2').focus({preventScroll:true});(document.querySelector('.inn-explorer')||document.querySelector('#map'))?.scrollIntoView?.({block:'start',behavior:'auto'});}
 host.addEventListener('click',e=>{
  const route=e.target.closest('[data-guide-route]');if(route){api.navigate(route.dataset.guideRoute);return;}
  const button=e.target.closest('[data-guide]');if(!button)return;
  switch(button.dataset.guide){case 'collapse':minimized=!minimized;render();host.querySelector('[data-guide=collapse]')?.focus?.({preventScroll:true});break;case 'start':go(0);break;case 'next':if(index<tourStops.length-1)go(index+1);break;case 'prev':if(index>0)go(index-1);break;case 'return':go(index);break;case 'free':case 'exit':case 'finish':index=-2;render();host.querySelector('h2').focus({preventScroll:true});break;}
 });
 // Scene controls and doorway buttons run before this delegated listener.
 document.addEventListener('click',e=>{if(!e.target.closest('#guide')&&index>=0)queueMicrotask(render);});
 document.querySelector('#archive').addEventListener('close',()=>{if(index>=0)render();});
 render();
}
