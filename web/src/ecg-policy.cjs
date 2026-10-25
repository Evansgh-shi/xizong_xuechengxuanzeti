const revision='2026-10-22-ecg-reading-v3';
const items={};
function q(id,image,stem,review){items[id]={image,stem,review};}
const a='cardio-arrhythmia-';
for(const [n,img,word,review] of [
  [1,'E002','标记A覆盖的波形','A为P波，代表心房除极。'],
  [2,'E003','标记A覆盖的波群','A为QRS波群，代表心室除极。'],
  [3,'E004','标记A覆盖的线段','A为QRS终点至T波起点之间的ST段，对应平台期相关的缓慢复极。'],
  [4,'E005','标记A覆盖的波形','A为T波，代表心室快速复极。'],
  [5,'E006','标记A所示间期','A从P波起点至QRS起点，为PR间期。图中取0.16s。'],
  [6,'E007','标记A所示间期','A从QRS起点至T波终点，为QT间期，图中取0.40s；QT需结合心率解释。']
])q(a+'g1-q'+n,img,'读图：'+word+'，在讲义中对应哪一电生理过程或起止含义？',review);
q(a+'g1-q7','E008','按图示纸速，横向一个小网格代表多长时间？','纸速25mm/s，1mm小格为1/25s，即0.04s。图像缩放后应按网格而非屏幕毫米测量。');
q(a+'g1-q8','E008','按图示增益，纵向一个小网格代表多大电压？','增益10mm/mV，1mm小格为0.1mV。左侧方波高10小格，代表1mV。');
q(a+'g1-q9','E009','量取图中A所示间期，它落在哪一个正常PR参考范围内？','P起点至QRS起点为4小格，即0.16s，落在讲义的0.12–0.20s范围。');
for(const [n,img,review] of [
  [1,'E010','可辨认的窦性P波逐一领先于窄QRS，RR约0.50s，心率约120次/分。'],
  [2,'E011','P与QRS一一对应，RR约1.33s，心率约45次/分。'],
  [3,'E012','暂停前后PP约0.80s，长PP为2.35s，并非正常PP的整倍数；图中暂停期P与QRS均缺失。'],
  [5,'E015','QRS窄、RR约0.333s且规则，未见清楚的逐搏窦性P波；结合突发突止病史，最符合阵发性室上速。单凭窄QRS不能细分所有折返类型。'],
  [6,'E016','下壁导联可见连续规则锯齿样心房活动，周期约0.20s，约300次/分；本图心室按约4:1传导。'],
  [7,'E017','无稳定窦性P波，基线为不规则细小心房活动，RR长短绝对不等，符合房颤。']
])q(a+'g2-q'+n,img,n===5?'患者心悸突发突止。观察图中节律，最符合哪一种心律失常？':'观察图中的P波、QRS和节律，最符合哪一种心律异常？',review);
q(a+'g2-q4','E014','同一患者长期监测反复出现图中A、B两类节律，伴头晕。按讲义应考虑哪一种综合征？','A为明显窦性心动过缓，B为快速房颤节律，反复慢快交替支持慢快综合征。两行是不同时间的节选，不能据此测量转复后停搏时长，也不能仅凭一次记录确诊。');
q(a+'g3-q1','E018','观察这张窦性节律的心电图，选出图中可辨认的全部异常特征。','P起点至QRS起点约0.10s；QRS起始上升支有缓慢预激斜坡，QRS全宽约0.15s，并有继发性ST-T改变。逐项核对，不由题干直接告知诊断。');
for(const [n,img,review] of [
  [1,'E019','在约2.5s处先出现不同于窦性P的提前P′，随后为窄QRS；提前搏动后的暂停不足完整代偿间歇，支持房早。'],
  [2,'E020','约2.7s处出现提前的窄QRS，随后可见倒置逆行P′，支持交界性早搏；P′也可在QRS前或重叠。'],
  [3,'E021','约2.65s处为提前宽QRS，前无相应P，T波与主波方向相反；相邻正常QRS从2.16s至3.76s为1.60s，即两个基础RR。'],
  [4,'E022','提前的宽QRS插在2.16s与2.96s两个正常窦性QRS之间，原有窦性周期未被替代，提示间位室早。'],
  [5,'E023','约2.65s和3.00s可见连续两个提前的宽QRS，为成对室早；不是连续三个及以上的室速。'],
  [6,'E024','同一导联两处提前宽QRS的极性和形态不同，符合多形室早的图形；单导联多形不能严格证明所有搏动来自不同解剖起源。'],
  [7,'E025','提前宽QRS起点约2.46s，叠在前一个2.16s起始心搏的T波附近，即R-on-T现象。'],
  [8,'E026','心室宽QRS约150次/分，独立的心房活动约73次/分；心室率大于心房率，存在房室分离，支持室速。图中未绘制心室夺获或融合波，不要求臆测不存在的特征。'],
  [9,'E027','发作前两搏QT约0.64s、RR约1s，随后出现快速多形宽QRS，主波极性和振幅围绕基线周期变化，符合尖端扭转型室速的教学图形。'],
  [10,'E028','再灌注背景下，较缓慢的宽QRS节律渐快后再减慢，符合加速性室性自主心律；不能仅凭宽QRS就认作快速室速。'],
  [12,'E026','图中宽QRS的心室频率高于独立心房活动，符合室速的房室分离；与三度房室阻滞时心房率大于心室率相反。'],
  [13,'E032','独立P波约83次/分，心室逸搏约44次/分，P与QRS无恒定关系，提示完全性房室传导阻滞。']
])q(a+'g4-q'+n,img,n===10?'患者心梗再灌注期间出现图中节律。结合背景，这最符合哪一种心律？':n===8?'有心梗病史的患者出现图中节律。结合QRS和房室关系，最支持哪一种心律？':'观察图中的提前搏动或房室关系，最符合哪一种类型？',review);
for(const [n,img,review] of [
  [1,'E029','各P后均有QRS，PR恒为0.28s（7小格），超过0.20s且无漏搏，为一度房室阻滞。'],
  [2,'E030','PP恒为0.86s；连续下传PR为0.16、0.24、0.28s，随后P波不下传，下一组PR重新缩短，为二度Ⅰ型。'],
  [3,'E031','下传搏动PR保持0.16s，可见连续下传后一次P波无QRS；没有PR进行性延长，为二度Ⅱ型。不要把单纯2:1传导强行分为Ⅰ型或Ⅱ型。'],
  [4,'E032','P波与QRS各自规律而无固定对应，心房率约83、心室率约44次/分，为三度房室阻滞。'],
  [7,'E033','正常PP约0.80s，暂停前后长PP为1.60s，是正常PP的两倍，且P与QRS一同缺失，符合二度Ⅱ型窦房阻滞。'],
  [8,'E034','组内PP依次1.05、0.95、0.85s，随后长PP为1.65s，小于相邻两个短PP之和，符合二度Ⅰ型窦房阻滞。'],
  [9,'E035','QRS约0.15s；V1呈rsR′，V6有宽终末S。结合对应导联判定右束支阻滞，不只看某处是否有M形。'],
  [10,'E036','QRS约0.15s；V1为QS样，V6为宽大有切迹的R，并有不一致的ST-T，提示左束支阻滞。'],
  [11,'E037','Ⅱ导联P波高约0.32mV、宽约0.08s，符合肺型P波的高尖特点，提示右房增大。'],
  [12,'E038','Ⅱ导联P波宽约0.16s且双峰，符合二尖瓣型P波，提示左房增大；心房结构需影像等检查确认。']
])q(a+'g7-q'+n,img,n>=11?'量取图中P波并观察形态，按讲义提示哪一心腔增大？':n>=9?'比较图中所示胸导联的QRS形态，最符合哪一种传导状态？':'观察P与QRS的关系及相邻间期，最符合哪一种传导异常？',review);
for(const [n,img,context,review] of [
  [1,'E039','','I主QRS向下、aVF向上，提示右偏；V1高R、V5深S，与讲义右室增大的电图配对。'],
  [2,'E040','男性。','RV5约2.4mV、SV1约1.8mV，总和约4.2mV，结合左偏图形，达到讲义男性电压界值。'],
  [3,'E041','女性。','RV5约2.0mV、SV1约1.8mV，总和约3.8mV，达到讲义女性电压界值。'],
  [4,'E037','','高尖P波约0.32mV，提示右房增大。'],
  [5,'E038','','P宽约0.16s且双峰，提示左房增大。']
])q(a+'g9-q'+n,img,context+'根据所示导联的波形与电压，按讲义最提示哪一心腔增大？',review+' 心电图提示并不等于结构性增大的确诊。');
q('resp-pah-02-q5','E039','仅观察所示肢体导联，图中的QRS心电轴属于哪一种改变？','I导联主波向下、aVF向上，属于右偏象限；按讲义选择电轴右偏≥＋90°。本图不要求估算精确角度。');
q('resp-pah-02-q6','E039','观察V1、V5，哪一项R/S关系与本图相符？','V1为高R，R/S≥1；V5为深S，R/S≤1，符合讲义右室肥厚的配对。');
q('resp-pah-02-q7','E037','观察Ⅱ导联P波，哪一种描述符合本图？','P波高约0.32mV，超过讲义0.25mV界值，呈高尖肺型P波。');
q('endo-aldosterone-01-q9','E042','原醛患者出现图中电图。观察T波、其后的波形及提前搏动，哪一组表现符合本图？','多数心搏T波较低、其后U波突出，另见一次提前宽QRS。结合原醛背景，符合讲义低钾的典型电图组；不能仅凭模拟图确定真实患者的血钾。');
const localizations=[['E043','Ⅱ、Ⅲ、aVF','下壁'],['E044','V1–V3','前间壁'],['E045','V3–V5','局限前壁'],['E046','I、aVL、V5–V6','前侧壁'],['E047','I、aVL','高侧壁'],['E048','V1–V6','广泛前壁']];
localizations.forEach(([img,leads,area],i)=>q('cardio-coronary-g6-q'+(i+6),img,'急性持续胸痛患者的教学电图如下。先找出ST抬高的导联，再按本讲义配伍受累区域。','本图ST抬高集中在'+leads+'，按讲义第344页的分区配为'+area+'。图为同一时窗的导联节选；真实心梗判断还需症状、动态电图及标志物。分区沿用本讲义，不将简化定位表当作唯一临床标准。'));
q('cardio-coronary-g8-q8','E049','急性持续胸痛患者加做图中后壁导联。按主要ST抬高导联，应配伍哪个区域？','图中V7、V8、V9有ST抬高，按讲义配伍正后壁。这里只考导联定位，不凭单一示意图确诊心梗。');
q('cardio-coronary-g6-q4','E050','已知患者发生STEMI。图中的T波形态按本讲义最对应哪一时相？','图中为高耸且上升、下降支不对称的T波，按讲义对应发病数小时内的超急性期。实际时相不能单凭T波外观精确推定。');
q('cardio-coronary-g6-q5','E051','已知患者发生STEMI，随访电图ST已回到基线并呈图示T波改变。按本讲义配伍哪一阶段？','本图ST回到基线、T倒置，按讲义的时相表配伍亚急性期。题目给出随访背景，不要求从单图推定实际病程。');
q('cardio-coronary-g8-q5','E050','观察这张STEMI教学电图，T波的形态属于本组选项中的哪一项？','T波高耸、宽基底，两个支不对称；此题直接辨形，不由题干提供波形答案。');
q('cardio-coronary-g8-q6','E052','观察这张STEMI教学电图，选出图中能够辨认的全部ST/QRS异常。','可见弓背向上的ST抬高及起始较宽、较深的Q波；应同时选择ST改变与病理Q波。');
q('cardio-coronary-g8-q7','E051','观察随访教学电图，T波的形态对应哪一种描述？','本图T波向下，两个支近似对称，呈V形倒置；不以此单独判定真实患者的病程。');
q('cardio-pericardium-g2-q7','E053','患者胸痛随呼吸、体位变化。结合下图ST改变的分布，按讲义首先支持哪一种诊断？','ST抬高分布广泛，而非局限于单一冠脉供血区；结合题中胸痛背景，按讲义支持急性心包炎。ST形态本身不能排除所有其他病因，实际患者须综合诊断。');
q('cardio-valves-g2-q6','E038','观察图示P波并量取宽度。按讲义，这种形态提示哪一心腔扩大？','P波约0.16s且双峰，为二尖瓣型P波，提示左心房扩大；不凭P波名称直接推定二尖瓣病变的病因。');
q('cardio-arrhythmia-g8-q12','E054','考试情境：患者无反应且无脉搏，监护持续呈图示节律。按讲义应配伍哪一种电治疗？','图中为无组织、无可识别QRS的室颤教学波形；结合无脉搏情境，按讲义配伍非同步电除颤，而非等待R波同步。这里只考讲义配伍；真实抢救须按现场急救规范与设备操作。');

