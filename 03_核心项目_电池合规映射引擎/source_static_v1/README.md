# CATL 四层映射 Demo 前端

这是一个私有演示仓库，服务的不是“正式报送”，而是“比赛展示 + 同学审查 + 后续继续开发”。

它的核心目的很简单：

- 把我们已经搭好的 `CATL -> 欧盟电池法规 -> CBAM-compatible` 四层映射 demo 做成一个能直接打开的前端样板
- 把工作簿、审查 CSV、参考底稿和开发文档放在同一个地方
- 让后续同学和 AI agent 不用重新捋一遍背景，就能直接接手实现

## 一句话理解这个仓库

`我们不是凭空发明一套国际碳标准，而是在把 CATL 已有的数据和披露基础，继续拆成欧盟电池法规看得懂、能核验、能分层访问的结构，同时顺手兼容上游材料的 CBAM 风格字段。`

## 你最应该先看什么

如果你是第一次进入这个仓库，建议按这个顺序看：

1. `docs/00_给同学看的介绍.md`
2. `docs/03_AI协作边界.md`
3. `frontend/index.html`
4. `frontend/data/demo-data.js`
5. `data/review_csv/`
6. `assets/workbooks/`

## 当前仓库结构

```text
frontend/
  index.html
  styles.css
  app.js
  data/
    demo-data.js

docs/
  00_给同学看的介绍.md
  01_开发说明.md
  02_后续开发建议.md
  03_AI协作边界.md
  99_工作日志.md

data/
  review_csv/
    01_手动输入_review.csv
    02_欧盟电池法输出_review.csv
    03_CBAM输出_review.csv
    04_字段映射过程_review.csv
    05_证据映射过程_review.csv
    06_核验映射过程_review.csv
    07_权限映射过程_review.csv
    08_生命周期计算过程_review.csv
    11_CATL公开披露架构_review.csv

assets/
  workbooks/
    catl_four_layer_mapping_engine_demo.xlsx
    catl_four_layer_mapping_engine_demo_with_public_arch.xlsx
  reference_notes/
    *.md
    *.csv
  source_reports/
    catl/
      CATL_2025_Annual_Report_or_Listing_Doc.pdf
      CATL_2025_ESG_Report.pdf
      catl_2023_carbon_accounting_report.pdf
      CATL_2022_Carbon_Accounting_Report_published_2023.pdf
```

## 每一层文件是干嘛的

- `frontend/`
  这是给同学、老师和后续开发者看的前端原型。现在是零依赖静态版，目的就是打开快、理解快、改起来也快。

- `docs/`
  这是交接说明。你如果不先看这里，很容易把 `Tractus-X`、`CAB`、`欧盟电池法规`、`CBAM-compatible` 讲混。

- `data/review_csv/`
  这是最适合团队一起审查的结构化底稿。你可以把它理解成“前端展示层背后的审查版数据”。

- `assets/workbooks/`
  这是主工作簿。里面包含手动输入、EU 输出、CBAM 输出和中间计算过程，是当前 demo 的核心母表。

- `assets/reference_notes/`
  这是已经整理好的中文底稿和映射说明，方便继续建模、写 PPT 或指导前端字段解释。

- `assets/source_reports/`
  这是本轮 demo 主要参考的 CATL 官方公开资料，方便回溯字段来源。

## 怎么打开前端

最简单的方法：

1. 进入 `frontend/`
2. 直接打开 `index.html`

更稳的方法：

```powershell
cd frontend
python -m http.server 8080
```

然后打开：

`http://localhost:8080`

## 为什么先做成静态前端

因为这一阶段最重要的不是“技术栈高级”，而是：

- 先把逻辑讲清楚
- 先让同学和老师看懂
- 先给后续 AI 一个稳定、清楚、低门槛的接手点

所以现在故意不用 React、数据库或后端 API。

这不是做不出来，而是当前最划算的路径是：

`先把逻辑和数据结构站稳，再升级技术栈。`

## 当前 demo 产品

- 产品名：`神行 PLUS CTP 动力电池包（Demo）`
- 型号代码：`SXP-CTP-PACK-DEMO-01`
- 工厂代码：`CN-JS-PLANT-DEMO-01`
- 报告期：`2025Q4`
- 碳足迹强度：`48.97 kgCO2e/kWh`

## 最重要的边界

这个仓库里的内容是：

- 比赛 demo 用的系统样板
- 可解释、可审查、可继续开发的逻辑结构
- 给同学和后续 AI 的交接版本

它不是：

- CATL 官方正式报送系统
- CATL 官方真实欧盟合规申报结果
- 法律意见或最终认证结论

## 后续最推荐的开发方向

1. 把 `frontend/data/demo-data.js` 和 `data/review_csv/` 做字段对齐
2. 把“手动输入”与“EU / CBAM 输出”做成联动
3. 加入角色视图，让不同角色看到不同层级的数据
4. 等数据流稳定后，再迁移到 React / Vue 或后端 API
