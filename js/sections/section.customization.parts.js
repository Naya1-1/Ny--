(function(global){
  'use strict';
  var Ny = global.Ny || (global.Ny = {});
  Ny.Sections = Ny.Sections || {};
  var P = Ny.Sections.CustomizationParts = Ny.Sections.CustomizationParts || {};

  // 2.1 字体
  P.fonts = function(){
    return `
      <div class="form-group-box" data-title="2.1 字体"><div class="form-box-title">2.1 字体</div>
        <div class="control-group">
          <label for="font-family-select">字体家族</label>
          <select id="font-family-select">
            <option value="Noto Sans SC, sans-serif">Noto Sans SC（默认）</option>
            <option value="Inter, Noto Sans SC, sans-serif">Inter</option>
            <option value="Georgia, Songti SC, serif">Georgia / 宋体</option>
            <option value="'Courier New', Courier, monospace">Courier New</option>
            <option value="'Times New Roman', Georgia, serif">Times New Roman</option>
            <optgroup label="📱 像素体">
              <option value="'BoutiqueBitmap9x9', monospace">精品点阵体9×9</option>
            </optgroup>
            <optgroup label="✨ 英文花体">
              <option value="'Dancing Script', cursive">Dancing Script（舞动花体）</option>
              <option value="'Pacifico', cursive">Pacifico（温和花体）</option>
              <option value="'Great Vibes', cursive">Great Vibes（优雅花体）</option>
              <option value="'Allura', cursive">Allura（华丽花体）</option>
            </optgroup>
            <optgroup label="✍️ 手写体">
              <option value="'Caveat', cursive">Caveat（休闲手写）</option>
              <option value="'Indie Flower', cursive">Indie Flower（独立手写）</option>
              <option value="'Shadows Into Light', cursive">Shadows Into Light（阴影手写）</option>
              <option value="'Permanent Marker', cursive">Permanent Marker（马克笔）</option>
            </optgroup>
            <optgroup label="🚀 科技感">
              <option value="'Rajdhani', sans-serif">Rajdhani（现代科技）</option>
              <option value="'Audiowide', cursive">Audiowide（数字科技）</option>
              <option value="'Electrolize', sans-serif">Electrolize（电子科技）</option>
            </optgroup>
            <optgroup label="🎨 中文艺术">
              <option value="'Ma Shan Zheng', cursive">马善政楷体</option>
              <option value="'ZCOOL XiaoWei', serif">站酷小薇LOGO体</option>
              <option value="'Long Cang', cursive">龙藏体</option>
              <option value="'Zhi Mang Xing', cursive">志莽行体</option>
            </optgroup>
            <optgroup label="📖 衬线体">
              <option value="'Merriweather', serif">Merriweather（优雅衬线）</option>
              <option value="'Playfair Display', serif">Playfair Display（展示衬线）</option>
            </optgroup>
            <optgroup label="🔤 无衬线扩展">
              <option value="'Roboto', sans-serif">Roboto（现代无衬线）</option>
              <option value="'Montserrat', sans-serif">Montserrat（时尚无衬线）</option>
            </optgroup>
          </select>
        </div>

        <div class="control-group">
          <label>自定义字体导入</label>
          <div style="display:grid; gap:8px;">
            <input type="url" id="custom-font-url" placeholder="https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap">
            <button class="btn btn-primary" id="btn-import-custom-font" style="width: 100%;">
              <i class="fa fa-download"></i> 导入字体
            </button>
          </div>
          <p style="color: var(--text-secondary); font-size: 12px; margin-top:6px;">
            <i class="fa fa-info-circle"></i> 仅需输入字体 CSS 链接（如 Google Fonts），系统将自动识别 font-family 并加入下拉菜单；如需覆盖可在“高级字体样式”中选择不同字体。
          </p>
        </div>
      </div>
    `;
  };

  // 2.2 标题
  P.title = function(){
    return `
      <div class="form-group-box" data-title="2.2 标题"><div class="form-box-title">2.2 标题</div>
        <div class="control-group">
          <label style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="title-enabled-checkbox" checked> 是否启用标题
          </label>
          <p style="color: var(--text-secondary); font-size: 12px; margin-top:6px;">取消勾选后，将隐藏状态栏标题区域。</p>
        </div>
        <div class="control-group">
          <label>标题字号</label>
          <div class="range-row">
            <input type="range" id="title-font-size-range" min="12" max="36" step="1" value="20">
            <span class="value-pill"><span id="title-font-size-value">20</span>px</span>
          </div>
        </div>

        <div class="inline-subbox title-area-box">
          <div class="form-box-title">标题区域高级样式</div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div class="range-row">
              <label>最小高度(px)</label>
              <input type="range" id="header-min-height-range" min="0" max="200" step="1" value="0">
              <span class="value-pill"><span id="header-min-height-value">0</span>px</span>
            </div>
            <div class="range-row">
              <label>上下内边距(px)</label>
              <input type="range" id="header-padding-y-range" min="0" max="24" step="1" value="0">
              <span class="value-pill"><span id="header-padding-y-value">0</span>px</span>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:8px;">
            <div>
              <label for="header-align-select">标题对齐</label>
              <select id="header-align-select">
                <option value="inherit" selected>保持模板</option>
                <option value="left">左对齐</option>
                <option value="center">居中</option>
                <option value="right">右对齐</option>
              </select>
            </div>
            <div>
              <label style="display:flex;align-items:center;gap:8px;">
                <input type="checkbox" id="title-gap-enable"> 启用图标与标题间距
              </label>
              <div class="range-row" style="margin-top:6px;">
                <input type="range" id="title-gap-range" min="0" max="40" step="1" value="10" disabled>
                <span class="value-pill"><span id="title-gap-value">10</span>px</span>
              </div>
            </div>
          </div>

          <div class="inline-subbox" style="margin-top:10px;">
            <div class="form-box-title">标题颜色与特效</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
              <div>
                <label for="title-color-mode-select">颜色模式</label>
                <select id="title-color-mode-select">
                  <option value="theme" selected>跟随模板</option>
                  <option value="solid">纯色</option>
                  <option value="gradient">渐变</option>
                </select>
              </div>
              <div id="title-color-solid-group" style="display:none;">
                <label>纯色</label>
                <input type="color" id="title-color-solid-input" value="#ffffff">
                <input type="text" id="title-color-solid-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#ffffff" style="margin-top:6px;">
              </div>
            </div>

            <div id="title-color-gradient-group" style="display:none; margin-top:8px;">
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div>
                  <label>起色</label>
                  <input type="color" id="title-grad-start-input" value="#85a6f8">
                  <input type="text" id="title-grad-start-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#85a6f8" style="margin-top:6px;">
                </div>
                <div>
                  <label>终色</label>
                  <input type="color" id="title-grad-end-input" value="#95b3e8">
                  <input type="text" id="title-grad-end-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#95b3e8" style="margin-top:6px;">
                </div>
              </div>
              <div class="range-row" style="margin-top:8px;">
                <label>角度(°)</label>
                <input type="range" id="title-grad-angle-range" min="0" max="360" step="1" value="0">
                <span class="value-pill"><span id="title-grad-angle-value">0</span>°</span>
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:8px;">
              <div>
                <label style="display:flex;align-items:center;gap:8px;">
                  <input type="checkbox" id="title-glow-enable"> 标题光晕
                </label>
                <div class="range-row" style="margin-top:6px;">
                  <label>强度</label>
                  <input type="range" id="title-glow-intensity-range" min="0" max="1" step="0.05" value="0.50" disabled>
                  <span class="value-pill"><span id="title-glow-intensity-value">0.50</span></span>
                </div>
              </div>
              <div>
                <label style="display:flex;align-items:center;gap:8px;">
                  <input type="checkbox" id="title-shadow-enable"> 标题阴影
                </label>
                <div class="range-row" style="margin-top:6px;">
                  <label>强度</label>
                  <input type="range" id="title-shadow-strength-range" min="0" max="1" step="0.05" value="0.30" disabled>
                  <span class="value-pill"><span id="title-shadow-strength-value">0.30</span></span>
                </div>
              </div>
            </div>
          </div>

          <div class="inline-subbox" style="margin-top:10px;">
            <div class="form-box-title">标题高级样式</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
              <div>
                <label for="title-weight-select">字重</label>
                <select id="title-weight-select">
                  <option value="400">常规(400)</option>
                  <option value="500" selected>中等(500)</option>
                  <option value="600">半粗(600)</option>
                  <option value="700">加粗(700)</option>
                </select>
                <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                  <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="title-italic-checkbox"> 倾斜</label>
                  <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="title-uppercase-checkbox"> 大写</label>
                </div>
              </div>
              <div class="range-row">
                <label>字距</label>
                <input type="range" id="title-letter-spacing-range" min="0" max="0.2" step="0.01" value="0">
                <span class="value-pill"><span id="title-letter-spacing-value">0.00</span>em</span>
              </div>
            </div>

            <div class="inline-subbox" style="margin-top:10px;">
              <div class="form-box-title">下划线</div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div>
                  <label for="title-underline-style-select">样式</label>
                  <select id="title-underline-style-select">
                    <option value="none" selected>无</option>
                    <option value="solid">实线</option>
                    <option value="dashed">虚线</option>
                  </select>
                </div>
                <div>
                  <label>颜色</label>
                  <input type="color" id="title-underline-color-input" value="#ffffff">
                  <input type="text" id="title-underline-color-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#ffffff" style="margin-top:6px;">
                </div>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:8px;">
                <div class="range-row">
                  <label>粗细(px)</label>
                  <input type="range" id="title-underline-thickness-range" min="1" max="8" step="1" value="2">
                  <span class="value-pill"><span id="title-underline-thickness-value">2</span>px</span>
                </div>
                <div class="range-row">
                  <label>偏移(px)</label>
                  <input type="range" id="title-underline-offset-range" min="0" max="12" step="1" value="4">
                  <span class="value-pill"><span id="title-underline-offset-value">4</span>px</span>
                </div>
              </div>
            </div>

            <div class="inline-subbox" style="margin-top:10px;">
              <div class="form-box-title">标题徽章背景</div>
              <label style="display:flex;align-items:center;gap:8px;">
                <input type="checkbox" id="title-badge-enable"> 启用
              </label>
              <div style="display:grid; grid-template-columns: 1fr; gap:10px; margin-top:8px;">
                <div>
                  <label>背景颜色</label>
                  <input type="color" id="title-badge-color-input" value="#000000">
                  <input type="text" id="title-badge-color-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#000000" style="margin-top:6px;">
                </div>
              </div>
            </div>

          </div>
          </div>
        </div>
     `;
  };

  // 图标设置
  P.icon = function(){
    return `
      <div class="form-group-box" data-title="图标设置"><div class="form-box-title">图标设置</div>
        <div class="control-group" id="icon-mode-group">
          <label for="icon-mode-select">图标</label>
          <select id="icon-mode-select">
            <option value="built-in">内置图标</option>
            <option value="url">自定义 URL</option>
            <option value="none">不显示图标</option>
          </select>
        </div>
        <div class="control-group" id="icon-built-in-group">
          <label for="icon-built-in-select">内置图标</label>
          <select id="icon-built-in-select">
            <option value="shield">盾牌</option>
            <option value="star">星标</option>
            <option value="heart">心形</option>
            <option value="leaf">树叶</option>
            <option value="cog">齿轮（对称）</option>
            <option value="search">搜索</option>
            <option value="refresh">刷新</option>
            <option value="download">下载</option>
            <option value="upload">上传</option>
            <option value="copy">复制</option>
            <option value="link">链接</option>
            <option value="user">用户</option>
            <option value="eye">眼睛</option>
            <option value="eye-off">隐藏眼睛</option>
            <option value="lock">锁定</option>
            <option value="unlock">解锁</option>
            <option value="play">播放</option>
            <option value="pause">暂停</option>
            <option value="stop">停止</option>
            <option value="forward">前进</option>
            <option value="rewind">后退</option>
            <option value="bell">通知</option>
            <option value="info">信息</option>
            <option value="warning">警告</option>
            <option value="check">勾选</option>
            <option value="x">关闭</option>
            <option value="calendar">日历</option>
            <option value="clock">时钟</option>
            <option value="chat">聊天</option>
            <option value="map-pin">地图标记</option>
            <option value="book">书籍</option>
            <option value="music">音乐</option>
            <option value="camera">相机</option>
            <option value="plus">加号</option>
            <option value="minus">减号</option>
          </select>
        </div>
        <div class="control-group" id="icon-url-group">
          <label for="icon-url-input">图标 URL</label>
          <input type="url" id="icon-url-input" placeholder="https://example.com/icon.svg">
        </div>
        <div class="control-group" id="icon-size-group">
          <label>图标尺寸</label>
          <div class="range-row"><input type="range" id="icon-size-range" min="16" max="64" step="1" value="28"><span class="value-pill"><span id="icon-size-value">28</span>px</span></div>
        </div>
        <div class="control-group" id="icon-position-group">
          <label for="icon-position-select">图标位置</label>
          <select id="icon-position-select">
            <option value="left">左侧</option>
            <option value="right">右侧</option>
            <option value="none">不显示</option>
          </select>
        </div>
      </div>
    `;
  };

  // 配色与外观
  P.colorAppearance = function(){
    return `
      <div class="form-group-box" data-title="配色与外观"><div class="form-box-title">配色与外观</div>
        <div class="control-group">
          <label>主/辅色</label>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
              <label for="primary-color-input">主色</label>
              <input type="color" id="primary-color-input" value="#6a717c">
              <input type="text" id="primary-color-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#6a717c" style="margin-top:6px;">
            </div>
            <div>
              <label for="secondary-color-input">辅色</label>
              <input type="color" id="secondary-color-input" value="#97aec8">
              <input type="text" id="secondary-color-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#97aec8" style="margin-top:6px;">
            </div>
          </div>
        </div>
        <div class="control-group">
          <label>圆角等级</label>
          <div class="range-row"><input type="range" id="border-radius-range" min="0" max="24" step="1" value="12"><span class="value-pill"><span id="radius-value">12</span>px</span></div>
        </div>
        <div class="control-group">
          <label>透明度</label>
          <div class="range-row"><input type="range" id="opacity-range" min="0.3" max="1" step="0.05" value="1"><span class="value-pill"><span id="opacity-value">1.00</span></span></div>
        </div>
      </div>
    `;
  };

  // 尺寸与宽度
  P.sizeWidth = function(){
    return `
      <div class="form-group-box" data-title="尺寸与宽度"><div class="form-box-title">尺寸与宽度</div>
        <div class="control-group">
          <label>预览最大宽度</label>
          <div class="range-row">
            <input type="range" id="statusbar-width-range" min="300" max="1200" step="10" value="600">
            <span class="value-pill"><span id="statusbar-width-value">600</span>px</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 12px; margin-top:6px;">同时作为导出最大宽度；规则：clamp(280px, 92vw, Npx)。</p>
        </div>
      </div>
    `;
  };

  // 背景设置
  P.background = function(){
    return `
      <div class="form-group-box" data-title="背景设置"><div class="form-box-title">背景设置</div>
        <div class="control-group">
          <label for="bg-mode-select">背景类型</label>
          <select id="bg-mode-select">
            <option value="theme">使用模板背景</option>
            <option value="color">纯色</option>
            <option value="gradient">渐变</option>
            <option value="image">图片</option>
            <option value="layers">多图层自定义</option>
            <option value="none">无背景（透明）</option>
          </select>
        </div>
        <div class="control-group" id="bg-color-group">
          <label for="bg-color-input">纯色背景</label>
          <input type="color" id="bg-color-input" value="#111215">
          <input type="text" id="bg-color-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#111215" style="margin-top:6px;">
        </div>
        <div class="control-group" id="bg-gradient-group">
          <label>渐变背景</label>
          <div class="gradient-options-box" style="margin-top:8px;border:1px solid var(--border-color);border-radius:10px;padding:12px;background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(0,0,0,.08));box-shadow: 0 2px 6px rgba(0,0,0,.10), inset 0 0 0 1px rgba(255,255,255,.04);">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
              <div>
                <label for="bg-gradient-style-select">样式</label>
                <select id="bg-gradient-style-select">
                  <option value="linear">线性</option>
                  <option value="radial">径向</option>
                  <option value="conic">锥形</option>
                </select>
              </div>
              <div>
                <label>角度</label>
                <div class="range-row">
                  <input type="range" id="bg-gradient-angle-range" min="0" max="360" step="1" value="135">
                  <span class="value-pill"><span id="bg-gradient-angle-value">135</span>°</span>
                </div>
              </div>
            </div>
            <div style="margin-top:10px;">
              <label for="bg-gradient-direction-select">方向 / 位置</label>
              <select id="bg-gradient-direction-select" style="width:100%;">
                <option value="center">中心</option>
                <option value="top">上</option>
                <option value="bottom">下</option>
                <option value="left">左</option>
                <option value="right">右</option>
                <option value="top left">左上</option>
                <option value="top right">右上</option>
                <option value="bottom left">左下</option>
                <option value="bottom right">右下</option>
                <option value="to top">线性：向上</option>
                <option value="to bottom">线性：向下</option>
                <option value="to left">线性：向左</option>
                <option value="to right">线性：向右</option>
                <option value="to top left">线性：左上</option>
                <option value="to top right">线性：右上</option>
                <option value="to bottom left">线性：左下</option>
                <option value="to bottom right" selected>线性：右下</option>
              </select>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
              <div>
                <label for="bg-gradient-start-color-input">起色</label>
                <input type="color" id="bg-gradient-start-color-input" value="#6a717c">
                <input type="text" id="bg-gradient-start-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#6a717c" style="margin-top:6px;">
              </div>
              <div>
                <label for="bg-gradient-end-color-input">终色</label>
                <input type="color" id="bg-gradient-end-color-input" value="#97aec8">
                <input type="text" id="bg-gradient-end-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#97aec8" style="margin-top:6px;">
              </div>
            </div>
            <p style="color: var(--text-secondary); font-size: 12px; margin-top:6px;">
              - 线性：支持角度与“to …”方向，角度优先；例：linear-gradient(135deg, 起色, 终色)<br>
              - 径向：使用位置（at …）；例：radial-gradient(at center, 起色, 终色)<br>
              - 锥形：支持“from 90deg at center, 起色, 终色)
            </p>
          </div>
        </div>
        <div class="control-group" id="bg-image-group">
          <label for="bg-image-url">背景图片 URL</label>
          <input type="url" id="bg-image-url" placeholder="https://example.com/background.jpg">
        </div>

        <div id="bg-layers-box" class="bg-layers-box" style="display:none;">
          <div class="box-title"><span class="dot"></span><span>多图层自定义背景区域</span></div>
          <div class="control-group" id="bg-layers-group" style="display:none;">
            <label>多图层自定义背景</label>
            <div class="btn-group">
              <button class="btn" id="btn-add-color-layer" title="添加一个纯色图层">
                <i class="fa fa-palette"></i> 添加颜色图层
              </button>
              <button class="btn" id="btn-add-gradient-layer" title="添加一个渐变图层">
                <i class="fa fa-palette"></i> 添加渐变图层
              </button>
              <button class="btn" id="btn-add-image-layer-url" title="通过图片 URL 添加一个图层">
                <i class="fa fa-image"></i> 添加图片图层
              </button>
            </div>
            <div id="bg-layers-list" style="margin-top:12px; display:grid; gap:10px;"></div>
            <p class="hint">
              <i class="fa fa-info-circle"></i> 列表自上而下为从底到顶的渲染顺序；每层可设置透明度与顺序。
            </p>
          </div>

          <div class="control-group" id="bg-components-group" style="display:none;">
            <label>图片组件（可拖动）</label>
            <div class="btn-group">
              <button class="btn" id="btn-add-comp-url" title="通过 URL 添加一个可拖动组件">
                <i class="fa fa-plus-circle"></i> 添加组件
              </button>
              <label style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:6px;background:rgba(255,255,255,.02);border:1px solid var(--border-color);cursor:pointer;transition:all var(--transition-speed);flex:1;min-width:140px;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='rgba(255,255,255,.02)'">
                <input type="checkbox" id="bg-comp-drag-toggle" style="cursor:pointer;width:16px;height:16px;accent-color:var(--accent-primary);">
                <i class="fa fa-arrows-alt"></i> 拖动模式
              </label>
            </div>
            <div id="bg-components-list" style="margin-top:12px; display:grid; gap:10px;"></div>
            <p class="hint">
              <i class="fa fa-lightbulb"></i> 开启"拖动模式"后，可在右侧预览中直接拖动组件；可在下方列表调整组件透明度/大小/显示与锁定。
            </p>
          </div>
        </div>
      </div>
    `;
  };

  // 排版与间距
  P.typography = function(){
    return `
      <div class="form-group-box" data-title="排版与间距"><div class="form-box-title">排版与间距</div>
        <div class="control-group">
          <label for="layout-select">文字排列方式</label>
          <select id="layout-select">
            <option value="label-left">左右排列（默认）</option>
            <option value="reverse">左右反转（值在左）</option>
            <option value="stacked">上下堆叠（左对齐）</option>
            <option value="center">上下堆叠（居中）</option>
            <option value="two-column">双列</option>
          </select>
          <p style="color: var(--text-secondary); font-size: 12px; margin-top:6px;">上述排列方式适用于“文本/进度条”项目；长文字始终独占整行。双列模式下每项为“标签30% / 值70%”，均左对齐，可在下方调节比例与间距。</p>
        </div>
        <div class="control-group" id="two-col-settings" style="display:none;">
          <label>双列设置</label>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div class="range-row">
              <label>标签宽度(%)</label>
              <input type="range" id="two-col-label-pct-range" min="10" max="50" step="1" value="30">
              <span class="value-pill"><span id="two-col-label-pct-value">30</span>%</span>
            </div>
            <div class="range-row">
              <label>列间距(px)</label>
              <input type="range" id="two-col-gap-range" min="0" max="40" step="1" value="12">
              <span class="value-pill"><span id="two-col-gap-value">12</span>px</span>
            </div>
          </div>
          <p style="color: var(--text-secondary); font-size: 12px; margin-top:6px;">双列模式下：标签与值均左对齐，超出自动换行且不侵占对方列空间。</p>
        </div>
        <div class="control-group">
          <label>字距 / 行距</label>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div class="range-row">
              <input type="range" id="letter-spacing-range" min="0" max="2" step="0.05" value="0">
              <span class="value-pill"><span id="letter-spacing-value">0.00</span>em</span>
            </div>
            <div class="range-row">
              <input type="range" id="line-height-range" min="1" max="2" step="0.05" value="1.4">
              <span class="value-pill"><span id="line-height-value">1.40</span></span>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // 分割线样式
  P.divider = function(){
    return `
      <div class="form-group-box" data-title="分割线样式"><div class="form-box-title">分割线样式</div>
        <div class="control-group">
          <label for="divider-style-select">分割线样式</label>
          <select id="divider-style-select">
            <option value="line">实线</option>
            <option value="dashed">虚线</option>
            <option value="gradient">渐变线</option>
          </select>
        </div>
      </div>
    `;
  };

  // 状态栏动画叠加
  P.overlay = function(){
    return `
      <div class="form-group-box" data-title="状态栏动画叠加"><div class="form-box-title">状态栏动画叠加</div>
        <div class="control-group">
          <label>状态栏动画叠加</label>
          <div style="display:grid; gap:12px;">
            <div style="border:1px solid var(--border-color); border-radius:6px; padding:10px;">
              <strong style="display:block; margin-bottom:6px; color:var(--accent-secondary);">星星闪烁</strong>
              <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="star-enabled">启用</label>
              <div class="range-row">
                <label>频率(动画时长, 秒)</label>
                <input type="range" id="star-frequency-range" min="0.5" max="5" step="0.1" value="2">
                <span class="value-pill"><span id="star-frequency-value">2.0</span>s</span>
              </div>
              <div class="range-row">
                <label>密度(数量)</label>
                <input type="range" id="star-density-range" min="10" max="200" step="1" value="50">
                <span class="value-pill"><span id="star-density-value">50</span></span>
              </div>
              <div class="control-group">
                <label>颜色</label>
                <input type="color" id="star-color-input" value="#ffffff">
                <input type="text" id="star-color-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#ffffff" style="margin-top:6px;">
              </div>
            </div>

            <div style="border:1px solid var(--border-color); border-radius:6px; padding:10px;">
              <strong style="display:block; margin-bottom:6px; color:var(--accent-secondary);">闪光碎屑</strong>
              <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="sparkle-enabled">启用</label>
              <div class="control-group">
                <label>方向</label>
                <select id="sparkle-direction-select">
                  <option value="down">自上而下</option>
                  <option value="up">自下而上</option>
                </select>
              </div>
              <div class="range-row">
                <label>频率(秒)</label>
                <input type="range" id="sparkle-frequency-range" min="0.5" max="15" step="0.1" value="8">
                <span class="value-pill"><span id="sparkle-frequency-value">8.0</span>s</span>
              </div>
              <div class="range-row">
                <label>密度</label>
                <input type="range" id="sparkle-density-range" min="5" max="100" step="1" value="20">
                <span class="value-pill"><span id="sparkle-density-value">20</span></span>
              </div>
              <div class="control-group">
                <label>颜色</label>
                <input type="color" id="sparkle-color-input" value="#ffd966">
                <input type="text" id="sparkle-color-code-input" placeholder="#RRGGBB 或 CSS颜色" value="#ffd966" style="margin-top:6px;">
              </div>
              <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="sparkle-glow-checkbox" checked>发光</label>
            </div>

            <div style="border:1px solid var(--border-color); border-radius:6px; padding:10px;">
              <strong style="display:block; margin-bottom:6px; color:var(--accent-secondary);">飘落</strong>
              <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="petal-enabled">启用</label>
              <div class="range-row">
                <label>频率(秒)</label>
                <input type="range" id="petal-frequency-range" min="1" max="8" step="0.1" value="5">
                <span class="value-pill"><span id="petal-frequency-value">5.0</span>s</span>
              </div>
              <div class="range-row">
                <label>密度</label>
                <input type="range" id="petal-density-range" min="1" max="20" step="1" value="12">
                <span class="value-pill"><span id="petal-density-value">12</span></span>
              </div>
              <div class="control-group">
                <label>图标来源</label>
                <select id="petal-icon-mode-select">
                  <option value="built-in">内置图标</option>
                  <option value="url">自定义 URL</option>
                </select>
              </div>
              <div class="control-group">
                <label>内置图标</label>
                <select id="petal-icon-built-in-select">
                  <option value="leaf">树叶</option>
                  <option value="heart">心形</option>
                  <option value="star">星标</option>
                </select>
              </div>
              <div class="control-group">
                <label>图标 URL</label>
                <input type="url" id="petal-icon-url-input" placeholder="https://example.com/petal.svg">
              </div>
              <p style="color: var(--text-secondary); font-size: 12px;">方向固定：自上而下</p>
            </div>
          </div>
        </div>
      </div>
    `;
  };

})(typeof window !== 'undefined' ? window : globalThis);