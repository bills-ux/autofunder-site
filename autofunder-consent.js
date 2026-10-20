/*!
 * AutoFunder cookie consent. Version 1 · 20 October 2026
 * Nothing from Meta loads until the visitor accepts advertising cookies.
 * Config before this script: window.AF_CONSENT = { pixelId, policyUrl, mode, theme }
 *   mode:  "bank" (default: Accept all / Manage cookies), "optin" (Yes/No), "notice" (inform only)
 *   theme: "light" for dark pages, omit for light pages
 * Footer link: <a href="#" data-af-cookie-settings>Cookie settings</a>
 * Track only through window.afTrack("Lead"); it does nothing without consent.
 */
(function () {
  "use strict";

  var CFG = window.AF_CONSENT || {};
  var PIXEL_ID = CFG.pixelId || "";
  var POLICY_URL = CFG.policyUrl || "/privacy.html#cookies";
  /* "bank" (default): the two-layer banner the SA banks use (Accept all / Manage cookies).
     "optin": a plain Yes/No.  "notice": inform only, Pixel on unless switched off. */
  var MODE = CFG.mode === "notice" ? "notice" : CFG.mode === "optin" ? "optin" : "bank";
  /* theme: "dark" bar for light pages (staging), "light" bar for dark pages (holding site). */
  var T = CFG.theme === "light"
    ? { bg: "#f4ede1", fg: "#1d1a17", txt: "#1d1a17", link: "#b4542a", accBg: "#1d1a17", accFg: "#f4ede1", line: "#1d1a17", shadow: "0 10px 34px rgba(0,0,0,.55)" }
    : { bg: "#1d1a17", fg: "#f4ede1", txt: "#e8dfd1", link: "#e0865a", accBg: "#f4ede1", accFg: "#1d1a17", line: "#f4ede1", shadow: "0 8px 28px rgba(0,0,0,.3)" };
  var CONSENT_VERSION = 1;             // raise to ask everyone again
  var STORE_KEY = "af_consent";
  var MAX_AGE_DAYS = 365;

  /* ---------- storage (cookie first, localStorage as backup) ---------- */
  function readChoice() {
    var raw = null;
    try {
      var m = document.cookie.match(/(?:^|;\s*)af_consent=([^;]+)/);
      raw = m ? decodeURIComponent(m[1]) : null;
      if (!raw && window.localStorage) raw = localStorage.getItem(STORE_KEY);
    } catch (e) { /* storage blocked: treat as no choice */ }
    if (!raw) return null;
    try {
      var c = JSON.parse(raw);
      var age = (Date.now() - c.t) / 864e5;
      if (c.v !== CONSENT_VERSION || age > MAX_AGE_DAYS) return null;
      return c;
    } catch (e) { return null; }
  }

  function saveChoice(marketing) {
    var c = JSON.stringify({ v: CONSENT_VERSION, m: !!marketing, t: Date.now() });
    try {
      document.cookie = "af_consent=" + encodeURIComponent(c) +
        "; Max-Age=" + MAX_AGE_DAYS * 86400 + "; Path=/; SameSite=Lax" +
        (location.protocol === "https:" ? "; Secure" : "");
    } catch (e) {}
    try { if (window.localStorage) localStorage.setItem(STORE_KEY, c); } catch (e) {}
  }

  /* ---------- Meta Pixel: loaded only after consent ---------- */
  var pixelLoaded = false;
  function loadPixel() {
    if (pixelLoaded || !PIXEL_ID) return;
    pixelLoaded = true;
    /* Standard Meta base code, run only here. */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
      n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("consent", "grant");
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }

  function removePixel() {
    if (window.fbq) { try { window.fbq("consent", "revoke"); } catch (e) {} }
    ["_fbp", "_fbc"].forEach(function (name) {
      var host = location.hostname.split(".");
      var domains = [""];
      for (var i = 0; i < host.length - 1; i++) domains.push("." + host.slice(i).join("."));
      domains.forEach(function (d) {
        document.cookie = name + "=; Max-Age=0; Path=/" + (d ? "; Domain=" + d : "");
      });
    });
    if (pixelLoaded) {
      /* fbevents.js cannot be unloaded from a running page: reload so it is gone. */
      location.reload();
    }
  }

  /* Safe tracking wrapper for the app to call. */
  window.afTrack = function (event, params) {
    var c = readChoice();
    if (c && c.m && window.fbq) window.fbq("track", event, params || {});
  };

  /* ---------- banner ---------- */
  var CSS =
    ".af-cc{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:760px;" +
    "margin:0 auto;background:" + T.bg + ";color:" + T.fg + ";border-radius:12px;padding:14px 16px;" +
    "box-shadow:" + T.shadow + ";font:14px/1.45 'IBM Plex Sans',system-ui,-apple-system,sans-serif;" +
    "display:flex;align-items:center;gap:16px;flex-wrap:wrap}" +
    ".af-cc p{margin:0;flex:1 1 320px;color:" + T.txt + "}" +
    ".af-cc strong{color:" + T.fg + "}" +
    ".af-cc a{color:" + T.link + ";text-decoration:underline;border-bottom:0}" +
    ".af-cc .af-row{display:flex;gap:8px;flex:1 1 180px;max-width:200px}" +
    "@media (max-width:520px){.af-cc .af-row{max-width:none}}" +
    ".af-cc .af-one{max-width:120px;flex:0 0 120px}" +
    ".af-cc button{flex:1 1 0;min-height:44px;border-radius:10px;font-family:inherit;" +
    "font-size:14px;font-weight:600;line-height:1;cursor:pointer;border:2px solid " + T.line + ";padding:10px 14px}" +
    ".af-cc .af-acc{background:" + T.accBg + ";color:" + T.accFg + "}" +
    ".af-cc .af-rej{background:transparent;color:" + T.fg + "}" +
    ".af-cc button:focus-visible,.af-cc a:focus-visible,.af-cc input:focus-visible+.af-sw{outline:3px solid " + T.link + ";outline-offset:2px}" +
    /* bank-style layout */
    ".af-cc.af-bank{display:block;max-width:880px;padding:18px 20px}" +
    ".af-cc .af-h{font:600 16px/1.3 Fraunces,Georgia,serif;margin:0 0 6px;color:" + T.fg + "}" +
    ".af-cc.af-bank p{margin:0 0 14px}" +
    ".af-cc .af-btns{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}" +
    ".af-cc .af-btns button{flex:0 1 180px}" +
    "@media (max-width:520px){.af-cc .af-btns button{flex:1 1 140px}}" +
    ".af-cc .af-cat{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;" +
    "padding:12px 0;border-top:1px solid " + T.line + "33}" +
    ".af-cc .af-cat b{display:block;color:" + T.fg + ";margin-bottom:2px}" +
    ".af-cc .af-cat span.d{color:" + T.txt + ";font-size:13px}" +
    ".af-cc .af-on{font-size:13px;font-weight:600;white-space:nowrap;color:" + T.fg + ";padding-top:2px}" +
    ".af-cc label.af-tg{position:relative;flex:0 0 46px;height:26px;cursor:pointer}" +
    ".af-cc label.af-tg input{position:absolute;opacity:0;width:100%;height:100%;margin:0;cursor:pointer}" +
    ".af-cc .af-sw{display:block;width:46px;height:26px;border-radius:13px;background:" + T.txt + "55;transition:background .15s}" +
    ".af-cc .af-sw:after{content:'';position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .15s}" +
    ".af-cc input:checked+.af-sw{background:#2e7d32}" +
    ".af-cc input:checked+.af-sw:after{left:23px}" +
    ".af-cc .af-panel{max-height:70vh;overflow:auto}";

  var banner = null, styled = false;
  function addStyle() {
    if (styled) return; styled = true;
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function build(html, extraClass) {
    addStyle();
    if (banner) banner.remove();
    banner = document.createElement("div");
    banner.className = "af-cc" + (extraClass ? " " + extraClass : "");
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-labelledby", "af-cc-title");
    banner.innerHTML = html;
    document.body.appendChild(banner);
  }

  /* The Yes/No question (opt-in mode, and Cookie settings in both modes). */
  function showBanner() {
    build(
      '<p><strong id="af-cc-title">Do you accept cookies?</strong> ' +
      '<a href="' + POLICY_URL + '">Details</a></p>' +
      '<div class="af-row">' +
      '<button type="button" class="af-rej">No</button>' +
      '<button type="button" class="af-acc">Yes</button>' +
      "</div>");
    banner.querySelector(".af-acc").addEventListener("click", function () { decide(true); });
    banner.querySelector(".af-rej").addEventListener("click", function () { decide(false); });
    banner.querySelector(".af-acc").focus();
  }

  /* The notice bar (notice mode, first visit only). */
  function showNotice() {
    build(
      '<p><strong id="af-cc-title">We use cookies</strong> to improve this site and our ads. ' +
      '<a href="' + POLICY_URL + '">Tell me more</a> \u00b7 ' +
      '<a href="#" data-af-cookie-settings>Cookie settings</a></p>' +
      '<div class="af-row af-one"><button type="button" class="af-acc">OK</button></div>');
    banner.querySelector(".af-acc").addEventListener("click", function () { decide(true); });
  }

  /* Bank style, layer 1: what most SA banks show. */
  function showBank() {
    build(
      '<div class="af-h" id="af-cc-title">We value your privacy</div>' +
      "<p>We use cookies on our website to improve our services, keep our website secure, and serve you " +
      "more relevant content. Choose which cookies you consent to via the buttons below. " +
      'To find out more see our <a href="' + POLICY_URL + '">Cookies Policy</a>.</p>' +
      '<div class="af-btns">' +
      '<button type="button" class="af-rej af-manage">Manage cookies</button>' +
      '<button type="button" class="af-acc">Accept all</button>' +
      "</div>", "af-bank");
    banner.querySelector(".af-acc").addEventListener("click", function () { decide(true); });
    banner.querySelector(".af-manage").addEventListener("click", showPrefs);
  }

  /* Bank style, layer 2: cookie settings with a switch per category. */
  function showPrefs() {
    var c = readChoice();
    var on = !!(c && c.m);
    build(
      '<div class="af-panel">' +
      '<div class="af-h" id="af-cc-title">Cookie settings</div>' +
      "<p>Choose which cookies we may use. You can change this any time under Cookie settings at the bottom of the page.</p>" +
      '<div class="af-cat"><div><b>Essential cookies</b><span class="d">Needed for the site to work, ' +
      "such as remembering this choice and keeping you signed in. They can't be switched off.</span></div>" +
      '<span class="af-on">Always on</span></div>' +
      '<div class="af-cat"><div><b id="af-ads-l">Advertising cookies (Meta)</b><span class="d">Show us which ' +
      "Facebook and Instagram ads bring people here, and help us show our ads to the right people. " +
      "Meta receives the pages you visit on this site. We never share your application with Meta.</span></div>" +
      '<label class="af-tg"><input type="checkbox" class="af-ads" aria-labelledby="af-ads-l"' + (on ? " checked" : "") +
      '><span class="af-sw"></span></label></div>' +
      '<div class="af-btns" style="margin-top:8px">' +
      '<button type="button" class="af-rej af-none">Reject all</button>' +
      '<button type="button" class="af-rej af-save">Save my choices</button>' +
      '<button type="button" class="af-acc">Accept all</button>' +
      "</div></div>", "af-bank");
    banner.querySelector(".af-acc").addEventListener("click", function () { decide(true); });
    banner.querySelector(".af-none").addEventListener("click", function () { decide(false); });
    banner.querySelector(".af-save").addEventListener("click", function () {
      decide(banner.querySelector(".af-ads").checked);
    });
  }

  function hideBanner() { if (banner) banner.style.display = "none"; }

  function decide(marketing) {
    var before = readChoice();
    saveChoice(marketing);
    hideBanner();
    if (marketing) loadPixel();
    else if (before && before.m) removePixel();
    try {
      document.dispatchEvent(new CustomEvent("af:consent", { detail: { marketing: marketing } }));
    } catch (e) {}
  }

  /* ---------- start ---------- */
  function start() {
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest && e.target.closest("[data-af-cookie-settings]");
      if (t) { e.preventDefault(); if (MODE === "bank") showPrefs(); else showBanner(); }
    });
    var c = readChoice();
    if (MODE === "notice") {
      if (c === null) { loadPixel(); showNotice(); }
      else if (c.m) loadPixel();
    } else if (MODE === "bank") {
      if (c === null) showBank();
      else if (c.m) loadPixel();
    } else {
      if (c === null) showBanner();
      else if (c.m) loadPixel();
    }
  }

  window.AFConsent = { open: function () { MODE === "bank" ? showPrefs() : showBanner(); }, get: readChoice };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
