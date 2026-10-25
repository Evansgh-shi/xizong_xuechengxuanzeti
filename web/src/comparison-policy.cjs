// Source-bound comparison drills: keep the original answers and source references.
// Counterfactual rows only exchange fields explicitly given in those answers.
// Never pad a matching pool with an unrelated test, treatment, or organ name.
const revision='2026-10-22-homogeneous-comparisons-v2';
const specs=[];
function spec(group,key,name,questions,fields,wrong,tip){
  specs.push({group,key,name,questions:questions.map(n=>typeof n==='number'?group+'-q'+n:n),fields,wrong,tip});
}
spec('resp-pleura-04','ada','胸水：ADA × 细胞分类',[5],['ADA','细胞为主'],[
  'ADA＞45 U/L、以中性粒细胞为主','ADA＜45 U/L、以淋巴细胞为主','ADA＜45 U/L、以中性粒细胞为主'
],'必须同时核对ADA方向和优势细胞，不能只看是否出现ADA。');
spec('resp-pleura-04','cea','胸水：CEA数值 × 胸水/血清比值',[6],['CEA','胸水/血清CEA'],[
  'CEA＜10 μg/L或胸水/血清CEA＞1','CEA＞10 μg/L或胸水/血清CEA＜1','CEA＜10 μg/L或胸水/血清CEA＜1'
],'本题考讲义规定的支持性指标，不把单一肿瘤标志物等同于确诊。');
spec('resp-pleura-04','pus','脓胸：细胞 × WBC × pH',[7],['细胞为主','WBC','pH'],[
  '淋巴细胞为主，WBC可＞10×10⁹/L、pH可＜7','中性粒细胞为主，WBC可＞10×10⁹/L、pH可＞7','淋巴细胞为主，WBC可＞10×10⁹/L、pH可＞7'
],'三个字段在每个选项中均出现；细胞分类与pH方向必须同时符合讲义。');
spec('resp-pleura-02','protein','渗出/漏出：蛋白 × 李凡他 × 比重',[6,7],['蛋白','李凡他','比重'],[
  '蛋白＞30g/L、李凡他阴性、比重＞1.018','蛋白＜30g/L、李凡他阳性、比重＜1.018'
],'三项须成套对应，不能把渗出液与漏出液的字段交叉拼接。');
spec('resp-pleura-02','pressure','漏出机制：静水压 × 胶体渗透压',[4],['静水压','血浆胶体渗透压'],[
  '静水压降低或血浆胶体渗透压降低','静水压升高或血浆胶体渗透压升高','静水压降低或血浆胶体渗透压升高'
],'比较两个压力的方向；讲义列静水压升高或血浆胶体渗透压降低。');
spec('resp-copd-08','flow','肺功能：相同三项流速指标',[3],['FEV₁','MMFR','PEF'],[
  'FEV₁升高、MMFR下降、PEF下降','FEV₁下降、MMFR升高、PEF下降','FEV₁下降、MMFR下降、PEF升高'
],'各备选均列FEV₁、MMFR与PEF，只比较其变化方向。');
spec('resp-copd-08','volume','肺功能：相同三项肺容积',[4],['RV','TLC','FVC'],[
  'RV升高、TLC下降、FVC下降','RV下降、TLC升高、FVC下降','RV下降、TLC下降、FVC升高'
],'各备选均列RV、TLC与FVC；此处考讲义对典型限制性改变的配对。');
spec('resp-copd-08','elastic','肺气肿：弹性阻力 × 静态顺应性',[11],['肺弹性阻力','静态顺应性'],[
  '肺弹性阻力减小、静态顺应性降低','肺弹性阻力增大、静态顺应性增高','肺弹性阻力增大、静态顺应性降低'
],'肺弹性阻力与静态顺应性的变化方向相反。');
spec('resp-pleura-06','percussion','气胸：叩诊 × 语颤 × 呼吸音',[11],['音','语颤','呼吸音'],[
  '浊音、语颤与呼吸音减弱/消失','鼓音、语颤与呼吸音增强','浊音、语颤与呼吸音增强'
],'不能仅凭呼吸音减弱区分气胸与胸水；还需核对叩诊音。');
spec('resp-pleura-07','drain','气胸拔管：肺扩张 × 气液引流',[5],['肺扩张','气液排出'],[
  '肺扩张好，仍有气液排出','肺扩张差，已无气液排出','肺扩张差，仍有气液排出'
],'肺扩张和引流状态须同时符合，不能只核对其中一项。');
spec('renal-failure-02','density','AKI：尿比重 × 尿渗透压',[3,4],['尿比重','渗透压'],[
  '尿比重＞1.018、渗透压＜250','尿比重＜1.012、渗透压＞500'
],'原表肾前性AKI保留浓缩能力，ATN则受损；交叉拼接两个数值是干扰。');
spec('renal-failure-02','sodium','AKI：尿钠 × FENa',[5,6],['尿钠','FENa'],[
  '尿钠＜10mmol/L、FENa＞1%','尿钠＞20mmol/L、FENa＜1%'
],'两个数值必须同时属于同一行；不能只凭低尿钠或高FENa单独匹配。');
spec('renal-failure-01','mortality','AKI阶段：血钾 × 并发症',[7,8],['钾血症','、'],[
  '高钾血症、感染','低钾血症、水中毒'
],'讲义维持期对应高钾和水中毒，恢复期对应低钾和感染。');
spec('blood-hemolysis-02','bilirubin','溶血：UCB × 尿胆原 × 尿胆红素',[6],['UCB','尿胆原','尿胆红素'],[
  'UCB升高、尿胆原增加、尿胆红素阳性','UCB升高、尿胆原减少、尿胆红素阴性','UCB降低、尿胆原增加、尿胆红素阴性'
],'UCB、尿胆原及尿胆红素均须符合；尿胆红素阴性是重要鉴别点。');
spec('blood-bleeding-04','pathway','凝血途径：APTT × PT',[1,2,3],['APTT','PT'],[
  'APTT正常、PT正常'
],'内源性、外源性及共同途径分别比较APTT与PT，不混入BT等另一组字段。');
spec('blood-bleeding-04','bt','血友病：BT × APTT × PT',[5,6],['BT','APTT','PT'],[
  'BT正常、APTT正常、PT延长','BT延长、APTT正常、PT延长'
],'遗传性血友病与血管性血友病需比较BT；各选项均按BT、APTT、PT顺序。');
spec('blood-bleeding-01','itp','ITP：BT × CRT × 血块收缩 × 凝血',[7],['BT','CRT','血块收缩','凝血功能'],[
  'BT正常、CRT阳性、血块收缩不良但凝血功能正常','BT延长、CRT阴性、血块收缩不良但凝血功能正常','BT延长、CRT阳性、血块收缩不良但凝血功能异常'
],'四项逐一对照；不能把血小板性出血与凝血因子异常混为一组。');
spec('blood-bleeding-01','marrow','ITP：巨核细胞数量 × 产板型',[6],['巨核细胞数','产板型'],[
  '巨核细胞数正常或增加、产板型明显增加','巨核细胞数显著减少、产板型明显减少','巨核细胞数显著减少、产板型明显增加'
],'ITP强调成熟障碍，不能把产板型减少误记为巨核细胞总数减少。');
spec('blood-mm-01','rouleaux','骨髓瘤：红细胞形态 × ESR',[5],['红细胞','ESR'],[
  '缗钱状红细胞、ESR减慢','靶形红细胞、ESR增快','靶形红细胞、ESR减慢'
],'M蛋白造成缗钱状聚集并使血沉增快，两个字段须同时符合。');
spec('supp-blood-mm-02','mprotein','骨髓瘤：IgG × IgA × 本周蛋白',[3,4],['IgG','IgA','本周蛋白'],[
  'IgG＜70、IgA＜50、本周蛋白＜12','IgG＞50、IgA＞30、本周蛋白＞4'
],'比较低M蛋白和高M蛋白的完整数字组；这里保留讲义原表数值。');
spec('endo-aldosterone-01','raas','原醛：醛固酮 × 肾素 × AngⅡ',[6],['醛固酮','肾素','AngⅡ'],[
  '醛固酮升高、肾素升高、AngⅡ升高','醛固酮降低、肾素降低、AngⅡ降低','醛固酮降低、肾素升高、AngⅡ升高'
],'原醛为自主醛固酮升高，反馈使肾素和AngⅡ降低。');
spec('endo-overview-02','liddle','Liddle：肾素 × 醛固酮',[5],['肾素','醛固酮'],[
  '肾素降低、醛固酮升高','肾素升高、醛固酮降低','肾素及醛固酮均高'
],'Liddle两者均低，不能与原醛的低肾素、高醛固酮混淆。');
spec('endo-cushing-02','rhythm','库欣：尿游离皮质醇 × 昼夜节律',[7],['尿游离皮质醇','昼夜节律'],[
  '尿游离皮质醇升高与昼夜节律保留','尿游离皮质醇正常与昼夜节律消失','尿游离皮质醇正常与昼夜节律保留'
],'库欣为尿游离皮质醇升高、昼夜节律消失；单纯肥胖对应正常且有节律。');
spec('endo-graves-02','calcium','甲亢：骨质 × 血钙 × 尿钙',[7],['骨质','血钙','尿钙'],[
  '骨质疏松、血钙降低及尿钙升高','骨质疏松、血钙升高及尿钙降低','骨质增密、血钙及尿钙升高'
],'各备选均有骨质、血钙、尿钙三个字段，不再只放一条钙代谢选项。');
spec('endo-diabetes-02','glucose','糖耐量：空腹 × OGTT 2小时',[4,5],['空腹','2h'],[
  '空腹≥7且2h≥11.1','空腹＜6.1且2h＜7.8'
],'分别核对空腹与2小时区间；仅其中一个区间正确不能选。');
spec('digest-cirrhosis-02','albumin','肝硬化：白蛋白 × 白球比',[4],['白蛋白','白球比'],[
  '低白蛋白、白球比升高','高白蛋白、白球比下降或倒置','高白蛋白、白球比升高'
],'白蛋白减少与白球比下降或倒置需成套判断。');
spec('resp-asthma-01','cough','哮喘：咳嗽 × 啰音',[8],['咳','音'],[
  '干咳和湿啰音','湿咳和哮鸣音','湿咳和湿啰音'
],'各备选均为咳嗽性质与啰音类型的组合。');
// Same-length medication lists: wrong rows deliberately mix source-defined classes.
spec('resp-copd-05','expectorant','祛痰药：三种成分逐一鉴别',[12],['、','、'],[
  '氨溴索、沙丁胺醇、羧甲司坦','氨溴索、乙酰半胱氨酸、噻托溴铵','福莫特罗、乙酰半胱氨酸、羧甲司坦'
],'每项都有三种药；必须三者均属于讲义的祛痰药，不能混入支气管扩张剂。');
spec('resp-asthma-03','ics','ICS：三种成分逐一鉴别',[3],['、','、'],[
  '布地奈德、福莫特罗、倍氯米松','沙丁胺醇、氟替卡松、倍氯米松','布地奈德、氟替卡松、噻托溴铵'
],'每项均列三种药，需排除混入的β₂激动剂或抗胆碱药。');
spec('resp-asthma-03','stabilizer','肥大细胞稳定药：双药成分鉴别',[12],['、'],[
  '色甘酸钠、孟鲁司特','沙丁胺醇、酮替芬','异丙托溴铵、孟鲁司特'
],'逐一检查药物类别，不能把白三烯拮抗剂或支气管扩张剂混入。');
spec('resp-ild-02','antifibrotic','IPF抗纤维化：双药成分鉴别',[4],['、'],[
  '尼达尼布、布地奈德','沙丁胺醇、吡非尼酮','布地奈德、噻托溴铵'
],'两种成分均须为讲义对应的抗纤维化药，而非只含其中一种。');
spec('resp-lung-cancer-03','egfr','EGFR靶向：双药成分鉴别',[9],['、'],[
  '厄洛替尼、贝伐珠单抗','依托泊苷、吉非替尼','顺铂、贝伐珠单抗'
],'不能把抗血管生成药或细胞毒化疗药与EGFR靶向药混配。');
spec('resp-pe-03','antiplatelet','抗血小板机制：双药成分鉴别',[5,6,7],['、'],[
  '阿司匹林、替格瑞洛','氯吡格雷、替罗非班','阿昔单抗、吲哚布芬'
],'每项都是两个药；三类正确配对分别对应COX-1、ADP与GPⅡb/Ⅲa。混合不同类的配对不选。');
spec('resp-pe-04','thrombolytic','溶栓：三种成分逐一鉴别',[12],['、','、'],[
  'rt-PA、尿激酶、普通肝素','rt-PA、低分子肝素、链激酶','华法林、尿激酶、链激酶'
],'每项均列三种药，需排除混入的抗凝药；不能只看到尿激酶就选。');
spec('resp-bronchiectasis-03','ceph','抗铜绿头孢：三种成分鉴别',[5],['、','、'],[
  '头孢他啶、头孢呋辛、头孢吡肟','头孢他啶、头孢哌酮、头孢呋辛','头孢呋辛、头孢哌酮、头孢吡肟'
],'三种名称均为头孢；干扰项以讲义另列的头孢呋辛替换一项。');
spec('resp-bronchiectasis-03','quinolone','抗铜绿喹诺酮：双药成分鉴别',[7],['、'],[
  '环丙沙星、诺氟沙星','诺氟沙星、左氧氟沙星','诺氟沙星、莫西沙星'
],'每项都是喹诺酮药名；讲义本条明确列环丙沙星、左氧氟沙星。');
spec('resp-bronchiectasis-03','carbapenem','抗铜绿碳青霉烯：双药成分鉴别',[8],['、'],[
  '亚胺培南、厄他培南','厄他培南、美罗培南','厄他培南、头孢吡肟'
],'按本讲义完整药物配对判断；厄他培南在该条明确排除。');
spec('digest-he-04','bcaa','支链氨基酸：三种成分鉴别',[2],['、','、'],[
  '酪氨酸、异亮氨酸、亮氨酸','缬氨酸、苯丙氨酸、亮氨酸','缬氨酸、异亮氨酸、酪氨酸'
],'每项均有三种氨基酸，不能混入形成假性神经递质的芳香族氨基酸。');
spec('digest-he-01','aromatic','假性神经递质前体：双成分鉴别',[6],['、'],[
  '酪氨酸、亮氨酸','缬氨酸、苯丙氨酸','缬氨酸、异亮氨酸'
],'对照芳香族与支链氨基酸，不能仅因选项是两个氨基酸就选。');
spec('endo-diabetes-01','antibody','T1DM：三种抗体成分鉴别',[8],['、','、'],[
  'ICA、IAA、抗dsDNA抗体','ICA、抗SSA/Ro、GAD抗体','抗CCP、IAA、GAD抗体'
],'每项均由三个抗体组成；干扰项混入讲义风湿病章节的抗体。');
spec('rheum-sjogren-01','antibody','干燥综合征：双抗体成分鉴别',[7],['、'],[
  '抗SSA/Ro、抗Sm','抗dsDNA、抗SSB/La','抗CCP、类风湿因子'
],'四项均为双抗体组，需同时核对SSA与SSB，不能只核对其中一个。');

