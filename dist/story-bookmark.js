const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// The bookmark chooses a memory first; opening it never changes the room or time.
export function initStoryBookmark({root,open,chapter,reader,fold,exit}){
 root.classList.add('story-bookmark');
 root.querySelector('.memory-intro').replaceChildren(open);
 open.textContent='往事';open.setAttribute('aria-label','翻看'+(root.getAttribute('aria-label')||'这里的往事'));open.classList.add('story-bookmark-trigger');
 const picker=document.createElement('div');picker.className='story-bookmark-picker';picker.id=open.id+'-picker';picker.hidden=true;
 picker.innerHTML='<p class="story-bookmark-hint">挑一段往事，回到那一天。</p><div class="story-bookmark-list"></div>';
 root.append(picker);
 open.setAttribute('aria-controls',picker.id);open.setAttribute('aria-expanded','false');
 const current=document.createElement('p');current.className='story-bookmark-current';reader.prepend(current);
 function closePicker(){picker.hidden=true;open.setAttribute('aria-expanded','false');}
 function refresh(){
  const list=picker.querySelector('.story-bookmark-list');
  list.innerHTML=Array.from(chapter.options).map(option=>`<button type="button" data-memory-choice="${esc(option.value)}" aria-pressed="${root.classList.contains('is-open')&&chapter.value===option.value}">${esc(option.textContent)}</button>`).join('');
  list.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
   chapter.value=button.dataset.memoryChoice;
   chapter.dispatchEvent(new Event('change',{bubbles:true}));
   current.textContent='往事 · '+(chapter.selectedOptions[0]?.textContent||'');
   // Keep the scene visible after choosing; the bookmark remains available for switching.
   if(fold.getAttribute('aria-expanded')==='true')fold.click();
   closePicker();open.focus({preventScroll:true});
  }));
 }
 open.onclick=()=>{if(picker.hidden){refresh();picker.hidden=false;open.setAttribute('aria-expanded','true');picker.querySelector('button')?.focus({preventScroll:true});}else closePicker();};
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!picker.hidden){event.preventDefault();closePicker();open.focus({preventScroll:true});}});
 document.addEventListener('click',event=>{if(!root.contains(event.target))closePicker();});
 chapter.addEventListener('change',()=>{current.textContent='往事 · '+(chapter.selectedOptions[0]?.textContent||'');});
 exit.addEventListener('click',closePicker);
 new MutationObserver(()=>{if(root.hidden)closePicker();}).observe(root,{attributes:true,attributeFilter:['hidden']});
 root.querySelectorAll('.memory-toolbar button').forEach(button=>{if(button!==fold&&button!==exit)button.textContent='读故事 ↗';});
}
