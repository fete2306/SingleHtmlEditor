function toggleSource() {
  if (!S.current || S.editMode || !hasSource(S.currentKind)) return;
  S.sourceMode = !S.sourceMode;
  els.btnSource.classList.toggle('active', S.sourceMode);
  reopenCurrent();
}

function fuzzyScore(query, text) {
  if (!query) return { score: 0, positions: [] };
  var s = String(text || '').toLowerCase();
  var positions = [], ti = 0, score = 0, streak = 0, prev = -2;
  for (var qi = 0; qi < query.length; qi++) {
    var ch = query.charAt(qi);
    if (ch === ' ') continue;
    var idx = s.indexOf(ch, ti);
    if (idx < 0) return null;
    if (idx === prev + 1) {
      streak++;
      score += 8 + streak * 3;
    } else {
      streak = 0;
      score += 2;
      var before = idx === 0 ? '' : s.charAt(idx - 1);
      if (idx === 0 || before === '-' || before === '/' || before === '.' || before === ' ' || before === '_') score += 6;
      score -= Math.min(10, idx - ti);
    }
    positions.push(idx);
    prev = idx;
    ti = idx + 1;
  }
  score -= Math.floor(String(text || '').length / 20);
  return { score: score, positions: positions };
}

function highlightText(text, positions) {
  if (!positions || !positions.length) return esc(text);
  var set = new Set(positions), out = '', open = false;
  for (var i = 0; i < text.length; i++) {
    var hit = set.has(i);
    if (hit && !open) { out += '<mark>'; open = true; }
    else if (!hit && open) { out += '</mark>'; open = false; }
    out += esc(text.charAt(i));
  }
  if (open) out += '</mark>';
  return out;
}

function openPalette() {
  if (!S.files.length) { toast('当前没有可打开的文件'); return; }
  S.paletteOpen = true;
  els.palette.classList.add('show');
  els.paletteInput.value = '';
  S.paletteIndex = 0;
  renderPalette();
  setTimeout(function () { els.paletteInput.focus(); }, 10);
}
function closePalette() {
  S.paletteOpen = false;
  els.palette.classList.remove('show');
}
function setPaletteActive(index) {
  var rows = $$('.palette-item', els.paletteList);
  if (!rows.length) return;
  var n = rows.length;
  S.paletteIndex = ((index % n) + n) % n;
  rows.forEach(function (row, i) { row.classList.toggle('active', i === S.paletteIndex); });
  var list = els.paletteList.getBoundingClientRect();
  var row = rows[S.paletteIndex].getBoundingClientRect();
  if (row.top < list.top) els.paletteList.scrollTop -= list.top - row.top;
  else if (row.bottom > list.bottom) els.paletteList.scrollTop += row.bottom - list.bottom;
}
function renderPalette() {
  var query = els.paletteInput.value.trim().toLowerCase();
  var results = [];
  S.files.forEach(function (node) {
    if (!query) {
      results.push({ node: node, score: 0, basePositions: null, pathPositions: null, byPath: false });
      return;
    }
    var base = fuzzyScore(query, node.name);
    if (base) {
      results.push({ node: node, score: base.score + 1000, basePositions: base.positions, pathPositions: null, byPath: false });
      return;
    }
    var path = fuzzyScore(query, node.path);
    if (path) results.push({ node: node, score: path.score, basePositions: null, pathPositions: path.positions, byPath: true });
  });
  results.sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return collator.compare(a.node.path, b.node.path);
  });
  S.paletteMatches = results.slice(0, 100);
  S.paletteIndex = 0;
  els.paletteList.innerHTML = '';
  if (!S.paletteMatches.length) {
    var empty = document.createElement('div');
    empty.className = 'palette-empty';
    empty.textContent = '没有匹配的文件';
    els.paletteList.appendChild(empty);
    return;
  }
  S.paletteMatches.forEach(function (match, index) {
    var node = match.node;
    var row = document.createElement('div');
    row.className = 'palette-item' + (index === 0 ? ' active' : '');
    row.dataset.index = String(index);
    var nameHtml;
    if (match.byPath) {
      nameHtml = '<span class="palette-main"><span class="palette-path">' + highlightText(node.path, match.pathPositions) + '</span></span>';
    } else {
      nameHtml = '<span class="palette-main"><span class="palette-name">' + (match.basePositions ? highlightText(node.name, match.basePositions) : esc(node.name)) + '</span><span class="palette-dir">' + esc(dirname(node.path)) + '</span></span>';
    }
    var k = kindOf(node.name);
    row.innerHTML = '<span class="tree-icon file ' + kindClass(k) + '">' + icon(kindIcon(k)) + '</span>' + nameHtml;
    row.addEventListener('click', function () { choosePaletteItem(index); });
    els.paletteList.appendChild(row);
  });
}
function choosePaletteItem(index, pin) {
  var match = S.paletteMatches[index];
  if (!match) return;
  closePalette();
  revealPath(match.node.path, true);
  openFile(match.node, pin ? { pinned: true } : undefined);
}

