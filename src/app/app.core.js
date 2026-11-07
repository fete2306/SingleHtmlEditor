(function () {
'use strict';

var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var collator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });
var MAX_TEXT = 5 * 1024 * 1024;
var MAX_ENTRIES = 2000;
var MAX_ZIP_BYTES = 200 * 1024 * 1024;
var MAX_EXTRACT = 200 * 1024 * 1024;
var SCAN_DEFAULT = { files: 10000, depth: 24 };
var SKIP = { 'node_modules': 1, '.git': 1, '.svn': 1, '.hg': 1, '.idea': 1, '.vscode': 1, '__pycache__': 1, 'bower_components': 1, '$RECYCLE.BIN': 1, 'System Volume Information': 1 };

var S = {
  mode: 'welcome', rootName: '', root: null, files: [], fileByPath: new Map(), fileByPathLower: new Map(),
  dirByPath: new Map(), expanded: new Set(), current: null, raw: '', currentBlob: null, currentKind: '',
  sourceMode: false, outline: [], outlineItems: [], activeHeading: -1, filter: '', paletteOpen: false,
  paletteMatches: [], paletteIndex: 0, lightboxOpen: false, theme: 'dark', themeMode: 'system', toastTimer: 0, openToken: 0,
  scrollRaf: 0, objectURLs: [], docURLs: [], imageCache: new Map(), zipCache: null, rootHandle: null,
  dirHandleCache: new Map(), fileMap: null, fileMapLower: null, fileMapByName: null, readmeText: '', sampleText: '', recentFolders: [],
  truncated: false, fullMode: false, encoding: 'auto', decodedEncoding: '', mathFallbacks: 0, stats: null,
  wrap: false, scanLimited: false, scanLimitedDepth: false, scanCount: 0,
  scanApplied: { maxFiles: SCAN_DEFAULT.files, maxDepth: SCAN_DEFAULT.depth, fileLimited: false, depthLimited: false },
  fontFamily: '', preloadBytes: 0,
  currentURL: '', progressTimer: 0, xlsx: null, rawDeflate: false, db: null, dbTable: '',
  editMode: false, editDirty: false, editOriginal: '', editText: '', editSaving: false,
  settings: null, settingsOpen: false, tabs: [], activeTab: null
};

var els = {};
['sidebar','tree','scanNotice','filter','filterBox','filterClear','rootName','modePill','fileTotal','sideHint','content','welcome','welcomeMeta','welcomeSample','welcomeOpen','welcomeFiles','welcomeHelp','welcomePalette','scroll','crumbs','main','outline','outlineList','progressBar','statusMode','statusPath','statusInfo','statusStats','statusDot','palette','paletteInput','paletteList','lightbox','lightboxImg','lbCaption','lbClose','toast','dropOverlay','fileInput','folderInput','activitybar','btnExplorer','btnActivityPalette','btnActivityHelp','btnActivityTheme','btnActivitySettings','btnTheme','btnSource','btnOutline','btnCopyPath','btnPalette','btnOpenDir','btnOpenFiles','btnOpenDir2','btnOpenFiles2','btnRefresh','btnCollapse','btnMenu','btnOutlineClose','backdrop','resizer','btnPrev','btnNext','btnDownload','btnWrap','encoding','btnEdit','tabbar','tabstrip','settings','settingsClose','settingsTheme','settingsFontSize','settingsFontSizeValue','settingsLineHeight','settingsLineHeightValue','settingsReadWidth','settingsReadWidthValue','settingsWrap','settingsAutoRestore','settingsConfirmClose','settingsMaxFiles','settingsMaxDepth','settingsReset','settingsClearRecent','settingsHelp'].forEach(function (id) { els[id] = document.getElementById(id); });
els.lightboxClose = els.lbClose;
els.lightboxCap = els.lbCaption;

var LS = { theme: 'she.theme', themeMode: 'she.themeMode', settings: 'she.settings', last: 'she.last', width: 'she.sideWidth' };
var MODES = { welcome: { label: '欢迎', cls: 'mode-welcome' }, live: { label: '实时', cls: 'live' }, files: { label: '已载入', cls: 'files' } };

