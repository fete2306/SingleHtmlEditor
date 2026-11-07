# SingleHtmlEditor

SingleHtmlEditor 是一个可直接双击打开、完全离线运行的单文件文档阅读器与轻量文本编辑器。整个应用被打包进一个 HTML 文件，不需要安装、不需要后端，也不会上传本地文件。

打开本地文件夹或选择文件后，可以用目录树浏览内容，阅读 Markdown、代码、JSON、CSV、HTML、Jupyter Notebook、图片、音视频、PDF、Office、EPUB、SQLite 等文件，并对文本类文件进行编辑和保存。

## 主要特点

- 单文件交付：正式版只有 `SingleHtmlEditor.html` 一个运行文件，方便复制、归档和离线分发。
- 本地优先：文件读取、预览、编辑和保存都在浏览器内完成，不上传服务器。
- 完全离线：CSS、JavaScript、Markdown 渲染、安全净化等资源全部内置，无外部 CDN 依赖。
- 目录浏览：支持打开文件夹、选择多个文件、拖入文件或文件夹、目录树过滤、面包屑和上一文件/下一文件；打开文件夹或文件后先载入目录树，不会自动打开第一个文件。
- 欢迎页：启动和无标签时展示开始操作、内置示例、最近 5 个文件夹和离线说明；最近目录权限仍有效时自动恢复目录树并停留在欢迎页，否则留在欢迎页。
- 内置示例：欢迎页可打开随正式版嵌入的 Markdown 示例，检查图片、排版、代码高亮和公式渲染，不需要另外准备文件。
- 多文件标签：单击文件用斜体预览标签打开，双击固定；支持切换、关闭，关闭最后一个文件后回到欢迎页并保留目录树。
- 活动栏：左侧固定资源管理器、快速打开、使用说明、主题切换和设置入口，侧栏折叠后仍可操作。
- 设置面板：支持系统/深色/浅色主题、正文字号、行高、阅读宽度、默认换行、启动自动恢复、关闭确认和目录扫描上限，也可清除最近记录或恢复默认设置。
- 独立说明标签：使用说明以可关闭的固定标签打开，不计入文件树和文件数，关闭后回到之前内容或欢迎页。
- 多格式预览：覆盖常见文档、代码、表格、图片、媒体、压缩包和数据库文件。
- 轻量编辑：文本类文件可进入编辑模式，支持语法高亮、`Ctrl+S` 保存和未保存提示；切换标签会保留每标签草稿。
- 大文件优化：编辑高亮和字数统计按空闲合并，目录过滤与快速打开防抖并缓存路径，减少连续输入时的卡顿。
- 快速导航：`Ctrl+P` 模糊快速打开，Markdown/Notebook 支持大纲，图片支持灯箱查看。
- 状态记忆：保存主题模式、阅读外观、目录扫描设置、侧栏宽度、上次文件和最近 5 个文件夹；最近记录只保存目录句柄、名称和时间，不保存绝对路径。
- 响应式界面：桌面活动栏 + 双栏布局，窄屏保留活动栏并切换为抽屉式侧栏。

## 快速开始

1. 用 Chrome 或 Edge 直接打开 `SingleHtmlEditor.html`，无需启动 Web 服务器；首次启动显示欢迎页。
2. 在欢迎页或侧栏点击“打开文件夹”选择目录，或点击“选择文件”选择单个/多个文件；载入后停留在欢迎页，不会自动打开第一个文件。
3. 从左侧目录树或 `Ctrl+P` 快速打开列表中选择要阅读的文件；单击预览，双击固定。
4. 没有本地文件时，可点击欢迎页的“打开示例文档”查看内置 Markdown 示例。
5. 需要编辑时点击右上角编辑按钮，修改后按 `Ctrl+S` 保存，按 `Esc` 取消；切换标签不会丢失未保存草稿。

首次打开文件夹时，浏览器会请求读取权限。需要直接写回原文件的场景还会请求写入权限；这些权限由浏览器管理，不会离开本机。

## 使用方式

### 打开内容

- **打开文件夹**：使用 File System Access API 扫描目录，保留文件句柄，可直接写回修改后的文件。推荐 Chrome / Edge。
- **选择文件 / 选择文件夹**：使用普通文件选择框，适合 Firefox / Safari 或只需要阅读的场景；保存编辑时通常下载副本。
- **拖放**：可把文件或文件夹拖入窗口。浏览器能提供的目录信息取决于当前浏览器能力。

