from pathlib import Path
import base64
import gzip
import hashlib
import sys

SRC = Path(__file__).resolve().parent
ROOT = SRC.parent
OUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "SingleHtmlEditor.html"


def read(rel):
    return (SRC / rel).read_text(encoding="utf-8")


def pack(text):
    return base64.b64encode(gzip.compress(text.encode("utf-8"), 9, mtime=0)).decode("ascii")


css = "\n".join(
    read("css/" + name)
    for name in ("base.css", "add.css", "extra.css")
)
script = "\n".join(
    read("app/" + name)
    for name in (
        "app.core.js",
        "app.math.js",
        "app.zip.js",
        "app.highlight.js",
        "app.db.js",
        "app.render.js",
        "app.tabs.js",
        "app.edit.js",
        "app.bind.js",
    )
)

shell = read("shell.html")
readme = read("readme.md").replace("</script", "<\\/script")

boot = r'''<script>
(function () {
  function bytes(s) {
    var b = atob(String(s || '').replace(/\s+/g, ''));
    var u = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u;
  }
  function inflate(s) {
    var stream = new Blob([bytes(s)]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  }
  (async function () {
    try {
      document.getElementById('she-style').textContent = await inflate(document.getElementById('she-css').textContent);
      var code = await inflate(document.getElementById('she-js').textContent);
      var tag = document.createElement('script');
      tag.textContent = code;
      document.body.appendChild(tag);
      document.body.style.visibility = 'visible';
    } catch (err) {
      document.body.style.visibility = 'visible';
      var box = document.createElement('pre');
      box.style.cssText = 'max-width:720px;margin:12vh auto;padding:20px;border:1px solid #c33;border-radius:8px;color:#f48771;background:#2b1d1d;white-space:pre-wrap;font:13px/1.6 monospace';
      box.textContent = '启动失败：' + (err && err.message ? err.message : err) + '\n请使用最新版 Chrome / Edge / Firefox / Safari 打开。';
      document.body.appendChild(box);
    }
  })();
})();
</script>'''

js_pack = pack(read("vendor/marked.js") + "\n" + read("vendor/purify.js") + "\n" + script)
html = shell.replace(
    "<style>/*CSS*/</style>",
    '<style id="she-style"></style><style>html{background:#1e1e1e}html[data-theme="light"]{background:#fff}body{visibility:hidden}</style>',
    1,
)
libs = "<script>/*MARKED*/</script>\n<script>/*PURIFY*/</script>"
payloads = (
    '<script type="application/octet-stream" id="she-css">' + pack(css) + "</script>\n" +
    '<script type="application/octet-stream" id="she-js">' + js_pack + "</script>"
)

if libs not in html:
    raise SystemExit("missing library markers")
html = html.replace(libs, payloads, 1)
html = html.replace("/*README*/", readme, 1)
html = html.replace("<script>/*APP*/</script>", boot, 1)

for marker in ("/*CSS*/", "/*MARKED*/", "/*PURIFY*/", "/*README*/", "/*APP*/"):
    if marker in html:
        raise SystemExit("unreplaced marker: " + marker)

data = html.encode("utf-8")
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_bytes(data)
print(OUT)
print("bytes", len(data))
print("sha256", hashlib.sha256(data).hexdigest())
