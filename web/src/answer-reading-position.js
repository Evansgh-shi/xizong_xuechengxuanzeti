// Expanding earlier answers must not push the question being read out of view.
(function preserveAnswerReadingPosition(){
 let pending=null;
 function cancel(){if(!pending)return;for(const frame of pending.frames)cancelAnimationFrame(frame);document.documentElement.style.overflowAnchor=pending.anchorStyle;document.documentElement.style.scrollBehavior=pending.scrollStyle;pending=null;}
 function keepPosition(change){
  cancel();const dock=document.querySelector('.study-dock').getBoundingClientRect().top,limit=Math.min(innerHeight,dock),cards=[...document.querySelectorAll('#question-grid [data-question]')];
  const visible=cards.map(card=>({card,stem:card.querySelector('.stem'),rect:card.getBoundingClientRect()})).filter(x=>x.rect.bottom>0&&x.rect.top<limit);
  const anchor=visible.find(x=>{const r=x.stem?.getBoundingClientRect();return r&&r.bottom>0&&r.top<limit;})||visible[0],stem=anchor?.stem;
  const token={id:stem?.id,top:stem?.getBoundingClientRect().top,x:scrollX,y:scrollY,anchorStyle:document.documentElement.style.overflowAnchor,scrollStyle:document.documentElement.style.scrollBehavior,frames:[]};pending=token;
  document.documentElement.style.overflowAnchor='none';document.documentElement.style.scrollBehavior='auto';
  const restore=()=>{if(pending!==token||studyViewport.matches)return;const el=token.id&&document.getElementById(token.id);scrollTo({left:token.x,top:el?scrollY+el.getBoundingClientRect().top-token.top:token.y,behavior:'instant'});};
  try{change();restore();token.frames.push(requestAnimationFrame(()=>{restore();token.frames.push(requestAnimationFrame(()=>{restore();if(pending===token)cancel();}));}));}catch(error){cancel();throw error;}
 }
 $('answers-btn').addEventListener('click',e=>{if(studyViewport.matches)return;e.preventDefault();e.stopImmediatePropagation();keepPosition(()=>{state.revealed=!state.revealed;renderHeader();renderQuestions();save();});},true);
 for(const type of ['wheel','touchstart','pointerdown','keydown'])document.addEventListener(type,cancel,{capture:true,passive:type!=='keydown'});
 window.addEventListener('resize',cancel);window.addEventListener('pagehide',cancel);studyViewport.addEventListener('change',cancel);
})();
