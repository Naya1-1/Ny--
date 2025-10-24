(function(global){
  'use strict';
  var Ny = global.Ny || (global.Ny = {});
  Ny.Params = (function(){
    var initialized = false;
    var Utils = (Ny && Ny.Utils) ? Ny.Utils : {};
    var State = (Ny && Ny.State) ? Ny.State : {};
    var Render = (Ny && Ny.Render) ? Ny.Render : {};

    function init(){
      if (initialized) return;
      initialized = true;
      try {
        console.debug('[Ny.Params] init');
      } catch(_e){}
    }
    function ensure(){ if(!initialized) init(); }

    function deepClone(obj){
      try { return JSON.parse(JSON.stringify(obj)); } catch(_e){ return (obj == null ? null : obj); }
    }
    function esc(s){
      try { return Utils.esc ? Utils.esc(s) : String(s == null ? '' : s); }
      catch(_e){ return String(s == null ? '' : s); }
    }
    function clamp(n, min, max){
      try { return Utils.clamp ? Utils.clamp(n, min, max) : Math.max(min, Math.min(max, n)); }
      catch(_e){ return Math.max(min, Math.min(max, n)); }
    }

    // 背景序列化，优先 Ny.Background.serializeBgConfig；否则委托 Ny.State.computeBackground（统一默认/回退）
    function serializeBackground(state){
      try {
        if (Ny && Ny.Background && typeof Ny.Background.serializeBgConfig === 'function'){
          return Ny.Background.serializeBgConfig(state);
        }
      } catch(_e){}
      try {
        if (Ny && Ny.State && typeof Ny.State.computeBackground === 'function'){
          var S = state || Ny.State;
          var customization = (S && S.customization) ? S.customization : (Ny.State.customization || {});
          return Ny.State.computeBackground(customization);
        }
      } catch(_e){}
      var cfg = (state && state.customization) ? state.customization : (State.customization || {});
      return {
        mode: String(cfg.bgMode || 'theme'),
        color: String(cfg.bgColor || ''),
        gradient: {
          style: String(cfg.bgGradientStyle || 'linear'),
          start: String(cfg.bgGradientStart || cfg.primaryColor || ''),
          end: String(cfg.bgGradientEnd || cfg.secondaryColor || ''),
          angle: Number(cfg.bgGradientAngle ?? 135) || 135,
          direction: String(cfg.bgGradientDirection || 'to bottom right')
        },
        imageUrl: String(cfg.bgImageUrl || ''),
        layers: Array.isArray(cfg.bgLayers) ? deepClone(cfg.bgLayers) : [],
        components: Array.isArray(cfg.bgComponents) ? deepClone(cfg.bgComponents) : []
      };
    }

    // 汇总三大左侧部分 + 右侧预览调节的所有参数为统一对象（统一改为消费 Ny.State.getViewModel，消除重复计算）
    function collectAll(state){
      ensure();
      try {
        if (State && typeof State.getViewModel === 'function'){
          var vm = State.getViewModel();
          if (vm && vm.meta) {
            vm.meta.collectedAt = new Date().toISOString();
            vm.meta.source = 'Ny.Params.collectAll';
          }
          return vm;
        }
      } catch(_e){}
      // 兜底（极端情况下 State.getViewModel 不存在时的保守返回）
      return {
        meta: { collectedAt: new Date().toISOString(), source: 'Ny.Params.collectAll', version: 1 },
        theme: State.currentTheme || 'theme-mystic-noir',
        title: State.currentTitle || '角色状态',
        animations: { enter: State.currentEnterAnimation || 'none', loop: State.currentLoopAnimation || 'none', combined: State.currentAnimation || 'none' },
        anim: { speed: State.animSpeed || 1.0, intensity: State.animIntensity || 0.7 },
        layout: { mode: (State.customization && State.customization.layout) || 'label-left', percentDisplay: String((State.customization && State.customization.percentDisplay) || 'center') },
        wrapper: { className: 'status-preview-wrapper', styleInline: '' },
        colors: {
          primary: String((State.customization && State.customization.primaryColor) || '#6a717c'),
          secondary: String((State.customization && State.customization.secondaryColor) || '#97aec8'),
          dividerStyle: String((State.customization && State.customization.dividerStyle) || 'line'),
          section2LabelColor: String((State.customization && State.customization.section2LabelColor) || ''),
          section2ValueColor: String((State.customization && State.customization.section2ValueColor) || ''),
          section2BarColor: String((State.customization && State.customization.section2BarColor) || ''),
          section2DividerColor: String((State.customization && State.customization.section2DividerColor) || '')
        },
        bars: { barStyle: String((State.customization && State.customization.barStyle) || 'normal'), barAnimation: String((State.customization && State.customization.barAnimation) || 'none') },
        fx: {},
        header: {},
        fonts: {},
        itemCard: {},
        perItemDefaults: {},
        customization: State.customization || {},
        items: State.snapshot ? State.snapshot() : (State.items || []),
        background: serializeBackground(State)
      };
    }

    // 面向 HTML 生成的上下文片段（复用 Ny.State.getViewModel 的 wrapper 与背景，避免重复拼装）
    function collectHtmlContext(state){
      ensure();
      var S = state || State || {};
      var vm = null;
      try { vm = (State && typeof State.getViewModel === 'function') ? State.getViewModel() : null; } catch(_e){ vm = null; }
      var theme = vm ? vm.theme : (S.currentTheme || 'theme-mystic-noir');
      var title = vm ? vm.title : (S.currentTitle || '角色状态');
      var customization = S.customization || {};
      var items = S.items || [];

      var headerHTML = '';
      var itemsHTML = '';
      var bgLayersHTML = '';
      var bgComponentsHTML = '';

      try { headerHTML = (Render && Render.getHeaderHTML2) ? Render.getHeaderHTML2(theme, title, customization) : ''; } catch(_e){}
      try { itemsHTML = (Render && Render.buildItemsHTML) ? Render.buildItemsHTML(items, theme, customization) : ''; } catch(_e){}
      var bg = vm ? vm.background : serializeBackground(S);
      try { bgLayersHTML = (Render && Render.buildBgLayersHTML) ? Render.buildBgLayersHTML(bg.layers, customization) : ''; } catch(_e){}
      try { bgComponentsHTML = (Render && Render.buildBgComponentsHTML) ? Render.buildBgComponentsHTML(bg.components) : ''; } catch(_e){}

      return {
        wrapperClass: vm ? vm.wrapper.className : ('status-preview-wrapper ' + theme),
        wrapperStyle: vm ? vm.wrapper.styleInline : '',
        headerHTML: headerHTML,
        itemsHTML: itemsHTML,
        bgLayersHTML: bgLayersHTML,
        bgComponentsHTML: bgComponentsHTML
      };
    }

    // JSON 字符串导出
    function toJSON(state){
      ensure();
      try { return JSON.stringify(collectAll(state), null, 2); }
      catch(_e){ return '{}'; }
    }

    // 持久化：localStorage 或 window 对象
    function persist(state, options){
      ensure();
      var opt = options || {};
      var target = String(opt.target || 'window'); // 'window' | 'localStorage'
      var key = String(opt.key || '__NY_PARAMS_LAST__');
      var payload = collectAll(state);
      try {
        if (target === 'localStorage'){
          global.localStorage.setItem(key, JSON.stringify(payload));
        } else {
          global[key] = payload;
        }
      } catch(e){
        try { console.warn('[Ny.Params] persist error', e); } catch(_e){}
      }
      return payload;
    }

    // ======= 状态栏编辑读取与审计（Audit） =======
    var __audit = { actions: [], ui: [] };
    var __auditStarted = false;
    var __auditMO = null;

    function __pushAction(kind, detail){
      try {
        __audit.actions.push({
          ts: new Date().toISOString(),
          kind: String(kind || 'event'),
          detail: detail || {}
        });
        if (__audit.actions.length > 2000) {
          __audit.actions.splice(0, __audit.actions.length - 2000);
        }
      } catch(_e){}
    }

    function __snapshotWrapper(){
      try {
        var doc = global.document;
        if (!doc) return null;
        var wrap = doc.querySelector('#live-preview-container .status-preview-wrapper, #ny-status.status-preview-wrapper, .status-preview-wrapper');
        if (!wrap) return null;

        // 计算最终字体（与预览一致）
        var gcs = (doc.defaultView && doc.defaultView.getComputedStyle) ? doc.defaultView.getComputedStyle : global.getComputedStyle;
        var wrapperFF = '';
        try { wrapperFF = (gcs ? gcs(wrap).fontFamily : '') || ''; } catch(_ce){}
        function pickFF(sel) {
          try {
            var el = wrap.querySelector(sel);
            if (!el) return '';
            return (gcs ? gcs(el).fontFamily : '') || '';
          } catch(_ee){ return ''; }
        }
        var computedFonts = {
          wrapper: wrapperFF,
          title: pickFF('.st-title') || wrapperFF,
          label: pickFF('.st-label') || wrapperFF,
          value: pickFF('.st-value') || wrapperFF
        };

        var snap = {
          ts: new Date().toISOString(),
          className: String(wrap.className || ''),
          style: String(wrap.getAttribute('style') || ''),
          computedFonts: computedFonts
        };
        __audit.ui.push(snap);
        if (__audit.ui.length > 400) {
          __audit.ui.splice(0, __audit.ui.length - 400);
        }
        return snap;
      } catch(_e){ return null; }
    }

    /**
     * 开始记录用户在编辑 UI 上的全部操作与界面调整（一次性幂等）
     * - 捕获 input/change/click 事件，记录控件值
     * - 监听预览容器 DOM/属性变化，快照包装器（status-preview-wrapper）的 class/style
     */
    function startAudit(options){
      ensure();
      if (__auditStarted) return;
      __auditStarted = true;
      var doc = global.document;
      if (!doc) return;

      function onEvt(e){
        try {
          var t = e.target || {};
          var tag = (t.tagName || '').toLowerCase();
          var id = String(t.id || '');
          var name = String(t.name || '');
          var cls = String(t.className || '');
          var typ = String(t.type || '');
          var val;
          if (typ === 'checkbox' || typ === 'radio') {
            val = !!t.checked;
          } else if ('value' in t) {
            val = String(t.value);
          } else {
            val = String((t.textContent || '')).slice(0, 200);
          }
          __pushAction('ui-' + e.type, { tag: tag, id: id, name: name, className: cls, inputType: typ, value: val });
        } catch(_ee){}
      }
      ['input','change','click'].forEach(function(ev){
        try { doc.addEventListener(ev, onEvt, true); } catch(_e){}
      });

      try {
        var obsTarget = doc.getElementById('live-preview-container') || doc.body || doc;
        var MO = global.MutationObserver || null;
        if (MO) {
          __auditMO = new MO(function(muts){
            var relevant = false;
            try {
              for (var i = 0; i < muts.length; i++){
                var m = muts[i];
                var el = m && m.target;
                if (!el) continue;
                if (el.id === 'ny-status') { relevant = true; break; }
                if (el.classList && el.classList.contains('status-preview-wrapper')) { relevant = true; break; }
              }
            } catch(_e){}
            if (relevant) __snapshotWrapper();
          });
          try {
            __auditMO.observe(obsTarget, { subtree: true, attributes: true, attributeFilter: ['class','style'], childList: true });
          } catch(_e){}
        }
      } catch(_e){}
      __snapshotWrapper();
    }

    function getAuditTrail(){
      try { return JSON.parse(JSON.stringify(__audit)); }
      catch(_e){ return { actions: [].concat(__audit.actions || []), ui: [].concat(__audit.ui || []) }; }
    }

    function clearAuditTrail(){
      try {
        __audit.actions.length = 0;
        __audit.ui.length = 0;
      } catch(_e){}
    }

    /**
     * 读取并整合“状态栏”全部参数 + 审计轨迹；可选反馈到输出系统
     * options:
     *   - feedback: boolean (默认 true) 是否调用 Ny.Export.refreshOutputs 轻量刷新输出
     *   - persist: 'window' | 'localStorage' (可选) 将最新快照持久化
     *   - key: string (可选) 持久化 key
     */
    function collectAllWithAudit(state, options){
      ensure();
      try {
        if (!__auditStarted) startAudit();
        var params = collectAll(state);

        // 从当前预览容器计算最终字体（确保导出与预览一致）
        var doc = global.document;
        var computedFonts = null;
        try {
          if (doc) {
            var wrap = doc.querySelector('#live-preview-container .status-preview-wrapper, #ny-status.status-preview-wrapper, .status-preview-wrapper');
            if (wrap) {
              var gcs = (doc.defaultView && doc.defaultView.getComputedStyle) ? doc.defaultView.getComputedStyle : global.getComputedStyle;
              var wrapperFF = '';
              try { wrapperFF = (gcs ? gcs(wrap).fontFamily : '') || ''; } catch(_ce){}
              function pickFF(sel) {
                try {
                  var el = wrap.querySelector(sel);
                  if (!el) return '';
                  return (gcs ? gcs(el).fontFamily : '') || '';
                } catch(_ee){ return ''; }
              }
              computedFonts = {
                wrapper: wrapperFF,
                title: pickFF('.st-title') || wrapperFF,
                label: pickFF('.st-label') || wrapperFF,
                value: pickFF('.st-value') || wrapperFF
              };
            }
          }
        } catch(_cf){ computedFonts = computedFonts || null; }

        var result = {
          meta: { collectedAt: new Date().toISOString(), source: 'Ny.Params.collectAllWithAudit' },
          params: params,
          audit: getAuditTrail(),
          computedFonts: computedFonts
        };
        var opt = options || {};
        var feedback = (opt.feedback !== false);
        // 向输出系统反馈（轻量刷新输出区域）
        if (feedback && global.Ny && global.Ny.Export && typeof global.Ny.Export.refreshOutputs === 'function') {
          try { global.Ny.Export.refreshOutputs(false, { inlineGroup: true }); } catch(_e){}
        }
        // 可选持久化
        if (opt && opt.persist) {
          try { persist(state, { target: String(opt.persist) === 'localStorage' ? 'localStorage' : 'window', key: String(opt.key || '__NY_PARAMS_AUDIT__') }); } catch(_pe){}
        }
        return result;
      } catch (e) {
        return {
          meta: { collectedAt: new Date().toISOString(), source: 'Ny.Params.collectAllWithAudit', error: String(e && (e.message || e)) },
          params: collectAll(state),
          audit: getAuditTrail(),
          computedFonts: null
        };
      }
    }

    /**
     * 便捷别名：直接针对全局状态读取“状态栏编辑”并反馈输出
     */
    function collectStatusbarEdits(options){
      return collectAllWithAudit(State, options);
    }
 
    return {
      init: init,
      ensure: ensure,
      collectAll: collectAll,
      collectHtmlContext: collectHtmlContext,
      toJSON: toJSON,
      persist: persist,
      startAudit: startAudit,
      getAuditTrail: getAuditTrail,
      clearAuditTrail: clearAuditTrail,
      collectAllWithAudit: collectAllWithAudit,
      collectStatusbarEdits: collectStatusbarEdits
    };
  })();

  global.addEventListener('DOMContentLoaded', function(){
    try { Ny.Params.init(); } catch(e){ try{ console.warn('[Ny.Params] auto-init warn', e); }catch(_e){} }
  });
})(typeof window !== 'undefined' ? window : globalThis);