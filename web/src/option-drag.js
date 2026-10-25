// A reusable option is copied into an answer; the source bank is never moved.
// Keep the native HTML drag handlers as a fallback for browsers without Pointer Events.
(function installOptionDrag(){
  if(typeof PointerEvent==='undefined'||typeof document.createElement!=='function')return;
  const bank=document;
  let gesture=null,ignoredClick=null;
  const status=document.createElement('span');
  status.className='drag-live-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  document.body.append(status);

  function activeTarget(x,y){
    const target=document.elementFromPoint(x,y)?.closest('[data-drop]');
    return target&&!state.review&&current().some(q=>q.id===target.dataset.drop&&q.group===gesture?.optionGroup)?target:null;
  }
  function clearTarget(){
    if(gesture?.target){gesture.target.classList.remove('is-drag-target');gesture.target.closest('.card')?.classList.remove('is-drag-card');gesture.target=null;}
  }
  function updateTarget(){
    const g=gesture;if(!g?.active)return;
    const target=activeTarget(g.x,g.y);
    if(target!==g.target){clearTarget();g.target=target;if(target){target.classList.add('is-drag-target');target.closest('.card')?.classList.add('is-drag-card');}}
    g.preview.classList.toggle('over-target',!!target);
  }
  function positionPreview(){
    const g=gesture;if(!g?.active)return;
    // Keep the exact original grab point under the pointer; never recenter or offset the copy.
    g.preview.style.transform=`translate3d(${g.x-g.grabX}px,${g.y-g.grabY}px,0)`;
  }
  function tick(time){
    const g=gesture;if(!g?.active)return;
    if(state.review||state.group!==g.group||!g.source.isConnected||!$('dialog-backdrop').hidden){finish(false);return;}
    const dockTop=document.querySelector('.study-dock').getBoundingClientRect().top;
    const step=Math.min(2,(time-(g.lastTime||time))/16.67);g.lastTime=time;
    let speed=0;
    if(g.y<72)speed=-Math.min(15,(72-g.y)/4);
    else if(g.y>dockTop-64&&g.y<dockTop)speed=Math.min(15,(g.y-(dockTop-64))/4);
    if(speed)window.scrollBy({top:speed*step,left:0,behavior:'instant'});
    updateTarget();positionPreview();g.frame=requestAnimationFrame(tick);
  }
  function begin(){
    const g=gesture;if(!g||state.review||state.group!==g.group)return;
    g.active=true;dragged=g.optionId;selected=null;renderSelection();
    document.body.classList.add('option-drag-active');g.source.classList.add('option-drag-source');
    const preview=g.source.cloneNode(true);preview.className='option drag-preview';preview.removeAttribute('data-option');preview.removeAttribute('title');preview.setAttribute('aria-hidden','true');preview.tabIndex=-1;preview.draggable=false;
    preview.style.width=g.width+'px';preview.style.height=g.height+'px';
    const layer=document.createElement('div');layer.className='option-drag-layer';layer.setAttribute('aria-hidden','true');layer.append(preview);document.body.append(layer);g.preview=preview;g.layer=layer;
    try{g.source.setPointerCapture(g.pointerId);}catch{}
    status.textContent='正在拖动：'+(DATA.find(p=>p.id===g.optionGroup)?.options.find(o=>o.id===g.optionId)?.text||g.optionId)+'。松开放入答题框，按 Escape 取消。';
    updateTarget();positionPreview();g.frame=requestAnimationFrame(tick);
  }
  function feedback(qid,duplicate){
    const zone=document.querySelector(`[data-drop="${qid}"]`);if(!zone)return;
    const className=duplicate?'drop-duplicate':'drop-received';zone.classList.add(className);
    const chip=duplicate?null:zone.querySelector('.chip:last-child');chip?.classList.add('chip-arrived');
    setTimeout(()=>{zone.classList.remove(className);chip?.classList.remove('chip-arrived');},500);
  }
  function finish(shouldDrop){
    const g=gesture;if(!g)return;
    const target=shouldDrop&&g.active&&state.group===g.group?activeTarget(g.x,g.y):null;
    const qid=target?.dataset.drop,q=qid&&QMAP.get(qid),duplicate=q&&answersFor(q).includes(g.optionId);
    clearTarget();gesture=null;cancelAnimationFrame(g.frame);
    g.layer?.remove();g.source.classList.remove('option-drag-source');document.body.classList.remove('option-drag-active');dragged=null;
    try{if(g.source.hasPointerCapture(g.pointerId))g.source.releasePointerCapture(g.pointerId);}catch{}
    if(!g.active)return;
    ignoredClick={source:g.source,until:performance.now()+500};
    if(qid){addAnswer(qid,g.optionId,g.optionGroup);feedback(qid,duplicate);status.textContent=duplicate?'本题已添加该选项，未重复添加。':'选项已放入，原选项仍可重复使用。';}
    else{status.textContent='已取消拖动，作答未改变。';}
  }
  bank.addEventListener('pointerdown',e=>{
    const source=e.target.closest('[data-option]');
    if(!source||e.button!==0||!e.isPrimary||state.review||!$('dialog-backdrop').hidden||typeof studySettings!=='undefined'&&studySettings.answer==='choice')return;
    if(gesture)finish(false);
    const touch=e.pointerType==='touch',handle=!!e.target.closest('.handle');
    if(touch&&!handle)return;
    const rect=source.getBoundingClientRect();
    gesture={source,optionId:source.dataset.option,optionGroup:source.dataset.optionGroup||state.group,group:state.group,pointerId:e.pointerId,touch,handle,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,grabX:e.clientX-rect.left,grabY:e.clientY-rect.top,width:rect.width,height:rect.height,active:false,frame:0};
    // Touch dragging starts only on the grip, leaving option text free for normal scrolling.
    if(!touch||handle){e.preventDefault();try{source.setPointerCapture(e.pointerId);}catch{}}
  });
  document.addEventListener('pointermove',e=>{
    const g=gesture;if(!g||e.pointerId!==g.pointerId)return;
    g.x=e.clientX;g.y=e.clientY;
    if(!g.active){
      const dx=Math.abs(g.x-g.startX),dy=Math.abs(g.y-g.startY);
      if(Math.hypot(dx,dy)<7)return;
      begin();
    }
    if(g.active){if(e.cancelable)e.preventDefault();updateTarget();positionPreview();}
  },{passive:false});
  document.addEventListener('pointerup',e=>{if(gesture?.pointerId===e.pointerId){gesture.x=e.clientX;gesture.y=e.clientY;if(gesture.active)e.preventDefault();finish(true);}});
  document.addEventListener('pointercancel',e=>{if(gesture?.pointerId===e.pointerId)finish(false);});
  bank.addEventListener('lostpointercapture',e=>{if(gesture?.pointerId===e.pointerId)finish(false);});
  // Prevent a browser-generated post-drag click from selecting the source a second time.
  document.addEventListener('click',e=>{if(ignoredClick&&performance.now()<ignoredClick.until&&ignoredClick.source.contains(e.target)&&e.detail!==0){ignoredClick=null;e.preventDefault();e.stopImmediatePropagation();}},true);
  bank.addEventListener('dragstart',e=>{if(gesture){e.preventDefault();e.stopImmediatePropagation();}},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&gesture){e.preventDefault();finish(false);}},true);
  window.addEventListener('blur',()=>finish(false));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish(false);});
})();