var MD_EXT = { md: 1, markdown: 1, mdown: 1, mkd: 1, mkdn: 1, mdx: 1, mdtxt: 1, mdtext: 1 };
var JSON_EXT = { json: 1, jsonc: 1, json5: 1, jsonl: 1, ndjson: 1 };
var CSV_EXT = { csv: 1, tsv: 1 };
var HTML_EXT = { html: 1, htm: 1, xhtml: 1 };
var DB_EXT = { db: 1, sqlite: 1, sqlite3: 1, db3: 1, s3db: 1, sl3: 1 };
var IMAGE_EXT = { png: 1, jpg: 1, jpeg: 1, jpe: 1, jfif: 1, gif: 1, webp: 1, bmp: 1, ico: 1, cur: 1, svg: 1, avif: 1, apng: 1, tif: 1, tiff: 1, heic: 1, heif: 1 };
var AUDIO_EXT = { mp3: 1, wav: 1, ogg: 1, oga: 1, m4a: 1, m4b: 1, aac: 1, flac: 1, opus: 1, weba: 1 };
var VIDEO_EXT = { mp4: 1, m4v: 1, webm: 1, ogv: 1, mov: 1 };
var FONT_EXT = { ttf: 1, otf: 1, woff: 1, woff2: 1 };
var ARCHIVE_EXT = { zip: 1, epub: 1, docx: 1, xlsx: 1, pptx: 1, odt: 1, jar: 1, apk: 1 };
var CODE_EXT = { txt: 1, text: 1, log: 1, ini: 1, cfg: 1, conf: 1, config: 1, env: 1, yaml: 1, yml: 1, toml: 1, xml: 1, xsl: 1, xslt: 1, xsd: 1, dtd: 1, plist: 1, properties: 1, lock: 1, css: 1, scss: 1, sass: 1, less: 1, styl: 1, js: 1, mjs: 1, cjs: 1, jsx: 1, ts: 1, tsx: 1, vue: 1, svelte: 1, astro: 1, py: 1, pyw: 1, pyi: 1, java: 1, c: 1, h: 1, cc: 1, cpp: 1, cxx: 1, hpp: 1, hh: 1, hxx: 1, cs: 1, go: 1, rs: 1, rb: 1, php: 1, sh: 1, bash: 1, zsh: 1, fish: 1, ps1: 1, psm1: 1, bat: 1, cmd: 1, sql: 1, lua: 1, swift: 1, kt: 1, kts: 1, scala: 1, clj: 1, cljs: 1, cljc: 1, ex: 1, exs: 1, erl: 1, hrl: 1, hs: 1, lhs: 1, ml: 1, mli: 1, fs: 1, fsx: 1, fsi: 1, dart: 1, r: 1, jl: 1, pl: 1, pm: 1, asm: 1, s: 1, v: 1, sv: 1, vh: 1, vhd: 1, vhdl: 1, proto: 1, graphql: 1, gql: 1, tex: 1, latex: 1, bib: 1, sty: 1, cls: 1, srt: 1, vtt: 1, ass: 1, ssa: 1, m3u: 1, m3u8: 1, diff: 1, patch: 1, gitignore: 1, gitattributes: 1, dockerfile: 1, makefile: 1, cmake: 1, mk: 1, gradle: 1, csproj: 1, fsproj: 1, sln: 1, nfo: 1, md5: 1, sha1: 1, sha256: 1, asc: 1, pem: 1, crt: 1, cer: 1, key: 1, pub: 1, out: 1, err: 1, rtf: 1, fb2: 1 };

function extOf(name) { var p = String(name || ''); var i = p.lastIndexOf('.'); return i < 0 ? '' : p.slice(i + 1).toLowerCase(); }
function stemOf(name) { var p = String(name || ''); var i = p.lastIndexOf('.'); return i < 0 ? p : p.slice(0, i); }
function kindOf(name) {
  var e = extOf(name);
  if (MD_EXT[e]) return 'md';
  if (JSON_EXT[e]) return 'json';
  if (CSV_EXT[e]) return 'csv';
  if (HTML_EXT[e]) return 'html';
  if (DB_EXT[e]) return 'sqlite';
  if (e === 'ipynb') return 'ipynb';
  if (IMAGE_EXT[e]) return 'image';
  if (AUDIO_EXT[e]) return 'audio';
  if (VIDEO_EXT[e]) return 'video';
  if (FONT_EXT[e]) return 'font';
  if (ARCHIVE_EXT[e]) return 'archive';
  if (e === 'pdf') return 'pdf';
  if (CODE_EXT[e]) return 'text';
  return 'auto';
}
function isBuiltin(node) { return !!(node && (node.readme || node.sample)); }
function builtinLabel(node) { return node && node.sample ? '示例文档' : '使用说明'; }
function kindLabel(kind, name) {
  var e = extOf(name).toUpperCase();
  var m = { md: 'Markdown', text: '文本', json: 'JSON', csv: '表格', html: 'HTML', ipynb: 'Notebook', sqlite: 'SQLite', image: '图片', audio: '音频', video: '视频', pdf: 'PDF', font: '字体', archive: '压缩包', binary: '二进制', auto: '文件' };
  if (kind === 'archive' && e) return e;
  if (kind === 'image' && e) return e;
  if (kind === 'audio' && e) return e;
  if (kind === 'video' && e) return e;
  if (kind === 'font' && e) return e;
  return m[kind] || '文件';
}
function kindIcon(kind) {
  return ({ md: 'book', text: 'code', json: 'table', csv: 'table', html: 'code', ipynb: 'table', sqlite: 'table', image: 'image', audio: 'audio', video: 'video', pdf: 'pdf', font: 'font', archive: 'archive', binary: 'file' })[kind] || 'file';
}
function kindClass(kind) {
  return ({ md: 'k-md', text: 'k-code', json: 'k-table', csv: 'k-table', html: 'k-code', ipynb: 'k-table', sqlite: 'k-table', image: 'k-image', audio: 'k-audio', video: 'k-video', pdf: 'k-pdf', font: 'k-font', archive: 'k-archive', binary: 'k-binary' })[kind] || 'k-binary';
}
function mimeOf(name) {
  var e = extOf(name);
  var m = {
    md: 'text/markdown', markdown: 'text/markdown', mdown: 'text/markdown', mkd: 'text/markdown', mkdn: 'text/markdown', mdx: 'text/markdown',
    txt: 'text/plain', text: 'text/plain', log: 'text/plain', csv: 'text/csv', tsv: 'text/tab-separated-values', json: 'application/json', jsonc: 'application/json', json5: 'application/json',
    html: 'text/html', htm: 'text/html', xhtml: 'application/xhtml+xml', xml: 'application/xml', db: 'application/vnd.sqlite3', sqlite: 'application/vnd.sqlite3', sqlite3: 'application/vnd.sqlite3', db3: 'application/vnd.sqlite3', s3db: 'application/vnd.sqlite3', sl3: 'application/vnd.sqlite3',
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', jpe: 'image/jpeg', jfif: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp', ico: 'image/x-icon', cur: 'image/x-icon', svg: 'image/svg+xml', avif: 'image/avif', apng: 'image/apng', tif: 'image/tiff', tiff: 'image/tiff', heic: 'image/heic', heif: 'image/heif',
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', oga: 'audio/ogg', m4a: 'audio/mp4', m4b: 'audio/mp4', aac: 'audio/aac', flac: 'audio/flac', opus: 'audio/opus', weba: 'audio/webm',
    mp4: 'video/mp4', m4v: 'video/mp4', webm: 'video/webm', ogv: 'video/ogg', mov: 'video/quicktime',
    pdf: 'application/pdf', ttf: 'font/ttf', otf: 'font/otf', woff: 'font/woff', woff2: 'font/woff2',
    zip: 'application/zip', jar: 'application/java-archive', apk: 'application/vnd.android.package-archive', epub: 'application/epub+zip',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    odt: 'application/vnd.oasis.opendocument.text'
  };
  return m[e] || 'application/octet-stream';
}
function isTextKind(k) { return k === 'md' || k === 'text' || k === 'json' || k === 'csv' || k === 'html' || k === 'ipynb'; }
function hasSource(k) { return k === 'md' || k === 'json' || k === 'csv' || k === 'html' || k === 'ipynb'; }

