var TEX_SYMBOLS = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ϵ', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο', pi: 'π', varpi: 'ϖ', rho: 'ρ', varrho: 'ϱ', sigma: 'σ', varsigma: 'ς', tau: 'τ', upsilon: 'υ', phi: 'ϕ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  pm: '±', mp: '∓', times: '×', div: '÷', cdot: '⋅', ast: '∗', star: '⋆', circ: '∘', bullet: '∙', oplus: '⊕', ominus: '⊖', otimes: '⊗', oslash: '⊘', odot: '⊙', bigcirc: '◯', dagger: '†', ddagger: '‡', amalg: '⨿', cap: '∩', cup: '∪', uplus: '⊎', sqcap: '⊓', sqcup: '⊔', vee: '∨', wedge: '∧', setminus: '∖', wr: '≀', diamond: '⋄', triangleleft: '◁', triangleright: '▷', lhd: '⊲', rhd: '⊳', unlhd: '⊴', unrhd: '⊵', dotplus: '∔', ltimes: '⋉', rtimes: '⋊', leftthreetimes: '⋋', rightthreetimes: '⋌', curlyvee: '⋎', curlywedge: '⋏', doublecap: '⋒', doublecup: '⋓',
  le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', approx: '≈', sim: '∼', simeq: '≃', cong: '≅', equiv: '≡', propto: '∝', in: '∈', ni: '∋', notin: '∉', subset: '⊂', subseteq: '⊆', supset: '⊃', supseteq: '⊇', sqsubset: '⊏', sqsubseteq: '⊑', sqsupset: '⊐', sqsupseteq: '⊒', parallel: '∥', perp: '⊥', mid: '∣', nmid: '∤', models: '⊨', vdash: '⊢', dashv: '⊣', smile: '⌣', frown: '⌢', asymp: '≍', doteq: '≐', bowtie: '⋈', Join: '⋈', prec: '≺', succ: '≻', preceq: '⪯', succeq: '⪰', ll: '≪', gg: '≫', lt: '<', gt: '>', lll: '⋘', ggg: '⋙', triangleq: '≜', therefore: '∴', because: '∵', coloneqq: '≔', eqqcolon: '≕', approxeq: '≊', lesssim: '≲', gtrsim: '≳', lessgtr: '≶', gtrless: '≷', leqslant: '⩽', geqslant: '⩾', nleq: '≰', ngeq: '≱', nless: '≮', ngtr: '≯', nsim: '≁', ncong: '≇', nparallel: '∦', nsubseteq: '⊈', nsupseteq: '⊉', subsetneq: '⊊', supsetneq: '⊋',
  to: '→', rightarrow: '→', leftarrow: '←', gets: '←', uparrow: '↑', downarrow: '↓', leftrightarrow: '↔', Leftarrow: '⇐', Rightarrow: '⇒', Leftrightarrow: '⇔', mapsto: '↦', longmapsto: '⟼', hookrightarrow: '↪', hookleftarrow: '↩', rightharpoonup: '⇀', rightharpoondown: '⇁', leftharpoonup: '↼', leftharpoondown: '↽', rightleftharpoons: '⇌', leadsto: '⇝', nearrow: '↗', searrow: '↘', swarrow: '↙', nwarrow: '↖', updownarrow: '↕', Updownarrow: '⇕', Uparrow: '⇑', Downarrow: '⇓', implies: '⇒', impliedby: '⇐', iff: '⇔', twoheadrightarrow: '↠', twoheadleftarrow: '↞', rightleftarrows: '⇄', leftrightarrows: '⇆', rightrightarrows: '⇉', leftleftarrows: '⇇', rightarrowtail: '↣', leftarrowtail: '↢', curvearrowright: '↷', curvearrowleft: '↶', circlearrowright: '↻', circlearrowleft: '↺',
  infty: '∞', partial: '∂', nabla: '∇', emptyset: '∅', varnothing: '∅', forall: '∀', exists: '∃', nexists: '∄', neg: '¬', lnot: '¬', top: '⊤', bot: '⊥', angle: '∠', measuredangle: '∡', sphericalangle: '∢', triangle: '△', square: '□', Box: '□', blacksquare: '■', blacktriangle: '▲', blacktriangledown: '▼', lozenge: '◊', blacklozenge: '⧫', bigstar: '★', checkmark: '✓', maltese: '✠', clubsuit: '♣', diamondsuit: '♦', heartsuit: '♥', spadesuit: '♠', flat: '♭', natural: '♮', sharp: '♯', degree: '°', prime: '′', backprime: '‵', hbar: 'ℏ', hslash: 'ℏ', ell: 'ℓ', Re: 'ℜ', Im: 'ℑ', aleph: 'ℵ', beth: 'ℶ', gimel: 'ℷ', daleth: 'ℸ', wp: '℘', complement: '∁',
  ldots: '…', cdots: '⋯', vdots: '⋮', ddots: '⋱', dots: '…', textellipsis: '…',
  langle: '⟨', rangle: '⟩', lfloor: '⌊', rfloor: '⌋', lceil: '⌈', rceil: '⌉', lbrace: '{', rbrace: '}', lbrack: '[', rbrack: ']', vert: '|', Vert: '‖', backslash: '∖', lgroup: '⟮', rgroup: '⟯', lmoustache: '⎰', rmoustache: '⎱',
  sum: '∑', prod: '∏', coprod: '∐', int: '∫', iint: '∬', iiint: '∭', oint: '∮', bigcup: '⋃', bigcap: '⋂', bigsqcup: '⨆', bigsqcap: '⨅', bigvee: '⋁', bigwedge: '⋀', bigoplus: '⨁', bigotimes: '⨂', bigodot: '⨀', biguplus: '⨄',
  '%': '%', '$': '$', '#': '#', '&': '&', '_': '_', '{': '{', '}': '}', '|': '‖', ' ': ' ', '\\': '\\'
};
var TEX_FUNCS = { sin: 1, cos: 1, tan: 1, cot: 1, sec: 1, csc: 1, arcsin: 1, arccos: 1, arctan: 1, sinh: 1, cosh: 1, tanh: 1, coth: 1, log: 1, ln: 1, lg: 1, exp: 1, lim: 1, liminf: 1, limsup: 1, max: 1, min: 1, sup: 1, inf: 1, det: 1, gcd: 1, lcm: 1, Pr: 1, arg: 1, dim: 1, hom: 1, ker: 1, deg: 1, dom: 1, cod: 1, rank: 1, tr: 1, diag: 1, sgn: 1, erf: 1, sech: 1, csch: 1, asin: 1, acos: 1, atan: 1 };
var TEX_LIMIT_FUNCS = { lim: 1, liminf: 1, limsup: 1, max: 1, min: 1, sup: 1, inf: 1, det: 1, gcd: 1, Pr: 1 };
var TEX_BIGOPS = { sum: 1, prod: 1, coprod: 1, int: 1, iint: 1, iiint: 1, oint: 1, bigcup: 1, bigcap: 1, bigsqcup: 1, bigsqcap: 1, bigvee: 1, bigwedge: 1, bigoplus: 1, bigotimes: 1, bigodot: 1, biguplus: 1 };
var TEX_SPACES = { ',': '0.1667em', ':': '0.2222em', '>': '0.2222em', ';': '0.2778em', '!': '-0.1667em', quad: '1em', qquad: '2em', thinspace: '0.1667em', medspace: '0.2222em', thickspace: '0.2778em', negthinspace: '-0.1667em', enspace: '0.5em', enskip: '0.5em', ' ': '0.333em', '~': '0.333em', 'nobreakspace': '0.333em' };
var TEX_VARIANTS = { mathrm: 'normal', mathbf: 'bold', mathit: 'italic', mathbb: 'double-struck', mathcal: 'script', mathfrak: 'fraktur', mathsf: 'sans-serif', mathtt: 'monospace', mathnormal: 'normal', boldsymbol: 'bold-italic', bm: 'bold-italic', rm: 'normal', bf: 'bold', it: 'italic', cal: 'script', sf: 'sans-serif', tt: 'monospace' };
var TEX_ACCENTS = { hat: '^', widehat: '^', tilde: '~', widetilde: '~', bar: '¯', vec: '→', dot: '˙', ddot: '¨', acute: '´', grave: '`', breve: '˘', check: 'ˇ', mathring: '˚' };
var TEX_DELIMS = { '(': '(', ')': ')', '[': '[', ']': ']', '|': '‖', '/': '/', '.': '', '{': '{', '}': '}', 'langle': '⟨', 'rangle': '⟩', 'lfloor': '⌊', 'rfloor': '⌋', 'lceil': '⌈', 'rceil': '⌉', 'vert': '|', 'Vert': '‖', 'uparrow': '↑', 'downarrow': '↓', 'updownarrow': '↕' };
var DOUBLE_STRUCK = { A: '𝔸', B: '𝔹', C: 'ℂ', D: '𝔻', E: '𝔼', F: '𝔽', G: '𝔾', H: 'ℍ', I: '𝕀', J: '𝕁', K: '𝕂', L: '𝕃', M: '𝕄', N: 'ℕ', O: '𝕆', P: 'ℙ', Q: 'ℚ', R: 'ℝ', S: '𝕊', T: '𝕋', U: '𝕌', V: '𝕍', W: '𝕎', X: '𝕏', Y: '𝕐', Z: 'ℤ', 0: '𝟘', 1: '𝟙', 2: '𝟚', 3: '𝟛', 4: '𝟜', 5: '𝟝', 6: '𝟞', 7: '𝟟', 8: '𝟠', 9: '𝟡' };