function handleScroll() {
  if (S.scrollRaf) return;
  S.scrollRaf = requestAnimationFrame(function () {
    S.scrollRaf = 0;
    if (S.activeTab) S.activeTab.scrollTop = els.scroll.scrollTop || 0;
    var max = els.scroll.scrollHeight - els.scroll.clientHeight;
    if (max > 0) setProgress(Math.min(100, (els.scroll.scrollTop / max) * 100));
    updateOutlineActive();
  });
}

function copyTextForControl(el) {
  var box = el.closest ? (el.closest('.code-block') || el.closest('.ipynb-code')) : null;
  if (box) {
    var pre = box.querySelector('pre');
    if (pre) return pre.textContent;
  }
  var pre = els.content.querySelector('pre.text-view,pre.hex-view,pre.ipynb-input');
  if (pre) return pre.textContent;
  return S.raw || '';
}

function openInNewTab() {
  if (!S.current) return;
  var open = function (url) {
    var a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    document.body.appendChild(a); a.click(); a.remove();
  };
  if (S.currentURL) { open(S.currentURL); return; }
  getBlob(S.current).then(function (blob) {
    var u = URL.createObjectURL(blob);
    open(u);
    setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
  }).catch(function (err) { toast('无法打开：' + (err && err.message ? err.message : err)); });
}

function openVirtualEntry(zip, entry, parent) {
  zipExtract(zip, entry).then(function (u8) {
    var blob = new Blob([u8], { type: mimeOf(entry.name) });
    var vnode = { type: 'file', name: basename(entry.name), path: parent.path + '/' + entry.name, blob: blob, size: u8.length, virtualParent: parent, archiveEntry: entry };
    openFile(vnode, { noHistory: true });
  }).catch(function (err) { toast('无法解压：' + (err && err.message ? err.message : err), 3200); });
}

function handleContentAction(el, event) {
  var act = el.getAttribute('data-act');
  if (act === 'copy-code') {
    event.preventDefault();
    var text = copyTextForControl(el);
    if (text) copyText(text, el); else toast('没有可复制的内容');
    return;
  }
  if (act === 'save-edit') { event.preventDefault(); saveEdit(); return; }
  if (act === 'cancel-edit') { event.preventDefault(); cancelEdit(); return; }
  if (act === 'db-table') { event.preventDefault(); renderDbTable(el.getAttribute('data-name')); return; }
  if (act === 'load-full') {
    event.preventDefault();
    S.fullMode = true;
    reopenCurrent();
    toast('正在加载完整文件…', 1400);
    return;
  }
  if (act === 'html-source') {
    event.preventDefault();
    S.sourceMode = true;
    reopenCurrent();
    return;
  }
  if (act === 'open-new') { event.preventDefault(); openInNewTab(); return; }
  if (act === 'download-entry') { event.preventDefault(); downloadCurrent(); return; }
  if (act === 'back-archive') {
    event.preventDefault();
    if (S.current && S.current.virtualParent) openFile(S.current.virtualParent, { noHistory: true });
  }
}

