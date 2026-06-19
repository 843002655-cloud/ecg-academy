# 心电学堂 Web 端功能完善 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完善心电学堂 Next.js Web 端的知识测验、个人中心、会员升级三个页面，参考 EP Mentor 代码模式。

**Architecture:** 复用现有组件（AppLayout、Skeleton、EmptyState、usePageTitle）和 services（progressService、authService、quizService），新增本地题库数据文件，重写三个占位页面。

**Tech Stack:** Next.js 14 + React 18 + TypeScript + Tailwind CSS

---

## File Structure

| 文件 | 职责 | 操作 |
|------|------|:---:|
| `src/lib/quiz-data.ts` | 心电图判读题库（40题，5个分类） | 新建 |
| `src/app/quiz/page.tsx` | 知识测验页面（5题/轮，即时判分） | 重写 |
| `src/app/profile/page.tsx` | 个人中心（统计+徽章+AI配额+时间线） | 重写 |
| `src/app/upgrade/page.tsx` | 会员升级（三层定价+权益对比+FAQ） | 重写 |

---

### Task 1: 心电图判读题库数据文件

**Files:**
- Create: `src/lib/quiz-data.ts`

- [ ] **Step 1: Create quiz-data.ts with 40 ECG questions in 5 categories**

```typescript
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
  // 正常心电图（5题）
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

  // 心肌缺血与心梗（12题）
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
    explanation: "心梗后 ST 段持续抬高 > 2 周（尤其在 Q 波导联）应怀疑室壁瘤形成。超声心动图可明确诊断。再梗死通常有动态演变。",
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

  // 心律失常（12题）
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

  // 电解质与药物（6题）
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

  // 起搏器心电图（5题）
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
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: No TypeScript errors.

---

### Task 2: 知识测验页面

**Files:**
- Modify: `src/app/quiz/page.tsx`（完全重写占位页面）

- [ ] **Step 1: Rewrite quiz page, referencing EP Mentor structure**

```typescript
// src/app/quiz/page.tsx
"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { SkeletonBox } from "@/components/Skeleton";
import type { QuizQuestion } from "@/lib/quiz-data";
import { usePageTitle } from "@/lib/hooks/usePageTitle";

const QUIZ_SIZE = 5;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const catColors: Record<string, string> = {
  "正常心电图": "bg-[#E8F4F0] dark:bg-emerald-900/30 text-[#0F6E56] dark:text-emerald-300",
  "心肌缺血": "bg-[#FDE8E8] dark:bg-red-900/30 text-[#9B2C2C] dark:text-red-300",
  "心律失常": "bg-[#FEF3E2] dark:bg-amber-900/30 text-[#854F0B] dark:text-amber-300",
  "电解质异常": "bg-[#EDE9FE] dark:bg-purple-900/30 text-[#5B21B6] dark:text-purple-300",
  "起搏器": "bg-[#EBF2FA] dark:bg-blue-900/30 text-[#1B4F8A] dark:text-blue-400",
};

