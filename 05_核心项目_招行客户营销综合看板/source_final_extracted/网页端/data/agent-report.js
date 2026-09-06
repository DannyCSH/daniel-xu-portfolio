/**
 * 来自 Multi-Agent 报告：半导体产业链景气度建模与链上企业分层评价
 * 生成时间：2026-07-18｜综合景气 48.0（中性）
 */
window.AGENT_REPORT = {
  meta: {
    title: "半导体产业链景气度建模与链上企业分层评价报告",
    generatedAt: "2026-07-18 03:53:10",
    method: "Multi-Agent（采集→建模→交叉检验→报告）",
    composite: 48.0,
    verdict: "中性",
    verdictText: "景气度中性（结构分化，需精选环节）",
    /* 综合分阈值：≥55 视为多数数据偏良好 */
    healthyThreshold: 55,
  },
  coverage: {
    enterprises: 78492,
    stream: { 上游: 856, 中游: 4465, 下游: 73171 },
    financeSample: 14190,
    financeRate: 18.1,
    settleCover: 100,
    settleRecords: 756499,
  },
  tiers: [
    { name: "核心层", count: 443, min: 80, action: "链主综合金融" },
    { name: "骨干层", count: 13727, min: 60, action: "供应链金融" },
    { name: "基础层", count: 24904, min: 40, action: "结算获客" },
    { name: "边缘层", count: 39418, min: 0, action: "观察维护" },
  ],
  dims: [
    {
      name: "传导效率",
      score: 40.6,
      weight: 0.18,
      conf: 51,
      positive: false,
      meaning: "账期偏长，供应链金融（应收/票据）切入点",
    },
    {
      name: "价值分配",
      score: 50.7,
      weight: 0.15,
      conf: 18,
      positive: false,
      meaning: "利润集中，弱势环节需下沉核实链主依赖",
    },
    {
      name: "供需匹配",
      score: 49.3,
      weight: 0.18,
      conf: 18,
      positive: false,
      meaning: "供需错配环节去库存压力大，存货融资宜审慎",
    },
    {
      name: "企业协同度",
      score: 27.8,
      weight: 0.18,
      conf: 100,
      positive: false,
      meaning: "协同偏低，不宜过度依赖单一链主批量开发",
    },
    {
      name: "断链风险",
      score: 45.5,
      weight: 0.16,
      conf: 80,
      positive: false,
      meaning: "卡脖子节点需提高风险关注，亦具定价权",
    },
    {
      name: "外部环境",
      score: 79.2,
      weight: 0.15,
      conf: 100,
      positive: true,
      meaning: "政策强支持+行情上行，整链营销窗口期",
      highlight: "policy",
    },
  ],
  policy: {
    supportScore: 98.5,
    supportSignals: 80,
    restrictSignals: 2,
    marketMomentum: 47.0,
    marketVol: 73.6,
    title: "新时期促进集成电路产业和软件产业高质量发展若干政策",
    source: "中国政府网",
    summary:
      "国家支持集成电路产业发展，鼓励研发投入；线宽≤28nm 且经营期≥15年项目可享所得税优惠；支持设计、装备、材料、封测协同创新。",
    url: "https://www.gov.cn/zhengce/content/2020-08/04/content_5532370.htm",
  },
  chokeNodes: ["晶圆减薄机", "芯片键合机", "集成电路分选机", "半导体测试板", "半导体封装模具", "IGBT功率模块"],
  /** 报告 Top 高分企业（演示名单，可点进画像） */
  topFirms: [
    { id: "af1", uid: "f008f8f580b2", score: 92.1, tier: "核心层", node: "IGBT功率模块", status: 99.2, ops: 82.6, strength: 95.1, city: "嘉兴", reason: "链上地位 99 · 卡脖子节点", industryId: "semiconductor" },
    { id: "af2", uid: "86012e152dc4", score: 88.6, tier: "核心层", node: "集成电路分选机", status: 99.1, ops: 80.9, strength: 85.3, city: "杭州", reason: "链上地位 99 · 卡脖子节点", industryId: "semiconductor" },
    { id: "af3", uid: "76d3432fedea", score: 88.1, tier: "核心层", node: "半导体IP核授权", status: 99.2, ops: 75.7, strength: 89.6, city: "北京", reason: "链上地位 99", industryId: "semiconductor" },
    { id: "af4", uid: "30932dd88023", score: 87.9, tier: "核心层", node: "氧化扩散炉", status: 99.9, ops: 81.0, strength: 81.8, city: "上海", reason: "链上地位 100", industryId: "semiconductor" },
    { id: "af5", uid: "0574738a14e9", score: 87.4, tier: "核心层", node: "IGBT功率模块", status: 91.9, ops: 78.0, strength: 93.3, city: "深圳", reason: "自身实力 93", industryId: "semiconductor" },
    { id: "af6", uid: "ed776f4db504", score: 86.9, tier: "核心层", node: "集成电路分选机", status: 95.7, ops: 75.6, strength: 89.7, city: "苏州", reason: "链上地位 96", industryId: "semiconductor" },
    { id: "af7", uid: "ea78ace57f22", score: 86.8, tier: "核心层", node: "IGBT功率模块", status: 96.6, ops: 74.8, strength: 89.5, city: "无锡", reason: "链上地位 97", industryId: "semiconductor" },
    { id: "af8", uid: "29873132e023", score: 86.6, tier: "核心层", node: "数字集成电路", status: 98.7, ops: 71.1, strength: 90.6, city: "成都", reason: "链上地位 99", industryId: "semiconductor" },
  ],
  industries: [
    { id: "semiconductor", name: "半导体", composite: 48.0, healthy: false },
    { id: "nev", name: "新能源车", composite: 62.0, healthy: true },
    { id: "robot", name: "机器人", composite: 58.0, healthy: true },
    { id: "biomed", name: "生物医药", composite: 54.0, healthy: false },
    { id: "lowalt", name: "低空经济", composite: 71.0, healthy: true },
  ],
};
