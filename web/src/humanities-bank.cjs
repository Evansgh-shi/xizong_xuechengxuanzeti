const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {humanContent}=require('./humanities-content.cjs');
const {buildExpansions}=require('./mnemonic-expansion-bank.cjs');
const {humanMnemonicChapter}=require('./human-mnemonic-expansion.cjs');
const REVISION='2026-10-26-mnemonic-word-expansion-v2';
const safe=v=>JSON.stringify(v).replace(/</g,'\\u003c');
function prepareHumanities(banks,root){
 const read=p=>fs.readFileSync(path.join(root,p),'utf8'),human=humanContent(),expansion=buildExpansions(banks,root),audit=expansion.audit,chapters=[...human.chapters.filter(c=>c.system==='人文知识'),humanMnemonicChapter(human),...expansion.chapters],media={},figures={},provenance={};
 const all=chapters.flatMap(c=>c.groups.flatMap(g=>g.questions));
 for(const q of all)provenance[q.id]={sourceLecture:q.sourceLecture,drillSection:q.drillSection,...(q.mnemonicMode?{mnemonicMode:q.mnemonicMode,mnemonicKey:q.mnemonicKey,mnemonicCue:q.mnemonicCue,mnemonicWord:q.mnemonicWord}:{})};
 const old=JSON.parse(read('src/mnemonic-retired-v1.json')),groupAliases=Object.fromEntries(old.retired.map(r=>[r.group,chapters.find(c=>c.id===r.chapter)?.groups[0]?.id||chapters[0].groups[0].id]));
 const retired=old.retired.map(r=>({id:r.id,reason:'移出旧版普通知识搬运题/旧式口诀题，改为新的口诀字词展开题；不继承旧掌握度。',replaceBy:[],previousQuestion:r.previousQuestion,coverageLoss:{page:r.previousQuestion.page,knowledge:r.previousQuestion.stem,status:'replaced-practice-format',reason:'原科普通知识题仍保留；新的字词题仅覆盖已经核定拆法的口诀，未拆条目明列待整理。'}}));
 const change={revision:REVISION,rewrites:[],retired,addedQuestionIds:all.filter(q=>q.mnemonicMode).map(q=>q.id),groupAliases};
 const bank={courseId:'humanities',source:'人文讲义与五科讲义口诀字词解码',sourcePages:9+audit.reduce((n,c)=>n+c.sourcePages,0),revision:REVISION,edition:'人文知识＋口诀字词解码（无普通题搬运）',chapters,
  contentAudit:{...change,fromRevision:old.revision},
  priorityAudit:{humanitiesPagesRead:[1,2,3,4,5,6,7,8,9],source:'27考研讲义：人文 天天师兄.pdf',humanitiesKnowledgeQuestions:human.coverage.filter(q=>q.section==='人文知识').length,humanitiesMnemonicQuestions:chapters[3].groups.reduce((n,g)=>n+g.questions.length,0),confirmedHumanitiesMnemonics:human.mnemonics.length,originalCourses:audit,deferred:human.deferred,retiredCopiedQuestions:1710,retiredPriorHumanMnemonicQuestions:10,pendingWordExpansions:audit.reduce((n,c)=>n+c.pending.length,0),
   scope:'专项只考口诀中的字词所对应的疾病、药物、物质或分类。未核定逐字拆法的条目暂不展示；原科普通题不搬入，不以原先关联条目数冒充逐字解码完成数。'},lectureMnemonicAudit:{entries:human.mnemonics.length+audit.reduce((n,c)=>n+c.confirmedMnemonics,0),questions:all.filter(q=>q.mnemonicMode).length,preservesOriginalCourses:true}};
 // Start with the existing un-unified template. All public modes/navigation are added by unified-build afterwards.
 let html=read('dist/pathology.html'),start=html.indexOf('const SOURCE='),end=html.indexOf('const KEY=');
 const meta=chapters.map(c=>({...c,groups:c.groups.map(g=>g.id),questionIds:c.groups.flatMap(g=>g.questions.map(q=>q.id)),questionCount:c.groups.reduce((n,g)=>n+g.questions.length,0)}));
 const data=chapters.flatMap(c=>c.groups.map(g=>({id:g.id,name:g.name,chapter:c.id,module:g.module,subtitle:c.name,options:g.options.map(o=>[o.id,o.text]),questions:g.questions.map(q=>[q.id,q.stem,q.answer,q.explanation,q.page,q.difficulty,q.sourceRef])})));
 const source={title:bank.source,totalPages:bank.sourcePages,scannedPages:9,chapterCount:chapters.length,qualityRevision:REVISION,changedQuestionIds:[],qualityChangeSets:{},edition:bank.edition,diagramCount:Object.keys(figures).length,priorityAudit:bank.priorityAudit};
 const refs=Object.fromEntries(all.filter(q=>q.references?.length).map(q=>[q.id,q.references]));
 html=html.slice(0,start)+`const SOURCE=${safe(source)};\nconst CHAPTERS=${safe(meta)};\nconst DATA=${safe(data)};\nconst ECG_MEDIA=${safe(media)};\nconst ECG_QUESTIONS=${safe(figures)};\nconst PATHOLOGY_REFERENCES=${safe(refs)};\nconst HUMANITIES_PROVENANCE=${safe(provenance)};\n`+html.slice(end);
 html=html.replace("const KEY='xuecheng-pathology-drag-v1';","const KEY='xuecheng-humanities-drag-v1';");
 html=html.replace(/<title>[^<]+<\/title>/,'<title>人文与口诀 · 字词解码专项 | 学成</title>').replace(/<meta name="description" content="[^"]+">/,'<meta name="description" content="人文知识与讲义口诀专项：医德、沟通、权利义务、临床研究，以及口诀字词对应的疾病、药物、物质和分类。">');
 html=html.replace(/<strong>26<\/strong><span>个讲义章节<\/span>/,`<strong>${chapters.length}</strong><span>个练习章节</span>`).replace(/病理读图 · \d+题/g,'口诀字词解码').replace('id="ecg-practice-btn"','id="ecg-practice-btn" hidden').replace(/全文已核读[^<]+页/,'人文 9 / 9 页已核读；口诀按已核定字词出题');
 html=html.replace(/依据《27 天天病理讲义合集》[^<]+/, '人文知识与讲义口诀分区练习 · 每题注明原科与PDF页码 · 口诀答后显示 · 仅供复习，不替代诊疗或法律意见');
 html=html.replaceAll('病理学习记录','人文与口诀学习记录').replaceAll('本题病理图','本题图').replaceAll('放大病理图','放大本题图').replaceAll('放大本题病理图','放大本题图').replaceAll('病理图 · 放大判读','题目图 · 放大判读').replaceAll('非真实组织切片','非真实临床原片');
 html=html.replace("startNotebookPractice(Object.keys(ECG_QUESTIONS),'病理形态与结构读图')","startNotebookPractice(Object.keys(ECG_QUESTIONS),'口诀关联读图')").replace('完整病理诊断。','完整临床诊断。');
 const ca=html.indexOf('function showCoverage(){'),cb=html.indexOf('function records(){',ca);assert(ca>=0&&cb>ca);
 html=html.slice(0,ca)+`function showCoverage(){openDialog('人文与口诀 · 来源与范围','<p>口诀部分直接考字词展开，不再搬入原科知识题；例如李维嘉的李、维、嘉分别解码。</p><p>只展示已核定拆法的条目，未完成字词核定的口诀明列待整理；不沿用旧版974条关联口诀已全拆的说法。</p><p>旧版专项作答可在通用错题本的旧题归档查看。原五科及人文知识题记录保留。</p>');}\n`+html.slice(cb);
 return{bank,html,provenance};
}
module.exports={prepareHumanities};
