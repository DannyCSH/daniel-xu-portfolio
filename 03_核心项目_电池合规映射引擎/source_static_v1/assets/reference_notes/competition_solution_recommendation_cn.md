# HKU-CATL 比赛方案收敛建议

更新日期：2026-04-06

## 一句话结论

最适合你的方案，不是去空泛地说“港大和宁德时代牵头制定国际碳标准”，也不是只做一张“中欧标准对照表”。

最适合收敛成：

`HKU-CATL 中欧电池碳数据映射引擎 + 证据架构 + 分层披露机制 + Catena-X 可信交换通道`

更直白一点：

`把 CATL 现有公司级 ESG / 碳核算 / 供应链治理语言，翻译成欧盟电池法规可接受的产品级、工厂级、可核验、可分层访问的证据体系。`

---

## 为什么这个方向最稳

### 1. 你真正面对的不是“缺标准”，而是“错层”

现有本地材料已经很清楚：

- 大陆交易所、HKEX、CATL 现有公开披露体系，主要是 `issuer/entity（公司/发行人）` 级
- 欧盟电池法规主要看 `battery model + manufacturing plant（电池型号 + 制造工厂）`
- 部分字段还会下钻到 `individual battery（单体电池）`

所以真正难点不是：

`CATL 没有 ESG 或碳数据`

而是：

`CATL 有很多数据，但这些数据不是按欧盟要的粒度和证据结构组织的`

这就是 HKU 最好切入的位置。

### 2. CATL 不是从零开始

本地材料已经显示，CATL 公开口径里已经混合使用了：

- 大陆交易所规则
- `GRI`
- `ISO 14064`
- `GHG Protocol`
- `GB/T 32150`
- `ISO 14067`
- `PAS 2060`
- `Catena-X`
- `EU Battery Passport` 导向

所以 HKU 不应该把自己讲成“从零发明国际标准”的人。

更稳的说法是：

`HKU 把 CATL 已有的数据语言和管理语言，翻译成 EU-ready（欧盟可接受）的产品级证据架构。`

### 3. 欧盟电池法规要的是“证据体系”，不是“报告叙事”

基于本地法规文件，可信方案最少必须覆盖：

- `Article 7` 碳足迹声明
- `Annex II` 的 `PEF（产品环境足迹）` 计算逻辑
- `Annex VIII` 技术文档与合格评定路径
- `Annex XIII` 电池护照分层访问结构

所以你不能只交：

- 标准对照表
- ESG narrative（叙事）
- 大而化之的国际合作愿景

你必须交的是：

- 可映射字段
- 可追溯证据
- 可核验规则
- 可分层访问的数据包

---

## 推荐的最终提案名称

### 中文版

`HKU-CATL 中欧电池碳数据映射引擎与可信护照架构`

### 英文版

`HKU-CATL Mapping Engine for EU Battery Passport Compliance and Trusted Carbon Data Exchange`

如果你想更有“比赛感”，也可以写成：

`From ESG to Battery Passport: A HKU-CATL Mapping Engine for EU-Ready Product Evidence`

---

## 推荐的核心问题定义

你在 PPT 里最好这样定义问题：

`CATL 已经拥有大量 ESG、碳核算、工厂能耗、供应链治理和产品测试数据，但这些数据主要按公司级披露逻辑组织；而欧盟电池法规要求的是按电池型号和制造工厂组织的、可核验、可分层访问的产品级证据体系。`

因此，本项目要解决的不是“再做一份 ESG 报告”，而是：

`把 issuer-level（公司级）数据语言，转换成 battery-level / plant-level（产品级 / 工厂级）合规证据语言。`

---

## 最推荐的方案架构

### 第一层：数据源层

由 CATL 持有，不需要对外完全开放。

包括：

- ERP
- BOM
- 工厂能耗与电力数据
- 辅助材料数据
- 供应商碳数据
- 质量与测试数据
- 序列化和追溯数据

### 第二层：HKU 映射与计算层

这是 HKU 最该占的位置，也是最不可替代的位置。

HKU 负责的不是法定审计，而是构建四层映射系统：

1. `field mapping（字段映射）`
2. `evidence mapping（证据映射）`
3. `assurance mapping（核验映射）`
4. `confidentiality/access mapping（保密与访问权限映射）`

这一层把 CATL 现有数据重组为：

- `battery model + plant` 级碳足迹结构
- `Article 7` 碳足迹声明字段
- `Annex VIII` 技术文档证据包
- `Annex XIII` 电池护照分层数据包

### 第三层：可信交换层

这一层可以使用 `Catena-X / Tractus-X` 风格的技术底座承载。

它适合做：

- 标准化接口
- 语义模型
- 权限控制
- 可信交换
- 可留痕的数据访问

它不适合被说成：

- 自动合规黑箱
- 自动碳计算器
- 自动电池护照生成器

### 第四层：认证与法规评估层

这一层必须单独讲清楚，不要混淆：

