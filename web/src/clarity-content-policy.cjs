const assert=require('node:assert/strict');
const {clarityPlan}=require('./clarity-plan.cjs');
const REVISION='2026-10-27-clear-relations-v7';
// Candidate detection is a triage rule, not a claim to have revalidated every clinical fact.
function scanClarity(bank){
 const rows=[];let total=0;
 for(const c of bank.chapters)for(const g of c.groups)for(const q of g.questions){
  total++;const max=Math.max(...g.options.map(o=>o.text.length)),fields=Math.max(...g.options.map(o=>(o.text.match(/[；;]/g)||[]).length+1)),reason=[];
  if(/完整配伍|全表|四类病因|五栏|六项标记|七项标记/.test(q.stem))reason.push('compressed-whole-table');
  if(/如何.*(配伍|配对)|三个角色|四方面/.test(q.stem)&&max>30)reason.push('implicit-relation');
  if(/本页|本表|清单|条目/.test(q.stem)&&fields>=3&&max>50)reason.push('dense-fields');
  if(reason.length)rows.push({id:q.id,chapter:c.id,page:q.page,stem:q.stem,reason});
 }
 return{questions:total,candidates:rows,scope:'规则扫描全库；命中题及相关邻题回到讲义核读，不等同于全部医学事实重新审核'};
}
function applyClarity(input,course){
 const plan=clarityPlan(),changes=plan.changes.filter(s=>s.course===course),wording=plan.wording.filter(s=>s.course===course),retire=plan.retire.filter(s=>s.course===course);
 if(!changes.length&&!wording.length&&!retire.length)return input;
 const bank=JSON.parse(JSON.stringify(input)),previous=bank.contentAudit;
 const original=new Map(input.chapters.flatMap(c=>c.groups.flatMap(g=>g.questions.map(q=>[q.id,{c,g,q}]))));
 const before=new Map([...original].map(([id,{c,g,q}])=>[id,{stem:q.stem,answer:[...q.answer],options:g.options.map(o=>({...o})),page:q.page,chapter:c.id,group:g.id}]));
 const sources=new Set(changes.map(s=>s.source)),retiredIds=new Set(retire.map(r=>r.id)),wordingIds=new Set(wording.map(r=>r.id)),created=new Set(),added=[],changed=new Set(),affected=new Set(),anchors=new Map();
 const audit={revision:REVISION,rewrites:[],retired:[],addedQuestionIds:added,groupAliases:{},presentationEdits:wording.map(({id,reason})=>({id,reason})),scan:scanClarity(input),notes:['整表编码改为明确对象、独立关系或逐项多选；必要的联合诊断条件保留。','原科题保留讲义口诀，未复制至口诀专项。','只让实质变化的旧题重新作答；仅措辞调整不重置记录。'],externalCrossChecks:course==='internal'?[{questionIds:['endo-cushing-01-q4','supp-endo-cushing-01-q5'],url:'https://www.ncbi.nlm.nih.gov/sites/books/NBK279088/table/cushings-disease.T.etiology_of_cushings/',scope:'ACTH依赖性/非依赖性病因分类与罕见异位CRH'}]:[]};
 for(const s of changes){
  const old=original.get(s.source);assert(old&&!retiredIds.has(s.source),'source '+s.source);
  const c=bank.chapters.find(c=>c.id===old.c.id),m=c.modules.find(m=>m.id===old.g.module),gid=c.id+'-clarity-'+s.key;affected.add(c.id);
  assert(m&&!c.groups.some(g=>g.id===gid),'target module/group '+gid);assert(s.options.length>=3&&new Set(s.options).size===s.options.length,'distinct plausible choices '+gid);
  const options=s.options.map((text,i)=>({id:'o'+i,text}));
  const questions=s.rows.map((r,i)=>{
   const id=r.id||(i===0?s.source:null);assert(id&&!created.has(id),'duplicate/missing output ID '+id);created.add(id);
   assert(!original.has(id)||id===s.source,'cross-source overwrite '+id);
   assert(r.answer.length>0&&r.answer.length<options.length&&new Set(r.answer).size===r.answer.length&&r.answer.every(n=>Number.isInteger(n)&&n>=0&&n<options.length),'answer '+id);
   if(original.has(id))changed.add(id);else added.push(id);
   const page=r.page??old.q.page;
   const q={...old.q,id,stem:r.stem,answer:r.answer.map(n=>'o'+n),explanation:r.explanation,page,type:r.answer.length>1?'multiple':'single',knowledgePoint:s.name};
   if(page!==old.q.page&&q.sourceRef)q.sourceRef=q.sourceRef.replace(/PDF\s*第\s*\d+\s*页/g,'PDF第'+page+'页');
   return q;
  });
  c.groups.push({id:gid,name:s.name,module:m.id,options,questions});
  const key=c.id+':'+old.g.id;if(!anchors.has(key))anchors.set(key,[]);anchors.get(key).push(gid);
 }
 for(const id of sources)assert(created.has(id),'source coverage lost '+id);
 for(const r of wording){const e=original.get(r.id);assert(e&&!sources.has(r.id)&&!retiredIds.has(r.id),'wording '+r.id);affected.add(e.c.id);const c=bank.chapters.find(c=>c.id===e.c.id),q=c.groups.find(g=>g.id===e.g.id).questions.find(q=>q.id===r.id);q.stem=r.stem;}
 for(const r of retire){const e=original.get(r.id);assert(e&&!sources.has(r.id),'retire '+r.id);affected.add(e.c.id);audit.retired.push({...r,previousQuestion:before.get(r.id)});}
 for(const id of changed)audit.rewrites.push({id,reason:changes.find(s=>s.source===id).reason,previousQuestion:before.get(id)});
 const replacement=new Map(retire.map(r=>[r.id,r.replaceBy]));
 for(const c of bank.chapters){if(!affected.has(c.id))continue;
  const gs=new Map(c.groups.map(g=>[g.id,g]));
  for(const g of c.groups)if(!g.id.includes('-clarity-'))g.questions=g.questions.filter(q=>!sources.has(q.id)&&!retiredIds.has(q.id));
  for(const m of c.modules){const old=[...m.groups];m.groups=old.flatMap(id=>[...(gs.get(id)?.questions.length?[id]:[]),...(anchors.get(c.id+':'+id)||[])]);m.questionIds=m.groups.flatMap(id=>gs.get(id).questions.map(q=>q.id));
   for(const id of old)if(!m.groups.includes(id))audit.groupAliases[id]=(anchors.get(c.id+':'+id)||[])[0]||m.groups[0];
  }
  c.modules=c.modules.filter(m=>m.groups.length);assert(c.modules.length,'empty chapter');c.groups=c.modules.flatMap(m=>m.groups.map(id=>gs.get(id)));c.questionIds=c.groups.flatMap(g=>g.questions.map(q=>q.id));c.questionCount=c.questionIds.length;
  if(c.coverage){for(const t of c.coverage.priorityTopics||[])t.questionIds=[...new Set(t.questionIds.flatMap(id=>replacement.get(id)||[id]))];
   c.coverage.knowledgeMap=c.groups.map(g=>({name:g.name,group:g.id,questionIds:g.questions.map(q=>q.id),pages:[...new Set(g.questions.map(q=>q.page))],supplement:g.questions.some(q=>q.supplement)}));
   c.coverage.mappedTopics=c.modules.map(m=>m.name);c.coverage.clarityRevision=REVISION;
   c.coverage.clarityReview={rewrittenQuestionIds:audit.rewrites.filter(r=>original.get(r.id).c.id===c.id).map(r=>r.id),addedQuestionIds:added.filter(id=>c.questionIds.includes(id)),retiredQuestionIds:retire.filter(r=>original.get(r.id).c.id===c.id).map(r=>r.id),presentationEditIds:wording.filter(r=>original.get(r.id).c.id===c.id).map(r=>r.id)};
  }
 }
 const final=new Map();for(const c of bank.chapters)for(const g of c.groups)for(const q of g.questions){assert(!final.has(q.id),'duplicate '+q.id);final.set(q.id,{q,g});assert(q.page>=c.startPage&&q.page<=c.endPage&&q.stem&&q.explanation,'source '+q.id);assert(q.answer.length&&q.answer.length<g.options.length&&q.answer.every(id=>g.options.some(o=>o.id===id)),'final key '+q.id);}
 assert.equal(final.size,original.size+added.length-retire.length,'count/coverage');
 for(const r of retire)assert(r.replaceBy.every(id=>final.has(id)),'replacement '+r.id);
 for(const r of retire){const old=original.get(r.id);if(audit.groupAliases[old.g.id]&&!anchors.has(old.c.id+':'+old.g.id)&&r.replaceBy.length)audit.groupAliases[old.g.id]=final.get(r.replaceBy[0]).g.id;}
 for(const [id,{q,g}]of original){if(changed.has(id)||retiredIds.has(id))continue;assert.deepEqual(final.get(id).q,wordingIds.has(id)?{...q,stem:wording.find(r=>r.id===id).stem}:q,'unaffected question '+id);assert.deepEqual(final.get(id).g.options,g.options,'unaffected choices '+id);}
 for(const a of audit.scan.candidates){assert(changed.has(a.id)||retiredIds.has(a.id)||wordingIds.has(a.id),'unreviewed strong candidate '+a.id);a.decision=retiredIds.has(a.id)?'retire-and-merge':wordingIds.has(a.id)?'clarify-wording-only':'rewrite-or-split';}
 audit.revisions=[...(previous.revisions||[previous]),{revision:REVISION,rewrites:audit.rewrites,retired:audit.retired,addedQuestionIds:added,groupAliases:audit.groupAliases}];
 bank.contentAudit=audit;bank.revision=REVISION;bank.edition='题干与关系清晰化复核版 v7';return bank;
}
module.exports={applyClarity,scanClarity,REVISION};