function handleLocalLink(event, a) {
  var href = a.getAttribute('href') || '';
  if (!href || /^javascript:/i.test(href)) { event.preventDefault(); return; }
  if (href.charAt(0) === '#') {
    event.preventDefault();
    scrollToHeading(decodeSafe(href.slice(1)));
    return;
  }
  if (isExternalURL(href)) return;
  var base = '';
  if (S.current) base = S.current.archiveEntry ? dirname(S.current.archiveEntry.name) : dirname(S.current.path);
  var r = resolveLocal(href, base);
  if (!r) return;
  event.preventDefault();
  if (S.current && S.current.virtualParent && S.zipCache) {
    var ze = zipFind(S.zipCache, r.path);
    if (ze && !ze.dir) { openVirtualEntry(S.zipCache, ze, S.current.virtualParent); return; }
  }
  var node = findFile(r.path);
  if (!node && r.path) node = findFile(decodeSafe(r.path));
  if (node) {
    revealPath(node.path, true);
    openFile(node, { anchor: r.hash ? decodeSafe(r.hash) : '' });
    return;
  }
  if (r.hash && S.current && r.path === S.current.path) { scrollToHeading(decodeSafe(r.hash)); return; }
  toast('未找到链接文件：' + r.path, 3200);
}

function onContentClick(event) {
  var target = event.target;
  if (!target || !target.closest || !els.content.contains(target)) return;
  var tab = target.closest('.sheet-tab');
  if (tab && els.content.contains(tab)) {
    event.preventDefault();
    renderSheet(Number(tab.dataset.sheet));
    return;
  }
  var action = target.closest('[data-act]');
  if (action && els.content.contains(action)) { handleContentAction(action, event); return; }
  var a = target.closest('a[href]');
  if (a && els.content.contains(a)) { handleLocalLink(event, a); return; }
  var img = target.closest('img');
  if (img && els.content.contains(img)) {
    openLightbox(img.currentSrc || img.src, img.alt || '');
  }
}

function readReadmeText() {
  var el = document.getElementById('readme-data');
  return el ? String(el.textContent || '') : '';
}

var RECENT_DB = 'she-recent';
var RECENT_STORE = 'recent-folders';
var RECENT_LIMIT = 5;
var recentDbPromise = null;

