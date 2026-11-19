/* Apex Native Shell V3 UI controls — visual prototype only, no privileged operations. */
(()=>{
  'use strict';
  const $=(q,p=document)=>p.querySelector(q), $$=(q,p=document)=>Array.from(p.querySelectorAll(q));
  const launcher=$('#apex-launcher'),quick=$('#apex-quick'),backdrop=$('#shell-backdrop');
  const screens={library:['Game Hub','gamepad'],command:['Command Center','gpu'],tasks:['Task Manager','cpu'],files:['Apex Files','folder'],settings:['Apex Settings','settings'],installer:['Apex Installer','download']};
  let lastFocus=null;
  function hidePanels(){launcher.hidden=true;quick.hidden=true;backdrop.hidden=true;lastFocus?.focus?.();lastFocus=null;}
  function openPanel(which){const panel=which==='launcher'?launcher:quick;if(!panel.hidden){hidePanels();return;}lastFocus=document.activeElement;launcher.hidden=panel!==launcher;quick.hidden=panel!==quick;backdrop.hidden=false; if(panel===launcher){$('#shell-launcher-search').value='';filterLauncher('');$('#shell-launcher-search').focus();}else $('.panel-close',panel)?.focus();}
  function filterLauncher(text){const search=text.trim().toLowerCase();$$('#launcher-grid [data-screen]').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(search));}
  // Header controls and bottom dock are always integrated into the shell.
  document.addEventListener('click',e=>{
    const trigger=e.target.closest('[data-launcher-toggle]');if(trigger){e.preventDefault();openPanel('launcher');return;}
    const q=e.target.closest('[data-panel="quick"]');if(q){e.preventDefault();openPanel('quick');return;}
    if(e.target.closest('[data-dismiss-panels]')||e.target===backdrop){hidePanels();return;}
    if(e.target.closest('.shell-panel [data-screen], .shell-panel [data-open]')){hidePanels();return;}
    const w=e.target.closest('[data-window-action]');if(w){const section=w.closest('.screen');switch(w.dataset.windowAction){case 'close': case 'minimize':document.querySelector('[data-screen="desktop"]').click();break;case 'maximize':section.classList.toggle('window-max');break;}return;}
    const switcher=e.target.closest('[data-demo-switch]');if(switcher){const pressed=switcher.getAttribute('aria-pressed')==='true';switcher.setAttribute('aria-pressed',String(!pressed));switcher.classList.toggle('is-on',!pressed);const sub=switcher.querySelector('small');if(sub)sub.textContent=(!pressed?'Enabled':'Off')+' (demo)';return;}
  },true);
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopImmediatePropagation();openPanel('launcher');return;}
    if(e.key==='Escape'&&(!launcher.hidden||!quick.hidden)){hidePanels();return;}
    if(e.key==='Enter'&&e.target.matches('.brand[data-launcher-toggle]'))openPanel('launcher');
  },true);
  $('#shell-launcher-search').addEventListener('input',e=>filterLauncher(e.target.value));
  $$('.quick-range input').forEach(x=>x.addEventListener('input',()=>{x.parentNode.querySelector('output').textContent=x.value+'%';}));
  const names={desktop:['Desktop','monitor'],...screens};
  Object.entries(screens).forEach(([id,[label,icon]])=>{
    const screen=$('#screen-'+id);if(!screen)return;
    const chrome=document.createElement('div');chrome.className='window-chrome';chrome.innerHTML=`<img class="window-app-icon" src="icons/${icon}.svg" alt=""><span class="window-app-title">${label}</span><span class="window-breadcrumb">— Apex first-party application / concept</span><div class="window-actions"><button data-window-action="minimize" title="Minimize" aria-label="Minimize ${label}">−</button><button data-window-action="maximize" title="Maximize or restore" aria-label="Maximize or restore ${label}">□</button><button data-window-action="close" title="Close" aria-label="Close ${label}">×</button></div>`;
    screen.prepend(chrome);
  });
  // The original V2 navigation still owns screen switching and app interaction logic.
  document.title='Apex Gaming OS · Native Shell V3 (Visual Prototype)';
})();
