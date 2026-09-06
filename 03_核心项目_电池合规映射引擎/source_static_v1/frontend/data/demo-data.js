// This file is a frontend-friendly demo snapshot.
// The current source of truth for review is data/review_csv/ and assets/workbooks/.
window.CATL_DEMO_DATA = {
  meta: {
    title: "CATL 四层映射 Demo",
    coreMessage:
      "我们不是重新发明一套标准，而是把 CATL 已有的公开披露、碳核算、供应链审核和追溯能力，继续拆成 EU-ready 和 CBAM-compatible 的数据结构。",
  },
  product: {
    name: "神行 PLUS CTP 动力电池包（Demo）",
    modelCode: "SXP-CTP-PACK-DEMO-01",
    plantCode: "CN-JS-PLANT-DEMO-01",
    reportingPeriod: "2025Q4",
    chemistry: "LFP（磷酸铁锂）",
    capacity: "72 kWh",
    carbonIntensity: "48.97 kgCO2e/kWh",
    euReadiness: "90.9%",
    cbamReadiness: "100%",
  },
  nav: [
    { id: "overview", label: "总览", desc: "先把这套 demo 到底在解决什么问题讲清楚。" },
    { id: "eu", label: "EU 输出", desc: "查看自动输出给欧盟电池法的核心字段。" },
    { id: "cbam", label: "CBAM 输出", desc: "查看兼容上游材料 CBAM 风格的数据结构。" },
    { id: "layers", label: "四层映射", desc: "字段、证据、核验、权限四层分别在做什么。" },
    { id: "catl", label: "CATL 架构", desc: "CATL 现有公开披露哪些能直接用，哪些还要拆。" },
    { id: "dev", label: "开发提示", desc: "给后续同学和 AI agent 的开发接力说明。" },
  ],
  overview: {
    intro:
      "这个 demo 解决的不是“CATL 没有 ESG 或碳数据”，而是“现有数据大多还是公司级，欧盟电池法和 CBAM-compatible 场景需要更细的产品级、工厂级、供应商级和材料级结构”。",
    highlights: [
      {
        title: "一套系统，两类输出",
        text: "同一套映射系统，一边服务欧盟电池法规，一边顺手兼容上游材料的 CBAM 风格数据。",
      },
      {
        title: "不是从零开始",
        text: "CATL 已经有 ESG 报告、碳核算报告、CREDIT、时代碳链、溯源系统和电池护照试点经验。",
      },
      {
        title: "真正的难点是粒度",
        text: "公司级数据不能直接当成某个电池型号、某个工厂、某个供应商材料的报送结果。",
      },
      {
        title: "为什么先做静态前端",
        text: "这版最重要的目标是让同学、老师和后续开发者都能快速看懂，不先被技术栈绊住。",
      },
    ],
    coreSteps: [
      "先从 01_手动输入收集产品、工厂、材料、能耗、上游材料和核验状态。",
      "生命周期计算过程把这些输入转换成碳足迹总量、阶段拆分和覆盖材料嵌入排放。",
      "EU 输出表自动生成电池法规相关字段。",
      "CBAM 输出表自动生成上游铝材、钢材的兼容字段。",
      "四层映射过程解释每一条数据是怎么来的、谁来确认、谁能看。",
    ],
  },
  euOutput: {
    summary: "这部分展示的是最接近 EU Battery Regulation 的输出视图。注意它是 demo 结构，不是官方真实报送。",
    rows: [
      ["基本信息", "制造商名称", "CATL", "直接可引用的公司身份字段"],
      ["基本信息", "电池型号", "SXP-CTP-PACK-DEMO-01", "是产品级锚点，不能只用公司级公开数据替代"],
      ["基本信息", "制造工厂代码", "CN-JS-PLANT-DEMO-01", "要从基地名单继续拆到具体 plant"],
      ["基本信息", "报告期", "2025Q4", "要从年报周期转成 model + plant 周期"],
      ["产品参数", "额定容量", "72 kWh", "用于把整包总量换算成 kgCO2e/kWh"],
      ["碳足迹", "声明总碳足迹", "48.97 kgCO2e/kWh", "来自生命周期计算过程"],
      ["碳足迹", "原材料阶段", "44.24 kgCO2e/kWh", "最重的一段，后续也最适合继续拆上游材料"],
      ["碳足迹", "制造阶段", "4.36 kgCO2e/kWh", "受电力结构、良率、蒸汽和天然气影响"],
      ["再生材料", "再生锂占比", "8.0%", "属于法规重点公开项之一"],
      ["尽调与追溯", "关键原材料追溯范围", "lithium / graphite / aluminium / copper / steel", "是供应链尽调的重要公开支撑"],
      ["文件与护照", "测试报告状态", "齐备", "状态能展示，原件仍应受限访问"],
      ["综合状态", "EU 输出结论", "可直接讲给评委", "当前 demo 的完整度已经适合比赛展示"],
    ],
  },
  cbamOutput: {
    summary: "这里不是说整块电池已经直接纳入 CBAM，而是把上游铝材、钢材的 CBAM 风格字段提前兼容进来。",
    rows: [
      ["基础锚点", "电池型号", "SXP-CTP-PACK-DEMO-01", "把上游材料和具体 demo 产品绑定起来"],
      ["基础锚点", "上游材料报告期", "2025Q4", "方便和产品报告期对齐"],
      ["铝材模块", "铝材供应商安装点 ID", "AL-SUP-001", "借鉴 installation 逻辑"],
      ["铝材模块", "铝材质量", "80 kg", "来自 BOM"],
      ["铝材模块", "铝材总嵌入排放", "1120.00 kgCO2e/pack", "由质量乘以直接+间接因子得到"],
      ["铝材模块", "铝材核验状态", "已核验", "体现 supplier verifier discipline"],
      ["钢材模块", "钢材供应商安装点 ID", "ST-SUP-001", "借鉴 installation 逻辑"],
      ["钢材模块", "钢材质量", "30 kg", "来自 BOM"],
      ["钢材模块", "钢材总嵌入排放", "81.00 kgCO2e/pack", "由质量乘以直接+间接因子得到"],
      ["汇总", "覆盖材料总嵌入排放", "1201.00 kgCO2e/pack", "当前 demo 只展示铝和钢两类重点材料"],
      ["汇总", "覆盖材料占整包总排放比重", "34.1%", "说明这些上游材料对整包总排放很重要"],
      ["综合状态", "CBAM 输出结论", "可作为上游碳数据兼容模块展示", "适合比赛里讲“超前性”"],
    ],
  },
  layers: [
    {
      title: "字段映射（field mapping）",
      subtitle: "这条数据最后要填进哪个格子？",
      bullets: [
        "把 CATL 现有字段和 EU / CBAM 目标字段一一对应起来。",
        "判断哪些字段可以直接引用，哪些字段必须重组后才能输出。",
        "解决的是“你现在这条数据最后要去哪儿”。",
      ],
    },
    {
      title: "证据映射（evidence mapping）",
      subtitle: "这个数值背后拿什么证明？",
      bullets: [
        "把电表、发票、BOM、供应商 PCF、核验报告和追溯记录串起来。",
        "让每个输出字段后面都能挂上证据链。",
        "解决的是“你不是只报一个数，而是能解释这个数从哪来”。",
      ],
    },
    {
      title: "核验映射（assurance mapping）",
      subtitle: "谁来确认它能不能信？",
      bullets: [
        "有些字段内部确认就够，有些必须第三方核验。",
        "供应商材料数据通常要 supplier verification 或抽查。",
        "解决的是“每条数据需要多强的可信度”。",
      ],
    },
    {
      title: "权限映射（confidentiality / access mapping）",
      subtitle: "谁能看，谁不能看？",
      bullets: [
        "不是所有数据都公开。",
        "有些适合公开给所有人，有些只能给客户、监管或公告机构。",
        "解决的是“如何既保护 CATL 数据主权，又满足欧盟要求的分层透明”。",
      ],
    },
  ],
  catlPublicArchitecture: {
    summary:
      "这部分是最关键的一张判断表。它不是在问“CATL 有没有数据”，而是在问“CATL 现在公开披露的数据，哪些能直接继承，哪些还必须继续往下拆”。",
    rows: [
      ["公司基本身份与业务范围", "可以直接引用", "制造商名称、业务范围、公司身份能直接拿来用，但不能替代产品主数据。"],
      ["全球布局与生产基地清单", "部分可引用", "基地名单可直接作为候选池，但必须继续拆成 plant code 和 model 绑定。"],
      ["组织边界与运营控制权法", "方法论底稿", "适合作为边界说明，但不能直接当成 EU 产品边界输出。"],
      ["ESG 治理与尽职调查架构", "可直接继承背景", "治理架构能证明公司有管理基础，但报送时仍要拆成字段责任链。"],
      ["年度 GHG 总量", "不能直接输出", "公司级总量只能当上层基线，不能直接填 EU 或 CBAM 输出。"],
      ["碳核算报告的数据源家族", "非常有价值", "天然气、电力、蒸汽、ERP、物流、差旅这些都适合转成输入模板。"],
      ["CREDIT 审核", "可直接借核验逻辑", "但最终要继续拆到 supplier/site/material 级 evidence。"],
      ["供应链合规溯源体系", "结构能直接讲", "真正落地时要拆成 lot、batch、serial、supplier map 和 genealogy。"],
      ["时代碳链平台", "最接近系统内核", "说明 CATL 不是从零开始，但离正式 EU 输出还差最后一层精细结构。"],
      ["电池护照试点", "适合对外讲说服力", "试点参与事实能直接讲，但正式合规字段仍要重新结构化。"],
    ],
  },
  development: {
    steps: [
      "先读 docs/00_给同学看的介绍.md，确认你真的理解这套 demo 在解决什么。",
      "再读 docs/01_开发说明.md，弄清楚当前为什么先做成静态版。",
      "如果要继续开发，优先把 demo-data.js 和 review_csv 做字段对齐。",
      "后续升级建议先做角色切换和输入-输出联动，再考虑迁移到 React。",
    ],
    files: [
      ["frontend/index.html", "前端页面结构"],
      ["frontend/styles.css", "视觉样式"],
      ["frontend/app.js", "渲染逻辑"],
      ["frontend/data/demo-data.js", "当前前端直接使用的数据对象"],
      ["data/review_csv/", "团队审查用原始结构化表"],
      ["docs/", "给同学和后续 AI 的说明文档"],
    ],
  },
};
