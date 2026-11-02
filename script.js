/* =========================================================================
   script.js — language toggle, menu, quote reveal, star drift, scroll reveals.
   ========================================================================= */

(function () {
  "use strict";

  var STORAGE_KEY = "irvan-lang";
  var DEFAULT_LANG = "en";
  var strings = window.SITE_STRINGS || { en: {}, id: {} };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var textNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
  var metaNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n-meta]"));
  var ariaNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n-aria]"));
  var optionNodes = Array.prototype.slice.call(document.querySelectorAll("[data-lang-option]"));
  var toggle = document.querySelector("[data-lang-toggle]");

  var originals = {};
  textNodes.forEach(function (node) {
    originals[node.getAttribute("data-i18n")] = node.textContent;
  });

  function readStored() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      return saved === "en" || saved === "id" ? saved : DEFAULT_LANG;
    } catch (error) {
      return DEFAULT_LANG;
    }
  }

  function store(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      /* Storage can be refused on file:// origins. The toggle still works. */
    }
  }

  function lookup(lang, key) {
    var table = strings[lang] || {};
    return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : null;
  }

  function applyLanguage(lang) {
    document.documentElement.lang = lang;

    textNodes.forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      var value = lookup(lang, key);
      node.textContent = value === null ? originals[key] || "" : value;
    });

    metaNodes.forEach(function (node) {
      var value = lookup(lang, node.getAttribute("data-i18n-meta"));
      if (value !== null) node.setAttribute("content", value);
    });

    ariaNodes.forEach(function (node) {
      var value = lookup(lang, node.getAttribute("data-i18n-aria"));
      if (value !== null) node.setAttribute("aria-label", value);
    });

    optionNodes.forEach(function (node) {
      node.classList.toggle("is-active", node.getAttribute("data-lang-option") === lang);
    });

    if (toggle) {
      var actionKey = lang === "en" ? "lang.switchToId" : "lang.switchToEn";
      var label = lookup(lang, actionKey);
      if (label) toggle.setAttribute("aria-label", label);
    }

    rebuildQuote();
  }

  function currentLanguage() {
    return document.documentElement.lang === "id" ? "id" : "en";
  }

  var switching = false;

  function switchLanguage(next) {
    if (!toggle) {
      applyLanguage(next);
      store(next);
      return;
    }
    if (switching) return;
    switching = true;
    toggle.classList.add("is-switching");
    window.setTimeout(function () {
      applyLanguage(next);
      store(next);
      toggle.classList.remove("is-switching");
      switching = false;
    }, 100);
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      switchLanguage(currentLanguage() === "en" ? "id" : "en");
    });
  }

  window.addEventListener("storage", function (event) {
    if (event.key !== STORAGE_KEY) return;
    if (event.newValue !== "en" && event.newValue !== "id") return;
    applyLanguage(event.newValue);
  });

  /* ------------------------------------------------------------- menu */
  var menu = document.getElementById("menu");
  var dots = document.querySelector(".nav-dots");
  var closeBtn = document.querySelector(".menu-close");

  function openMenu() {
    if (!menu) return;
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    if (dots) dots.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    if (dots) {
      dots.setAttribute("aria-expanded", "false");
      dots.focus();
    }
    document.body.style.overflow = "";
  }

  if (dots) {
    dots.addEventListener("click", function () {
      if (menu.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  if (menu) {
    menu.addEventListener("click", function (event) {
      if (event.target === menu) closeMenu();
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  /* -------------------------------------------------- certificate lightbox */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector(".lightbox-img") : null;
  var lightboxCaption = lightbox ? lightbox.querySelector(".lightbox-caption") : null;
  var lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  var lastCert = null;

  function openLightbox(button) {
    if (!lightbox || !lightboxImg) return;
    var img = button.querySelector("img");
    var name = button.querySelector(".cert-name");
    lightboxImg.src = img ? img.src : "";
    lightboxImg.alt = img ? img.alt : "";
    if (lightboxCaption) lightboxCaption.textContent = name ? name.textContent : "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lastCert = button;
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastCert) lastCert.focus();
  }

  document.querySelectorAll(".cert").forEach(function (button) {
    button.addEventListener("click", function () {
      openLightbox(button);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (lightbox && lightbox.classList.contains("is-open")) {
      closeLightbox();
      return;
    }
    if (menu && menu.classList.contains("is-open")) closeMenu();
  });

  /* --------------------------------------------------- quote word reveal */
  var quote = document.querySelector(".quote");
  var quoteText = document.querySelector("[data-quote]");
  var words = [];

  function rebuildQuote() {
    if (!quoteText) return;
    var parts = quoteText.textContent.trim().split(/\s+/);
    quoteText.textContent = "";
    words = [];
    parts.forEach(function (part, index) {
      var span = document.createElement("span");
      span.className = "word";
      span.textContent = part;
      quoteText.appendChild(span);
      if (index < parts.length - 1) quoteText.appendChild(document.createTextNode(" "));
      words.push(span);
    });
    updateQuote();
  }

  function updateQuote() {
    if (!quote || words.length === 0) return;
    var rect = quote.getBoundingClientRect();
    var total = quote.offsetHeight - window.innerHeight;
    var scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    var progress = total > 0 ? scrolled / total : 1;
    var n = words.length;

    for (var i = 0; i < n; i += 1) {
      var t = (progress * (n + 8) - i) / 5;
      t = Math.min(Math.max(t, 0), 1);
      words[i].style.opacity = String((0.18 + t * 0.82).toFixed(3));
    }
  }

  /* ------------------------------------------------------- star drift */
  var stars = Array.prototype.slice.call(document.querySelectorAll(".star"));

  function updateStars() {
    if (stars.length === 0) return;
    var y = Math.min(window.scrollY, 900);
    stars.forEach(function (star, index) {
      var shift = index === 0 ? y * 0.12 : y * -0.08;
      star.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0)";
    });
  }

  /* ------------------------------------------------- portrait morph */
  var avatar = document.querySelector(".avatar");
  var avatarGray = document.querySelector(".avatar-gray");

  function updateAvatar() {
    if (!avatar) return;
    if (window.innerWidth <= 900) {
      avatar.style.transform = "";
      if (avatarGray) avatarGray.style.opacity = "";
      return;
    }
    var p = Math.min(Math.max((window.scrollY - 80) / 640, 0), 1);
    var eased = p * p * (3 - 2 * p);
    var dy = 390 * eased;
    var scale = 1 + 0.29 * eased;
    avatar.style.transform =
      "translate(-50%, " + dy.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
    if (avatarGray) avatarGray.style.opacity = String((1 - eased).toFixed(3));
  }

  /* ---------------------------------------------------- scroll reveals */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (element) {
      element.classList.add("is-in");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach(function (element) {
      observer.observe(element);
    });
  }

  /* --------------------------------------------------------- scroll loop */
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      if (!reduce) {
        updateStars();
        updateAvatar();
        updateQuote();
      }
      ticking = false;
    });
  }

  if (!reduce) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateStars();
    updateAvatar();
    updateQuote();
  }

  applyLanguage(readStored());
})();
