# HKU-CATL 中欧电池碳标准映射备忘录
更新日期：2026-04-05

## 1. 本次已落地到工作区的资料范围

资料目录：`D:\VibeCoding\codex\reports\hku_catl_standards_mapping`

核心官方来源分为 4 组：

1. 中国大陆披露与鉴证口径
- 深交所《上市公司自律监管指引第17号——可持续发展报告（试行）》
- 上交所《上市公司自律监管指引第14号——可持续发展报告（试行）》
- 北交所《上市公司持续监管指引第11号——可持续发展报告（试行）》
- 三大交易所配套编制指南
- 财政部企业可持续披露准则相关文件
- 中注协可持续信息鉴证业务准则试行文件

2. 香港披露与 assurance 口径
- HKEX `Appendix C2 Environmental, Social and Governance Reporting Code`
- HKEX `Consultation Conclusions on Enhancement of Climate-related Disclosures`
- HKEX `Implementation Guidance for Climate Disclosures`
- 香港政府 `Roadmap on Sustainability Disclosure in Hong Kong`
- `HKFRS S1` / `HKFRS S2`
- `HKSSA 5000`

3. CATL 官方披露与官方新闻口径
- CATL `2024 ESG Report`
- CATL `2024 Annual Report`
- CATL `2022 Carbon Accounting Report`
- CATL `2025 Hong Kong Listing Prospectus`
- CATL-BMW `Battery Passport and Decarbonization MOU`
- CATL-HKU `Zero-Carbon Future Innovation Center` 公告

4. 欧盟法规与生态体系口径
- `Regulation (EU) 2023/1542` 电池法规
- `Regulation (EU) 2023/956` CBAM 法规
- 欧委会 CBAM 官方 guidance 页面
- `Catena-X Conformity Assessment Framework Handbook`
- Catena-X 官方 certification 页面

可检索文本目录：`D:\VibeCoding\codex\reports\hku_catl_standards_mapping\extracted`

---

## 2. 先给结论

### 2.1 这些“标准”不是同一层级
- 中国大陆交易所、HKEX、CATL ESG 披露的核心对象主要是 `issuer/entity`
- 欧盟电池法规的核心对象是 `specific battery model + manufacturing plant`
- 所以不能把公司级 ESG 披露字段直接等同于欧盟产品级合规字段

### 2.2 CATL 不是从零开始
- CATL 已经公开使用了一个混合标准栈：`深交所规则 + GRI + ISO 14064 + GHG Protocol + GB/T 32150 + ISO 14067 + PAS 2060 + EU Battery Regulation 导向 + Catena-X pilot`
- HKU 的价值不是“发明新语言”，而是把 CATL 已有语言翻译成 `EU-facing product evidence architecture`

### 2.3 HKU 真正应该做的是四层映射
- `field mapping`：字段映射
- `evidence mapping`：证据映射
- `assurance mapping`：核验/鉴证映射
- `confidentiality-access mapping`：保密与访问权限映射

### 2.4 Catena-X 和 CBAM 都有用，但都不是终局
- `Catena-X/CAB` 解决的是互操作、可信交换、proof of conformity，不等于欧盟电池法规下的最终法律合规
- `CBAM` 目前不直接覆盖电池整包，但它的 installation-level verification 逻辑很值得借来做 verifier workflow 模板

---

## 3. 对比框架

### 3.1 监管对象与披露粒度

| 维度 | 大陆交易所 | HKEX / HKFRS | CATL 当前公开口径 | 欧盟电池法规 | HKU 启示 |
| --- | --- | --- | --- | --- | --- |
| 核心对象 | 上市公司 | 上市公司/PAE | 公司 + 部分工厂/供应链/产品实践 | 电池型号 + 制造工厂 + 个体电池部分数据 | 必须把 `entity` 语言拆成 `plant/model/battery` 语言 |
| 披露目的 | 资本市场披露 | 资本市场披露 | 融资、评级、客户沟通、可持续叙事 | 市场准入、产品合规、数字护照 | HKU 不能只做 investor-facing mapping |
| 粒度 | 年度、公司级为主 | 年度、公司级为主 | 公司级 + 工厂级/供应链级案例 | 产品级、工厂级、护照字段级 | 需要多层数据模型 |

关键判断：
- 交易所规则解决“公司怎么披露”
- 欧盟电池法规解决“产品怎么准入”
- CATL 同时处在两套体系里，但两套体系并没有天然对齐

### 3.2 重大性与边界逻辑

中国大陆三大交易所共有特征：
- 明确采用 `财务重要性 + 影响重要性` 的双重重要性框架
- 要求披露主体识别价值链范围、气候风险和机遇
- 强调 Scope 1、Scope 2，鼓励 Scope 3
- 允许因国家秘密、商业秘密等采取替代披露，但需说明原因

