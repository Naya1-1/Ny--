// Ny.UI module scaffold: pending migration of inline UI logic. Maintains no-op behavior until bindings are migrated.
(function (global) {
  "use strict";
  var Ny = global.Ny = global.Ny || {};
  Ny.UI = Ny.UI || (function () {
    var initialized = false;
    function init() {
      if (initialized) return;
      // Ensure dependencies exist (soft-check):
      // 在独立 HTML 预览场景中可能未加载 Ny.State/Ny.Render，此处不再提前 return，
      // 以便仍然绑定“设备切换”按钮的最小功能。其它外置绑定将按存在性自适应。
      initialized = true;
      // 外置事件幂等接管：仅当 Ny.Export 已实现所需接口时才禁用内联并接管
      try {
        var canExternalize =
          (global.Ny && Ny.Export &&
           typeof Ny.Export.attachGenerateButton === "function" &&
           typeof Ny.Export.attachCopyHandlers === "function");
        if (canExternalize) {
          // 通知内联脚本跳过绑定，避免双重绑定
          Ny.Export.skipInline = true;
          // 生成按钮
          var genBtn = document.getElementById("generate-btn");
          if (genBtn) Ny.Export.attachGenerateButton(genBtn);
          // 复制按钮（委托整棵文档）
          Ny.Export.attachCopyHandlers(document);
          // 弹窗关闭与遮罩（委托到 Ny.Export.closeCodeModal；如不存在则保留现状）
          var modalClose = document.getElementById("code-modal-close");
          var backdrop = document.querySelector("#code-modal .modal-backdrop");
          if (modalClose && typeof Ny.Export.closeCodeModal === "function") {
            modalClose.addEventListener("click", Ny.Export.closeCodeModal);
          }
          if (backdrop && typeof Ny.Export.closeCodeModal === "function") {
            backdrop.addEventListener("click", Ny.Export.closeCodeModal);
          }
          // 下载 JSON（若提供专用绑定函数则委托；否则保留内联）
          var dlBtn = document.getElementById("btn-download-json");
          if (dlBtn && typeof Ny.Export.attachDownloadHandlers === "function") {
            try {
              Ny.Export.attachDownloadHandlers(dlBtn, document);
            } catch (_e) {}
          }
        }
      } catch (_e) {}
      // 绑定字体选择器事件，将用户选择写入状态并刷新预览/输出
      try { bindFontSelectors(); } catch (_bf) {}
      // 标题启用开关
      try { bindTitleToggle(); } catch(_bt){}

      // 设备预览切换按钮绑定（仅影响右侧预览容器宽度与内部包装器，不改状态/导出）
      try {
        var genContainer = document.querySelector('.generate-btn-container');
        var toggleBtn = document.getElementById('device-toggle-btn');
        // 若按钮不存在（旧版本），在容器中自动创建并插入到“生成代码”按钮之前
        if (!toggleBtn && genContainer) {
          toggleBtn = document.createElement('button');
          toggleBtn.id = 'device-toggle-btn';
          toggleBtn.title = '仅影响右侧预览，不改变导出代码';
          toggleBtn.textContent = '📱 手机端';
          toggleBtn.setAttribute('data-mode', 'desktop'); // desktop|mobile
          var gb = genContainer.querySelector('#generate-btn');
          if (gb && gb.parentNode) { genContainer.insertBefore(toggleBtn, gb); } else { genContainer.appendChild(toggleBtn); }
          try {
            var st = genContainer.getAttribute('style') || '';
            if (!/display\s*:\s*flex/i.test(st)) {
              genContainer.setAttribute('style', (st ? st + '; ' : '') + 'display:flex; justify-content:flex-end; align-items:center; gap:10px;');
            }
          } catch(_e2){}
        }

        function applyDeviceMode(mode){
          var cont = document.getElementById('live-preview-container');
          if (!cont) return;
          var wrapper = cont.querySelector('.status-preview-wrapper');
          if (mode === 'mobile') {
            cont.style.width = '375px';
            cont.style.maxWidth = '375px';
            cont.style.margin = '0 auto';
            if (wrapper) {
              wrapper.style.maxWidth = '375px';
              // 注入一次性“强制移动端”CSS，并在手机模式加类触发堆叠/换行（不依赖媒体查询）
              try {
                var cssEl = document.getElementById('ny-force-mobile-css');
                if (!cssEl) {
                  cssEl = document.createElement('style');
                  cssEl.id = 'ny-force-mobile-css';
                  cssEl.textContent = '.ny-force-mobile .st-item{flex-direction:column!important;align-items:flex-start!important;gap:6px;} .ny-force-mobile .st-label,.ny-force-mobile .st-value{white-space:normal;word-break:break-word;overflow-wrap:anywhere;} .ny-force-mobile .st-value{width:100%!important;max-width:100%!important;transform:none!important;} .ny-force-mobile.layout-two-column .st-item{display:block!important;}';
                  (document.head || document.documentElement).appendChild(cssEl);
                }
                wrapper.classList.add('ny-force-mobile');
              } catch(_e4){}
            }
            if (toggleBtn) { toggleBtn.textContent = '💻 电脑端'; toggleBtn.setAttribute('data-mode', 'mobile'); }
          } else {
            // 桌面模式：默认 600px 居中显示（仅影响预览容器）
            cont.style.width = '600px';
            cont.style.maxWidth = '600px';
            cont.style.margin = '0 auto';
            if (wrapper) {
              wrapper.style.maxWidth = '600px';
              try { wrapper.classList.remove('ny-force-mobile'); } catch(_e5){}
            }
            // 移除一次性“强制移动端”样式块，彻底还原桌面环境
            try {
              var cssEl2 = document.getElementById('ny-force-mobile-css');
              if (cssEl2 && cssEl2.parentNode) cssEl2.parentNode.removeChild(cssEl2);
            } catch(_e6){}
            if (toggleBtn) { toggleBtn.textContent = '📱 手机端'; toggleBtn.setAttribute('data-mode', 'desktop'); }
          }
          try { console.log('[ui] device-toggle', { mode: mode }); } catch(_e3){}
        }

        // 初始文案
        if (toggleBtn && !toggleBtn.getAttribute('data-mode')) {
          toggleBtn.setAttribute('data-mode', 'desktop');
          toggleBtn.textContent = '📱 手机端';
        }

        // 强韧绑定：使用事件委托，避免按钮在后续重渲染时丢失绑定
        document.addEventListener('click', function(e){
          var btn = e.target.closest('#device-toggle-btn');
          if (!btn) return;
          var mode = btn.getAttribute('data-mode') || 'desktop';
          var next = (mode === 'desktop') ? 'mobile' : 'desktop';
          applyDeviceMode(next);
        });

        // 首次对齐（保持桌面模式）
        applyDeviceMode('desktop');
      } catch(_eDev) {}
    }
    function bindEvents() {
      // Placeholder: migrate UI event bindings here
    }
        // 字体选择器绑定：更新 Ny.State.customization 并刷新预览/输出
        function bindFontSelectors() {
          try {
            if (!Ny || !Ny.State) return;
            var c = Ny.State.customization || {};
    
            // 当选择像素体“精品点阵体9×9”（BoutiqueBitmap9x9）时，确保插入可被导出流程识别的外链字体<link>
            // Ny.Export 会在导出阶段自动把 data-ny-custom-font="true" 的 link 重新插回导出 HTML，避免字体丢失
            function ensurePixelFontLinkIfNeeded(v) {
              try {
                var need = /BoutiqueBitmap9x9/i.test(String(v || ''));
                if (!need) return;
                var href = 'https://fontsapi.zeoseven.com/65/main/result.css';
                var exists = document.querySelector('link[rel="stylesheet"][data-ny-custom-font="true"][href="' + href + '"]');
                if (!exists) {
                  var link = document.createElement('link');
                  link.rel = 'stylesheet';
                  link.href = href;
                  link.setAttribute('data-ny-custom-font', 'true');
                  (document.head || document.documentElement).appendChild(link);
                }
              } catch (_e) {}
            }
    
            // 初始化时，若当前配置已包含 BoutiqueBitmap9x9，则先行插入<link>
            ensurePixelFontLinkIfNeeded(c.fontFamily);
            ensurePixelFontLinkIfNeeded(c.globalLabelFontFamily);
            ensurePixelFontLinkIfNeeded(c.globalValueFontFamily);
    
            // 全局字体（包装器）
            var fontSel = document.getElementById('font-family-select');
            if (fontSel) {
              try { if (c.fontFamily) fontSel.value = c.fontFamily; } catch(_e0){}
              fontSel.addEventListener('change', function() {
                try {
                  var val = String(fontSel.value || '').trim();
                  ensurePixelFontLinkIfNeeded(val);
                  Ny.State.patchCustomization({ fontFamily: val });
                  if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
                  if (Ny.Export && Ny.Export.refreshOutputs) Ny.Export.refreshOutputs(false, { inlineGroup: true });
                } catch(_e1){}
              });
            }
    
            // 标签字体
            var lblSel = document.getElementById('global-label-font-select');
            if (lblSel) {
              try { if (c.globalLabelFontFamily) lblSel.value = c.globalLabelFontFamily; } catch(_e2){}
              lblSel.addEventListener('change', function() {
                try {
                  var val = String(lblSel.value || '').trim();
                  ensurePixelFontLinkIfNeeded(val);
                  Ny.State.patchCustomization({ globalLabelFontFamily: val });
                  if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
                  if (Ny.Export && Ny.Export.refreshOutputs) Ny.Export.refreshOutputs(false, { inlineGroup: true });
                } catch(_e3){}
              });
            }
    
            // 值字体
            var valSel = document.getElementById('global-value-font-select');
            if (valSel) {
              try { if (c.globalValueFontFamily) valSel.value = c.globalValueFontFamily; } catch(_e4){}
              valSel.addEventListener('change', function() {
                try {
                  var val = String(valSel.value || '').trim();
                  ensurePixelFontLinkIfNeeded(val);
                  Ny.State.patchCustomization({ globalValueFontFamily: val });
                  if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
                  if (Ny.Export && Ny.Export.refreshOutputs) Ny.Export.refreshOutputs(false, { inlineGroup: true });
                } catch(_e5){}
              });
            }
    
            // 自定义字体导入（Google Fonts / result.css 等 CSS 链接）
            var btnImport = document.getElementById('btn-import-custom-font');
            var urlInput = document.getElementById('custom-font-url');
            if (btnImport && urlInput) {
              btnImport.addEventListener('click', function() {
                try {
                  var href = String(urlInput.value || '').trim();
                  if (!href) return;
                  var link = document.createElement('link');
                  link.rel = 'stylesheet';
                  link.href = href;
                  link.setAttribute('data-ny-custom-font', 'true');
                  (document.head || document.documentElement).appendChild(link);
                  var cf = Array.isArray(Ny.State.customization && Ny.State.customization.customFonts)
                    ? Ny.State.customization.customFonts.slice()
                    : [];
                  cf.push({ url: href });
                  Ny.State.patchCustomization({ customFonts: cf });
                  // 轻量刷新，确保导出模块可以捕捉到新字体
                  if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
                  if (Ny.Export && Ny.Export.refreshOutputs) Ny.Export.refreshOutputs(false, { inlineGroup: true });
                } catch(_e6){}
              });
            }
          } catch(_outer){}
        }
        // 标题启用开关绑定：同步到 Ny.State.customization.titleEnabled
        function bindTitleToggle() {
          try {
            if (!Ny || !Ny.State) return;
            var c = Ny.State.customization || {};
            // 初次同步 UI
            var cb = document.getElementById('title-enabled-checkbox');
            if (cb) {
              var initChecked = (c.titleEnabled !== false);
              try { cb.checked = initChecked; } catch(_e0){}
              // 诊断日志：初始化时的状态与复选框选中态
              try { console.log('[dbg] bindTitleToggle init', { initChecked: initChecked, stateTitleEnabled: c.titleEnabled }); } catch(_eLog){}
            }
            // 事件委托：应对后续重新渲染插入的控件
            document.addEventListener('change', function(e){
              var t = e.target;
              if (!t) return;
              if (t.id === 'title-enabled-checkbox') {
                try {
                  var on = !!t.checked;
                  // 诊断日志：变更前后的状态
                  try { console.log('[dbg] title-enabled-checkbox change', { checked: on, prev: Ny.State.customization ? Ny.State.customization.titleEnabled : undefined }); } catch(_elog){}
                  Ny.State.patchCustomization({ titleEnabled: on });
                  try { console.log('[dbg] patched titleEnabled', { curr: Ny.State.customization ? Ny.State.customization.titleEnabled : undefined }); } catch(_elog2){}
                  if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
                  if (Ny.Export && Ny.Export.refreshOutputs) Ny.Export.refreshOutputs(false, { inlineGroup: true });
                  // 额外保障：立即移除已渲染的标题容器，避免异步竞态导致残留
                  try {
                    var cont = document.getElementById('live-preview-container');
                    if (cont) {
                      cont.querySelectorAll('.st-header').forEach(function(n){
                        if (n && n.parentNode) n.parentNode.removeChild(n);
                      });
                      // 保守清理：不强制设置 st-body 的外边距；如有自定义样式，可在此同步复位
                      var wrap = cont.querySelector('.status-preview-wrapper');
                      if (wrap) {
                        // 若外部样式曾注入固定顶边距，可在此统一复位
                        // wrap.style.marginTop = '';
                      }
                    }
                  } catch(_e2){}
                } catch(_e1){}
              }
            }, true);
          } catch(_outer){}
        }
    function refresh() {
      try {
        if (Ny.Render && typeof Ny.Render.renderPreview === "function") {
          Ny.Render.renderPreview();
        }
      } catch (_e) {}
    }
    return {
      init: init,
      bindEvents: bindEvents,
      refresh: refresh
    };
  })();
  // Bootstrap after DOM ready (idempotent)
  function _bootstrapUI() {
    try {
      if (Ny.UI && typeof Ny.UI.init === "function") {
        Ny.UI.init();
      }
    } catch (_e) {}
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _bootstrapUI, { once: true });
  } else {
    _bootstrapUI();
  }
})(window);