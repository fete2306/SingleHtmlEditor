var HL_MAX = 700000;
var HL_ALIASES = {
  js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  py: 'python', pyw: 'python', pyi: 'python', rb: 'ruby', sh: 'shell', bash: 'shell', zsh: 'shell', fish: 'shell',
  ps1: 'powershell', psm1: 'powershell', bat: 'batch', cmd: 'batch', htm: 'html', xhtml: 'html', xml: 'xml',
  svg: 'xml', xsl: 'xml', xslt: 'xml', xsd: 'xml', plist: 'xml', cs: 'csharp', 'c#': 'csharp', 'c++': 'cpp',
  cc: 'cpp', cxx: 'cpp', hpp: 'cpp', hh: 'cpp', hxx: 'cpp', h: 'c', kt: 'kotlin', kts: 'kotlin', rs: 'rust',
  golang: 'go', yml: 'yaml', toml: 'toml', ini: 'ini', cfg: 'ini', conf: 'ini', properties: 'ini', env: 'ini',
  md: 'markdown', mdown: 'markdown', mkd: 'markdown', mkdn: 'markdown', mdx: 'markdown', jsonc: 'json', json5: 'json',
  jsonl: 'json', ndjson: 'json', postgres: 'sql', postgresql: 'sql', mysql: 'sql', sqlite: 'sql', sqlite3: 'sql',
  plaintext: 'text', plain: 'text', txt: 'text', log: 'text', console: 'text', vue: 'html', svelte: 'html',
  astro: 'html', scss: 'css', sass: 'css', less: 'css', styl: 'css', objectivec: 'c', objc: 'c', tex: 'latex',
  latex: 'latex', diff: 'diff', patch: 'diff', dockerfile: 'shell', makefile: 'shell', cmake: 'shell'
};
var HL_EXT_LANG = {
  md: 'markdown', markdown: 'markdown', mdown: 'markdown', mkd: 'markdown', mkdn: 'markdown', mdx: 'markdown',
  json: 'json', jsonc: 'json', json5: 'json', jsonl: 'json', ndjson: 'json', csv: 'csv', tsv: 'csv',
  html: 'html', htm: 'html', xhtml: 'html', xml: 'xml', svg: 'xml', xsl: 'xml', xslt: 'xml', xsd: 'xml',
  css: 'css', scss: 'css', sass: 'css', less: 'css', styl: 'css', js: 'javascript', mjs: 'javascript', cjs: 'javascript',
  jsx: 'javascript', ts: 'typescript', tsx: 'typescript', py: 'python', pyw: 'python', pyi: 'python',
  java: 'java', c: 'c', h: 'c', cc: 'cpp', cpp: 'cpp', cxx: 'cpp', hpp: 'cpp', hh: 'cpp', hxx: 'cpp',
  cs: 'csharp', go: 'go', rs: 'rust', rb: 'ruby', php: 'php', sh: 'shell', bash: 'shell', zsh: 'shell',
  fish: 'shell', ps1: 'powershell', psm1: 'powershell', bat: 'batch', cmd: 'batch', sql: 'sql',
  lua: 'lua', swift: 'swift', kt: 'kotlin', kts: 'kotlin', scala: 'scala', dart: 'dart', r: 'r',
  yaml: 'yaml', yml: 'yaml', toml: 'toml', ini: 'ini', cfg: 'ini', conf: 'ini', properties: 'ini', env: 'ini',
  diff: 'diff', patch: 'diff', tex: 'latex', latex: 'latex', dockerfile: 'shell', makefile: 'shell', cmake: 'shell'
};
var HL_KEYWORDS = {
  javascript: 'as async await break case catch class const continue debugger default delete do else export extends finally for from function get if import in instanceof let new of return set static super switch this throw try typeof var void while with yield true false null undefined',
  typescript: 'as async await break case catch class const continue declare default delete do else enum export extends finally for from function get if implements import in infer instanceof interface is keyof let namespace new of private protected public readonly return satisfies set static super switch this throw try type typeof var void while with yield true false null undefined any unknown never number string boolean object symbol bigint',
  java: 'abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while true false null var record sealed permits yield',
  csharp: 'abstract as base bool break byte case catch char checked class const continue decimal default delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sbyte sealed short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using virtual void volatile while var async await record init get set value',
  c: 'auto break case char const continue default do double else enum extern float for goto if inline int long register restrict return short signed sizeof static struct switch typedef union unsigned void volatile while true false null',
  cpp: 'alignas alignof and asm auto bool break case catch char char16_t char32_t class const constexpr const_cast continue decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept nullptr operator or private protected public register reinterpret_cast return short signed sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while',
  go: 'break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var true false nil iota string int int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 uintptr byte rune float32 float64 complex64 complex128 bool error any',
  rust: 'as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while yield i8 i16 i32 i64 i128 isize u8 u16 u32 u64 u128 usize f32 f64 bool char str String Vec Option Result Some None Ok Err',
  php: 'abstract and array as break callable case catch class clone const continue declare default die do echo else elseif empty enddeclare endfor endforeach endif endswitch endwhile eval exit extends final finally fn for foreach function global goto if implements include include_once instanceof insteadof interface isset list match namespace new null or print private protected public readonly require require_once return static switch throw trait true try unset use var while xor yield',
  ruby: 'BEGIN END alias and begin break case class def defined do else elsif end ensure false for if in module next nil not or redo rescue retry return self super then true undef unless until when while yield attr_accessor attr_reader attr_writer require include extend raise puts',
  shell: 'if then else elif fi for while in do done case esac function select until time coproc return break continue exit export readonly local declare typeset unset shift source alias unalias set test echo printf cd pwd read eval exec trap true false null',
  powershell: 'begin break catch class continue data define do dynamicparam else elseif end enum exit filter finally for foreach from function hidden if in param process return static switch throw trap try until using var while workflow true false null',
  batch: 'if else for in do goto call exit setlocal endlocal set shift echo rem true false null',
  sql: 'abort action add after all alter always analyze and as asc attach autoincrement before begin between by cascade case cast check collate column commit conflict constraint create cross current current_date current_time current_timestamp database default deferrable deferred delete desc detach distinct do drop each else end escape except exclude exclusive exists explain fail filter first following for foreign from full generated glob group groups having if ignore immediate in index indexed initially inner insert instead intersect into is isnull join key last left like limit match natural no not nothing notnull null of offset on or order others outer over partition plan pragma preceding primary query raise range recursive references regexp reindex release rename replace restrict returning right rollback row rows savepoint select set table temp temporary then ties to transaction trigger unbounded union unique update using vacuum values view virtual when where window with without true false',
  lua: 'and break do else elseif end false for function goto if in local nil not or repeat return then true until while self',
  swift: 'associatedtype class deinit enum extension fileprivate func import init inout internal let open operator private protocol public rethrows static struct subscript typealias var break case continue default defer do else fallthrough for guard if in repeat return switch where while as Any catch false is nil super self Self throw throws true try',
  kotlin: 'as break class continue do else false for fun if in interface is null object package return super this throw true try typealias typeof val var when while by catch constructor delegate dynamic field file finally get import init param property receiver set setparam where actual abstract annotation companion const crossinline data enum expect external final infix inline inner internal lateinit noinline open operator out override private protected public reified sealed suspend tailrec vararg',
  scala: 'abstract case catch class def do else extends false final finally for forSome if implicit import lazy match new null object override package private protected return sealed super this throw trait true try type val var while with yield given using enum export opaque then',
  dart: 'abstract as assert async await break case catch class const continue covariant default deferred do dynamic else enum export extends extension external factory false final finally for Function get hide if implements import in interface is late library mixin new null on operator part required rethrow return set show static super switch sync this throw true try typedef var void while with yield',
  r: 'if else repeat while function for in next break true false null na nan inf library require source print paste c',
  yaml: 'true false null yes no on off',
  toml: 'true false',
  ini: 'true false',
  diff: '',
  latex: ''
};
var HL_CLIKE = {
  javascript: { comment: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'|`(?:\\\\[\\s\\S]|[^`\\\\])*`' },
  typescript: { comment: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'|`(?:\\\\[\\s\\S]|[^`\\\\])*`' },
  java: { comment: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'' },
  csharp: { comment: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|@"(?:""|[^"])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'' },
  c: { comment: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'', preproc: '#\\s*(?:include|define|ifdef|ifndef|if|elif|else|endif|pragma|undef|error|warning|line)\\b' },
  cpp: { comment: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'', preproc: '#\\s*(?:include|define|ifdef|ifndef|if|elif|else|endif|pragma|undef|error|warning|line)\\b' },
  go: { comment: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|`[^`]*`|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'' },
  rust: { comment: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"(?:\\\\[\\s\\S]|[^"\\\\])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'' },
  php: { comment: '\\/\\/[^\\n]*|#[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"(?:\\\\[\\s\\S]|[^"\\\\])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\])*\'' },
  ruby: { comment: '#[^\\n]*', string: '"(?:\\\\[\\s\\S]|[^"\\\\])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\])*\'' },
  swift: { comment: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"(?:\\\\[\\s\\S]|[^"\\\\])*"' },
  kotlin: { comment: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"""[\\s\\S]*?"""|"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'' },
  scala: { comment: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"""[\\s\\S]*?"""|"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'' },
  dart: { comment: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'' },
  r: { comment: '#[^\\n]*', string: '"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'' },
  lua: { comment: '--\\[\\[[\\s\\S]*?\\]\\]|--[^\\n]*', string: '\\[\\[[\\s\\S]*?\\]\\]|"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'' },
  shell: { comment: '#[^\\n]*', string: '"(?:\\\\[\\s\\S]|[^"\\\\])*"|\'[^\']*\'', variable: '\\$(?:[A-Za-z_][A-Za-z0-9_]*|\\{[^}\\n]+\\}|[0-9@*#?$!-])' },
  powershell: { comment: '#[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/', string: '"(?:`.|[^"`])*"|\'(?:\'\'|[^\'])*\'', variable: '\\$(?:[A-Za-z_][A-Za-z0-9_]*|\\{[^}\\n]+\\})' },
  batch: { comment: '\\brem\\b[^\\n]*|::[^\\n]*', string: '"[^"\\n]*"', variable: '%[^%\\n]+%|![^!\\n]+!' },
  sql: { comment: '--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|#[^\\n]*', string: '\'(?:\'\'|[^\'\\\\])*\'|"(?:""|[^"\\\\])*"|`[^`]*`' }
};
var HL_RE_CACHE = {};

