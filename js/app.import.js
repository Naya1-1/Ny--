(function (window, document) {
  'use strict';
  var Ny = window.Ny = window.Ny || {};
  Ny.Import = Ny.Import || (function () {
    var initialized = false;

    function init() {
      if (initialized) return;
      initialized = true;
      try {
        console.debug('[Ny.Import] init');
        attachImportButton();
      } catch (e) {
        try { console.warn('[Ny.Import] init warn', e); } catch(_e){}
      }
    }
    function ensure(){ if(!initialized) init(); }

    // 在“生成代码”正上方插入“导入正则”按钮，样式参考“手机端/电脑端”按钮
    function attachImportButton() {
      try {
        var container = document.querySelector('.generate-btn-container');
        var genBtn = document.getElementById('generate-btn');
        if (!container || !genBtn) return;

        // 避免重复创建
        var exists = document.getElementById('import-config-btn');
        if (exists) return;

        // 创建隐藏的文件输入
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json,.json';
        fileInput.style.display = 'none';
        fileInput.id = 'import-config-file';
        document.body.appendChild(fileInput);

        // 创建按钮
        var btn = document.createElement('button');
        btn.id = 'import-config-btn';
        btn.title = '导入本项目导出的“酒馆正则文件”（JSON）并恢复配置';
        btn.textContent = '📥 导入正则';
        // 参考 device-toggle 的简洁风格
        btn.setAttribute('data-mode', 'import');
        btn.style.padding = '6px 10px';
        btn.style.borderRadius = '8px';
        btn.style.background = '#2a2d34';
        btn.style.color = '#fff';
        btn.style.border = '1px solid rgba(255,255,255,.15)';
        btn.style.cursor = 'pointer';

        // 插入到“生成代码”之前（正上方/同一容器内）
        if (genBtn && genBtn.parentNode) {
          genBtn.parentNode.insertBefore(btn, genBtn);
          // 保持容器为水平排列的紧凑按钮组
          try {
            var st = container.getAttribute('style') || '';
            if (!/display\s*:\s*flex/i.test(st)) {
              container.setAttribute('style', (st ? st + '; ' : '') + 'display:flex; justify-content:flex-end; align-items:center; gap:10px;');
            }
          } catch(_e2){}
        } else {
          container.appendChild(btn);
        }

        // 绑定交互
        btn.addEventListener('click', function () {
          try { fileInput.value = ''; } catch(_e0){}
          try { fileInput.click(); } catch(_e1){}
        });

        fileInput.addEventListener('change', function (evt) {
          try {
            var f = evt.target.files && evt.target.files[0];
            if (!f) return;
            readRegexJsonFromFile(f)
              .then(function (json) {
                // 诊断假设：本项目导出的 JSON 至少包含 findRegex 和 replaceString
                console.debug('[Ny.Import] file parsed', {
                  hasFindRegex: !!(json && (typeof json.findRegex === 'string' || (json.findRegex && json.findRegex.pattern))),
                  hasReplaceString: !!(json && json.replaceString),
                  keys: Object.keys(json || {})
                });
                // 提取 replaceString 的 HTML
                var snippetHtml = extractFencedHtml(json.replaceString || '');
                if (!/\S/.test(snippetHtml)) {
                  // 有些旧导出仅包含静态分组片段，不带围栏
                  snippetHtml = String(json.replaceString || '');
                }
                if (!/\S/.test(snippetHtml)) {
                  throw new Error('无法从 replaceString 提取 HTML 片段');
                }
                var parsed = parseReplaceHtml(snippetHtml);
                // 将 findRegex 一并纳入审计，便于校验分组数量
                var pattern = (typeof json.findRegex === 'string') ? json.findRegex : (json.findRegex && json.findRegex.pattern ? json.findRegex.pattern : '');
                parsed.findRegex = pattern || '';
                applyParsedConfig(parsed);
              })
              .catch(function (err) {
                try { showError('导入失败', err); } catch(_e) {}
              });
          } catch (e) {
            try { showError('选择文件失败', e); } catch(_e) {}
          }
        });
      } catch (e) {
        try { console.warn('[Ny.Import] attachImportButton warn', e); } catch(_e){}
      }
    }

    // 文件读取 + JSON 解析（稳健）
    function readRegexJsonFromFile(file) {
      return new Promise(function (resolve, reject) {
        try {
          var reader = new FileReader();
          reader.onerror = function (e) { reject(new Error('文件读取失败')); };
          reader.onload = function (e) {
            try {
              var txt = String(e.target.result || '');
              var json = JSON.parse(txt);
              resolve(json);
            } catch (parseErr) {
              // 兜底：尝试从文本中提取 JSON（去除前后噪声）
              try {
                var match = txt.match(/\{[\s\S]*\}$/);
                if (match) {
                  var json2 = JSON.parse(match[0]);
                  resolve(json2);
                  return;
                }
              } catch(_e2){}
              reject(parseErr);
            }
          };
          reader.readAsText(file, 'utf-8');
        } catch (e) {
          reject(e);
        }
      });
    }

    // 从围栏字符串（``` ... ```）中提取 HTML
    function extractFencedHtml(s) {
      try {
        var str = String(s || '');
        var m = str.match(/```(?:html)?\s*([\s\S]*?)\s*```/i);
        return m ? m[1] : '';
      } catch (_e) { return ''; }
    }

    // 解析静态分组片段 HTML，恢复主题/布局/样式/项目结构
    function parseReplaceHtml(htmlStr) {
      var doc = document.implementation.createHTMLDocument('ny-import');
      doc.documentElement.innerHTML = String(htmlStr || '');
      var wrap = doc.getElementById('ny-status') || doc.querySelector('.status-preview-wrapper');

      // 最可能问题源（诊断假设）
      // 1) replaceString 不包含 wrapper（ny-status），导致主题/布局提取失败
      // 2) 片段含旧类名或不完整样式，无法映射到现有 customization 字段
      // 加入日志验证以上两点
      console.debug('[Ny.Import] diagnosing', {
        hasWrapper: !!wrap,
        wrapperClass: wrap ? String(wrap.getAttribute('class') || '') : '',
        wrapperStyle: wrap ? String(wrap.getAttribute('style') || '') : ''
      });

      var result = {
        title: '',
        theme: 'theme-mystic-noir',
        customization: {},
        items: []
      };

      // 1) 主题/布局/百分比显示等来自 wrapper class
      try {
        var cls = wrap ? (wrap.getAttribute('class') || '') : '';
        var themeMatch = cls.match(/theme-[a-z0-9-]+/i);
        result.theme = themeMatch ? themeMatch[0] : 'theme-mystic-noir';
        // 百分比显示
        var pctMatch = cls.match(/percent-style-[a-z-]+/i);
        if (pctMatch) {
          result.customization.percentDisplay = pctMatch[0].replace('percent-style-', '');
        }
        // 布局
        if (/\blayout-two-column\b/i.test(cls)) {
          result.customization.layout = 'two-column';
        } else if (/\bratio-layout\b/i.test(cls)) {
          // ratio-layout 对应默认“label-left”比例布局
          result.customization.layout = 'label-left';
        }
        // 动画（进入/长驻）
        var enterAnim = null, loopAnim = null;
        if (/\banim-fade-in\b/i.test(cls)) enterAnim = 'fade';
        if (/\banim-slide-up\b/i.test(cls)) enterAnim = 'slide';
        if (/\banim-pulse\b/i.test(cls)) loopAnim = 'pulse';
        if (/\banim-neon-glow\b/i.test(cls)) loopAnim = 'neon';
        if (/\banim-shimmer\b/i.test(cls)) loopAnim = 'shimmer';
        if (/\banim-tilt-3d\b/i.test(cls)) loopAnim = 'tilt3d';
        if (/\banim-breathe\b/i.test(cls)) loopAnim = 'breathe';
        if (/\banim-gloss\b/i.test(cls)) loopAnim = 'gloss';
        result.__animations = { enter: enterAnim || 'none', loop: loopAnim || 'none' };
      } catch (_eCls) {}

      // 2) 包装器内联样式 -> 字体/圆角/字距/行高/不透明度/变量
      try {
        var st = wrap ? (wrap.getAttribute('style') || '') : '';
        function pickStyle(name, transform) {
          var re = new RegExp(name + '\\s*:\\s*([^;]+);?', 'i');
          var m = st.match(re);
          var v = m ? m[1].trim() : '';
          return transform ? transform(v) : v;
        }
        var ff = pickStyle('font-family');
        if (ff) result.customization.fontFamily = ff;
        var radius = pickStyle('border-radius', function (v) { return parseInt(v, 10) || 12; });
        if (isFinite(radius)) result.customization.radius = radius;
        var ls = pickStyle('letter-spacing', function (v){ return parseFloat(v) || 0; });
        if (isFinite(ls)) result.customization.letterSpacing = ls;
        var lh = pickStyle('line-height', function (v){ return parseFloat(v) || 1.4; });
        if (isFinite(lh)) result.customization.lineHeight = lh;
        var op = pickStyle('opacity', function (v){ return parseFloat(v) || 1; });
        if (isFinite(op)) result.customization.opacity = op;

        // 预览最大宽度：本片段通常固定 clamp(...)，不必还原，沿用项目默认/用户当前

        // 两列/比例变量
        var twoColLabel = pickStyle('--two-col-label', function(v){ return parseInt(v, 10) || null; });
        var twoColValue = pickStyle('--two-col-value', function(v){ return parseInt(v, 10) || null; });
        var twoColGap   = pickStyle('--two-col-gap', function(v){ return parseInt(v, 10) || null; });
        if (result.customization.layout === 'two-column') {
          if (isFinite(twoColLabel)) result.customization.twoColLabelPct = twoColLabel;
          if (isFinite(twoColGap)) result.customization.twoColGap = twoColGap;
        }
        var lvLabelPct = pickStyle('--lv-label', function(v){ return parseInt(v, 10) || null; });
        if (isFinite(lvLabelPct)) result.customization.lvLabelPct = lvLabelPct;

        // 全局进度条颜色变量
        var barColor = pickStyle('--bar-color');
        if (barColor) result.customization.section2BarColor = barColor;

        // Glow/动画变量
        var glowA = pickStyle('--glow-color-a');
        var glowB = pickStyle('--glow-color-b');
        var glowSpeed = pickStyle('--glow-speed', function(v){ return parseFloat(String(v).replace(/s$/i, '')) || 1; });
        var animSpeed = pickStyle('--anim-speed', function(v){ return parseFloat(String(v).replace(/s$/i, '')) || 1; });
        var animIntensity = pickStyle('--anim-intensity', function(v){ return parseFloat(v) || 0.7; });
        if (glowA) result.customization.glowColorA = glowA;
        if (glowB) result.customization.glowColorB = glowB;
        if (isFinite(glowSpeed)) result.customization.glowSpeed = glowSpeed;
        if (isFinite(animSpeed)) result.__animSpeed = animSpeed;
        if (isFinite(animIntensity)) result.__animIntensity = animIntensity;
      } catch (_eStyle) {}

      // 3) 标题
      try {
        var titleNode = doc.querySelector('.st-header .st-title');
        result.title = titleNode ? String(titleNode.textContent || '').trim() : '';
      } catch (_eTitle) {}

      // 4) 项目列表
      try {
        var list = doc.querySelectorAll('.st-body .st-item');
        list.forEach(function (el) {
          try {
            var t = (el.getAttribute('data-type') || '').toLowerCase();
            // 优先从标记类型判定，否则从结构判定
            if (!t) {
              if (el.querySelector('.st-progress-bar')) t = 'bar';
              else if (el.querySelector('.st-longtext')) t = 'longtext';
              else t = 'text';
            }
            var labelNode = el.querySelector('.st-label');
            var valueNode = el.querySelector('.st-value');
            var item = {
              type: t,
              label: labelNode ? String(labelNode.textContent || '').trim() : ''
            };
            // 每项局部偏移/值框变量
            var elStyle = el.getAttribute('style') || '';
            var valStyle = valueNode ? (valueNode.getAttribute('style') || '') : '';
            function pickLocal(styleStr, name, trans) {
              try {
                var re = new RegExp(name + '\\s*:\\s*([^;]+);?', 'i');
                var m = styleStr.match(re);
                var v = m ? m[1].trim() : '';
                return trans ? trans(v) : v;
              } catch(_e){ return ''; }
            }
            var iOff = pickLocal(elStyle, '--item-offset-pct', function(v){ return parseInt(v, 10); });
            var iOffR = pickLocal(elStyle, '--item-offset-right-pct', function(v){ return parseInt(v, 10); });
            var vbW = pickLocal(valStyle, '--vb-width-pct', function(v){ return parseInt(v, 10); });
            var vbO = pickLocal(valStyle, '--vb-offset-pct', function(v){ return parseInt(v, 10); });
            if (isFinite(iOff)) item.itemOffsetPct = iOff;
            if (isFinite(iOffR)) item.itemOffsetRightPct = iOffR;
            if (isFinite(vbW)) item.vbWidthPct = vbW;
            if (isFinite(vbO)) item.vbOffsetPct = vbO;

            // 颜色/字体样式（用于恢复“第三部分项目颜色”和字体风格）
            var lblStyle = labelNode ? (labelNode.getAttribute('style') || '') : '';
            var valStyleStr = valueNode ? (valueNode.getAttribute('style') || '') : '';
            function pickInline(styleStr, name){ var m = styleStr.match(new RegExp(name + '\\s*:\\s*([^;]+);?', 'i')); return m ? m[1].trim() : ''; }
            var lblColor = pickInline(lblStyle, 'color');
            var valColor = pickInline(valStyleStr, 'color');
            var lblFF = pickInline(lblStyle, 'font-family');
            var valFF = pickInline(valStyleStr, 'font-family');
            var lblWeight = pickInline(lblStyle, 'font-weight');
            var valWeight = pickInline(valStyleStr, 'font-weight');
            var lblItalic = /font-style\s*:\s*italic/i.test(lblStyle);
            var valItalic = /font-style\s*:\s*italic/i.test(valStyleStr);
            var lblUpper = /text-transform\s*:\s*uppercase/i.test(lblStyle);
            var valUpper = /text-transform\s*:\s*uppercase/i.test(valStyleStr);

            // 收敛到全局（若尚未设置）
            if (lblColor && !result.customization.section2LabelColor) result.customization.section2LabelColor = lblColor;
            if (valColor && !result.customization.section2ValueColor) result.customization.section2ValueColor = valColor;
            if (lblFF && !result.customization.globalLabelFontFamily) result.customization.globalLabelFontFamily = lblFF;
            if (valFF && !result.customization.globalValueFontFamily) result.customization.globalValueFontFamily = valFF;
            if (lblWeight && !result.customization.globalLabelWeight) result.customization.globalLabelWeight = parseInt(lblWeight, 10) || 500;
            if (valWeight && !result.customization.globalValueWeight) result.customization.globalValueWeight = parseInt(valWeight, 10) || 600;
            if (result.customization.globalLabelItalic == null) result.customization.globalLabelItalic = !!lblItalic;
            if (result.customization.globalValueItalic == null) result.customization.globalValueItalic = !!valItalic;
            if (result.customization.globalLabelUppercase == null) result.customization.globalLabelUppercase = !!lblUpper;
            if (result.customization.globalValueUppercase == null) result.customization.globalValueUppercase = !!valUpper;

            if (t === 'text') {
              item.value = ''; // 导入不提供具体值，留空供用户编辑
            } else if (t === 'longtext') {
              // 行距与特效（含 data-effect 识别）
              var effClass = (valueNode ? String(valueNode.getAttribute('class') || '') : '');
              var effAttr = (valueNode ? String(valueNode.getAttribute('data-effect') || '') : '');
              if (/^typewriter$/i.test(effAttr)) {
                item.ltEffect = 'typewriter';
              } else if (/st-longtext/i.test(effClass)) {
                if (/anim-fade-in/i.test(effClass)) item.ltEffect = 'fade';
                else if (/anim-slide-up/i.test(effClass)) item.ltEffect = 'slide';
                else item.ltEffect = 'none';
              } else {
                item.ltEffect = 'none';
              }
              // 从 style 恢复行距
              var ln = pickInline(valStyleStr, 'line-height');
              item.ltLineHeight = ln ? parseFloat(ln) || 1.6 : 1.6;

              // 新增：恢复首字缩进与四边距，以及“空出首行”标记（data-lt-skip-first）
              (function restoreIndentAndPadding(){
                try {
                  function parsePx(v){
                    if (v == null || v === '') return null;
                    var s = String(v);
                    // 支持常规 px 与 calc 场景下提取 px 项
                    var m = s.match(/(-?\d+(?:\.\d+)?)\s*px/i);
                    if (m) return parseFloat(m[1]);
                    var n = parseFloat(s);
                    return isFinite(n) ? n : null;
                  }
                  // 首字缩进
                  var ti = parsePx(pickInline(valStyleStr, 'text-indent'));
                  if (ti != null && isFinite(ti) && ti > 0) item.ltFirstIndentPx = ti;

                  // padding-*
                  var ptRaw = pickInline(valStyleStr, 'padding-top');
                  var prRaw = pickInline(valStyleStr, 'padding-right');
                  var pbRaw = pickInline(valStyleStr, 'padding-bottom');
                  var plRaw = pickInline(valStyleStr, 'padding-left');

                  var pt = parsePx(ptRaw);
                  var pr = parsePx(prRaw);
                  var pb = parsePx(pbRaw);
                  var pl = parsePx(plRaw);

                  if (pt != null && isFinite(pt)) item.ltPadTopPx = pt;
                  if (pr != null && isFinite(pr)) item.ltPadRightPx = pr;
                  if (pb != null && isFinite(pb)) item.ltPadBottomPx = pb;
                  if (pl != null && isFinite(pl)) item.ltPadLeftPx = pl;

                  // 空出首行：导出时在 .st-longtext 上写 data-lt-skip-first
                  var skip = valueNode ? valueNode.getAttribute('data-lt-skip-first') : null;
                  if (skip != null) item.ltSkipFirstLine = true;
                } catch(_e){}
              })();

              item.value = '';
            } else if (t === 'bar') {
              // pf-anim-grow + 风格类
              var fill = el.querySelector('.st-progress-bar .st-progress-bar-fill');
              var fillCls = fill ? String(fill.getAttribute('class') || '') : '';
              var fillStyle = fill ? String(fill.getAttribute('style') || '') : '';
              if (/pf-anim-grow/i.test(fillCls)) result.customization.barAnimation = 'grow';
              if (/pf-glow/i.test(fillCls)) result.customization.barStyle = 'glow';
              else if (/pf-striped/i.test(fillCls)) result.customization.barStyle = 'striped';
              else if (/pf-glass/i.test(fillCls)) result.customization.barStyle = 'glass';
              else if (result.customization.barStyle == null) result.customization.barStyle = 'normal';
              // 颜色
              var fillBG = pickInline(fillStyle, 'background') || pickInline(fillStyle, 'background-color');
              if (fillBG && !result.customization.section2BarColor) result.customization.section2BarColor = fillBG;
              // 初始百分比（导入时不给具体值）
              item.percent = 50;
            }
            result.items.push(item);
          } catch (_eItem) {}
        });
      } catch (_eList) {}

      // 5) 分割线风格：片段中 hr 的 style 可推断
      try {
        var hr = doc.querySelector('.st-body hr');
        if (hr) {
          var hs = hr.getAttribute('style') || '';
          if (/dashed/i.test(hs)) result.customization.dividerStyle = 'dashed';
          else if (/linear-gradient/i.test(hs)) result.customization.dividerStyle = 'gradient';
          else result.customization.dividerStyle = 'line';
        }
      } catch (_eHR) {}

      return result;
    }

    // 应用解析结果到 Ny.State 并刷新预览/输出
    function applyParsedConfig(parsed) {
      try {
        var State = Ny.State || {};
        var Render = Ny.Render || {};
        var Export = Ny.Export || {};

        // 诊断确认：分组数量与解析到的 item 数一致（若 findRegex 提供）
        try {
          var pat = String(parsed.findRegex || '');
          var groups = 0;
          // 简单统计括号组（排除非捕获）
          var re = /\((?!\?:)/g; var m; while ((m = re.exec(pat)) !== null) groups++;
          console.debug('[Ny.Import] groups vs items', { regexGroups: groups, itemsParsed: parsed.items.length });
        } catch(_eG){}

        // 主题
        try {
          if (typeof State.applyThemeDefaults === 'function') {
            State.applyThemeDefaults(parsed.theme || 'theme-mystic-noir');
          } else {
            State.currentTheme = parsed.theme || 'theme-mystic-noir';
          }
        } catch(_eTh){ State.currentTheme = parsed.theme || State.currentTheme || 'theme-mystic-noir'; }

        // 标题
        try {
          if (typeof State.setTitle === 'function') State.setTitle(parsed.title || '角色状态');
          else State.currentTitle = parsed.title || '角色状态';
        } catch(_eTi){ State.currentTitle = parsed.title || State.currentTitle || '角色状态'; }

        // customization 合并
        var c0 = parsed.customization || {};
        // 最可能问题源（二次诊断）：不完整的 customization 导致渲染丢样式
        console.debug('[Ny.Import] customization snapshot', c0);

        try {
          if (typeof State.patchCustomization === 'function') {
            State.patchCustomization(Object.assign({}, c0));
          } else {
            State.customization = Object.assign({}, State.customization || {}, c0);
          }
        } catch(_eCu){
          State.customization = Object.assign({}, State.customization || {}, c0);
        }

        // 动画参数
        try {
          if (typeof State.setAnimations === 'function') {
            var enter = (parsed.__animations && parsed.__animations.enter) || 'none';
            var loop  = (parsed.__animations && parsed.__animations.loop)  || 'none';
            State.setAnimations(enter, loop);
          }
          if (typeof State.setAnimParams === 'function') {
            var spd = isFinite(parsed.__animSpeed) ? parsed.__animSpeed : 1.0;
            var inten = isFinite(parsed.__animIntensity) ? parsed.__animIntensity : 0.7;
            State.setAnimParams(spd, inten);
          }
        } catch(_eAn){}

        // items
        try {
          if (typeof State.setItems === 'function') State.setItems(JSON.parse(JSON.stringify(parsed.items || [])));
          else State.items = JSON.parse(JSON.stringify(parsed.items || []));
        } catch(_eIt){
          State.items = JSON.parse(JSON.stringify(parsed.items || []));
        }

        // 渲染与输出刷新
        try { if (Render && typeof Render.renderPreview === 'function') Render.renderPreview(); } catch(_eR){}
        try { if (Export && typeof Export.refreshOutputs === 'function') Export.refreshOutputs(false, { inlineGroup: true }); } catch(_eE){}

        // 结果提示
        try {
          var msg = [
            '导入完成：已恢复主题/布局/字体/项目结构',
            '主题: ' + (parsed.theme || 'theme-mystic-noir'),
            '项目数: ' + (parsed.items || []).length,
            '标题: ' + (parsed.title || '角色状态')
          ].join('\n');
          console.info('[Ny.Import] done\n' + msg);
        } catch(_eI){}
      } catch (e) {
        try { showError('应用配置失败', e); } catch(_e){}
      }
    }

    function showError(message, err) {
      try {
        var modal = document.getElementById('ny-error-modal');
        if (!modal) {
          modal = document.createElement('div');
          modal.id = 'ny-error-modal';
          modal.style.position = 'fixed';
          modal.style.inset = '0';
          modal.style.zIndex = '99999';
          modal.style.display = 'none';
          modal.innerHTML =
            '<div class="ny-error-backdrop" style="position:absolute;inset:0;background:rgba(0,0,0,.45)"></div>' +
            '<div class="ny-error-dialog" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,520px);background:#1b1c20;color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.45);overflow:hidden">' +
              '<div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);font-weight:600">导入失败</div>' +
              '<div class="ny-error-body" style="padding:16px;white-space:pre-wrap;word-break:break-word;max-height:60vh;overflow:auto"></div>' +
              '<div style="padding:12px 16px;display:flex;justify-content:flex-end;border-top:1px solid rgba(255,255,255,.08)">' +
                '<button id="ny-error-close" style="padding:6px 12px;border-radius:8px;background:#2a2d34;color:#fff;border:1px solid rgba(255,255,255,.15);cursor:pointer">关闭</button>' +
              '</div>' +
            '</div>';
          document.body.appendChild(modal);
          var close = modal.querySelector('#ny-error-close');
          var backdrop = modal.querySelector('.ny-error-backdrop');
          [close, backdrop].forEach(function(n){
            if (n && !n.__nyBound) {
              n.__nyBound = true;
              n.addEventListener('click', function(){ modal.style.display = 'none'; });
            }
          });
        }
        var body = modal.querySelector('.ny-error-body');
        var msg = String(message || '导入失败');
        if (err) {
          try { msg += '\n\n' + (err.message || err.stack || String(err)); } catch(_e2){}
        }
        if (body) { body.textContent = msg; }
        modal.style.display = 'block';
      } catch(_e) {
        try { alert((message || '导入失败') + '\n\n' + (err && (err.message || err.stack || String(err)))); } catch(_ee){}
      }
    }

    return {
      init: init,
      ensure: ensure,
      attachImportButton: attachImportButton,
      readRegexJsonFromFile: readRegexJsonFromFile,
      parseReplaceHtml: parseReplaceHtml,
      applyParsedConfig: applyParsedConfig
    };
  })();

  window.addEventListener('DOMContentLoaded', function () {
    try { if (Ny && Ny.Import && typeof Ny.Import.init === 'function') Ny.Import.init(); } catch(_e){}
  });
})(window, document);