### 阅读与导航

- 左侧活动栏提供资源管理器、快速打开、使用说明、主题切换和设置；资源管理器图标会随侧栏展开状态高亮。
- 欢迎页提供打开文件夹、打开文件、内置示例、使用说明、快速打开和最近文件夹；目录权限失效时可重新打开或选择其他目录。
- 使用说明和内置示例在独立固定标签中打开，可关闭，不计入文件树、文件数和快速打开列表；关闭后回到之前标签或欢迎页。
- 内置示例与使用说明为只读内容，不能编辑、下载或复制路径；仍可切换源码、查看目录大纲和调整换行。
- 目录树支持递归展开、折叠全部、文件名过滤和刷新重扫。
- 单击文件在预览标签中打开，双击固定；进入编辑模式会自动固定当前标签。
- 切换标签会保留未保存草稿、编辑模式、源码/换行设置、滚动位置和光标；有草稿的标签显示圆点。
- 关闭含未保存修改的标签、切换文件夹或重新选择文件前会先确认；关闭页面时浏览器也会提示仍有草稿。关闭确认可在设置中禁用。
- 顶部工具栏提供面包屑、上一文件、下一文件、源码切换、大纲、下载、复制路径和快速打开。
- Markdown 支持 GFM 表格、任务列表、代码高亮、相对图片/链接和 TeX 数学公式。
- HTML 文件经过净化后在禁用脚本的沙箱 iframe 中预览，也可切换查看源码。
- 图片支持灯箱查看，音频/视频/PDF 使用浏览器原生能力播放或预览。

### 设置与外观

- 点击左侧活动栏底部的齿轮打开设置；设置保存在当前浏览器，不上传，也不需要联网。
- 主题可跟随系统，也可固定深色或浅色；正文字号、行高和阅读宽度会立即应用到 Markdown 等正文内容。
- 可设置新打开的文本、JSON 和 CSV 默认自动换行。
- 可控制启动时是否恢复最近文件夹，以及关闭未保存标签、切换文件夹或离开页面时是否确认。
- 目录扫描默认最多 10000 个文件、24 层深度；可分别设置 100–100000 个文件、1–64 层。修改只影响下一次刷新或重新打开文件夹。
- 设置面板还提供清除最近文件夹记录、恢复默认设置和打开使用说明的入口。

### 编辑与保存

- 可编辑类型：Markdown、纯文本/代码、JSON、CSV/TSV、HTML、Notebook 等文本类文件。
- 文件夹实时模式下，保存会写入原文件；文件选择模式下，保存会下载修改后的副本。
- 每个标签独立保存未保存草稿；草稿只保存在当前页面内存中，刷新或关闭页面后不会恢复。
- 未保存草稿总文本上限为 20M 字符；接近上限时会阻止继续切换，需先保存或取消部分标签的修改。
- 超过预览阈值的文件默认截断显示，可点击“加载全文”后继续阅读或编辑。
- 内置说明标签不可编辑、不可下载；二进制文件、压缩包和数据库只读。

### 快捷键

| 快捷键 | 功能 |
| --- | --- |
| `Ctrl+P` / `Cmd+P` | 快速打开文件（`Enter` 预览，`Ctrl+Enter` 固定） |
| `Ctrl+B` / `Cmd+B` | 切换侧栏 |
| `Ctrl+E` / `Cmd+E` | 切换 Markdown/JSON/CSV/HTML/Notebook 源码 |
| `Ctrl+S` / `Cmd+S` | 保存当前编辑 |
| `Alt+←` / `Alt+→` | 上一个 / 下一个文件 |
| `Esc` | 关闭灯箱、快速打开或侧栏；编辑时取消编辑 |

## 支持格式

