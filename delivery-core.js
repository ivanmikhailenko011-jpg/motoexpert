"use strict";

// Это публичный адрес формы, не пароль и не секретный ключ.
(() => {
  const endpoint = "https://formspree.io/f/xrppvgzp";
  function isSupportedLocation(location) {
    return location.protocol === "https:" &&
      location.hostname === "ivanmikhailenko011-jpg.github.io" &&
      location.pathname.startsWith("/motoexpert/");
  }
  globalThis.MotoExpertRequests = Object.freeze({ endpoint, isSupportedLocation });
})();
