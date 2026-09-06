/**
 * CATL 四层映射 Demo - 增强版
 * 功能：角色切换、筛选、证据链展示、视图切换
 */
(function () {
  const data = window.CATL_DEMO_DATA;

  // ============ 状态管理 ============
  const state = {
    currentView: 'overview',
    currentRole: 'viewer', // viewer | auditor | admin
    currentProduct: 'SXP-CTP-PACK-DEMO-01',
    filterType: 'all', // all | direct | need-split | gap
    viewMode: 'table', // table | card
    expandedEvidence: null,
    activeLayer: null,
  };

  // ============ 角色权限配置 ============
  const roleConfig = {
    viewer: {
      label: '查看者',
      desc: '只看公开披露的数据',
      showConfidential: false,
      showInternal: false,
      showEvidence: false,
      badgeColor: '#56626d',
    },
    auditor: {
      label: '审核者',
      desc: '查看公开+证据链，可标注缺口',
      showConfidential: false,
      showInternal: true,
      showEvidence: true,
      badgeColor: '#d08b38',
    },
    admin: {
      label: '管理员',
      desc: '查看全部字段，含内部/受限数据',
      showConfidential: true,
      showInternal: true,
      showEvidence: true,
      badgeColor: '#0f5b5a',
    },
  };

  // ============ 字段权限映射 ============
  const fieldPermissions = {
    // 直接可引用（公开）
    directUse: [
      'manufacturer_name', 'product_name', 'model_code', 'battery_category',
      'chemistry', 'plant_name', 'reporting_period', 'pack_capacity_kwh',
      'nominal_voltage_v', 'cycle_life_cycles', 'due_diligence_policy_url',
      'carbon_intensity', 'eu_readiness', 'cbam_readiness'
    ],
    // 需要拆分（公司级->产品级）
    needSplit: [
      'cathode_pcf', 'anode_pcf', 'electrolyte_pcf', 'separator_pcf',
      'copper_pcf', 'aluminium_direct_pcf', 'aluminium_indirect_pcf',
      'steel_direct_pcf', 'steel_indirect_pcf', 'plastic_pcf',
      'grid_electricity_kwh', 'green_electricity_kwh', 'steam_mj',
      'natural_gas_mj', 'direct_process_emissions', 'production_yield_pct',
      'supplier_traceability_coverage_pct', 'supplier_pcf_coverage_pct'
    ],
    // 内部/受限
    confidential: [
      'test_report_status', 'technical_doc_status', 'passport_data_package_status',
      'access_matrix_status', 'third_party_verification_status'
    ]
  };

  // ============ 证据链数据 ============
  const evidenceData = {
    'carbon_intensity': {
      title: '碳足迹强度证据链',
      items: [
        { type: 'input', name: '原材料阶段输入', desc: '正极、负极、电解液、隔膜、铜材、铝材、钢材等 BOM 数据' },
        { type: 'calc', name: '生命周期计算', desc: '原材料+制造+运输+回收全链路碳排放计算' },
        { type: 'output', name: 'EU 输出', desc: '48.97 kgCO2e/kWh 声明总碳足迹' }
      ]
    },
    'aluminium_emissions': {
      title: '铝材 CBAM 兼容证据链',
      items: [
        { type: 'input', name: '铝材安装点 ID', desc: 'AL-SUP-001 供应商主数据' },
        { type: 'input', name: '铝材质量', desc: '80 kg/pack 来自 BOM' },
        { type: 'calc', name: '嵌入排放计算', desc: '质量 × (直接因子 9.0 + 间接因子 5.0)' },
        { type: 'evidence', name: '供应商核验', desc: '已核验状态，supplier PCF + verifier 报告' },
        { type: 'output', name: 'CBAM 输出', desc: '1120.00 kgCO2e/pack 总嵌入排放' }
      ]
    },
    'steel_emissions': {
      title: '钢材 CBAM 兼容证据链',
      items: [
        { type: 'input', name: '钢材安装点 ID', desc: 'ST-SUP-001 供应商主数据' },
        { type: 'input', name: '钢材质量', desc: '30 kg/pack 来自 BOM' },
        { type: 'calc', name: '嵌入排放计算', desc: '质量 × (直接因子 2.0 + 间接因子 0.7)' },
        { type: 'evidence', name: '供应商核验', desc: '已核验状态，supplier PCF + verifier 报告' },
        { type: 'output', name: 'CBAM 输出', desc: '81.00 kgCO2e/pack 总嵌入排放' }
      ]
    },
    'recycled_material': {
      title: '再生材料证据链',
      items: [
        { type: 'input', name: '再生锂占比', desc: '8.0% 质量平衡/供应商声明' },
        { type: 'input', name: '再生铝占比', desc: '18% 质量平衡/供应商声明' },
        { type: 'input', name: '再生钢占比', desc: '22% 质量平衡/供应商声明' },
        { type: 'evidence', name: '核验状态', desc: '第三方核验已通过' },
        { type: 'output', name: 'EU 输出', desc: '再生材料占比声明' }
      ]
    },
    'supply_traceability': {
      title: '供应链追溯证据链',
      items: [
        { type: 'input', name: '关键原材料范围', desc: 'lithium / graphite / aluminium / copper / steel' },
        { type: 'input', name: '追溯覆盖率', desc: '92% 追溯台账数据' },
        { type: 'input', name: '供应商 PCF 覆盖率', desc: '76% 供应商碳足迹报告' },
        { type: 'evidence', name: '尽调政策', desc: 'CATL 官网已公开' },
        { type: 'output', name: 'EU 输出', desc: '尽调与追溯声明' }
      ]
    }
  };

  // ============ DOM 引用 ============
  const sections = {
    overview: document.getElementById('view-overview'),
    eu: document.getElementById('view-eu'),
    cbam: document.getElementById('view-cbam'),
    layers: document.getElementById('view-layers'),
    catl: document.getElementById('view-catl'),
    dev: document.getElementById('view-dev'),
  };

  // ============ 初始化 ============
  function init() {
    renderRoleSwitcher();
    renderViewModeToggle();
    renderFilterBar();
    createNav();
    fillHero();
    renderOverview();
    renderEU();
    renderCBAM();
    renderLayers();
    renderCATL();
    renderDev();
    bindEvents();
  }

  // ============ 角色切换器 ============
  function renderRoleSwitcher() {
    const container = document.getElementById('role-switcher');
    if (!container) return;

    container.innerHTML = Object.entries(roleConfig).map(([key, config]) => `
      <button class="role-btn ${state.currentRole === key ? 'active' : ''}"
              data-role="${key}"
              style="--badge-color: ${config.badgeColor}">
        <span class="role-label">${config.label}</span>
        <span class="role-desc">${config.desc}</span>
      </button>
    `).join('');
  }

  // ============ 视图模式切换 ============
  function renderViewModeToggle() {
    const container = document.getElementById('view-mode-toggle');
    if (!container) return;

    container.innerHTML = `
      <button class="view-toggle-btn ${state.viewMode === 'table' ? 'active' : ''}" data-mode="table">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="14" height="3"/><rect x="1" y="6" width="14" height="3"/><rect x="1" y="11" width="14" height="3"/>
        </svg>
        表格
      </button>
      <button class="view-toggle-btn ${state.viewMode === 'card' ? 'active' : ''}" data-mode="card">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
          <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
        </svg>
        卡片
      </button>
    `;
  }

  // ============ 筛选栏 ============
  function renderFilterBar() {
    const container = document.getElementById('filter-bar');
    if (!container) return;

    const filters = [
      { key: 'all', label: '全部字段' },
      { key: 'direct', label: '可直接引用' },
      { key: 'need-split', label: '需要拆分' },
      { key: 'gap', label: '存在缺口' },
    ];

    container.innerHTML = `
      <div class="filter-group">
        <span class="filter-label">筛选：</span>
        ${filters.map(f => `
          <button class="filter-btn ${state.filterType === f.key ? 'active' : ''}" data-filter="${f.key}">
            ${f.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  // ============ 证据链弹窗 ============
  function renderEvidenceModal(evidenceKey) {
    const evidence = evidenceData[evidenceKey];
    if (!evidence) return;

    const modal = document.getElementById('evidence-modal');
    const content = document.getElementById('evidence-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="evidence-header">
        <h3>${evidence.title}</h3>
        <button class="modal-close" onclick="closeEvidenceModal()">×</button>
      </div>
      <div class="evidence-timeline">
        ${evidence.items.map((item, index) => `
          <div class="evidence-item evidence-${item.type}">
            <div class="evidence-step">
              <div class="step-number">${index + 1}</div>
              <div class="step-line ${index === evidence.items.length - 1 ? 'last' : ''}"></div>
            </div>
            <div class="evidence-content">
              <div class="evidence-type-badge">${getEvidenceTypeLabel(item.type)}</div>
              <h4>${item.name}</h4>
              <p>${item.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    modal.classList.add('open');
  }

  function getEvidenceTypeLabel(type) {
    const labels = {
      input: '📥 输入',
      calc: '🧮 计算',
      evidence: '✅ 核验',
      output: '📤 输出'
    };
    return labels[type] || type;
  }

  window.closeEvidenceModal = function() {
    const modal = document.getElementById('evidence-modal');
    if (modal) modal.classList.remove('open');
  };

  // ============ 导航 ============
  function createNav() {
    const nav = document.getElementById('nav-list');
    data.nav.forEach((item, index) => {
      const button = document.createElement('button');
      button.className = 'nav-button' + (index === 0 ? ' active' : '');
      button.dataset.target = item.id;
      button.innerHTML = `
        <span class="nav-label">${item.label}</span>
        <span class="nav-desc">${item.desc}</span>
      `;
      button.addEventListener('click', () => switchView(item.id, button));
      nav.appendChild(button);
    });
  }

  function switchView(id, button) {
    state.currentView = id;
    Object.values(sections).forEach((section) => section.classList.add('hidden'));
    sections[id].classList.remove('hidden');

    document.querySelectorAll('.nav-button').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
  }

  // ============ Hero 区 ============
  function fillHero() {
    document.getElementById('core-message').textContent = data.meta.coreMessage;
    document.getElementById('product-title').textContent = data.product.name;
    document.getElementById('product-subtitle').textContent =
      `${data.product.modelCode} | ${data.product.plantCode} | ${data.product.reportingPeriod}`;

    const stats = [
      ['化学体系', data.product.chemistry],
      ['额定容量', data.product.capacity],
      ['碳足迹强度', data.product.carbonIntensity],
      ['EU 输出完备度', data.product.euReadiness],
      ['CBAM 完备度', data.product.cbamReadiness],
    ];

    const container = document.getElementById('hero-stats');
    stats.forEach(([label, value]) => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `
        <span class="stat-label">${label}</span>
        <span class="stat-value">${value}</span>
      `;
      container.appendChild(card);
    });

    // 角色提示
    const roleTip = document.getElementById('role-tip');
    if (roleTip) {
      const config = roleConfig[state.currentRole];
      roleTip.innerHTML = `<strong>当前角色：${config.label}</strong>（${config.desc}）`;
    }
  }

  // ============ 事件绑定 ============
  function bindEvents() {
    // 角色切换
    document.getElementById('role-switcher')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.role-btn');
      if (!btn) return;
      state.currentRole = btn.dataset.role;
      document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      fillHero();
      renderCurrentView();
    });

    // 视图模式切换
    document.getElementById('view-mode-toggle')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.view-toggle-btn');
      if (!btn) return;
      state.viewMode = btn.dataset.mode;
      document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCurrentView();
    });

    // 筛选
    document.getElementById('filter-bar')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      state.filterType = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCurrentView();
    });

    // 证据链弹窗点击外部关闭
    document.getElementById('evidence-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'evidence-modal') closeEvidenceModal();
    });
  }

  function renderCurrentView() {
    switch(state.currentView) {
      case 'overview': renderOverview(); break;
      case 'eu': renderEU(); break;
      case 'cbam': renderCBAM(); break;
      case 'layers': renderLayers(); break;
      case 'catl': renderCATL(); break;
      case 'dev': renderDev(); break;
    }
  }

  // ============ 表格/卡片渲染 ============
  function createTable(headers, rows, options = {}) {
    const { showEvidence = false, showConfidence = false } = options;

    if (state.viewMode === 'card') {
      return createCardView(headers, rows, { showEvidence, showConfidence });
    }

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr ${getRowClass(row)}>
                ${row.map((cell, i) => `
                  <td>
                    ${typeof cell === 'string' ? applyFilters(cell) : cell}
                    ${i === row.length - 1 && showEvidence ? renderEvidenceBtn(row) : ''}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function createCardView(headers, rows) {
    return `
      <div class="card-view-grid">
        ${rows.map(row => `
          <div class="data-card ${getRowClass(row).replace('class=', '')}">
            <div class="card-header">${row[0]}</div>
            <div class="card-body">
              <div class="card-field"><label>${headers[1]}：</label><span>${row[1]}</span></div>
              <div class="card-field"><label>${headers[2]}：</label><span>${row[2]}</span></div>
              <div class="card-field card-note"><label>${headers[3]}：</label><span>${row[3]}</span></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function applyFilters(cell) {
    if (typeof cell !== 'string') return cell;

    let result = cell;

    if (state.filterType === 'direct' && !fieldPermissions.directUse.some(f => cell.includes(f))) {
      return `<span class="filtered-out">${cell}</span>`;
    }

    if (state.filterType === 'need-split' && !fieldPermissions.needSplit.some(f => cell.includes(f))) {
      return `<span class="filtered-out">${cell}</span>`;
    }

    if (cell.includes('不能直接输出') || cell.includes('需要拆分')) {
      return `<span class="tag warn">${cell}</span>`;
    }

    if (cell.includes('可直接引用')) {
      return `<span class="tag good">${cell}</span>`;
    }

    if (cell.includes('证据齐备') || cell.includes('已核验')) {
      return `<span class="tag good">${cell}</span>`;
    }

    return result;
  }

  function getRowClass(row) {
    const rowStr = row.join('');
    if (rowStr.includes('不能直接输出') || rowStr.includes('需要拆分')) {
      return 'class="row-gap"';
    }
    if (rowStr.includes('可直接引用')) {
      return 'class="row-direct"';
    }
    return '';
  }

  function renderEvidenceBtn(row) {
    const key = findEvidenceKey(row.join(''));
    if (!key) return '';
    return `<button class="evidence-btn" onclick="renderEvidenceModal('${key}')">查看证据链</button>`;
  }

  function findEvidenceKey(text) {
    const keys = Object.keys(evidenceData);
    return keys.find(key => text.toLowerCase().includes(key.replace('_', ' '))) || null;
  }

  // ============ 各视图渲染 ============
  function renderOverview() {
    const section = sections.overview;
    section.innerHTML = `
      <div class="section-header">
        <div>
          <p class="eyebrow">Overview</p>
          <h3 class="section-title">这套 Demo 到底在解决什么</h3>
        </div>
        <span class="pill">${roleConfig[state.currentRole].label}视角</span>
      </div>
      <p class="muted">${data.overview.intro}</p>
      <div class="card-grid">
        ${data.overview.highlights.map(item => `
          <article class="info-card">
            <h4>${item.title}</h4>
            <p>${item.text}</p>
          </article>
        `).join('')}
      </div>
      <div class="footer-callout">
        <strong>现在这套结构的主线：</strong>
        <ul class="bullets">
          ${data.overview.coreSteps.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  function renderEU() {
    sections.eu.innerHTML = `
      <div class="section-header">
        <div>
          <p class="eyebrow">EU Output</p>
          <h3 class="section-title">欧盟电池法输出视图</h3>
        </div>
        <span class="pill">${state.currentRole === 'admin' ? '含受限字段' : '公开字段'}</span>
      </div>
      <p class="muted">${data.euOutput.summary}</p>
      ${createTable(['模块', '输出字段', '当前值', '怎么看'], data.euOutput.rows, { showEvidence: true })}
    `;
  }

  function renderCBAM() {
    sections.cbam.innerHTML = `
      <div class="section-header">
        <div>
          <p class="eyebrow">CBAM-Compatible</p>
          <h3 class="section-title">上游材料 CBAM 风格兼容输出</h3>
        </div>
        <span class="pill">重点是兼容，不是误说"电池已直接纳入 CBAM"</span>
      </div>
      <p class="muted">${data.cbamOutput.summary}</p>
      ${createTable(['模块', '输出字段', '当前值', '怎么看'], data.cbamOutput.rows, { showEvidence: true })}
    `;
  }

  function renderLayers() {
    sections.layers.innerHTML = `
      <div class="section-header">
        <div>
          <p class="eyebrow">Four Layers</p>
          <h3 class="section-title">四层映射到底分别在做什么</h3>
        </div>
        <span class="pill">适合讲逻辑，不适合堆术语</span>
      </div>
      <div class="layer-stack">
        ${data.layers.map((layer, index) => `
          <article class="layer-card ${state.activeLayer === index ? 'expanded' : ''}">
            <div class="layer-header" onclick="toggleLayer(${index})">
              <h4>${layer.title}</h4>
              <span class="layer-toggle">${state.activeLayer === index ? '−' : '+'}</span>
            </div>
            <p class="layer-subtitle">${layer.subtitle}</p>
            <ul class="bullets ${state.activeLayer === index ? 'visible' : ''}">
              ${layer.bullets.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </article>
        `).join('')}
      </div>
    `;
  }

  window.toggleLayer = function(index) {
    state.activeLayer = state.activeLayer === index ? null : index;
    renderLayers();
  };

  function renderCATL() {
    sections.catl.innerHTML = `
      <div class="section-header">
        <div>
          <p class="eyebrow">CATL Public Architecture</p>
          <h3 class="section-title">CATL 现有公开披露哪些能直接拿，哪些还要拆</h3>
        </div>
        <span class="pill">${state.currentRole === 'auditor' ? '可标注缺口' : '比赛叙事'}</span>
      </div>
      <p class="muted">${data.catlPublicArchitecture.summary}</p>
      ${createTable(['公开披露架构', '判断', '为什么'], data.catlPublicArchitecture.rows)}
    `;
  }

  function renderDev() {
    sections.dev.innerHTML = `
      <div class="section-header">
        <div>
          <p class="eyebrow">Development Notes</p>
          <h3 class="section-title">后续开发怎么接力最省力</h3>
        </div>
        <span class="pill">给同学和 AI agent 的接棒提示</span>
      </div>
      <div class="card-grid">
        <article class="info-card">
          <h4>推荐接力顺序</h4>
          <ul class="bullets">
            ${data.development.steps.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </article>
        <article class="info-card">
          <h4>最关键的文件</h4>
          <ul class="bullets">
            ${data.development.files.map(item => `<li><strong>${item[0]}</strong>：${item[1]}</li>`).join('')}
          </ul>
        </article>
      </div>
      <div class="footer-callout">
        <strong>当前技术路线为什么合理：</strong>
        <p class="muted">
          这版故意先做成零依赖静态前端，不是因为做不出更复杂的，而是为了让任何同学和任何 AI
          agent 拿到仓库以后都能马上打开、马上理解、马上继续改。
        </p>
      </div>
    `;
  }

  // ============ 启动 ============
  document.addEventListener('DOMContentLoaded', init);
  window.CATL_STATE = state;
})();
