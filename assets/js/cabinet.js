/* Cabinet — drawer behavior for classic.html.
   The drawers are STATIC markup (aria-expanded lives in the HTML, content
   stays in the DOM for SEO/screen readers); this file only toggles state.
   Buttons are natively Enter/Space operable — no key handling needed.

   Hash rule: the tree's leaves deep-link to classic.html#credential /
   #skills / #security. A closed drawer would swallow those links, so any
   hash navigation force-opens its target drawer before scrolling. */
(function () {
  "use strict";

  function setOpen(section, open) {
    var btn = section.querySelector(".drawer__toggle");
    if (!btn) return;
    section.classList.toggle("drawer--open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  document.querySelectorAll(".drawer").forEach(function (section) {
    var btn = section.querySelector(".drawer__toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      setOpen(section, btn.getAttribute("aria-expanded") !== "true");
    });
  });

  function openFromHash() {
    var id = location.hash.slice(1);
    if (!id) return;
    var section = document.getElementById(id);
    if (section && section.classList.contains("drawer")) {
      setOpen(section, true);
      // re-scroll after the drawer has its height (instant under reduced motion)
      setTimeout(function () {
        section.scrollIntoView({ block: "start" });
      }, 60);
    }
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();
