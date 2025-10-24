(function(){
  window.Ny = window.Ny || {};
  Ny.Sections = Ny.Sections || {};
  Ny.Sections.renderCustomization = function(){
    const mount = document.getElementById('customization-mount');
    if (!mount) return;

    function renderNow(){
      const P = (Ny.Sections && Ny.Sections.CustomizationParts) || {};
      const req = ['fonts','title','icon','colorAppearance','sizeWidth','background','typography','divider','overlay'];
      const ready = req.every(fn => typeof P[fn] === 'function');
      if (!ready) { try { console.warn('[Ny.Sections] CustomizationParts not ready'); } catch(_e) {} return; }

      const html = `
        <div class="control-section collapsible" id="customization-section">
          <h3>2 模板个性化 <span class="toggle-icon">▾</span></h3>
          <div class="section-body">
            ${P.fonts()}
            ${P.title()}
            ${P.icon()}
            ${P.colorAppearance()}
            ${P.sizeWidth()}
            ${P.background()}
            ${P.typography()}
            ${P.divider()}
            ${P.overlay()}
          </div>
        </div>
      `;
      mount.outerHTML = html;
    }

    if (Ny.Sections && Ny.Sections.CustomizationParts) {
      renderNow();
      return;
    }

    try {
      var s = document.createElement('script');
      s.src = 'js/sections/section.customization.parts.js';
      s.async = false; // 保证同步顺序，加载完成后再渲染
      s.onload = renderNow;
      s.onerror = function(){
        try { console.error('[Ny.Sections] Failed to load section.customization.parts.js'); } catch(_e) {}
      };
      (document.head || document.documentElement).appendChild(s);
    } catch (_e) {
      // 退化尝试：如果注入失败，仍尝试渲染（在 Parts 缺失时将不会输出内容）
      renderNow();
    }
  };
})();