/*
 * stats-render.js — populate every [data-stat] span from window.LIVE_STATS.
 *
 * Each span already contains the committed last-known-good number (its
 * fallback), so if window.LIVE_STATS is missing — or a key is absent — the
 * honest baked-in value simply stays. This is what keeps a failed generation
 * run from ever blanking the page. Numbers render with a thousands separator.
 *
 * Load AFTER live-stats.js. Idempotent + DOM-ready-safe.
 */
(function () {
  var s = window.LIVE_STATS;
  if (!s) return; // no data -> keep the baked-in fallback text

  function render() {
    var els = document.querySelectorAll("[data-stat]");
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute("data-stat");
      if (s[key] == null) continue;
      var v = s[key];
      els[i].textContent =
        typeof v === "number" ? v.toLocaleString("en-US") : String(v);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
