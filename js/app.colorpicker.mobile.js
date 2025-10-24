(function(){
  const isMobile = window.matchMedia('(max-width: 900px)').matches || (navigator.maxTouchPoints>0) || ('ontouchstart' in window);
  if (!isMobile) return; // 仅移动端启用自定义拾色器，桌面保持原生

  const modal = document.getElementById('color-picker-modal');
  if (!modal) return;
  const backdrop = modal.querySelector('.cpk-backdrop');
  const closeBtn = modal.querySelector('.cpk-close');
  const okBtn = modal.querySelector('#cpk-ok');
  const cancelBtn = modal.querySelector('#cpk-cancel');
  const hexInput = modal.querySelector('#cpk-hex');
  const svWrap = modal.querySelector('.cpk-sv-wrap');
  const hWrap = modal.querySelector('.cpk-h-wrap');
  const svCanvas = modal.querySelector('#cpk-sv');
  const hCanvas = modal.querySelector('#cpk-h');
  const svHandle = document.createElement('div'); svHandle.className='cpk-handle'; svWrap.appendChild(svHandle);
  const hHandle = document.createElement('div'); hHandle.className='cpk-handle-h'; hWrap.appendChild(hHandle);
  const swatchOld = modal.querySelector('#cpk-old');
  const swatchNew = modal.querySelector('#cpk-new');

  let targetInput = null;
  let targetCodeInput = null;
  let hsv = { h: 220, s: 0.6, v: 0.6 };

  function hexToRgb(hex){
    let h=String(hex||'').trim();
    if(h[0]==='#') h=h.slice(1);
    if(h.length===3) h=h.split('').map(c=>c+c).join('');
    if(!/^[0-9a-fA-F]{6}$/.test(h)) return {r:0,g:0,b:0};
    const n=parseInt(h,16);
    return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
  }
  function rgbToHex(r,g,b){
    const to=(n)=>Math.max(0,Math.min(255,n|0)).toString(16).padStart(2,'0');
    return '#'+to(r)+to(g)+to(b);
  }
  function rgbToHsv(r,g,b){
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h,s,v=max; const d=max-min;
    s= max===0?0:d/max;
    if(max===min){h=0;} else {
      switch(max){
        case r:h=(g-b)/d+(g<b?6:0);break;
        case g:h=(b-r)/d+2;break;
        case b:h=(r-g)/d+4;break;
      }
      h/=6;
    }
    return { h: Math.round(h*360), s, v };
  }
  function hsvToRgb(h,s,v){
    h = (h%360+360)%360;
    const c=v*s, x=c*(1-Math.abs((h/60)%2-1)), m=v-c;
    let r1=0,g1=0,b1=0;
    if(h<60){ r1=c; g1=x; }
    else if(h<120){ r1=x; g1=c; }
    else if(h<180){ g1=c; b1=x; }
    else if(h<240){ g1=x; b1=c; }
    else if(h<300){ r1=x; b1=c; }
    else { r1=c; b1=x; }
    return { r: Math.round((r1+m)*255), g: Math.round((g1+m)*255), b: Math.round((b1+m)*255) };
  }

  function drawHue(){
    const rect = hWrap.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio||1);
    hCanvas.width = Math.max(1, Math.round(rect.width*dpr));
    hCanvas.height = Math.max(1, Math.round(rect.height*dpr));
    const ctx = hCanvas.getContext('2d');
    const grd = ctx.createLinearGradient(0,0,0,hCanvas.height);
    const stops = ['#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ff0000'];
    stops.forEach((c,i)=>grd.addColorStop(i/(stops.length-1), c));
    ctx.fillStyle = grd; ctx.fillRect(0,0,hCanvas.width,hCanvas.height);
    const y = (hsv.h/360) * rect.height;
    hHandle.style.top = y+'px';
  }
  function drawSV(){
    const rect = svWrap.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio||1);
    svCanvas.width = Math.max(1, Math.round(rect.width*dpr));
    svCanvas.height = Math.max(1, Math.round(rect.height*dpr));
    const ctx = svCanvas.getContext('2d');

    // 基底：纯色（当前色相、饱和=1、明度=1）
    const base = hsvToRgb(hsv.h,1,1);
    ctx.fillStyle = `rgb(${base.r},${base.g},${base.b})`;
    ctx.fillRect(0,0,svCanvas.width,svCanvas.height);

    // 白色渐变（左→右 增加饱和）
    const g1 = ctx.createLinearGradient(0,0,svCanvas.width,0);
    g1.addColorStop(0,'rgba(255,255,255,1)');
    g1.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0,0,svCanvas.width,svCanvas.height);

    // 黑色渐变（上→下 降低明度）
    const g2 = ctx.createLinearGradient(0,0,0,svCanvas.height);
    g2.addColorStop(0,'rgba(0,0,0,0)');
    g2.addColorStop(1,'rgba(0,0,0,1)');
    ctx.fillStyle = g2;
    ctx.fillRect(0,0,svCanvas.width,svCanvas.height);

    const x = hsv.s * rect.width;
    const y = (1 - hsv.v) * rect.height;
    svHandle.style.left = x+'px';
    svHandle.style.top = y+'px';
  }
  function updatePreview(){
    const {r,g,b} = hsvToRgb(hsv.h,hsv.s,hsv.v);
    const hex = rgbToHex(r,g,b);
    if (swatchNew) swatchNew.style.background = hex;
    if (hexInput) hexInput.value = hex;
  }
  function setFromHex(hex){
    const rgb = hexToRgb(hex);
    const hv = rgbToHsv(rgb.r,rgb.g,rgb.b);
    if (isFinite(hv.h)) hsv.h = hv.h;
    hsv.s = isNaN(hv.s)?0:hv.s;
    hsv.v = isNaN(hv.v)?0:hv.v;
    drawHue(); drawSV(); updatePreview();
  }

  function openPicker(inp){
    targetInput = inp;
    // 寻找紧邻的代码输入框（若存在）
    targetCodeInput = null;
    try{
      if (inp.nextElementSibling && inp.nextElementSibling.tagName==='INPUT') targetCodeInput = inp.nextElementSibling;
      else if (inp.previousElementSibling && inp.previousElementSibling.tagName==='INPUT') targetCodeInput = inp.previousElementSibling;
      else {
        const parent = inp.parentElement;
        if (parent){
          const cand = parent.querySelector('input[type="text"]');
          if (cand && cand !== inp) targetCodeInput = cand;
        }
      }
    }catch(_e){}

    const curHex = (inp.value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(inp.value)) ? inp.value : '#85a6f8';
    if (swatchOld) swatchOld.style.background = curHex;
    setFromHex(curHex);
    if (hexInput) hexInput.value = curHex;

    modal.classList.add('show');
    document.body.style.overflow='hidden';
    // 进入时确保画布尺寸正确
    setTimeout(()=>{ drawHue(); drawSV(); }, 0);
  }
  function closePicker(){
    modal.classList.remove('show');
    document.body.style.overflow='';
  }
  function commit(){
    const {r,g,b} = hsvToRgb(hsv.h,hsv.s,hsv.v);
    const hex = rgbToHex(r,g,b);
    try{
      if (targetInput){
        targetInput.value = hex;
        targetInput.dispatchEvent(new Event('input',{bubbles:true}));
      }
      if (targetCodeInput){
        targetCodeInput.value = hex;
        targetCodeInput.dispatchEvent(new Event('input',{bubbles:true}));
      }
    }catch(_e){}
    closePicker();
  }

  function bindDrag(canvas, onUpdate){
    let dragging=false;
    const onDown=(e)=>{
      e.preventDefault();
      dragging=true;
      onUpdate(e);
      window.addEventListener('pointermove', onMove, {passive:false});
      window.addEventListener('pointerup', onUp, {once:true});
    };
    const onMove=(e)=>{
      if(!dragging) return;
      e.preventDefault();
      onUpdate(e);
    };
    const onUp=()=>{ dragging=false; window.removeEventListener('pointermove', onMove); };
    canvas.addEventListener('pointerdown', onDown, {passive:false});
    // 兼容老式触摸
    canvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); dragging=true; onUpdate(e.touches[0]); }, {passive:false});
    canvas.addEventListener('touchmove', (e)=>{ if(!dragging) return; e.preventDefault(); onUpdate(e.touches[0]); }, {passive:false});
    canvas.addEventListener('touchend', ()=>{ dragging=false; });
  }
  bindDrag(svCanvas, (e)=>{
    const rect = svWrap.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, (e.clientX ?? 0) - rect.left));
    const y = Math.max(0, Math.min(rect.height,(e.clientY ?? 0) - rect.top));
    hsv.s = rect.width ? (x/rect.width) : 0;
    hsv.v = rect.height ? (1 - y/rect.height) : 0;
    svHandle.style.left = x+'px';
    svHandle.style.top = y+'px';
    updatePreview();
  });
  bindDrag(hCanvas, (e)=>{
    const rect = hWrap.getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height,(e.clientY ?? 0) - rect.top));
    hsv.h = rect.height ? Math.round((y/rect.height)*360) : hsv.h;
    hHandle.style.top = y+'px';
    drawSV();
    updatePreview();
  });

  if (hexInput){
    hexInput.addEventListener('input', (e)=>{
      const v = e.target.value.trim();
      const vv = v.startsWith('#') ? v : ('#'+v);
      if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(vv)) setFromHex(vv);
    });
  }
  [backdrop, closeBtn, cancelBtn].forEach(el => el && el.addEventListener('click', closePicker));
  okBtn && okBtn.addEventListener('click', commit);
  window.addEventListener('resize', ()=>{ if (modal.classList.contains('show')) { drawHue(); drawSV(); } });

  // 绑定所有 color 输入：拦截原生，改为打开自定义拾色器（移动端）
  function bindInputs(){
    const list = document.querySelectorAll('.control-group input[type="color"]');
    list.forEach(inp=>{
      if (inp.dataset.cpkBound) return;
      inp.dataset.cpkBound = '1';
      const handler=(e)=>{ e.preventDefault(); e.stopPropagation(); openPicker(inp); return false; };
      inp.addEventListener('pointerdown', handler, {passive:false});
      inp.addEventListener('click', handler, {passive:false});
      inp.addEventListener('touchstart', handler, {passive:false});
    });
  }
  bindInputs();
  const mo = new MutationObserver(bindInputs);
  mo.observe(document.body, {childList:true, subtree:true});

  // 初始化一次
  setTimeout(()=>{ drawHue(); drawSV(); updatePreview(); }, 0);
})();