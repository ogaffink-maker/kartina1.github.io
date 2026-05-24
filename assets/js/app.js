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
      collectionTitle: "Ою-өрнек арқылы сөйлейтін жұмыстар",
      digitalExposition: "Оюшы · портфолио",
      heroStatement: "Қазақ оюы, аң бейнесі және заманауи лазерлік техника тоғысатын авторлық кеңістік.",
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
      selectedWork: "Таңдамалы жұмыс",
      portfolioMetric: "портфолио",
      workMetric: "жұмыс",
      craftMetric: "ағаш · лазер · бояу",
      manifestoKicker: "Әдіс",
      manifestoTitle: "Ою-өрнек тынысы",
      manifestoText: "Жанғазы Алымұлы ою-өрнекті тек сәндік белгі ретінде емес, бейне құратын тірі жүйе ретінде қолданады. Әр жұмысында сызық, ырғақ және бос кеңістік бір-бірімен сөйлесіп, ұлттық кодты заманауи материалда қайта ашады.",
      manifestoPoint1: "Ырғақ",
      manifestoPoint2: "Қабат",
      manifestoPoint3: "Белгі",
      separator: " · "
    },
    ru: {
      pageTitleIndex: "Жанғазы Алымұлы",
      navWorks: "Работы",
      collection: "Коллекция",
      collectionTitle: "Работы, говорящие языком орнамента",
      digitalExposition: "Мастер казахского орнамента · портфолио",
      heroStatement: "Авторское пространство, где казахский орнамент, образ животного и современная лазерная техника сходятся в одном визуальном ритме.",
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
      selectedWork: "Избранная работа",
      portfolioMetric: "портфолио",
      workMetric: "работы",
      craftMetric: "дерево · лазер · краска",
      manifestoKicker: "Метод",
      manifestoTitle: "Дыхание орнамента",
      manifestoText: "Жанғазы Алымұлы использует орнамент не как декоративный знак, а как живую систему, из которой рождается образ. В каждой работе линия, ритм и свободное пространство раскрывают национальный код в современном материале.",
      manifestoPoint1: "Ритм",
      manifestoPoint2: "Слой",
      manifestoPoint3: "Знак",
      separator: " · "
    }
  };

  let currentLanguage = getInitialLanguage();
  let motionInitialized = false;
  let revealObserver = null;
  let particleSystemStarted = false;

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

  function artworkHref(id) {
    const url = new URL("artwork.html", window.location.href);
    url.searchParams.set("id", id);
    if (currentLanguage !== "kk") {
      url.searchParams.set("lang", currentLanguage);
    }
    return `${url.pathname}${url.search}`;
  }

  function cardMarkup(artwork, index) {
    const title = localize(artwork.title);
    const technique = localize(artwork.technique);

    return `
      <article class="art-card reveal" style="--accent: ${escapeHtml(artwork.accent)}; --delay: ${index * 90}ms">
        <a class="art-card__image" href="${escapeHtml(artworkHref(artwork.id))}" aria-label="${escapeHtml(title)}">
          <img src="${escapeHtml(artwork.image)}" alt="${escapeHtml(title)}">
          <span class="art-card__index">0${index + 1}</span>
        </a>
        <div class="art-card__body">
          <p class="meta-line">${escapeHtml(artwork.year)}${escapeHtml(tr("separator"))}${escapeHtml(technique)}</p>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(localize(artwork.summary))}</p>
          <a class="text-link" href="${escapeHtml(artworkHref(artwork.id))}">${escapeHtml(tr("openPage"))}</a>
        </div>
      </article>
    `;
  }

  function renderIndex() {
    const featured = data.artworks[0];
    const featuredNode = document.getElementById("featured-work");
    const listNode = document.getElementById("artwork-list");
    const manifestoNode = document.getElementById("ornament-story");
    const featuredTitle = localize(featured.title);

    document.title = tr("pageTitleIndex");

    if (featuredNode) {
      featuredNode.innerHTML = `
        <div class="hero-orbit" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="gallery-lead__copy reveal">
          <p class="eyebrow">${escapeHtml(tr("digitalExposition"))}</p>
          <h1 class="kinetic-title">
            <span>Жанғазы</span>
            <span>Алымұлы</span>
          </h1>
          <p>${escapeHtml(tr("heroStatement"))}</p>
          <div class="lead-actions">
            <a class="button" href="${escapeHtml(artworkHref(featured.id))}">${escapeHtml(tr("viewWork"))}</a>
          </div>
          <div class="hero-metrics" aria-label="Portfolio facts">
            <div><strong>2026</strong><span>${escapeHtml(tr("portfolioMetric"))}</span></div>
            <div><strong>${data.artworks.length}</strong><span>${escapeHtml(tr("workMetric"))}</span></div>
            <div><strong>3</strong><span>${escapeHtml(tr("craftMetric"))}</span></div>
          </div>
        </div>
        <a class="gallery-lead__art reveal" href="${escapeHtml(artworkHref(featured.id))}" style="--accent: ${escapeHtml(featured.accent)}">
          <span class="art-frame-glow" aria-hidden="true"></span>
          <img src="${escapeHtml(featured.image)}" alt="${escapeHtml(featuredTitle)}">
          <span class="gallery-lead__caption">
            <small>${escapeHtml(tr("selectedWork"))}</small>
            ${escapeHtml(featuredTitle)}, ${escapeHtml(featured.year)}
          </span>
        </a>
      `;
    }

    if (listNode) {
      listNode.innerHTML = data.artworks.map(cardMarkup).join("");
    }

    if (manifestoNode) {
      manifestoNode.innerHTML = `
        <div class="manifesto-pattern" aria-hidden="true"></div>
        <div class="manifesto-copy reveal">
          <p class="eyebrow">${escapeHtml(tr("manifestoKicker"))}</p>
          <h2>${escapeHtml(tr("manifestoTitle"))}</h2>
          <p>${escapeHtml(tr("manifestoText"))}</p>
        </div>
        <div class="manifesto-points reveal">
          <span>${escapeHtml(tr("manifestoPoint1"))}</span>
          <span>${escapeHtml(tr("manifestoPoint2"))}</span>
          <span>${escapeHtml(tr("manifestoPoint3"))}</span>
        </div>
      `;
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
        <figure class="artwork-hero__image reveal">
          <span class="art-frame-glow" aria-hidden="true"></span>
          <img src="${escapeHtml(artwork.image)}" alt="${escapeHtml(title)}">
        </figure>
        <div class="artwork-hero__content reveal">
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
        <div class="reveal">
          <p class="eyebrow">${escapeHtml(tr("description"))}</p>
          <h2>${escapeHtml(tr("aboutArtwork"))}</h2>
        </div>
        <div class="story-text reveal">
          ${description.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </div>
      </section>

      <section class="artwork-details">
        ${details.map(([label, value], detailIndex) => `
          <article class="reveal" style="--delay: ${detailIndex * 80}ms">
            <p>${escapeHtml(label)}</p>
            <strong>${escapeHtml(value)}</strong>
          </article>
        `).join("")}
      </section>

      <nav class="artwork-nav reveal" aria-label="${escapeHtml(tr("otherWorks"))}">
        <a href="${escapeHtml(artworkHref(previous.id))}">
          <span>${escapeHtml(tr("previous"))}</span>
          ${escapeHtml(localize(previous.title))}
        </a>
        <a href="${escapeHtml(artworkHref(next.id))}">
          <span>${escapeHtml(tr("next"))}</span>
          ${escapeHtml(localize(next.title))}
        </a>
      </nav>
    `;
  }

  function initMotion() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!motionInitialized) {
      document.addEventListener("pointermove", (event) => {
        const x = Math.round((event.clientX / window.innerWidth) * 100);
        const y = Math.round((event.clientY / window.innerHeight) * 100);
        document.documentElement.style.setProperty("--mx", `${x}%`);
        document.documentElement.style.setProperty("--my", `${y}%`);

        const aura = document.querySelector(".cursor-aura");
        if (aura && !reducedMotion) {
          aura.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        }
      }, { passive: true });
      motionInitialized = true;
    }

    if (reducedMotion || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-visible"));
      return;
    }

    if (revealObserver) {
      revealObserver.disconnect();
    }

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });

    document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));
  }

  function initTouchParticles() {
    if (particleSystemStarted || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const canvas = document.getElementById("touch-particles");
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    const particles = [];
    const palette = ["#e1b45d", "#f7e6be", "#3c8b78", "#842f2e"];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let lastTouch = null;
    let animationFrame = null;

    function resize() {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function spawn(x, y, amount, force) {
      const cappedAmount = Math.min(amount, 18);
      for (let index = 0; index < cappedAmount; index += 1) {
        const angle = (Math.PI * 2 * index) / cappedAmount + Math.random() * 0.7;
        const speed = (1.2 + Math.random() * 3.2) * force;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 0.7,
          life: 1,
          decay: 0.012 + Math.random() * 0.018,
          size: 2 + Math.random() * 4.2,
          spin: Math.random() * Math.PI,
          spinSpeed: -0.08 + Math.random() * 0.16,
          color: palette[Math.floor(Math.random() * palette.length)]
        });
      }

      if (particles.length > 180) {
        particles.splice(0, particles.length - 180);
      }

      if (!animationFrame) {
        animationFrame = requestAnimationFrame(draw);
      }
    }

    function drawOrnamentDot(particle) {
      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.spin);
      context.globalAlpha = Math.max(0, particle.life);
      context.strokeStyle = particle.color;
      context.fillStyle = particle.color;
      context.lineWidth = 1.2;

      const size = particle.size;
      context.beginPath();
      context.moveTo(0, -size);
      context.lineTo(size, 0);
      context.lineTo(0, size);
      context.lineTo(-size, 0);
      context.closePath();
      context.stroke();

      context.beginPath();
      context.arc(0, 0, size * 0.28, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    function draw() {
      context.clearRect(0, 0, width, height);

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.982;
        particle.vy = particle.vy * 0.982 + 0.018;
        particle.spin += particle.spinSpeed;
        particle.life -= particle.decay;

        if (particle.life <= 0 || particle.x < -40 || particle.x > width + 40 || particle.y < -40 || particle.y > height + 40) {
          particles.splice(index, 1);
        } else {
          drawOrnamentDot(particle);
        }
      }

      if (particles.length) {
        animationFrame = requestAnimationFrame(draw);
      } else {
        animationFrame = null;
      }
    }

    function touchPoint(event) {
      const touch = event.touches && event.touches[0] ? event.touches[0] : event.changedTouches && event.changedTouches[0];
      if (!touch) {
        return null;
      }
      return { x: touch.clientX, y: touch.clientY };
    }

    function handleTouchStart(event) {
      const point = touchPoint(event);
      if (!point) {
        return;
      }

      lastTouch = { ...point, time: performance.now() };
      spawn(point.x, point.y, 12, 0.86);
    }

    function handleTouchMove(event) {
      const point = touchPoint(event);
      if (!point || !lastTouch) {
        return;
      }

      const dx = point.x - lastTouch.x;
      const dy = point.y - lastTouch.y;
      const distance = Math.hypot(dx, dy);

      if (distance > 14) {
        const force = Math.min(2.2, 0.65 + distance / 72);
        spawn(point.x, point.y, 7, force);
        lastTouch = { ...point, time: performance.now() };
      }
    }

    function handleTouchEnd(event) {
      const point = touchPoint(event);
      if (!point) {
        lastTouch = null;
        return;
      }

      const elapsed = lastTouch ? Math.max(1, performance.now() - lastTouch.time) : 1;
      const distance = lastTouch ? Math.hypot(point.x - lastTouch.x, point.y - lastTouch.y) : 0;
      const force = Math.min(2.6, 1 + distance / elapsed);
      spawn(point.x, point.y, 16, force);
      lastTouch = null;
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    particleSystemStarted = true;
  }

  function renderPage() {
    syncStaticText();

    if (page === "index") {
      renderIndex();
    }

    if (page === "artwork") {
      renderArtworkPage();
    }

    initMotion();
    initTouchParticles();
  }

  bindLanguageSwitch();
  renderPage();
})();
