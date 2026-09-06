# CATL 单产品 Demo 样板

更新日期：2026-04-06

## 1. Demo 产品选择

### 推荐产品

`宁德时代神行 PLUS CTP 动力电池包（示意版 demo）`

### Demo 产品卡

- `demo 产品代码`：`SXP-CTP-PACK-DEMO-01`
- `demo 工厂锚点`：`CN-JS-PLANT-DEMO-01`
- `demo 报告期`：`2025Q4`
- `重要说明`：以上代码都是系统样板里的占位符，不代表 CATL 对外公开的真实内部型号
- `公开依据`：CATL 公开材料已提到 `神行电池`、`神行 PLUS`、`CTP` 以及 `GBA 电池护照试点`

### 为什么选它

选它有 4 个原因：

1. 它属于 `EV battery（电动汽车动力电池）`
- 这是欧盟电池法规里最复杂、要求最多的一类
- 天然适合做电池护照、碳足迹声明、个体电池数据、SoH 等完整展示

2. 它本身是 `pack（电池包）` 级产品
- 比只做电芯 demo 更复杂
- 更接近真实出海产品和 OEM 对接场景

3. 本地材料里有公开支撑
- CATL 2024 ESG 材料中明确提到 `神行电池`、`神行 PLUS`
- 同一份材料还提到 2024 年 `GBA 电池护照试点` 中，`神行电池` 和 `CTP 电池项目` 参与试点

4. 它天然适合加上“CBAM 兼容层”
- 因为它的上游材料和零部件链里，往往会牵涉：
- `aluminium（铝）`
- `iron and steel（钢铁）`
- `electricity（电力）`
- 这些虽然不等于“电池本体直接走 CBAM”，但很适合做 `CBAM-compatible shadow module（CBAM 兼容影子模块）`

## 2. 这个 demo 怎么定位

这个 demo 不是：

- CATL 官方真实报送文件
- 官方真实电池护照
- 官方真实 CBAM 申报

它是：

`一个系统样板`

用来证明：

`同一套系统，既能满足欧盟电池法的产品级合规，又能把上游材料的 CBAM 风格碳数据一起兼容进来。`

## 3. 最推荐的展示方式

### 本轮最适合：表格

原因很简单：

- 你现在最需要先把逻辑讲清楚
- 表格最适合把“字段、证据、核验、权限、CBAM 兼容”放在一张图里
- 后面如果要做前端，前端本质上也是把这张表拆成几个页面来展示

所以：

`第一版用表格最好`

`后续完全可以做前端`

我也同步整理了一份 `CSV（逗号分隔表）` 版结构化表，后面如果你要做前端、数据库或继续扩字段，可以直接接着用。

## 4. Demo 的系统结构

这个 demo 建议你内部按 `4 层映射系统` 实现，但对外展示可以压成 `3+1 层`：

### 第 1 层：数据与翻译层

- CATL 内部数据
- HKU 映射引擎

作用：

把公司级 / 工厂级 / 供应链级数据，翻译成 `battery model + plant` 级结构。

### 第 2 层：产品合规层

- EU Battery Regulation
- Battery Passport

作用：

证明这个电池产品符合碳足迹、护照、再生材料、技术文档等要求。

### 第 3 层：可信交换层

- Catena-X / Tractus-X

作用：

把整理好的合规数据安全地、分层地传给欧洲客户、核验方和监管链条。

### 第 4 层：CBAM 兼容影子层

不是说电池本体直接按 CBAM 申报，而是：

把上游 `铝 / 钢 / 电力` 等可能受 CBAM 方法学影响的数据一起装进系统。

作用：

- 提前兼容未来贸易碳核算要求
- 支撑 OEM / 欧洲客户对上游材料碳数据的追问
- 支撑成本测算和供应商管理

### 对外最稳的讲法：一套系统，两类输出

`输出 1：EU Battery Regulation（欧盟电池法规）核心合规包`

- carbon footprint declaration（碳足迹声明）
- battery passport（电池护照）
- recycled content declaration（再生材料含量声明）
- technical documentation（技术文档）

`输出 2：CBAM-compatible upstream material pack（兼容 CBAM 的上游材料数据包）`

- aluminium（铝）上游排放
- steel（钢）上游排放
- precursor installation（上游工厂）识别
- upstream electricity source（上游用电来源）与因子

这样讲的好处是：

- 不会误说“电池本体已经直接纳入 CBAM”
- 但能体现你的系统比单纯做电池法更超前
- 也更容易说服 CATL，这套系统今天能用于合规，明天还能用于客户追问和贸易碳管理

## 5. 单产品 Demo 主表

说明：

- 下表中的“示例值”是系统 demo 用的占位写法，不代表 CATL 官方真实报送值
- 真正落地时，数值由 CATL 内部系统填充

