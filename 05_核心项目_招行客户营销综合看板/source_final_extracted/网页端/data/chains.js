/**
 * 五条重点产业链 + 辖区企业生成（页面二/三共用）
 * 大小=分层，颜色=行业，深浅=规模
 */
window.CHAIN_META = (() => {
  /* 产业链配色统一在招行红系内区分，避免花哨多色 */
  const INDUSTRIES = [
    {
      id: "lowAltitude",
      name: "低空经济",
      color: "#c00000",
      colorSoft: "#e07070",
      score: 86,
      trend: [72, 75, 78, 81, 84, 86],
      trendLabel: "上升",
      count: 0,
    },
    {
      id: "bio",
      name: "生物医药",
      color: "#9a0000",
      colorSoft: "#c04040",
      score: 74,
      trend: [70, 71, 72, 71, 73, 74],
      trendLabel: "平稳",
      count: 0,
    },
    {
      id: "semi",
      name: "半导体",
      color: "#d42020",
      colorSoft: "#e88888",
      score: 81,
      trend: [76, 77, 78, 79, 80, 81],
      trendLabel: "上升",
      count: 0,
    },
    {
      id: "robot",
      name: "机器人",
      color: "#7a1515",
      colorSoft: "#b05050",
      score: 69,
      trend: [64, 65, 66, 67, 68, 69],
      trendLabel: "缓升",
      count: 0,
    },
    {
      id: "nev",
      name: "新能源汽车",
      color: "#a01010",
      colorSoft: "#d06060",
      score: 88,
      trend: [78, 80, 82, 84, 86, 88],
      trendLabel: "上升",
      count: 0,
    },
  ];

  const TIERS = ["核心层", "骨干层", "基础层", "边缘层"];
  /* 越核心圆越大（屏幕像素，配合分散布局） */
  const TIER_SIZE = { 核心层: 42, 骨干层: 32, 基础层: 24, 边缘层: 16 };
  const SCALES = ["大型", "中型", "小型", "微型"];
  /* 规模越大颜色越深（alpha 越高） */
  const SCALE_ALPHA = { 大型: 0.96, 中型: 0.78, 小型: 0.55, 微型: 0.36 };
  const STREAMS = ["上游", "中游", "下游"];
  const NODES = {
    lowAltitude: ["eVTOL整机", "飞行控制", "低空运营", "起降场", "航电系统"],
    bio: ["创新药研发", "医疗器械", "CRO服务", "原料药", "冷链配送"],
    semi: ["芯片设计", "晶圆制造", "封装测试", "设备材料", "EDA工具"],
    robot: ["工业机器人", "伺服系统", "减速器", "系统集成", "末端执行器"],
    nev: ["动力电池", "电驱系统", "整车制造", "充电运营", "汽车电子"],
  };

  function hash(n) {
    let x = n | 0;
    x = (x ^ 61) ^ (x >>> 16);
    x = Math.imul(x, 0x9e3779b9);
    return (x >>> 0) / 4294967296;
  }

  function hexToRgba(hex, a) {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /**
   * 将企业点均匀铺在管辖圆内（避免挤成一团）
   * 黄金角分布 + 分层环带
   */
  function layoutInCircle(list, center, radiusDeg) {
    const [lng0, lat0] = center;
    const n = list.length;
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));
    return list.map((e, i) => {
      const tierIdx = Math.max(0, TIERS.indexOf(e.tier));
      // 核心偏外圈更易辨认，边缘偏内；再按序号错开环带
      const ring = 0.38 + (3 - tierIdx) * 0.12 + (i % 4) * 0.06;
      const r = radiusDeg * Math.min(0.93, ring);
      const ang = i * GOLDEN;
      const coord = [lng0 + Math.cos(ang) * r, lat0 + Math.sin(ang) * r * 0.88];
      return { ...e, coord, value: [...coord, e.symbolSize] };
    });
  }

  /** 在支行管辖圆内生成企业点 */
  function genEnterprises(branch, radiusKm = 4.8) {
    const [lng0, lat0] = branch.coord || [104.0665, 30.5723];
    const deg = radiusKm / 111;
    const list = [];
    let seq = 0;

    INDUSTRIES.forEach((ind, ii) => {
      /* 单产业链控制数量，便于分散展示 */
      const n = 7 + Math.floor(hash(ii * 97 + (branch.branchNo || 1) * 13) * 4);
      const batch = [];
      for (let i = 0; i < n; i++) {
        seq += 1;
        const tier = TIERS[Math.floor(hash(seq * 11) * 4)];
        const scale = SCALES[Math.floor(hash(seq * 19) * 4)];
        const stream = STREAMS[Math.floor(hash(seq * 23) * 3)];
        const nodes = NODES[ind.id];
        const node = nodes[Math.floor(hash(seq * 29) * nodes.length)];
        const capitalYi = +(0.05 + hash(seq * 37) * (scale === "大型" ? 8 : scale === "中型" ? 2 : 0.6)).toFixed(2);
        const paid = +(capitalYi * (0.7 + hash(seq * 41) * 0.3)).toFixed(2);
        const id = `E-${branch.branchNo || "X"}-${ind.id}-${i + 1}`;

        batch.push({
          id,
          name: `${ind.name.slice(0, 2)}${["华创", "智联", "精工", "科芯", "远景", "鼎盛"][i % 6]}${node.slice(0, 2)}有限公司`,
          chainId: ind.id,
          chain: ind.name,
          color: ind.color,
          colorSoft: ind.colorSoft,
          tier,
          tierScore: Math.round(90 - TIERS.indexOf(tier) * 18 + hash(seq) * 8),
          scale,
          stream,
          node,
          capital: capitalYi >= 1 ? `${capitalYi}亿` : `${Math.round(capitalYi * 10000)}万`,
          paidCapital: paid >= 1 ? `${paid}亿` : `${Math.round(paid * 10000)}万`,
          capitalYi,
          employees: Math.round(20 + hash(seq * 43) * (scale === "大型" ? 2000 : 400)),
          status: "存续",
          industry: ind.name + "相关制造业",
          phone: `028-${8800 + (seq % 900)}${1000 + (seq % 9000)}`.slice(0, 12),
          address: `${branch.city || "成都市"}${["高新区", "武侯区", "锦江区", "青羊区"][seq % 4]}${["天府大道", "交子大道", "人民南路", "科华北路"][seq % 4]}${100 + (seq % 80)}号`,
          coord: [lng0, lat0],
          symbolSize: TIER_SIZE[tier],
          itemColor: hexToRgba(ind.color, SCALE_ALPHA[scale]),
          creditLabel: Math.min(7, Math.max(1, 5 - TIERS.indexOf(tier) + (scale === "大型" ? 1 : 0))),
          settleActive: Math.round(40 + (3 - TIERS.indexOf(tier)) * 12 + hash(seq * 47) * 20),
          finance: {
            营收增长: +(5 + hash(seq * 51) * 30).toFixed(1),
            净利率: +(-2 + hash(seq * 57) * 14).toFixed(1),
            资产负债率: +(35 + hash(seq * 61) * 35).toFixed(1),
            流动比率: +(0.9 + hash(seq * 67) * 1.4).toFixed(2),
          },
          settleTrend: [0, 1, 2, 3, 4, 5].map((k) =>
            Math.round(35 + k * 6 + (3 - TIERS.indexOf(tier)) * 5 + hash(seq + k) * 8)
          ),
          /* 全维度画像补充字段 */
          establishYear: 2008 + Math.floor(hash(seq * 83) * 15),
          legalRep: ["王磊", "李婷", "张伟", "陈静"][seq % 4],
          equity: `实控人持股 ${55 + Math.floor(hash(seq * 89) * 30)}%`,
          bizChange: hash(seq * 91) > 0.55 ? "近12个月工商变更 2 次" : "近12个月无重大变更",
          settleFreq: `${20 + Math.floor(hash(seq * 93) * 60)} 笔/月`,
          settleScaleYi: +(0.2 + hash(seq * 95) * (scale === "大型" ? 4 : 1.2)).toFixed(2),
          settleStability: ["高", "中", "高", "中高"][seq % 4],
          creditApproveDays: 7 + Math.floor(hash(seq * 97) * 20),
          creditTimes: 1 + Math.floor(hash(seq * 99) * 4),
          creditPerf: hash(seq * 101) > 0.15 ? "履约正常" : "关注类",
          chainCircle: `${2 + Math.floor(hash(seq * 103) * 5)} 家链上核心伙伴`,
          discourse: tier === "核心层" ? "强" : tier === "骨干层" ? "较强" : "一般",
          needAppointment: hash(seq * 71) > 0.45,
          bankCustomersRelated: hash(seq * 73) > 0.35
            ? hash(seq * 74) > 0.55
              ? [
                  {
                    name: ["蜀都供应链有限公司", "天府装备股份", "锦江精密制造", "蓉城智造科技"][seq % 4],
                    relation: "上游供应商",
                    link: "采购合同",
                  },
                  {
                    name: ["鹏城电子股份", "湾区材料科技", "川江物流集团", "星河智造"][(seq + 1) % 4],
                    relation: "下游客户",
                    link: "销售回款",
                  },
                ]
              : [
                  {
                    name: ["蜀都供应链有限公司", "天府装备股份", "锦江精密制造", "蓉城智造科技"][seq % 4],
                    relation: ["上游供应商", "下游客户", "同一园区企业", "供应链交易对手"][seq % 4],
                    link: ["采购合同", "销售回款", "园区联营", "票据背书"][seq % 4],
                  },
                ]
            : [],
          advantages: pickAdvantages(ind, tier, stream, hash(seq * 79)),
          bidWin: hash(seq * 107) > 0.5,
          bidAmount: `${(0.4 + hash(seq * 109) * 2.8).toFixed(1)}亿`,
          bidProject: `${node}相关设备采购 / 产线升级`,
        });
      }
      list.push(...layoutInCircle(batch, [lng0, lat0], deg));
    });

    INDUSTRIES.forEach((ind) => {
      ind.count = list.filter((e) => e.chainId === ind.id).length;
    });

    return list;
  }

  function pickAdvantages(ind, tier, stream, h) {
    const pool = [
      `${ind.name}属地政策支持力度大，授信审批可通过绿色通道`,
      `处于产业链${stream}，对链主结算粘性高`,
      `${tier}地位，议价能力与现金流稳定性较好`,
      `近12个月结算活跃度持续上行，账户资金沉淀潜力大`,
      `园区/集群内上下游聚集，交叉营销空间明确`,
    ];
    const i = Math.floor(h * pool.length);
    return [pool[i], pool[(i + 1) % pool.length]];
  }

  function buildScoreBreakdown(ent) {
    const tierBase = { 核心层: 92, 骨干层: 78, 基础层: 62, 边缘层: 48 }[ent.tier] || 60;
    const scaleBase = { 大型: 88, 中型: 74, 小型: 60, 微型: 48 }[ent.scale] || 65;
    const settle = Number(ent.settleActive) || 50;
    const fin = ent.finance || {};
    const growth = Math.min(100, Math.max(0, 48 + Number(fin.营收增长 || 0) * 1.2));
    const margin = Math.min(100, Math.max(0, 52 + Number(fin.净利率 || 0) * 2.2));
    const leverage = Math.min(100, Math.max(0, 105 - Number(fin.资产负债率 || 55)));
    const financeScore = Math.round(growth * 0.4 + margin * 0.3 + leverage * 0.3);
    const weights = [
      {
        key: "链上地位",
        w: 0.35,
        score: tierBase,
        tip: `${ent.tier} · ${ent.stream}${ent.node ? " · " + ent.node : ""}`,
      },
      {
        key: "经营实力",
        w: 0.25,
        score: scaleBase,
        tip: `${ent.scale} · 注册资本 ${ent.capital}`,
      },
      {
        key: "结算活跃",
        w: 0.25,
        score: settle,
        tip: `近6期结算活跃分 ${settle}`,
      },
      {
        key: "财务健康",
        w: 0.15,
        score: financeScore,
        tip: `营收增长 ${fin.营收增长 ?? "—"}% · 净利率 ${fin.净利率 ?? "—"}%`,
      },
    ];
    const total = Math.round(weights.reduce((s, x) => s + x.score * x.w, 0));
    return { total, weights };
  }

  function buildPriority(ent, breakdown) {
    const reasons = [];
    const related = ent.bankCustomersRelated || [];
    if (ent.tier === "核心层" || ent.tier === "骨干层") {
      reasons.push(`${ent.tier}，产业链话语权${ent.discourse || "较强"}`);
    }
    if ((ent.settleActive || 0) >= 70) {
      reasons.push("结算活跃度高，账户迁徙与资金沉淀空间大");
    }
    if (related.length) {
      reasons.push(`可借力本行存量客户「${related[0].name}」引荐`);
    }
    if ((ent.finance?.营收增长 || 0) > 15) {
      reasons.push(`营收增长 ${ent.finance.营收增长}%，扩产融资窗口明确`);
    }
    if ((breakdown?.total || ent.tierScore || 0) >= 75) {
      reasons.push("链上地位综合分靠前，值得优先配置客户经理精力");
    }
    if (!reasons.length) {
      reasons.push("具备基础拓客价值，建议轻触达验证合作意向");
    }
    const high =
      related.length > 0 ||
      ent.tier === "核心层" ||
      ent.tier === "骨干层" ||
      (ent.settleActive || 0) >= 75;
    return {
      label: high ? "优先潜力协作客户" : "观察培育客户",
      reasons: reasons.slice(0, 3),
    };
  }

  /** 画像机会点：解释为何是潜在客户、建议如何触达 */
  function buildOpportunities(ent) {
    const ops = [];
    const related = ent.bankCustomersRelated || [];
    const seed = hash((ent.id || ent.name || "x").length * 17 + (ent.tierScore || 50));
    const growth = Number(ent.finance?.营收增长 || 0);
    const settle = Number(ent.settleActive || 0);

    if (related.length >= 2) {
      ops.push({
        tag: "关系触达",
        title: "上下游均为管户客户",
        why: `管户内已有「${related[0].name}」（${related[0].relation}）与「${related[1].name}」（${related[1].relation}），链上关系可验证、破冰成本低。`,
        action: "建议同步借力上下游引荐，约三方联合拜访，优先谈结算归行与供应链产品。",
      });
    } else if (related.length === 1) {
      const r = related[0];
      ops.push({
        tag: "关系触达",
        title: `借力存量「${r.name}」破冰`,
        why: `该企业与本行客户存在${r.relation}关系（${r.link || "交易往来"}），客户经理可复用已有信任链触达。`,
        action: `本周先联系「${r.name}」引荐采购/财务负责人，完成首次预约与需求摸底。`,
      });
    }

    if (seed > 0.42 || ent.bidWin) {
      const amount = ent.bidAmount || `${(0.3 + seed * 2.4).toFixed(1)}亿`;
      const project = ent.bidProject || `${ent.node || ent.chain || "产业"}扩产/设备更新项目`;
      ops.push({
        tag: "中标信号",
        title: "公开招投标近期中标",
        why: `招投标公开信息显示近 30 天中标「${project}」，金额约 ${amount}，后续设备采购与流动资金需求上升概率高。`,
        action: "建议携带项目贷 / 设备更新贷方案上门，核对中标合同与付款节奏后启动预授信。",
      });
    }

    if (growth >= 18) {
      ops.push({
        tag: "扩产窗口",
        title: "营收高增，融资需求可期",
        why: `近一期营收增长 ${growth}%，${ent.tier}地位下扩产或备货意愿较强，额度缺口往往先于报表体现。`,
        action: "建议测算授信空间，匹配流贷 + 票据组合，同步了解上下游账期是否拉长。",
      });
    }

    if (settle >= 68) {
      ops.push({
        tag: "结算机会",
        title: "结算活跃但份额可挖",
        why: `结算活跃度 ${settle}，链上交易已较频繁，若本行结算份额偏低，账户迁徙与资金沉淀空间明确。`,
        action: "拜访时重点谈基本户/结算户迁移，配套现金管理与代发，先做流量再做资产。",
      });
    }

    if (ent.tier === "核心层" || ent.tier === "骨干层") {
      ops.push({
        tag: "链主价值",
        title: `${ent.tier}具备整链辐射力`,
        why: `处于${ent.stream || "链上"}「${ent.node || ent.chain}」关键节点，话语权${ent.discourse || "较强"}，拿下后可沿链批量拓客。`,
        action: "按链主经营：先开结算、再核预授信，并请对方提供上下游各 3 家可引荐名单。",
      });
    }

    if (/低空|半导体|机器人|新能源|生物/.test(ent.chain || "") && seed > 0.28) {
      ops.push({
        tag: "政策窗口",
        title: "产业政策契合度高",
        why: `${ent.chain}属地支持力度大，设备更新、专精特新等专项申报窗口临近，政策贴息与银行融资可组合营销。`,
        action: "携带政策要点一页纸拜访，对接可申报项目与配套融资需求，锁定本周触达。",
      });
    }

    if (!ops.length) {
      ops.push({
        tag: "基础拓客",
        title: "具备建档培育价值",
        why: "工商存续、产业链节点清晰，可先轻触达验证合作意向与真实贸易背景。",
        action: "建议电话预约后上门，完成 KYC 与需求问卷，纳入观察池定期回访。",
      });
    }

    /* 去重 tag，最多展示 3 条，保证版面干净 */
    const seen = new Set();
    return ops
      .filter((o) => {
        if (seen.has(o.tag)) return false;
        seen.add(o.tag);
        return true;
      })
      .slice(0, 3);
  }

  /** 专家规则：可执行拜访建议（短句，便于客户经理直接执行） */
  function buildAdvice(ent, branchName) {
    const rules = [];
    const related = ent.bankCustomersRelated || [];
    const credit = window.MOCK?.creditLabels?.[ent.creditLabel] || "待评估";

    if (related.length) {
      rules.push({
        level: "高优先级",
        title: "借力存量引荐",
        action: `本周联系「${related[0].name}」引荐对接采购/财务，完成首次预约。`,
        reason: "",
      });
    }

    if (ent.needAppointment) {
      rules.push({
        level: "必做",
        title: "预约上门",
        action: `致电 ${ent.phone} 预约接待，备注「招行${branchName || "辖区支行"}客户经理」。`,
        reason: "",
      });
    } else {
      rules.push({
        level: "建议",
        title: "直接上门",
        action: `工作日上午携带结算+票据一页纸上门破冰。`,
        reason: "",
      });
    }

    if (ent.tier === "核心层" || ent.tier === "骨干层") {
      rules.push({
        level: "高优先级",
        title: "按链主经营",
        action: `纳入本周攻坚：先开结算户，匹配预授信「${credit}」，摸清上下游各3家。`,
        reason: "",
      });
    } else if (ent.tier === "边缘层") {
      rules.push({
        level: "观察",
        title: "轻触达转介",
        action: `不深耕授信；拜访时收集1–2家上游供应商线索带回支行。`,
        reason: "",
      });
    }

    if ((ent.finance?.营收增长 || 0) > 15) {
      rules.push({
        level: "机会",
        title: "扩产融资窗口",
        action: `首访询问近6个月备货资金缺口，准备流贷+贴现组合方案。`,
        reason: "",
      });
    }

    if (ent.settleActive >= 75) {
      rules.push({
        level: "机会",
        title: "结算切入",
        action: `优先谈工资代发或银票业务，先抓结算再谈授信。`,
        reason: "",
      });
    }

    if (rules.length < 2) {
      rules.push({
        level: "建议",
        title: "标准跟进",
        action: `拜访后24小时内录入CRM，并设定7日内二次跟进。`,
        reason: "",
      });
    }

    return rules.slice(0, 3);
  }

  function ranking() {
    return [...INDUSTRIES].sort((a, b) => b.score - a.score);
  }

  /** 任务二：产业链六维景气度（样例基准综合≈48） */
  const SIX_DIMS = [
    {
      name: "传导效率",
      base: 40.6,
      weight: 0.18,
      conf: 51,
      meaning: "账期偏长或传导低效环节，可作为供应链金融切入点",
    },
    {
      name: "价值分配",
      base: 50.7,
      weight: 0.15,
      conf: 18,
      meaning: "利润过度集中时，弱势环节议价与偿债能力承压",
    },
    {
      name: "供需匹配",
      base: 49.3,
      weight: 0.18,
      conf: 18,
      meaning: "供需错配环节库存压力大，存货类融资宜审慎",
    },
    {
      name: "企业协同度",
      base: 27.8,
      weight: 0.18,
      conf: 100,
      meaning: "高协同链适合整链批量开发，避免过度依赖单一链主",
    },
    {
      name: "断链风险",
      base: 45.5,
      weight: 0.16,
      conf: 80,
      meaning: "卡脖子节点风险传导快，亦具不可替代性与定价权",
    },
    {
      name: "外部环境",
      base: 79.2,
      weight: 0.15,
      conf: 100,
      meaning: "政策与周期共振时，适合整链营销与定制方案",
    },
  ];

  function sixDimScores(compositeScore) {
    const delta = (Number(compositeScore) || 48) - 48;
    return SIX_DIMS.map((d) => {
      const value = Math.round(Math.max(5, Math.min(98, d.base + delta * 0.55)) * 10) / 10;
      return { ...d, value };
    });
  }

  const _radarCharts = new WeakMap();

  function renderSixDimRadar(el, compositeScore, opts = {}) {
    if (!el || !window.echarts) return null;
    let chart = _radarCharts.get(el);
    if (!chart) {
      chart = echarts.init(el);
      _radarCharts.set(el, chart);
    }
    const dims = sixDimScores(compositeScore);
    const compact = !!opts.compact;
    chart.setOption(
      {
        tooltip: {
          trigger: "item",
          formatter: (p) => {
            const values = (p && p.value) || dims.map((d) => d.value);
            return dims
              .map(
                (d, i) =>
                  `<div style="margin:2px 0"><b>${d.name}</b> ${values[i]}　<span style="color:#999">权${(d.weight * 100).toFixed(0)}% · 信${d.conf}%</span><br/><span style="color:#666;font-size:11px">${d.meaning}</span></div>`
              )
              .join("");
          },
        },
        radar: {
          center: ["50%", compact ? "54%" : "52%"],
          radius: compact ? "58%" : "66%",
          splitNumber: 4,
          indicator: dims.map((d) => ({ name: d.name, max: 100 })),
          axisName: {
            color: "#6e6e6e",
            fontSize: compact ? 10 : 11,
            lineHeight: 14,
          },
          splitArea: { areaStyle: { color: ["#fff", "#faf8f8"] } },
          splitLine: { lineStyle: { color: "#ebe4e4" } },
          axisLine: { lineStyle: { color: "#e5dede" } },
        },
        series: [
          {
            type: "radar",
            symbol: "circle",
            symbolSize: compact ? 4 : 5,
            data: [
              {
                value: dims.map((d) => d.value),
                name: "六维景气",
                areaStyle: { color: "rgba(192,0,0,.16)" },
                lineStyle: { color: "#c00000", width: 2 },
                itemStyle: { color: "#c00000" },
              },
            ],
          },
        ],
      },
      true
    );
    return chart;
  }

  return {
    INDUSTRIES,
    TIERS,
    TIER_SIZE,
    SCALES,
    SCALE_ALPHA,
    SIX_DIMS,
    genEnterprises,
    layoutInCircle,
    buildAdvice,
    buildScoreBreakdown,
    buildPriority,
    buildOpportunities,
    ranking,
    sixDimScores,
    renderSixDimRadar,
    hexToRgba,
  };
})();