function TexParser(src) {
  this.s = String(src == null ? '' : src).replace(/\r\n?/g, '\n');
  this.i = 0;
  this.variant = 'italic';
  this.displaystyle = false;
  this.depth = 0;
}
TexParser.prototype.error = function (msg) { throw new Error(msg); };
TexParser.prototype.ws = function () { while (this.i < this.s.length && /\s/.test(this.s[this.i])) this.i++; };
TexParser.prototype.peek = function () { return this.s[this.i] || ''; };
TexParser.prototype.peekCmd = function () {
  var j = this.i;
  while (j < this.s.length && /\s/.test(this.s[j])) j++;
  if (this.s[j] !== '\\') return '';
  var k = j + 1;
  if (k >= this.s.length) return '';
  if (/[A-Za-z]/.test(this.s[k])) {
    while (k < this.s.length && /[A-Za-z]/.test(this.s[k])) k++;
    return this.s.slice(j + 1, k);
  }
  return this.s[k];
};
TexParser.prototype.readCmd = function () {
  this.ws();
  if (this.s[this.i] !== '\\') this.error('应为命令');
  this.i++;
  if (this.i >= this.s.length) this.error('命令意外结束');
  var c = this.s[this.i];
  if (/[A-Za-z]/.test(c)) {
    var st = this.i;
    while (this.i < this.s.length && /[A-Za-z]/.test(this.s[this.i])) this.i++;
    return this.s.slice(st, this.i);
  }
  this.i++;
  return c;
};
TexParser.prototype.readRawGroup = function () {
  this.ws();
  if (this.s[this.i] !== '{') this.error('缺少 {');
  this.i++;
  var depth = 1, st = this.i;
  while (this.i < this.s.length) {
    var c = this.s[this.i];
    if (c === '\\') { this.i += 2; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (!depth) { var raw = this.s.slice(st, this.i); this.i++; return raw; } }
    this.i++;
  }
  this.error('括号未闭合');
};
TexParser.prototype.readBracketGroup = function () {
  this.ws();
  if (this.s[this.i] !== '[') return null;
  this.i++;
  var depth = 1, st = this.i;
  while (this.i < this.s.length) {
    var c = this.s[this.i];
    if (c === '\\') { this.i += 2; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (!depth) { var raw = this.s.slice(st, this.i); this.i++; return raw; } }
    this.i++;
  }
  this.error('可选参数未闭合');
};
TexParser.prototype.readDelimiter = function () {
  this.ws();
  if (this.i >= this.s.length) return '';
  if (this.s[this.i] === '\\') {
    var c = this.readCmd();
    if (TEX_DELIMS[c] != null) return TEX_DELIMS[c];
    if (TEX_SYMBOLS[c] != null) return TEX_SYMBOLS[c];
    return '';
  }
  var ch = this.s[this.i++];
  return ch === '.' ? '' : ch;
};
TexParser.prototype.readDimension = function () {
  this.ws();
  var st = this.i;
  if (this.s[this.i] === '+' || this.s[this.i] === '-') this.i++;
  while (this.i < this.s.length && /[0-9.]/.test(this.s[this.i])) this.i++;
  while (this.i < this.s.length && /[a-zA-Z]/.test(this.s[this.i])) this.i++;
  return this.s.slice(st, this.i);
};
TexParser.prototype.readNumber = function () {
  var st = this.i;
  while (this.i < this.s.length && /[0-9]/.test(this.s[this.i])) this.i++;
  if (this.s[this.i] === '.' && /[0-9]/.test(this.s[this.i + 1])) { this.i++; while (this.i < this.s.length && /[0-9]/.test(this.s[this.i])) this.i++; }
  return { t: 'mn', v: this.s.slice(st, this.i) };
};
TexParser.prototype.parseGroup = function () {
  this.ws();
  if (this.s[this.i] !== '{') return this.parseAtom();
  this.i++;
  var save = this.variant;
  var row = this.parseList('}');
  this.variant = save;
  if (this.s[this.i] === '}') this.i++; else this.error('括号未闭合');
  return row;
};
TexParser.prototype.parseArg = function () {
  this.ws();
  if (this.i >= this.s.length) return { t: 'row', c: [] };
  if (this.s[this.i] === '{') return this.parseGroup();
  if (this.s[this.i] === '\\') return this.parseCommand();
  return this.parseAtom();
};
TexParser.prototype.parseAll = function () {
  var row = this.parseList();
  this.ws();
  if (this.i < this.s.length) this.error('无法解析：' + this.s.slice(this.i, this.i + 24));
  return row;
};
TexParser.prototype.parseList = function (stopChar, stopCmd, inTable) {
  var out = [];
  while (true) {
    this.ws();
    if (this.i >= this.s.length) break;
    var ch = this.s[this.i];
    if (stopChar && ch === stopChar) break;
    if (ch === '}') break;
    if (stopCmd && this.peekCmd() === stopCmd) break;
    if (inTable && ch === '&') break;
    if (inTable && this.peekCmd() === '\\') break;
    if (ch === '^' || ch === '_') {
      this.i++;
      var arg = this.parseArg();
      var base = out.length ? out.pop() : { t: 'row', c: [] };
      base = attachScript(base, ch === '_' ? arg : null, ch === '^' ? arg : null);
      out.push(base);
      continue;
    }
    if (ch === '&') break;
    var atom = this.parseAtom();
    if (!atom) continue;
    if (atom.t === 'flag') {
      if (atom.flag === 'limits' && out.length) out[out.length - 1].limits = true;
      else if (atom.flag === 'nolimits' && out.length) out[out.length - 1].limits = false;
      continue;
    }
    out.push(atom);
  }
  return { t: 'row', c: out };
};
TexParser.prototype.parseAtom = function () {
  this.ws();
  if (this.i >= this.s.length) return null;
  var ch = this.s[this.i];
  if (ch === '{') return this.parseGroup();
  if (ch === '}') return null;
  if (ch === '\\') return this.parseCommand();
  if (ch === '&') return null;
  if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(this.s[this.i + 1]))) return this.readNumber();
  if (/[A-Za-z]/.test(ch)) {
    var st = this.i;
    while (this.i < this.s.length && /[A-Za-z]/.test(this.s[this.i])) this.i++;
    var word = this.s.slice(st, this.i);
    if (TEX_FUNCS[word]) return { t: 'mi', v: word, variant: 'normal', limits: !!TEX_LIMIT_FUNCS[word] };
    return { t: 'mi', v: word, variant: this.variant };
  }
  if (/[\u3400-\u9fff\uf900-\ufaff]/.test(ch)) {
    var cst = this.i;
    while (this.i < this.s.length && /[\u3400-\u9fff\uf900-\ufaff]/.test(this.s[this.i])) this.i++;
    return { t: 'mtext', v: this.s.slice(cst, this.i) };
  }
  this.i++;
  if (ch === '-') return { t: 'mo', v: '−' };
  if (ch === '*') return { t: 'mo', v: '∗' };
  if (ch === "'") return { t: 'mo', v: '′' };
  if (ch === '~') return { t: 'mspace', w: '0.333em' };
  if (ch === ' ') return null;
  return { t: 'mo', v: ch };
};
TexParser.prototype.parseCommand = function () {
  var cmd = this.readCmd();
  if (cmd === '\\') return { t: 'mspace', br: true };
  if (TEX_SPACES[cmd] != null) return { t: 'mspace', w: TEX_SPACES[cmd] };
  if (cmd === 'mathrm' || cmd === 'mathbf' || cmd === 'mathit' || cmd === 'mathbb' || cmd === 'mathcal' || cmd === 'mathfrak' || cmd === 'mathsf' || cmd === 'mathtt' || cmd === 'mathnormal' || cmd === 'boldsymbol' || cmd === 'bm') {
    var saveStyle = this.variant;
    this.variant = TEX_VARIANTS[cmd];
    var styledBody = this.parseArg();
    this.variant = saveStyle;
    return styledBody;
  }
  if (TEX_VARIANTS[cmd]) { this.variant = TEX_VARIANTS[cmd]; return null; }
  if (cmd === 'limits' || cmd === 'nolimits' || cmd === 'displaylimits') return { t: 'flag', flag: cmd === 'limits' ? 'limits' : 'nolimits' };
  if (cmd === 'displaystyle') { this.displaystyle = true; return null; }
  if (cmd === 'textstyle' || cmd === 'scriptstyle' || cmd === 'scriptscriptstyle') { this.displaystyle = false; return null; }
  if (cmd === 'nonumber' || cmd === 'notag' || cmd === 'label' || cmd === 'index' || cmd === 'hline' || cmd === 'mathstrut' || cmd === 'strut') {
    if (cmd === 'label' || cmd === 'index') this.readRawGroup();
    return null;
  }
  if (cmd === 'color') { this.readRawGroup(); return null; }
  if (cmd === 'textcolor') { var col = this.readRawGroup(); var cbody = this.parseArg(); return { t: 'color', color: col, body: cbody }; }
  if (cmd === 'frac' || cmd === 'dfrac' || cmd === 'tfrac' || cmd === 'binom' || cmd === 'dbinom' || cmd === 'tbinom') {
    var noLine = cmd === 'binom' || cmd === 'dbinom' || cmd === 'tbinom';
    var num = this.parseArg(), den = this.parseArg();
    var fr = { t: 'frac', num: num, den: den, noLine: noLine };
    if (noLine) return { t: 'fenced', open: '(', close: ')', body: { t: 'row', c: [fr] } };
    return fr;
  }
  if (cmd === 'sqrt') {
    var idxRaw = this.readBracketGroup(), body = this.parseArg();
    var idx = idxRaw == null ? null : (new TexParser(idxRaw).parseAll());
    return { t: 'sqrt', index: idx, body: body };
  }
  if (cmd === 'text' || cmd === 'textrm' || cmd === 'textnormal' || cmd === 'mbox' || cmd === 'hbox' || cmd === 'textbf' || cmd === 'textit' || cmd === 'textsf' || cmd === 'texttt') {
    var raw = this.readRawGroup();
    var tv = cmd === 'textbf' ? 'bold' : cmd === 'textit' ? 'italic' : cmd === 'textsf' ? 'sans-serif' : cmd === 'texttt' ? 'monospace' : 'normal';
    return { t: 'mtext', v: texText(raw), variant: tv };
  }
  if (cmd === 'operatorname' || cmd === 'mathop') {
    if (this.peek() === '*') this.i++;
    var opRaw = this.readRawGroup();
    var saveV = this.variant;
    this.variant = 'normal';
    var op = new TexParser(opRaw).parseAll();
    this.variant = saveV;
    op.limits = cmd === 'mathop' ? false : true;
    return op;
  }
  if (TEX_ACCENTS[cmd]) {
    var ab = this.parseArg();
    return { t: 'over', base: ab, over: { t: 'mo', v: TEX_ACCENTS[cmd], stretchy: true }, accent: true };
  }
  if (cmd === 'overline') return { t: 'over', base: this.parseArg(), over: { t: 'mo', v: '¯', stretchy: true }, accent: false };
  if (cmd === 'underline') return { t: 'under', base: this.parseArg(), under: { t: 'mo', v: '_', stretchy: true } };
  if (cmd === 'overbrace') return { t: 'over', base: this.parseArg(), over: { t: 'mo', v: '⏞', stretchy: true }, accent: false };
  if (cmd === 'underbrace') return { t: 'under', base: this.parseArg(), under: { t: 'mo', v: '⏟', stretchy: true } };
  if (cmd === 'overrightarrow') return { t: 'over', base: this.parseArg(), over: { t: 'mo', v: '→', stretchy: true }, accent: true };
  if (cmd === 'overleftarrow') return { t: 'over', base: this.parseArg(), over: { t: 'mo', v: '←', stretchy: true }, accent: true };
  if (cmd === 'overleftrightarrow') return { t: 'over', base: this.parseArg(), over: { t: 'mo', v: '↔', stretchy: true }, accent: true };
  if (cmd === 'overset' || cmd === 'stackrel') { var top = this.parseArg(), ob = this.parseArg(); return { t: 'over', base: ob, over: top, accent: false }; }
  if (cmd === 'underset') { var bot = this.parseArg(), ub = this.parseArg(); return { t: 'under', base: ub, under: bot }; }
  if (cmd === 'underrightarrow') return { t: 'under', base: this.parseArg(), under: { t: 'mo', v: '→', stretchy: true } };
  if (cmd === 'boxed') return { t: 'enclose', notation: 'box', body: this.parseArg() };
  if (cmd === 'cancel') return { t: 'enclose', notation: 'updiagonalstrike', body: this.parseArg() };
  if (cmd === 'bcancel') return { t: 'enclose', notation: 'downdiagonalstrike', body: this.parseArg() };
  if (cmd === 'xcancel') return { t: 'enclose', notation: 'updiagonalstrike downdiagonalstrike', body: this.parseArg() };
  if (cmd === 'phantom' || cmd === 'hphantom' || cmd === 'vphantom') return { t: 'phantom', body: this.parseArg() };
  if (cmd === 'not') return { t: 'enclose', notation: 'updiagonalstrike', body: this.parseArg() };
  if (cmd === 'pmod') { var pmb = this.parseArg(); return { t: 'row', c: [{ t: 'mspace', w: '0.333em' }, { t: 'mo', v: '(' }, { t: 'mi', v: 'mod', variant: 'normal' }, { t: 'mspace', w: '0.25em' }, pmb, { t: 'mo', v: ')' }] }; }
  if (cmd === 'mod' || cmd === 'bmod') return { t: 'row', c: [{ t: 'mspace', w: '0.2778em' }, { t: 'mi', v: 'mod', variant: 'normal' }, { t: 'mspace', w: '0.2778em' }] };
  if (cmd === 'left') {
    var open = this.readDelimiter();
    var lb = this.parseList('', '\\right');
    if (this.peekCmd() !== 'right') this.error('缺少 \\right');
    this.readCmd();
    var close = this.readDelimiter();
    return { t: 'fenced', open: open, close: close, body: lb };
  }
  if (cmd === 'right') this.error('多余的 \\right');
  if (cmd === 'big' || cmd === 'Big' || cmd === 'bigg' || cmd === 'Bigg' || cmd === 'bigl' || cmd === 'bigr' || cmd === 'Bigl' || cmd === 'Bigr' || cmd === 'biggl' || cmd === 'biggr' || cmd === 'Biggl' || cmd === 'Biggr') {
    var bg = this.readDelimiter();
    return bg ? { t: 'mo', v: bg, stretchy: false } : null;
  }
  if (cmd === 'begin') {
    var env = this.readRawGroup();
    var spec = '';
    if (env === 'array') spec = this.readRawGroup();
    else if (env === 'alignedat' || env === 'alignedat*') spec = this.readRawGroup();
    var rows = [], row = [];
    while (true) {
      var cell = this.parseList('', '\\end', true);
      row.push(cell);
      this.ws();
      if (this.peek() === '&') { this.i++; continue; }
      if (this.peekCmd() === '\\') { this.readCmd(); rows.push(row); row = []; continue; }
      if (this.peekCmd() === 'end') {
        this.readCmd();
        var endEnv = this.readRawGroup();
        if (endEnv !== env) this.error('环境结束不匹配：' + endEnv);
        rows.push(row);
        break;
      }
      if (this.i >= this.s.length) { rows.push(row); break; }
      this.error('环境内容无法解析');
    }
    return { t: 'table', rows: rows, env: env, spec: spec };
  }
  if (cmd === 'end') this.error('多余的 \\end');
  if (cmd === 'substack') {
    var stRaw = this.readRawGroup();
    var parts = stRaw.split(/\\\\/), srows = [];
    parts.forEach(function (p) { srows.push([(new TexParser(p)).parseAll()]); });
    return { t: 'table', rows: srows, env: 'substack', spec: '' };
  }
  if (cmd === 'mathchoice') {
    var a = this.parseArg(), b = this.parseArg(), c = this.parseArg(), d = this.parseArg();
    return this.displaystyle ? a : b;
  }
  if (cmd === 'multicolumn' || cmd === 'multirow') {
    var n = this.parseArg(), al = this.parseArg(), content = this.parseArg();
    return content;
  }
  if (cmd === 'href') { this.readRawGroup(); return this.parseArg(); }
  if (cmd === 'url') { return { t: 'mtext', v: texText(this.readRawGroup()), variant: 'normal' }; }
  if (cmd === 'textbackslash') return { t: 'mtext', v: '\\' };
  if (cmd === 'hspace' || cmd === 'vspace' || cmd === 'kern' || cmd === 'mkern') {
    if (this.peek() === '*') this.i++;
    var dim = this.s[this.i] === '{' ? this.readRawGroup() : this.readDimension();
    return { t: 'mspace', w: dim || '0.5em' };
  }
  if (cmd === 'rule') { this.parseArg(); this.parseArg(); return { t: 'mspace', w: '0.5em' }; }
  if (cmd === 'unicode') {
    var u = this.readRawGroup().replace(/^x/i, '');
    var cp = parseInt(u, 16);
    return isFinite(cp) ? { t: 'mo', v: String.fromCodePoint(cp) } : null;
  }
  if (cmd === 'char') {
    var cRaw = this.s.slice(this.i).trim();
    var m = /^"([0-9A-Fa-f]+)/.exec(cRaw);
    if (m) { this.i += this.s.slice(this.i).indexOf(m[0]) + m[0].length; return { t: 'mo', v: String.fromCodePoint(parseInt(m[1], 16)) }; }
    return null;
  }
  if (cmd === 'newline' || cmd === 'cr' || cmd === 'linebreak') return { t: 'mspace', br: true };
  if (cmd === 'verb') {
    var delim = this.s[this.i++], st = this.i;
    while (this.i < this.s.length && this.s[this.i] !== delim) this.i++;
    var vv = this.s.slice(st, this.i);
    if (this.s[this.i] === delim) this.i++;
    return { t: 'mtext', v: vv, variant: 'monospace' };
  }
  if (TEX_BIGOPS[cmd]) {
    var lim = cmd.indexOf('int') < 0 && cmd !== 'oint';
    return { t: 'mo', v: TEX_SYMBOLS[cmd], largeop: true, limits: lim };
  }
  if (TEX_SYMBOLS[cmd] != null) return { t: 'mo', v: TEX_SYMBOLS[cmd] };
  if (TEX_FUNCS[cmd]) return { t: 'mi', v: cmd, variant: 'normal', limits: !!TEX_LIMIT_FUNCS[cmd] };
  if (cmd === 'textdegree') return { t: 'mo', v: '°' };
  if (cmd === 'textpm') return { t: 'mo', v: '±' };
  if (cmd === 'textmu') return { t: 'mo', v: 'µ' };
  if (cmd === 'texttimes') return { t: 'mo', v: '×' };
  throw new Error('不支持的命令 \\' + cmd);
};

