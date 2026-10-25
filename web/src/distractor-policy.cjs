// Reviewed against the 2,442-question source bank on 2026-10-22.
// Removal is preferable to fabricating unsupported medical negatives. Additions below
// either swap an explicitly stated mapping or reuse a clearly different table category.
const revision='2026-10-22-distractors-v1';
const removedIds=new Set([
  'resp-copd-06-q1','resp-pah-03-q1','resp-pah-03-q8','resp-pe-01-q6',
  'resp-bronchiectasis-02-q4','resp-bronchiectasis-03-q2','resp-bronchiectasis-04-q1',
  'resp-pneumonia-04-q1','resp-tb-03-q1','resp-tb-03-q3','resp-tb-06-q6',
  'resp-ards-01-q1','resp-failure-02-q8','resp-failure-03-q1','resp-pleura-01-q5',
  'resp-tb-02-q11','resp-tb-05-q1','resp-lung-cancer-03-q12',
  'digest-gerd-01-q4','digest-gerd-02-q1','digest-gerd-05-q1','digest-gastritis-04-q5',
  'digest-tb-03-q5','digest-ibd-03-q3','digest-ibs-01-q2','digest-ibs-01-q5',
  'digest-he-01-q3','digest-hcc-03-q6','digest-cirrhosis-03-q1','digest-cirrhosis-07-q3',
  'digest-pancreatitis-03-q5','digest-pancreatitis-06-q7','renal-uti-05-q1',
  'renal-failure-06-q4','renal-failure-06-q5','renal-glomerular-03-q9',
  'blood-ida-02-q1','blood-ida-06-q7','blood-aa-02-q1','blood-aa-02-q3','blood-aa-02-q4',
  'supp-blood-hemolysis-01-q1','blood-bleeding-06-q1','blood-mds-04-q1',
  'blood-ida-07-q8','blood-ida-07-q9','blood-ida-07-q10','blood-bleeding-04-q4',
  'endo-graves-02-q1','endo-graves-05-q4','endo-graves-05-q5','endo-graves-05-q6','endo-graves-05-q7',
  'endo-diabetes-04-q6','supp-endo-diabetes-01-q1',
  'endo-pheochromocytoma-02-q1','endo-overview-02-q1','rheum-sle-02-q3',
  'endo-diabetes-07-q8','endo-diabetes-10-q11','endo-pheochromocytoma-01-q3',
  'endo-pheochromocytoma-01-q9','rheum-ra-02-q5','rheum-ra-02-q6','rheum-ra-02-q7',
  'rheum-ra-02-q8','rheum-ra-02-q9',
  'rheum-sjogren-01-q1','rheum-sjogren-01-q2','rheum-sjogren-01-q3',
  'rheum-sjogren-01-q4','rheum-sjogren-01-q5','rheum-sjogren-01-q6',
  'rheum-sjogren-01-q8','rheum-sjogren-01-q9','rheum-vasculitis-03-q2',
  'rheum-vasculitis-03-q3','rheum-vasculitis-03-q4','rheum-vasculitis-03-q8','rheum-vasculitis-03-q9',
  'o04','tox-additional-q1','tox-opioid-q1','tox-opioid-q2',
  'cardio-myocardium-g2-q8','cardio-myocardium-g2-q9','cardio-myocardium-g4-q4',
  'cardio-pericardium-g1-q8','cardio-pericardium-g2-q6',
  'cardio-endocarditis-g3-q5','cardio-endocarditis-g3-q6',
  'cardio-diagnostics-g4-q3','cardio-diagnostics-g4-q5','cardio-diagnostics-g6-q6',
  'cardio-valves-g2-q5','cardio-valves-g4-q7','cardio-coronary-g5-q9',
  'cardio-coronary-g7-q5','cardio-coronary-g7-q8'
]);
// Stable option IDs preserve the source answer mapping. Only the cueing text changes.
const relabel={
  'resp-bronchiectasis-01':{'resp-bronchiectasis-01-o10':'通常无咯血和杵状指','resp-bronchiectasis-01-o11':'常长期低热'},
  'resp-pe-04':{'resp-pe-04-o1':'抗凝至少3个月','resp-pe-04-o2':'延长抗凝','resp-pe-04-o3':'长期甚至终身抗凝'},
  'resp-lung-cancer-03':{'resp-lung-cancer-03-o8':'手术切除'},
  'blood-ida-07':{o1:'Hb＜120g/L',o2:'Hb＜110g/L',o3:'Hb＜100g/L',o4:'轻度',o5:'中度',o6:'重度',o7:'极重度'},
  'blood-bleeding-04':{o5:'BT正常、APTT延长、PT正常',o6:'BT及APTT延长、PT正常'},
  'blood-mds-01':{o1:'骨髓原始细胞≥30%',o2:'骨髓原始细胞≥20%'},
  'supp-blood-mm-02':{o7:'IgG＜50、IgA＜30、本周蛋白＜4',o8:'IgG＞70、IgA＞50、本周蛋白＞12'},
  'blood-leukemia-01':{o1:'AML M0',o2:'AML M1',o3:'AML M2',o4:'AML M3/APL',o5:'AML M4',o6:'AML M5',o7:'AML M6',o8:'AML M7',o11:'ALL L3'},
  'endo-diabetes-10':{o1:'G1',o2:'G2',o3:'G3a',o4:'G3b',o5:'G4',o6:'G5',o7:'A1',o8:'A2',o9:'A3'},
  'rheum-ra-02':{o1:'Ⅰ期',o2:'Ⅱ期',o3:'Ⅲ期',o4:'Ⅳ期'},
  'rheum-sjogren-01':{o7:'抗SSA/Ro、抗SSB/La'}
};
// These two edema terms name the same correct alternative. Do not grade one as wrong.
const aliases={'cardio-valves-g2':{o11:'o3'}};
const additions={
  'resp-pe-04':['发病≤7天','发病≤28天','发病≤48小时','消化道出血','血尿','皮肤黏膜出血','普通肝素、低分子肝素','华法林、利伐沙班','阿司匹林、氯吡格雷'],
  'resp-tb-02':['Ⅰ型超敏反应','Ⅱ型超敏反应','Ⅲ型超敏反应','感染后1～2周','感染后2～3周','感染后6～8周'],
  'resp-tb-05':['2HRZ/4HR','2HRZE/4HRE','4HRZE/2HR','仅异烟肼耐药','仅利福平耐药','异烟肼与吡嗪酰胺耐药','先做痰涂片抗酸染色','先做胸部X线复查','先做PPD皮试'],
  'resp-bronchiectasis-01':['支扩：厚壁空洞、痰分3层','慢性肺脓肿：薄壁囊腔、痰分4层'],
  'resp-pneumonia-04':['心率＞100次/分','体温＞38.5℃'],
  'resp-pleura-02':['胸水/血清蛋白＞0.6','胸水/血清LDH＞0.5','胸水LDH＞血清LDH正常上限的1/3'],
  'endo-graves-05':['甲巯咪唑','放射性碘¹³¹I'],
  'endo-pheochromocytoma-01':['肾上腺皮质','垂体前叶','甲状腺滤泡','肾上腺素','多巴胺'],
  'rheum-sle-02':['抗dsDNA抗体','抗Sm抗体','抗SSA/Ro抗体'],
  'supp-blood-mm-02':['IgG＜70、IgA＜50、本周蛋白＜12','IgG＞50、IgA＞30、本周蛋白＞4'],
  'rheum-ra-04':['ANA阳性','抗dsDNA抗体阳性'],
  'rheum-sjogren-01':['抗dsDNA、抗Sm','抗CCP、类风湿因子','抗Scl-70、抗着丝点抗体'],
  'tox-mechanism':['肾脏','心脏','脾脏','敌百虫','对硫磷'],
  'tox-additional':['依地酸钙钠','去铁胺','氟马西尼'],
  'cardio-myocardium-g4':['经皮球囊二尖瓣成形术','经导管主动脉瓣置换术TAVR'],
  'cardio-endocarditis-g1':['三尖瓣','肺动脉瓣','房间隔缺损','左心室肥厚','肺动脉瓣关闭不全'],
  'cardio-endocarditis-g3':['主动脉瓣主动脉侧','室缺左心室侧'],
  'cardio-hypertension-g6':['ACEI约6–8周','ARB约3–4周','早期血管舒张','后期排钠排水'],
  'cardio-valves-g2':['S₁恒定增强','S₄仍存在','舒张晚期杂音增强','右心房','左心室','右心室','肺动脉','肺静脉','主动脉','咯血','心悸','胸痛'],
  'cardio-coronary-g1':['内皮细胞','中性粒细胞','淋巴细胞'],
  'cardio-coronary-g7':['2小时内ST段回降仅10%','CK-MB峰延迟至发病24小时以后','胸痛持续2小时无缓解'],
  'cardio-heart-failure-g4':['正性肌力药'],
  'cardio-heart-failure-g5':['高钾','高镁','低钙'],
  'cardio-arrhythmia-g3':['PR＞0.20s','QRS波群窄且无δ波','P波消失、出现f波'],
  'cardio-arrhythmia-g5':['心律绝对规则','S₁强弱一致','可闻及稳定S₄'],
  'cardio-arrhythmia-g8':['出血性膀胱炎','牙龈增生'],
  'cardio-arrest-g1':['慢性缩窄性心包炎','风湿性二尖瓣狭窄'],
  'cardio-arrest-g3':['窦性心动过速','持续性房颤']
};
const rewriteQuestions={
  'resp-pleura-02-q5':{stem:'Light标准规定的三个渗出液判定界值有哪些？（选全标准中的准确界值）',explanation:'Light标准：胸水/血清蛋白＞0.5、胸水/血清LDH＞0.6、胸水LDH＞血清LDH正常上限的2/3。这里考标准规定的界值，不能交换0.5与0.6，也不能把2/3改为1/3。'},
  'blood-leukemia-01-q11':{stem:'原始及幼淋巴为大细胞、胞质明显空泡的ALL是哪型？'},
  'cardio-hypertension-g6-q4':{explanation:'本讲义对应为ACEI约3–4周、ARB约6–8周。干扰项把两个时间互换；须分别记住对应关系，而非把所有带周数的选项全选。'},
  'cardio-hypertension-g6-q5':{explanation:'利尿剂早期通过排钠排水降压，后期主要通过血管舒张降压。将早期与后期机制颠倒的选项不选。'},
  'cardio-valves-g2-q9':{explanation:'合并房颤后，S₁强弱不等；无有效心房收缩，S₄及舒张晚期杂音可消失。恒定增强、S₄仍存在或舒张晚期杂音增强是错误配对。'}
};
const note='已按区分度要求删除仅凭选项类型即可判断的练习；部分知识未再单独设题，当前题量不等于全部知识点逐项覆盖。';
function applyDistractorPolicy(bank){
  const changed=new Set();
  for(const c of bank.chapters){
    const hadRemoved=c.groups.some(g=>g.questions.some(q=>removedIds.has(q.id)));
    for(const g of c.groups){
      g.questions=g.questions.filter(q=>!removedIds.has(q.id));
      if(aliases[g.id]){
        for(const q of g.questions)q.answer=[...new Set(q.answer.map(id=>aliases[g.id][id]||id))];
        g.options=g.options.filter(o=>!aliases[g.id][o.id]);
        g.questions.forEach(q=>changed.add(q.id));
      }
      if(relabel[g.id]||additions[g.id]){
        g.questions.forEach(q=>changed.add(q.id));
        for(const o of g.options)if(relabel[g.id]?.[o.id]){if(!o.sourceText)o.sourceText=o.text;o.text=relabel[g.id][o.id];}
        (additions[g.id]||[]).forEach((text,i)=>{const id='quality-d'+(i+1);if(!g.options.some(o=>o.id===id))g.options.push({id,text});});
      }
      for(const q of g.questions){
        if(rewriteQuestions[q.id]){Object.assign(q,rewriteQuestions[q.id]);q.knowledgePoint=q.stem.replace(/[？?]$/,'');changed.add(q.id);}
        const evidence=q.answer.map(id=>g.options.find(o=>o.id===id)?.sourceText).filter(Boolean);
        if(evidence.length&&!q.explanation.includes('原讲义对应：'))q.explanation+=' 原讲义对应：'+evidence.join('；')+'。';
        if(!q.answer.length||q.answer.length>=g.options.length)throw Error('Question without any negative alternative: '+q.id);
        if(!q.answer.every(id=>g.options.some(o=>o.id===id)))throw Error('Unresolved answer '+q.id);
      }
    }
    const emptyNames=c.groups.filter(g=>!g.questions.length).map(g=>g.name);
    c.groups=c.groups.filter(g=>g.questions.length);
    c.coverage.mappedTopics=c.coverage.mappedTopics.filter(t=>!emptyNames.includes(t));
    if(hadRemoved&&!c.coverage.excluded.includes(note))c.coverage.excluded.push(note);
    if(!c.groups.length)throw Error('Content review removed entire chapter: '+c.id);
  }
  bank.qualityAudit={revision,removedQuestionIds:[...removedIds],changedQuestionIds:[...changed].sort(),reviewedMultipleChoiceQuestions:261};
  return bank;
}
module.exports={applyDistractorPolicy,revision,removedIds,relabel,additions};
