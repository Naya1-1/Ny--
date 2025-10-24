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
      mo = new (global.MutationObserver || function(){})();
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