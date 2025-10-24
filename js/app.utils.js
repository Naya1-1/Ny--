'use strict';
(function (global) {
  // Ny 命名空间
  const Ny = global.Ny || (global.Ny = {});
  const Utils = {};

  /**
   * 生成随机项 ID（不依赖外部状态）
   */
  Utils.genId = function genId() {
    return 'it_' + Math.random().toString(36).slice(2, 9);
  };

  /**
   * HTML 文本安全转义
   */
  Utils.esc = function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  /**
   * 数值裁剪
   */
  Utils.clamp = function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  };

  /**
   * 由“状态栏标题”派生 AI 包裹标签名字（仅保留字母/数字/中文/下划线/连字符）
   */
  Utils.toWrapperNameFromTitle = function toWrapperNameFromTitle(title) {
    try {
      const name = String(title || '').replace(/[^A-Za-z0-9\u4E00-\u9FFF_-]+/g, '').trim();
      return name || '状态';
    } catch (_e) {
      return '状态';
    }
  };

  /**
   * 类型中文名映射
   */
  Utils.typeName = function typeName(t) {
    const map = { text: '文本', longtext: '长文字', bar: '进度条', divider: '分割线' };
    return map[t] || t;
  };

  /**
   * 快照深拷贝（列表版）
   */
  Utils.snapshot = function snapshot(list) {
    return JSON.parse(JSON.stringify(Array.isArray(list) ? list : []));
  };

  /**
   * 颜色对比度计算（WCAG近似）
   */
  Utils.contrastRatio = function contrastRatio(c1, c2) {
    try {
      function hexToRgb(hex) {
        const h = String(hex || '').trim();
        if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h)) return [0, 0, 0];
        const s = h.slice(1);
        const full = s.length === 3 ? s.split('').map(ch => ch + ch).join('') : s;
        const r = parseInt(full.slice(0, 2), 16);
        const g = parseInt(full.slice(2, 4), 16);
        const b = parseInt(full.slice(4, 6), 16);
        return [r, g, b];
      }
      function srgbToLin(v) {
        v = v / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      }
      function luminance(rgb) {
        const [r, g, b] = rgb;
        const R = srgbToLin(r), G = srgbToLin(g), B = srgbToLin(b);
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
      }
      const L1 = luminance(hexToRgb(c1));
      const L2 = luminance(hexToRgb(c2));
      const hi = Math.max(L1, L2), lo = Math.min(L1, L2);
      return (hi + 0.05) / (lo + 0.05);
    } catch (_e) {
      return 1;
    }
  };

  /**
   * 简单协调度评分（用于诊断日志）
   */
  Utils.computeCoherence = function computeCoherence(opts) {
    try {
      const { primaryColor, secondaryColor, letterSpacing = 0, lineHeight = 1.4, animationType = 'none' } = (opts || {});
      const cr = Utils.contrastRatio(primaryColor, secondaryColor);
      let score = 0.5 + Math.min(cr, 7) / 14;
      if (lineHeight >= 1.2 && lineHeight <= 1.8) score += 0.1;
      if (letterSpacing > 0.5) score -= 0.05;
      if (animationType !== 'none') score += 0.05;
      return Number(Math.max(0, Math.min(1, score)).toFixed(2));
    } catch (_e) {
      return 0.5;
    }
  };

  /**
   * 内置 SVG 图标（含中心对称齿轮）
   */
  Utils.getBuiltinIconSVG = function getBuiltinIconSVG(name, size, color) {
    size = (typeof size === 'number' && size > 0) ? size : 24;
    color = color || '#ffffff';

    const common = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
    const svg = inner => `<svg ${common}>${inner}</svg>`;
    const p = d => svg(`<path d="${d}"></path>`);
    const poly = pts => svg(`<polygon points="${pts}"></polygon>`);
    const circ = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"></circle>`;

    // 程序化中心对称齿轮：12齿
    function gear12() {
      const cx = 12, cy = 12;
      const teeth = 12;
      const rOuter = 10.2, rInner = 7.2, rBore = 3.2;
      const step = Math.PI * 2 / teeth;
      const aSide = step * 0.25;
      const pts = [];
      for (let i = 0; i < teeth; i++) {
        const base = i * step;
        const a0 = base;
        const a1 = base + aSide;
        const a2 = base + step / 2;
        const a3 = base + step - aSide;
        pts.push([cx + rInner * Math.cos(a0), cy + rInner * Math.sin(a0)]);
        pts.push([cx + rOuter * Math.cos(a1), cy + rOuter * Math.sin(a1)]);
        pts.push([cx + rOuter * Math.cos(a2), cy + rOuter * Math.sin(a2)]);
        pts.push([cx + rInner * Math.cos(a3), cy + rInner * Math.sin(a3)]);
      }
      const pointsStr = pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
      const ring = `<polygon points="${pointsStr}"></polygon>`;
      const bore = circ(cx, cy, rBore);
      try { console.log('[icon] cog generated', { teeth, rOuter, rInner, rBore, cx, cy }); } catch (_e) {}
      return svg(ring + bore);
    }

    switch (name) {
      /* 基础 */
      case 'shield': return p("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z");
      case 'star': return poly("12 2 15.09 8.26 22 9.27 17 13.97 18.18 21 12 17.27 5.82 21 7 13.97 2 9.27 8.91 8.26 12 2");
      case 'heart': return p("M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z");
      case 'leaf': return p("M11 21C5 21 3 15 3 15S5 3 21 3c0 16-12 18-12 18z");
      case 'cog': return gear12();

      /* 常用功能 */
      case 'search': return svg('<circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>');
      case 'refresh': return svg('<path d="M21 12a9 9 0 1 1-3.5-7.1"></path><polyline points="21 4 21 12 13 12"></polyline>');
      case 'download': return svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>');
      case 'upload': return svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 14 12 9 17 14"></polyline><line x1="12" y1="9" x2="12" y2="21"></line>');
      case 'copy': return svg('<rect x="9" y="9" width="13" height="13" rx="2"></rect><rect x="2" y="2" width="13" height="13" rx="2"></rect>');
      case 'link': return svg('<path d="M10 13a5 5 0 0 0 7.07 0l3.54-3.54a5 5 0 0 0-7.07-7.07L12.95 4"></path><path d="M14 11a5 5 0 0 1-7.07 0L3.39 7.46a5 5 0 1 1 7.07-7.07L7.05 4"></path>');

      /* 用户/视图 */
      case 'user': return svg('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>');
      case 'eye': return svg('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>');
      case 'eye-off': return svg('<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.88"></path><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-3.34 5.06"></path><line x1="1" y1="1" x2="23" y2="23"></line>');

      /* 安全 */
      case 'lock': return svg('<rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>');
      case 'unlock': return svg('<rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M7 11V9a5 5 0 0 1 9.5-2"></path>');

      /* 播放控制 */
      case 'play': return svg('<polygon points="5 3 19 12 5 21 5 3"></polygon>');
      case 'pause': return svg('<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>');
      case 'stop': return svg('<rect x="6" y="6" width="12" height="12"></rect>');
      case 'forward': return svg('<polygon points="5 4 13 12 5 20 5 4"></polygon><polygon points="13 4 21 12 13 20 13 4"></polygon>');
      case 'rewind': return svg('<polygon points="19 4 11 12 19 20 19 4"></polygon><polygon points="11 4 3 12 11 20 11 4"></polygon>');

      /* 通知/状态 */
      case 'bell': return svg('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>');
      case 'info': return svg('<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="8"></line>');
      case 'warning': return svg('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12" y2="17"></line>');
      case 'check': return svg('<polyline points="20 6 9 17 4 12"></polyline>');
      case 'x': return svg('<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>');

      /* 时间/消息/地点 */
      case 'calendar': return svg('<rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>');
      case 'clock': return svg('<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>');
      case 'chat': return svg('<path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>');
      case 'map-pin': return svg('<path d="M21 10c0 5-9 12-9 12S3 15 3 10a9 9 0 1 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>');

      /* 其它 */
      case 'book': return svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M4 4v15.5A2.5 2.5 0 0 0 6.5 22H20V4"></path>');
      case 'music': return svg('<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>');
      case 'camera': return svg('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>');
      case 'plus': return svg('<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>');
      case 'minus': return svg('<line x1="5" y1="12" x2="19" y2="12"></line>');

      default: return '';
    }
  };

  // 暴露到 Ny 命名空间
  Ny.Utils = Utils;
})(window);