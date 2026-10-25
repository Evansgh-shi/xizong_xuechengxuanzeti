function ecgImageMarkup(media,css=''){
  const src='data:image/svg+xml;base64,'+media.base64;
  return `<img class="ecg-trace ${css}" src="${src}" width="${media.width}" height="${media.height}" alt="心电图教学模拟图 ${esc(media.id)}，导联 ${esc(media.leads.join('、'))}；可放大读图" decoding="async" loading="lazy" draggable="false">`;
}
function ecgFigure(q){
  const item=ECG_QUESTIONS[q.id],media=item&&ECG_MEDIA[item.imageId];if(!media)return '';
  return `<figure class="ecg-figure"><div class="ecg-figure-top"><span class="ecg-tag">心电图读图</span><button class="ecg-open" data-ecg-open="${q.id}" type="button" aria-label="放大本题心电图">放大读图 ↗</button></div><button class="ecg-image-button" type="button" data-ecg-open="${q.id}" aria-label="放大心电图">${ecgImageMarkup(media)}</button><figcaption>原创教学模拟图 · 非患者记录 · 纸速25 mm/s，增益10 mm/mV。缩放后按网格测量；每行方波为1 mV。</figcaption></figure>`;
}
function ecgReview(q){
  const item=ECG_QUESTIONS[q.id];if(!item)return '';
  const extra=q.id==='cardio-arrhythmia-g8-q12'?'、<a href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support/" target="_blank" rel="noopener noreferrer">AHA成人高级生命支持指南</a>':'';
  return `<div class="ecg-reading-review"><strong>读图要点</strong><p>${esc(item.review)}</p><p class="ecg-reference">绘图依据：本题讲义出处；核对参考 <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5137383/" target="_blank" rel="noopener noreferrer">SBC心电图报告指南</a>、<a href="https://www.msdmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/atrioventricular-block" target="_blank" rel="noopener noreferrer">MSD房室传导阻滞</a>${extra}。图形仅用于本题所考特征，不代表完整临床诊断。</p></div>`;
}
function openEcg(qid){
  const q=QMAP.get(qid),item=ECG_QUESTIONS[qid],media=item&&ECG_MEDIA[item.imageId];if(!q||!media)return;
  openDialog('心电图 · 放大读图',`<p class="ecg-dialog-question">${esc(q.stem)}</p><div class="ecg-zoom-controls"><label for="ecg-zoom">缩放 <output id="ecg-zoom-value">100%</output></label><input id="ecg-zoom" type="range" min="60" max="250" step="10" value="100" aria-label="心电图缩放比例"><button class="btn secondary" id="ecg-zoom-reset" type="button">重置</button></div><div class="ecg-zoom-scroll" tabindex="0" aria-label="心电图区域，可左右滚动"><div id="ecg-zoom-canvas" style="width:${media.width}px">${ecgImageMarkup(media)}</div></div><p>原创教学模拟图，非患者记录。纸速25 mm/s，增益10 mm/mV；一小格为1 mm标尺，请结合纸速和增益换算。可横向滚动；缩放不会改变网格比例。</p>`);
  document.querySelector('.dialog').classList.add('wide','ecg-dialog');
  $('ecg-zoom').addEventListener('input',()=>{const value=Number($('ecg-zoom').value);$('ecg-zoom-value').textContent=value+'%';$('ecg-zoom-canvas').style.width=(media.width*value/100)+'px';});
  $('ecg-zoom-reset').addEventListener('click',()=>{$('ecg-zoom').value='100';$('ecg-zoom-value').textContent='100%';$('ecg-zoom-canvas').style.width=media.width+'px';});
}
$('question-grid').addEventListener('click',e=>{const target=e.target.closest('[data-ecg-open]');if(target)openEcg(target.dataset.ecgOpen);});
$('ecg-practice-btn').addEventListener('click',()=>startNotebookPractice(Object.keys(ECG_QUESTIONS),'心电图读图练习'));