| 类别 | 常见扩展名 | 预览能力 |
| --- | --- | --- |
| Markdown | `.md` `.markdown` `.mdx` `.mkd` `.mkdn` 等 | GFM 渲染、代码高亮、数学公式、目录大纲、相对图片/链接 |
| 文本与代码 | `.txt` `.log` `.js` `.ts` `.py` `.java` `.go` `.rs` `.css` `.xml` `.yaml` 等 | 等宽文本、语法高亮、源码查看、编辑 |
| JSON | `.json` `.jsonc` `.json5` `.jsonl` `.ndjson` | 格式化、高亮、解析失败时回退原文 |
| 表格 | `.csv` `.tsv` | 表格预览，默认最多 1000 行、80 列 |
| 网页 | `.html` `.htm` `.xhtml` | DOMPurify 净化、沙箱 iframe 预览、源码切换 |
| Notebook | `.ipynb` | 代码单元、Markdown 单元和常见输出预览 |
| SQLite | `.db` `.sqlite` `.sqlite3` `.db3` 等 | 表/视图结构、前 1000 行数据，只读 |
| 图片 | `.png` `.jpg` `.gif` `.webp` `.svg` `.bmp` `.avif` `.tiff` 等 | 浏览器支持的原生解码与灯箱 |
| 音频 | `.mp3` `.wav` `.ogg` `.flac` `.m4a` `.aac` `.opus` 等 | 浏览器原生播放器 |
| 视频 | `.mp4` `.webm` `.ogv` `.mov` 等 | 浏览器原生播放器 |
| 字体 | `.ttf` `.otf` `.woff` `.woff2` | 字体样例预览 |
| PDF | `.pdf` | 浏览器内置 PDF 阅读器 |
| 压缩包 | `.zip` `.jar` `.apk` | 条目列表、内部文件虚拟浏览和下载 |
| Office / 电子书 | `.docx` `.xlsx` `.pptx` `.odt` `.epub` | 基础内容解析和预览，不保证复杂排版完全一致 |
| 其他二进制 | 任意未知扩展名 | 前 8 KB 十六进制预览和下载 |

媒体格式能否播放取决于浏览器和操作系统的解码支持；Office、EPUB 和 PDF 的复杂排版由浏览器能力决定。

## HTML 结构分析

正式版 `SingleHtmlEditor.html` 是压缩后的单文件版本，结构分为外壳、payload 和启动器三层。

### 总体骨架

```text
SingleHtmlEditor.html
├─ <head>
│  ├─ meta charset / viewport
│  ├─ <title>SingleHtmlEditor</title>
│  ├─ 内联主题引导脚本（读取 she.theme 或系统主题）
│  ├─ <style id="she-style"></style>（运行时填入解压后的 CSS）
│  └─ 关键内联样式（背景色、加载前隐藏 body）
├─ <body>
│  ├─ 内联 SVG symbol 图标集
│  ├─ .app
│  │  ├─ .sidebar：目录树、过滤框、扫描限制提示、打开按钮、最近状态
│  │  ├─ .resizer：侧栏宽度拖拽条
│  │  ├─ .main
│  │  │  ├─ .topbar：面包屑与工具栏
│  │  │  ├─ .tabbar：打开文件后显示的标签栏（预览标签为斜体）
│  │  │  └─ .workspace
│  │  │     ├─ .content-scroll
│  │  │     │  ├─ #content：文档/媒体渲染区
│  │  │     │  └─ #welcome：首屏欢迎页
│  │  │     └─ #outline：文档大纲侧栏
│  │  └─ .statusbar：模式、路径和统计信息
│  ├─ #settings / #palette / #lightbox / #dropOverlay / #toast：交互浮层
│  ├─ #fileInput / #folderInput：隐藏的文件选择框
│  ├─ <script id="she-css">：gzip + Base64 的 CSS
│  ├─ <script id="she-js">：gzip + Base64 的 marked + DOMPurify + 应用代码
│  ├─ <script id="readme-data">：内置说明页 Markdown
│  └─ 启动脚本：解压 payload、注入样式和脚本
└─ 无外部资源引用
```

### 启动流程

1. 主题引导脚本在样式加载前读取 `localStorage` 中的 `she.theme`（解析后的深/浅色），没有记录时跟随 `prefers-color-scheme`。
2. 页面底部启动器把 `she-css` 和 `she-js` 中的 Base64 文本转成字节流，再用 `DecompressionStream('gzip')` 解压。
3. 解压后的 CSS 写入 `#she-style`；解压后的 JavaScript 动态创建 `<script>` 并插入 `body`。
4. 应用初始化后加载 `she.settings` 与 `she.themeMode`，绑定事件并恢复阅读外观、主题/侧栏宽度和最近目录；最近目录权限仍有效且未禁用自动恢复时进入实时模式，否则显示欢迎页。
5. 启动完成前 `body` 保持隐藏，避免未样式化内容闪烁；解压失败时显示兼容性错误提示。

### 运行时结构

