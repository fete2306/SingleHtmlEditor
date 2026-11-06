function BitReader(u8) { this.u8 = u8; this.pos = 0; this.buf = 0; this.cnt = 0; }
BitReader.prototype.fill = function (n) {
  while (this.cnt < n) {
    if (this.pos >= this.u8.length) return false;
    this.buf = (this.buf | (this.u8[this.pos++] << this.cnt)) >>> 0;
    this.cnt += 8;
  }
  return true;
};
BitReader.prototype.bits = function (n) {
  if (n === 0) return 0;
  if (!this.fill(n)) throw new Error('压缩数据意外结束');
  var v = this.buf & ((1 << n) - 1);
  this.buf >>>= n; this.cnt -= n;
  return v;
};
BitReader.prototype.align = function () { this.buf = 0; this.cnt = 0; };
function buildHuff(lengths) {
  var max = 0, i;
  var count = new Array(16);
  for (i = 0; i < 16; i++) count[i] = 0;
  for (i = 0; i < lengths.length; i++) { var l = lengths[i]; if (l > max) max = l; if (l) count[l]++; }
  if (!max) return null;
  if (max > 15) throw new Error('无效的 Huffman 表');
  var next = new Array(16), code = 0;
  for (i = 0; i < 16; i++) next[i] = 0;
  for (var bits = 1; bits <= 15; bits++) { code = (code + count[bits - 1]) << 1; next[bits] = code; }
  var size = 1 << max;
  var table = new Int32Array(size);
  for (var sym = 0; sym < lengths.length; sym++) {
    var len = lengths[sym];
    if (!len) continue;
    var c = next[len]++, rev = 0, x = c;
    for (i = 0; i < len; i++) { rev = (rev << 1) | (x & 1); x >>>= 1; }
    var e = (len << 16) | sym;
    var step = 1 << len;
    for (var j = rev; j < size; j += step) table[j] = e;
  }
  return { table: table, max: max };
}
function decodeHuff(br, tree) {
  if (!tree) throw new Error('缺少 Huffman 表');
  if (!br.fill(tree.max)) throw new Error('压缩数据意外结束');
  var e = tree.table[br.buf & ((1 << tree.max) - 1)];
  if (!e) throw new Error('无效的 Huffman 编码');
  var len = e >>> 16;
  br.buf >>>= len; br.cnt -= len;
  return e & 0xffff;
}
var LEN_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
var LEN_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
var DIST_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
var DIST_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
function inflateRaw(input, expected) {
  var br = new BitReader(input);
  var out = new Uint8Array(Math.max(expected || 0, 1024));
  var outPos = 0;
  function ensure(n) {
    if (outPos + n > MAX_EXTRACT) throw new Error('解压后数据过大');
    if (outPos + n <= out.length) return;
    var size = out.length;
    while (size < outPos + n) size *= 2;
    if (size > MAX_EXTRACT) size = MAX_EXTRACT;
    var no = new Uint8Array(size); no.set(out.subarray(0, outPos)); out = no;
  }
  var fixedLit = null, fixedDist = null;
  while (true) {
    var final = br.bits(1), type = br.bits(2);
    if (type === 0) {
      br.align();
      var len = br.bits(16), nlen = br.bits(16);
      if ((len ^ 0xffff) !== nlen) throw new Error('存储块长度校验失败');
      ensure(len);
      for (var i = 0; i < len; i++) out[outPos++] = br.bits(8);
    } else if (type === 1 || type === 2) {
      var litTree, distTree;
      if (type === 1) {
        if (!fixedLit) {
          var fl = new Uint8Array(288);
          for (var a = 0; a < 144; a++) fl[a] = 8;
          for (; a < 256; a++) fl[a] = 9;
          for (; a < 280; a++) fl[a] = 7;
          for (; a < 288; a++) fl[a] = 8;
          fixedLit = buildHuff(fl);
          var fd = new Uint8Array(32);
          for (var b = 0; b < 32; b++) fd[b] = 5;
          fixedDist = buildHuff(fd);
        }
        litTree = fixedLit; distTree = fixedDist;
      } else {
        var hlit = br.bits(5) + 257, hdist = br.bits(5) + 1, hclen = br.bits(4) + 4;
        var order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
        var clen = new Uint8Array(19);
        for (var c1 = 0; c1 < hclen; c1++) clen[order[c1]] = br.bits(3);
        var clTree = buildHuff(clen);
        var lens = new Uint8Array(hlit + hdist), idx = 0;
        while (idx < hlit + hdist) {
          var sym = decodeHuff(br, clTree);
          if (sym < 16) lens[idx++] = sym;
          else if (sym === 16) {
            if (!idx) throw new Error('重复长度缺少前值');
            var prev = lens[idx - 1], rep = 3 + br.bits(2);
            while (rep-- && idx < hlit + hdist) lens[idx++] = prev;
          } else if (sym === 17) {
            var r17 = 3 + br.bits(3);
            while (r17-- && idx < hlit + hdist) lens[idx++] = 0;
          } else if (sym === 18) {
            var r18 = 11 + br.bits(7);
            while (r18-- && idx < hlit + hdist) lens[idx++] = 0;
          } else throw new Error('无效的码长符号');
        }
        litTree = buildHuff(lens.subarray(0, hlit));
        distTree = buildHuff(lens.subarray(hlit, hlit + hdist));
      }
      while (true) {
        var s = decodeHuff(br, litTree);
        if (s < 256) { ensure(1); out[outPos++] = s; }
        else if (s === 256) break;
        else {
          var li = s - 257;
          if (li >= 29) throw new Error('无效的长度码');
          var length = LEN_BASE[li] + (LEN_EXTRA[li] ? br.bits(LEN_EXTRA[li]) : 0);
          var ds = decodeHuff(br, distTree);
          if (ds >= 30) throw new Error('无效的距离码');
          var dist = DIST_BASE[ds] + (DIST_EXTRA[ds] ? br.bits(DIST_EXTRA[ds]) : 0);
          if (dist > outPos) throw new Error('距离超出输出范围');
          ensure(length);
          for (var k = 0; k < length; k++) { out[outPos] = out[outPos - dist]; outPos++; }
        }
      }
    } else throw new Error('无效的压缩块类型');
    if (final) break;
  }
  return out.slice(0, outPos);
}

