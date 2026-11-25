(function () {
  var yearLinks = document.querySelectorAll(".archive-years a");
  var monthLinks = document.querySelectorAll(".archive-month-index a");
  if (!yearLinks.length) {
    return;
  }

  function currentFromHash() {
    var hash = (window.location.hash || "").replace(/^#/, "");
    var match = hash.match(/^y(\d{4})(?:-(\d{2}))?$/);
    if (!match) {
      return { year: null, month: null };
    }
    return { year: match[1], month: match[2] || null };
  }

  function setCurrent(node, on) {
    if (on) {
      node.setAttribute("aria-current", "location");
    } else {
      node.removeAttribute("aria-current");
    }
  }

  function apply() {
    var current = currentFromHash();
    for (var i = 0; i < yearLinks.length; i += 1) {
      var href = yearLinks[i].getAttribute("href") || "";
      var year = href.replace("#y", "");
      var isMatch = current.year ? year === current.year : yearLinks[i].hasAttribute("data-default");
      setCurrent(yearLinks[i], isMatch);
    }
    for (var j = 0; j < monthLinks.length; j += 1) {
      var monthHref = monthLinks[j].getAttribute("href") || "";
      var want = current.year && current.month ? "#y" + current.year + "-" + current.month : "";
      setCurrent(monthLinks[j], want !== "" && monthHref === want);
    }
  }

  apply();
  window.addEventListener("hashchange", apply);
})();
