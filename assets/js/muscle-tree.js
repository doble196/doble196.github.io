/* Muscle tree — the engine. Data lives in tree-data.js (window.MUSCLE_TREE);
   this file never names a muscle or a project.

   How it works, honestly:
   - The tree is REAL PAGE CONTENT. The data root is the page identity (the
     hero header in the HTML), so its children — the muscles — render as a
     column of cards. Tap a card and its work slides open beneath it; the
     page grows and you scroll like any other page.
   - No camera, no pan, no zoom, no pinch. All motion is CSS: the open/close
     is a grid-template-rows 0fr→1fr transition (height animates without JS
     measuring), leaves stagger in via a per-row --i delay.
   - The sector filter hides non-matching top-level branches with the same
     grid-row collapse, so filtering moves like everything else. */
(function () {
  "use strict";

  var treeEl = document.getElementById("tree");
  if (!treeEl || !window.MUSCLE_TREE) return;

  // ---- no pinch zoom -----------------------------------------------------------
  // The viewport meta (maximum-scale=1, user-scalable=no) covers Android;
  // iOS Safari ignores it by design, but does expose non-standard gesture
  // events for pinches — cancelling them blocks the zoom. Buttons and links
  // stay fully usable; browser text-size settings still work.
  ["gesturestart", "gesturechange", "gestureend"].forEach(function (ev) {
    document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false });
  });

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ---- build -------------------------------------------------------------------
  // The root node duplicates the hero header, so rendering starts at its
  // children. Each child becomes a .branch card in a collapsible .branch-slot
  // (the slot is what the sector filter animates away).
  var slots = []; // { el, sectors } per top-level branch, for the filter
  var uid = 0;

  function leafHTML(data, i) {
    var external = /^https?:/.test(data.href || "");
    var html = '<a class="leaf" style="--i:' + i + '" href="' + esc(data.href || "#") + '"' +
      (external ? ' target="_blank" rel="noopener noreferrer"' : "") + ">";
    html += "<span><span class=\"leaf__label\">" + esc(data.label) + "</span>";
    if (data.sub) html += '<span class="leaf__sub">' + esc(data.sub) + "</span>";
    html += "</span>";
    html += '<span class="leaf__go mono" aria-hidden="true">' + (external ? "↗" : "→") + "</span>";
    return html + "</a>";
  }

  function buildBranch(data) {
    var id = "branch-kids-" + (uid++);
    var section = document.createElement("section");
    section.className = "branch" + (data.featured ? " branch--featured" : "");

    var kidsHTML = (data.children || []).map(function (c, i) {
      // a nested group renders as an inner branch; plain work renders as a leaf
      return (c.children && c.children.length) ? "" : leafHTML(c, i);
    }).join("");

    section.innerHTML =
      '<h2 class="branch__heading">' +
        '<button type="button" class="branch__toggle" aria-expanded="false" aria-controls="' + id + '">' +
          "<span><span class=\"branch__label\">" + esc(data.label) + "</span>" +
          (data.sub ? '<span class="branch__sub">' + esc(data.sub) + "</span>" : "") +
          "</span>" +
          '<span class="branch__meta mono" aria-hidden="true">' +
            (data.featured ? "★ " : "") + (data.children || []).length +
            '<span class="branch__chevron">▸</span>' +
          "</span>" +
        "</button>" +
      "</h2>" +
      '<div class="branch__body" id="' + id + '">' +
        '<div class="branch__kids"><div class="branch__kids-inner">' + kidsHTML + "</div></div>" +
      "</div>";

    // nested groups (arbitrary depth): append recursively where they belong
    var inner = section.querySelector(".branch__kids-inner");
    (data.children || []).forEach(function (c) {
      if (c.children && c.children.length) inner.appendChild(buildBranch(c));
    });

    var toggle = section.querySelector(".branch__toggle");
    toggle.addEventListener("click", function () {
      var open = section.classList.toggle("branch--open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    return section;
  }

  (window.MUSCLE_TREE.children || []).forEach(function (child) {
    var slot = document.createElement("div");
    slot.className = "branch-slot";
    var inner = document.createElement("div");
    inner.className = "branch-slot__inner";
    var branch = buildBranch(child);
    // the flagship opens by default — the story is visible with zero clicks
    if (child.featured) {
      branch.classList.add("branch--open");
      branch.querySelector(".branch__toggle").setAttribute("aria-expanded", "true");
    }
    inner.appendChild(branch);
    slot.appendChild(inner);
    treeEl.appendChild(slot);
    slots.push({ el: slot, sectors: child.sectors || [] });
  });

  // ---- sector filter -----------------------------------------------------------
  var activeSector = null;
  function applyFilter(sector) {
    activeSector = sector || null;
    slots.forEach(function (s) {
      var show = !activeSector || s.sectors.indexOf(activeSector) !== -1;
      s.el.classList.toggle("branch-slot--hidden", !show);
      // hidden branches leave the a11y tree and tab order entirely
      if (show) s.el.removeAttribute("aria-hidden");
      else s.el.setAttribute("aria-hidden", "true");
    });
    var chips = document.querySelectorAll(".sector-chip");
    for (var k = 0; k < chips.length; k++) {
      var on = (chips[k].getAttribute("data-sector") || "") === (activeSector || "");
      chips[k].setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  // chips are generated from data (window.MUSCLE_SECTORS) so the engine stays
  // content-blind — add a sector by editing tree-data.js, not this file.
  var bar = document.getElementById("sectorBar");
  if (bar && window.MUSCLE_SECTORS) {
    window.MUSCLE_SECTORS.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sector-chip";
      b.textContent = s.label;
      b.setAttribute("data-sector", s.key || "");
      b.setAttribute("aria-pressed", s.key ? "false" : "true");
      b.addEventListener("click", function () { applyFilter(s.key); });
      bar.appendChild(b);
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // test hook: lets a verifier PROVE the filter/expand behavior
  window.__tree = {
    applyFilter: applyFilter,
    sector: function () { return activeSector; },
    openCount: function () { return document.querySelectorAll(".branch--open").length; },
    visibleCount: function () { return document.querySelectorAll(".branch-slot:not(.branch-slot--hidden)").length; },
  };
})();
