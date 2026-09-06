/**
 * 街道级底图（Leaflet + 高德瓦片）
 * - 全国：省会红点 + 深圳飞线
 * - 放大：真实招行网点（多城合并，含内蒙等）
 * - 辖区企业圆：同款高德街道底图
 */
window.CmbStreetMap = (() => {
  let map = null;
  let branchLayer = null;
  let capitalLayer = null;
  let flyLayer = null;
  let tileStreet = null;
  let tileSat = null;
  let tileRoad = null;
  let lastToastKey = "";
  let loadTimer = null;
  let highlightId = null;

  const BRANCH_ZOOM = 10;
  const NATION_FLY_ZOOM = 7; // 小于此级别显示省会+飞线

  function toast(msg) {
    const el = document.querySelector("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function pinIcon(active) {
    const color = active ? "#9a0000" : "#c00000";
    const size = active ? 36 : 28;
    return L.divIcon({
      className: "cmb-map-pin",
      html: `<span style="
        display:block;width:${size}px;height:${size}px;
        background:${color};border:2px solid #fff;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(192,0,0,.45);
      "></span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size + 4],
    });
  }

  function createStreetTiles() {
    const street = L.tileLayer(
      "https://wprd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=1&style=7&x={x}&y={y}&z={z}",
      {
        subdomains: "1234",
        maxZoom: 18,
        minZoom: 3,
        attribution: '&copy; <a href="https://lbs.amap.com/">高德地图</a>',
      }
    );
    const sat = L.tileLayer(
      "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      { subdomains: "1234", maxZoom: 18, minZoom: 3, attribution: "&copy; 高德地图" }
    );
    const road = L.tileLayer(
      "https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",
      { subdomains: "1234", maxZoom: 18, minZoom: 3, opacity: 0.95 }
    );
    return { street, sat, road };
  }

  function buildTiles() {
    const t = createStreetTiles();
    tileStreet = t.street;
    tileSat = t.sat;
    tileRoad = t.road;
  }

  /** 二次贝塞尔弧线（深圳 → 省会） */
  function curveLatLngs(fromLL, toLL, segments = 40) {
    const [lat1, lng1] = fromLL;
    const [lat2, lng2] = toLL;
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;
    const dx = lng2 - lng1;
    const dy = lat2 - lat1;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const offset = dist * 0.2;
    const cx = midLng - (dy / dist) * offset;
    const cy = midLat + (dx / dist) * offset;
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const u = 1 - t;
      pts.push([u * u * lat1 + 2 * u * t * cy + t * t * lat2, u * u * lng1 + 2 * u * t * cx + t * t * lng2]);
    }
    return pts;
  }

  function renderCapitalsAndFly() {
    if (!capitalLayer || !flyLayer || !window.BranchAPI) return;
    capitalLayer.clearLayers();
    flyLayer.clearLayers();

    const capitals = window.BranchAPI.PROVINCIAL_CAPITALS || [];
    const sz = window.BranchAPI.SHENZHEN_HUB || { name: "深圳", center: [114.0579, 22.5431] };
    const szLL = [sz.center[1], sz.center[0]];

    capitals.forEach((c) => {
      const ll = [c.center[1], c.center[0]];
      L.circleMarker(ll, {
        radius: 6,
        color: "#fff",
        weight: 2,
        fillColor: "#c00000",
        fillOpacity: 0.95,
      })
        .bindTooltip(c.name, { direction: "right", offset: [8, 0] })
        .on("click", () => map.setView(ll, 12))
        .addTo(capitalLayer);

      L.polyline(curveLatLngs(szLL, ll), {
        color: "#e85a5a",
        weight: 1.2,
        opacity: 0.35,
        className: "cmb-fly-line",
      }).addTo(flyLayer);
    });

    // 深圳枢纽（更大）
    L.circleMarker(szLL, {
      radius: 10,
      color: "#fff",
      weight: 3,
      fillColor: "#9a0000",
      fillOpacity: 1,
    })
      .bindTooltip("深圳 · 枢纽", { direction: "right", offset: [10, 0] })
      .on("click", () => map.setView(szLL, 12))
      .addTo(capitalLayer);
  }

  function showNationOverlay(show) {
    if (!map || !capitalLayer || !flyLayer) return;
    if (show) {
      if (!map.hasLayer(capitalLayer)) capitalLayer.addTo(map);
      if (!map.hasLayer(flyLayer)) flyLayer.addTo(map);
    } else {
      if (map.hasLayer(capitalLayer)) map.removeLayer(capitalLayer);
      if (map.hasLayer(flyLayer)) map.removeLayer(flyLayer);
    }
  }

  function enterBranchPayload(b) {
    return {
      id: b.id,
      branchNo: b.branchNo,
      name: b.shortName,
      fullName: b.name,
      city: b.city,
      address: b.address,
      phone: b.phone,
      coord: b.coord,
      value: b.coord,
    };
  }

  async function refreshBranches() {
    if (!map || !window.BranchAPI) return;
    const z = map.getZoom();

    if (z < BRANCH_ZOOM) {
      branchLayer.clearLayers();
      showNationOverlay(true);
      // 省级视野可弱化飞线透明度（仍显示省会）
      if (flyLayer && map.hasLayer(flyLayer)) {
        flyLayer.eachLayer((ly) => {
          if (ly.setStyle) ly.setStyle({ opacity: z < NATION_FLY_ZOOM ? 0.35 : 0.12 });
        });
      }
      lastToastKey = "";
      return;
    }

    showNationOverlay(false);

    const c = map.getCenter();
    const center = [c.lng, c.lat];
    const b = map.getBounds();
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];

    const { cities, list } = await window.BranchAPI.fetchBranchesNear({
      center,
      bbox,
      limit: z >= 12 ? 4 : 8,
    });

    branchLayer.clearLayers();
    list.forEach((br) => {
      const [lng, lat] = br.coord;
      const m = L.marker([lat, lng], {
        icon: pinIcon(highlightId && highlightId === br.id),
        title: br.shortName || br.name,
      });
      m.bindTooltip(
        `<strong style="color:#c00000;">${br.shortName || br.name}</strong><br/><span style="font-size:11px;color:#666;">${br.city || ""} · 点击进入辖区</span>`,
        { direction: "top", offset: [0, -8], opacity: 0.95 }
      );
      m.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        if (typeof window.__onBranchEnter === "function") {
          window.__onBranchEnter(enterBranchPayload(br));
        }
      });
      m.addTo(branchLayer);
    });

    const key = `${cities.join(",")}:${list.length}`;
    if (key !== lastToastKey) {
      lastToastKey = key;
      if (list.length) toast(`${cities.slice(0, 3).join("、")}等 · 网点 ${list.length} 家`);
      else toast(`${cities[0] || "当前视野"} · 暂未取到网点`);
    }
  }

  function scheduleRefresh() {
    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => refreshBranches().catch(() => {}), 280);
  }

  function resetView() {
    if (!map) return;
    highlightId = null;
    lastToastKey = "";
    map.setView([35.8, 104.5], 4);
    scheduleRefresh();
    toast("已重置全国视野");
  }

  function focusBranch(branch) {
    if (!map || !branch?.coord) return;
    highlightId = branch.id;
    map.setView([branch.coord[1], branch.coord[0]], 15);
    scheduleRefresh();
    toast(`已定位：${branch.shortName || branch.name}`);
  }

  function setLod(mode) {
    if (!map) return;
    if (mode === "nation") {
      resetView();
      return;
    }
    if (mode === "province") {
      map.setView([30.57, 104.07], 8);
      toast("已定位省级视野，继续放大可看街道与网点");
    } else {
      map.setView([30.5723, 104.0665], 13);
      toast("已定位成都，加载街道底图与网点…");
    }
    scheduleRefresh();
  }

  function boot(containerId = "chinaMap") {
    const el = document.getElementById(containerId);
    if (!el) return Promise.reject(new Error("map container missing"));
    if (typeof L === "undefined") return Promise.reject(new Error("Leaflet not loaded"));

    el.innerHTML = "";
    el.style.background = "#e8e4df";

    buildTiles();
    map = L.map(el, {
      center: [35.8, 104.5],
      zoom: 4,
      zoomControl: true,
      attributionControl: true,
    });

    tileStreet.addTo(map);
    branchLayer = L.layerGroup().addTo(map);
    flyLayer = L.layerGroup().addTo(map);
    capitalLayer = L.layerGroup().addTo(map);

    const satGroup = L.layerGroup([tileSat, tileRoad]);
    L.control
      .layers(
        { 街道地图: tileStreet, 卫星影像: satGroup },
        null,
        { position: "topright", collapsed: true }
      )
      .addTo(map);

    renderCapitalsAndFly();

    map.on("moveend", scheduleRefresh);
    map.on("zoomend", () => {
      const z = map.getZoom();
      const seg = document.getElementById("lodSeg");
      if (seg) {
        const mode = z < 7 ? "nation" : z < 11 ? "province" : "city";
        seg.querySelectorAll("button").forEach((btn) => {
          btn.classList.toggle("active", btn.dataset.lod === mode);
        });
      }
      scheduleRefresh();
    });

    setTimeout(() => map.invalidateSize(), 80);
    setTimeout(() => map.invalidateSize(), 320);
    window.addEventListener("resize", () => map && map.invalidateSize());

    window.MapNav = {
      focusBranch,
      clearHighlight() {
        highlightId = null;
        scheduleRefresh();
      },
      resetView,
      setLod,
      getMap: () => map,
    };
    window.__resetChinaMap = resetView;

    scheduleRefresh();
    toast("街道底图就绪 · 全国省会飞线 · 放大查看网点");
    return Promise.resolve(map);
  }

  /**
   * 辖区企业圆：高德街道底图 + 管辖圈 + 企业圆点
   * opts: { center:[lng,lat], branchName, enterprises, color, radiusKm, onEnterpriseClick }
   */
  function renderEnterpriseMap(containerId, opts) {
    const el = document.getElementById(containerId);
    if (!el || typeof L === "undefined") return null;

    if (el._cmbEntMap) {
      el._cmbEntMap.remove();
      el._cmbEntMap = null;
    }
    el.innerHTML = "";
    el.style.background = "#e8e4df";

    const center = opts.center;
    const latlng = [center[1], center[0]];
    const radiusM = (opts.radiusKm || 4.8) * 1000;
    const color = opts.color || "#c00000";
    const tiles = createStreetTiles();

    const m = L.map(el, {
      center: latlng,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });
    tiles.street.addTo(m);

    const satGroup = L.layerGroup([tiles.sat, tiles.road]);
    L.control
      .layers({ 街道地图: tiles.street, 卫星影像: satGroup }, null, {
        position: "topright",
        collapsed: true,
      })
      .addTo(m);

    const ring = L.circle(latlng, {
      radius: radiusM,
      color,
      weight: 2.5,
      dashArray: "8 6",
      fillColor: color,
      fillOpacity: 0.08,
      opacity: 0.75,
    }).addTo(m);

    L.marker(latlng, { icon: pinIcon(true), zIndexOffset: 600 })
      .bindTooltip(opts.branchName || "支行", { permanent: true, direction: "bottom", offset: [0, 6] })
      .addTo(m);

    (opts.enterprises || []).forEach((e) => {
      const [lng, lat] = e.coord;
      const size = Math.max(10, Number(e.symbolSize) || 18);
      const marker = L.circleMarker([lat, lng], {
        radius: size / 2,
        color: "#fff",
        weight: 2,
        fillColor: e.itemColor || color,
        fillOpacity: 0.88,
      });
      marker.bindTooltip(
        `<strong>${e.name}</strong><br/><span style="font-size:11px;color:#666;">${e.tier || ""} · ${e.scale || e.size || ""} · 点击画像</span>`,
        { direction: "top", offset: [0, -4] }
      );
      marker.on("click", () => opts.onEnterpriseClick && opts.onEnterpriseClick(e));
      marker.addTo(m);
    });

    try {
      m.fitBounds(ring.getBounds(), { padding: [36, 36], maxZoom: 15 });
    } catch (_) {
      m.setView(latlng, 13);
    }

    setTimeout(() => m.invalidateSize(), 60);
    setTimeout(() => m.invalidateSize(), 280);
    el._cmbEntMap = m;
    return m;
  }

  function invalidateEnterpriseMap(containerId) {
    const el = document.getElementById(containerId);
    el?._cmbEntMap?.invalidateSize?.();
  }

  return {
    boot,
    resetView,
    focusBranch,
    setLod,
    refreshBranches,
    renderEnterpriseMap,
    invalidateEnterpriseMap,
  };
})();
