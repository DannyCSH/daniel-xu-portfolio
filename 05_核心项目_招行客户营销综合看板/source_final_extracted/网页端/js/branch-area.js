(() => {
  const CM = window.CHAIN_META;
  const params = new URLSearchParams(location.search);

  const branch = {
    id: params.get("id") || "CMB-demo",
    branchNo: params.get("branchNo") || "128000",
    name: params.get("name") || "成都示范支行",
    city: params.get("city") || "成都市",
    address: params.get("address") || "",
    phone: params.get("phone") || "",
    coord: [
      Number(params.get("lng")) || 104.0665,
      Number(params.get("lat")) || 30.5723,
    ],
  };

  // 管辖半径（经纬度近似，约 3.2km）
  const RADIUS_DEG = 3.2 / 111;

  let industryId = CM.INDUSTRIES[0].id;
  let enterprises = CM.genEnterprises(branch, 3.2);
  let chart;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function currentIndustry() {
    return CM.INDUSTRIES.find((x) => x.id === industryId) || CM.INDUSTRIES[0];
  }

  function filteredEnterprises() {
    return enterprises.filter((e) => e.chainId === industryId);
  }

  function trendClass(label) {
    if (label === "上升") return "trend-up";
    if (label === "缓升") return "trend-up";
    if (label === "下降") return "trend-down";
    return "trend-flat";
  }

  function trendArrow(label) {
    if (label === "上升") return "↑";
    if (label === "缓升") return "↗";
    if (label === "下降") return "↓";
    return "→";
  }

  function renderTabs() {
    $("#industryTabs").innerHTML = CM.INDUSTRIES.map((ind) => {
      const active = ind.id === industryId;
      return `<button type="button" class="industry-tab ${active ? "active" : ""}" data-id="${ind.id}"
        style="${active ? `background:${ind.color}` : ""}">
        <i style="background:${ind.color}"></i>${ind.name}
      </button>`;
    }).join("");

    $$("#industryTabs .industry-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        industryId = btn.dataset.id;
        renderTabs();
        renderSide();
        renderMap();
      });
    });
  }

  function renderSide() {
    const ind = currentIndustry();
    const list = filteredEnterprises();
    // 同步 count
    CM.INDUSTRIES.forEach((x) => {
      x.count = enterprises.filter((e) => e.chainId === x.id).length;
    });
    $("#chainCount").textContent = list.length;
    $("#chainScore").textContent = ind.score;
    $("#chainHint").innerHTML = `当前选择 <b style="color:${ind.color}">${ind.name}</b>：地图展示 ${list.length} 家企业。大小=分层，颜色深浅=规模。`;

    const rank = CM.ranking();
    $("#rankList").innerHTML = rank
      .map((r, i) => {
        const cnt = enterprises.filter((e) => e.chainId === r.id).length;
        return `<div class="rank-item">
          <div class="idx ${i < 3 ? "top" : ""}">${i + 1}</div>
          <div>
            <div class="name">${r.name}</div>
            <div class="meta">辖区企业 ${cnt} 家 · <span class="${trendClass(r.trendLabel)}">${trendArrow(r.trendLabel)} ${r.trendLabel}</span></div>
          </div>
          <div class="score"><b>${r.score}</b><div class="meta">景气度</div></div>
        </div>`;
      })
      .join("");
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

  function renderMap() {
    const ind = currentIndustry();
    const list = filteredEnterprises();
    const scatter = list.map((e) => ({
      ...e,
      value: [...e.coord, e.symbolSize],
      itemStyle: {
        color: e.itemColor,
        borderColor: "#fff",
        borderWidth: 1.5,
        shadowBlur: 8,
        shadowColor: "rgba(26,90,140,0.2)",
      },
    }));

    const ring = circlePolygon(branch.coord, RADIUS_DEG);

    chart.setOption({
      animation: false,
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(255,255,255,0.96)",
        borderColor: "rgba(43,143,214,0.35)",
        textStyle: { color: "#1a3a5c", fontSize: 12 },
        formatter: (p) => {
          if (p.seriesName !== "企业") return p.name || "";
          const d = p.data;
          return `
            <div style="font-weight:700;margin-bottom:6px;">${d.name}</div>
            <div>注册资本：${d.capital}</div>
            <div>实收资本：${d.paidCapital}</div>
            <div>产业链：${d.chain} · ${d.stream}</div>
            <div>节点：${d.node}</div>
            <div>分层：${d.tier} · 规模：${d.scale}</div>
            <div style="margin-top:6px;color:#5a7a9a;">点击查看客户画像</div>
          `;
        },
      },
      geo: {
        map: "china",
        roam: true,
        center: branch.coord,
        zoom: 28,
        scaleLimit: { min: 8, max: 120 },
        aspectScale: 0.85,
        layoutCenter: ["50%", "50%"],
        layoutSize: "180%",
        itemStyle: {
          areaColor: "#cfe6f5",
          borderColor: "#7eb6db",
          borderWidth: 0.8,
        },
        emphasis: { disabled: true },
        silent: true,
      },
      series: [
        {
          name: "管辖范围",
          type: "lines",
          coordinateSystem: "geo",
          polyline: true,
          silent: true,
          zlevel: 1,
          lineStyle: {
            color: ind.color,
            width: 2,
            opacity: 0.55,
            type: "dashed",
          },
          data: [{ coords: ring }],
        },
        {
          name: "管辖填充",
          type: "custom",
          coordinateSystem: "geo",
          silent: true,
          zlevel: 0,
          renderItem(params, api) {
            const pts = ring.map((c) => api.coord(c));
            return {
              type: "polygon",
              shape: { points: pts },
              style: {
                fill: CM.hexToRgba(ind.color, 0.08),
                stroke: "transparent",
              },
            };
          },
          data: [0],
        },
        {
          name: "支行",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 3,
          rippleEffect: { scale: 3.2, brushType: "stroke" },
          symbolSize: 16,
          itemStyle: { color: "#e8912d", shadowBlur: 12, shadowColor: "rgba(232,145,45,0.5)" },
          label: {
            show: true,
            formatter: "{b}",
            position: "bottom",
            color: "#1a3a5c",
            fontWeight: 700,
            fontSize: 12,
            distance: 8,
          },
          data: [{ name: branch.name.replace(/^招商银行/, ""), value: branch.coord }],
        },
        {
          name: "企业",
          type: "scatter",
          coordinateSystem: "geo",
          zlevel: 4,
          symbol: "circle",
          data: scatter,
          symbolSize: (val, p) => Math.round(p.data.symbolSize * 1.15),
          label: { show: false },
          emphasis: {
            scale: 1.15,
            label: {
              show: true,
              formatter: "{b}",
              position: "top",
              color: "#1a3a5c",
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: [2, 6],
              borderRadius: 4,
            },
          },
        },
      ],
    });
  }

  async function ensureChinaMap() {
    try {
      const res = await fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json");
      const geo = await res.json();
      echarts.registerMap("china", geo);
      return true;
    } catch (_) {
      return false;
    }
  }

  async function boot() {
    $("#branchTitle").textContent = branch.name;
    $("#branchSub").textContent = `${branch.city}${branch.address ? " · " + branch.address : ""}${
      branch.branchNo ? " · No." + branch.branchNo : ""
    }`;

    const ok = await ensureChinaMap();
    chart = echarts.init($("#branchMap"));
    if (!ok) toast("底图加载失败，企业点仍可交互");

    renderTabs();
    renderSide();
    renderMap();

    chart.on("click", (params) => {
      if (params.seriesName === "企业" && params.data?.id) {
        const d = params.data;
        sessionStorage.setItem("task3_enterprise", JSON.stringify(d));
        sessionStorage.setItem("task3_branch", JSON.stringify(branch));
        const q = new URLSearchParams({
          id: d.id,
          branch: branch.name,
          branchNo: branch.branchNo,
        });
        location.href = `company.html?${q.toString()}`;
      }
    });

    window.addEventListener("resize", () => chart?.resize());
    toast(`${branch.name.replace(/^招商银行/, "")} · 辖区已加载`);
  }

  boot();
})();
