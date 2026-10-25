const assert=require('node:assert/strict');
const REVISION='2026-10-23-comparable-pools-v5';
function applyPoolQuality(input,plan){
 const bank=JSON.parse(JSON.stringify(input)),previous=bank.contentAudit;
 const chapters=new Map(bank.chapters.map(c=>[c.id,c]));
 const entries=new Map(bank.chapters.flatMap(c=>c.groups.flatMap(g=>g.questions.map(q=>[q.id,{c,g,q}]))));
 const originalPools=new Set(bank.chapters.flatMap(c=>c.groups.map(g=>g.id)));
 assert.deepEqual(new Set(plan.chapterIds),new Set(chapters.keys()),'all chapters require pool review');
 assert.deepEqual(new Set(plan.reviewedGroupIds),originalPools,'every pool must be reviewed, not only flagged pools');
 assert.equal(plan.reviewedGroupIds.length,originalPools.size,'duplicated review pool');
 const audit={revision:REVISION,rewrites:[],retired:[],addedQuestionIds:[],groupAliases:{},notes:plan.notes||[],revisions:[...(previous.revisions||[previous])]};
 const moved=new Set(),retiring=new Set((plan.retire||[]).map(r=>r.id));
 const snapshot=e=>({stem:e.q.stem,answer:[...e.q.answer],options:e.g.options,page:e.q.page,chapter:e.c.id,group:e.g.id});
 const built=[];
 for(const spec of plan.changes||[]){
  const c=chapters.get(spec.chapter),m=c?.modules.find(m=>m.id===spec.module);assert(c&&m,'pool target '+spec.key);
  const id=c.id+'-'+spec.key;assert(!originalPools.has(id)&&!built.some(x=>x.g.id===id),'new pool id '+id);
  assert(spec.options.length>=3,'need meaningful comparable choices '+id);assert.equal(new Set(spec.options).size,spec.options.length,'duplicate options '+id);
  const options=spec.options.map((text,i)=>({id:'o'+i,text}));
  const questions=spec.rows.map((r,i)=>{
   const qid=r.id||id+'-q'+(i+1),e=entries.get(qid);assert(!moved.has(qid)&&!retiring.has(qid),'duplicate rewrite/retire '+qid);moved.add(qid);
   assert(r.reason&&r.stem&&r.explanation,'rationale missing '+qid);assert(r.page>=c.startPage&&r.page<=c.endPage,'source page '+qid);
   const answer=Array.isArray(r.answer)?r.answer:[r.answer];assert(answer.length>0&&answer.length<options.length&&new Set(answer).size===answer.length&&answer.every(n=>Number.isInteger(n)&&n>=0&&n<options.length),'answer '+qid);
   if(e){assert.equal(e.c.id,c.id,'cross-chapter rewrite');audit.rewrites.push({id:qid,reason:r.reason,previousQuestion:snapshot(e)});}else audit.addedQuestionIds.push(qid);
   return{...(e?.q||{}),id:qid,stem:r.stem,answer:answer.map(n=>'o'+n),page:r.page,explanation:r.explanation,type:answer.length>1?'multiple':'single',difficulty:r.difficulty||e?.q.difficulty||'contrast',knowledgePoint:spec.name,sourceRef:r.sourceRef||e?.q.sourceRef||`${bank.source||'讲义'} PDF第${r.page}页`};
  });
  assert(questions.length,'empty replacement pool');built.push({c,m,g:{id,name:spec.name,module:m.id,options,questions}});
 }
 for(const r of plan.retire||[]){const e=entries.get(r.id);assert(e&&r.reason&&Array.isArray(r.replaceBy),'invalid retirement '+r.id);audit.retired.push({...r,previousQuestion:snapshot(e)});}
 for(const c of bank.chapters)for(const g of c.groups)g.questions=g.questions.filter(q=>!moved.has(q.id)&&!retiring.has(q.id));
 // Insert split pools next to their source module, retaining all unaffected IDs/options.
 for(const {c,m,g}of built){c.groups.push(g);m.groups.push(g.id);}
 const valid=new Set(bank.chapters.flatMap(c=>c.groups.flatMap(g=>g.questions.map(q=>q.id))));
 for(const r of audit.retired)assert(r.replaceBy.every(id=>valid.has(id)),'dangling replacement '+r.id);
 const replacements=new Map(audit.retired.map(r=>[r.id,r.replaceBy]));
 for(const c of bank.chapters){
  const gs=new Map(c.groups.map(g=>[g.id,g]));
  for(const m of c.modules){const before=[...m.groups];m.groups=m.groups.filter(id=>gs.get(id)?.questions.length);m.questionIds=m.groups.flatMap(id=>gs.get(id).questions.map(q=>q.id));for(const old of before)if(!m.groups.includes(old)&&m.groups.length){const direct=built.find(x=>x.c.id===c.id&&x.m.id===m.id&&x.g.questions.some(q=>entries.get(q.id)?.g.id===old));audit.groupAliases[old]=direct?.g.id||m.groups[0];}}
  c.modules=c.modules.filter(m=>m.groups.length);assert(c.modules.length,'chapter emptied '+c.id);c.groups=c.modules.flatMap(m=>m.groups.map(id=>gs.get(id)));c.questionCount=c.groups.reduce((n,g)=>n+g.questions.length,0);
  for(const topic of c.coverage?.priorityTopics||[]){topic.questionIds=[...new Set((topic.questionIds||[]).flatMap(id=>replacements.get(id)||[id]))].filter(id=>valid.has(id));if(!topic.questionIds.length)topic.status='deferred';}
  if(c.coverage){c.coverage.mappedTopics=c.modules.map(m=>m.name);c.coverage.poolQualityRevision=REVISION;c.coverage.poolReview={reviewedQuestionIds:[...entries.values()].filter(e=>e.c.id===c.id).map(e=>e.q.id),rewrittenQuestionIds:audit.rewrites.filter(r=>entries.get(r.id)?.c.id===c.id).map(r=>r.id),retiredQuestionIds:audit.retired.filter(r=>entries.get(r.id)?.c.id===c.id).map(r=>r.id)};for(const r of audit.retired.filter(r=>entries.get(r.id)?.c.id===c.id&&r.coverageLoss))c.coverage.excluded.push(r.coverageLoss);}
 }
 const now=new Map(bank.chapters.flatMap(c=>c.groups.flatMap(g=>g.questions.map(q=>[q.id,{g,q}]))));
 for(const [id,e]of entries){if(moved.has(id)||retiring.has(id))continue;const n=now.get(id);assert(n,'unaffected question lost '+id);assert.deepEqual(n.q,e.q,'unaffected question changed '+id);assert.deepEqual(n.g.options,e.g.options,'unaffected options changed '+id);}
 assert.equal(now.size,valid.size,'duplicate final question ID');
 audit.scan={chapters:plan.chapterIds.length,pools:plan.reviewedGroupIds.length,questions:entries.size,mode:'per-question-full-pool-semantic-review',scope:'option-type,composition-and-title-cues; not independent clinical guideline review'};
 const revisionEntry={revision:REVISION,rewrites:audit.rewrites,retired:audit.retired,addedQuestionIds:audit.addedQuestionIds,groupAliases:audit.groupAliases};audit.revisions.push(revisionEntry);
 bank.contentAudit=audit;bank.poolQualityRevision=REVISION;bank.revision=REVISION;bank.edition='全库同字段选项复核版 v5';return bank;
}
module.exports={applyPoolQuality,REVISION};
