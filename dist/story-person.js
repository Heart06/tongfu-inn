const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Every memory uses the same name + scene-specific description, including screen readers.
export const storyPersonDescription=person=>person.actionText||person.text||person.actionLabel||'看看这一幕。';
export const storyPersonAria=person=>esc(`${person.name}：${storyPersonDescription(person)}`);
export function storyPersonTip(person,top=30){
 const align=person.x<25?'start':person.x>75?'end':'center';
 return `<span class="story-person-tip" data-align="${align}" data-side="${top<18?'below':'above'}" aria-hidden="true"><strong>${esc(person.name)}</strong><small>${esc(storyPersonDescription(person))}</small></span>`;
}
