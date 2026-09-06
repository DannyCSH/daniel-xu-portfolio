(() => {
  const M = window.MOCK;
  const state = {
    chain: "all",
    mapReady: false,
    mapZoom: 1.2,
    mapCenter: [105, 36],
    focusProvince: null,
    focusCity: null,
    forceCity: null, // 点击城市直达（如成都）
    highlightBranchId: null,
  };

  const geoCache = new Map(); // adcode -> geoJson
  const placesCache = new Map();
  const registeredMaps = new Set(["china"]);


  const charts = {};
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const COLORS = ["#00e5ff", "#4da3ff", "#7c6bff", "#00c896", "#ff8a3d", "#ff5d8a", "#c3f5ff"];

  // 各省/直辖市/自治区省会（含特别行政区）
  const CAPITALS = [
    { name: "北京", province: "北京", coord: [116.4074, 39.9042] },
    { name: "天津", province: "天津", coord: [117.2008, 39.0842] },
    { name: "石家庄", province: "河北", coord: [114.5149, 38.0428] },
    { name: "太原", province: "山西", coord: [112.5489, 37.8706] },
    { name: "呼和浩特", province: "内蒙古", coord: [111.7492, 40.8424] },
    { name: "沈阳", province: "辽宁", coord: [123.4315, 41.8057] },
    { name: "长春", province: "吉林", coord: [125.3235, 43.8171] },
    { name: "哈尔滨", province: "黑龙江", coord: [126.5349, 45.8038] },
    { name: "上海", province: "上海", coord: [121.4737, 31.2304] },
    { name: "南京", province: "江苏", coord: [118.7969, 32.0603] },
    { name: "杭州", province: "浙江", coord: [120.1551, 30.2741] },
    { name: "合肥", province: "安徽", coord: [117.2272, 31.8206] },
    { name: "福州", province: "福建", coord: [119.2965, 26.0745] },
    { name: "南昌", province: "江西", coord: [115.8581, 28.6832] },
    { name: "济南", province: "山东", coord: [117.1205, 36.6519] },
    { name: "郑州", province: "河南", coord: [113.6254, 34.7466] },
    { name: "武汉", province: "湖北", coord: [114.3055, 30.5928] },
    { name: "长沙", province: "湖南", coord: [112.9388, 28.2282] },
    { name: "广州", province: "广东", coord: [113.2644, 23.1291] },
    { name: "南宁", province: "广西", coord: [108.3669, 22.8170] },
    { name: "海口", province: "海南", coord: [110.3312, 20.0319] },
    { name: "重庆", province: "重庆", coord: [106.5516, 29.5630] },
    { name: "成都", province: "四川", coord: [104.0665, 30.5723] },
    { name: "贵阳", province: "贵州", coord: [106.6302, 26.6477] },
    { name: "昆明", province: "云南", coord: [102.8329, 24.8801] },
    { name: "拉萨", province: "西藏", coord: [91.1409, 29.6456] },
    { name: "西安", province: "陕西", coord: [108.9398, 34.3416] },
    { name: "兰州", province: "甘肃", coord: [103.8343, 36.0611] },
    { name: "西宁", province: "青海", coord: [101.7782, 36.6171] },
    { name: "银川", province: "宁夏", coord: [106.2309, 38.4872] },
    { name: "乌鲁木齐", province: "新疆", coord: [87.6168, 43.8256] },
    { name: "香港", province: "香港", coord: [114.1694, 22.3193] },
    { name: "澳门", province: "澳门", coord: [113.5439, 22.1987] },
    { name: "台北", province: "台湾", coord: [121.5654, 25.0330] },
  ];

  const SHENZHEN = { name: "深圳", coord: [114.0579, 22.5431], cust: "C10001" };

  const CITY_COORDS = Object.fromEntries([
    ...CAPITALS.map((c) => [c.name, c.coord]),
    [SHENZHEN.name, SHENZHEN.coord],
  ]);

  // 深圳 → 各省省会 飞线
  const FLY_LINES = CAPITALS.map((c) => ["深圳", c.name]);

  function goToBranchArea(d) {
    if (typeof window.__onBranchEnter === "function") {
      window.__onBranchEnter(d);
      return;
    }
    const lng = d.value?.[0] ?? d.coord?.[0] ?? "";
    const lat = d.value?.[1] ?? d.coord?.[1] ?? "";
    const q = new URLSearchParams({
      id: d.id || "",
      branchNo: d.branchNo || "",
      name: d.fullName || d.name || "",
      city: d.city || "成都市",
      address: d.address || "",
      phone: d.phone || "",
      lng: lng === "" ? "" : String(lng),
      lat: lat === "" ? "" : String(lat),
    });
    window.location.href = `branch-area.html?${q.toString()}`;
  }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2000);
  }

  function tickClock() {
    const now = new Date();
    const week = ["日", "一", "二", "三", "四", "五", "六"];
    const pad = (n) => String(n).padStart(2, "0");
    $("#clockDate").textContent = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    $("#clockTime").textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} · 星期${week[now.getDay()]}`;
  }

  function renderKpiStrip() {
    const items = [
      { icon: "贷", label: "预授信总额(亿元)", value: "86.30", trend: "较上月 +8.56%", up: true },
      { icon: "户", label: "辖区客户总数(户)", value: "1,286", trend: "较上月 +4.20%", up: true },
      { icon: "核", label: "核心层企业(户)", value: "158", trend: "较上月 +6.10%", up: true },
      { icon: "链", label: "覆盖产业链(条)", value: "4", trend: "较上月 +1", up: true },
      { icon: "政", label: "政策高契合(户)", value: "42", trend: "较上月 +12.5%", up: true },
      { icon: "活", label: "结算活跃客户(户)", value: "864", trend: "较上月 -1.20%", up: false },
      { icon: "新", label: "本月新增商机(个)", value: "76", trend: "较上月 +9.80%", up: true },
      { icon: "访", label: "待拜访清单(户)", value: "23", trend: "较上周 +5", up: true },
    ];
    $("#kpiStrip").innerHTML = items
      .map(
        (k) => `
      <div class="kpi-card">
        <div class="kpi-icon">${k.icon}</div>
        <div class="kpi-body">
          <div class="label">${k.label}</div>
          <div class="value">${k.value}</div>
          <div class="trend ${k.up ? "up" : "down"}">${k.trend} ${k.up ? "▲" : "▼"}</div>
        </div>
      </div>`
      )
      .join("");
  }

  function renderBottom() {
    const items = [
      { icon: "警", lab: "风险预警客户", val: "18", tr: "较上月 -3", up: false },
      { icon: "逾", lab: "逾期率", val: "0.86%", tr: "较上月 -0.12%", up: false },
      { icon: "不", lab: "不良率", val: "0.42%", tr: "较上月 -0.05%", up: false },
      { icon: "断", lab: "断链风险节点", val: "5", tr: "较上月 +1", up: true },
      { icon: "高", lab: "高景气待拓客", val: "126", tr: "较上月 +8.2%", up: true },
      { icon: "成", lab: "营销转化率", val: "23.6%", tr: "较上月 +2.1%", up: true },
    ];
    $("#bottomKpis").innerHTML = items
      .map(
        (k) => `
      <div class="bk">
        <div class="ico">${k.icon}</div>
        <div>
          <div class="lab">${k.lab}</div>
          <div class="val">${k.val}</div>
          <div class="tr ${k.up ? "up" : "down"}" style="color:${k.up ? "var(--orange)" : "var(--green)"}">${k.tr}</div>
        </div>
      </div>`
      )
      .join("");
  }

  function renderPolicyTable() {
    const rows = [
      ["新能源汽车专项", "86", "12.6亿", "92%"],
      ["半导体国产替代", "54", "8.4亿", "88%"],
      ["机器人智造扶持", "41", "5.2亿", "76%"],
      ["生物医药贴息", "28", "3.1亿", "81%"],
      ["十五五产业集群", "112", "18.9亿", "69%"],
    ];
    $("#policyTbody").innerHTML = rows
      .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
      .join("");
  }

  function renderTierBlocks() {
    const tiers = [
      { lab: "核心层", val: "158", icon: "★" },
      { lab: "骨干层", val: "380", icon: "◆" },
      { lab: "基础层", val: "1,226", icon: "●" },
      { lab: "边缘层", val: "1,271", icon: "○" },
    ];
    $("#tierBlocks").innerHTML = tiers
      .map(
        (t) => `
      <div class="rural-item">
        <div class="ico">${t.icon}</div>
        <div>
          <div class="lab">${t.lab}</div>
          <div class="val">${t.val}<span style="font-size:11px;color:var(--muted)"> 户</span></div>
        </div>
      </div>`
      )
      .join("");
  }

  function renderChainRank() {
    const list = M.chains
      .slice()
      .sort((a, b) => b.score - a.score)
      .map((c, i) => ({
        name: c.name.replace("产业链", ""),
        score: c.score,
        id: c.id,
      }));
    $("#chainRank").innerHTML =
      `<div style="color:var(--cyan2);font-size:12px;margin-bottom:4px">景气度 TOP</div>` +
      list
        .map(
          (c, i) => `
      <div class="r" data-chain-id="${c.id}">
        <div class="n">${i + 1}</div>
        <div>${c.name}</div>
        <div style="color:var(--cyan);font-family:var(--mono)">${c.score}</div>
      </div>`
        )
        .join("");
    $$("#chainRank .r").forEach((el) => {
      el.addEventListener("click", () => {
        const chain = M.chains.find((c) => c.id === el.dataset.chainId);
        if (chain) {
          state.chain = chain.name;
          syncChainIcons();
          updateRadar(chain);
          toast(`已切换：${chain.name}`);
        }
      });
    });
  }

  /* ---------- Charts ---------- */
  function initChart(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    if (charts[id]) charts[id].dispose();
    charts[id] = echarts.init(el);
    return charts[id];
  }

  function baseTooltip() {
    return {
      backgroundColor: "rgba(6,24,48,0.92)",
      borderColor: "rgba(0,200,255,0.4)",
      textStyle: { color: "#e8f4ff", fontSize: 12 },
    };
  }

  function renderPie() {
    const data = [
      { name: "区间1 ≤300万", value: 186 },
      { name: "区间2 300-1000万", value: 242 },
      { name: "区间3 1000-2000万", value: 310 },
      { name: "区间4 2000-5000万", value: 268 },
      { name: "区间5 5000万-2亿", value: 168 },
      { name: "区间6 2-10亿", value: 78 },
      { name: "区间7 >10亿", value: 34 },
    ];
    const total = data.reduce((s, d) => s + d.value, 0);
    $("#pieLegend").innerHTML = data
      .map(
        (d, i) => `
      <div class="row">
        <span class="dot" style="background:${COLORS[i]}"></span>
        <span style="flex:1">${d.name}</span>
        <span style="color:#fff;font-family:var(--mono)">${((d.value / total) * 100).toFixed(1)}%</span>
      </div>`
      )
      .join("");

    const chart = initChart("pieChart");
    chart.setOption({
      color: COLORS,
      tooltip: { ...baseTooltip(), trigger: "item" },
      series: [
        {
          type: "pie",
          radius: ["52%", "78%"],
          center: ["50%", "50%"],
          label: { show: false },
          itemStyle: {
            borderColor: "#061428",
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: "rgba(0,200,255,0.25)",
          },
          data,
        },
      ],
      graphic: [
        {
          type: "text",
          left: "center",
          top: "42%",
          style: { text: total.toLocaleString(), fill: "#fff", fontSize: 18, fontWeight: 700, textAlign: "center" },
        },
        {
          type: "text",
          left: "center",
          top: "56%",
          style: { text: "客户数", fill: "#7ea0c0", fontSize: 11, textAlign: "center" },
        },
      ],
    });
  }

  function renderGauge() {
    $("#coverStats").innerHTML = `
      <div class="row"><span style="flex:1">目标覆盖率</span><span style="color:#fff">85.00%</span></div>
      <div class="row"><span style="flex:1">当前覆盖率</span><span style="color:var(--cyan)">78.56%</span></div>
      <div class="row"><span style="flex:1">较上月提升</span><span style="color:var(--orange)">+2.34%</span></div>
      <div class="row"><span style="flex:1">核心区覆盖</span><span style="color:#fff">91.20%</span></div>
      <div class="row"><span style="flex:1">待拓空白点</span><span style="color:#fff">126 户</span></div>
    `;
    const chart = initChart("gaugeChart");
    chart.setOption({
      series: [
        {
          type: "gauge",
          startAngle: 220,
          endAngle: -40,
          min: 0,
          max: 100,
          radius: "95%",
          center: ["50%", "55%"],
          axisLine: {
            lineStyle: {
              width: 12,
              color: [
                [0.6, "#1a4a7a"],
                [0.8, "#00a8d0"],
                [1, "#00e5ff"],
              ],
            },
          },
          pointer: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: true,
            formatter: "{value}%",
            color: "#00e5ff",
            fontSize: 22,
            fontWeight: 700,
            offsetCenter: [0, "0%"],
          },
          title: {
            show: true,
            offsetCenter: [0, "28%"],
            color: "#7ea0c0",
            fontSize: 11,
          },
          data: [{ value: 78.56, name: "综合覆盖率" }],
        },
      ],
    });
  }

  function comboOption(categories, barData, lineData, barName, lineName) {
    return {
      tooltip: { ...baseTooltip(), trigger: "axis" },
      legend: {
        data: [barName, lineName],
        textStyle: { color: "#7ea0c0", fontSize: 10 },
        top: 0,
        right: 0,
        itemWidth: 10,
        itemHeight: 8,
      },
      grid: { left: 40, right: 36, top: 28, bottom: 24 },
      xAxis: {
        type: "category",
        data: categories,
        axisLabel: { color: "#7ea0c0", fontSize: 10 },
        axisLine: { lineStyle: { color: "rgba(0,160,255,0.25)" } },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: "value",
          name: "",
          axisLabel: { color: "#7ea0c0", fontSize: 10 },
          splitLine: { lineStyle: { color: "rgba(0,120,200,0.12)" } },
        },
        {
          type: "value",
          axisLabel: { color: "#7ea0c0", fontSize: 10, formatter: "{value}%" },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: barName,
          type: "bar",
          data: barData,
          barWidth: 10,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#00e5ff" },
              { offset: 1, color: "rgba(0,100,180,0.3)" },
            ]),
            borderRadius: [2, 2, 0, 0],
          },
        },
        {
          name: lineName,
          type: "line",
          yAxisIndex: 1,
          data: lineData,
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { color: "#ff8a3d", width: 2 },
          itemStyle: { color: "#ff8a3d" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(255,138,61,0.25)" },
              { offset: 1, color: "rgba(255,138,61,0)" },
            ]),
          },
        },
      ],
    };
  }

  function renderTrends() {
    const months = ["08", "09", "10", "11", "12", "01", "02", "03", "04", "05", "06", "07"].map(
      (m, i) => (i < 5 ? `2025-${m}` : `2026-${m}`)
    );
    const left = initChart("trendLeft");
    left.setOption(
      comboOption(
        months,
        [42, 48, 51, 55, 58, 62, 60, 68, 72, 78, 82, 86],
        [3.2, 4.1, 5.0, 4.6, 5.8, 6.2, -1.5, 8.1, 6.4, 7.2, 5.5, 8.6],
        "预授信(亿)",
        "增速%"
      )
    );
    const right = initChart("trendRight");
    right.setOption(
      comboOption(
        months,
        [310, 340, 360, 390, 410, 450, 430, 480, 520, 560, 600, 640],
        [2.1, 3.4, 4.0, 5.2, 4.8, 6.1, -2.0, 7.5, 6.8, 5.9, 7.1, 6.4],
        "结算额(亿)",
        "活跃增速%"
      )
    );
  }

  function updateRadar(chain) {
    const c = chain || M.chains[0];
    const keys = Object.keys(c.dims);
    const chart = charts.radarChart || initChart("radarChart");
    charts.radarChart = chart;
    chart.setOption({
      tooltip: baseTooltip(),
      radar: {
        indicator: keys.map((k) => ({ name: k, max: 100 })),
        center: ["50%", "55%"],
        radius: "62%",
        axisName: { color: "#7ea0c0", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(0,160,255,0.2)" } },
        splitArea: {
          areaStyle: {
            color: ["rgba(0,80,140,0.05)", "rgba(0,100,160,0.12)"],
          },
        },
        axisLine: { lineStyle: { color: "rgba(0,160,255,0.25)" } },
      },
      series: [
        {
          type: "radar",
          data: [
            {
              value: keys.map((k) => c.dims[k]),
              name: c.name.replace("产业链", ""),
              areaStyle: { color: "rgba(0,229,255,0.25)" },
              lineStyle: { color: "#00e5ff", width: 2 },
              itemStyle: { color: "#00e5ff" },
            },
          ],
        },
      ],
    });
  }

  /* ---------- China Map ---------- */
  async function loadChinaMap() {
    const urls = [
      "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json",
      "https://cdn.jsdelivr.net/npm/echarts@4.9.0/map/json/china.json",
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const geo = await res.json();
        echarts.registerMap("china", geo);
        return true;
      } catch (_) {
        /* try next */
      }
    }
    return false;
  }

  /* ---------- Geo LOD helpers ---------- */
  function dist2(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return dx * dx + dy * dy;
  }

  function nearestProvince(center) {
    const list = window.GEO_META?.provinces || [];
    let best = list[0];
    let bestD = Infinity;
    list.forEach((p) => {
      const d = dist2(center, p.center);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    });
    return best;
  }

  function extractPlaces(geoJson, level) {
    if (!geoJson?.features) return [];
    return geoJson.features
      .map((f) => {
        const p = f.properties || {};
        const coord = p.centroid || p.center;
        if (!coord || !p.name) return null;
        return {
          name: p.name,
          coord: [Number(coord[0]), Number(coord[1])],
          adcode: p.adcode,
          level: level || p.level || "city",
        };
      })
      .filter(Boolean);
  }

  async function loadGeoJson(adcode) {
    if (geoCache.has(adcode)) return geoCache.get(adcode);
    const urls = [
      `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`,
      `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}.json`,
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const geo = await res.json();
        geoCache.set(adcode, geo);
        placesCache.set(adcode, extractPlaces(geo));
        return geo;
      } catch (_) {
        /* try next */
      }
    }
    geoCache.set(adcode, null);
    placesCache.set(adcode, []);
    return null;
  }

  async function loadRegionPlaces(adcode) {
    if (placesCache.has(adcode)) return placesCache.get(adcode);
    await loadGeoJson(adcode);
    return placesCache.get(adcode) || [];
  }

  async function ensureMapRegistered(adcode) {
    const mapName = adcode === 100000 ? "china" : `adm_${adcode}`;
    if (registeredMaps.has(mapName)) return mapName;
    const geo = await loadGeoJson(adcode);
    if (!geo) return null;
    echarts.registerMap(mapName, geo);
    registeredMaps.add(mapName);
    return mapName;
  }

  function filterNear(places, center, zoom) {
    const radius = Math.max(0.35, 14 / Math.max(zoom, 1));
    const r2 = radius * radius;
    return places
      .filter((p) => dist2(p.coord, center) <= r2)
      .sort((a, b) => dist2(a.coord, center) - dist2(b.coord, center));
  }

  /**
   * 地图分级（始终在全国底图上连续放大）
   * 0 全国 → 1 省内地市 → 2+ 城市/区县（此时起加载真实网点）
   */
  function detailLevel(zoom) {
    if (zoom < 1.8) return 0;
    if (zoom < 4.5) return 1;
    if (zoom < 7.0) return 2;
    if (zoom < 9.0) return 3;
    return 4;
  }

  /** 计算 GeoJSON 外包矩形，用于判断城市在当前缩放下是否够大 */
  function geoJsonBBox(geoJson) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const walk = (coords) => {
      if (!coords) return;
      if (typeof coords[0] === "number") {
        minX = Math.min(minX, coords[0]);
        maxX = Math.max(maxX, coords[0]);
        minY = Math.min(minY, coords[1]);
        maxY = Math.max(maxY, coords[1]);
        return;
      }
      coords.forEach(walk);
    };
    (geoJson?.features || []).forEach((f) => walk(f.geometry?.coordinates));
    if (!Number.isFinite(minX)) return null;
    return {
      minX,
      minY,
      maxX,
      maxY,
      span: Math.max(maxX - minX, maxY - minY),
    };
  }

  /** 城市区县轮廓是否已放大到可读（避免「小小一团」） */
  function cityLargeEnough(zoom, cityGeo) {
    const box = geoJsonBBox(cityGeo);
    if (!box) return false;
    // 降低阈值，更容易进入区县底图（网点加载已不依赖此项）
    return zoom * box.span >= 5.5;
  }

  function shortPlaceName(name) {
    if (!name) return "";
    let n = String(name);
    const strips = [
      "壮族苗族自治州",
      "布依族苗族自治州",
      "苗族侗族自治州",
      "土家族苗族自治州",
      "藏族羌族自治州",
      "朝鲜族自治州",
      "回族自治州",
      "蒙古族藏族自治州",
      "各族自治州",
      "自治州",
      "自治区",
      "自治县",
      "林区",
      "特区",
      "地区",
      "特别行政区",
      "盟",
      "市",
      "县",
      "区",
    ];
    for (const s of strips) {
      if (n.endsWith(s)) {
        n = n.slice(0, -s.length);
        break;
      }
    }
    n = n.replace(/[\u4e00-\u9fa5]+族/g, "");
    return n || name;
  }

  function readGeoView(chart) {
    try {
      const model = chart.getModel().getComponent("geo", 0);
      const sys = model && model.coordinateSystem;
      if (sys && sys.getZoom && sys.getCenter) {
        return { zoom: sys.getZoom(), center: sys.getCenter() };
      }
    } catch (_) {
      /* fallthrough */
    }
    const geo = (chart.getOption().geo && chart.getOption().geo[0]) || {};
    return {
      zoom: Number(geo.zoom) || state.mapZoom,
      center: geo.center || state.mapCenter,
    };
  }

  function chinaGeoStyle(regionData) {
    return {
      map: "china",
      roam: true,
      scaleLimit: { min: 0.6, max: 250 },
      aspectScale: 0.75,
      layoutCenter: ["50%", "52%"],
      layoutSize: "118%",
      label: { show: false },
      itemStyle: {
        areaColor: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "#f0ebe6" },
            { offset: 1, color: "#e4ddd6" },
          ],
        },
        borderColor: "#b8aea4",
        borderWidth: 1,
        shadowColor: "rgba(28, 20, 20, 0.12)",
        shadowBlur: 6,
      },
      emphasis: {
        itemStyle: {
          areaColor: "#f5d0d0",
          borderColor: "#c00000",
          borderWidth: 1.4,
          shadowBlur: 10,
        },
        label: { show: false },
      },
      regions: (regionData || []).map((r) => ({
        name: r.name,
        itemStyle: {
          areaColor: `rgba(${210 - r.value * 0.15}, ${160 - r.value * 0.35}, ${160 - r.value * 0.35}, 0.78)`,
        },
      })),
    };
  }

  /** 城市底图样式：区县铺满视口（类比全国→省的切换） */
  function detailGeoStyle(mapName, labelSize) {
    return {
      map: mapName,
      roam: true,
      scaleLimit: { min: 0.75, max: 24 },
      aspectScale: 0.85,
      layoutCenter: ["50%", "52%"],
      layoutSize: "98%",
      label: {
        show: true,
        color: "#d7efff",
        fontSize: labelSize || 12,
        formatter: (p) => shortPlaceName(p.name),
      },
      itemStyle: {
        areaColor: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "#0a3a6e" },
            { offset: 1, color: "#062448" },
          ],
        },
        borderColor: "#00d4ff",
        borderWidth: 1.2,
        shadowColor: "rgba(0, 200, 255, 0.35)",
        shadowBlur: 10,
      },
      emphasis: {
        label: {
          show: true,
          color: "#ffffff",
          fontSize: (labelSize || 12) + 1,
          fontWeight: 700,
        },
        itemStyle: {
          areaColor: "rgba(18, 90, 150, 0.95)",
          borderColor: "#7af0ff",
          borderWidth: 1.6,
          shadowBlur: 16,
        },
      },
      regions: [],
    };
  }

  function geoJsonToOverlay(geoJson) {
    const fills = [];
    const borders = [];
    const labels = [];
    if (!geoJson?.features) return { fills, borders, labels };

    geoJson.features.forEach((feature) => {
      const props = feature.properties || {};
      const geom = feature.geometry;
      if (!geom || !props.name) return;
      const center = props.centroid || props.center;
      const rings = [];
      if (geom.type === "Polygon") {
        if (geom.coordinates?.[0]) rings.push(geom.coordinates[0]);
      } else if (geom.type === "MultiPolygon") {
        (geom.coordinates || []).forEach((poly) => {
          if (poly?.[0]) rings.push(poly[0]);
        });
      }
      if (!rings.length) return;

      fills.push({
        name: props.name,
        adcode: props.adcode,
        center: center ? [Number(center[0]), Number(center[1])] : null,
        rings,
      });
      rings.forEach((ring) => {
        borders.push({
          name: props.name,
          coords: ring.map((c) => [Number(c[0]), Number(c[1])]),
        });
      });
      if (center) {
        labels.push({
          name: shortPlaceName(props.name),
          fullName: props.name,
          adcode: props.adcode,
          level: "overlay",
          value: [Number(center[0]), Number(center[1]), 1],
        });
      }
    });
    return { fills, borders, labels };
  }

  function renderChinaMap() {
    const chart = initChart("chinaMap");

    const capitalScatter = CAPITALS.map((c) => ({
      name: c.name,
      province: c.province,
      level: "capital",
      value: [...c.coord, 80],
    }));

    const hubScatter = [
      {
        name: SHENZHEN.name,
        value: [...SHENZHEN.coord, 200],
        cust: SHENZHEN.cust,
        isHub: true,
      },
    ];

    const flyLines = FLY_LINES.map(([from, to]) => ({
      fromName: from,
      toName: to,
      coords: [CITY_COORDS[from], CITY_COORDS[to]],
    }));

    const regionData = [
      { name: "广东", value: 95 },
      { name: "江苏", value: 82 },
      { name: "浙江", value: 78 },
      { name: "北京", value: 74 },
      { name: "上海", value: 88 },
      { name: "四川", value: 56 },
      { name: "湖北", value: 52 },
      { name: "山东", value: 60 },
      { name: "福建", value: 48 },
      { name: "河南", value: 40 },
      { name: "陕西", value: 38 },
      { name: "湖南", value: 42 },
      { name: "安徽", value: 36 },
      { name: "重庆", value: 34 },
      { name: "天津", value: 45 },
      { name: "贵州", value: 58 },
    ];

    // 叠加层数据（始终在全国底图之上绘制）
    let overlayFills = [];

    chart.setOption({
      // 关掉过渡动画，避免缩放时区划边界“飘移/变形”
      animation: false,
      animationDurationUpdate: 0,
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(255,255,255,0.96)",
        borderColor: "rgba(192,0,0,0.28)",
        textStyle: { color: "#1c1c1c", fontSize: 12 },
        formatter: (p) => {
          if (p.seriesName === "招行网点") {
            return `${p.data?.fullName || p.name}<br/>点击查看网点详情`;
          }
          if (p.seriesType === "lines" && p.data?.fromName) {
            return `${p.data.fromName} → ${p.data.toName}`;
          }
          if (p.seriesName === "区划边界" || p.seriesName === "区划填充") {
            return p.name || p.data?.name || "";
          }
          if (p.data?.isHub) return `枢纽：深圳（支行属地）`;
          if (p.data?.level === "capital") return `${p.data.province}省会：${p.name}`;
          if (p.data?.fullName) return p.data.fullName;
          return p.name || "";
        },
      },
      geo: {
        ...chinaGeoStyle(regionData),
        zoom: 1.2,
        center: [105, 36],
        scaleLimit: { min: 0.6, max: 250 },
        // 防止 roam 过程中被 setOption 写回中心/缩放导致抖动
        animation: false,
      },
      series: [
        {
          id: "regionFill",
          name: "区划填充",
          type: "custom",
          coordinateSystem: "geo",
          geoIndex: 0,
          zlevel: 1,
          silent: true,
          // 随 geo 缩放实时重算像素坐标，避免填充层滞后漂移
          renderItem(params, api) {
            const item = overlayFills[params.dataIndex];
            if (!item?.rings?.length) return null;
            return {
              type: "group",
              children: item.rings.map((ring) => ({
                type: "polygon",
                shape: {
                  points: ring.map((c) => api.coord(c)),
                },
                style: {
                  fill: "rgba(192, 0, 0, 0.06)",
                  stroke: "rgba(192, 0, 0, 0.45)",
                  lineWidth: 1.2,
                },
              })),
            };
          },
          data: [],
        },
        {
          name: "区划边界",
          type: "lines",
          coordinateSystem: "geo",
          geoIndex: 0,
          polyline: true,
          zlevel: 2,
          silent: true,
          effect: { show: false },
          lineStyle: {
            color: "#c00000",
            width: 1.2,
            opacity: 0.55,
          },
          data: [],
        },
        {
          name: "飞线",
          type: "lines",
          coordinateSystem: "geo",
          zlevel: 3,
          effect: {
            show: true,
            period: 5,
            trailLength: 0.45,
            color: "#c00000",
            symbolSize: 3,
          },
          lineStyle: {
            color: "#e85a5a",
            width: 1,
            opacity: 0.22,
            curveness: 0.25,
          },
          data: flyLines,
        },
        {
          name: "省会",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 4,
          rippleEffect: { brushType: "stroke", scale: 2.8, period: 4 },
          label: {
            show: true,
            formatter: "{b}",
            position: "right",
            color: "#4a3a3a",
            fontSize: 10,
            distance: 4,
          },
          itemStyle: {
            color: "#c00000",
            shadowBlur: 10,
            shadowColor: "rgba(192,0,0,0.4)",
          },
          symbolSize: 9,
          data: capitalScatter,
        },
        {
          name: "细分地名",
          type: "scatter",
          coordinateSystem: "geo",
          zlevel: 5,
          label: {
            show: true,
            formatter: "{b}",
            position: "inside",
            color: "#3a3030",
            fontSize: 11,
            fontWeight: 600,
            textBorderColor: "rgba(255,255,255,0.85)",
            textBorderWidth: 2,
          },
          itemStyle: {
            color: "rgba(192,0,0,0.12)",
            borderColor: "#c00000",
            borderWidth: 1,
          },
          symbolSize: 6,
          data: [],
        },
        {
          name: "街道",
          type: "scatter",
          coordinateSystem: "geo",
          zlevel: 5,
          label: { show: false },
          itemStyle: { color: "rgba(120,100,100,0.01)" },
          symbolSize: 0,
          data: [],
          silent: true,
        },
        {
          name: "招行网点",
          type: "scatter",
          coordinateSystem: "geo",
          zlevel: 8,
          label: {
            show: false,
            formatter: "{b}",
            position: "right",
            color: "#1c1c1c",
            fontSize: 10,
            fontWeight: 650,
            textBorderColor: "rgba(255,255,255,0.9)",
            textBorderWidth: 2,
            distance: 6,
          },
          emphasis: {
            scale: true,
            label: {
              show: true,
              formatter: "{b}",
              position: "top",
              color: "#1c1c1c",
              fontSize: 12,
              fontWeight: 700,
              backgroundColor: "rgba(255,255,255,0.94)",
              padding: [3, 6],
              borderRadius: 3,
            },
            itemStyle: {
              color: "#9a0000",
              shadowBlur: 16,
              shadowColor: "rgba(192,0,0,0.55)",
            },
          },
          itemStyle: {
            color: "#c00000",
            borderColor: "#fff",
            borderWidth: 1.5,
            shadowBlur: 10,
            shadowColor: "rgba(192,0,0,0.4)",
          },
          symbol: "pin",
          symbolSize: 18,
          data: [],
        },
        {
          name: "深圳枢纽",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 6,
          rippleEffect: { brushType: "stroke", scale: 4, period: 2.5 },
          label: {
            show: true,
            formatter: "深圳",
            position: "bottom",
            color: "#9a0000",
            fontSize: 13,
            fontWeight: 700,
            distance: 8,
          },
          itemStyle: {
            color: "#c00000",
            shadowBlur: 22,
            shadowColor: "rgba(192,0,0,0.5)",
          },
          symbolSize: 18,
          data: hubScatter,
        },
        {
          name: "深圳钉标",
          type: "scatter",
          coordinateSystem: "geo",
          zlevel: 7,
          symbol: "pin",
          symbolSize: 36,
          itemStyle: { color: "#c00000" },
          label: {
            show: true,
            formatter: "枢",
            color: "#fff",
            fontSize: 11,
          },
          data: hubScatter,
        },
      ],
    });

    let roamTimer = null;
    let lodToken = 0;
    let lastPoiCity = null;
    let lastOverlayKey = "";
    let lastAppliedLv = -1;

    /** 缩放/平移时强制 custom 填充层跟 geo 重算，避免板块滞后漂移 */
    function syncOverlayPixels() {
      if (!overlayFills.length) return;
      chart.setOption(
        {
          animation: false,
          series: [
            {
              id: "regionFill",
              data: overlayFills.map((f) => ({
                name: f.name,
                adcode: f.adcode,
                value: f.center || state.mapCenter,
              })),
            },
          ],
        },
        { lazyUpdate: true }
      );
    }

    const applyLod = async () => {
      const token = ++lodToken;
      const view = readGeoView(chart);
      const zoom = view.zoom;
      const center = view.center;
      const lv = detailLevel(zoom);
      state.mapZoom = zoom;
      state.mapCenter = center;

      const province = nearestProvince(center);
      if (state.focusProvince && province) {
        const same = String(state.focusProvince.adcode) === String(province.adcode);
        if (!same) {
          const dOld = dist2(center, state.focusProvince.center);
          const dNew = dist2(center, province.center);
          if (dOld > dNew * 1.25) state.focusProvince = province;
        }
      } else {
        state.focusProvince = province;
      }
      const activeProvince = state.focusProvince;

      let overlay = { fills: [], borders: [], labels: [] };
      let streets = [];
      let branches = [];

      // 省级地市轮廓（连续放大时始终作为「粗粒度」层）
      if (lv >= 1 && activeProvince) {
        const provGeo = await loadGeoJson(activeProvince.adcode);
        if (token !== lodToken) return;
        if (provGeo) {
          overlay = geoJsonToOverlay(provGeo);
        }
      }

      if (lv === 0) state.forceCity = null;

      let focusCity = null;
      let showingCityDistricts = false;

      if (lv >= 2) {
        if (state.forceCity) {
          focusCity = state.forceCity;
        } else if (activeProvince) {
          const places = placesCache.get(activeProvince.adcode) || [];
          const nearCities = filterNear(places, center, zoom);
          const prev = state.focusCity;
          if (prev && nearCities.some((c) => String(c.adcode) === String(prev.adcode))) {
            focusCity = prev;
          } else if (
            prev &&
            places.some((c) => String(c.adcode) === String(prev.adcode)) &&
            dist2(prev.coord, center) <= Math.max(0.8, 18 / Math.max(zoom, 1)) ** 2
          ) {
            focusCity = prev;
          } else {
            focusCity = nearCities[0] || places[0];
          }
        }
        state.focusCity = focusCity;

        // 仅当城市已放大到足够大时，才叠区县；否则继续显示省内地市轮廓（避免小小一团）
        if (
          focusCity?.adcode &&
          String(focusCity.adcode) !== String(activeProvince?.adcode || "")
        ) {
          const cityGeo = await loadGeoJson(focusCity.adcode);
          if (token !== lodToken) return;
          if (cityGeo && cityLargeEnough(zoom, cityGeo)) {
            overlay = geoJsonToOverlay(cityGeo);
            showingCityDistricts = true;
          }
        }
      }

      // 不再叠加虚构街道地名（放大后易重叠成一团）
      streets = [];

      // 放大到地市视野即加载真实网点（不再等区县铺满 / lv4）
      // 用当前地图中心解析招行城市名，避免停在「南川」等区县时请求失败或 bbox 过窄把城区网点滤光
      const showBranches = zoom >= 4.8 && lv >= 2;

      // 区名：适量显示；网点名默认不标，悬停才出；街道名永久关闭
      const showDistrictNames = showingCityDistricts && zoom >= 18;
      const showStreetNames = false;
      const showCityNames = lv === 1 && !showingCityDistricts;

      let fitToBranches = null;
      if (showBranches) {
        const cmbCity = await window.BranchAPI.resolveCmbCityName({
          cityAdcode: focusCity?.adcode,
          cityName: focusCity?.name || activeProvince?.name,
          center,
        });
        if (token !== lodToken) return;
        // 拉取该市全部真实网点（不按过窄 bbox 过滤）
        branches = await window.BranchAPI.fetchBranches({
          cityAdcode: focusCity?.adcode,
          cityName: cmbCity,
          center,
          bbox: null,
        });
        if (token !== lodToken) return;

        const halfLng = Math.max(0.14, 11 / Math.max(zoom, 1));
        const halfLat = halfLng * 0.75;
        const inView = branches.filter(
          (b) =>
            Math.abs(b.coord[0] - center[0]) <= halfLng &&
            Math.abs(b.coord[1] - center[1]) <= halfLat
        );

        if (lastPoiCity !== cmbCity) {
          lastPoiCity = cmbCity;
          if (branches.length) {
            if (!inView.length) {
              // 如南川等远郊：视野内无点，自动落到主城区网点中心
              const lngs = branches.map((b) => b.coord[0]);
              const lats = branches.map((b) => b.coord[1]);
              fitToBranches = {
                center: [
                  (Math.min(...lngs) + Math.max(...lngs)) / 2,
                  (Math.min(...lats) + Math.max(...lats)) / 2,
                ],
                zoom: Math.min(Math.max(zoom, 5.8), 7.2),
              };
              toast(`${cmbCity} · ${branches.length} 家网点（已定位到主城区）`);
            } else {
              toast(`${cmbCity} · 已加载真实网点 ${branches.length} 家`);
            }
          } else {
            toast(`${cmbCity} · 暂未取到网点，请确认已用 serve.py 启动`);
          }
        }
      } else {
        lastPoiCity = null;
      }

      if (lv === 0) {
        overlay = { fills: [], borders: [], labels: [] };
        streets = [];
        branches = [];
      }

      const overlayKey = `${lv}|${activeProvince?.adcode || ""}|${
        showingCityDistricts ? focusCity?.adcode || "" : "prov"
      }`;
      const overlayChanged = overlayKey !== lastOverlayKey;
      const lvChanged = lv !== lastAppliedLv;
      lastOverlayKey = overlayKey;
      lastAppliedLv = lv;

      if (overlayChanged) overlayFills = overlay.fills;

      const branchScatter = branches.map((b, i) => {
        const highlighted = state.highlightBranchId && state.highlightBranchId === b.id;
        return {
          id: b.id,
          branchNo: b.branchNo || "",
          name: b.shortName,
          fullName: b.name,
          city: b.city,
          address: b.address,
          phone: b.phone,
          level: "poi",
          value: [...b.coord, 1],
          symbolSize: highlighted ? Math.max(32, zoom >= 18 ? 36 : 28) : undefined,
          itemStyle: highlighted
            ? {
                color: "#ffd0d0",
                borderColor: "#fff",
                borderWidth: 2,
                shadowBlur: 22,
                shadowColor: "rgba(192,0,0,0.55)",
              }
            : undefined,
          label: { show: false },
        };
      });

      const poiSize =
        zoom >= 22 ? 34 : zoom >= 18 ? 28 : zoom >= 14 ? 22 : zoom >= 10 ? 18 : zoom >= 6 ? 14 : 12;

      const seriesPatch = [
        overlayChanged
          ? {
              id: "regionFill",
              name: "区划填充",
              data:
                lv >= 1
                  ? overlay.fills.map((f) => ({
                      name: f.name,
                      adcode: f.adcode,
                      value: f.center || center,
                    }))
                  : [],
            }
          : null,
        overlayChanged
          ? {
              name: "区划边界",
              data: lv >= 1 ? overlay.borders : [],
              lineStyle: {
                width: showingCityDistricts ? 1.1 : 1.35,
                opacity: lv === 0 ? 0 : showBranches ? 0.4 : 0.75,
                color: showingCityDistricts ? "#a06060" : "#c00000",
              },
            }
          : null,
        overlayChanged || lvChanged
          ? {
              name: "飞线",
              data: lv === 0 ? flyLines : [],
              lineStyle: { opacity: lv === 0 ? 0.28 : 0 },
              effect: { show: lv === 0 },
            }
          : null,
        overlayChanged || lvChanged
          ? {
              name: "省会",
              label: { show: lv === 0 },
              itemStyle: { opacity: lv === 0 ? 1 : Math.max(0.15, 0.55 - lv * 0.1) },
            }
          : null,
        {
          name: "细分地名",
          // 省级：地市名；城市内：放大后显示区名
          data: showCityNames || showDistrictNames ? overlay.labels : [],
          label: {
            show: showCityNames || showDistrictNames,
            fontSize: showDistrictNames ? (zoom >= 20 ? 13 : 12) : 11,
            color: showDistrictNames ? "#3a3030" : "#4a3a3a",
            fontWeight: showDistrictNames ? 650 : 600,
          },
          itemStyle: {
            color: showDistrictNames ? "rgba(0,0,0,0)" : "rgba(192,0,0,0.12)",
            borderColor: showDistrictNames ? "rgba(0,0,0,0)" : "#c00000",
            borderWidth: showDistrictNames ? 0 : 1,
          },
          symbolSize: showDistrictNames ? 0 : 6,
        },
        {
          name: "街道",
          data: showStreetNames ? streets : [],
          label: {
            show: showStreetNames,
            fontSize: zoom >= 18 ? 11 : 10,
          },
          itemStyle: {
            color: showStreetNames ? "rgba(120,100,100,0.2)" : "rgba(120,100,100,0.3)",
          },
          symbolSize: showStreetNames ? 3 : 4,
        },
        {
          name: "招行网点",
          data: showBranches ? branchScatter : [],
          symbolSize: poiSize,
          label: {
            show: false,
            formatter: "{b}",
            color: "#1c1c1c",
            fontSize: 11,
            fontWeight: 700,
            backgroundColor: "rgba(255,255,255,0.94)",
            padding: [3, 6],
            borderRadius: 3,
            distance: 6,
          },
          emphasis: {
            scale: true,
            label: { show: true, position: "top" },
          },
        },
        overlayChanged || lvChanged
          ? { name: "深圳枢纽", data: lv === 0 ? hubScatter : [] }
          : null,
        overlayChanged || lvChanged
          ? { name: "深圳钉标", data: lv === 0 ? hubScatter : [] }
          : null,
      ].filter(Boolean);

      // 默认不写回 geo.center/zoom，避免拖拽抖动；仅在远郊无网点时自动落到主城区
      chart.setOption(
        {
          animation: false,
          series: seriesPatch,
          ...(fitToBranches
            ? {
                geo: {
                  center: fitToBranches.center,
                  zoom: fitToBranches.zoom,
                },
              }
            : {}),
        },
        { lazyUpdate: true }
      );
    };

    chart.off("georoam");
    chart.on("georoam", () => {
      syncOverlayPixels();
      clearTimeout(roamTimer);
      roamTimer = setTimeout(applyLod, 120);
    });

    chart.off("click");
    chart.on("click", (params) => {
      if (params.seriesName === "招行网点" && params.data?.id) {
        goToBranchArea(params.data);
        return;
      }
      if (params.data?.cust || params.data?.isHub) {
        openCustomer(SHENZHEN.cust);
        return;
      }

      // 成都：连续放大到城市视野（不切底图）
      const enterChengduBranches = async () => {
        state.forceCity = {
          name: "成都市",
          adcode: 510100,
          coord: [104.0665, 30.5723],
        };
        state.highlightBranchId = null;
        chart.setOption({
          animation: false,
          geo: {
            center: [104.0665, 30.5723],
            zoom: 11,
            scaleLimit: { min: 0.6, max: 250 },
          },
        });
        await loadGeoJson(510100);
        await window.BranchAPI.fetchBranches({
          cityAdcode: 510100,
          cityName: "成都市",
          center: [104.0665, 30.5723],
        });
        await applyLod();
        toast("成都市 · 已展示招商银行网点");
      };

      if (
        params.name === "成都" ||
        (params.data?.level === "capital" && params.name === "成都") ||
        (params.data?.province === "四川" && String(params.name || "").includes("成都"))
      ) {
        enterChengduBranches();
        return;
      }

      if (params.data?.level === "capital" && params.data?.value) {
        state.forceCity = null;
        chart.setOption({
          animation: false,
          geo: {
            center: [params.data.value[0], params.data.value[1]],
            zoom: Math.max(state.mapZoom, 3.4),
            scaleLimit: { min: 0.6, max: 250 },
          },
        });
        setTimeout(applyLod, 40);
        return;
      }

      // 点击地市：平滑放大到该市（全国底图保留）
      if (params.data?.level === "overlay" && params.data?.value) {
        state.forceCity = params.data.adcode
          ? {
              name: params.data.fullName || params.data.name,
              adcode: params.data.adcode,
              coord: [params.data.value[0], params.data.value[1]],
            }
          : null;
        chart.setOption({
          animation: false,
          geo: {
            center: [params.data.value[0], params.data.value[1]],
            zoom: Math.max(state.mapZoom, 9.5),
            scaleLimit: { min: 0.6, max: 250 },
          },
        });
        setTimeout(applyLod, 40);
      }
    });

    window.MapNav = {
      focusBranch(branch) {
        if (!branch?.coord) return;
        state.highlightBranchId = branch.id;
        if (branch.cityAdcode) {
          state.forceCity = {
            name: branch.city || "成都市",
            adcode: branch.cityAdcode,
            coord: branch.coord,
          };
        }
        chart.setOption({
          animation: false,
          geo: {
            center: branch.coord,
            zoom: 15.5,
            scaleLimit: { min: 0.6, max: 250 },
          },
        });
        setTimeout(applyLod, 40);
        toast(`已定位：${branch.shortName || branch.name}`);
      },
      clearHighlight() {
        state.highlightBranchId = null;
        setTimeout(applyLod, 20);
      },
    };

    // 预取四川/成都边界，演示更顺滑（非全量网点）
    loadGeoJson(510000);

    const heat = initChart("heatMap");
    heat.setOption({
      geo: {
        map: "china",
        roam: false,
        zoom: 1.2,
        silent: true,
        itemStyle: {
          areaColor: "#0a2a4a",
          borderColor: "#1a6a9a",
          borderWidth: 0.6,
        },
        emphasis: { disabled: true },
      },
      visualMap: {
        min: 0,
        max: 100,
        show: true,
        right: 4,
        bottom: 4,
        textStyle: { color: "#7ea0c0", fontSize: 10 },
        inRange: { color: ["#062448", "#0a5a9a", "#00c8ff"] },
        itemWidth: 8,
        itemHeight: 60,
      },
      series: [
        {
          type: "map",
          map: "china",
          geoIndex: 0,
          data: regionData,
        },
      ],
    });
  }

  function renderFallbackMap() {
    const chart = initChart("chinaMap");
    chart.setOption({
      backgroundColor: "transparent",
      title: {
        text: "地图数据加载中 / 请检查网络后刷新",
        left: "center",
        top: "45%",
        textStyle: { color: "#7ea0c0", fontSize: 14 },
      },
    });
  }

  /* ---------- Customer drawer ---------- */
  function openCustomer(id) {
    const c = M.customers.find((x) => x.id === id);
    if (!c) return;
    $("#drawerTitle").textContent = c.name;
    $("#drawerMeta").textContent = `${c.id} · ${c.district} · ${c.industry}`;
    const creditText = M.creditLabels[c.creditLabel];
    $("#drawerBody").innerHTML = `
      <div>
        <span class="chip">${c.tier} ${c.tierScore}</span>
        <span class="chip">${c.stream} · ${c.node}</span>
        <span class="chip">${c.scale}</span>
      </div>
      <div class="credit-banner">
        <div class="sec-title">任务一 · 授信获批区间建议</div>
        <div class="big">区间 ${c.creditLabel} · ${creditText}</div>
      </div>
      <div>
        <div class="sec-title">工商与经营</div>
        <div class="info-grid">
          <div class="item"><div class="k">注册资本</div><div class="v">${c.capital}</div></div>
          <div class="item"><div class="k">员工人数</div><div class="v">${c.employees}</div></div>
          <div class="item"><div class="k">营业收入</div><div class="v">${c.revenueYi} 亿</div></div>
          <div class="item"><div class="k">净利润</div><div class="v">${c.profitYi} 亿</div></div>
        </div>
      </div>
      <div>
        <div class="sec-title">产业链位置（任务二）</div>
        <div class="info-grid">
          <div class="item"><div class="k">所属产业链</div><div class="v">${c.chain}</div></div>
          <div class="item"><div class="k">节点</div><div class="v">${c.node}</div></div>
          <div class="item"><div class="k">链上地位</div><div class="v">${c.tierScore}</div></div>
          <div class="item"><div class="k">政策契合度</div><div class="v">${c.policyFit}</div></div>
        </div>
      </div>
      <button class="btn-primary" id="addVisit">加入拜访清单</button>
    `;
    $("#drawer").classList.add("open");
    $("#mask").classList.add("open");
    $("#addVisit").onclick = () => toast("已加入支行作战清单");
  }

  function closeDrawer() {
    $("#drawer").classList.remove("open");
    $("#mask").classList.remove("open");
  }

  function syncChainIcons() {
    $$(".chain-icon").forEach((el) => {
      el.classList.toggle("active", el.dataset.chain === state.chain);
    });
  }

  function bindUI() {
    const closeBtn = $("#closeDrawer");
    const mask = $("#mask");
    if (closeBtn) closeBtn.onclick = closeDrawer;
    if (mask) mask.onclick = closeDrawer;

    $$(".chain-icon").forEach((el) => {
      el.addEventListener("click", () => {
        state.chain = el.dataset.chain;
        syncChainIcons();
        const chain = M.chains.find((c) => c.name === state.chain);
        if (chain) updateRadar(chain);
        toast(state.chain === "all" ? "已显示全部产业链" : `聚焦：${state.chain}`);
      });
    });

    window.addEventListener("resize", () => {
      Object.values(charts).forEach((c) => c?.resize());
    });
  }


  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlightMatch(text, q) {
    const raw = String(text || "");
    const i = raw.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return escapeHtml(raw);
    return (
      escapeHtml(raw.slice(0, i)) +
      "<mark>" +
      escapeHtml(raw.slice(i, i + q.length)) +
      "</mark>" +
      escapeHtml(raw.slice(i + q.length))
    );
  }

  async function loadSearchCorpus() {
    // 预热重点城市真实网点（招行公开接口）
    if (window.BranchAPI.prefetchMajorCities) {
      await window.BranchAPI.prefetchMajorCities();
    }
    const all = [];
    for (const c of window.BranchAPI.MAJOR_CITIES || []) {
      const list = await window.BranchAPI.fetchBranches({
        cityAdcode: c.adcode,
        cityName: c.name,
        center: c.center,
      });
      all.push(...list);
    }
    return all;
  }

  function initBranchSearch() {
    const input = $("#branchSearch");
    const btn = $("#branchSearchBtn");
    const drop = $("#branchSearchDrop");
    if (!input || !btn || !drop) return;

    let timer = null;
    let activeIdx = -1;
    let currentList = [];

    const hideDrop = () => {
      drop.hidden = true;
      drop.innerHTML = "";
      activeIdx = -1;
    };

    const renderDrop = (list, q) => {
      currentList = list;
      activeIdx = list.length ? 0 : -1;
      if (!q) {
        hideDrop();
        return;
      }
      if (!list.length) {
        drop.innerHTML = `<div class="search-empty">未找到匹配网点，可试：武侯 / 春熙路 / 天府</div>`;
        drop.hidden = false;
        return;
      }
      drop.innerHTML = list
        .map(
          (b, i) => `
        <button type="button" class="search-item ${i === 0 ? "active" : ""}" data-idx="${i}">
          <div>
            <div class="n">${highlightMatch(b.shortName || b.name, q)}</div>
            <div class="m">${escapeHtml(b.city || "成都市")}${b.branchNo ? " · No." + escapeHtml(b.branchNo) : ""}</div>
          </div>
          <span class="tag">定位</span>
          <span class="tag enter" data-enter="${i}">进入辖区</span>
        </button>`
        )
        .join("");
      drop.hidden = false;
      $$("#branchSearchDrop .search-item").forEach((el) => {
        el.addEventListener("mousedown", (e) => {
          e.preventDefault();
          if (e.target.closest("[data-enter]")) {
            selectIdx(Number(e.target.closest("[data-enter]").dataset.enter), true);
            return;
          }
          selectIdx(Number(el.dataset.idx), false);
        });
      });
    };

    const selectIdx = (idx, enterArea) => {
      const b = currentList[idx];
      if (!b) return;
      input.value = b.shortName || b.name;
      hideDrop();
      if (enterArea) {
        goToBranchArea(b);
        return;
      }
      if (window.MapNav?.focusBranch) {
        window.MapNav.focusBranch(b);
        toast("已定位网点，再次点击地图钉子或按 Enter 进入辖区");
      } else {
        toast("地图尚未就绪，请稍后再试");
      }
    };

    const runSearch = async (q) => {
      const query = (q || "").trim();
      if (!query) {
        hideDrop();
        return;
      }
      try {
        let hit = [];
        if (window.BranchAPI.searchAll) {
          hit = await window.BranchAPI.searchAll(query, 12);
        } else {
          const corpus = await loadSearchCorpus();
          const ql = query.toLowerCase();
          hit = corpus
            .filter((b) => {
              const blob = `${b.name || ""}${b.shortName || ""}${b.branchNo || ""}${b.address || ""}`.toLowerCase();
              return blob.includes(ql);
            })
            .slice(0, 12);
        }
        renderDrop(hit, query);
      } catch (e) {
        drop.innerHTML = `<div class="search-empty">搜索失败，请确认已用 serve.py 启动</div>`;
        drop.hidden = false;
      }
    };

    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => runSearch(input.value), 180);
    });

    input.addEventListener("keydown", (e) => {
      const items = $$("#branchSearchDrop .search-item");
      if (e.key === "ArrowDown" && items.length) {
        e.preventDefault();
        activeIdx = Math.min(activeIdx + 1, items.length - 1);
        items.forEach((el, i) => el.classList.toggle("active", i === activeIdx));
      } else if (e.key === "ArrowUp" && items.length) {
        e.preventDefault();
        activeIdx = Math.max(activeIdx - 1, 0);
        items.forEach((el, i) => el.classList.toggle("active", i === activeIdx));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIdx >= 0 && currentList[activeIdx]) selectIdx(activeIdx, e.shiftKey);
        else
          runSearch(input.value).then(() => {
            if (currentList[0]) selectIdx(0, e.shiftKey);
          });
      } else if (e.key === "Escape") {
        hideDrop();
      }
    });

    btn.addEventListener("click", () => {
      runSearch(input.value).then(() => {
        if (currentList[0]) selectIdx(0);
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-wrap") && !e.target.closest(".search-box")) hideDrop();
    });
  }

  function resetChinaMapView() {
    state.focusProvince = null;
    state.focusCity = null;
    state.forceCity = null;
    state.highlightBranchId = null;
    state.mapZoom = 1.2;
    state.mapCenter = [105, 36];
    const chart = charts.chinaMap;
    if (!chart) return;
    chart.setOption({
      animation: false,
      geo: {
        center: [105, 36],
        zoom: 1.2,
        scaleLimit: { min: 0.6, max: 250 },
      },
    });
    toast("已重置全国视野");
  }

  window.MapNav = window.MapNav || {};
  window.MapNav.resetView = resetChinaMapView;
  window.__resetChinaMap = resetChinaMapView;

  async function boot() {
    tickClock();
    setInterval(tickClock, 1000);
    const mapOnly = document.body.classList.contains("page-map");
    const useStreetMap =
      document.body.classList.contains("workspace") &&
      window.CmbStreetMap &&
      document.getElementById("chinaMap");

    if (!mapOnly && !useStreetMap) {
      renderKpiStrip();
      renderBottom();
      renderPolicyTable();
      renderTierBlocks();
      renderChainRank();
      renderPie();
      renderGauge();
      renderTrends();
      updateRadar(M.chains[0]);
    }
    bindUI();
    initBranchSearch();

    // 工作台：街道级 Leaflet 底图（道路/影像），替代纯行政区划 ECharts
    if (useStreetMap) {
      try {
        await window.CmbStreetMap.boot("chinaMap");
        state.mapReady = true;
        window.BranchAPI.loadCityCatalog?.()
          .then(() => window.BranchAPI.prefetchMajorCities?.())
          .catch(() => {});
      } catch (e) {
        console.error(e);
        toast("街道底图加载失败，回退行政区划地图");
        const ok = await loadChinaMap();
        if (ok) {
          renderChinaMap();
          state.mapReady = true;
        }
      }
      return;
    }

    const ok = await loadChinaMap();
    if (ok) {
      renderChinaMap();
      state.mapReady = true;
      window.BranchAPI.loadCityCatalog?.()
        .then(() => window.BranchAPI.prefetchMajorCities?.())
        .catch(() => {});
    } else {
      renderFallbackMap();
      toast("中国地图 GeoJSON 加载失败，请检查网络");
    }
  }

  boot();
})();
