var MATHML_OK = typeof MathMLElement !== 'undefined';

function encLabel(e) {
  var m = { 'utf-8': 'UTF-8', 'utf-16le': 'UTF-16 LE', 'utf-16be': 'UTF-16 BE', 'gb18030': 'GB18030', 'big5': 'Big5', 'shift_jis': 'Shift_JIS', 'windows-1252': 'Windows-1252' };
  return m[e] || (e ? e.toUpperCase() : '自动');
}
function isExternalURL(s) { return /^(https?:|data:|blob:|\/\/|mailto:|tel:)/i.test(String(s || '')); }
function finishProgress() {
  setProgress(100);
  clearTimeout(S.progressTimer);
  S.progressTimer = setTimeout(function () { setProgress(0); }, 320);
}
function docToolbar(meta, actions) {
  if (!meta && !actions) return '';
  return '<div class="doc-toolbar"><span class="doc-toolbar-meta">' + esc(meta || '') + '</span><span class="doc-toolbar-actions">' + (actions || '') + '</span></div>';
}
function copyCodeButton() { return '<button class="btn small" type="button" data-act="copy-code">' + icon('copy') + '复制</button>'; }
function truncBanner() {
  return '<div class="load-more"><span>文件超过 5 MB，已截断预览</span><button type="button" data-act="load-full">加载全部</button></div>';
}
function fallbackNote(text) { return '<div class="doc-note">' + esc(text) + '</div>'; }

