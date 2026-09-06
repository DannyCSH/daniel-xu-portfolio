(function () {
  const data = window.CATL_DEMO_DATA;

  const sections = {
    overview: document.getElementById("view-overview"),
    eu: document.getElementById("view-eu"),
    cbam: document.getElementById("view-cbam"),
    layers: document.getElementById("view-layers"),
    catl: document.getElementById("view-catl"),
    dev: document.getElementById("view-dev"),
  };

  function createNav() {
    const nav = document.getElementById("nav-list");
    data.nav.forEach((item, index) => {
      const button = document.createElement("button");
      button.className = "nav-button" + (index === 0 ? " active" : "");
      button.dataset.target = item.id;
      button.innerHTML = `
        <span class="nav-label">${item.label}</span>
        <span class="nav-desc">${item.desc}</span>
      `;
      button.addEventListener("click", () => switchView(item.id, button));
      nav.appendChild(button);
    });
  }

  function switchView(id, button) {
    Object.values(sections).forEach((section) => section.classList.add("hidden"));
    sections[id].classList.remove("hidden");

    document.querySelectorAll(".nav-button").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
  }

  function fillHero() {
    document.getElementById("core-message").textContent = data.meta.coreMessage;
    document.getElementById("product-title").textContent = data.product.name;
    document.getElementById("product-subtitle").textContent =
      `${data.product.modelCode} | ${data.product.plantCode} | ${data.product.reportingPeriod}`;

    const stats = [
      ["化学体系", data.product.chemistry],
      ["额定容量", data.product.capacity],
      ["碳足迹强度", data.product.carbonIntensity],
      ["EU 输出完备度", data.product.euReadiness],
      ["CBAM 完备度", data.product.cbamReadiness],
    ];

    const container = document.getElementById("hero-stats");
    stats.forEach(([label, value]) => {
      const card = document.createElement("div");
      card.className = "stat-card";
      card.innerHTML = `
        <span class="stat-label">${label}</span>
        <span class="stat-value">${value}</span>
      `;
      container.appendChild(card);
    });
  }

  function renderOverview() {
    const section = sections.overview;
    section.innerHTML = `
      <div class="section-header">
        <div>
          <p class="eyebrow">Overview</p>
          <h3 class="section-title">这套 Demo 到底在解决什么</h3>
        </div>
        <span class="pill">适合先讲给同学和老师听</span>
      </div>
      <p class="muted">${data.overview.intro}</p>
      <div class="card-grid">
        ${data.overview.highlights
          .map(
            (item) => `
              <article class="info-card">
                <h4>${item.title}</h4>
                <p>${item.text}</p>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="footer-callout">
        <strong>现在这套结构的主线：</strong>
        <ul class="bullets">
          ${data.overview.coreSteps.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  function createTable(headers, rows) {
    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows
              .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
              .join("")}
          </tbody>
        </table>
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
        <span class="pill">不是官方真实报送，只是可讲的结构样板</span>
      </div>
      <p class="muted">${data.euOutput.summary}</p>
      ${createTable(["模块", "输出字段", "当前值", "怎么看"], data.euOutput.rows)}
    `;
  }

  function renderCBAM() {
    sections.cbam.innerHTML = `
      <div class="section-header">
        <div>
          <p class="eyebrow">CBAM-Compatible</p>
          <h3 class="section-title">上游材料 CBAM 风格兼容输出</h3>
        </div>
        <span class="pill">重点是兼容，不是误说“电池已直接纳入 CBAM”</span>
      </div>
      <p class="muted">${data.cbamOutput.summary}</p>
      ${createTable(["模块", "输出字段", "当前值", "怎么看"], data.cbamOutput.rows)}
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
        ${data.layers
          .map(
            (layer) => `
              <article class="layer-card">
                <h4>${layer.title}</h4>
                <p>${layer.subtitle}</p>
                <ul class="bullets">
                  ${layer.bullets.map((item) => `<li>${item}</li>`).join("")}
                </ul>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderCATL() {
    sections.catl.innerHTML = `
      <div class="section-header">
        <div>
          <p class="eyebrow">CATL Public Architecture</p>
          <h3 class="section-title">CATL 现有公开披露哪些能直接拿，哪些还要拆</h3>
        </div>
        <span class="pill">这是比赛里最容易讲出“不是从零开始”的地方</span>
      </div>
      <p class="muted">${data.catlPublicArchitecture.summary}</p>
      ${createTable(["公开披露架构", "判断", "为什么"], data.catlPublicArchitecture.rows)}
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
            ${data.development.steps.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </article>
        <article class="info-card">
          <h4>最关键的文件</h4>
          <ul class="bullets">
            ${data.development.files.map((item) => `<li><strong>${item[0]}</strong>：${item[1]}</li>`).join("")}
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

  createNav();
  fillHero();
  renderOverview();
  renderEU();
  renderCBAM();
  renderLayers();
  renderCATL();
  renderDev();
})();
