(function () {
  var root = document.querySelector(".page-article .post-content");
  if (!root) {
    return;
  }

  function wrapImage(img) {
    if (img.closest("figure")) {
      return;
    }
    var alt = (img.getAttribute("alt") || "").trim();
    var figure = document.createElement("figure");
    figure.className = "post-figure";
    var parent = img.parentNode;
    var onlyChild =
      parent &&
      parent.tagName === "P" &&
      parent.childNodes.length === 1;

    parent.insertBefore(figure, img);
    figure.appendChild(img);
    if (alt) {
      var caption = document.createElement("figcaption");
      caption.textContent = alt;
      figure.appendChild(caption);
    }
    if (onlyChild && parent.parentNode) {
      parent.parentNode.insertBefore(figure, parent);
      parent.parentNode.removeChild(parent);
    }
  }

  var images = root.querySelectorAll("img");
  for (var i = 0; i < images.length; i += 1) {
    wrapImage(images[i]);
  }
})();
