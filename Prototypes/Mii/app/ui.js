/*
 * ui.js — presentation + interaction helpers (no app-specific data logic).
 *   h()            tiny DOM builder (safe: text nodes, no innerHTML for data)
 *   icon()/avatar()  shared visuals
 *   toast()        transient message
 *   capturePhoto() camera -> centered-square 512px JPEG data URL
 *   confirm()/actionSheet()/pickSheet()  native <dialog>-based modals
 *   longPress()    Pointer-Events tap vs long-press vs scroll
 *   swipe reveal   one-open delete affordance
 */
(function (global) {
  'use strict';

  // ---- DOM builder -------------------------------------------------------
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) {
      for (var k in props) {
        if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
        var v = props[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k === 'html') el.innerHTML = v;           // only for trusted SVG markup
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      }
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, child) {
    if (child == null || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(el, c); }); return; }
    el.appendChild(child.nodeType ? child : document.createTextNode(String(child)));
  }

  // ---- icons (inline SVG) ------------------------------------------------
  var SVG = {
    back: '<svg viewBox="0 0 13 22" width="13" height="22" aria-hidden="true"><path d="M11 1L2 11l9 10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevron: '<svg viewBox="0 0 8 14" width="8" height="14" aria-hidden="true"><path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="6.8" cy="6.8" r="5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M10.6 10.6L15 15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 22 22" width="22" height="22" aria-hidden="true"><path d="M11 4v14M4 11h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path d="M3.5 9.5l3.6 3.6L14.5 5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trash: '<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path d="M3 4.5h12M7 4.5V3h4v1.5M5 4.5l.7 10h6.6l.7-10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    camera: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
  };
  function icon(name) {
    var span = document.createElement('span');
    span.className = 'icon';
    span.style.display = 'inline-flex';
    span.innerHTML = SVG[name] || '';
    return span.firstElementChild || span;
  }

  // ---- avatar ------------------------------------------------------------
  function initials(name) {
    var parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  function avatar(opts) {
    opts = opts || {};
    var cls = 'avatar';
    if (opts.size === 'mini') cls += ' avatar--mini';
    else if (opts.size === 'detail') cls += ' avatar--detail';
    if (opts.food) cls += ' food';
    if (opts.class) cls += ' ' + opts.class;
    var el = h('div', { class: cls });
    if (opts.src) {
      el.style.backgroundImage = 'url("' + opts.src + '")';
    } else {
      var ini = initials(opts.name);
      if (ini) el.textContent = ini;
      else el.appendChild(h('span', { class: 'ph-emoji' }, opts.food ? '🍽️' : '🙂'));
    }
    return el;
  }

  // ---- toast -------------------------------------------------------------
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) { toastEl = h('div', { class: 'toast' }); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    // force reflow so the transition re-triggers
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 1900);
  }

  // ---- camera capture ----------------------------------------------------
  var pendingPhotoCb = null;
  function initCamera() {
    var input = document.getElementById('cameraInput');
    if (!input) return;
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      input.value = '';                        // allow re-picking the same file
      var cb = pendingPhotoCb; pendingPhotoCb = null;
      if (!file || !cb) return;
      fileToSquareDataURL(file, 512, 0.82).then(cb).catch(function (e) {
        console.error(e); toast('Could not read that image');
      });
    });
  }
  function capturePhoto(cb) {
    var input = document.getElementById('cameraInput');
    if (!input) { toast('Camera unavailable'); return; }
    pendingPhotoCb = cb;
    input.value = '';
    input.click();                              // must be synchronous within the tap gesture
  }
  function decode(file) {
    if (global.createImageBitmap) {
      return createImageBitmap(file, { imageOrientation: 'from-image' })
        .catch(function () { return imgFallback(file); });
    }
    return imgFallback(file);
  }
  function imgFallback(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('decode failed')); };
      img.src = url;
      img._objUrl = url;
    });
  }
  function fileToSquareDataURL(file, size, quality) {
    return decode(file).then(function (src) {
      var w = src.naturalWidth || src.width, hh = src.naturalHeight || src.height;
      var side = Math.min(w, hh);
      var sx = (w - side) / 2, sy = (hh - side) / 2;
      var out = Math.min(size || 512, side);
      var canvas = h('canvas'); canvas.width = out; canvas.height = out;
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src, sx, sy, side, side, 0, 0, out, out);
      if (src.close) src.close();
      if (src._objUrl) URL.revokeObjectURL(src._objUrl);
      return canvas.toDataURL('image/jpeg', quality || 0.82);
    });
  }

  // ---- modal infrastructure ---------------------------------------------
  function makeDialog() {
    var d = h('dialog', { class: 'mt-dialog' });
    document.body.appendChild(d);
    d.addEventListener('close', function () { d.remove(); });
    return d;
  }

  function confirm(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var d = makeDialog();
      var settled = false;
      function done(v) { if (settled) return; settled = true; resolve(v); d.close(); }
      var cancelBtn = h('button', { class: 'cancel', onClick: function () { done(false); } }, opts.cancelText || 'Cancel');
      d.appendChild(h('div', { class: 'alert' },
        h('div', { class: 'alert-body' },
          h('div', { class: 'alert-title' }, opts.title || 'Are you sure?'),
          opts.message ? h('div', { class: 'alert-msg' }, opts.message) : null),
        h('div', { class: 'alert-actions' },
          cancelBtn,
          h('button', { class: opts.destructive === false ? '' : 'destructive', onClick: function () { done(true); } },
            opts.confirmText || 'Delete'))));
      d.addEventListener('cancel', function (e) { e.preventDefault(); done(false); });
      d.showModal();
      cancelBtn.focus();
    });
  }

  // items: [{label, value, destructive, center, leading(node)}]
  function actionSheet(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var d = makeDialog();
      var settled = false;
      function done(v) { if (settled) return; settled = true; resolve(v); d.close(); }
      var group = h('div', { class: 'sheet-group' });
      if (opts.title) group.appendChild(h('div', { class: 'sheet-title' }, opts.title));
      var items = opts.items || [];
      if (items.length) {
        var scroll = h('div', { class: 'sheet-scroll' });
        items.forEach(function (it) {
          var cls = 'sheet-item' + (it.destructive ? ' destructive' : '') + (it.center ? ' center' : '');
          scroll.appendChild(h('button', { class: cls, onClick: function () { done(it.value); } },
            it.leading || null, h('span', {}, it.label)));
        });
        group.appendChild(scroll);
      } else {
        group.appendChild(h('div', { class: 'sheet-empty' }, opts.emptyText || 'Nothing to choose from.'));
      }
      d.appendChild(h('div', { class: 'sheet' },
        group,
        h('button', { class: 'sheet-cancel', onClick: function () { done(null); } }, opts.cancelText || 'Cancel')));
      d.addEventListener('cancel', function (e) { e.preventDefault(); done(null); });
      d.addEventListener('click', function (e) { if (e.target === d) done(null); });
      d.showModal();
    });
  }

  // options: [{value, label, src, food, emoji}] -> resolves value | null
  function pickSheet(opts) {
    opts = opts || {};
    var items = (opts.options || []).map(function (o) {
      return {
        value: o.value, label: o.label || '—',
        leading: avatar({ src: o.src, name: o.label, food: o.food, size: 'mini' })
      };
    });
    return actionSheet({ title: opts.title, items: items, emptyText: opts.emptyText, cancelText: opts.cancelText });
  }

  // ---- swipe-to-reveal (one open at a time) ------------------------------
  var openReveal = null;
  function closeReveal() {
    if (openReveal) { openReveal.classList.remove('reveal-left', 'reveal-right'); openReveal = null; }
  }
  function revealRow(rowEl, side) {
    if (openReveal && openReveal !== rowEl) closeReveal();
    var cls = side === 'right' ? 'reveal-right' : 'reveal-left';
    if (rowEl.classList.contains(cls)) { closeReveal(); return; }
    rowEl.classList.add(cls);
    openReveal = rowEl;
  }
  document.addEventListener('pointerdown', function (e) {
    if (openReveal && !openReveal.contains(e.target)) closeReveal();
  }, true);

  // ---- long-press (tap vs long-press vs scroll) --------------------------
  // opts: {onTap, onLongPress, delay=480, moveTol=10}
  function longPress(el, opts) {
    opts = opts || {};
    var delay = opts.delay || 480, moveTol = opts.moveTol || 10;
    el.style.touchAction = opts.touchAction || 'pan-y';
    if (opts.onLongPress) { el.classList.add('no-select'); }
    var timer = null, sx = 0, sy = 0, fired = false, active = false;

    el.addEventListener('contextmenu', function (e) { if (opts.onLongPress) e.preventDefault(); });

    el.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      active = true; fired = false; sx = e.clientX; sy = e.clientY;
      if (opts.onLongPress) {
        timer = setTimeout(function () {
          timer = null; fired = true;
          try { if (navigator.vibrate) navigator.vibrate(12); } catch (x) {}
          opts.onLongPress(e);
        }, delay);
      }
    });
    el.addEventListener('pointermove', function (e) {
      if (!active) return;
      if (Math.abs(e.clientX - sx) > moveTol || Math.abs(e.clientY - sy) > moveTol) {
        cancel();
      }
    });
    el.addEventListener('pointerup', function (e) {
      if (!active) return;
      var wasFired = fired;
      clear();
      if (!wasFired && opts.onTap) {
        // ignore taps that land on the revealed delete area's own button
        opts.onTap(e);
      }
    });
    el.addEventListener('pointercancel', cancel);
    el.addEventListener('pointerleave', function () { if (active && timer) { /* keep for small leaves */ } });

    function clear() { active = false; if (timer) { clearTimeout(timer); timer = null; } }
    function cancel() { active = false; if (timer) { clearTimeout(timer); timer = null; } }
    return el;
  }

  global.App = global.App || {};
  global.App.ui = {
    h: h, icon: icon, avatar: avatar, initials: initials, toast: toast,
    initCamera: initCamera, capturePhoto: capturePhoto,
    confirm: confirm, actionSheet: actionSheet, pickSheet: pickSheet,
    longPress: longPress, revealRow: revealRow, closeReveal: closeReveal
  };

})(window);
