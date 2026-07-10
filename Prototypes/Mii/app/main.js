/*
 * main.js — router, ephemeral view state, render loop, boot.
 * Routes (hash): #/miis  #/foods  #/data  #/mii/:id  #/food/:id
 * App.go() updates the route synchronously (so a delete can navigate away
 * before the store's change notification re-renders the old screen).
 */
(function (global) {
  'use strict';
  var App = global.App;

  App.route = { name: 'miis', id: null };
  App.view = {};
  var pendingOverrides = null;

  function parseHash() {
    var hash = (location.hash || '').replace(/^#\/?/, '');   // strip "#/"
    var parts = hash.split('/');
    var name = parts[0] || 'miis';
    var id = parts[1] || null;
    if (name === 'mii' || name === 'food') {
      if (!id) { name = name === 'mii' ? 'miis' : 'foods'; id = null; }
    } else if (name !== 'miis' && name !== 'foods' && name !== 'data') {
      name = 'miis';
    }
    return { name: name, id: id };
  }

  function defaultView(route) {
    switch (route.name) {
      case 'miis':
      case 'foods': return { search: '' };
      case 'data': return { dataDraft: null };
      case 'mii': return { edit: false, subtab: 'general', nickEdits: {}, nickDrafts: [], focusName: false };
      case 'food': return { edit: false, focusName: false };
      default: return {};
    }
  }

  function applyRoute() {
    App.route = parseHash();
    App.view = defaultView(App.route);
    if (pendingOverrides) { Object.assign(App.view, pendingOverrides); pendingOverrides = null; }
    App.ui.closeReveal();
    render();
  }

  App.go = function (hash, overrides) {
    pendingOverrides = overrides || null;
    if (location.hash !== hash) location.hash = hash;   // hashchange (same-route) will be ignored below
    applyRoute();
  };

  function render() {
    var root = document.getElementById('app');
    if (!root) return;
    var fn = App.screens[App.route.name] || App.screens.miis;
    var screen = fn();
    root.textContent = '';
    root.appendChild(screen);
  }
  App.render = render;

  window.addEventListener('hashchange', function () {
    var r = parseHash();
    // Only react to genuine route changes (e.g. back/forward or manual edit);
    // programmatic App.go() already rendered synchronously.
    if (r.name !== App.route.name || r.id !== App.route.id) applyRoute();
  });

  function boot() {
    App.ui.initCamera();
    App.store.load().then(function () {
      App.store.subscribe(render);
      if (!location.hash) location.hash = '#/miis';
      applyRoute();
    });

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('service-worker.js').catch(function (e) {
          console.warn('SW registration failed (offline mode unavailable):', e);
        });
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})(window);
