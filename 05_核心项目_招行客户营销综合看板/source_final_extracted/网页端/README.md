# 属地客户营销综合看板 Demo

入口页双盘进入两套统一招行品牌红（`#C00000`）三栏地图工作台：

1. **入口** `index.html` — 招财猫双盘：左「增量拓客」· 右「存量经营」
2. **增量拓客** `growth/index.html` — 左业绩 / 中地图 / 右 KPI 缺口（无侧栏）  
   - 网点：`map.cmbchina.com` 公开接口（经 `serve.py` 的 `/cmb-api` 代理），禁止虚构坐标  
   - 点击网点进入辖区：核心层圆更大、规模越大颜色越深（招行红系）
3. **存量经营** `stock/index.html` — 同为三栏地图布局；样例客户数据参考 `cmb-task3-dashboard`

旧三页链路（`map-nav.html` → `branch-area.html` → `company.html`）仍保留，供对照。

## 启动

```bash
cd task3_demo
python3 serve.py
```

打开：http://127.0.0.1:8765/

> 请用 `serve.py` 启动（含招行网点 API 代理）。纯 `http.server` 时成都网点会回退本地 JSON。

## 操作提示

- 入口：左盘进增量，右盘进存量  
- 增量：滚轮放大地图 → 点击网点进入支行作战 → 点企业看画像  
- 存量：地图点网点或列表进支行 → 产业 Tab / 政策匹配 / 客户 360 / 营销看板  
