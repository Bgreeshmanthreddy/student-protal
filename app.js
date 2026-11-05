/* Portal runtime: icon sprite, theme, helpers, charts, shell + hash router.
   Landing and login reuse everything except the router (guarded on #app). */
(function () {
  "use strict";
  var SP = (window.SP = window.SP || {});

  /* ── Icon sprite ───────────────────────────────────────────── */
  var ICONS = {
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    calendar: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
    book: "M4 4h12a3 3 0 013 3v13H7a3 3 0 01-3-3z M4 4a3 3 0 00-3 3v10",
    check: "M20 6L9 17l-5-5",
    checks: "M2 12l4 4 8-9M13 16l2 2 7-8",
    award: "M12 15a6 6 0 100-12 6 6 0 000 12zM8.5 14.5L7 22l5-2.5L17 22l-1.5-7.5",
    library: "M4 20V6a2 2 0 012-2h3v16M9 20h11M20 20V9a2 2 0 00-2-2h-9",
    wallet: "M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7V6a2 2 0 012-2h12M16 13h3",
    megaphone: "M4 10v4h3l7 5V5L7 10zM18 8a5 5 0 010 8",
    user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
    users: "M17 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9.5 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8",
    search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
    bell: "M18 8a6 6 0 11-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0",
    sun: "M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
    moon: "M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z",
    menu: "M3 12h18M3 6h18M3 18h18",
    x: "M18 6L6 18M6 6l12 12",
    logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 01-4 0v-.1A1.6 1.6 0 006 19.4l-.1.1a2 2 0 01-2.8-2.8l.1-.1A1.6 1.6 0 002 14H1a2 2 0 010-4h1a1.6 1.6 0 001.1-2.7l-.1-.1a2 2 0 012.8-2.8l.1.1A1.6 1.6 0 009 3.5V3a2 2 0 014 0v.1a1.6 1.6 0 002.7 1.1l.1-.1a2 2 0 012.8 2.8l-.1.1A1.6 1.6 0 0021.5 9H22a2 2 0 010 4h-.1",
    download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
    upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
    clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 3",
    pin: "M12 17v5M8 3h8l-1 6 3 3H6l3-3z",
    filter: "M22 3H2l8 9.5V19l4 2v-8.5z",
    cap: "M22 9L12 4 2 9l10 5zM6 11.5V17c0 1.5 3 3 6 3s6-1.5 6-3v-5.5M22 9v6",
    trend: "M22 7l-8.5 8.5-4-4L2 19M16 7h6v6",
    alert: "M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
    sparkles: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM18 16l.9 2.1L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.9z",
    mail: "M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6",
    phone: "M15.5 21A13.5 13.5 0 013 8.5 3.5 3.5 0 016.5 5h2l1.5 4-2 1.5a11 11 0 005.5 5.5l1.5-2 4 1.5v2A3.5 3.5 0 0115.5 21z",
    pinloc: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0zM12 13a3 3 0 100-6 3 3 0 000 6z",
    edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z",
    file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 15h6M9 11h3",
    chart: "M3 3v18h18M8 17V9M13 17V5M18 17v-7",
    book2: "M2 4h7a3 3 0 013 3v13a2.5 2.5 0 00-2.5-2.5H2zM22 4h-7a3 3 0 00-3 3v13a2.5 2.5 0 012.5-2.5H22z",
    building: "M3 21h18M5 21V4a1 1 0 011-1h8a1 1 0 011 1v17M15 21V9h3a1 1 0 011 1v11M9 7h2M9 11h2M9 15h2",
    arrowRight: "M5 12h14M13 6l6 6-6 6",
    arrowUp: "M12 19V5M5 12l7-7 7 7",
    arrowDown: "M12 5v14M19 12l-7 7-7-7",
    chevDown: "M6 9l6 6 6-6",
    help: "M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9a2.5 2.5 0 114 2c-.9.7-1.5 1.2-1.5 2.5M12 17h.01",
    target: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 17a5 5 0 100-10 5 5 0 000 10zM12 13a1 1 0 100-2 1 1 0 000 2z",
    card: "M2 6h20v13H2zM2 10h20M6 15h4",
  };

  function sprite() {
    var box = document.createElement("div");
    box.className = "sr-only";
    box.setAttribute("aria-hidden", "true");
    var s = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">';
    Object.keys(ICONS).forEach(function (k) {
      s += '<symbol id="i-' + k + '" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
           ' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
           '<path d="' + ICONS[k] + '"/></symbol>';
    });
    s += "</svg>";
    box.innerHTML = s;
    return box;
  }

  /* ── Public helpers ────────────────────────────────────────── */
  SP.icon = function (name, cls) {
    return '<svg class="' + (cls || "") + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  };
  SP.esc = function (t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  SP.money = function (n) { return "₹" + Number(n).toLocaleString("en-IN"); };
  SP.pct = function (a, b) { return b ? Math.round((a / b) * 100) : 0; };
  SP.initials = function (name) {
    return name.split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  };
  SP.attendPct = function (s) { return SP.pct(s.attended, s.total); };
  SP.overallAttend = function () {
    var a = 0, t = 0;
    SP.subjects.forEach(function (s) { a += s.attended; t += s.total; });
    return SP.pct(a, t);
  };

  /* Theme */
  var THEME_KEY = "sp-theme";
  SP.theme = localStorage.getItem(THEME_KEY) ||
             (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  function applyTheme(t) {
    SP.theme = t;
    document.documentElement.setAttribute("data-theme", t);
    var btn = document.getElementById("themeBtn");
    if (btn) {
      btn.innerHTML = SP.icon(t === "dark" ? "sun" : "moon");
      btn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
    document.querySelectorAll("[data-theme-opt]").forEach(function (el) {
      el.checked = el.value === t;
    });
  }
  SP.setTheme = function (t) { localStorage.setItem(THEME_KEY, t); applyTheme(t); };

  /* Toasts */
  var toastHost;
  SP.toast = function (msg, kind) {
    if (!toastHost) {
      toastHost = document.createElement("div");
      toastHost.className = "toasts";
      toastHost.setAttribute("aria-live", "polite");
      document.body.appendChild(toastHost);
    }
    var el = document.createElement("div");
    el.className = "toast toast--" + (kind || "ok");
    var iconName = kind === "warn" ? "alert" : kind === "info" ? "bell" : "check";
    el.innerHTML = SP.icon(iconName) + "<span>" + SP.esc(msg) + "</span>";
    toastHost.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () { el.remove(); }, 260);
    }, 2600);
  };

  /* Modal */
  SP.modal = function (opts) {
    var wrap = document.createElement("div");
    wrap.className = "modal";
    wrap.innerHTML =
      '<div class="modal__scrim" data-close></div>' +
      '<div class="modal__panel" role="dialog" aria-modal="true" aria-label="' + SP.esc(opts.title) + '">' +
        '<div class="modal__head"><h3>' + SP.esc(opts.title) + "</h3>" +
          '<button class="icon-btn" data-close aria-label="Close">' + SP.icon("x") + "</button></div>" +
        '<div class="modal__body">' + (opts.body || "") + "</div>" +
        (opts.actions ? '<div class="modal__foot">' + opts.actions + "</div>" : "") +
      "</div>";
    document.body.appendChild(wrap);
    function close() {
      wrap.remove();
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    wrap.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) close();
    });
    document.addEventListener("keydown", onKey);
    var primary = wrap.querySelector("[data-confirm]");
    if (primary) primary.addEventListener("click", function () { close(); if (opts.onConfirm) opts.onConfirm(); });
    if (opts.onMount) opts.onMount(wrap, close);
    return { el: wrap, close: close };
  };

  /* ── Chart builders (hand-rolled SVG, theme aware) ─────────── */
  SP.donut = function (pct, opts) {
    opts = opts || {};
    var size = opts.size || 132, sw = opts.width || 12, r = (size - sw) / 2;
    var c = 2 * Math.PI * r;
    var color = opts.color || "var(--brand-600)";
    var gradId = "g" + Math.random().toString(36).slice(2, 8);
    return '<div class="ring" style="width:' + size + 'px;height:' + size + 'px">' +
      '<svg width="' + size + '" height="' + size + '">' +
        "<defs><linearGradient id=\"" + gradId + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="' + (color) + '"/>' +
          '<stop offset="100%" stop-color="' + (opts.color2 || "var(--violet-500)") + '"/>' +
        "</linearGradient></defs>" +
        '<circle class="ring__track" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke-width="' + sw + '"/>' +
        '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke-width="' + sw +
          '" stroke-linecap="round" stroke="url(#' + gradId + ')"' +
          ' stroke-dasharray="' + c + '" stroke-dashoffset="' + c * (1 - pct / 100) + '"/>' +
      "</svg>" +
      '<div class="ring__label"><div class="ring__value">' + pct + '<small>%</small></div>' +
      (opts.caption ? '<div class="ring__cap">' + opts.caption + "</div>" : "") +
      "</div></div>";
  };

  /* Line/area chart with points; values array, labels array */
  SP.line = function (values, labels, opts) {
    opts = opts || {};
    var w = 640, h = opts.height || 200, pad = { l: 34, r: 14, t: 16, b: 26 };
    var lo = opts.min != null ? opts.min : Math.min.apply(null, values) * 0.92;
    var hi = opts.max != null ? opts.max : Math.max.apply(null, values) * 1.04;
    if (hi === lo) hi = lo + 1;
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    var x = function (i) { return pad.l + (values.length === 1 ? iw / 2 : (i * iw) / (values.length - 1)); };
    var y = function (v) { return pad.t + ih - ((v - lo) / (hi - lo)) * ih; };
    var stroke = opts.color || "var(--brand-600)";
    var gid = "l" + Math.random().toString(36).slice(2, 8);

    var pts = values.map(function (v, i) { return x(i) + "," + y(v); });
    var lineStr = pts.map(function (p, i) { return (i ? "L" : "M") + p; }).join(" ");
    var area = lineStr + " L" + x(values.length - 1) + "," + (pad.t + ih) + " L" + x(0) + "," + (pad.t + ih) + " Z";

    var ticks = "";
    for (var t = 0; t <= 4; t++) {
      var vv = lo + ((hi - lo) * t) / 4;
      ticks += '<line class="chart__grid" x1="' + pad.l + '" x2="' + (w - pad.r) + '" y1="' + y(vv).toFixed(1) + '" y2="' + y(vv).toFixed(1) + '"/>' +
               '<text class="chart__axis" x="' + (pad.l - 8) + '" y="' + (y(vv) + 3.5).toFixed(1) + '" text-anchor="end">' +
               (opts.format ? opts.format(vv) : Math.round(vv)) + "</text>";
    }
    var xlab = labels.map(function (l, i) {
      return '<text class="chart__axis" x="' + x(i).toFixed(1) + '" y="' + (h - 6) + '" text-anchor="middle">' + SP.esc(l) + "</text>";
    }).join("");
    var dots = values.map(function (v, i) {
      return '<circle class="chart__dot" cx="' + x(i).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="4.5" fill="' + stroke + '">' +
             "<title>" + SP.esc(labels[i]) + ": " + (opts.format ? opts.format(v) : v) + "</title></circle>";
    }).join("");

    return '<svg class="chart" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + SP.esc(opts.aria || "Chart") + '">' +
      "<defs><linearGradient id=\"" + gid + '" x1="0" x2="0" y1="0" y2="1">' +
        '<stop offset="0%" stop-color="' + stroke + '" stop-opacity=".26"/>' +
        '<stop offset="100%" stop-color="' + stroke + '" stop-opacity="0"/>' +
      "</linearGradient></defs>" +
      ticks +
      '<path d="' + area + '" fill="url(#' + gid + ')"/>' +
      '<path class="chart__line" d="' + lineStr + '" stroke="' + stroke + '"/>' +
      dots + xlab + "</svg>";
  };

  SP.bars = function (values, labels, opts) {
    opts = opts || {};
    var w = 640, h = opts.height || 190, pad = { l: 34, r: 14, t: 14, b: 28 };
    var hi = Math.max.apply(null, values) * 1.1 || 1;
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    var bw = iw / values.length * 0.56;
    var step = iw / values.length;
    var body = values.map(function (v, i) {
      var bh = (v / hi) * ih;
      var bx = pad.l + step * i + (step - bw) / 2;
      var gid = "b" + i + Math.random().toString(36).slice(2, 5);
      return '<defs><linearGradient id="' + gid + '" x1="0" x2="0" y1="0" y2="1">' +
               '<stop offset="0%" stop-color="' + (opts.color || "var(--brand-500)") + '"/>' +
               '<stop offset="100%" stop-color="' + (opts.color2 || "var(--violet-500)") + '" stop-opacity=".55"/>' +
             "</linearGradient></defs>" +
             '<rect class="chart__bar" x="' + bx.toFixed(1) + '" y="' + (pad.t + ih - bh).toFixed(1) +
               '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="5" fill="url(#' + gid + ')">' +
               "<title>" + SP.esc(labels[i]) + ": " + v + "</title></rect>" +
             '<text class="chart__axis" x="' + (bx + bw / 2).toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle">' + SP.esc(labels[i]) + "</text>" +
             '<text class="chart__axis" x="' + (bx + bw / 2).toFixed(1) + '" y="' + (pad.t + ih - bh - 6).toFixed(1) +
               '" text-anchor="middle" font-weight="700">' + (opts.showValues === false ? "" : v) + "</text>";
    }).join("");
    var grid = "";
    for (var t = 0; t <= 3; t++) {
      var yy = pad.t + ih - (ih * t) / 3;
      grid += '<line class="chart__grid" x1="' + pad.l + '" x2="' + (w - pad.r) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '"/>' +
              '<text class="chart__axis" x="' + (pad.l - 8) + '" y="' + (yy + 3.5).toFixed(1) + '" text-anchor="end">' +
              Math.round((hi * t) / 3) + "</text>";
    }
    return '<svg class="chart" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + SP.esc(opts.aria || "Bar chart") + '">' + grid + body + "</svg>";
  };

  /* Horizontal mini bars used in tables */
  SP.barRow = function (pct, tone) {
    var cls = tone || (pct >= 85 ? "ok" : pct >= 75 ? "" : pct >= 65 ? "warn" : "bad");
    return '<div class="bar-row"><div class="bar"><div class="bar__fill' + (cls ? " bar__fill--" + cls : "") +
           '" style="width:' + Math.min(100, pct) + '%"></div></div><span class="bar-row__pct">' + pct + "%</span></div>";
  };

  SP.badge = function (tone, text) {
    return '<span class="badge badge--' + tone + '"><span class="badge__dot"></span>' + SP.esc(text) + "</span>";
  };

  /* ── Everything above runs on every page ──────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    document.body.insertBefore(sprite(), document.body.firstChild);
    applyTheme(SP.theme);
    if (!document.getElementById("app")) return;
    boot();
  });

  /* ── App shell + router ────────────────────────────────────── */
  var routes = {};               // filled by pages.js
  SP.routes = routes;
  var meta = {
    dashboard:     { title: "Dashboard",      crumbs: ["Home", "Dashboard"] },
    timetable:     { title: "Class timetable", crumbs: ["Overview", "Timetable"] },
    assignments:   { title: "Assignments",    crumbs: ["Overview", "Assignments"] },
    attendance:    { title: "Attendance",     crumbs: ["Academics", "Attendance"] },
    results:       { title: "Exam results",   crumbs: ["Academics", "Results"] },
    library:       { title: "Library",        crumbs: ["Academics", "Library"] },
    fees:          { title: "Fees & payments", crumbs: ["Campus", "Fees"] },
    announcements: { title: "Notice board",   crumbs: ["Campus", "Notices"] },
    profile:       { title: "My profile",     crumbs: ["Account", "Profile"] },
  };
  SP.routeMeta = meta;

  function navHTML() {
    var out = "";
    SP.nav.forEach(function (g) {
      out += '<div class="nav-group"><div class="nav-group__label">' + g.group + "</div>";
      g.items.forEach(function (it) {
        out += '<a class="nav-item" href="#/' + it.id + '" data-nav="' + it.id + '">' + SP.icon(it.icon) +
               "<span>" + it.label + "</span>" +
               (it.count ? '<span class="nav-item__count' + (it.alert ? " nav-item__count--alert" : "") + '">' + it.count + "</span>" : "") +
               "</a>";
      });
      out += "</div>";
    });
    return out;
  }

  function shell() {
    var s = SP.student;
    document.getElementById("app").innerHTML =
      '<div class="app" id="appRoot">' +
        "<aside class=\"sidebar\">" +
          '<div class="brand"><div class="brand__mark">' + SP.icon("cap") + "</div>" +
            '<div><div class="brand__name">Everyday University</div><div class="brand__sub">Student portal</div></div></div>' +
          '<nav id="nav" aria-label="Main">' + navHTML() + "</nav>" +
          '<div class="sidebar__foot">' +
            '<div class="term-card">' +
              '<div class="term-card__title">Semester 5 · 2026–27</div>' +
              '<div class="term-card__bar"><div class="term-card__fill"></div></div>' +
              '<div class="term-card__meta">Week 13 of 20 · ends 12 Dec</div>' +
            "</div></div>" +
        "</aside>" +
        '<div class="main">' +
          '<header class="topbar">' +
            '<button class="icon-btn hamburger" id="burger" aria-label="Open menu">' + SP.icon("menu") + "</button>" +
            '<div class="topbar__title">' +
              '<div class="topbar__crumbs" id="crumbs"></div>' +
              '<div class="topbar__h1" id="viewTitle"></div>' +
            "</div>" +
            '<div class="search" id="searchWrap">' + SP.icon("search") +
              '<input id="q" type="search" placeholder="Search subjects, notices…" aria-label="Search portal" autocomplete="off">' +
              "<kbd>/</kbd></div>" +
            '<div class="has-pop"><button class="icon-btn" id="bellBtn" aria-label="Notifications">' + SP.icon("bell") +
              '<span class="icon-btn__dot"></span></button><div id="bellPop"></div></div>' +
            '<button class="icon-btn" id="themeBtn" aria-label="Toggle theme"></button>' +
            '<div class="has-pop"><button class="avatar-btn" id="meBtn" aria-label="Account menu">' +
              '<span class="avatar">' + SP.initials(s.name) + "</span>" +
              '<span class="avatar-btn__meta"><span class="avatar-btn__name">' + s.first + "</span>" +
              '<span class="avatar-btn__role">Sem ' + s.semester + "</span></span>" + SP.icon("chevDown") +
              "</button><div id=\"mePop\"></div></div>" +
          "</header>" +
          '<main class="content" id="view" tabindex="-1"></main>' +
        "</div>" +
      "</div>";

    document.getElementById("themeBtn").addEventListener("click", function () {
      SP.setTheme(SP.theme === "dark" ? "light" : "dark");
    });

    var burger = document.getElementById("burger");
    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleDrawer();
    });

    document.getElementById("bellBtn").addEventListener("click", function (e) {
      e.stopPropagation();
      togglePop("bellPop", notificationsHTML);
    });

    document.getElementById("meBtn").addEventListener("click", function (e) {
      e.stopPropagation();
      togglePop("mePop", accountHTML);
    });

    // Clicks outside a popover dismiss it. Triggers and pop contents are exempt
    // so their own data-goto / data-action handlers still run.
    document.addEventListener("click", function (e) {
      if (e.target.closest(".has-pop")) return;
      closePops();
    });

    var q = document.getElementById("q");
    q.addEventListener("focus", function () { document.getElementById("searchWrap").classList.add("is-open"); });
    q.addEventListener("blur", function () { document.getElementById("searchWrap").classList.remove("is-open"); });
    q.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var term = q.value.trim().toLowerCase();
      if (!term) return;
      var hit = SP.subjects.filter(function (s) {
        return (s.name + " " + s.code + " " + s.short).toLowerCase().indexOf(term) > -1;
      })[0];
      if (hit) { location.hash = "#/attendance?subject=" + hit.code; }
      else if ("fee fees payment".indexOf(term) > -1) { location.hash = "#/fees"; }
      else if ("notice notices".indexOf(term) > -1) { location.hash = "#/announcements"; }
      else { SP.toast('No match for "' + term + '"', "warn"); }
      q.blur();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        q.focus();
      }
    });
  }

  var drawerOpen = false;
  function toggleDrawer(force) {
    drawerOpen = force != null ? force : !drawerOpen;
    var root = document.getElementById("appRoot");
    root.classList.toggle("is-open", drawerOpen);
    var old = root.querySelector(".scrim");
    if (drawerOpen && !old) {
      var sc = document.createElement("div");
      sc.className = "scrim";
      sc.addEventListener("click", function () { toggleDrawer(false); });
      root.appendChild(sc);
    } else if (!drawerOpen && old) old.remove();
  }

  function openPop(id, html, host) {
    closePops();
    var box = document.getElementById(id);
    box.innerHTML = html;
    box.classList.add("pop");
  }

  function togglePop(id, buildHTML) {
    var box = document.getElementById(id);
    var wasOpen = box.classList.contains("pop");
    closePops();
    if (!wasOpen) openPop(id, buildHTML());
  }
  function closePops() {
    ["bellPop", "mePop"].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) { b.innerHTML = ""; b.classList.remove("pop"); }
    });
  }

  function notificationsHTML() {
    var unread = SP.notifications.filter(function (n) { return n.unread; }).length;
    var rows = SP.notifications.map(function (n) {
      return '<button class="noti" data-goto="' + (n.kind === "warn" ? "assignments" : n.kind === "info" && /fee/i.test(n.title) ? "fees" : "announcements") + '">' +
        '<span class="avatar avatar--sm' + (n.kind === "ok" ? " avatar--teal" : n.kind === "warn" ? " avatar--amber" : "") + '">' +
        SP.icon(n.kind === "ok" ? "check" : n.kind === "warn" ? "clock" : "bell") + "</span>" +
        '<span class="noti__body"><span class="noti__title">' + SP.esc(n.title) + "</span>" +
        '<span class="noti__text">' + SP.esc(n.body) + "</span>" +
        '<span class="noti__time">' + n.time + (n.unread ? " · new" : "") + "</span></span></button>";
    }).join("");
    return '<div class="pop__head row row--between">Notifications' +
      '<span class="badge badge--info">' + unread + " new</span></div>" + rows +
      '<div class="pop__sep"></div><button class="pop__item" data-goto="announcements">' + SP.icon("megaphone") + "Open notice board</button>";
  }

  function accountHTML() {
    var s = SP.student;
    return '<div class="pop__head">' + SP.esc(s.name) + '<div class="tiny muted">' + SP.esc(s.email) + "</div></div>" +
      '<button class="pop__item" data-goto="profile">' + SP.icon("user") + "My profile</button>" +
      '<button class="pop__item" data-goto="results">' + SP.icon("award") + "Marks & CGPA</button>" +
      '<button class="pop__item" data-goto="fees">' + SP.icon("wallet") + "Fee receipts</button>" +
      '<button class="pop__item" data-action="theme">' + SP.icon(SP.theme === "dark" ? "sun" : "moon") +
        "Switch to " + (SP.theme === "dark" ? "light" : "dark") + " mode</button>" +
      '<div class="pop__sep"></div>' +
      '<button class="pop__item pop__item--danger" data-action="logout">' + SP.icon("logout") + "Sign out</button>";
  }

  /* Delegated clicks inside popovers + every page */
  document.addEventListener("click", function (e) {
    var link = e.target.closest("[data-goto]");
    if (link) {
      location.hash = "#/" + link.getAttribute("data-goto");
      closePops();
      toggleDrawer(false);
      return;
    }
    var act = e.target.closest("[data-action]");
    if (!act) return;
    var name = act.getAttribute("data-action");
    if (name === "theme") { SP.setTheme(SP.theme === "dark" ? "light" : "dark"); closePops(); }
    if (name === "logout") { closePops(); confirmLogout(); }
  });

  function confirmLogout() {
    SP.modal({
      title: "Sign out of the portal?",
      body: "<p class='muted'>Your unsaved notes on the current page will be lost. You can sign back in any time with your roll number.</p>",
      actions: '<button class="btn btn--ghost" data-close>Stay signed in</button>' +
               '<button class="btn btn--danger" data-confirm>Sign out</button>',
      onConfirm: function () { location.href = "login.html"; },
    });
  }

  /* Router */
  var current = null;
  function parse() {
    var raw = location.hash.replace(/^#\/?/, "") || "dashboard";
    var parts = raw.split("?");
    var id = parts[0] || "dashboard";
    var qs = {};
    (parts[1] || "").split("&").forEach(function (kv) {
      if (!kv) return;
      var p = kv.split("=");
      qs[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || "");
    });
    return { id: id, qs: qs };
  }

  function render() {
    var r = parse();
    if (!routes[r.id]) { location.hash = "#/dashboard"; return; }
    current = r.id;
    var m = meta[r.id];
    document.getElementById("viewTitle").textContent = m.title;
    document.getElementById("crumbs").innerHTML = m.crumbs.map(function (c) { return "<span>" + c + "</span>"; }).join("");
    document.title = m.title + " · Everyday University student portal";

    document.querySelectorAll("[data-nav]").forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-nav") === r.id);
    });

    var old = document.getElementById("view");
    // Replace the node each render: page mounts attach listeners to #view itself,
    // and reusing the node would stack one more set per visit.
    var view = old.cloneNode(false);
    old.parentNode.replaceChild(view, old);
    view.innerHTML = '<div class="view">' + routes[r.id](r.qs) + "</div>";
    if (routes[r.id + ":mount"]) routes[r.id + ":mount"](view);
    toggleDrawer(false);
    view.parentElement.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function boot() {
    shell();
    if (!location.hash) location.hash = "#/dashboard";
    window.addEventListener("hashchange", render);
    render();
  }

  SP.render = render;
})();
