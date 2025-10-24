/*!
 * Merged bundle: app.state.js, app.background.js, app.collapse.js, app.adhere.js, app.ui.js
 * This file concatenates modules to reduce requests while preserving behavior.
 * Order: State -> Background -> Collapse -> Adhere -> UI
 */
(function(global){
  'use strict';
  const Ny = global.Ny || (global.Ny = {});
  Ny.State = (function(){
    const Utils = global.Ny && global.Ny.Utils ? global.Ny.Utils : {};

    let currentTheme = 'theme-mystic-noir';
    let currentTitle = '角色状态';
    let currentEnterAnimation = 'none';
    let currentLoopAnimation = 'none';
    let currentAnimation = 'none';
    let animSpeed = 1.0;
    let animIntensity = 0.70;

    function safeGenId(){
      try { if (Utils.genId) return Utils.genId(); } catch(_e){}
      return 'it_' + Math.random().toString(36).slice(2, 9);
    }

    let items = [
      { id: safeGenId(), type: 'text', label: '地点', value: '迷雾森林 · 深处' },
      { id: safeGenId(), type: 'bar',  label: '情绪', percent: 60 },
      { id: safeGenId(), type: 'divider' }
    ];

    const themeDefaults = {
      'theme-mystic-noir':        { fontFamily: 'Georgia, Songti SC, serif',                                       primaryColor: '#c8cbd2', secondaryColor: '#d6d6d6', radius: 12, dividerStyle: 'line',     bgMode: 'theme', titleFontSize: 20 },
      'theme-cyber-grid':         { fontFamily: "'Courier New', Courier, monospace",                                primaryColor: '#FF6A3D', secondaryColor: '#9DAAF2', radius: 4,  dividerStyle: 'gradient', bgMode: 'theme', titleFontSize: 22 },
      'theme-neon-night':         { fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",                  primaryColor: '#00f7ff', secondaryColor: '#ff00a6', radius: 14, dividerStyle: 'gradient', bgMode: 'theme', titleFontSize: 22 },
      'theme-glassmorphism':      { fontFamily: 'Inter, Noto Sans SC, sans-serif',                                  primaryColor: '#6EE7F9', secondaryColor: '#A78BFA', radius: 16, dividerStyle: 'gradient', bgMode: 'theme', titleFontSize: 22 },
      'theme-steampunk':          { fontFamily: "Cinzel, 'Noto Serif SC', 'Times New Roman', Georgia, 'Songti SC', serif", primaryColor: '#B08D57', secondaryColor: '#F1E6D0', radius: 12, dividerStyle: 'dashed',   bgMode: 'theme', titleFontSize: 22 },
      'theme-paper-journal':      { fontFamily: "'Noto Serif SC', 'Songti SC', Georgia, serif",                      primaryColor: '#B48A60', secondaryColor: '#2A2A2A', radius: 12, dividerStyle: 'line',     bgMode: 'theme', titleFontSize: 22 },
      'theme-pixel-retro':        { fontFamily: "'Courier New', Courier, monospace",                                 primaryColor: '#64FF64', secondaryColor: '#C8C8C8', radius: 6,  dividerStyle: 'line',     bgMode: 'theme', titleFontSize: 18 },
      'theme-modern-minimal':     { fontFamily: "Inter, 'Noto Sans SC', sans-serif",                                 primaryColor: '#FFFFFF', secondaryColor: '#9FA6B2', radius: 12, dividerStyle: 'line',     bgMode: 'theme', titleFontSize: 20 },
      'theme-nature-aura':        { fontFamily: "'Noto Serif SC', 'Songti SC', Georgia, serif",                      primaryColor: '#64D58B', secondaryColor: '#A7D7C5', radius: 14, dividerStyle: 'gradient', bgMode: 'theme', titleFontSize: 22 },
      'theme-ink-wash':           { fontFamily: "'Noto Serif SC', 'Songti SC', Georgia, serif",                      primaryColor: '#2A2A2A', secondaryColor: '#7A6248', radius: 14, dividerStyle: 'line',     bgMode: 'theme', titleFontSize: 22 }
    };

    let customization = {
      fontFamily: '',
      primaryColor: '#6a717c',
      secondaryColor: '#97aec8',
      radius: 12,
      bgMode: 'theme',
      bgColor: '#111215',
      bgGradientStart: '#6a717c',
      bgGradientEnd: '#97aec8',
      bgGradientStyle: 'linear',
      bgGradientAngle: 135,
      bgGradientDirection: 'to bottom right',
      bgImageUrl: '',
      bgLayers: [],
      bgComponents: [],
      bgCompDrag: false,
      layout: 'label-left',
      letterSpacing: 0,
      lineHeight: 1.4,
      titleFontSize: 20,
      opacity: 1,
      dividerStyle: 'line',
      barStyle: 'normal',
      barAnimation: 'none',
      percentDisplay: 'center',
      glowColorA: '#85a6f8',
      glowColorB: '#95b3e8',
      glowSpeed: 1.0,
      longTextLineHeight: 1.6,
      longTextEffect: 'none',
      valueBoxWidthPct: 100,
      valueBoxOffsetPct: 0,
      itemOffsetPct: 0,
      itemOffsetRightPct: 0,
      lvLabelPct: 30,
      statusbarMaxWidth: 600,
      section2LabelColor: '',
      section2ValueColor: '',
      section2BarColor: '',
      section2DividerColor: '',
      itemCardPerItemEnabled: false,
      itemCardBgMode: 'theme',
      itemCardBgColor: '#111215',
      itemCardGradStart: '#6a717c',
      itemCardGradEnd: '#97aec8',
      itemCardGradAngle: 135,
      itemCardBgImageUrl: '',
      itemCardBgUrl: '',
      itemCardShadowEnabled: false,
      itemCardShadowStrength: 0.30,
      globalLabelFontFamily: '',
      globalValueFontFamily: '',
      globalLabelWeight: 500,
      globalValueWeight: 600,
      globalLabelFontSize: 16,
      globalValueFontSize: 16,
      globalLabelItalic: false,
      globalValueItalic: false,
      globalLabelUppercase: false,
      globalValueUppercase: false,
      globalLabelReflect: false,
      globalValueReflect: false,
      headerMinHeight: 0,
      headerPaddingY: 0,
      headerAlign: 'inherit',
      titleGapEnabled: false,
      titleGap: 10,
      titleColorMode: 'theme',
      titleColorSolid: '',
      titleGradStart: '',
      titleGradEnd: '',
      titleGradAngle: 0,
      titleEffectGlow: false,
      titleGlowIntensity: 0.5,
      titleEffectShadow: false,
      titleShadowStrength: 0.3,
      titleWeight: 500,
      titleItalic: false,
      titleUppercase: false,
      titleLetterSpacing: 0,
      titleUnderlineStyle: 'none',
      titleUnderlineColor: '#ffffff',
      titleUnderlineThickness: 2,
      titleUnderlineOffset: 4,
      titleBadgeEnabled: false,
      titleBadgeColor: '#000000',
      iconMode: 'none',
      iconBuiltin: 'cog',
      iconPosition: 'none',
      iconSize: 28,
      starEnabled: false,
      starFrequency: 2,
      starDensity: 50,
      starColor: '#ffffff',
      sparkleEnabled: false,
      sparkleDirection: 'down',
      sparkleFrequency: 8,
      sparkleDensity: 20,
      sparkleColor: '#ffd966',
      sparkleGlow: true,
      petalEnabled: false,
      petalFrequency: 5,
      petalDensity: 20,
      petalIconMode: 'built-in',
      petalIconBuiltin: 'leaf',
      petalIconUrl: '',
      customFonts: []
    };

    function isCustomizationModified(theme){
      const def = themeDefaults[theme] || {};
      const expected = {
        fontFamily: def.fontFamily,
        primaryColor: def.primaryColor,
        secondaryColor: def.secondaryColor,
        radius: def.radius,
        dividerStyle: def.dividerStyle,
        bgMode: def.bgMode ?? 'theme'
      };
      const norm = v => {
        if (v == null) return '';
        if (typeof v === 'string') return v.trim().toLowerCase();
        return String(v);
      };
      return Object.keys(expected).some(k => norm(customization[k]) !== norm(expected[k]));
    }

    function applyThemeDefaults(theme){
      const def = themeDefaults[theme] || {};
      if (!def) return customization;
      customization.fontFamily = def.fontFamily ?? customization.fontFamily;
      customization.primaryColor = def.primaryColor ?? customization.primaryColor;
      customization.secondaryColor = def.secondaryColor ?? customization.secondaryColor;
      customization.radius = def.radius ?? customization.radius;
      customization.dividerStyle = def.dividerStyle ?? customization.dividerStyle;
      customization.bgMode = def.bgMode ?? 'theme';
      customization.titleFontSize = def.titleFontSize ?? (customization.titleFontSize ?? 20);

      customization.globalLabelFontFamily = customization.globalLabelFontFamily || (def.fontFamily || customization.fontFamily);
      customization.globalValueFontFamily = customization.globalValueFontFamily || (def.fontFamily || customization.fontFamily);
      customization.globalLabelWeight = customization.globalLabelWeight || 500;
      customization.globalValueWeight = customization.globalValueWeight || 600;
      customization.globalLabelItalic = !!customization.globalLabelItalic;
      customization.globalValueItalic = !!customization.globalValueItalic;
      customization.globalLabelUppercase = !!customization.globalLabelUppercase;
      customization.globalValueUppercase = !!customization.globalValueUppercase;
      customization.globalLabelReflect = !!customization.globalLabelReflect;
      customization.globalValueReflect = !!customization.globalValueReflect;

      if (theme === 'theme-steampunk') {
        customization.iconMode = 'built-in';
        customization.iconBuiltin = customization.iconBuiltin || 'cog';
        customization.iconPosition = 'left';
        customization.iconSize = customization.iconSize || 28;
      } else {
        customization.iconMode = customization.iconMode || 'none';
        customization.iconPosition = (customization.iconMode === 'none') ? 'none' : (customization.iconPosition || 'left');
        customization.iconSize = customization.iconSize || 28;
      }

      currentTheme = theme;

      try {
        const cont = Utils.contrastRatio ? Utils.contrastRatio(customization.primaryColor, customization.secondaryColor) : 1;
        const coh = Utils.computeCoherence ? Utils.computeCoherence({
          theme,
          primaryColor: customization.primaryColor,
          secondaryColor: customization.secondaryColor,
          letterSpacing: customization.letterSpacing,
          lineHeight: customization.lineHeight,
          animationType: currentAnimation
        }) : 0.5;
        const contrastVal = (typeof cont === 'number' && cont.toFixed) ? Number(cont.toFixed(2)) : cont;
        console.log('[Ny.State] applyThemeDefaults', {
          theme,
          fontFamily: customization.fontFamily,
          primary: customization.primaryColor,
          secondary: customization.secondaryColor,
          radius: customization.radius,
          dividerStyle: customization.dividerStyle,
          bgMode: customization.bgMode,
          contrast: contrastVal,
          animation: currentAnimation,
          animSpeed,
          animIntensity,
          coherence: coh
        });
      } catch (_e) {}

      return customization;
    }

    function snapshot(){
      try { return JSON.parse(JSON.stringify(items)); } catch(_e) { return []; }
    }
    function setItems(next){
      if (Array.isArray(next)) items = next;
    }
    function setTitle(t){
      currentTitle = String(t || '角色状态');
    }
    function setAnimations(enter, loop){
      if (enter != null) currentEnterAnimation = String(enter || 'none');
      if (loop != null) currentLoopAnimation = String(loop || 'none');
      currentAnimation = (currentEnterAnimation !== 'none' || currentLoopAnimation !== 'none')
        ? (currentEnterAnimation + '+' + currentLoopAnimation)
        : 'none';
    }
    function setAnimParams(speed, intensity){
      if (isFinite(speed)) animSpeed = Number(speed);
      if (isFinite(intensity)) animIntensity = Number(intensity);
    }
    function patchCustomization(patch){
      if (patch && typeof patch === 'object') {
        customization = Object.assign({}, customization, patch);
      }
      return customization;
    }

    return {
      get currentTheme(){ return currentTheme; },
      get currentTitle(){ return currentTitle; },
      get currentEnterAnimation(){ return currentEnterAnimation; },
      get currentLoopAnimation(){ return currentLoopAnimation; },
      get currentAnimation(){ return currentAnimation; },
      get animSpeed(){ return animSpeed; },
      get animIntensity(){ return animIntensity; },
      get items(){ return items; },
      themeDefaults,
      customization,
      isCustomizationModified,
      applyThemeDefaults,
      snapshot,
      setItems,
      setTitle,
      setAnimations,
      setAnimParams,
      patchCustomization
    };
  })();
})(typeof window !== 'undefined' ? window : globalThis);
(function (window, document) {
  'use strict';
  // Ny.Background module skeleton to allow deferred external script without changing behavior
  var Ny = window.Ny = window.Ny || {};
  Ny.Background = Ny.Background || (function () {
    var initialized = false;

    function init() {
      if (initialized) return;
      initialized = true;
      try {
        console.debug('[Ny.Background] init');
        // No-op until background logic is migrated; retain exact current behavior
      } catch (e) {
        console.warn('[Ny.Background] initialization warning', e);
      }
    }

    function ensure() { if (!initialized) init(); }

    // Placeholder APIs to be populated during migration; returning safe defaults
    function buildBgLayersHTML(state) { return ''; }
    function buildBgComponentsHTML(state) { return ''; }

    // Editor renderers and event bindings (no-op for behavior parity)
    function renderBgLayersEditor(root, state) { /* intentionally blank until migration */ }
    function renderBgComponentsEditor(root, state) { /* intentionally blank until migration */ }
    function setupBgEditorsEvents(root) { /* intentionally blank until migration */ }

    // Drag/interaction helpers (no-op)
    function setupBgComponentDrag(container) { /* intentionally blank until migration */ }
    function ensureBgDock(container) { /* intentionally blank until migration */ }

    // Serialization for export pipelines (safe empty structure)
    function serializeBgConfig(state) { return { layers: [], components: [] }; }

    return {
      init: init,
      ensure: ensure,
      buildBgLayersHTML: buildBgLayersHTML,
      buildBgComponentsHTML: buildBgComponentsHTML,
      renderBgLayersEditor: renderBgLayersEditor,
      renderBgComponentsEditor: renderBgComponentsEditor,
      setupBgEditorsEvents: setupBgEditorsEvents,
      setupBgComponentDrag: setupBgComponentDrag,
      ensureBgDock: ensureBgDock,
      serializeBgConfig: serializeBgConfig
    };
  })();

  // Idempotent auto-init at DOM ready
  window.addEventListener('DOMContentLoaded', function () {
    try {
      if (window.Ny && Ny.Background && Ny.Background.init) Ny.Background.init();
    } catch (e) {
      console.warn('[Ny.Background] auto-init error', e);
    }
  });
})(window, document);
'use strict';
(function(global){
  const doc = global.document;
  const Ny = global.Ny || (global.Ny = {});
  Ny.Collapse = (function(){
    function setupCollapsibleSections(){
      try{
        const boxesA = Array.from(doc.querySelectorAll('#customization-section .form-group-box, #section-2 .form-group-box'));
        const boxesB = Array.from(doc.querySelectorAll('#customization-section .inline-subbox, #section-2 .inline-subbox')).filter(function(box){ return !!box.querySelector('.form-box-title'); });
        const boxes = boxesA.concat(boxesB);
        boxes.forEach(function(box){
          box.classList.add('collapsible');
          const title = box.querySelector('.form-box-title');
          if (title){
            title.setAttribute('tabindex','0');
            title.addEventListener('click', function(){ box.classList.toggle('collapsed'); });
            title.addEventListener('keydown', function(e){
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); box.classList.toggle('collapsed'); }
            });
          }
        });
        try{ console.log('[Ny.Collapse] initialized', { total: boxes.length, inline: boxesB.length }); }catch(_e){}
      }catch(err){
        try{ console.warn('[Ny.Collapse] init error', err); }catch(_e){}
      }
    }
    function init(){
      if (doc && doc.readyState === 'loading'){
        doc.addEventListener('DOMContentLoaded', setupCollapsibleSections);
      } else {
        setupCollapsibleSections();
      }
    }
    return { init };
  })();
  try { Ny.Collapse.init(); } catch(_e){}
})(typeof window !== 'undefined' ? window : globalThis);
'use strict';
(function(global){
  const doc = global.document;
  const Ny = global.Ny || (global.Ny = {});
  Ny.Adhere = (function(){
    let previewContainer = null;
    let borderRadiusRange = null;
    let radiusValue = null;
    let opacityRange = null;
    let opacityValue = null;
    let mo = null;

    function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }
    function fmtOpacity(v){ return (Math.round((parseFloat(v)||1)*100)/100).toFixed(2); }

    function applyRoundingAndOpacity(){
      try{
        const wrapper = previewContainer ? previewContainer.querySelector('.status-preview-wrapper') : null;
        if (!wrapper) return;
        if (borderRadiusRange){
          const r = clamp(parseInt(borderRadiusRange.value||'0',10) || 0, 0, 24);
          wrapper.style.borderRadius = r + 'px';
          if (radiusValue) radiusValue.textContent = String(r);
        }
        if (opacityRange){
          const o = clamp(parseFloat(opacityRange.value||'1') || 1, 0.3, 1);
          wrapper.style.opacity = String(o);
          if (opacityValue) opacityValue.textContent = fmtOpacity(o);
        }
      } catch(_e){}
    }

    function init(){
      previewContainer = doc.getElementById('live-preview-container');
      if (!previewContainer) return;
      borderRadiusRange = doc.getElementById('border-radius-range');
      radiusValue = doc.getElementById('radius-value');
      opacityRange = doc.getElementById('opacity-range');
      opacityValue = doc.getElementById('opacity-value');

      if (mo) {
        try { mo.disconnect(); } catch(_e){}
      }
      // 修复：提供正确的 MutationObserver fallback
      var MO = global.MutationObserver || global.WebKitMutationObserver || function() {
        this.observe = function() {};
        this.disconnect = function() {};
      };
      mo = new MO(function() {
        try { applyRoundingAndOpacity(); } catch(_e) {}
      });
      try {
        mo.observe(previewContainer, { childList: true });
      } catch(_e){}

      if (borderRadiusRange) borderRadiusRange.addEventListener('input', applyRoundingAndOpacity);
      if (opacityRange) opacityRange.addEventListener('input', applyRoundingAndOpacity);

      applyRoundingAndOpacity();
    }

    return { init, applyRoundingAndOpacity };
  })();

  if (global.document && global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', () => { Ny.Adhere.init(); });
  } else {
    Ny.Adhere.init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
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
      // 以便仍然绑定"设备切换"按钮的最小功能。其它外置绑定将按存在性自适应。
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
      
      // 设备预览切换：仅影响预览容器宽度（375px），不改导出代码
      try {
        var deviceBtn = document.getElementById('device-toggle-btn');
        function updateDeviceBtnUI(isMobile) {
          try {
            if (!deviceBtn) return;
            deviceBtn.setAttribute('aria-pressed', isMobile ? 'true' : 'false');
            deviceBtn.textContent = isMobile ? '💻 电脑端' : '📱 手机端';
            deviceBtn.title = '切换预览为手机/电脑';
          } catch (_e) {}
        }
        // 初始同步按钮态
        updateDeviceBtnUI(document.body.classList.contains('device-mobile'));
        if (deviceBtn) {
          deviceBtn.addEventListener('click', function () {
            var isMobile = document.body.classList.contains('device-mobile');
            var next = !isMobile;
            try {
              document.body.classList.toggle('device-mobile', next);
              updateDeviceBtnUI(next);
              // 轻量更新：直接修改wrapper样式，避免完全重建DOM导致图裂
              try {
                var preview = document.getElementById('live-preview-container');
                var wrapper = preview ? preview.querySelector('.status-preview-wrapper') : null;
                if (wrapper) {
                  if (next) {
                    // 切换到手机端
                    wrapper.style.width = 'min(100%, 375px)';
                    wrapper.style.maxWidth = '375px';
                    wrapper.classList.add('simulate-mobile');
                  } else {
                    // 切换到电脑端
                    var maxW = 600; // 默认值，实际应从 customization 读取
                    try {
                      if (window.Ny && Ny.State && Ny.State.customization) {
                        maxW = Ny.State.customization.statusbarMaxWidth || 600;
                      }
                    } catch(_e2) {}
                    wrapper.style.width = '100%';
                    wrapper.style.maxWidth = 'clamp(280px, 92vw, ' + maxW + 'px)';
                    wrapper.classList.remove('simulate-mobile');
                  }
                }
              } catch(_e1) {}
              // 仅当"输出代码"弹窗已打开时才进行轻量刷新
              try {
                var __modal = document.getElementById('code-modal');
                var __open = !!(__modal && __modal.style.display === 'flex');
                if (__open && Ny.Export && typeof Ny.Export.refreshOutputs === 'function') {
                  setTimeout(function(){ Ny.Export.refreshOutputs(false, { inlineGroup: true }); }, 50);
                }
              } catch(__rf){}
            } catch (_e) {}
          });
        }
      } catch (_e) {}
    }
    function bindEvents() {
      // Placeholder: migrate UI event bindings here
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