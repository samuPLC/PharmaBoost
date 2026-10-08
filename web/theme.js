(()=>{
 const key='pharmaboost-theme';let saved;try{saved=localStorage.getItem(key);}catch{}
 const system=matchMedia('(prefers-color-scheme: dark)');let button;
 const sun='<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>';
 const moon='<path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z"/>';
 function apply(value){document.documentElement.dataset.theme=value;if(button){const label=value==='dark'?'Cambiar a modo claro':'Cambiar a modo oscuro';button.innerHTML=`<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${value==='dark'?moon:sun}</svg>`;button.setAttribute('aria-label',label);button.title=label;button.setAttribute('aria-pressed',String(value==='dark'));}}
 apply(saved==='dark'||saved==='light'?saved:system.matches?'dark':'light');
 function updateDate(){const label=new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'});document.querySelectorAll('.header-date').forEach(el=>{if(el.textContent!==label)el.textContent=label;});}
 function mount(){const host=document.querySelector('[data-theme-slot]')||document.querySelector('.public-header')||document.querySelector('.login-form');if(host&&button.parentElement!==host)host.append(button);updateDate();}
 document.addEventListener('DOMContentLoaded',()=>{button=document.createElement('button');button.type='button';button.className='theme-toggle';apply(document.documentElement.dataset.theme);button.addEventListener('click',()=>{saved=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem(key,saved);}catch{}apply(saved);});mount();new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});setInterval(updateDate,60000);});
 system.addEventListener('change',()=>{if(!saved)apply(system.matches?'dark':'light');});
 window.addEventListener('storage',e=>{if(e.key===key){saved=e.newValue;apply(saved|| (system.matches?'dark':'light'));}});
})();
