document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initScrollReveal();
  initProjectFilter();
  initHeatmap();
  initYearDisplay();
});

// ========================================
// NAVIGATION
// ========================================
function initNav() {
  const nav = document.getElementById("nav");
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");
  const navLinks = document.querySelectorAll(".nav__links a");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !expanded);
      links.classList.toggle("nav__links--open");
      toggle.classList.toggle("nav__toggle--active");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("nav__links--open");
        toggle.classList.remove("nav__toggle--active");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (nav) {
    window.addEventListener(
      "scroll",
      () => {
        nav.classList.toggle("nav--scrolled", window.scrollY > 50);
      },
      { passive: true }
    );
  }

  const sections = document.querySelectorAll("section[id]");
  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              link.classList.toggle(
                "nav__link--active",
                link.getAttribute("href") === "#" + entry.target.id
              );
            });
          }
        });
      },
      { rootMargin: "-20% 0px -75% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
  }
}

// ========================================
// SCROLL REVEAL (progressive enhancement)
// ========================================
function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  // Only hide elements if JS is running — content stays visible without JS
  elements.forEach((el) => el.classList.add("reveal--init"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: "50px" }
  );
  elements.forEach((el) => observer.observe(el));
}

// ========================================
// PROJECT FILTERING
// ========================================
function initProjectFilter() {
  const buttons = document.querySelectorAll(".filter-bar .filter-btn");
  const cards = document.querySelectorAll(".project-card");
  if (!buttons.length || !cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      buttons.forEach((b) => b.classList.remove("filter-btn--active"));
      btn.classList.add("filter-btn--active");

      cards.forEach((card) => {
        const match =
          filter === "all" || card.dataset.category.includes(filter);
        card.classList.toggle("project-card--hidden", !match);
      });
    });
  });
}

