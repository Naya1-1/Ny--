(function (window, document) {
  'use strict';

  // Ny.Background: implements background layers/components rendering, editors, drag helpers, and compatibility aliases
  var Ny = window.Ny = window.Ny || {};

  Ny.Background = Ny.Background || (function () {
    var initialized = false;
    var eventsBound = false;

    // Utils bridges
    function esc(s) {
      try { return (Ny.Utils && Ny.Utils.esc) ? Ny.Utils.esc(s) : String(s == null ? '' : s); }
      catch (_e) { return String(s == null ? '' : s); }
    }
    function clamp(n, min, max) {
      try { return (Ny.Utils && Ny.Utils.clamp) ? Ny.Utils.clamp(n, min, max) : Math.max(min, Math.min(max, n)); }
      catch (_e) { return Math.max(min, Math.min(max, n)); }
    }
    function genId() {
      try { return (Ny.Utils && Ny.Utils.genId) ? Ny.Utils.genId() : ('it_' + Math.random().toString(36).slice(2, 9)); }
      catch (_e) { return 'it_' + Math.random().toString(36).slice(2, 9); }
    }

    function getCustomization(fallback) {
      var C = (Ny.State && Ny.State.customization) ? Ny.State.customization : (fallback || {});
      return C || {};
    }

    // Build background layers HTML (color/gradient/image)
    function buildLayersHTML(layers, customization) {
      customization = customization || getCustomization();
      try {
        var L = Array.isArray(layers) ? layers : [];
        if (!L.length) return '';
        var html = L.map(function (l) {
          var op = isFinite(l && l.opacity) ? Math.max(0, Math.min(1, Number(l.opacity))) : 1;
          if (l && l.type === 'color') {
            var color = esc(l.color || '#000000');
            return '<div class="bg-layer" style="background:' + color + ';opacity:' + op + ';"></div>';
          }
          if (l && l.type === 'gradient') {
            var style = String(l.style || 'linear');
            var angle = Number(l.angle == null ? 135 : l.angle) || 135;
            var dir = String(l.direction || 'to bottom right');
            var start = esc(l.start || customization.primaryColor || '#6a717c');
            var end = esc(l.end || customization.secondaryColor || '#97aec8');
            var grad;
            if (style === 'linear') {
              grad = 'linear-gradient(' + angle + 'deg, ' + start + ', ' + end + ')';
            } else if (style === 'radial') {
              var posR = dir.replace(/^to\s+/, '');
              grad = 'radial-gradient(at ' + posR + ', ' + start + ', ' + end + ')';
            } else if (style === 'conic') {
              var posC = dir.replace(/^to\s+/, '');
              grad = 'conic-gradient(from ' + angle + 'deg at ' + posC + ', ' + start + ', ' + end + ')';
            } else {
              grad = 'linear-gradient(' + angle + 'deg, ' + start + ', ' + end + ')';
            }
            return '<div class="bg-layer" style="background:' + grad + ';opacity:' + op + ';"></div>';
          }
          // image
          var src = esc((l && l.src) || '');
          var size = esc((l && l.size) || 'cover');
          var pos = esc((l && l.position) || 'center');
          var rep = esc((l && l.repeat) || 'no-repeat');
          return '<div class="bg-layer" style="background-image:url(\'' + src + '\');background-size:' + size + ';background-position:' + pos + ';background-repeat:' + rep + ';opacity:' + op + ';"></div>';
        }).join('');
        return '<div class="bg-layers">' + html + '</div>';
      } catch (_e) { return ''; }
    }

    // Extra style for components (crop + multiple effects)
    function __compExtraStyle(c, customization) {
      customization = customization || getCustomization();
      try {
        var crop = (c && c.crop) ? c.crop : { top: 0, right: 0, bottom: 0, left: 0 };
        var t = Math.max(0, Math.min(50, Number(crop.top || 0)));
        var r = Math.max(0, Math.min(50, Number(crop.right || 0)));
        var b = Math.max(0, Math.min(50, Number(crop.bottom || 0)));
        var l = Math.max(0, Math.min(50, Number(crop.left || 0)));
        var css = '';

        if (t || r || b || l) {
          css += 'clip-path: inset(' + t + '% ' + r + '% ' + b + '% ' + l + '%);';
        }

        var effs = (c && c.effects) || {};
        var col = customization.primaryColor || '#ffffff';
        var filters = [];

        // Rounded corners
        if (effs.rounded && isFinite(effs.roundedRadius)) {
          css += 'border-radius:' + Math.max(0, Number(effs.roundedRadius)) + 'px;';
        }

        // Glow
        if (effs.glow && isFinite(effs.glowStrength)) {
          var blur = (Math.max(0, Number(effs.glowStrength)) * 0.4 + 6).toFixed(1);
          filters.push('drop-shadow(0 0 ' + blur + 'px ' + col + ')');
        }

        // Shadow
        if (effs.shadow) {
          filters.push('drop-shadow(0 6px 16px rgba(0,0,0,.35))');
        }

        if (filters.length > 0) {
          css += 'filter: ' + filters.join(' ') + ';';
        }

        // Feather (mask)
        if (effs.feather && isFinite(effs.featherStrength)) {
          var s = Math.max(0, Math.min(50, Number(effs.featherStrength)));
          var inner = Math.max(60, 98 - s);
          var mask = 'radial-gradient(circle at 50% 50%, #000 ' + inner + '%, transparent 100%)';
          css += '-webkit-mask-image:' + mask + ';mask-image:' + mask + ';';
        }

        return css;
      } catch (_e) { return ''; }
    }

    // Build background components HTML (with extra styles)
    function buildComponentsHTML(components, customization) {
      customization = customization || getCustomization();
      try {
        var C = Array.isArray(components) ? components : [];
        if (!C.length) return '';
        var html = C.filter(function (c) { return c && c.visible !== false; }).map(function (c) {
          var id = esc(c.id || genId());
          var src = esc(c.src || '');
          var x = isFinite(c.x) ? Math.max(0, Math.min(100, Number(c.x))) : 50;
          var y = isFinite(c.y) ? Math.max(0, Math.min(100, Number(c.y))) : 50;
          var w = isFinite(c.w) ? Math.max(2, Math.min(100, Number(c.w))) : 20;
          var op = isFinite(c.opacity) ? Math.max(0, Math.min(1, Number(c.opacity))) : 1;
          var extra = __compExtraStyle(c, customization);
          return '<img class="bg-comp" data-id="' + id + '" src="' + src + '" alt="" style="left:' + x + '%;top:' + y + '%;width:' + w + '%;opacity:' + op + ';' + extra + '">';
        }).join('');
        return '<div class="bg-components-layer">' + html + '</div>';
      } catch (_e) { return ''; }
    }

    // Render background layers editor into #bg-layers-list
    function renderBgLayersEditor() {
      try {
        var list = document.getElementById('bg-layers-list');
        if (!list) return;
        var customization = getCustomization();
        var layers = customization.bgLayers || [];
        list.innerHTML = layers.map(function (l, i) {
          var idx = i + 1;
          var typeTitle = (l.type === 'color' ? '颜色' : (l.type === 'gradient' ? '渐变' : '图片'));
          var angleVal = isFinite(l.angle) ? Number(l.angle) : 135;
          var opacityVal = isFinite(l.opacity) ? Number(l.opacity) : 1;
          var base = ''
            + '<div class="item-controls" data-layer-id="' + esc(l.id || '') + '">'
            + '  <div class="item-header">'
            + '    <span>' + idx + '. 图层 - ' + typeTitle + '</span>'
            + '    <div class="item-actions" style="display:flex; gap:6px;">'
            + '      <button class="btn" data-action="layer-up" title="上移">⬆</button>'
            + '      <button class="btn" data-action="layer-down" title="下移">⬇</button>'
            + '      <button class="btn btn-delete" data-action="layer-del" title="删除">✕</button>'
            + '    </div>'
            + '  </div>';
          if (l.type === 'color') {
            base += ''
              + '  <div class="control-group">'
              + '    <label>颜色</label>'
              + '    <input type="color" value="' + esc(l.color || '#000000') + '" data-field="layer-color">'
              + '  </div>';
          } else if (l.type === 'gradient') {
            base += ''
              + '  <div class="control-group">'
              + '    <label>样式</label>'
              + '    <select data-field="layer-style">'
              + '      <option value="linear"' + ((l.style || 'linear') === 'linear' ? ' selected' : '') + '>线性</option>'
              + '      <option value="radial"' + ((l.style || 'linear') === 'radial' ? ' selected' : '') + '>径向</option>'
              + '      <option value="conic"' + ((l.style || 'linear') === 'conic' ? ' selected' : '') + '>锥形</option>'
              + '    </select>'
              + '  </div>'
              + '  <div class="control-group">'
              + '    <label>角度</label>'
              + '    <div class="range-row">'
              + '      <input type="range" min="0" max="360" step="1" value="' + angleVal + '" data-field="layer-angle">'
              + '      <span class="value-pill"><span>' + angleVal + '</span>°</span>'
              + '    </div>'
              + '  </div>'
              + '  <div class="control-group">'
              + '    <label>方向 / 位置</label>'
              + '    <select data-field="layer-direction" style="width:100%;">'
              + '      <option value="center"' + ((l.direction || 'to bottom right') === 'center' ? ' selected' : '') + '>中心</option>'
              + '      <option value="top"' + ((l.direction || 'to bottom right') === 'top' ? ' selected' : '') + '>上</option>'
              + '      <option value="bottom"' + ((l.direction || 'to bottom right') === 'bottom' ? ' selected' : '') + '>下</option>'
              + '      <option value="left"' + ((l.direction || 'to bottom right') === 'left' ? ' selected' : '') + '>左</option>'
              + '      <option value="right"' + ((l.direction || 'to bottom right') === 'right' ? ' selected' : '') + '>右</option>'
              + '      <option value="top left"' + ((l.direction || 'to bottom right') === 'top left' ? ' selected' : '') + '>左上</option>'
              + '      <option value="top right"' + ((l.direction || 'to bottom right') === 'top right' ? ' selected' : '') + '>右上</option>'
              + '      <option value="bottom left"' + ((l.direction || 'to bottom right') === 'bottom left' ? ' selected' : '') + '>左下</option>'
              + '      <option value="bottom right"' + ((l.direction || 'to bottom right') === 'bottom right' ? ' selected' : '') + '>右下</option>'
              + '      <option value="to top"' + ((l.direction || 'to bottom right') === 'to top' ? ' selected' : '') + '>线性：向上</option>'
              + '      <option value="to bottom"' + ((l.direction || 'to bottom right') === 'to bottom' ? ' selected' : '') + '>线性：向下</option>'
              + '      <option value="to left"' + ((l.direction || 'to bottom right') === 'to left' ? ' selected' : '') + '>线性：向左</option>'
              + '      <option value="to right"' + ((l.direction || 'to bottom right') === 'to right' ? ' selected' : '') + '>线性：向右</option>'
              + '      <option value="to top left"' + ((l.direction || 'to bottom right') === 'to top left' ? ' selected' : '') + '>线性：左上</option>'
              + '      <option value="to top right"' + ((l.direction || 'to bottom right') === 'to top right' ? ' selected' : '') + '>线性：右上</option>'
              + '      <option value="to bottom left"' + ((l.direction || 'to bottom right') === 'to bottom left' ? ' selected' : '') + '>线性：左下</option>'
              + '      <option value="to bottom right"' + ((l.direction || 'to bottom right') === 'to bottom right' ? ' selected' : '') + '>线性：右下</option>'
              + '    </select>'
              + '  </div>'
              + '  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">'
              + '    <div class="control-group">'
              + '      <label>起色</label>'
              + '      <input type="color" value="' + esc(l.start || customization.primaryColor || '#6a717c') + '" data-field="layer-start">'
              + '    </div>'
              + '    <div class="control-group">'
              + '      <label>终色</label>'
              + '      <input type="color" value="' + esc(l.end || customization.secondaryColor || '#97aec8') + '" data-field="layer-end">'
              + '    </div>'
              + '  </div>';
          } else {
            // image
            base += ''
              + '  <div class="control-group">'
              + '    <label>图片 URL</label>'
              + '    <input type="text" value="' + esc(l.src || '') + '" placeholder="https://..." data-field="layer-src">'
              + '  </div>';
          }
          base += ''
            + '  <div class="control-group">'
            + '    <label>透明度</label>'
            + '    <div class="range-row">'
            + '      <input type="range" min="0" max="1" step="0.05" value="' + opacityVal + '" data-field="layer-opacity">'
            + '      <span class="value-pill"><span>' + (isFinite(opacityVal) ? opacityVal.toFixed(2) : '1.00') + '</span></span>'
            + '    </div>'
            + '  </div>'
            + '</div>';
          return base;
        }).join('');
      } catch (_e) { }
    }

    // Render background components editor into #bg-components-list (includes advanced controls)
    function renderBgComponentsEditor() {
      try {
        var list = document.getElementById('bg-components-list');
        if (!list) return;
        var customization = getCustomization();
        var comps = customization.bgComponents || [];
        list.innerHTML = comps.map(function (c, i) {
          var idx = i + 1;
          var w = isFinite(c.w) ? Number(c.w) : 20;
          var op = isFinite(c.opacity) ? Number(c.opacity) : 1;
          var vis = (c.visible !== false);
          var locked = !!c.locked;

          // Ensure default structures
          c.crop = c.crop || { top: 0, right: 0, bottom: 0, left: 0 };
          ['top', 'right', 'bottom', 'left'].forEach(function (k) { if (!isFinite(c.crop[k])) c.crop[k] = 0; });

          c.effects = c.effects || {};
          if (!isFinite(c.effects.roundedRadius)) c.effects.roundedRadius = 0;
          if (!isFinite(c.effects.glowStrength)) c.effects.glowStrength = 0;
          if (!isFinite(c.effects.featherStrength)) c.effects.featherStrength = 0;
          c.effects.rounded = !!c.effects.rounded;
          c.effects.glow = !!c.effects.glow;
          c.effects.shadow = !!c.effects.shadow;
          c.effects.feather = !!c.effects.feather;

          var html = ''
            + '<div class="item-controls" data-comp-id="' + esc(c.id || '') + '">'
            + '  <div class="item-header">'
            + '    <span>' + idx + '. 组件</span>'
            + '    <div class="item-actions" style="display:flex; gap:6px;">'
            + '      <label style="display:flex;align-items:center;gap:4px;font-size:12px;"><input type="checkbox" data-field="comp-visible" ' + (vis ? 'checked' : '') + '>显示</label>'
            + '      <label style="display:flex;align-items:center;gap:4px;font-size:12px;"><input type="checkbox" data-field="comp-locked" ' + (locked ? 'checked' : '') + '>锁定</label>'
            + '      <button class="btn btn-delete" data-action="comp-del" title="删除">✕</button>'
            + '    </div>'
            + '  </div>'
            + '  <div class="control-group">'
            + '    <label>图片 URL</label>'
            + '    <input type="text" value="' + esc(c.src || '') + '" placeholder="https://..." data-field="comp-src">'
            + '  </div>'
            + '  <div class="control-group">'
            + '    <label>宽度(%)</label>'
            + '    <div class="range-row">'
            + '      <input type="range" min="2" max="100" step="1" value="' + w + '" data-field="comp-w">'
            + '      <span class="value-pill"><span>' + w + '</span>%</span>'
            + '    </div>'
            + '  </div>'
            + '  <div class="control-group">'
            + '    <label>透明度</label>'
            + '    <div class="range-row">'
            + '      <input type="range" min="0" max="1" step="0.05" value="' + op + '" data-field="comp-opacity">'
            + '      <span class="value-pill"><span>' + op.toFixed(2) + '</span></span>'
            + '    </div>'
            + '  </div>'
            + '  <div class="comp-adv-controls" style="margin-top:10px; border-top:1px dashed var(--border-color); padding-top:10px;">'
            + '    <div class="control-group">'
            + '      <label>裁剪(%)</label>'
            + '      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">'
            + '        <div style="display:flex;align-items:center;gap:4px;">'
            + '          <label style="color:var(--text-secondary);font-size:11px;min-width:16px;">上</label>'
            + '          <input type="number" min="0" max="50" step="1" value="' + c.crop.top + '" data-field="comp-crop-top" style="width:46px;padding:4px 6px;border:1px solid var(--border-color);border-radius:4px;background:var(--bg-control);color:var(--text-primary);font-size:12px;text-align:center;">'
            + '        </div>'
            + '        <div style="display:flex;align-items:center;gap:4px;">'
            + '          <label style="color:var(--text-secondary);font-size:11px;min-width:16px;">右</label>'
            + '          <input type="number" min="0" max="50" step="1" value="' + c.crop.right + '" data-field="comp-crop-right" style="width:46px;padding:4px 6px;border:1px solid var(--border-color);border-radius:4px;background:var(--bg-control);color:var(--text-primary);font-size:12px;text-align:center;">'
            + '        </div>'
            + '        <div style="display:flex;align-items:center;gap:4px;">'
            + '          <label style="color:var(--text-secondary);font-size:11px;min-width:16px;">下</label>'
            + '          <input type="number" min="0" max="50" step="1" value="' + c.crop.bottom + '" data-field="comp-crop-bottom" style="width:46px;padding:4px 6px;border:1px solid var(--border-color);border-radius:4px;background:var(--bg-control);color:var(--text-primary);font-size:12px;text-align:center;">'
            + '        </div>'
            + '        <div style="display:flex;align-items:center;gap:4px;">'
            + '          <label style="color:var(--text-secondary);font-size:11px;min-width:16px;">左</label>'
            + '          <input type="number" min="0" max="50" step="1" value="' + c.crop.left + '" data-field="comp-crop-left" style="width:46px;padding:4px 6px;border:1px solid var(--border-color);border-radius:4px;background:var(--bg-control);color:var(--text-primary);font-size:12px;text-align:center;">'
            + '        </div>'
            + '      </div>'
            + '    </div>'
            + '    <div class="control-group">'
            + '      <label>边缘特效（可多选）</label>'
            + '      <div style="display:grid;gap:8px;margin-top:6px;">'
            + '        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">'
            + '          <input type="checkbox" data-field="comp-effect-rounded" ' + (c.effects.rounded ? 'checked' : '') + '>'
            + '          <span>圆角</span>'
            + '        </label>'
            + '        <div style="margin-left:24px;display:' + (c.effects.rounded ? 'block' : 'none') + ';" data-role="comp-effect-rounded-param">'
            + '          <div class="range-row" style="gap:6px;">'
            + '            <label style="color:var(--text-secondary);font-size:11px;min-width:48px;">半径</label>'
            + '            <input type="range" min="0" max="50" step="1" value="' + c.effects.roundedRadius + '" data-field="comp-effect-rounded-radius" style="flex:1;">'
            + '            <span class="value-pill" style="min-width:48px;"><span>' + c.effects.roundedRadius + '</span>px</span>'
            + '          </div>'
            + '        </div>'
            + '        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">'
            + '          <input type="checkbox" data-field="comp-effect-glow" ' + (c.effects.glow ? 'checked' : '') + '>'
            + '          <span>发光</span>'
            + '        </label>'
            + '        <div style="margin-left:24px;display:' + (c.effects.glow ? 'block' : 'none') + ';" data-role="comp-effect-glow-param">'
            + '          <div class="range-row" style="gap:6px;">'
            + '            <label style="color:var(--text-secondary);font-size:11px;min-width:48px;">强度</label>'
            + '            <input type="range" min="0" max="50" step="1" value="' + c.effects.glowStrength + '" data-field="comp-effect-glow-strength" style="flex:1;">'
            + '            <span class="value-pill" style="min-width:48px;"><span>' + c.effects.glowStrength + '</span></span>'
            + '          </div>'
            + '        </div>'
            + '        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">'
            + '          <input type="checkbox" data-field="comp-effect-shadow" ' + (c.effects.shadow ? 'checked' : '') + '>'
            + '          <span>阴影</span>'
            + '        </label>'
            + '        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">'
            + '          <input type="checkbox" data-field="comp-effect-feather" ' + (c.effects.feather ? 'checked' : '') + '>'
            + '          <span>柔化边缘</span>'
            + '        </label>'
            + '        <div style="margin-left:24px;display:' + (c.effects.feather ? 'block' : 'none') + ';" data-role="comp-effect-feather-param">'
            + '          <div class="range-row" style="gap:6px;">'
            + '            <label style="color:var(--text-secondary);font-size:11px;min-width:48px;">强度</label>'
            + '            <input type="range" min="0" max="50" step="1" value="' + c.effects.featherStrength + '" data-field="comp-effect-feather-strength" style="flex:1;">'
            + '            <span class="value-pill" style="min-width:48px;"><span>' + c.effects.featherStrength + '</span></span>'
            + '          </div>'
            + '        </div>'
            + '      </div>'
            + '    </div>'
            + '  </div>'
            + '</div>';
          return html;
        }).join('');
      } catch (_e) { }
    }

    // Setup background editors events (idempotent, uses delegation)
    function setupBgEditorsEvents() {
      if (eventsBound) return;
      eventsBound = true;
      try {
        var customization = getCustomization();

        var btnAddColorLayer = document.getElementById('btn-add-color-layer');
        var btnAddGradientLayer = document.getElementById('btn-add-gradient-layer');
        var btnAddImageLayerUrl = document.getElementById('btn-add-image-layer-url');
        var bgLayersList = document.getElementById('bg-layers-list');

        var btnAddCompUrl = document.getElementById('btn-add-comp-url');
        var bgCompDragToggle = document.getElementById('bg-comp-drag-toggle');
        var bgComponentsList = document.getElementById('bg-components-list');

        // Add layer buttons
        if (btnAddColorLayer) btnAddColorLayer.addEventListener('click', function () {
          customization.bgLayers = customization.bgLayers || [];
          customization.bgLayers.push({ id: genId(), type: 'color', color: '#000000', opacity: 0.5 });
          renderBgLayersEditor(); if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
        });

        if (btnAddGradientLayer) btnAddGradientLayer.addEventListener('click', function () {
          customization.bgLayers = customization.bgLayers || [];
          customization.bgLayers.push({
            id: genId(),
            type: 'gradient',
            style: 'linear',
            angle: 135,
            direction: 'to bottom right',
            start: customization.bgGradientStart || customization.primaryColor || '#6a717c',
            end: customization.bgGradientEnd || customization.secondaryColor || '#97aec8',
            opacity: 1
          });
          renderBgLayersEditor(); if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
        });

        if (btnAddImageLayerUrl) btnAddImageLayerUrl.addEventListener('click', function () {
          var u = window.prompt('输入图片 URL:');
          if (!u) return;
          customization.bgLayers = customization.bgLayers || [];
          customization.bgLayers.push({ id: genId(), type: 'image', src: u, opacity: 1, size: 'cover', position: 'center', repeat: 'no-repeat' });
          renderBgLayersEditor(); if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
        });

        if (bgLayersList) {
          bgLayersList.addEventListener('click', function (e) {
            var root = e.target.closest('.item-controls'); if (!root) return;
            var id = root.getAttribute('data-layer-id');
            var i = (customization.bgLayers || []).findIndex(function (x) { return x.id === id; });
            if (i < 0) return;
            var actBtn = e.target.closest('button[data-action]');
            if (!actBtn) return;
            var act = actBtn.dataset.action;
            if (act === 'layer-del') customization.bgLayers.splice(i, 1);
            if (act === 'layer-up' && i > 0) {
              var tmp = customization.bgLayers[i - 1]; customization.bgLayers[i - 1] = customization.bgLayers[i]; customization.bgLayers[i] = tmp;
            }
            if (act === 'layer-down' && i < customization.bgLayers.length - 1) {
              var tmp2 = customization.bgLayers[i + 1]; customization.bgLayers[i + 1] = customization.bgLayers[i]; customization.bgLayers[i] = tmp2;
            }
            renderBgLayersEditor(); if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
          });

          bgLayersList.addEventListener('input', function (e) {
            var root = e.target.closest('.item-controls'); if (!root) return;
            var id = root.getAttribute('data-layer-id');
            var l = (customization.bgLayers || []).find(function (x) { return x.id === id; });
            if (!l) return;
            var field = e.target.dataset.field;
            if (!field) return;

            if (field === 'layer-color') l.color = e.target.value;
            if (field === 'layer-src') l.src = e.target.value;
            if (field === 'layer-style') l.style = e.target.value;
            if (field === 'layer-angle') {
              var v = parseInt(e.target.value || '135', 10);
              l.angle = Math.max(0, Math.min(360, isNaN(v) ? 135 : v));
              try {
                var pillA = e.target.closest('.range-row') && e.target.closest('.range-row').querySelector('.value-pill span');
                if (pillA) pillA.textContent = String(l.angle);
              } catch (_e) { }
            }
            if (field === 'layer-direction') l.direction = e.target.value;
            if (field === 'layer-start') l.start = e.target.value;
            if (field === 'layer-end') l.end = e.target.value;
            if (field === 'layer-opacity') {
              var ov = parseFloat(e.target.value || '1') || 0;
              l.opacity = Math.max(0, Math.min(1, ov));
              try {
                var pill = e.target.closest('.range-row') && e.target.closest('.range-row').querySelector('.value-pill span');
                if (pill) pill.textContent = l.opacity.toFixed(2);
              } catch (_e) { }
            }
            if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
          });
        }

        if (btnAddCompUrl) btnAddCompUrl.addEventListener('click', function () {
          var u = window.prompt('输入组件图片 URL:');
          if (!u) return;
          customization.bgComponents = customization.bgComponents || [];
          customization.bgComponents.push({ id: genId(), src: u, x: 50, y: 50, w: 20, opacity: 1, visible: true, locked: false, crop: { top: 0, right: 0, bottom: 0, left: 0 }, effects: {} });
          renderBgComponentsEditor(); if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
        });

        if (bgCompDragToggle) bgCompDragToggle.addEventListener('change', function (e) {
          customization.bgCompDrag = !!e.target.checked;
          ensureBgDock();
        });

        if (bgComponentsList) {
          bgComponentsList.addEventListener('click', function (e) {
            var root = e.target.closest('.item-controls'); if (!root) return;
            var id = root.getAttribute('data-comp-id');
            var i = (customization.bgComponents || []).findIndex(function (x) { return x.id === id; });
            if (i < 0) return;
            var btn = e.target.closest('button[data-action]');
            if (btn && btn.dataset.action === 'comp-del') {
              customization.bgComponents.splice(i, 1);
              renderBgComponentsEditor(); if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
            }
          });

          bgComponentsList.addEventListener('input', function (e) {
            var root = e.target.closest('.item-controls'); if (!root) return;
            var id = root.getAttribute('data-comp-id');
            var c = (customization.bgComponents || []).find(function (x) { return x.id === id; });
            if (!c) return;
            var field = e.target.dataset.field;
            if (!field) return;

            // Primitive fields
            if (field === 'comp-src') { c.src = e.target.value; if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview(); return; }
            if (field === 'comp-w') {
              c.w = clamp(parseInt(e.target.value || '20', 10) || 20, 2, 100);
              try {
                var pillW = e.target.closest('.range-row') && e.target.closest('.range-row').querySelector('.value-pill span');
                if (pillW) pillW.textContent = c.w;
              } catch (_e) { }
              if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview(); return;
            }
            if (field === 'comp-opacity') {
              var v = parseFloat(e.target.value || '1') || 1;
              c.opacity = Math.max(0, Math.min(1, v));
              try {
                var pillO = e.target.closest('.range-row') && e.target.closest('.range-row').querySelector('.value-pill span');
                if (pillO) pillO.textContent = c.opacity.toFixed(2);
              } catch (_e) { }
              if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview(); return;
            }

            // Visibility/lock toggles on input event (for number/range already handled)
            if (field === 'comp-visible') { c.visible = !!e.target.checked; if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview(); return; }
            if (field === 'comp-locked') { c.locked = !!e.target.checked; if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview(); return; }

            // Crop
            c.crop = c.crop || { top: 0, right: 0, bottom: 0, left: 0 };
            if (field === 'comp-crop-top') { c.crop.top = clamp(parseInt(e.target.value || '0', 10) || 0, 0, 50); if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview(); return; }
            if (field === 'comp-crop-right') { c.crop.right = clamp(parseInt(e.target.value || '0', 10) || 0, 0, 50); if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview(); return; }
            if (field === 'comp-crop-bottom') { c.crop.bottom = clamp(parseInt(e.target.value || '0', 10) || 0, 0, 50); if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview(); return; }
            if (field === 'comp-crop-left') { c.crop.left = clamp(parseInt(e.target.value || '0', 10) || 0, 0, 50); if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview(); return; }

            // Effects values (ranges)
            c.effects = c.effects || {};
            if (field === 'comp-effect-rounded-radius') {
              c.effects.roundedRadius = clamp(parseInt(e.target.value || '0', 10) || 0, 0, 200);
              try {
                var pillR = e.target.closest('.range-row') && e.target.closest('.range-row').querySelector('.value-pill span');
                if (pillR) pillR.textContent = c.effects.roundedRadius;
              } catch (_e) { }
              if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview(); return;
            }
            if (field === 'comp-effect-glow-strength') {
              c.effects.glowStrength = clamp(parseInt(e.target.value || '0', 10) || 0, 0, 50);
              try {
                var pillG = e.target.closest('.range-row') && e.target.closest('.range-row').querySelector('.value-pill span');
                if (pillG) pillG.textContent = c.effects.glowStrength;
              } catch (_e) { }
              if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview(); return;
            }
            if (field === 'comp-effect-feather-strength') {
              c.effects.featherStrength = clamp(parseInt(e.target.value || '0', 10) || 0, 0, 50);
              try {
                var pillF = e.target.closest('.range-row') && e.target.closest('.range-row').querySelector('.value-pill span');
                if (pillF) pillF.textContent = c.effects.featherStrength;
              } catch (_e) { }
              if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview(); return;
            }
          });

          bgComponentsList.addEventListener('change', function (e) {
            var root = e.target.closest('.item-controls'); if (!root) return;
            var id = root.getAttribute('data-comp-id');
            var c = (customization.bgComponents || []).find(function (x) { return x.id === id; });
            if (!c) return;
            var field = e.target.dataset.field;
            if (!field) return;

            c.effects = c.effects || {};

            if (field === 'comp-effect-rounded') {
              c.effects.rounded = !!e.target.checked;
              var paramDiv1 = root.querySelector('[data-role="comp-effect-rounded-param"]');
              if (paramDiv1) paramDiv1.style.display = c.effects.rounded ? 'block' : 'none';
              if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
            } else if (field === 'comp-effect-glow') {
              c.effects.glow = !!e.target.checked;
              var paramDiv2 = root.querySelector('[data-role="comp-effect-glow-param"]');
              if (paramDiv2) paramDiv2.style.display = c.effects.glow ? 'block' : 'none';
              if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
            } else if (field === 'comp-effect-shadow') {
              c.effects.shadow = !!e.target.checked;
              if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
            } else if (field === 'comp-effect-feather') {
              c.effects.feather = !!e.target.checked;
              var paramDiv3 = root.querySelector('[data-role="comp-effect-feather-param"]');
              if (paramDiv3) paramDiv3.style.display = c.effects.feather ? 'block' : 'none';
              if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
            } else if (field === 'comp-visible') {
              c.visible = !!e.target.checked;
              if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
            } else if (field === 'comp-locked') {
              c.locked = !!e.target.checked;
              if (Ny.Render && Ny.Render.renderPreview) Ny.Render.renderPreview();
            }
          });
        }
      } catch (_e) { }
    }

    // Setup drag for background components within wrapper
    function setupBgComponentDrag(wrapper) {
      try {
        var customization = getCustomization();
        var layer = wrapper && wrapper.querySelector('.bg-components-layer');
        if (!layer) return;

        var dragging = null;
        function getRect() { return wrapper.getBoundingClientRect(); }
        function getCoords(e) {
          if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
          return { x: e.clientX, y: e.clientY };
        }

        function onDown(e) {
          if (!customization.bgCompDrag) return;
          var el = e.target.closest('.bg-comp');
          if (!el) return;
          var id = el.getAttribute('data-id');
          var obj = (customization.bgComponents || []).find(function (c) { return c.id === id; });
          if (!obj || obj.locked) return;
          e.preventDefault();
          el.classList.add('dragging');
          var rect = getRect();
          var coords = getCoords(e);
          var startX = coords.x, startY = coords.y;
          var startLeft = (isFinite(obj.x) ? obj.x : 50);
          var startTop = (isFinite(obj.y) ? obj.y : 50);
          dragging = { el: el, id: id, obj: obj, rect: rect, startX: startX, startY: startY, startLeft: startLeft, startTop: startTop };

          document.addEventListener('mousemove', onMove);
          document.addEventListener('touchmove', onMove, { passive: false });
          document.addEventListener('mouseup', onUp, { once: true });
          document.addEventListener('touchend', onUp, { once: true });
          document.addEventListener('touchcancel', onUp, { once: true });
        }

        function onMove(e) {
          if (!dragging) return;
          e.preventDefault();
          var rect = dragging.rect;
          var coords = getCoords(e);
          var dx = ((coords.x - dragging.startX) / rect.width) * 100;
          var dy = ((coords.y - dragging.startY) / rect.height) * 100;
          dragging.obj.x = Math.max(0, Math.min(100, dragging.startLeft + dx));
          dragging.obj.y = Math.max(0, Math.min(100, dragging.startTop + dy));
          dragging.el.style.left = dragging.obj.x + '%';
          dragging.el.style.top = dragging.obj.y + '%';
        }

        function onUp() {
          if (dragging && dragging.el) dragging.el.classList.remove('dragging');
          dragging = null;
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('touchmove', onMove);
          document.removeEventListener('touchend', onUp);
          document.removeEventListener('touchcancel', onUp);
        }

        layer.addEventListener('mousedown', onDown);
        layer.addEventListener('touchstart', onDown, { passive: false });
      } catch (_e) { }
    }

    // Ensure bg dock banner text (toggle show when dragging enabled)
    function ensureBgDock() {
      try {
        var customization = getCustomization();
        var pv = document.querySelector('.preview-panel');
        if (!pv) return;
        var dock = pv.querySelector('.bg-dock');
        if (!dock) {
          dock = document.createElement('div');
          dock.className = 'bg-dock';
          pv.appendChild(dock);
        }
        if (customization.bgMode === 'layers' && customization.bgCompDrag) {
          dock.textContent = '拖动模式：开启（在预览中拖动组件）';
          dock.classList.add('show');
        } else {
          dock.classList.remove('show');
        }
      } catch (_e) { }
    }

    function serializeBgConfig() {
      try {
        var customization = getCustomization();
        return {
          layers: Array.isArray(customization.bgLayers) ? JSON.parse(JSON.stringify(customization.bgLayers)) : [],
          components: Array.isArray(customization.bgComponents) ? JSON.parse(JSON.stringify(customization.bgComponents)) : []
        };
      } catch (_e) {
        return { layers: [], components: [] };
      }
    }

    function init() {
      if (initialized) return;
      initialized = true;
      try {
        // Expose compatibility aliases on window, so inline callers can switch to external implementations without refactoring call sites
        window.buildBgLayersHTML = function (layers) {
          return buildLayersHTML(layers, getCustomization());
        };
        window.buildBgComponentsHTML = function (components) {
          return buildComponentsHTML(components, getCustomization());
        };
        window.setupBgComponentDrag = function (wrapper) {
          return setupBgComponentDrag(wrapper);
        };
        window.ensureBgDock = function () {
          return ensureBgDock();
        };
        window.renderBgLayersEditor = function () {
          return renderBgLayersEditor();
        };
        window.renderBgComponentsEditor = function () {
          return renderBgComponentsEditor();
        };
        window.setupBgEditorsEvents = function () {
          return setupBgEditorsEvents();
        };

        // Bind editor events once (delegation), safe to call when UI exists
        setupBgEditorsEvents();

        try { console.debug('[Ny.Background] init'); } catch (_e) { }
      } catch (e) {
        console.warn('[Ny.Background] initialization warning', e);
      }
    }

    function ensure() { if (!initialized) init(); }

    return {
      init: init,
      ensure: ensure,
      buildBgLayersHTML: buildLayersHTML,
      buildBgComponentsHTML: buildComponentsHTML,
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
// 提前初始化：即使未等待 DOMContentLoaded，也先执行一次，以尽快暴露 window.* 兼容别名（init 内部幂等）
try {
  if (window.Ny && Ny.Background && typeof Ny.Background.init === 'function') {
    Ny.Background.init();
  }
} catch (_e) {
  try { console.warn('[Ny.Background] early init warning', _e); } catch(__e){}
}
})(window, document);