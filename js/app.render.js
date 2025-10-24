(function(global){
  'use strict';
  const Ny = global.Ny || (global.Ny = {});
  Ny.Render = (function(){
    const Utils = (global.Ny && global.Ny.Utils) ? global.Ny.Utils : {};
    const State = (global.Ny && global.Ny.State) ? global.Ny.State : {};

    let previewContainer = null;

    function mount(containerEl){
      previewContainer = containerEl || previewContainer || global.document && global.document.getElementById('live-preview-container');
    }
    function ensureContainer(){
      if (!previewContainer && global.document) {
        previewContainer = global.document.getElementById('live-preview-container');
      }
      return previewContainer;
    }

    // 简化别名
    const esc = (s) => { try { return Utils.esc ? Utils.esc(s) : String(s == null ? '' : s); } catch(_e){ return String(s == null ? '' : s); } };
    const clamp = (n, min, max) => { try { return Utils.clamp ? Utils.clamp(n, min, max) : Math.max(min, Math.min(max, n)); } catch(_e){ return Math.max(min, Math.min(max, n)); } };

    function makeIconHTML(customization){
      try {
        if (!customization) return '';
        const mode = customization.iconMode || 'none';
        if (mode === 'none') return '';

        const size = customization.iconSize || 28;
        let inner = '';

        if (mode === 'built-in') {
          const svg = Utils.getBuiltinIconSVG ? Utils.getBuiltinIconSVG(customization.iconBuiltin || 'cog', size, customization.primaryColor) : '';
          inner = svg;
        } else if (mode === 'url') {
          const raw = (customization.iconUrl == null ? '' : String(customization.iconUrl)).trim();
          if (!raw) return ''; // 避免空 URL 导致初始加载出现“破图”占位
          const url = esc(raw);
          inner = `<img src="${url}" alt="" style="width:${size}px;height:${size}px;object-fit:contain;filter: drop-shadow(0 0 2px rgba(0,0,0,.3));">`;
        } else {
          return '';
        }

        return `
          <span class="st-header-icon" style="
            width:${size}px; height:${size}px; border-radius:50%;
            display:grid; place-items:center;
          ">
            ${inner}
          </span>
        `;
      } catch(_e){ return ''; }
    }

    function getHeaderHTML2(theme, title, customization){
      customization = customization || State.customization || {};
      if (customization && customization.titleEnabled === false) { try { console.log('[dbg] getHeaderHTML2: title disabled, skip render', { titleEnabled: customization.titleEnabled }); } catch(_eLog){} return ''; }
      const t = esc(title || '角色状态');

      const themeColor = (customization.primaryColor || '#ffffff');
      const mode = (customization.titleColorMode || 'theme');

      const titleStyleParts = [
        `font-size:${customization.titleFontSize || 20}px`,
        `font-weight:${parseInt(customization.titleWeight || 500, 10) || 500}`,
        customization.titleItalic ? 'font-style:italic' : '',
        customization.titleUppercase ? 'text-transform:uppercase' : '',
        (typeof customization.titleLetterSpacing === 'number' ? `letter-spacing:${customization.titleLetterSpacing}em` : '')
      ].filter(Boolean);

      if (mode === 'solid') {
        const solid = (customization.titleColorSolid && customization.titleColorSolid.trim()) ? customization.titleColorSolid.trim() : themeColor;
        titleStyleParts.push(`color:${solid}`);
      } else if (mode === 'gradient') {
        const a = (customization.titleGradStart && customization.titleGradStart.trim()) ? customization.titleGradStart.trim() : (customization.primaryColor || themeColor);
        const b = (customization.titleGradEnd && customization.titleGradEnd.trim()) ? customization.titleGradEnd.trim() : (customization.secondaryColor || themeColor);
        const ang = Number(customization.titleGradAngle ?? 0) || 0;
        titleStyleParts.push(
          `background:linear-gradient(${ang}deg, ${a}, ${b})`,
          `-webkit-background-clip:text`,
          `background-clip:text`,
          `color:transparent`
        );
      } else {
        titleStyleParts.push(`color:${themeColor}`);
      }

      // 下划线
      if ((customization.titleUnderlineStyle || 'none') !== 'none') {
        const uStyle = customization.titleUnderlineStyle || 'solid';
        const uColor = (customization.titleUnderlineColor && customization.titleUnderlineColor.trim()) ? customization.titleUnderlineColor.trim() : themeColor;
        const uThick = Math.max(1, parseInt(customization.titleUnderlineThickness || 2, 10) || 2);
        const uOffset = Math.max(0, parseInt(customization.titleUnderlineOffset || 4, 10) || 4);
        titleStyleParts.push(
          'text-decoration-line:underline',
          `text-decoration-style:${uStyle}`,
          `text-decoration-color:${uColor}`,
          `text-decoration-thickness:${uThick}px`,
          `text-underline-offset:${uOffset}px`
        );
      }

      // 特效
      const ts = [];
      if (customization.titleEffectGlow) {
        const intensity = Math.max(0, Math.min(1, Number(customization.titleGlowIntensity || 0.5)));
        const glowColor = (mode === 'solid' && customization.titleColorSolid) ? customization.titleColorSolid : themeColor;
        const r1 = (6 + 10 * intensity).toFixed(1);
        const r2 = (12 + 18 * intensity).toFixed(1);
        ts.push(`0 0 ${r1}px ${glowColor}`, `0 0 ${r2}px ${glowColor}`);
      }
      if (customization.titleEffectShadow) {
        const s = Math.max(0, Math.min(1, Number(customization.titleShadowStrength || 0.3)));
        const y = (1 + 3 * s).toFixed(1);
        const blur = (2 + 6 * s).toFixed(1);
        ts.push(`0 ${y}px ${blur}px rgba(0,0,0,${0.45 + 0.3*s})`);
      }
      if (ts.length) titleStyleParts.push(`text-shadow:${ts.join(',')}`);

      const titleInner = (theme === 'theme-cyber-grid')
        ? `<span class="st-title" style="${titleStyleParts.join('; ')}">[ ${t} ]</span>`
        : `<span class="st-title" style="${titleStyleParts.join('; ')}">${t}</span>`;

      // 徽章
      let titleSpan = titleInner;
      if (customization.titleBadgeEnabled) {
        const bColor = (customization.titleBadgeColor && customization.titleBadgeColor.trim()) ? customization.titleBadgeColor.trim() : '#000000';
        const badgeStyle = [
          `background: color-mix(in srgb, ${bColor} 30%, transparent)`,
          `padding:4px 8px`,
          `border-radius:8px`,
          'display:inline-block'
        ].join('; ');
        titleSpan = `<span class="st-title-badge" style="${badgeStyle}">${titleInner}</span>`;
      }

      // 容器样式
      const mh = Math.max(0, Number(customization.headerMinHeight || 0)) || 0;
      const py = Math.max(0, Number(customization.headerPaddingY || 0)) || 0;
      const gapEnabled = !!customization.titleGapEnabled;
      const gapPx = Math.max(0, Number(customization.titleGap || 10)) || 10;
      const align = customization.headerAlign || 'inherit';
      let justify = '';
      if (align === 'left') justify = 'flex-start';
      else if (align === 'center') justify = 'center';
      else if (align === 'right') justify = 'flex-end';

      const headerStyleParts = [];
      if (mh > 0) headerStyleParts.push(`min-height:${mh}px`);
      if (py > 0) headerStyleParts.push(`padding-block:${py}px`);
      if (gapEnabled) headerStyleParts.push(`gap:${gapPx}px`);
      if (justify) headerStyleParts.push(`justify-content:${justify}`);

      const iconHTML = makeIconHTML(customization);
      const pos = (customization.iconMode !== 'none' && (customization.iconPosition === 'none' || !customization.iconPosition))
        ? 'left'
        : (customization.iconPosition || 'none');

      let inner;
      if (pos === 'left') {
        inner = `${iconHTML}${titleSpan}`;
      } else if (pos === 'right') {
        inner = `${titleSpan}${iconHTML}`;
      } else {
        inner = `${titleSpan}`;
      }

      const headerStyle = headerStyleParts.join('; ');
      return `<div class="st-header" style="${headerStyle}">${inner}</div>`;
    }

    function dividerHTML(customization){
      customization = customization || State.customization || {};
      const dc = (customization.section2DividerColor && customization.section2DividerColor.trim().length > 0)
        ? customization.section2DividerColor
        : customization.primaryColor;
      if (customization.dividerStyle === 'dashed') {
        return `<hr style="border:none;border-top:1px dashed ${dc};height:0;opacity:.9;">`;
      }
      if (customization.dividerStyle === 'gradient') {
        return `<hr style="border:none;height:1px; background-image:linear-gradient(to right, transparent, ${dc}, transparent);">`;
      }
      // line
      return `<hr style="border:none;height:1px;background:${dc};">`;
    }

    function buildItemsHTML(list, theme, customization){
      customization = customization || State.customization || {};
      const pc = customization.primaryColor;
      const sc = customization.secondaryColor;
      const layout = customization.layout;

      const s2Label = customization.section2LabelColor && customization.section2LabelColor.trim().length > 0 ? customization.section2LabelColor : '';
      const s2Value = customization.section2ValueColor && customization.section2ValueColor.trim().length > 0 ? customization.section2ValueColor : '';
      const s2Bar   = customization.section2BarColor   && customization.section2BarColor.trim().length   > 0 ? customization.section2BarColor   : '';

      const styleJoin = parts => parts.filter(Boolean).join('; ');

      const labelFontFamily = customization.globalLabelFontFamily || customization.fontFamily;
      const valueFontFamily = customization.globalValueFontFamily || customization.fontFamily;
      const labelWeight = customization.globalLabelWeight || 500;
      const valueWeight = customization.globalValueWeight || 600;
      const labelFontSize = customization.globalLabelFontSize || 0;
      const valueFontSize = customization.globalValueFontSize || 0;
      const labelItalic = customization.globalLabelItalic ? 'font-style:italic' : '';
      const valueItalic = customization.globalValueItalic ? 'font-style:italic' : '';
      const labelUpper = customization.globalLabelUppercase ? 'text-transform:uppercase' : '';
      const valueUpper = customization.globalValueUppercase ? 'text-transform:uppercase' : '';
      const labelReflect = customization.globalLabelReflect ? '-webkit-box-reflect: below 0 linear-gradient(transparent, rgba(255,255,255,.15))' : '';
      const valueReflect = customization.globalValueReflect ? '-webkit-box-reflect: below 0 linear-gradient(transparent, rgba(255,255,255,.15))' : '';
      const reflectInlineBlock = 'display:inline-block';

      const barStyle = customization.barStyle || 'normal';
      const barAnimation = customization.barAnimation || 'none';
      const barClassFromStyle = () => {
        switch (barStyle) {
          case 'glow': return 'pf-glow';
          case 'striped': return 'pf-striped';
          case 'glass': return 'pf-glass';
          default: return '';
        }
      };
      const barAnimClass = barAnimation === 'grow' ? 'pf-anim-grow' : '';

      return (Array.isArray(list) ? list : []).map(it => {
        if (it.type === 'divider') return dividerHTML(customization);

        if (it.type === 'text') {
          const labelColor = s2Label || it.labelColor || sc;
          const valueColor = s2Value || it.valueColor || pc;
          const lblStyle = styleJoin([
            `color:${labelColor}`,
            labelFontFamily ? `font-family:${labelFontFamily}` : '',
            `font-weight:${labelWeight}`,
            labelFontSize ? `font-size:${labelFontSize}px` : '',
            labelItalic,
            labelUpper,
            customization.globalLabelReflect ? reflectInlineBlock : '',
            labelReflect
          ]);
          const valStyleBase = styleJoin([
            `color:${valueColor}`,
            valueFontFamily ? `font-family:${valueFontFamily}` : '',
            `font-weight:${valueWeight}`,
            valueFontSize ? `font-size:${valueFontSize}px` : '',
            valueItalic,
            valueUpper,
            customization.globalValueReflect ? reflectInlineBlock : '',
            valueReflect
          ]);
          if (layout === 'two-column') {
            return `
              <div class="st-item" style="display:grid;grid-template-columns:var(--two-col-label,30%) var(--two-col-value,70%);column-gap:var(--two-col-gap,12px);align-items:start;">
                <div class="st-label" style="${lblStyle}; text-align:left;">${esc(it.label || '')}</div>
                <div class="st-value st-text" style="${valStyleBase}; text-align:left;">${esc(it.value || '')}</div>
              </div>
            `;
          }
          if (layout === 'stacked' || layout === 'center') {
            const align = (layout === 'center') ? 'center' : 'flex-start';
            const valueTextAlign = (layout === 'center') ? 'center' : 'right';
            return `
              <div class="st-item" style="display:flex;flex-direction:column;align-items:${align};gap:4px;">
                <div class="st-label" style="${lblStyle}">${esc(it.label || '')}</div>
                <div class="st-value st-text" style="${valStyleBase}; text-align:${valueTextAlign};">${esc(it.value || '')}</div>
              </div>
            `;
          } else if (layout === 'label-left') {
            return `
              <div class="st-item" style="display:grid;grid-template-columns:var(--lv-label,30%) var(--lv-value,70%);column-gap:12px;align-items:center;">
                <div class="st-label" style="${lblStyle}">${esc(it.label || '')}</div>
                <div class="st-value st-text" style="text-align:right; ${valStyleBase}">${esc(it.value || '')}</div>
              </div>
            `;
          } else if (layout === 'reverse') {
            return `
              <div class="st-item" style="display:grid;grid-template-columns:var(--lv-value,70%) var(--lv-label,30%);column-gap:12px;align-items:center;">
                <div class="st-value st-text" style="text-align:left; ${valStyleBase}">${esc(it.value || '')}</div>
                <div class="st-label" style="${lblStyle}">${esc(it.label || '')}</div>
              </div>
            `;
          } else {
            return `
              <div class="st-item" style="display:flex;flex-direction:row;align-items:center;justify-content:space-between;">
                <div class="st-label" style="${lblStyle}">${esc(it.label || '')}</div>
                <div class="st-value st-text" style="${valStyleBase}; text-align:right;">${esc(it.value || '')}</div>
              </div>
            `;
          }
        }

        if (it.type === 'longtext') {
          const labelColor = s2Label || it.labelColor || sc;
          const valueColor = s2Value || it.valueColor || pc;
          const lblStyle = styleJoin([
            `color:${labelColor}`,
            labelFontFamily ? `font-family:${labelFontFamily}` : '',
            `font-weight:${labelWeight}`,
            labelFontSize ? `font-size:${labelFontSize}px` : '',
            labelItalic,
            labelUpper,
            customization.globalLabelReflect ? reflectInlineBlock : '',
            labelReflect
          ]);
          const valStyleBase = styleJoin([
            `color:${valueColor}`,
            valueFontFamily ? `font-family:${valueFontFamily}` : '',
            `font-weight:${valueWeight}`,
            valueFontSize ? `font-size:${valueFontSize}px` : '',
            valueItalic,
            valueUpper,
            customization.globalValueReflect ? reflectInlineBlock : '',
            valueReflect
          ]);
          const spanAll = (customization.layout === 'two-column') ? 'grid-column: 1 / -1;' : '';
          const eff = it.ltEffect || 'none';
          const lh = (typeof it.ltLineHeight === 'number' ? it.ltLineHeight : 1.6);
          const effClass = (eff === 'fade' ? ' anim-fade-in' : (eff === 'slide' ? ' anim-slide-up' : ''));
          let effAttr = '';
          if (eff === 'typewriter') {
            const spd = isFinite(it.ltTwSpeedMs) ? Math.max(5, Math.min(200, Number(it.ltTwSpeedMs))) : 18;
            const dly = isFinite(it.ltTwDelayMs) ? Math.max(0, Number(it.ltTwDelayMs)) : 0;
            const caret = (it.ltTwCaret !== false) ? '1' : '0';
            effAttr = ` data-effect="typewriter" data-tw-speed="${spd}" data-tw-delay="${dly}" data-tw-caret="${caret}"`;
          }
          // 新增：按项目独立的首字缩进与四边距（仅长文字）
          const indent = isFinite(it.ltFirstIndentPx) ? Math.max(0, Number(it.ltFirstIndentPx)) : 0;
          const pTop = isFinite(it.ltPadTopPx) ? Math.max(0, Number(it.ltPadTopPx)) : 0;
          const pRight = isFinite(it.ltPadRightPx) ? Math.max(0, Number(it.ltPadRightPx)) : 0;
          const pBottom = isFinite(it.ltPadBottomPx) ? Math.max(0, Number(it.ltPadBottomPx)) : 0;
          const pLeft = isFinite(it.ltPadLeftPx) ? Math.max(0, Number(it.ltPadLeftPx)) : 0;
          const skipFirst = !!it.ltSkipFirstLine;
          const padTopCss = skipFirst ? `calc(${pTop}px + ${lh}em)` : `${pTop}px`;
          const valStyle = [
            valStyleBase,
            'white-space:pre-wrap',
            'word-break:break-word',
            'overflow-wrap:anywhere',
            `line-height:${lh}`,
            `text-indent:${indent}px`,
            `padding-top:${padTopCss}`,
            `padding-right:${pRight}px`,
            `padding-bottom:${pBottom}px`,
            `padding-left:${pLeft}px`
          ].filter(Boolean).join('; ');
          const dataSkip = skipFirst ? ' data-lt-skip-first="1"' : '';
          return `
            <div class="st-item" style="display:block; ${spanAll}">
              <div class="st-label" style="${lblStyle}">${esc(it.label || '')}</div>
              <div class="st-value st-longtext${effClass}"${effAttr}${dataSkip} style="${valStyle};">
                ${esc(it.value || '')}
              </div>
            </div>
          `;
        }

        if (it.type === 'bar') {
          const p = clamp(parseInt(it.percent ?? 0, 10) || 0, 0, 100);
          const labelColor = s2Label || it.labelColor || sc;
          const fillColor  = s2Bar   || it.barColor || '';
          const classList = ['st-progress-bar-fill'];
          const styleParts = [];
          if (barAnimClass) classList.push(barAnimClass);
          const styleWidth = barAnimClass ? `width: var(--target); --target: ${p}%` : `width: ${p}%`;
          styleParts.push(styleWidth);
          if (fillColor) {
            styleParts.push(`background: ${esc(fillColor)}`);
            styleParts.push(`--bar-color: ${esc(fillColor)}`);
          } else {
            styleParts.push(`background: linear-gradient(90deg, ${pc}, ${sc})`);
            styleParts.push(`--bar-color: ${State && State.getBarColor ? State.getBarColor(customization) : (typeof pc === 'string' && pc.trim() ? pc.trim() : '#6a717c')}`);
          }
          const fillStyle = `style="${styleParts.join('; ')}"`;
          const extraStyleClass = barClassFromStyle();
          if (extraStyleClass) classList.push(extraStyleClass);

          const lblStyle = styleJoin([
            `color:${labelColor}`,
            labelFontFamily ? `font-family:${labelFontFamily}` : '',
            `font-weight:${labelWeight}`,
            labelFontSize ? `font-size:${labelFontSize}px` : '',
            labelItalic,
            labelUpper,
            customization.globalLabelReflect ? reflectInlineBlock : '',
            labelReflect
          ]);
          const valStyle = styleJoin([
            valueFontFamily ? `font-family:${valueFontFamily}` : '',
            `font-weight:${valueWeight}`,
            valueFontSize ? `font-size:${valueFontSize}px` : '',
            valueItalic,
            valueUpper,
            customization.globalValueReflect ? reflectInlineBlock : '',
            valueReflect
          ]);

          if (layout === 'stacked' || layout === 'center') {
            const align = layout === 'center' ? 'center' : 'flex-start';
            return `
              <div class="st-item" style="display:flex;flex-direction:column;align-items:${align};gap:4px;">
                <div class="st-label" style="${lblStyle}">${esc(it.label || '')}</div>
                <div class="st-value" style="width: clamp(120px, 40vw, calc(var(--_vb-base-max,160px) * var(--vb-width-pct,100) / 100)); transform: translateX(calc(1% * var(--vb-offset-pct, 0))); ${valStyle}">
                  <div class="st-progress-bar" onclick="(function(bar){var s=bar.querySelector('.st-progress-percent');var show=!(bar.classList&&bar.classList.contains('show-percent'));if(bar.classList)bar.classList.toggle('show-percent',show);if(s){s.style.opacity=show?'1':'0';}})(this)">
                    <div class="${classList.join(' ')}" ${fillStyle}></div><span class="st-progress-percent" style="position:absolute;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;pointer-events:none;opacity:0;transition:opacity .3s;--pct:${p}%;">${p}%</span>
                  </div>
                </div>
              </div>
            `;
          }

          // 左右排列（默认：label-left）下，进度条长度应受“标签/值比例（第三部分）”控制
          if (layout === 'label-left') {
            // 显式使用 grid，将标签/值比例直接作用于该项，确保进度条长度遵循 --lv-label / --lv-value
            return `
              <div class="st-item" style="display:grid;grid-template-columns:var(--lv-label,30%) var(--lv-value,70%);column-gap:12px;align-items:center;">
                <div class="st-label" style="${lblStyle}">${esc(it.label || '')}</div>
                <div class="st-value" style="width: clamp(120px, 40vw, calc(var(--_vb-base-max,160px) * var(--vb-width-pct,100) / 100)); transform: translateX(calc(1% * var(--vb-offset-pct, 0))); ${valStyle}">
                  <div class="st-progress-bar" onclick="(function(bar){var s=bar.querySelector('.st-progress-percent');var show=!(bar.classList&&bar.classList.contains('show-percent'));if(bar.classList)bar.classList.toggle('show-percent',show);if(s){s.style.opacity=show?'1':'0';}})(this)">
                    <div class="${classList.join(' ')}" ${fillStyle}></div><span class="st-progress-percent" style="position:absolute;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;pointer-events:none;opacity:0;transition:opacity .3s;--pct:${p}%;">${p}%</span>
                  </div>
                </div>
              </div>
            `;
          }

          // 其它布局：reverse 使用比例栅格，其它保持原有 flex 行为
          if (layout === 'reverse') {
            return `
              <div class="st-item" style="display:grid;grid-template-columns:var(--lv-value,70%) var(--lv-label,30%);column-gap:12px;align-items:center;">
                <div class="st-value" style="width: clamp(120px, 40vw, calc(var(--_vb-base-max,160px) * var(--vb-width-pct,100) / 100)); transform: translateX(calc(1% * var(--vb-offset-pct, 0))); ${valStyle}">
                  <div class="st-progress-bar" onclick="(function(bar){var s=bar.querySelector('.st-progress-percent');var show=!(bar.classList&&bar.classList.contains('show-percent'));if(bar.classList)bar.classList.toggle('show-percent',show);if(s){s.style.opacity=show?'1':'0';}})(this)">
                    <div class="${classList.join(' ')}" ${fillStyle}></div><span class="st-progress-percent" style="position:absolute;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;pointer-events:none;opacity:0;transition:opacity .3s;--pct:${p}%;">${p}%</span>
                  </div>
                </div>
                <div class="st-label" style="${lblStyle}">${esc(it.label || '')}</div>
              </div>
            `;
          }
          return `
            <div class="st-item" style="display:flex;align-items:center;justify-content:space-between;">
              <div class="st-label" style="${lblStyle}">${esc(it.label || '')}</div>
              <div class="st-value" style="width: clamp(120px, 40vw, calc(var(--_vb-base-max,160px) * var(--vb-width-pct,100) / 100)); transform: translateX(calc(1% * var(--vb-offset-pct, 0))); ${valStyle}">
                <div class="st-progress-bar" onclick="(function(bar){var s=bar.querySelector('.st-progress-percent');var show=!(bar.classList&&bar.classList.contains('show-percent'));if(bar.classList)bar.classList.toggle('show-percent',show);if(s){s.style.opacity=show?'1':'0';}})(this)">
                  <div class="${classList.join(' ')}" ${fillStyle}></div><span class="st-progress-percent" style="position:absolute;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;pointer-events:none;opacity:0;transition:opacity .3s;--pct:${p}%;">${p}%</span>
                </div>
              </div>
            </div>
          `;
        }

        return '';
      }).join('');
    }

    // 背景层与组件（临时：后续迁移 Ny.Bg）
    function buildBgLayersHTML(layers, customization){
      customization = customization || State.customization || {};
      try {
        if (global.Ny && global.Ny.Background && typeof global.Ny.Background.buildBgLayersHTML === 'function') {
          return global.Ny.Background.buildBgLayersHTML(layers, customization);
        }
      } catch(_e){}
      return '';
    }
    function buildBgComponentsHTML(components){
      try {
        if (global.Ny && global.Ny.Background && typeof global.Ny.Background.buildBgComponentsHTML === 'function') {
          return global.Ny.Background.buildBgComponentsHTML(components, State.customization || {});
        }
      } catch(_e){}
      return '';
    }

    function renderFxLayers(wrapperEl, customization){
      customization = customization || State.customization || {};
      try {
        if (!wrapperEl) return;
        wrapperEl.querySelectorAll('.fx-layer').forEach(n=>n.remove());
        const rect = wrapperEl.getBoundingClientRect();
        const W = rect.width || 600;
        const H = rect.height || 200;

        const rand = (min, max) => Math.random() * (max - min) + min;
        const randInt = (min, max) => Math.floor(rand(min, max + 1));
        const px = v => v + 'px';
        const pct = v => v + '%';

        if (customization.starEnabled) {
          const layer = global.document.createElement('div');
          layer.className = 'fx-layer fx-stars';
          layer.style.setProperty('--star-color', customization.starColor || '#ffffff');
          layer.style.setProperty('--star-speed', (customization.starFrequency || 2) + 's');
          const count = clamp(parseInt(customization.starDensity||0,10)||0, 0, 1000);
          for (let i=0; i<count; i++){
            const e = global.document.createElement('span');
            e.className = 'fx-star';
            const size = rand(1, 2.5);
            const x = rand(0, 100);
            const y = rand(0, 100);
            e.style.width = px(size);
            e.style.height = px(size);
            e.style.left = pct(x);
            e.style.top = pct(y);
            e.style.animationDelay = rand(0, customization.starFrequency||2) + 's';
            layer.appendChild(e);
          }
          wrapperEl.appendChild(layer);
        }

        if (customization.sparkleEnabled) {
          const layer = global.document.createElement('div');
          layer.className = 'fx-layer fx-sparkles';
          layer.style.setProperty('--sparkle-color', customization.sparkleColor || '#ffd966');
          const speed = customization.sparkleFrequency || 2;
          const dir = customization.sparkleDirection === 'up' ? 'up' : 'down';
          const count = clamp(parseInt(customization.sparkleDensity||0,10)||0, 0, 1000);
          for (let i=0; i<count; i++){
            const e = global.document.createElement('span');
            e.className = 'fx-sparkle' + (customization.sparkleGlow ? ' glow' : '');
            const size = rand(2, 3.5);
            const x = rand(0, 100);
            const delay = rand(0, speed);
            e.style.width = px(size);
            e.style.height = px(size);
            e.style.left = pct(x);
            e.style.top = dir === 'down' ? '-5%' : '105%';
            e.style.animationDuration = speed + 's';
            e.style.animationName = dir === 'down' ? 'sparkleDown' : 'sparkleUp';
            e.style.animationDelay = delay + 's';
            e.style.animationIterationCount = 'infinite';
            e.style.animationTimingFunction = 'linear';
            layer.appendChild(e);
          }
          wrapperEl.appendChild(layer);
        }

        if (customization.petalEnabled) {
          const layer = global.document.createElement('div');
          layer.className = 'fx-layer fx-petals';
          const speed = customization.petalFrequency || 5;
          const count = clamp(parseInt(customization.petalDensity||0,10)||0, 0, 1000);
          for (let i=0; i<count; i++){
            const e = global.document.createElement('span');
            e.className = 'fx-petal';
            const x = rand(0, 100);
            const delay = rand(0, speed);
            const rot = rand(-30, 30);
            e.style.left = pct(x);
            e.style.top = '-10%';
            e.style.animationDuration = speed + 's';
            e.style.animationDelay = delay + 's';
            e.style.transform = 'rotate(' + rot + 'deg)';
            if (customization.petalIconMode === 'url' && customization.petalIconUrl){
              const img = global.document.createElement('img');
              img.src = customization.petalIconUrl;
              img.alt = '';
              e.appendChild(img);
            } else {
              const svg = Utils.getBuiltinIconSVG ? Utils.getBuiltinIconSVG(customization.petalIconBuiltin || 'leaf', 18, customization.secondaryColor || '#ffffff') : '';
              e.innerHTML = svg;
            }
            layer.appendChild(e);
          }
          wrapperEl.appendChild(layer);
        }
      } catch (err) {
        try { console.warn('[fx] renderFxLayers error', err); } catch(_e){}
      }
    }

    function applyAnimation(wrapper, customization, enterAnim, loopAnim, animSpeed, animIntensity){
      customization = customization || State.customization || {};
      try {
        if (!wrapper) return;
        wrapper.style.setProperty('--anim-speed', `${(isFinite(animSpeed) ? animSpeed : (State.animSpeed || 1))}s`);
        wrapper.style.setProperty('--anim-intensity', `${(isFinite(animIntensity) ? animIntensity : (State.animIntensity || 0.7))}`);
        const a = (customization.glowColorA && customization.glowColorA.trim()) ? customization.glowColorA : (customization.primaryColor || '#85a6f8');
        const b = (customization.glowColorB && customization.glowColorB.trim()) ? customization.glowColorB : (customization.secondaryColor || '#95b3e8');
        const gs = (typeof customization.glowSpeed === 'number' ? customization.glowSpeed : 1.0);
        wrapper.style.setProperty('--glow-color-a', a);
        wrapper.style.setProperty('--glow-color-b', b);
        wrapper.style.setProperty('--glow-speed', `${gs}s`);

        wrapper.classList.remove('anim-none','anim-fade-in','anim-slide-up','anim-pulse','anim-neon-glow','anim-shimmer','anim-tilt-3d','anim-breathe','anim-gloss');
        const enterMap = { none:'', fade:'anim-fade-in', slide:'anim-slide-up' };
        const loopMap  = { none:'', pulse:'anim-pulse', neon:'anim-neon-glow', shimmer:'anim-shimmer', tilt3d:'anim-tilt-3d', breathe:'anim-breathe', gloss:'anim-gloss' };
        const enterCls = enterMap[(enterAnim || State.currentEnterAnimation || 'none')] || '';
        const loopCls  = loopMap[(loopAnim || State.currentLoopAnimation || 'none')] || '';
        if (enterCls) wrapper.classList.add(enterCls);
        if (loopCls)  wrapper.classList.add(loopCls);
      } catch(_e){}
    }

    function renderPreview(){
      console.log('[DEBUG renderPreview] Called');
      console.trace('[DEBUG renderPreview] call stack');
      const container = ensureContainer();
      if (!container) return;

      // unified VM from Ny.State to avoid duplicate defaults/derived computations
      const vm = (State && typeof State.getViewModel === 'function') ? State.getViewModel() : null;
      const theme = vm ? vm.theme : (State.currentTheme || 'theme-mystic-noir');
      const title = vm ? vm.title : (State.currentTitle || '角色状态');
      const items = State.items || [];
      const customization = State.customization || {};

      const headerHTML = getHeaderHTML2(theme, title, customization);
      try { console.log('[dbg] renderPreview headerHTML', { empty: headerHTML === '', titleEnabled: customization ? customization.titleEnabled : undefined }); } catch(_eLog){}
      const itemsHTML = buildItemsHTML(items, theme, customization);

      let bodyStyle = '';

      // background layers/components come from VM when in layers mode
      const bgMode = vm ? (vm.background && vm.background.mode) : (customization.bgMode || 'theme');
      const bgLayersHTML = (bgMode === 'layers') ? buildBgLayersHTML((vm && vm.background && vm.background.layers) || customization.bgLayers, customization) : '';
      const bgCompsHTML = (bgMode === 'layers') ? buildBgComponentsHTML((vm && vm.background && vm.background.components) || customization.bgComponents) : '';

      const wrapperClass = vm ? vm.wrapper.className : (`status-preview-wrapper ${theme} percent-style-${customization.percentDisplay || 'center'}`);
      const wrapperStyle = vm ? vm.wrapper.styleInline : '';

      const html = `
        <div class="${wrapperClass}" style="${wrapperStyle}">
          ${bgLayersHTML}
          ${bgCompsHTML}
          ${headerHTML}
          <div class="st-body" style="${bodyStyle}">
            ${itemsHTML}
          </div>
        </div>
      `;
      container.innerHTML = html;
      const wrapper = container.querySelector('.status-preview-wrapper');

      try {
        const itemNodes = wrapper ? wrapper.querySelectorAll('.st-body .st-item') : [];
        let __idx = 0;
        (Array.isArray(items) ? items : []).forEach(it => {
          if (it.type === 'divider') return;
          const el = itemNodes[__idx++];
          if (!el) return;
          const valEl = el.querySelector('.st-value');
          if (isFinite(it.itemOffsetPct)) el.style.setProperty('--item-offset-pct', clamp(parseFloat(it.itemOffsetPct) || 0, -40, 40));
          if (isFinite(it.itemOffsetRightPct)) el.style.setProperty('--item-offset-right-pct', clamp(parseFloat(it.itemOffsetRightPct) || 0, -40, 40));
          if (valEl) {
            if (isFinite(it.vbWidthPct)) valEl.style.setProperty('--vb-width-pct', clamp(parseFloat(it.vbWidthPct) || 100, 40, 100));
            if (isFinite(it.vbOffsetPct)) {
              const __v = clamp(parseFloat(it.vbOffsetPct) || 0, -40, 40);
              valEl.style.setProperty('--vb-offset-pct', __v);
              valEl.style.setProperty('--vb-offset-pct-pos', Math.max(0, __v));
              valEl.style.setProperty('--vb-offset-pct-neg', Math.min(0, __v));
            }
          }
          (function applyCardBgShadow(){
            try {
              const pickStr = (a, b) => {
                const s = (a == null ? '' : String(a)).trim();
                return s ? s : (b == null ? '' : String(b));
              };
              const pickNum = (a, b, def) => {
                if (isFinite(a)) return Number(a);
                if (isFinite(b)) return Number(b);
                return def;
              };

              let mode = customization.itemCardBgMode || 'theme';
              let color = customization.itemCardBgColor || '#111215';
              let gStart = customization.itemCardGradStart || customization.primaryColor;
              let gEnd = customization.itemCardGradEnd || customization.secondaryColor;
              let gAngle = Number(customization.itemCardGradAngle ?? 135) || 135;
              let imgUrl = customization.itemCardBgImageUrl || '';
              let url = customization.itemCardBgUrl || '';

              if (customization.itemCardPerItemEnabled) {
                // Per-item overrides: mode and related fields (align with global selections)
                if (it.cardBgMode && String(it.cardBgMode) !== 'inherit') {
                  mode = String(it.cardBgMode);
                }
                if (mode === 'color') {
                  color = pickStr(it.cardBgColor, color);
                } else if (mode === 'gradient') {
                  gStart = pickStr(it.cardGradStart, gStart);
                  gEnd = pickStr(it.cardGradEnd, gEnd);
                  gAngle = pickNum(it.cardGradAngle, gAngle, 135) || 135;
                } else if (mode === 'image') {
                  imgUrl = pickStr(it.cardBgImageUrl, imgUrl);
                } else if (mode === 'url') {
                  url = pickStr((it.cardBgUrl != null ? it.cardBgUrl : it.cardUrl), url);
                }
                // theme/none: no additional fields required
              }

              el.style.background = '';
              el.style.backgroundImage = '';
              el.style.backgroundSize = '';
              el.style.backgroundPosition = '';
              el.style.backgroundRepeat = '';
              if (mode === 'none') {
                el.style.background = 'transparent';
              } else if (mode === 'color') {
                el.style.background = color;
              } else if (mode === 'gradient') {
                el.style.background = `linear-gradient(${gAngle}deg, ${gStart}, ${gEnd})`;
              } else if (mode === 'image') {
                if (imgUrl && imgUrl.trim()) {
                  el.style.backgroundImage = `url('${esc(imgUrl)}')`;
                  el.style.backgroundSize = 'cover';
                  el.style.backgroundPosition = 'center';
                  el.style.backgroundRepeat = 'no-repeat';
                }
              } else if (mode === 'url') {
                if (url && url.trim()) {
                  el.style.backgroundImage = `url('${esc(url)}')`;
                  el.style.backgroundSize = 'cover';
                  el.style.backgroundPosition = 'center';
                  el.style.backgroundRepeat = 'no-repeat';
                }
              }
              let shadowOn = !!customization.itemCardShadowEnabled;
              let shadowStrength = Number(customization.itemCardShadowStrength || 0.30);
              if (customization.itemCardPerItemEnabled) {
                if (it.cardShadowEnable != null) shadowOn = !!it.cardShadowEnable;
                if (isFinite(it.cardShadowStrength)) shadowStrength = Number(it.cardShadowStrength);
              }
              if (shadowOn) {
                const s = Math.max(0, Math.min(1, shadowStrength));
                const y = (4 + 8 * s).toFixed(1);
                const blur = (10 + 18 * s).toFixed(1);
                el.style.boxShadow = `0 ${y}px ${blur}px rgba(0,0,0,${0.2 + 0.3*s})`;
              } else {
                el.style.boxShadow = '';
              }
            } catch (_e) {}
          })();
        });
        try {
          const snap = (State.snapshot ? State.snapshot() : []);
          const coh = Utils.computeCoherence ? Utils.computeCoherence({
            theme,
            primaryColor: customization.primaryColor,
            secondaryColor: customization.secondaryColor,
            letterSpacing: customization.letterSpacing,
            lineHeight: customization.lineHeight,
            animationType: State.currentAnimation || 'none'
          }) : 0.5;
          console.log('[Ny.Render] per-item overrides applied', items.map(it => ({ id: it.id, vbWidthPct: it.vbWidthPct, vbOffsetPct: it.vbOffsetPct, itemOffsetPct: it.itemOffsetPct, itemOffsetRightPct: it.itemOffsetRightPct, cardUrl: it.cardUrl, cardShadowEnable: it.cardShadowEnable, cardShadowStrength: it.cardShadowStrength })));
          console.log('[Ny.Render] preview', {
            theme,
            layout: customization.layout,
            fontFamily: customization.fontFamily,
            barStyle: customization.barStyle,
            barAnimation: customization.barAnimation,
            animation: State.currentAnimation,
            animSpeed: State.animSpeed,
            animIntensity: State.animIntensity,
            coherence: coh,
            items: snap
          });
        } catch(_e){}
      } catch (e) {
        try {
          console.warn('[Ny.Render] preview error', e);
          if (container) container.innerHTML = '<div style="color:#ff8080;padding:12px;border:1px solid #ff8080;border-radius:6px;background:rgba(255,0,0,.06);">预览失败，已加载降级视图。打开控制台查看详情。</div>';
        } catch(_e){}
      }

      if (customization.bgMode === 'layers') {
        // 渲染后自动初始化：确保停靠提示与拖拽启用（兼容 Ny.Background 与 window.* 别名）
        try {
          if (global.Ny && global.Ny.Background && typeof global.Ny.Background.ensureBgDock === 'function') {
            global.Ny.Background.ensureBgDock();
          } else if (typeof global.ensureBgDock === 'function') {
            global.ensureBgDock();
          }
        } catch(_e){}
        try {
          if (wrapper && global.Ny && global.Ny.Background && typeof global.Ny.Background.setupBgComponentDrag === 'function') {
            global.Ny.Background.setupBgComponentDrag(wrapper);
          } else if (wrapper && typeof global.setupBgComponentDrag === 'function') {
            global.setupBgComponentDrag(wrapper);
          }
        } catch(_e){}
      }

      if (wrapper) {
        wrapper.style.height = '';
        wrapper.style.overflow = '';
      }
      renderFxLayers(wrapper, customization);
      applyAnimation(wrapper, customization, State.currentEnterAnimation, State.currentLoopAnimation, State.animSpeed, State.animIntensity);

      try {
        const nodes = wrapper?.querySelectorAll('.st-longtext[data-effect="typewriter"]');
        nodes?.forEach(el => {
          const full = el.textContent || '';
          el.textContent = '';
          const spd = Math.max(5, Math.min(200, parseInt(el.getAttribute('data-tw-speed') || '18', 10) || 18));
          const delay = Math.max(0, parseInt(el.getAttribute('data-tw-delay') || '0', 10) || 0);
          const caretOn = (el.getAttribute('data-tw-caret') !== '0');
          let i = 0;
          let timer;
          const tick = function(){
            if (i >= full.length) { el.textContent = full; return; }
            i++;
            if (caretOn && i < full.length) {
              el.textContent = full.slice(0, i) + '▌';
            } else {
              el.textContent = full.slice(0, i);
            }
            timer = global.setTimeout(tick, spd);
          };
          global.setTimeout(tick, delay);
        });
      } catch (_e) {}
    }

    return {
      mount,
      renderPreview,
      applyAnimation,
      getHeaderHTML2,
      dividerHTML,
      buildItemsHTML,
      renderFxLayers
    };
  })();
})(typeof window !== 'undefined' ? window : globalThis);
// Reactive bridge: keep preview and export consistent with state changes
(function(global){
  'use strict';
  try{
    var rafId = 0;
    var isInitialLoad = true; // 标记是否为初始加载
    
    function schedule(options){
      var opts = options || {};
      var skipExport = opts.skipExport || false;
      console.log('[DEBUG schedule] Called - scheduling render via RAF, skipExport:', skipExport);
      try { if (rafId) global.cancelAnimationFrame(rafId); } catch(_e){}
      try {
        rafId = global.requestAnimationFrame(function(){
          console.log('[DEBUG RAF callback] Executing scheduled render, skipExport:', skipExport);
          rafId = 0;
          try {
            if (global.Ny && global.Ny.Render && typeof global.Ny.Render.renderPreview === 'function') {
              global.Ny.Render.renderPreview();
            }
          } catch(_e){
            console.error('[DEBUG RAF callback] renderPreview error:', _e);
          }
          // 只在非初始加载且未明确跳过时才调用 refreshOutputs
          if (!skipExport) {
            try {
              if (global.Ny && global.Ny.Export && typeof global.Ny.Export.refreshOutputs === 'function') {
                console.log('[DEBUG RAF callback] Calling refreshOutputs');
                global.Ny.Export.refreshOutputs(false, { inlineGroup: true });
              }
            } catch(_e){
              console.error('[DEBUG RAF callback] refreshOutputs error:', _e);
            }
          } else {
            console.log('[DEBUG RAF callback] Skipping refreshOutputs (skipExport=true)');
          }
        });
      } catch(_e){
        // Fallback if RAF not available
        try {
          if (global.Ny && global.Ny.Render && typeof global.Ny.Render.renderPreview === 'function') {
            global.Ny.Render.renderPreview();
          }
          if (!skipExport && global.Ny && global.Ny.Export && typeof global.Ny.Export.refreshOutputs === 'function') {
            global.Ny.Export.refreshOutputs(false, { inlineGroup: true });
          }
        } catch(__e){}
      }
    }
    // Render/Export react to any state change from left-side controls
    global.addEventListener('ny:state-change', function(){ schedule(); }, false);
    // Initial render is handled by HTML inline code
    // Disabling this load event listener to avoid state reset and UI corruption
    /*
    global.addEventListener('load', function(){
      try {
        console.log('[DEBUG load event] Triggered - skipping state initialization, only rendering');
        
        // 不再调用 applyThemeDefaults，因为：
        // 1. HTML 内联代码已经完成了初始化和首次渲染
        // 2. 调用 applyThemeDefaults 会重置状态，导致 UI 显示错误
        // 3. 仅在用户切换主题时才应该调用 applyThemeDefaults

        // 等待字体就绪后再触发一次渲染，确保字体加载完成
        // 初始加载时跳过 refreshOutputs，避免不必要的导出操作和 CORS 错误
        var f = global.document && global.document.fonts;
        if (f && typeof f.ready === 'object' && typeof f.ready.then === 'function') {
          f.ready.then(function(){ 
            console.log('[DEBUG load event] Fonts ready, scheduling render');
            schedule({ skipExport: true }); 
            isInitialLoad = false;
          });
        } else {
          console.log('[DEBUG load event] Fonts API not available, scheduling render immediately');
          schedule({ skipExport: true });
          isInitialLoad = false;
        }
      } catch(_e){
        schedule({ skipExport: true });
        isInitialLoad = false;
      }
    }, false);
    */
  } catch(_e){}
})(typeof window !== 'undefined' ? window : globalThis);