// ========================================
// GITHUB CONTRIBUTION HEATMAP
// ========================================
function initHeatmap() {
  var grid = document.getElementById("heatmap-grid");
  var monthsEl = document.getElementById("heatmap-months");
  var totalEl = document.getElementById("heatmap-total");
  var yearLabel = document.getElementById("heatmap-year-label");
  var lastYearEl = document.getElementById("heatmap-lastyear");
  if (!grid || !monthsEl) return;

  // Contribution data per year (from GitHub API)
  var YEARS = {
    2021: {total: 2, days: {"2021-07-07":2}},
    2022: {total: 572, days: {"2022-03-06":5,"2022-03-21":4,"2022-03-22":1,"2022-03-24":1,"2022-03-27":1,"2022-03-31":1,"2022-04-03":7,"2022-04-10":1,"2022-04-17":3,"2022-04-18":1,"2022-04-21":6,"2022-04-24":9,"2022-04-30":7,"2022-05-01":1,"2022-05-02":2,"2022-05-04":6,"2022-05-05":10,"2022-05-06":5,"2022-05-07":2,"2022-05-08":29,"2022-05-09":8,"2022-05-10":9,"2022-05-12":4,"2022-05-13":2,"2022-05-14":28,"2022-05-15":39,"2022-05-25":8,"2022-05-31":2,"2022-06-04":1,"2022-06-05":19,"2022-06-06":2,"2022-06-07":7,"2022-06-09":2,"2022-06-11":10,"2022-06-13":25,"2022-06-15":6,"2022-06-19":6,"2022-06-20":6,"2022-06-21":10,"2022-06-23":3,"2022-06-26":5,"2022-06-27":16,"2022-06-28":4,"2022-06-30":6,"2022-07-03":6,"2022-07-05":4,"2022-07-07":1,"2022-07-08":63,"2022-07-09":10,"2022-07-10":18,"2022-07-11":2,"2022-07-14":2,"2022-07-15":11,"2022-07-17":3,"2022-07-18":4,"2022-07-19":5,"2022-07-21":7,"2022-07-23":2,"2022-07-24":3,"2022-07-26":7,"2022-07-29":4,"2022-08-02":1,"2022-08-06":2,"2022-08-07":2,"2022-08-11":4,"2022-08-12":2,"2022-08-13":2,"2022-08-15":2,"2022-08-18":22,"2022-08-19":9,"2022-08-20":4,"2022-08-22":14,"2022-08-23":3,"2022-08-27":8,"2022-08-28":1,"2022-09-18":9,"2022-10-04":1,"2022-12-30":4}},
    2023: {total: 494, days: {"2023-03-08":5,"2023-03-20":5,"2023-03-21":1,"2023-05-13":8,"2023-05-14":2,"2023-05-15":18,"2023-05-16":7,"2023-05-19":4,"2023-05-20":5,"2023-05-22":9,"2023-05-23":14,"2023-05-24":6,"2023-05-28":4,"2023-05-30":13,"2023-05-31":1,"2023-06-02":2,"2023-06-03":4,"2023-06-05":4,"2023-06-06":2,"2023-06-09":1,"2023-06-17":1,"2023-06-18":4,"2023-06-19":28,"2023-06-20":5,"2023-06-21":17,"2023-06-24":3,"2023-06-26":4,"2023-06-27":8,"2023-06-29":1,"2023-06-30":2,"2023-07-05":2,"2023-07-06":2,"2023-07-07":4,"2023-07-08":8,"2023-07-11":3,"2023-07-12":14,"2023-07-13":5,"2023-07-14":4,"2023-07-26":8,"2023-07-29":7,"2023-07-31":9,"2023-08-07":1,"2023-08-08":2,"2023-08-12":1,"2023-08-13":6,"2023-08-20":2,"2023-08-21":2,"2023-08-29":12,"2023-08-31":9,"2023-09-06":1,"2023-09-07":3,"2023-09-08":4,"2023-09-10":2,"2023-09-11":15,"2023-09-18":3,"2023-09-19":2,"2023-09-26":1,"2023-09-27":1,"2023-09-28":2,"2023-10-02":26,"2023-10-12":3,"2023-10-24":3,"2023-10-25":30,"2023-10-26":1,"2023-11-01":2,"2023-11-02":4,"2023-11-03":10,"2023-11-06":10,"2023-11-07":2,"2023-11-08":12,"2023-11-10":7,"2023-11-13":3,"2023-11-15":25,"2023-11-16":11,"2023-11-17":3,"2023-11-20":7,"2023-11-21":3,"2023-11-22":1,"2023-11-24":1,"2023-11-25":1,"2023-11-27":2,"2023-12-01":2,"2023-12-04":1,"2023-12-06":1}},
    2024: {total: 615, days: {"2024-01-03":1,"2024-01-08":1,"2024-01-09":9,"2024-01-22":2,"2024-01-24":4,"2024-01-27":1,"2024-01-29":4,"2024-01-30":5,"2024-01-31":4,"2024-02-02":8,"2024-02-08":11,"2024-02-09":7,"2024-02-11":3,"2024-02-12":4,"2024-02-13":18,"2024-02-15":5,"2024-02-16":3,"2024-02-26":6,"2024-02-27":7,"2024-02-28":15,"2024-02-29":6,"2024-03-11":5,"2024-03-12":1,"2024-04-04":8,"2024-04-10":2,"2024-04-11":4,"2024-04-24":1,"2024-04-30":1,"2024-05-01":10,"2024-05-02":10,"2024-05-03":10,"2024-05-05":30,"2024-05-06":41,"2024-05-07":18,"2024-05-14":1,"2024-05-15":4,"2024-05-16":3,"2024-05-23":4,"2024-05-25":1,"2024-05-27":4,"2024-05-28":7,"2024-06-01":19,"2024-06-08":1,"2024-06-09":2,"2024-06-10":1,"2024-06-26":6,"2024-06-28":4,"2024-07-01":4,"2024-07-02":1,"2024-07-07":14,"2024-07-11":2,"2024-07-14":3,"2024-07-15":27,"2024-07-16":5,"2024-07-18":1,"2024-07-20":1,"2024-07-22":1,"2024-07-23":2,"2024-07-24":7,"2024-07-27":1,"2024-07-28":1,"2024-08-03":6,"2024-08-09":1,"2024-08-11":2,"2024-08-12":2,"2024-08-13":9,"2024-09-10":1,"2024-09-16":7,"2024-09-18":25,"2024-09-20":5,"2024-09-22":3,"2024-09-25":1,"2024-09-30":1,"2024-10-06":6,"2024-10-12":10,"2024-10-13":4,"2024-10-15":1,"2024-10-16":9,"2024-10-17":6,"2024-10-19":2,"2024-10-22":18,"2024-10-23":4,"2024-10-25":9,"2024-10-26":6,"2024-10-27":4,"2024-10-28":2,"2024-10-29":1,"2024-11-02":3,"2024-11-04":23,"2024-11-05":10,"2024-11-06":7,"2024-11-09":8,"2024-11-17":2,"2024-11-23":4,"2024-11-27":1,"2024-12-09":1,"2024-12-10":8,"2024-12-11":1,"2024-12-15":2,"2024-12-16":4,"2024-12-18":2,"2024-12-30":2}},
    2025: {total: 515, days: {"2025-01-02":15,"2025-01-13":5,"2025-01-28":2,"2025-01-29":1,"2025-01-31":1,"2025-02-06":2,"2025-02-09":1,"2025-03-09":1,"2025-03-17":1,"2025-03-26":10,"2025-03-27":14,"2025-03-30":6,"2025-03-31":10,"2025-04-02":9,"2025-04-03":2,"2025-04-04":2,"2025-04-11":1,"2025-04-12":6,"2025-04-13":1,"2025-04-17":9,"2025-04-22":7,"2025-04-23":18,"2025-04-24":2,"2025-04-26":4,"2025-04-27":7,"2025-04-29":2,"2025-04-30":1,"2025-05-05":5,"2025-05-13":1,"2025-05-16":1,"2025-05-18":1,"2025-06-09":1,"2025-06-13":14,"2025-06-14":2,"2025-06-16":7,"2025-06-17":7,"2025-06-18":5,"2025-06-19":7,"2025-06-20":3,"2025-06-21":6,"2025-06-23":1,"2025-06-24":8,"2025-06-26":2,"2025-06-27":12,"2025-07-04":4,"2025-07-05":2,"2025-07-06":8,"2025-07-07":16,"2025-07-08":9,"2025-07-09":1,"2025-07-10":6,"2025-07-11":5,"2025-07-14":13,"2025-07-15":25,"2025-07-16":31,"2025-07-17":6,"2025-07-18":17,"2025-07-20":35,"2025-07-21":28,"2025-07-22":2,"2025-07-25":8,"2025-08-05":28,"2025-08-09":6,"2025-08-19":1,"2025-08-25":4,"2025-09-29":3,"2025-10-06":6,"2025-10-07":3,"2025-10-09":2,"2025-10-16":2,"2025-10-17":3,"2025-10-30":1,"2025-10-31":3,"2025-11-04":1,"2025-11-18":2,"2025-11-19":1,"2025-11-24":2,"2025-11-26":1,"2025-12-04":4,"2025-12-10":1,"2025-12-17":1,"2025-12-30":1}},
    2026: {total: 1240, days: {"2026-01-03":2,"2026-01-10":6,"2026-01-11":11,"2026-01-12":6,"2026-01-13":2,"2026-01-14":2,"2026-01-15":2,"2026-01-16":50,"2026-01-17":26,"2026-01-18":54,"2026-01-19":134,"2026-01-20":149,"2026-01-21":33,"2026-01-22":16,"2026-01-23":17,"2026-01-24":39,"2026-01-25":24,"2026-01-26":37,"2026-01-27":43,"2026-01-28":23,"2026-01-29":41,"2026-01-31":21,"2026-02-01":5,"2026-02-02":19,"2026-02-03":23,"2026-02-04":21,"2026-02-05":17,"2026-02-06":57,"2026-02-07":27,"2026-02-08":12,"2026-02-09":15,"2026-02-10":35,"2026-02-11":16,"2026-02-12":25,"2026-02-13":45,"2026-02-14":41,"2026-02-15":21,"2026-02-16":16,"2026-02-17":49,"2026-02-18":25,"2026-02-19":31,"2026-02-20":2}}
  };

  // Calculate rolling last-year total
  var now = new Date();
  var oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  var lastYearTotal = 0;
  Object.keys(YEARS).forEach(function (y) {
    var yearData = YEARS[y];
    Object.keys(yearData.days).forEach(function (date) {
      var d = new Date(date + "T00:00:00");
      if (d >= oneYearAgo && d <= now) {
        lastYearTotal += yearData.days[date];
      }
    });
  });

  // Fixed thresholds: 10 levels in increments of 10
  function getLevel(count) {
    if (count === 0) return 0;
    if (count < 10) return 1;
    if (count < 20) return 2;
    if (count < 30) return 3;
    if (count < 40) return 4;
    if (count < 50) return 5;
    if (count < 60) return 6;
    if (count < 70) return 7;
    if (count < 80) return 8;
    if (count < 100) return 9;
    return 10;
  }

  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function renderYear(year) {
    grid.innerHTML = "";
    monthsEl.innerHTML = "";

    var data = YEARS[year];
    if (!data) return;

    // Update header
    if (totalEl) totalEl.textContent = data.total.toLocaleString();
    if (yearLabel) yearLabel.textContent = "contributions in " + year;
    if (lastYearEl) {
      lastYearEl.textContent = lastYearTotal.toLocaleString() + " contributions in the last year";
    }

    // Full calendar year (Jan 1 - Dec 31), like GitHub
    var startDate = new Date(year + "-01-01T00:00:00");
    var endDate = new Date(year + "-12-31T00:00:00");
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    // Adjust start to Sunday
    var start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay());

    // Build weeks through Dec 31
    var weeks = [];
    var current = new Date(start);
    while (current <= endDate) {
      var week = [];
      for (var d = 0; d < 7; d++) {
        var dateStr = current.toISOString().slice(0, 10);
        var count = data.days[dateStr] || 0;
        var isFuture = current > today;
        var inYear = current >= startDate && current <= endDate;
        week.push({ date: dateStr, count: count, inYear: inYear, isFuture: isFuture });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    // Month labels — absolutely positioned to match grid columns
    var isMobile = window.innerWidth <= 768;
    var CELL_SIZE = isMobile ? 10 : 12;
    var CELL_GAP = isMobile ? 2 : 3;
    var DAYS_WIDTH = isMobile ? 26 : 30;
    var BODY_GAP = isMobile ? 2 : 4;
    var gridOffset = DAYS_WIDTH + BODY_GAP;

    // Place each month label above the week column containing the 1st of that month
    var msPerDay = 86400000;
    for (var m = 0; m < 12; m++) {
      var firstOfMonth = new Date(year, m, 1);
      var daysSinceStart = Math.round((firstOfMonth - start) / msPerDay);
      var wi = Math.floor(daysSinceStart / 7);
      if (wi >= 0 && wi < weeks.length) {
        var span = document.createElement("span");
        span.textContent = monthNames[m];
        span.style.left = (gridOffset + wi * (CELL_SIZE + CELL_GAP)) + "px";
        monthsEl.appendChild(span);
      }
    }

    // Grid cells
    weeks.forEach(function (week) {
      var weekEl = document.createElement("div");
      weekEl.className = "heatmap-week";
      week.forEach(function (day) {
        var cell = document.createElement("span");
        cell.className = "heatmap-cell";
        if (!day.inYear) {
          cell.setAttribute("data-level", "0");
          cell.style.opacity = "0.15";
        } else if (day.isFuture) {
          cell.setAttribute("data-level", "0");
          cell.setAttribute("data-date", day.date);
          cell.setAttribute("data-count", "0");
        } else {
          var level = getLevel(day.count);
          cell.setAttribute("data-level", level);
          cell.setAttribute("data-date", day.date);
          cell.setAttribute("data-count", day.count);
        }
        weekEl.appendChild(cell);
      });
      grid.appendChild(weekEl);
    });
  }

  // Year selector buttons
  var yearBtns = document.querySelectorAll("#heatmap-years .filter-btn");
  yearBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      yearBtns.forEach(function (b) { b.classList.remove("filter-btn--active"); });
      btn.classList.add("filter-btn--active");
      renderYear(parseInt(btn.dataset.year));
    });
  });

  // GitHub-style tooltip — appended to body so wrapper overflow can't clip it
  var tooltip = document.createElement("div");
  tooltip.className = "heatmap-tooltip";
  tooltip.id = "heatmap-tooltip";
  document.body.appendChild(tooltip);

  var fullMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  function formatDate(dateStr) {
    var parts = dateStr.split("-");
    var m = parseInt(parts[1]) - 1;
    var d = parseInt(parts[2]);
    return fullMonths[m] + " " + d + ", " + parts[0];
  }

  grid.addEventListener("mouseover", function (e) {
    var cell = e.target.closest(".heatmap-cell[data-date]");
    if (!cell) { tooltip.classList.remove("visible"); return; }
    var count = cell.getAttribute("data-count") || "0";
    var date = cell.getAttribute("data-date");
    var word = count === "1" ? "contribution" : "contributions";
    tooltip.innerHTML = "<strong>" + count + "</strong> " + word + " on " + formatDate(date);
    var cellRect = cell.getBoundingClientRect();
    var tipW = tooltip.offsetWidth;
    var tipH = tooltip.offsetHeight;
    // Position above the cell, centered horizontally, using viewport coords
    var left = cellRect.left + cellRect.width / 2 - tipW / 2;
    var top = cellRect.top - tipH - 6;
    // Clamp within viewport
    if (left < 4) left = 4;
    if (left + tipW > window.innerWidth - 4) left = window.innerWidth - tipW - 4;
    // If clipped at top, show below the cell instead
    if (top < 4) top = cellRect.bottom + 6;
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
    tooltip.classList.add("visible");
  });

  grid.addEventListener("mouseout", function (e) {
    if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(".heatmap-cell[data-date]")) {
      tooltip.classList.remove("visible");
    }
  });

  grid.addEventListener("click", function (e) {
    var cell = e.target.closest(".heatmap-cell[data-date]");
    if (!cell) return;
    var date = cell.getAttribute("data-date");
    window.open("https://github.com/doble196?tab=overview&from=" + date + "&to=" + date, "_blank");
  });

  // Default: render current year
  renderYear(2026);
}

// ========================================
// UTILITIES
// ========================================
function initYearDisplay() {
  var el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}
