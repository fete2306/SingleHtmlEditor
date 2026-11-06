var SETTINGS_DEFAULTS = {
  fontSize: 16,
  lineHeight: 1.82,
  readWidth: 920,
  wrap: false,
  autoRestore: true,
  confirmClose: true,
  maxFiles: SCAN_DEFAULT.files,
  maxDepth: SCAN_DEFAULT.depth
};

var SETTINGS_LIMITS = {
  fontSize: [12, 24, 0],
  lineHeight: [1.4, 2.4, 2],
  readWidth: [560, 1400, 0],
  maxFiles: [100, 100000, 0],
  maxDepth: [1, 64, 0]
};

var settingsReturnFocus = null;

function settingsNumber(value, key, fallback) {
  var limit = SETTINGS_LIMITS[key] || [0, Number.MAX_SAFE_INTEGER, 0];
  var n = Number(value);
  if (!isFinite(n)) n = fallback;
  n = Math.max(limit[0], Math.min(limit[1], n));
  return limit[2] ? Number(n.toFixed(limit[2])) : Math.round(n);
}

function normalizeSettings(raw) {
  raw = raw && typeof raw === 'object' ? raw : {};
  return {
    fontSize: settingsNumber(raw.fontSize, 'fontSize', SETTINGS_DEFAULTS.fontSize),
    lineHeight: settingsNumber(raw.lineHeight, 'lineHeight', SETTINGS_DEFAULTS.lineHeight),
    readWidth: settingsNumber(raw.readWidth, 'readWidth', SETTINGS_DEFAULTS.readWidth),
    wrap: raw.wrap === true,
    autoRestore: raw.autoRestore !== false,
    confirmClose: raw.confirmClose !== false,
    maxFiles: settingsNumber(raw.maxFiles, 'maxFiles', SETTINGS_DEFAULTS.maxFiles),
    maxDepth: settingsNumber(raw.maxDepth, 'maxDepth', SETTINGS_DEFAULTS.maxDepth)
  };
}

function loadSettings() {
  var raw = null;
  try { raw = JSON.parse(storeGet(LS.settings) || 'null'); } catch (e) { raw = null; }
  S.settings = normalizeSettings(raw);
  return S.settings;
}

function saveSettings() {
  storeSet(LS.settings, JSON.stringify(S.settings));
}

function applyAppearanceSettings() {
  if (!S.settings) return;
  var root = document.documentElement;
  root.style.setProperty('--doc-size', S.settings.fontSize + 'px');
  root.style.setProperty('--doc-line', String(S.settings.lineHeight));
  root.style.setProperty('--doc-width', S.settings.readWidth + 'px');
}

function syncSettingsUI() {
  if (!S.settings || !els.settings) return;
  if (els.settingsTheme) els.settingsTheme.value = S.themeMode || 'system';
  if (els.settingsFontSize) els.settingsFontSize.value = String(S.settings.fontSize);
  if (els.settingsFontSizeValue) els.settingsFontSizeValue.textContent = S.settings.fontSize + ' px';
  if (els.settingsLineHeight) els.settingsLineHeight.value = String(S.settings.lineHeight);
  if (els.settingsLineHeightValue) els.settingsLineHeightValue.textContent = S.settings.lineHeight.toFixed(2);
  if (els.settingsReadWidth) els.settingsReadWidth.value = String(S.settings.readWidth);
  if (els.settingsReadWidthValue) els.settingsReadWidthValue.textContent = S.settings.readWidth + ' px';
  if (els.settingsWrap) els.settingsWrap.checked = !!S.settings.wrap;
  if (els.settingsAutoRestore) els.settingsAutoRestore.checked = S.settings.autoRestore !== false;
  if (els.settingsConfirmClose) els.settingsConfirmClose.checked = S.settings.confirmClose !== false;
  if (els.settingsMaxFiles) els.settingsMaxFiles.value = String(S.settings.maxFiles);
  if (els.settingsMaxDepth) els.settingsMaxDepth.value = String(S.settings.maxDepth);
}

function openSettings() {
  if (!els.settings) return;
  settingsReturnFocus = document.activeElement;
  S.settingsOpen = true;
  syncSettingsUI();
  closeSidebarMobile();
  els.settings.classList.add('show');
  setTimeout(function () {
    if (els.settingsTheme) els.settingsTheme.focus();
  }, 20);
}