- `S`：集中保存当前模式、目录树、文件索引、当前文件、标签页、设置、扫描限制快照、渲染状态、编辑状态、最近目录和缓存。
- `els`：启动时缓存主要 DOM 节点，避免重复查询。
- 活动栏：`syncActivityState()` 同步资源管理器按钮与侧栏展开状态；活动栏按钮复用现有文件夹、快速打开、说明、主题和设置逻辑。
- 设置管线：`loadSettings()` 读取并校正 `she.settings`，`applyAppearanceSettings()` 写入 CSS 变量，`applyTheme()` 支持系统/深色/浅色；设置弹窗由 `app.settings.js` 绑定。
- 目录扫描：`newScanLimits()` 从设置生成运行时上限，`scanDir()` 和 `useFileItems()` 共用文件数与深度限制，`S.scanApplied` 保存当前目录实际使用的限制快照。
- 文件抽象：统一处理目录句柄、`File`、`Blob`、压缩包虚拟条目和内置说明节点。
- 标签管线：`openFile()` 维护标签列表，`activateTab()` 切换活动文件，`loadFileIntoView()` 读取内容后按扩展名分发到 `renderMarkdown`、`renderJson`、`renderCsv`、`renderHtml`、`renderSqlite`、`renderPdf` 等渲染器。
- 编辑管线：`enterEdit()` 进入编辑器，`saveEdit()` 在文件夹实时模式下写入句柄，否则下载副本，`cancelEdit()` 恢复原文；切换标签时 `saveActiveTabState()` 保存草稿，`restoreEditTab()` 恢复编辑状态。
- 安全边界：HTML 和 EPUB 内容先经 DOMPurify 净化；HTML 预览运行在禁用脚本的 sandbox iframe 中。

### 源码与构建

`src/` 只保留构建正式版所需的最小源码集合：

```text
src/
├─ build.py
├─ minify.js
├─ package.json
├─ shell.html
├─ readme.md
├─ css/
│  ├─ base.css
│  ├─ add.css
│  └─ extra.css
├─ app/
│  ├─ app.core.js
│  ├─ app.settings.js
│  ├─ app.math.js
│  ├─ app.zip.js
│  ├─ app.highlight.js
│  ├─ app.db.js
│  ├─ app.render.js
│  ├─ app.tabs.js
│  ├─ app.edit.js
│  ├─ app.bind.js
│  └─ app.min.js
└─ vendor/
   ├─ marked.js
   └─ purify.js
```

`src/app/app.min.js` 是由上述应用源码经 Terser 压缩后的提交产物，首行记录源码 SHA-256。`src/build.py` 按固定顺序拼接 CSS，读取并校验 `app.min.js`，再把 `marked`、`DOMPurify` 和压缩后的应用代码一起 gzip 压缩并 Base64 编码，最后替换 `shell.html` 中的占位符，直接生成根目录的 `SingleHtmlEditor.html`。构建过程不会生成 `app.js`、`app.css`、测试页或其他中间文件。

修改 `src/app/*.js` 后，需要在 `src/` 中安装依赖并重新生成压缩产物：

```powershell
cd src
npm install
npm run minify
```

`src/package.json` 将 Terser 固定为 5.51.2。`build.py` 会检测 `app.min.js` 的源码哈希，源码与压缩产物不一致时停止构建并提示重新运行 `npm run minify`。

## 构建

正式构建只需要 Python 3.8+ 和标准库，不需要 Node.js、npm 或网络；应用压缩产物已提交在 `src/app/app.min.js`：

```powershell
python src\build.py
```

也可以指定输出文件：

```powershell
python src\build.py path\to\SingleHtmlEditor.html
```

脚本会输出文件路径、字节数和 SHA-256。构建使用固定顺序、固定 gzip 参数和 LF 换行，同一份源码应生成相同文件。只有修改 `src/app/*.js` 并重新生成 `app.min.js` 时才需要 Node.js、npm 和 Terser，步骤见上一节。

## 配置要求

### 运行环境

| 项目 | 要求 |
| --- | --- |
| 操作系统 | Windows / macOS / Linux |
| 启动方式 | 直接打开 `SingleHtmlEditor.html`，无需服务器 |
| 推荐浏览器 | 最新版 Chrome / Edge（Chromium 内核） |
| 其他浏览器 | Firefox / Safari 可阅读和选择文件，但通常不能直接写回目录 |
| 网络 | 不需要 |
| 安装 | 不需要 |
| 构建环境 | Python 3.8+，仅标准库；重新生成 `app.min.js` 另需 Node.js 与 Terser |

### 浏览器能力

