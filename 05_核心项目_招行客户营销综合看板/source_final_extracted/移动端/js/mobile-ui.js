(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let toastTimer;
  let activeCustomerRow;

  const industryAdvice = {
    semi: {
      title: "半导体：优先推进设备更新贷与结算归行",
      body: "围绕扩产设备清单、订单增长和回款周期开展核验；对“专精特新”核心企业同步测算设备更新贷、流贷及结算归行组合。",
      estimate: "智芯半导体可提升额度：+2,600 万",
      evidence: ["政策契合 94%", "订单增长 18%", "需核验贸易背景"],
      actionTitle: "生成半导体经营方案",
      actionDescription: "已组合设备更新贷、订单核验与结算归行三项行动。"
    },
    robot: {
      title: "机器人：以票据池和链上结算激活周转",
      body: "重点识别上游精密零部件与工业视觉企业的票据沉淀、回款节奏及供应链位置，优先匹配票据池和科创信用贷。",
      estimate: "鹏城精密可补足周转缺口：+1,800 万",
      evidence: ["链上骨干企业", "政策契合 88%", "票据沉淀待激活"],
      actionTitle: "生成机器人经营方案",
      actionDescription: "已组合票据池测算、供应链结算与两日内跟进任务。"
    },
    nev: {
      title: "新能源车：围绕链主订单配置供应链融资",
      body: "关注核心零部件企业的应收账款、链主订单和结算归行比例，优先以真实贸易闭环匹配供应链融资与资金归集。",
      estimate: "深能储科可提升额度：+3,100 万",
      evidence: ["政策契合 91%", "结算 5.18 亿", "链主订单待验证"],
      actionTitle: "生成新能源车经营方案",
      actionDescription: "已组合供应链融资、订单回款监测与结算归行任务。"
    },
    bio: {
      title: "生物医药：依研发里程碑匹配分段融资",
      body: "围绕注册申报、临床推进、补贴到账和知识产权价值建立融资节奏，优先匹配研发信用贷、IP 质押与资金监测。",
      estimate: "海源生物可补足研发资金：+1,400 万",
      evidence: ["政策契合 96%", "研发节点清晰", "关注审批进展"],
      actionTitle: "生成生物医药经营方案",
      actionDescription: "已组合研发节点核验、IP 质押与结算提升任务。"
    },
    low: {
      title: "低空经济：从适航订单与资质切入成长融资",
      body: "优先覆盖具备适航认证、试点订单或政府采购线索的企业，核验交付节点后匹配科创成长贷和项目结算方案。",
      estimate: "云岭低空可提升额度：+2,100 万",
      evidence: ["政策契合 97%", "景气 +6.7", "适航订单待核验"],
      actionTitle: "生成低空经济经营方案",
      actionDescription: "已组合订单核验、政策匹配和科创成长贷任务。"
    }
  };

  function setText(selector, value) {
    const node = $(selector);
    if (node && value !== undefined && value !== null && value !== "") node.textContent = value;
  }

  function setEvidence(items) {
    const node = $("[data-ai-evidence]");
    if (node && items?.length) node.innerHTML = items.map((item) => `<span>${item}</span>`).join("");
  }

  function applyIndustryAdvice(industry) {
    const advice = industryAdvice[industry];
    if (!advice) return;
    setText("[data-ai-title]", advice.title);
    setText("[data-ai-body]", advice.body);
    setText("[data-ai-estimate]", advice.estimate);
    setEvidence(advice.evidence);
    const action = $("[data-ai-action]");
    if (action) {
      action.dataset.sheetTitle = advice.actionTitle;
      action.dataset.sheetDescription = advice.actionDescription;
    }
  }

  function applyIndustrySnapshot(chip) {
    if (!$("[data-industry-snapshot]") || !chip) return;
    setText("[data-industry-name]", chip.dataset.industryName);
    setText("[data-industry-score]", chip.dataset.industryScore);
    setText("[data-industry-change]", chip.dataset.industryChange);
    setText("[data-industry-firms]", chip.dataset.industryFirms);
    setText("[data-industry-demand]", chip.dataset.industryDemand);
    const change = $("[data-industry-change]");
    if (change) change.classList.toggle("down", (chip.dataset.industryChange || "").trim().startsWith("-"));
  }

  function showToast(message) {
    let toast = $(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function showActionSheet({ title, description, confirmText = "加入行动清单", completionMessage = "已加入行动清单，可在待办页继续跟进", href = "" }) {
    const app = $(".mobile-app");
    if (!app) return;
    app.querySelector(".sheet-mask")?.remove();
    app.querySelector(".action-sheet")?.remove();
    const mask = document.createElement("div");
    mask.className = "sheet-mask";
    const sheet = document.createElement("section");
    sheet.className = "action-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.innerHTML = `<div class="sheet-grip"></div><span class="sheet-kicker">经营行动</span><h2>${title}</h2><p>${description}</p><div class="sheet-actions"><button class="sheet-cancel" type="button">暂不处理</button><button class="sheet-confirm" type="button">${confirmText}</button></div>`;
    const close = () => {
      mask.classList.remove("show");
      sheet.classList.remove("show");
      setTimeout(() => { mask.remove(); sheet.remove(); }, 220);
    };
    mask.addEventListener("click", close);
    $(".sheet-cancel", sheet).addEventListener("click", close);
    $(".sheet-confirm", sheet).addEventListener("click", () => {
      close();
      if (href) {
        setTimeout(() => { window.location.href = href; }, 180);
      } else {
        showToast(completionMessage);
      }
    });
    app.append(mask, sheet);
    requestAnimationFrame(() => { mask.classList.add("show"); sheet.classList.add("show"); });
  }

  function showCustomerPortrait(row) {
    if (!row?.dataset.customerId) return;
    const app = $(".mobile-app");
    if (!app) return;
    app.querySelector(".sheet-mask")?.remove();
    app.querySelector(".action-sheet")?.remove();
    const mask = document.createElement("div");
    mask.className = "sheet-mask";
    const sheet = document.createElement("section");
    sheet.className = "action-sheet portrait-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    const nextAction = row.dataset.nextAction || row.querySelector("p")?.textContent || "结合客户画像确认下一步拜访安排";
    sheet.innerHTML = `<div class="sheet-grip"></div><span class="sheet-kicker">客户 360° 画像</span><h2>${row.dataset.customer}</h2><p class="portrait-meta">${row.dataset.meta || "客户信息待补充"}</p><div class="portrait-grid"><div><span>经营机会分</span><b>${row.dataset.score || "--"}</b></div><div><span>预测授信区间</span><b>${row.dataset.credit || "--"}</b></div><div><span>政策契合度</span><b>${row.dataset.policy || "--"}</b></div><div><span>年度结算量</span><b>${row.dataset.settlement || "--"}</b></div><div><span>关联客户</span><b>${row.dataset.related || "--"}</b></div><div><span>产业链位置</span><b>${(row.dataset.meta || "--").split("·")[1]?.trim() || "--"}</b></div></div><p class="portrait-next"><b>建议下一步：</b>${nextAction}</p><div class="sheet-actions"><button class="sheet-cancel" type="button">返回客户池</button><button class="sheet-confirm" type="button">创建跟进任务</button></div>`;
    const close = () => {
      mask.classList.remove("show");
      sheet.classList.remove("show");
      setTimeout(() => { mask.remove(); sheet.remove(); }, 220);
    };
    mask.addEventListener("click", close);
    $(".sheet-cancel", sheet).addEventListener("click", close);
    $(".sheet-confirm", sheet).addEventListener("click", () => {
      close();
      showToast(`已为${row.dataset.customer}创建跟进任务`);
    });
    app.append(mask, sheet);
    if (window.lucide) window.lucide.createIcons();
    requestAnimationFrame(() => { mask.classList.add("show"); sheet.classList.add("show"); });
  }

  $$('[data-toast]').forEach((button) => button.addEventListener("click", () => showToast(button.dataset.toast)));

  $$('[data-sheet-title]').forEach((button) => {
    button.addEventListener("click", () => showActionSheet({
      title: button.dataset.sheetTitle,
      description: button.dataset.sheetDescription || "该功能详情将在此展开。",
      confirmText: button.dataset.sheetConfirm || "我知道了",
      completionMessage: button.dataset.sheetComplete || "已查看详情",
      href: button.dataset.sheetHref || ""
    }));
  });

  activeCustomerRow = $(".customer-row.selected");
  $$('[data-customer-portrait]').forEach((button) => {
    button.addEventListener("click", () => {
      const current = activeCustomerRow || $(".customer-row.selected");
      if (current) showCustomerPortrait(current);
      else showToast("请先从重点客户池选择一户客户");
    });
  });

  $$(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.parentElement.querySelectorAll(".filter-chip").forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
      const industry = chip.dataset.industry;
      const customerList = $("[data-customer-list]");
      if (industry && industry !== "all") {
        applyIndustryAdvice(industry);
        applyIndustrySnapshot(chip);
      }
      if (!customerList || !industry) {
        showToast(`已切换至「${chip.dataset.label || chip.textContent.trim()}」视图`);
        return;
      }
      const rows = $$(".customer-row[data-industry]", customerList);
      const matched = rows.filter((row) => {
        const visible = industry === "all" || row.dataset.industry === industry;
        row.hidden = !visible;
        return visible;
      });
      const empty = $("[data-customer-empty]");
      const insightLink = $("[data-insight-link]");
      if (insightLink && industry !== "all") insightLink.href = `../insights/index.html?industry=${industry}`;
      if (empty) empty.hidden = matched.length > 0;
      if (matched[0]) matched[0].click();
      if (!matched.length) showToast(`「${chip.dataset.label || chip.textContent.trim()}」暂未配置重点客户`);
    });
  });

  $$(".branch-pin").forEach((pin) => {
    pin.addEventListener("click", () => {
      $$(".branch-pin").forEach((item) => item.classList.remove("active"));
      pin.classList.add("active");
      const name = pin.dataset.branch || "目标网点";
      setText("[data-branch-title]", name);
      setText("[data-region-title]", pin.dataset.region);
      setText("[data-branch-rate]", pin.dataset.rate);
      setText("[data-branch-industries]", pin.dataset.industries);
      setText("[data-branch-prospect-desc]", pin.dataset.count ? `${pin.dataset.count} 家企业符合本月拓客方向` : "");
      setText("[data-branch-path-desc]", pin.dataset.paths ? `已生成 ${pin.dataset.paths} 条链式拓客路径` : "");
      setText("[data-branch-customers]", pin.dataset.customers);
      setText("[data-branch-score]", pin.dataset.score);
      setText("[data-branch-demand]", pin.dataset.demand);
      const mapLabel = $("[data-map-label]");
      if (mapLabel && pin.dataset.count) mapLabel.innerHTML = `服务半径 <b>5 km</b> · 共 <b>${pin.dataset.count}</b> 家高潜企业`;
      showToast(`已定位 ${name}，辖区数据已同步`);
    });
  });

  $$(".customer-row").forEach((row) => {
    row.addEventListener("click", (event) => {
      $$(".customer-row").forEach((item) => item.classList.remove("selected"));
      row.classList.add("selected");
      activeCustomerRow = row;
      const industryChip = $$(".filter-chip").find((chip) => chip.dataset.industry === row.dataset.industry);
      if (industryChip) {
        industryChip.parentElement.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("active", chip === industryChip));
        applyIndustrySnapshot(industryChip);
        const insightLink = $("[data-insight-link]");
        if (insightLink) insightLink.href = `../insights/index.html?industry=${row.dataset.industry}`;
      }
      setText("[data-customer-name]", row.dataset.customer);
      setText("[data-customer-meta]", row.dataset.meta);
      setText("[data-customer-score]", row.dataset.score);
      setText("[data-customer-settlement]", row.dataset.settlement);
      setText("[data-customer-related]", row.dataset.related);
      setText("[data-customer-credit]", row.dataset.credit);
      setText("[data-customer-policy]", row.dataset.policy);
      setText("[data-ai-title]", row.dataset.aiTitle);
      setText("[data-ai-body]", row.dataset.aiBody);
      setText("[data-ai-estimate]", row.dataset.aiEstimate);
      if (row.dataset.aiEvidence) setEvidence(row.dataset.aiEvidence.split("|"));
      const action = $("[data-ai-action]");
      if (action) {
        action.dataset.sheetTitle = row.dataset.aiActionTitle || `生成${row.dataset.customer || "客户"}经营方案`;
        action.dataset.sheetDescription = row.dataset.aiActionDescription || "将基于客户画像创建可执行的客户经营动作。";
      }
      showToast(`已聚焦 ${row.dataset.customer || "目标客户"}`);
      if (event.isTrusted && row.dataset.customerId) showCustomerPortrait(row);
    });
  });

  $$('[data-branch-prospects]').forEach((button) => button.addEventListener("click", () => {
    const branch = $("[data-branch-title]")?.textContent || "当前网点";
    const description = $("[data-branch-prospect-desc]")?.textContent || "已识别优先拓客企业";
    showActionSheet({ title: `${branch} · 优先企业`, description: `${description}。系统将按产业契合度、企业规模和可触达性生成拜访顺序。` });
  }));

  $$('[data-branch-paths]').forEach((button) => button.addEventListener("click", () => {
    const branch = $("[data-branch-title]")?.textContent || "当前网点";
    const description = $("[data-branch-path-desc]")?.textContent || "已生成产业链拓客路径";
    showActionSheet({ title: `${branch} · 链式拓客`, description: `${description}。可从链主企业、上下游合作方或园区服务机构选择切入路径。`, confirmText: "创建拓客任务" });
  }));

  $$('[data-advisor-action]').forEach((button) => button.addEventListener("click", () => showActionSheet({
    title: button.dataset.advisorAction,
    description: "系统将按当前产业、辖区和客户信号生成待办清单，生成后请由客户经理核验信息并调整优先级。",
    confirmText: "生成行动清单",
    href: "../tasks/index.html"
  })));

  const selectIndustryAdvisor = (industry) => {
    const tabs = $$('[data-industry-advisor]');
    const panels = $$('[data-industry-panel]');
    const selected = tabs.find((tab) => tab.dataset.industryAdvisor === industry) || tabs[0];
    if (!selected) return;
    tabs.forEach((tab) => {
      const active = tab === selected;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.industryPanel !== selected.dataset.industryAdvisor; });
  };
  $$('[data-industry-advisor]').forEach((tab) => tab.addEventListener("click", () => selectIndustryAdvisor(tab.dataset.industryAdvisor)));
  if ($$('[data-industry-advisor]').length) selectIndustryAdvisor(new URLSearchParams(window.location.search).get("industry"));

  $$('[data-ai-action]').forEach((button) => button.addEventListener("click", () => showActionSheet({
    title: button.dataset.sheetTitle || "生成经营方案",
    description: button.dataset.sheetDescription || "将基于当前客户画像创建经营动作。",
    confirmText: "加入行动清单"
  })));

  $$(".check-action, .task-card").forEach((task) => task.addEventListener("click", () => {
    task.classList.toggle("done");
    showToast(task.classList.contains("done") ? "已标记完成，经营进度已更新" : "已恢复为待办任务");
  }));

  $$(".task-tab").forEach((tab) => tab.addEventListener("click", () => {
    tab.parentElement.querySelectorAll(".task-tab").forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    const filter = tab.dataset.filter || "all";
    $$('[data-task-scope]').forEach((block) => { block.hidden = filter !== "all" && block.dataset.taskScope !== filter; });
    showToast(`已切换至「${tab.textContent.trim()}」任务`);
  }));

  $$('[data-search-panel]').forEach((panel) => {
    const input = $("input", panel);
    const results = $('[data-search-results]', panel);
    const items = $$('[data-search-item]', panel);
    const submit = $(".search-submit", panel);
    if (!input || !results) return;
    const runSearch = () => {
      const query = input.value.trim().toLowerCase();
      const matches = items.filter((item) => {
        const haystack = `${item.dataset.searchText || ""} ${item.dataset.searchValue || ""}`.toLowerCase();
        const visible = !query || haystack.includes(query);
        item.hidden = !visible;
        return visible;
      });
      results.hidden = matches.length === 0;
      if (query && !matches.length) showToast(`未找到「${input.value.trim()}」，可尝试网点或企业简称`);
    };
    input.addEventListener("focus", runSearch);
    input.addEventListener("input", runSearch);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") { event.preventDefault(); runSearch(); }
      if (event.key === "Escape") results.hidden = true;
    });
    submit?.addEventListener("click", runSearch);
    items.forEach((item) => item.addEventListener("click", () => {
      const value = item.dataset.searchValue || item.textContent.trim();
      input.value = value;
      results.hidden = true;
      const branch = $$(".branch-pin").find((pin) => pin.dataset.branch === value);
      const customer = $$(".customer-row").find((row) => row.dataset.customer === value);
      if (branch) branch.click();
      if (customer) {
        const filter = $$(".filter-chip").find((chip) => chip.dataset.industry === customer.dataset.industry);
        if (filter) filter.click();
        customer.click();
      }
      if (!branch && !customer) showToast(`已定位「${value}」`);
    }));
    document.addEventListener("click", (event) => { if (!panel.contains(event.target)) results.hidden = true; });
  });

  const requestedCustomer = new URLSearchParams(window.location.search).get("customer");
  if (requestedCustomer) {
    const target = $$(".customer-row").find((row) => row.dataset.customerId === requestedCustomer);
    if (target) {
      const filter = $$(".filter-chip").find((chip) => chip.dataset.industry === target.dataset.industry);
      if (filter) filter.click();
      target.click();
    }
  }

  if (window.lucide) window.lucide.createIcons();
})();
