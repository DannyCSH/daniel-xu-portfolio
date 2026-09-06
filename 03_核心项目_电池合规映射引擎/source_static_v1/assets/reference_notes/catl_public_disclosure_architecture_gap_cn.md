# CATL 现有公开披露架构与拆分判断

这份表的核心结论是：CATL 现在公开披露的数据并不是没有价值，而是大多数停留在 `公司级 / 基地级 / 政策级 / 平台能力级`，
如果要转成欧盟电池法和 CBAM-compatible 的输出，关键不是重做一套数据，而是继续向下拆到：

- `battery model（电池型号）`
- `manufacturing plant（制造工厂）`
- `supplier / material / installation（供应商 / 材料 / 上游工厂）`
- `lot / serial / passport access layer（批次 / 序列号 / 护照访问层）`

最适合直接引用的，是：公司身份、治理架构、零碳战略目标、供应商政策、CREDIT 工具、时代碳链平台、试点参与事实。

最必须继续拆分的，是：

- 年度 GHG 总量 -> model + plant 级碳足迹
- 基地名单 -> manufacturing plant code + model 绑定
- 供应商审核结果 -> supplier/material/site 级 evidence
- 产品追溯系统 -> individual battery / passport / technical docs 字段
- 上游减碳趋势值 -> CBAM 风格的 installation 级直接/间接排放数据

详细表格见：`D:\VibeCoding\codex\reports\hku_catl_standards_mapping\review_csv\11_CATL公开披露架构_review.csv` 和工作簿中的 `11_CATL公开披露架构`。