function zipU16(dv, off) { return dv.getUint16(off, true); }
function zipU32(dv, off) { return dv.getUint32(off, true); }
function zipU64(dv, off) {
  var lo = dv.getUint32(off, true), hi = dv.getUint32(off + 4, true);
  return hi * 4294967296 + lo;
}
function decodeZipName(bytes, utf8Flag) {
  if (utf8Flag) { var t = decodeBytes(bytes, 'utf-8'); return t == null ? '' : stripBom(t); }
  try { return stripBom(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch (e) {}
  try { return new TextDecoder('gb18030', { fatal: true }).decode(bytes); } catch (e) {}
  try { return new TextDecoder('big5', { fatal: true }).decode(bytes); } catch (e) {}
  var w = decodeBytes(bytes, 'windows-1252');
  return w == null ? '' : w;
}
function findEOCD(u8) {
  var min = Math.max(0, u8.length - 65557);
  for (var i = u8.length - 22; i >= min; i--) if (u8[i] === 0x50 && u8[i + 1] === 0x4b && u8[i + 2] === 0x05 && u8[i + 3] === 0x06) return i;
  return -1;
}
function parseZip(buffer) {
  var u8 = new Uint8Array(buffer), dv = new DataView(buffer);
  var eocd = findEOCD(u8);
  if (eocd < 0) throw new Error('不是有效的 ZIP 文件');
  var total = zipU16(dv, eocd + 10), cdSize = zipU32(dv, eocd + 12), cdOff = zipU32(dv, eocd + 16);
  if (total === 0xffff || cdSize === 0xffffffff || cdOff === 0xffffffff) {
    var loc = eocd - 20;
    if (loc >= 0 && zipU32(dv, loc) === 0x07064b50) {
      var z64 = zipU64(dv, loc + 8);
      if (z64 + 56 <= u8.length && zipU32(dv, z64) === 0x06064b50) {
        total = zipU64(dv, z64 + 32);
        cdSize = zipU64(dv, z64 + 40);
        cdOff = zipU64(dv, z64 + 48);
      }
    }
  }
  if (total > MAX_ENTRIES) throw new Error('压缩包条目过多（超过 ' + MAX_ENTRIES + '）');
  if (cdOff + cdSize > u8.length) throw new Error('ZIP 目录偏移无效');
  var entries = [], p = cdOff, totalSize = 0;
  for (var n = 0; n < total; n++) {
    if (p + 46 > u8.length || zipU32(dv, p) !== 0x02014b50) break;
    var flags = zipU16(dv, p + 8), method = zipU16(dv, p + 10);
    var dt = zipU16(dv, p + 12), dd = zipU16(dv, p + 14);
    var crc = zipU32(dv, p + 16), csize = zipU32(dv, p + 20), usize = zipU32(dv, p + 24);
    var nameLen = zipU16(dv, p + 28), extraLen = zipU16(dv, p + 30), commentLen = zipU16(dv, p + 32);
    var localOff = zipU32(dv, p + 42);
    var nameBytes = u8.subarray(p + 46, p + 46 + nameLen);
    var extra = u8.subarray(p + 46 + nameLen, p + 46 + nameLen + extraLen);
    if (usize === 0xffffffff || csize === 0xffffffff || localOff === 0xffffffff) {
      var q = 0;
      while (q + 4 <= extra.length) {
        var id = extra[q] | (extra[q + 1] << 8), sz = extra[q + 2] | (extra[q + 3] << 8);
        if (id === 0x0001) {
          var z = q + 4;
          if (usize === 0xffffffff && z + 8 <= q + 4 + sz) { usize = zipU64(dv, z); z += 8; }
          if (csize === 0xffffffff && z + 8 <= q + 4 + sz) { csize = zipU64(dv, z); z += 8; }
          if (localOff === 0xffffffff && z + 8 <= q + 4 + sz) { localOff = zipU64(dv, z); }
          break;
        }
        q += 4 + sz;
      }
    }
    var rawName = decodeZipName(nameBytes, !!(flags & 0x800));
    var name = normPath(rawName);
    if (!name || name.slice(0, 3) === '../' || name === '..') { p += 46 + nameLen + extraLen + commentLen; continue; }
    var dir = rawName.slice(-1) === '/' || rawName.slice(-1) === '\\';
    if (name === '.DS_Store' || name.indexOf('__MACOSX/') === 0 || name.slice(-10) === '/Thumbs.db') { p += 46 + nameLen + extraLen + commentLen; continue; }
    totalSize += usize;
    if (totalSize > MAX_EXTRACT) throw new Error('压缩包解压后过大（超过 ' + fmtSize(MAX_EXTRACT) + '）');
    entries.push({ name: name, dir: dir, size: usize, csize: csize, method: method, flags: flags, crc: crc, localOffset: localOff, date: zipDate(dd, dt), encrypted: !!(flags & 1) });
    p += 46 + nameLen + extraLen + commentLen;
  }
  if (!entries.length) throw new Error('压缩包是空的');
  return { u8: u8, dv: dv, entries: entries, totalSize: totalSize };
}
function zipDate(d, t) {
  var year = 1980 + ((d >> 9) & 0x7f), month = ((d >> 5) & 0x0f), day = d & 0x1f;
  var hour = (t >> 11) & 0x1f, min = (t >> 5) & 0x3f;
  if (!month || !day) return '';
  return year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0') + ' ' + String(hour).padStart(2, '0') + ':' + String(min).padStart(2, '0');
}
function zipFind(zip, path) {
  var p = normPath(path), low = p.toLowerCase();
  for (var i = 0; i < zip.entries.length; i++) {
    if (zip.entries[i].name === p || zip.entries[i].name.toLowerCase() === low) return zip.entries[i];
  }
  var base = basename(p).toLowerCase();
  for (var j = 0; j < zip.entries.length; j++) if (!zip.entries[j].dir && basename(zip.entries[j].name).toLowerCase() === base) return zip.entries[j];
  return null;
}
function zipExtract(zip, entry) {
  if (!entry || entry.dir) return Promise.resolve(new Uint8Array(0));
  if (entry.encrypted) return Promise.reject(new Error('条目已加密，无法读取'));
  if (entry.size > MAX_EXTRACT) return Promise.reject(new Error('条目过大'));
  var local = entry.localOffset;
  if (local + 30 > zip.u8.length || zipU32(zip.dv, local) !== 0x04034b50) return Promise.reject(new Error('ZIP 本地头无效'));
  var nameLen = zipU16(zip.dv, local + 26), extraLen = zipU16(zip.dv, local + 28);
  var start = local + 30 + nameLen + extraLen;
  var data = zip.u8.subarray(start, start + entry.csize);
  if (entry.method === 0) return Promise.resolve(data.slice());
  if (entry.method !== 8) return Promise.reject(new Error('不支持的压缩方法：' + entry.method));
  if (S.rawDeflate) {
    try {
      return new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer().then(function (buf) {
        var out = new Uint8Array(buf); if (out.length > MAX_EXTRACT) throw new Error('条目解压后过大'); return out;
      }).catch(function () { return inflateRaw(data, entry.size); });
    } catch (e) {}
  }
  return Promise.resolve(inflateRaw(data, entry.size));
}
function zipText(zip, path) {
  var e = zipFind(zip, path);
  if (!e) return Promise.reject(new Error('找不到 ' + path));
  return zipExtract(zip, e).then(function (u8) { return decodeAuto(u8).text; });
}
function zipBlob(zip, path, mime) {
  var e = zipFind(zip, path);
  if (!e) return Promise.reject(new Error('找不到 ' + path));
  return zipExtract(zip, e).then(function (u8) { return new Blob([u8], { type: mime || mimeOf(e.name) }); });
}
function zipURL(zip, path) {
  var key = 'zip:' + path;
  if (S.imageCache.has(key)) return S.imageCache.get(key);
  var p = zipBlob(zip, path).then(function (b) { return newURL(b); });
  S.imageCache.set(key, p);
  return p;
}
function parseXml(text) {
  var d = new DOMParser().parseFromString(String(text || '').replace(/^\uFEFF/, ''), 'application/xml');
  var err = d.getElementsByTagName('parsererror');
  if (err && err.length) throw new Error('XML 解析失败');
  return d;
}
function xmlTags(el, local) { return el ? Array.prototype.slice.call(el.getElementsByTagNameNS('*', local)) : []; }
function xmlFirst(el, local) {
  if (!el) return null;
  var list = el.getElementsByTagNameNS('*', local);
  return list && list.length ? list[0] : null;
}
function xmlAttr(el, local) {
  if (!el || !el.attributes) return '';
  for (var i = 0; i < el.attributes.length; i++) if (el.attributes[i].localName === local) return el.attributes[i].value;
  return '';
}
function xmlVal(el, local) { var n = xmlFirst(el, local); return n ? xmlAttr(n, 'val') : ''; }
function relsMap(zip, relsPath) {
  var e = zipFind(zip, relsPath);
  if (!e) return Promise.resolve(new Map());
  return zipText(zip, relsPath).then(function (text) {
    var doc = parseXml(text), map = new Map();
    var base = dirname(dirname(relsPath));
    xmlTags(doc, 'Relationship').forEach(function (r) {
      var id = r.getAttribute('Id') || r.getAttribute('id');
      var target = r.getAttribute('Target') || '';
      var mode = r.getAttribute('TargetMode') || '';
      if (!id) return;
      var resolved = mode === 'External' || /^[a-z]+:/i.test(target) ? target : joinPath(base, decodeSafe(target.split('#')[0]));
      map.set(id, { target: resolved, type: r.getAttribute('Type') || '', mode: mode });
    });
    return map;
  });
}
function officeImgHTML(relId, label) {
  return '<img class="office-img" alt="' + attr(label || '图片') + '" data-rel="' + attr(relId) + '">';
}
function hydrateOfficeImages(container, zip, rels) {
  var imgs = $$('img[data-rel]', container);
  imgs.forEach(function (img) {
    var rel = rels.get(img.getAttribute('data-rel'));
    if (!rel || rel.mode === 'External' || !zipFind(zip, rel.target)) {
      var ph = document.createElement('span'); ph.className = 'office-img-ph'; ph.textContent = '[图片无法显示]';
      if (img.parentNode) img.parentNode.replaceChild(ph, img);
      return;
    }
    zipURL(zip, rel.target).then(function (url) {
      img.src = url; img.removeAttribute('data-rel');
      img.addEventListener('load', function () { if (img.naturalWidth < 20) img.style.minWidth = '0'; });
    }).catch(function () {
      if (img.parentNode) { var ph = document.createElement('span'); ph.className = 'office-img-ph'; ph.textContent = '[图片无法显示]'; img.parentNode.replaceChild(ph, img); }
    });
  });
}

function docxRunHtml(run) {
  var rPr = xmlFirst(run, 'rPr');
  var bold = !!(rPr && xmlFirst(rPr, 'b') && xmlVal(rPr, 'b') !== '0' && xmlVal(rPr, 'b') !== 'false');
  var italic = !!(rPr && xmlFirst(rPr, 'i') && xmlVal(rPr, 'i') !== '0' && xmlVal(rPr, 'i') !== 'false');
  var strike = !!(rPr && (xmlFirst(rPr, 'strike') || xmlFirst(rPr, 'dstrike')));
  var underline = !!(rPr && xmlFirst(rPr, 'u') && xmlVal(rPr, 'u') !== 'none');
  var vert = rPr ? xmlVal(rPr, 'vertAlign') : '';
  var color = rPr ? xmlVal(rPr, 'color') : '';
  var html = '';
  Array.prototype.forEach.call(run.childNodes, function (node) {
    if (node.nodeType !== 1) return;
    var local = node.localName;
    if (local === 't') html += esc(node.textContent || '');
    else if (local === 'tab') html += '<span class="docx-tab"></span>';
    else if (local === 'br' || local === 'cr') html += '<br>';
    else if (local === 'drawing' || local === 'pict' || local === 'object') {
      var blip = xmlFirst(node, 'blip');
      var embed = blip ? xmlAttr(blip, 'embed') : '';
      if (!embed) { var imd = xmlFirst(node, 'imagedata'); embed = imd ? xmlAttr(imd, 'id') : ''; }
      if (embed) html += officeImgHTML(embed);
    } else if (local === 'sym') {
      var ch = xmlAttr(node, 'char');
      var code = parseInt(ch, 16);
      if (isFinite(code)) html += esc(String.fromCharCode(code));
    } else if (local === 'noBreakHyphen') html += '‑';
  });
  if (!html) return '';
  if (bold) html = '<strong>' + html + '</strong>';
  if (italic) html = '<em>' + html + '</em>';
  if (strike) html = '<del>' + html + '</del>';
  if (underline) html = '<span class="docx-u">' + html + '</span>';
  if (vert === 'superscript') html = '<sup>' + html + '</sup>';
  else if (vert === 'subscript') html = '<sub>' + html + '</sub>';
  if (color && /^[0-9a-fA-F]{6}$/.test(color)) html = '<span style="color:#' + color + '">' + html + '</span>';
  return html;
}
function docxInlineHtml(el, rels) {
  var out = '';
  Array.prototype.forEach.call(el.childNodes, function (node) {
    if (node.nodeType !== 1) return;
    var local = node.localName;
    if (local === 'r') out += docxRunHtml(node);
    else if (local === 'hyperlink') {
      var inner = docxInlineHtml(node, rels);
      var rid = xmlAttr(node, 'id');
      var rel = rid ? rels.get(rid) : null;
      if (rel && /^https?:|^mailto:/i.test(rel.target)) out += '<a href="' + attr(rel.target) + '" target="_blank" rel="noopener">' + inner + '</a>';
      else out += inner;
    } else if (local === 'ins' || local === 'smartTag' || local === 'sdt' || local === 'sdtContent' || local === 'fldSimple') out += docxInlineHtml(node, rels);
    else if (local === 'del' || local === 'instrText' || local === 'delText') return;
    else if (local === 'bookmarkStart' || local === 'bookmarkEnd') return;
    else out += docxInlineHtml(node, rels);
  });
  return out;
}
function docxBlockHtml(el, rels) {
  var out = '';
  Array.prototype.forEach.call(el.childNodes, function (node) {
    if (node.nodeType !== 1) return;
    var local = node.localName;
    if (local === 'p') {
      var pPr = xmlFirst(node, 'pPr');
      var style = pPr ? xmlVal(pPr, 'pStyle') : '';
      var level = pPr ? xmlVal(pPr, 'outlineLvl') : '';
      var tag = 'p', cls = '';
      var sm = /^heading\s*([1-6])$/i.exec(style) || /^Heading\s*([1-6])$/.exec(style);
      if (sm) tag = 'h' + sm[1];
      else if (/^title$/i.test(style)) { tag = 'h1'; cls = 'doc-title'; }
      else if (level !== '' && /^\d+$/.test(level)) tag = 'h' + Math.min(6, parseInt(level, 10) + 1);
      var li = pPr && xmlFirst(pPr, 'numPr');
      if (li) cls += ' docx-li';
      if (pPr) {
        var jc = xmlVal(pPr, 'jc');
        if (jc === 'center') cls += ' align-center';
        else if (jc === 'right') cls += ' align-right';
        else if (jc === 'both' || jc === 'distribute') cls += ' align-justify';
      }
      var inner = docxInlineHtml(node, rels);
      if (li) inner = '<span class="docx-bullet">•</span>' + inner;
      out += '<' + tag + (cls ? ' class="' + cls.trim() + '"' : '') + '>' + (inner || '<br>') + '</' + tag + '>';
    } else if (local === 'tbl') {
      out += '<div class="office-table-wrap"><table class="office-table"><tbody>';
      var rows = xmlTags(node, 'tr');
      rows.forEach(function (tr) {
        out += '<tr>';
        Array.prototype.forEach.call(tr.childNodes, function (tc) {
          if (tc.nodeType !== 1 || tc.localName !== 'tc') return;
          var span = xmlFirst(tc, 'gridSpan');
          var spanN = span ? parseInt(xmlAttr(span, 'val') || '1', 10) : 1;
          out += '<td' + (spanN > 1 ? ' colspan="' + spanN + '"' : '') + '>' + (docxBlockHtml(tc, rels) || '&nbsp;') + '</td>';
        });
        out += '</tr>';
      });
      out += '</tbody></table></div>';
    } else if (local === 'sdt' || local === 'sdtContent' || local === 'customXml' || local === 'ins' || local === 'smartTag') {
      out += docxBlockHtml(node, rels);
    } else if (local === 'bookmarkStart' || local === 'bookmarkEnd' || local === 'sectPr') {
      return;
    }
  });
  return out;
}
function renderDocx(zip, node) {
  var main = zipFind(zip, 'word/document.xml');
  if (!main) return Promise.reject(new Error('DOCX 缺少 word/document.xml'));
  return Promise.all([zipText(zip, 'word/document.xml'), relsMap(zip, 'word/_rels/document.xml.rels')]).then(function (res) {
    var doc = parseXml(res[0]), rels = res[1];
    var body = xmlFirst(doc, 'body');
    if (!body) throw new Error('DOCX 没有正文');
    var html = docxBlockHtml(body, rels);
    setContent('archive'); clearContent();
    var wrap = document.createElement('div'); wrap.className = 'office-doc docx-doc';
    wrap.innerHTML = '<div class="office-toolbar">' + officeBackButton() + '<span class="office-meta">DOCX · ' + fmtSize(node.size || (S.currentBlob ? S.currentBlob.size : 0)) + '</span><button class="btn small" data-act="download-entry">' + icon('download') + '下载</button></div><div class="office-content">' + html + '</div>';
    els.content.appendChild(wrap);
    hydrateOfficeImages(wrap, zip, rels);
    postProcessOffice(wrap);
    updateStatusInfo('DOCX · ' + (node.size ? fmtSize(node.size) : ''));
    updateStats(html.replace(/<[^>]+>/g, ' '));
    finishProgress();
  });
}
function officeBackButton() {
  return S.current && S.current.virtualParent ? '<button class="btn small" data-act="back-archive">' + icon('prev') + '返回压缩包</button>' : '';
}
function postProcessOffice(root) {
  var heads = $$('h1,h2,h3,h4,h5,h6', root);
  heads.forEach(function (h) { if (!h.id) h.id = uniqueHeadingId(h.textContent); });
  buildOutlineFrom(root);
  var tables = $$('table', root);
  tables.forEach(function (t) { if (!t.parentNode.classList.contains('office-table-wrap')) { var w = document.createElement('div'); w.className = 'office-table-wrap'; t.parentNode.insertBefore(w, t); w.appendChild(t); } });
}

function renderXlsx(zip, node) {
  return Promise.all([zipText(zip, 'xl/workbook.xml').catch(function () { return ''; }), relsMap(zip, 'xl/_rels/workbook.xml.rels')]).then(function (res) {
    if (!res[0]) throw new Error('XLSX 缺少 workbook.xml');
    var wb = parseXml(res[0]), rels = res[1];
    var sheets = xmlTags(wb, 'sheet').map(function (s) {
      var rid = xmlAttr(s, 'id');
      var rel = rid ? rels.get(rid) : null;
      return { name: s.getAttribute('name') || 'Sheet', target: rel ? rel.target : '' };
    }).filter(function (s) { return s.target; });
    if (!sheets.length) throw new Error('XLSX 没有工作表');
    var shared = [];
    return zipText(zip, 'xl/sharedStrings.xml').catch(function () { return ''; }).then(function (ssText) {
      if (ssText) {
        var ss = parseXml(ssText);
        shared = xmlTags(ss, 'si').map(function (si) { return xmlTags(si, 't').map(function (t) { return t.textContent || ''; }).join(''); });
      }
      setContent('archive'); clearContent();
      var wrap = document.createElement('div'); wrap.className = 'office-doc xlsx-doc';
      wrap.innerHTML = '<div class="office-toolbar">' + officeBackButton() + '<span class="office-meta">XLSX · ' + sheets.length + ' 个工作表</span><button class="btn small" data-act="download-entry">' + icon('download') + '下载</button></div><div class="sheet-tabs"></div><div class="sheet-stage"></div>';
      els.content.appendChild(wrap);
      var tabs = $('.sheet-tabs', wrap), stage = $('.sheet-stage', wrap);
      sheets.forEach(function (s, i) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'sheet-tab' + (i === 0 ? ' active' : ''); b.textContent = s.name; b.dataset.sheet = String(i);
        tabs.appendChild(b);
      });
      S.xlsx = { sheets: sheets, shared: shared, zip: zip, active: 0, stage: stage };
      return renderSheet(0);
    });
  });
}
function cellCol(ref) {
  var m = /^([A-Z]+)/.exec(String(ref || '').toUpperCase());
  if (!m) return 0;
  var n = 0;
  for (var i = 0; i < m[1].length; i++) n = n * 26 + (m[1].charCodeAt(i) - 64);
  return n - 1;
}
function renderSheet(index) {
  var st = S.xlsx;
  if (!st) return Promise.resolve();
  var sheet = st.sheets[index];
  if (!sheet) return Promise.resolve();
  st.active = index;
  $$('.sheet-tab', els.content).forEach(function (b) { b.classList.toggle('active', Number(b.dataset.sheet) === index); });
  st.stage.innerHTML = '<div class="doc-loading"><div class="spinner"></div><span>正在读取 ' + esc(sheet.name) + '…</span></div>';
  return zipText(st.zip, sheet.target).then(function (text) {
    var doc = parseXml(text), rows = xmlTags(doc, 'row');
    var cells = [];
    rows.slice(0, 1000).forEach(function (row) {
      var arr = [];
      xmlTags(row, 'c').forEach(function (c) {
        var col = cellCol(xmlAttr(c, 'r')), type = xmlAttr(c, 't');
        var v = xmlFirst(c, 'v'), val = v ? (v.textContent || '') : '';
        if (type === 's') val = st.shared[parseInt(val, 10)] || '';
        else if (type === 'b') val = val === '1' ? 'TRUE' : 'FALSE';
        else if (type === 'inlineStr') { var is = xmlFirst(c, 'is'); val = is ? is.textContent : ''; }
        if (col < 80) arr[col] = val;
      });
      var max = 0;
      arr.forEach(function (_, i) { if (i + 1 > max) max = i + 1; });
      for (var i = 0; i < max; i++) if (arr[i] == null) arr[i] = '';
      cells.push(arr);
    });
    var maxCols = 0;
    cells.forEach(function (r) { if (r.length > maxCols) maxCols = r.length; });
    var html = '<div class="table-wrap"><table class="csv-table"><thead><tr>';
    for (var c = 0; c < maxCols; c++) html += '<th>' + esc(colName(c)) + '</th>';
    html += '</tr></thead><tbody>';
    cells.forEach(function (r) {
      html += '<tr>';
      for (var j = 0; j < maxCols; j++) html += '<td>' + esc(r[j] == null ? '' : r[j]) + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    if (!cells.length) html = '<div class="office-empty">工作表为空</div>';
    st.stage.innerHTML = '<div class="office-meta-line">' + esc(sheet.name) + ' · ' + cells.length + ' 行 × ' + maxCols + ' 列' + (rows.length > 1000 ? ' · 仅显示前 1000 行' : '') + '</div>' + html;
    updateStatusInfo('XLSX · ' + sheet.name + ' · ' + cells.length + ' 行');
    updateStats('', cells.length + ' 行 × ' + maxCols + ' 列');
    finishProgress();
  }).catch(function (err) {
    st.stage.innerHTML = '<div class="doc-error"><h3>工作表读取失败</h3><p>' + esc(err && err.message ? err.message : err) + '</p></div>';
  });
}
function colName(n) {
  var s = '';
  n++;
  while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

function renderPptx(zip, node) {
  var slides = zip.entries.filter(function (e) { return !e.dir && /^ppt\/slides\/slide\d+\.xml$/.test(e.name); });
  slides.sort(function (a, b) { return parseInt(a.name.replace(/\D/g, ''), 10) - parseInt(b.name.replace(/\D/g, ''), 10); });
  if (!slides.length) return Promise.reject(new Error('PPTX 没有幻灯片'));
  return Promise.all(slides.map(function (e) { return zipText(zip, e.name).catch(function () { return ''; }); })).then(function (texts) {
    setContent('archive'); clearContent();
    var wrap = document.createElement('div'); wrap.className = 'office-doc pptx-doc';
    var html = '<div class="office-toolbar">' + officeBackButton() + '<span class="office-meta">PPTX · ' + slides.length + ' 张幻灯片</span><button class="btn small" data-act="download-entry">' + icon('download') + '下载</button></div><div class="ppt-deck">';
    texts.forEach(function (text, i) {
      var lines = [];
      if (text) {
        var doc = parseXml(text);
        xmlTags(doc, 'p').forEach(function (p) {
          var t = xmlTags(p, 't').map(function (n) { return n.textContent || ''; }).join('');
          if (t.trim()) lines.push(t);
        });
      }
      var title = lines.shift() || ('幻灯片 ' + (i + 1));
      html += '<section class="ppt-slide"><h3><span class="ppt-no">' + String(i + 1).padStart(2, '0') + '</span>' + esc(title) + '</h3>';
      lines.forEach(function (l) { html += '<p>' + esc(l) + '</p>'; });
      html += '</section>';
    });
    html += '</div>';
    wrap.innerHTML = html;
    els.content.appendChild(wrap);
    updateStatusInfo('PPTX · ' + slides.length + ' 张幻灯片');
    updateStats('', slides.length + ' 张幻灯片');
    finishProgress();
  });
}
function renderOdt(zip, node) {
  return zipText(zip, 'content.xml').then(function (text) {
    var doc = parseXml(text);
    var body = xmlFirst(doc, 'text');
    if (!body) throw new Error('ODT 没有正文');
    var wrap = document.createElement('div'); wrap.className = 'office-doc odt-doc';
    wrap.innerHTML = '<div class="office-toolbar">' + officeBackButton() + '<span class="office-meta">ODT · ' + fmtSize(node.size || 0) + '</span><button class="btn small" data-act="download-entry">' + icon('download') + '下载</button></div><div class="office-content"></div>';
    var stage = $('.office-content', wrap);
    odtBlocks(body, stage, zip);
    setContent('archive'); clearContent(); els.content.appendChild(wrap);
    postProcessOffice(wrap);
    updateStatusInfo('ODT');
    updateStats(stage.textContent || '');
    finishProgress();
  });
}
function odtBlocks(el, parent, zip) {
  Array.prototype.forEach.call(el.childNodes, function (node) {
    if (node.nodeType !== 1) return;
    var local = node.localName;
    if (local === 'h') {
      var lev = parseInt(xmlAttr(node, 'outline-level') || '1', 10);
      var h = document.createElement('h' + Math.max(1, Math.min(6, lev)));
      h.textContent = node.textContent || '';
      parent.appendChild(h);
    } else if (local === 'p') {
      var p = document.createElement('p');
      p.textContent = node.textContent || '';
      if (!p.textContent) p.innerHTML = '<br>';
      parent.appendChild(p);
    } else if (local === 'list') {
      var list = document.createElement('ul');
      xmlTags(node, 'list-item').forEach(function (li) {
        var item = document.createElement('li');
        var ps = xmlTags(li, 'p');
        item.textContent = ps.length ? ps.map(function (x) { return x.textContent || ''; }).join(' ') : (li.textContent || '');
        list.appendChild(item);
      });
      parent.appendChild(list);
    } else if (local === 'table') {
      var tw = document.createElement('div'); tw.className = 'office-table-wrap';
      var table = document.createElement('table'); table.className = 'office-table';
      xmlTags(node, 'table-row').forEach(function (tr) {
        var row = document.createElement('tr');
        xmlTags(tr, 'table-cell').forEach(function (tc) {
          var td = document.createElement('td');
          td.textContent = tc.textContent || '';
          if (!td.textContent) td.innerHTML = '&nbsp;';
          row.appendChild(td);
        });
        table.appendChild(row);
      });
      tw.appendChild(table); parent.appendChild(tw);
    } else if (local === 'section' || local === 'index-body' || local === 'text') {
      odtBlocks(node, parent, zip);
    } else if (local === 'frame') {
      var imgs = xmlTags(node, 'image');
      imgs.forEach(function (im) {
        var href = xmlAttr(im, 'href');
        if (href && zipFind(zip, decodeSafe(href))) {
          var img = document.createElement('img'); img.className = 'odt-img'; img.alt = basename(href);
          img.setAttribute('data-odt', href); parent.appendChild(img);
        }
      });
    }
  });
  $$('img[data-odt]', parent).forEach(function (img) {
    zipURL(zip, decodeSafe(img.getAttribute('data-odt'))).then(function (u) { img.src = u; }).catch(function () {});
  });
}

function renderEpub(zip, node) {
  return zipText(zip, 'META-INF/container.xml').catch(function () { return ''; }).then(function (containerText) {
    if (!containerText) return renderZipList(zip, node);
    var cont = parseXml(containerText);
    var rootfile = xmlFirst(cont, 'rootfile');
    var opfPath = rootfile ? (rootfile.getAttribute('full-path') || '') : '';
    if (!opfPath) throw new Error('EPUB 缺少 OPF');
    return Promise.all([zipText(zip, opfPath), relsMap(zip, dirname(opfPath) + '/_rels/' + basename(opfPath) + '.rels')]).then(function (rr) {
      var opf = parseXml(rr[0]), rels = rr[1];
      var manifest = new Map();
      xmlTags(opf, 'item').forEach(function (it) {
        manifest.set(it.getAttribute('id'), { href: joinPath(dirname(opfPath), decodeSafe(it.getAttribute('href') || '')), type: it.getAttribute('media-type') || '', props: it.getAttribute('properties') || '' });
      });
      var spine = [];
      xmlTags(opf, 'itemref').forEach(function (ref) {
        var it = manifest.get(ref.getAttribute('idref'));
        if (it && !/image\//.test(it.type)) spine.push(it);
      });
      if (!spine.length) throw new Error('EPUB 没有章节');
      var titleNode = xmlFirst(opf, 'title');
      var bookTitle = titleNode ? titleNode.textContent : node.name;
      return Promise.all(spine.map(function (it) { return zipText(zip, it.href).catch(function () { return ''; }); })).then(function (texts) {
        absoluteEpub(zip, spine, texts, bookTitle, node);
      });
    });
  });
}
function absoluteEpub(zip, spine, texts, bookTitle, node) {
  var wrap = document.createElement('div'); wrap.className = 'office-doc epub-doc';
  wrap.innerHTML = '<div class="office-toolbar">' + officeBackButton() + '<span class="office-meta">EPUB · ' + esc(bookTitle) + ' · ' + spine.length + ' 章</span><button class="btn small" data-act="download-entry">' + icon('download') + '下载</button></div><div class="epub-content"></div>';
  var stage = $('.epub-content', wrap);
  var sectionMap = new Map();
  spine.forEach(function (it, i) { sectionMap.set(it.href, 'epub-ch-' + i); });
  texts.forEach(function (text, i) {
    var it = spine[i], bodyHtml = '', doc = null;
    try { doc = parseXml(text); } catch (e) {
      try { doc = new DOMParser().parseFromString(text, 'text/html'); } catch (e2) { doc = null; }
    }
    if (doc) {
      var b = xmlFirst(doc, 'body');
      bodyHtml = b ? b.innerHTML : text;
      var safe = DOMPurify.sanitize(bodyHtml, { USE_PROFILES: { html: true, mathMl: true }, FORBID_TAGS: ['script', 'style', 'link', 'base', 'iframe', 'object', 'embed', 'form'], ALLOW_DATA_ATTR: true });
      bodyHtml = safe;
    } else {
      bodyHtml = '<pre>' + esc(text) + '</pre>';
    }
    var sec = document.createElement('section'); sec.className = 'epub-chapter'; sec.id = 'epub-ch-' + i;
    sec.dataset.base = dirname(it.href);
    sec.innerHTML = bodyHtml;
    stage.appendChild(sec);
  });
  $$('img[src]', stage).forEach(function (img) {
    var src = img.getAttribute('src');
    if (!src || /^(https?:|data:|blob:|\/\/)/i.test(src)) return;
    var sec = img.closest('.epub-chapter');
    var path = joinPath(sec ? sec.dataset.base : '', decodeSafe(src.split('#')[0].split('?')[0]));
    if (zipFind(zip, path)) zipURL(zip, path).then(function (u) { img.src = u; }).catch(function () {});
    else img.classList.add('img-missing');
  });
  $$('a[href]', stage).forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || /^(https?:|mailto:|tel:|data:|#)/i.test(href)) return;
    var sec = a.closest('.epub-chapter');
    var target = joinPath(sec ? sec.dataset.base : '', decodeSafe(href.split('#')[0].split('?')[0]));
    if (sectionMap.has(target)) {
      a.setAttribute('href', '#' + sectionMap.get(target));
      a.dataset.epub = '1';
    } else a.removeAttribute('href');
  });
  $$('h1,h2,h3,h4,h5,h6', stage).forEach(function (h) { if (!h.id) h.id = uniqueHeadingId(h.textContent); });
  setContent('archive'); clearContent(); els.content.appendChild(wrap);
  buildOutlineFrom(stage);
  updateStatusInfo('EPUB · ' + bookTitle);
  updateStats(stage.textContent || '');
  finishProgress();
}

function renderZipList(zip, node) {
  setContent('archive'); clearContent();
  var wrap = document.createElement('div'); wrap.className = 'archive-doc';
  var files = zip.entries.filter(function (e) { return !e.dir; });
  var dirs = zip.entries.filter(function (e) { return e.dir; });
  var html = '<div class="office-toolbar">' + officeBackButton() + '<span class="office-meta">' + esc(extOf(node.name).toUpperCase() || 'ZIP') + ' · ' + fmtNum(files.length) + ' 个文件 · ' + fmtSize(zip.totalSize) + '</span><button class="btn small" data-act="download-entry">' + icon('download') + '下载压缩包</button></div>';
  html += '<div class="archive-search"><svg class="i" aria-hidden="true"><use href="#i-search"></use></svg><input id="archiveFilter" type="text" placeholder="筛选压缩包内容" autocomplete="off" spellcheck="false"></div>';
  html += '<div class="zip-list">';
  if (dirs.length) {
    dirs.slice(0, 200).forEach(function (d) {
      html += '<div class="zip-dir" data-name="' + attr(d.name.toLowerCase()) + '">' + icon('folder') + '<span>' + esc(d.name) + '</span></div>';
    });
  }
  files.sort(function (a, b) { return collator.compare(a.name, b.name); });
  files.forEach(function (e) {
    var k = kindOf(e.name);
    html += '<div class="zip-row" data-name="' + attr((e.name + ' ' + basename(e.name)).toLowerCase()) + '" data-entry="' + attr(e.name) + '" role="button" tabindex="0">' + '<span class="tree-icon file ' + kindClass(k) + '">' + icon(kindIcon(k)) + '</span><span class="zip-name">' + esc(e.name) + '</span><span class="zip-size">' + fmtSize(e.size) + '</span></div>';
  });
  html += '</div>';
  wrap.innerHTML = html;
  els.content.appendChild(wrap);
  var input = $('#archiveFilter', wrap), rows = $$('.zip-row,.zip-dir', wrap);
  if (input) input.addEventListener('input', function () {
    var q = input.value.toLowerCase().trim();
    rows.forEach(function (r) { r.hidden = !!q && r.dataset.name.indexOf(q) < 0; });
  });
  wrap.addEventListener('click', function (e) {
    var row = e.target.closest('.zip-row');
    if (!row) return;
    var entry = zipFind(zip, row.dataset.entry);
    if (!entry) return;
    zipExtract(zip, entry).then(function (u8) {
      var blob = new Blob([u8], { type: mimeOf(entry.name) });
      var vnode = { type: 'file', name: basename(entry.name), path: node.path + '/' + entry.name, blob: blob, size: u8.length, virtualParent: node, archiveEntry: entry };
      openFile(vnode, { noHistory: true });
    }).catch(function (err) { toast('无法解压：' + (err && err.message ? err.message : err), 3200); });
  });
  wrap.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var row = e.target.closest('.zip-row');
    if (row) { e.preventDefault(); row.click(); }
  });
  updateStatusInfo(extOf(node.name).toUpperCase() + ' · ' + files.length + ' 个文件');
  updateStats('', files.length + ' 个文件 · ' + fmtSize(zip.totalSize));
  finishProgress();
}

function renderArchive(node) {
  return getBlob(node).then(function (blob) {
    return readBuffer(blob).then(function (buf) {
      var zip = parseZip(buf);
      S.zipCache = zip;
      S.currentBlob = blob;
      var e = extOf(node.name);
      if (e === 'docx') return renderDocx(zip, node);
      if (e === 'xlsx') return renderXlsx(zip, node);
      if (e === 'pptx') return renderPptx(zip, node);
      if (e === 'odt') return renderOdt(zip, node);
      if (e === 'epub') return renderEpub(zip, node);
      return renderZipList(zip, node);
    });
  }).catch(function (err) {
    if (S.zipCache) {
      toast('预览失败，已显示压缩包内容：' + (err && err.message ? err.message : err), 3600);
      return renderZipList(S.zipCache, node);
    }
    throw err;
  });
}