function isEscapedAt(s, i) {
  var n = 0;
  for (var j = i - 1; j >= 0 && s[j] === '\\'; j--) n++;
  return n % 2 === 1;
}
function findUnescaped(s, needle, from) {
  var i = s.indexOf(needle, from);
  while (i >= 0) { if (!isEscapedAt(s, i)) return i; i = s.indexOf(needle, i + 1); }
  return -1;
}
function findInlineDollar(s, from) {
  for (var i = from; i < s.length; i++) {
    if (s[i] === '\\') { i++; continue; }
    if (s[i] === '$') {
      if (s[i + 1] === '$') { i++; continue; }
      var tex = s.slice(from, i);
      if (!tex || /^\s|\s$/.test(tex) || tex.indexOf('\n') >= 0) return -1;
      return i;
    }
  }
  return -1;
}
function protectMath(md) {
  var out = '', math = [], i = 0, n = md.length;
  var inFence = false, fenceChar = '', fenceLen = 0;
  function token(tex, display) {
    var id = math.length;
    math.push({ tex: tex, display: !!display });
    return '<span class="math-token" data-math="' + id + '"></span>';
  }
  while (i < n) {
    var atLine = i === 0 || md[i - 1] === '\n';
    if (atLine) {
      var j = i;
      while (j < n && (md[j] === ' ' || md[j] === '\t') && j - i < 4) j++;
      var fm = /^(`{3,}|~{3,})/.exec(md.slice(j, j + 20));
      if (fm) {
        var fc = fm[1][0], fl = fm[1].length;
        if (!inFence) { inFence = true; fenceChar = fc; fenceLen = fl; }
        else if (fc === fenceChar && fl >= fenceLen) { inFence = false; }
        var eol = md.indexOf('\n', j);
        if (eol < 0) eol = n; else eol++;
        out += md.slice(i, eol); i = eol; continue;
      }
      if (!inFence) {
        var em = /^\\begin\{([A-Za-z*]+)\}/.exec(md.slice(j));
        if (em) {
          var endTag = '\\end{' + em[1] + '}';
          var ep = md.indexOf(endTag, j + em[0].length);
          if (ep >= 0) {
            out += md.slice(i, j) + token(md.slice(j, ep + endTag.length), true);
            i = ep + endTag.length; continue;
          }
        }
      }
    }
    if (inFence) { out += md[i++]; continue; }
    var ch = md[i];
    if (ch === '`') {
      var run = 0;
      while (i + run < n && md[i + run] === '`') run++;
      var close = md.indexOf('`'.repeat(run), i + run);
      if (close >= 0) { out += md.slice(i, close + run); i = close + run; }
      else { out += md.slice(i, i + run); i += run; }
      continue;
    }
    if (ch === '\\') {
      if (md.slice(i, i + 2) === '$$') { out += '\\$'; i += 2; continue; }
      if (md.slice(i, i + 2) === '\\[') {
        var e1 = findUnescaped(md, '\\]', i + 2);
        if (e1 >= 0) { out += token(md.slice(i + 2, e1), true); i = e1 + 2; continue; }
      }
      if (md.slice(i, i + 2) === '\\(') {
        var e2 = findUnescaped(md, '\\)', i + 2);
        if (e2 >= 0) { out += token(md.slice(i + 2, e2), false); i = e2 + 2; continue; }
      }
      out += md[i]; if (i + 1 < n) out += md[i + 1];
      i += 2; continue;
    }
    if (md.slice(i, i + 2) === '$$') {
      var ed = findUnescaped(md, '$$', i + 2);
      if (ed >= 0) { out += token(md.slice(i + 2, ed), true); i = ed + 2; continue; }
    }
    if (ch === '$') {
      var cd = findInlineDollar(md, i + 1);
      if (cd >= 0) { out += token(md.slice(i + 1, cd), false); i = cd + 1; continue; }
    }
    out += ch; i++;
  }
  return { md: out, math: math };
}
function sanitizeHtml(html) {
  if (!window.DOMPurify) return '<pre>' + esc(html) + '</pre>';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true, mathMl: true },
    ADD_ATTR: ['target', 'rel', 'colspan', 'rowspan', 'align', 'checked', 'disabled', 'type', 'data-math', 'data-local'],
    ADD_TAGS: ['input'],
    FORBID_TAGS: ['style', 'form', 'button', 'select', 'textarea', 'option', 'iframe', 'object', 'embed', 'base', 'link', 'meta'],
    FORBID_ATTR: ['style'],
    ALLOW_DATA_ATTR: true
  });
}
function markdownToHtml(text) {
  var p = protectMath(text);
  var raw;
  try {
    raw = window.marked && marked.parse ? marked.parse(p.md, { gfm: true, breaks: false }) : '<pre>' + esc(p.md) + '</pre>';
  } catch (e) {
    raw = '<pre>' + esc(p.md) + '</pre>';
  }
  return { html: sanitizeHtml(raw), math: p.math };
}
function mathFallback(span, item, reason) {
  S.mathFallbacks++;
  if (item.display) {
    var d = document.createElement('div'); d.className = 'math-block';
    var raw = document.createElement('span'); raw.className = 'math-raw'; raw.textContent = '$$' + item.tex + '$$'; raw.title = reason;
    d.appendChild(raw);
    if (span.parentNode) span.parentNode.replaceChild(d, span);
  } else {
    span.className = 'math-raw'; span.textContent = '$' + item.tex + '$'; span.title = reason;
  }
}
function replaceMathTokens(root, list) {
  $$('.math-token', root).forEach(function (span) {
    var id = parseInt(span.getAttribute('data-math'), 10);
    var item = list[id];
    if (!item) { if (span.parentNode) span.parentNode.removeChild(span); return; }
    if (!MATHML_OK) { mathFallback(span, item, '当前浏览器不支持 MathML，显示 LaTeX 源码'); return; }
    var r = texToMathML(item.tex, item.display);
    if (!r.ok) { mathFallback(span, item, '暂不支持：' + (r.error || '无法转换')); return; }
    if (item.display) {
      var wrap = document.createElement('div'); wrap.className = 'math-block';
      var inner = document.createElement('div'); inner.className = 'math-display-wrap';
      inner.innerHTML = r.html;
      if (r.tag) { var tag = document.createElement('span'); tag.className = 'math-tag'; tag.textContent = '(' + r.tag + ')'; inner.appendChild(tag); }
      wrap.appendChild(inner);
      if (span.parentNode) span.parentNode.replaceChild(wrap, span);
    } else {
      span.className = 'math-inline'; span.innerHTML = r.html; span.title = item.tex;
    }
  });
}
function extractFrontmatter(text) {
  var m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(text);
  if (!m) return { body: text, html: '' };
  var rows = [];
  m[1].split(/\r?\n/).forEach(function (line) {
    var mm = /^([A-Za-z0-9_\- ]+):\s*(.*)$/.exec(line);
    if (mm) rows.push([mm[1].trim(), mm[2].replace(/^["']|["']$/g, '')]);
  });
  if (!rows.length) return { body: text.slice(m[0].length), html: '' };
  var html = '<details class="frontmatter" open><summary>文档信息</summary><dl>' + rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl></details>';
  return { body: text.slice(m[0].length), html: html };
}
function uniqueHeadingId(text) {
  var base = slugify(text) || 'section';
  var id = base, n = 2;
  while (document.getElementById(id)) { id = base + '-' + n++; }
  return id;
}
function buildOutlineFrom(root) {
  var hs = $$('h1,h2,h3,h4,h5,h6', root);
  var used = new Set();
  S.outline = [];
  hs.forEach(function (h) {
    var base = h.id || slugify(h.textContent) || 'section';
    var id = base, n = 2;
    while (used.has(id)) { id = base + '-' + n++; }
    h.id = id; used.add(id);
    S.outline.push({ id: id, text: (h.textContent || '').trim(), level: parseInt(h.tagName.slice(1), 10), el: h });
  });
  S.outlineItems = hs;
  renderOutline();
}
function renderOutline() {
  els.outlineList.innerHTML = '';
  if (!S.outline.length) {
    var e = document.createElement('div'); e.className = 'outline-empty'; e.textContent = S.current ? '此文档没有可显示的大纲' : '打开文档后显示大纲';
    els.outlineList.appendChild(e);
    return;
  }
  S.outline.forEach(function (item, i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'outline-item lv' + Math.min(3, item.level);
    b.dataset.id = item.id; b.textContent = item.text || '(无标题)'; b.title = item.text;
    if (i === S.activeHeading) b.classList.add('active');
    els.outlineList.appendChild(b);
  });
}
function scrollToHeading(id) {
  var el = document.getElementById(id);
  if (!el) return;
  var top = el.getBoundingClientRect().top - els.scroll.getBoundingClientRect().top + els.scroll.scrollTop - 18;
  els.scroll.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}
function updateOutlineActive() {
  if (!S.outlineItems.length) return;
  var base = els.scroll.getBoundingClientRect().top, top = 64, idx = -1;
  for (var i = 0; i < S.outlineItems.length; i++) {
    var h = S.outlineItems[i];
    if (h.getBoundingClientRect().top - base <= top) idx = i; else break;
  }
  if (idx !== S.activeHeading) {
    S.activeHeading = idx;
    $$('.outline-item', els.outlineList).forEach(function (b, i) { b.classList.toggle('active', i === idx); });
  }
}
function postProcessMarkdown(root) {
  $$('pre', root).forEach(function (pre) {
    if (pre.parentNode && pre.parentNode.classList && pre.parentNode.classList.contains('code-block')) return;
    var code = pre.querySelector('code'), lang = '';
    if (code) { var m = /(?:^|\s)language-([A-Za-z0-9_+#.-]+)/.exec(code.className); if (m) lang = m[1]; }
    if (code && lang) applyHighlight(code, code.textContent, lang);
    var box = document.createElement('div'); box.className = 'code-block';
    var bar = document.createElement('div'); bar.className = 'code-bar';
    bar.innerHTML = '<span class="code-lang">' + esc(lang || 'text') + '</span><button class="code-copy" type="button" data-act="copy-code">' + icon('copy') + '<span>复制</span></button>';
    pre.parentNode.insertBefore(box, pre);
    box.appendChild(bar); box.appendChild(pre);
  });
  $$('table', root).forEach(function (t) {
    if (t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('table-wrap')) return;
    var w = document.createElement('div'); w.className = 'table-wrap';
    t.parentNode.insertBefore(w, t); w.appendChild(t);
  });
  $$('img', root).forEach(function (img) {
    img.setAttribute('loading', 'lazy'); img.setAttribute('decoding', 'async');
    var src = img.getAttribute('data-src') || img.getAttribute('src') || '';
    if (src && !isExternalURL(src)) img.setAttribute('data-loading', '1');
  });
  $$('a[href]', root).forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (isExternalURL(href)) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); }
    else if (href && href.charAt(0) !== '#') a.dataset.local = '1';
  });
  buildOutlineFrom(root);
  S.outlineItems.forEach(function (h) {
    if (h.querySelector('.heading-anchor')) return;
    var a = document.createElement('a'); a.className = 'heading-anchor'; a.href = '#' + h.id; a.textContent = '#'; a.setAttribute('aria-hidden', 'true');
    h.insertBefore(a, h.firstChild);
  });
}
function imgError(img, src) {
  if (!img || !img.parentNode) return;
  var d = document.createElement('div'); d.className = 'img-error';
  d.innerHTML = icon('image') + '<span>图片无法显示</span><code>' + esc(src) + '</code>';
  img.parentNode.replaceChild(d, img);
}
function assetBlob(rawPath, basePath) {
  var raw = decodeSafe(String(rawPath || '').split('#')[0].split('?')[0]).replace(/\\/g, '/');
  if (!raw || isExternalURL(raw)) return Promise.resolve(null);
  if (S.zipCache && S.current && S.current.virtualParent && S.current.archiveEntry) {
    var zp = joinPath(dirname(S.current.archiveEntry.name), raw);
    if (zipFind(S.zipCache, zp)) {
      var ze = zipFind(S.zipCache, zp);
      return zipExtract(S.zipCache, ze).then(function (u8) { return new Blob([u8], { type: mimeOf(zp) }); }).catch(function () { return null; });
    }
  }
  var p = raw.charAt(0) === '/' ? normPath(raw.slice(1)) : joinPath(basePath || '', raw);
  var key = S.mode + ':' + p;
  if (S.imageCache.has(key)) return S.imageCache.get(key);
  var promise = null;
  if (S.mode === 'files') {
    var f = null;
    if (S.fileMap) f = S.fileMap.get(p) || S.fileMapLower.get(p.toLowerCase());
    if (!f && S.fileMapByName) f = S.fileMapByName.get(basename(p).toLowerCase());
    if (!f) {
      var cand = S.files.filter(function (n) { return n.path.toLowerCase().slice(-p.length - 1) === '/' + p.toLowerCase(); });
      if (cand.length === 1) f = null;
      if (cand.length === 1) promise = getBlob(cand[0]);
    }
    if (!promise && f) promise = Promise.resolve(f);
  } else if (S.mode === 'live') {
    var ln = findFile(p);
    if (ln) promise = getBlob(ln);
    else promise = liveFile(p);
  }
  if (!promise) promise = Promise.resolve(null);
  S.imageCache.set(key, promise);
  return promise;
}
function liveFile(path) {
  if (!S.rootHandle || !path) return Promise.resolve(null);
  var segs = path.split('/');
  return getDirHandle(segs.slice(0, -1).join('/')).then(function (dh) {
    return dh.getFileHandle(segs[segs.length - 1]);
  }).then(function (fh) { return fh.getFile(); }).catch(function () { return null; });
}
function getDirHandle(path) {
  if (S.dirHandleCache.has(path)) return S.dirHandleCache.get(path);
  var p = Promise.resolve(S.rootHandle);
  (path ? path.split('/') : []).forEach(function (seg) { p = p.then(function (h) { return h.getDirectoryHandle(seg); }); });
  S.dirHandleCache.set(path, p);
  return p;
}
function stashLocalImageSources(root) {
  $$('img', root).forEach(function (img) {
    var src = img.getAttribute('src') || '';
    if (!src || isExternalURL(src)) return;
    img.setAttribute('data-src', src); img.removeAttribute('src');
  });
}
function hydrateImages(root, basePath) {
  var tasks = [];
  $$('img', root).forEach(function (img) {
    var src = img.getAttribute('data-src') || img.getAttribute('src') || '';
    if (!src || isExternalURL(src)) { img.removeAttribute('data-loading'); return; }
    tasks.push(assetBlob(src, basePath).then(function (blob) {
      if (!blob) { imgError(img, src); return; }
      img.src = newURL(blob); img.removeAttribute('data-src'); img.removeAttribute('data-loading');
      img.addEventListener('error', function () { imgError(img, src); }, { once: true });
    }).catch(function () { imgError(img, src); }));
  });
  return Promise.all(tasks);
}
function hydrateLinks(root, basePath) {
  $$('a[href]', root).forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#' || isExternalURL(href)) return;
    var r = resolveLocal(href, basePath);
    if (!r) return;
    a.dataset.local = '1';
    a.title = r.path + (r.hash ? '#' + r.hash : '');
  });
}
function resolveLocal(href, base) {
  var s = String(href || '');
  var m = /^([^#]*)(?:#([\s\S]*))?$/.exec(s);
  var pathPart = m ? m[1] : '', hash = m && m[2] ? m[2] : '';
  if (!pathPart || /^[a-z][a-z0-9+.-]*:/i.test(pathPart) || pathPart.slice(0, 2) === '//') return null;
  var raw = decodeSafe(pathPart);
  if (raw.charAt(0) === '/') raw = raw.slice(1);
  return { path: joinPath(base || '', raw), hash: hash, raw: pathPart };
}
function renderCode(text, opts) {
  opts = opts || {};
  setContent('text'); clearContent();
  var bar = docToolbar(opts.meta || '', opts.actions == null ? copyCodeButton() : opts.actions);
  if (bar) els.content.insertAdjacentHTML('beforeend', bar);
  if (S.truncated) els.content.insertAdjacentHTML('beforeend', truncBanner());
  if (opts.note) els.content.insertAdjacentHTML('beforeend', fallbackNote(opts.note));
  var pre = document.createElement('pre');
  pre.className = 'text-view' + (S.wrap ? ' wrap' : '');
  applyHighlight(pre, text, opts.lang || (S.current ? langOfName(S.current.name) : 'text'));
  els.content.appendChild(pre);
  updateStatusInfo(opts.info || '');
  updateStats(text);
}
async function renderMarkdown(node, opts) {
  var res = await readTextOf(node, S.encoding);
  if (S.current !== node) return;
  S.raw = res.text; S.decodedEncoding = res.enc;
  if (S.sourceMode) {
    renderCode(res.text, { meta: 'Markdown 源码 · ' + encLabel(res.enc) + ' · ' + fmtSize(S.currentBlob ? S.currentBlob.size : res.text.length), info: 'Markdown 源码 · ' + encLabel(res.enc) });
    finishProgress(); return;
  }
  var fm = extractFrontmatter(res.text);
  var out = markdownToHtml(fm.body);
  setContent('md'); clearContent();
  els.content.className = 'doc markdown-body';
  if (fm.html) els.content.insertAdjacentHTML('beforeend', fm.html);
  if (S.truncated) els.content.insertAdjacentHTML('beforeend', truncBanner());
  var holder = document.createElement('div'); holder.innerHTML = out.html;
  replaceMathTokens(holder, out.math);
  stashLocalImageSources(holder);
  while (holder.firstChild) els.content.appendChild(holder.firstChild);
  if (!els.content.textContent.trim()) els.content.insertAdjacentHTML('beforeend', fallbackNote('空文档'));
  postProcessMarkdown(els.content);
  await hydrateImages(els.content, dirname(node.path));
  hydrateLinks(els.content, dirname(node.path));
  updateStats(res.text);
  var info = 'Markdown · ' + encLabel(res.enc);
  if (S.truncated) info += ' · 已截断';
  if (S.mathFallbacks) info += ' · ' + S.mathFallbacks + ' 个公式显示源码';
  updateStatusInfo(info);
  if (S.mathFallbacks) toast(S.mathFallbacks + ' 个公式暂不支持，已显示 LaTeX 源码', 3200);
  finishProgress();
  var anchor = (opts && opts.anchor) || location.hash.slice(1);
  if (anchor) setTimeout(function () { scrollToHeading(anchor); }, 60);
}
async function renderText(node) {
  var res = await readTextOf(node, S.encoding);
  if (S.current !== node) return;
  S.raw = res.text; S.decodedEncoding = res.enc;
  var size = S.currentBlob ? fmtSize(S.currentBlob.size) : fmtSize(res.text.length);
  renderCode(res.text, {
    meta: '文本 · ' + size + ' · ' + encLabel(res.enc),
    info: '文本 · ' + encLabel(res.enc) + (S.truncated ? ' · 已截断' : ''),
    actions: copyCodeButton()
  });
  finishProgress();
}
async function renderJson(node) {
  var res = await readTextOf(node, S.encoding);
  if (S.current !== node) return;
  S.raw = res.text; S.decodedEncoding = res.enc;
  if (S.sourceMode) {
    renderCode(res.text, { meta: 'JSON 源码 · ' + encLabel(res.enc), info: 'JSON 源码 · ' + encLabel(res.enc) });
    finishProgress(); return;
  }
  var ext = extOf(node.name), text = res.text, note = '', label = 'JSON';
  if (ext === 'jsonl' || ext === 'ndjson') {
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
    var arr = [], ok = true;
    lines.forEach(function (l) { try { arr.push(JSON.stringify(JSON.parse(l), null, 2)); } catch (e) { ok = false; } });
    if (ok) { text = arr.join('\n'); label = 'JSONL · ' + lines.length + ' 行'; }
    else note = '部分行不是有效 JSON，显示原文';
  } else {
    try {
      var obj = JSON.parse(text);
      var pretty = JSON.stringify(obj, null, 2);
      if (pretty.length > 8 * 1024 * 1024) note = '结构化预览过大，显示原文';
      else text = pretty;
      label = 'JSON · ' + (Array.isArray(obj) ? obj.length + ' 项' : '对象');
    } catch (e) { note = 'JSON 解析失败：' + (e && e.message ? e.message : e) + '，显示原文'; }
  }
  renderCode(text, {
    meta: label + ' · ' + encLabel(res.enc) + ' · ' + fmtSize(S.currentBlob ? S.currentBlob.size : res.text.length),
    info: label + ' · ' + encLabel(res.enc),
    note: note
  });
  finishProgress();
}
function parseCsv(text, delim) {
  var rows = [], row = [], field = '', q = false, i = 0, truncated = false;
  while (i < text.length) {
    var c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; } else { q = false; i++; } }
      else { field += c; i++; }
    } else if (c === '"') { q = true; i++; }
    else if (c === delim) { row.push(field); field = ''; i++; }
    else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = ''; i++;
      if (rows.length >= 1000) { truncated = true; break; }
    } else if (c === '\r') i++;
    else { field += c; i++; }
  }
  if (!truncated && (field !== '' || row.length)) { row.push(field); rows.push(row); }
  return { rows: rows, truncated: truncated };
}
async function renderCsv(node) {
  var res = await readTextOf(node, S.encoding);
  if (S.current !== node) return;
  S.raw = res.text; S.decodedEncoding = res.enc;
  if (S.sourceMode) {
    renderCode(res.text, { meta: 'CSV 源码 · ' + encLabel(res.enc), info: 'CSV 源码 · ' + encLabel(res.enc) });
    finishProgress(); return;
  }
  var firstLine = res.text.split(/\r?\n/, 1)[0] || '';
  var delim = extOf(node.name) === 'tsv' ? '\t' : (firstLine.split('\t').length > firstLine.split(',').length ? '\t' : ',');
  var parsed = parseCsv(res.text, delim);
  var rows = parsed.rows;
  var maxCols = 0;
  rows.forEach(function (r) { if (r.length > maxCols) maxCols = r.length; });
  if (maxCols > 80) maxCols = 80;
  setContent('md'); clearContent();
  els.content.className = 'doc markdown-body csv-body';
  els.content.insertAdjacentHTML('beforeend', docToolbar('CSV · ' + rows.length + ' 行 × ' + maxCols + ' 列 · ' + encLabel(res.enc), '<button class="btn small" data-act="copy-code" type="button">' + icon('copy') + '复制</button>'));
  if (S.truncated) els.content.insertAdjacentHTML('beforeend', truncBanner());
  if (parsed.truncated) els.content.insertAdjacentHTML('beforeend', fallbackNote('仅显示前 1000 行'));
  if (maxCols > 80) els.content.insertAdjacentHTML('beforeend', fallbackNote('仅显示前 80 列'));
  if (!rows.length) { els.content.insertAdjacentHTML('beforeend', fallbackNote('空表格')); finishProgress(); return; }
  var html = '<div class="table-wrap"><table class="csv-table"><thead><tr>';
  for (var c = 0; c < maxCols; c++) html += '<th>' + esc(rows[0][c] == null ? '' : rows[0][c]) + '</th>';
  html += '</tr></thead><tbody>';
  for (var r = 1; r < rows.length; r++) {
    html += '<tr>';
    for (var j = 0; j < maxCols; j++) html += '<td>' + esc(rows[r][j] == null ? '' : rows[r][j]) + '</td>';
    html += '</tr>';
  }
  html += '</tbody></table></div>';
  els.content.insertAdjacentHTML('beforeend', html);
  updateStatusInfo('CSV · ' + encLabel(res.enc));
  updateStats('', rows.length + ' 行 × ' + maxCols + ' 列');
  finishProgress();
}
function iframeCss() {
  var dark = S.theme !== 'light';
  var bg = dark ? '#1e1e1e' : '#ffffff', fg = dark ? '#d4d4d4' : '#2f2f2f', mut = dark ? '#9d9d9d' : '#616161';
  var code = dark ? '#252526' : '#f6f8fa', border = dark ? '#444' : '#ddd', link = dark ? '#4daafc' : '#0b6fc2';
  return 'html,body{margin:0;padding:0;background:' + bg + ';color:' + fg + '}body{padding:24px 28px 70px;max-width:960px;margin:0 auto;font:15px/1.75 system-ui,"Segoe UI","Microsoft YaHei",sans-serif;word-wrap:break-word}a{color:' + link + '}img{max-width:100%;height:auto}pre{overflow:auto;padding:12px 14px;border:1px solid ' + border + ';border-radius:6px;background:' + code + ';font:12.5px/1.6 Consolas,monospace}code{font-family:Consolas,monospace;background:' + code + ';padding:.1em .3em;border-radius:3px}table{border-collapse:collapse;width:100%;margin:1em 0}th,td{border:1px solid ' + border + ';padding:6px 9px;text-align:left;vertical-align:top}th{background:' + code + '}blockquote{margin:1em 0;padding:.4em 1em;border-left:3px solid ' + link + ';color:' + mut + '}hr{border:0;border-top:1px solid ' + border + '}';
}
async function renderHtml(node) {
  var res = await readTextOf(node, S.encoding);
  if (S.current !== node) return;
  S.raw = res.text; S.decodedEncoding = res.enc;
  if (S.sourceMode) {
    renderCode(res.text, { meta: 'HTML 源码 · ' + encLabel(res.enc), info: 'HTML 源码 · ' + encLabel(res.enc) });
    finishProgress(); return;
  }
  if (!window.DOMPurify) {
    renderCode(res.text, { meta: 'HTML（未启用消毒）', note: 'DOMPurify 未加载，无法安全预览' });
    finishProgress(); return;
  }
  var clean = DOMPurify.sanitize(res.text, {
    WHOLE_DOCUMENT: true,
    USE_PROFILES: { html: true, mathMl: true },
    FORBID_TAGS: ['script', 'style', 'link', 'meta', 'base', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['style'],
    ALLOW_DATA_ATTR: true
  });
  var parsed = new DOMParser().parseFromString(clean, 'text/html');
  var body = parsed.body || parsed.documentElement;
  await hydrateImages(body, dirname(node.path));
  setContent('archive'); clearContent();
  els.content.className = 'doc html-body';
  els.content.insertAdjacentHTML('beforeend', docToolbar('HTML 预览 · 脚本已禁用 · ' + fmtSize(S.currentBlob ? S.currentBlob.size : res.text.length), '<button class="btn small" type="button" data-act="html-source">' + icon('code') + '查看源码</button>'));
  var frame = document.createElement('iframe'); frame.className = 'html-frame'; frame.setAttribute('sandbox', ''); frame.title = node.name;
  frame.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><style>' + iframeCss() + '</style></head><body>' + (body ? body.innerHTML : '') + '</body></html>';
  els.content.appendChild(frame);
  updateStatusInfo('HTML · 预览（脚本已禁用）');
  updateStats(res.text);
  finishProgress();
}
async function renderIpynb(node) {
  var res = await readTextOf(node, S.encoding);
  if (S.current !== node) return;
  S.raw = res.text; S.decodedEncoding = res.enc;
  if (S.sourceMode) {
    renderCode(res.text, { meta: 'Notebook 源码 · ' + encLabel(res.enc), info: 'Notebook 源码 · ' + encLabel(res.enc) });
    finishProgress(); return;
  }
  var nb;
  try { nb = JSON.parse(res.text); } catch (e) {
    renderCode(res.text, { meta: 'Notebook（JSON 解析失败）', note: e.message });
    finishProgress(); return;
  }
  var cells = Array.isArray(nb.cells) ? nb.cells : [];
  var lang = 'python';
  try { lang = nb.metadata.kernelspec.language || lang; } catch (e) {}
  setContent('md'); clearContent();
  els.content.className = 'doc markdown-body ipynb-body';
  els.content.insertAdjacentHTML('beforeend', docToolbar('Notebook · ' + cells.length + ' 个单元格 · ' + encLabel(res.enc), ''));
  cells.forEach(function (cell, i) {
    var src = Array.isArray(cell.source) ? cell.source.join('') : String(cell.source || '');
    if (cell.cell_type === 'markdown') {
      var o = markdownToHtml(src);
      var d = document.createElement('div'); d.className = 'ipynb-cell ipynb-md'; d.innerHTML = o.html;
      replaceMathTokens(d, o.math);
      stashLocalImageSources(d);
      els.content.appendChild(d);
    } else if (cell.cell_type === 'code') {
      var box = document.createElement('div'); box.className = 'ipynb-cell ipynb-code';
      var head = document.createElement('div'); head.className = 'ipynb-head';
      head.innerHTML = '<span>' + esc(lang) + '</span><span>In [' + (cell.execution_count == null ? ' ' : cell.execution_count) + ']</span>';
      var pre = document.createElement('pre'); pre.className = 'ipynb-input'; pre.textContent = src;
      box.appendChild(head); box.appendChild(pre);
      var outs = Array.isArray(cell.outputs) ? cell.outputs : [];
      outs.forEach(function (out) {
        var data = out.data || {};
        var el = null;
        if (data['image/png']) { el = document.createElement('img'); el.className = 'ipynb-img'; el.src = 'data:image/png;base64,' + data['image/png']; }
        else if (data['image/jpeg']) { el = document.createElement('img'); el.className = 'ipynb-img'; el.src = 'data:image/jpeg;base64,' + data['image/jpeg']; }
        else if (data['text/html']) { el = document.createElement('div'); el.className = 'ipynb-html'; el.innerHTML = DOMPurify.sanitize(Array.isArray(data['text/html']) ? data['text/html'].join('') : data['text/html'], { USE_PROFILES: { html: true, mathMl: true }, FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form'] }); }
        else if (data['text/plain'] || out.text) { el = document.createElement('pre'); el.className = 'ipynb-text'; el.textContent = Array.isArray(data['text/plain']) ? data['text/plain'].join('') : (data['text/plain'] || (Array.isArray(out.text) ? out.text.join('') : out.text)); }
        else if (out.ename) { el = document.createElement('pre'); el.className = 'ipynb-text error'; el.textContent = out.ename + ': ' + (Array.isArray(out.evalue) ? out.evalue.join('') : (out.evalue || '')) + '\n' + (Array.isArray(out.traceback) ? out.traceback.join('\n') : ''); }
        if (el) { el.classList.add('ipynb-out'); box.appendChild(el); }
      });
      els.content.appendChild(box);
    } else {
      var raw = document.createElement('pre'); raw.className = 'ipynb-text'; raw.textContent = src; els.content.appendChild(raw);
    }
  });
  buildOutlineFrom(els.content);
  await hydrateImages(els.content, dirname(node.path));
  updateStatusInfo('Notebook · ' + cells.length + ' 个单元格');
  updateStats('', cells.length + ' 个单元格');
  finishProgress();
}
async function renderImage(node) {
  var blob = await getBlob(node);
  var want = mimeOf(node.name);
  if (blob && want.indexOf('image/') === 0 && blob.type !== want) blob = new Blob([blob], { type: want });
  if (S.current !== node) return;
  S.currentBlob = blob; S.currentURL = newURL(blob);
  setContent('image'); clearContent();
  var stage = document.createElement('div'); stage.className = 'image-stage';
  var img = document.createElement('img'); img.alt = node.name; img.src = S.currentURL;
  stage.appendChild(img); els.content.appendChild(stage);
  var meta = document.createElement('div'); meta.className = 'media-meta'; meta.textContent = node.name + ' · ' + fmtSize(blob.size);
  els.content.appendChild(meta);
  img.addEventListener('load', function () {
    meta.textContent = extOf(node.name).toUpperCase() + ' · ' + img.naturalWidth + '×' + img.naturalHeight + ' · ' + fmtSize(blob.size);
    updateStatusInfo(extOf(node.name).toUpperCase() + ' · ' + img.naturalWidth + '×' + img.naturalHeight + ' · ' + fmtSize(blob.size));
  });
  img.addEventListener('error', function () { showError('图片无法显示', '浏览器可能不支持 ' + extOf(node.name).toUpperCase() + ' 格式'); });
  img.addEventListener('click', function () { openLightbox(S.currentURL, node.name); });
  updateStatusInfo(extOf(node.name).toUpperCase() + ' · ' + fmtSize(blob.size));
  updateStats('', extOf(node.name).toUpperCase() + ' · ' + fmtSize(blob.size));
  finishProgress();
}
async function renderAudio(node) {
  var blob = await getBlob(node);
  if (S.current !== node) return;
  S.currentBlob = blob; S.currentURL = newURL(blob);
  setContent('audio'); clearContent();
  var card = document.createElement('div'); card.className = 'audio-card';
  card.innerHTML = '<div class="audio-icon">' + icon('audio') + '</div><div class="media-meta">' + esc(node.name) + '<br>' + fmtSize(blob.size) + '</div>';
  var au = document.createElement('audio'); au.controls = true; au.src = S.currentURL; au.className = 'media-player';
  au.addEventListener('error', function () { showError('音频无法播放', '浏览器可能不支持此音频格式'); });
  card.appendChild(au); els.content.appendChild(card);
  updateStatusInfo('音频 · ' + extOf(node.name).toUpperCase() + ' · ' + fmtSize(blob.size));
  updateStats('', '音频 · ' + fmtSize(blob.size));
  finishProgress();
}
async function renderVideo(node) {
  var blob = await getBlob(node);
  if (S.current !== node) return;
  S.currentBlob = blob; S.currentURL = newURL(blob);
  setContent('video'); clearContent();
  var v = document.createElement('video'); v.controls = true; v.src = S.currentURL; v.className = 'media-player'; v.style.maxHeight = 'calc(100vh - 170px)';
  v.addEventListener('error', function () { showError('视频无法播放', '浏览器可能不支持此视频格式'); });
  els.content.appendChild(v);
  var meta = document.createElement('div'); meta.className = 'media-meta'; meta.textContent = node.name + ' · ' + fmtSize(blob.size); els.content.appendChild(meta);
  updateStatusInfo('视频 · ' + extOf(node.name).toUpperCase() + ' · ' + fmtSize(blob.size));
  updateStats('', '视频 · ' + fmtSize(blob.size));
  finishProgress();
}
async function renderPdf(node) {
  var blob = await getBlob(node);
  if (S.current !== node) return;
  S.currentBlob = blob; S.currentURL = newURL(blob);
  setContent('archive'); clearContent();
  els.content.className = 'doc pdf-body';
  var wrap = document.createElement('div'); wrap.className = 'pdf-wrap';
  wrap.innerHTML = '<div class="pdf-bar"><span>' + esc(node.name) + ' · ' + fmtSize(blob.size) + '</span><button class="btn small" type="button" data-act="open-new">' + icon('download') + '新标签页打开</button></div>';
  var fr = document.createElement('iframe'); fr.className = 'pdf-frame'; fr.title = node.name; fr.src = S.currentURL + '#view=FitH';
  wrap.appendChild(fr); els.content.appendChild(wrap);
  updateStatusInfo('PDF · ' + fmtSize(blob.size));
  updateStats('', 'PDF · ' + fmtSize(blob.size));
  finishProgress();
}
async function renderFont(node) {
  var blob = await getBlob(node);
  if (S.current !== node) return;
  S.currentBlob = blob; S.currentURL = newURL(blob);
  var name = 'SHEFont' + Date.now();
  try {
    var ff = new FontFace(name, 'url("' + S.currentURL + '")');
    await ff.load();
    document.fonts.add(ff);
  } catch (e) {
    showError('字体无法加载', e && e.message ? e.message : e);
    return;
  }
  S.fontFamily = name;
  setContent('font'); clearContent();
  var sample = 'The quick brown fox jumps over the lazy dog\n0123456789 !@#$%^&*()\n天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。\nABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz';
  var html = docToolbar('字体 · ' + extOf(node.name).toUpperCase() + ' · ' + fmtSize(blob.size), '') +
    '<div class="font-card"><div class="font-title">' + esc(node.name) + '</div><div class="font-sample" style="font-family:\'' + name + '\'"><div class="s1">Aa 字体</div><div class="s2">0123456789</div><div class="s3">' + esc(sample.split('\n').join(' · ')) + '</div></div></div>' +
    '<div class="font-card"><div class="font-title">自定义预览文本</div><textarea id="fontInput" class="font-input" rows="3">' + esc(sample) + '</textarea><div id="fontEdit" class="font-sample" style="font-family:\'' + name + '\'"><div class="s1" id="fontBig"></div><div class="s2" id="fontMid"></div><div class="s3" id="fontSmall"></div></div></div>';
  els.content.innerHTML = html;
  var input = $('#fontInput', els.content);
  var big = $('#fontBig', els.content), mid = $('#fontMid', els.content), small = $('#fontSmall', els.content);
  function paint() {
    var v = input.value || 'Aa 0123456789';
    big.textContent = v; mid.textContent = v; small.textContent = v;
  }
  input.addEventListener('input', paint); paint();
  updateStatusInfo('字体 · ' + extOf(node.name).toUpperCase() + ' · ' + fmtSize(blob.size));
  updateStats('', '字体 · ' + fmtSize(blob.size));
  finishProgress();
}
function renderBinary(node, blob, head) {
  S.currentBlob = blob; S.currentKind = 'binary'; updateChrome();
  setContent('text'); clearContent();
  var u8 = head || new Uint8Array(0);
  els.content.insertAdjacentHTML('beforeend', docToolbar('二进制 · ' + fmtSize(blob.size) + ' · ' + (mimeOf(node.name) || 'application/octet-stream'), '<button class="btn small" type="button" data-act="download-entry">' + icon('download') + '下载</button>'));
  var pre = document.createElement('pre'); pre.className = 'text-view hex-view';
  var html = '';
  for (var i = 0; i < u8.length; i += 16) {
    var off = i.toString(16).toUpperCase().padStart(8, '0'), hex = '', asc = '';
    for (var j = 0; j < 16; j++) {
      if (i + j < u8.length) {
        var b = u8[i + j];
        hex += b.toString(16).toUpperCase().padStart(2, '0') + (j === 7 ? '  ' : ' ');
        asc += b >= 32 && b < 127 ? String.fromCharCode(b) : '.';
      } else hex += '   ' + (j === 7 ? '  ' : '');
    }
    html += '<span class="off">' + off + '</span>  ' + hex + ' <span class="asc">' + esc(asc) + '</span>\n';
  }
  pre.innerHTML = html;
  els.content.appendChild(pre);
  if (blob.size > 8192) els.content.insertAdjacentHTML('beforeend', fallbackNote('仅显示前 8 KB，共 ' + fmtSize(blob.size)));
  updateStatusInfo('二进制 · ' + fmtSize(blob.size));
  updateStats('', '二进制 · ' + fmtSize(blob.size));
  finishProgress();
}
async function renderAuto(node) {
  var blob = await getBlob(node);
  if (S.current !== node) return;
  S.currentBlob = blob;
  var buf = await readBuffer(blob, 8192);
  var u8 = new Uint8Array(buf);
  if (sqliteHasHeader(u8)) {
    S.currentKind = 'sqlite'; updateChrome();
    await renderSqlite(node, blob);
    return;
  }
  if (looksBinary(u8)) { renderBinary(node, blob, u8); return; }
  S.currentKind = 'text';
  await renderText(node);
}
async function loadFileIntoView(node, opts) {
  opts = opts || {};
  if (!node) return;
  var token = ++S.openToken;
  var keep = !!opts.keepState;
  var tab = opts.tab || null;
  var parentZip = node.virtualParent ? S.zipCache : null;
  resetURLs();
  S.zipCache = parentZip || null;
  S.current = node;
  S.currentKind = kindOf(node.name);
  S.xlsx = null; S.db = null; S.dbTable = '';
  if (!keep) {
    var view = tab && tab.view;
    S.sourceMode = !!(view && view.sourceMode);
    S.wrap = view ? !!view.wrap : !!(S.settings && S.settings.wrap);
    S.encoding = view && view.encoding ? view.encoding : 'auto';
    S.decodedEncoding = '';
    S.fullMode = false; S.truncated = false;
    S.editMode = false; S.editDirty = false; S.editOriginal = ''; S.editText = ''; S.editSaving = false;
  }
  S.raw = ''; S.currentBlob = null; S.currentURL = ''; S.outline = []; S.outlineItems = []; S.activeHeading = -1; S.mathFallbacks = 0; S.fontFamily = '';
  if (node.virtualParent) renderTree(); else if (!node.readme) revealPath(node.path, true);
  updateActiveRow(node.virtualParent || node.readme ? null : node.path);
  updateBreadcrumb(); updateStatusPath(); updateChrome();
  els.scroll.scrollTop = 0;
  setProgress(8);
  showLoading('正在读取 ' + node.name + '…');
  try {
    if (!keep && tab && tab.edit && await restoreEditTab(tab, opts, token)) return;
    if (node.blob) S.currentBlob = node.blob;
    if (S.currentKind === 'md') await renderMarkdown(node, opts);
    else if (S.currentKind === 'text') await renderText(node, opts);
    else if (S.currentKind === 'json') await renderJson(node, opts);
    else if (S.currentKind === 'csv') await renderCsv(node, opts);
    else if (S.currentKind === 'html') await renderHtml(node, opts);
    else if (S.currentKind === 'ipynb') await renderIpynb(node, opts);
    else if (S.currentKind === 'image') await renderImage(node);
    else if (S.currentKind === 'audio') await renderAudio(node);
    else if (S.currentKind === 'video') await renderVideo(node);
    else if (S.currentKind === 'pdf') await renderPdf(node);
    else if (S.currentKind === 'font') await renderFont(node);
    else if (S.currentKind === 'archive') await renderArchive(node);
    else if (S.currentKind === 'sqlite') await renderSqlite(node);
    else await renderAuto(node);
    if (token !== S.openToken) return;
    if (!node.virtualParent && !node.readme && !opts.noHistory) { storeSet(LS.last, node.path); updateQuery(node.path); }
    updateChrome(); updatePrevNext(); updateOutlineActive();
    if (opts.anchor) setTimeout(function () { scrollToHeading(opts.anchor); }, 60);
  } catch (err) {
    if (token !== S.openToken) return;
    console.error(err);
    showError('无法打开 ' + node.name, err && err.message ? err.message : err);
    setProgress(0);
    updateChrome();
  }
}
function reopenCurrent() {
  var node = S.current;
  if (!node) return;
  openFile(node, { keepState: true, noHistory: true });
}
function updateQuery(path) {
  try {
    var base = location.href.split('#')[0].split('?')[0];
    history.replaceState(null, '', base + (path ? '?file=' + encodeURIComponent(path) : ''));
  } catch (e) {}
}
function openLightbox(src, caption) {
  if (!src) return;
  els.lightboxImg.src = src; els.lightboxCap.textContent = caption || '';
  els.lightbox.classList.add('show'); S.lightboxOpen = true;
}
function closeLightbox() {
  els.lightbox.classList.remove('show'); els.lightboxImg.src = ''; S.lightboxOpen = false;
}
