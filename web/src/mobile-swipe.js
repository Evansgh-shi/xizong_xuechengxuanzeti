// Direct manipulation only changes presentation; navigation uses the existing canonical order.
const MOBILE_SWIPE=(()=>{
 const surface=document.querySelector('.board'),grid=$('question-grid'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let gesture=null,suppressClickUntil=0,timer=0,generation=0;
 const excluded='button,a,input,select,textarea,[data-drop],figure,.ecg-figure,.ecg-wrap,.ecg-viewport,.figure-viewer,.dialog-backdrop,img,svg,.image-figure';
 function clear(){clearTimeout(timer);timer=0;generation++;grid.style.removeProperty('transition');grid.style.removeProperty('transform');grid.style.removeProperty('opacity');grid.style.removeProperty('will-change');grid.classList.remove('is-swiping','is-slide-settling');}
 function cancel(){gesture=null;clear();}
 function settle(){const token=++generation;clearTimeout(timer);grid.classList.remove('is-swiping');grid.classList.add('is-slide-settling');grid.style.transition=reduced.matches?'none':'transform 160ms cubic-bezier(.2,.8,.2,1),opacity 160ms ease';grid.style.transform='translate3d(0,0,0)';grid.style.opacity='1';timer=setTimeout(()=>{if(generation===token)clear();},reduced.matches?0:170);}
 function enter(direction){if(!studyViewport.matches||reduced.matches)return;clear();grid.classList.add('is-slide-settling');grid.style.willChange='transform,opacity';grid.style.transform=`translate3d(${direction* Math.min(innerWidth*.32,150)}px,0,0)`;grid.style.opacity='.65';void grid.offsetWidth;settle();}
 const baseRender=render;render=function(...args){cancel();return baseRender(...args);};
 const baseQuestions=renderQuestions;renderQuestions=function(...args){cancel();return baseQuestions(...args);};
 const baseNavigate=navigateBatch;navigateBatch=function(direction){const mobile=studyViewport.matches;cancel();const target=navigationTarget(direction);const result=baseNavigate(direction);if(mobile&&target&&!target.course)enter(direction);return result;};
 surface.addEventListener('touchstart',e=>{
  cancel();suppressClickUntil=0;const option=e.target.closest('[data-mobile-choice]'),control=e.target.closest('.study-dock button');
  if(!studyViewport.matches||e.touches.length!==1||e.target.closest('.handle')||e.target.closest(excluded)&&!option&&!control||!$('dialog-backdrop').hidden||document.body.classList.contains('chapter-drawer-open'))return;
  const t=e.touches[0];if(t.clientX<18||t.clientX>innerWidth-18)return;
  gesture={x:t.clientX,y:t.clientY,time:Date.now(),group:state.group,batch:state.batchIndex,horizontal:false,moved:false,tap:option||control,control:!!control};
 },{passive:true});
 surface.addEventListener('touchmove',e=>{
  if(!gesture)return;if(e.touches.length!==1){cancel();return;}const t=e.touches[0],dx=t.clientX-gesture.x,dy=t.clientY-gesture.y;
  if(Math.hypot(dx,dy)>8)gesture.moved=true;
  if(!gesture.horizontal&&Math.abs(dy)>18&&Math.abs(dy)>Math.abs(dx)){cancel();return;}
  if(!gesture.control&&(gesture.horizontal||Math.abs(dx)>20&&Math.abs(dx)>Math.abs(dy)*1.6)){
   gesture.horizontal=true;if(e.cancelable)e.preventDefault();const canGo=navigationTarget(dx<0?1:-1),move=canGo?dx:dx*.24;
   grid.classList.add('is-swiping');grid.style.transition='none';grid.style.willChange='transform,opacity';grid.style.transform=`translate3d(${move}px,0,0)`;grid.style.opacity=String(1-Math.min(.18,Math.abs(move)/innerWidth*.18));
  }
 },{passive:false});
 surface.addEventListener('touchend',e=>{
  const start=gesture;gesture=null;if(!start)return;
  if(start.horizontal){suppressClickUntil=Date.now()+700;if(e.cancelable)e.preventDefault();}
  if(e.touches.length||!e.changedTouches.length||Date.now()-start.time>3000||start.group!==state.group||start.batch!==state.batchIndex){settle();return;}
  const t=e.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;
  if(start.tap&&!start.moved&&Math.hypot(dx,dy)<=8&&Date.now()-start.time<650&&start.tap.isConnected){if(e.cancelable)e.preventDefault();suppressClickUntil=Date.now()+700;clear();start.tap.click();return;}
  if(start.control||!start.horizontal||Math.abs(dx)<Math.min(65,innerWidth*.18)||Math.abs(dx)<Math.abs(dy)*1.6){settle();return;}
  suppressClickUntil=Date.now()+700;if(e.cancelable)e.preventDefault();const direction=dx<0?1:-1;
  if(!navigationTarget(direction)){toast(direction>0?'已经是最后一题':'已经是第一题');settle();return;}
  if(reduced.matches){navigateBatch(direction);return;}
  const token=++generation;grid.classList.remove('is-swiping');grid.classList.add('is-slide-settling');grid.style.transition='transform 75ms ease-out,opacity 75ms ease-out';grid.style.transform=`translate3d(${-direction*innerWidth}px,0,0)`;grid.style.opacity='.3';
  timer=setTimeout(()=>{if(token===generation&&studyViewport.matches&&!document.hidden&&start.group===state.group&&start.batch===state.batchIndex)navigateBatch(direction);else cancel();},80);
 },{passive:false});
 surface.addEventListener('touchcancel',()=>{if(gesture?.horizontal)suppressClickUntil=Date.now()+700;gesture=null;settle();},{passive:true});
 surface.addEventListener('click',e=>{if(e.detail!==0&&Date.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 const baseDialog=openDialog;openDialog=function(...args){cancel();return baseDialog(...args);};
 window.addEventListener('resize',cancel);window.addEventListener('pagehide',cancel);window.addEventListener('blur',cancel);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 return{cancel};
})();
