(function (global) {
  'use strict';
  var Ny = global.Ny || (global.Ny = {});
  Ny.Sections = Ny.Sections || {};
  Ny.Sections.renderGlobalStyle = function(mountEl) {
    try {
      var el = mountEl || global.document.getElementById('global-style-mount');
      if (!el) {
        var cs = global.document.getElementById('customization-section');
        el = global.document.createElement('div');
        el.id = 'global-style-mount';
        if (cs && cs.parentNode) {
          cs.parentNode.insertBefore(el, cs);
        } else {
          var panel = global.document.querySelector('.controls-panel');
          if (panel) panel.appendChild(el);
        }
      }
      el.innerHTML = `
<div class="control-section collapsible" id="section-1">
  <h3>1. 全局风格 <span class="toggle-icon">▾</span></h3>
  <div class="section-body">
    <div class="control-group">
      <label>选择设计模板</label>
      <div class="theme-selector">
        <div class="theme-option active" data-theme="theme-mystic-noir">暗黑神秘</div>
        <div class="theme-option" data-theme="theme-cyber-grid">未来科技</div>
        <div class="theme-option" data-theme="theme-neon-night">霓虹夜色</div>
        <div class="theme-option" data-theme="theme-glassmorphism">玻璃拟态</div>
        <div class="theme-option" data-theme="theme-steampunk">蒸汽朋克</div>
        <div class="theme-option" data-theme="theme-paper-journal">纸质手账</div>
        <div class="theme-option" data-theme="theme-pixel-retro">像素复古</div>
        <div class="theme-option" data-theme="theme-modern-minimal">简约现代</div>
        <div class="theme-option" data-theme="theme-nature-aura">自然灵韵</div>
        <div class="theme-option" data-theme="theme-ink-wash">水墨留白</div>
      </div>
    </div>

    <div class="control-group">
      <label for="ui-mode-select">界面背景</label>
      <select id="ui-mode-select">
        <option value="dark">黑夜</option>
        <option value="light">柔和暖色</option>
      </select>
    </div>
    <div class="control-group">
      <label for="title-input">状态栏标题</label>
      <input type="text" id="title-input" value="角色状态">
    </div>
    <div class="control-group">
      <label for="enter-animation-select">进入动画</label>
      <select id="enter-animation-select">
        <option value="none">无</option>
        <option value="fade">淡入</option>
        <option value="slide">上滑</option>
      </select>
    </div>
    <div class="control-group">
      <label for="loop-animation-select">长驻动画</label>
      <select id="loop-animation-select">
        <option value="none">无</option>
        <option value="pulse">脉冲</option>
        <option value="neon">光晕</option>
        <option value="shimmer">玻璃闪烁</option>
        <option value="tilt3d">3D倾斜</option>
        <option value="breathe">呼吸</option>
        <option value="gloss">光泽</option>
      </select>
    </div>
    <div class="control-group">
      <label>动画速度</label>
      <div class="range-row">
        <input type="range" id="animation-speed" min="0.5" max="3" step="0.1" value="1">
        <span class="value-pill"><span id="speed-value">1.0</span>s</span>
      </div>
    </div>
    <div class="control-group">
      <label>动画强度</label>
      <div class="range-row">
        <input type="range" id="animation-intensity" min="0" max="1" step="0.05" value="0.7">
        <span class="value-pill"><span id="intensity-value">0.60</span></span>
      </div>
    </div>
    <!-- 光晕设置（颜色与频率） -->
    <div class="control-group">
      <label>光晕设置</label>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
        <div>
          <label for="glow-color-a-input">颜色A</label>
          <input type="color" id="glow-color-a-input" value="#85a6f8">
          <input type="text" id="glow-color-a-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#85a6f8" style="margin-top:6px;">
        </div>
        <div>
          <label for="glow-color-b-input">颜色B</label>
          <input type="color" id="glow-color-b-input" value="#95b3e8">
          <input type="text" id="glow-color-b-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#95b3e8" style="margin-top:6px;">
        </div>
      </div>
      <div class="range-row" style="margin-top:10px;">
        <label>光晕闪烁频率(秒)</label>
        <input type="range" id="glow-speed-range" min="0.5" max="5" step="0.1" value="1">
        <span class="value-pill"><span id="glow-speed-value">1.0</span>s</span>
      </div>
      <p style="color: var(--text-secondary); font-size: 12px; margin-top:6px;">颜色默认跟随主/辅色；频率默认 1.0s。</p>
    </div>
  </div>
</div>
`;
    } catch (e) {
      try { console.warn('[Ny.Sections] renderGlobalStyle error', e); } catch (_e) {}
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);