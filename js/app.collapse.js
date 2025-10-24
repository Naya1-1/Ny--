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