- `CAB（Conformity Assessment Body）` 审的是 Catena-X 交换方案是否符合其生态规则
- 欧盟电池法规下的产品合规、测试报告、技术文档、符合性评估，仍应由相应法规路径下的主体来完成

一句话：

`CAB 解决“怎么可信地交换”，法规评估主体解决“交换出去的内容是否满足产品法规”。`

---

## 三方角色如何分工

### CATL

- 数据拥有者
- 工厂/产品事实来源
- 内部系统接入方
- 试点工厂与试点电池型号提供方

### HKU

- 规则翻译者
- 映射方法设计者
- 证据架构设计者
- Shadow audit（影子审计）编排方
- 标准对话与方法学输出方

### 第三方核验 / 评估机构

- 审查技术文档
- 审查碳足迹声明
- 审查测试报告
- 审查交换方案是否符合 Catena-X 生态要求

---

## 你最该强调的 4 个交付物

### 1. 中欧字段映射字典

把 CATL 现有数据字段映射到欧盟电池法规目标字段。

### 2. 证据字典

说明每个欧盟目标字段背后需要什么证据。

例如：

- ERP
- BOM
- 电表数据
- 发票
- 供应商声明
- 测试报告
- 工厂台账

### 3. 核验字典

给每个字段标注所需核验等级。

例如：

- 内部控制即可
- 第三方核验
- verifier-facing review（供核验方审阅）
- notified-body-facing evidence（供法规评估机构审阅）

### 4. 访问权限矩阵

把数据分成至少四层：

- `public（公开层）`
- `legitimate interest（合法利益相关方层）`
- `authority / notified body（监管/公告机构层）`
- `internal only（内部层）`

这会非常打中 CATL 的真实痛点，因为它不是“全公开”，而是“分层透明”。

---

## 你在比赛里最容易打动人的 3 个卖点

### 卖点 1

`它解决的是错层问题，而不是重复做一份 ESG 报告。`

### 卖点 2

`它不是学术空话，而是四层映射系统：字段、证据、核验、权限。`

### 卖点 3

`它既保留 CATL 的数据主权和商业机密，又满足欧盟“可验证透明”的方向。`

---

## 你必须主动避开的 5 个坑

### 坑 1

不要说：

`HKU 代替公告机构或法定审计机构。`

### 坑 2

不要说：

`Catena-X / Tractus-X 一键自动把 CATL 数据变成欧盟合规结果。`

### 坑 3

不要说：

`CAB 认证 = 欧盟电池法规合规。`

### 坑 4

不要说：

`CATL 现有 ESG 报告可以直接变成 battery passport。`

### 坑 5

不要说：

`所有底层数据都必须向欧洲完全公开。`

更准确的说法是：

`法规要求的是分层披露和可核验证据，不是商业秘密无差别公开。`

---

## 最切实可行的试点路径

不要一上来讲全集团、全产品线。

最稳的是：

### Phase 1：选 1 个工厂 + 1 个电池型号

交付：

- 样板字段映射表
- 样板证据包
- 样板碳足迹声明
- 样板护照分层结构
- Shadow audit（影子审计）流程

### Phase 2：接入可信交换层

交付：

- Catena-X / Tractus-X 风格接口
- 分层数据对象
- 权限矩阵
- 审计日志结构

### Phase 3：形成 HKU-CATL 联合方法学

交付：

- 中欧转换规则手册
- 可复制到第二个工厂/第二个型号的模板
- 可对外发布的方法学白皮书

这时你才可以更稳地说：

`HKU 与 CATL 正在共同塑造国际可复制的电池碳数据转换标准。`

而不是一开始就空喊“制定国际标准”。

---

## 最适合你比赛讲的版本

### 最短版

`我们的方案不是再做一张标准对照表，而是为 CATL 建立一套从公司级 ESG 语言到欧盟产品级合规证据的映射引擎。港大负责字段、证据、核验和权限四层翻译，CATL 提供底层数据，Catena-X/Tractus-X 负责可信交换，第三方机构负责合规核验。`

### 稍强一点的版本

`EU Battery Passport 的难点，不在于 CATL 没有数据，而在于它现有数据主要按公司级披露逻辑组织；而欧盟要的是按电池型号和制造工厂组织的可核验证据。HKU 的价值，是把这两套语言之间的断层补起来。`

---

## 本建议稿主要依据的本地文件

- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\hku_catl_standards_mapping_comparison_cn_utf8.md`
- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\initial_mapping_matrix_readable_cn.md`
- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\field_mapping_seed_v2.csv`
- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\extracted\EU_Battery_Regulation_2023_1542_consolidated_2025-07-31.txt`
- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\extracted\CatenaX_CAF_Handbook.txt`
- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\extracted\CatenaX_Certification_Page.txt`
- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\extracted\CATL_BMW_Battery_Passport_MOU_2026.txt`
- `D:\VibeCoding\codex\reports\hku_catl_standards_mapping\extracted\CATL_HKU_Zero_Carbon_Future_Innovation_Center_2025.txt`
