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

    // 全局状态变更事件桥（CustomEvent）
    function emitStateChange(segment, detail){
      try {
        const ev = new CustomEvent('ny:state-change', { detail: Object.assign({ segment: String(segment||'state') }, detail || {}) });
        if (global && typeof global.dispatchEvent === 'function') global.dispatchEvent(ev);
      } catch(_e){}
    }

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
      titleEnabled: true,
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

       try { emitStateChange('theme', { theme: currentTheme }); } catch(_e){} return customization;
    }

    function snapshot(){
      try { return JSON.parse(JSON.stringify(items)); } catch(_e) { return []; }
    }
    function setItems(next){
      if (Array.isArray(next)) {
        items = next;
        emitStateChange('items', { count: items.length });
      }
    }
    function setTitle(t){
      currentTitle = String(t || '角色状态');
      emitStateChange('title', { title: currentTitle });
    }
    function setAnimations(enter, loop){
      if (enter != null) currentEnterAnimation = String(enter || 'none');
      if (loop != null) currentLoopAnimation = String(loop || 'none');
      currentAnimation = (currentEnterAnimation !== 'none' || currentLoopAnimation !== 'none')
        ? (currentEnterAnimation + '+' + currentLoopAnimation)
        : 'none';
      emitStateChange('animations', { enter: currentEnterAnimation, loop: currentLoopAnimation, combined: currentAnimation });
    }
    function setAnimParams(speed, intensity){
      if (isFinite(speed)) animSpeed = Number(speed);
      if (isFinite(intensity)) animIntensity = Number(intensity);
      emitStateChange('anim', { speed: animSpeed, intensity: animIntensity });
    }
    // 修复：保持 customization 引用不变，避免外部持有的 Ny.State.customization 变为“陈旧对象”
    // 仅做就地合并，所有读取方（如 Ny.Export/Ny.CodeGen）即可实时看到更新后的字体等字段
    function patchCustomization(patch){
      if (patch && typeof patch === 'object') {
        Object.assign(customization, patch);
        try { emitStateChange('customization', { keys: Object.keys(patch || {}) }); } catch(_e){}
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
/* Ny.State augmentation: unify defaults/derived computations and expose a single VM for Render/Params */
(function(global){
  'use strict';
  try {
    var Ny = global.Ny || (global.Ny = {});
    if (!Ny.State) return;

    var Utils = Ny.Utils || {};
    var State = Ny.State;

    function esc(s){
      try { return Utils.esc ? Utils.esc(s) : String(s == null ? '' : s); }
      catch(_e){ return String(s == null ? '' : s); }
    }
    function clamp(n, min, max){
      try { return Utils.clamp ? Utils.clamp(n, min, max) : Math.max(min, Math.min(max, n)); }
      catch(_e){ return Math.max(min, Math.min(max, n)); }
    }
    function deepClone(obj){
      try { return JSON.parse(JSON.stringify(obj)); } catch(_e){ return (obj == null ? null : obj); }
    }

    function getBarColor(customization){
      var s2 = (customization.section2BarColor && customization.section2BarColor.trim()) ? customization.section2BarColor.trim() : '';
      if (s2) return s2;
      var pc = customization.primaryColor;
      if (typeof pc === 'string' && pc.trim()) return pc.trim();
      return '#6a717c';
    }

    function computePerItemDefaults(customization){
      return {
        vbWidthPct: clamp(Number(customization.valueBoxWidthPct ?? 100), 40, 100),
        vbOffsetPct: clamp(Number(customization.valueBoxOffsetPct ?? 0), -40, 40),
        itemOffsetPct: clamp(Number(customization.itemOffsetPct ?? 0), -40, 40),
        itemOffsetRightPct: clamp(Number(customization.itemOffsetRightPct ?? 0), -40, 40)
      };
    }

    function computeBackground(customization){
      var mode = String(customization.bgMode || 'theme');
      var wrapperBgStyle = '';
      var gradient = null;

      if (mode === 'color') {
        var color = String(customization.bgColor || '#111215');
        wrapperBgStyle = 'background:' + color + ' !important;';
      } else if (mode === 'gradient') {
        var style = String(customization.bgGradientStyle || 'linear');
        var start = (customization.bgGradientStart && customization.bgGradientStart.trim()) ? customization.bgGradientStart.trim() : (customization.primaryColor || '#6a717c');
        var end   = (customization.bgGradientEnd && customization.bgGradientEnd.trim()) ? customization.bgGradientEnd.trim()   : (customization.secondaryColor || '#97aec8');
        var angle = Number(customization.bgGradientAngle ?? 135) || 135;
        var dir   = String(customization.bgGradientDirection || 'to bottom right');
        var gradCss;
        if (style === 'linear') {
          gradCss = 'linear-gradient(' + angle + 'deg, ' + start + ', ' + end + ')';
        } else if (style === 'radial') {
          var posR = dir.replace(/^to\s+/, '');
          gradCss = 'radial-gradient(at ' + posR + ', ' + start + ', ' + end + ')';
        } else if (style === 'conic') {
          var posC = dir.replace(/^to\s+/, '');
          gradCss = 'conic-gradient(from ' + angle + 'deg at ' + posC + ', ' + start + ', ' + end + ')';
        } else {
          gradCss = 'linear-gradient(' + angle + 'deg, ' + start + ', ' + end + ')';
        }
        wrapperBgStyle = 'background:' + gradCss + ' !important;';
        gradient = {
          style: style,
          start: String(start),
          end: String(end),
          angle: angle,
          direction: dir
        };
      } else if (mode === 'image') {
        var url = esc(customization.bgImageUrl || '');
        wrapperBgStyle = "background-image:url('" + url + "');background-size:cover;background-position:center;";
      } else if (mode === 'layers') {
        wrapperBgStyle = 'background:transparent !important;';
      } else if (mode === 'none') {
        wrapperBgStyle = 'background:transparent !important;';
      } else {
        // theme: let theme CSS handle
        wrapperBgStyle = '';
      }

      return {
        mode: mode,
        color: String(customization.bgColor || ''),
        gradient: gradient || {
          style: String(customization.bgGradientStyle || 'linear'),
          start: String(customization.bgGradientStart || customization.primaryColor || ''),
          end: String(customization.bgGradientEnd || customization.secondaryColor || ''),
          angle: Number(customization.bgGradientAngle ?? 135) || 135,
          direction: String(customization.bgGradientDirection || 'to bottom right')
        },
        imageUrl: String(customization.bgImageUrl || ''),
        layers: Array.isArray(customization.bgLayers) ? deepClone(customization.bgLayers) : [],
        components: Array.isArray(customization.bgComponents) ? deepClone(customization.bgComponents) : [],
        wrapperBgStyle: wrapperBgStyle
      };
    }

    function computeWrapper(theme, customization, enterAnim, loopAnim, animSpeed, animIntensity){
      var layout = customization.layout || 'label-left';
      var percentDisplay = String(customization.percentDisplay || 'center');

      var className = 'status-preview-wrapper ' + theme + ' percent-style-' + percentDisplay;
      if (layout === 'two-column') className += ' layout-two-column';
      if (layout !== 'stacked' && layout !== 'center' && layout !== 'two-column') className += ' ratio-layout';

      // append animation classes to align export with preview animations
      var enterMap = { none:'', fade:'anim-fade-in', slide:'anim-slide-up' };
      var loopMap  = { none:'', pulse:'anim-pulse', neon:'anim-neon-glow', shimmer:'anim-shimmer', tilt3d:'anim-tilt-3d', breathe:'anim-breathe', gloss:'anim-gloss' };
      var enterCls = enterMap[String(enterAnim || 'none')] || '';
      var loopCls  = loopMap[String(loopAnim  || 'none')] || '';
      if (enterCls) className += ' ' + enterCls;
      if (loopCls)  className += ' ' + loopCls;

      var styleParts = [];
      if (customization.fontFamily && String(customization.fontFamily).trim()) {
        styleParts.push('font-family:' + customization.fontFamily);
      }
      styleParts.push('border-radius:' + (customization.radius || 12) + 'px');
      styleParts.push('letter-spacing:' + (isFinite(customization.letterSpacing) ? customization.letterSpacing : 0) + 'em');
      styleParts.push('line-height:' + (isFinite(customization.lineHeight) ? customization.lineHeight : 1.4));
      styleParts.push('opacity:' + (isFinite(customization.opacity) ? customization.opacity : 1));

      var __maxW = isFinite(customization.statusbarMaxWidth) ? customization.statusbarMaxWidth : 600;
      styleParts.push('width:100%');
      styleParts.push('max-width:clamp(280px, 92vw, ' + __maxW + 'px)');
      styleParts.push('margin:0 auto');

      if (layout === 'two-column') {
        var lp = clamp(parseInt(customization.twoColLabelPct ?? 30, 10) || 30, 10, 50);
        var vp = 100 - lp;
        var gap = clamp(parseInt(customization.twoColGap ?? 12, 10) || 12, 0, 40);
        styleParts.push('--two-col-label:' + lp + '%');
        styleParts.push('--two-col-value:' + vp + '%');
        styleParts.push('--two-col-gap:' + gap + 'px');
      } else if (layout !== 'stacked' && layout !== 'center'){
        var lv = clamp(parseInt(customization.lvLabelPct ?? 30, 10) || 30, 10, 50);
        styleParts.push('--lv-label:' + lv + '%');
        styleParts.push('--lv-value:' + (100 - lv) + '%');
      }

      // value-box and item offsets
      (function(){
        var pct = clamp(Number(customization.valueBoxWidthPct ?? 100), 40, 100);
        var vOff = clamp(Number(customization.valueBoxOffsetPct ?? 0), -40, 40);
        var iOff = clamp(Number(customization.itemOffsetPct ?? 0), -40, 40);
        var iOffR = clamp(Number(customization.itemOffsetRightPct ?? 0), -40, 40);
        styleParts.push('--vb-width-pct:' + pct);
        styleParts.push('--vb-offset-pct:' + vOff);
        styleParts.push('--vb-offset-pct-pos:' + Math.max(0, vOff));
        styleParts.push('--vb-offset-pct-neg:' + Math.min(0, vOff));
        styleParts.push('--item-offset-pct:' + iOff);
        styleParts.push('--item-offset-right-pct:' + iOffR);
      })();

      // bar color css variable
      styleParts.push('--bar-color:' + getBarColor(customization));

      // glow and animation variables
      var glowA = String(customization.glowColorA || '#85a6f8');
      var glowB = String(customization.glowColorB || '#95b3e8');
      var glowSpeed = isFinite(customization.glowSpeed) ? Number(customization.glowSpeed) : 1;
      styleParts.push('--glow-color-a:' + glowA);
      styleParts.push('--glow-color-b:' + glowB);
      styleParts.push('--glow-speed:' + glowSpeed + 's');
      styleParts.push('--anim-speed:' + (isFinite(animSpeed) ? animSpeed : (State.animSpeed || 1)) + 's');
      styleParts.push('--anim-intensity:' + (isFinite(animIntensity) ? animIntensity : (State.animIntensity || 0.7)));

      // background style (color/gradient/image/layers/none/theme)
      var bgVM = computeBackground(customization);
      if (bgVM.wrapperBgStyle) styleParts.push(bgVM.wrapperBgStyle);

      return {
        className: className,
        styleInline: styleParts.join('; ')
      };
    }

    function getViewModel(){
      var theme = State.currentTheme || 'theme-mystic-noir';
      var title = State.currentTitle || '角色状态';
      var enter = State.currentEnterAnimation || 'none';
      var loop  = State.currentLoopAnimation || 'none';
      var combined = (enter !== 'none' || loop !== 'none') ? (String(enter) + '+' + String(loop)) : 'none';
      var aSpeed = isFinite(State.animSpeed) ? Number(State.animSpeed) : 1.0;
      var aIntensity = isFinite(State.animIntensity) ? Number(State.animIntensity) : 0.70;
      var customization = State.customization || {};
      var items = (State.snapshot ? State.snapshot() : deepClone(State.items || []));

      var wrapper = computeWrapper(theme, customization, enter, loop, aSpeed, aIntensity);

      var fx = {
        starEnabled: !!customization.starEnabled,
        starFrequency: Number(customization.starFrequency || 2),
        starDensity: Number(customization.starDensity || 0),
        starColor: String(customization.starColor || '#ffffff'),
        sparkleEnabled: !!customization.sparkleEnabled,
        sparkleDirection: String(customization.sparkleDirection || 'down'),
        sparkleFrequency: Number(customization.sparkleFrequency || 8),
        sparkleDensity: Number(customization.sparkleDensity || 20),
        sparkleColor: String(customization.sparkleColor || '#ffd966'),
        sparkleGlow: !!customization.sparkleGlow,
        petalEnabled: !!customization.petalEnabled,
        petalFrequency: Number(customization.petalFrequency || 5),
        petalDensity: Number(customization.petalDensity || 20),
        petalIconMode: String(customization.petalIconMode || 'built-in'),
        petalIconBuiltin: String(customization.petalIconBuiltin || 'leaf'),
        petalIconUrl: String(customization.petalIconUrl || '')
      };

      var header = {
        titleEnabled: customization.titleEnabled !== false,
        titleFontSize: Number(customization.titleFontSize || 20),
        titleWeight: Number(customization.titleWeight || 500),
        titleItalic: !!customization.titleItalic,
        titleUppercase: !!customization.titleUppercase,
        titleLetterSpacing: Number(customization.titleLetterSpacing || 0),
        titleUnderlineStyle: String(customization.titleUnderlineStyle || 'none'),
        titleUnderlineColor: String(customization.titleUnderlineColor || '#ffffff'),
        titleUnderlineThickness: Number(customization.titleUnderlineThickness || 2),
        titleUnderlineOffset: Number(customization.titleUnderlineOffset || 4),
        titleBadgeEnabled: !!customization.titleBadgeEnabled,
        titleBadgeColor: String(customization.titleBadgeColor || '#000000'),
        titleColorMode: String(customization.titleColorMode || 'theme'),
        titleColorSolid: String(customization.titleColorSolid || ''),
        titleGradStart: String(customization.titleGradStart || ''),
        titleGradEnd: String(customization.titleGradEnd || ''),
        titleGradAngle: Number(customization.titleGradAngle || 0),
        titleEffectGlow: !!customization.titleEffectGlow,
        titleGlowIntensity: Number(customization.titleGlowIntensity || 0.5),
        titleEffectShadow: !!customization.titleEffectShadow,
        titleShadowStrength: Number(customization.titleShadowStrength || 0.3),
        headerMinHeight: Number(customization.headerMinHeight || 0),
        headerPaddingY: Number(customization.headerPaddingY || 0),
        headerAlign: String(customization.headerAlign || 'inherit'),
        titleGapEnabled: !!customization.titleGapEnabled,
        titleGap: Number(customization.titleGap || 10),
        iconMode: String(customization.iconMode || 'none'),
        iconBuiltin: String(customization.iconBuiltin || 'cog'),
        iconPosition: String(customization.iconPosition || 'none'),
        iconSize: Number(customization.iconSize || 28)
      };

      var fonts = {
        globalLabelFontFamily: String(customization.globalLabelFontFamily || customization.fontFamily || ''),
        globalValueFontFamily: String(customization.globalValueFontFamily || customization.fontFamily || ''),
        globalLabelWeight: Number(customization.globalLabelWeight || 500),
        globalValueWeight: Number(customization.globalValueWeight || 600),
        globalLabelFontSize: Number(customization.globalLabelFontSize || 16),
        globalValueFontSize: Number(customization.globalValueFontSize || 16),
        globalLabelItalic: !!customization.globalLabelItalic,
        globalValueItalic: !!customization.globalValueItalic,
        globalLabelUppercase: !!customization.globalLabelUppercase,
        globalValueUppercase: !!customization.globalValueUppercase,
        globalLabelReflect: !!customization.globalLabelReflect,
        globalValueReflect: !!customization.globalValueReflect,
        customFonts: Array.isArray(customization.customFonts) ? deepClone(customization.customFonts) : []
      };

      var vm = {
        meta: {
          collectedAt: new Date().toISOString(),
          source: 'Ny.State.getViewModel',
          version: 1
        },
        theme: theme,
        title: title,
        animations: { enter: enter, loop: loop, combined: combined },
        anim: { speed: aSpeed, intensity: aIntensity },
        layout: { mode: customization.layout || 'label-left', percentDisplay: String(customization.percentDisplay || 'center') },
        wrapper: wrapper,
        colors: {
          primary: String(customization.primaryColor || '#6a717c'),
          secondary: String(customization.secondaryColor || '#97aec8'),
          dividerStyle: String(customization.dividerStyle || 'line'),
          section2LabelColor: String(customization.section2LabelColor || ''),
          section2ValueColor: String(customization.section2ValueColor || ''),
          section2BarColor: String(customization.section2BarColor || ''),
          section2DividerColor: String(customization.section2DividerColor || '')
        },
        bars: {
          barStyle: String(customization.barStyle || 'normal'),
          barAnimation: String(customization.barAnimation || 'none'),
          barColorSafe: getBarColor(customization)
        },
        fx: fx,
        header: header,
        fonts: fonts,
        itemCard: {
          perItemEnabled: !!customization.itemCardPerItemEnabled,
          bgMode: String(customization.itemCardBgMode || 'theme'),
          bgColor: String(customization.itemCardBgColor || '#111215'),
          gradStart: String(customization.itemCardGradStart || customization.primaryColor || '#6a717c'),
          gradEnd: String(customization.itemCardGradEnd || customization.secondaryColor || '#97aec8'),
          gradAngle: Number(customization.itemCardGradAngle ?? 135) || 135,
          bgImageUrl: String(customization.itemCardBgImageUrl || ''),
          bgUrl: String(customization.itemCardBgUrl || ''),
          shadowEnabled: !!customization.itemCardShadowEnabled,
          shadowStrength: Number(customization.itemCardShadowStrength || 0.30)
        },
        perItemDefaults: computePerItemDefaults(customization),
        customization: customization,
        items: items,
        background: computeBackground(customization)
      };

      try {
        var coh = Utils.computeCoherence ? Utils.computeCoherence({
          theme: theme,
          primaryColor: customization.primaryColor,
          secondaryColor: customization.secondaryColor,
          letterSpacing: customization.letterSpacing,
          lineHeight: customization.lineHeight,
          animationType: (State.currentAnimation || combined || 'none')
        }) : 0.5;
        console.log('[Ny.State] VM', {
          theme,
          layout: customization.layout,
          barStyle: customization.barStyle,
          animation: State.currentAnimation,
          animSpeed: State.animSpeed,
          animIntensity: State.animIntensity,
          coherence: coh,
          count: Array.isArray(items) ? items.length : 0
        });
      } catch(_e){}

      return vm;
    }

    // Expose unified compute layer on Ny.State without breaking existing API
    try {
      State.getViewModel = getViewModel;
      State.computeBackground = computeBackground;
      State.computeWrapper = computeWrapper;
      State.getBarColor = getBarColor;
      State.computePerItemDefaults = computePerItemDefaults;
    } catch(_e){}

  } catch(_e){}
})(typeof window !== 'undefined' ? window : globalThis);