// Set the current year, month, and day in the footer
document.addEventListener("DOMContentLoaded", function () {
  var yearSpan = document.getElementById("current-year");
  var dateSpan = document.getElementById("current-date");

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  if (dateSpan) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    dateSpan.textContent = new Date().toLocaleDateString(undefined, options);
  }
});
