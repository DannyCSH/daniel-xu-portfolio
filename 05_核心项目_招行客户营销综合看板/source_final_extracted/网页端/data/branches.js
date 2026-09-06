/**
 * 招行网点：https://map.cmbchina.com/map 公开接口（经 /cmb-api 代理）
 * - 坐标为百度 BD-09，绘制前转换为 GCJ-02（与 DataV 底图一致）
 * - 城市名必须用接口城市表中的短名（如「成都」），不可用「成都市/武侯区」
 */
window.BranchAPI = (() => {
  const cache = new Map();
  let cityCatalog = null; // [{cityName, lng, lat, prov?}]
  const branchDataBaseUrl = document.currentScript?.src
    ? new URL(".", document.currentScript.src)
    : new URL("data/", document.baseURI);

  const MAJOR_CITIES = [
    { name: "深圳", adcode: 440300, center: [114.0579, 22.5431] },
    { name: "北京", adcode: 110100, center: [116.4074, 39.9042] },
    { name: "上海", adcode: 310100, center: [121.4737, 31.2304] },
    { name: "广州", adcode: 440100, center: [113.2644, 23.1291] },
    { name: "杭州", adcode: 330100, center: [120.1551, 30.2741] },
    { name: "成都", adcode: 510100, center: [104.0665, 30.5723] },
    { name: "南京", adcode: 320100, center: [118.7969, 32.0603] },
    { name: "武汉", adcode: 420100, center: [114.3055, 30.5928] },
    { name: "西安", adcode: 610100, center: [108.9398, 34.3416] },
    { name: "重庆", adcode: 500100, center: [106.5516, 29.563] },
    { name: "天津", adcode: 120100, center: [117.2008, 39.0842] },
    { name: "苏州", adcode: 320500, center: [120.5853, 31.2989] },
    { name: "呼和浩特", adcode: 150100, center: [111.7492, 40.8424] },
    { name: "沈阳", adcode: 210100, center: [123.4315, 41.8057] },
    { name: "郑州", adcode: 410100, center: [113.6254, 34.7466] },
    { name: "长沙", adcode: 430100, center: [112.9388, 28.2282] },
  ];

  /** 全国省会（全国视野红点 + 深圳飞线） */
  const PROVINCIAL_CAPITALS = [
    { name: "北京", province: "北京", center: [116.4074, 39.9042] },
    { name: "天津", province: "天津", center: [117.2008, 39.0842] },
    { name: "石家庄", province: "河北", center: [114.5149, 38.0428] },
    { name: "太原", province: "山西", center: [112.5489, 37.8706] },
    { name: "呼和浩特", province: "内蒙古", center: [111.7492, 40.8424] },
    { name: "沈阳", province: "辽宁", center: [123.4315, 41.8057] },
    { name: "长春", province: "吉林", center: [125.3235, 43.8171] },
    { name: "哈尔滨", province: "黑龙江", center: [126.5349, 45.8038] },
    { name: "上海", province: "上海", center: [121.4737, 31.2304] },
    { name: "南京", province: "江苏", center: [118.7969, 32.0603] },
    { name: "杭州", province: "浙江", center: [120.1551, 30.2741] },
    { name: "合肥", province: "安徽", center: [117.2272, 31.8206] },
    { name: "福州", province: "福建", center: [119.2965, 26.0745] },
    { name: "南昌", province: "江西", center: [115.8581, 28.6832] },
    { name: "济南", province: "山东", center: [117.1205, 36.6519] },
    { name: "郑州", province: "河南", center: [113.6254, 34.7466] },
    { name: "武汉", province: "湖北", center: [114.3055, 30.5928] },
    { name: "长沙", province: "湖南", center: [112.9388, 28.2282] },
    { name: "广州", province: "广东", center: [113.2644, 23.1291] },
    { name: "南宁", province: "广西", center: [108.3669, 22.817] },
    { name: "海口", province: "海南", center: [110.3312, 20.0319] },
    { name: "重庆", province: "重庆", center: [106.5516, 29.563] },
    { name: "成都", province: "四川", center: [104.0665, 30.5723] },
    { name: "贵阳", province: "贵州", center: [106.6302, 26.6477] },
    { name: "昆明", province: "云南", center: [102.8329, 24.8801] },
    { name: "拉萨", province: "西藏", center: [91.1409, 29.6456] },
    { name: "西安", province: "陕西", center: [108.9398, 34.3416] },
    { name: "兰州", province: "甘肃", center: [103.8343, 36.0611] },
    { name: "西宁", province: "青海", center: [101.7782, 36.6171] },
    { name: "银川", province: "宁夏", center: [106.2309, 38.4872] },
    { name: "乌鲁木齐", province: "新疆", center: [87.6168, 43.8256] },
    { name: "香港", province: "香港", center: [114.1694, 22.3193] },
    { name: "澳门", province: "澳门", center: [113.5439, 22.1987] },
    { name: "台北", province: "台湾", center: [121.5654, 25.033] },
  ];

  const SHENZHEN_HUB = { name: "深圳", center: [114.0579, 22.5431] };

  /** 省名/自治区 → 招行接口城市短名（不可用「内蒙古」直接查网点） */
  const PROV_TO_CITY = {
    北京: "北京",
    天津: "天津",
    河北: "石家庄",
    山西: "太原",
    内蒙古: "呼和浩特",
    辽宁: "沈阳",
    吉林: "长春",
    黑龙江: "哈尔滨",
    上海: "上海",
    江苏: "南京",
    浙江: "杭州",
    安徽: "合肥",
    福建: "福州",
    江西: "南昌",
    山东: "济南",
    河南: "郑州",
    湖北: "武汉",
    湖南: "长沙",
    广东: "广州",
    广西: "南宁",
    海南: "海口",
    重庆: "重庆",
    四川: "成都",
    贵州: "贵阳",
    云南: "昆明",
    西藏: "拉萨",
    陕西: "西安",
    甘肃: "兰州",
    青海: "西宁",
    宁夏: "银川",
    新疆: "乌鲁木齐",
    香港: "香港",
    澳门: "澳门",
    台湾: "台北",
  };

  /** BD-09 → GCJ-02（招行地图为百度坐标） */
  function bd09ToGcj02(bdLng, bdLat) {
    const x = Number(bdLng) - 0.0065;
    const y = Number(bdLat) - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin((y * Math.PI * 3000) / 180);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos((x * Math.PI * 3000) / 180);
    return [z * Math.cos(theta), z * Math.sin(theta)];
  }

  function shortCity(name) {
    return String(name || "")
      .replace(/(特别行政区|自治区|壮族|回族|维吾尔)/g, "")
      .replace(/(市|地区|盟|州|县|区|旗)$/g, "")
      .trim();
  }

  async function loadCityCatalog() {
    if (cityCatalog) return cityCatalog;
    try {
      const res = await fetch("/cmb-api/map/getProCityInfo", { credentials: "omit" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.returnCode !== "SUC0000") throw new Error(json.errorMsg || "city list fail");
      const list = [];
      (json.body?.provList || []).forEach((prov) => {
        (prov.cityList || []).forEach((c) => {
          if (!c?.cityName || !c.lng || !c.lat) return;
          const [glng, glat] = bd09ToGcj02(c.lng, c.lat);
          list.push({
            cityName: c.cityName,
            lng: glng,
            lat: glat,
            bdLng: Number(c.lng),
            bdLat: Number(c.lat),
            provName: prov.provName || "",
          });
        });
      });
      cityCatalog = list;
      console.info("[BranchAPI] 城市目录", list.length);
    } catch (e) {
      console.warn("[BranchAPI] 城市目录失败，回退重点城市", e);
      cityCatalog = MAJOR_CITIES.map((c) => ({
        cityName: c.name,
        lng: c.center[0],
        lat: c.center[1],
        provName: "",
      }));
    }
    return cityCatalog;
  }

  function nearestCatalogCity(catalog, center) {
    if (!center || !catalog?.length) return null;
    let best = null;
    let bestD = Infinity;
    catalog.forEach((c) => {
      const d = (c.lng - center[0]) ** 2 + (c.lat - center[1]) ** 2;
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    });
    return best;
  }

  /** 将地图当前城市/区县解析为招行接口可用的 cityName */
  async function resolveCmbCityName({ cityAdcode, cityName, center }) {
    const catalog = await loadCityCatalog();
    const raw = String(cityName || "");
    const short = shortCity(raw);

    // 0) 省名 → 省会（如「内蒙古」→「呼和浩特」）
    if (PROV_TO_CITY[short] || PROV_TO_CITY[raw]) {
      return PROV_TO_CITY[short] || PROV_TO_CITY[raw];
    }
    const provHit = PROVINCIAL_CAPITALS.find(
      (c) => c.province === short || c.province === raw || c.name === short
    );
    if (provHit && (PROV_TO_CITY[provHit.province] || catalog.some((x) => x.cityName === provHit.name))) {
      return provHit.name;
    }

    // 1) 精确/包含匹配城市短名
    let hit = catalog.find((c) => c.cityName === short || c.cityName === raw);
    if (!hit) hit = catalog.find((c) => short && (c.cityName.includes(short) || short.includes(c.cityName)));
    if (hit) return hit.cityName;

    // 2) 按中心点最近城市（不设距离上限，避免内蒙等大省被误判为成都）
    const near = nearestCatalogCity(catalog, center);
    if (near) return near.cityName;

    // 3) adcode 前缀匹配重点城
    const code = Number(cityAdcode);
    if (code) {
      const cityCode = Math.floor(code / 100) * 100;
      const m = MAJOR_CITIES.find((c) => c.adcode === cityCode || c.adcode === code);
      if (m) return m.name;
      // 省级 adcode：15xxxx → 呼和浩特
      const provCode = Math.floor(code / 10000);
      const byProv = {
        11: "北京",
        12: "天津",
        13: "石家庄",
        14: "太原",
        15: "呼和浩特",
        21: "沈阳",
        22: "长春",
        23: "哈尔滨",
        31: "上海",
        32: "南京",
        33: "杭州",
        34: "合肥",
        35: "福州",
        36: "南昌",
        37: "济南",
        41: "郑州",
        42: "武汉",
        43: "长沙",
        44: "广州",
        45: "南宁",
        46: "海口",
        50: "重庆",
        51: "成都",
        52: "贵阳",
        53: "昆明",
        54: "拉萨",
        61: "西安",
        62: "兰州",
        63: "西宁",
        64: "银川",
        65: "乌鲁木齐",
      };
      if (byProv[provCode]) return byProv[provCode];
    }

    // 4) 省会表兜底
    if (short && PROVINCIAL_CAPITALS.some((c) => c.name === short)) return short;
    return near?.cityName || short || "成都";
  }

  /** 视野内/附近多个招行城市（解决跨市、内蒙多城网点不全） */
  async function citiesNearView(center, bbox, limit = 6) {
    const catalog = await loadCityCatalog();
    const [minLng, minLat, maxLng, maxLat] = bbox || [0, 0, 0, 0];
    const hasBbox = Array.isArray(bbox) && bbox.length === 4;
    const scored = catalog.map((c) => {
      const d = center
        ? (c.lng - center[0]) ** 2 + (c.lat - center[1]) ** 2
        : 0;
      const inB =
        hasBbox &&
        c.lng >= minLng &&
        c.lng <= maxLng &&
        c.lat >= minLat &&
        c.lat <= maxLat;
      return { c, d, inB };
    });
    scored.sort((a, b) => Number(b.inB) - Number(a.inB) || a.d - b.d);
    const names = [];
    const seen = new Set();
    for (const x of scored) {
      if (seen.has(x.c.cityName)) continue;
      seen.add(x.c.cityName);
      names.push(x.c.cityName);
      if (names.length >= limit) break;
    }
    return names;
  }

  async function fetchBranchesNear({ center, bbox, limit = 6 }) {
    let cities = await citiesNearView(center, bbox, limit);
    if (!cities.length && center) {
      const one = await resolveCmbCityName({ cityName: "", center });
      cities = [one];
    }
    const lists = await Promise.all(
      cities.map((name) =>
        fetchBranches({ cityName: name, center, bbox: null }).catch(() => [])
      )
    );
    const byId = new Map();
    lists.flat().forEach((b) => byId.set(b.id, b));
    return { cities, list: [...byId.values()] };
  }

  function cacheKey(cmbCity) {
    return `cmb:${cmbCity}`;
  }

  function normalizeApiList(list, cmbCity) {
    return (list || [])
      .filter((b) => b && b.lat && b.lng)
      .map((b) => {
        const name = b.name || "";
        const [lng, lat] = bd09ToGcj02(b.lng, b.lat);
        return {
          id: `CMB-${b.branchNo}`,
          branchNo: String(b.branchNo || ""),
          name: name.startsWith("招商") ? name : `招商银行${name}`,
          shortName: name.replace(/^招商银行/, ""),
          city: cmbCity,
          cityAdcode: 0,
          address: b.address || b.branchAddr || "",
          phone: b.phone || b.tel || b.serviceTels || "",
          coord: [lng, lat],
          bdCoord: [Number(b.lng), Number(b.lat)],
          type: b.type || "B",
          source: "cmb-map-api",
        };
      });
  }

  async function fetchCityLive(cmbCity) {
    const url = `/cmb-api/map/getCmbData?cityName=${encodeURIComponent(cmbCity)}&type=B`;
    const res = await fetch(url, { credentials: "omit" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.returnCode !== "SUC0000") throw new Error(json.errorMsg || json.returnCode || "API error");
    return normalizeApiList(json.body, cmbCity);
  }

  function normalizeChengduFallback(branches) {
    return (branches || []).map((b) => {
      const [lng0, lat0] = b.coord || [b.lng, b.lat];
      // 缓存文件若仍是百度坐标则转换；已转换的用 source 标记
      const alreadyGcj02 =
        b.coordSystem === "gcj02" || String(b.source || "").startsWith("cmbchina-map-api");
      const needConvert = !alreadyGcj02;
      const coord = needConvert ? bd09ToGcj02(lng0, lat0) : [Number(lng0), Number(lat0)];
      return {
        ...b,
        coord,
        city: b.city || "成都",
        source: b.source || "cache-json",
      };
    });
  }

  async function fetchChengduFallback() {
    if (Array.isArray(window.CMB_CHENGDU_BRANCHES) && window.CMB_CHENGDU_BRANCHES.length) {
      return normalizeChengduFallback(window.CMB_CHENGDU_BRANCHES);
    }

    const url = new URL("chengdu_branches.json", branchDataBaseUrl);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("fallback missing");
    const json = await res.json();
    return normalizeChengduFallback(json.branches);
  }

  async function fetchBranches({ cityAdcode, cityName, center, bbox }) {
    const cmbCity = await resolveCmbCityName({ cityAdcode, cityName, center });
    const key = cacheKey(cmbCity);
    if (!cache.has(key)) {
      let list = [];
      try {
        list = await fetchCityLive(cmbCity);
        console.info(`[BranchAPI] ${cmbCity} 实时网点`, list.length, "(BD09→GCJ02)");
      } catch (err) {
        console.warn("[BranchAPI] 实时接口失败", cmbCity, err);
        if (cmbCity === "成都") {
          try {
            list = await fetchChengduFallback();
          } catch (e2) {
            list = [];
          }
        } else {
          list = [];
        }
      }
      cache.set(key, list);
    }

    let list = cache.get(key) || [];
    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox;
      list = list.filter(
        (b) =>
          b.coord[0] >= minLng &&
          b.coord[0] <= maxLng &&
          b.coord[1] >= minLat &&
          b.coord[1] <= maxLat
      );
    }
    return list;
  }

  async function prefetchMajorCities() {
    await loadCityCatalog();
    const jobs = MAJOR_CITIES.map((c) =>
      fetchBranches({ cityAdcode: c.adcode, cityName: c.name, center: c.center }).catch(() => [])
    );
    await Promise.all(jobs);
  }

  async function searchAll(query, limit = 12) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return [];
    if (!cache.size) await prefetchMajorCities();
    const hits = [];
    for (const list of cache.values()) {
      for (const b of list) {
        const hay = `${b.shortName} ${b.name} ${b.city} ${b.branchNo} ${b.address}`.toLowerCase();
        if (hay.includes(q)) hits.push(b);
        if (hits.length >= limit * 3) break;
      }
    }
    return hits.slice(0, limit);
  }

  async function fetchBranchDetail(branchNo) {
    if (!branchNo) return null;
    try {
      const url = `/cmb-api/map/getCmbBrnBusiInfo?branchNo=${encodeURIComponent(branchNo)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.returnCode !== "SUC0000") throw new Error(json.errorMsg || "API error");
      return json.body;
    } catch (e) {
      console.warn("[BranchAPI] 详情接口失败", e);
      return null;
    }
  }

  /** 补齐地址/电话等详情（来自同一地图站） */
  async function enrichBranch(branch) {
    if (!branch?.branchNo) return branch;
    const detail = await fetchBranchDetail(branch.branchNo);
    if (!detail) return branch;
    return {
      ...branch,
      address: detail.branchAddr || branch.address || "",
      phone: detail.serviceTels || branch.phone || "",
      serviceRanges: detail.serviceRanges || "",
      status: detail.status || "",
      detail,
    };
  }

  function mockStreets() {
    return [];
  }

  function approxBBox(center, zoom) {
    const span = Math.max(0.08, 18 / Math.pow(zoom, 1.35));
    return [center[0] - span, center[1] - span * 0.75, center[0] + span, center[1] + span * 0.75];
  }

  function isChengdu({ cityAdcode, cityName, center }) {
    if (Number(cityAdcode) === 510100) return true;
    if (String(cityName || "").includes("成都")) return true;
    if (center) {
      const dln = Math.abs(center[0] - 104.0665);
      const dlt = Math.abs(center[1] - 30.5723);
      if (dln < 0.35 && dlt < 0.35) return true;
    }
    return false;
  }

  return {
    fetchBranches,
    fetchBranchesNear,
    fetchBranchDetail,
    enrichBranch,
    prefetchMajorCities,
    searchAll,
    loadCityCatalog,
    resolveCmbCityName,
    bd09ToGcj02,
    mockStreets,
    approxBBox,
    isChengdu,
    MAJOR_CITIES,
    PROVINCIAL_CAPITALS,
    SHENZHEN_HUB,
    PROV_TO_CITY,
  };
})();