function closeSettings() {
  if (!els.settings || !S.settingsOpen) return;
  S.settingsOpen = false;
  els.settings.classList.remove('show');
  if (settingsReturnFocus && settingsReturnFocus.focus) {
    try { settingsReturnFocus.focus(); } catch (e) {}
  }
  settingsReturnFocus = null;
}

function resetSettings() {
  S.settings = normalizeSettings(null);
  saveSettings();
  applyAppearanceSettings();
  applyTheme('system');
  document.documentElement.style.setProperty('--side-w', '310px');
  storeSet(LS.width, '310');
  syncSettingsUI();
  toast('已恢复默认设置', 2400);
}

function clearRecentFolders() {
  return recentDb().then(function (db) {
    return recentWrite(db, []);
  }).then(function () {
    S.recentFolders = [];
    renderRecentPanel();
    toast('最近文件夹记录已清除', 2400);
  }).catch(function (err) {
    toast('无法清除最近记录：' + (err && err.message ? err.message : err), 3200);
  });
}

function bindSettings() {
  if (!els.btnActivitySettings || !els.settings) return;
  els.btnActivitySettings.addEventListener('click', openSettings);
  els.settingsClose.addEventListener('click', closeSettings);
  els.settings.addEventListener('click', function (event) {
    if (event.target === els.settings) closeSettings();
  });

  if (els.settingsTheme) {
    els.settingsTheme.addEventListener('change', function () {
      applyTheme(els.settingsTheme.value);
      syncSettingsUI();
    });
  }

  function bindRange(input, valueEl, key, unit) {
    if (!input) return;
    var update = function () {
      S.settings[key] = settingsNumber(input.value, key, SETTINGS_DEFAULTS[key]);
      applyAppearanceSettings();
      if (valueEl) valueEl.textContent = unit === 'x' ? S.settings[key].toFixed(2) : S.settings[key] + ' ' + unit;
    };
    input.addEventListener('input', update);
    input.addEventListener('change', function () { update(); saveSettings(); });
  }
  bindRange(els.settingsFontSize, els.settingsFontSizeValue, 'fontSize', 'px');
  bindRange(els.settingsLineHeight, els.settingsLineHeightValue, 'lineHeight', 'x');
  bindRange(els.settingsReadWidth, els.settingsReadWidthValue, 'readWidth', 'px');

  function bindToggle(input, key) {
    if (!input) return;
    input.addEventListener('change', function () {
      S.settings[key] = !!input.checked;
      saveSettings();
    });
  }
  bindToggle(els.settingsWrap, 'wrap');
  bindToggle(els.settingsAutoRestore, 'autoRestore');
  bindToggle(els.settingsConfirmClose, 'confirmClose');

  function bindScanLimit(input, key) {
    if (!input) return;
    var apply = function () {
      var value = settingsNumber(input.value, key, SETTINGS_DEFAULTS[key]);
      S.settings[key] = value;
      input.value = String(value);
      saveSettings();
      toast('目录扫描设置已保存，下次刷新或打开文件夹时生效', 2600);
    };
    input.addEventListener('change', apply);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') { event.preventDefault(); input.blur(); }
    });
  }
  bindScanLimit(els.settingsMaxFiles, 'maxFiles');
  bindScanLimit(els.settingsMaxDepth, 'maxDepth');

  if (els.settingsReset) els.settingsReset.addEventListener('click', resetSettings);
  if (els.settingsClearRecent) {
    els.settingsClearRecent.addEventListener('click', function () {
      if (!window.confirm('清除所有最近文件夹记录？已有标签和当前目录不受影响。')) return;
      clearRecentFolders();
    });
  }
  if (els.settingsHelp) {
    els.settingsHelp.addEventListener('click', function () {
      closeSettings();
      showReadme();
    });
  }

  try {
    var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
    if (mq) {
      var onScheme = function () {
        if (S.themeMode !== 'system') return;
        applyTheme('system');
        syncSettingsUI();
      };
      if (mq.addEventListener) mq.addEventListener('change', onScheme);
      else if (mq.addListener) mq.addListener(onScheme);
    }
  } catch (e) {}
}
