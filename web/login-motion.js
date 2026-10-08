// Repel only decorative particles; text and form controls remain stationary.
const allowed = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
// Stratified distribution keeps the small dots spread across the entire panel.
const positions=Array.from({length:600},(_,index)=>{
 const column=index%20,row=Math.floor(index/20);
 const jitterX=((index*37+11)%101)/101, jitterY=((index*61+23)%103)/103;
 return [2+(column+.2+jitterX*.6)/20*96,2+(row+.2+jitterY*.6)/30*96,2+index%3];
});
let panel, layer, frame=0, cursor;
function reset(){if(!cursor&&!frame)return;cancelAnimationFrame(frame);frame=0;cursor=null;layer?.querySelectorAll('i').forEach(el=>el.style.transform='translate3d(0,0,0)');}
function mount(){const next=document.querySelector('.login-story');if(next===panel)return;reset();panel=next;layer=null;if(!panel)return;layer=document.createElement('span');layer.className='repel-layer';layer.setAttribute('aria-hidden','true');for(const [x,y,size] of positions){const particle=document.createElement('i');particle.style.cssText=`left:${x}%;top:${y}%;width:${size}px;height:${size}px`;layer.append(particle);}panel.append(layer);}
function update(){frame=0;if(!panel?.isConnected||!allowed.matches||!cursor)return reset();const rect=panel.getBoundingClientRect();const px=cursor.x-rect.left,py=cursor.y-rect.top;[...layer.children].forEach((el,index)=>{const [x,y,size]=positions[index];const dx=rect.width*x/100+size/2-px,dy=rect.height*y/100+size/2-py;const distance=Math.hypot(dx,dy);const force=Math.max(0,1-distance/90);const move=force*force*28;el.style.transform=`translate3d(${((distance?dx/distance:1)*move).toFixed(2)}px,${((distance?dy/distance:0)*move).toFixed(2)}px,0)`;});}
document.addEventListener('pointermove',event=>{if(!allowed.matches||event.pointerType!=='mouse'||!event.target.closest?.('.login-story'))return reset();cursor={x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(update);},{passive:true});
document.addEventListener('pointerleave',reset);window.addEventListener('blur',reset);window.addEventListener('resize',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});allowed.addEventListener('change',reset);
new MutationObserver(mount).observe(document.querySelector('#app'),{childList:true,subtree:true});mount();
