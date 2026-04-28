const langButtons = document.querySelectorAll(".lang-btn");
const pageBody = document.body;
const metaDescription = document.querySelector("meta[name='description']");

const state = {
  translations: {},
  pages: {},
  currentLanguage: "en",
  pageId: pageBody?.dataset.parentPageId || "admissions"
};

async function loadPageData() {
  const [enResponse, frResponse, parentsResponse] = await Promise.all([
    fetch("../content/site.en.json"),
    fetch("../content/site.fr.json"),
    fetch("../content/parents-pages.json")
  ]);

  if (!enResponse.ok || !frResponse.ok || !parentsResponse.ok) {
    throw new Error("Failed to load parents page content.");
  }

  const [en, fr, pages] = await Promise.all([
    enResponse.json(),
    frResponse.json(),
    parentsResponse.json()
  ]);

  state.translations = { en, fr };
  state.pages = pages;
}

function dictionary(lang) {
  return state.translations[lang] || state.translations.en || {};
}

function applySharedTranslation(lang) {
  const copy = dictionary(lang);
  document.documentElement.lang = lang;

  if (metaDescription && copy.pageDescription) {
    metaDescription.setAttribute("content", copy.pageDescription);
  }

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (copy[key]) {
      node.textContent = copy[key];
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    const key = node.dataset.i18nAriaLabel;
    if (copy[key]) {
      node.setAttribute("aria-label", copy[key]);
    }
  });

  langButtons.forEach((button) => {
    const active = button.dataset.lang === lang;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderFaq(items, container) {
  container.innerHTML = "";
  items.forEach((item) => {
    const block = document.createElement("article");
    block.className = "faq-item";

    const question = document.createElement("h3");
    question.textContent = item.q;

    const answer = document.createElement("p");
    if (item.aHtml) {
      answer.innerHTML = item.aHtml;
    } else {
      answer.textContent = item.a;
    }

    block.appendChild(question);
    block.appendChild(answer);
    container.appendChild(block);
  });
}

function renderLinks(links, container) {
  container.innerHTML = "";
  links.forEach((link) => {
    const a = document.createElement("a");
    a.className = "btn btn-primary";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = link.label[state.currentLanguage] || link.label.en;
    container.appendChild(a);
  });
}

function renderPage(lang) {
  const page = state.pages[state.pageId];
  if (!page) {
    return;
  }

  const title = page.title?.[lang] || page.title?.en || "";
  const intro = page.intro?.[lang] || page.intro?.en || "";
  const paragraphs = page.paragraphs?.[lang] || page.paragraphs?.en || [];
  const faqItems = page.faq?.[lang] || page.faq?.en || [];
  const links = Array.isArray(page.links) ? page.links : [];

  document.title = `${title} | Concordia CPE`;

  const titleNode = document.getElementById("parentPageTitle");
  const introNode = document.getElementById("parentPageIntro");
  const contentNode = document.getElementById("parentPageContent");
  const linksNode = document.getElementById("parentPageLinks");
  const breadcrumbNode = document.getElementById("parentBreadcrumbName");

  if (titleNode) {
    titleNode.textContent = title;
  }
  if (introNode) {
    introNode.textContent = intro;
  }
  if (breadcrumbNode) {
    breadcrumbNode.textContent = title;
  }

  if (contentNode) {
    contentNode.innerHTML = "";
    if (faqItems.length > 0) {
      renderFaq(faqItems, contentNode);
    } else {
      paragraphs.forEach((text) => {
        const p = document.createElement("p");
        p.textContent = text;
        contentNode.appendChild(p);
      });
    }
  }

  if (linksNode) {
    renderLinks(links, linksNode);
  }

  const backLink = document.getElementById("backParentsLink");
  if (backLink) {
    backLink.textContent = lang === "fr" ? "Retour a la section Parents" : "Back to Parents section";
  }
}

function setLanguage(lang) {
  state.currentLanguage = lang;
  applySharedTranslation(lang);
  renderPage(lang);
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextLang = button.dataset.lang;
    if (nextLang === state.currentLanguage) {
      return;
    }
    localStorage.setItem("cpe-language", nextLang);
    setLanguage(nextLang);
  });
});

async function init() {
  try {
    await loadPageData();
    const preferredLanguage =
      localStorage.getItem("cpe-language") ||
      (navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en");
    setLanguage(preferredLanguage);
  } catch (error) {
    console.error(error);
  }
}

init();
