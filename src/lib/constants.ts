/** Shared category colors for case/quiz badges */
export const catColors: Record<string, string> = {
  "正常心电图": "bg-[#E8F4F0] dark:bg-emerald-900/30 text-[#0F6E56] dark:text-emerald-300",
  "心腔肥大": "bg-[#FDE8E8] dark:bg-red-900/30 text-[#9B2C2C] dark:text-red-300",
  "束支阻滞": "bg-[#E8F5F0] dark:bg-emerald-900/30 text-[#2D8C6A] dark:text-emerald-300",
  "心肌缺血": "bg-[#FDE8E8] dark:bg-red-900/30 text-[#B91C1C] dark:text-red-300",
  "ST-T改变": "bg-[#FEF3E2] dark:bg-amber-900/30 text-[#854F0B] dark:text-amber-300",
  "电解质异常": "bg-[#EDE9FE] dark:bg-purple-900/30 text-[#5B21B6] dark:text-purple-300",
  "心律失常": "bg-[#FEF3E2] dark:bg-amber-900/30 text-[#B45309] dark:text-amber-300",
  "起搏器": "bg-[#E8F4F0] dark:bg-emerald-900/30 text-[#065F46] dark:text-emerald-300",
  "急诊": "bg-[#FDE8E8] dark:bg-red-900/30 text-[#991B1B] dark:text-red-300",
  SVT: "bg-[#E8F5F0] dark:bg-emerald-900/30 text-[#2D8C6A] dark:text-emerald-300",
  VT: "bg-[#FDE8E8] dark:bg-red-900/30 text-[#9B2C2C] dark:text-red-300",
  AF: "bg-[#FEF3E2] dark:bg-amber-900/30 text-[#854F0B] dark:text-amber-300",
};

/** Shared difficulty colors */
export const diffColors: Record<string, string> = {
  "基础": "bg-[#E8F4F0] dark:bg-emerald-900/30 text-[#0F6E56] dark:text-emerald-300",
  "进阶": "bg-[#FEF3E2] dark:bg-amber-900/30 text-[#854F0B] dark:text-amber-300",
  "高级": "bg-[#FDE8E8] dark:bg-red-900/30 text-[#9B2C2C] dark:text-red-300",
};

/** Case categories list for filters */
export const CATEGORIES = [
  { value: "", label: "全部" },
  { value: "正常心电图", label: "正常心电图" },
  { value: "心腔肥大", label: "心腔肥大" },
  { value: "束支阻滞", label: "束支阻滞" },
  { value: "心肌缺血", label: "心肌缺血" },
  { value: "ST-T改变", label: "ST-T改变" },
  { value: "电解质异常", label: "电解质" },
  { value: "心律失常", label: "心律失常" },
  { value: "起搏器", label: "起搏器" },
  { value: "急诊", label: "急诊" },
];

export const DIFFICULTIES = [
  { value: "", label: "全部难度" },
  { value: "基础", label: "基础" },
  { value: "进阶", label: "进阶" },
  { value: "高级", label: "高级" },
];