function attachScript(base, sub, sup) {
  if (!base) base = { t: 'row', c: [] };
  if (base.t === 'script') { if (sub) base.sub = sub; if (sup) base.sup = sup; return base; }
  return { t: 'script', base: base, sub: sub, sup: sup };
}
function texText(raw) {
  return String(raw || '').replace(/\\([{}%$&#_ \\])/g, '$1').replace(/\\textbackslash/g, '\\').replace(/\\ldots/g, '…').replace(/\\dots/g, '…').replace(/\\,|\\;/g, ' ');
}
function mmlEsc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function mmlRow(n) { return '<mrow>' + (n.c || []).map(mmlNode).join('') + '</mrow>'; }
function mmlNode(n) {
  if (!n) return '';
  switch (n.t) {
    case 'row': return mmlRow(n);
    case 'mi': {
      var v = n.v;
      if (n.variant === 'double-struck' && v.length === 1 && DOUBLE_STRUCK[v]) return '<mi>' + mmlEsc(DOUBLE_STRUCK[v]) + '</mi>';
      var a = '';
      if (n.variant && n.variant !== 'italic') a = ' mathvariant="' + mmlEsc(n.variant) + '"';
      else if (v.length > 1) a = ' mathvariant="italic"';
      return '<mi' + a + '>' + mmlEsc(v) + '</mi>';
    }
    case 'mn': return '<mn>' + mmlEsc(n.v) + '</mn>';
    case 'mo': {
      var at = '';
      if (n.stretchy) at += ' stretchy="true"';
      if (n.largeop) at += ' largeop="true" movablelimits="true"';
      if (n.fence) at += ' fence="true" stretchy="true"';
      return '<mo' + at + '>' + mmlEsc(n.v) + '</mo>';
    }
    case 'mtext': {
      var ta = n.variant ? ' mathvariant="' + mmlEsc(n.variant) + '"' : ' mathvariant="normal"';
      return '<mtext' + ta + ' xml:space="preserve">' + mmlEsc(n.v).replace(/ /g, '\u00A0') + '</mtext>';
    }
    case 'mspace': return n.br ? '<mspace linebreak="newline"/>' : '<mspace width="' + mmlEsc(n.w || '0.2em') + '"/>';
    case 'frac': {
      var lt = n.noLine ? ' linethickness="0"' : '';
      return '<mfrac' + lt + '>' + mmlNode(n.num) + mmlNode(n.den) + '</mfrac>';
    }
    case 'sqrt': {
      if (n.index) return '<mroot>' + mmlNode(n.body) + mmlNode(n.index) + '</mroot>';
      return '<msqrt>' + mmlNode(n.body) + '</msqrt>';
    }
    case 'script': {
      var base = n.base || { t: 'row', c: [] };
      var isLim = !!base.limits;
      if (n.sub && n.sup) return '<' + (isLim ? 'munderover' : 'msubsup') + '>' + mmlNode(base) + mmlNode(n.sub) + mmlNode(n.sup) + '</' + (isLim ? 'munderover' : 'msubsup') + '>';
      if (n.sub) return '<' + (isLim ? 'munder' : 'msub') + '>' + mmlNode(base) + mmlNode(n.sub) + '</' + (isLim ? 'munder' : 'msub') + '>';
      if (n.sup) return '<' + (isLim ? 'mover' : 'msup') + '>' + mmlNode(base) + mmlNode(n.sup) + '</' + (isLim ? 'mover' : 'msup') + '>';
      return mmlNode(base);
    }
    case 'over': return '<mover accent="' + (n.accent ? 'true' : 'false') + '">' + mmlNode(n.base) + mmlNode(n.over) + '</mover>';
    case 'under': return '<munder accentunder="false">' + mmlNode(n.base) + mmlNode(n.under) + '</munder>';
    case 'fenced': {
      var o = n.open ? '<mo fence="true" stretchy="true">' + mmlEsc(n.open) + '</mo>' : '';
      var c = n.close ? '<mo fence="true" stretchy="true">' + mmlEsc(n.close) + '</mo>' : '';
      return '<mrow>' + o + mmlNode(n.body) + c + '</mrow>';
    }
    case 'table': return mmlTable(n);
    case 'phantom': return '<mphantom>' + mmlNode(n.body) + '</mphantom>';
    case 'enclose': return '<menclose notation="' + mmlEsc(n.notation) + '">' + mmlNode(n.body) + '</menclose>';
    case 'color': return '<mstyle mathcolor="' + mmlEsc(n.color) + '">' + mmlNode(n.body) + '</mstyle>';
    default: return '';
  }
}
function mmlTable(n) {
  var env = n.env || 'matrix';
  var align = '';
  if (n.spec) {
    var parts = [];
    for (var i = 0; i < n.spec.length; i++) {
      var c = n.spec[i];
      if (c === 'l') parts.push('left');
      else if (c === 'c') parts.push('center');
      else if (c === 'r') parts.push('right');
      else if (c === '|') continue;
    }
    if (parts.length) align = ' columnalign="' + parts.join(' ') + '"';
  } else if (env === 'aligned' || env === 'align' || env === 'align*' || env === 'alignedat' || env === 'alignedat*' || env === 'split' || env === 'eqnarray' || env === 'eqnarray*') {
    align = ' columnalign="right left" columnspacing="0.28em"';
  } else if (env === 'cases') {
    align = ' columnalign="left" columnspacing="0.28em"';
  } else if (env === 'gather' || env === 'gather*' || env === 'gathered' || env === 'substack') {
    align = ' columnalign="center"';
  }
  var body = (n.rows || []).map(function (row) {
    return '<mtr>' + row.map(function (cell) { return '<mtd>' + mmlNode(cell) + '</mtd>'; }).join('') + '</mtr>';
  }).join('');
  var table = '<mtable' + align + ' rowspacing="0.25em">' + body + '</mtable>';
  var fence = '';
  if (env === 'pmatrix') fence = ['(', ')'];
  else if (env === 'bmatrix') fence = ['[', ']'];
  else if (env === 'Bmatrix') fence = ['{', '}'];
  else if (env === 'vmatrix') fence = ['|', '|'];
  else if (env === 'Vmatrix') fence = ['‖', '‖'];
  else if (env === 'cases') fence = ['{', ''];
  if (fence) return '<mrow><mo fence="true" stretchy="true">' + mmlEsc(fence[0]) + '</mo>' + table + (fence[1] ? '<mo fence="true" stretchy="true">' + mmlEsc(fence[1]) + '</mo>' : '') + '</mrow>';
  return table;
}
function texToMathML(tex, display) {
  var tags = [];
  var src = String(tex == null ? '' : tex);
  src = src.replace(/\\tag\*?\s*\{([^{}]*)\}/g, function (_, t) { tags.push(t); return ' '; });
  src = src.replace(/\\(?:label|nonumber|notag)\s*\{[^{}]*\}/g, ' ');
  try {
    var p = new TexParser(src);
    var row = p.parseAll();
    var inner = mmlNode(row);
    if (!inner || inner === '<mrow></mrow>') throw new Error('空公式');
    var body = '<math xmlns="http://www.w3.org/1998/Math/MathML"' + (display ? ' display="block"' : '') + '>' + inner + '</math>';
    return { ok: true, html: body, tag: tags.length ? tags[tags.length - 1] : '', tex: String(tex || '') };
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e), tex: String(tex || ''), tag: '' };
  }
}
