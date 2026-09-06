(() => {
  const CM = window.CHAIN_META;
  const M = window.MOCK;
  const params = new URLSearchParams(location.search);

  let ent = null;
  try {
    ent = JSON.parse(sessionStorage.getItem("task3_enterprise") || "null");
  } catch (_) {
    ent = null;
  }
  let branch = null;
  try {
    branch = JSON.parse(sessionStorage.getItem("task3_branch") || "null");
  } catch (_) {
    branch = null;
  }

  // 无 session 时兜底生成一家演示企业
  if (!ent) {
    const fakeBranch = {
      branchNo: params.get("branchNo") || "128000",
      name: params.get("branch") || "成都示范支行",
      coord: [104.0665, 30.5723],
      city: "成都市",
    };
    ent = CM.genEnterprises(fakeBranch)[0];
    branch = fakeBranch;
  }

  const $ = (s) => document.querySelector(s);

  function creditText(label) {
    return M.creditLabels?.[label] || `区间 ${label}`;
  }

  function render() {
    $("#coTitle").textContent = "企业客户画像";
    $("#coName").textContent = ent.name;
    $("#coSub").textContent = `${ent.id} · ${ent.chain} · ${ent.node}`;

    $("#coChips").innerHTML = [
      `<span class="chip gold">${ent.tier}</span>`,
      `<span class="chip">${ent.scale}</span>`,
      `<span class="chip">${ent.stream}</span>`,
      `<span class="chip">${ent.chain}</span>`,
      `<span class="chip">${ent.status}</span>`,
    ].join("");

    $("#bizKv").innerHTML = [
      ["所属行业", ent.industry],
      ["注册资本", ent.capital],
      ["实收资本", ent.paidCapital],
      ["从业人数", ent.employees],
      ["产业链节点", ent.node],
      ["工商状态", ent.status],
    ]
      .map(
        ([k, v]) => `<div class="kv"><div class="k">${k}</div><div class="v">${v}</div></div>`
      )
      .join("");

    $("#creditBand").textContent = creditText(ent.creditLabel);
    $("#tierScore").textContent = ent.tierScore;

    const fin = ent.finance || {};
    $("#finKv").innerHTML = Object.entries(fin)
      .map(
        ([k, v]) =>
          `<div class="kv"><div class="k">${k}</div><div class="v">${v}${
            String(k).includes("率") || String(k).includes("增长") ? "%" : ""
          }</div></div>`
      )
      .join("");

    $("#settleVal").textContent = ent.settleActive;
    $("#streamVal").textContent = `${ent.stream} · ${ent.node}`;
    $("#coAddr").textContent = ent.address || "—";
    $("#coPhone").textContent = ent.phone || "—";
    $("#coCoord").textContent = ent.coord
      ? `${ent.coord[0].toFixed(5)}, ${ent.coord[1].toFixed(5)}`
      : "—";

    // 拜访提醒
    const related = ent.bankCustomersRelated || [];
    const lines = [];
    lines.push(
      ent.needAppointment
        ? `⚠ 需要提前预约：请先致电 ${ent.phone} 预约接待时段，避免空跑。`
        : `✓ 可直接上门：工作日接待相对开放，建议上午触达。`
    );
    if (related.length) {
      lines.push(
        `✓ 中间人线索：存量客户「${related
          .map((r) => `${r.name}（${r.relation}）`)
          .join("、")}」可协助引荐。`
      );
    } else {
      lines.push(`△ 暂未匹配到明确中间人，建议从园区管委会或协会活动破冰。`);
    }
    lines.push(
      `优势速览：${(ent.advantages || []).join("；")}`
    );
    $("#visitRemind").innerHTML = lines.map((l) => `<div style="margin:4px 0;">${l}</div>`).join("");

    // 建议
    const advice = CM.buildAdvice(ent, branch?.name || "辖区支行");
    $("#adviceList").innerHTML = advice
      .map(
        (a) => `
      <article class="advice-item ${a.level}">
        <div class="lvl">${a.level}</div>
        <h3>${a.title}</h3>
        <div class="action"><b>怎么做：</b>${a.action}</div>
        <div class="reason"><b>为什么：</b>${a.reason}</div>
      </article>`
      )
      .join("");

    // 返回链接
    const q = new URLSearchParams({
      id: branch?.id || "",
      branchNo: branch?.branchNo || "",
      name: branch?.name || "",
      city: branch?.city || "成都市",
      address: branch?.address || "",
      phone: branch?.phone || "",
      lng: branch?.coord?.[0] ?? "",
      lat: branch?.coord?.[1] ?? "",
    });
    $("#backBranch").href = `branch-area.html?${q.toString()}`;

    renderCharts();
  }

  function renderCharts() {
    const fin = ent.finance || {};
    const finChart = echarts.init($("#finChart"));
    finChart.setOption({
      grid: { left: 40, right: 16, top: 20, bottom: 28 },
      xAxis: {
        type: "category",
        data: Object.keys(fin),
        axisLabel: { color: "#5a7a9a", fontSize: 10, interval: 20 },
        axisLine: { lineStyle: { color: "#b7d3e8" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#5a7a9a", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(43,143,214,0.12)" } },
      },
      series: [
        {
          type: "bar",
          data: Object.values(fin),
          barWidth: 18,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#4aa3e0" },
              { offset: 1, color: "#2b8fd6" },
            ]),
            borderRadius: [6, 6, 0, 0],
          },
        },
      ],
    });

    const settleChart = echarts.init($("#settleChart"));
    const trend = ent.settleTrend || [40, 48, 55, 62, 70, 78];
    settleChart.setOption({
      grid: { left: 36, right: 16, top: 20, bottom: 28 },
      xAxis: {
        type: "category",
        data: ["T-5", "T-4", "T-3", "T-2", "T-1", "本期"],
        axisLabel: { color: "#5a7a9a", fontSize: 10 },
        axisLine: { lineStyle: { color: "#b7d3e8" } },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: { color: "#5a7a9a", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(43,143,214,0.12)" } },
      },
      series: [
        {
          type: "line",
          smooth: true,
          data: trend,
          symbolSize: 7,
          lineStyle: { width: 3, color: "#2b8fd6" },
          itemStyle: { color: "#1a6fb5" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(43,143,214,0.35)" },
              { offset: 1, color: "rgba(43,143,214,0.02)" },
            ]),
          },
        },
      ],
    });

    window.addEventListener("resize", () => {
      finChart.resize();
      settleChart.resize();
    });
  }

  render();
})();