- 压缩单文件依赖 `DecompressionStream('gzip')`。浏览器不支持时会显示兼容性提示。
- 直接打开文件夹、刷新重扫和写回原文件依赖 File System Access API（`showDirectoryPicker`、`createWritable`），目前以 Chromium 桌面浏览器支持最完整。
- Firefox / Safari 可以通过普通文件选择框阅读，但保存编辑通常只能下载副本。
- 移动端可以打开和阅读，但目录权限、文件写回和布局体验不如桌面端。

### 本地状态

应用没有独立配置文件，运行时状态保存在浏览器本地：

| 存储位置 | 键 / 数据库 | 内容 |
| --- | --- | --- |
| `localStorage` | `she.theme` | 当前解析后的主题：`dark` 或 `light` |
| `localStorage` | `she.themeMode` | 主题模式：`system`、`dark` 或 `light` |
| `localStorage` | `she.settings` | 阅读外观、行为开关和目录扫描限制的 JSON |
| `localStorage` | `she.sideWidth` | 侧栏宽度（230–560 px） |
| `localStorage` | `she.last` | 上次打开的相对文件路径 |
| IndexedDB | `she-recent` / `recent-folders` | 最近文件夹的句柄、名称和时间，最多 5 条 |

最近文件夹记录不包含绝对路径。清理浏览器站点数据会同时清除这些记录，下次打开文件夹即可重新建立。

### 容量限制

| 项目 | 默认限制 |
| --- | --- |
| 文本预览 | 5 MB，可手动加载全文 |
| 目录扫描 | 默认 10000 个文件、24 层深度；可设置 100–100000 个文件、1–64 层 |
| ZIP 条目 | 最多 2000 条，解压上限 200 MB |
| SQLite 文件 | 96 MB，表数据最多 1000 行、80 列 |
| CSV/TSV | 最多 1000 行、80 列 |
| XLSX | 每个工作表最多 1000 行、80 列 |
| 二进制预览 | 前 8 KB |
| 最近文件夹 | 5 个 |

## 安全与隐私

- 所有文件处理都在当前浏览器页面内完成，不上传文件，也不依赖远程接口。
- HTML、EPUB 和 Notebook HTML 输出经过安全净化；HTML 预览在禁用脚本的 sandbox iframe 中运行。
- 不执行被打开文件中的脚本；压缩包、Office 和电子书只做内容解析。
- 最近目录句柄和界面状态保存在浏览器本地；清除站点数据会删除这些记录。
- 浏览器权限、下载目录和本地文件安全策略由浏览器与操作系统决定。

## 已知限制

- 标签页支持预览/固定、切换、关闭和会话内草稿；跨刷新恢复标签/草稿、拖拽排序尚未实现。
- Office、EPUB 和 PDF 只提供基础预览，复杂版式、字体、宏、加密或 DRM 内容可能无法正确显示。
- SQLite 为只读浏览，不提供 SQL 查询编辑器。
- 超大文本默认截断；目录扫描上限可在设置中调整，但超大目录、压缩包和数据库仍受浏览器内存与上表限制。
- 图片、音频、视频和字体的实际可用性取决于浏览器解码能力。
- 直接写回原文件需要浏览器支持 File System Access API，并需要用户授予写入权限。

## 第三方组件

| 组件 | 版本 | 许可证 |
| --- | --- | --- |
| marked | 12.0.2 | MIT |
| DOMPurify | 3.1.6 | Apache-2.0 / MPL-2.0 |

第三方组件保留其原始版权与许可证声明。

## 正式版校验

```text
文件：SingleHtmlEditor.html
大小：144,600 字节
SHA-256：549f7673dfe66da7557e14fa574794e25ae59cd18367eb9b75e3031c90f5e82d
```

重新构建后可用上面的 SHA-256 校验生成结果是否一致。

## 验证状态

- 2026-11-07：Chrome 156.0.8078.81 未压缩测试页回归 54/54 通过，console 与 exception 均为空。
- 2026-11-07：Chrome 156.0.8078.81 与 Edge 156.0.4314.58 正式版（应用代码经 Terser 压缩）冒烟通过，欢迎页、内置示例、说明页、主题切换和最近目录恢复均正常；恢复目录树后停留在欢迎页，点击文件才打开内容。
- 正式版由 `python src\build.py` 从当前源码确定性构建，构建时校验 `app.min.js` 的源码哈希，输出大小和 SHA-256 如上。

## 许可证

本项目采用 MIT License，详见 [LICENSE](LICENSE)。

第三方组件仍适用各自许可证，见“第三方组件”。

