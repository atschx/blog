(function () {
  "use strict";

  var STORAGE_KEY = "theme";

  function readStored() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function writeStored(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  function systemTheme() {
    try {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    } catch (e) {}
    return "light";
  }

  function normalize(theme) {
    return theme === "dark" ? "dark" : "light";
  }

  function currentTheme() {
    var attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") {
      return attr;
    }
    var stored = readStored();
    if (stored === "dark" || stored === "light") {
      return stored;
    }
    return systemTheme();
  }

  function syncControls(theme) {
    var isDark = theme === "dark";
    var label = isDark ? "切换到浅色主题" : "切换到深色主题";
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", isDark ? "true" : "false");
      buttons[i].setAttribute("aria-label", label);
      buttons[i].setAttribute("title", label);
    }
  }

  function apply(theme, persist) {
    var next = normalize(theme);
    document.documentElement.setAttribute("data-theme", next);
    if (persist) {
      writeStored(next);
    }
    syncControls(next);
  }

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  apply(currentTheme(), false);

  onReady(function () {
    syncControls(currentTheme());
    document.addEventListener("click", function (event) {
      var button = event.target.closest ? event.target.closest("[data-theme-toggle]") : null;
      if (!button) {
        return;
      }
      event.preventDefault();
      apply(currentTheme() === "dark" ? "light" : "dark", true);
    });
  });

  try {
    if (window.matchMedia) {
      var media = window.matchMedia("(prefers-color-scheme: dark)");
      var listener = function () {
        var stored = readStored();
        if (stored !== "light" && stored !== "dark") {
          apply(systemTheme(), false);
        }
      };
      if (media.addEventListener) {
        media.addEventListener("change", listener);
      } else if (media.addListener) {
        media.addListener(listener);
      }
    }
  } catch (e) {}
})();
