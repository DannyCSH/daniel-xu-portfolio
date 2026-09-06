# HKU-CATL 初步可映射表
更新日期：2026-04-06

## 怎么看这份表
这不是最终版法律合规表，而是一份“现在就能拿来讲”的初步映射底稿。

建议把映射状态理解为 4 类：

| 映射状态 | 含义 | 你可以怎么理解 |
| --- | --- | --- |
| `可直接映射` | 基本能一一对应 | 稍微整理就能用 |
| `需转换映射` | 大方向能对上，但要重算/重组 | 这是 HKU 最有价值的工作区 |
| `部分借用` | 不能直接变成欧盟字段，但思路和纪律能借 | 更像模板，不是直接答案 |
| `暂不对应` | 目前不建议硬对 | 放进背景或辅助层，不要硬说已合规 |

---

## 一、五套体系总览表

| 体系 | 核心对象 | 主要目的 | 典型粒度 | 最关心什么 | 对 HKU 的启示 |
| --- | --- | --- | --- | --- | --- |
| 中国大陆交易所 | 上市公司 | 资本市场披露 | 年度、公司级 | 公司整体 ESG、温室气体核算、重要性、替代披露 | 这套语言偏“公司整体”，不能直接当产品合规答案 |
| 香港 HKEX / HKFRS / assurance | 上市公司/公众利益实体 | 国际化披露与 assurance 生态 | 年度、公司级 | IFRS S2、价值链、财务影响、鉴证 | 适合做 investor-facing 国际叙事，但不够产品级 |
| CATL 当前公开口径 + 内部数据 | 公司、工厂、供应链、产品 | 管理、披露、客户沟通、实际运营 | 公司级 + 工厂级 + 内部产品级 | 实际底层数据、BOM、采购、能耗、追溯 | CATL 是最重要的数据源，但不是天然欧盟答案 |
| 欧盟电池法规 | 电池型号 + 制造工厂 + 部分个体电池 | 市场准入与产品合规 | 产品级、工厂级、部分个体级 | 电池护照、碳足迹、测试报告、再生材料、尽调 | 这是最终对接目标 |
| CBAM | 进口商品 + installation | 边境碳申报与核查 | installation 级 | embedded emissions、核查纪律、registry、证书 | 更适合借核查纪律，不是电池护照本身 |

---

## 二、关键主题初步映射表

| 主题 | 大陆 / 香港 / CATL 现有基础 | 欧盟电池法规要求 | CBAM 可借之处 | 初步映射状态 | 主要缺口 | HKU 建议动作 |
| --- | --- | --- | --- | --- | --- | --- |
| 制造商基本身份 | 大陆/HK/CATL 都有公司主体披露 | 需要 manufacturer / importer identification | 可借企业识别和 operator 逻辑 | `可直接映射` | 基本无大缺口 | 直接做主数据清洗 |
| 电池型号标识 | CATL 内部一定有，但公开披露不充分 | 必须有 battery model identifier | 无直接帮助 | `需转换映射` | 公开体系缺少产品级锚点 | 把内部产品主数据拉成映射主键 |
| 制造工厂标识 | CATL 有工厂信息，交易所多为公司级案例 | 必须绑定 manufacturing plant | installation 识别逻辑可借 | `需转换映射` | 公司级语言未稳定下钻到 plant 级 | 建立 model-to-plant 绑定表 |
| 报告期间 | 大陆/HK 多是年度披露周期 | 要按特定 model + plant 的碳足迹周期 | CBAM 也强调特定 reporting period | `需转换映射` | 年度口径与产品生产周期错层 | 做 reporting period 转换规则 |
| 核算边界 | 大陆/HK/CATL 有 Scope、控制法、合并边界 | 要产品生命周期边界 | installation boundary 可借 | `需转换映射` | 公司边界不等于产品边界 | 做 company boundary -> product boundary 规则 |
| Scope 1 / 2 排放 | CATL 已有 carbon accounting report 基础 | 要归因到 battery model + plant 的碳足迹 | 可借核查纪律 | `需转换映射` | 需要分摊逻辑，不可直接拿公司总量 | 做 plant/process/model 分摊模型 |
| Scope 3 / 上游材料 | CATL 有供应链管理和部分 supplier PCF 基础 | 要 upstream precursor / material emissions | embedded emissions 思路可借 | `需转换映射` | 供应商数据格式和欧盟生命周期语言不一致 | 做 supplier PCF -> lifecycle stage 转换 |
| 制造能耗与绿电 | CATL 有电力、蒸汽、绿证等内部数据 | 要制造阶段能源输入与相关证据 | 可借 installation-level 记录纪律 | `需转换映射` | 需要把 plant 能源账和产品产出绑定 | 做能耗-产量-型号分摊表 |
| 再生材料占比 | CATL 有回收和再生材料叙事 | 要 recycled content declaration | 无直接对应，但核查逻辑可借 | `需转换映射` | 企业回收能力不等于某型号电池再生含量 | 做 material-specific mass balance 表 |
| 尽职调查 | CATL 已有 responsible sourcing、CREDIT、供应商审核 | 要 battery due diligence policy 和 supporting evidence | verifier discipline 可借 | `需转换映射` | 管理口径强，欧盟法律字段化不足 | 做 due diligence 字段包 + 证据包 |
| 供应商审核记录 | CATL ESG 里已有 audit、整改等内容 | 可作为 due diligence supporting evidence | 核查思路可借 | `部分借用` | 不是一一对应欧盟公开字段 | 作为 supporting evidence 层，不硬映成 public field |
| 测试报告 / 技术文档 | 大陆/HK 披露弱，CATL 内部可能有 | 欧盟强依赖 test reports / technical documentation | 无直接替代 | `需转换映射` | 公开披露体系几乎不能替代正式合规文件 | 单独建 technical docs 证据包 |
| 电池护照公开层 | 大陆偏替代披露，HK 偏重要性 | 欧盟要求 public layer | 无直接对应 | `需转换映射` | 中国逻辑是“可不披露”，欧盟逻辑是“分层披露” | 做 public / restricted / authority 三层矩阵 |
| legitimate interest / authority access | 中国公开披露体系缺少这种细分 | 欧盟 Annex XIII 明确分层访问 | registry / access discipline 可借 | `需转换映射` | 需要角色与权限设计 | 做 confidentiality-access matrix |
| 个体电池数据 | CATL/BMS 内部可能有 | 欧盟对 individual battery 有受限字段 | 无直接帮助 | `需转换映射` | 高敏感、高权限控制要求 | 单独放 restricted layer，不混入公司级披露 |
| Catena-X / Tractus-X 接口层 | CATL 已有 pilot 基础 | 不是法规要求本身，但能承载数据交换 | 与 CBAM registry 思路有部分相似性 | `部分借用` | 只能支撑交换，不能替代法律合规 | 把它写成 exchange layer，不写成 compliance itself |
| CBAM verifier discipline | 与电池法规不是同一法 | 不能直接替代 battery conformity | 是其本职强项 | `部分借用` | 场景不同，商品范围也不同 | 借 verifier workflow，不直接借结论 |
| 企业级 ESG 公开指标 | 大陆/HK/CATL 很丰富 | 只能支撑部分 public layer | 无直接帮助 | `部分借用` | 只能做背景，不能直接变 battery passport | 只挑不敏感且可公开字段入 public layer |

