const langButtons = document.querySelectorAll(".lang-btn");
const metaDescription = document.querySelector("meta[name='description']");
const pageBody = document.body;

const groupState = {
  translations: {},
  groups: {},
  currentLanguage: "en",
  groupId: pageBody?.dataset.groupId || "ducklings"
};

const groupOrder = [
  "ducklings",
  "busy-bees",
  "ladybugs",
  "teddy-bears",
  "butterflies",
  "penguins"
];

function sectionSlug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function loadGroupPageData() {
  const [enResponse, frResponse, groupsResponse] = await Promise.all([
    fetch("../content/site.en.json"),
    fetch("../content/site.fr.json"),
    fetch("../content/groups.json")
  ]);

  if (!enResponse.ok || !frResponse.ok || !groupsResponse.ok) {
    throw new Error("Failed to load group page content files.");
  }

  const [en, fr, groups] = await Promise.all([
    enResponse.json(),
    frResponse.json(),
    groupsResponse.json()
  ]);

  groupState.translations = { en, fr };
  groupState.groups = groups;
}

function dictionaryForLanguage(lang) {
  return groupState.translations[lang] || groupState.translations.en || {};
}

function applyStaticTranslation(lang) {
  const dictionary = dictionaryForLanguage(lang);

  document.documentElement.lang = lang;
  if (metaDescription && dictionary.pageDescription) {
    metaDescription.setAttribute("content", dictionary.pageDescription);
  }

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (dictionary[key]) {
      node.textContent = dictionary[key];
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
}

function applyGroupContent(lang) {
  const dictionary = dictionaryForLanguage(lang);
  const group = groupState.groups[groupState.groupId];
  if (!group) {
    return;
  }

  const name = group.name?.[lang] || group.name?.en || "";
  const age = group.age?.[lang] || group.age?.en || "";
  const description = group.description?.[lang] || group.description?.en || "";
  const sections = group.sections?.[lang] || group.sections?.en || [];

  document.title = `${name} | Concordia CPE`;

  const titleNode = document.getElementById("groupTitle");
  const ageNode = document.getElementById("groupAge");
  const descriptionNode = document.getElementById("groupDescription");
  const imageNode = document.getElementById("groupImage");
  const breadcrumbNode = document.getElementById("groupBreadcrumbName");
  const sectionsNode = document.getElementById("groupSections");
  const sectionNavNode = document.getElementById("groupSectionNav");
  const prevGroupLink = document.getElementById("prevGroupLink");
  const nextGroupLink = document.getElementById("nextGroupLink");
  const onThisPageTitle = document.getElementById("onThisPageTitle");
  const groupNavTitle = document.getElementById("groupNavTitle");

  if (titleNode) {
    titleNode.textContent = name;
  }
  if (ageNode) {
    ageNode.textContent = age;
  }
  if (descriptionNode) {
    descriptionNode.textContent = description;
  }
  if (imageNode) {
    imageNode.src = group.image;
    imageNode.alt = `${name} group`;
  }
  if (breadcrumbNode) {
    breadcrumbNode.textContent = name;
  }

  if (sectionsNode) {
    sectionsNode.innerHTML = "";
    if (sectionNavNode) {
      sectionNavNode.innerHTML = "";
    }

    sections.forEach((section, index) => {
      const sectionElement = document.createElement("section");
      sectionElement.className = "group-section-block";
      const anchorId = `section-${sectionSlug(section.title) || index + 1}`;
      sectionElement.id = anchorId;

      if (section.title) {
        const heading = document.createElement("h2");
        heading.textContent = section.title;
        sectionElement.appendChild(heading);

        if (sectionNavNode) {
          const navLink = document.createElement("a");
          navLink.href = `#${anchorId}`;
          navLink.textContent = section.title;
          sectionNavNode.appendChild(navLink);
        }
      }

      if (section.text) {
        const paragraph = document.createElement("p");
        paragraph.textContent = section.text;
        sectionElement.appendChild(paragraph);
      }

      if (Array.isArray(section.bullets) && section.bullets.length > 0) {
        const list = document.createElement("ul");
        section.bullets.forEach((item) => {
          const listItem = document.createElement("li");
          listItem.textContent = item;
          list.appendChild(listItem);
        });
        sectionElement.appendChild(list);
      }

      sectionsNode.appendChild(sectionElement);
    });
  }

  const ageLabel = document.getElementById("groupAgeLabel");
  if (ageLabel) {
    ageLabel.textContent = lang === "fr" ? "Tranche d'age" : "Age range";
  }

  const homeLink = document.getElementById("backHomeLink");
  if (homeLink) {
    homeLink.textContent = lang === "fr" ? "Retour a l'accueil" : "Back to Home";
  }

  if (onThisPageTitle) {
    onThisPageTitle.textContent = lang === "fr" ? "Sur cette page" : "On this page";
  }

  if (groupNavTitle) {
    groupNavTitle.textContent = lang === "fr" ? "Navigation des groupes" : "Group navigation";
  }

  const currentIndex = groupOrder.indexOf(groupState.groupId);
  const prevId = currentIndex > 0 ? groupOrder[currentIndex - 1] : null;
  const nextId = currentIndex >= 0 && currentIndex < groupOrder.length - 1 ? groupOrder[currentIndex + 1] : null;

  if (prevGroupLink) {
    if (prevId && groupState.groups[prevId]) {
      const prevName = groupState.groups[prevId].name?.[lang] || groupState.groups[prevId].name?.en || "";
      prevGroupLink.href = `${prevId}.html`;
      prevGroupLink.textContent = lang === "fr" ? `← ${prevName}` : `← ${prevName}`;
      prevGroupLink.style.display = "inline";
    } else {
      prevGroupLink.style.display = "none";
    }
  }

  if (nextGroupLink) {
    if (nextId && groupState.groups[nextId]) {
      const nextName = groupState.groups[nextId].name?.[lang] || groupState.groups[nextId].name?.en || "";
      nextGroupLink.href = `${nextId}.html`;
      nextGroupLink.textContent = lang === "fr" ? `${nextName} →` : `${nextName} →`;
      nextGroupLink.style.display = "inline";
    } else {
      nextGroupLink.style.display = "none";
    }
  }
}

function setLanguage(lang) {
  groupState.currentLanguage = lang;
  applyStaticTranslation(lang);
  applyGroupContent(lang);
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedLanguage = button.dataset.lang;
    if (selectedLanguage === groupState.currentLanguage) {
      return;
    }

    localStorage.setItem("cpe-language", selectedLanguage);
    setLanguage(selectedLanguage);
  });
});

async function initializeGroupPage() {
  try {
    await loadGroupPageData();
    const preferredLanguage =
      localStorage.getItem("cpe-language") ||
      (navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en");
    setLanguage(preferredLanguage);
  } catch (error) {
    console.error(error);
  }
}

initializeGroupPage();