| 模块 | 字段 | Demo 示例值 | 数据来源 | 主要证据 | 核验方式 | 访问层级 | 对欧盟电池法作用 | 对 CBAM 兼容作用 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 基本信息 | manufacturer（制造商） | CATL | 公司主数据 | 营业执照、年报 | 内部确认 | 公开 | 制造商识别 | 无直接作用 |
| 基本信息 | demo product name（演示产品名） | 神行 PLUS CTP 动力电池包 | 产品主数据 | 产品目录 | 内部确认 | 公开 | 产品识别 | 无直接作用 |
| 基本信息 | battery model identifier（电池型号） | CATL-SHXP-CTP-EV-001 | 产品主数据 | 型号注册表 | 内部确认 | 受限 | 电池法核心锚点 | 可作为上游材料归集锚点 |
| 基本信息 | battery category（产品类别） | EV battery | 产品主数据 | 技术规格书 | 内部确认 | 公开 | 决定适用规则 | 无直接作用 |
| 基本信息 | chemistry（化学体系） | LFP（磷酸铁锂） | 产品主数据 | BOM、规格书 | 内部确认 | 公开/部分受限 | 护照公开层字段 | 决定上游材料追踪范围 |
| 基本信息 | pack architecture（电池包架构） | CTP | 技术文档 | 设计文件 | 技术审阅 | 合法利益相关方 | 体现 pack 级复杂度 | 影响材料归集边界 |
| 产品参数 | rated capacity（额定容量） | 待 CATL 填充 | 产品主数据 | 规格书、测试报告 | 测试核对 | 公开 | 护照公开层字段 | 无直接作用 |
| 产品参数 | nominal voltage（标称电压） | 待 CATL 填充 | 产品主数据 | 规格书、测试报告 | 测试核对 | 公开 | 护照公开层字段 | 无直接作用 |
| 产品参数 | expected lifetime in cycles（循环寿命） | 待 CATL 填充 | 产品主数据 | 测试报告 | 测试核对 | 公开 | 护照公开层字段 | 无直接作用 |
| 工厂信息 | manufacturing plant（制造工厂） | 江苏时代-示意 | 工厂主数据 | 工厂主数据、生产登记 | 内部确认 | 受限/部分公开 | Article 7 核心字段 | 对齐 installation 思维 |
| 工厂信息 | reporting period（报告期） | 2025Q4 demo period | 工厂+产品映射 | 生产台账、报告期规则 | 方法复核 | 受限 | 形成单产品声明周期 | 对齐 CBAM reporting period 逻辑 |
| 碳足迹 | total carbon footprint（总碳足迹） | 待 CATL 填充，单位 kg CO2e/kWh | LCA/PCF 计算层 | BOM、能耗、运输、回收数据 | 第三方/合规核验 | 公开 | Article 7 核心输出 | 可与上游材料碳足迹联动 |
| 碳足迹 | lifecycle stage split（分阶段碳足迹） | 原材料 / 生产 / 分销 / 终端回收 | LCA/PCF 计算层 | 生命周期计算底稿 | 第三方/合规核验 | 公开 | Article 7 核心输出 | 便于承接 precursor 碳数据 |
| 能源 | plant electricity mix（工厂电力结构） | 电网电 + 绿电 + PPA，占位 | 能源系统 | 电表、发票、绿证、PPA | 第三方复核 | 受限 | 生产阶段碳足迹依据 | 兼容电力间接排放逻辑 |
| 能源 | direct manufacturing energy input（制造阶段能源投入） | 待 CATL 填充 | 工厂能耗系统 | 电表、蒸汽、燃气记录 | 第三方复核 | 机密 | 碳足迹计算依据 | 对齐 installation-level 数据纪律 |
| 再生材料 | recycled content（再生材料含量） | 待 CATL 填充 | 材料管理系统 | 质量平衡、回收证明 | 第三方/合规核验 | 公开 | Article 8 / 护照核心字段 | 可延伸到上游材料来源追踪 |
| 可再生信息 | renewable content share（可再生含量占比） | 待 CATL 填充 | 材料与能源系统 | 材料/能源声明 | 方法复核 | 公开 | 护照公开层字段 | 与低碳采购叙事相关 |
| 尽调 | due diligence policy link（尽调政策链接） | CATL battery due diligence policy | 合规系统 | 政策文件、审计记录 | 合规复核 | 公开 | Article 52 / Annex XIII | 可承接上游材料核查 |
| 尽调 | critical raw materials traceability（关键原材料追溯） | lithium / graphite / aluminium / copper / steel | 供应链系统 | 供应商声明、追溯记录 | 第三方抽查 | 受限 | 负责任采购支撑 | 这是兼容 CBAM 的关键入口 |
| 技术文档 | test reports（测试报告） | 存在，占位 | 质量系统 | 测试报告原件 | 正式合规评估 | 仅公告机构/监管 | Annex VIII / Annex XIII 核心 | 无直接 CBAM 作用 |
| 技术文档 | technical documentation（技术文档） | 存在，占位 | 技术文档系统 | 图纸、说明书、计算书 | 正式合规评估 | 仅公告机构/监管 | Annex VIII 核心 | 无直接 CBAM 作用 |
| 护照 | QR / battery passport object（护照对象） | 可生成 | 护照系统 | 结构化数据包 | 系统一致性校验 | 分层 | Article 13 / Annex XIII | 可附带影子字段 |
| 个体电池 | individual battery identifier（个体电池编号） | 可序列化，占位 | 序列化系统 | 序列号、谱系记录 | 系统校验 | 合法利益相关方 | 个体层字段 | 无直接作用 |
| 个体电池 | state of health / cycles（健康状态/循环次数） | 后市场阶段填充 | BMS / 售后系统 | BMS 记录 | 系统核对 | 合法利益相关方 | Annex XIII 个体层 | 无直接作用 |
| CBAM 影子模块 | aluminium precursor embedded emissions（铝前驱材料嵌入排放） | 待供应商填充 | 供应商 PCF | 供应商排放声明、验证报告 | 供应商核验/抽查 | 受限 | 不直接属于电池法必填 | 未来兼容 CBAM 最重要字段之一 |
| CBAM 影子模块 | steel precursor embedded emissions（钢材嵌入排放） | 待供应商填充 | 供应商 PCF | 供应商排放声明、验证报告 | 供应商核验/抽查 | 受限 | 不直接属于电池法必填 | 未来兼容 CBAM 最重要字段之一 |
| CBAM 影子模块 | precursor installation ID（上游安装点/工厂识别） | 待供应商填充 | 供应商系统 | 工厂识别、报告期记录 | 供应商核验 | 受限 | 可作为尽调补充 | 对齐 CBAM installation 逻辑 |
| CBAM 影子模块 | precursor electricity source / factor（上游电力来源与因子） | 待供应商填充 | 供应商系统 | 电力合同、电力因子 | 供应商核验 | 受限 | 可作为原材料阶段补充 | 兼容 CBAM 间接排放方法 |
| 权限 | access rule（访问规则） | public / legitimate interest / authority / internal | 权限系统 | 访问矩阵、日志 | 系统审计 | 内部配置 | 满足分层透明 | 避免上游敏感数据过曝 |