function applyEcgPolicy(bank){
  // Must be repeatable when a generated bank is built or re-imported.
  function move(origin,key,name,numbers,optionIds,additions=[]){
    const id=origin+'-ecg-'+key;if(bank.chapters.some(c=>c.groups.some(g=>g.id===id)))return;
    const c=bank.chapters.find(c=>c.groups.some(g=>g.id===origin));if(!c)throw Error('Missing ECG origin '+origin);
    const g=c.groups.find(g=>g.id===origin),ids=numbers.map(n=>origin+'-q'+n),questions=ids.map(id=>{const q=g.questions.find(q=>q.id===id);if(!q)throw Error('Missing ECG question '+id);return q;});
    const options=optionIds.map(id=>{const o=g.options.find(o=>o.id===id);if(!o)throw Error('Missing ECG option '+origin+'/'+id);return {...o};});
    additions.forEach((text,i)=>options.push({id:'ecg-d'+(i+1),text}));
    if(options.length<4||questions.some(q=>q.answer.some(id=>!options.some(o=>o.id===id))))throw Error('Invalid ECG comparison pool '+id);
    g.questions=g.questions.filter(q=>!ids.includes(q.id));c.groups.splice(c.groups.indexOf(g)+1,0,{id,name,options,questions});
    if(!c.coverage.mappedTopics.includes(name))c.coverage.mappedTopics.push(name);
  }
  move(a+'g1','time','读图：时间小格',[7],['o7'],['0.02s','0.08s','0.20s']);
  move(a+'g1','voltage','读图：电压小格',[8],['o8'],['0.05mV','0.2mV','0.5mV']);
  move(a+'g1','pr','读图：PR间期测量',[9],['o9'],['0.04–0.08s','0.20–0.28s','0.28–0.36s']);
  move(a+'g2','rhythms','读图：窦性、室上性与房性心律',[1,2,3,4,5,6,7],['o1','o2','o3','o4','o5','o6','o7']);
  move(a+'g3','features','读图：PR、QRS起始与ST-T',[1],['o1','o2','o3','o4','quality-d1','quality-d2','quality-d3']);
  move(a+'g4','premature','读图：早搏及其形式',[1,2,3,4,5,6,7],['o1','o2','o3','o4','o5','o6','o7']);
  move(a+'g4','ventricular','读图：室性节律与房室分离',[8,9,10,12,13],['o8','o9','o10','o12']);
  move(a+'g7','av','读图：四类房室传导阻滞',[1,2,3,4],['o1','o2','o3','o4']);
  move(a+'g7','sa','读图：窦房传导与停搏鉴别',[7,8],['o5','o6','o4'],['窦性停搏']);
  move(a+'g7','bundle','读图：室内传导形态',[9,10],['o7','o8'],['正常室内传导','心室预激图形']);
  move(a+'g7','atria','读图：P波与心腔增大',[11,12],['o9','o10'],['右心室','左心室']);
  move('resp-pah-02','axis','读图：QRS电轴',[5],['resp-pah-02-o5'],['电轴正常（－30°至＋90°）','电轴左偏（－30°至－90°）','电轴极度偏移（－90°至±180°）']);
  move('resp-pah-02','rs','读图：V1与V5的R/S',[6],['resp-pah-02-o6'],['V₁ R/S≤1、V₅ R/S≥1','V₁ R/S≥1、V₅ R/S≥1','V₁ R/S≤1、V₅ R/S≤1']);
  move('resp-pah-02','p','读图：P波形态',[7],['resp-pah-02-o7'],['P波增宽＞0.12s、双峰','P波低平、宽度＜0.12s','P波倒置、宽度＜0.12s']);
  move('endo-aldosterone-01','tu','读图：T/U波及节律',[9],['o9'],['T波高尖、U波不明显、心律失常','T波降低、U波不明显、心律失常','T波高尖、高U波、心律失常']);
  move('cardio-coronary-g6','phase','读图：心梗变化与讲义时相',[4,5],['o4','o5'],['急性期','慢性期']);
  move('cardio-coronary-g6','territory','读图：心梗导联定位',[6,7,8,9,10,11],['o6','o7','o8','o9','o10','o11']);
  move('cardio-coronary-g8','waves','读图：心梗ST、Q与T波',[5,6,7],['o5','o6','o7','o8'],['ST段压低','无病理Q波']);
  move('cardio-coronary-g8','posterior','读图：后壁附加导联',[8],['o9'],['下壁','前间壁','高侧壁']);
  move('cardio-pericardium-g2','st','读图：广泛ST改变鉴别',[7],['o9'],['ST段抬高型心肌梗死','稳定型心绞痛','非ST段抬高型心肌梗死']);
  move('cardio-valves-g2','p','读图：P波与心腔扩大',[6],['o9','quality-d4','quality-d5','quality-d6']);
  move('cardio-arrhythmia-g8','electrical','读图：监护节律与电治疗',[12],['o17','o18','o19'],['临时起搏器']);
  const found=new Set();
  for(const c of bank.chapters){
    for(const g of c.groups)for(const question of g.questions){const entry=items[question.id];if(!entry)continue;
      if(!question.ecg)question.ecg={originalStem:question.stem};
      Object.assign(question.ecg,{imageId:entry.image,review:entry.review});question.stem=entry.stem;question.knowledgePoint=entry.stem;question.difficulty='contrast';
      found.add(question.id);
    }
    const empty=c.groups.filter(g=>!g.questions.length).map(g=>g.name);c.groups=c.groups.filter(g=>g.questions.length);c.coverage.mappedTopics=c.coverage.mappedTopics.filter(t=>!empty.includes(t));
  }
  if(found.size!==Object.keys(items).length)throw Error('Some ECG source questions were not converted');
  const changed=[...found].sort();
  bank.ecgAudit={revision,convertedQuestionIds:changed,imageIds:[...new Set(Object.values(items).map(x=>x.image))].sort(),provenance:'原创参数化SVG教学模拟图，非患者记录；依据原讲义逐项绘制，参照SBC心电图报告指南及MSD房室阻滞资料核对。',references:['https://pmc.ncbi.nlm.nih.gov/articles/PMC5137383/','https://www.msdmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/atrioventricular-block']};
  bank.qualityAudit={...bank.qualityAudit,revision,changedQuestionIds:[...new Set([...bank.qualityAudit.changedQuestionIds,...changed])].sort()};
  return bank;
}
module.exports={applyEcgPolicy,items,revision};
