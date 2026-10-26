const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {humanContent}=require('./humanities-content.cjs');
const REVISION='2026-10-26-humanities-mnemonics-v1';
const safe=v=>JSON.stringify(v).replace(/</g,'\\u003c');
function prepareHumanities(banks,root){
 const read=p=>fs.readFileSync(path.join(root,p),'utf8'),human=humanContent(),chapters=human.chapters,media={},figures={},provenance={},sourceCourses={internal:'内科',surgery:'外科',physiology:'生理',biochemistry:'生化',pathology:'病理'},audit=[];
 for(const [course,original]of Object.entries(banks)){
  const plan=JSON.parse(read('src/'+course+'-mnemonic-plan.json')),target=new Set(plan.entries.flatMap(e=>e.questionIds));
  const ch={id:'mn-'+course,name:sourceCourses[course]+'口诀',system:'口诀专项',startPage:1,endPage:Math.max(...original.chapters.map(c=>c.endPage)),modules:[],groups:[],coverage:[]};
  const base=read('dist/'+(course==='internal'?'index.html':course+'.html')),sourceMedia=JSON.parse(base.match(/const ECG_MEDIA=([^\n]+);/)[1]);
  for(const oc of original.chapters){
   const module={id:'mn-'+course+'-'+oc.id,name:oc.name,groups:[],questionIds:[]};
   for(const og of oc.groups){
    const questions=og.questions.filter(q=>target.has(q.id));if(!questions.length)continue;
    const gid='mn-'+course+'-'+og.id,g={...JSON.parse(JSON.stringify(og)),id:gid,module:module.id,questions:[]};
    for(const old of questions){
     const q=JSON.parse(JSON.stringify(old));q.id='mn-'+course+'-'+old.id;q.drillSection='mnemonic';
     q.sourceLecture={course,name:sourceCourses[course],title:original.source,page:old.page,originQuestionId:old.id};
     q.sourceRef=sourceCourses[course]+'讲义 PDF第'+old.page+'页'+(old.sourceRef?' · '+old.sourceRef:'');
     q.mnemonics=q.mnemonics.map(m=>({...m,sourceCourse:sourceCourses[course],sourceTitle:original.source}));
     if(q.diagram){const oldImage=q.diagram.imageId,imageId=course+'-'+oldImage;assert(sourceMedia[oldImage],'missing image '+old.id);const originalMedia=sourceMedia[oldImage],isSvg=Buffer.from(originalMedia.base64,'base64').subarray(0,250).toString().includes('<svg');assert(originalMedia.mime||isSvg,'unknown source image type '+old.id);media[imageId]={...originalMedia,mime:originalMedia.mime||'image/svg+xml',kind:originalMedia.kind||'teaching'};q.diagram={...q.diagram,imageId,source:q.diagram.source||original.source+' PDF第'+q.page+'页'};figures[q.id]=q.diagram;}
     provenance[q.id]={sourceLecture:q.sourceLecture,drillSection:q.drillSection};g.questions.push(q);module.questionIds.push(q.id);
     ch.coverage.push({id:q.id,page:q.page,originQuestionId:old.id,mnemonicKeys:q.mnemonics.map(m=>m.key)});
    }
    ch.groups.push(g);module.groups.push(gid);
   }
   if(module.groups.length)ch.modules.push(module);
  }
  assert(ch.groups.reduce((n,g)=>n+g.questions.length,0)===target.size,'mnemonic source mapping incomplete '+course);
  const reached=new Set(ch.groups.flatMap(g=>g.questions.flatMap(q=>q.mnemonics.map(m=>m.key))));assert(plan.entries.every(e=>reached.has(e.key)),'unreached mnemonic '+course);
  audit.push({course,name:sourceCourses[course],confirmedMnemonics:plan.entries.length,questions:target.size,sourcePages:ch.endPage,deferred:plan.deferred,scope:'Previously verified mnemonic-to-knowledge mappings; source grading and distractors reused without semantic edits.'});chapters.push(ch);
 }
 for(const c of human.chapters)for(const g of c.groups)for(const q of g.questions)provenance[q.id]={sourceLecture:q.sourceLecture,drillSection:q.drillSection};
 const all=chapters.flatMap(c=>c.groups.flatMap(g=>g.questions)),bank={courseId:'humanities',source:'人文讲义与五科讲义已核对口诀',sourcePages:9+audit.reduce((n,c)=>n+c.sourcePages,0),revision:REVISION,edition:'人文知识＋讲义口诀关系专项',chapters,
  contentAudit:{revision:REVISION,rewrites:[],retired:[],addedQuestionIds:all.map(q=>q.id)},
  priorityAudit:{humanitiesPagesRead:[1,2,3,4,5,6,7,8,9],source:'27考研讲义：人文 天天师兄.pdf',humanitiesKnowledgeQuestions:human.coverage.filter(q=>q.section==='人文知识').length,humanitiesMnemonicQuestions:human.coverage.filter(q=>q.section==='口诀专项').length,confirmedHumanitiesMnemonics:human.mnemonics.length,originalCourses:audit,deferred:human.deferred,
   scope:'人文全文核读；五科口诀专项重用已核对的知识关系题和完整同类选项池，不把重复练习题量当作新增知识点覆盖。口诀在提交或主动核对后显示；暂缓批注不计作已考口诀。'},lectureMnemonicAudit:{entries:human.mnemonics.length+audit.reduce((n,c)=>n+c.confirmedMnemonics,0),questions:all.filter(q=>q.mnemonics?.length).length,preservesOriginalCourses:true}};
 // Start with the existing un-unified template. All public modes/navigation are added by unified-build afterwards.
 let html=read('dist/pathology.html'),start=html.indexOf('const SOURCE='),end=html.indexOf('const KEY=');
 const meta=chapters.map(c=>({...c,groups:c.groups.map(g=>g.id),questionIds:c.groups.flatMap(g=>g.questions.map(q=>q.id)),questionCount:c.groups.reduce((n,g)=>n+g.questions.length,0)}));
 const data=chapters.flatMap(c=>c.groups.map(g=>({id:g.id,name:g.name,chapter:c.id,module:g.module,subtitle:c.name,options:g.options.map(o=>[o.id,o.text]),questions:g.questions.map(q=>[q.id,q.stem,q.answer,q.explanation,q.page,q.difficulty,q.sourceRef])})));
 const source={title:bank.source,totalPages:bank.sourcePages,scannedPages:9,chapterCount:chapters.length,qualityRevision:REVISION,changedQuestionIds:[],qualityChangeSets:{},edition:bank.edition,diagramCount:Object.keys(figures).length,priorityAudit:bank.priorityAudit};
 const refs=Object.fromEntries(all.filter(q=>q.references?.length).map(q=>[q.id,q.references]));
 html=html.slice(0,start)+`const SOURCE=${safe(source)};\nconst CHAPTERS=${safe(meta)};\nconst DATA=${safe(data)};\nconst ECG_MEDIA=${safe(media)};\nconst ECG_QUESTIONS=${safe(figures)};\nconst PATHOLOGY_REFERENCES=${safe(refs)};\nconst HUMANITIES_PROVENANCE=${safe(provenance)};\n`+html.slice(end);
 html=html.replace("const KEY='xuecheng-pathology-drag-v1';","const KEY='xuecheng-humanities-drag-v1';");
 html=html.replace(/<title>[^<]+<\/title>/,'<title>人文与口诀 · 知识与记忆关系专项 | 学成</title>').replace(/<meta name="description" content="[^"]+">/,'<meta name="description" content="人文知识与讲义口诀专项：医德、沟通、权利义务、临床研究，以及五科口诀关联知识练习。">');
 html=html.replace(/<strong>26<\/strong><span>个讲义章节<\/span>/,`<strong>${chapters.length}</strong><span>个练习章节</span>`).replace(/病理读图 · \d+题/g,`口诀相关读图 · ${Object.keys(figures).length}题`).replace(/全文已核读[^<]+页/,'人文 9 / 9 页已核读；五科口诀沿用已核对关系');
 html=html.replace(/依据《27 天天病理讲义合集》[^<]+/, '人文知识与讲义口诀分区练习 · 每题注明原科与PDF页码 · 口诀答后显示 · 仅供复习，不替代诊疗或法律意见');
 html=html.replaceAll('病理学习记录','人文与口诀学习记录').replaceAll('本题病理图','本题图').replaceAll('放大病理图','放大本题图').replaceAll('放大本题病理图','放大本题图').replaceAll('病理图 · 放大判读','题目图 · 放大判读').replaceAll('非真实组织切片','非真实临床原片');
 html=html.replace("startNotebookPractice(Object.keys(ECG_QUESTIONS),'病理形态与结构读图')","startNotebookPractice(Object.keys(ECG_QUESTIONS),'口诀关联读图')").replace('完整病理诊断。','完整临床诊断。');
 const ca=html.indexOf('function showCoverage(){'),cb=html.indexOf('function records(){',ca);assert(ca>=0&&cb>ca);
 html=html.slice(0,ca)+`function showCoverage(){openDialog('人文与口诀 · 来源与范围','<p>人文讲义9页已逐页核读；五科口诀采用此前核对的对应关系。专项题复用原科同类选项与答案，不算新增独立知识点。</p><p>人文争议个案与未确认批注列为暂缓，不纳入确定判分。每题解析展示原讲义、PDF页码与相应口诀。</p>');}\n`+html.slice(cb);
 return{bank,html,provenance};
}
module.exports={prepareHumanities};
