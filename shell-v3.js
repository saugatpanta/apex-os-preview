/* Native-feeling Apex Shell reference. This is a safe static UI; nothing accesses hardware. */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const launcher=$('#apex-launcher-overlay'), flyout=$('#apex-flyout'),context=$('#apex-context');
  let isLauncher=false;
  const closeFloaters=()=>{launcher.hidden=true;flyout.hidden=true;context.hidden=true;isLauncher=false;};
  const openLauncher=()=>{flyout.hidden=true;context.hidden=true;launcher.hidden=false;isLauncher=true;$('#launcher-search').value='';filterLauncher('');$('#launcher-search').focus();};
  const filterLauncher=q=>$$('#launcher-grid button').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(q.toLowerCase()));
  $('#launcher-search').addEventListener('input',e=>filterLauncher(e.target.value));
  $('#apex-launch-button').addEventListener('click',()=>isLauncher?closeFloaters():openLauncher());
  $('#dock-apex-launcher').addEventListener('click',()=>isLauncher?closeFloaters():openLauncher());
  $('#global-search-trigger').addEventListener('click',openLauncher);
  $('#launcher-dismiss').addEventListener('click',closeFloaters);
  launcher.addEventListener('click',e=>{if(e.target===launcher||e.target.closest('[data-screen]'))closeFloaters();});
  $('#quick-controls-button').addEventListener('click',()=>{const wasHidden=flyout.hidden;closeFloaters();flyout.hidden=!wasHidden;});
  $('#flyout-close').addEventListener('click',closeFloaters);
  $('#calendar-button').addEventListener('click',()=>{const wasHidden=flyout.hidden;closeFloaters();flyout.hidden=!wasHidden;});
  $$('[data-flyout-toggle]').forEach(b=>b.addEventListener('click',()=>b.classList.toggle('selected')));
  for(const key of ['brightness','volume'])$(`#flyout-${key}`).addEventListener('input',e=>{$(`#flyout-${key}-value`).textContent=e.target.value+'%';});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeFloaters();return;}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopImmediatePropagation();openLauncher();}
    if((e.metaKey||e.ctrlKey)&&e.key===' '){e.preventDefault();openLauncher();}
    if(launcher.hidden===false&&e.key==='Enter'){const target=$$('#launcher-grid button').find(b=>!b.hidden);if(target){target.click();closeFloaters();}}
  },true);
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-screen]')){
      closeFloaters();
      const screen=e.target.closest('[data-screen]').dataset.screen;
      const n=$('#screen-'+screen);if(n)n.classList.remove('window-minimized');
    }
  });
  $('#screen-desktop').addEventListener('contextmenu',e=>{if(e.target.closest('button'))return;e.preventDefault();closeFloaters();context.hidden=false;context.style.left=Math.min(e.clientX,innerWidth-195)+'px';context.style.top=Math.min(e.clientY,innerHeight-153)+'px';});
  $('#ctx-refresh').addEventListener('click',()=>{context.hidden=true;const node=$('#screen-desktop');node.animate([{filter:'brightness(.8)'},{filter:'brightness(1)'}],{duration:180});});
  document.addEventListener('click',e=>{if(!e.target.closest('#apex-context'))context.hidden=true;});
  const titles={library:['Game Hub','gamepad'],command:['Command Center','gpu'],tasks:['Task Manager','cpu'],files:['Apex Files','folder'],settings:['Apex Settings','settings'],installer:['Apex Installer','download']};
  for(const [id,[title,icon]] of Object.entries(titles)){
    const target=$('#screen-'+id);if(!target)continue;
    const bar=document.createElement('div');bar.className='app-window-toolbar';
    bar.innerHTML=`<span class="app-window-title"><img src="icons/${icon}.svg" alt=""/> ${title}<span style="color:#70919a;font-weight:500;margin-left:8px">— PRE-ALPHA PREVIEW</span></span><div class="app-window-controls"><button data-window="min" aria-label="Minimize ${title}" title="Minimize">−</button><button data-window="max" aria-label="Maximize ${title}" title="Maximize">□</button><button data-window="close" aria-label="Close ${title}" title="Close">×</button></div>`;
    target.prepend(bar);
    bar.addEventListener('click',e=>{
      const btn=e.target.closest('[data-window]');if(!btn)return;
      if(btn.dataset.window==='max'){target.classList.toggle('window-maximized');return;}
      if(btn.dataset.window==='min')target.classList.add('window-minimized');
      if(btn.dataset.window==='close'){target.classList.remove('window-minimized');}
      $$('[data-screen="desktop"]')[0]?.click();
    });
  }
  const time=$('.apex-clock time');
  const updateClock=()=>{
    const dt=new Date();time.innerHTML=`${dt.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})} <small>${dt.toLocaleDateString('en-GB',{weekday:'short',day:'2-digit',month:'short'}).toUpperCase()}</small>`;
  };updateClock();setInterval(updateClock,30_000);
  // Never expose runtime privileges or system APIs in a website preview.
})();
