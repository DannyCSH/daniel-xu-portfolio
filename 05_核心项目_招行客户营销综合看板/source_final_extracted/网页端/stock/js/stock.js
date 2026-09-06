(() => {
  const D = window.APP_DATA;
  const R = window.AGENT_REPORT;
  if (!D || !R) return;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const VIEWS = ["board", "path", "policy", "portrait"];
  const NAV_VIEWS = ["board", "path", "policy"];
  const RISK_COLOR = { 低: "#0f7a4d", 中: "#b8860b", 高: "#c00000" };

  D.customers.forEach((c, idx) => {
    const seed = (idx + 1) * 17;
    c.deltaSettle = ((seed % 21) - 6) * (seed % 2 === 0 ? 1 : -1);
    c.deltaDeposit = ((seed % 13) - 4) * 0.8;
    c.depositNum = parseFloat(String(c.deposit || "0").replace(/[^\d,]/g, "").replace(/,/g, "")) || 0;
  });

  /* 把库内客户并入可点画像池；报告 Top 企业映射到演示画像 */
  const firmPool = [];
  R.topFirms.forEach((f, i) => {
    const linked = D.customers.find((c) => c.industryId === "semiconductor") || D.customers[i % D.customers.length];
    firmPool.push({
      ...f,
      portraitId: linked.id,
      name: `${f.node} · 节点企业`,
      displayName: f.node,
    });
  });
  D.customers.forEach((c) => {
    firmPool.push({
      id: c.id,
      portraitId: c.id,
      score: c.opportunity || 70,
      tier: c.tier,
      node: c.node || c.name,
      displayName: c.name.replace(/有限公司|股份有限公司/g, ""),
      name: c.name,
      reason: c.action || "库内经营",
      industryId: c.industryId,
      status: c.policy || 80,
      ops: Math.max(40, 55 + (c.deltaSettle || 0)),
      strength: c.opportunity || 70,
      city: c.district || "",
      isBook: true,
    });
  });

  let policyQuery = "";
  let currentPolicyId = (D.policies && D.policies[0]?.id) || null;
  let view = "board";
  let branch = null; /* good | bad */
  let industryId = "semiconductor";
  let currentCustomerId = D.customers[0].id;
  let currentFirm = null;
  const charts = {};

  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function customer() {
    return D.customers.find((c) => c.id === currentCustomerId) || D.customers[0];
  }

  function chartOf(id) {
    const el = document.getElementById(id);
    if (!el || !window.echarts) return null;
    if (!charts[id] || charts[id].isDisposed?.()) charts[id] = echarts.init(el);
    return charts[id];
  }

  function resizeCharts() {
    Object.values(charts).forEach((c) => c?.resize?.());
  }

  function isHealthy() {
    return R.meta.composite >= R.meta.healthyThreshold;
  }

  function firmsOfIndustry(id) {
    return firmPool
      .filter((f) => f.industryId === id)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }

  function syncNav(name) {
    $$("#flowSteps [data-step]").forEach((el) => {
      el.classList.toggle("on", NAV_VIEWS.includes(name) && el.dataset.step === name);
    });
  }

  function showView(name, { skipHash } = {}) {
    if (!VIEWS.includes(name)) name = "board";
    view = name;
    $$(".st-stage .view-layer").forEach((v) =>
      v.classList.toggle("active", v.id === `view-${name}`)
    );
    syncNav(name);
    if (!skipHash && window.location.hash !== `#${name}`) {
      history.replaceState(null, "", `#${name}`);
    }
    if (name === "board") renderBoard();
    if (name === "path") renderPath();
    if (name === "policy") renderPolicyPage();
    if (name === "portrait") renderPortrait();
    setTimeout(resizeCharts, 40);
  }

  function selectFirm(firm) {
    currentFirm = firm;
    currentCustomerId = firm.portraitId || firm.id;
    showView("portrait");
  }

  function renderBoard() {
    const tierPie = chartOf("boardTierPie");
    if (tierPie) {
      const colors = ["#c00000", "#e07070", "#b8860b", "#94a3b8"];
      tierPie.setOption(
        {
          tooltip: { trigger: "item" },
          legend: { bottom: 0, textStyle: { fontSize: 10 } },
          series: [
            {
              type: "pie",
              radius: ["38%", "66%"],
              center: ["50%", "44%"],
              label: { fontSize: 10, formatter: "{b}\n{d}%" },
              data: R.tiers.map((t, i) => ({
                name: t.name,
                value: t.count,
                itemStyle: { color: colors[i] },
              })),
            },
          ],
        },
        true
      );
    }

    const stream = chartOf("boardStream");
    if (stream) {
      const s = R.coverage.stream;
      stream.setOption(
        {
          grid: { left: 40, right: 16, top: 16, bottom: 28 },
          xAxis: { type: "category", data: ["上游", "中游", "下游"] },
          yAxis: { type: "log", splitLine: { lineStyle: { color: "#f0eaea" } } },
          series: [
            {
              type: "bar",
              data: [s["上游"], s["中游"], s["下游"]],
              barWidth: 28,
              itemStyle: { color: "#c00000", borderRadius: [4, 4, 0, 0] },
              label: { show: true, position: "top", fontSize: 10 },
            },
          ],
        },
        true
      );
    }

    const book = chartOf("boardBook");
    if (book) {
      const list = D.customers;
      const tiers = ["核心层", "骨干层", "基础层", "边缘层"];
      const risks = ["低", "中", "高"];
      const RISK_C = { 低: "#0f7a4d", 中: "#b8860b", 高: "#c00000" };
      book.setOption(
        {
          tooltip: { trigger: "axis" },
          legend: { top: 0, textStyle: { fontSize: 10 } },
          grid: { left: 40, right: 12, top: 28, bottom: 28 },
          xAxis: { type: "category", data: tiers, axisLabel: { fontSize: 10 } },
          yAxis: {
            type: "value",
            minInterval: 1,
            splitLine: { lineStyle: { color: "#f0eaea" } },
          },
          series: risks.map((r) => ({
            name: r + "风险",
            type: "bar",
            stack: "book",
            barWidth: 22,
            itemStyle: { color: RISK_C[r] },
            data: tiers.map(
              (t) => list.filter((c) => c.tier === t && c.risk === r).length
            ),
          })),
        },
        true
      );
    }

    const scatter = chartOf("boardOppScatter");
    if (scatter) {
      scatter.setOption(
        {
          tooltip: {
            formatter: (p) => {
              const v = p.data?.value || p.data;
              return `${v[3]}<br/>政策 ${v[0]}% · 机会 ${v[1]} · 风险 ${v[4]}`;
            },
          },
          grid: { left: 44, right: 16, top: 20, bottom: 36 },
          xAxis: {
            name: "政策契合%",
            nameLocation: "middle",
            nameGap: 22,
            min: 75,
            max: 100,
            splitLine: { lineStyle: { color: "#f0eaea" } },
            axisLabel: { fontSize: 10 },
          },
          yAxis: {
            name: "机会分",
            min: 70,
            max: 100,
            splitLine: { lineStyle: { color: "#f0eaea" } },
            axisLabel: { fontSize: 10 },
          },
          series: [
            {
              type: "scatter",
              data: D.customers.map((c) => ({
                value: [
                  c.policy || 80,
                  c.opportunity || 70,
                  c.deltaSettle || 0,
                  c.name.replace(/有限公司|股份有限公司/g, ""),
                  c.risk,
                  c.id,
                ],
                itemStyle: {
                  color:
                    c.risk === "高" ? "#c00000" : c.risk === "中" ? "#b8860b" : "#0f7a4d",
                },
              })),
              symbolSize: (data) => {
                const risk = data?.[4];
                return risk === "高" ? 18 : risk === "中" ? 14 : 11;
              },
              markLine: {
                silent: true,
                symbol: "none",
                lineStyle: { type: "dashed", color: "#ddd" },
                data: [{ xAxis: 90 }, { yAxis: 85 }],
              },
            },
          ],
        },
        true
      );
      scatter.off("click");
      scatter.on("click", (p) => {
        const id = p.data?.value?.[5] ?? p.data?.[5];
        if (id) {
          currentFirm = null;
          currentCustomerId = id;
          showView("portrait");
        }
      });
    }

    const settleBar = chartOf("boardSettleBar");
    if (settleBar) {
      const sorted = [...D.customers].sort(
        (a, b) => (a.deltaSettle || 0) - (b.deltaSettle || 0)
      );
      settleBar.setOption(
        {
          tooltip: {
            trigger: "axis",
            formatter: (p) => {
              const c = sorted[p[0].dataIndex];
              return `${c.name}<br/>结算变动 ${c.deltaSettle > 0 ? "+" : ""}${c.deltaSettle}%`;
            },
          },
          grid: { left: 100, right: 28, top: 12, bottom: 24 },
          xAxis: {
            type: "value",
            axisLabel: { formatter: "{value}%", fontSize: 10 },
            splitLine: { lineStyle: { color: "#f0eaea" } },
          },
          yAxis: {
            type: "category",
            data: sorted.map((c) => c.name.replace(/有限公司|股份有限公司/g, "")),
            axisLabel: { fontSize: 10 },
          },
          series: [
            {
              type: "bar",
              data: sorted.map((c) => ({
                value: c.deltaSettle || 0,
                itemStyle: {
                  color: (c.deltaSettle || 0) >= 0 ? "#0f7a4d" : "#c00000",
                  borderRadius: [0, 3, 3, 0],
                },
              })),
              barWidth: 12,
              label: {
                show: true,
                position: "right",
                fontSize: 10,
                formatter: (p) => `${p.value > 0 ? "+" : ""}${p.value}%`,
              },
            },
          ],
        },
        true
      );
      settleBar.off("click");
      settleBar.on("click", (p) => {
        const c = sorted[p.dataIndex];
        if (c) {
          currentFirm = null;
          currentCustomerId = c.id;
          showView("portrait");
        }
      });
    }

    const focus = [...D.customers]
      .filter(
        (c) =>
          /核心|骨干/.test(c.tier) ||
          (c.opportunity || 0) >= 85 ||
          c.risk === "高" ||
          c.risk === "中" ||
          (c.deltaSettle || 0) <= -5
      )
      .sort(
        (a, b) =>
          (b.opportunity || 0) + (b.policy || 0) - ((a.opportunity || 0) + (a.policy || 0))
      );
    const tbody = $("#boardFocusTable");
    if (tbody) {
      tbody.innerHTML = focus
        .map((c) => {
          const ind =
            (D.industries.find((i) => i.id === c.industryId) || {}).short || "—";
          const ds = c.deltaSettle || 0;
          const dsCls = ds >= 0 ? "st-delta-up" : "st-delta-down";
          return `<tr data-cid="${c.id}">
            <td>${c.name.replace(/有限公司|股份有限公司/g, "")}</td>
            <td>${ind}</td>
            <td>${c.tier}</td>
            <td class="num">${c.opportunity}</td>
            <td>${c.policy}%</td>
            <td class="${dsCls}">${ds > 0 ? "+" : ""}${ds}%</td>
            <td><span class="st-risk ${c.risk === "高" ? "hi" : c.risk === "中" ? "mid" : ""}">${c.risk}</span></td>
            <td>${c.action || "跟进"}</td>
          </tr>`;
        })
        .join("");
      $$("#boardFocusTable tr").forEach((tr) => {
        tr.onclick = () => {
          currentFirm = null;
          currentCustomerId = tr.dataset.cid;
          showView("portrait");
        };
      });
    }
  }

  function renderPath() {
    if (!branch) {
      branch = isHealthy() ? "good" : "bad";
    }
    $("#pathGood").hidden = branch !== "good";
    $("#pathBad").hidden = branch !== "bad";

    if (branch === "good") {
      const pos = R.dims.filter((d) => d.positive || d.score >= 55);
      const neg = R.dims.filter((d) => !d.positive && d.score < 55);
      const posBar = chartOf("pathPosBar");
      if (posBar) {
        const rows = [...pos, ...neg.slice(0, 2)];
        posBar.setOption(
          {
            grid: { left: 72, right: 36, top: 8, bottom: 8 },
            xAxis: { type: "value", max: 100 },
            yAxis: {
              type: "category",
              data: rows.map((d) => d.name).reverse(),
            },
            series: [
              {
                type: "bar",
                data: rows
                  .map((d) => ({
                    value: d.score,
                    itemStyle: {
                      color: d.positive || d.highlight === "policy" ? "#0f7a4d" : "#c00000",
                    },
                  }))
                  .reverse(),
                barWidth: 14,
                label: { show: true, position: "right" },
              },
            ],
          },
          true
        );
      }

      const pol = R.policy;
      $("#pathPolicy").innerHTML = `
        <div class="st-pol-score">政策支持度 <b>${pol.supportScore}</b></div>
        <div class="st-pol-title">${pol.title}</div>
        <p>${pol.summary}</p>
        <div class="st-pol-meta">支持信号 ${pol.supportSignals} · 限制 ${pol.restrictSignals} · 行情动量 ${pol.marketMomentum}%</div>
        <a class="st-pol-link" href="${pol.url}" target="_blank" rel="noopener">查看来源政策</a>`;

      const g = chartOf("pathPolicyGauge");
      if (g) {
        g.setOption(
          {
            series: [
              {
                type: "gauge",
                min: 0,
                max: 100,
                startAngle: 210,
                endAngle: -30,
                radius: "90%",
                progress: { show: true, width: 12, itemStyle: { color: "#0f7a4d" } },
                axisLine: { lineStyle: { width: 12, color: [[1, "#eee"]] } },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                pointer: { show: false },
                title: { show: true, offsetCenter: [0, "70%"], fontSize: 12, color: "#6e6e6e" },
                detail: {
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#0f7a4d",
                  offsetCenter: [0, "8%"],
                  formatter: "{value}",
                },
                data: [{ value: pol.supportScore, name: "政策支持" }],
              },
            ],
          },
          true
        );
      }
    }

    if (branch === "bad") {
      const ranked = [...R.industries].sort((a, b) => b.composite - a.composite);
      const months = ["8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7"].map(
        (m) => `${m}月`
      );
      const boom = chartOf("pathIndBoom");
      if (boom) {
        const palette = ["#c00000", "#d42020", "#e07070", "#9a0000", "#b8860b"];
        boom.setOption(
          {
            color: palette,
            tooltip: {
              trigger: "axis",
              formatter: (items) => {
                const head = items[0]?.axisValue || "";
                const lines = items
                  .map((it) => {
                    const ind = ranked.find((r) => r.name === it.seriesName);
                    const mark = ind?.id === industryId ? " ←当前" : "";
                    return `${it.marker}${it.seriesName} <b>${it.value}</b>${mark}`;
                  })
                  .join("<br/>");
                return `${head}<br/>${lines}`;
              },
            },
            legend: {
              top: 0,
              type: "scroll",
              textStyle: { fontSize: 12, color: "#2a2a2a", fontWeight: 650 },
              selectedMode: false,
              itemWidth: 14,
              itemHeight: 8,
            },
            grid: { left: 44, right: 56, top: 40, bottom: 32 },
            xAxis: {
              type: "category",
              data: months,
              boundaryGap: false,
              axisLabel: { fontSize: 11, color: "#6e6e6e" },
              axisLine: { lineStyle: { color: "#ddd" } },
              axisTick: { show: false },
            },
            yAxis: {
              type: "value",
              min: 50,
              max: 95,
              splitLine: { lineStyle: { color: "#f0eaea", type: "dashed" } },
              axisLabel: { fontSize: 11, color: "#6e6e6e" },
            },
            series: ranked.map((ind, idx) => {
              const src = (D.industries || []).find((i) => i.id === ind.id);
              const trend = src?.trend || ind.trend;
              const base = ind.composite;
              const data =
                trend && trend.length
                  ? trend
                  : [base - 8, base - 6, base - 4, base - 3, base - 2, base - 1, base, base + 1, base, base - 1, base, base];
              const selected = ind.id === industryId;
              const color = palette[idx % palette.length];
              return {
                name: ind.name,
                type: "line",
                smooth: true,
                showSymbol: true,
                symbol: "circle",
                symbolSize: selected ? 8 : 5,
                lineStyle: {
                  width: selected ? 3.5 : 2.5,
                  color,
                  opacity: 1,
                },
                itemStyle: {
                  color,
                  borderColor: "#fff",
                  borderWidth: selected ? 2 : 1,
                },
                emphasis: {
                  focus: "series",
                  lineStyle: { width: 4 },
                  itemStyle: { borderWidth: 2 },
                },
                blur: {
                  lineStyle: { opacity: 0.25 },
                  itemStyle: { opacity: 0.25 },
                },
                areaStyle: selected
                  ? { color: color, opacity: 0.1 }
                  : undefined,
                data,
                z: selected ? 10 : idx + 1,
                endLabel: selected
                  ? {
                      show: true,
                      formatter: `{a} {c}`,
                      fontSize: 12,
                      fontWeight: 700,
                      color,
                      distance: 6,
                    }
                  : undefined,
              };
            }),
          },
          true
        );
        boom.off("click");
        boom.on("click", (p) => {
          if (!p.seriesName) return;
          const hit = ranked.find((i) => i.name === p.seriesName);
          if (hit) {
            industryId = hit.id;
            renderPath();
            toast(`已切换行业：${hit.name}`);
          }
        });
      }
    }

    $("#indSeg").innerHTML = R.industries
      .map(
        (ind) => `<button type="button" class="${ind.id === industryId ? "active" : ""}" data-ind="${ind.id}">
        ${ind.name}<em>${ind.composite}</em>
      </button>`
      )
      .join("");
    $$("#indSeg [data-ind]").forEach((btn) => {
      btn.onclick = () => {
        industryId = btn.dataset.ind;
        renderPath();
      };
    });

    const firms = firmsOfIndustry(industryId);
    const indName = R.industries.find((i) => i.id === industryId)?.name || "";
    $("#firmHint").textContent = `${indName} · Top ${firms.length} · 点击进入画像`;

    const rank = chartOf("firmRankChart");
    if (rank) {
      rank.setOption(
        {
          grid: { left: 120, right: 40, top: 12, bottom: 24 },
          xAxis: { type: "value", min: 60, max: 100 },
          yAxis: {
            type: "category",
            data: firms.map((f) => f.displayName || f.node).reverse(),
            axisLabel: { fontSize: 11 },
          },
          series: [
            {
              type: "bar",
              data: firms
                .map((f) => ({
                  value: f.score,
                  firmId: f.id,
                  itemStyle: {
                    color: f.tier === "核心层" ? "#c00000" : "#e07070",
                    borderRadius: [0, 4, 4, 0],
                  },
                }))
                .reverse(),
              barWidth: 12,
              label: { show: true, position: "right", fontSize: 11 },
            },
          ],
          tooltip: {
            formatter: (p) => {
              const f = firms.find((x) => (x.displayName || x.node) === p.name);
              return f ? `${f.displayName}<br/>${f.tier} · ${f.score}分<br/>${f.reason}` : "";
            },
          },
        },
        true
      );
      rank.off("click");
      rank.on("click", (p) => {
        const f = firms.find((x) => (x.displayName || x.node) === p.name);
        if (f) selectFirm(f);
      });
    }

    $("#firmTable").innerHTML = firms
      .map(
        (f, i) => `<tr data-fid="${f.id}">
        <td>${i + 1}</td>
        <td>${f.displayName || f.node}</td>
        <td>${f.tier}</td>
        <td class="num">${f.score}</td>
        <td>${f.reason || "—"}</td>
      </tr>`
      )
      .join("");
    $$("#firmTable tr").forEach((tr) => {
      tr.onclick = () => {
        const f = firms.find((x) => x.id === tr.dataset.fid);
        if (f) selectFirm(f);
      };
    });
  }

  function policySearchText(p) {
    return [p.title, p.summary, p.industry, p.level, p.source, p.deadline]
      .filter(Boolean)
      .join(" ");
  }

  /** 关键词扩展：搜「汽车」也能命中新能源车 / 智能网联等 */
  function expandPolicyQuery(q) {
    const raw = (q || "").trim().toLowerCase();
    if (!raw) return [];
    const aliases = {
      汽车: ["汽车", "新能源车", "新能源汽车", "智能网联", "整车", "车路", "充电"],
      车: ["汽车", "新能源车", "新能源汽车", "智能网联"],
      半导体: ["半导体", "集成电路", "芯片", "晶圆"],
      芯片: ["半导体", "集成电路", "芯片"],
      低空: ["低空", "低空经济", "eVTOL", "飞控"],
      机器人: ["机器人", "伺服", "机器视觉"],
      医药: ["生物医药", "医药", "创新药", "医疗器械"],
    };
    for (const [k, words] of Object.entries(aliases)) {
      if (raw.includes(k)) return words;
    }
    return [raw];
  }

  function filteredPolicies() {
    const policies = D.policies || [];
    const keys = expandPolicyQuery(policyQuery);
    if (!keys.length) return policies;
    return policies.filter((p) => {
      const text = policySearchText(p).toLowerCase();
      return keys.some((k) => text.includes(k.toLowerCase()));
    });
  }

  function matchCustomersForPolicy(policy) {
    if (!policy) return [];
    const key = policy.industry || "";
    const idMap = {
      半导体: "semiconductor",
      低空经济: "lowalt",
      新能源: "nev",
      汽车: "nev",
      智能网联: "nev",
      机器人: "robot",
      生物医药: "biomed",
    };
    let targetId = null;
    for (const [k, id] of Object.entries(idMap)) {
      if (key.includes(k)) {
        targetId = id;
        break;
      }
    }
    let list = D.customers.slice();
    if (targetId) {
      const hit = list.filter((c) => c.industryId === targetId);
      if (hit.length) list = hit;
    } else if (/先进制造|制造业|多产业/.test(key)) {
      list = list.filter(
        (c) =>
          /核心|骨干/.test(c.tier) ||
          (c.tags || []).some((t) => /专精特新|设备更新|额度缺口/.test(t))
      );
    }
    return list
      .map((c) => {
        const base = c.policy || 70;
        const boost = targetId && c.industryId === targetId ? 4 : 0;
        const fit = Math.min(99, Math.round(base * 0.55 + (policy.match || 80) * 0.35 + boost));
        return { ...c, policyFit: fit, policyIndustry: key };
      })
      .sort((a, b) => b.policyFit - a.policyFit);
  }

  function renderPolicyPage() {
    const searchInput = $("#policySearch");
    if (searchInput && searchInput.value !== policyQuery) {
      searchInput.value = policyQuery;
    }
    const policies = filteredPolicies();
    if (!policies.length) {
      const listEl = $("#policyList");
      if (listEl) {
        listEl.innerHTML = `<div class="st-empty">未找到与「${policyQuery}」相关的政策</div>`;
      }
      const hint = $("#policyMatchHint");
      if (hint) hint.textContent = "换个关键词试试，如：汽车、半导体";
      const tbody = $("#policyMatchTable");
      if (tbody) tbody.innerHTML = "";
      const chart = chartOf("policyMatchChart");
      if (chart) chart.clear();
      return;
    }

    if (!policies.find((p) => p.id === currentPolicyId)) {
      currentPolicyId = policies[0].id;
    }
    const cur = policies.find((p) => p.id === currentPolicyId) || policies[0];

    const listEl = $("#policyList");
    if (listEl) {
      listEl.innerHTML = policies
        .map(
          (p) => `<button type="button" class="st-policy-item ${
            p.id === cur?.id ? "on" : ""
          }" data-pid="${p.id}">
          <div class="pd"><strong>${p.day}</strong><span>${p.month}</span></div>
          <div class="bd">
            <h3>${p.title}</h3>
            <div class="meta">
              <span class="lvl">${p.level}</span>
              <span>重点产业 · ${p.industry}</span>
              <span>截止 ${p.deadline}</span>
            </div>
          </div>
          <div class="ms"><strong>${p.match}%</strong><span>政策强度</span></div>
        </button>`
        )
        .join("");
      $$("#policyList [data-pid]").forEach((btn) => {
        btn.onclick = () => {
          currentPolicyId = btn.dataset.pid;
          renderPolicyPage();
        };
      });
    }

    if (!cur) return;
    const matched = matchCustomersForPolicy(cur);
    const hint = $("#policyMatchHint");
    if (hint) {
      hint.textContent = `${cur.industry} · 匹配 ${matched.length} 户 · 标注政策契合度`;
    }

    const chart = chartOf("policyMatchChart");
    if (chart) {
      const top = matched.slice(0, 8);
      chart.setOption(
        {
          tooltip: {
            trigger: "axis",
            formatter: (p) => {
              const c = top[p[0].dataIndex];
              return `${c.name}<br/>政策契合度 ${c.policyFit}% · ${c.action || ""}`;
            },
          },
          grid: { left: 100, right: 40, top: 12, bottom: 24 },
          xAxis: {
            type: "value",
            max: 100,
            axisLabel: { formatter: "{value}%", fontSize: 10 },
            splitLine: { lineStyle: { color: "#f0eaea" } },
          },
          yAxis: {
            type: "category",
            data: top
              .map((c) => c.name.replace(/有限公司|股份有限公司/g, ""))
              .reverse(),
            axisLabel: { fontSize: 10 },
          },
          series: [
            {
              type: "bar",
              data: top
                .map((c) => ({
                  value: c.policyFit,
                  itemStyle: {
                    color: c.policyFit >= 90 ? "#c00000" : c.policyFit >= 80 ? "#d42020" : "#e07070",
                    borderRadius: [0, 4, 4, 0],
                  },
                }))
                .reverse(),
              barWidth: 12,
              label: {
                show: true,
                position: "right",
                formatter: "{c}%",
                fontSize: 11,
                fontWeight: 700,
                color: "#c00000",
              },
            },
          ],
        },
        true
      );
      chart.off("click");
      chart.on("click", (p) => {
        const name = p.name;
        const hit = top.find(
          (c) => c.name.replace(/有限公司|股份有限公司/g, "") === name
        );
        if (hit) {
          currentFirm = null;
          currentCustomerId = hit.id;
          showView("portrait");
        }
      });
    }

    const tbody = $("#policyMatchTable");
    if (tbody) {
      tbody.innerHTML = matched
        .map(
          (c) => `<tr data-cid="${c.id}">
          <td>${c.name.replace(/有限公司|股份有限公司/g, "")}</td>
          <td>${c.policyIndustry || cur.industry}</td>
          <td>${c.tier}</td>
          <td class="num">${c.policyFit}%</td>
          <td>${c.action || "跟进"}</td>
        </tr>`
        )
        .join("");
      $$("#policyMatchTable tr").forEach((tr) => {
        tr.onclick = () => {
          currentFirm = null;
          currentCustomerId = tr.dataset.cid;
          showView("portrait");
        };
      });
    }
  }

  function renderPortrait() {
    const c = customer();
    const firm = currentFirm;
    const name = firm && !firm.isBook ? `${firm.node}（映射库内：${c.name}）` : c.name;
    $("#ptName").textContent = name;
    $("#ptTier").textContent = firm?.tier || c.tier;
    $("#ptRisk").textContent = `风险 ${c.risk}`;
    $("#ptRisk").style.color = RISK_COLOR[c.risk] || "";
    $("#ptMeta").textContent = firm
      ? `节点 ${firm.node} · ${firm.city || c.district || ""} · 综合 ${firm.score}`
      : `${c.node || c.industry || "—"} · ${c.district || "—"}`;
    $("#ptTags").innerHTML = [
      ...(c.tags || []),
      ...(R.chokeNodes.includes(firm?.node) ? ["卡脖子节点"] : []),
    ]
      .map((t) => `<span class="chip">${t}</span>`)
      .join("");

    $("#ptKpis").innerHTML = [
      ["授信", c.credit],
      ["缺口", c.gap],
      ["结算", c.settlement],
      ["存款", c.deposit],
      ["政策", `${c.policy}%`],
      ["机会", c.opportunity],
    ]
      .map(([k, v]) => `<div class="st-pt-kpi"><span>${k}</span><b>${v || "—"}</b></div>`)
      .join("");

    const radar = chartOf("ptRadar");
    if (radar) {
      radar.setOption(
        {
          radar: {
            radius: "62%",
            indicator: [
              { name: "机会", max: 100 },
              { name: "政策", max: 100 },
              { name: "结算变动", max: 100 },
              { name: "风险安全", max: 100 },
              { name: "分层", max: 100 },
            ],
            axisName: { fontSize: 10, color: "#6e6e6e" },
          },
          series: [
            {
              type: "radar",
              data: [
                {
                  value: [
                    c.opportunity || 70,
                    c.policy || 80,
                    Math.max(10, Math.min(95, 55 + (c.deltaSettle || 0) * 2)),
                    c.risk === "低" ? 88 : c.risk === "中" ? 60 : 32,
                    /核心/.test(firm?.tier || c.tier) ? 95 : 70,
                  ],
                  areaStyle: { color: "rgba(192,0,0,.16)" },
                  lineStyle: { color: "#c00000" },
                  itemStyle: { color: "#c00000" },
                },
              ],
            },
          ],
        },
        true
      );
    }

    const attr = chartOf("ptAttrBar");
    if (attr) {
      const status = firm?.status ?? c.policy ?? 80;
      const ops = firm?.ops ?? 70;
      const strength = firm?.strength ?? c.opportunity ?? 70;
      attr.setOption(
        {
          grid: { left: 64, right: 28, top: 12, bottom: 24 },
          xAxis: { type: "value", max: 100 },
          yAxis: { type: "category", data: ["自身实力", "经营表现", "链上地位"] },
          series: [
            {
              type: "bar",
              data: [strength, ops, status],
              barWidth: 14,
              itemStyle: { color: "#c00000", borderRadius: [0, 4, 4, 0] },
              label: { show: true, position: "right" },
            },
          ],
        },
        true
      );
    }

    const delta = chartOf("ptDelta");
    if (delta) {
      delta.setOption(
        {
          grid: { left: 40, right: 12, top: 20, bottom: 28 },
          xAxis: { type: "category", data: ["结算活跃", "存款变动"] },
          yAxis: { type: "value", axisLabel: { formatter: "{value}%" } },
          series: [
            {
              type: "bar",
              barWidth: 36,
              data: [
                {
                  value: c.deltaSettle || 0,
                  itemStyle: { color: (c.deltaSettle || 0) >= 0 ? "#0f7a4d" : "#c00000" },
                },
                {
                  value: +(c.deltaDeposit || 0).toFixed(1),
                  itemStyle: { color: (c.deltaDeposit || 0) >= 0 ? "#0f7a4d" : "#c00000" },
                },
              ],
              label: {
                show: true,
                position: "top",
                formatter: (p) => `${p.value > 0 ? "+" : ""}${p.value}%`,
              },
            },
          ],
        },
        true
      );
    }

    const advice =
      branch === "good" || (firm && firm.score >= 85)
        ? `政策窗口期优先推进「${c.action || "专项融资"}」。${c.nextAction || R.policy.summary.slice(0, 40)}…`
        : `建议先慰问沟通并持续监控敞口，再评估「${c.action || "综合方案"}」。`;

    $("#ptAdvice").innerHTML = `
      <div class="st-advice-main">
        <div class="tag">${c.action || "综合跟进"}</div>
        <p>${advice}</p>
      </div>
      <div class="st-advice-acts">
        <button type="button" class="btn" data-go="path">回行业洞察</button>
        <button type="button" class="btn ghost" data-go="policy">回产业政策</button>
      </div>`;
  }

  function bind() {
    document.body.addEventListener("click", (e) => {
      const go = e.target.closest("[data-go]");
      if (go?.dataset.go) {
        e.preventDefault();
        showView(go.dataset.go);
        return;
      }
      const br = e.target.closest("[data-branch]");
      if (br?.dataset.branch) {
        branch = br.dataset.branch;
        showView("path");
        toast(branch === "good" ? "进入正向指标 / 政策路径" : "进入承压路径");
        return;
      }
    });

    $$("#flowSteps [data-step]").forEach((el) => {
      el.onclick = () => showView(el.dataset.step);
    });

    const policySearch = $("#policySearch");
    if (policySearch) {
      policySearch.addEventListener("input", () => {
        policyQuery = policySearch.value || "";
        if (view === "policy") renderPolicyPage();
      });
      policySearch.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          policyQuery = policySearch.value || "";
          renderPolicyPage();
        }
      });
    }

    $("#customerSearchBtn")?.addEventListener("click", () => {
      const q = ($("#customerSearch")?.value || "").trim();
      if (!q) return;
      const hit =
        D.customers.find((c) => c.name.includes(q) || c.id.includes(q)) ||
        firmPool.find((f) => (f.displayName || f.node || "").includes(q));
      if (hit) {
        if (hit.portraitId || hit.id) {
          selectFirm(
            hit.portraitId
              ? hit
              : firmPool.find((f) => f.portraitId === hit.id || f.id === hit.id) || {
                  ...hit,
                  portraitId: hit.id,
                  displayName: hit.name,
                }
          );
          toast(`已定位：${hit.name || hit.displayName}`);
        }
      } else toast("未找到客户");
    });

    window.addEventListener("hashchange", () => {
      const h = window.location.hash.replace("#", "");
      if (VIEWS.includes(h) && h !== view) showView(h, { skipHash: true });
    });
    window.addEventListener("resize", resizeCharts);
  }

  bind();
  const initial = window.location.hash.replace("#", "");
  showView(VIEWS.includes(initial) ? initial : "board", { skipHash: !VIEWS.includes(initial) });
  if (!VIEWS.includes(initial)) history.replaceState(null, "", "#board");
})();
