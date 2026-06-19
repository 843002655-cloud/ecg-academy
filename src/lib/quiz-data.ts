// src/lib/quiz-data.ts
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
}

const QUESTIONS: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════
  // 正常心电图（5 题）
  // ═══════════════════════════════════════════════════════════════
  {
    id: "ecg01",
    question: "正常窦性心律的心电图特征不包括以下哪项？",
    options: [
      "P 波在 I、II、aVF 导联直立",
      "PR 间期 120-200ms",
      "QRS 宽度 > 120ms",
      "心率 60-100 bpm"
    ],
    correct: 2,
    explanation: "正常 QRS 宽度应 < 120ms。QRS > 120ms 提示室内传导延迟、束支阻滞或室性心律。",
    category: "正常心电图"
  },
  {
    id: "ecg02",
    question: "关于正常 P 波的描述，以下哪项是正确的？",
    options: [
      "P 波在 aVR 导联应直立",
      "P 波宽度 < 120ms，肢体导联振幅 < 2.5mm",
      "P 波在 V1 导联必须是完全直立的",
      "P 波宽度 > 120ms 是正常变异"
    ],
    correct: 1,
    explanation: "正常 P 波：宽度 < 120ms（< 3 小格），肢体导联振幅 < 2.5mm。aVR 导联 P 波应倒置。P 波增宽 > 120ms 提示左房异常。",
    category: "正常心电图"
  },
  {
    id: "ecg03",
    question: "以下哪项 PR 间期值在正常范围内？",
    options: ["80ms", "160ms", "220ms", "280ms"],
    correct: 1,
    explanation: "正常 PR 间期为 120-200ms（3-5 小格）。< 120ms 可见于预激综合征；> 200ms 为 I 度房室传导阻滞。",
    category: "正常心电图"
  },
  {
    id: "ecg04",
    question: "关于心电轴，以下哪项描述是正确的？",
    options: [
      "正常心电轴范围为 -30° 至 +90°",
      "电轴左偏一定提示左前分支阻滞",
      "电轴右偏在瘦高年轻人中一定是病理性的",
      "I 和 aVF 导联 QRS 主波均向上提示电轴正常"
    ],
    correct: 0,
    explanation: "正常心电轴：-30° 至 +90°。快速目测法：I 和 aVF 导联 QRS 主波均向上 → 电轴正常。电轴左偏（< -30°）：I 向上、aVF 向下。",
    category: "正常心电图"
  },
  {
    id: "ecg05",
    question: "以下哪种情况在正常心电图中可以出现？",
    options: [
      "V1 导联呈 QS 型",
      "aVR 导联 QRS 主波向上",
      "早期复极（J 点抬高，ST 段凹面向上抬高）",
      "所有导联 T 波倒置"
    ],
    correct: 2,
    explanation: "早期复极是正常变异，常见于年轻男性，表现为 J 点抬高、ST 段凹面向上抬高（尤其在 V2-V5），T 波高耸对称。",
    category: "正常心电图"
  },

  // ═══════════════════════════════════════════════════════════════
  // 心肌缺血与心梗（12 题）
  // ═══════════════════════════════════════════════════════════════
  {
    id: "mi01",
    question: "急性 ST 段抬高型心肌梗死（STEMI）的 ST 段抬高诊断标准是？",
    options: [
      "ST 段抬高 ≥ 0.5mm",
      "ST 段在 V2-V3 导联 ≥ 2mm（男性）或 ≥ 1.5mm（女性），其他导联 ≥ 1mm",
      "任何导联 ST 段抬高 > 0.5mm",
      "T 波高耸即可诊断"
    ],
    correct: 1,
    explanation: "STEMI 诊断标准：V2-V3 导联男性 ≥ 2mm（≥ 40 岁）/ ≥ 2.5mm（< 40 岁），女性 ≥ 1.5mm；其他导联 ≥ 1mm。需在 ≥ 2 个连续导联出现。",
    category: "心肌缺血"
  },
  {
    id: "mi02",
    question: "一位胸痛患者心电图显示 V1-V4 导联 ST 段抬高，最可能的梗死部位是？",
    options: ["下壁心梗", "前间壁/前壁心梗", "侧壁心梗", "后壁心梗"],
    correct: 1,
    explanation: "V1-V4 导联 ST 段抬高 → 前降支（LAD）供血区域 → 前壁/前间壁心梗。下壁心梗看 II/III/aVF，侧壁看 I/aVL/V5-V6。",
    category: "心肌缺血"
  },
  {
    id: "mi03",
    question: "下壁心梗时，以下哪项提示合并右室梗死？",
    options: [
      "V1-V2 导联 ST 段抬高",
      "V4R 导联 ST 段抬高 ≥ 1mm",
      "V5-V6 导联 ST 段抬高",
      "aVL 导联 ST 段抬高"
    ],
    correct: 1,
    explanation: "下壁心梗患者应加做右胸导联（V3R-V6R）。V4R 导联 ST 段抬高 ≥ 1mm 高度提示右室梗死。右室梗死禁用硝酸酯类药物，需积极补液。",
    category: "心肌缺血"
  },
  {
    id: "mi04",
    question: "以下哪项提示急性下壁心梗可能合并后壁心梗？",
    options: [
      "V1-V3 导联 ST 段压低 + 高 R 波",
      "V5-V6 导联 ST 段抬高",
      "I 导联 ST 段抬高",
      "aVR 导联 ST 段抬高"
    ],
    correct: 0,
    explanation: "后壁心梗在常规 12 导联表现为 V1-V3 导联镜像改变：ST 段压低 + 高 R 波（R/S > 1）+ T 波直立。加做 V7-V9 导联可见 ST 段抬高。",
    category: "心肌缺血"
  },
  {
    id: "mi05",
    question: "心梗后 ST 段持续抬高超过 2 周，应警惕什么？",
    options: ["再梗死", "室壁瘤形成", "心包炎", "早期复极综合征"],
    correct: 1,
    explanation: "心梗后 ST 段持续抬高 > 2 周（尤其在 Q 波导联）应怀疑室壁瘤形成。超声心动图可明确诊断。",
    category: "心肌缺血"
  },
  {
    id: "mi06",
    question: "以下哪项是非 ST 段抬高心梗（NSTEMI）的心电图特征？",
    options: [
      "持续性 ST 段抬高",
      "ST 段压低 ≥ 0.5mm 或 T 波倒置，伴肌钙蛋白升高",
      "新出现的左束支阻滞",
      "全部正常"
    ],
    correct: 1,
    explanation: "NSTEMI 心电图：ST 段压低 ≥ 0.5mm 或 T 波倒置，伴肌钙蛋白升高。注意：心电图正常不能排除 NSTEMI。",
    category: "心肌缺血"
  },
  {
    id: "mi07",
    question: "Wellens 综合征的心电图特征是什么？",
    options: [
      "V1-V3 导联深大 T 波倒置或双向，胸痛已缓解",
      "广泛导联 ST 段抬高",
      "新发右束支阻滞",
      "下壁导联 Q 波"
    ],
    correct: 0,
    explanation: "Wellens 综合征：胸痛缓解期 V2-V3 导联深大 T 波倒置（Type B）或双向 T 波（Type A），提示前降支近端严重狭窄。禁忌负荷试验，需紧急冠脉造影！",
    category: "心肌缺血"
  },
  {
    id: "mi08",
    question: "关于 de Winter 综合征，以下哪项描述正确？",
    options: [
      "表现为 ST 段抬高",
      "V1-V6 导联 ST 段在 J 点处上斜型压低 1-3mm + T 波高尖对称",
      "是下壁心梗的变异型",
      "预后良好，可保守治疗"
    ],
    correct: 1,
    explanation: "de Winter 综合征（前降支近端闭塞的 STEMI 等危征）：V1-V6 导联 ST 段在 J 点处上斜型压低 + 高尖对称 T 波。需紧急 PCI。",
    category: "心肌缺血"
  },
  {
    id: "mi09",
    question: "心梗后心电图演变顺序正确的是？",
    options: [
      "ST 段抬高 → T 波倒置 → Q 波 → ST 段回落 → T 波恢复",
      "T 波高尖（超急性期）→ ST 段抬高 → Q 波 → T 波倒置 → ST 段回落",
      "Q 波首先出现",
      "T 波改变始终不会出现"
    ],
    correct: 1,
    explanation: "心梗演变：超急性期 T 波高尖 → ST 段抬高 → 病理性 Q 波 → T 波倒置 → ST 段回落，T 波逐渐恢复。Q 波可能终身存在。",
    category: "心肌缺血"
  },
  {
    id: "mi10",
    question: "关于 Sgarbossa 标准判断 LBBB 合并急性心梗，以下哪项是主要标准（评分 ≥ 3 分）？",
    options: [
      "ST 段压低 > 1mm",
      "QRS 主波向下的导联 ST 段抬高 ≥ 5mm",
      "QRS 主波向上的导联 ST 段一致性抬高 ≥ 1mm",
      "T 波倒置"
    ],
    correct: 2,
    explanation: "Sgarbossa 标准：① QRS 主波向上的导联 ST 段一致性抬高 ≥ 1mm（5 分）② V1-V3 导联 ST 段压低 ≥ 1mm（3 分）③ QRS 主波向下的导联 ST 段抬高 ≥ 5mm（2 分）。总分 ≥ 3 分提示心梗。",
    category: "心肌缺血"
  },
  {
    id: "mi11",
    question: "II、III、aVF 导联 ST 段抬高时，以下哪项提示右冠脉闭塞而非回旋支闭塞？",
    options: [
      "III 导联 ST 段抬高幅度 > II 导联",
      "I 导联 ST 段抬高",
      "V5-V6 导联 ST 段抬高",
      "aVL 导联 ST 段抬高"
    ],
    correct: 0,
    explanation: "下壁心梗罪犯血管：III 导联 ST↑ > II 导联 ST↑ → RCA；II 导联 ST↑ ≥ III 导联 ST↑ → LCX。V4R 导联 ST↑ 高度提示 RCA 近端闭塞。",
    category: "心肌缺血"
  },
  {
    id: "mi12",
    question: "心电图上出现\"墓碑样\"ST 段抬高最常见于？",
    options: ["早期复极", "广泛前壁心梗（前降支近端闭塞）", "心包炎", "高钾血症"],
    correct: 1,
    explanation: "\"墓碑样\" ST 段抬高：QRS、ST 段和 T 波融合形成墓碑状波形，通常提示前降支近端闭塞导致大面积心梗，预后较差。",
    category: "心肌缺血"
  },

  // ═══════════════════════════════════════════════════════════════
  // 心律失常（12 题）
  // ═══════════════════════════════════════════════════════════════
  {
    id: "ar01",
    question: "心房颤动的心电图特征不包括以下哪项？",
    options: [
      "P 波消失，代之以 f 波",
      "RR 间期绝对不规则",
      "可见锯齿状扑动波",
      "f 波频率 350-600 bpm"
    ],
    correct: 2,
    explanation: "房颤：P 波消失 → f 波（350-600 bpm），RR 绝对不规则。锯齿状扑动波（F 波，250-350 bpm）是房扑的特征。",
    category: "心律失常"
  },
  {
    id: "ar02",
    question: "典型心房扑动的心房率通常为？",
    options: ["150-200 bpm", "250-350 bpm", "350-600 bpm", "100-150 bpm"],
    correct: 1,
    explanation: "典型房扑心房率 250-350 bpm（最常见约 300 bpm）。下壁导联可见锯齿状 F 波，常伴 2:1 房室传导（心室率约 150 bpm）。",
    category: "心律失常"
  },
  {
    id: "ar03",
    question: "以下哪项是阵发性室上性心动过速（PSVT）的典型特征？",
    options: [
      "心率 100-120 bpm，不规则",
      "心率 150-250 bpm，突发突止，绝对规则",
      "心率 60-80 bpm",
      "宽 QRS 波"
    ],
    correct: 1,
    explanation: "PSVT：突发突止，心率 150-250 bpm，绝对规则，QRS 通常 < 120ms。房颤心率不规则。宽 QRS 心动过速需按 VT 对待直到证明是其他。",
    category: "心律失常"
  },
  {
    id: "ar04",
    question: "完全性右束支阻滞（RBBB）的心电图特征是什么？",
    options: [
      "QRS 宽度 > 120ms，V1 导联呈 rSR' 型，V6 导联 S 波宽钝",
      "QRS 宽度 > 120ms，V1 导联呈 QS 型",
      "V5-V6 导联 R 波高大",
      "电轴左偏"
    ],
    correct: 0,
    explanation: "RBBB：QRS ≥ 120ms + V1 导联 rSR'（兔耳征）+ V6/I/aVL 宽钝 S 波 + 继发性 ST-T 改变。注意：RBBB 时 V1-V3 的 ST-T 改变是继发性的，不是缺血。",
    category: "心律失常"
  },
  {
    id: "ar05",
    question: "完全性左束支阻滞（LBBB）的心电图特征不包括以下哪项？",
    options: [
      "QRS 宽度 > 120ms",
      "V5、V6、I、aVL 导联 R 波宽钝、有切迹",
      "V1 导联呈 rSR' 型",
      "继发性 ST-T 改变与 QRS 主波方向相反"
    ],
    correct: 2,
    explanation: "LBBB：QRS ≥ 120ms + V1 导联 QS 或 rS（非 rSR'）+ V5-V6/I/aVL 宽钝 R 波（M 型）。LBBB 会影响 STEMI 的判断，需用 Sgarbossa 标准。",
    category: "心律失常"
  },
  {
    id: "ar06",
    question: "关于室性早搏（PVC）的心电图特征，以下哪项正确？",
    options: [
      "QRS 前必有 P 波",
      "QRS 宽大畸形（通常 > 120ms），其前无相关 P 波",
      "QRS 宽度正常（< 120ms）",
      "仅发生在器质性心脏病患者"
    ],
    correct: 1,
    explanation: "PVC：提前出现的宽大畸形 QRS（> 120ms）+ 前无相关 P 波 + T 波与 QRS 主波方向相反 + 完全性代偿间歇。健康人也可偶发。",
    category: "心律失常"
  },
  {
    id: "ar07",
    question: "I 度房室传导阻滞的心电图诊断标准是？",
    options: [
      "P 波后 QRS 脱落",
      "PR 间期 > 200ms（> 5 小格），每个 P 波后均有 QRS",
      "PR 间期逐渐延长至 QRS 脱落",
      "P 波与 QRS 无固定关系"
    ],
    correct: 1,
    explanation: "I 度 AVB：PR > 200ms，每个 P 后均有 QRS。II 度 I 型（文氏）：PR 逐渐延长→QRS 脱落。II 度 II 型：PR 固定→突然脱落。III 度：房室完全分离。",
    category: "心律失常"
  },
  {
    id: "ar08",
    question: "心室颤动的心电图表现为？",
    options: [
      "规则的锯齿状波",
      "完全不规则的紊乱波形，无法辨认 QRS-ST-T",
      "宽 QRS 心动过速",
      "心率 150 bpm 的窄 QRS 心动过速"
    ],
    correct: 1,
    explanation: "室颤：P-QRS-ST-T 完全无法辨认，代之以形态振幅完全不规则的紊乱波形。唯一有效治疗：立即非同步电除颤 + 高质量 CPR。",
    category: "心律失常"
  },
  {
    id: "ar09",
    question: "宽 QRS 心动过速鉴别中，以下哪项高度提示为室速（VT）而非 SVT 合并差传？",
    options: [
      "QRS 呈典型 RBBB 形态",
      "存在房室分离（P 波与 QRS 无固定关系）",
      "QRS 宽度 130ms",
      "心动过速由房早诱发"
    ],
    correct: 1,
    explanation: "房室分离是 VT 的特异性标志（特异性接近 100%）。融合波和夺获波也是 VT 特异性表现。胸前导联 QRS 同向性也支持 VT。",
    category: "心律失常"
  },
  {
    id: "ar10",
    question: "以下哪项是 WPW 综合征（预激综合征）的典型心电图三联征？",
    options: [
      "PR 间期延长 + QRS 增宽 + ST 段压低",
      "PR 间期缩短（< 120ms）+ delta 波 + QRS 增宽",
      "PR 间期正常 + QRS 正常 + QT 间期延长",
      "PR 间期延长 + delta 波 + QRS 正常"
    ],
    correct: 1,
    explanation: "WPW 三联征：PR 缩短（< 120ms）+ QRS 起始粗钝（delta 波）+ QRS 增宽（> 120ms）。旁路位置不同导致 delta 波极性和 QRS 形态不同。",
    category: "心律失常"
  },
  {
    id: "ar11",
    question: "关于右室流出道室早/室速（RVOT-VT），以下哪项正确？",
    options: [
      "呈 RBBB + 电轴右偏",
      "呈 LBBB + 下壁导联高大 R 波（II、III、aVF 导联 R 波向上）",
      "常见于心肌梗死后",
      "利多卡因敏感"
    ],
    correct: 1,
    explanation: "RVOT 起源的 VT/PVC：典型心电图呈 LBBB 形态（V1 导联 QS/rS）+ 下壁导联高大 R 波。属于特发性 VT，腺苷敏感，多见于无器质性心脏病者。",
    category: "心律失常"
  },
  {
    id: "ar12",
    question: "以下哪种情况最容易出现 R-on-T 现象诱发尖端扭转型室速（TdP）？",
    options: [
      "运动时心率增快",
      "获得性长 QT 综合征（如药物、低钾）+ 室早落在 T 波降支",
      "窦性心动过速",
      "完全性右束支阻滞"
    ],
    correct: 1,
    explanation: "R-on-T 现象：PVC 落在前一心搏 T 波降支（易损期），可诱发 TdP/VF。长 QT 综合征时易损期增宽 → TdP 风险增加。常见致 QT 延长药物包括胺碘酮、索他洛尔等。",
    category: "心律失常"
  },

  // ═══════════════════════════════════════════════════════════════
  // 电解质与药物（6 题）
  // ═══════════════════════════════════════════════════════════════
  {
    id: "el01",
    question: "高钾血症的典型心电图演变顺序是？",
    options: [
      "ST 段抬高 → Q 波 → T 波倒置",
      "T 波高尖对称（帐篷状）→ P 波低平/消失 → QRS 增宽 → 正弦波",
      "PR 间期缩短 → QRS 变窄",
      "U 波增高 → T 波低平"
    ],
    correct: 1,
    explanation: "高钾演变：K⁺ 5.5-6.5→T 波高尖；K⁺ 6.5-7.5→P 波消失（窦室传导）；K⁺ 7.5-8.5→QRS 增宽；K⁺>8.5→正弦波→心脏停搏。",
    category: "电解质异常"
  },
  {
    id: "el02",
    question: "低钾血症的心电图特征不包括以下哪项？",
    options: [
      "T 波低平或倒置",
      "U 波增高（尤其在 V2-V3 导联）",
      "ST 段压低",
      "T 波高尖对称"
    ],
    correct: 3,
    explanation: "低钾：T 波低平/倒置 + ST 段压低 + U 波增高（T-U 融合）。高钾才是 T 波高尖对称。严重低钾可诱发 TdP。",
    category: "电解质异常"
  },
  {
    id: "el03",
    question: "低钙血症的心电图特征是什么？",
    options: ["ST 段缩短", "QT 间期延长（ST 段延长），T 波形态正常", "QT 间期缩短", "T 波高尖"],
    correct: 1,
    explanation: "低钙：ST 段延长 → QT 延长，T 波形态正常。高钙：ST 段缩短 → QT 缩短。注意：低钙不影响 T 波宽度，这是与低钾/心肌缺血的鉴别点。",
    category: "电解质异常"
  },
  {
    id: "el04",
    question: "高钙血症的心电图特征是什么？",
    options: ["QT 间期延长", "ST 段缩短或消失，QT 间期缩短", "T 波倒置", "U 波增高"],
    correct: 1,
    explanation: "高钙：ST 段缩短 → QT 间期缩短。低钙：ST 段延长 → QT 延长。严重高钙血症可见 QRS 增宽、PR 延长。",
    category: "电解质异常"
  },
  {
    id: "el05",
    question: "洋地黄效应的心电图表现是？",
    options: [
      "QT 间期延长",
      "ST 段呈\"鱼钩样\"下斜型压低（尤其在左胸导联）+ QT 间期缩短",
      "T 波高尖",
      "PR 间期缩短"
    ],
    correct: 1,
    explanation: "洋地黄效应（治疗量）：ST 段呈特征性\"鱼钩样\"下斜型压低（尤其 V5-V6）+ T 波低平/倒置 + QT 缩短。洋地黄效应 ≠ 洋地黄中毒。",
    category: "电解质异常"
  },
  {
    id: "el06",
    question: "低钾血症时出现 U 波增高，最容易在哪个导联观察到？",
    options: ["I 和 aVL 导联", "V2-V3 导联", "aVR 导联", "III 导联"],
    correct: 1,
    explanation: "U 波在 V2-V3 导联最容易观察。低钾时 U 波振幅增大可超过 T 波，导致 T-U 融合。U 波增高也是 TdP 的危险信号。",
    category: "电解质异常"
  },

  // ═══════════════════════════════════════════════════════════════
  // 起搏器心电图（5 题）
  // ═══════════════════════════════════════════════════════════════
  {
    id: "pm01",
    question: "单腔心室起搏（VVI）的心电图特征是什么？",
    options: [
      "起搏信号后紧跟 P 波",
      "起搏信号后紧跟宽大畸形 QRS（类似 LBBB 形态）+ 自身 P 波与 QRS 无固定关系",
      "起搏信号后 QRS 正常",
      "无起搏信号"
    ],
    correct: 1,
    explanation: "VVI 起搏：起搏信号 + 宽大 QRS（通常呈 LBBB 形态）+ 可有房室分离。DDD 起搏可见心房+心室起搏信号，房室顺序起搏。",
    category: "起搏器"
  },
  {
    id: "pm02",
    question: "起搏器心电图呈 LBBB 形态，提示起搏电极位于？",
    options: ["右心房", "右心室（心尖部或间隔部）", "左心室", "冠状窦"],
    correct: 1,
    explanation: "右室起搏 QRS 呈 LBBB 形态 + 电轴左偏。如果起搏 QRS 呈 RBBB 形态，应警惕电极穿孔进入左室或误入冠状窦起搏左室。",
    category: "起搏器"
  },
  {
    id: "pm03",
    question: "关于双腔起搏器（DDD）的心电图，以下哪项是正确的？",
    options: [
      "只有心房起搏信号",
      "心房起搏信号后可见起搏 P 波，随后心室起搏信号 + 起搏 QRS（房室顺序起搏）",
      "心房和心室起搏信号必须同时出现",
      "起搏心电图与正常心电图完全相同"
    ],
    correct: 1,
    explanation: "DDD 典型心电图：心房起搏信号→起搏 P 波→AV 间期→心室起搏信号→起搏 QRS。自身 P 波可被感知后抑制心房起搏并触发心室起搏（VAT 模式）。",
    category: "起搏器"
  },
  {
    id: "pm04",
    question: "起搏器术后心电图显示自身 QRS 后紧跟起搏信号但无心肌夺获，最可能是什么问题？",
    options: [
      "起搏器正常工作",
      "感知不良（undersensing）——起搏器未感知到自身 QRS，在不应期外发放了无效起搏",
      "起搏器电池耗竭",
      "电极完全断裂"
    ],
    correct: 1,
    explanation: "感知不良：起搏器未能感知自身心电信号→在自身心律后仍按预设频率发放起搏脉冲→起搏信号落入心肌不应期。需调整感知灵敏度。",
    category: "起搏器"
  },
  {
    id: "pm05",
    question: "CRT（心脏再同步化治疗）起搏的心电图特征是什么？",
    options: [
      "QRS 呈典型 LBBB 形态",
      "双心室起搏，QRS 通常比自身 QRS 窄，V1 导联可呈 QS 或 R 型",
      "与单腔起搏心电图相同",
      "QRS 一定比正常心电图窄"
    ],
    correct: 1,
    explanation: "CRT（双心室起搏）：双心室起搏信号，QRS 形态介于单纯右室和左室起搏之间。V1 导联可呈 QS 或 R 型。CRT 有效性可通过 QRS 宽度缩小来判断。",
    category: "起搏器"
  },
];

export default QUESTIONS;
