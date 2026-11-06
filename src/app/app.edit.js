function canEditCurrent() {
  return !!S.current && isTextKind(S.currentKind) && !S.truncated && !S.current.readme;
}
function editDirtyNow() {
  return S.editMode && S.editText !== S.editOriginal;
}
function updateEditMeta() {
  if (!S.editMode || !S.current) return;
  S.editDirty = editDirtyNow();
  updateStatusInfo('编辑 · ' + (S.editDirty ? '未保存 · ' : '') + 'Ctrl+S 保存 · Esc 取消');
  updateStats(S.editText);
  updateStatusPath();
  updateChrome();
}
function renderEditor() {
  setContent('text'); clearContent();
  els.content.className = 'doc edit-body';
  var enc = S.decodedEncoding ? encLabel(S.decodedEncoding) : '自动';
  var meta = '编辑 · ' + S.current.name + ' · ' + enc + (S.mode === 'live' && S.current.handle ? ' · 可直接写回' : ' · 保存为副本');
  els.content.insertAdjacentHTML('beforeend', docToolbar(meta, '<button class="btn small primary" type="button" data-act="save-edit">保存</button><button class="btn small" type="button" data-act="cancel-edit">取消</button>'));
  var box = document.createElement('div');
  box.className = 'editor-box';
  var hl = document.createElement('pre');
  hl.className = 'editor-highlight' + (S.wrap ? ' wrap' : '');
  hl.setAttribute('aria-hidden', 'true');
  var ta = document.createElement('textarea');
  ta.className = 'text-editor' + (S.wrap ? ' wrap' : '');
  ta.value = S.editText;
  ta.spellcheck = false;
  ta.setAttribute('aria-label', '编辑 ' + S.current.name);
  var raf = 0;
  function editorSyncScroll() {
    hl.scrollTop = ta.scrollTop;
    hl.scrollLeft = ta.scrollLeft;
  }
  function editorPaint() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    var text = ta.value, lang = langOfName(S.current.name);
    if (!text || lang === 'text' || lang === 'csv' || text.length > HL_MAX) hl.textContent = text;
    else hl.innerHTML = '<span></span>' + highlightCode(text, lang);
    editorSyncScroll();
  }
  function editorQueuePaint() {
    if (raf) return;
    raf = requestAnimationFrame(editorPaint);
  }
  ta.addEventListener('input', function () {
    S.editText = ta.value;
    S.raw = ta.value;
    updateEditMeta();
    editorQueuePaint();
  });
  ta.addEventListener('scroll', editorSyncScroll, { passive: true });
  ta.addEventListener('compositionstart', function () {
    hl.style.visibility = 'hidden';
    ta.classList.add('composing');
  });
  ta.addEventListener('compositionend', function () {
    hl.style.visibility = '';
    ta.classList.remove('composing');
    editorPaint();
  });
  box.appendChild(hl);
  box.appendChild(ta);
  els.content.appendChild(box);
  editorPaint();
  updateEditMeta();
  setTimeout(function () { try { ta.focus(); } catch (e) {} }, 20);
}
function enterEdit() {
  if (S.editMode) return;
  if (!S.current) return;
  if (S.current.readme) { toast('内置说明页不可编辑', 2200); return; }
  if (!isTextKind(S.currentKind)) { toast('这个文件类型不支持文本编辑', 2200); return; }
  if (S.truncated) { toast('文件已截断，请先点“加载全部”再编辑', 3200); return; }
  pinTab(S.activeTab);
  S.editMode = true;
  S.editOriginal = S.raw;
  S.editText = S.raw;
  S.editDirty = false;
  S.editSaving = false;
  renderEditor();
}
function cancelEdit(force) {
  if (!S.editMode) return;
  if (!force && editDirtyNow() && !window.confirm('放弃未保存的修改？')) return;
  S.editMode = false;
  S.editDirty = false;
  S.editOriginal = '';
  S.editText = '';
  S.editSaving = false;
  updateChrome();
  reopenCurrent();
}
function toggleEdit() {
  if (S.editMode) cancelEdit();
  else enterEdit();
}
function editBlob(text) {
  var parts = [];
  if (S.decodedEncoding === 'utf-8' && S.raw && S.raw.charCodeAt(0) === 0xFEFF) parts.push('\uFEFF');
  parts.push(text);
  return new Blob(parts, { type: mimeOf(S.current.name) || 'text/plain' });
}
async function saveEdit() {
  if (!S.editMode || S.editSaving) return;
  if (!S.current) return;
  if (S.current.readme) { toast('内置说明页不可编辑', 2200); return; }
  if (S.truncated) { toast('文件已截断，不能直接覆盖原文件', 3200); return; }
  if (!editDirtyNow()) { toast('没有需要保存的修改', 1800); return; }
  var node = S.current, text = S.editText, blob = editBlob(text);
  S.editSaving = true;
  updateChrome();
  try {
    if (S.mode === 'live' && node.handle && typeof node.handle.createWritable === 'function') {
      var perm = 'granted';
      if (node.handle.queryPermission) perm = await node.handle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted' && node.handle.requestPermission) perm = await node.handle.requestPermission({ mode: 'readwrite' });
      if (perm !== 'granted') throw new Error('没有写入权限');
      var writable = await node.handle.createWritable();
      await writable.write(blob);
      await writable.close();
      node.blob = null;
      node.file = null;
      node.size = blob.size;
      S.editDirty = false;
      S.editMode = false;
      S.editOriginal = text;
      S.editText = text;
      S.editSaving = false;
      toast('已保存到磁盘', 2200);
      reopenCurrent();
      return;
    }
    if (node.virtualParent) node.blob = blob;
    else if (node.blob) node.blob = blob;
    else if (node.content != null) node.content = text;
    else {
      node.blob = blob;
      node.file = null;
      node.size = blob.size;
    }
    downloadBlob(blob, node.name);
    S.editDirty = false;
    S.editMode = false;
    S.editOriginal = text;
    S.editText = text;
    S.editSaving = false;
    toast('已更新当前预览，并下载保存副本', 3000);
    reopenCurrent();
  } catch (err) {
    S.editSaving = false;
    updateChrome();
    toast('保存失败：' + (err && err.message ? err.message : err), 4200);
  }
}
