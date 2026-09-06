(function () {
  "use strict";

  const data = window.APP_DATA;
  const state = { view: "network", industry: "semiconductor", customer: 0, branch: 0, networkProvince: null, mapMetric: "customers", opportunityFilter: "all", policyFilter: "all", analysis: "industry", tasks: 8 };
  const charts = {};

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const industry = () => data.industries.find(item => item.id === state.industry) || data.industries[0];
  const currentCustomer = () => data.customers[state.customer] || data.customers[0];
  const currentBranch = () => data.branches[state.branch] || data.branches[0];
  const icon = name => `<i data-lucide="${name}"></i>`;
  const refreshIcons = () => window.lucide && window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });

  function showToast(message) {
    const toast = $("#toast");
    $("span", toast).textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function openDrawer(drawer) {
    closeDrawers();
    $(drawer).classList.add("open");
    $("#drawerBackdrop").classList.add("open");
  }

  function closeDrawers() {
    $$(".drawer").forEach(item => item.classList.remove("open"));
    $("#drawerBackdrop").classList.remove("open");
  }

  function openModal({ eyebrow = "DETAIL", title, body, primary = "创建营销任务", primaryAction }) {
    $("#modalEyebrow").textContent = eyebrow;
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = body;
    $("#modalPrimary").textContent = primary;
    $("#modalPrimary").onclick = () => {
      if (primaryAction) primaryAction();
      else createMarketingTask(title);
      closeModal();
    };
    $("#detailModal").classList.add("open");
    $("#modalBackdrop").classList.add("open");
    refreshIcons();
  }

  function closeModal() {
    $("#detailModal").classList.remove("open");
    $("#modalBackdrop").classList.remove("open");
  }

  function navigate(view) {
    state.view = view;
    if (window.location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
    $$(".view").forEach(item => item.classList.toggle("active", item.id === `view-${view}`));
    $$(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === view));
    $("#sidebar").classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      renderViewCharts(view);
      resizeCharts();
    }, 30);
  }

  function selectBranch(id, navigateAfter = true) {
    const index = data.branches.findIndex(branch => branch.id === id);
    if (index >= 0) state.branch = index;
    const branch = currentBranch();
    const option = Array.from($("#branchSelect").options).find(item => item.textContent === branch.name);
    if (option) $("#branchSelect").value = option.value;
    $("#dashboardSubtitle").textContent = `${branch.name} · 5km 管辖半径`;
    $("#mapBranchName").textContent = branch.short;
    $("#mapCompanyTotal").textContent = branch.customers;
    renderMap();
    if (navigateAfter) navigate("dashboard");
  }

  function initChart(id) {
    const node = $(`#${id}`);
    if (!node || !window.echarts) return null;
    if (!charts[id]) charts[id] = echarts.init(node, null, { renderer: "canvas" });
    return charts[id];
  }

  function resizeCharts() {
    Object.values(charts).forEach(chart => chart && chart.resize());
  }

  function renderIndustryStrip() {
    $("#industryStrip").innerHTML = data.industries.map(item => `
      <button class="industry-brief ${item.id === state.industry ? "active" : ""}" data-industry="${item.id}">
        <span class="industry-brief-icon">${icon(item.icon)}</span>
        <div><span>${item.name}</span><strong>${item.score}</strong></div>
        <small>${item.change >= 0 ? "+" : ""}${item.change}</small>
      </button>`).join("");
    refreshIcons();
  }

  function tierClass(tier) {
    return tier === "核心层" ? "core" : tier === "骨干层" ? "backbone" : tier === "基础层" ? "basic" : "edge";
  }

  function renderOpportunityTable() {
    let customers = data.customers;
    if (state.opportunityFilter === "核心层") customers = customers.filter(c => c.tier === "核心层");
    if (state.opportunityFilter === "高政策匹配") customers = customers.filter(c => c.policy >= 90);
    if (state.opportunityFilter === "额度缺口") customers = customers.filter(c => c.tags.includes("额度缺口"));
    $("#opportunityTable").innerHTML = customers.map((c, index) => `
      <tr data-customer-id="${c.id}">
        <td><div class="cell-company"><strong>${c.name}</strong><span>UID ${c.uid}</span></div></td>
        <td>${c.industry.replace("产业链", "")} · ${c.stage}/${c.node}</td>
        <td><span class="tier-tag ${tierClass(c.tier)}">${c.tier}</span></td>
        <td><span class="score-pill">${c.opportunity}</span></td>
        <td><strong>${c.credit}</strong></td>
        <td><span class="policy-tag">${c.policy}%</span></td>
        <td>${c.action}</td>
        <td><button class="row-action" data-open-customer="${c.id}" title="查看客户">${icon("arrow-up-right")}</button></td>
      </tr>`).join("");
    refreshIcons();
  }

  function renderNetworkBranchList(branches = data.branches.slice().sort((a, b) => b.opportunity - a.opportunity).slice(0, 6)) {
    $("#networkBranchList").innerHTML = branches.map((branch, index) => `
      <button data-branch-id="${branch.id}">
        <span class="branch-rank">${String(index + 1).padStart(2, "0")}</span>
        <span><strong>${branch.short}</strong><small>${branch.city} · ${branch.customers} 户重点企业</small></span>
        <b>${branch.opportunity}</b><i data-lucide="chevron-right"></i>
      </button>`).join("");
    refreshIcons();
  }

  function circleCoords(center, radius = 0.065) {
    return Array.from({ length: 73 }, (_, index) => {
      const angle = index / 72 * Math.PI * 2;
      return [center[0] + Math.cos(angle) * radius, center[1] + Math.sin(angle) * radius * 0.82];
    });
  }

  async function renderNetworkMap(reset = false) {
    const chart = initChart("networkMap");
    if (!chart) return;
    if (!echarts.getMap("china")) {
      try {
        const response = await fetch("assets/data/china.geojson");
        echarts.registerMap("china", await response.json());
      } catch (error) {
        $("#networkTip span").textContent = "地图加载失败，请通过本地服务打开页面";
        return;
      }
    }
    if (reset) state.networkProvince = null;
    const province = state.networkProvince;
    const capitalData = data.capitals.filter(item => !province || item.province === province).map(item => ({
      name: item.name, province: item.province, level: "capital", value: [...item.coord, 1]
    }));
    const branchData = data.branches.filter(item => province && item.province === province).map(item => ({
      name: item.short, id: item.id, level: "branch", fullName: item.name, customers: item.customers, opportunity: item.opportunity, value: [...item.coord, item.opportunity]
    }));
    const focus = province ? data.capitals.find(item => item.province === province) : null;
    chart.setOption({
      animationDuration: 550,
      tooltip: {
        trigger: "item", borderWidth: 0, backgroundColor: "rgba(32,35,39,.95)", textStyle: { color: "#fff", fontSize: 11 },
        formatter: params => params.data?.level === "branch"
          ? `<b>${params.data.fullName}</b><br/>重点企业 ${params.data.customers} 户<br/>区域机会指数 ${params.data.opportunity}`
          : params.data?.level === "capital" ? `<b>${params.name}</b><br/>点击查看${params.data.province}经营网点` : `<b>${params.name}</b><br/>点击进入属地网点层`
      },
      geo: {
        map: "china", roam: true, center: focus ? focus.coord : [104.2, 35.5], zoom: focus ? 4.8 : 1.18,
        scaleLimit: { min: 0.8, max: 12 },
        itemStyle: { areaColor: "#f2e7e8", borderColor: "#ffffff", borderWidth: 1.1 },
        emphasis: { itemStyle: { areaColor: "#dba9ae" }, label: { color: "#7f1720" } },
        select: { itemStyle: { areaColor: "#c76b74" } },
        label: { show: Boolean(province), color: "#74676a", fontSize: 9 }
      },
      series: [
        { type: "map", map: "china", geoIndex: 0, data: [] },
        { name: "省会节点", type: "effectScatter", coordinateSystem: "geo", data: capitalData, symbolSize: province ? 14 : 8, rippleEffect: { scale: 3, brushType: "stroke" }, itemStyle: { color: "#b41f2d" }, label: { show: true, formatter: "{b}", position: "right", color: "#5f5557", fontSize: 9 } },
        {
          name: "经营支行",
          type: "scatter",
          coordinateSystem: "geo",
          data: branchData,
          symbol: "pin",
          symbolSize: 34,
          itemStyle: { color: "#0b7568" },
          label: { show: false, formatter: "{b}", position: "right", color: "#202327", fontSize: 10, fontWeight: 700 },
          emphasis: {
            scale: true,
            label: {
              show: true,
              formatter: "{b}",
              position: "top",
              color: "#202327",
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: "rgba(255,255,255,0.92)",
              padding: [3, 6],
              borderRadius: 4,
            },
          },
        }
      ]
    }, true);
    $("#networkScopeLabel").textContent = province ? `${province} · 属地支行` : "全国 · 省会节点";
    $("#branchListSubtitle").textContent = province ? `${province}高潜网点` : "全国高潜区域";
    $("#networkTip span").textContent = province ? "点击绿色支行节点进入区域总览" : "点击省份进入属地网点层";
    renderNetworkBranchList(province ? data.branches.filter(item => item.province === province) : undefined);
    chart.off("click");
    chart.on("click", params => {
      if (params.data?.level === "branch") return selectBranch(params.data.id, true);
      const provinceName = params.data?.province || params.name;
      const hasCapital = data.capitals.some(item => item.province === provinceName);
      if (hasCapital) {
        state.networkProvince = provinceName;
        renderNetworkMap();
      }
    });
  }

  function runUnifiedSearch(query, target = "network") {
    const keyword = String(query || "").trim().toLowerCase();
    if (!keyword) return [];
    const branches = data.branches.filter(item => `${item.name}${item.short}${item.city}${item.province}`.toLowerCase().includes(keyword)).map(item => ({ type: "branch", item }));
    const customers = data.customers.filter(item => `${item.name}${item.uid}${item.industry}`.toLowerCase().includes(keyword)).map(item => ({ type: "customer", item }));
    const results = [...branches, ...customers].slice(0, 8);
    if (target === "network") {
      $("#networkSearchResults").innerHTML = results.length ? results.map(result => `
        <button data-search-type="${result.type}" data-search-id="${result.item.id}">
          <span class="search-result-icon">${icon(result.type === "branch" ? "landmark" : "building-2")}</span>
          <span><strong>${result.type === "branch" ? result.item.name : result.item.name}</strong><small>${result.type === "branch" ? `${result.item.city} · ${result.item.customers} 户重点企业` : `${result.item.industry} · UID ${result.item.uid}`}</small></span>
          <em>${result.type === "branch" ? "支行" : "企业"}</em>
        </button>`).join("") : `<p class="search-empty-state">未找到匹配支行或企业</p>`;
      refreshIcons();
    }
    return results;
  }

  function renderMap() {
    const chart = initChart("regionMap");
    if (!chart || !window.SHENZHEN_GEOJSON) return;
    echarts.registerMap("shenzhen", window.SHENZHEN_GEOJSON);
    const branch = currentBranch();
    const item = industry();
    if (branch.province !== "广东" && !echarts.getMap("china")) {
      fetch("assets/data/china.geojson").then(response => response.json()).then(geo => { echarts.registerMap("china", geo); renderMap(); });
      return;
    }
    const mapName = branch.province === "广东" || !echarts.getMap("china") ? "shenzhen" : "china";
    const selectedCustomers = data.customers.filter(customer => customer.industryId === state.industry);
    const points = selectedCustomers.map((c, index) => {
      const angle = (index * 137.5 + 25) * Math.PI / 180;
      const radius = 0.044 + (index % 3) * 0.008;
      const displayCoord = [branch.center[0] + Math.cos(angle) * radius, branch.center[1] + Math.sin(angle) * radius * 0.82];
      return ({
      name: c.name,
      value: [...displayCoord, c.creditLevel || Math.max(1, Math.ceil(c.creditNum / 2000))],
      tier: c.tier,
      id: c.id,
      district: c.district,
      action: c.action,
      registeredCapital: c.registeredCapital || "5,000万元",
      paidCapital: c.paidCapital || "3,200万元",
      stage: c.stage,
      node: c.node
      });
    });
    const tierSize = { "核心层": 30, "骨干层": 23, "基础层": 17, "边缘层": 12 };
    const colorLevels = {
      semiconductor: ["#f4d9dc", "#e8aeb4", "#d87b85", "#c24855", "#9f1724"],
      robot: ["#d7eee9", "#9fd4ca", "#62b4a5", "#278f80", "#075f55"],
      nev: ["#dce9f6", "#abc9e7", "#76a7d5", "#4d83ba", "#285b91"],
      biomed: ["#fff0ca", "#efd28b", "#dcb255", "#bd8426", "#8d5c11"],
      lowalt: ["#e5e4ef", "#c2c0da", "#9895bd", "#716e9e", "#4d4a78"]
    };
    const activeColors = colorLevels[state.industry];
    $("#mapIndustryCount").textContent = `${item.short} · ${selectedCustomers.length} 户样例 / ${branch.customers} 户识别`;
    chart.setOption({
      animationDuration: 500,
      tooltip: {
        trigger: "item",
        borderWidth: 0,
        backgroundColor: "rgba(36,38,40,.94)",
        textStyle: { color: "#fff", fontSize: 10 },
        formatter: params => {
          if (params.seriesName === "产业企业") return `<b>${params.data.name}</b><br/>注册资本：${params.data.registeredCapital}<br/>实收资本：${params.data.paidCapital}<br/>产业位置：${params.data.stage} · ${params.data.node}<br/>企业分层：${params.data.tier}<br/>预测授信等级：L${params.value[2]}`;
          if (params.seriesName === "支行中心") return `<b>${branch.name}</b><br/>5km 管辖半径 · ${branch.customers} 户链上企业`;
          return `<b>${params.name || branch.city}</b>`;
        }
      },
      geo: {
        map: mapName,
        roam: true,
        center: branch.center,
        zoom: mapName === "shenzhen" ? 2.35 : 7.5,
        itemStyle: { areaColor: "#f5f1f1", borderColor: "#ffffff", borderWidth: 1.5 },
        emphasis: { itemStyle: { areaColor: "#ead8da" }, label: { color: "#6e1b24" } },
        label: { show: true, color: "#6d6264", fontSize: 9 }
      },
      series: [
        { type: "map", map: mapName, geoIndex: 0, data: [] },
        { name: "管辖边界", type: "lines", coordinateSystem: "geo", polyline: true, silent: true, data: [{ coords: circleCoords(branch.center) }], lineStyle: { color: item.color, width: 2, type: "dashed", opacity: .85 }, effect: { show: true, period: 8, trailLength: .12, symbolSize: 4, color: item.color } },
        { name: "管辖区", type: "custom", coordinateSystem: "geo", silent: true, renderItem: (params, api) => { const center = api.coord(branch.center); const edge = api.coord([branch.center[0] + .065, branch.center[1]]); return { type: "circle", shape: { cx: center[0], cy: center[1], r: Math.abs(edge[0] - center[0]) }, style: { fill: `${item.color}14`, stroke: "transparent" } }; }, data: [0], z: 1 },
        {
          name: "支行中心",
          type: "effectScatter",
          coordinateSystem: "geo",
          data: [{ name: branch.short, value: [...branch.center, 1] }],
          symbol: "pin",
          symbolSize: 42,
          rippleEffect: { scale: 2.4, brushType: "stroke" },
          itemStyle: { color: "#202327" },
          label: { show: false, formatter: "{b}", position: "right", color: "#202327", fontWeight: 700, fontSize: 10 },
          emphasis: {
            label: {
              show: true,
              position: "top",
              color: "#202327",
              fontWeight: 700,
              fontSize: 11,
              backgroundColor: "rgba(255,255,255,0.92)",
              padding: [3, 6],
              borderRadius: 4,
            },
          },
          z: 5,
        },
        {
          name: "产业企业", type: "effectScatter", coordinateSystem: "geo", data: points,
          symbolSize: (val, params) => tierSize[params.data.tier] || 13,
          rippleEffect: { scale: 2.5, brushType: "stroke" },
          itemStyle: { color: params => activeColors[Math.max(0, Math.min(4, params.value[2] - 1))], borderColor: "#fff", borderWidth: 1.5, shadowBlur: 10, shadowColor: item.color }
        }
      ]
    }, true);
    chart.off("click");
    chart.on("click", params => {
      if (params.data && params.data.id) selectCustomer(params.data.id, true);
    });
  }

  function renderIndustryRanking() {
    const ranked = data.industries.slice().sort((a, b) => b.score - a.score);
    $("#industryRanking").innerHTML = ranked.map((item, index) => `
      <button class="${item.id === state.industry ? "active" : ""}" data-rank-industry="${item.id}">
        <span>${index + 1}</span><i style="background:${item.color}"></i><strong>${item.short}</strong>
        <b>${item.score}</b><em class="${item.change >= 0 ? "up" : "down"}">${item.change >= 0 ? "↑" : "↓"} ${Math.abs(item.change)}</em>
      </button>`).join("");
  }

  function renderBranchAnalysis() {
    const content = {
      industry: { icon: "network", title: `${industry().short}处于${industry().grade}阶段`, text: "设备与核心材料节点订单活跃度连续三个月上升，区域核心层企业结算回流稳定。", evidence: "证据：链上交易额环比 +12.6%，政策命中 38 户，预测融资需求 9.6 亿元。", action: "行动：优先走访核心层和授信 L4-L5 企业，携设备更新政策清单核实扩产计划。" },
      competitor: { icon: "git-compare-arrows", title: "同节点竞争加剧，但客户技术壁垒仍具优势", text: "区域内新增 3 家同类设备企业，价格竞争增强；目标客户研发强度和头部客户覆盖仍领先。", evidence: "证据：研发费用率 14.2%，高于同节点中位数 5.6pct；前五大客户稳定合作超过 3 年。", action: "行动：拜访时确认毛利率变化与在手订单，额度方案设置订单回款闭环。" },
      upstream: { icon: "waypoints", title: "上游供应稳定，下游回款集中度需持续观察", text: "关键材料供应商经营正常；下游前三大客户贡献 42% 收入，存在一定集中度风险。", evidence: "证据：8 家核心上下游中 3 家为本行客户，可交叉验证近 6 个月结算表现。", action: "行动：由本行合作客户引荐，核验真实贸易背景并优先设计供应链融资方案。" }
    }[state.analysis];
    $("#branchAnalysisContent").innerHTML = `<span class="analysis-icon">${icon(content.icon)}</span><div><h3>${content.title}</h3><p>${content.text}</p></div><div class="analysis-evidence"><span>${content.evidence}</span><strong>${content.action}</strong></div>`;
    refreshIcons();
  }

  function renderIndustryHeader() {
    const item = industry();
    $("#industrySubtitle").textContent = `${item.name} · ${currentBranch().city}区域分析`;
    $("#industryScore").textContent = item.score;
    $("#industryGrade").textContent = item.grade;
    $("#industryCompanies").textContent = item.companies;
    $("#industryCore").textContent = item.core;
    $("#industryDemand").textContent = item.demand;
    $("#aiContext").textContent = `${currentBranch().short} · ${item.name}`;
  }

  function renderProsperityTrend() {
    const chart = initChart("prosperityTrend");
    if (!chart) return;
    const item = industry();
    const months = ["8月","9月","10月","11月","12月","1月","2月","3月","4月","5月","6月","7月","8月E","9月E","10月E"];
    const actual = [...item.trend, null, null, null];
    const forecast = [...Array(11).fill(null), item.trend[11], ...item.forecast];
    chart.setOption({
      grid: { left: 40, right: 22, top: 30, bottom: 32 },
      tooltip: { trigger: "axis" },
      legend: { top: 6, right: 16, itemWidth: 12, textStyle: { fontSize: 9 }, data: ["历史景气度", "AI预测"] },
      xAxis: { type: "category", data: months, boundaryGap: false, axisLine: { lineStyle: { color: "#dfe3e6" } }, axisLabel: { color: "#7d858b", fontSize: 8 } },
      yAxis: { type: "value", min: 50, max: 100, splitLine: { lineStyle: { color: "#edf0f2" } }, axisLabel: { fontSize: 8, color: "#899096" } },
      series: [
        { name: "历史景气度", type: "line", smooth: true, data: actual, symbol: "circle", symbolSize: 5, lineStyle: { width: 2, color: "#b41f2d" }, itemStyle: { color: "#b41f2d" }, areaStyle: { color: "rgba(180,31,45,.08)" } },
        { name: "AI预测", type: "line", smooth: true, data: forecast, symbol: "emptyCircle", symbolSize: 5, lineStyle: { width: 2, type: "dashed", color: "#0b7568" }, itemStyle: { color: "#0b7568" } }
      ]
    }, true);
  }

  function renderProsperityRadar() {
    const chart = initChart("prosperityRadar");
    if (!chart) return;
    const base = Math.round(industry().score);
    chart.setOption({
      tooltip: {},
      radar: { center: ["50%","52%"], radius: "67%", splitNumber: 4, indicator: ["传导效率","价值分配","供需匹配","企业协同","断链韧性","外部环境"].map(name => ({ name, max: 100 })), axisName: { color: "#737b81", fontSize: 9 }, splitArea: { areaStyle: { color: ["#fff", "#fafbfb"] } }, splitLine: { lineStyle: { color: "#e6eaed" } }, axisLine: { lineStyle: { color: "#e1e5e8" } } },
      series: [{ type: "radar", data: [{ value: [base+2,base-7,base+5,base-1,base-10,base+4].map(v => Math.max(45,Math.min(96,v))), areaStyle: { color: "rgba(180,31,45,.18)" }, lineStyle: { color: "#b41f2d", width: 2 }, itemStyle: { color: "#b41f2d" } }] }]
    }, true);
  }

  function renderTierChart() {
    const chart = initChart("tierChart");
    if (!chart) return;
    chart.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { top: 4, right: 14, itemWidth: 11, textStyle: { fontSize: 8 } },
      grid: { left: 72, right: 22, top: 42, bottom: 25 },
      xAxis: { type: "value", max: 65, axisLabel: { formatter: "{value}%", fontSize: 8 }, splitLine: { lineStyle: { color: "#edf0f2" } } },
      yAxis: { type: "category", data: ["边缘层","基础层","骨干层","核心层"], axisLabel: { fontSize: 9 }, axisLine: { show: false }, axisTick: { show: false } },
      series: [
        { name: "深圳区域", type: "bar", data: [12,46,29,13], barWidth: 9, itemStyle: { color: "#b41f2d" } },
        { name: "全行样本", type: "bar", data: [18,51,23,8], barWidth: 9, itemStyle: { color: "#b8bec3" } }
      ]
    }, true);
  }

  function renderChainFlow() {
    const fallback = data.chains.semiconductor;
    const stages = data.chains[state.industry] || fallback;
    $("#chainFlow").innerHTML = stages.map(stage => `<section class="chain-stage"><div class="chain-stage-title"><span>${stage.title}</span><b>${stage.count} 户</b></div>${stage.nodes.map(node => `<button class="chain-node ${node.risk ? "risk" : ""}" data-chain-node="${node.name}"><div><strong>${node.name}</strong><span>${node.risk ? "集中度偏高 · 建议关注替代性" : "交易活跃度保持稳定"}</span></div><b>${node.score}</b></button>`).join("")}</section>`).join("");
  }

  function renderSignals() {
    const items = [
      { icon: "arrow-left-right", title: "链上结算活跃度", text: "近 30 天交易笔数提升", value: "+12.8%" },
      { icon: "chart-no-axes-combined", title: "下游订单景气", text: "汽车电子订单增速领先", value: "+8.3%" },
      { icon: "triangle-alert", title: "进口设备价格", text: "汇率与交付周期波动", value: "+6.1%", warn: true },
      { icon: "clock-3", title: "平均结算账期", text: "链上回款速度改善", value: "-4.2天" }
    ];
    $("#signalList").innerHTML = items.map(item => `<div class="signal-item"><span class="signal-icon ${item.warn ? "warn" : ""}">${icon(item.icon)}</span><div><strong>${item.title}</strong><span>${item.text}</span></div><b class="${item.warn ? "warn" : ""}">${item.value}</b></div>`).join("");
    refreshIcons();
  }

  function renderPolicyFeed() {
    const policies = state.policyFilter === "all" ? data.policies : data.policies.filter(p => p.level === state.policyFilter);
    $("#policyFeed").innerHTML = policies.map(p => `<article class="policy-item" data-policy-id="${p.id}"><div class="policy-date"><strong>${p.day}</strong><span>${p.month}</span></div><div class="policy-body"><h3>${p.title}</h3><p>${p.summary}</p><div class="policy-meta"><span class="policy-level">${p.level}</span><span>${p.source} · 截止 ${p.deadline}</span></div></div><div class="match-score"><strong>${p.match}%</strong><span>匹配度</span></div></article>`).join("");
  }

  function renderPolicyImpact() {
    const chart = initChart("policyImpact");
    if (!chart) return;
    chart.setOption({
      grid: { left: 76, right: 24, top: 16, bottom: 22 },
      xAxis: { type: "value", max: 100, splitLine: { lineStyle: { color: "#edf0f2" } }, axisLabel: { fontSize: 8 } },
      yAxis: { type: "category", data: data.industries.map(i => i.short), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 8 } },
      series: [{ type: "bar", data: [74,78,81,88,93], barWidth: 12, itemStyle: { color: params => ["#9ba3a9","#b97919","#0b7568","#386ca8","#b41f2d"][params.dataIndex], borderRadius: [0,3,3,0] }, label: { show: true, position: "right", fontSize: 8 } }]
    }, true);
  }

  function renderPolicyMatches() {
    $("#policyMatches").innerHTML = data.customers.slice().sort((a,b) => b.policy-a.policy).slice(0,5).map(c => `<div class="compact-customer" data-customer-id="${c.id}"><span class="compact-avatar">${c.logo}</span><div><strong>${c.name}</strong><span>${c.action} · ${c.credit}</span></div><b>${c.policy}%</b></div>`).join("");
  }

  function renderCustomerList(query = "") {
    const keyword = query.trim().toLowerCase();
    const customers = data.customers.filter(c => !keyword || c.name.toLowerCase().includes(keyword) || c.uid.includes(keyword));
    $("#customerList").innerHTML = customers.map(c => `<button class="customer-list-item ${c.id === currentCustomer().id ? "active" : ""}" data-customer-id="${c.id}"><span class="compact-avatar">${c.logo}</span><div><strong>${c.name}</strong><span>${c.tier} · ${c.action}</span></div><b>${c.opportunity}</b></button>`).join("");
  }

  function selectCustomer(id, navigateAfter = false) {
    const index = data.customers.findIndex(c => c.id === id);
    if (index >= 0) state.customer = index;
    renderCustomerProfile();
    if (navigateAfter) navigate("customer");
  }

  function renderCustomerProfile() {
    const c = currentCustomer();
    $("#companyLogo").textContent = c.logo;
    $("#companyName").textContent = c.name;
    $("#companyMeta").textContent = `${c.node} · ${c.district} · ${c.size} · UID ${c.uid}`;
    $("#companyTags").innerHTML = c.tags.map(tag => `<span>${tag}</span>`).join("");
    $("#customerOpportunity").textContent = c.opportunity;
    $("#predictedCredit").textContent = c.credit;
    $("#creditGap").textContent = `较存量敞口 ${c.gap}`;
    $("#settlement").textContent = c.settlement;
    $("#deposit").textContent = c.deposit;
    $("#chainTier").textContent = c.tier;
    $("#chainRank").textContent = `链上排名 ${Math.max(8, 100-c.opportunity)} / ${industry().companies}`;
    $("#policyMatchScore").textContent = `${c.policy}%`;
    $("#customerAddress").textContent = c.address || `深圳市${c.district}重点产业园`;
    $("#customerPhone").textContent = c.phone || "0755-8888 0000";
    $("#visitAppointment").textContent = c.appointment || "建议提前 1 个工作日预约财务负责人";
    $("#visitReferral").textContent = c.referral || "存在本行合作客户可协助验证上下游交易关系";
    $("#visitAction").textContent = c.nextAction || `本周围绕${c.action}安排一次需求访谈`;
    $("#visitEvidence").textContent = `依据：${c.evidence || `${c.tags.join("、")}、政策契合度 ${c.policy}%`}`;
    $("#recommendationEvidence").textContent = `${c.tags.join("、")}，结算与交易网络共同支持当前机会判断；建议围绕真实贸易背景设计闭环，并对${c.risk === "高" ? "研发现金流和临床里程碑" : "交易对手集中度"}设置动态监测。`;
    renderCustomerList($("#customerListSearch") ? $("#customerListSearch").value : "");
    renderRecommendations(c);
    if (state.view === "customer") renderCustomerCharts();
  }

  function renderRecommendations(c) {
    const products = [
      { icon: "landmark", name: c.action, desc: `建议额度 ${c.credit} · 匹配核心经营场景`, tag: "首选" },
      { icon: "receipt-text", name: "票据池 / 供应链融资", desc: "盘活上下游应收与票据资产", tag: "组合" },
      { icon: "circle-dollar-sign", name: "现金管理与代发", desc: "提升结算回流和资金沉淀", tag: "增值" }
    ];
    $("#recommendations").innerHTML = products.map(p => `<div class="recommendation-item"><span class="recommendation-icon">${icon(p.icon)}</span><div><strong>${p.name}</strong><span>${p.desc}</span></div><b>${p.tag}</b></div>`).join("");
    refreshIcons();
  }

  function renderCustomerCharts() {
    const c = currentCustomer();
    const radar = initChart("customerRadar");
    if (radar) radar.setOption({
      radar: { center: ["50%","54%"], radius: "65%", indicator: ["链上地位","经营表现","企业实力","政策契合","授信空间","风险韧性"].map(name => ({ name, max: 100 })), axisName: { color: "#737b81", fontSize: 8 }, splitArea: { areaStyle: { color: ["#fff","#fafbfb"] } }, splitLine: { lineStyle: { color: "#e5e9ec" } }, axisLine: { lineStyle: { color: "#e5e9ec" } } },
      series: [{ type: "radar", data: [{ value: [c.opportunity,c.opportunity-5,Math.min(94,c.opportunity+1),c.policy,Math.min(96,c.opportunity+4),c.risk === "高" ? 58 : c.risk === "中" ? 72 : 88], areaStyle: { color: "rgba(180,31,45,.16)" }, lineStyle: { color: "#b41f2d", width: 2 }, itemStyle: { color: "#b41f2d" } }] }]
    }, true);
    const trend = initChart("customerTrend");
    if (trend) trend.setOption({
      tooltip: { trigger: "axis" }, legend: { top: 6, right: 14, itemWidth: 10, textStyle: { fontSize: 8 } },
      grid: { left: 42, right: 24, top: 42, bottom: 28 },
      xAxis: { type: "category", data: ["8月","9月","10月","11月","12月","1月","2月","3月","4月","5月","6月","7月"], axisLabel: { fontSize: 8 }, axisLine: { lineStyle: { color: "#dfe3e6" } } },
      yAxis: [{ type: "value", axisLabel: { fontSize: 8 }, splitLine: { lineStyle: { color: "#edf0f2" } } }, { type: "value", axisLabel: { fontSize: 8 }, splitLine: { show: false } }],
      series: [
        { name: "结算量", type: "bar", data: [1820,1960,2050,2140,2360,2280,2420,2510,2630,2740,2910,3260], barMaxWidth: 18, itemStyle: { color: "#d9a0a6" } },
        { name: "日均存款", type: "line", yAxisIndex: 1, smooth: true, data: [2620,2780,2860,3010,3220,3180,3410,3620,3790,3980,4310,4860], lineStyle: { color: "#0b7568", width: 2 }, itemStyle: { color: "#0b7568" } }
      ]
    }, true);
    const network = initChart("customerNetwork");
    if (network) network.setOption({
      tooltip: {},
      series: [{ type: "graph", layout: "force", roam: true, force: { repulsion: 280, edgeLength: [55,95] }, label: { show: true, fontSize: 8 }, edgeSymbol: ["none","arrow"], edgeSymbolSize: 5,
        data: [
          { name: c.logo, symbolSize: 54, itemStyle: { color: "#b41f2d" }, label: { color: "#fff", fontWeight: "bold" } },
          { name: "晶圆厂A", symbolSize: 35, itemStyle: { color: "#386ca8" } }, { name: "材料商B", symbolSize: 31, itemStyle: { color: "#0b7568" } },
          { name: "设备商C", symbolSize: 28, itemStyle: { color: "#b97919" } }, { name: "电子集团D", symbolSize: 33, itemStyle: { color: "#5c6186" } }, { name: "汽车电子E", symbolSize: 25, itemStyle: { color: "#849198" } }
        ],
        links: [
          { source: c.logo, target: "晶圆厂A", value: 32 }, { source: "材料商B", target: c.logo, value: 18 }, { source: "设备商C", target: c.logo, value: 14 }, { source: c.logo, target: "电子集团D", value: 21 }, { source: c.logo, target: "汽车电子E", value: 9 }
        ],
        lineStyle: { color: "source", opacity: .45, curveness: .12, width: 1.5 }
      }]
    }, true);
  }

  function renderMarketing() {
    const funnel = initChart("marketingFunnel");
    if (funnel) funnel.setOption({
      tooltip: { trigger: "item", formatter: "{b}: {c}户" },
      series: [{ type: "funnel", left: "12%", top: 20, bottom: 18, width: "76%", minSize: "32%", maxSize: "100%", sort: "descending", gap: 3, label: { show: true, position: "inside", formatter: "{b}  {c}", color: "#fff", fontSize: 9 }, itemStyle: { borderColor: "#fff", borderWidth: 1 }, data: [
        { value: 186, name: "AI圈选", itemStyle: { color: "#8e989f" } }, { value: 124, name: "已触达", itemStyle: { color: "#5c7d88" } }, { value: 47, name: "有意向", itemStyle: { color: "#0b7568" } }, { value: 18, name: "方案中", itemStyle: { color: "#b97919" } }, { value: 9, name: "审批落地", itemStyle: { color: "#b41f2d" } }
      ] }]
    }, true);
    renderAgenda();
    const groups = { stageTodo: data.customers.slice(0,2), stageContacted: data.customers.slice(2,4), stageProposal: data.customers.slice(4,6), stageWon: data.customers.slice(6,8) };
    Object.entries(groups).forEach(([id, customers]) => {
      $(`#${id}`).innerHTML = customers.map(c => `<article class="campaign-item ${c.opportunity >= 88 ? "high" : ""}" data-customer-id="${c.id}"><strong>${c.name}</strong><span>${c.action} · ${c.tier}</span><footer><b>${c.credit}</b><em>${c.owner}</em></footer></article>`).join("");
    });
  }

  function renderAgenda() {
    $("#agendaList").innerHTML = data.agenda.map((item,index) => `<div class="agenda-item"><button class="agenda-check" data-agenda="${index}" aria-label="标记完成"></button><span class="agenda-time">${item.time}</span><div><strong>${item.title}</strong><span>${item.desc}</span></div><span class="agenda-type">${item.type}</span></div>`).join("");
  }

  function renderSources() {
    const groups = [
      { title: "当前原型中的样例数据", items: [
        ["区域客户与授信", "样例", "替换为任务一预测结果、客户 UID、存量授信、行政区划与经纬度。"],
        ["产业链景气与企业分层", "样例", "替换为任务二输出：六维评分、趋势、链上节点、企业层级与置信度。"],
        ["结算与客户画像", "样例", "替换为行内结算、存款、票据、交易对手、财务、客户经理与跟进记录。"]
      ]},
      { title: "建议接入的官方 / 公开来源", items: [
        ["国家统计局 · 国家数据", "外部", "宏观、工业增加值、价格与行业指标。<br><a href='https://data.stats.gov.cn/' target='_blank'>data.stats.gov.cn</a>"],
        ["深圳政府在线 · 政策公开", "外部", "属地产业规划、专项资金、申报通知与政策解读。<br><a href='https://www.sz.gov.cn/' target='_blank'>sz.gov.cn</a>"],
        ["巨潮资讯 · 上市公司公告", "外部", "年报、订单、产能、资本开支与重大事项。<br><a href='https://www.cninfo.com.cn/' target='_blank'>cninfo.com.cn</a>"],
        ["国家企业信用信息公示系统", "外部", "工商登记、经营状态与行政处罚；实际接入需遵守授权与反爬要求。<br><a href='https://www.gsxt.gov.cn/' target='_blank'>gsxt.gov.cn</a>"],
        ["行业价格 / 大宗商品 API", "实时", "满足任务二实时源要求，可采购合规行情 API；保留时间戳、来源和失败降级。"]
      ]},
      { title: "落地治理要求", items: [
        ["主键与时点", "规则", "统一客户 UID、产业链/节点代码、统计周期和数据版本，禁止跨时点混算。"],
        ["模型可解释性", "规则", "每个评分保留指标值、标准化方法、权重、来源、更新时间与贡献度。"],
        ["权限与脱敏", "规则", "按机构、客户经理和角色授权；交易对手、额度与联系方式需最小化展示并留审计日志。"]
      ]}
    ];
    $("#sourceContent").innerHTML = groups.map(group => `<section class="source-group"><h3>${group.title}</h3>${group.items.map(item => `<div class="source-item"><div class="source-head"><strong>${item[0]}</strong><span class="source-status ${item[1] === "实时" ? "real" : ""}">${item[1]}</span></div><p>${item[2]}</p></div>`).join("")}</section>`).join("");
  }

  function showMethodology() {
    openModal({
      eyebrow: "SCORING METHOD",
      title: "评分口径与决策边界",
      primary: "查看数据血缘",
      primaryAction: () => openDrawer("#sourceDrawer"),
      body: `<div class="detail-grid"><div><span>产业链景气度</span><strong>行内 60% + 行外 40%</strong></div><div><span>企业营销价值</span><strong>链上地位 35% + 经营 40% + 实力 25%</strong></div><div><span>机会评分</span><strong>企业价值 + 授信缺口 + 政策时点</strong></div><div><span>稳定性约束</span><strong>同输入多次评分波动 ≤ 10 分</strong></div></div><p>所有分值均用于客户经理排序和辅助判断，不替代授信审批、反洗钱、合规审查与人工尽调。生产环境应展示指标贡献度、数据时点、置信区间和异常数据提示。</p><div class="modal-callout"><strong>建议答辩表达</strong><p>看板不把 AI 包装成“自动决策者”，而是把任务一、任务二的模型产出变成可解释、可追踪、可执行的经营动作。</p></div>`
    });
  }

  function showPolicyDetail(policy) {
    openModal({
      eyebrow: `${policy.level} · 政策匹配`, title: policy.title,
      body: `<p>${policy.summary}</p><div class="detail-grid"><div><span>发布来源</span><strong>${policy.source}</strong></div><div><span>客户匹配度</span><strong>${policy.match}%</strong></div><div><span>匹配存量客户</span><strong>${policy.customers} 户</strong></div><div><span>申报窗口</span><strong>${policy.deadline}</strong></div></div><div class="modal-callout"><strong>AI 解读</strong><p>优先筛选产业节点吻合、近 12 月设备类交易增长、预测可批额度高于存量敞口的企业，并结合专项申报截止日安排触达节奏。</p></div>`
    });
  }

  function showStrategyDetail(type) {
    const content = {
      policy: ["政策窗口触达", "圈选政策契合度 ≥ 85%、设备类交易增长、90 天内存在额度缺口的企业。建议由产品经理携政策清单联合拜访。"],
      chain: ["沿链拓客", "从核心层客户交易网络中识别尚未建档或结算份额偏低的上下游，按交易稳定度和替代性排序形成拓客名单。"],
      credit: ["额度激活", "对预测获批额度显著高于存量敞口的客户，核验资金用途与现金流后推荐流贷、票据池或供应链组合方案。"]
    }[type];
    openModal({ eyebrow: "AI STRATEGY", title: content[0], body: `<p>${content[1]}</p><div class="detail-grid"><div><span>建议客户数</span><strong>${type === "chain" ? "31" : type === "policy" ? "12" : "18"} 户</strong></div><div><span>预计资产机会</span><strong>${type === "credit" ? "5.8亿元" : "3.2亿元"}</strong></div><div><span>主要产品</span><strong>流贷 / 票据 / 供应链</strong></div><div><span>模型置信度</span><strong>87%</strong></div></div>` });
  }

  function createMarketingTask(subject) {
    state.tasks += 1;
    $("#taskBadge").textContent = state.tasks;
    showToast(`已创建营销任务：${subject}`);
  }

  function askAI(question) {
    if (!question.trim()) return;
    const stream = $("#chatStream");
    stream.insertAdjacentHTML("beforeend", `<div class="chat-message user"><div><p>${question}</p></div></div>`);
    const response = question.includes("5 户") || question.includes("拜访")
      ? "建议优先：智芯半导体、深能储科、鹏城机器人、海源生物、云岭低空。\n排序依据：机会分、政策窗口、额度缺口与近 30 天交易信号。"
      : question.includes("额度")
        ? "当前识别 18 户额度提升空间较大，合计缺口约 5.8 亿元。智芯半导体、深能储科与云岭低空应优先核验资金用途。"
        : "建议开展“政策筛选 → 链上验证 → 额度测算 → 产品组合 → 人工尽调”的五步营销。已圈选 12 户高匹配企业，可生成任务清单。";
    setTimeout(() => {
      stream.insertAdjacentHTML("beforeend", `<div class="chat-message assistant"><div class="chat-avatar">${icon("bot")}</div><div><p>${response}</p></div></div>`);
      refreshIcons();
      stream.scrollTop = stream.scrollHeight;
    }, 350);
    stream.scrollTop = stream.scrollHeight;
  }

  function renderViewCharts(view) {
    if (view === "network") renderNetworkMap();
    if (view === "dashboard") renderMap();
    if (view === "industry") { renderProsperityTrend(); renderProsperityRadar(); renderTierChart(); }
    if (view === "policy") renderPolicyImpact();
    if (view === "customer") renderCustomerCharts();
    if (view === "marketing") renderMarketing();
  }

  function updateIndustry(id) {
    state.industry = id;
    $("#industrySelect").value = id;
    renderIndustryHeader();
    renderIndustryStrip();
    renderChainFlow();
    renderSignals();
    renderIndustryRanking();
    renderBranchAnalysis();
    if (state.view === "dashboard") renderMap();
    if (state.view === "industry") renderViewCharts("industry");
  }

  function bindEvents() {
    $$(".nav-item").forEach(button => button.addEventListener("click", () => navigate(button.dataset.view)));
    $$('[data-nav]').forEach(button => button.addEventListener("click", () => navigate(button.dataset.nav)));
    $("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
    $("#industrySelect").addEventListener("change", event => updateIndustry(event.target.value));
    $("#branchSelect").addEventListener("change", event => { const branch = data.branches.find(item => item.id === event.target.value); if (branch) selectBranch(branch.id, false); renderIndustryHeader(); showToast("经营机构已切换，区域指标已刷新"); });
    $("#industryStrip").addEventListener("click", event => { const button = event.target.closest("[data-industry]"); if (button) updateIndustry(button.dataset.industry); });
    $("#opportunityFilters").addEventListener("click", event => { const b = event.target.closest("button"); if (!b) return; $$("button", $("#opportunityFilters")).forEach(x => x.classList.toggle("active",x===b)); state.opportunityFilter = b.dataset.filter; renderOpportunityTable(); });
    $("#opportunityTable").addEventListener("click", event => { const row = event.target.closest("tr"); if (row) selectCustomer(row.dataset.customerId, true); });
    $("#policyFilters").addEventListener("click", event => { const b = event.target.closest("button"); if (!b) return; $$("button", $("#policyFilters")).forEach(x => x.classList.toggle("active",x===b)); state.policyFilter = b.dataset.policyFilter; renderPolicyFeed(); });
    $("#policyFeed").addEventListener("click", event => { const item = event.target.closest("[data-policy-id]"); if (item) showPolicyDetail(data.policies.find(p => p.id === item.dataset.policyId)); });
    $("#policyMatches").addEventListener("click", event => { const item = event.target.closest("[data-customer-id]"); if (item) selectCustomer(item.dataset.customerId, true); });
    $("#customerList").addEventListener("click", event => { const item = event.target.closest("[data-customer-id]"); if (item) selectCustomer(item.dataset.customerId); });
    $("#customerListSearch").addEventListener("input", event => renderCustomerList(event.target.value));
    $("#globalSearch").addEventListener("keydown", event => { if (event.key === "Enter") { const results = runUnifiedSearch(event.target.value, "global"); if (results[0]?.type === "branch") selectBranch(results[0].item.id, true); else if (results[0]?.type === "customer") selectCustomer(results[0].item.id, true); else showToast("未找到匹配支行或企业"); } });
    $("#previousCustomer").addEventListener("click", () => { state.customer = (state.customer - 1 + data.customers.length) % data.customers.length; renderCustomerProfile(); });
    $("#nextCustomer").addEventListener("click", () => { state.customer = (state.customer + 1) % data.customers.length; renderCustomerProfile(); });
    $("#createTask").addEventListener("click", () => createMarketingTask(currentCustomer().name));
    $("#createPlan").addEventListener("click", () => { openDrawer("#aiDrawer"); askAI(`为${currentCustomer().name}生成一页式营销方案`); });
    $("#openSources").addEventListener("click", () => openDrawer("#sourceDrawer"));
    $("#openMethod").addEventListener("click", showMethodology);
    $("#aiFab").addEventListener("click", () => openDrawer("#aiDrawer"));
    $("#drawerBackdrop").addEventListener("click", closeDrawers);
    $$(".drawer-close").forEach(button => button.addEventListener("click", closeDrawers));
    $("#modalBackdrop").addEventListener("click", closeModal);
    $$(".modal-close").forEach(button => button.addEventListener("click", closeModal));
    $("#refreshStrategy").addEventListener("click", event => { event.currentTarget.classList.add("spin"); setTimeout(() => event.currentTarget.classList.remove("spin"),500); showToast("策略已按最新样例数据刷新"); });
    $("#resetNetworkMap").addEventListener("click", () => renderNetworkMap(true));
    $("#networkBranchList").addEventListener("click", event => { const item = event.target.closest("[data-branch-id]"); if (item) selectBranch(item.dataset.branchId, true); });
    const searchNetwork = () => runUnifiedSearch($("#networkSearch").value);
    $("#networkSearchButton").addEventListener("click", searchNetwork);
    $("#networkSearch").addEventListener("input", searchNetwork);
    $("#networkSearch").addEventListener("keydown", event => { if (event.key === "Enter") searchNetwork(); });
    $("#networkSearchResults").addEventListener("click", event => { const item = event.target.closest("[data-search-id]"); if (!item) return; item.dataset.searchType === "branch" ? selectBranch(item.dataset.searchId, true) : selectCustomer(item.dataset.searchId, true); });
    $("#industryRanking").addEventListener("click", event => { const item = event.target.closest("[data-rank-industry]"); if (item) updateIndustry(item.dataset.rankIndustry); });
    $("#analysisTabs").addEventListener("click", event => { const button = event.target.closest("button"); if (!button) return; $$("button", $("#analysisTabs")).forEach(item => item.classList.toggle("active", item === button)); state.analysis = button.dataset.analysis; renderBranchAnalysis(); });
    $("#branchPolicyButton").addEventListener("click", () => { const keyword = $("#branchPolicySearch").value.trim() || "设备更新"; const matches = data.customers.filter(item => item.tags.some(tag => tag.includes(keyword)) || item.action.includes(keyword)); $("#branchPolicyResult").textContent = `“${keyword}”匹配 ${Math.max(matches.length, 6)} 户存量客户，最高契合度 ${matches.length ? Math.max(...matches.map(item => item.policy)) : 91}%`; });
    $("#scheduleVisit").addEventListener("click", () => { createMarketingTask(currentCustomer().name); showToast("已将拜访建议加入今日行动清单"); });
    $("#chainFlow").addEventListener("click", event => { const node = event.target.closest("[data-chain-node]"); if (node) openModal({ eyebrow: "CHAIN NODE", title: node.dataset.chainNode, body: `<p>该节点已融合企业数量、交易规模、集中度、账期与外部供需信号。生产环境可继续下钻企业名单和交易网络。</p><div class="detail-grid"><div><span>节点景气度</span><strong>82.4</strong></div><div><span>链上企业</span><strong>173 户</strong></div><div><span>交易集中度</span><strong>42%</strong></div><div><span>断链风险</span><strong>中高</strong></div></div>` }); });
    $("#policyScan").addEventListener("click", () => showToast("扫描完成：新增 2 条政策，匹配 11 户客户"));
    $("#policySubscribe").addEventListener("click", () => showToast("已订阅半导体、机器人、低空经济政策"));
    $("#compareIndustry").addEventListener("click", () => openModal({ eyebrow: "INDUSTRY COMPARE", title: "五大产业链景气对比", body: `<div class="detail-grid">${data.industries.map(i => `<div><span>${i.name}</span><strong>${i.score} · ${i.grade}</strong></div>`).join("")}</div><div class="modal-callout"><strong>区域建议</strong><p>低空经济增速最快，半导体确定性更强；建议以半导体承接资产规模、以低空经济建立新客储备。</p></div>` }));
    $("#industryReport").addEventListener("click", () => showToast("产业链分析报告已生成（演示）"));
    $("#newCampaign").addEventListener("click", () => openModal({ eyebrow: "NEW CAMPAIGN", title: "新建营销战役", body: `<div class="detail-grid"><div><span>目标产业链</span><strong>${industry().name}</strong></div><div><span>经营机构</span><strong>${currentBranch().name}</strong></div><div><span>建议圈选</span><strong>32 户</strong></div><div><span>预计资产机会</span><strong>2.6 亿元</strong></div></div><p>系统将依据政策命中、企业分层、预测额度缺口和客户经理管户关系形成名单，创建后仍需人工确认。</p>` }));
    $("#agendaList").addEventListener("click", event => { const button = event.target.closest(".agenda-check"); if (button) { button.classList.toggle("done"); showToast(button.classList.contains("done") ? "任务已完成" : "任务已恢复"); } });
    $("#completeAll").addEventListener("click", () => { $$(".agenda-check").forEach(b => b.classList.add("done")); showToast("今日行动已全部标记完成"); });
    $("#chatForm").addEventListener("submit", event => { event.preventDefault(); askAI($("#chatInput").value); $("#chatInput").value = ""; });
    $("#promptSuggestions").addEventListener("click", event => { const b = event.target.closest("button"); if (b) askAI(b.textContent); });
    $$('[data-action="export"]').forEach(button => button.addEventListener("click", () => window.print()));
    $("#notificationButton").addEventListener("click", () => showToast("3 条政策提醒，2 条风险信号待查看"));
    window.addEventListener("resize", resizeCharts);
    document.addEventListener("keydown", event => { if (event.key === "Escape") { closeDrawers(); closeModal(); } });
  }

  function init() {
    $("#branchSelect").innerHTML = data.branches.map(branch => `<option value="${branch.id}">${branch.name}</option>`).join("");
    renderIndustryStrip();
    renderOpportunityTable();
    renderIndustryHeader();
    renderChainFlow();
    renderSignals();
    renderPolicyFeed();
    renderPolicyMatches();
    renderCustomerProfile();
    renderSources();
    renderAgenda();
    renderNetworkBranchList();
    renderIndustryRanking();
    renderBranchAnalysis();
    bindEvents();
    refreshIcons();
    const initialView = window.location.hash.replace("#", "");
    if (["network", "dashboard", "industry", "policy", "customer", "marketing"].includes(initialView)) navigate(initialView);
    else renderNetworkMap();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
