const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC = __dirname;
const APP_NAMES = [
  'app.core.js',
  'app.settings.js',
  'app.math.js',
  'app.zip.js',
  'app.highlight.js',
  'app.db.js',
  'app.render.js',
  'app.tabs.js',
  'app.edit.js',
  'app.bind.js',
];

function loadTerser() {
  const candidates = [];
  if (process.env.TERSER_PATH) candidates.push(process.env.TERSER_PATH);
  candidates.push('terser');
  let lastError;
  for (const candidate of candidates) {
    try {
      const mod = require(candidate);
      let version = 'unknown';
      try { version = require(candidate + '/package.json').version; } catch (e) {}
      return { mod: mod, version: version };
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error('无法加载 Terser；请在 src 中运行 npm install，或设置 TERSER_PATH。' + (lastError ? ' ' + lastError.message : ''));
}

async function main() {
  const source = APP_NAMES.map(function (name) {
    return fs.readFileSync(path.join(SRC, 'app', name), 'utf8').replace(/\r\n?/g, '\n');
  }).join('\n');
  const hash = crypto.createHash('sha256').update(source, 'utf8').digest('hex');
  const terser = loadTerser();
  const result = await terser.mod.minify(source, {
    compress: true,
    mangle: true,
    format: { comments: false },
  });
  if (!result || result.error) throw result && result.error ? result.error : new Error('Terser 未返回结果');
  const header = '/*! SingleHtmlEditor app | Terser ' + terser.version + ' | source SHA-256: ' + hash + ' */\n';
  const out = path.join(SRC, 'app', 'app.min.js');
  fs.writeFileSync(out, header + result.code + '\n', 'utf8');
  console.log(out);
  console.log('source', source.length, 'bytes');
  console.log('minified', header.length + result.code.length + 1, 'bytes');
  console.log('sha256', hash);
}

main().catch(function (err) {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