function recentDb() {
  if (!recentDbPromise) {
    recentDbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('浏览器不支持 IndexedDB')); return; }
      var req = indexedDB.open(RECENT_DB, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(RECENT_STORE)) db.createObjectStore(RECENT_STORE, { keyPath: 'id', autoIncrement: true });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('无法打开最近记录')); };
      req.onblocked = function () { reject(new Error('最近记录被占用')); };
    });
    recentDbPromise.catch(function () { recentDbPromise = null; });
  }
  return recentDbPromise;
}
function recentRead(db) {
  return new Promise(function (resolve, reject) {
    var tx = db.transaction(RECENT_STORE, 'readonly');
    var req = tx.objectStore(RECENT_STORE).getAll();
    req.onsuccess = function () { resolve(req.result || []); };
    req.onerror = function () { reject(req.error); };
  });
}
function recentWrite(db, records) {
  return new Promise(function (resolve, reject) {
    var tx = db.transaction(RECENT_STORE, 'readwrite');
    var store = tx.objectStore(RECENT_STORE);
    store.clear();
    records.forEach(function (rec) {
      store.put({ name: rec.name, time: rec.time, handle: rec.handle });
    });
    tx.oncomplete = function () { resolve(); };
    tx.onerror = function () { reject(tx.error); };
    tx.onabort = function () { reject(tx.error || new Error('写入最近记录失败')); };
  });
}
function recentRecords() {
  return recentDb().then(recentRead).then(function (records) {
    return (records || []).filter(function (rec) { return rec && rec.handle && rec.handle.kind === 'directory'; })
      .sort(function (a, b) { return (b.time || 0) - (a.time || 0); })
      .slice(0, RECENT_LIMIT);
  }).catch(function () { return []; });
}
function loadRecentFolders() {
  return recentRecords().then(function (list) { S.recentFolders = list; renderRecentPanel(); return list; });
}
function sameFolder(a, b) {
  if (!a || !b) return Promise.resolve(false);
  if (a === b) return Promise.resolve(true);
  if (typeof a.isSameEntry === 'function') {
    return a.isSameEntry(b).catch(function () { return a.name === b.name; });
  }
  return Promise.resolve(a.name === b.name);
}
function rememberFolder(handle) {
  if (!handle || handle.kind !== 'directory') return Promise.resolve(S.recentFolders || []);
  return recentDb().then(function (db) {
    return recentRead(db).then(function (records) {
      var list = (records || []).filter(function (rec) { return rec && rec.handle; });
      var checks = list.map(function (rec) { return sameFolder(rec.handle, handle); });
      return Promise.all(checks).then(function (matches) {
        var sameIds = [];
        matches.forEach(function (same, i) { if (same) sameIds.push(list[i].id); });
        var kept = list.filter(function (rec) { return sameIds.indexOf(rec.id) < 0; });
        var top = { name: handle.name || '文件夹', time: Date.now(), handle: handle };
        if (sameIds.length) top.id = sameIds[0];
        kept.unshift(top);
        kept.sort(function (a, b) { return (b.time || 0) - (a.time || 0); });
        return recentWrite(db, kept.slice(0, RECENT_LIMIT)).then(recentRecords);
      });
    });
  }).then(function (list) {
    S.recentFolders = list;
    renderRecentPanel();
    return list;
  }).catch(function (err) {
    console.warn('无法保存最近文件夹', err);
    return S.recentFolders || [];
  });
}
function recentTimeLabel(ts) {
  var d = new Date(Number(ts) || 0);
  if (!isFinite(d.getTime())) return '';
  var pad = function (n) { return n < 10 ? '0' + n : String(n); };
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
function renderRecentPanel() {
  var panel = document.getElementById('recent-panel');
  if (!panel) return;
  var list = S.recentFolders || [];
  var html = '';
  if (!list.length) {
    html += '<div class="recent-empty">还没有最近打开的文件夹。打开一个目录后，下次启动可从这里快速恢复。</div>';
  } else {
    html += '<div class="recent-list">';
    list.forEach(function (rec, i) {
      html += '<div class="recent-item">' +
        '<span class="recent-icon">' + icon('folder') + '</span>' +
        '<span class="recent-main"><span class="recent-name">' + esc(rec.name || '文件夹') + '</span>' +
        '<span class="recent-time">' + esc(recentTimeLabel(rec.time)) + (i === 0 ? ' · 最近' : '') + '</span></span>' +
        '<button class="btn small' + (i === 0 ? ' primary' : '') + '" type="button" data-recent-index="' + i + '">恢复</button>' +
        '</div>';
    });
    html += '</div>';
  }
  html += '<div class="recent-actions"><button class="btn small" type="button" data-recent-open>' + icon('folder-open') + '打开文件夹</button><span>' + (list.length ? '最多保留 ' + RECENT_LIMIT + ' 个' : '仅保存在本机浏览器') + '</span></div>';
  panel.innerHTML = html;
  $$('[data-recent-index]', panel).forEach(function (btn) {
    btn.addEventListener('click', function () { restoreRecentFolder(Number(btn.getAttribute('data-recent-index'))); });
  });
  var open = $('[data-recent-open]', panel);
  if (open) open.addEventListener('click', pickFolder);
}
function showReadme() {
  var text = S.readmeText ? S.readmeText : readReadmeText();
  S.readmeText = text;
  if (!String(text || '').trim()) {
    toast('未找到内置说明内容', 2600);
    return Promise.resolve(false);
  }
  var node = { type: 'file', name: 'README.md', path: 'README.md', content: String(text), size: String(text).length, readme: true };
  return openFile(node, { pinned: true });
}
function restoreRecentFolder(arg) {
  var rec = null;
  if (arg && typeof arg === 'object' && arg.kind === 'directory') rec = { handle: arg, name: arg.name || '文件夹' };
  else {
    var list = S.recentFolders || [];
    var index = typeof arg === 'number' ? arg : 0;
    rec = list[index] || null;
  }
  if (!rec || !rec.handle) {
    toast('没有可恢复的最近文件夹', 2400);
    return Promise.resolve(false);
  }
  var handle = rec.handle;
  var ask = typeof handle.requestPermission === 'function'
    ? Promise.resolve(handle.requestPermission({ mode: 'read' }))
    : Promise.resolve('granted');
  return ask.then(function (perm) {
    if (perm !== 'granted') throw new Error('没有读取权限');
    return useDirectoryHandle(handle);
  }).then(function (ok) {
    return !!ok;
  }).catch(function (err) {
    if (err && err.name === 'AbortError') {
      if (!S.tabs.length) showWelcome();
      return false;
    }
    toast('无法恢复文件夹：' + (err && err.message ? err.message : err), 3600);
    if (!S.tabs.length) showWelcome('恢复失败，可从右侧最近文件夹重试或重新打开');
    return false;
  });
}
function initStartup() {
  S.readmeText = readReadmeText();
  S.mode = 'welcome';
  renderRecentPanel();
  return loadRecentFolders().then(function (list) {
    var latest = list[0];
    if (!latest || !latest.handle || typeof latest.handle.queryPermission !== 'function') return showWelcome();
    return Promise.resolve(latest.handle.queryPermission({ mode: 'read' })).then(function (perm) {
      if (perm !== 'granted') return showWelcome();
      return useDirectoryHandle(latest.handle).then(function (ok) {
        if (!ok) return showWelcome();
      });
    });
  }).catch(function (err) {
    console.warn('无法检查最近文件夹', err);
    return showWelcome();
  });
}

function bindResizer() {
  els.resizer.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    var startX = event.clientX;
    var startWidth = els.sidebar.getBoundingClientRect().width;
    document.body.classList.add('resizing');
    try { els.resizer.setPointerCapture(event.pointerId); } catch (e) {}
    function move(ev) {
      var width = Math.max(230, Math.min(560, startWidth + ev.clientX - startX));
      document.documentElement.style.setProperty('--side-w', width + 'px');
    }
    function up() {
      document.body.classList.remove('resizing');
      window.removeEventListener('pointermove', move);
      var width = els.sidebar.getBoundingClientRect().width;
      storeSet(LS.width, String(Math.round(width)));
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    window.addEventListener('pointercancel', up, { once: true });
  });
}

