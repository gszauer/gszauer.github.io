/*
 * screens.js — every screen renderer + shared list/nav/gesture wiring.
 * Reads App.route / App.view (owned by main.js) and mutates via App.store.
 * Full re-render on each store change; text fields update the store silently
 * to keep focus. Lists refresh their body in place so search keeps focus.
 */
(function (global) {
  'use strict';
  var App = global.App;
  var ui = App.ui, store = App.store;
  var h = ui.h, icon = ui.icon, avatar = ui.avatar, toast = ui.toast;
  function go(hash, o) { App.go(hash, o); }
  function render() { App.render(); }

  function dateStr() {
    var d = new Date();
    function p(n) { return String(n).padStart(2, '0'); }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function letterOf(name) {
    var c = (name || '').trim().charAt(0).toUpperCase();
    return /[A-Z]/.test(c) ? c : '#';
  }
  function groupByLetter(items) {
    var groups = [], cur = null;
    items.forEach(function (it) {
      var L = letterOf(it.name);
      if (!cur || cur.letter !== L) { cur = { letter: L, items: [] }; groups.push(cur); }
      cur.items.push(it);
    });
    return groups;
  }
  function emptyState(emoji, title, sub) {
    return h('div', { class: 'empty' },
      h('div', { class: 'emoji' }, emoji),
      h('div', { class: 'empty-title' }, title),
      sub ? h('div', { class: 'empty-sub' }, sub) : null);
  }

  // ---- shared nav bars ---------------------------------------------------
  function rootNav(active) {
    var titles = { miis: 'Miis', foods: 'Foods', data: 'Data' };
    var seg = h('div', { class: 'segmented' });
    [['miis', 'Miis'], ['foods', 'Foods'], ['data', 'Data']].forEach(function (t) {
      seg.appendChild(h('button', { class: 'seg' + (active === t[0] ? ' is-active' : ''), onClick: function () { go('#/' + t[0]); } }, t[1]));
    });
    return h('div', { class: 'nav nav--root' }, h('div', { class: 'nav-title' }, titles[active]), seg);
  }
  function detailNav(o) {
    return h('div', { class: 'nav nav--detail' },
      h('button', { class: 'nav-back', onClick: o.onBack }, icon('back'), h('span', {}, o.backLabel || '')),
      h('div', { class: 'nav-detail-title' }, o.title || ''),
      o.action ? h('button', { class: 'nav-action' + (o.primary ? ' is-primary' : ''), onClick: o.onAction }, o.action) : h('span', {}));
  }
  function segControl(keys, labels, active, onSel) {
    var seg = h('div', { class: 'segmented' });
    keys.forEach(function (k, i) {
      seg.appendChild(h('button', { class: 'seg' + (active === k ? ' is-active' : ''), onClick: function () { onSel(k); } }, labels[i]));
    });
    return seg;
  }
  function addRow(label, onClick) {
    return h('button', { class: 'card-action', onClick: onClick }, h('span', { class: 'plus-badge' }, '+'), h('span', {}, label));
  }

  // ---- A–Z index scrubber ------------------------------------------------
  function buildAZ(azEl, bubbleEl, groups, scrollEl) {
    azEl.innerHTML = '';
    if (groups.length < 2) { azEl.style.display = 'none'; return; }
    azEl.style.display = 'flex';
    var letters = groups.map(function (g) { return g.letter; });
    letters.forEach(function (L) { azEl.appendChild(h('span', {}, L)); });
    var dragging = false;
    function toLetter(y) {
      var r = azEl.getBoundingClientRect();
      var idx = Math.floor((y - r.top) / r.height * letters.length);
      return letters[Math.max(0, Math.min(letters.length - 1, idx))];
    }
    function scrollTo(L) {
      var t = scrollEl.querySelector('[data-letter="' + L + '"]');
      if (t) t.scrollIntoView({ block: 'start' });
    }
    function showBubble(L) { if (bubbleEl) { bubbleEl.textContent = L; bubbleEl.classList.add('show'); } }
    function hideBubble() { dragging = false; if (bubbleEl) bubbleEl.classList.remove('show'); }
    azEl.addEventListener('pointerdown', function (e) {
      e.preventDefault(); dragging = true;
      try { azEl.setPointerCapture(e.pointerId); } catch (x) {}
      var L = toLetter(e.clientY); scrollTo(L); showBubble(L);
    });
    azEl.addEventListener('pointermove', function (e) {
      if (!dragging) return; var L = toLetter(e.clientY); scrollTo(L); showBubble(L);
    });
    azEl.addEventListener('pointerup', hideBubble);
    azEl.addEventListener('pointercancel', hideBubble);
  }

  // ---- generic contact-list screen (Miis & Foods) ------------------------
  function listScreen(opts) {
    var view = App.view;
    var screen = h('div', { class: 'screen' });
    screen.appendChild(rootNav(opts.tab));

    var scroll = h('div', { class: 'scroll' });
    var az = h('div', { class: 'az-index no-select' });
    var bubble = h('div', { class: 'az-bubble' });
    screen.appendChild(scroll);
    screen.appendChild(az);
    screen.appendChild(bubble);

    function refresh() {
      scroll.innerHTML = '';
      var q = (view.search || '').trim().toLowerCase();
      var items = opts.getItems();
      if (q) items = items.filter(function (it) { return (it.name || '').toLowerCase().indexOf(q) !== -1; });
      if (!items.length) {
        scroll.appendChild(q
          ? emptyState('🔍', 'No matches', 'Try a different search.')
          : emptyState(opts.emptyEmoji, opts.emptyTitle, opts.emptySub));
        buildAZ(az, bubble, [], scroll);
        return;
      }
      var groups = groupByLetter(items);
      var wrap = h('div');
      groups.forEach(function (g) {
        wrap.appendChild(h('div', { class: 'section-header', 'data-letter': g.letter }, g.letter));
        var list = h('div', { class: 'list' });
        g.items.forEach(function (it) { list.appendChild(opts.rowFor(it)); });
        wrap.appendChild(list);
      });
      scroll.appendChild(wrap);
      scroll.appendChild(h('div', { class: 'scroll-pad-bottom' }));
      buildAZ(az, bubble, q ? [] : groups, scroll);
    }
    refresh();

    // sticky footer: search + add
    var input = h('input', { type: 'search', placeholder: opts.searchPlaceholder, value: view.search || '',
      autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false' });
    input.addEventListener('input', function () { view.search = input.value; refresh(); });
    var clear = h('button', { class: 'search-clear' + (view.search ? '' : ' hidden'), onClick: function () { view.search = ''; input.value = ''; clear.classList.add('hidden'); refresh(); } }, '✕');
    input.addEventListener('input', function () { clear.classList.toggle('hidden', !input.value); });
    var footer = h('div', { class: 'footer footer--search' },
      h('div', { class: 'searchbar' }, icon('search'), input, clear),
      h('button', { class: 'add-btn', 'aria-label': 'Add', onClick: opts.onAdd }, icon('plus')));
    screen.appendChild(footer);
    return screen;
  }

  // ================================================================= Miis ==
  function miisScreen() {
    return listScreen({
      tab: 'miis',
      getItems: function () { return store.sortedMiis(); },
      searchPlaceholder: 'Search Miis',
      emptyEmoji: '🙂', emptyTitle: 'No Miis yet', emptySub: 'Tap + to add your first Mii.',
      rowFor: miiRow,
      onAdd: function () { var id = store.addMii(''); go('#/mii/' + id, { edit: true, focusName: true }); }
    });
  }
  function miiRow(mii) {
    var row = h('div', { class: 'row' });
    var del = h('div', { class: 'swipe-delete', onClick: function (e) { e.stopPropagation(); ui.closeReveal(); confirmDeleteMii(mii); } }, 'Delete');
    var inner = h('div', { class: 'row-inner' },
      avatar({ src: mii.avatar, name: mii.name }),
      h('div', { class: 'row-name' + (mii.name ? '' : ' is-empty') }, mii.name || 'Unnamed Mii'),
      h('div', { class: 'row-accessory' }, icon('chevron')));
    row.appendChild(del); row.appendChild(inner);
    ui.longPress(inner, {
      onTap: function () { if (row.classList.contains('reveal-left')) { ui.closeReveal(); return; } go('#/mii/' + mii.id); },
      onLongPress: function () { ui.revealRow(row, 'left'); }
    });
    return row;
  }
  function confirmDeleteMii(mii) {
    ui.confirm({ title: 'Delete "' + (mii.name || 'this Mii') + '"?', message: 'This removes the Mii along with its nicknames and food opinions.', confirmText: 'Delete' })
      .then(function (ok) { if (ok) { store.deleteMii(mii.id); toast('Deleted'); } });
  }

  // ---- Mii detail --------------------------------------------------------
  function miiDetailScreen() {
    var view = App.view, id = App.route.id, mii = store.getMii(id);
    if (!mii) { setTimeout(function () { go('#/miis'); }, 0); return h('div', { class: 'screen' }); }
    var screen = h('div', { class: 'screen' });
    screen.appendChild(detailNav({
      backLabel: 'Miis', onBack: function () { go('#/miis'); },
      action: view.edit ? 'Done' : 'Edit', primary: view.edit,
      onAction: function () { view.edit = !view.edit; render(); }
    }));
    var scroll = h('div', { class: 'scroll' });

    // hero avatar
    var heroWrap = h('div', { class: 'hero-avatar-wrap' + (view.edit ? ' editable' : '') },
      avatar({ src: mii.avatar, name: mii.name, size: 'detail' }));
    if (view.edit) heroWrap.addEventListener('click', function () { ui.capturePhoto(function (url) { store.setMiiAvatar(id, url); }); });
    scroll.appendChild(h('div', { class: 'detail-hero' }, heroWrap));

    // name
    if (view.edit) {
      var inp = h('input', { class: 'name-input', type: 'text', placeholder: 'Name', value: mii.name });
      inp.addEventListener('input', function () { store.setMiiName(id, inp.value, true); });
      scroll.appendChild(inp);
      if (view.focusName) { view.focusName = false; setTimeout(function () { inp.focus(); }, 40); }
    } else {
      scroll.appendChild(h('div', { class: 'detail-name' + (mii.name ? '' : ' is-empty') }, mii.name || 'Unnamed Mii'));
    }

    // sub-tabs
    var sub = view.subtab || 'general';
    scroll.appendChild(h('div', { class: 'subtabs' },
      segControl(['general', 'nicknames', 'food'], ['General', 'Nicknames', 'Food'], sub, function (t) { view.subtab = t; render(); })));

    if (sub === 'general') scroll.appendChild(generalSub(mii));
    else if (sub === 'nicknames') scroll.appendChild(nicknamesSub(mii));
    else scroll.appendChild(foodSub(mii));

    scroll.appendChild(h('div', { class: 'scroll-pad-bottom' }));
    screen.appendChild(scroll);
    return screen;
  }

  function generalSub(mii) {
    var frag = h('div');
    var card = h('div', { class: 'card' });
    store.generalSlots(mii.id).forEach(function (s) {
      var names = s.foods.map(function (f) { return f.name || 'Unnamed'; }).join(', ');
      var row = h('div', { class: 'card-row' + (s.foods.length ? ' tappable' : '') },
        h('span', { class: 'cr-label' }, s.label),
        h('span', { class: 'cr-value' + (names ? '' : ' muted') }, names || '—'));
      if (s.foods.length === 1) row.addEventListener('click', function () { go('#/food/' + s.foods[0].id); });
      card.appendChild(row);
    });
    frag.appendChild(h('div', { class: 'group' },
      h('div', { class: 'group-title' }, 'Food Favorites'), card,
      h('div', { class: 'group-footer' }, 'Edit these in the Food tab.')));

    var ta = h('textarea', { class: 'notes-area', placeholder: 'Notes about this Mii…', rows: '4' });
    ta.value = mii.notes || '';
    ta.addEventListener('input', function () { store.setMiiNotes(mii.id, ta.value, true); });
    frag.appendChild(h('div', { class: 'group' },
      h('div', { class: 'group-title' }, 'Notes'), h('div', { class: 'notes-card' }, ta)));
    return frag;
  }

  function otherMiis(excludeId) {
    return store.sortedMiis().filter(function (m) { return m.id !== excludeId; });
  }

  function nicknamesSub(mii) {
    var view = App.view;
    var frag = h('div');

    // "Nicknames this Mii has for other Miis" — editable
    var fromCard = h('div', { class: 'card' });
    var fromLinks = store.nicknamesFrom(mii.id);
    var anyFrom = false;
    fromLinks.forEach(function (n) {
      anyFrom = true;
      if (view.nickEdits[n.id]) fromCard.appendChild(nickEditRow(mii, view.nickEdits[n.id], { existingId: n.id }));
      else fromCard.appendChild(nickDisplayRow(mii, n, 'to'));
    });
    view.nickDrafts.forEach(function (d) { anyFrom = true; fromCard.appendChild(nickEditRow(mii, d, { draft: d })); });
    if (!anyFrom) fromCard.appendChild(h('div', { class: 'card-row' }, h('span', { class: 'cr-placeholder' }, 'No nicknames yet.')));
    fromCard.appendChild(addRow('Add nickname', function () {
      view.nickDrafts.push({ toMiiId: null, nickname: '' }); render();
    }));
    frag.appendChild(h('div', { class: 'group' },
      h('div', { class: 'group-title' }, 'Nicknames this Mii has for others'), fromCard));

    // "Nicknames others have for this Mii" — read-only
    var toCard = h('div', { class: 'card' });
    var toLinks = store.nicknamesTo(mii.id);
    if (toLinks.length) toLinks.forEach(function (n) { toCard.appendChild(nickDisplayRow(mii, n, 'from')); });
    else toCard.appendChild(h('div', { class: 'card-row' }, h('span', { class: 'cr-placeholder' }, 'No one has a nickname for this Mii yet.')));
    frag.appendChild(h('div', { class: 'group' },
      h('div', { class: 'group-title' }, 'Nicknames others have for this Mii'), toCard,
      h('div', { class: 'group-footer' }, 'Long-press a nickname above to edit it.')));
    return frag;
  }

  // side 'to' => this Mii is the giver, show the target; 'from' => show the source
  function nickDisplayRow(mii, n, side) {
    var otherId = side === 'to' ? n.toMiiId : n.fromMiiId;
    var other = store.getMii(otherId);
    var content = h('div', { class: 'cr-swipe-content' },
      avatar({ src: other ? other.avatar : null, name: other ? other.name : '', size: 'mini' }),
      h('span', { class: 'cr-name' + (other && other.name ? '' : ' is-empty') }, other ? (other.name || 'Unnamed Mii') : '—'),
      h('span', { class: 'cr-nick' }, '“' + (n.nickname || '') + '”'));
    var row = h('div', { class: 'card-row inset-sep tappable' }, content);
    if (side === 'to') {
      ui.longPress(content, {
        onTap: function () { go('#/mii/' + otherId); },
        onLongPress: function () { App.view.nickEdits[n.id] = { toMiiId: n.toMiiId, nickname: n.nickname }; render(); }
      });
    } else {
      content.appendChild(h('div', { class: 'row-accessory', style: { marginLeft: 'auto' } }, icon('chevron')));
      row.classList.add('tappable');
      ui.longPress(content, { onTap: function () { go('#/mii/' + otherId); } });
    }
    return row;
  }

  function nickEditRow(mii, e, meta) {
    var target = e.toMiiId ? store.getMii(e.toMiiId) : null;
    var av = avatar({ src: target ? target.avatar : null, name: target ? target.name : '', size: 'mini' });
    if (!target) av.classList.add('pick-target');
    var avBtn = h('button', { class: 'nick-av', style: { flex: '0 0 auto' }, onClick: function () {
      ui.pickSheet({ title: 'Nickname for which Mii?', emptyText: 'Add another Mii first.',
        options: otherMiis(mii.id).map(function (m) { return { value: m.id, label: m.name || 'Unnamed Mii', src: m.avatar }; }) })
        .then(function (pick) { if (pick) { e.toMiiId = pick; render(); } });
    } }, av);
    var input = h('input', { class: 'row-edit-input', placeholder: 'Nickname', value: e.nickname || '' });
    input.addEventListener('input', function () { e.nickname = input.value; });
    var accept = h('button', { class: 'row-btn accept', 'aria-label': 'Save', onClick: function () {
      if (!e.toMiiId) { toast('Pick a Mii first'); return; }
      if (meta.existingId) delete App.view.nickEdits[meta.existingId];
      if (meta.draft) App.view.nickDrafts = App.view.nickDrafts.filter(function (x) { return x !== meta.draft; });
      store.upsertNickname({ id: meta.existingId, fromMiiId: mii.id, toMiiId: e.toMiiId, nickname: e.nickname });
    } }, icon('check'));
    var del = h('button', { class: 'row-btn remove', 'aria-label': 'Delete', onClick: function () {
      if (meta.draft) { App.view.nickDrafts = App.view.nickDrafts.filter(function (x) { return x !== meta.draft; }); render(); }
      else if (meta.existingId) { delete App.view.nickEdits[meta.existingId]; store.deleteNickname(meta.existingId); }
    } }, icon('trash'));
    return h('div', { class: 'card-row inset-sep' },
      h('div', { class: 'cr-swipe-content' }, avBtn, input, accept, del));
  }

  function foodSub(mii) {
    var frag = h('div');

    // fixed 4-slot headline list
    var slotCard = h('div', { class: 'card' });
    store.generalSlots(mii.id).forEach(function (s) {
      var names = s.foods.map(function (f) { return f.name || 'Unnamed'; }).join(', ');
      var row = h('div', { class: 'card-row' },
        h('span', { class: 'cr-label' }, s.label),
        h('span', { class: 'cr-value' + (names ? ' tint' : ' muted') }, names || 'Set…'));
      ui.longPress(row, { onTap: function () { setSlot(mii, s); }, onLongPress: function () { setSlot(mii, s); } });
      slotCard.appendChild(row);
    });
    frag.appendChild(h('div', { class: 'group' },
      h('div', { class: 'group-title' }, 'At a glance'), slotCard,
      h('div', { class: 'group-footer' }, 'Long-press a slot to set it.')));

    // one list per status
    var byStatus = store.miiFoodsByStatus(mii.id);
    store.STATUSES.forEach(function (status) {
      var foods = byStatus[status];
      var card = h('div', { class: 'card' });
      foods.forEach(function (f) { card.appendChild(foodStatusRow(mii, f)); });
      card.appendChild(addRow('Add food', function () { addFoodToStatus(mii, status); }));
      frag.appendChild(h('div', { class: 'group' }, h('div', { class: 'group-title' }, status), card));
    });
    return frag;
  }

  function foodStatusRow(mii, f) {
    var row = h('div', { class: 'card-row inset-sep' });
    var content = h('div', { class: 'cr-swipe-content' },
      avatar({ src: f.image, name: f.name, food: true, size: 'mini' }),
      h('span', { class: 'cr-name' + (f.name ? '' : ' is-empty') }, f.name || 'Unnamed Food'));
    var del = h('div', { class: 'cr-delete', onClick: function (e) { e.stopPropagation(); ui.closeReveal(); store.clearFoodStatus(mii.id, f.id); } }, icon('trash'));
    row.appendChild(del); row.appendChild(content);
    ui.longPress(content, {
      onTap: function () { if (row.classList.contains('reveal-right')) { ui.closeReveal(); return; } go('#/food/' + f.id); },
      onLongPress: function () { ui.revealRow(row, 'right'); }
    });
    return row;
  }

  function setSlot(mii, s) {
    var foods = store.sortedFoods();
    if (!foods.length) { toast('Add some foods first'); return; }
    var items = foods.map(function (f) {
      return { value: 'set:' + f.id, label: f.name || 'Unnamed Food', leading: avatar({ src: f.image, name: f.name, food: true, size: 'mini' }) };
    });
    s.foods.forEach(function (f) { items.unshift({ value: 'clear:' + f.id, label: 'Remove "' + (f.name || 'Unnamed') + '"', destructive: true }); });
    ui.actionSheet({ title: 'Set ' + s.label, items: items }).then(function (pick) {
      if (!pick) return;
      var i = pick.indexOf(':'), op = pick.slice(0, i), fid = pick.slice(i + 1);
      if (op === 'set') store.setFoodStatus(mii.id, fid, s.status);
      else store.clearFoodStatus(mii.id, fid);
    });
  }
  function addFoodToStatus(mii, status) {
    var foods = store.sortedFoods();
    if (!foods.length) { toast('Add some foods first'); return; }
    ui.pickSheet({ title: 'Add to “' + status + '”', emptyText: 'Add some foods first.',
      options: foods.map(function (f) { return { value: f.id, label: f.name || 'Unnamed Food', src: f.image, food: true }; }) })
      .then(function (pick) { if (pick) store.setFoodStatus(mii.id, pick, status); });
  }

  // ================================================================ Foods ==
  function foodsScreen() {
    return listScreen({
      tab: 'foods',
      getItems: function () { return store.sortedFoods(); },
      searchPlaceholder: 'Search Foods',
      emptyEmoji: '🍔', emptyTitle: 'No foods yet', emptySub: 'Tap + to add a food.',
      rowFor: foodRow,
      onAdd: function () { var id = store.addFood(''); go('#/food/' + id, { edit: true, focusName: true }); }
    });
  }
  function foodRow(food) {
    var row = h('div', { class: 'row' });
    var inner = h('div', { class: 'row-inner' },
      avatar({ src: food.image, name: food.name, food: true }),
      h('div', { class: 'row-name' + (food.name ? '' : ' is-empty') }, food.name || 'Unnamed Food'),
      h('div', { class: 'row-accessory' }, icon('chevron')));
    row.appendChild(inner);
    ui.longPress(inner, {
      onTap: function () { go('#/food/' + food.id); },
      onLongPress: function () { go('#/food/' + food.id, { edit: true }); }   // long-press a food -> edit view
    });
    return row;
  }

  function foodDetailScreen() {
    var view = App.view, id = App.route.id, food = store.getFood(id);
    if (!food) { setTimeout(function () { go('#/foods'); }, 0); return h('div', { class: 'screen' }); }
    var screen = h('div', { class: 'screen' });
    screen.appendChild(detailNav({
      backLabel: 'Foods', onBack: function () { go('#/foods'); },
      action: view.edit ? 'Done' : 'Edit', primary: view.edit,
      onAction: function () { view.edit = !view.edit; render(); }
    }));
    var scroll = h('div', { class: 'scroll' });

    var heroWrap = h('div', { class: 'hero-avatar-wrap' + (view.edit ? ' editable' : '') },
      avatar({ src: food.image, name: food.name, food: true, size: 'detail' }));
    if (view.edit) heroWrap.addEventListener('click', function () { ui.capturePhoto(function (url) { store.setFoodImage(id, url); }); });
    scroll.appendChild(h('div', { class: 'detail-hero' }, heroWrap));

    if (view.edit) {
      var inp = h('input', { class: 'name-input', type: 'text', placeholder: 'Food name', value: food.name });
      inp.addEventListener('input', function () { store.setFoodName(id, inp.value, true); });
      scroll.appendChild(inp);
      if (view.focusName) { view.focusName = false; setTimeout(function () { inp.focus(); }, 40); }
      scroll.appendChild(h('div', { class: 'group' },
        h('div', { class: 'card' },
          h('button', { class: 'card-action destructive', onClick: function () {
            ui.confirm({ title: 'Delete "' + (food.name || 'this food') + '"?', message: 'This removes the food and clears it from every Mii.', confirmText: 'Delete' })
              .then(function (ok) { if (ok) { store.deleteFood(id); toast('Deleted'); go('#/foods'); } });
          } }, 'Delete Food'))));
    } else {
      scroll.appendChild(h('div', { class: 'detail-name' + (food.name ? '' : ' is-empty') }, food.name || 'Unnamed Food'));
    }

    // per-status Mii lists (read-only; edited on the Mii), best first
    var byStatus = store.foodMiisByStatus(id);
    var any = false;
    var order = store.STATUSES.slice().reverse();
    order.forEach(function (status) {
      var miis = byStatus[status];
      if (!miis.length) return;
      any = true;
      var card = h('div', { class: 'card' });
      miis.forEach(function (m) {
        var row = h('div', { class: 'card-row inset-sep tappable' },
          avatar({ src: m.avatar, name: m.name, size: 'mini' }),
          h('span', { class: 'cr-name' + (m.name ? '' : ' is-empty') }, m.name || 'Unnamed Mii'),
          h('div', { class: 'row-accessory' }, icon('chevron')));
        row.addEventListener('click', function () { go('#/mii/' + m.id); });
        card.appendChild(row);
      });
      scroll.appendChild(h('div', { class: 'group' }, h('div', { class: 'group-title' }, status), card));
    });
    if (!any && !view.edit) scroll.appendChild(emptyState('🍽️', 'No opinions yet', 'Set this food on a Mii’s Food tab.'));

    scroll.appendChild(h('div', { class: 'scroll-pad-bottom' }));
    screen.appendChild(scroll);
    return screen;
  }

  // ================================================================= Data ==
  function dataScreen() {
    var view = App.view;
    if (view.dataDraft == null) view.dataDraft = store.serialize();
    var screen = h('div', { class: 'screen' });
    screen.appendChild(rootNav('data'));

    var ta = h('textarea', { class: 'data-area', spellcheck: 'false', autocapitalize: 'none', autocorrect: 'off', wrap: 'off' });
    ta.value = view.dataDraft;
    var applyBtn;
    function updateDirty() { if (applyBtn) applyBtn.disabled = (ta.value === store.serialize()); }
    ta.addEventListener('input', function () { view.dataDraft = ta.value; updateDirty(); });
    screen.appendChild(h('div', { class: 'data-wrap' }, ta));

    applyBtn = h('button', { class: 'is-strong', onClick: function () {
      var res = store.applyText(ta.value);
      if (!res.ok) { toast(res.error); return; }
      view.dataDraft = store.serialize();
      toast(res.warnings.length ? 'Applied — fixed ' + res.warnings.length + ' issue(s)' : 'Applied');
      render();
    } }, 'Apply');
    var selectBtn = h('button', { onClick: function () { ta.focus(); ta.select(); } }, 'Select all');
    var exportBtn = h('button', { onClick: doExport }, 'Export');
    var importBtn = h('button', { onClick: doImport }, 'Import');
    screen.appendChild(h('div', { class: 'footer footer--data' }, applyBtn, selectBtn, exportBtn, importBtn));
    updateDirty();
    return screen;

    function doExport() {
      try {
        var blob = new Blob([store.serialize()], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = h('a', { href: url, download: 'miis-backup-' + dateStr() + '.json' });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        toast('Exported');
      } catch (e) { toast('Export failed'); }
    }
    function doImport() {
      var inp = h('input', { type: 'file', accept: 'application/json,.json,text/plain', style: { display: 'none' } });
      document.body.appendChild(inp);
      inp.addEventListener('change', function () {
        var f = inp.files && inp.files[0];
        if (!f) { document.body.removeChild(inp); return; }
        var reader = new FileReader();
        reader.onload = function () {
          document.body.removeChild(inp);
          var text = String(reader.result || '');
          var res = store.applyText(text);
          if (res.ok) { view.dataDraft = store.serialize(); render(); toast(res.warnings.length ? 'Imported — fixed ' + res.warnings.length + ' issue(s)' : 'Imported'); }
          else { view.dataDraft = text; render(); toast('Import error: ' + res.error); }
        };
        reader.onerror = function () { document.body.removeChild(inp); toast('Could not read file'); };
        reader.readAsText(f);
      });
      inp.click();
    }
  }

  App.screens = {
    miis: miisScreen, mii: miiDetailScreen,
    foods: foodsScreen, food: foodDetailScreen,
    data: dataScreen
  };

})(window);
