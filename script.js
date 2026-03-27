const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");
const mainContent = document.getElementById("main");
const langButtons = document.querySelectorAll(".lang-btn");
const filterButtons = document.querySelectorAll(".filter-btn");
const galleryGrid = document.getElementById("galleryGrid");
const galleryLightbox = document.getElementById("galleryLightbox");
const galleryLightboxImage = document.getElementById("galleryLightboxImage");
const galleryLightboxCaption = document.getElementById("galleryLightboxCaption");
const galleryLightboxClose = document.getElementById("galleryLightboxClose");
const metaDescription = document.querySelector("meta[name='description']");

const contentState = {
  translations: {},
  galleryItems: [],
  currentLanguage: "en",
  activeFilter: "all"
};

async function loadContentData() {
  const [enResponse, frResponse, galleryResponse] = await Promise.all([
    fetch("content/site.en.json"),
    fetch("content/site.fr.json"),
    fetch("content/gallery.json")
  ]);

  if (!enResponse.ok || !frResponse.ok || !galleryResponse.ok) {
    throw new Error("Failed to load content data files.");
  }

  const [en, fr, gallery] = await Promise.all([
    enResponse.json(),
    frResponse.json(),
    galleryResponse.json()
  ]);

  contentState.translations = { en, fr };
  contentState.galleryItems = Array.isArray(gallery.items) ? gallery.items : [];
}

function dictionaryForLanguage(lang) {
  return contentState.translations[lang] || contentState.translations.en || {};
}

function openGalleryLightbox(src, altText, captionText) {
  if (!galleryLightbox || !galleryLightboxImage || !galleryLightboxCaption) {
    return false;
  }

  galleryLightboxImage.src = src;
  galleryLightboxImage.alt = altText;
  galleryLightboxCaption.textContent = captionText || "";
  galleryLightbox.classList.add("is-open");
  galleryLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  return true;
}

function closeGalleryLightbox() {
  if (!galleryLightbox || !galleryLightboxImage || !galleryLightboxCaption) {
    return;
  }

  galleryLightbox.classList.remove("is-open");
  galleryLightbox.setAttribute("aria-hidden", "true");
  galleryLightboxImage.src = "";
  galleryLightboxImage.alt = "";
  galleryLightboxCaption.textContent = "";
  document.body.classList.remove("lightbox-open");
}

function renderGallery() {
  if (!galleryGrid) {
    return;
  }

  const lang = contentState.currentLanguage;
  const activeFilter = contentState.activeFilter;
  const itemsToRender = contentState.galleryItems.filter((item) => {
    return activeFilter === "all" || item.category === activeFilter;
  });

  galleryGrid.innerHTML = "";
  const fragment = document.createDocumentFragment();

  itemsToRender.forEach((item) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-item";
    figure.dataset.gallery = item.category;

    const imageLink = document.createElement("a");
    imageLink.className = "gallery-open";
    imageLink.href = item.src;
    imageLink.target = "_self";

    const image = document.createElement("img");
    image.src = item.src;
    image.loading = "lazy";
    image.alt = item.alt?.[lang] || item.alt?.en || "Gallery image";

    const caption = document.createElement("figcaption");
    caption.textContent = item.caption?.[lang] || item.caption?.en || "";

    imageLink.appendChild(image);

    imageLink.addEventListener("click", (event) => {
      const isLightboxOpen = openGalleryLightbox(item.src, image.alt, caption.textContent);
      if (isLightboxOpen) {
        event.preventDefault();
      }
    });

    figure.appendChild(imageLink);
    figure.appendChild(caption);
    fragment.appendChild(figure);
  });

  galleryGrid.appendChild(fragment);
}

function applyLanguage(lang) {
  const dictionary = dictionaryForLanguage(lang);
  contentState.currentLanguage = lang;

  document.documentElement.lang = lang;
  if (dictionary.pageTitle) {
    document.title = dictionary.pageTitle;
  }
  if (metaDescription) {
    metaDescription.setAttribute("content", dictionary.pageDescription);
  }

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (dictionary[key]) {
      node.textContent = dictionary[key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    if (dictionary[key]) {
      node.setAttribute("placeholder", dictionary[key]);
    }
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
    const key = node.dataset.i18nAlt;
    if (dictionary[key]) {
      node.setAttribute("alt", dictionary[key]);
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    const key = node.dataset.i18nAriaLabel;
    if (dictionary[key]) {
      node.setAttribute("aria-label", dictionary[key]);
    }
  });

  langButtons.forEach((button) => {
    const isActive = button.dataset.lang === lang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const submitButton = document.querySelector(".contact-form button[type='submit']");
  if (submitButton) {
    const isSent = submitButton.dataset.sent === "true";
    submitButton.textContent = isSent ? dictionary.sentButton : dictionary.sendButton;
  }

  renderGallery();
}

function setActiveFilter(filterValue) {
  contentState.activeFilter = filterValue;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filterValue;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  renderGallery();
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedLanguage = button.dataset.lang;
    const currentLanguage = document.documentElement.lang || "en";
    if (selectedLanguage === currentLanguage) {
      return;
    }

    localStorage.setItem("cpe-language", selectedLanguage);

    if (mainContent) {
      mainContent.classList.remove("lang-slide");
      void mainContent.offsetWidth;
      mainContent.classList.add("lang-slide");
    }

    applyLanguage(selectedLanguage);
  });
});

mainContent?.addEventListener("animationend", () => {
  mainContent.classList.remove("lang-slide");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;
    setActiveFilter(selectedFilter);
  });
});

galleryLightboxClose?.addEventListener("click", () => {
  closeGalleryLightbox();
});

galleryLightbox?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  if (target.hasAttribute("data-close-lightbox")) {
    closeGalleryLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && galleryLightbox?.classList.contains("is-open")) {
    closeGalleryLightbox();
  }
});

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          instance.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("visible"));
}

document.querySelector(".contact-form")?.addEventListener("submit", (event) => {
  // Demo-only behavior for a static site contact form.
  event.preventDefault();
  const submitButton = event.currentTarget.querySelector("button[type='submit']");
  if (submitButton) {
    const dictionary = dictionaryForLanguage(contentState.currentLanguage);
    submitButton.textContent = dictionary.sentButton;
    submitButton.dataset.sent = "true";
    submitButton.disabled = true;
  }
});

async function initializeSite() {
  try {
    await loadContentData();

    const preferredLanguage =
      localStorage.getItem("cpe-language") ||
      (navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en");

    applyLanguage(preferredLanguage);
    setActiveFilter(contentState.activeFilter);
  } catch (error) {
    console.error(error);
  }
}

initializeSite();