function hlNorm(lang) {
  var l = String(lang || '').trim().toLowerCase();
  if (!l) return 'text';
  if (HL_ALIASES[l]) l = HL_ALIASES[l];
  return l;
}
function langOfName(name) {
  var e = extOf(name);
  if (e === 'ipynb') return 'json';
  return hlNorm(HL_EXT_LANG[e] || e || 'text');
}
function hlEscape(text) { return esc(String(text == null ? '' : text)); }
function hlKwSource(lang) {
  var raw = HL_KEYWORDS[lang] || '';
  if (!raw) return '(?!x)x';
  return raw.split(/\s+/).filter(Boolean).map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|');
}
function hlToken(text, cls) { return '<span class="hl-' + cls + '">' + hlEscape(text) + '</span>'; }
function hlClikeConfig(lang) {
  var base = HL_CLIKE[lang] || HL_CLIKE.javascript;
  return {
    comment: base.comment,
    string: base.string,
    variable: base.variable || '(?!x)x',
    preproc: base.preproc || '(?!x)x',
    kw: hlKwSource(lang),
    lit: lang === 'shell' || lang === 'powershell' ? 'true|false|null' : 'true|false|null|undefined|nil'
  };
}
function hlReFor(lang) {
  if (HL_RE_CACHE[lang]) return HL_RE_CACHE[lang];
  var cfg = hlClikeConfig(lang);
  var src = '(' + cfg.comment + ')|(' + cfg.string + ')|(\\b(?:0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)[uUlLfFdD]*\\b)|(\\b(?:' + cfg.kw + ')\\b)|(\\b(?:' + cfg.lit + ')\\b)|([A-Za-z_$][\\w$]*)(?=\\s*\\()|(' + cfg.variable + ')|(' + cfg.preproc + ')|([{}()\\[\\];,.:?!+\\-*\\/%&|^~=<>@#]+)';
  HL_RE_CACHE[lang] = new RegExp(src, lang === 'sql' ? 'gi' : 'g');
  return HL_RE_CACHE[lang];
}
function hlGeneric(text, lang) {
  var re = hlReFor(lang), out = '', last = 0, m;
  while ((m = re.exec(text))) {
    if (!m[0]) { re.lastIndex++; continue; }
    if (m.index > last) out += hlEscape(text.slice(last, m.index));
    if (m[1]) out += hlToken(m[0], 'com');
    else if (m[2]) out += hlToken(m[0], 'str');
    else if (m[3]) out += hlToken(m[0], 'num');
    else if (m[4]) out += hlToken(m[0], 'kw');
    else if (m[5]) out += hlToken(m[0], 'lit');
    else if (m[6]) out += hlToken(m[0], 'fn');
    else if (m[7]) out += hlToken(m[0], 'var');
    else if (m[8]) out += hlToken(m[0], 'meta');
    else out += hlToken(m[0], 'punct');
    last = re.lastIndex;
  }
  if (last < text.length) out += hlEscape(text.slice(last));
  return out;
}
function hlPython(text) {
  var comment = '#[^\\n]*';
  var string = '"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\'';
  var kw = 'and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|True|False|None';
  var re = new RegExp('(' + comment + ')|(' + string + ')|(\\b(?:0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?j?)\\b)|(\\b(?:' + kw + ')\\b)|([A-Za-z_][\\w]*)(?=\\s*\\()|([{}()\\[\\];,.:?!+\\-*\\/%&|^~=<>@]+)', 'g');
  var out = '', last = 0, m;
  while ((m = re.exec(text))) {
    if (!m[0]) { re.lastIndex++; continue; }
    if (m.index > last) out += hlEscape(text.slice(last, m.index));
    if (m[1]) out += hlToken(m[0], 'com');
    else if (m[2]) out += hlToken(m[0], 'str');
    else if (m[3]) out += hlToken(m[0], 'num');
    else if (m[4]) out += hlToken(m[0], 'kw');
    else if (m[5]) out += hlToken(m[0], 'fn');
    else out += hlToken(m[0], 'punct');
    last = re.lastIndex;
  }
  if (last < text.length) out += hlEscape(text.slice(last));
  return out;
}
function hlJson(text) {
  var re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*')|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b(?:true|false|null)\b)|([{}\[\],:])/g;
  var out = '', last = 0, m;
  while ((m = re.exec(text))) {
    if (!m[0]) { re.lastIndex++; continue; }
    if (m.index > last) out += hlEscape(text.slice(last, m.index));
    if (m[1]) out += hlToken(m[0], 'com');
    else if (m[2]) {
      var p = re.lastIndex, key = false;
      while (p < text.length && /\s/.test(text.charAt(p))) p++;
      key = text.charAt(p) === ':';
      out += hlToken(m[0], key ? 'prop' : 'str');
    } else if (m[3]) out += hlToken(m[0], 'num');
    else if (m[4]) out += hlToken(m[0], 'lit');
    else out += hlToken(m[0], 'punct');
    last = re.lastIndex;
  }
  if (last < text.length) out += hlEscape(text.slice(last));
  return out;
}
function hlCss(text) {
  var re = /(\/\*[\s\S]*?\*\/)|("(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*')|(@[-\w]+)|(#[0-9a-fA-F]{3,8}\b)|((?:--)?[-\w]+)(?=\s*:)|(!important\b)|(\b\d+(?:\.\d+)?(?:px|rem|em|ex|ch|vh|vw|vmin|vmax|%|pt|pc|cm|mm|in|s|ms|deg|rad|turn|fr)?\b)|([{}()\[\];:,>+~*\/=])/g;
  var out = '', last = 0, m;
  while ((m = re.exec(text))) {
    if (!m[0]) { re.lastIndex++; continue; }
    if (m.index > last) out += hlEscape(text.slice(last, m.index));
    if (m[1]) out += hlToken(m[0], 'com');
    else if (m[2]) out += hlToken(m[0], 'str');
    else if (m[3]) out += hlToken(m[0], 'meta');
    else if (m[4]) out += hlToken(m[0], 'num');
    else if (m[5]) out += hlToken(m[0], 'prop');
    else if (m[6]) out += hlToken(m[0], 'meta');
    else if (m[7]) out += hlToken(m[0], 'num');
    else out += hlToken(m[0], 'punct');
    last = re.lastIndex;
  }
  if (last < text.length) out += hlEscape(text.slice(last));
  return out;
}
function hlTag(text) {
  var m = /^<(\/?)([A-Za-z][\w:.-]*)([\s\S]*?)(\/?)>$/.exec(text);
  if (!m) return hlToken(text, 'tag');
  var out = hlToken('<', 'punct') + (m[1] ? hlToken('/', 'punct') : '') + hlToken(m[2], 'tag');
  var rest = m[3], re = /(\s+)|([^\s=\/"'<>]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g, a;
  while ((a = re.exec(rest))) {
    if (a[1]) { out += hlEscape(a[1]); continue; }
    if (!a[0]) { re.lastIndex++; continue; }
    out += hlToken(a[2], 'attr');
    if (a[3]) out += hlToken('=', 'punct') + hlToken(a[3], 'str');
  }
  out += m[4] ? hlToken(m[4], 'punct') : '';
  return out + hlToken('>', 'punct');
}
function hlMarkup(text) {
  var re = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>)|(<\/?[A-Za-z][^<>]*>)/gi;
  var out = '', last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out += hlEscape(text.slice(last, m.index));
    if (m[1]) out += hlToken(m[0], 'com');
    else out += hlTag(m[0]);
    last = re.lastIndex;
  }
  if (last < text.length) out += hlEscape(text.slice(last));
  return out;
}
function hlCommentAt(line, marks) {
  var q = '', escNext = false;
  for (var i = 0; i < line.length; i++) {
    var c = line.charAt(i);
    if (escNext) { escNext = false; continue; }
    if (c === '\\') { escNext = true; continue; }
    if (q) { if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (marks.indexOf(c) >= 0) {
      if (i === 0 || /\s/.test(line.charAt(i - 1))) return i;
    }
  }
  return -1;
}
function hlConfigValue(value) {
  var re = /("(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*')|(\b(?:true|false|null|yes|no|on|off)\b)|(-?\b\d+(?:\.\d+)?\b)|([{}[\],])/gi;
  var out = '', last = 0, m;
  while ((m = re.exec(value))) {
    if (!m[0]) { re.lastIndex++; continue; }
    if (m.index > last) out += hlEscape(value.slice(last, m.index));
    if (m[1]) out += hlToken(m[0], 'str');
    else if (m[2]) out += hlToken(m[0], 'lit');
    else if (m[3]) out += hlToken(m[0], 'num');
    else out += hlToken(m[0], 'punct');
    last = re.lastIndex;
  }
  if (last < value.length) out += hlEscape(value.slice(last));
  return out;
}
function hlConfig(text) {
  var lines = text.split('\n'), out = [];
  lines.forEach(function (line, i) {
    var eol = i < lines.length - 1 ? '\n' : '';
    var at = hlCommentAt(line, '#;'), body = at >= 0 ? line.slice(0, at) : line, comment = at >= 0 ? line.slice(at) : '';
    var m = /^(\s*)(\[[^\]]+\])(.*)$/.exec(body);
    if (m) {
      out.push(hlEscape(m[1]) + hlToken(m[2], 'meta') + hlConfigValue(m[3]) + (comment ? hlToken(comment, 'com') : '') + eol);
      return;
    }
    m = /^(\s*)(-\s+)?([^:=#;]+?)(\s*[:=]\s*)(.*)$/.exec(body);
    if (m) {
      out.push(hlEscape(m[1]) + (m[2] ? hlToken(m[2], 'punct') : '') + hlToken(m[3], 'prop') + hlToken(m[4], 'punct') + hlConfigValue(m[5]) + (comment ? hlToken(comment, 'com') : '') + eol);
      return;
    }
    if (comment && !body.trim()) out.push(hlEscape(body) + hlToken(comment, 'com') + eol);
    else out.push(hlConfigValue(body) + (comment ? hlToken(comment, 'com') : '') + eol);
  });
  return out.join('');
}
function hlInline(text) {
  var re = /(`+)([\s\S]*?)\1|(!?\[)([^\]]*)(\]\()([^)\n]+)(\))|(\*\*|__)([\s\S]*?)\8|~~([\s\S]*?)~~|(https?:\/\/[^\s<>()]+)/g;
  var out = '', last = 0, m;
  while ((m = re.exec(text))) {
    if (!m[0]) { re.lastIndex++; continue; }
    if (m.index > last) out += hlEscape(text.slice(last, m.index));
    if (m[2] != null) out += hlToken(m[1], 'punct') + hlToken(m[2], 'str') + hlToken(m[1], 'punct');
    else if (m[3]) out += hlToken(m[3], 'punct') + hlToken(m[4], 'link') + hlToken(m[5], 'punct') + hlToken(m[6], 'str') + hlToken(m[7], 'punct');
    else if (m[9] != null) out += hlToken(m[8], 'punct') + hlToken(m[9], 'strong') + hlToken(m[8], 'punct');
    else if (m[10] != null) out += hlToken('~~', 'punct') + hlToken(m[10], 'del') + hlToken('~~', 'punct');
    else out += hlToken(m[0], 'link');
    last = re.lastIndex;
  }
  if (last < text.length) out += hlEscape(text.slice(last));
  return out;
}
function hlMarkdown(text) {
  var lines = text.split('\n'), out = [], fence = '', codeLang = '';
  lines.forEach(function (line, i) {
    var eol = i < lines.length - 1 ? '\n' : '';
    var fm = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(line);
    if (fm) {
      if (!fence) { fence = fm[2].charAt(0); codeLang = hlNorm(fm[3].trim().split(/\s+/)[0] || 'text'); }
      else if (fm[2].charAt(0) === fence) { fence = ''; codeLang = ''; }
      out.push(hlToken(line, 'meta') + eol);
      return;
    }
    if (fence) {
      out.push(highlightCode(line, codeLang) + eol);
      return;
    }
    var m = /^(\s*)(#{1,6})(\s+)([\s\S]*)$/.exec(line);
    if (m) { out.push(hlEscape(m[1]) + hlToken(m[2], 'punct') + hlToken(m[3], 'strong') + hlToken(m[4], 'head') + eol); return; }
    m = /^(\s*)(>+)(\s?)([\s\S]*)$/.exec(line);
    if (m) { out.push(hlEscape(m[1]) + hlToken(m[2], 'meta') + hlEscape(m[3]) + hlInline(m[4]) + eol); return; }
    m = /^(\s*)([-*+]|\d+\.)(\s+)([\s\S]*)$/.exec(line);
    if (m) { out.push(hlEscape(m[1]) + hlToken(m[2], 'punct') + hlEscape(m[3]) + hlInline(m[4]) + eol); return; }
    if (/^\s*(?:---+|\*\*\*+|___+)\s*$/.test(line)) { out.push(hlToken(line, 'meta') + eol); return; }
    out.push(hlInline(line) + eol);
  });
  return out.join('');
}
function hlDiff(text) {
  var lines = text.split('\n'), out = [];
  lines.forEach(function (line, i) {
    var eol = i < lines.length - 1 ? '\n' : '';
    if (/^(?:\+\+\+|---|Index:|diff |@@)/.test(line)) out.push(hlToken(line, 'meta') + eol);
    else if (line.charAt(0) === '+') out.push(hlToken(line, 'ins') + eol);
    else if (line.charAt(0) === '-') out.push(hlToken(line, 'del') + eol);
    else out.push(hlEscape(line) + eol);
  });
  return out.join('');
}
function highlightCode(text, lang) {
  text = String(text == null ? '' : text);
  var l = hlNorm(lang);
  if (!text || l === 'text' || l === 'csv' || text.length > HL_MAX) return hlEscape(text);
  if (l === 'markdown') return hlMarkdown(text);
  if (l === 'json') return hlJson(text);
  if (l === 'html' || l === 'xml') return hlMarkup(text);
  if (l === 'css') return hlCss(text);
  if (l === 'yaml' || l === 'toml' || l === 'ini') return hlConfig(text);
  if (l === 'diff') return hlDiff(text);
  if (l === 'python') return hlPython(text);
  if (l === 'latex') return hlGeneric(text, 'default');
  if (HL_CLIKE[l] || HL_KEYWORDS[l]) return hlGeneric(text, l);
  return hlEscape(text);
}
function applyHighlight(pre, text, lang) {
  if (!pre) return;
  var l = hlNorm(lang);
  if (!text || l === 'text' || text.length > HL_MAX) { pre.textContent = text; return; }
  pre.innerHTML = highlightCode(text, l);
  pre.classList.add('hl');
}
