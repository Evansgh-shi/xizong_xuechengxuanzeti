$('system-select').addEventListener('change',e=>{const c=CHAPTERS.find(c=>c.system===e.target.value);if(c)setChapter(c.id);});
$('chapter-select').addEventListener('change',e=>setChapter(e.target.value));
$('catalog-btn').addEventListener('click',showCatalog);
$('prev-chapter-btn').addEventListener('click',()=>setChapter(CHAPTERS[Math.max(0,CHAPTERS.indexOf(chapter())-1)].id));
$('next-chapter-btn').addEventListener('click',()=>setChapter(CHAPTERS[Math.min(CHAPTERS.length-1,CHAPTERS.indexOf(chapter())+1)].id));
$('dialog-body').addEventListener('click',e=>{const b=e.target.closest('[data-catalog-chapter]');if(b){closeDialog();setChapter(b.dataset.catalogChapter);}});
$('dialog-body').addEventListener('input',e=>{if(e.target.id==='catalog-search')$('catalog-items').innerHTML=catalogItems(e.target.value);});
