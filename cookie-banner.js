(function () {
  if (localStorage.getItem("cpe-cookie-consent")) return;

  const lang =
    localStorage.getItem("cpe-language") ||
    (navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en");

  const copy = {
    en: {
      message:
        "This site uses essential local storage to remember your language preference. Statistical cookies may be used to improve your experience.",
      accept: "Accept",
      decline: "Decline",
      policy: "Privacy Policy",
    },
    fr: {
      message:
        "Ce site utilise le stockage local essentiel pour mémoriser votre préférence de langue. Des témoins statistiques peuvent être utilisés pour améliorer votre expérience.",
      accept: "Accepter",
      decline: "Refuser",
      policy: "Politique de confidentialité",
    },
  };

  const t = copy[lang] || copy.en;

  const isSubpage =
    window.location.pathname.includes("/groups/") ||
    window.location.pathname.includes("/parents/");
  const pdfUrl =
    (isSubpage ? "../" : "") + "documents/privacy-policy.pdf";

  const banner = document.createElement("div");
  banner.id = "cookie-banner";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", lang === "fr" ? "Gestion des témoins" : "Cookie consent");
  banner.innerHTML =
    '<p class="cookie-banner-text">' +
    t.message +
    ' <a href="' + pdfUrl + '" target="_blank" rel="noreferrer">' + t.policy + "</a></p>" +
    '<div class="cookie-banner-actions">' +
    '<button id="cookie-accept" class="cookie-btn cookie-btn-accept">' + t.accept + "</button>" +
    '<button id="cookie-decline" class="cookie-btn cookie-btn-decline">' + t.decline + "</button>" +
    "</div>";

  document.body.appendChild(banner);

  function dismiss(choice) {
    localStorage.setItem("cpe-cookie-consent", choice);
    banner.remove();
  }

  document
    .getElementById("cookie-accept")
    .addEventListener("click", function () { dismiss("accepted"); });
  document
    .getElementById("cookie-decline")
    .addEventListener("click", function () { dismiss("declined"); });
})();
