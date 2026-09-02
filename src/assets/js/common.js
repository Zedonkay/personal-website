$(document).ready(function () {
  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
      offset: 100,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let jupyterTheme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (jupyterTheme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });
});

(function () {
  const footer = document.querySelector("footer[role='contentinfo']");
  if (!footer || !footer.classList.contains("is-deferred")) {
    return;
  }

  const reveal = () => {
    footer.classList.remove("is-deferred");
    window.removeEventListener("scroll", onScroll);
    window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  };

  const onScroll = () => {
    if (window.scrollY < 8) {
      return;
    }
    const bottom = window.innerHeight + window.scrollY;
    if (bottom >= document.documentElement.scrollHeight - 24) {
      reveal();
    }
  };

  const fits = () => document.documentElement.scrollHeight <= window.innerHeight + 4;

  const maybeReveal = () => {
    if (footer.classList.contains("is-deferred") && fits()) {
      footer.classList.remove("is-deferred");
      if (!fits()) {
        footer.classList.add("is-deferred");
        return;
      }
      reveal();
      return;
    }
    onScroll();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", maybeReveal);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(maybeReveal);
  }
  maybeReveal();
})();
