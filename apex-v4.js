/* V4 first-party UI research interactions. All telemetry and process data are synthetic. */
(() => {
 'use strict';
 const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
 const taskScreen=$('#screen-tasks');
 const selectTab=(name)=>{
   if(!['overview','processes','performance','startup'].includes(name))return;
   $$('[data-v4-task-tab]',taskScreen).forEach(b=>{
     const active=b.dataset.v4TaskTab===name;
     b.classList.toggle('active',active);if(b.matches('[role="tab"]'))b.setAttribute('aria-selected',String(active));
   });
   $$('[data-v4-view]',taskScreen).forEach(el=>{el.hidden=el.dataset.v4View!==name;});
 };
 taskScreen.addEventListener('click',e=>{
   const button=e.target.closest('[data-v4-task-tab]');if(button)selectTab(button.dataset.v4TaskTab);
 });
 // Read from the existing safe DOM fixture, not the operating system or any network API.
 const processBody=$('#process-body');
 const updateInspector=()=>{
   const row=$('tr.selected',processBody);
   const name=$('#v4-inspector-name'),desc=$('#v4-inspector-desc');
   const cpu=$('#v4-inspector-cpu'),ram=$('#v4-inspector-memory');
   if(!row){name.textContent='Select a process';desc.textContent='Choose a row to inspect its identity and demo resource allocation.';cpu.textContent='—';ram.textContent='—';return;}
   name.textContent=$('.process-name',row)?.textContent||'Selected process';
   desc.textContent=($('.process-sub',row)?.textContent||'Demo application')+' · SYNTHETIC DATA';
   cpu.textContent=row.children[2]?.textContent.trim()||'—';
   ram.textContent=row.children[3]?.textContent.trim()||'—';
 };
 new MutationObserver(updateInspector).observe(processBody,{childList:true});
 taskScreen.addEventListener('click',e=>{if(e.target.closest('tr[data-pid]'))queueMicrotask(updateInspector);});
 updateInspector();
 // These controls only update the preview label and button selection.
 const settings=$('#screen-settings');
 settings.addEventListener('click',e=>{
   const btn=e.target.closest('[data-v4-mode]');if(!btn)return;
   const mode=btn.dataset.v4Mode;
   $$('[data-v4-mode]',settings).forEach(b=>b.classList.toggle('active',b===btn));
   const label=$('#v4-active-mode');if(label)label.textContent=mode.toUpperCase();
   const badge=$('.v4-setting-statusband>div:last-child strong');if(badge)badge.textContent=mode.toUpperCase()+' / DEMO';
 });
 // Real native functionality must be implemented by audited system-service adapters.
})();