function bindDragDrop() {
  var depth = 0;
  function hasFiles(event) {
    var types = event.dataTransfer && event.dataTransfer.types;
    if (!types) return false;
    for (var i = 0; i < types.length; i++) if (types[i] === 'Files') return true;
    return false;
  }
  window.addEventListener('dragenter', function (event) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    depth++;
    els.dropOverlay.classList.add('show');
  });
  window.addEventListener('dragover', function (event) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });
  window.addEventListener('dragleave', function (event) {
    if (!hasFiles(event)) return;
    depth = Math.max(0, depth - 1);
    if (!depth) els.dropOverlay.classList.remove('show');
  });
  window.addEventListener('drop', function (event) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    depth = 0;
    els.dropOverlay.classList.remove('show');
    var dt = event.dataTransfer;
    var items = Array.prototype.slice.call(dt.items || []);
    var entries = items.map(function (item) {
      if (item.kind !== 'file' || typeof item.webkitGetAsEntry !== 'function') return null;
      try { return item.webkitGetAsEntry(); } catch (e) { return null; }
    }).filter(Boolean);
    if (entries.length) { useEntries(entries); return; }
    if (dt.files && dt.files.length) { useFileList(dt.files); return; }
    toast('没有读取到文件');
  });
}

function bind() {
  [els.btnOpenDir, els.btnOpenDir2, els.welcomeOpen].forEach(function (btn) {
    if (btn) btn.addEventListener('click', pickFolder);
  });
  [els.btnOpenFiles, els.btnOpenFiles2, els.welcomeFiles].forEach(function (btn) {
    if (btn) btn.addEventListener('click', pickFiles);
  });
  els.welcomeSample.addEventListener('click', function () {
    if (!S.files.length) return;
    var md = S.files.filter(function (f) { return kindOf(f.name) === 'md'; })[0];
    openFile(md || S.files[0]);
  });
  if (els.welcomeHelp) els.welcomeHelp.addEventListener('click', function () { showReadme(); });
  if (els.welcomePalette) els.welcomePalette.addEventListener('click', openPalette);
  els.btnTheme.addEventListener('click', function () { applyTheme(S.theme === 'dark' ? 'light' : 'dark'); });
  els.btnExplorer.addEventListener('click', toggleSidebar);
  els.btnActivityPalette.addEventListener('click', openPalette);
  els.btnActivityHelp.addEventListener('click', function () { showReadme(); });
  els.btnActivityTheme.addEventListener('click', function () { applyTheme(S.theme === 'dark' ? 'light' : 'dark'); });
  els.btnRefresh.addEventListener('click', refreshTree);
  els.btnCollapse.addEventListener('click', toggleCollapse);
  els.btnSource.addEventListener('click', toggleSource);
  els.btnEdit.addEventListener('click', toggleEdit);
  els.btnDownload.addEventListener('click', downloadCurrent);
  els.btnPrev.addEventListener('click', function () { goFile(-1); });
  els.btnNext.addEventListener('click', function () { goFile(1); });
  els.btnCopyPath.addEventListener('click', function () {
    if (!S.current) return;
    copyText(S.current.path, null);
    toast('已复制相对路径：' + S.current.path);
  });
  els.btnPalette.addEventListener('click', openPalette);
  els.btnMenu.addEventListener('click', toggleSidebar);
  els.backdrop.addEventListener('click', closeSidebarMobile);
  els.btnWrap.addEventListener('click', function () {
    S.wrap = !S.wrap;
    updateChrome();
    if (S.editMode) {
      var ta = $('.text-editor', els.content);
      var hl = $('.editor-highlight', els.content);
      if (ta) ta.classList.toggle('wrap', S.wrap);
      if (hl) hl.classList.toggle('wrap', S.wrap);
      if (ta) ta.dispatchEvent(new Event('scroll'));
    } else reopenCurrent();
  });
  els.encoding.addEventListener('change', function () {
    S.encoding = els.encoding.value || 'auto';
    reopenCurrent();
  });
  els.btnOutline.addEventListener('click', function () {
    els.main.classList.toggle('outline-open');
    els.btnOutline.classList.toggle('active', els.main.classList.contains('outline-open'));
  });
  els.btnOutlineClose.addEventListener('click', function () {
    els.main.classList.remove('outline-open');
    els.btnOutline.classList.remove('active');
  });
  els.outlineList.addEventListener('click', function (event) {
    var item = event.target.closest ? event.target.closest('.outline-item') : null;
    if (item) scrollToHeading(item.dataset.id);
  });
  els.filter.addEventListener('input', function () {
    S.filter = els.filter.value.trim().toLowerCase();
    els.filterBox.classList.toggle('has-value', !!els.filter.value);
    renderTree();
  });
  els.filter.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    event.stopPropagation();
    els.filter.value = '';
    els.filterBox.classList.remove('has-value');
    S.filter = '';
    renderTree();
  });
  els.filterClear.addEventListener('click', function () {
    els.filter.value = '';
    els.filterBox.classList.remove('has-value');
    S.filter = '';
    renderTree();
    els.filter.focus();
  });
  els.tabstrip.addEventListener('click', function (event) {
    var close = event.target.closest ? event.target.closest('.tab-close') : null;
    if (close) {
      event.stopPropagation();
      var closeTabEl = close.closest('.tab');
      if (closeTabEl) closeTabById(closeTabEl.getAttribute('data-tab-id'));
      return;
    }
    var tabEl = event.target.closest ? event.target.closest('.tab') : null;
    if (tabEl) activateTabById(tabEl.getAttribute('data-tab-id'));
  });
  els.tabstrip.addEventListener('auxclick', function (event) {
    if (event.button !== 1) return;
    var tabEl = event.target.closest ? event.target.closest('.tab') : null;
    if (!tabEl) return;
    event.preventDefault();
    closeTabById(tabEl.getAttribute('data-tab-id'));
  });
  els.tabstrip.addEventListener('keydown', function (event) {
    var tabEl = event.target.closest ? event.target.closest('.tab') : null;
    if (!tabEl) return;
    var closeEl = event.target.closest ? event.target.closest('.tab-close') : null;
    if (closeEl && (event.key === 'Enter' || event.key === ' ')) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateTabById(tabEl.getAttribute('data-tab-id'));
      return;
    }
    if (event.key === 'Delete') {
      event.preventDefault();
      closeTabById(tabEl.getAttribute('data-tab-id'));
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      var tabs = $$('.tab', els.tabstrip);
      var index = tabs.indexOf(tabEl);
      var next = tabs[index + (event.key === 'ArrowLeft' ? -1 : 1)];
      if (!next) return;
      var nextId = next.getAttribute('data-tab-id');
      activateTabById(nextId).then(function (ok) {
        if (ok) focusTabById(nextId);
      });
    }
  });
  els.tabstrip.addEventListener('wheel', function (event) {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    if (els.tabstrip.scrollWidth <= els.tabstrip.clientWidth) return;
    event.preventDefault();
    els.tabstrip.scrollLeft += event.deltaY;
  }, { passive: false });
  els.tree.addEventListener('click', function (event) {
    var row = event.target.closest ? event.target.closest('.tree-row') : null;
    if (row) activateRow(row);
  });
  els.tree.addEventListener('dblclick', function (event) {
    var row = event.target.closest ? event.target.closest('.tree-row') : null;
    if (row && row.dataset.type === 'file') activateRow(row, true);
  });
  els.tree.addEventListener('keydown', function (event) {
    var row = event.target.closest ? event.target.closest('.tree-row') : null;
    if (!row) return;
    var rows = $$('.tree-row', els.tree);
    var index = rows.indexOf(row);
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateRow(row);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (rows[index + 1]) rows[index + 1].focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (rows[index - 1]) rows[index - 1].focus();
    } else if (event.key === 'ArrowRight' && row.dataset.type === 'dir') {
      event.preventDefault();
      if (!S.expanded.has(row.dataset.path)) toggleDir(row.dataset.path);
    } else if (event.key === 'ArrowLeft' && row.dataset.type === 'dir') {
      event.preventDefault();
      if (S.expanded.has(row.dataset.path)) toggleDir(row.dataset.path);
    }
  });
  els.content.addEventListener('click', onContentClick);
  els.scroll.addEventListener('scroll', handleScroll, { passive: true });
  els.palette.addEventListener('click', function (event) {
    if (event.target === els.palette) closePalette();
  });
  els.paletteInput.addEventListener('input', renderPalette);
  els.paletteInput.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setPaletteActive(S.paletteIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setPaletteActive(S.paletteIndex - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choosePaletteItem(S.paletteIndex, event.ctrlKey || event.metaKey);
    }
  });
  els.lightbox.addEventListener('click', function (event) {
    if (event.target === els.lightbox) closeLightbox();
    else if (event.target === els.lightboxImg) els.lightboxImg.classList.toggle('zoomed');
  });
  els.lbClose.addEventListener('click', closeLightbox);
  els.fileInput.addEventListener('change', function () {
    if (els.fileInput.files && els.fileInput.files.length) useFileList(els.fileInput.files);
    els.fileInput.value = '';
  });
  els.folderInput.addEventListener('change', function () {
    if (els.folderInput.files && els.folderInput.files.length) useFileList(els.folderInput.files);
    els.folderInput.value = '';
  });
  document.addEventListener('keydown', function (event) {
    var mod = event.ctrlKey || event.metaKey;
    var key = event.key || '';
    if (mod && key.toLowerCase() === 'p') {
      event.preventDefault();
      if (S.paletteOpen) closePalette(); else openPalette();
      return;
    }
    if (mod && key.toLowerCase() === 'b') {
      event.preventDefault();
      toggleSidebar();
      return;
    }
    if (mod && key.toLowerCase() === 'e') {
      event.preventDefault();
      toggleSource();
      return;
    }
    if (mod && key.toLowerCase() === 's') {
      event.preventDefault();
      if (S.editMode) saveEdit();
      return;
    }
    if (event.altKey && key === 'ArrowLeft') { event.preventDefault(); goFile(-1); return; }
    if (event.altKey && key === 'ArrowRight') { event.preventDefault(); goFile(1); return; }
    if (key === 'Escape') {
      if (S.lightboxOpen) { closeLightbox(); return; }
      if (S.paletteOpen) { closePalette(); return; }
      if (document.body.classList.contains('sidebar-open')) { closeSidebarMobile(); return; }
      if (S.editMode) { cancelEdit(); return; }
      if (els.main.classList.contains('outline-open')) {
        els.main.classList.remove('outline-open');
        els.btnOutline.classList.remove('active');
      }
    }
  });
  window.addEventListener('beforeunload', function (event) {
    if (hasDirtyTabs()) { event.preventDefault(); event.returnValue = ''; }
  });
  window.addEventListener('resize', syncActivityState);
  bindResizer();
  bindDragDrop();
  syncActivityState();
}

function init() {
  try { S.rawDeflate = !!new DecompressionStream('deflate-raw'); }
  catch (e) { S.rawDeflate = false; }
  var savedTheme = storeGet(LS.theme);
  if (!savedTheme) savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  applyTheme(savedTheme);
  var savedWidth = parseInt(storeGet(LS.width) || '', 10);
  if (savedWidth >= 230 && savedWidth <= 560) document.documentElement.style.setProperty('--side-w', savedWidth + 'px');
  bind();
  renderTabBar();
  initStartup();
}

init();
})();