export default function QuizPage() {
  usePageTitle("知识测验");
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const startQuiz = (pool: QuizQuestion[]) => {
    const picked = shuffle(pool).slice(0, QUIZ_SIZE);
    setQuestions(picked);
  };

  useEffect(() => {
    Promise.all([
      import("@/lib/quiz-data"),
      import("@/lib/services"),
    ]).then(([quizData, { quizService }]) => {
      const FALLBACK = quizData.default;
      quizService.getQuestions().then((qs) => {
        const pool = qs?.length ? qs : FALLBACK;
        setAllQuestions(pool);
        startQuiz(pool);
        setLoading(false);
      }).catch(() => {
        setAllQuestions(FALLBACK);
        startQuiz(FALLBACK);
        setLoading(false);
      });
    });
  }, []);

  if (loading) return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SkeletonBox className="h-8 w-48 mb-2" />
        <SkeletonBox className="h-5 w-64 mb-8" />
        <div className="card">
          <SkeletonBox className="h-5 w-16 rounded-full mb-4" />
          <SkeletonBox className="h-6 w-3/4 mb-6" />
          <div className="space-y-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBox key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
          <SkeletonBox className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </AppLayout>
  );

  if (!questions.length) return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-[#6B7F96] dark:text-slate-400">
        暂无题目
      </div>
    </AppLayout>
  );

  const q = questions[currentQ];
  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === q.correct) setScore((s) => s + 1);
  };
  const handleNext = () => {
    if (currentQ + 1 < QUIZ_SIZE) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setFinished(true);
    }
  };
  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setFinished(false);
    startQuiz(allQuestions);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">
          知识测验
        </h1>
        <p className="text-[#6B7F96] dark:text-slate-400 mb-8">
          巩固你的心电图判读知识 · 每轮 {QUIZ_SIZE} 题 · 题库 {allQuestions.length} 题
        </p>

        {finished ? (
          <div className="card text-center">
            <div className="text-5xl mb-4">
              {score >= 4 ? "🎉" : score >= 3 ? "👍" : "📚"}
            </div>
            <h2 className="text-2xl font-bold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">
              测验完成！
            </h2>
            <p className="text-lg text-[#6B7F96] dark:text-slate-400 mb-6">
              得分：{score} / {QUIZ_SIZE}（{Math.round((score / QUIZ_SIZE) * 100)}%）
            </p>
            <p className="text-sm text-[#8FA0B4] dark:text-slate-500 mb-6">
              {score >= 4
                ? "非常棒！你的心电图判读基础很扎实 🫀"
                : score >= 3
                  ? "不错！继续巩固，多看病例多练习 📈"
                  : "别灰心！建议先系统学习基础心电图知识再回来挑战 📚"
              }
            </p>
            <button onClick={handleRestart} className="btn-primary">
              重新测验
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-[#8FA0B4] dark:text-slate-500">
                第 {currentQ + 1} / {QUIZ_SIZE} 题
              </span>
              <div className="flex-1 h-2 bg-[#E8ECF0] dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1B4F8A] dark:bg-blue-600 rounded-full transition-all"
                  style={{ width: `${((currentQ + 1) / QUIZ_SIZE) * 100}%` }}
                />
              </div>
            </div>
            <div className="card">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full mb-3 inline-block ${catColors[q.category] || "bg-[#F5F8FC] dark:bg-slate-800 text-[#6B7F96] dark:text-slate-400"}`}
              >
                {q.category}
              </span>
              <h2 className="text-xl font-semibold text-[#1A2332] dark:text-slate-100 mb-6 font-serif">
                {q.question}
              </h2>
              <div className="space-y-3 mb-6">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelected(i)}
                    disabled={submitted}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      submitted && i === q.correct
                        ? "border-[#0F6E56] dark:border-emerald-400 bg-[#E8F4F0] dark:bg-emerald-900/30 text-[#0F6E56] dark:text-emerald-300"
                        : submitted && i === selected && i !== q.correct
                          ? "border-[#9B2C2C] dark:border-red-400 bg-[#FDE8E8] dark:bg-red-900/30 text-[#9B2C2C] dark:text-red-300"
                          : selected === i
                            ? "border-[#1B4F8A] dark:border-blue-400 bg-[#EBF2FA] dark:bg-slate-700 text-[#1B4F8A] dark:text-blue-400"
                            : "border-[#C5D3E0] dark:border-slate-600 text-[#3D5166] dark:text-slate-300 hover:border-[#1B4F8A] dark:hover:border-blue-400"
                    }`}
                  >
                    <span className="font-medium mr-2">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
              {submitted && (
                <div className="bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE5EE] dark:border-slate-700 rounded-lg p-4 mb-6">
                  <p className="text-sm text-[#3D5166] dark:text-slate-300">
                    {q.explanation}
                  </p>
                </div>
              )}
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selected === null}
                  className="btn-primary disabled:opacity-50"
                >
                  提交答案
                </button>
              ) : (
                <button onClick={handleNext} className="btn-primary">
                  {currentQ + 1 < QUIZ_SIZE ? "下一题" : "查看结果"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: No errors.

---

### Task 3: 个人中心页面

**Files:**
- Modify: `src/app/profile/page.tsx`（完全重写占位页面）

- [ ] **Step 1: Rewrite profile page with stats, badges, quota bar, and activity timeline**

```typescript
// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { progressService, authService } from "@/lib/services";
import { SkeletonBox } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import type { ProgressItem } from "@/lib/services";
import { ROUTES } from "@/lib/routes";
import { usePageTitle } from "@/lib/hooks/usePageTitle";

const badges = [
  { name: "初识心电图", icon: "🫀", desc: "完成首个病例", unlocked: false },
  { name: "ST 段猎人", icon: "📈", desc: "完成 5 个心肌缺血病例", unlocked: false },
  { name: "心律失常侦探", icon: "⚡", desc: "完成 5 个心律失常病例", unlocked: false },
  { name: "AI 学伴", icon: "🧠", desc: "累计 50 次 AI 对话", unlocked: false },
  { name: "勤奋学习者", icon: "📚", desc: "完成 20 个病例", unlocked: false },
  { name: "判读达人", icon: "🏆", desc: "完成率 80%+", unlocked: false },
];

export default function ProfilePage() {
  usePageTitle("个人中心");
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, string> } | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [totalCases, setTotalCases] = useState(0);
  const [quota, setQuota] = useState<{ used: number; remaining: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getUser().then((u) => {
      setUser(u as { email?: string; user_metadata?: Record<string, string> } | null);
    });
    Promise.all([
      progressService.getUserProgress(),
      progressService.getQuota().catch(() => null),
    ]).then(([d, q]) => {
      if (d) {
        setProgress(d.progress);
        setTotalCases(d.totalCases);
      }
      if (q) setQuota(q);
    }).finally(() => setLoading(false));
  }, []);

  const stats = progressService.getStats(progress, totalCases);

  // Compute badge unlocks
  const uniqueCompleted = new Set(progress.map((p) => p.case_id));
  badges[0].unlocked = uniqueCompleted.size >= 1;
  badges[1].unlocked = progress.filter((p) => p.cases?.category === "心肌缺血").length >= 5;
  badges[2].unlocked = progress.filter((p) => p.cases?.category === "心律失常").length >= 5;
  badges[3].unlocked = progress.length >= 50;
  badges[4].unlocked = uniqueCompleted.size >= 20;
  badges[5].unlocked = stats.completionRate >= 80;

  if (loading)
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="card mb-6 flex items-center gap-4">
            <SkeletonBox className="w-16 h-16 rounded-full" />
            <div className="flex-1">
              <SkeletonBox className="h-6 w-40 mb-2" />
              <SkeletonBox className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card text-center">
                <SkeletonBox className="h-8 w-8 mx-auto mb-2 rounded" />
                <SkeletonBox className="h-7 w-12 mx-auto mb-1" />
                <SkeletonBox className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
          <SkeletonBox className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card text-center p-4">
                <SkeletonBox className="h-6 w-6 mx-auto mb-1 rounded" />
                <SkeletonBox className="h-4 w-16 mx-auto mb-1" />
                <SkeletonBox className="h-3 w-10 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* User header */}
        <div className="card mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1B4F8A] to-[#0F6E56] flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user?.email?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1A2332] dark:text-slate-100 font-serif">
              {user?.email || "医生用户"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#EBF2FA] dark:bg-slate-700 text-[#1B4F8A] dark:text-blue-400">
                🩺 心电图学习者
              </span>
            </div>
          </div>
          <Link
            href={ROUTES.AUTH}
            className="text-sm text-[#6B7F96] dark:text-slate-400 hover:text-[#1B4F8A] dark:hover:text-blue-400 transition-colors"
          >
            编辑资料
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { v: stats.completedCount, l: "已完成病例", c: "text-[#1B4F8A] dark:text-blue-400", icon: "📚" },
            { v: stats.totalCases, l: "总病例数", c: "text-[#4C3D9E] dark:text-purple-400", icon: "📋" },
            { v: stats.todayCount, l: "今日学习", c: "text-[#0F6E56] dark:text-emerald-400", icon: "💬" },
            { v: `${stats.completionRate}%`, l: "完成率", c: "text-[#854F0B] dark:text-amber-400", icon: "📊" },
          ].map((s, i) => (
            <div key={i} className="card text-center">
              <span className="text-2xl">{s.icon}</span>
              <div className={`text-2xl font-bold mt-1 ${s.c}`}>{s.v}</div>
              <div className="text-xs text-[#6B7F96] dark:text-slate-400 mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Quota */}
        {quota && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#1A2332] dark:text-slate-100">
                🤖 AI 对话配额
              </span>
              <span className="text-xs text-[#8FA0B4] dark:text-slate-500">
                每日 {quota.total} 次
              </span>
            </div>
            <div className="h-2.5 bg-[#E8ECF0] dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1B4F8A] to-[#0F6E56] rounded-full transition-all"
                style={{ width: `${Math.min((quota.used / quota.total) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-[#8FA0B4] dark:text-slate-500">
              <span>已用 {quota.used} 次</span>
              <span>
                剩余{" "}
                <span className="text-[#0F6E56] dark:text-emerald-400 font-medium">
                  {quota.remaining}
                </span>{" "}
                次
              </span>
            </div>
          </div>
        )}

        {/* Badges */}
        <h2 className="text-xl font-semibold text-[#1A2332] dark:text-slate-100 mb-4 font-serif">
          🏅 学习徽章
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {badges.map((b) => (
            <div
              key={b.name}
              className={`card text-center p-4 ${!b.unlocked && "opacity-40"}`}
            >
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-xs font-medium text-[#1A2332] dark:text-slate-100">
                {b.name}
              </div>
              <div className="text-xs text-[#8FA0B4] dark:text-slate-500 mt-0.5">
                {b.unlocked ? "已解锁" : b.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <h2 className="text-xl font-semibold text-[#1A2332] dark:text-slate-100 mb-4 font-serif">
          📖 最近学习
        </h2>
        {progress.length === 0 ? (
          <EmptyState
            icon="🫀"
            title="还没有学习记录"
            description="开始你的心电图判读学习之旅吧"
            actionHref={ROUTES.CASES}
            actionLabel="去病例库学习"
          />
        ) : (
          <div className="space-y-3">
            {progress.slice(0, 10).map((p, i) => (
              <div
                key={i}
                className="card flex items-center justify-between py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#8FA0B4] dark:text-slate-500 min-w-[80px]">
                    {p.cases?.category || "—"}
                  </span>
                  <Link
                    href={ROUTES.CASE_DETAIL(p.case_id)}
                    className="text-[#1A2332] dark:text-slate-100 hover:text-[#1B4F8A] dark:hover:text-blue-400 transition-colors"
                  >
                    {p.cases?.title || "未知病例"}
                  </Link>
                </div>
                <span className="text-xs text-[#8FA0B4] dark:text-slate-500 shrink-0 ml-4">
                  {new Date(p.completed_at).toLocaleDateString("zh-CN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: No errors.

---

### Task 4: 会员升级页面

**Files:**
- Modify: `src/app/upgrade/page.tsx`（完全重写占位页面）

- [ ] **Step 1: Rewrite upgrade page with 3-tier pricing cards, feature comparison, FAQ accordion, WeChat Pay QR placeholder**

```typescript
// src/app/upgrade/page.tsx
"use client";

import AppLayout from "@/components/AppLayout";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const tiers = [
  {
    name: "基础心电图",
    price: "免费",
    period: "永久",
    icon: "📈",
    color: "border-emerald-500",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
    btn: "bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 text-[#4B6080] dark:text-slate-300 hover:border-[#1B4F8A] dark:hover:border-blue-400",
    btnText: "当前方案",
    features: [
      { text: "120 例基础心电图", ok: true },
      { text: "AI 苏格拉底式教学", ok: true },
      { text: "每日 3 次 AI 对话", ok: true },
      { text: "知识测验", ok: false },
      { text: "80 例心律失常病例", ok: false },
      { text: "学习报告导出", ok: false },
      { text: "120 例 EP 电生理", ok: false },
    ],
  },
  {
    name: "心律失常进阶",
    price: "¥129",
    period: "/年",
    icon: "💎",
    color: "border-amber-500",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
    btn: "bg-amber-500 hover:bg-amber-600 text-white font-bold",
    btnText: "升级会员",
    highlight: true,
    features: [
      { text: "120 例基础心电图", ok: true },
      { text: "AI 苏格拉底式教学", ok: true },
      { text: "每月 300 次 AI 对话", ok: true },
      { text: "知识测验", ok: true },
      { text: "80 例心律失常病例", ok: true },
      { text: "学习报告导出", ok: false },
      { text: "120 例 EP 电生理", ok: false },
    ],
  },
  {
    name: "EP 专家",
    price: "¥199",
    period: "/年",
    icon: "⚡",
    color: "border-blue-600",
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
    btn: "bg-[#1B4F8A] dark:bg-blue-600 hover:bg-[#154070] dark:hover:bg-blue-500 text-white",
    btnText: "立即订阅",
    features: [
      { text: "120 例基础心电图", ok: true },
      { text: "AI 苏格拉底式教学", ok: true },
      { text: "无限次 AI 对话", ok: true },
      { text: "知识测验", ok: true },
      { text: "80 例心律失常病例", ok: true },
      { text: "学习报告导出", ok: true },
      { text: "120 例 EP 电生理", ok: true },
    ],
  },
];

const faqs = [
  {
    q: "免费版有什么限制？",
    a: "免费版可访问全部 120 例基础心电图病例，AI 对话每日限 3 次。升级后可解锁心律失常进阶病例、知识测验和更多 AI 对话次数。",
  },
  {
    q: "¥129/年是怎么计算的？",
    a: "折合每月不到 ¥11——相当于一杯奶茶。对比传统心电图培训班 ¥500-2000 的价格，我们让优质心电图教学触手可及。",
  },
  {
    q: "可以退款吗？",
    a: "购买后 7 天内可申请全额退款，前提是 AI 对话次数使用未超过 50 次。联系 843002655@qq.com 处理。",
  },
  {
    q: "付费后可以在微信小程序上用吗？",
    a: "可以！心电学堂微信小程序（开发中）与 Web 端共享同一账号和会员权益，Web 端付费后小程序同步解锁。",
  },
  {
    q: "有没有机构版？",
    a: "机构版（医学院/规培基地批量采购）¥999/年，支持 20 个成员账号。请联系 843002655@qq.com 获取机构方案。",
  },
];

export default function UpgradePage() {
  usePageTitle("升级会员");

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A2332] dark:text-slate-100 mb-4 font-serif">
            升级会员
          </h1>
          <p className="text-lg text-[#6B7F96] dark:text-slate-400 max-w-xl mx-auto">
            从基础心电图到 EP 电生理，一站式心电图判读进阶之路
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border-2 ${tier.color} ${tier.bg} p-6 flex flex-col ${
                tier.highlight ? "md:-mt-4 md:mb-4 shadow-xl shadow-amber-100 dark:shadow-amber-900/20" : ""
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  🔥 最受欢迎
                </div>
              )}
              <div className="text-3xl mb-3">{tier.icon}</div>
              <h2 className="text-xl font-bold text-[#1A2332] dark:text-slate-100 mb-1 font-serif">
                {tier.name}
              </h2>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-[#1A2332] dark:text-slate-100">
                  {tier.price}
                </span>
                <span className="text-sm text-[#6B7F96] dark:text-slate-400">
                  {tier.period}
                </span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className={f.ok ? "text-[#0F6E56] dark:text-emerald-400" : "text-[#C5D3E0] dark:text-slate-600"}>
                      {f.ok ? "✅" : "✕"}
                    </span>
                    <span className={f.ok ? "text-[#3D5166] dark:text-slate-300" : "text-[#C5D3E0] dark:text-slate-600 line-through"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-medium transition-colors text-center ${tier.btn}`}>
                {tier.btnText}
              </button>
            </div>
          ))}
        </div>

        {/* WeChat Pay placeholder */}
        <div className="card mb-16 text-center">
          <h2 className="text-xl font-semibold text-[#1A2332] dark:text-slate-100 mb-4 font-serif">
            💳 微信支付
          </h2>
          <p className="text-sm text-[#6B7F96] dark:text-slate-400 mb-6">
            扫描下方二维码完成支付，会员权益即时生效
          </p>
          <div className="w-48 h-48 mx-auto mb-4 bg-[#F5F8FC] dark:bg-slate-800 border-2 border-dashed border-[#C5D3E0] dark:border-slate-600 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <p className="text-xs text-[#8FA0B4] dark:text-slate-500">
                微信支付<br />接入中
              </p>
            </div>
          </div>
          <p className="text-xs text-[#8FA0B4] dark:text-slate-500">
            支付问题？联系{" "}
            <a
              href="mailto:843002655@qq.com"
              className="text-[#1B4F8A] dark:text-blue-400 hover:underline"
            >
              843002655@qq.com
            </a>
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1A2332] dark:text-slate-100 mb-6 text-center font-serif">
            ❓ 常见问题
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="card group cursor-pointer"
              >
                <summary className="flex items-center justify-between text-sm font-medium text-[#1A2332] dark:text-slate-100 list-none">
                  {faq.q}
                  <span className="text-[#8FA0B4] dark:text-slate-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-2 text-sm text-[#6B7F96] dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            href={ROUTES.CASES}
            className="text-[#1B4F8A] dark:text-blue-400 hover:text-[#154070] dark:hover:text-blue-300 text-sm font-medium"
          >
            先看看免费病例 →
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 2: Verify all three pages render correctly in dev mode**

```bash
npm run dev
```
Visit:
- `/quiz` → loads questions, can answer, see results
- `/profile` → shows stats, badges, quota, activity timeline  
- `/upgrade` → shows 3-column pricing, FAQ accordion, WeChat Pay placeholder

---
