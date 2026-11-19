/* Apex V2 UI research prototype. Every value is synthetic; no native system APIs. */
(() => {
  'use strict';
  const $ = (selector,root=document) => root.querySelector(selector);
  const $$ = (selector,root=document) => [...root.querySelectorAll(selector)];
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const icon = (name) => `icons/${name}.svg`;
  const state = {
    currentScreen:'desktop', selectedProcess:null, processFilter:'', processSort:'cpu',
    currentPlace:'Home', fileQuery:'', selectedFile:null, fileView:'grid', fileHistory:['Home'],fileIndex:0,
    currentSettings:'overview',settingsQuery:'',settingsTouched:false,installStep:0,installDisk:'alongside',
    installLanguage:'English (United States)', installRegion:'Asia / Kathmandu',
    processList:[
      {id:1,name:'Apex Shell',note:'System session',status:'Running',cpu:4.7,memory:512,disk:1.2,gpu:2.1,protected:true},
      {id:2,name:'Apex Game Hub',note:'Gaming',status:'Running',cpu:3.8,memory:418,disk:0.6,gpu:0.4},
      {id:3,name:'Chromium',note:'Browser · 8 processes',status:'Running',cpu:14.2,memory:1216,disk:2.5,gpu:8.9},
      {id:4,name:'Apex Command',note:'System utilities',status:'Running',cpu:1.1,memory:126,disk:0.2,gpu:0.0},
      {id:5,name:'Apex Files',note:'File explorer',status:'Running',cpu:0.6,memory:96,disk:0.3,gpu:0.0},
      {id:6,name:'Orbit Runner',note:'Fictional game · simulation',status:'Running',cpu:32.2,memory:3800,disk:17.5,gpu:57.0},
      {id:7,name:'Network service',note:'Protected process',status:'Running',cpu:0.2,memory:83,disk:0.1,gpu:0,protected:true},
      {id:8,name:'Audio service',note:'Protected process',status:'Running',cpu:0.2,memory:47,disk:0,gpu:0,protected:true}
    ],
    files: {
      Home:[['Games','folder','4 items'],['Downloads','folder','12 items'],['Documents','folder','8 items'],['Pictures','folder','6 items'],['Readme.txt','text','2 KB'],['System Info','folder','3 items']],
      Desktop:[['Welcome.txt','text','1 KB'],['Apex Game Hub','app','Shortcut']],
      Downloads:[['GameSetup.exe','exe','845 MB'],['Patch Notes.pdf','text','2 MB'],['Screenshots','folder','9 items']],
      Documents:[['Projects','folder','3 items'],['Notes.md','text','17 KB'],['Welcome.txt','text','1 KB']],
      Pictures:[['Wallpapers','folder','4 items'],['Screenshot.png','image','1.4 MB']],
      'Internal SSD':[['System','folder','Protected'],['Users','folder','3 users'],['Applications','folder','Installed apps']],
      Games:[['Orbit Runner','app','Demo title'],['Void Circuit','app','Demo title']],
      Trash:[]
    },
    settings:{wifi:true,bluetooth:true,nightlight:false,doNotDisturb:false,hdr:false,vrr:true,microphone:true,telemetry:false,crashReports:false,animations:true,contrast:false,highText:false,gamingOverlay:false,gameMode:true,autoUpdates:true,chargingLimit:true,brightness:72,volume:54,scale:'125%',refreshRate:'165 Hz',powerMode:'Balanced',mic:'Internal microphone',output:'Speakers',language:'English (US)'}
  };
  const categoryNames={overview:'Overview',personalization:'Personalization',display:'Display & graphics',power:'Power & battery',network:'Network & Bluetooth',audio:'Sound & microphone',input:'Input & controllers',gaming:'Gaming',apps:'Apps & defaults',storage:'Storage & disks',accounts:'Accounts & sign-in',time:'Time & language',privacy:'Privacy & security',accessibility:'Accessibility',developer:'Developer tools',updates:'Updates & recovery'};
  const categories=Object.keys(categoryNames);
  let toastTimer=null;
  function toast(message){const node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),3200);}
  function modal(title,body){$('#modal-title').textContent=title;$('#modal-body').textContent=body;$('#modal').hidden=false;$('#modal-close').focus();}
  function closeModal(){$('#modal').hidden=true;}
  $('#modal-close').addEventListener('click',closeModal);
  $('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();showScreen('settings');$('#settings-query')?.focus();}});
  function showScreen(name){
    if(!$('#screen-'+name)){toast('This module is not in the prototype.');return;}
    $$('.screen').forEach(s=>s.classList.toggle('show',s.id==='screen-'+name));
    $$('[data-screen]').forEach(b=>{b.classList.toggle('active',b.dataset.screen===name);b.setAttribute('aria-current',b.dataset.screen===name?'page':'false');});
    state.currentScreen=name;$('#app-main').scrollTop=0;
    if(name==='tasks')renderProcesses();if(name==='files')renderFiles();if(name==='settings')renderSettings();if(name==='installer')renderInstaller();
  }
  document.addEventListener('click',e=>{const button=e.target.closest('[data-screen]');if(button)showScreen(button.dataset.screen);});
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-open]');if(!el)return;
    switch(el.dataset.open){
      case 'settings':showScreen('settings');break;
      case 'battery':showScreen('settings');selectCategory('power');break;
      case 'power':modal('Power controls','Lock, suspend, restart and shutdown need dedicated privileged system-service integration. This visual prototype cannot affect your computer.');break;
      case 'startup':modal('Startup applications','The Apex Task Manager will provide per-user startup application control. This preview shows synthetic processes only.');break;
      case 'task-details':modal('Process details','A production implementation will display PID, cgroup, user, binary path, resource limits and permissions. This preview has no access to running processes.');break;
      default:modal('Preview only',`The ${el.dataset.open} integration is not wired to an operating-system backend.`);
    }
  });
  // Gaming interactions — only design-state changes, never launch binaries.
  $$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
    $$('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));
    const f=b.dataset.filter;
    $$('.game-card').forEach(card=>{
      const source=(card.querySelector('small')?.textContent||'').toLowerCase();
      card.hidden= !(f==='all'||(f==='steam'&&source.includes('steam'))||(f==='epic'&&source.includes('epic'))||(f==='local'&&source.includes('local')));
    });
  }));
  $('#play-demo').addEventListener('click',()=>modal('Fictional game / launch demo','Orbit Runner is a fictional title used for visual design. There is no installed game, runtime or launcher connected to this prototype.'));
  $('#details-demo').addEventListener('click',()=>modal('Game details','Apex Game Hub will show ownership source, install path, runtime compatibility, input mapping and logs. These are pending implementation.'));
  $$('.game-card').forEach(b=>b.addEventListener('click',()=>modal(b.dataset.game,'This is a fictional sample game. No process has been started.')));
  $$('[data-profile]').forEach(b=>b.addEventListener('click',()=>{
    $$('[data-profile]').forEach(x=>x.classList.toggle('active',x===b));
    const mode=b.dataset.profile;
    $('#profile-output').textContent=mode.toUpperCase();
    $('.profile-card h4').firstChild.textContent=mode.charAt(0).toUpperCase()+mode.slice(1);
    toast('Preview profile: '+mode+' (hardware settings unchanged)');
  }));
  $('#charge-limit').addEventListener('click',e=>{
    const b=e.currentTarget;b.classList.toggle('on');b.setAttribute('aria-pressed',String(b.classList.contains('on')));
    toast('Preview only · Charge limit not applied to hardware');
  });
  // Task manager: simulated process list, explicitly unprivileged.
  function renderProcesses(){
    const q=state.processFilter.toLowerCase().trim();
    const rows=state.processList.filter(p=>p.name.toLowerCase().includes(q)||p.note.toLowerCase().includes(q));
    rows.sort((a,b)=>state.processSort==='name'?a.name.localeCompare(b.name):b[state.processSort]-a[state.processSort]);
    $('#process-body').innerHTML=rows.map(p=>`<tr class="${p.id===state.selectedProcess?'selected':''}" data-pid="${p.id}" tabindex="0" aria-selected="${p.id===state.selectedProcess}"><td><span class="process-name">${escapeHTML(p.name)}</span><span class="process-sub">${escapeHTML(p.note)}</span></td><td>${escapeHTML(p.status)}</td><td>${p.cpu.toFixed(1)}%</td><td>${(p.memory/1024).toFixed(2)} GB</td><td>${p.disk.toFixed(1)} MB/s</td><td>${p.gpu.toFixed(1)}%</td></tr>`).join('');
    $('#process-count').textContent=`${rows.length} displayed · ${state.processList.length} example processes`;
    const selected=state.processList.find(x=>x.id===state.selectedProcess);$('#end-process').disabled=!selected||!!selected.protected;
  }
  $('#process-query').addEventListener('input',e=>{state.processFilter=e.target.value;renderProcesses();});
  $('#process-sort').addEventListener('change',e=>{state.processSort=e.target.value;renderProcesses();});
  $('#process-body').addEventListener('click',e=>{const row=e.target.closest('[data-pid]');if(!row)return;state.selectedProcess=Number(row.dataset.pid);renderProcesses();});
  $('#process-body').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-pid]')){e.preventDefault();state.selectedProcess=Number(e.target.closest('[data-pid]').dataset.pid);renderProcesses();}});
  $('#end-process').addEventListener('click',()=>{
    const p=state.processList.find(x=>x.id===state.selectedProcess);
    if(!p||p.protected)return;
    modal('Simulated end task',`${p.name} would receive a graceful termination request before force-stop in a real application.\n\nThis prototype performs no process operations.`);
  });
  // File manager: read-only synthetic tree; new folder remains in memory only.
  const folderNames = place => state.files[place]||[];
  function renderFiles(){
    $$('.place').forEach(b=>b.classList.toggle('active',b.dataset.place===state.currentPlace));
    $('#folder-title').textContent=state.currentPlace;
    $('#file-breadcrumb').textContent='Apex Files  /  '+state.currentPlace;
    $('#folder-subtitle').textContent=state.currentPlace==='Trash'?'No real files or disks are accessed.':'Synthetic directory · changes stay in this browser preview';
    const items=folderNames(state.currentPlace).filter(f=>f[0].toLowerCase().includes(state.fileQuery.toLowerCase().trim()));
    $('#files-grid').classList.toggle('list',state.fileView==='list');
    $('#files-grid').innerHTML=items.map(([name,type,detail])=>`<button class="file-tile ${state.selectedFile===name?'selected':''}" data-file="${escapeHTML(name)}" role="listitem"><img src="${icon(type==='folder'?'folder':type==='exe'?'file-exe':type==='app'?'gamepad':type==='image'?'screenshot':'info')}" alt=""/><strong>${escapeHTML(name)}</strong><small>${escapeHTML(detail)}</small></button>`).join('') || `<p class="muted" style="padding:20px">No items match this view.</p>`;
    $('#file-selection-status').textContent=state.selectedFile?`Selected: ${state.selectedFile}`:`${items.length} demo items · select one for details`;
    $('#file-back').disabled=state.fileIndex===0;$('#file-forward').disabled=state.fileIndex>=state.fileHistory.length-1;
  }
  function navigateFiles(place,history=true){state.currentPlace=place;state.selectedFile=null;state.fileQuery='';$('#file-query').value='';if(history){state.fileHistory=state.fileHistory.slice(0,state.fileIndex+1);state.fileHistory.push(place);state.fileIndex++;}renderFiles();}
  $$('.place').forEach(b=>b.addEventListener('click',()=>navigateFiles(b.dataset.place)));
  $('#file-query').addEventListener('input',e=>{state.fileQuery=e.target.value;renderFiles();});
  $('#file-grid-toggle').addEventListener('click',()=>{state.fileView='grid';$('#file-grid-toggle').classList.add('active');$('#file-list-toggle').classList.remove('active');renderFiles();});
  $('#file-list-toggle').addEventListener('click',()=>{state.fileView='list';$('#file-list-toggle').classList.add('active');$('#file-grid-toggle').classList.remove('active');renderFiles();});
  $('#files-grid').addEventListener('click',e=>{const target=e.target.closest('[data-file]');if(!target)return;const name=target.dataset.file;const f=folderNames(state.currentPlace).find(x=>x[0]===name);if(!f)return;state.selectedFile=name;renderFiles();if(f[1]==='folder')toast(`Folder selected: ${name} · demo directory`);else if(f[1]==='exe')modal('Windows executable: inspection only',`${name} is a synthetic file. Apex Native Bridge does not execute Windows applications.`);});
  $('#files-grid').addEventListener('dblclick',e=>{const target=e.target.closest('[data-file]');if(!target)return;const f=folderNames(state.currentPlace).find(x=>x[0]===target.dataset.file);if(!f)return;if(f[1]==='folder')navigateFiles(state.files[f[0]]?f[0]:state.currentPlace);else modal('Preview file',`${f[0]} is a synthetic fixture, not a real filesystem object.`);});
  $('#file-back').addEventListener('click',()=>{if(state.fileIndex>0){state.fileIndex--;navigateFiles(state.fileHistory[state.fileIndex],false);}});
  $('#file-forward').addEventListener('click',()=>{if(state.fileIndex<state.fileHistory.length-1){state.fileIndex++;navigateFiles(state.fileHistory[state.fileIndex],false);}});
  $('#new-folder').addEventListener('click',()=>{const base='New folder';let name=base,n=2;while(folderNames(state.currentPlace).some(f=>f[0]===name))name=`${base} ${n++}`;state.files[state.currentPlace]??=[];state.files[state.currentPlace].push([name,'folder','Demo directory']);renderFiles();toast('Demo folder created · not written to your computer');});
  // Installer stepper: accepts nothing that can change partitions/disks.
  function renderInstaller(){
    const i=state.installStep;
    $$('.install-progress .step').forEach((n,k)=>{n.classList.toggle('active',k===i);n.classList.toggle('done',k<i);});
    const html=[
      `<div class="install-kicker">01 / WELCOME</div><h3 class="install-title">Precision begins here.</h3><p class="install-desc">Explore the installation flow without touching a disk. Language and region will later control keyboard, timezone and formatting.</p><div class="install-field"><label for="inst-lang">Language</label><select id="inst-lang" class="setting-control"><option>English (United States)</option><option>Nepali (नेपाल)</option></select></div><div class="install-field"><label for="inst-region">Time zone</label><select id="inst-region" class="setting-control"><option>Asia / Kathmandu</option><option>America / Chicago</option><option>UTC</option></select></div>`,
      `<div class="install-kicker">02 / STORAGE</div><h3 class="install-title">Your data comes first.</h3><p class="install-desc">Choose a storage strategy. Real disk selection requires explicit backup checks, a verified partition map and confirmation.</p><button class="install-choice ${state.installDisk==='alongside'?'selected':''}" data-disk="alongside"><strong>Install alongside Windows</strong><small>Preserve an existing Windows installation. Requires partition safety validation.</small></button><button class="install-choice ${state.installDisk==='erase'?'selected':''}" data-disk="erase"><strong>Erase selected disk</strong><small>Destructive operation — unavailable in this design preview.</small></button><button class="install-choice ${state.installDisk==='manual'?'selected':''}" data-disk="manual"><strong>Manual partitioning</strong><small>Advanced partition editor, EFI planning and encryption.</small></button>`,
      `<div class="install-kicker">03 / ACCOUNT & SECURITY</div><h3 class="install-title">Your computer. Your rules.</h3><p class="install-desc">Local-first authentication, protected storage and accessible recovery options.</p><div class="install-field"><label for="inst-user">Local username (example)</label><input id="inst-user" value="apex-user" autocomplete="off"/></div><div class="install-field"><label for="inst-encrypt">Encryption preference</label><select class="setting-control" id="inst-encrypt"><option>Enable disk encryption</option><option>Configure later (not recommended)</option></select></div><div class="notice">Recovery keys must be saved somewhere outside the computer. This is a visual simulation; your actual drives and passwords are never accessed.</div>`,
      `<div class="install-kicker">04 / REVIEW</div><h3 class="install-title">Ready to review.</h3><p class="install-desc">Before a real installation, Apex would display every disk change, bootloader action, driver selection and encryption choice.</p><div class="setting-panel accent" style="margin-top:21px"><div class="setting-label">INSTALLATION PLAN / PREVIEW</div><div class="setting-row"><div><strong>Storage choice</strong><small>${escapeHTML(state.installDisk)}</small></div><span class="detail-chip">SIMULATED</span></div><div class="setting-row"><div><strong>Filesystem and encryption</strong><small>Pending hardware inspection and verified disk plan.</small></div><span class="detail-chip">NOT APPLIED</span></div><div class="setting-row"><div><strong>Driver setup</strong><small>GPU detection requires real hardware.</small></div><span class="detail-chip">PENDING</span></div></div><div class="notice">This preview does not write partitions, change EFI records, or install an operating system.</div>`
    ];
    $('#install-step-content').innerHTML=html[i];
    $('#install-back').disabled=i===0;$('#install-next').textContent=i===3?'FINISH PREVIEW →':'CONTINUE →';
    if(i===0){$('#inst-lang').value=state.installLanguage;$('#inst-region').value=state.installRegion;}
  }
  $('#install-step-content').addEventListener('click',e=>{const choice=e.target.closest('[data-disk]');if(choice){state.installDisk=choice.dataset.disk;renderInstaller();}});
  $('#install-back').addEventListener('click',()=>{state.installStep=Math.max(0,state.installStep-1);renderInstaller();});
  $('#install-next').addEventListener('click',()=>{
    if(state.installStep===0){state.installLanguage=$('#inst-lang')?.value||state.installLanguage;state.installRegion=$('#inst-region')?.value||state.installRegion;}
    if(state.installStep===3){modal('Installation flow preview complete','The installer interface is a fully local design mock. No disk has been written. Actual installation requires a separate, safety-reviewed backend.');return;}
    state.installStep++;renderInstaller();
  });
  // Settings: exhaustive first-party IA, with controls powered by mock state only.
  function settingRow(name,desc,control){return `<div class="setting-row"><div><strong>${name}</strong><small>${desc}</small></div>${control}</div>`;}
  const toggled=(id,disabled=false)=>`<button class="settings-toggle" data-toggle="${id}" aria-label="Toggle ${id}" aria-pressed="${state.settings[id]?'true':'false'}" ${disabled?'disabled title="Requires hardware integration"':''}></button>`;
  const select=(id,values)=>`<select class="setting-control" data-choice="${id}" aria-label="${id}">${values.map(v=>`<option ${state.settings[id]===v?'selected':''}>${escapeHTML(v)}</option>`).join('')}</select>`;
  const slider=(id,min,max)=>`<input class="setting-range" data-range="${id}" type="range" min="${min}" max="${max}" value="${state.settings[id]}" aria-label="${id}"/>`;
  const panel=(heading,body,className='')=>`<div class="setting-panel ${className}"><h4>${heading}</h4>${body}</div>`;
  const top=(label,title,desc)=>`<div class="settings-intro"><div><div class="eyebrow c-accent">${label}</div><h3>${title}</h3><p>${desc}</p></div><span class="settings-cap">SIMULATED DATA</span></div>`;
  const page={
    overview:()=>top('SYSTEM / HOME','System overview','Essential configuration in one place. No hardware readings are taken in this browser demo.')+`<div class="setting-panels">${panel('Device identity','<div class="setting-label">DEVICE PROFILE</div><div class="setting-value" style="font-size:28px">Apex Preview PC</div><p>Arch Linux target · x86_64 · example configuration</p><span class="detail-chip">CUSTOM APEX SHELL</span><span class="detail-chip">WAYLAND TARGET</span>','accent')}${panel('System state','<div class="setting-label">UPDATES</div><div class="setting-value">— <small>not connected</small></div><p>A production build will report actual package and security status. Nothing is inferred here.</p>')}${panel('Configuration shortcuts',settingRow('Power & battery','Charge, health, conservation limit, power profiles','<button class="setting-control" data-jump="power">Open ↗</button>')+settingRow('Display & graphics','Refresh, scaling, HDR, VRR','<button class="setting-control" data-jump="display">Open ↗</button>'))}${panel('Engineering release','<div class="setting-label">PRODUCT STATUS</div><div class="setting-value" style="font-size:24px">PRE-ALPHA UI</div><p>Design prototype only: not an installable OS. First-party backend development remains to be done.</p>')}</div>`,
    personalization:()=>top('EXPERIENCE / APPEARANCE','Personalization','Wallpapers, custom shell appearance, workspaces, notification density, clock and taskbar behavior.')+`<div class="setting-panels">${panel('Appearance',settingRow('Theme','Dark, light and accessible high-contrast palettes.','<span class="detail-chip">DESIGN REVIEW</span>')+settingRow('Accent','Choose a restrained accent color, including custom palettes.','<button class="setting-control" data-help="Accent palette">Choose ↗</button>')+settingRow('Wallpaper','Static and optimized motion wallpapers, with fullscreen suspension.','<button class="setting-control" data-help="Wallpaper">Browse ↗</button>'),'accent')}${panel('Apex Shell',settingRow('Taskbar position','Bottom or side, with pinned applications.','<button class="setting-control" data-help="Taskbar">Configure ↗</button>')+settingRow('Window effects','Blur, transparency and reduced-motion rules.','<span class="detail-chip">PERFORMANCE GATED</span>')+settingRow('Notifications','Preview content, privacy on screen share, focus mode.','<button class="setting-control" data-help="Notification preferences">Configure ↗</button>'))}</div>`,
    display:()=>top('HARDWARE / VISUAL','Display & graphics','Monitor configuration, GPU mode, scaling, brightness, HDR and variable refresh rate.')+`<div class="setting-panels">${panel('Primary monitor','<div class="setting-label">SAMPLE DISPLAY</div><div class="setting-value" style="font-size:25px">1920 × 1080</div><p>165 Hz · laptop panel · monitor arrangement and detection pending</p>'+settingRow('Refresh rate','Changing this requires a timed revert confirmation.',select('refreshRate',['60 Hz','120 Hz','144 Hz','165 Hz']))+settingRow('Scaling','Select a layout density.',select('scale',['100%','125%','150%','200%'])), 'accent')}${panel('Image quality',settingRow('Brightness',`Preview value: ${state.settings.brightness}%`,slider('brightness',0,100))+settingRow('HDR','Available only with display/driver support.',toggled('hdr',true))+settingRow('Variable refresh rate','Enable on supported monitor/GPU combinations.',toggled('vrr',true))+'<div class="setting-highlight warning">A real display mode change must automatically revert unless explicitly confirmed within 15 seconds.</div>')}</div>`,
    power:()=>top('ENERGY / BATTERY','Power & charging','Charge percentage and battery health are not interchangeable. Capability detection controls all advanced features.')+`<div class="setting-panels">${panel('Battery charge','<div class="setting-label">SAMPLE STATE / EXTERNAL POWER</div><div class="setting-value">78<small>% charge</small></div><div class="setting-progress"><span style="width:78%"></span></div><div class="setting-foot"><span>Charging · sample</span><span>1h 14m until full · estimate</span></div><div class="setting-highlight">These are illustrative values only. A real PC without a battery will show AC power information instead.</div>', 'accent')}${panel('Battery health','<div class="setting-label">EXAMPLE CAPACITY RATIO</div><div class="setting-value">92<small>% health</small></div><p>Cycle count, wear and charging watts are hidden when the device does not report them.</p><span class="detail-chip">HARDWARE-GATED</span>')}${panel('Charging & conservation',settingRow('Charge limit at 80%','Only shown when the laptop firmware supports it.',toggled('chargingLimit',true))+settingRow('Power profile','Select an adaptive workload profile.',select('powerMode',['Quiet','Balanced','Performance'])))}${panel('Advanced diagnostics',settingRow('Battery report','Design capacity / full capacity / cycle count','<button class="setting-control" data-help="Battery report">Inspect ↗</button>')+settingRow('Thermal protection','Emergency protection takes precedence over UI settings.','<span class="detail-chip">ALWAYS ON</span>'))}</div>`,
    network:()=>top('CONNECTIVITY / DEVICES','Network & Bluetooth','Manage networks, hotspots, adapters and paired devices from the Apex system service.')+`<div class="setting-panels">${panel('Wireless network',settingRow('Wi-Fi','Sample: connected to Apex Network.',toggled('wifi'))+settingRow('Known networks','Forget a network, change priority or configure a proxy.','<button class="setting-control" data-help="Known networks">Manage ↗</button>')+'<div class="setting-highlight">Production flows will cover incorrect password, captive portal, airplane mode, disconnect and adapter failure.</div>','accent')}${panel('Bluetooth',settingRow('Bluetooth radio','Scan and pair with supported devices.',toggled('bluetooth'))+settingRow('Example controller','Paired · battery availability unknown','<span class="detail-chip">SIMULATED</span>')+settingRow('Example headset','Audio routing and device permissions','<span class="detail-chip">SIMULATED</span>'))}</div>`,
    audio:()=>top('SOUND / ROUTING','Sound & microphone','Per-app volume, input privacy, output selection, virtual devices and latency behavior.')+`<div class="setting-panels">${panel('Audio output',settingRow('Output device','Real device list requires PipeWire integration.',select('output',['Speakers','Headphones','HDMI display']))+settingRow('Master volume',`Preview value: ${state.settings.volume}%`,slider('volume',0,100))+settingRow('Per-app mixer','Volume and output per running application','<button class="setting-control" data-help="Per-app mixer">Inspect ↗</button>'),'accent')}${panel('Recording',settingRow('Microphone','Permission prompt appears on first access.',toggled('microphone'))+settingRow('Input source','Select a hardware or virtual input.',select('mic',['Internal microphone','USB microphone','Headset']))+'<div class="setting-highlight">A visible system indicator is mandatory whenever the microphone or camera is active.</div>')}</div>`,
    input:()=>top('INPUT / HARDWARE','Keyboard & controllers','Shortcuts, touchpad gestures, controller calibration and supported keyboard lighting.')+`<div class="setting-panels">${panel('Keyboard',settingRow('Keyboard layout','System-wide layout and language choice.',select('language',['English (US)','Nepali']))+settingRow('Shortcut editor','Remap system bindings with conflict warnings.','<button class="setting-control" data-help="Keyboard shortcuts">Configure ↗</button>'),'accent')}${panel('Gaming devices',settingRow('Controller calibration','Dead zones, rumble, button remapping.','<button class="setting-control" data-help="Controller calibration">Configure ↗</button>')+settingRow('RGB zones','Only usable with supported keyboard adapters.','<span class="detail-chip">DEVICE-GATED</span>')+settingRow('Touchpad','Gestures, scrolling, palm rejection.','<button class="setting-control" data-help="Touchpad">Configure ↗</button>'))}</div>`,
    gaming:()=>top('GAME EXPERIENCE / SYSTEM','Gaming settings','Per-game power policies, overlays, runtime compatibility and controller profiles.')+`<div class="setting-panels">${panel('Performance',settingRow('Game mode','App-specific settings, only applied through an approved service.',toggled('gameMode'))+settingRow('Game overlay','FPS, frametime and hardware readings when available.',toggled('gamingOverlay'))+'<div class="setting-highlight">The design never makes higher-FPS claims without reproducible benchmarks.</div>','accent')}${panel('Compatibility & privacy',settingRow('Windows executables','Apex Native Bridge only inspects PE headers today.','<span class="detail-chip">EXECUTION UNAVAILABLE</span>')+settingRow('Game sources','Owned games and provider authentication.','<button class="setting-control" data-jump-screen="library">Game Hub ↗</button>')+settingRow('Anti-cheat limitations','Some games need Windows or cannot work under Linux.','<span class="detail-chip">GAME-SPECIFIC</span>'))}</div>`,
    apps:()=>top('APPLICATIONS / DEFAULTS','Apps & storage','First-party applications built for Apex. Linux libraries and system interfaces remain platform foundations.')+`<div class="setting-panels">${panel('Apex built-in apps',settingRow('Apex Files','Original file manager and virtual filesystem preview.','<button class="setting-control" data-jump-screen="files">Open ↗</button>')+settingRow('Apex Task Manager','Original process monitoring interface.','<button class="setting-control" data-jump-screen="tasks">Open ↗</button>')+settingRow('Apex Command','GPU, CPU, fan and battery information.','<button class="setting-control" data-jump-screen="command">Open ↗</button>'),'accent')}${panel('Application policies',settingRow('Default apps','URL/file handlers and application associations.','<button class="setting-control" data-help="Default apps">Configure ↗</button>')+settingRow('Storage and permissions','Per-app space and filesystem permissions.','<button class="setting-control" data-help="App permissions">Inspect ↗</button>')+settingRow('Startup apps','Review auto-start services and user apps.','<button class="setting-control" data-help="Startup apps">Manage ↗</button>'))}</div>`,
    storage:()=>top('SYSTEM / STORAGE','Storage & disks','Disk capacity, cleanup, mounts, encryption, removable drives and safe device ejection.')+`<div class="setting-panels">${panel('Storage overview','<div class="setting-label">SAMPLE FIXTURE / NO DISK PROBE</div><div class="setting-value">476<small> GB used / 1 TB</small></div><div class="setting-progress"><span style="width:48%"></span></div><div class="setting-foot"><span>Installed games · Example</span><span>Free space · Example</span></div>','accent')}${panel('Disk management',settingRow('Installed drives','Partitions, mounts and health: read-only inspection first.','<button class="setting-control" data-help="Disk inspection">Inspect ↗</button>')+settingRow('Cleanup','Always preview what will be removed.','<button class="setting-control" data-help="Storage cleanup">Review ↗</button>')+settingRow('External devices','Safe eject, permission/error states and transfer jobs.','<button class="setting-control" data-jump-screen="files">Open Files ↗</button>'))}</div>`,
    accounts:()=>top('IDENTITY / SECURITY','Accounts & sign-in','Local account management, secure authentication and password recovery.')+`<div class="setting-panels">${panel('Signed-in account',settingRow('Local user','Apex preview account · illustrative identity','<span class="detail-chip">LOCAL</span>')+settingRow('Password and lock','Requires privileged account service and safe credential handling.','<button class="setting-control" data-help="Sign-in options">Configure ↗</button>')+settingRow('Guest session','Isolated temporary user and clear deletion policy.','<span class="detail-chip">PLANNED</span>'),'accent')}${panel('Privacy & sessions',settingRow('Session history','Login events with clear data retention policy.','<button class="setting-control" data-help="Sessions">Review ↗</button>')+settingRow('Autolock','Timeout and lid-close security behavior.','<button class="setting-control" data-help="Autolock">Configure ↗</button>')+settingRow('Emergency access','Recovery policy must not expose secrets.','<span class="detail-chip">SECURITY REVIEW</span>'))}</div>`,
    time:()=>top('REGION / LANGUAGE','Time & language','Timezone, 12/24-hour clock, region formats and international input support.')+`<div class="setting-panels">${panel('Time & date',settingRow('Time zone','Asia / Kathmandu · reference example.','<button class="setting-control" data-help="Time zones">Choose ↗</button>')+settingRow('Network time','Requires accurate trusted clock source and offline fallback.','<span class="detail-chip">SYSTEM SERVICE</span>')+settingRow('Clock format','12-hour or 24-hour display in shell.','<button class="setting-control" data-help="Clock format">Choose ↗</button>'),'accent')}${panel('Languages & inputs',settingRow('System language','Localized messages with reliable fallback.','<button class="setting-control" data-help="Languages">Manage ↗</button>')+settingRow('Nepali keyboard/IME','Unicode Devanagari shaping and input method tests.','<span class="detail-chip">LANGUAGE QA</span>')+settingRow('Measurement units','Regional default can be overridden.','<button class="setting-control" data-help="Regional formats">Configure ↗</button>'))}</div>`,
    privacy:()=>top('SECURITY / PERMISSIONS','Privacy & security','Local accounts, explicit permissions, secure boot, disk encryption and diagnostic controls.')+`<div class="setting-panels">${panel('Application permissions',settingRow('Microphone access','Off by default for new apps until permitted.',toggled('microphone'))+settingRow('Screen capture','A per-app consent flow is required.','<span class="detail-chip">PERMISSION-GATED</span>')+settingRow('Camera and location','Never inferred from general device presence.','<span class="detail-chip">PERMISSION-GATED</span>'),'accent')}${panel('Diagnostics',settingRow('Optional telemetry','Never silently enabled by the operating system.',toggled('telemetry'))+settingRow('Crash reports','Redacted before upload.',toggled('crashReports'))+settingRow('Disk encryption','Requires installer support, key recovery, secure error states.','<span class="detail-chip">NOT IMPLEMENTED</span>'))}</div>`,
    accessibility:()=>top('SYSTEM / INCLUSION','Accessibility','Every first-party surface must remain useful with keyboard, screen reader, large text and reduced motion.')+`<div class="setting-panels">${panel('Display & motion',settingRow('Reduce animations','Limit nonessential transitions.',toggled('animations'))+settingRow('High contrast','High-contrast design requires validation.',toggled('contrast'))+settingRow('Larger interface text','Use adjustable system text scaling.',toggled('highText')),'accent')}${panel('Assistive input',settingRow('Screen reader','Semantic roles, focus events, announcements.','<span class="detail-chip">ENGINEERING REQUIRED</span>')+settingRow('Sticky / slow keys','Keyboard accessibility must work at login too.','<span class="detail-chip">PLANNED</span>')+settingRow('Nepali input methods','Text shaping and keyboard layouts require actual OS tests.','<span class="detail-chip">TEST REQUIRED</span>'))}</div>`,
    developer:()=>top('DEVELOPER / ADVANCED','Developer tools','Advanced controls are explicit, opt-in and remain isolated from privileged hardware operations.')+`<div class="setting-panels">${panel('Developer environment',settingRow('Terminal','Original Apex terminal application, not implemented yet.','<span class="detail-chip">PLANNED</span>')+settingRow('Diagnostic logs','Redacted, downloadable locally with user consent.','<button class="setting-control" data-help="System logs">View ↗</button>')+settingRow('Containers & virtual machines','Optional tooling; not an inherent OS requirement.','<span class="detail-chip">OPTIONAL</span>'),'accent')}${panel('Experimental features',settingRow('Feature flags','Clear warnings, reset path, and no access to unsafe EC registers.','<span class="detail-chip">DISABLED</span>')+settingRow('Performance diagnostics','Trace only with explicit resource/data impact.','<button class="setting-control" data-help="Performance trace">Review ↗</button>')+settingRow('Safe mode','Accessible without the main graphical shell.','<span class="detail-chip">BOOT COMPONENT</span>'))}</div>`,
    updates:()=>top('MAINTENANCE / RECOVERY','Updates & recovery','Predictable updates, readable history, snapshot rollback and an independent rescue path.')+`<div class="setting-panels">${panel('Update policy',settingRow('Automatic security updates','Opt-in state shown here; not a real updater.',toggled('autoUpdates'))+settingRow('Check for updates','Do not fabricate success when offline.','<button class="setting-control" data-help="Update check">Check ↗</button>')+'<div class="setting-highlight">Kernel, Mesa and NVIDIA updates need a compatible fallback and restart messaging.</div>','accent')}${panel('Recovery',settingRow('System snapshots','Btrfs-dependent; cannot substitute for a backup.','<span class="detail-chip">NOT CONNECTED</span>')+settingRow('Previous working kernel','Boot-time fallback must function without Apex Shell.','<span class="detail-chip">PLANNED</span>')+settingRow('Rescue environment','Independent recovery, readable errors, diagnostics.','<button class="setting-control" data-help="Recovery">Inspect ↗</button>'))}</div>`
  };
  function selectCategory(cat){
    if(!categories.includes(cat))return;
    state.currentSettings=cat;
    $$('.settings-nav').forEach(b=>{b.classList.toggle('active',b.dataset.settings===cat);b.setAttribute('aria-current',b.dataset.settings===cat?'page':'false');});
    $('#settings-breadcrumb').textContent='APEX / SETTINGS / '+categoryNames[cat].toUpperCase();
    $('#settings-category-num').textContent=String(categories.indexOf(cat)+1).padStart(2,'0')+' / 16';
    $('#settings-content').innerHTML=`<div class="settings-body">${page[cat]()}</div>`;
    $('#settings-main').scrollTop=0;
  }
  function renderSettings(){selectCategory(state.currentSettings);}
  $$('.settings-nav').forEach(b=>b.addEventListener('click',()=>selectCategory(b.dataset.settings)));
  $('#settings-query').addEventListener('input',e=>{
    state.settingsQuery=e.target.value.toLowerCase();
    let count=0;
    $$('.settings-nav').forEach(b=>{const match=b.textContent.toLowerCase().includes(state.settingsQuery);b.hidden=!match; if(match)count++;});
    if(count===1){const target=$$('.settings-nav').find(b=>!b.hidden);if(target)selectCategory(target.dataset.settings);}
    if(count===0){$('#settings-content').innerHTML='<div class="setting-search-empty">No matching settings category. Try “battery”, “display”, “audio”, or “privacy”.</div>';}
    if(!state.settingsQuery)renderSettings();
  });
  $('#settings-content').addEventListener('click',e=>{
    const toggle=e.target.closest('[data-toggle]');if(toggle){const key=toggle.dataset.toggle;state.settings[key]=!state.settings[key];renderSettings();toast('Preview setting updated · no OS change');return;}
    const jump=e.target.closest('[data-jump]');if(jump){selectCategory(jump.dataset.jump);return;}
    const screen=e.target.closest('[data-jump-screen]');if(screen){showScreen(screen.dataset.jumpScreen);return;}
    const help=e.target.closest('[data-help]');if(help){modal(`${help.dataset.help} / engineering design`,`This capability needs a first-party Apex service and validation. The current Settings screen is an interactive visual prototype only.`);}
  });
  $('#settings-content').addEventListener('change',e=>{
    if(e.target.matches('[data-choice]')){state.settings[e.target.dataset.choice]=e.target.value;renderSettings();toast('Preview selection saved · real hardware unaffected');}
    if(e.target.matches('[data-range]')){state.settings[e.target.dataset.range]=Number(e.target.value);renderSettings();toast('Preview value changed · not applied to hardware');}
  });
  showScreen('desktop');
})();
