function tabIdOf(node) {
  if (!node) return '';
  if (node.readme) return 'help';
  if (node.virtualParent) return 'zip:' + node.path;
  return 'file:' + node.path;
}

function findTabById(id) {
  for (var i = 0; i < S.tabs.length; i++) if (S.tabs[i].id === id) return S.tabs[i];
  return null;
}

function focusTabById(id) {
  var tabs = els.tabstrip ? $$('.tab', els.tabstrip) : [];
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].getAttribute('data-tab-id') === id) { tabs[i].focus(); return; }
  }
}

function ensureTab(node) {
  var id = tabIdOf(node);
  var tab = findTabById(id);
  if (!tab) {
    tab = { id: id, node: node, scrollTop: 0, zipCache: node.virtualParent ? S.zipCache : null };
    S.tabs.push(tab);
  } else {
    if (node && tab.node !== node) tab.node = node;
    if (node.virtualParent && S.zipCache) tab.zipCache = S.zipCache;
  }
  return tab;
}

function tabLabel(tab) {
  var node = tab && tab.node;
  if (!node) return '文件';
  return node.name || basename(node.path) || '文件';
}

function tabTitle(tab) {
  var node = tab && tab.node;
  if (!node) return '';
  if (node.readme) return '使用说明';
  return node.path || node.name || '';
}

function saveActiveTabScroll() {
  if (S.activeTab) S.activeTab.scrollTop = els.scroll.scrollTop || 0;
}

function scrollActiveTabIntoView() {
  var strip = els.tabstrip;
  if (!strip) return;
  var active = $('.tab.active', strip);
  if (!active) return;
  var left = active.offsetLeft;
  var right = left + active.offsetWidth;
  if (left < strip.scrollLeft) strip.scrollLeft = left;
  else if (right > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = right - strip.clientWidth;
}

function renderTabBar() {
  if (!els.tabbar || !els.tabstrip) return;
  els.tabstrip.innerHTML = '';
  if (!S.tabs.length) {
    els.tabbar.hidden = true;
    return;
  }
  els.tabbar.hidden = false;
  S.tabs.forEach(function (tab) {
    var node = tab.node;
    var kind = kindOf(node.name);
    var el = document.createElement('div');
    el.className = 'tab' + (tab === S.activeTab ? ' active' : '');
    el.setAttribute('data-tab-id', tab.id);
    el.setAttribute('role', 'tab');
    el.setAttribute('aria-selected', tab === S.activeTab ? 'true' : 'false');
    el.tabIndex = tab === S.activeTab ? 0 : -1;
    el.title = tabTitle(tab);
    el.innerHTML = '<span class="tab-icon tree-icon file ' + kindClass(kind) + '">' + icon(kindIcon(kind)) + '</span>' +
      '<span class="tab-name">' + esc(tabLabel(tab)) + '</span>' +
      '<button class="tab-close" type="button" title="关闭" aria-label="关闭 ' + attr(tabLabel(tab)) + '">' + icon('x') + '</button>';
    els.tabstrip.appendChild(el);
  });
  scrollActiveTabIntoView();
}

function canSwitchTab(targetTab, opts) {
  if (!S.editMode || !S.editDirty || !S.current) return true;
  if (opts && opts.force) return true;
  if (targetTab && targetTab.node === S.current) return true;
  return window.confirm('当前文件有未保存的修改，切换标签会丢失。继续吗？');
}

function activateTab(tab, opts) {
  opts = opts || {};
  if (!tab) return Promise.resolve(false);
  if (S.activeTab === tab && !opts.force && !opts.keepState) {
    scrollActiveTabIntoView();
    return Promise.resolve(true);
  }
  if (S.activeTab && S.activeTab !== tab) {
    if (!canSwitchTab(tab, opts)) return Promise.resolve(false);
    saveActiveTabScroll();
  }
  S.activeTab = tab;
  renderTabBar();
  if (tab.node.virtualParent && tab.zipCache) S.zipCache = tab.zipCache;
  var scroll = tab.scrollTop || 0;
  return Promise.resolve(loadFileIntoView(tab.node, opts)).then(function () {
    if (S.activeTab === tab) {
      if (!opts.anchor) els.scroll.scrollTop = scroll;
      updateActiveRow(tab.node.virtualParent ? null : tab.node.path);
      scrollActiveTabIntoView();
    }
    return true;
  });
}

function activateTabById(id, opts) {
  return activateTab(findTabById(id), opts);
}

function openFile(node, opts) {
  opts = opts || {};
  if (!node) return Promise.resolve(false);
  if (node.readme) {
    if (S.editMode && S.editDirty && !opts.force && !window.confirm('当前文件有未保存的修改，仍要打开说明吗？')) return Promise.resolve(false);
    S.activeTab = null;
    renderTabBar();
    return Promise.resolve(loadFileIntoView(node, opts));
  }
  return activateTab(ensureTab(node), opts);
}

function closeTab(tab, opts) {
  opts = opts || {};
  if (!tab) return false;
  if (tab === S.activeTab && S.editMode && S.editDirty && !opts.force) {
    if (!window.confirm('当前文件有未保存的修改，关闭后会丢失。继续吗？')) return false;
  }
  var index = S.tabs.indexOf(tab);
  if (index < 0) return false;
  var wasActive = tab === S.activeTab;
  S.tabs.splice(index, 1);
  if (!wasActive) {
    renderTabBar();
    return true;
  }
  S.openToken++;
  S.activeTab = null;
  S.editMode = false;
  S.editDirty = false;
  S.editOriginal = '';
  S.editText = '';
  S.editSaving = false;
  if (S.tabs.length) {
    activateTab(S.tabs[Math.min(index, S.tabs.length - 1)], {});
  } else {
    renderTabBar();
    showWelcome(S.rootName ? '已关闭全部文件，可从左侧重新打开' : '');
    updateQuery('');
  }
  return true;
}

function closeTabById(id, opts) {
  return closeTab(findTabById(id), opts);
}