香港共有特征：
- HKEX 已把气候要求嵌入 `Appendix C2`
- 香港路线图和 `HKFRS S2` 明确向 ISSB 完全对齐
- 更强调 `value chain`、`scenario analysis`、`transition plan`、`anticipated financial effects`

欧盟电池法规共有特征：
- 不是双重重要性披露规则，而是产品合规规则
- 关注的是特定电池型号在特定工厂制造时的 carbon footprint、battery passport、test reports、technical documentation
- 关注的是 `verifiable product facts`，不是 `issuer narrative`

### 3.3 温室气体核算口径

大陆交易所规则：
- 要求说明核算标准、方法、假设、工具
- 要求说明合并方法，如股权比例法、财务控制法、运营控制法
- 对 Scope 3 以鼓励为主

HKEX / HKFRS S2：
- 以 `GHG Protocol` 为核心参照
- Scope 3 进入正式框架
- 要求按 category、value chain、scenario、target 来描述

CATL 已公开的口径：
- `2022 Carbon Accounting Report` 明确采用 `operational control approach`
- 使用 `ISO 14064-1:2018`、`GHG Protocol`、`GB/T 32150-2015`
- 做了 Scope 1、Scope 2 及部分重大 Scope 3
- 按 `ISO 14064-3:2019` 做第三方 verification

欧盟电池法规需要的口径：
- 不是公司级 Scope 1/2/3 总量
- 而是 `battery model + plant` 对应的生命周期 carbon footprint
- 需要把 BOM、材料前驱体、能源、辅助材料、运输、制造工序等绑定到产品模型

关键判断：
- `Scope language` 不能直接等于 `lifecycle stage language`
- HKU 需要做一张 `Scope -> lifecycle stage -> target field` 转换表

### 3.4 Assurance / Audit / Verification 的差异

大陆交易所：
- 第三方鉴证或审验通常是鼓励项
- 重点是提高披露可信度

香港：
- HKEX 允许 independent assurance
- 香港路线图与 `HKSSA 5000` 说明本地 sustainability assurance 体系在成型
- assurance 逻辑仍主要服务于披露质量和资本市场信任

CATL 已公开实践：
- Carbon accounting report 已采用第三方 verification
- ESG 报告说明量化数据可追溯、可支持外部验证
- 说明 CATL 并不排斥 assurance，本身已经在运行相关能力

欧盟电池法规：
- conformity assessment 不是可选加分项，而是市场准入链条的一部分
- Article 17 和 Annex VIII 涉及 conformity assessment procedure
- Annex XIII 规定 battery passport 的不同访问层级
- 技术文档和测试报告要能支撑声明

CBAM：
- 当前不是直接管电池，但 verification discipline 很强
- 官方 guidance 和 2025 年底后的 implementing/delegated acts 已把 verification principles、methods、accreditation 放得很细

Catena-X：
- CAB 做的是独立 conformity assessment
- 重点在 `interoperability`、`self-sovereignty`、`trust`
- 不是电池产品碳足迹真实性的法律终局判定

关键判断：
- HKU 不能把 ESG assurance、Catena-X CAB、EU battery conformity 混成同一件事
- 最合理做法是给每个字段标注所需 assurance level

### 3.5 保密与访问控制

中国大陆交易所：
- 允许因商业秘密、国家秘密等调整披露或采用替代措施

香港：
- 更接近 ISSB 的重要性和可获得性逻辑
- 不是简单的“商业秘密万能豁免”

欧盟电池法规：
- 不是“所有数据全部公开”
- Annex XIII 明确按层分开：
- public
- persons with legitimate interest
- notified bodies / market surveillance / Commission
- individual battery data restricted layers

关键判断：
- 大陆的逻辑是“部分信息可不披露”
- 欧盟的逻辑是“不是不披露，而是按角色分层披露”
- 这恰好是 HKU 最能发挥价值的地方：把 `trade-secret exception logic` 翻译成 `layered access logic`

### 3.6 数字化与可追溯

大陆交易所：
- 强调提高数据收集、核算、分析的信息化和数字化水平

HKEX / 香港路线图：
- 把 data and technology 明确视为 sustainability disclosure ecosystem 的一部分

CATL：
- 公开强调数据安全、可追溯、外部验证基础
- BMW MOU 明确点名 `cross-border data transfer`、`trusted data exchange`、`carbon accounting methodologies`、`Catena-X`

欧盟电池法规：
- battery passport 本身就是数字化合规制度
- 关注的是 `authentication`、`reliability`、`integrity`、`security and privacy`

Catena-X：
- 提供的是数据协作基础设施与 conformity framework

