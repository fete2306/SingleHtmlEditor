var DRAFT_CHAR_LIMIT = 20 * 1024 * 1024;

function tabIdOf(node) {
  if (!node) return '';
  if (node.readme) return 'help';
  if (node.virtualParent) return 'zip:' + node.path;
  return 'file:' + node.path;
}

function tabDirty(tab) {
  if (!tab) return false;
  if (tab === S.activeTab && S.editMode) return editDirtyNow();
  return !!(tab.edit && tab.edit.dirty);
}

function dirtyTabCount() {
  var count = 0;
  S.tabs.forEach(function (tab) { if (tabDirty(tab)) count++; });
  return count;
}

function hasDirtyTabs() {
  return dirtyTabCount() > 0 || !!(S.editMode && S.editDirty && S.activeTab && S.tabs.indexOf(S.activeTab) < 0);
}

function confirmDiscardTabs(action) {
  if (S.editSaving) { toast('正在保存，请稍候…', 1800); return false; }
  var count = dirtyTabCount();
  if (!count) return true;
  return window.confirm('有 ' + count + ' 个标签含未保存的修改，' + action + '会丢失这些草稿。继续吗？');
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

function makeTab(node, preview) {
  return {
    id: tabIdOf(node), node: node, preview: !!preview, scrollTop: 0,
    zipCache: node.virtualParent ? S.zipCache : null, view: null, edit: null
  };
}

function updateTabNode(tab, node) {
  tab.id = tabIdOf(node);
  tab.node = node;
  tab.zipCache = node.virtualParent ? S.zipCache : null;
}

function findPreviewTab() {
  for (var i = 0; i < S.tabs.length; i++) if (S.tabs[i].preview) return S.tabs[i];
  return null;
}

function pinTab(tab) {
  if (!tab || !tab.preview) return false;
  tab.preview = false;
  renderTabBar();
  return true;
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
  var title = node.path || node.name || '';
  if (tab.preview) title = '预览 · ' + title;
  return tabDirty(tab) ? '未保存 · ' + title : title;
}

function saveActiveTabScroll() {
  if (S.activeTab) S.activeTab.scrollTop = els.scroll.scrollTop || 0;
}

function saveActiveTabState() {
  saveActiveTabScroll();
  var tab = S.activeTab;
  if (!tab) return true;
  tab.view = { sourceMode: !!S.sourceMode, wrap: !!S.wrap, encoding: S.encoding || 'auto' };
  if (!S.editMode) { tab.edit = null; return true; }
  var dirty = editDirtyNow();
  S.editDirty = dirty;
  var ta = $('.text-editor', els.content);
  var selStart = 0, selEnd = 0, editorTop = 0, editorLeft = 0;
  if (ta) {
    try {
      selStart = ta.selectionStart || 0;
      selEnd = ta.selectionEnd == null ? selStart : ta.selectionEnd;
      editorTop = ta.scrollTop || 0;
      editorLeft = ta.scrollLeft || 0;
    } catch (e) {}
  }
  if (dirty) {
    var used = 0;
    S.tabs.forEach(function (other) {
      if (other !== tab && other.edit && other.edit.dirty && other.edit.text) used += other.edit.text.length;
    });
    if (used + S.editText.length > DRAFT_CHAR_LIMIT) {
      toast('未保存草稿总长度超过 20M 字符，请先保存或取消部分标签的修改', 3800);
      return false;
    }
  }
  tab.edit = {
    dirty: dirty,
    text: dirty ? S.editText : null,
    original: dirty ? S.editOriginal : null,
    decodedEncoding: S.decodedEncoding || '',
    selStart: selStart,
    selEnd: selEnd,
    scrollTop: editorTop,
    scrollLeft: editorLeft
  };
  return true;
}

function updateActiveTabDirty() {
  if (!els.tabstrip || !S.activeTab) return;
  var tabs = $$('.tab', els.tabstrip);
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].getAttribute('data-tab-id') === S.activeTab.id) {
      tabs[i].classList.toggle('dirty', tabDirty(S.activeTab));
      tabs[i].title = tabTitle(S.activeTab);
      return;
    }
  }
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
    el.className = 'tab' + (tab === S.activeTab ? ' active' : '') + (tab.preview ? ' preview' : '') + (tabDirty(tab) ? ' dirty' : '');
    el.setAttribute('data-tab-id', tab.id);
    el.setAttribute('role', 'tab');
    el.setAttribute('aria-selected', tab === S.activeTab ? 'true' : 'false');
    el.tabIndex = tab === S.activeTab ? 0 : -1;
    el.title = tabTitle(tab);
    el.innerHTML = '<span class="tab-icon tree-icon file ' + kindClass(kind) + '">' + icon(kindIcon(kind)) + '</span>' +
      '<span class="tab-name">' + esc(tabLabel(tab)) + '</span>' +
      '<span class="tab-dirty" aria-hidden="true"></span>' +
      '<button class="tab-close" type="button" title="关闭" aria-label="关闭 ' + attr(tabLabel(tab)) + '">' + icon('x') + '</button>';
    els.tabstrip.appendChild(el);
  });
  scrollActiveTabIntoView();
}

