(function () {
  'use strict';

  const projects = {
    cmb: {
      name: '招小帮',
      kicker: '01 · 团队项目',
      subtitle: 'AI 驱动的对公客户经营助手',
      status: '已验证 · 团队原型',
      summary: '把区域、产业链与企业信息转成客户经理可以解释、复核和执行的经营动作；看板负责稳定扫描，Agent 负责追问与任务调整。',
      metrics: [['约 30h', '集中交付'], ['3 + 3', '产品 + 数据'], ['9 / 9', '场景验证'], ['46 / 46', '本地引用']],
      workflowNote: '区域、产业与客户数据共享来源、更新时间和权限边界。',
      workflow: [
        ['区域扫描', '识别属地政策、产业机会与机构经营概况'],
        ['产业下钻', '从区域进入产业链，比较景气与重点赛道'],
        ['客户判断', '结合画像、关系与风险形成可解释建议'],
        ['任务闭环', '人工复核后生成拜访与跟进任务并回流反馈']
      ],
      contributions: [
        '参与客户经理、中后台及一线角色访谈并归纳两类焦虑。',
        '负责属地产业政策模块，参与客户画像与 UI/UX。',
        '梳理完整业务流程、泳道与 UI 跳转逻辑。',
        '承担约三分之一 PPT 设计与答辩整合。'
      ],
      evidence: [],
      boundaries: [],
      interview: '这个项目证明我能把用户洞察、数据产品和 AI 交互组织成可解释、可执行、有人审的业务闭环，同时清楚区分个人贡献与团队成果。',
      actions: [
        ['打开网页端 Demo', '../05_核心项目_招行客户营销综合看板/source_final_extracted/网页端/index.html?reset=1', true],
        ['打开移动端 Demo', '../05_核心项目_招行客户营销综合看板/source_final_extracted/移动端/index.html'],
        ['查看审计报告', '../05_核心项目_招行客户营销综合看板/AUDIT_REPORT.md']
      ]
    },
    remote: {
      name: 'Remote Dev Agent',
      kicker: '02 · 个人公开项目',
      subtitle: '可控的本地 AI 远程执行链路',
      status: '已验证 · 可继续内测',
      summary: '从手机 QQ 提交任务，由本地 Router/Queue 排队，Claude Code 主执行，Codex 拆解与复审，并在最小权限下回传状态、结果和文件。',
      metrics: [['57 / 57', 'Python 测试'], ['7 / 7', 'PowerShell 验证'], ['499', '6h 状态样本'], ['0', 'overall failed']],
      workflowNote: '系统存活、任务完成、尾延迟和结果回传分别度量。',
      workflow: [
        ['消息入口', 'QQ / NanoBot 接收任务、附件与控制命令'],
        ['路由排队', '识别本地命令、普通任务、文件与健康探针'],
        ['双模型执行', 'Claude 主执行，Codex 前置拆解与对抗复审'],
        ['状态回传', '记录任务、队列、诊断与最终文件并返回手机']
      ],
      contributions: [
        '定义从手机到本地执行与回传的完整产品链路。',
        '设计双模型分工，避免模型无限互调。',
        '建立默认工作区、显式授权和管理员中继边界。',
        '补齐健康快照、诊断包、防重放与失败恢复机制。'
      ],
      evidence: [
        '57 个 Python 单元测试与 7 个 PowerShell 验证全部通过。',
        '正式 6 小时对抗性长稳记录 499 个状态样本，0 failed。',
        '18 次端到端探针中 16 次 finished，2 次超过 15 分钟。'
      ],
      boundaries: [
        '没有规模用户，不能称为客户级强 SLA。',
        '2 次任务探针超时说明尾延迟仍需继续优化。',
        '全盘搜索、额外目录与管理员动作必须显式授权。'
      ],
      interview: '这个项目证明我把 Agent 看作有状态、有权限、有失败路径和可观测性的产品系统，而不是一次模型调用。',
      actions: [
        ['查看公开仓库', 'https://github.com/DannyCSH/remote-dev-agent', true],
        ['查看架构与流程', '../06_备选项目/Remote_Dev_Agent/docs/PHASE1_ARCHITECTURE_FLOW_CN.md'],
        ['查看长稳结论', '../06_备选项目/Remote_Dev_Agent/evidence_long_run/PHASE1_LONG_RUN_CLOSEOUT_CN.md']
      ]
    },
    catl: {
      name: '电池合规四层映射引擎',
      kicker: '03 · 独立研究原型',
      subtitle: 'EU Battery Regulation 合规证据链',
      status: '已验证 · 合成数据',
      summary: '将跨标准合规问题拆成字段、证据、核验和权限四层，让每个输出都能追溯到来源、责任人与可见范围。',
      metrics: [['86', '输入字段'], ['14', '生成表'], ['49', '证据/核验/权限'], ['12', 'EU ZIP 文件']],
      workflowNote: '确定性规则负责计算，AI 仅适合建议填充与来源提取。',
      workflow: [
        ['字段映射', '将现有企业数据映射到目标法规字段'],
        ['证据映射', '关联 BOM、电表、发票、PCF 与测试报告'],
        ['核验映射', '明确内部、供应商、第三方与法定确认责任'],
        ['权限映射', '按公众、客户、监管与内部控制可见范围']
      ],
      contributions: [
        '定义跨标准、跨粒度的核心问题与四层方法。',
        '把早期静态看板收敛为可检查的 Flask 动态工作台。',
        '编排 19 张工作表、86 个字段及合成案例。',
        '在一周限制下放弃不稳定的 AI 文件解析方案。'
      ],
      evidence: [],
      boundaries: [],
      interview: '这个项目证明我能把复杂 B 端数据问题从“做个看板”推进到字段、证据、责任和权限都可追溯的产品机制。',
      actions: [
        ['打开动态最终版', 'http://127.0.0.1:5000/reset-demo', true],
        ['打开静态备用', '../03_核心项目_电池合规映射引擎/source_static_v1/frontend/index-enhanced.html'],
        ['查看动态版说明', '../03_核心项目_电池合规映射引擎/source_dynamic_v2_private_archive/README.md'],
        ['查看完整私有仓库', 'https://github.com/DannyCSH/catl-mapping-engine']
      ]
    },
    insurance: {
      name: 'AI 保障管家',
      kicker: '04 · 个人项目',
      subtitle: '保险需求确认、分流与经理复核',
      status: '静态可演示 · AI 密钥未配置',
      summary: '先把生活化担忧转成用户确认过的保障档案，再进入标准品自助、复杂品转经理、信息不足继续追问或暂不推荐的三层决策。',
      metrics: [['3', '决策分流'], ['2', '后端接口'], ['1', '确认优先'], ['人工', '复杂品复核']],
      workflowNote: '推荐之前先确认；复杂保险不允许模型独立成交。',
      workflow: [
        ['需求理解', '从生活化表达中提取家庭、责任与风险信息'],
        ['用户确认', '生成结构化保障档案并允许补充、修改、拒绝'],
        ['风险分流', '标准品自助、复杂品转经理、信息不足继续追问'],
        ['经理复核', '输出解释与交接报告，由人工完成高风险判断']
      ],
      contributions: [
        '提出“先确认，再推荐”的核心交互原则。',
        '设计三层分流和复杂产品人工复核。',
        '将用户侧流程与经理报告串成完整交接链路。',
        '补充静态 Demo 与结构化 Node 接口。'
      ],
      evidence: [],
      boundaries: [],
      interview: '这个项目证明我能围绕高风险决策设计确认、拒答、转人工与责任边界，而不是让模型直接替用户做选择。',
      actions: [
        ['打开本地 Demo', '../06_备选项目/AI保障管家/source_interview_demo/index.html', true],
        ['打开在线 Demo', 'https://dannycsh.github.io/cmb-ai-coverage-guardian/'],
        ['查看后端仓库', 'https://github.com/DannyCSH/cmb-ai-insurance-ai-demo']
      ]
    },
    medication: {
      name: '慢病用药小管家',
      kicker: '05 · 个人项目',
      subtitle: '复诊周期管理与医疗安全取舍',
      status: '线上可访问 · 缺完整测试',
      summary: '围绕计划、打卡、库存、复诊摘要和续方准备建立复诊周期闭环，并主动撤回浏览器直连模型的高风险方案。',
      metrics: [['42', '连续需求'], ['9', '代码提交'], ['5', '复诊闭环环节'], ['通过', '线上构建']],
      workflowNote: '规则负责稳定演示，医疗建议与处方判断不交给前端模型。',
      workflow: [
        ['用药计划', '录入药物、频次、库存与复诊目标'],
        ['每日打卡', '记录执行、漏服与异常情况'],
        ['库存预警', '根据剩余量提醒补药与准备材料'],
        ['复诊准备', '生成摘要并进入续方或医生沟通流程']
      ],
      contributions: [
        '连续提出并收敛 42 条产品需求。',
        '把单次提醒扩展为完整复诊周期闭环。',
        '主动撤回浏览器直连 MiniMax 的不安全方案。',
        '以规则演示保障交付稳定和医疗边界。'
      ],
      evidence: [],
      boundaries: [],
      interview: '这个项目证明我能在连续需求中做范围收敛，并在医疗场景主动撤回看似先进但安全边界不足的模型方案。',
      actions: [
        ['打开在线 Demo', 'https://dannycsh.github.io/meituan-medication-manager/', true],
        ['查看公开仓库', 'https://github.com/DannyCSH/meituan-medication-manager'],
        ['查看审查报告', '../04_核心项目_慢病用药管家/meituan_medication_manager_review_report.md']
      ]
    },
    perfume: {
      name: 'Perfume36',
      kicker: '06 · 个人项目',
      subtitle: '性格测试与轻后端商业闭环',
      status: '本地 mock · 未正式部署',
      summary: '把一次性 36 题测试演进为免费展示主结果、保存 session、购买后恢复并解锁 Top 3、按渠道生成分享海报的商业闭环。',
      metrics: [['36', '测试题'], ['Top 3', '付费解锁'], ['1', '会话恢复链路'], ['0', '真实订单']],
      workflowNote: '当前本地 mock 可完整演示，但不能代表真实支付或转化。',
      workflow: [
        ['完成测试', '36 题形成香气性格与主导结果'],
        ['免费预览', '先展示主结果和有限解释'],
        ['保存会话', '保留 session，购买后无需重新做题'],
        ['解锁传播', '校验解锁码、展示 Top 3 并生成渠道海报']
      ],
      contributions: [
        '把一次性结果页重构为免费到付费的转化路径。',
        '设计 session 保存、恢复和解锁机制。',
        '增加渠道参数、续香码与分享海报逻辑。',
        '保留本地 mock，降低演示对后端的依赖。'
      ],
      evidence: [],
      boundaries: [],
      interview: '这个项目证明我能把内容型体验推进到会话、解锁、支付后恢复和渠道传播的轻量商业闭环，同时区分 mock 与真实业务结果。',
      actions: [
        ['打开本地 Demo', '../06_备选项目/Perfume36_灵魂香调/Perfume-36 - 轻后端改造版.html?reset=1', true],
        ['查看商业化计划', '../06_备选项目/Perfume36_灵魂香调/Perfume-轻后端商业化改造计划.md'],
        ['查看材料清单', '../06_备选项目/Perfume36_灵魂香调/MANIFEST.md']
      ]
    }
  };

  const order = ['cmb', 'remote', 'catl', 'insurance', 'medication', 'perfume'];
  const el = function (id) { return document.getElementById(id); };

  function appendList(target, items) {
    target.replaceChildren();
    items.forEach(function (item) {
      const li = document.createElement('li');
      li.textContent = item;
      target.appendChild(li);
    });
  }

  function render(projectKey) {
    const key = projects[projectKey] ? projectKey : 'cmb';
    const project = projects[key];
    document.title = project.name + ' · 项目看板 · 许哲安';

    el('project-kicker').textContent = project.kicker;
    el('project-title').textContent = project.name;
    el('project-subtitle').textContent = project.subtitle;
    el('project-summary').textContent = project.summary;
    el('project-status').textContent = project.status;
    el('workflow-note').textContent = project.workflowNote;
    el('interview-value').textContent = project.interview;

    const metrics = el('metrics-grid');
    metrics.replaceChildren();
    project.metrics.forEach(function (metric) {
      const box = document.createElement('div');
      box.className = 'metric';
      const value = document.createElement('span');
      value.className = 'metric-value';
      value.textContent = metric[0];
      const label = document.createElement('span');
      label.className = 'metric-label';
      label.textContent = metric[1];
      box.append(value, label);
      metrics.appendChild(box);
    });

    const workflow = el('workflow');
    workflow.replaceChildren();
    project.workflow.forEach(function (step, index) {
      const li = document.createElement('li');
      li.className = 'workflow-step';
      const number = document.createElement('span');
      number.className = 'workflow-index';
      number.textContent = String(index + 1).padStart(2, '0');
      const title = document.createElement('span');
      title.className = 'workflow-title';
      title.textContent = step[0];
      const copy = document.createElement('span');
      copy.className = 'workflow-copy';
      copy.textContent = step[1];
      li.append(number, title, copy);
      workflow.appendChild(li);
    });

    appendList(el('contributions'), project.contributions);
    appendList(el('evidence'), project.evidence);
    appendList(el('boundaries'), project.boundaries);
    el('evidence').closest('section').hidden = project.evidence.length === 0;
    el('boundaries').closest('section').hidden = project.boundaries.length === 0;

    const actions = el('project-actions');
    actions.replaceChildren();
    project.actions.forEach(function (action) {
      const link = document.createElement('a');
      link.className = 'action-link' + (action[2] ? ' primary' : '');
      link.href = action[1];
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = action[0] + ' ↗';
      actions.appendChild(link);
    });

    el('project-switcher').value = key;
    const url = new URL(window.location.href);
    url.searchParams.set('project', key);
    window.history.replaceState(null, '', url);
  }

  const switcher = el('project-switcher');
  order.forEach(function (key) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = projects[key].name;
    switcher.appendChild(option);
  });

  switcher.addEventListener('change', function () {
    render(switcher.value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const initial = new URLSearchParams(window.location.search).get('project') || 'cmb';
  render(initial);
}());
