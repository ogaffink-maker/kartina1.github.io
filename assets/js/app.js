(function () {
  const data = window.GALLERY_DATA;

  if (!data) {
    return;
  }

  const page = document.body.dataset.page;
  const supportedLanguages = ["kk", "ru"];
  const translations = {
    kk: {
      pageTitleIndex: "Жанғазы Алымұлы",
      navWorks: "Жұмыстар",
      collection: "Жинақ",
      collectionTitle: "Таңдамалы жұмыстар",
      digitalExposition: "Портфолио",
      viewWork: "Жұмысты көру",
      openPage: "Бетті ашу",
      footerCatalog: "Суретшінің портфолиосы",
      year: "Жылы",
      technique: "Техникасы",
      size: "Өлшемі",
      description: "Сипаттама",
      aboutArtwork: "Картина туралы",
      previous: "Алдыңғы",
      next: "Келесі",
      otherWorks: "Басқа жұмыстар",
      navigation: "Навигация",
      language: "Тіл",
      home: "Басты бет",
      separator: " · "
    },
    ru: {
      pageTitleIndex: "Жанғазы Алымұлы",
      navWorks: "Работы",
      collection: "Коллекция",
      collectionTitle: "Избранные работы",
      digitalExposition: "Портфолио",
      viewWork: "Смотреть работу",
      openPage: "Открыть страницу",
      footerCatalog: "Портфолио художника",
      year: "Год",
      technique: "Техника",
      size: "Размер",
      description: "Описание",
      aboutArtwork: "О картине",
      previous: "Предыдущая",
      next: "Следующая",
      otherWorks: "Другие работы",
      navigation: "Навигация",
      language: "Язык",
      home: "На главную",
      separator: " · "
    }
  };

  let currentLanguage = getInitialLanguage();

  function getInitialLanguage() {
    const params = new URLSearchParams(window.location.search);
    const queryLanguage = params.get("lang");
    const savedLanguage = window.localStorage.getItem("galleryLanguage");

    if (supportedLanguages.includes(queryLanguage)) {
      return queryLanguage;
    }

    if (supportedLanguages.includes(savedLanguage)) {
      return savedLanguage;
    }

    return "kk";
  }

  function tr(key) {
    return translations[currentLanguage][key] || translations.kk[key] || key;
  }

  function localize(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value[currentLanguage] || value.kk || value.ru || "";
    }

    return value;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return entities[character];
    });
  }

  function syncStaticText() {
    document.documentElement.lang = currentLanguage;
    document.querySelectorAll("[data-artist-name]").forEach((node) => {
      node.textContent = data.artist;
    });
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = tr(node.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
      node.setAttribute("aria-label", tr(node.dataset.i18nAria));
    });
    document.querySelectorAll("[data-lang]").forEach((button) => {
      const isActive = button.dataset.lang === currentLanguage;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function updateUrlLanguage() {
    const url = new URL(window.location.href);
    if (currentLanguage === "kk") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", currentLanguage);
    }
    window.history.replaceState({}, "", url.toString());
  }

  function bindLanguageSwitch() {
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextLanguage = button.dataset.lang;
        if (!supportedLanguages.includes(nextLanguage) || nextLanguage === currentLanguage) {
          return;
        }

        currentLanguage = nextLanguage;
        window.localStorage.setItem("galleryLanguage", currentLanguage);
        updateUrlLanguage();
        renderPage();
      });
    });
  }

  function cardMarkup(artwork) {
    const title = localize(artwork.title);
    const technique = localize(artwork.technique);

    return `
      <article class="art-card" style="--accent: ${escapeHtml(artwork.accent)}">
        <a class="art-card__image" href="artwork.html?id=${encodeURIComponent(artwork.id)}" aria-label="${escapeHtml(title)}">
          <img src="${escapeHtml(artwork.image)}" alt="${escapeHtml(title)}">
        </a>
        <div class="art-card__body">
          <p class="meta-line">${escapeHtml(artwork.year)}${escapeHtml(tr("separator"))}${escapeHtml(technique)}</p>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(localize(artwork.summary))}</p>
          <a class="text-link" href="artwork.html?id=${encodeURIComponent(artwork.id)}">${escapeHtml(tr("openPage"))}</a>
        </div>
      </article>
    `;
  }

  function renderIndex() {
    const featured = data.artworks[0];
    const featuredNode = document.getElementById("featured-work");
    const listNode = document.getElementById("artwork-list");
    const featuredTitle = localize(featured.title);

    document.title = tr("pageTitleIndex");

    if (featuredNode) {
      featuredNode.innerHTML = `
        <div class="gallery-lead__copy">
          <p class="eyebrow">${escapeHtml(tr("digitalExposition"))}</p>
          <h1>${escapeHtml(data.artist)}</h1>
          <p>${escapeHtml(localize(featured.summary))}</p>
          <div class="lead-actions">
            <a class="button" href="artwork.html?id=${encodeURIComponent(featured.id)}">${escapeHtml(tr("viewWork"))}</a>
          </div>
        </div>
        <a class="gallery-lead__art" href="artwork.html?id=${encodeURIComponent(featured.id)}">
          <img src="${escapeHtml(featured.image)}" alt="${escapeHtml(featuredTitle)}">
          <span>${escapeHtml(featuredTitle)}, ${escapeHtml(featured.year)}</span>
        </a>
      `;
    }

    if (listNode) {
      listNode.innerHTML = data.artworks.map(cardMarkup).join("");
    }
  }

  function renderArtworkPage() {
    const container = document.getElementById("artwork-page");
    const params = new URLSearchParams(window.location.search);
    const artwork = data.getArtwork(params.get("id"));
    const index = data.artworks.findIndex((item) => item.id === artwork.id);
    const previous = data.artworks[(index - 1 + data.artworks.length) % data.artworks.length];
    const next = data.artworks[(index + 1) % data.artworks.length];
    const title = localize(artwork.title);
    const description = localize(artwork.description);
    const details = localize(artwork.details);

    document.title = `${title}${tr("separator")}${data.artist}`;

    container.innerHTML = `
      <section class="artwork-hero" style="--accent: ${escapeHtml(artwork.accent)}">
        <figure class="artwork-hero__image">
          <img src="${escapeHtml(artwork.image)}" alt="${escapeHtml(title)}">
        </figure>
        <div class="artwork-hero__content">
          <p class="eyebrow">${escapeHtml(data.artist)}</p>
          <h1>${escapeHtml(title)}</h1>
          <p class="artwork-summary">${escapeHtml(localize(artwork.summary))}</p>
          <dl class="artwork-facts">
            <div>
              <dt>${escapeHtml(tr("year"))}</dt>
              <dd>${escapeHtml(artwork.year)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(tr("technique"))}</dt>
              <dd>${escapeHtml(localize(artwork.technique))}</dd>
            </div>
            <div>
              <dt>${escapeHtml(tr("size"))}</dt>
              <dd>${escapeHtml(localize(artwork.size))}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="artwork-story">
        <div>
          <p class="eyebrow">${escapeHtml(tr("description"))}</p>
          <h2>${escapeHtml(tr("aboutArtwork"))}</h2>
        </div>
        <div class="story-text">
          ${description.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </div>
      </section>

      <section class="artwork-details">
        ${details.map(([label, value]) => `
          <article>
            <p>${escapeHtml(label)}</p>
            <strong>${escapeHtml(value)}</strong>
          </article>
        `).join("")}
      </section>

      <nav class="artwork-nav" aria-label="${escapeHtml(tr("otherWorks"))}">
        <a href="artwork.html?id=${encodeURIComponent(previous.id)}">
          <span>${escapeHtml(tr("previous"))}</span>
          ${escapeHtml(localize(previous.title))}
        </a>
        <a href="artwork.html?id=${encodeURIComponent(next.id)}">
          <span>${escapeHtml(tr("next"))}</span>
          ${escapeHtml(localize(next.title))}
        </a>
      </nav>
    `;
  }

  function renderPage() {
    syncStaticText();

    if (page === "index") {
      renderIndex();
    }

    if (page === "artwork") {
      renderArtworkPage();
    }
  }

  bindLanguageSwitch();
  renderPage();
})();