spec('resp-bronchiectasis-01','symptoms','支扩：痰量 × 咯血 × 啰音',[6],['痰','咯血','啰音'],[
  '长期咳少量脓痰、反复咯血、固定持久湿啰音','长期咳大量脓痰、通常无咯血、固定持久湿啰音','长期咳大量脓痰、反复咯血、无固定持久湿啰音'
],'每项都按同一临床三联组成，只改变一个关键表现。');
spec('resp-bronchiectasis-03','infection','支扩感染：体温 × 痰量 × 脓性成分',[1],['热','痰量','脓性成分'],[
  '不发热、痰量和脓性成分增多','发热、痰量减少和脓性成分增多','发热、痰量增多和脓性成分减少'
],'同时检查体温、痰量及脓性成分，不能只凭出现“发热”选择。');
spec('resp-tb-01','systemic','肺结核：体温 × 盗汗 × 体重',[1],['热','盗汗','体重'],[
  '午后低热、盗汗、体重增加','午后低热、无盗汗、体重减轻','无发热、盗汗、体重减轻'
],'每项都含体温、夜间出汗和体重三个字段，不能只靠选项长度判断。');
spec('resp-tb-02','inactive','结核活动性：症状 × 排菌 × 影像',[9],['症状','排菌','影像'],[
  '无症状、有排菌，且影像仅硬结/钙化/纤维化','有症状、无排菌，且影像仅硬结/钙化/纤维化','无症状、无排菌，但影像仍有渗出/空洞/播散'
],'无活动性须同时满足症状、排菌、影像条件；三项只对两项仍不选。');
spec('resp-lung-cancer-01','histology','肺癌：两种组织学类型交叉鉴别',[2,12],['癌','和'],[
  '鳞癌和腺癌','鳞癌和大细胞癌'
],'每项均由两种肺癌组织学类型组成，比较讲义的分布和转移规律。');
spec('resp-lung-cancer-02','carcinoid','类癌：肤色 × 心率 × 胃肠 × 呼吸',[13],['皮肤','心动','腹','喘息'],[
  '皮肤潮红、心动过缓、腹泻和喘息','皮肤苍白、心动过速、腹泻和喘息','皮肤潮红、心动过速、腹胀便秘和喘息'
],'四个系统表现都在每个选项中，需逐一核对而非寻找唯一一条症状串。');
spec('resp-lung-cancer-03','morphology','肺恶性征象：轮廓 × 边缘 × 空洞内壁',[5],['叶','刺','内壁'],[
  '分叶、毛刺、内壁光滑空洞','无分叶、毛刺、内壁凹凸不平空洞','分叶、无毛刺、内壁凹凸不平空洞'
],'每个备选都给出同样三项形态；干扰项只改变一项。');
spec('resp-pleura-09','border','肺下界：两种疾病交叉鉴别',[5,6],['、'],[
  'COPD、胸腔积液','肺不张、支气管哮喘'
],'每项均为两种疾病，比较下移与上移的成套配对。');
spec('digest-he-03','enema','肝性脑病：两种灌肠液成分鉴别',[6],['或','灌肠'],[
  '肥皂水或生理盐水灌肠','稀醋酸或肥皂水灌肠','肥皂水或碱性液灌肠'
],'每项均为两种液体；讲义避免碱性液，以免增加氨吸收。');
spec('digest-hcc-01','paraneoplastic','肝癌伴癌：血糖 × 红细胞',[10],['血糖','红细胞'],[
  '自发性高血糖、红细胞增多','自发性低血糖、红细胞减少','自发性高血糖、红细胞减少'
],'各项均有血糖与红细胞两个字段，分别比较升降方向。');
spec('digest-pancreatitis-06','chronic','慢性胰腺炎：腹痛 × 体重 × 血糖 × 大便',[8],['腹痛','体重','糖尿病','脂肪泻'],[
  '腹痛、体重增加、糖尿病、脂肪泻','腹痛、体重下降、糖尿病、无脂肪泻','无腹痛、体重下降、糖尿病、脂肪泻'
],'各项都含同样四个临床字段，需识别其中被更改的表现。');
spec('endo-pheochromocytoma-01','attack','嗜铬发作：头痛 × 心率 × 出汗 × 面色',[4],['头痛','心','汗','面色'],[
  '头痛、心悸、少汗及面色苍白','头痛、心悸、多汗及面色潮红','头痛、心动过缓、多汗及面色苍白'
],'选项均为四个表现；不能只因其含“头痛、心悸”就判为正确。');
spec('rheum-sle-02','aps','抗磷脂：血栓 × 妊娠 × 血小板',[2],['血栓','流产','血小板'],[
  '血栓、习惯性流产、血小板增多','无血栓、习惯性流产、血小板减少','血栓、无习惯性流产、血小板减少'
],'本题考讲义列出的临床特征组，不以单一字段替代完整配对或临床诊断。');

