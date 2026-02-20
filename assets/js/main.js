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
  var yearsContainer = document.getElementById("heatmap-years");
  if (!grid || !monthsEl) return;

  var GITHUB_USERNAME = "doble196";
  var YEARS = {};
  var lastYearTotal = 0;

  // Fetch contribution data from GitHub API
  function fetchContributions() {
    return fetch("https://github-contributions-api.jogruber.de/v4/" + GITHUB_USERNAME + "?y=all")
      .then(function(response) {
        if (!response.ok) throw new Error("Failed to fetch");
        return response.json();
      })
      .then(function(data) {
        // Transform API data into our YEARS format
        var contributions = data.contributions || [];
        var totals = data.total || {};

        // Group contributions by year
        contributions.forEach(function(contrib) {
          var year = parseInt(contrib.date.split("-")[0]);
          if (!YEARS[year]) {
            YEARS[year] = { total: 0, days: {} };
          }
          if (contrib.count > 0) {
            YEARS[year].days[contrib.date] = contrib.count;
          }
        });

        // Set totals from API
        Object.keys(totals).forEach(function(year) {
          if (YEARS[year]) {
            YEARS[year].total = totals[year];
          }
        });

        // Calculate rolling last-year total
        var now = new Date();
        var oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        lastYearTotal = 0;
        contributions.forEach(function(contrib) {
          var d = new Date(contrib.date + "T00:00:00");
          if (d >= oneYearAgo && d <= now) {
            lastYearTotal += contrib.count;
          }
        });

        return YEARS;
      });
  }

  // Generate year buttons dynamically
  function renderYearButtons(years) {
    if (!yearsContainer) return;
    yearsContainer.innerHTML = "";
    var sortedYears = Object.keys(years).map(Number).sort(function(a, b) { return b - a; });
    sortedYears.forEach(function(year, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn" + (index === 0 ? " filter-btn--active" : "");
      btn.dataset.year = year;
      btn.textContent = year;
      btn.addEventListener("click", function() {
        yearsContainer.querySelectorAll(".filter-btn").forEach(function(b) {
          b.classList.remove("filter-btn--active");
        });
        btn.classList.add("filter-btn--active");
        currentYear = year;
        renderYear(year);
      });
      yearsContainer.appendChild(btn);
    });
  }

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
    // These values must match the CSS exactly
    var isMobile = window.innerWidth <= 768;
    var CELL_SIZE = isMobile ? 10 : 12;
    var CELL_GAP = isMobile ? 2 : 3;
    var DAYS_WIDTH = isMobile ? 28 : 32;
    var BODY_GAP = isMobile ? 4 : 6;
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

  // Track current year for resize handler
  var currentYear = new Date().getFullYear();

  // Re-render on resize to fix month label alignment
  var resizeTimeout;
  window.addEventListener("resize", function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      if (Object.keys(YEARS).length > 0) {
        renderYear(currentYear);
      }
    }, 150);
  }, { passive: true });

  // Show loading state
  if (totalEl) totalEl.textContent = "...";
  if (yearLabel) yearLabel.textContent = "loading contributions";

  // Fetch and render
  fetchContributions()
    .then(function(years) {
      var sortedYears = Object.keys(years).map(Number).sort(function(a, b) { return b - a; });
      currentYear = sortedYears[0] || new Date().getFullYear();
      renderYearButtons(years);
      renderYear(currentYear);
    })
    .catch(function(error) {
      console.error("Failed to fetch GitHub contributions:", error);
      if (totalEl) totalEl.textContent = "Error";
      if (yearLabel) yearLabel.textContent = "loading contributions";
      grid.innerHTML = '<p style="color: var(--text-tertiary); padding: 1rem;">Failed to load contribution data</p>';
    });
}

// ========================================
// UTILITIES
// ========================================
function initYearDisplay() {
  var el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}
