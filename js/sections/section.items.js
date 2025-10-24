(function(global){
  'use strict';
  var Ny = global.Ny || (global.Ny = {});
  Ny.Sections = Ny.Sections || {};

  Ny.Sections.renderItems = function(){
    try {
      var sec = global.document.getElementById('section-2');
      if (!sec) return;

      function renderNow(){
        var P = (Ny.Sections && Ny.Sections.ItemsParts) || {};
        var req = ['colorsAndBar','cardBgShadow','longtextGlobal','valueBoxOffsets','fontsStyle','editor'];
        var ready = req.every(function(fn){ return typeof P[fn] === 'function'; });
        if (!ready) { try { console.warn('[Ny.Sections] ItemsParts not ready'); } catch(_e) {} return; }

        var body = sec.querySelector('.section-body');
        if (!body) {
          body = global.document.createElement('div');
          body.className = 'section-body';
          sec.appendChild(body);
        }

        var html = ''
          + P.colorsAndBar()
          + P.cardBgShadow()
          + P.longtextGlobal()
          + P.valueBoxOffsets()
          + P.fontsStyle()
          + P.editor();

        body.innerHTML = html;

        // ============ 项目编辑（每项独立设置：长文字） ============
        (function setupItemsEditor(){
          try{
            var State = Ny.State || {};
            var Render = Ny.Render || {};
            var Exporter = Ny.Export || {};
            var Utils = Ny.Utils || {};

            // 绑定“允许每个项目独立设置背景与阴影”全局开关，与状态同步
            (function bindPerItemToggle(){
              try{
                var cb = body.querySelector('#item-bg-shadow-per-item-toggle');
                if (!cb) return;
                // 初始对齐状态
                try { cb.checked = !!(State.customization && State.customization.itemCardPerItemEnabled); } catch(_e0){}
                if (!cb.__nyBound) {
                  cb.__nyBound = true;
                  cb.addEventListener('change', function(){
                    try {
                      var on = !!cb.checked;
                      if (typeof State.patchCustomization === 'function') {
                        State.patchCustomization({ itemCardPerItemEnabled: on });
                      } else if (State && State.customization) {
                        State.customization.itemCardPerItemEnabled = on;
                      }
                      // 预览 + 输出刷新
                      try { if (Render && typeof Render.renderPreview === 'function') Render.renderPreview(); } catch(_eR){}
                      try { if (Exporter && typeof Exporter.refreshOutputs === 'function') Exporter.refreshOutputs(false, { inlineGroup: true }); } catch(_eEx){}
                      // 重新渲染“项目编辑”面板，以显示/隐藏每项独立设置块
                      try { renderItemsEditor(); } catch(_eRe){}
                    } catch(_e1){}
                  });
                }
              } catch(_outer){}
            })();

            function clamp(n, a, b){ n = Number(n); if (!isFinite(n)) n = 0; return Math.max(a, Math.min(b, n)); }
            function newId(){
              try { if (Utils.genId) return Utils.genId(); } catch(_e){}
              return 'it_' + Math.random().toString(36).slice(2, 9);
            }
            function getItems(){ try { return Array.isArray(State.items) ? State.items.slice() : []; } catch(_e){ return []; } }
            function setItems(next){
              try {
                if (typeof State.setItems === 'function') State.setItems(next);
                else State.items = next;
              } catch(_e){ State.items = next; }
              try { if (Render && typeof Render.renderPreview === 'function') Render.renderPreview(); } catch(_e){}
              try { if (Exporter && typeof Exporter.refreshOutputs === 'function') Exporter.refreshOutputs(false, { inlineGroup: true }); } catch(_e){}
            }
            function updateItemById(id, patch){
              var list = getItems();
              var next = list.map(function(it){ return (it && it.id === id) ? Object.assign({}, it, patch) : it; });
              setItems(next);
            }
            function removeItemById(id){
              var list = getItems();
              var next = list.filter(function(it){ return !it || it.id !== id; });
              setItems(next);
              renderItemsEditor(); // 重新渲染编辑器列表
            }

            function renderItemsEditor(){
              var cont = body.querySelector('#items-container');
              if (!cont) return;
              cont.innerHTML = '';

              var list = getItems();
              list.forEach(function(it, idx){
                if (!it) return;
                var wrap = document.createElement('div');
                wrap.className = 'item-controls';

                var head = document.createElement('div');
                head.className = 'item-header';
                var title = document.createElement('span');
                var displayType = (function(){
                  try { return Utils.typeName ? Utils.typeName(it.type) : it.type; } catch(_e){ return it.type; }
                })();
                title.textContent = (idx+1) + '. ' + String(it.label || (it.type === 'longtext' ? '说明' : (it.type === 'bar' ? '进度' : '标签'))) + ' (' + displayType + ')';
                var btnDel = document.createElement('button');
                btnDel.className = 'btn-delete';
                btnDel.textContent = 'X';
                btnDel.title = '删除该项目';
                btnDel.addEventListener('click', function(){ removeItemById(it.id); });
                head.appendChild(title);
                head.appendChild(btnDel);
                wrap.appendChild(head);

                // 仅为“长文字”提供独立设置控件
                if (it.type === 'longtext') {
                  // 表单容器
                  var form = document.createElement('div');
                  form.className = 'control-group';
                  form.style.display = 'grid';
                  form.style.gap = '10px';

                  // 标签
                  (function(){
                    var labWrap = document.createElement('div');
                    var lab = document.createElement('label');
                    lab.textContent = '标签';
                    labWrap.appendChild(lab);
                    var input = document.createElement('input');
                    input.type = 'text';
                    input.value = String(it.label || '');
                    input.placeholder = '例如：说明';
                    input.addEventListener('input', function(){
                      updateItemById(it.id, { label: String(input.value || '') });
                      // 不重绘，以减少抖动；标题行由上方文本显示，下一次整体重绘时更新
                    });
                    labWrap.appendChild(input);
                    form.appendChild(labWrap);
                  })();

                  // 长文字内容
                  (function(){
                    var vWrap = document.createElement('div');
                    var lab = document.createElement('label');
                    lab.textContent = '长文字';
                    vWrap.appendChild(lab);
                    var ta = document.createElement('textarea');
                    ta.placeholder = '在此填写长段文字…';
                    ta.value = String(it.value || '');
                    ta.style.minHeight = '84px';
                    ta.addEventListener('input', function(){
                      updateItemById(it.id, { value: String(ta.value || '') });
                    });
                    vWrap.appendChild(ta);
                    form.appendChild(vWrap);
                  })();

                  // 分组：行间距 ~ 动画特效（可折叠，视觉仅限前端）
                  var ltGroup = document.createElement('div');
                  ltGroup.className = 'inline-subbox';
                  var ltTitle = document.createElement('div');
                  ltTitle.className = 'form-box-title';
                  ltTitle.textContent = '长文字 · 行间距与动画特效';
                  ltGroup.appendChild(ltTitle);
                  // 折叠绑定（不影响数据与导出）
                  ltGroup.classList.add('collapsible');
                  ltTitle.setAttribute('tabindex','0');
                  ltTitle.addEventListener('click', function(){ ltGroup.classList.toggle('collapsed'); });
                  ltTitle.addEventListener('keydown', function(e){
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ltGroup.classList.toggle('collapsed'); }
                  });

                  // 行间距
                  (function(){
                    var row = document.createElement('div');
                    row.className = 'range-row';
                    var lab = document.createElement('label');
                    lab.textContent = '行间距';
                    row.appendChild(lab);
                    var range = document.createElement('input');
                    range.type = 'range';
                    range.min = '1.00';
                    range.max = '3.00';
                    range.step = '0.05';
                    var lh = (typeof it.ltLineHeight === 'number' ? it.ltLineHeight : 1.6);
                    range.value = String(lh);
                    var pill = document.createElement('span');
                    pill.className = 'value-pill';
                    var vv = document.createElement('span');
                    vv.textContent = lh.toFixed(2);
                    pill.appendChild(vv);
                    row.appendChild(range);
                    row.appendChild(pill);
                    range.addEventListener('input', function(){
                      var v = clamp(parseFloat(range.value)||1.6, 1.0, 3.0);
                      vv.textContent = v.toFixed(2);
                    });
                    range.addEventListener('change', function(){
                      var v = clamp(parseFloat(range.value)||1.6, 1.0, 3.0);
                      updateItemById(it.id, { ltLineHeight: v });
                    });
                    ltGroup.appendChild(row);
                  })();

                  // 新增：空出首行（可选）
                  (function(){
                    var row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.alignItems = 'center';
                    row.style.gap = '8px';
                    var cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.id = 'lt-skip-first-' + it.id;
                    cb.checked = !!it.ltSkipFirstLine;
                    var lab = document.createElement('label');
                    lab.setAttribute('for', cb.id);
                    lab.textContent = '空出首行（留出一行行高的上边距）';
                    cb.addEventListener('change', function(){
                      updateItemById(it.id, { ltSkipFirstLine: !!cb.checked });
                    });
                    row.appendChild(cb);
                    row.appendChild(lab);
                    ltGroup.appendChild(row);
                  })();

                  // 新增：首字缩进(px)
                  (function(){
                    var row = document.createElement('div');
                    var lab = document.createElement('label');
                    lab.textContent = '首字缩进(px)';
                    var input = document.createElement('input');
                    input.type = 'number';
                    input.min = '0';
                    input.step = '1';
                    input.value = String(isFinite(it.ltFirstIndentPx) ? Math.max(0, Number(it.ltFirstIndentPx)) : 0);
                    input.addEventListener('change', function(){
                      var v = Math.max(0, parseInt(input.value, 10) || 0);
                      input.value = String(v);
                      updateItemById(it.id, { ltFirstIndentPx: v });
                    });
                    row.appendChild(lab);
                    row.appendChild(input);
                    ltGroup.appendChild(row);
                  })();

                  // 新增：四边距（px）
                  (function(){
                    var box = document.createElement('div');
                    var lab = document.createElement('label');
                    lab.textContent = '长文字与边框的距离（内边距，px）';
                    box.appendChild(lab);

                    var grid = document.createElement('div');
                    grid.style.display = 'grid';
                    grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
                    grid.style.gap = '8px';

                    function makePadCell(name, key){
                      var cell = document.createElement('div');
                      var l = document.createElement('span');
                      l.textContent = name;
                      l.style.fontSize = '12px';
                      l.style.opacity = '.8';
                      var ip = document.createElement('input');
                      ip.type = 'number'; ip.min = '0'; ip.step = '1';
                      ip.value = String(isFinite(it[key]) ? Math.max(0, Number(it[key])) : 0);
                      ip.addEventListener('change', function(){
                        var v = Math.max(0, parseInt(ip.value, 10) || 0);
                        ip.value = String(v);
                        var patch = {}; patch[key] = v;
                        updateItemById(it.id, patch);
                      });
                      cell.appendChild(l);
                      cell.appendChild(ip);
                      return cell;
                    }
                    grid.appendChild(makePadCell('上', 'ltPadTopPx'));
                    grid.appendChild(makePadCell('右', 'ltPadRightPx'));
                    grid.appendChild(makePadCell('下', 'ltPadBottomPx'));
                    grid.appendChild(makePadCell('左', 'ltPadLeftPx'));

                    box.appendChild(grid);
                    ltGroup.appendChild(box);
                  })();

                  // 动画特效（放在行间距之下，且位于以下“空出首行/缩进/四边距”之后）
                  (function(){
                    var cell = document.createElement('div');
                    var lab = document.createElement('label');
                    lab.textContent = '动画特效';
                    cell.appendChild(lab);
                    var sel = document.createElement('select');
                    [
                      {v:'none', text:'无'},
                      {v:'fade', text:'淡入'},
                      {v:'slide', text:'上移出现'},
                      {v:'typewriter', text:'打字机'}
                    ].forEach(function(opt){
                      var o = document.createElement('option');
                      o.value = opt.v; o.textContent = opt.text;
                      sel.appendChild(o);
                    });
                    sel.value = String(it.ltEffect || 'none');

                    // 打字机选项容器（仅在“打字机”被选择时显示）
                    var twBox = document.createElement('div');
                    twBox.className = 'control-group';

                    // 速度(毫秒/字符)
                    (function(){
                      var row = document.createElement('div');
                      row.className = 'range-row';
                      var lb = document.createElement('label');
                      lb.textContent = '速度(毫秒/字符)';
                      row.appendChild(lb);
                      var range = document.createElement('input');
                      range.type = 'range';
                      range.min = '5';
                      range.max = '200';
                      range.step = '1';
                      var defSpd = (isFinite(it.ltTwSpeedMs) ? clamp(parseInt(it.ltTwSpeedMs,10)||18, 5, 200) : 18);
                      range.value = String(defSpd);
                      var pill = document.createElement('span');
                      pill.className = 'value-pill';
                      var vv = document.createElement('span');
                      vv.textContent = String(defSpd);
                      pill.appendChild(vv);
                      row.appendChild(range);
                      row.appendChild(pill);
                      range.addEventListener('input', function(){
                        var v = clamp(parseInt(range.value,10)||18, 5, 200);
                        vv.textContent = String(v);
                      });
                      range.addEventListener('change', function(){
                        var v = clamp(parseInt(range.value,10)||18, 5, 200);
                        updateItemById(it.id, { ltTwSpeedMs: v });
                      });
                      twBox.appendChild(row);
                    })();

                    // 开始延迟(ms)
                    (function(){
                      var row = document.createElement('div');
                      var lb = document.createElement('label');
                      lb.textContent = '开始延迟(ms)';
                      var input = document.createElement('input');
                      input.type = 'number';
                      input.min = '0';
                      input.step = '50';
                      input.value = String(isFinite(it.ltTwDelayMs) ? Math.max(0, parseInt(it.ltTwDelayMs,10)||0) : 0);
                      input.addEventListener('change', function(){
                        var v = Math.max(0, parseInt(input.value,10)||0);
                        input.value = String(v);
                        updateItemById(it.id, { ltTwDelayMs: v });
                      });
                      row.appendChild(lb);
                      row.appendChild(input);
                      twBox.appendChild(row);
                    })();

                    // 光标闪烁
                    (function(){
                      var row = document.createElement('div');
                      row.style.display = 'flex';
                      row.style.alignItems = 'center';
                      row.style.gap = '8px';
                      var cb = document.createElement('input');
                      cb.type = 'checkbox';
                      cb.id = 'lt-tw-caret-' + it.id;
                      cb.checked = (it.ltTwCaret !== false);
                      var lb = document.createElement('label');
                      lb.setAttribute('for', cb.id);
                      lb.textContent = '显示光标闪烁';
                      cb.addEventListener('change', function(){
                        updateItemById(it.id, { ltTwCaret: !!cb.checked });
                      });
                      row.appendChild(cb);
                      row.appendChild(lb);
                      twBox.appendChild(row);
                    })();

                    function updateTwBox(){
                      twBox.style.display = (String(sel.value) === 'typewriter') ? '' : 'none';
                    }
                    updateTwBox();

                    sel.addEventListener('change', function(){
                      updateItemById(it.id, { ltEffect: String(sel.value || 'none') });
                      updateTwBox();
                    });

                    cell.appendChild(sel);
                    ltGroup.appendChild(cell);
                    ltGroup.appendChild(twBox);
                  })();

                  // 将分组盒添加进表单
                  form.appendChild(ltGroup);

                  wrap.appendChild(form);
                }

                // 每项的“卡片背景与阴影（本项）”设置（当已开启“每项独立设置”时显示）
                (function addCardBgShadowPerItemUI(){
                  try{
                    var c = (State && State.customization) ? State.customization : {};
                    if (!c.itemCardPerItemEnabled) {
                      // 未开启时不渲染该块
                      return;
                    }
                    // 容器
                    var box = document.createElement('div');
                    box.className = 'inline-subbox';
                    var titleBox = document.createElement('div');
                    titleBox.className = 'form-box-title';
                    titleBox.textContent = '卡片背景与阴影（本项）';
                    box.appendChild(titleBox);

                    // 行：模式选择
                    var rowMode = document.createElement('div');
                    rowMode.className = 'control-group';
                    var labMode = document.createElement('label');
                    labMode.textContent = '背景模式（本项）';
                    rowMode.appendChild(labMode);
                    var modeSel = document.createElement('select');
                    [
                      {v:'inherit', t:'跟随全局'},
                      {v:'theme', t:'模板'},
                      {v:'none', t:'无背景（透明）'},
                      {v:'color', t:'纯色'},
                      {v:'gradient', t:'渐变'},
                      {v:'image', t:'图片'},
                      {v:'url', t:'自定义URL背景'}
                    ].forEach(function(opt){
                      var o = document.createElement('option');
                      o.value = opt.v; o.textContent = opt.t;
                      modeSel.appendChild(o);
                    });
                    modeSel.value = String(it.cardBgMode || 'inherit');
                    rowMode.appendChild(modeSel);
                    box.appendChild(rowMode);

                    // 纯色组
                    var rowColor = document.createElement('div');
                    rowColor.className = 'control-group';
                    rowColor.style.display = 'none';
                    var labColor = document.createElement('label');
                    labColor.textContent = '纯色背景（本项）';
                    rowColor.appendChild(labColor);
                    var colorInput = document.createElement('input');
                    colorInput.type = 'color';
                    colorInput.value = String(it.cardBgColor || c.itemCardBgColor || '#111215');
                    rowColor.appendChild(colorInput);
                    var colorCode = document.createElement('input');
                    colorCode.type = 'text';
                    colorCode.placeholder = '#RRGGBB 或 CSS颜色';
                    colorCode.style.marginTop = '6px';
                    colorCode.value = String(it.cardBgColor || c.itemCardBgColor || '#111215');
                    rowColor.appendChild(colorCode);
                    box.appendChild(rowColor);

                    // 渐变组
                    var rowGrad = document.createElement('div');
                    rowGrad.className = 'control-group';
                    rowGrad.style.display = 'none';
                    var labGrad = document.createElement('label');
                    labGrad.textContent = '渐变背景（本项）';
                    rowGrad.appendChild(labGrad);
                    var gradGrid = document.createElement('div');
                    gradGrid.style.display = 'grid';
                    gradGrid.style.gridTemplateColumns = '1fr 1fr';
                    gradGrid.style.gap = '10px';
                    // 起色
                    var gStartWrap = document.createElement('div');
                    var gStartLab = document.createElement('label');
                    gStartLab.textContent = '起色';
                    gStartWrap.appendChild(gStartLab);
                    var gStartInput = document.createElement('input');
                    gStartInput.type = 'color';
                    gStartInput.value = String(it.cardGradStart || c.itemCardGradStart || c.primaryColor || '#6a717c');
                    gStartWrap.appendChild(gStartInput);
                    var gStartCode = document.createElement('input');
                    gStartCode.type = 'text';
                    gStartCode.placeholder = '#RRGGBB 或 CSS颜色';
                    gStartCode.style.marginTop = '6px';
                    gStartCode.value = String(it.cardGradStart || c.itemCardGradStart || c.primaryColor || '#6a717c');
                    gStartWrap.appendChild(gStartCode);
                    // 终色
                    var gEndWrap = document.createElement('div');
                    var gEndLab = document.createElement('label');
                    gEndLab.textContent = '终色';
                    gEndWrap.appendChild(gEndLab);
                    var gEndInput = document.createElement('input');
                    gEndInput.type = 'color';
                    gEndInput.value = String(it.cardGradEnd || c.itemCardGradEnd || c.secondaryColor || '#97aec8');
                    gEndWrap.appendChild(gEndInput);
                    var gEndCode = document.createElement('input');
                    gEndCode.type = 'text';
                    gEndCode.placeholder = '#RRGGBB 或 CSS颜色';
                    gEndCode.style.marginTop = '6px';
                    gEndCode.value = String(it.cardGradEnd || c.itemCardGradEnd || c.secondaryColor || '#97aec8');
                    gEndWrap.appendChild(gEndCode);
                    gradGrid.appendChild(gStartWrap);
                    gradGrid.appendChild(gEndWrap);
                    rowGrad.appendChild(gradGrid);
                    // 角度
                    var angleRow = document.createElement('div');
                    angleRow.className = 'range-row';
                    var angleLab = document.createElement('label');
                    angleLab.textContent = '角度(°)';
                    angleRow.appendChild(angleLab);
                    var angleRange = document.createElement('input');
                    angleRange.type = 'range';
                    angleRange.min = '0';
                    angleRange.max = '360';
                    angleRange.step = '1';
                    angleRange.value = String(isFinite(it.cardGradAngle) ? Number(it.cardGradAngle) : (isFinite(c.itemCardGradAngle) ? Number(c.itemCardGradAngle) : 135));
                    angleRow.appendChild(angleRange);
                    var anglePill = document.createElement('span');
                    anglePill.className = 'value-pill';
                    var angleVal = document.createElement('span');
                    angleVal.textContent = String(angleRange.value);
                    anglePill.appendChild(angleVal);
                    anglePill.appendChild(document.createTextNode('°'));
                    angleRow.appendChild(anglePill);
                    rowGrad.appendChild(angleRow);
                    box.appendChild(rowGrad);

                    // 图片组
                    var rowImage = document.createElement('div');
                    rowImage.className = 'control-group';
                    rowImage.style.display = 'none';
                    var imgLab = document.createElement('label');
                    imgLab.textContent = '背景图片 URL（本项）';
                    rowImage.appendChild(imgLab);
                    var imgInput = document.createElement('input');
                    imgInput.type = 'url';
                    imgInput.placeholder = 'https://example.com/card-bg.jpg';
                    imgInput.value = String(it.cardBgImageUrl || '');
                    rowImage.appendChild(imgInput);
                    box.appendChild(rowImage);

                    // URL 组
                    var rowUrl = document.createElement('div');
                    rowUrl.className = 'control-group';
                    rowUrl.style.display = 'none';
                    var urlLab = document.createElement('label');
                    urlLab.textContent = '自定义 URL 背景（本项）';
                    rowUrl.appendChild(urlLab);
                    var urlInput = document.createElement('input');
                    urlInput.type = 'url';
                    urlInput.placeholder = 'https://example.com/your-image.png';
                    urlInput.value = String((it.cardBgUrl != null ? it.cardBgUrl : it.cardUrl) || '');
                    rowUrl.appendChild(urlInput);
                    box.appendChild(rowUrl);

                    // 阴影组
                    var rowShadow = document.createElement('div');
                    rowShadow.className = 'control-group';
                    var shLabWrap = document.createElement('label');
                    shLabWrap.style.display = 'flex';
                    shLabWrap.style.alignItems = 'center';
                    shLabWrap.style.gap = '8px';
                    var shCb = document.createElement('input');
                    shCb.type = 'checkbox';
                    shCb.checked = (it.cardShadowEnable != null) ? !!it.cardShadowEnable : !!c.itemCardShadowEnabled;
                    shLabWrap.appendChild(shCb);
                    shLabWrap.appendChild(document.createTextNode('启用阴影（本项）'));
                    rowShadow.appendChild(shLabWrap);
                    var shRangeRow = document.createElement('div');
                    shRangeRow.className = 'range-row';
                    shRangeRow.style.marginTop = '6px';
                    var shRLab = document.createElement('label');
                    shRLab.textContent = '强度';
                    shRangeRow.appendChild(shRLab);
                    var shRange = document.createElement('input');
                    shRange.type = 'range';
                    shRange.min = '0';
                    shRange.max = '1';
                    shRange.step = '0.05';
                    shRange.value = String(isFinite(it.cardShadowStrength) ? Number(it.cardShadowStrength) : (isFinite(c.itemCardShadowStrength) ? Number(c.itemCardShadowStrength) : 0.30));
                    shRange.disabled = !shCb.checked;
                    shRangeRow.appendChild(shRange);
                    var shPill = document.createElement('span');
                    shPill.className = 'value-pill';
                    var shVal = document.createElement('span');
                    shVal.textContent = Number(shRange.value).toFixed(2);
                    shPill.appendChild(shVal);
                    rowShadow.appendChild(shRangeRow);
                    var shSpacer = document.createElement('span'); // 为了匹配结构，附加显示 value-pill
                    shRangeRow.appendChild(shPill);
                    box.appendChild(rowShadow);

                    // 显隐联动
                    function updateVis(){
                      var m = String(modeSel.value || 'inherit');
                      rowColor.style.display = (m === 'color') ? '' : 'none';
                      rowGrad.style.display = (m === 'gradient') ? '' : 'none';
                      rowImage.style.display = (m === 'image') ? '' : 'none';
                      rowUrl.style.display = (m === 'url') ? '' : 'none';
                    }
                    updateVis();

                    // 事件绑定
                    modeSel.addEventListener('change', function(){
                      var v = String(modeSel.value || 'inherit');
                      updateItemById(it.id, { cardBgMode: v });
                      updateVis();
                    });

                    // 纯色
                    function syncColor(val){
                      colorInput.value = val;
                      colorCode.value = val;
                    }
                    colorInput.addEventListener('input', function(){
                      var v = String(colorInput.value || '').trim();
                      syncColor(v);
                      updateItemById(it.id, { cardBgColor: v });
                    });
                    colorCode.addEventListener('change', function(){
                      var v = String(colorCode.value || '').trim();
                      syncColor(v);
                      updateItemById(it.id, { cardBgColor: v });
                    });

                    // 渐变
                    function syncGStart(v){ gStartInput.value = v; gStartCode.value = v; }
                    function syncGEnd(v){ gEndInput.value = v; gEndCode.value = v; }
                    gStartInput.addEventListener('input', function(){
                      var v = String(gStartInput.value || '').trim();
                      syncGStart(v);
                      updateItemById(it.id, { cardGradStart: v });
                    });
                    gStartCode.addEventListener('change', function(){
                      var v = String(gStartCode.value || '').trim();
                      syncGStart(v);
                      updateItemById(it.id, { cardGradStart: v });
                    });
                    gEndInput.addEventListener('input', function(){
                      var v = String(gEndInput.value || '').trim();
                      syncGEnd(v);
                      updateItemById(it.id, { cardGradEnd: v });
                    });
                    gEndCode.addEventListener('change', function(){
                      var v = String(gEndCode.value || '').trim();
                      syncGEnd(v);
                      updateItemById(it.id, { cardGradEnd: v });
                    });
                    angleRange.addEventListener('input', function(){
                      var v = parseInt(angleRange.value, 10) || 0;
                      angleVal.textContent = String(v);
                    });
                    angleRange.addEventListener('change', function(){
                      var v = parseInt(angleRange.value, 10) || 0;
                      updateItemById(it.id, { cardGradAngle: v });
                    });

                    // 图片
                    imgInput.addEventListener('change', function(){
                      var v = String(imgInput.value || '').trim();
                      updateItemById(it.id, { cardBgImageUrl: v });
                    });

                    // URL
                    urlInput.addEventListener('change', function(){
                      var v = String(urlInput.value || '').trim();
                      updateItemById(it.id, { cardBgUrl: v });
                    });

                    // 阴影
                    shCb.addEventListener('change', function(){
                      var on = !!shCb.checked;
                      shRange.disabled = !on;
                      updateItemById(it.id, { cardShadowEnable: on });
                    });
                    shRange.addEventListener('input', function(){
                      var v = Math.max(0, Math.min(1, parseFloat(shRange.value) || 0));
                      shVal.textContent = v.toFixed(2);
                    });
                    shRange.addEventListener('change', function(){
                      var v = Math.max(0, Math.min(1, parseFloat(shRange.value) || 0));
                      updateItemById(it.id, { cardShadowStrength: v });
                    });

                    // 附加到当前项容器
                    wrap.appendChild(box);
                  } catch(_eCard){}
                })();

                // 其它类型：仅显示标题与删除按钮（不变更现有行为）
                cont.appendChild(wrap);
              });
            }

            // 添加新项目
            (function bindAddItem(){
              try {
                var sel = body.querySelector('#add-item-select');
                var btn = sel ? sel.parentElement && sel.parentElement.querySelector('button.btn-primary') : null;
                if (btn && !btn.__nyBound) {
                  btn.__nyBound = true;
                  btn.addEventListener('click', function(){
                    try {
                      var type = String(sel && sel.value || 'text').toLowerCase();
                      var items = getItems();
                      if (type === 'longtext') {
                        var defLh = (State.customization && typeof State.customization.longTextLineHeight === 'number') ? State.customization.longTextLineHeight : 1.6;
                        items.push({
                          id: newId(),
                          type: 'longtext',
                          label: '说明',
                          value: '',
                          ltLineHeight: defLh,
                          ltEffect: 'none',
                          ltSkipFirstLine: false,
                          ltFirstIndentPx: 0,
                          ltPadTopPx: 0,
                          ltPadRightPx: 0,
                          ltPadBottomPx: 0,
                          ltPadLeftPx: 0,
                          ltTwSpeedMs: 18,
                          ltTwDelayMs: 0,
                          ltTwCaret: true
                        });
                      } else if (type === 'text') {
                        items.push({ id: newId(), type: 'text', label: '标签', value: '' });
                      } else if (type === 'bar') {
                        items.push({ id: newId(), type: 'bar', label: '进度', percent: 50 });
                      } else if (type === 'divider') {
                        items.push({ id: newId(), type: 'divider' });
                      }
                      setItems(items);
                      renderItemsEditor();
                    } catch(_eAdd){}
                  });
                }
              } catch(_e){}
            })();

            // 初次渲染
            renderItemsEditor();

            // 监听 items 外部变更（粗粒度刷新编辑器）
            try {
              var mo = new (window.MutationObserver || window.WebKitMutationObserver || function(){ this.observe=function(){}; this.disconnect=function(){}; }) (function(){
                try { renderItemsEditor(); } catch(_e){}
              });
              var preview = document.getElementById('live-preview-container');
              if (preview && mo && mo.observe) {
                mo.observe(preview, { childList: true, subtree: true });
              }
            } catch(_eMO){}
          } catch(_eSetup){}
        })();
      }

      if (Ny.Sections && Ny.Sections.ItemsParts) {
        renderNow();
        return;
      }

      try {
        var s = global.document.createElement('script');
        s.src = 'js/sections/section.items.parts.js';
        s.async = false;
        s.onload = renderNow;
        s.onerror = function(){ try{ console.error('[Ny.Sections] Failed to load section.items.parts.js'); }catch(_e){} };
        (global.document.head || global.document.documentElement).appendChild(s);
      } catch(_e) {
        renderNow();
      }
    } catch (e) {
      try { console.warn('[Ny.Sections] renderItems error', e); } catch(_e) {}
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);