## 6. 这个 demo 最有创新性的地方

### 创新点 1：不是只做电池法字段，而是做“电池法主表 + CBAM 影子表”

这样讲最稳：

- 主表满足欧盟电池法
- 影子表不声称“电池本体已经纳入 CBAM”
- 但提前把 `铝 / 钢 / 电力` 的上游碳数据结构接进来

这会让你的方案看起来更像：

`一个未来可扩展的国际碳数据系统`

而不是：

`只做当前最低合规`

### 创新点 2：同一条数据，服务两套逻辑

比如：

- `manufacturing plant`
- `reporting period`
- `electricity factor`
- `input material embedded emissions`

这些字段既能服务电池法，也能服务 CBAM 风格的上游碳核查。

### 创新点 3：把“分层访问”做成系统能力

不是简单说：

`透明`

而是做成：

- 公众看到什么
- 合法利益相关方看到什么
- 公告机构看到什么
- 内部看到什么

这非常适合后面做前端。

## 7. 后续能不能做成前端

### 可以，而且很适合

这套 demo 后续很适合做成一个前端系统。

### 最适合的前端页面

#### 页面 1：产品总览页

展示：

- 产品名
- 型号
- 工厂
- 化学体系
- 容量
- 碳足迹总值
- 合规状态

#### 页面 2：碳足迹拆分页

展示：

- 原材料阶段
- 生产阶段
- 分销阶段
- 终端回收阶段

用堆叠条形图或瀑布图最好。

#### 页面 3：证据室

展示：

- 每个字段背后对应哪些证据
- 哪些证据齐了
- 哪些还缺
- 哪些已被核验

#### 页面 4：护照分层页

展示：

- public 视图
- legitimate interest 视图
- authority 视图

让评委一眼看懂“不是全公开，而是分层透明”。

#### 页面 5：CBAM 兼容页

展示：

- 上游铝
- 上游钢
- 上游电力
- 供应商工厂
- 嵌入排放
- 风险状态

这个页面非常适合体现你的“超前性”。

## 8. 给你一个最短讲法

`我们以 CATL 神行 PLUS CTP 动力电池包为 demo，不只展示欧盟电池法要求的碳足迹声明、电池护照和技术文档，还额外接入上游铝、钢和电力的影子碳数据模块。这样，这个系统今天可以服务电池法，明天也能兼容 CBAM 风格的上游碳核查。`

## 9. 本 demo 主要依据的本地文件

- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\extracted\CATL_2024_ESG_Report_full.txt`
- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\extracted\CATL_2024_Annual_Report.txt`
- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\extracted\CATL_2025_Annual_Report_or_Listing_Doc.txt`
- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\extracted\EU_Battery_Regulation_2023_1542_consolidated_2025-07-31.txt`
- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\extracted\EU_CBAM_Regulation_2023_956_full.txt`
- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\extracted\tfs_pcf_data_model_3_1_2025.txt`
- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\extracted\tfs_pcf_verification_framework_v2_2025.txt`