// These retain their original questions/answers but already have a genuinely
// comparable source pool (same disease, drug, phenotype, or treatment family).
const reviewedComparable=[
  'resp-pneumonia-03-q5','resp-pneumonia-03-q6','resp-pneumonia-03-q8',
  'resp-pneumonia-03-q9','resp-pneumonia-03-q11','blood-lymphoma-05-q4',
  'blood-lymphoma-06-q1','blood-lymphoma-06-q3','cardio-coronary-g6-q9',
  'cardio-coronary-g6-q11','resp-pneumonia-04-q3','resp-pneumonia-04-q4'
];
function applyComparisonPolicy(bank){
  const changed=new Set(bank.qualityAudit.changedQuestionIds),rows=[];
  for(const s of specs){
    const newId=s.group+'-compare-'+s.key;
    let chapter=bank.chapters.find(c=>c.groups.some(g=>g.id===newId));
    if(chapter){
      const g=chapter.groups.find(g=>g.id===newId);g.questions.forEach(q=>changed.add(q.id));
      rows.push({group:newId,questions:g.questions.map(q=>q.id),fields:s.fields,options:g.options.length});continue;
    }
    chapter=bank.chapters.find(c=>c.groups.some(g=>g.id===s.group));
    if(!chapter)throw Error('Missing source group '+s.group);
    const original=chapter.groups.find(g=>g.id===s.group);
    const questions=s.questions.map(id=>{const q=original.questions.find(q=>q.id===id);if(!q)throw Error('Missing comparison source '+id);return q;});
    if(questions.some(q=>q.answer.length!==1))throw Error('Comparison spec requires a single source answer '+newId);
    const answerIds=[...new Set(questions.flatMap(q=>q.answer))];
    const options=answerIds.map(id=>({...original.options.find(o=>o.id===id)}));
    for(const [i,text] of s.wrong.entries())if(!options.some(o=>o.text===text))options.push({id:'contrast-d'+(i+1),text});
    if(options.length<4||new Set(options.map(o=>o.text)).size!==options.length)throw Error('Insufficient comparable options '+newId);
    for(const q of questions){
      if(q.id==='resp-pleura-04-q6'){
        q.stem='按讲义，恶性胸水CEA支持指标的两个界值及“或”关系，完整表达是哪一项？';
        q.knowledgePoint=q.stem.replace(/[？?]$/,'');
      }
      q.difficulty='contrast';q.comparisonFields=[...s.fields];
      q.explanation+=' 同结构鉴别：'+s.tip;
      changed.add(q.id);
    }
    const group={id:newId,name:s.name,options,questions,comparison:{fields:s.fields,method:'source-field-exchange'}};
    original.questions=original.questions.filter(q=>!s.questions.includes(q.id));
    // Remove migrated answer rows from the unrelated original pool only if unused.
    original.options=original.options.filter(o=>!answerIds.includes(o.id)||original.questions.some(q=>q.answer.includes(o.id)));
    chapter.groups.splice(chapter.groups.indexOf(original)+1,0,group);
    if(!chapter.coverage.mappedTopics.includes(s.name))chapter.coverage.mappedTopics.push(s.name);
    rows.push({group:newId,questions:questions.map(q=>q.id),fields:s.fields,options:options.length});
  }
  for(const c of bank.chapters){
    const emptyNames=c.groups.filter(g=>!g.questions.length).map(g=>g.name);
    c.groups=c.groups.filter(g=>g.questions.length);
    c.coverage.mappedTopics=c.coverage.mappedTopics.filter(t=>!emptyNames.includes(t));
  }
  bank.qualityAudit={...bank.qualityAudit,revision,changedQuestionIds:[...changed].sort()};
  bank.comparisonAudit={revision,groups:rows,changedQuestions:rows.flatMap(r=>r.questions).length,reviewedComparable};
  return bank;
}
module.exports={applyComparisonPolicy,revision,specs};
