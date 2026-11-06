var MAX_SQLITE_BYTES = 96 * 1024 * 1024;
var MAX_DB_ROWS = 1000;
var MAX_DB_COLS = 80;
var SQLITE_MAGIC = 'SQLite format 3\u0000';

function sqliteHasHeader(u8) {
  if (!u8 || u8.length < 100) return false;
  for (var i = 0; i < SQLITE_MAGIC.length; i++) if (u8[i] !== SQLITE_MAGIC.charCodeAt(i)) return false;
  return true;
}
function dbBE16(u8, off) { return (u8[off] << 8) | u8[off + 1]; }
function dbBE32(u8, off) { return u8[off] * 16777216 + ((u8[off + 1] << 16) | (u8[off + 2] << 8) | u8[off + 3]); }
function dbSInt(u8, off, len) {
  var v = 0, i;
  for (i = 0; i < len; i++) v = v * 256 + u8[off + i];
  var lim = Math.pow(2, len * 8 - 1);
  if (v >= lim) v -= lim * 2;
  return v;
}
function dbVarint(u8, pos, end) {
  var v = 0, start = pos, b, n;
  for (n = 0; n < 9; n++) {
    if (pos >= end) throw new Error('变长整数越界');
    b = u8[pos++];
    if (n === 8) { v = v * 256 + b; break; }
    v = v * 128 + (b & 127);
    if (!(b & 128)) break;
  }
  return { v: v, n: pos - start };
}
function dbPageSize(buf) {
  var ps = dbBE16(buf, 16);
  if (ps === 1) ps = 65536;
  if (ps < 512 || ps > 65536 || (ps & (ps - 1))) return 0;
  return ps;
}
function dbParseHeader(buf) {
  if (!sqliteHasHeader(buf)) return null;
  var ps = dbPageSize(buf);
  if (!ps) return null;
  var reserved = buf[20], usable = ps - reserved;
  if (usable < 480) return null;
  var encCode = dbBE32(buf, 56), enc = encCode === 2 ? 'utf-16le' : encCode === 3 ? 'utf-16be' : 'utf-8';
  var pages = Math.floor(buf.length / ps);
  if (!pages) return null;
  return { u8: buf, pageSize: ps, reserved: reserved, usable: usable, enc: enc, pages: pages, schemaVersion: dbBE32(buf, 40), userVersion: dbBE32(buf, 60) };
}
function dbPage(db, pgno) {
  if (pgno < 1 || pgno > db.pages) return null;
  var off = (pgno - 1) * db.pageSize;
  if (off + db.pageSize > db.u8.length) return null;
  return db.u8.subarray(off, off + db.pageSize);
}
function dbLocalSize(payload, usable, tableLeaf) {
  var maxLocal = tableLeaf ? usable - 35 : Math.floor((usable - 12) * 64 / 255) - 23;
  var minLocal = Math.floor((usable - 12) * 32 / 255) - 23;
  if (payload <= maxLocal) return payload;
  var local = minLocal + (payload - minLocal) % (usable - 4);
  return local > maxLocal ? minLocal : local;
}
function dbReadPayload(db, page, start, payloadLen, tableLeaf) {
  if (payloadLen < 0 || payloadLen > 256 * 1024 * 1024) throw new Error('单元格过大');
  var local = dbLocalSize(payloadLen, db.usable, tableLeaf);
  if (start < 0 || start + local > page.length) throw new Error('单元格越界');
  var parts = [page.subarray(start, start + local)];
  var remain = payloadLen - local;
  if (remain > 0) {
    if (start + local + 4 > page.length) throw new Error('溢出页指针越界');
    var next = dbBE32(page, start + local), guard = 0, seen = {};
    while (remain > 0 && next) {
      if (next < 1 || next > db.pages || seen[next] || guard++ > 100000) throw new Error('溢出页链损坏');
      seen[next] = 1;
      var op = dbPage(db, next);
      if (!op) throw new Error('溢出页越界');
      var take = Math.min(db.usable - 4, remain, op.length - 4);
      if (take <= 0) throw new Error('溢出页为空');
      parts.push(op.subarray(4, 4 + take));
      remain -= take;
      next = dbBE32(op, 0);
    }
    if (remain > 0) throw new Error('溢出页数据不完整');
  }
  if (parts.length === 1) return parts[0];
  var total = 0, i;
  for (i = 0; i < parts.length; i++) total += parts[i].length;
  var out = new Uint8Array(total), pos = 0;
  for (i = 0; i < parts.length; i++) { out.set(parts[i], pos); pos += parts[i].length; }
  return out;
}
function dbDecodeText(u8, enc) {
  try { return new TextDecoder(enc || 'utf-8', { fatal: false }).decode(u8); }
  catch (e) { return decodeBytes(u8, 'utf-8') || ''; }
}
function dbRecordValue(payload, type, body, enc) {
  if (type === 0) return { t: 'null', v: null };
  if (type === 8) return { t: 'int', v: 0 };
  if (type === 9) return { t: 'int', v: 1 };
  if (type >= 1 && type <= 6) {
    var n = [0, 1, 2, 3, 4, 6, 8][type];
    if (body + n > payload.length) throw new Error('整数字段越界');
    return { t: 'int', v: dbSInt(payload, body, n), n: n };
  }
  if (type === 7) {
    if (body + 8 > payload.length) throw new Error('浮点字段越界');
    var dv = new DataView(payload.buffer, payload.byteOffset + body, 8);
    return { t: 'float', v: dv.getFloat64(0, false) };
  }
  if (type === 10 || type === 11) return { t: 'null', v: null };
  if (type >= 12) {
    var len = type & 1 ? (type - 13) / 2 : (type - 12) / 2;
    if (body + len > payload.length) throw new Error('字段内容越界');
    var data = payload.subarray(body, body + len);
    if (type & 1) return { t: 'text', v: dbDecodeText(data, enc) };
    var hex = '';
    for (var i = 0; i < Math.min(data.length, 48); i++) hex += (data[i] < 16 ? '0' : '') + data[i].toString(16);
    return { t: 'blob', v: null, n: data.length, hex: hex };
  }
  return { t: 'null', v: null };
}
function dbParseRecord(payload, enc) {
  var h = dbVarint(payload, 0, payload.length), headerEnd = h.v, p = h.n, types = [];
  if (headerEnd < p || headerEnd > payload.length) throw new Error('记录头损坏');
  while (p < headerEnd) {
    var st = dbVarint(payload, p, headerEnd);
    types.push(st.v); p += st.n;
  }
  var body = headerEnd, vals = [];
  types.forEach(function (type) {
    var v = dbRecordValue(payload, type, body, enc);
    vals.push(v);
    if (type >= 1 && type <= 6) body += [0, 1, 2, 3, 4, 6, 8][type];
    else if (type === 7) body += 8;
    else if (type >= 12) body += type & 1 ? (type - 13) / 2 : (type - 12) / 2;
  });
  return vals;
}
function dbReadTableLeafCell(db, page, off) {
  var a = dbVarint(page, off, page.length), payloadLen = a.v, p = off + a.n;
  var b = dbVarint(page, p, page.length), rowid = b.v;
  p += b.n;
  var payload = dbReadPayload(db, page, p, payloadLen, true);
  return { rowid: rowid, values: dbParseRecord(payload, db.enc) };
}
function dbReadIndexLeafCell(db, page, off) {
  var a = dbVarint(page, off, page.length);
  var payload = dbReadPayload(db, page, off + a.n, a.v, false);
  return { rowid: null, values: dbParseRecord(payload, db.enc) };
}
function dbWalkTable(db, pgno, state, depth) {
  if (state.stopped || state.rows.length >= state.limit || state.pages >= 20000) {
    state.truncated = true; state.stopped = true; return;
  }
  if (state.visited[pgno] || depth > 40) return;
  state.visited[pgno] = 1;
  state.pages++;
  var page = dbPage(db, pgno);
  if (!page) { state.errors++; return; }
  var hdr = pgno === 1 ? 100 : 0;
  if (hdr + 8 > page.length) { state.errors++; return; }
  var type = page[hdr], count = dbBE16(page, hdr + 3), arr = hdr + 8;
  if (arr + count * 2 > page.length) { state.errors++; return; }
  var i, off;
  if (type === 13) {
    for (i = 0; i < count; i++) {
      if (state.rows.length >= state.limit) { state.truncated = true; state.stopped = true; return; }
      off = dbBE16(page, arr + i * 2);
      try { state.rows.push(dbReadTableLeafCell(db, page, off)); }
      catch (e) { state.errors++; }
    }
    return;
  }
  if (type === 5) {
    for (i = 0; i < count; i++) {
      off = dbBE16(page, arr + i * 2);
      if (off + 4 > page.length) { state.errors++; continue; }
      dbWalkTable(db, dbBE32(page, off), state, depth + 1);
      if (state.stopped) return;
    }
    dbWalkTable(db, dbBE32(page, hdr + 8), state, depth + 1);
    return;
  }
  if (type === 10) {
    for (i = 0; i < count; i++) {
      if (state.rows.length >= state.limit) { state.truncated = true; state.stopped = true; return; }
      off = dbBE16(page, arr + i * 2);
      try { state.rows.push(dbReadIndexLeafCell(db, page, off)); }
      catch (e) { state.errors++; }
    }
    return;
  }
  if (type === 2) {
    for (i = 0; i < count; i++) {
      off = dbBE16(page, arr + i * 2);
      if (off + 4 > page.length) { state.errors++; continue; }
      dbWalkTable(db, dbBE32(page, off), state, depth + 1);
      if (state.stopped) return;
    }
    dbWalkTable(db, dbBE32(page, hdr + 8), state, depth + 1);
    return;
  }
  state.errors++;
}
function dbReadTable(db, root, limit) {
  var state = { visited: {}, rows: [], errors: 0, pages: 0, stopped: false, truncated: false, limit: limit || MAX_DB_ROWS };
  if (!root) throw new Error('该对象没有可读取的根页');
  dbWalkTable(db, root, state, 0);
  return state;
}
function dbUnquote(s) {
  var t = String(s || '');
  if ((t.charAt(0) === '"' && t.charAt(t.length - 1) === '"') || (t.charAt(0) === "'" && t.charAt(t.length - 1) === "'")) return t.slice(1, -1).replace(t.charAt(0) + t.charAt(0), t.charAt(0));
  if (t.charAt(0) === '`' && t.charAt(t.length - 1) === '`') return t.slice(1, -1).replace(/``/g, '`');
  if (t.charAt(0) === '[' && t.charAt(t.length - 1) === ']') return t.slice(1, -1);
  return t;
}
function dbSplitTop(s) {
  var out = [], start = 0, depth = 0, quote = '', close = '';
  for (var i = 0; i < s.length; i++) {
    var c = s.charAt(i);
    if (quote) {
      if (c === close) {
        if (s.charAt(i + 1) === close && close !== ']') i++;
        else { quote = ''; close = ''; }
      }
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; close = c; continue; }
    if (c === '[') { quote = c; close = ']'; continue; }
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ',' && depth === 0) { out.push(s.slice(start, i)); start = i + 1; }
  }
  out.push(s.slice(start));
  return out;
}
function dbColumnDefs(sql) {
  var m = /CREATE\s+(?:TEMP(?:ORARY)?\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[\s\S]*?\(/.exec(String(sql || ''));
  if (!m) return [];
  var start = m.index + m[0].length, depth = 1, quote = '', close = '', end = -1;
  for (var i = start; i < sql.length; i++) {
    var c = sql.charAt(i);
    if (quote) {
      if (c === close) {
        if (sql.charAt(i + 1) === close && close !== ']') i++;
        else { quote = ''; close = ''; }
      }
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; close = c; continue; }
    if (c === '[') { quote = c; close = ']'; continue; }
    if (c === '(') depth++;
    else if (c === ')' && --depth === 0) { end = i; break; }
  }
  if (end < 0) return [];
  var defs = [];
  dbSplitTop(sql.slice(start, end)).forEach(function (part) {
    var t = part.trim();
    if (!t || /^(CONSTRAINT|PRIMARY\s+KEY|UNIQUE|CHECK|FOREIGN\s+KEY)\b/i.test(t)) return;
    var cm = /^(?:"((?:""|[^"])*)"|`((?:``|[^`])*)`|\[([^\]]+)\]|'((?:''|[^'])*)'|([^\s]+))/.exec(t);
    if (!cm) return;
    defs.push({ name: dbUnquote(cm[0]), pk: /\bPRIMARY\s+KEY\b/i.test(t), alias: /\bINTEGER\s+PRIMARY\s+KEY\b/i.test(t) });
  });
  return defs;
}
function dbColumns(sql) {
  return dbColumnDefs(sql).map(function (d) { return d.name; });
}
function dbKeyNames(sql, defs) {
  var m = /\bPRIMARY\s+KEY\s*\(([^)]*)\)/i.exec(String(sql || '')), names = [];
  if (m) {
    dbSplitTop(m[1]).forEach(function (part) {
      var t = part.trim(), q = /^(?:"((?:""|[^"])*)"|`((?:``|[^`])*)`|\[([^\]]+)\]|'((?:''|[^'])*)'|([^\s]+))/.exec(t);
      if (q) names.push(dbUnquote(q[0]));
    });
  } else {
    defs.forEach(function (d) { if (d.pk) names.push(d.name); });
  }
  return names;
}
function dbReorderRow(values, defs, keys) {
  var known = {}, out = [], i;
  for (i = 0; i < keys.length; i++) known[keys[i]] = values[i] || { t: 'null', v: null };
  var p = keys.length;
  defs.forEach(function (d) {
    if (known[d.name]) { out.push(known[d.name]); return; }
    out.push(values[p++] || { t: 'null', v: null });
  });
  return out;
}
function sqliteReadSchema(db) {
  var table = dbReadTable(db, 1, 20000);
  if (table.errors && !table.rows.length) throw new Error('无法读取 sqlite_master');
  var objs = [];
  table.rows.forEach(function (row) {
    var v = row.values;
    if (!v || v.length < 5) return;
    var type = v[0] && v[0].t === 'text' ? v[0].v : '';
    var name = v[1] && v[1].t === 'text' ? v[1].v : '';
    if (!name || (type !== 'table' && type !== 'view')) return;
    objs.push({ type: type, name: name, tblName: v[2] && v[2].t === 'text' ? v[2].v : name, root: v[3] && v[3].t === 'int' ? v[3].v : 0, sql: v[4] && v[4].t === 'text' ? v[4].v : '' });
  });
  return objs;
}
function dbValueHtml(v) {
  if (!v || v.t === 'null') return '<span class="db-null">NULL</span>';
  if (v.t === 'blob') return '<span class="db-blob">BLOB</span><span class="db-hex">' + esc(v.hex) + (v.n > 48 ? '…' : '') + '</span><span class="db-size">' + fmtSize(v.n) + '</span>';
  if (v.t === 'int' || v.t === 'float') return '<span class="db-num">' + esc(String(v.v)) + '</span>';
  var s = String(v.v == null ? '' : v.v);
  if (!s) return '<span class="db-empty">空字符串</span>';
  if (s.length > 240) return '<span class="db-text" title="' + attr(s.slice(0, 300)) + '">' + esc(s.slice(0, 240)) + '…</span><span class="db-size">' + fmtNum(s.length) + ' 字符</span>';
  return esc(s);
}
function dbObjButton(o) {
  return '<button class="db-obj" type="button" data-act="db-table" data-name="' + attr(o.name) + '"><span class="db-type ' + (o.type === 'view' ? 'v' : 't') + '">' + (o.type === 'view' ? 'V' : 'T') + '</span><span class="db-obj-name">' + esc(o.name) + '</span></button>';
}
function dbSideHtml(objs) {
  var user = objs.filter(function (o) { return o.name.slice(0, 7).toLowerCase() !== 'sqlite_'; });
  var list = user.length ? user : objs;
  var tables = list.filter(function (o) { return o.type === 'table'; });
  var views = list.filter(function (o) { return o.type === 'view'; });
  var html = '<div class="db-side-head"><span>数据库对象</span><b>' + list.length + '</b></div><div class="db-objs">';
  if (tables.length) html += '<div class="db-group">表</div>' + tables.map(dbObjButton).join('');
  if (views.length) html += '<div class="db-group">视图</div>' + views.map(dbObjButton).join('');
  if (!list.length) html += '<div class="db-empty">没有可显示的表或视图</div>';
  return html + '</div>';
}
function dbSqlBlock(sql) {
  return '<pre class="text-view db-sql">' + highlightCode(sql || '', 'sql') + '</pre>';
}
function renderDbTable(name) {
  var db = S.db;
  if (!db || !els.content) return;
  var stage = $('.db-stage', els.content);
  if (!stage) return;
  var obj = db.objects.filter(function (o) { return o.name === name; })[0];
  if (!obj) return;
  S.dbTable = name;
  $$('.db-obj', els.content).forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-name') === name); });
  var head = '<div class="db-stage-head"><div><span class="db-kind">' + (obj.type === 'view' ? 'VIEW' : 'TABLE') + '</span><strong>' + esc(obj.name) + '</strong></div><span>' + (obj.root ? '根页 ' + obj.root : '无根页') + '</span></div>';
  if (obj.type === 'view') {
    stage.innerHTML = head + '<div class="doc-note">视图仅显示定义，不执行查询。</div>' + (obj.sql ? dbSqlBlock(obj.sql) : '<div class="doc-note">没有可用的 SQL 定义</div>');
    updateStatusInfo('SQLite · 视图 · ' + obj.name);
    return;
  }
  if (!obj.root || /^CREATE\s+VIRTUAL\s+TABLE/i.test(obj.sql)) {
    stage.innerHTML = head + '<div class="doc-note">虚拟表无法在此只读查看器中直接读取行数据。</div>' + (obj.sql ? dbSqlBlock(obj.sql) : '');
    updateStatusInfo('SQLite · 虚拟表 · ' + obj.name);
    return;
  }
  var noRowid = /WITHOUT\s+ROWID/i.test(obj.sql), keys = noRowid ? dbKeyNames(obj.sql, dbColumnDefs(obj.sql)) : [];
  var res;
  try { res = dbReadTable(db, obj.root, MAX_DB_ROWS); }
  catch (e) {
    stage.innerHTML = head + '<div class="doc-note">读取表数据失败：' + esc(e && e.message ? e.message : e) + '</div>' + (obj.sql ? dbSqlBlock(obj.sql) : '');
    updateStatusInfo('SQLite · 读取失败');
    return;
  }
  var defs = dbColumnDefs(obj.sql), cols = defs.map(function (d) { return d.name; }), width = cols.length;
  res.rows.forEach(function (r) { if (r.values.length > width) width = r.values.length; });
  if (!width) width = Math.max(1, res.rows.length ? res.rows[0].values.length : 0);
  var maxw = Math.min(width, MAX_DB_COLS - (noRowid ? 0 : 1));
  while (cols.length < maxw) cols.push('列 ' + (cols.length + 1));
  cols = cols.slice(0, maxw);
  var html = head;
  if (res.truncated) html += '<div class="doc-note">最多显示前 ' + fmtNum(MAX_DB_ROWS) + ' 行。</div>';
  if (width > maxw) html += '<div class="doc-note">最多显示前 ' + fmtNum(maxw) + ' 列。</div>';
  if (res.errors) html += '<div class="doc-note">跳过 ' + fmtNum(res.errors) + ' 个无法解析的单元格或页。</div>';
  if (!res.rows.length) {
    html += '<div class="doc-note">这张表没有可显示的行。</div>' + (obj.sql ? dbSqlBlock(obj.sql) : '');
    stage.innerHTML = html;
    updateStatusInfo('SQLite · 表 · ' + obj.name + ' · 0 行');
    updateStats('', 'SQLite · 0 行');
    return;
  }
  html += '<div class="table-wrap db-table-wrap"><table class="csv-table db-table"><thead><tr>' + (noRowid ? '' : '<th class="db-rowid-head">rowid</th>');
  cols.forEach(function (c) { html += '<th>' + esc(c) + '</th>'; });
  html += '</tr></thead><tbody>';
  var pkIndex = -1;
  for (var pi = 0; pi < maxw; pi++) if (defs[pi] && defs[pi].alias) { pkIndex = pi; break; }
  res.rows.forEach(function (r) {
    var values = noRowid && keys.length ? dbReorderRow(r.values, defs, keys) : r.values;
    html += '<tr>' + (noRowid ? '' : '<td class="db-rowid">' + esc(String(r.rowid == null ? '' : r.rowid)) + '</td>');
    for (var i = 0; i < maxw; i++) {
      var cell = values[i];
      if (i === pkIndex && r.rowid != null && (!cell || cell.t === 'null')) cell = { t: 'int', v: r.rowid };
      html += '<td>' + dbValueHtml(cell) + '</td>';
    }
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  if (obj.sql) html += '<details class="db-schema"><summary>查看建表 SQL</summary>' + dbSqlBlock(obj.sql) + '</details>';
  stage.innerHTML = html;
  updateStatusInfo('SQLite · ' + (noRowid ? 'WITHOUT ROWID 表' : '表') + ' · ' + obj.name + ' · ' + fmtNum(res.rows.length) + ' 行' + (res.truncated ? '（已截断）' : ''));
  updateStats('', 'SQLite · ' + fmtNum(res.rows.length) + ' 行 × ' + fmtNum(maxw) + ' 列' + (noRowid ? ' · 复合主键' : ''));
}
async function renderSqlite(node, knownBlob) {
  var blob = knownBlob || await getBlob(node);
  if (S.current !== node) return;
  S.currentBlob = blob;
  if (blob.size > MAX_SQLITE_BYTES) {
    var head0 = new Uint8Array(await readBuffer(blob, 8192));
    S.currentKind = 'binary';
    renderBinary(node, blob, head0);
    toast('数据库文件超过 96 MB，已改用十六进制预览', 3600);
    return;
  }
  var buf = new Uint8Array(await readBuffer(blob, 0));
  if (S.current !== node) return;
  var db = dbParseHeader(buf);
  if (!db) {
    S.currentKind = 'binary';
    renderBinary(node, blob, buf.subarray(0, 8192));
    toast('这不是可识别的 SQLite 数据库，已改用十六进制预览', 3600);
    return;
  }
  var objs;
  try { objs = sqliteReadSchema(db); }
  catch (e) {
    setContent('archive'); clearContent();
    els.content.className = 'doc db-body';
    els.content.innerHTML = docToolbar('SQLite · 结构读取失败', '<button class="btn small" type="button" data-act="download-entry">' + icon('download') + '下载</button>') + '<div class="doc-note">数据库头有效，但 sqlite_master 读取失败：' + esc(e && e.message ? e.message : e) + '</div>';
    updateStatusInfo('SQLite · 结构读取失败');
    updateStats('', 'SQLite · 无法读取');
    finishProgress();
    return;
  }
  db.objects = objs;
  S.db = db;
  S.dbTable = '';
  setContent('sqlite'); clearContent();
  els.content.className = 'doc db-body';
  var meta = 'SQLite · ' + fmtNum(objs.length) + ' 个对象 · ' + fmtSize(blob.size) + ' · 页 ' + fmtNum(db.pageSize) + ' B · ' + db.enc.toUpperCase() + ' · ' + fmtNum(db.pages) + ' 页';
  els.content.innerHTML = docToolbar(meta, '<button class="btn small" type="button" data-act="download-entry">' + icon('download') + '下载</button>') +
    '<div class="db-layout"><aside class="db-side">' + dbSideHtml(objs) + '</aside><section class="db-stage"></section></div>';
  updateStatusInfo('SQLite · ' + db.enc.toUpperCase() + ' · ' + fmtSize(blob.size));
  updateStats('', 'SQLite · ' + fmtNum(objs.length) + ' 个对象');
  var visible = objs.filter(function (o) { return o.name.slice(0, 7).toLowerCase() !== 'sqlite_'; });
  var first = (visible.length ? visible : objs).filter(function (o) { return o.type === 'table'; })[0] || (visible.length ? visible : objs)[0];
  if (first) renderDbTable(first.name);
  else $('.db-stage', els.content).innerHTML = '<div class="doc-note">数据库中没有用户表或视图。</div>';
  finishProgress();
}