function esc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function attr(v) { return esc(v).replace(/'/g, '&#39;'); }
function normPath(v) {
  var out = [];
  String(v == null ? '' : v).replace(/\\/g, '/').split('/').forEach(function (s) {
    if (!s || s === '.') return;
    if (s === '..') { if (out.length && out[out.length - 1] !== '..') out.pop(); else out.push('..'); }
    else out.push(s);
  });
  return out.join('/');
}
function dirname(p) { p = String(p || ''); var i = p.lastIndexOf('/'); return i < 0 ? '' : p.slice(0, i); }
function basename(p) { p = String(p || ''); var i = p.lastIndexOf('/'); return i < 0 ? p : p.slice(i + 1); }
function joinPath(base, rel) { return normPath((base ? base + '/' : '') + rel); }
function decodeSafe(v) { try { return decodeURIComponent(v); } catch (e) { return v; } }
function splitHash(href) { var m = /^([^#]*)(?:#([\s\S]*))?$/.exec(String(href || '')); return [m ? m[1] : '', m && m[2] ? m[2] : '']; }
function stripBom(s) { return s && s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s; }
function slugify(v) {
  var s = String(v || '').toLowerCase().trim();
  s = s.replace(/[\s\u3000]+/g, '-');
  s = s.replace(/[^\w\u3400-\u9fff\uf900-\ufaff\-]+/g, '');
  s = s.replace(/^-+|-+$/g, '');
  return s;
}
function fmtSize(n) {
  n = Number(n);
  if (!isFinite(n) || n < 0) return '';
  if (n < 1024) return n + ' B';
  var u = ['B', 'KB', 'MB', 'GB', 'TB'], i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return (n >= 10 ? Math.round(n) : n.toFixed(1)) + ' ' + u[i];
}
function fmtNum(n) { try { return Number(n).toLocaleString('zh-CN'); } catch (e) { return String(n); } }
function storeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function storeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function icon(id) { return '<svg class="i" aria-hidden="true"><use href="#i-' + id + '"></use></svg>'; }
function toast(msg, ms) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  clearTimeout(S.toastTimer);
  S.toastTimer = setTimeout(function () { els.toast.classList.remove('show'); }, ms || 2600);
}
function setProgress(p) {
  p = Math.max(0, Math.min(100, p || 0));
  els.progressBar.style.width = p + '%';
}
function copyText(text, btn) {
  var done = function () {
    if (!btn) return;
    var label = btn.querySelector('span');
    var old = label ? label.textContent : '';
    btn.classList.add('copied');
    if (label) label.textContent = '已复制';
    setTimeout(function () { btn.classList.remove('copied'); if (label) label.textContent = old || '复制'; }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
  } else { fallbackCopy(text); done(); }
}
function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-5000px'; ta.style.top = '0';
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  ta.remove();
}
function revokeURLs(list) { list.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} }); list.length = 0; }
function newURL(blob) { var u = URL.createObjectURL(blob); S.objectURLs.push(u); return u; }
function newDocURL(blob) { var u = URL.createObjectURL(blob); S.docURLs.push(u); return u; }
function resetURLs() { revokeURLs(S.objectURLs); revokeURLs(S.docURLs); S.imageCache.clear(); S.zipCache = null; }
function setContent(kind) {
  els.content.className = 'doc ' + (kind === 'md' ? 'markdown-body' : kind === 'text' || kind === 'binary' ? 'plain-body' : kind === 'image' || kind === 'audio' || kind === 'video' || kind === 'pdf' ? 'media-body' : kind === 'font' ? 'font-body' : kind === 'archive' || kind === 'html' || kind === 'sqlite' ? 'doc-body' : 'markdown-body');
  els.content.hidden = false;
  els.welcome.hidden = true;
}
function clearContent() { els.content.innerHTML = ''; }
function showLoading(label) {
  setContent('md');
  clearContent();
  var d = document.createElement('div'); d.className = 'doc-loading';
  d.innerHTML = '<div class="spinner"></div><span>' + esc(label || '正在读取文件…') + '</span>';
  els.content.appendChild(d);
}
function showError(title, msg) {
  setContent('md'); clearContent();
  var d = document.createElement('div'); d.className = 'doc-error';
  var h = document.createElement('h3'); h.textContent = title;
  var p = document.createElement('p'); p.textContent = String(msg == null ? '' : msg);
  d.appendChild(h); d.appendChild(p); els.content.appendChild(d);
}

function finalizeTree(node) {
  if (!node) return 0;
  if (node.type === 'file') { node.count = 1; return 1; }
  node.children.sort(function (a, b) {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return collator.compare(a.name, b.name);
  });
  var total = 0;
  for (var i = 0; i < node.children.length; i++) total += finalizeTree(node.children[i]);
  node.count = total;
  return total;
}

function collectNode(node) {
  if (node.type === 'file') {
    S.files.push(node);
    S.fileByPath.set(node.path, node);
    S.fileByPathLower.set(node.path.toLowerCase(), node);
    return;
  }
  S.dirByPath.set(node.path, node);
  node.children.forEach(collectNode);
}
function findFile(path) {
  var p = normPath(decodeSafe(String(path || '').split('#')[0].split('?')[0]));
  if (!p) return null;
  return S.fileByPath.get(p) || S.fileByPathLower.get(p.toLowerCase()) || null;
}
function revealPath(path, rerender) {
  var d = dirname(path), changed = false;
  while (d) {
    if (!S.expanded.has(d)) { S.expanded.add(d); changed = true; }
    d = dirname(d);
  }
  if (changed && rerender !== false) renderTree();
  return changed;
}
function subtreeMatches(node, q) {
  if (node.type === 'file') return (node.path + ' ' + node.name).toLowerCase().indexOf(q) >= 0;
  for (var i = 0; i < node.children.length; i++) if (subtreeMatches(node.children[i], q)) return true;
  return false;
}
function makeRow(node, depth, open) {
  var row = document.createElement('div');
  row.className = 'tree-row';
  row.dataset.path = node.path;
  row.dataset.type = node.type;
  row.tabIndex = 0;
  row.setAttribute('role', 'treeitem');
  if (node.type === 'dir') {
    row.setAttribute('aria-expanded', String(!!open));
    if (open) row.classList.add('open');
    if (!node.count) row.classList.add('empty-dir');
  }
  for (var i = 0; i < depth; i++) { var g = document.createElement('span'); g.className = 'guide'; row.appendChild(g); }
  var ch = document.createElement('span');
  ch.className = 'tree-chevron' + (node.type === 'file' ? ' spacer' : '');
  if (node.type === 'dir') ch.innerHTML = icon('chevron');
  row.appendChild(ch);
  var ic = document.createElement('span');
  if (node.type === 'dir') { ic.className = 'tree-icon folder'; ic.innerHTML = icon(open ? 'folder-open' : 'folder'); }
  else { var k = kindOf(node.name); ic.className = 'tree-icon file ' + kindClass(k); ic.innerHTML = icon(kindIcon(k)); }
  row.appendChild(ic);
  var nm = document.createElement('span'); nm.className = 'tree-name'; nm.textContent = node.name; nm.title = node.path || node.name; row.appendChild(nm);
  if (node.type === 'dir' && node.count) { var c = document.createElement('span'); c.className = 'tree-count'; c.textContent = node.count; row.appendChild(c); }
  if (S.current && !isBuiltin(S.current) && node.type === 'file' && node.path === S.current.path) row.classList.add('active');
  return row;
}
function buildRows(nodes, depth, q, frag) {
  nodes.forEach(function (node) {
    if (node.type === 'file') {
      if (q && (node.path + ' ' + node.name).toLowerCase().indexOf(q) < 0) return;
      frag.appendChild(makeRow(node, depth, false));
      return;
    }
    if (q && !subtreeMatches(node, q)) return;
    var open = q ? true : S.expanded.has(node.path);
    frag.appendChild(makeRow(node, depth, open));
    if (open) buildRows(node.children, depth + 1, q, frag);
  });
}
function renderTree() {
  var frag = document.createDocumentFragment();
  if (S.root) buildRows(S.root.children, 0, S.filter, frag);
  els.tree.innerHTML = '';
  els.tree.appendChild(frag);
  if (!els.tree.children.length) {
    var e = document.createElement('div'); e.className = 'tree-empty';
    e.textContent = S.filter ? '没有匹配的文件' : (S.root ? '这个文件夹里没有可显示的文件' : '打开文件夹或文件后显示在这里');
    els.tree.appendChild(e);
  }
}
function toggleDir(path) {
  if (S.expanded.has(path)) S.expanded.delete(path); else S.expanded.add(path);
  renderTree();
  var row = $$('.tree-row', els.tree).filter(function (r) { return r.dataset.path === path; })[0];
  if (row) row.focus();
}
function activateRow(row, pin) {
  if (!row) return;
  if (row.dataset.type === 'dir') { toggleDir(row.dataset.path); return; }
  var node = findFile(row.dataset.path);
  if (node) openFile(node, pin ? { pinned: true } : undefined);
}
function updateActiveRow(path) {
  $$('.tree-row.active', els.tree).forEach(function (r) { r.classList.remove('active'); });
  if (!path || isBuiltin(S.current)) return;
  var t = $$('.tree-row', els.tree).filter(function (r) { return r.dataset.type === 'file' && r.dataset.path === path; })[0];
  if (t) t.classList.add('active');
}

function fileCountText() {
  var count = S.scanLimited ? fmtNum(S.scanApplied.maxFiles) + '+' : fmtNum(S.files.length);
  return count + ' 个文件';
}
function scanNoticeText() {
  var parts = [];
  if (S.scanLimited) parts.push('仅显示前 ' + fmtNum(S.scanApplied.maxFiles) + ' 个文件，可在设置中调整上限');
  if (S.scanLimitedDepth) parts.push('已到 ' + fmtNum(S.scanApplied.maxDepth) + ' 层目录深度限制，可在设置中调整');
  return parts.join('；');
}
function renderScanNotice() {
  if (!els.scanNotice) return;
  var text = S.mode === 'welcome' ? '' : scanNoticeText();
  els.scanNotice.hidden = !text;
  els.scanNotice.textContent = text;
  els.scanNotice.title = text;
}
function updateModeStatus() {
  var mode = MODES[S.mode] || MODES.welcome;
  els.statusMode.textContent = mode.label + ' · ' + (S.mode === 'welcome' ? '0 个文件' : fileCountText());
  els.statusDot.className = 'status-dot ' + mode.cls;
  if (S.mode === 'live') els.statusDot.title = '已连接文件夹，内容实时读取';
  else if (S.mode === 'files') els.statusDot.title = '已载入文件夹或文件';
  else if (S.mode === 'welcome') els.statusDot.title = '欢迎页，未打开文件夹';
  else els.statusDot.title = '未打开';
}
function updateSidebarMeta() {
  var mode = MODES[S.mode] || MODES.welcome;
  els.rootName.textContent = S.rootName || '未打开';
  els.modePill.textContent = mode.label;
  els.modePill.className = 'mode-pill ' + mode.cls;
  els.fileTotal.textContent = fileCountText();
  if (S.mode === 'live') {
    els.sideHint.textContent = S.scanLimited || S.scanLimitedDepth ? '实时读取 · 已按设置截断' : '实时读取 · 支持图片和相对链接';
    els.welcomeMeta.textContent = '已连接文件夹，包含 ' + fileCountText();
  } else if (S.mode === 'files') {
    els.sideHint.textContent = '已载入 ' + fileCountText();
    els.welcomeMeta.textContent = '已载入 ' + fileCountText();
  } else {
    els.sideHint.textContent = '拖入文件夹或文件';
    els.welcomeMeta.textContent = '打开文件夹或文件开始浏览';
  }
  renderScanNotice();
  updateModeStatus();
}
function updateChrome() {
  var has = !!S.current;
  var k = S.currentKind;
  var builtin = isBuiltin(S.current);
  var builtinName = builtinLabel(S.current);
  els.btnSource.disabled = !has || !hasSource(k) || S.editMode;
  els.btnSource.hidden = !has || !hasSource(k) || S.editMode;
  els.btnSource.classList.toggle('active', !!S.sourceMode);
  els.btnOutline.disabled = !has || !S.outline.length;
  els.btnCopyPath.disabled = !has || builtin;
  els.btnDownload.disabled = !has || builtin;
  els.btnCopyPath.title = builtin ? builtinName + '不可复制路径' : '复制路径';
  els.btnDownload.title = builtin ? builtinName + '不可下载' : '下载当前文件';
  els.btnPrev.disabled = !has;
  els.btnNext.disabled = !has;
  els.btnWrap.hidden = !has || !(S.editMode || k === 'text' || k === 'json' || k === 'csv');
  els.btnWrap.classList.toggle('active', S.wrap);
  els.encoding.hidden = !has || !isTextKind(k) || builtin;
  els.encoding.disabled = !!S.editMode;
  els.encoding.value = S.encoding;
  if (els.btnEdit) {
    els.btnEdit.hidden = !has || !isTextKind(k) || builtin;
    els.btnEdit.disabled = !has || S.truncated || S.editSaving || builtin;
    els.btnEdit.classList.toggle('active', !!S.editMode && !builtin);
    els.btnEdit.title = builtin ? builtinName + '不可编辑' : (S.editMode ? '退出编辑 (Ctrl+S 保存)' : (S.truncated ? '文件已截断，先加载完整内容再编辑' : '编辑文本'));
  }
}
function updateBreadcrumb() {
  els.crumbs.innerHTML = '';
  if (isBuiltin(S.current)) {
    var label = builtinLabel(S.current);
    var help = document.createElement('span'); help.className = 'crumb file'; help.textContent = label; help.title = label; els.crumbs.appendChild(help);
    return;
  }
  if (!S.rootName) return;
  var root = document.createElement('span'); root.className = 'crumb root'; root.textContent = S.rootName; root.title = S.rootName; els.crumbs.appendChild(root);
  if (!S.current) return;
  S.current.path.split('/').forEach(function (seg, i, arr) {
    var sep = document.createElement('span'); sep.className = 'crumb-sep'; sep.innerHTML = icon('chevron'); els.crumbs.appendChild(sep);
    var c = document.createElement('span'); c.className = 'crumb' + (i === arr.length - 1 ? ' file' : ''); c.textContent = seg; c.title = seg; els.crumbs.appendChild(c);
  });
}
function updateStatusPath() {
  var dirty = S.editDirty ? ' · 未保存' : '';
  var builtin = isBuiltin(S.current);
  var label = builtin ? builtinLabel(S.current) : (S.current ? S.current.path : '');
  els.statusPath.textContent = S.current ? label + dirty : '未打开文件';
  els.statusPath.title = S.current ? label : '';
  document.title = S.current ? (S.editDirty ? '● ' : '') + (builtin ? label : S.current.name) + ' · SingleHtmlEditor' : 'SingleHtmlEditor' + (S.rootName ? ' · ' + S.rootName : '');
}
function updateStatusInfo(info) {
  els.statusInfo.textContent = info || '';
}
function updateStats(raw, custom) {
  if (custom) { els.statusStats.textContent = custom; return; }
  if (!raw) { els.statusStats.textContent = ''; S.stats = null; return; }
  var lines = raw.split(/\r\n|\r|\n/).length;
  var plain = raw.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/<[^>]+>/g, ' ');
  var cjk = (plain.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
  var words = (plain.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length;
  S.stats = { chars: cjk + words, lines: lines };
  els.statusStats.textContent = fmtNum(cjk + words) + ' 字 · ' + fmtNum(lines) + ' 行';
}
function showWelcome(message) {
  if (!S.mode) S.mode = 'welcome';
  S.current = null; S.raw = ''; S.currentBlob = null; S.currentKind = ''; S.sourceMode = false; S.stats = null; S.outline = []; S.activeHeading = -1; S.mathFallbacks = 0;
  S.editMode = false; S.editDirty = false; S.editOriginal = ''; S.editText = ''; S.db = null; S.dbTable = '';
  S.activeTab = null;
  renderOutline(); renderTabBar(); renderRecentPanel(); els.content.hidden = true; els.content.innerHTML = ''; els.welcome.hidden = false;
  updateSidebarMeta(); updateBreadcrumb(); updateChrome(); updateStatusPath(); updateStatusInfo(''); updateStats(''); setProgress(0); updateActiveRow(null);
  els.scroll.scrollTop = 0;
  if (message) els.welcomeMeta.textContent = message;
}

function activateTree(root, mode, opts) {
  opts = opts || {};
  resetURLs();
  S.mode = mode; S.rootName = opts.rootName || root.name || '工作区'; S.root = root; S.files = []; S.tabs = []; S.activeTab = null;
  S.fileByPath = new Map(); S.fileByPathLower = new Map(); S.dirByPath = new Map(); S.expanded = new Set();
  S.current = null; S.raw = ''; S.currentBlob = null; S.currentKind = ''; S.sourceMode = false; S.stats = null;
  S.outline = []; S.outlineItems = []; S.activeHeading = -1; S.mathFallbacks = 0; S.truncated = false; S.fullMode = false; S.wrap = false; S.filter = '';
  S.editMode = false; S.editDirty = false; S.editOriginal = ''; S.editText = ''; S.editSaving = false; S.db = null; S.dbTable = '';
  S.imageCache = new Map(); S.dirHandleCache = new Map(); S.encoding = 'auto'; S.decodedEncoding = ''; S.zipCache = null;
  if (mode !== 'live') S.rootHandle = null;
  if (mode !== 'files') { S.fileMap = null; S.fileMapLower = null; S.fileMapByName = null; }
  collectNode(root);
  S.files.sort(function (a, b) { return collator.compare(a.path, b.path); });
  if (S.files.length <= 150) {
    S.dirByPath.forEach(function (d) { if (d.path) S.expanded.add(d.path); });
  } else {
    S.dirByPath.forEach(function (d) { if (d.path && d.path.indexOf('/') < 0) S.expanded.add(d.path); });
  }
  els.filter.value = ''; els.filterBox.classList.remove('has-value'); S.filter = '';
  updateSidebarMeta(); updateChrome(); renderTree();
  var target = opts.preferPath ? findFile(opts.preferPath) : null;
  if (target) { revealPath(target.path, false); renderTree(); return openFile(target, { anchor: opts.anchor || '' }); }
  updateQuery('');
  showWelcome(S.files.length ? '' : '没有找到可显示的文件');
  return Promise.resolve(true);
}
function updatePrevNext() {
  var idx = S.current ? S.files.indexOf(S.current) : -1;
  els.btnPrev.disabled = idx <= 0;
  els.btnNext.disabled = idx < 0 || idx >= S.files.length - 1;
}
function goFile(delta) {
  if (!S.current) return;
  var idx = S.files.indexOf(S.current);
  var next = S.files[idx + delta];
  if (next) openFile(next);
}

function newScanLimits() {
  var settings = S.settings || {};
  return {
    maxFiles: Number(settings.maxFiles) || SCAN_DEFAULT.files,
    maxDepth: Number(settings.maxDepth) || SCAN_DEFAULT.depth,
    fileLimited: false,
    depthLimited: false
  };
}
function scanDir(handle, prefix, name, depth, limit) {
  var node = { type: 'dir', name: name, path: prefix, children: [], handle: handle };
  if (depth > limit.maxDepth) { limit.depthLimited = true; return Promise.resolve(node); }
  if (S.scanCount >= limit.maxFiles) { limit.fileLimited = true; return Promise.resolve(node); }
  var entries = [];
  return (async function () {
    try {
      for await (var pair of handle.entries()) {
        var n = pair[0], h = pair[1];
        if (SKIP[n] || n.slice(0, 2) === '~$') continue;
        entries.push([n, h]);
      }
    } catch (e) {}
    entries.sort(function (a, b) {
      if (a[1].kind !== b[1].kind) return a[1].kind === 'directory' ? -1 : 1;
      return collator.compare(a[0], b[0]);
    });
    for (var i = 0; i < entries.length; i++) {
      if (S.scanCount >= limit.maxFiles) { limit.fileLimited = true; break; }
      var en = entries[i][0], eh = entries[i][1], p = prefix ? prefix + '/' + en : en;
      if (eh.kind === 'directory') node.children.push(await scanDir(eh, p, en, depth + 1, limit));
      else { node.children.push({ type: 'file', name: en, path: p, handle: eh }); S.scanCount++; }
    }
    return node;
  })();
}
function useDirectoryHandle(handle, opts) {
  opts = opts || {};
  if (!confirmDiscardTabs('切换文件夹')) return Promise.resolve(false);
  toast('正在扫描文件夹…', 1600);
  els.statusMode.textContent = '扫描中…';
  S.scanCount = 0; S.scanLimited = false; S.scanLimitedDepth = false;
  var limit = newScanLimits();
  S.scanApplied = limit;
  var prefer = opts.preferPath || (opts.preserve && S.current && !isBuiltin(S.current) ? S.current.path : null);
  return scanDir(handle, '', handle.name, 0, limit).then(function (root) {
    S.rootHandle = handle;
    S.scanLimited = limit.fileLimited;
    S.scanLimitedDepth = limit.depthLimited;
    activateTree(root, 'live', { rootName: handle.name, preferPath: prefer });
    var n = S.files.length;
    var notice = scanNoticeText();
    toast(n ? '已载入 ' + fileCountText() + (notice ? '（已按设置截断）' : '') : '这个文件夹里没有可显示的文件', 2600);
    rememberFolder(handle);
    return true;
  }).catch(function (err) {
    console.warn(err);
    toast('无法读取文件夹：' + (err && err.message ? err.message : err), 3600);
    return false;
  });
}
function useFileItems(items, rootName) {
  if (!items || !items.length) return Promise.resolve(false);
  if (!confirmDiscardTabs('重新选择文件')) return Promise.resolve(false);
  if (!rootName) rootName = '已打开的文件';
  var strip = rootName + '/';
  var sameRoot = items.every(function (it) { return String(it.path).indexOf(strip) === 0; });
  var root = { type: 'dir', name: rootName, path: '', children: [] };
  var dirs = new Map([['', root]]);
  var fileMap = new Map(), fileMapLower = new Map(), fileMapByName = new Map();
  var seen = new Map();
  var limit = newScanLimits();
  var accepted = 0;
  items.forEach(function (it) {
    var rel = normPath(sameRoot ? String(it.path).slice(strip.length) : it.path);
    if (!rel) return;
    var segs = rel.split('/');
    if (segs.length - 1 > limit.maxDepth) { limit.depthLimited = true; return; }
    if (accepted >= limit.maxFiles) { limit.fileLimited = true; return; }
    var cur = root, prefix = '';
    for (var i = 0; i < segs.length - 1; i++) {
      prefix = prefix ? prefix + '/' + segs[i] : segs[i];
      var d = dirs.get(prefix);
      if (!d) { d = { type: 'dir', name: segs[i], path: prefix, children: [] }; dirs.set(prefix, d); cur.children.push(d); }
      cur = d;
    }
    var nm = segs[segs.length - 1];
    if (seen.has(rel)) rel = rel.replace(/(\.[^.\/]+)?$/, '-' + (seen.get(rel) + 1) + '$1');
    seen.set(rel, (seen.get(rel) || 0) + 1);
    var fnode = { type: 'file', name: nm, path: rel, file: it.file, size: it.file.size, mtime: it.file.lastModified };
    cur.children.push(fnode);
    accepted++;
    fileMap.set(rel, it.file);
    fileMapLower.set(rel.toLowerCase(), it.file);
    var bn = nm.toLowerCase();
    if (!fileMapByName.has(bn)) fileMapByName.set(bn, it.file);
  });
  if (!root.children.length) {
    if (limit.depthLimited) toast('所选文件超过了设置中的目录深度限制', 3000);
    return Promise.resolve(false);
  }
  finalizeTree(root);
  S.scanCount = accepted;
  S.scanLimited = limit.fileLimited;
  S.scanLimitedDepth = limit.depthLimited;
  S.scanApplied = limit;
  S.fileMap = fileMap; S.fileMapLower = fileMapLower; S.fileMapByName = fileMapByName;
  return activateTree(root, 'files', { rootName: rootName }).then(function (ok) {
    if (limit.fileLimited || limit.depthLimited) toast('已按设置截断文件列表，可在设置中调整限制', 2800);
    return ok;
  });
}
function useFileList(list, rootName) {
  var files = Array.prototype.slice.call(list || []);
  if (!files.length) return;
  var paths = files.map(function (f) { return normPath(f.webkitRelativePath || f.name); });
  if (!rootName) {
    var first = paths[0].split('/');
    var common = first.length > 1 && paths.every(function (p) { return p.indexOf(first[0] + '/') === 0; });
    rootName = common ? first[0] : (files.length === 1 ? '已打开的文件' : '已打开的文件');
  }
  return useFileItems(files.map(function (f, i) { return { file: f, path: paths[i] }; }), rootName);
}
function collectEntries(entry, prefix, out) {
  return new Promise(function (resolve) {
    if (!entry) return resolve();
    if (entry.isFile) {
      entry.file(function (f) { out.push({ file: f, path: prefix ? prefix + '/' + entry.name : entry.name }); resolve(); }, function () { resolve(); });
      return;
    }
    if (entry.isDirectory) {
      var reader = entry.createReader(), all = [];
      var next = function () {
        reader.readEntries(function (batch) {
          if (!batch.length) {
            var ps = all.map(function (e) { return collectEntries(e, prefix ? prefix + '/' + entry.name : entry.name, out); });
            Promise.all(ps).then(function () { resolve(); });
            return;
          }
          all = all.concat(Array.prototype.slice.call(batch)); next();
        }, function () { resolve(); });
      };
      next(); return;
    }
    resolve();
  });
}
function useEntries(entries) {
  var list = Array.prototype.slice.call(entries || []).filter(Boolean);
  if (!list.length) return;
  var out = [];
  var rootName = list.length === 1 && list[0].isDirectory ? list[0].name : '拖入的文件';
  Promise.all(list.map(function (e) { return collectEntries(e, '', out); })).then(function () {
    if (!out.length) { toast('没有读取到文件'); return; }
    useFileItems(out, rootName);
  });
}
function pickFolder() {
  closeSidebarMobile();
  if (window.showDirectoryPicker) {
    window.showDirectoryPicker({ id: 'she-root', mode: 'readwrite' }).then(function (h) { if (h) useDirectoryHandle(h); }).catch(function (err) {
      if (err && err.name === 'AbortError') return;
      els.folderInput.value = ''; els.folderInput.click();
    });
  } else { els.folderInput.value = ''; els.folderInput.click(); }
}
function pickFiles() { closeSidebarMobile(); els.fileInput.value = ''; els.fileInput.click(); }
function refreshTree() {
  if (S.mode === 'live' && S.rootHandle) { useDirectoryHandle(S.rootHandle, { preserve: true }); return; }
  if (S.mode === 'files') { toast('请重新选择文件夹或文件', 2200); pickFolder(); return; }
  if (S.mode === 'welcome') {
    if (S.recentFolders && S.recentFolders.length) { restoreRecentFolder(0); return; }
    toast('还没有最近文件夹，请先打开一个文件夹', 2600);
    return;
  }
  toast('请打开文件夹后刷新', 2400);
}
function toggleCollapse() {
  if (S.filter) { els.filter.value = ''; els.filterBox.classList.remove('has-value'); S.filter = ''; renderTree(); return; }
  var any = false;
  S.dirByPath.forEach(function (d) { if (d.path && S.expanded.has(d.path)) any = true; });
  if (any) S.expanded.clear();
  else S.dirByPath.forEach(function (d) { if (d.path) S.expanded.add(d.path); });
  renderTree();
}
function syncActivityState() {
  if (!els.btnExplorer) return;
  var open = window.innerWidth <= 820
    ? document.body.classList.contains('sidebar-open')
    : !document.body.classList.contains('sidebar-collapsed');
  els.btnExplorer.classList.toggle('active', open);
  els.btnExplorer.setAttribute('aria-pressed', open ? 'true' : 'false');
  els.btnExplorer.title = open ? '隐藏资源管理器' : '显示资源管理器';
}
function closeSidebarMobile() { document.body.classList.remove('sidebar-open'); syncActivityState(); }
function toggleSidebar() {
  if (window.innerWidth <= 820) document.body.classList.toggle('sidebar-open');
  else document.body.classList.toggle('sidebar-collapsed');
  syncActivityState();
}
function preferredTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
function applyTheme(theme) {
  S.themeMode = theme === 'light' || theme === 'dark' ? theme : 'system';
  S.theme = S.themeMode === 'system' ? preferredTheme() : S.themeMode;
  document.documentElement.dataset.theme = S.theme;
  storeSet(LS.themeMode, S.themeMode);
  storeSet(LS.theme, S.theme);
  [els.btnTheme, els.btnActivityTheme].forEach(function (btn) {
    if (!btn) return;
    var use = btn.querySelector('use');
    if (use) use.setAttribute('href', S.theme === 'dark' ? '#i-sun' : '#i-moon');
    btn.title = S.theme === 'dark' ? '切换到浅色主题' : '切换到深色主题';
  });
  syncSettingsUI();
}

function getBlob(node) {
  if (node.blob) return Promise.resolve(node.blob);
  if (node.file) return Promise.resolve(node.file);
  if (node.handle) return node.handle.getFile();
  if (node.content != null) return Promise.resolve(new Blob([node.content], { type: mimeOf(node.name) }));
  return Promise.reject(new Error('无法读取文件'));
}
function readBuffer(blob, max) {
  var b = max && blob.size > max ? blob.slice(0, max) : blob;
  if (b.arrayBuffer) return b.arrayBuffer();
  return new Promise(function (resolve, reject) {
    var r = new FileReader();
    r.onload = function () { resolve(r.result); };
    r.onerror = function () { reject(r.error || new Error('读取失败')); };
    r.readAsArrayBuffer(b);
  });
}
function readBlobText(blob, max) { return readBuffer(blob, max).then(function (buf) { return decodeAuto(new Uint8Array(buf)); }); }
function decodeBytes(u8, enc) {
  try { return new TextDecoder(enc, { fatal: false }).decode(u8); }
  catch (e) { return null; }
}
function decodeAuto(u8) {
  if (u8.length >= 3 && u8[0] === 0xEF && u8[1] === 0xBB && u8[2] === 0xBF) return { text: decodeBytes(u8.subarray(3), 'utf-8') || '', enc: 'utf-8' };
  if (u8.length >= 2 && u8[0] === 0xFF && u8[1] === 0xFE) return { text: decodeBytes(u8.subarray(2), 'utf-16le') || '', enc: 'utf-16le' };
  if (u8.length >= 2 && u8[0] === 0xFE && u8[1] === 0xFF) return { text: decodeBytes(u8.subarray(2), 'utf-16be') || '', enc: 'utf-16be' };
  var t = null;
  try { t = new TextDecoder('utf-8', { fatal: true }).decode(u8); return { text: t, enc: 'utf-8' }; } catch (e) {}
  var zerosOdd = 0, zerosEven = 0, lim = Math.min(u8.length, 4096);
  for (var i = 0; i < lim; i++) { if (u8[i] === 0) { if (i & 1) zerosOdd++; else zerosEven++; } }
  if (lim > 8 && zerosOdd > lim * 0.3 && zerosEven < lim * 0.05) { t = decodeBytes(u8, 'utf-16le'); if (t != null) return { text: t, enc: 'utf-16le' }; }
  if (lim > 8 && zerosEven > lim * 0.3 && zerosOdd < lim * 0.05) { t = decodeBytes(u8, 'utf-16be'); if (t != null) return { text: t, enc: 'utf-16be' }; }
  var encs = ['gb18030', 'big5', 'shift_jis', 'windows-1252'];
  for (var j = 0; j < encs.length; j++) {
    try { t = new TextDecoder(encs[j], { fatal: true }).decode(u8); return { text: t, enc: encs[j] }; } catch (e) {}
  }
  t = decodeBytes(u8, 'windows-1252');
  return { text: t == null ? '' : t, enc: 'windows-1252' };
}
function looksBinary(u8) {
  var n = Math.min(u8.length, 4096), ctrl = 0;
  for (var i = 0; i < n; i++) {
    var b = u8[i];
    if (b === 0) return true;
    if (b < 7 || (b > 13 && b < 32)) ctrl++;
  }
  return n > 0 && ctrl / n > 0.08;
}
function readTextOf(node, encoding) {
  if (node.content != null && !node.handle && !node.file && !node.blob) return Promise.resolve({ text: stripBom(node.content), enc: 'utf-8' });
  return getBlob(node).then(function (blob) {
    S.currentBlob = blob;
    return readBuffer(blob, S.fullMode ? 0 : MAX_TEXT).then(function (buf) {
      var u8 = new Uint8Array(buf);
      var out;
      if (encoding && encoding !== 'auto') {
        var t = decodeBytes(u8, encoding);
        out = { text: t == null ? '' : t, enc: encoding };
      } else out = decodeAuto(u8);
      S.truncated = !S.fullMode && blob.size > MAX_TEXT;
      return out;
    });
  });
}
function downloadBlob(blob, name) {
  var u = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = u; a.download = name || 'download'; a.style.display = 'none';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(u); }, 30000);
}
function downloadCurrent() {
  if (!S.current) return;
  if (S.currentBlob) { downloadBlob(S.currentBlob, S.current.name); return; }
  if (S.current.content != null) { downloadBlob(new Blob([S.current.content], { type: mimeOf(S.current.name) }), S.current.name); return; }
  getBlob(S.current).then(function (b) { downloadBlob(b, S.current.name); }).catch(function (e) { toast('无法下载：' + (e && e.message ? e.message : e)); });
}
