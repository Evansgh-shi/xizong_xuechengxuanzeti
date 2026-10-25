// Automatic navigation is an optional, ephemeral follow-up to an individual grade.
// No timer is stored in the course record, restored on reload, or used by batch submit.
const AUTO_ADVANCE=(()=>{
 let pending=null;
 const enabled=()=>studySettings.quick&&studySettings.autoAdvance;
 const graded=q=>!!state.grades[q.id]?.instant&&equals(state.grades[q.id].chosen||[],answersFor(q));
 function cancel(){const active=!!pending;if(pending){clearTimeout(pending.timer);clearInterval(pending.ticker);pending=null;}document.querySelectorAll('.auto-advance-notice').forEach(e=>e.remove());return active;}
 function subsequent(q){const qs=current(),index=qs.findIndex(x=>x.id===q.id);return index>=0?qs.slice(index+1).find(x=>!graded(x)):null;}
 function schedule(q){
  cancel();if(!enabled()||document.hidden||state.review||!graded(q))return;
  const next=subsequent(q),boundary=navigationTarget(1);
  if(!next&&!boundary){toast('已到本次练习最后一题，答案和解析保留。');return;}
  const card=document.querySelector(`[data-question="${q.id}"]`),review=studyViewport.matches?$('question-grid').querySelector(':scope > .review'):card?.querySelector('.review');if(!review)return;
  const seconds=[1,2,3,5].includes(studySettings.advanceDelay)?studySettings.advanceDelay:2;
  const notice=document.createElement('div');notice.className='auto-advance-notice';notice.innerHTML='<span role="status" aria-live="polite"></span><button type="button" class="btn secondary" data-stop-auto-advance>留在本题</button>';review.prepend(notice);
  const token={qid:q.id,group:state.group,batch:state.batchIndex,ids:current().map(x=>x.id).join('|'),deadline:Date.now()+seconds*1000,notice,nextId:next?.id};pending=token;
  const tick=()=>{if(pending!==token)return;const n=Math.max(1,Math.ceil((token.deadline-Date.now())/1000));notice.querySelector('span').textContent=`${n} 秒后${next?'定位下一题':studyViewport.matches?'进入下一题':'切换下一题组'} · 可暂停查看解析`;};tick();token.ticker=setInterval(tick,250);
  token.timer=setTimeout(()=>{
   if(pending!==token)return;
   const valid=enabled()&&!document.hidden&&!state.review&&$('dialog-backdrop').hidden&&state.group===token.group&&state.batchIndex===token.batch&&current().map(x=>x.id).join('|')===token.ids&&graded(q);
   cancel();if(!valid)return;
   if(token.nextId){const target=current().find(x=>x.id===token.nextId);if(!target||graded(target))return;const el=document.querySelector(`[data-question="${target.id}"]`);if(!el)return;document.querySelectorAll('.auto-next-focus').forEach(e=>e.classList.remove('auto-next-focus'));el.classList.add('auto-next-focus');el.tabIndex=-1;el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});el.focus({preventScroll:true});}
   else if(navigationTarget(1))navigateBatch(1);
  },seconds*1000);
 }
 const oldRender=render;render=function(){cancel();oldRender();};
 const oldDialog=openDialog;openDialog=function(...args){cancel();return oldDialog(...args);};
 document.addEventListener('click',e=>{if(e.target.closest('[data-stop-auto-advance]')){e.preventDefault();e.stopImmediatePropagation();cancel();toast('本次自动跳题已暂停，答案和解析保留。');}},true);
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-stop-auto-advance]'))cancel();},true);
 document.addEventListener('touchstart',e=>{if(!e.target.closest('[data-stop-auto-advance]'))cancel();},{passive:true,capture:true});
 document.addEventListener('wheel',cancel,{passive:true});document.addEventListener('keydown',cancel,true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});window.addEventListener('blur',cancel);window.addEventListener('pagehide',cancel);
 $('dialog-body').addEventListener('change',e=>{if(!['study-quick','study-auto-advance'].includes(e.target.id))return;const quick=$('study-quick'),auto=$('study-auto-advance'),delay=$('study-advance-delay');if(auto)auto.disabled=!quick.checked;if(delay)delay.disabled=!quick.checked||!auto.checked;});
 return{schedule,cancel};
})();
