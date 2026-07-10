/*
 * store.js — data layer for the Tomodachi Mii Tracker.
 *
 * Owns the single app-state object and every mutation. Relationships are stored
 * ONCE and derived into all views:
 *   - foodStatus: one row per (miiId, foodId) pair, exactly one status.
 *   - nicknames:  one directed row per link; both "for others" / "from others"
 *                 views derive from it, so they can never disagree.
 * Mutations enforce invariants + cascading deletes, then persist + notify.
 *
 * Persists the whole state (images inline as base64 data URLs) as one IndexedDB
 * record so the Data tab's JSON view and export/import round-trip trivially.
 * Falls back to localStorage, then in-memory (e.g. under Node for tests).
 *
 * Pure logic is exported for Node so the invariants can be unit-tested.
 */
(function (global) {
  'use strict';

  // Food-opinion statuses, ordered low -> high. This is also the display order
  // used for the per-status relationship lists.
  var STATUSES = [
    'Most Hated', 'Hated', 'So-So', 'Liked', 'Liked a Lot',
    'Favorite Food', 'Most Favorite Food'
  ];

  // The four "headline" slots surfaced on the General tab + fixed Food list,
  // in display order. `label` is what the UI shows; `status` is the stored value.
  var HEADLINE = [
    { label: 'Most Favorite Food', status: 'Most Favorite Food' },
    { label: 'Favorite Food', status: 'Favorite Food' },
    { label: 'Hated Food', status: 'Hated' },
    { label: 'Most Hated Food', status: 'Most Hated' }
  ];

  function emptyState() {
    return { version: 1, miis: [], foods: [], foodStatus: [], nicknames: [] };
  }

  var state = emptyState();
  var subscribers = [];
  var loaded = false;

  // ---- ids ---------------------------------------------------------------
  function uid(prefix) {
    var rnd;
    if (global.crypto && global.crypto.randomUUID) {
      rnd = global.crypto.randomUUID().replace(/-/g, '').slice(0, 10);
    } else {
      rnd = Math.random().toString(36).slice(2, 12);
    }
    return prefix + '_' + rnd;
  }

  // ---- lookups -----------------------------------------------------------
  function getMii(id) { return state.miis.find(function (m) { return m.id === id; }) || null; }
  function getFood(id) { return state.foods.find(function (f) { return f.id === id; }) || null; }

  function byNameThenId(a, b) {
    var an = (a.name || '').trim().toLowerCase();
    var bn = (b.name || '').trim().toLowerCase();
    // Empty names sort to the end so unnamed drafts don't jump to the top.
    if (!an && bn) return 1;
    if (an && !bn) return -1;
    if (an < bn) return -1;
    if (an > bn) return 1;
    return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
  }
  function sortedMiis() { return state.miis.slice().sort(byNameThenId); }
  function sortedFoods() { return state.foods.slice().sort(byNameThenId); }

  // ---- Mii CRUD ----------------------------------------------------------
  function addMii(name) {
    var m = { id: uid('m'), name: name || '', avatar: null, notes: '' };
    state.miis.push(m);
    commit();
    return m.id;
  }
  function setMiiName(id, name, silent) { var m = getMii(id); if (m) { m.name = name; commit(silent); } }
  function setMiiAvatar(id, dataUrl) { var m = getMii(id); if (m) { m.avatar = dataUrl || null; commit(); } }
  function setMiiNotes(id, notes, silent) { var m = getMii(id); if (m) { m.notes = notes; commit(silent); } }
  function deleteMii(id) {
    state.miis = state.miis.filter(function (m) { return m.id !== id; });
    state.foodStatus = state.foodStatus.filter(function (r) { return r.miiId !== id; });
    state.nicknames = state.nicknames.filter(function (n) { return n.fromMiiId !== id && n.toMiiId !== id; });
    commit();
  }

  // ---- Food CRUD ---------------------------------------------------------
  function addFood(name) {
    var f = { id: uid('f'), name: name || '', image: null };
    state.foods.push(f);
    commit();
    return f.id;
  }
  function setFoodName(id, name, silent) { var f = getFood(id); if (f) { f.name = name; commit(silent); } }
  function setFoodImage(id, dataUrl) { var f = getFood(id); if (f) { f.image = dataUrl || null; commit(); } }
  function deleteFood(id) {
    state.foods = state.foods.filter(function (f) { return f.id !== id; });
    state.foodStatus = state.foodStatus.filter(function (r) { return r.foodId !== id; });
    commit();
  }

  // ---- Food status (unique per mii+food) ---------------------------------
  function statusOf(miiId, foodId) {
    var r = state.foodStatus.find(function (x) { return x.miiId === miiId && x.foodId === foodId; });
    return r ? r.status : null;
  }
  function setFoodStatus(miiId, foodId, status) {
    if (STATUSES.indexOf(status) === -1) return;
    if (!getMii(miiId) || !getFood(foodId)) return;
    var r = state.foodStatus.find(function (x) { return x.miiId === miiId && x.foodId === foodId; });
    if (r) { r.status = status; }          // upsert: moves the pair to the new status
    else { state.foodStatus.push({ miiId: miiId, foodId: foodId, status: status }); }
    commit();
  }
  function clearFoodStatus(miiId, foodId) {
    state.foodStatus = state.foodStatus.filter(function (x) { return !(x.miiId === miiId && x.foodId === foodId); });
    commit();
  }

  // Foods this Mii has an opinion on, as [{food, status}] (skips dangling ids).
  function miiFoods(miiId) {
    return state.foodStatus
      .filter(function (r) { return r.miiId === miiId; })
      .map(function (r) { return { food: getFood(r.foodId), status: r.status }; })
      .filter(function (x) { return x.food; });
  }
  // Miis with an opinion on this food, as [{mii, status}].
  function foodMiis(foodId) {
    return state.foodStatus
      .filter(function (r) { return r.foodId === foodId; })
      .map(function (r) { return { mii: getMii(r.miiId), status: r.status }; })
      .filter(function (x) { return x.mii; });
  }
  // The four headline slots for a Mii's General view: [{label, status, foods:[food...]}]
  function generalSlots(miiId) {
    var mine = miiFoods(miiId);
    return HEADLINE.map(function (h) {
      return {
        label: h.label,
        status: h.status,
        foods: mine.filter(function (x) { return x.status === h.status; }).map(function (x) { return x.food; })
      };
    });
  }
  // Group a Mii's / Food's rows by status -> { status: [items...] }
  function miiFoodsByStatus(miiId) {
    var out = {}; STATUSES.forEach(function (s) { out[s] = []; });
    miiFoods(miiId).forEach(function (x) { out[x.status].push(x.food); });
    return out;
  }
  function foodMiisByStatus(foodId) {
    var out = {}; STATUSES.forEach(function (s) { out[s] = []; });
    foodMiis(foodId).forEach(function (x) { out[x.status].push(x.mii); });
    return out;
  }

  // ---- Nicknames (directed, single record) -------------------------------
  function nicknamesFrom(miiId) { return state.nicknames.filter(function (n) { return n.fromMiiId === miiId; }); }
  function nicknamesTo(miiId) { return state.nicknames.filter(function (n) { return n.toMiiId === miiId; }); }
  function upsertNickname(rec) {
    // rec: {id?, fromMiiId, toMiiId, nickname}
    if (!getMii(rec.fromMiiId) || !getMii(rec.toMiiId)) return null;
    var n;
    if (rec.id) { n = state.nicknames.find(function (x) { return x.id === rec.id; }); }
    if (n) {
      n.fromMiiId = rec.fromMiiId; n.toMiiId = rec.toMiiId; n.nickname = rec.nickname || '';
    } else {
      n = { id: uid('n'), fromMiiId: rec.fromMiiId, toMiiId: rec.toMiiId, nickname: rec.nickname || '' };
      state.nicknames.push(n);
    }
    commit();
    return n.id;
  }
  function deleteNickname(id) {
    state.nicknames = state.nicknames.filter(function (n) { return n.id !== id; });
    commit();
  }

  // ---- validation / import ----------------------------------------------
  // Sanitize an arbitrary parsed object into a valid state, dropping bad rows.
  // Returns {state, warnings:[...]}; throws only if `obj` is not a usable object.
  function sanitize(obj) {
    if (!obj || typeof obj !== 'object') throw new Error('Top-level JSON must be an object.');
    var warnings = [];
    var out = emptyState();

    var miis = Array.isArray(obj.miis) ? obj.miis : [];
    var seenM = {};
    miis.forEach(function (m, i) {
      if (!m || typeof m !== 'object') { warnings.push('Dropped invalid mii at index ' + i); return; }
      var id = typeof m.id === 'string' && m.id ? m.id : uid('m');
      if (seenM[id]) { warnings.push('Dropped duplicate mii id ' + id); return; }
      seenM[id] = true;
      out.miis.push({
        id: id,
        name: typeof m.name === 'string' ? m.name : '',
        avatar: typeof m.avatar === 'string' ? m.avatar : null,
        notes: typeof m.notes === 'string' ? m.notes : ''
      });
    });

    var foods = Array.isArray(obj.foods) ? obj.foods : [];
    var seenF = {};
    foods.forEach(function (f, i) {
      if (!f || typeof f !== 'object') { warnings.push('Dropped invalid food at index ' + i); return; }
      var id = typeof f.id === 'string' && f.id ? f.id : uid('f');
      if (seenF[id]) { warnings.push('Dropped duplicate food id ' + id); return; }
      seenF[id] = true;
      out.foods.push({
        id: id,
        name: typeof f.name === 'string' ? f.name : '',
        image: typeof f.image === 'string' ? f.image : null
      });
    });

    var fs = Array.isArray(obj.foodStatus) ? obj.foodStatus : [];
    var seenPair = {};
    fs.forEach(function (r) {
      if (!r || typeof r !== 'object') return;
      if (!seenM[r.miiId] || !seenF[r.foodId]) { warnings.push('Dropped food-status with unknown ids'); return; }
      if (STATUSES.indexOf(r.status) === -1) { warnings.push('Dropped food-status with bad status'); return; }
      var key = r.miiId + ' ' + r.foodId;
      if (seenPair[key]) { warnings.push('Dropped duplicate food-status pair'); return; }
      seenPair[key] = true;
      out.foodStatus.push({ miiId: r.miiId, foodId: r.foodId, status: r.status });
    });

    var nk = Array.isArray(obj.nicknames) ? obj.nicknames : [];
    var seenN = {};
    nk.forEach(function (n) {
      if (!n || typeof n !== 'object') return;
      if (!seenM[n.fromMiiId] || !seenM[n.toMiiId]) { warnings.push('Dropped nickname with unknown mii id'); return; }
      var id = typeof n.id === 'string' && n.id ? n.id : uid('n');
      if (seenN[id]) id = uid('n');
      seenN[id] = true;
      out.nicknames.push({
        id: id, fromMiiId: n.fromMiiId, toMiiId: n.toMiiId,
        nickname: typeof n.nickname === 'string' ? n.nickname : ''
      });
    });

    return { state: out, warnings: warnings };
  }

  function serialize() { return JSON.stringify(state, null, 2); }

  function replaceState(newState) {
    var res = sanitize(newState);
    state = res.state;
    commit();
    return res.warnings;
  }

  // Parse + apply text (Data tab Apply / Import). Never leaves partial state.
  function applyText(text) {
    var obj;
    try { obj = JSON.parse(text); }
    catch (e) { return { ok: false, error: 'Invalid JSON: ' + e.message }; }
    try {
      var warnings = replaceState(obj);
      return { ok: true, warnings: warnings };
    } catch (e) { return { ok: false, error: e.message }; }
  }

  // ---- persistence -------------------------------------------------------
  var DB_NAME = 'miiTracker', STORE_NAME = 'kv', KEY = 'appState';
  var persistTimer = null;

  function hasIDB() { return typeof global.indexedDB !== 'undefined' && global.indexedDB; }
  function hasLS() {
    try { return typeof global.localStorage !== 'undefined' && global.localStorage; }
    catch (e) { return false; }
  }

  function openDB() {
    return new Promise(function (resolve, reject) {
      var req = global.indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains(STORE_NAME)) req.result.createObjectStore(STORE_NAME);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function idbPut(value) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(value, KEY);
        tx.oncomplete = function () { db.close(); resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }
  function idbGet() {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var r = tx.objectStore(STORE_NAME).get(KEY);
        r.onsuccess = function () { db.close(); resolve(r.result); };
        r.onerror = function () { reject(r.error); };
      });
    });
  }

  function writeThrough() {
    var snapshot = JSON.parse(JSON.stringify(state));
    if (hasIDB()) {
      idbPut(snapshot).catch(function (e) {
        // Fall back to localStorage if IndexedDB write fails (e.g. private mode).
        try { if (hasLS()) global.localStorage.setItem(KEY, JSON.stringify(snapshot)); } catch (e2) {}
        console.warn('IndexedDB write failed, used localStorage fallback:', e);
      });
    } else if (hasLS()) {
      try { global.localStorage.setItem(KEY, JSON.stringify(snapshot)); } catch (e) {}
    }
  }

  function persist() {
    if (typeof global.setTimeout !== 'function') { writeThrough(); return; }
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = global.setTimeout(function () { persistTimer = null; writeThrough(); }, 250);
  }

  // Called by every mutation. `silent` persists without notifying subscribers,
  // so typing into a text field doesn't trigger a focus-stealing re-render.
  function commit(silent) { if (loaded) persist(); if (!silent) notify(); }

  function notify() { subscribers.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } }); }
  function subscribe(fn) { subscribers.push(fn); return function () { subscribers = subscribers.filter(function (x) { return x !== fn; }); }; }

  function load() {
    var read;
    if (hasIDB()) {
      read = idbGet().catch(function () {
        try { return hasLS() ? JSON.parse(global.localStorage.getItem(KEY) || 'null') : null; } catch (e) { return null; }
      });
    } else if (hasLS()) {
      read = Promise.resolve().then(function () { try { return JSON.parse(global.localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } });
    } else {
      read = Promise.resolve(null);
    }
    return read.then(function (rec) {
      if (rec) { try { state = sanitize(rec).state; } catch (e) { state = emptyState(); } }
      loaded = true;
      return state;
    });
  }

  // Force-flush any debounced write immediately (used before a fresh import replaces state).
  function flush() { if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; } writeThrough(); }

  var store = {
    STATUSES: STATUSES,
    HEADLINE: HEADLINE,
    emptyState: emptyState,
    getState: function () { return state; },
    serialize: serialize,
    load: load,
    flush: flush,
    subscribe: subscribe,
    // miis
    getMii: getMii, sortedMiis: sortedMiis, addMii: addMii,
    setMiiName: setMiiName, setMiiAvatar: setMiiAvatar, setMiiNotes: setMiiNotes, deleteMii: deleteMii,
    // foods
    getFood: getFood, sortedFoods: sortedFoods, addFood: addFood,
    setFoodName: setFoodName, setFoodImage: setFoodImage, deleteFood: deleteFood,
    // food status
    statusOf: statusOf, setFoodStatus: setFoodStatus, clearFoodStatus: clearFoodStatus,
    miiFoods: miiFoods, foodMiis: foodMiis, generalSlots: generalSlots,
    miiFoodsByStatus: miiFoodsByStatus, foodMiisByStatus: foodMiisByStatus,
    // nicknames
    nicknamesFrom: nicknamesFrom, nicknamesTo: nicknamesTo,
    upsertNickname: upsertNickname, deleteNickname: deleteNickname,
    // import/export
    sanitize: sanitize, replaceState: replaceState, applyText: applyText
  };

  global.App = global.App || {};
  global.App.store = store;
  if (typeof module !== 'undefined' && module.exports) module.exports = store;

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