function activateTab(tab, opts) {
  opts = opts || {};
  if (!tab) return Promise.resolve(false);
  if (S.editSaving && S.activeTab !== tab) {
    toast('正在保存，请稍候…', 1800);
    return Promise.resolve(false);
  }
  if (S.activeTab === tab && !opts.force && !opts.keepState) {
    scrollActiveTabIntoView();
    return Promise.resolve(true);
  }
  if (S.activeTab && S.activeTab !== tab && !opts.stateSaved) {
    if (!saveActiveTabState()) return Promise.resolve(false);
  }
  S.activeTab = tab;
  renderTabBar();
  if (tab.node.virtualParent && tab.zipCache) S.zipCache = tab.zipCache;
  var scroll = tab.scrollTop || 0;
  var nextOpts = {};
  for (var key in opts) if (Object.prototype.hasOwnProperty.call(opts, key)) nextOpts[key] = opts[key];
  nextOpts.tab = tab;
  return Promise.resolve(loadFileIntoView(tab.node, nextOpts)).then(function () {
    if (S.activeTab === tab) {
      if (!nextOpts.anchor) els.scroll.scrollTop = scroll;
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
  if (S.editSaving) { toast('正在保存，请稍候…', 1800); return Promise.resolve(false); }
  if (node.readme) {
    if (S.activeTab && !saveActiveTabState()) return Promise.resolve(false);
    S.activeTab = null;
    renderTabBar();
    return Promise.resolve(loadFileIntoView(node, opts));
  }
  var existing = findTabById(tabIdOf(node));
  if (existing) {
    if (opts.pinned) pinTab(existing);
    if (existing.node !== node) updateTabNode(existing, node);
    else if (node.virtualParent && S.zipCache) existing.zipCache = S.zipCache;
    return activateTab(existing, opts);
  }
  var pinned = !!opts.pinned;
  var previewTab = pinned ? null : findPreviewTab();
  if (previewTab) {
    var wasActive = previewTab === S.activeTab;
    if (!wasActive) {
      if (!saveActiveTabState()) return Promise.resolve(false);
      opts.stateSaved = true;
    }
    updateTabNode(previewTab, node);
    previewTab.preview = true;
    previewTab.scrollTop = 0;
    previewTab.view = null;
    previewTab.edit = null;
    if (wasActive) opts.force = true;
    return activateTab(previewTab, opts);
  }
  var tab = makeTab(node, !pinned);
  if (!pinned) {
    S.tabs.push(tab);
  } else {
    var at = -1;
    for (var i = 0; i < S.tabs.length; i++) if (S.tabs[i].preview) { at = i; break; }
    if (at >= 0) S.tabs.splice(at, 0, tab); else S.tabs.push(tab);
  }
  return activateTab(tab, opts);
}

function closeTab(tab, opts) {
  opts = opts || {};
  if (!tab) return false;
  if (S.editSaving && tab === S.activeTab) {
    toast('正在保存，请稍候…', 1800);
    return false;
  }
  if (tabDirty(tab) && !opts.force) {
    if (!window.confirm('标签“' + tabLabel(tab) + '”有未保存的修改，关闭后会丢失。继续吗？')) return false;
  }
  var index = S.tabs.indexOf(tab);
  if (index < 0) return false;
  var wasActive = tab === S.activeTab;
  S.tabs.splice(index, 1);
  tab.edit = null;
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
