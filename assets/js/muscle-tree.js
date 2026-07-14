/* Muscle tree — the engine. Data lives in tree-data.js (window.MUSCLE_TREE);
   this file never names a muscle or a project.

   How it works, honestly:
   - Layout: a classic "tidy tree" — every visible leaf gets a fixed-height
     slot, every parent centers on its children. Recomputed on each
     expand/collapse; nothing can overlap because heights are summed, not
     guessed.
   - Motion: one requestAnimationFrame loop integrates a critically-damped
     spring (F = -k·x - c·v) per node and for the camera. No animation
     library — the physics is ~20 lines, below.
   - Lines: SVG cubic béziers recomputed every frame while nodes move; the
     "energy flow" reveal is stroke-dasharray/dashoffset driven by a 0→1
     progress that must finish before the child card fades/scales in.
   - Camera: translate+scale on a "world" div (cards) + <g> (lines). Drag to
     pan, wheel/pinch to zoom, and an auto-frame spring pans newly revealed
     children into view. */
(function () {
  "use strict";

  var stage = document.getElementById("treeStage");
  var world = document.getElementById("treeWorld");
  var svg = document.getElementById("treeLines");
  var linesG = document.getElementById("treeLinesG");
  if (!stage || !world || !window.MUSCLE_TREE) return;

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- geometry constants ---------------------------------------------------
  var NODE_W = 230;      // card width (must match CSS)
  var SLOT_H = 118;      // vertical slot per visible leaf — must exceed the
                         // tallest card (3-line sub ≈ 104px) or siblings overlap
  var COL_W = 300;       // horizontal distance per depth level
  var LINE_MS = REDUCED ? 0 : 340;   // line-draw duration
  var STAGGER_MS = REDUCED ? 0 : 70; // per-sibling reveal delay

  // ---- spring physics ---------------------------------------------------------
  // Critically damped-ish: k=170, c=26 settles in ~0.5s without overshoot drama.
  var K = 170, C = 26;
  function springStep(obj, dt) {
    // integrates x,y (+ scale s, opacity o as first-order lerps)
    var settled = true;
    ["x", "y"].forEach(function (axis) {
      var t = obj["t" + axis], v = obj["v" + axis] || 0, p = obj[axis];
      var a = K * (t - p) - C * v;
      v += a * dt; p += v * dt;
      if (Math.abs(t - p) < 0.1 && Math.abs(v) < 0.1) { p = t; v = 0; } else settled = false;
      obj[axis] = p; obj["v" + axis] = v;
    });
    ["s", "o"].forEach(function (kk) {
      var t = obj["t" + kk], p = obj[kk];
      p += (t - p) * Math.min(1, dt * 12);
      if (Math.abs(t - p) < 0.005) p = t; else settled = false;
      obj[kk] = p;
    });
    if (REDUCED) { obj.x = obj.tx; obj.y = obj.ty; obj.s = obj.ts; obj.o = obj.to; return true; }
    return settled;
  }

  // ---- build the node model from data ----------------------------------------
  var nodes = [];        // flat list of node records
  function makeNode(data, parent, depth, idx) {
    var n = {
      id: (parent ? parent.id + "." : "n") + idx,
      data: data, parent: parent, depth: depth,
      children: [], expanded: false,
      // spring state (x,y = card CENTER in world coords)
      x: 0, y: 0, vx: 0, vy: 0, s: 0.6, o: 0, tx: 0, ty: 0, ts: 1, to: 1,
      visible: false, exiting: false,
      lineP: 0, lineStart: 0,        // line-draw progress + timestamp
      el: null, path: null,
    };
    (data.children || []).forEach(function (c, i) {
      n.children.push(makeNode(c, n, depth + 1, i));
    });
    nodes.push(n);
    return n;
  }
  var root = makeNode(window.MUSCLE_TREE, null, 0, 0);

  // ---- sector filter ----------------------------------------------------------
  // Only the root's children (the muscles) carry `sectors`. When a sector is
  // active, layout + expansion see ONLY the matching muscles; deeper levels
  // (projects) are never filtered. This is the whole filter mechanism — every
  // function that walks children goes through visibleChildren(), so the layout
  // can never disagree with what's mounted.
  var activeSector = null;
  function inSector(n) {
    return !activeSector || (n.data.sectors || []).indexOf(activeSector) !== -1;
  }
  function visibleChildren(n) {
    return (activeSector && n.depth === 0) ? n.children.filter(inSector) : n.children;
  }

  // ---- tidy layout ------------------------------------------------------------
  function subtreeH(n) {
    var kids = n.expanded ? visibleChildren(n) : [];
    if (!kids.length) return SLOT_H;
    var h = 0;
    kids.forEach(function (c) { h += subtreeH(c); });
    return Math.max(SLOT_H, h);
  }
  function assign(n, x, yTop) {
    var h = subtreeH(n);
    n.tx = x;
    n.ty = yTop + h / 2;
    if (n.expanded) {
      var cy = yTop;
      visibleChildren(n).forEach(function (c) {
        assign(c, x + COL_W, cy);
        cy += subtreeH(c);
      });
    }
    return h;
  }
  function layout() { assign(root, 0, -subtreeH(root) / 2); }

  // ---- DOM --------------------------------------------------------------------
  function mount(n, fromParent) {
    if (n.el) return;
    var isLeaf = !n.children.length;
    var el = document.createElement(isLeaf && n.data.href ? "a" : "button");
    el.className = "tnode tnode--d" + Math.min(n.depth, 2) +
      (isLeaf ? " tnode--leaf" : "") + (n.data.featured ? " tnode--featured" : "");
    if (isLeaf && n.data.href) {
      el.href = n.data.href;
      if (/^https?:/.test(n.data.href)) { el.target = "_blank"; el.rel = "noopener noreferrer"; }
    } else {
      el.type = "button";
      el.setAttribute("aria-expanded", "false");
    }
    var html = '<span class="tnode__label">' + esc(n.data.label) + "</span>";
    if (n.data.sub) html += '<span class="tnode__sub">' + esc(n.data.sub) + "</span>";
    if (!isLeaf) html += '<span class="tnode__chip mono" aria-hidden="true">' + (n.data.featured ? "★ " : "▸ ") + n.children.length + "</span>";
    else if (n.data.href) html += '<span class="tnode__chip mono" aria-hidden="true">↗</span>';
    el.innerHTML = html;
    if (!isLeaf) el.addEventListener("click", function () { toggle(n); });
    world.appendChild(el);
    n.el = el;

    if (n.parent) {
      var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("class", "tline");
      linesG.appendChild(p);
      n.path = p;
    }
    // spawn at the parent's current position so it flies out of it
    var sx = fromParent ? fromParent.x : n.tx, sy = fromParent ? fromParent.y : n.ty;
    n.x = sx; n.y = sy; n.vx = 0; n.vy = 0; n.s = 0.6; n.o = 0; n.ts = 1; n.to = 1;
    n.visible = true; n.exiting = false;
  }
  function unmountSubtree(n) {
    n.children.forEach(unmountSubtree);
    if (!n.el) return;
    n.exiting = true; n.expanded = false;
    n.ts = 0.6; n.to = 0;
    if (n.parent) { n.tx = n.parent.tx; n.ty = n.parent.ty; }
  }
  function reap(n) { // remove settled exiting nodes
    if (n.exiting && n.el && n.o < 0.03) {
      n.el.remove(); n.el = null;
      if (n.path) { n.path.remove(); n.path = null; }
      n.visible = false; n.exiting = false;
    }
    n.children.forEach(reap);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ---- expand / collapse --------------------------------------------------------
  var now = function () { return performance.now(); };
  function toggle(n) {
    if (n.exiting) return;
    if (n.expanded) {
      n.expanded = false;
      n.el.setAttribute("aria-expanded", "false");
      n.el.classList.remove("tnode--open");
      n.children.forEach(unmountSubtree);
    } else {
      n.expanded = true;
      n.el.setAttribute("aria-expanded", "true");
      n.el.classList.add("tnode--open");
      var t0 = now();
      visibleChildren(n).forEach(function (c, i) {
        mount(c, n);
        c.lineP = 0;
        c.lineStart = t0 + i * STAGGER_MS;
      });
    }
    layout();
    frameCamera(n);
    // after a COLLAPSE the tree shrank → its fit-floor rose → snap the zoom
    // back in so we never sit zoomed-out on empty space.
    cam.ts = clampZ(cam.ts);
    kick();
  }

  // ---- camera --------------------------------------------------------------------
  var cam = { x: 0, y: 0, vx: 0, vy: 0, s: 1, tx: 0, ty: 0, ts: 1, o: 1, to: 1 };
  // Zoom is bounded on BOTH ends, and the LOWER bound is DYNAMIC: you can zoom
  // out exactly until the whole tree fits the viewport and NO further — past
  // that is just empty canvas. Upper bound is a fixed max. Every zoom path
  // (wheel, pinch, +/− buttons, and the auto-frame on expand) runs through
  // clampZ, so nothing — not even an auto "jump" — escapes "where it fits".
  var HARD_MIN = 0.25, MAX_Z = 1.5, DEFAULT_Z = 1, NAV_H = 72;
  function viewport() { return { w: stage.clientWidth, h: stage.clientHeight }; }
  // bounding box of the VISIBLE (non-exiting) tree at its target layout
  function contentBBox() {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, any = false;
    nodes.forEach(function (n) {
      if (!n.visible || n.exiting) return;
      any = true;
      if (n.tx - NODE_W / 2 < minX) minX = n.tx - NODE_W / 2;
      if (n.tx + NODE_W / 2 > maxX) maxX = n.tx + NODE_W / 2;
      if (n.ty - SLOT_H / 2 < minY) minY = n.ty - SLOT_H / 2;
      if (n.ty + SLOT_H / 2 > maxY) maxY = n.ty + SLOT_H / 2;
    });
    return any ? { w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 } : null;
  }
  // scale at which the whole tree fits the viewport (with margin)
  function fitScale() {
    var b = contentBBox(); if (!b) return DEFAULT_Z;
    var v = viewport();
    // not laid out yet (0×0 in a background tab) → don't compute a bogus
    // (possibly negative) fit; fall back to default so the floor stays sane.
    if (v.w < 60 || v.h < 60) return DEFAULT_Z;
    var margin = 90;
    var availW = Math.max(40, v.w - margin), availH = Math.max(40, v.h - NAV_H - margin);
    return Math.min(availW / Math.max(1, b.w), availH / Math.max(1, b.h));
  }
  // dynamic floor: never smaller than "fits", but never so small the content
  // vanishes (HARD_MIN), and a tiny tree isn't forced to zoom IN (cap at default)
  function minZoom() { return Math.max(HARD_MIN, Math.min(DEFAULT_Z, fitScale())); }
  function clampZ(s) { return Math.min(MAX_Z, Math.max(minZoom(), s)); }
  function frameCamera(focus) {
    // frame the focus node + its (new) children; pan mostly, zoom only if needed.
    // Both card edges go into the bbox — a single-point bbox would center the
    // camera on the card's EDGE, not the card (the off-center boot bug).
    var xs = [focus.tx - NODE_W / 2, focus.tx + NODE_W / 2];
    var ys = [focus.ty - SLOT_H / 2, focus.ty + SLOT_H / 2];
    var kids = focus.expanded ? focus.children : [];
    kids.forEach(function (c) { xs.push(c.tx + NODE_W / 2 + 40); ys.push(c.ty - SLOT_H, c.ty + SLOT_H); });
    if (focus.parent) xs.unshift(focus.parent.tx - NODE_W / 2 - 40);
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var v = viewport();
    var margin = 60;
    // vertical reserve accounts for the fixed nav (top) + hint/controls
    // (bottom) so a tall expansion — e.g. the root's 8 children — actually
    // fits on screen instead of clipping the last card behind the hint bar.
    var need = Math.min((v.w - margin) / Math.max(1, maxX - minX), (v.h - NAV_H - 90) / Math.max(1, maxY - minY));
    // Zoom to where the focus + its children fit; never zoom IN past current.
    // clampZ then keeps it at/above "whole tree fits" — so the auto-jump lands
    // exactly where it fits, never past it. The spring smooths the move.
    cam.ts = clampZ(Math.min(cam.s, Math.min(DEFAULT_Z, need)));
    cam.tx = v.w / 2 - ((minX + maxX) / 2) * cam.ts;
    // +NAV_H/2 centers content in the space BELOW the fixed nav bar
    cam.ty = (v.h + NAV_H) / 2 - ((minY + maxY) / 2) * cam.ts;
  }

  // drag to pan (pointer events cover mouse + touch), pinch to zoom
  var pointers = new Map(), pinch0 = null, dragging = false, moved = 0;
  stage.addEventListener("pointerdown", function (e) {
    if (e.target.closest && e.target.closest(".tnode")) return; // let cards click
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragging = pointers.size === 1; moved = 0;
    if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      pinch0 = { d: dist(pts[0], pts[1]), s: cam.s, mx: (pts[0].x + pts[1].x) / 2, my: (pts[0].y + pts[1].y) / 2, cx: cam.x, cy: cam.y };
    }
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", function (e) {
    if (!pointers.has(e.pointerId)) return;
    var prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1 && dragging) {
      var dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      moved += Math.abs(dx) + Math.abs(dy);
      cam.x += dx; cam.y += dy; cam.tx = cam.x; cam.ty = cam.y; cam.vx = 0; cam.vy = 0;
      kick();
    } else if (pointers.size === 2 && pinch0) {
      var pts = Array.from(pointers.values());
      var scale = clampZ(pinch0.s * (dist(pts[0], pts[1]) / pinch0.d));
      var mx = (pts[0].x + pts[1].x) / 2, my = (pts[0].y + pts[1].y) / 2;
      // keep the pinch midpoint fixed in world space
      cam.s = cam.ts = scale;
      cam.x = cam.tx = mx - ((pinch0.mx - pinch0.cx) / pinch0.s) * scale;
      cam.y = cam.ty = my - ((pinch0.my - pinch0.cy) / pinch0.s) * scale;
      kick();
    }
  });
  function endPointer(e) { pointers.delete(e.pointerId); if (pointers.size < 2) pinch0 = null; dragging = pointers.size === 1; }
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);
  stage.addEventListener("wheel", function (e) {
    e.preventDefault();
    // Damped: sensitivity halved (0.0015 → 0.0008) AND per-event delta capped
    // at ±60 — trackpads fire |deltaY| > 300, which used to mean a ~1.6×
    // scale change in a single tick. Worst case now: e^0.048 ≈ 1.05×/event.
    var dy = Math.max(-60, Math.min(60, e.deltaY));
    var s2 = clampZ(cam.s * Math.exp(-dy * 0.0008));
    // zoom around the cursor (kept — never jump-to-center)
    cam.x = cam.tx = e.clientX - ((e.clientX - cam.x) / cam.s) * s2;
    cam.y = cam.ty = e.clientY - ((e.clientY - cam.y) / cam.s) * s2;
    cam.s = cam.ts = s2;
    kick();
  }, { passive: false });
  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.hypot(dx, dy) || 1; }

  // ---- render loop ------------------------------------------------------------------
  // rAF is the loop when it's alive — but browsers throttle it to ZERO in
  // background tabs, occluded windows, and battery-saver webviews, which
  // would freeze the first paint forever. So every frame is a race: rAF vs a
  // 50ms setTimeout watchdog. rAF wins at 60fps; the watchdog floors us at
  // ~20fps when rAF is suspended. Springs integrate real dt, so motion speed
  // is identical either way.
  var running = false, lastT = 0;
  function kick() { if (!running) { running = true; lastT = now(); scheduleFrame(); } }
  function scheduleFrame() {
    var done = false, rafId, watchdog;
    rafId = requestAnimationFrame(function (t) {
      if (done) return; done = true; clearTimeout(watchdog); onFrame(t);
    });
    watchdog = setTimeout(function () {
      if (done) return; done = true; cancelAnimationFrame(rafId); onFrame(now());
    }, 50);
  }
  function onFrame(t) {
    if (tick(t)) running = false;
    else scheduleFrame();
  }
  function tick(t) {
    var dt = Math.min(0.032, (t - lastT) / 1000 || 0.016);
    lastT = t;
    var settled = springStep(cam, dt);
    cam.s += (cam.ts - cam.s) * Math.min(1, dt * 12);
    if (Math.abs(cam.ts - cam.s) < 0.001) cam.s = cam.ts; else settled = false;
    world.style.transform = "translate(" + cam.x + "px," + cam.y + "px) scale(" + cam.s + ")";
    linesG.setAttribute("transform", "translate(" + cam.x + "," + cam.y + ") scale(" + cam.s + ")");

    nodes.forEach(function (n) {
      if (!n.el) return;
      // hold the card at its parent until its line has drawn
      var gate = n.lineStart ? Math.min(1, Math.max(0, (t - n.lineStart) / Math.max(1, LINE_MS))) : 1;
      if (!n.exiting) n.lineP = gate; else n.lineP = Math.max(0, n.lineP - dt * 4);
      var holding = !n.exiting && gate < 1;
      if (!springStep(n, holding ? 0.0001 : dt)) settled = false;
      if (holding) { settled = false; n.o = 0; }
      n.el.style.transform =
        "translate(" + (n.x - NODE_W / 2) + "px," + (n.y - cardH(n) / 2) + "px) scale(" + (holding ? 0.6 : n.s) + ")";
      n.el.style.opacity = n.o;
      n.el.style.pointerEvents = n.exiting ? "none" : "";

      if (n.path && n.parent) {
        var px = n.parent.x + NODE_W / 2, py = n.parent.y;
        var cx = n.x - NODE_W / 2, cy2 = n.y;
        var mx = (px + cx) / 2;
        n.path.setAttribute("d", "M" + px + " " + py + " C" + mx + " " + py + ", " + mx + " " + cy2 + ", " + cx + " " + cy2);
        var L = n.path.getTotalLength() || 1;
        n.path.style.strokeDasharray = L + " " + L;
        n.path.style.strokeDashoffset = String(L * (1 - n.lineP));
        n.path.style.opacity = n.exiting ? Math.max(0, n.o + 0.2) : 1;
        if (n.lineP < 1 && !n.exiting) settled = false;
      }
    });
    reap(root);
    return settled;
  }
  function cardH(n) { return n.el ? n.el.offsetHeight || 64 : 64; }

  // ---- boot -------------------------------------------------------------------------
  layout();
  mount(root, null);
  root.lineStart = 0; root.lineP = 1;
  var v = viewport();
  cam.x = cam.tx = v.w / 2 - root.tx;
  cam.y = cam.ty = v.h / 2 - root.ty;
  kick();
  // invite the first click
  setTimeout(function () { if (!root.expanded && !userInteracted) root.el.classList.add("tnode--pulse"); }, 900);
  root.el.addEventListener("click", function () { root.el.classList.remove("tnode--pulse"); }, { once: true });
  window.addEventListener("resize", function () { frameCamera(root); kick(); });

  // ---- auto-reveal ------------------------------------------------------------------
  // The median visitor never clicks, so the whole story can't hinge on a click.
  // After a beat we expand the root ONCE on their behalf — the 8 domains
  // cascade into view unprompted — UNLESS they've already started exploring
  // (don't yank a view they're driving). Reduced-motion → reveal immediately,
  // no timed animation.
  var userInteracted = false;
  ["pointerdown", "wheel", "keydown"].forEach(function (ev) {
    stage.addEventListener(ev, function () { userInteracted = true; }, { once: true, passive: true });
  });
  function autoReveal() {
    if (userInteracted || root.expanded) return;
    root.el.classList.remove("tnode--pulse");
    toggle(root);
  }
  if (REDUCED) autoReveal();
  else setTimeout(autoReveal, 1300);

  // ---- on-screen controls (+ / − / reset) — optional hooks in the HTML ---------------
  // Buttons zoom around the viewport center via SPRING TARGETS (damped, never
  // a snap). Reset returns to the exact boot framing: root centered, scale 1.
  function zoomTo(s2) {
    s2 = clampZ(s2);
    var v = viewport(), cx = v.w / 2, cy = v.h / 2;
    cam.tx = cx - ((cx - cam.x) / cam.s) * s2;
    cam.ty = cy - ((cy - cam.y) / cam.s) * s2;
    cam.ts = s2;
    kick();
  }
  function resetView() {
    // "fit everything": frame the whole visible tree, centered, at the scale
    // where it exactly fits (never zoomed in past default, never below floor).
    var v2 = viewport(), b = contentBBox();
    cam.ts = b
      ? Math.max(HARD_MIN, Math.min(DEFAULT_Z,
          Math.min((v2.w - 90) / Math.max(1, b.w), (v2.h - NAV_H - 90) / Math.max(1, b.h))))
      : DEFAULT_Z;
    var cx = b ? b.cx : root.tx, cy = b ? b.cy : root.ty;
    cam.tx = v2.w / 2 - cx * cam.ts;
    cam.ty = (v2.h + NAV_H) / 2 - cy * cam.ts;
    kick();
  }
  function wire(id, fn) {
    var b = document.getElementById(id);
    if (b) b.addEventListener("click", fn);
  }
  wire("zoomIn", function () { zoomTo(cam.ts * 1.25); });
  wire("zoomOut", function () { zoomTo(cam.ts / 1.25); });
  wire("zoomReset", resetView);

  // ---- sector filter: apply + build the chip bar ------------------------------
  function applyFilter(sector) {
    activeSector = sector || null;
    var chips = document.querySelectorAll(".sector-chip");
    for (var k = 0; k < chips.length; k++) {
      var on = (chips[k].getAttribute("data-sector") || "") === (activeSector || "");
      chips[k].setAttribute("aria-pressed", on ? "true" : "false");
    }
    if (root.expanded) {
      var wanted = {};
      visibleChildren(root).forEach(function (c) { wanted[c.id] = true; });
      var t0 = now(), idx = 0;
      root.children.forEach(function (c) {
        if (wanted[c.id]) {
          if (!c.el) { mount(c, root); c.lineP = 0; c.lineStart = t0 + idx++ * STAGGER_MS; }
          else if (c.exiting) { c.exiting = false; c.to = 1; c.ts = 1; } // was leaving — keep it
        } else if (c.el && !c.exiting) {
          unmountSubtree(c);
        }
      });
    }
    layout();
    resetView();
    kick();
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

  // test hook: lets a verifier PROVE the clamp/filter instead of trusting code
  window.__tree = {
    zoomTo: zoomTo, resetView: resetView, cam: cam, MAX_Z: MAX_Z,
    minZoom: minZoom, fitScale: fitScale, applyFilter: applyFilter,
    sector: function () { return activeSector; },
  };
  // Background-tab guard: a tab opened in the background lays out at 0×0, so
  // the boot centers the camera on garbage. Re-center the moment the stage
  // first gets a real size (and snap — the user never saw the wrong state).
  if (window.ResizeObserver) {
    var sized = stage.clientWidth > 0;
    new ResizeObserver(function () {
      if (!sized && stage.clientWidth > 0) {
        sized = true;
        frameCamera(root);
        cam.x = cam.tx; cam.y = cam.ty; cam.s = cam.ts;
        kick();
      }
    }).observe(stage);
  }
})();
