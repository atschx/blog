(function () {
  "use strict";

  var RESULT_LIMIT = 12;
  var DEBOUNCE_MS = 150;

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase();
  }

  function queryTokens(query) {
    return normalize(query).split(" ").filter(Boolean);
  }

  function itemHaystack(item) {
    var labels = []
      .concat(item.tags || [])
      .concat(item.categories || [])
      .join(" ");
    return normalize([item.title, item.excerpt, labels, item.date].join(" "));
  }

  function matches(item, tokens) {
    var hay = item._hay || (item._hay = itemHaystack(item));
    for (var i = 0; i < tokens.length; i++) {
      if (hay.indexOf(tokens[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  function safeUrl(url) {
    if (typeof url !== "string" || !url) {
      return null;
    }
    if (url.charAt(0) === "/" && url.charAt(1) !== "/") {
      return url;
    }
    try {
      var parsed = new URL(url, window.location.origin);
      if (parsed.origin === window.location.origin && (parsed.protocol === "http:" || parsed.protocol === "https:")) {
        return parsed.pathname + parsed.search + parsed.hash;
      }
    } catch (e) {}
    return null;
  }

  function appendHighlighted(target, text, tokens) {
    var source = String(text || "");
    if (!tokens.length) {
      target.appendChild(document.createTextNode(source));
      return;
    }
    var lower = source.toLocaleLowerCase();
    var index = 0;
    while (index < source.length) {
      var matchAt = -1;
      var matchLen = 0;
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (!token) {
          continue;
        }
        var found = lower.indexOf(token, index);
        if (found !== -1 && (matchAt === -1 || found < matchAt)) {
          matchAt = found;
          matchLen = token.length;
        }
      }
      if (matchAt === -1) {
        target.appendChild(document.createTextNode(source.slice(index)));
        break;
      }
      if (matchAt > index) {
        target.appendChild(document.createTextNode(source.slice(index, matchAt)));
      }
      var mark = document.createElement("mark");
      mark.className = "site-search__highlight";
      mark.appendChild(document.createTextNode(source.slice(matchAt, matchAt + matchLen)));
      target.appendChild(mark);
      index = matchAt + matchLen;
    }
  }

  function debounce(fn, wait) {
    var timer = null;
    return function () {
      var args = arguments;
      var context = this;
      if (timer) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(function () {
        fn.apply(context, args);
      }, wait);
    };
  }

  function getQueryParam() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get("q") || "";
    } catch (e) {
      return "";
    }
  }

  function initSearch(root) {
    var form = root.querySelector(".site-search__form");
    var input = root.querySelector(".site-search__input");
    var clearButton = root.querySelector("[data-search-clear]");
    var status = root.querySelector("[data-search-status]");
    var panel = root.querySelector(".site-search__results");
    var results = root.querySelector(".site-search__list") || panel;
    var indexUrl = root.getAttribute("data-search-index") || "/search.json";
    var records = null;
    var loading = null;
    var activeIndex = -1;
    var visibleItems = [];

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function setExpanded(open) {
      if (input) {
        input.setAttribute("aria-expanded", open ? "true" : "false");
      }
      if (panel) {
        if (open) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "hidden");
        }
      }
    }

    function closeResults() {
      activeIndex = -1;
      visibleItems = [];
      if (results) {
        results.innerHTML = "";
      }
      if (input) {
        input.removeAttribute("aria-activedescendant");
      }
      setExpanded(false);
    }

    function setClearVisibility() {
      if (!clearButton) {
        return;
      }
      if (input && input.value) {
        clearButton.removeAttribute("hidden");
      } else {
        clearButton.setAttribute("hidden", "hidden");
      }
    }

    function loadIndex() {
      if (records) {
        return Promise.resolve(records);
      }
      if (loading) {
        return loading;
      }
      setStatus("正在加载搜索索引…");
      loading = fetch(indexUrl, { credentials: "same-origin" })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("index request failed");
          }
          return response.json();
        })
        .then(function (data) {
          records = Array.isArray(data) ? data : [];
          loading = null;
          return records;
        })
        .catch(function () {
          loading = null;
          records = null;
          setStatus("搜索索引暂时无法加载，请稍后重试。");
          throw new Error("index unavailable");
        });
      return loading;
    }

    function highlightActive() {
      for (var i = 0; i < visibleItems.length; i++) {
        var link = visibleItems[i];
        var selected = i === activeIndex;
        link.setAttribute("aria-selected", selected ? "true" : "false");
        if (selected) {
          input.setAttribute("aria-activedescendant", link.id);
          if (link.scrollIntoView) {
            link.scrollIntoView({ block: "nearest" });
          }
        }
      }
      if (activeIndex < 0 && input) {
        input.removeAttribute("aria-activedescendant");
      }
    }

    function render(query) {
      var tokens = queryTokens(query);
      setClearVisibility();
      if (!tokens.length) {
        setStatus("");
        closeResults();
        return;
      }
      if (!records) {
        setStatus("正在加载搜索索引…");
        return;
      }

      var found = [];
      for (var i = 0; i < records.length && found.length < RESULT_LIMIT; i++) {
        if (matches(records[i], tokens)) {
          found.push(records[i]);
        }
      }

      results.innerHTML = "";
      visibleItems = [];
      activeIndex = -1;

      if (!found.length) {
        setStatus("没有找到与“" + query + "”匹配的文章。");
        setExpanded(true);
        return;
      }

      setStatus("找到 " + found.length + " 篇相关文章");
      for (var j = 0; j < found.length; j++) {
        var item = found[j];
        var href = safeUrl(item.url);
        if (!href) {
          continue;
        }
        var li = document.createElement("li");
        li.className = "site-search__result";
        li.setAttribute("role", "presentation");
        var link = document.createElement("a");
        link.className = "site-search__result-link";
        link.id = "site-search-option-" + j;
        link.setAttribute("role", "option");
        link.setAttribute("aria-selected", "false");
        link.href = href;
        var title = document.createElement("span");
        title.className = "site-search__result-title";
        appendHighlighted(title, item.title, tokens);
        var meta = document.createElement("span");
        meta.className = "site-search__result-meta";
        var metaParts = [];
        if (item.date) {
          metaParts.push(item.date);
        }
        var labels = [].concat(item.categories || [], item.tags || []);
        if (labels.length) {
          metaParts.push(labels.join(" · "));
        }
        appendHighlighted(meta, metaParts.join(" · "), tokens);
        link.appendChild(title);
        link.appendChild(meta);
        li.appendChild(link);
        results.appendChild(li);
        visibleItems.push(link);
      }

      if (!visibleItems.length) {
        setStatus("没有找到与“" + query + "”匹配的文章。");
        setExpanded(true);
        return;
      }
      setExpanded(true);
      activeIndex = 0;
      highlightActive();
    }

    var runSearch = debounce(function () {
      render(input.value);
    }, DEBOUNCE_MS);

    function searchNow() {
      var query = input.value;
      loadIndex()
        .then(function () {
          render(query);
        })
        .catch(function () {});
    }

    input.addEventListener("input", function () {
      if (!input.value) {
        setStatus("");
        closeResults();
        setClearVisibility();
        return;
      }
      searchNow();
    });

    input.addEventListener("focus", function () {
      if (input.value) {
        searchNow();
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (activeIndex >= 0 && visibleItems[activeIndex]) {
        window.location.href = visibleItems[activeIndex].href;
        return;
      }
      searchNow();
    });

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        input.value = "";
        setStatus("");
        closeResults();
        setClearVisibility();
        input.focus();
      });
    }

    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        if (input.value) {
          input.value = "";
          setStatus("");
          closeResults();
          setClearVisibility();
        } else {
          closeResults();
          input.blur();
        }
        event.preventDefault();
        return;
      }
      if (!visibleItems.length) {
        if (event.key === "ArrowDown" && input.value) {
          searchNow();
        }
        return;
      }
      if (event.key === "ArrowDown") {
        activeIndex = (activeIndex + 1) % visibleItems.length;
        highlightActive();
        event.preventDefault();
      } else if (event.key === "ArrowUp") {
        activeIndex = activeIndex <= 0 ? visibleItems.length - 1 : activeIndex - 1;
        highlightActive();
        event.preventDefault();
      } else if (event.key === "Home") {
        activeIndex = 0;
        highlightActive();
        event.preventDefault();
      } else if (event.key === "End") {
        activeIndex = visibleItems.length - 1;
        highlightActive();
        event.preventDefault();
      } else if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        window.location.href = visibleItems[activeIndex].href;
      }
    });

    document.addEventListener("click", function (event) {
      if (!root.contains(event.target)) {
        closeResults();
      }
    });

    var initial = getQueryParam();
    if (initial) {
      input.value = initial;
      setClearVisibility();
      searchNow();
    }
  }

  onReady(function () {
    var roots = document.querySelectorAll("[data-site-search]");
    for (var i = 0; i < roots.length; i++) {
      initSearch(roots[i]);
    }
  });
})();
