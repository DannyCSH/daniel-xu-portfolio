(() => {
  const CM = window.CHAIN_META;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const perf = {
    month: [
      { name: "新增对公开户", done: 18, target: 25, unit: "户" },
      { name: "企业结算卡", done: 42, target: 60, unit: "张" },
      { name: "企业网银激活", done: 31, target: 40, unit: "户" },
      { name: "普惠贷款投放", done: 1.2, target: 2.0, unit: "亿" },
      { name: "供应链融资", done: 0.86, target: 1.5, unit: "亿" },
      { name: "有效客户净增", done: 22, target: 30, unit: "户" },
    ],
    year: [
      { name: "新增对公开户", done: 126, target: 180, unit: "户" },
      { name: "企业结算卡", done: 310, target: 420, unit: "张" },
      { name: "企业网银激活", done: 198, target: 280, unit: "户" },
      { name: "普惠贷款投放", done: 8.6, target: 12, unit: "亿" },
      { name: "供应链融资", done: 6.2, target: 9, unit: "亿" },
      { name: "有效客户净增", done: 154, target: 220, unit: "户" },
    ],
  };

  const sprints = [
    { t: "推进普惠贷款投放", d: "优先核验额度缺口客户，本周完成 2 笔投放" },
    { t: "完成高管拜访", d: "核心层企业至少 1 家高层陪访" },
    { t: "供应链名单触达", d: "围绕链主上下游生成拜访清单" },
    { t: "结算归行提升", d: "对结算偏低客户做产品组合方案" },
  ];

  const state = {
    view: "map",
    period: "month",
    industryId: "nev",
    branch: null,
    enterprises: [],
    customer: null,
    branchChart: null,
    customerCharts: {},
    boomCharts: {},
  };

  /* 管辖半径约 4.8km；视野放大让圆环约占画面 80% */
  const RADIUS_KM = 4.8;
  const RADIUS_DEG = RADIUS_KM / 111;

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function syncAsideMode(view) {
    const body = $(".ws-body");
    const left = $(".ws-panel.left");
    const right = $(".ws-panel.right");
    const rightMap = $("#asideRightMap");
    const rightBranch = $("#asideRightBranch");

    if (view === "customer") {
      body?.classList.add("focus-customer");
      if (left) left.hidden = true;
      if (right) right.hidden = true;
      return;
    }

    body?.classList.remove("focus-customer");
    if (left) left.hidden = false;
    if (right) right.hidden = false;

    const onBranch = view === "branch";
    if (rightMap) rightMap.hidden = onBranch;
    if (rightBranch) rightBranch.hidden = !onBranch;
    if (onBranch) {
      setTimeout(() => {
        renderIndustryBoom();
        Object.values(state.boomCharts || {}).forEach((c) => c?.resize?.());
      }, 40);
    }
  }

  function selectIndustry(id) {
    state.industryId = id;
    if ($("#industryFilter")) $("#industryFilter").value = id;
    if (state.view === "branch" || state.view === "customer") {
      renderIndustryTabs();
      if (state.view === "branch") {
        const ind = currentIndustry();
        const list = filteredEnterprises();
        $("#chainCountChip").textContent = `企业 ${list.length}`;
        $("#chainScoreChip").textContent = `景气 ${ind.score}`;
        renderBranchMap();
        renderIndustryBoom();
      }
    }
  }

  function navigate(view) {
    state.view = view;
    $$(".ws-map-stage .view-layer").forEach((v) =>
      v.classList.toggle("active", v.id === `view-${view}`)
    );
    const mapMode = view === "map";
    $("#mapToolbar").style.display = mapMode ? "flex" : "none";
    syncAsideMode(view);
    if (view === "map") {
      $("#centerTitle").textContent = "全国-城市-支行三级拓客入口";
      $("#centerHint").textContent = "全国省会飞线 · 放大可见街道与真实网点 · 点击进入辖区";
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
        window.MapNav?.getMap?.()?.invalidateSize?.();
      }, 60);
    }
    if (view === "branch" && state.branch) {
      renderBranch().then(() =>
        setTimeout(() => window.CmbStreetMap?.invalidateEnterpriseMap?.("branchMap"), 80)
      );
    }
    if (view === "customer" && state.customer) {
      setTimeout(() => {
        Object.values(state.customerCharts || {}).forEach((c) => c?.resize?.());
      }, 80);
    }
  }

  function renderPerf() {
    const list = perf[state.period];
    const avg = Math.round(
      list.reduce((s, m) => s + Math.min(100, (m.done / m.target) * 100), 0) / list.length
    );
    $("#rateLab").textContent = state.period === "month" ? "本月综合完成率" : "本年综合完成率";
    $("#rateVal").textContent = `${avg}%`;
    $("#perfList").innerHTML = list
      .map((m) => {
        const pct = Math.min(100, Math.round((m.done / m.target) * 100));
        const status = pct >= 85 ? "进度良好" : pct >= 65 ? "持续推进" : "需冲刺";
        return `<div class="metric">
          <div class="row1"><span>${m.name}</span><span class="pct">${pct}%</span></div>
          <div class="progress"><i style="width:${pct}%"></i></div>
          <div class="row2"><span>${m.done} / ${m.target} ${m.unit}</span><span>${status}</span></div>
        </div>`;
      })
      .join("");
  }

  function renderGaps() {
    const now = new Date();
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
    $("#daysNum").textContent = String(days);
    $("#daysLeft").textContent = "天 · 距本月末";
    $("#gapList").innerHTML = perf.month
      .map((m) => {
        const gap = +(m.target - m.done).toFixed(2);
        const pct = Math.round((m.done / m.target) * 100);
        const cls = pct < 65 ? "bad" : pct < 85 ? "warn" : "";
        return `<div class="gap-item">
          <i class="dot ${cls}"></i>
          <div>
            <div class="t">${m.name}</div>
            <div class="d">还差 ${gap}${m.unit}</div>
          </div>
        </div>`;
      })
      .join("");
    $("#sprintList").innerHTML = sprints
      .map(
        (a) => `<button type="button" class="action-card" data-go="map">
        <div><div class="t">${a.t}</div><div class="d">${a.d}</div></div>
        <span class="arrow">→</span>
      </button>`
      )
      .join("");
    $$("#sprintList [data-go]").forEach((b) => {
      b.onclick = () => navigate(b.dataset.go);
    });
  }

  function boomChartOf(id) {
    const el = document.getElementById(id);
    if (!el || !window.echarts) return null;
    if (!state.boomCharts[id] || state.boomCharts[id].isDisposed?.()) {
      state.boomCharts[id] = echarts.init(el);
    }
    return state.boomCharts[id];
  }

  /** 仅网点视图右侧：Top 景气 + 六维雷达 */
  function renderIndustryBoom() {
    if (state.view !== "branch") return;
    const ranked = CM.ranking();
    const months = ["2月", "3月", "4月", "5月", "6月", "7月"];
    const ind = currentIndustry();
    const tip = $("#boomBranchTip");
    if (tip && state.branch) {
      tip.textContent = `${state.branch.name || "辖区"} · 当前产业 ${ind.name}`;
    }

    const bar = boomChartOf("boomBarChart");
    if (bar) {
      const names = ranked.map((i) => i.name).reverse();
      const scores = ranked.map((i) => i.score).reverse();
      const colors = ranked.map((i) => i.color).reverse();
      bar.setOption(
        {
          grid: { left: 72, right: 36, top: 8, bottom: 8 },
          xAxis: {
            type: "value",
            min: 60,
            max: 100,
            splitLine: { lineStyle: { color: "#f0eaea" } },
            axisLabel: { fontSize: 10, color: "#8a8a8a" },
          },
          yAxis: {
            type: "category",
            data: names,
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: { fontSize: 11, color: "#2a2a2a", fontWeight: 650 },
          },
          series: [
            {
              type: "bar",
              data: scores.map((v, i) => ({
                value: v,
                itemStyle: {
                  color: colors[i],
                  borderRadius: [0, 4, 4, 0],
                  opacity: ranked.slice().reverse()[i]?.id === state.industryId ? 1 : 0.55,
                },
              })),
              barWidth: 12,
              label: {
                show: true,
                position: "right",
                fontSize: 11,
                fontWeight: 700,
                color: "#c00000",
              },
            },
          ],
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: (p) => `${p[0].name}<br/>景气度 ${p[0].value}`,
          },
        },
        true
      );
      bar.off("click");
      bar.on("click", (p) => {
        const hit = ranked.find((i) => i.name === p.name);
        if (hit) {
          selectIndustry(hit.id);
          toast(`已切换产业：${hit.name}`);
        }
      });
    }

    const trend = boomChartOf("boomTrendChart");
    if (trend) {
      const top3 = ranked.slice(0, 3);
      trend.setOption(
        {
          color: top3.map((i) => i.color),
          legend: {
            top: 0,
            right: 0,
            itemWidth: 10,
            itemHeight: 6,
            textStyle: { fontSize: 10, color: "#6e6e6e" },
          },
          grid: { left: 32, right: 8, top: 28, bottom: 24 },
          xAxis: {
            type: "category",
            data: months,
            axisLabel: { fontSize: 10, color: "#8a8a8a" },
            axisLine: { lineStyle: { color: "#eee" } },
            axisTick: { show: false },
          },
          yAxis: {
            type: "value",
            min: 60,
            max: 95,
            splitNumber: 3,
            splitLine: { lineStyle: { color: "#f3eeee" } },
            axisLabel: { fontSize: 10, color: "#8a8a8a" },
          },
          tooltip: { trigger: "axis" },
          series: top3.map((row) => ({
            name: row.name,
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 5,
            lineStyle: { width: 2 },
            data: row.trend || [],
          })),
        },
        true
      );
    }

    const scoreEl = $("#boomRadarScore");
    if (scoreEl) scoreEl.textContent = `综合 ${ind.score}`;
    const radarEl = $("#boomRadarChart");
    if (radarEl && CM.renderSixDimRadar) {
      const chart = CM.renderSixDimRadar(radarEl, ind.score, { compact: true });
      if (chart) state.boomCharts.boomRadarChart = chart;
    }
  }

  async function openBranch(d) {
    let branch = {
      id: d.id || "demo",
      branchNo: d.branchNo || "",
      name: d.fullName || d.name || "支行",
      city: d.city || "",
      address: d.address || "",
      phone: d.phone || "",
      coord: [
        Number(d.value?.[0] ?? d.coord?.[0]) || 104.0665,
        Number(d.value?.[1] ?? d.coord?.[1]) || 30.5723,
      ],
    };
    if (window.BranchAPI.enrichBranch) {
      branch = await window.BranchAPI.enrichBranch(branch);
    }
    state.branch = branch;
    state.enterprises = CM.genEnterprises(state.branch, RADIUS_KM);
    state.industryId = $("#industryFilter")?.value || CM.INDUSTRIES[0].id;
    navigate("branch");
    toast(`${state.branch.name.replace(/^招商银行/, "")} · 辖区已加载`);
  }

  function currentIndustry() {
    return CM.INDUSTRIES.find((x) => x.id === state.industryId) || CM.INDUSTRIES[0];
  }

  function filteredEnterprises() {
    return state.enterprises.filter((e) => e.chainId === state.industryId);
  }

  function circlePolygon(center, radius, n = 72) {
    const [lng, lat] = center;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([lng + Math.cos(a) * radius, lat + Math.sin(a) * radius * 0.85]);
    }
    return pts;
  }

  function inferCityAdcode(branch) {
    const city = String(branch.city || branch.name || "");
    const table = {
      成都: 510100,
      深圳: 440300,
      北京: 110100,
      上海: 310100,
      广州: 440100,
      杭州: 330100,
      南京: 320100,
      武汉: 420100,
      西安: 610100,
      重庆: 500100,
      天津: 120100,
      苏州: 320500,
    };
    for (const [k, code] of Object.entries(table)) {
      if (city.includes(k)) return code;
    }
    return 510100;
  }

  async function ensureCityMap(adcode) {
    const mapName = `city_${adcode}`;
    if (echarts.getMap(mapName)) return mapName;
    try {
      const res = await fetch(
        `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`
      );
      if (!res.ok) throw new Error("city geo fail");
      echarts.registerMap(mapName, await res.json());
      return mapName;
    } catch (_) {
      if (!echarts.getMap("china")) {
        try {
          const res = await fetch(
            "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json"
          );
          echarts.registerMap("china", await res.json());
        } catch (e) {
          return null;
        }
      }
      return "china";
    }
  }

  function renderIndustryTabs() {
    $("#industryTabs").innerHTML = CM.INDUSTRIES.map((ind) => {
      const active = ind.id === state.industryId;
      return `<button type="button" class="tab ${active ? "active" : ""}" data-id="${ind.id}">${ind.name}</button>`;
    }).join("");
    $$("#industryTabs .tab").forEach((btn) => {
      btn.onclick = () => selectIndustry(btn.dataset.id);
    });
  }

  async function renderBranchMap() {
    const ind = currentIndustry();
    const raw = filteredEnterprises();
    const list = CM.layoutInCircle(raw, state.branch.coord, RADIUS_DEG);

    if (window.CmbStreetMap?.renderEnterpriseMap) {
      state.branchChart = window.CmbStreetMap.renderEnterpriseMap("branchMap", {
        center: state.branch.coord,
        branchName: state.branch.name.replace(/^招商银行/, ""),
        enterprises: list,
        color: ind.color || "#c00000",
        radiusKm: RADIUS_KM,
        onEnterpriseClick: (e) => e?.id && openCustomer(e),
      });
      return;
    }

    /* 无 Leaflet 时回退 ECharts 城市底图 */
    const ring = circlePolygon(state.branch.coord, RADIUS_DEG);
    const scatter = list.map((e) => ({
      ...e,
      value: [...e.coord, e.symbolSize],
      itemStyle: {
        color: e.itemColor,
        borderColor: "#fff",
        borderWidth: 2,
      },
    }));
    const adcode = inferCityAdcode(state.branch);
    const mapName = (await ensureCityMap(adcode)) || "china";
    if (!state.branchChart || !state.branchChart.setOption) {
      state.branchChart = echarts.init($("#branchMap"));
    }
    state.branchChart.setOption(
      {
        animation: false,
        geo: {
          map: mapName,
          roam: true,
          center: state.branch.coord,
          zoom: mapName.startsWith("city_") ? 8.2 : 52,
        },
        series: [
          {
            name: "管辖范围",
            type: "lines",
            coordinateSystem: "geo",
            polyline: true,
            data: [{ coords: ring }],
            lineStyle: { color: ind.color, width: 2, type: "dashed" },
          },
          {
            name: "企业",
            type: "scatter",
            coordinateSystem: "geo",
            data: scatter,
            symbolSize: (val, p) => p.data.symbolSize,
          },
        ],
      },
      true
    );
    state.branchChart.off("click");
    state.branchChart.on("click", (params) => {
      if (params.seriesName === "企业" && params.data?.id) openCustomer(params.data);
    });
  }

  async function renderBranch() {
    if (!state.branch) return;
    const ind = currentIndustry();
    const list = filteredEnterprises();
    $("#branchTitle").textContent = state.branch.name;
    const bits = [
      state.branch.city,
      state.branch.address,
      state.branch.branchNo ? `No.${state.branch.branchNo}` : "",
    ].filter(Boolean);
    $("#branchSub").textContent = bits.join(" · ");
    $("#chainCountChip").textContent = `企业 ${list.length}`;
    $("#chainScoreChip").textContent = `景气 ${ind.score}`;
    renderIndustryTabs();
    CM.INDUSTRIES.forEach((x) => {
      x.count = state.enterprises.filter((e) => e.chainId === x.id).length;
    });
    await renderBranchMap();
  }

  function chartOf(id) {
    const el = document.getElementById(id);
    if (!el || !window.echarts) return null;
    let chart = state.customerCharts[id];
    if (!chart || chart.isDisposed?.()) {
      chart = echarts.init(el);
      state.customerCharts[id] = chart;
    }
    return chart;
  }

  function renderCustomerCharts(ent, breakdown) {
    const weights = breakdown.weights || [];
    const radar = chartOf("coScoreRadar");
    if (radar) {
      radar.setOption(
        {
          tooltip: { trigger: "item" },
          radar: {
            center: ["50%", "52%"],
            radius: "58%",
            splitNumber: 4,
            indicator: weights.map((w) => ({ name: w.key, max: 100 })),
            axisName: { color: "#6e6e6e", fontSize: 9 },
            splitArea: { areaStyle: { color: ["#fff", "#faf8f8"] } },
            splitLine: { lineStyle: { color: "#ebe4e4" } },
            axisLine: { lineStyle: { color: "#e5dede" } },
          },
          series: [
            {
              type: "radar",
              symbol: "circle",
              symbolSize: 4,
              data: [
                {
                  value: weights.map((w) => w.score),
                  name: "本企业",
                  areaStyle: { color: "rgba(192,0,0,.18)" },
                  lineStyle: { color: "#c00000", width: 2 },
                  itemStyle: { color: "#c00000" },
                },
              ],
            },
          ],
        },
        true
      );
    }

    const trend = ent.settleTrend || [40, 48, 52, 55, 60, ent.settleActive || 58];
    const settle = chartOf("coSettleChart");
    if (settle) {
      settle.setOption(
        {
          grid: { left: 36, right: 12, top: 24, bottom: 28 },
          tooltip: { trigger: "axis" },
          xAxis: {
            type: "category",
            data: ["T-5", "T-4", "T-3", "T-2", "T-1", "近月"],
            axisLabel: { fontSize: 10, color: "#8a8585" },
            axisLine: { lineStyle: { color: "#e8e2e0" } },
            axisTick: { show: false },
          },
          yAxis: {
            type: "value",
            min: 0,
            max: 100,
            splitLine: { lineStyle: { color: "#f0eaea" } },
            axisLabel: { fontSize: 10, color: "#8a8585" },
          },
          series: [
            {
              type: "line",
              smooth: true,
              data: trend,
              symbol: "circle",
              symbolSize: 6,
              lineStyle: { width: 2.5, color: "#c00000" },
              itemStyle: { color: "#c00000" },
              areaStyle: { color: "rgba(192,0,0,.12)" },
            },
          ],
        },
        true
      );
    }

    const fin = ent.finance || {};
    const growth = Math.min(40, Math.max(0, Number(fin.营收增长) || 0));
    const margin = Math.min(20, Math.max(-5, Number(fin.净利率) || 0));
    const lev = Math.min(100, Math.max(0, Number(fin.资产负债率) || 50));
    const finance = chartOf("coFinanceChart");
    if (finance) {
      finance.setOption(
        {
          grid: { left: 72, right: 40, top: 16, bottom: 20 },
          tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
          legend: {
            top: 0,
            right: 0,
            itemWidth: 10,
            textStyle: { fontSize: 10, color: "#8a8585" },
            data: ["本企业", "行业参考"],
          },
          xAxis: {
            type: "value",
            axisLabel: { fontSize: 10, color: "#8a8585" },
            splitLine: { lineStyle: { color: "#f0eaea" } },
          },
          yAxis: {
            type: "category",
            data: ["资产负债率%", "净利率%", "营收增长%"],
            axisLabel: { fontSize: 11, color: "#5c5757" },
            axisTick: { show: false },
            axisLine: { show: false },
          },
          series: [
            {
              name: "本企业",
              type: "bar",
              barWidth: 10,
              data: [lev, margin, growth],
              itemStyle: { color: "#c00000", borderRadius: [0, 3, 3, 0] },
              label: { show: true, position: "right", fontSize: 10, color: "#c00000" },
            },
            {
              name: "行业参考",
              type: "bar",
              barWidth: 10,
              data: [55, 6, 12],
              itemStyle: { color: "#d4cbcb", borderRadius: [0, 3, 3, 0] },
            },
          ],
        },
        true
      );
    }

    setTimeout(() => {
      Object.values(state.customerCharts).forEach((c) => c?.resize?.());
    }, 60);
  }

  function openCustomer(ent) {
    state.customer = ent;
    navigate("customer");
    const credit = window.MOCK?.creditLabels?.[ent.creditLabel] || `区间 ${ent.creditLabel}`;
    const breakdown = CM.buildScoreBreakdown?.(ent) || {
      total: ent.tierScore,
      weights: [],
    };

    $("#coName").textContent = ent.name;
    $("#coMeta").textContent = `${ent.id} · ${ent.chain} · ${ent.node || "—"}`;
    $("#coChips").innerHTML = [ent.tier, ent.scale, ent.stream, ent.chain, ent.status]
      .filter(Boolean)
      .map((t, i) => `<span class="chip ${i === 0 ? "gold" : ""}">${t}</span>`)
      .join("");

    $("#coBiz").innerHTML = [
      ["注册资本", ent.capital],
      ["实收资本", ent.paidCapital],
      ["从业人数", `${ent.employees}人`],
      ["授信区间", credit],
      ["结算活跃", ent.settleActive],
      ["联系电话", ent.phone],
    ]
      .map(
        ([k, v]) =>
          `<div class="cp-tile"><span class="k">${k}</span><strong class="v">${v}</strong></div>`
      )
      .join("");

    /* 拜访要点：聚焦现场执行，不与机会点「引荐破冰」重复 */
    const bullets = [];
    bullets.push(
      ent.needAppointment
        ? `预约节奏：提前 1–2 个工作日致电 ${ent.phone}，约财务负责人`
        : `上门窗口：建议工作日 9:30–11:30，携带名片与支行介绍函`
    );
    bullets.push(
      `携带材料：结算/票据一页纸、预授信「${credit}」测算、近 12 月流水要点`
    );
    bullets.push(
      `现场核验：上下游账期、设备采购节奏、基本户开立行与结算份额`
    );
    if (ent.address) {
      bullets.push(`地址确认：${ent.address}`);
    }
    $("#coVisit").innerHTML = bullets.map((b) => `<li>${b}</li>`).join("");

    $("#coScoreHero").innerHTML = `
      <div class="cp-score-label">链上地位</div>
      <div class="cp-score-num">${breakdown.total}</div>
      <div class="cp-score-meta">
        <div class="t">${ent.tier} · ${ent.stream}</div>
      </div>`;

    const opps = CM.buildOpportunities?.(ent) || [];
    const advice = CM.buildAdvice(ent, state.branch?.name || "辖区支行");
    /* 机会点自带建议动作；补充不重复的规则动作 */
    const used = new Set(opps.map((o) => o.tag + o.title));
    const extra = advice
      .filter((a) => !/引荐|破冰/.test(a.title + a.action))
      .filter((a) => ![...used].some((u) => a.title && u.includes(a.title.slice(0, 2))))
      .slice(0, Math.max(0, 3 - opps.length));

    const merged = [
      ...opps.map((o, i) => ({
        tag: o.tag,
        title: o.title,
        why: o.why,
        step: o.action,
        level: i === 0 ? "优先" : "建议",
      })),
      ...extra.map((a) => ({
        tag: a.level || "动作",
        title: a.title,
        why: "",
        step: a.action,
        level: a.level || "建议",
      })),
    ].slice(0, 3);

    $("#coOpps").innerHTML = merged
      .map(
        (o, i) => `<article class="cp-opp-card cp-opp-merged">
        <div class="top">
          <span class="tag">${o.tag}</span>
          <span class="lv">${o.level}</span>
        </div>
        <strong>${o.title}</strong>
        ${o.why ? `<p class="why">${o.why}</p>` : ""}
        <p class="act"><span>下一步</span>${o.step}</p>
      </article>`
      )
      .join("");

    renderCustomerCharts(ent, breakdown);
  }

  function bind() {
    $$("#periodSeg [data-period]").forEach((b) => {
      b.onclick = () => {
        state.period = b.dataset.period;
        $$("#periodSeg button").forEach((x) => x.classList.toggle("active", x === b));
        renderPerf();
      };
    });
    $$("[data-go]").forEach((b) => {
      b.onclick = () => navigate(b.dataset.go);
    });
    $("#btnResetMap").onclick = () => {
      window.__resetChinaMap?.() || window.MapNav?.resetView?.();
    };
    $("#btnVisitList").onclick = () => {
      toast("已按当前缺口生成拜访清单（演示）");
    };
    $("#industryFilter").onchange = (e) => {
      if (state.view === "branch" || state.view === "customer") selectIndustry(e.target.value);
      else state.industryId = e.target.value;
    };
    $$("#lodSeg [data-lod]").forEach((b) => {
      b.onclick = () => {
        $$("#lodSeg button").forEach((x) => x.classList.toggle("active", x === b));
        const lod = b.dataset.lod;
        if (window.MapNav?.setLod) {
          window.MapNav.setLod(lod);
          return;
        }
        if (lod === "nation") window.__resetChinaMap?.();
      };
    });
    window.__onBranchEnter = (d) => openBranch(d);
    window.addEventListener("resize", () => {
      window.CmbStreetMap?.invalidateEnterpriseMap?.("branchMap");
      state.branchChart?.resize?.();
      Object.values(state.customerCharts || {}).forEach((c) => c?.resize?.());
      Object.values(state.boomCharts || {}).forEach((c) => c?.resize?.());
    });
  }

  bind();
  renderPerf();
  renderGaps();
  navigate("map");
  toast("增量拓客工作台已就绪");
})();