---

## 三、最值得先做的 12 个“比赛能讲”的映射字段

| 序号 | 源头字段 | 目标字段 | 当前判断 | 一句话说明 |
| --- | --- | --- | --- | --- |
| 1 | Company legal name（公司法定名称） | manufacturer/importer identification（制造商/进口商识别） | `可直接映射` | 公司身份最好对齐 |
| 2 | battery model identifier（电池型号标识） | battery model identifier（电池型号标识） | `需转换映射` | 内部有，公开口径不足 |
| 3 | manufacturing base name（制造基地名称） | manufacturing plant（制造工厂） | `需转换映射` | 要从公司叙事下钻到 plant 级 |
| 4 | annual reporting period（年度报告期） | carbon footprint reporting period（碳足迹报告期） | `需转换映射` | 年报周期不等于产品碳足迹周期 |
| 5 | Scope 1 emissions（范围1排放） | direct emissions attributable to battery model（归属于型号的直接排放） | `需转换映射` | 必须分摊，不能直接拿总量 |
| 6 | Scope 2 emissions（范围2排放） | indirect electricity emissions attributable to battery model（归属于型号的购电排放） | `需转换映射` | 必须绑定具体工厂电力结构 |
| 7 | purchased goods and services（采购商品与服务排放） | upstream material embedded emissions（上游材料内含排放） | `需转换映射` | 要从 Scope 语言翻成生命周期语言 |
| 8 | plant electricity and steam use（工厂电力和蒸汽使用） | manufacturing energy inputs（制造阶段能源输入） | `需转换映射` | 需要工艺和产量分摊 |
| 9 | recycled material use（再生材料使用） | recycled content declaration（再生材料含量声明） | `需转换映射` | 企业回收故事不等于产品级含量 |
| 10 | supplier due diligence records（供应商尽调记录） | due diligence supporting evidence（尽调支持证据） | `部分借用` | 可做证据，但不能直接当公开字段 |
| 11 | test reports（测试报告） | restricted passport information（受限护照信息） | `需转换映射` | 这是硬合规材料，不能靠 ESG 替代 |
| 12 | public ESG metrics（公开 ESG 指标） | battery passport public layer（护照公开层） | `部分借用` | 只能抽一小部分进入公开层 |

---

## 四、比赛里可以直接说的结论

### 最短版本
中国大陆、香港和 CATL 当前披露体系，主要讲的是“公司整体怎么样”；欧盟电池法规讲的是“某个电池型号、某个工厂、到底怎么样”。所以 HKU 不能只做标准名称对照，而要做“字段、证据、核验、权限”四层映射。

### 更强一点的版本
`Tractus-X / Catena-X` 可以作为可信交换底座，`CBAM` 可以提供 installation-level verifier discipline，但真正决定电池能否合规进入欧盟市场的，仍然是欧盟电池法规本身。因此，HKU 的增量价值不在替代认证机构，而在于把 CATL 现有数据语言翻译成 EU-ready evidence architecture。

---

## 五、下一步最建议你继续扩的方向

1. 优先把“可直接映射”和“需转换映射”分开
2. 对 `需转换映射` 的行补 3 个字段
- 具体需要什么证据
- 谁来核验
- 能开放到哪一层
3. 先选 1 个工厂 + 1 个电池型号，做 shadow audit 样板