关键判断：
- HKU 不该只做一个 Excel 对照表
- HKU 应做 `字段字典 + 证据字典 + 访问矩阵 + 审计日志结构`

---

## 4. 从官方文本可确认的关键事实

### 4.1 大陆交易所共性
- 明确要求 Scope 1、Scope 2
- Scope 3 以鼓励为主
- 要求说明核算方法、假设和合并方法
- 允许商业秘密替代披露，但需说明原因
- 鼓励第三方核查或鉴证

### 4.2 HKEX / HKFRS S2 共性
- 气候披露已与 IFRS S2 高度对齐
- Scope 3、value chain、scenario analysis、transition plan 已进入制度核心
- 香港已把 sustainability assurance 和 data/technology 作为配套生态来建设

### 4.3 CATL 当前公开标准栈
- ESG 报告编制依据已覆盖深交所和财政部可持续披露准则试行文件
- Carbon accounting report 已采用 `ISO 14064-1 + GHG Protocol + GB/T 32150`
- 第三方 verification 已采用 `ISO 14064-3`
- 供应链侧已出现 `ISO 14067` 培训和 `CREDIT` 工具
- 零碳工厂公开采用 `PAS 2060`
- BMW MOU 已把 `Battery Passport + cross-border data transfer + Catena-X + carbon accounting methodologies` 写明

### 4.4 欧盟电池法规共性
- battery passport 不是“二维码营销项目”，而是市场准入制度的一部分
- 技术文档、测试报告、passport access、carbon footprint declaration 是制度联动的
- 访问权是分层的，不是绝对公开
- 合规对象是 `specific model + manufacturing plant`

### 4.5 CBAM 的可借鉴之处
- 电池暂不在首批直接征收范围
- 但 `embedded emissions + verifier discipline + installation logic` 很值得借来设计电池场景的 shadow audit

### 4.6 Catena-X 的边界
- 有助于可信交换、互操作、proof of conformity
- 不能替代电池法规下的法律 conforming role

---

## 5. HKU 如果要做“转换系统”，最合理的系统边界

### 5.1 不要只做标准对照表
至少需要 4 张核心表：

1. `field_mapping_table`
- source field
- target field
- source granularity
- target granularity
- mapping type: direct / transformed / partial / no-map

2. `evidence_mapping_table`
- 每个 target field 需要什么底层证据
- 证据来自 ERP / MES / LCA model / invoice / supplier declaration / test report 哪一层

3. `assurance_mapping_table`
- 每个字段需要什么 assurance
- internal control / external verification / verifier-facing review / notified-body-facing review

4. `confidentiality_access_table`
- public
- contractual
- verifier-facing
- regulator
- legitimate-interest
- internal only

### 5.2 HKU 的合理 deliverables
- 中欧电池碳字段字典
- Scope 语言到 lifecycle stage 语言的转换规则
- 证据包模板
- 保密分级与访问矩阵
- verifier-facing shadow audit orchestration 模板

### 5.3 HKU 不应声称做的事
- 不应声称自己替代 notified body
- 不应声称 Catena-X 认证等于欧盟电池合规
- 不应声称公司级 ESG 报告可以直接变成 battery passport
- 不应声称 hash 或平台接入本身就能替代底层证据

---

## 6. 最适合比赛的表述

### 一句话版本
HKU should build a conversion system that translates CATL’s existing issuer-level disclosure, carbon-accounting, and supplier-governance language into EU-ready product-level evidence architecture for battery passport and carbon footprint compliance.

### 中文版本
港大不应把公司级 ESG 披露直接包装成欧盟电池护照，而应构建一套“字段、证据、核验、权限”四层映射系统，把 CATL 现有的碳管理语言翻译成欧盟可接受的产品级合规证据架构。

### 三个最强判断
1. 大陆/HKEX/CATL 现有体系主要是 `issuer/entity` 规则，欧盟电池法规主要是 `battery model + manufacturing plant` 规则，天然错层。
2. CATL 已经有混合标准栈，HKU 的任务不是从零造标准，而是做标准翻译和证据架构。
3. 最可行的 HKU 方案不是“纯标准对照表”，而是“字段映射 + 证据映射 + assurance 映射 + confidentiality/access 映射”。

---

## 7. 建议的下一步

最优先做三件事：

1. 把 `field_mapping_seed.csv` 扩成 40-60 个字段
- 优先覆盖 carbon footprint
- recycled content
- due diligence
- passport access
- technical documentation

2. 做一个 `shadow audit` 样板
- 选一个 CATL 工厂
- 选一个电池型号
- 逐字段检查已有数据、缺口、敏感级别、所需 assurance

3. 把 HKU 角色收敛成 3 个输出
- rulebook
- mapping engine
- evidence architecture

