/* Add custom Js styles below */ 


(function () {
    const BADGES = [
      "ضمان ذهبي",
      "قسطها مع تابي وتمارا",
      "معتمدة مختبريا"
    ];
  
    const CHECK_SVG = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.55)" stroke-width="1.5"></circle>
        <path d="M7.5 12.4l2.7 2.8 6.4-6.7" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;
  
    function inject() {
      const h2 = document.querySelector(".grill-hero h2");
      if (!h2) return false;
  
      if (h2.parentElement.querySelector(".grill-hero-badges")) return true;
  
      const wrap = document.createElement("div");
      wrap.className = "grill-hero-badges";
      wrap.setAttribute("dir", "rtl");
  
      BADGES.forEach((text) => {
        const item = document.createElement("div");
        item.className = "grill-hero-badge";
        item.innerHTML = `${CHECK_SVG}<span>${text}</span>`;
        wrap.appendChild(item);
      });
  
      // أدخلها مباشرة بعد العنوان
      h2.insertAdjacentElement("afterend", wrap);
      return true;
    }
  
    if (inject()) return;
  
    const obs = new MutationObserver(() => {
      if (inject()) obs.disconnect();
    });
  
    obs.observe(document.documentElement, { childList: true, subtree: true });
  
    // كـ fallback
    setTimeout(() => obs.disconnect(), 8000);
  })();
  (function () {
    const VIDEO_SRC    = "https://isbadr.fra1.cdn.digitaloceanspaces.com/coal.mp4";
    const FALLBACK_GIF = "https://cdn.files.salla.network/homepage/1333909099/bbba71ee-5d70-4c90-88ad-93071681142e.gif";
  
    const HTML = `
      <section id="coal-360">
        <div class="coal-sticky">
          <img class="coal-fallback" src="${FALLBACK_GIF}" alt="" />
          <video class="coal-video" muted playsinline loop>
            <source src="${VIDEO_SRC}" type="video/mp4">
          </video>
          <div class="coal-content">
            <p class="coal-subtitle">فخورين بخدمة أكثر من</p>
            <div class="coal-stats">
              <div class="coal-stat">
                <p class="coal-number"><span class="coal-counter" data-target="22000">0</span>+</p>
                <p class="coal-label">عميل</p>
              </div>
              <div class="coal-stat">
                <p class="coal-number"><span class="coal-counter" data-target="27000">0</span>+</p>
                <p class="coal-label">طلب</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  
    function mount() {
      if (document.getElementById('coal-360')) return true;
      const anchor = document.querySelector('.our-numbers');
      if (!anchor) return false;
      anchor.insertAdjacentHTML('afterbegin', HTML);
      anchor.classList.add('coal-replaced');
      initCoal();
      return true;
    }
  
    function initCoal() {
      const coalSection  = document.getElementById('coal-360');
      const coalVideo    = coalSection.querySelector('.coal-video');
      const fallbackEl   = coalSection.querySelector('.coal-fallback');
      const counterEls   = coalSection.querySelectorAll('.coal-counter');
      const DURATION     = 3500;
      let hasAnimated    = false;
  
      // Start with video hidden so fallback takes its place
      coalVideo.style.display = 'none';
  
      coalVideo.addEventListener('playing', () => {
        fallbackEl.style.display = 'none';
        coalVideo.style.display = '';
      }, { once: true });
  
      function animateCounter(el) {
        const target    = parseInt(el.dataset.target) || 0;
        const startTime = performance.now();
        (function tick(now) {
          const progress  = Math.min((now - startTime) / DURATION, 1);
          const easeOut   = 1 - Math.pow(1 - progress, 3);
          el.textContent  = Math.floor(easeOut * target).toLocaleString('en-US');
          if (progress < 1) requestAnimationFrame(tick);
        })(performance.now());
      }
  
      function startAnimations() {
        if (hasAnimated) return;
        hasAnimated = true;
        coalSection.classList.add('coal-visible');
        if (coalVideo) coalVideo.play().catch(() => {});
        setTimeout(() => {
          counterEls.forEach(animateCounter);
        }, 400);
      }
  
      new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) startAnimations(); });
      }, { threshold: 0.3 }).observe(coalSection);
    }
  
    function boot() {
      if (mount()) return;
      const mo = new MutationObserver(() => {
        if (mount()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === 'complete') boot();
    else window.addEventListener('load', boot, { once: true });
  })();
  
  (function () {
    const SECTION_SELECTOR = "#best-offers-3-slider"; // your section
    const SLIDER_ID = "#slider-with-bg-3";            // your salla-slider id
  
    function disableAutoplay() {
      const section = document.querySelector(SECTION_SELECTOR);
      if (!section) return false;
  
      // Remove autoplay attributes so Salla components don't re-enable it later
      section.querySelectorAll("[autoplay],[auto-play]").forEach(el => {
        el.removeAttribute("autoplay");
        el.removeAttribute("auto-play");
      });
  
      // Find the Swiper container inside this slider
      const swiperEl =
        section.querySelector(`${SLIDER_ID} .swiper`) ||
        section.querySelector(".swiper");
  
      const swiper = swiperEl && swiperEl.swiper;
      if (!swiper) return false;
  
      // Stop + disable
      if (swiper.autoplay) swiper.autoplay.stop();
      swiper.params.autoplay = false;
  
      // Sometimes Swiper stores "enabled" on params.autoplay object
      if (swiper.params && swiper.params.autoplay && typeof swiper.params.autoplay === "object") {
        swiper.params.autoplay.enabled = false;
      }
  
      swiper.update();
      return true;
    }
  
    // Try now
    if (disableAutoplay()) return;
  
    // Wait for hydration/initialization
    const obs = new MutationObserver(() => {
      if (disableAutoplay()) obs.disconnect();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  
    // Safety stop
    setTimeout(() => obs.disconnect(), 10000);
  })();
  
  (function () {
    const SPLIT_RE = /\s*[-–—]\s*/;
    const CHECK_SVG = `
      <svg class="pc-check" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="rgba(217,94,22,.15)"></circle>
        <path d="M7.5 12.4l2.7 2.8 6.4-6.7" fill="none" stroke="rgba(217,94,22,1)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;
  
    function transformSubtitle(subtitleEl) {
      if (!subtitleEl || subtitleEl.dataset.pcProcessed === "1") return;
      const raw = (subtitleEl.textContent || "").trim();
      if (!raw) return;
      if (!/[-–—]/.test(raw)) return;
      const parts = raw
        .split(SPLIT_RE)
        .map(s => s.trim())
        .filter(Boolean);
      if (parts.length < 2) return;
      const card = subtitleEl.closest(".product-card") || subtitleEl.parentElement;
      if (!card) return;
      if (card.querySelector(".pc-feature-box")) return;
  
      // Add targetable class to the card
      card.classList.add("has-features");
  
      const box = document.createElement("div");
      box.className = "pc-feature-box";
      const ul = document.createElement("ul");
      ul.className = "pc-features";
      parts.forEach(text => {
        const li = document.createElement("li");
        li.innerHTML = `${CHECK_SVG}<span>${text}</span>`;
        ul.appendChild(li);
      });
      box.appendChild(ul);
      subtitleEl.insertAdjacentElement("afterend", box);
      subtitleEl.classList.add("pc-subtitle--hidden");
      subtitleEl.dataset.pcProcessed = "1";
    }
  
    function run(root = document) {
      root
        .querySelectorAll(".product-card__subtitle:not([data-pc-processed='1'])")
        .forEach(transformSubtitle);
    }
  
    run();
  
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches?.(".product-card__subtitle")) transformSubtitle(node);
          if (node.querySelectorAll) run(node);
        }
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  })();
  
  (function () {
    const VIDEO_SRC = "https://bckbbq.b-cdn.net/home/store.mp4"; 
  
    function mount() {
      if (document.getElementById('injected-video-wrap')) return true;
  
      const anchor = document.querySelector('.s-block--map');
      if (!anchor) return false;
  
      const html = `
        <div id="injected-video-wrap">
          <video autoplay muted playsinline loop>
            <source src="${VIDEO_SRC}" type="video/mp4">
          </video>
        </div>
      `;
  
      anchor.insertAdjacentHTML('beforebegin', html);
      return true;
    }
  
    function boot() {
      if (mount()) return;
      const mo = new MutationObserver(() => {
        if (mount()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === 'complete') boot();
    else window.addEventListener('load', boot, { once: true });
  })();
  
  
  (function () {
    function patchSlider() {
      // support both the typo and correct spelling
      const section = document.querySelector('.cutsom-sections, .custom-sections');
      if (!section) return false;
  
      const swiperEl = section.querySelector('.swiper');
      if (!swiperEl || !swiperEl.swiper) return false;
  
      const swiper = swiperEl.swiper;
  
      // Enable centered layout so active slide sits in the middle
      Object.assign(swiper.params, {
        centeredSlides: true,
        slidesPerView: 3,
        initialSlide: 2,
      });
  
      swiper.update();
      swiper.slideTo(1, 0); // 0 = no animation on initial load
      return true;
    }
  
    // Retry until Swiper is initialized (it hydrates async)
    let attempts = 0;
    const interval = setInterval(() => {
      if (patchSlider() || ++attempts > 30) clearInterval(interval);
    }, 300);
  })();
  
  
  (function () {
    const FIRE_IMG = "https://cdn.files.salla.network/homepage/1333909099/b7f3949d-8cf6-433b-b0c8-0de21d4e9edb.webp";  // ← replace
    const LOGO_IMG = "https://cdn.files.salla.network/theme/1333909099/cd31e988-02e3-424a-96d6-eb973e0fa51f.webp"; // ← replace if needed
  
    const ROWS = [
      { text: "متخصصين في عالم الشوايات وتصنيع وتطوير افضل الشوايات", us: true,  them: false },
      { text: "ضمان ذهبي",                                               us: true,  them: false  },
      { text: "شهادة اعتماد وأمان لشوايات الغاز",                         us: true,  them: false },
      { text: "فريق عمل سعودي متمكن لخدمتك على مدار اليوم",                      us: true,  them: false },
    ];
  
    function icon(val) {
      return val
        ? `<span class="ct-check">✓</span>`
        : `<span class="ct-cross">✕</span>`;
    }
  
    function buildHTML() {
      const rows = ROWS.map(r => `
        <div class="ct-row">
          <div class="ct-feature-text">${r.text}</div>
          <div class="ct-icon-cell">${icon(r.us)}</div>
          <div class="ct-icon-cell">${icon(r.them)}</div>
        </div>
      `).join('');
  
      return `
        <section id="ct-section">
          <div class="ct-wrap">
            <img class="ct-fire-img" src="${FIRE_IMG}" alt="fire">
            <div class="ct-card">
              <div class="ct-header">
                <div class="ct-glow-orb"></div>
                <div class="ct-header-title">ليه عالم الشواء؟</div>
                <div class="ct-logo-wrap">
                  <img class="ct-logo-img" src="${LOGO_IMG}" alt="عالم الشواء">
                </div>
                <div class="ct-header-others">براندات اخرى</div>
              </div>
              ${rows}
            </div>
          </div>
        </section>
      `;
    }
  
    function mount() {
      if (document.getElementById('ct-section')) return true;
  
      const anchor = document.querySelector('.comparison-table');
      if (!anchor) return false;
  
      anchor.insertAdjacentHTML('afterbegin', buildHTML());
      anchor.classList.add('ct-replaced');
  
      return true;
    }
  
    function boot() {
      if (mount()) return;
      const mo = new MutationObserver(() => {
        if (mount()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === 'complete') boot();
    else window.addEventListener('load', boot, { once: true });
  })();
  
  (function () {
    const MATERIAL_CSS = "https://bckbbq.b-cdn.net/home/effect.min.css"; 
    const MATERIAL_JS  = "https://bckbbq.b-cdn.net/home/effect.min.js";
    const SWIPER_CSS   = "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css";
    const SWIPER_JS    = "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";
  
    function loadCSS(href) {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = href;
      document.head.appendChild(l);
    }
  
    function loadScript(src) {
      return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src; s.onload = resolve; s.onerror = resolve;
        document.head.appendChild(s);
      });
    }
  
    function mount() {
      if (document.getElementById('bckyard-products-slider')) return true;
  
      const anchor = document.querySelector('.products-experience');
      if (!anchor) return false;
  
      // grab data from existing section
      const slides = anchor.querySelectorAll('.swiper-slide');
      if (!slides.length) return false;
  
      const items = Array.from(slides).map(s => ({
        img: (s.querySelector('img')?.src || s.querySelector('img')?.dataset?.src || ''),
        name: (s.querySelector('h3')?.textContent?.trim() || ''),
        link: (s.querySelector('a')?.href || '#'),
      }));
  
      // build new HTML
      const slidesHTML = items.map(item => `
        <div class="swiper-slide">
          <div class="swiper-material-wrapper">
            <div class="swiper-material-content">
              <img class="bk-product-image" data-swiper-material-scale="1.25"
                src="${item.img}" alt="${item.name}" />
              <div class="bk-product-overlay">
                <span class="bk-product-name">${item.name}</span>
                <a href="${item.link}" class="bk-product-cta">اكتشف المنتج</a>
              </div>
            </div>
          </div>
        </div>
      `).join('');
  
      const html = `
        <section id="bckyard-products-slider" class="bk-products-section">
          <h2 class="bk-section-title">
            <span class="bk-title-en">Live the BBQ experience</span>
            <span class="bk-title-ar">عش تجربة الشواء</span>
          </h2>
          <div class="bk-slider-container">
            <div class="swiper bk-swiper-material">
              <div class="swiper-wrapper">
                ${slidesHTML}
              </div>
            </div>
          </div>
        </section>
      `;
  
      anchor.insertAdjacentHTML('beforebegin', html);
      anchor.style.display = 'none';
  
      // load assets then init
      loadCSS(SWIPER_CSS);
      loadCSS(MATERIAL_CSS);
  
      loadScript(SWIPER_JS).then(() => loadScript(MATERIAL_JS)).then(() => {
        if (typeof Swiper === 'undefined' || typeof EffectMaterial === 'undefined') return;
        new Swiper('.bk-swiper-material', {
          modules: [EffectMaterial],
          effect: 'material',
          materialEffect: { slideSplitRatio: 0.65 },
          grabCursor: true,
          speed: 600,
          breakpoints: {
            0:    { slidesPerView: 1.2, spaceBetween: 10 },
            480:  { slidesPerView: 1.5, spaceBetween: 12 },
            768:  { slidesPerView: 2,   spaceBetween: 16 },
            1024: { slidesPerView: 3,   spaceBetween: 16 },
          },
        });
      });
  
      return true;
    }
  
    function boot() {
      if (mount()) return;
      const mo = new MutationObserver(() => {
        if (mount()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === 'complete') boot();
    else window.addEventListener('load', boot, { once: true });
  })();
  
  (function () {
    const productRanges = {
      AVEYGQ: { min: 60, max: 100 },
      ydlpGEx: { min: 80, max: 120 },
      OqRXoEK: { min: 70, max: 100 },
      vrXWao: { min: 20, max: 35 },
      XzWwZwY: { min: 30, max: 55 },
      jobqqX: { min: 60, max: 120 },
      QzwyZnx: { min: 15, max: 30 },
      NDyNoG: { min: 10, max: 40 },
      DpPRzAv: { min: 5, max: 20 },
      XzApooB: { min: 60, max: 100 },
      mQwvRGW: { min: 70, max: 110 },
      BWAGXr: { min: 20, max: 40 },
      qBWweV: { min: 70, max: 130 },
      xAmmOlo: { min: 5, max: 15 },
      lGKYbWy: { min: 20, max: 30 },
      Rjwzxy: { min: 10, max: 40 },
      onbajor: { min: 10, max: 30 },
    };
  
    function getProductRange() {
      const url = window.location.pathname + window.location.search;
      for (const [id, range] of Object.entries(productRanges)) {
        if (url.includes(id)) return range;
      }
      return null;
    }
  
    function getViewerCount(min, max) {
      const now = new Date();
      const t = now.getHours() * 60 + now.getMinutes();
      let m;
      if (t < 360) m = 0.2 + (t / 360) * 0.1;
      else if (t < 720) m = 0.3 + ((t - 360) / 360) * 0.3;
      else if (t < 900) m = 0.6 + ((t - 720) / 180) * 0.2;
      else if (t < 1080) m = 0.8 + ((t - 900) / 180) * 0.2;
      else if (t < 1320) m = 1.0;
      else m = 1.0 - ((t - 1320) / 120) * 0.8;
      m += Math.sin(now.getHours() * 0.5) * 0.1;
      m = Math.max(0.2, Math.min(1.0, m));
      return Math.round(min + (max - min) * m);
    }
  
    function mount() {
      if (document.getElementById('bk-viewer-counter')) return true;
  
      const anchor = document.querySelector('h1.text-xl.font-bold, h1.text-2xl.font-bold');
      if (!anchor) return false;
  
      const range = getProductRange();
      if (!range) return true; // not a tracked product, stop trying
  
      const count = getViewerCount(range.min, range.max);
  
      const html = `
        <div id="bk-viewer-counter" class="bk-viewer-counter">
          <span class="bk-viewer-dot"></span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" class="bk-viewer-icon">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span class="bk-viewer-text">هناك <strong>${count}</strong> شخص يشاهدون هذا المنتج الآن</span>
        </div>
      `;
  
      anchor.insertAdjacentHTML('afterend', html);
      return true;
    }
  
    function boot() {
      // only run on product pages
      const isProduct = document.querySelector('.product-single') || document.querySelector('.product-detail');
      if (!isProduct && !(window.dataLayer && window.dataLayer.some(i => i.page && i.page.pageName === 'productShow'))) return;
  
      if (mount()) return;
      const mo = new MutationObserver(() => {
        if (mount()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === 'complete') boot();
    else window.addEventListener('load', boot, { once: true });
  })();
  
  (function () {
    const PRODUCT_VIDEOS = {
      // Pizza oven
      AVEYGQ: `
        <strong>فيديو استعراضي للفرن بحلّته الجديدة بصحن دوّار:</strong><br>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/xxik-qo58Ng?showinfo=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        <br>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/HoBlQtL3m0g?showinfo=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        <br>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/-l3_GDkxc9Y?showinfo=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        <br>
    
        <strong>مو بس للبيتزا! اتعرف على مميزاته مع شيف أحمد عزيز:</strong><br>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/bI_Lq5a9bYQ?showinfo=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        <br>
    
        <strong>الخُبز العربي خَبزه صار أسهل مع الفرن.. شوف تجربة عثمانيات:</strong><br>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/Um3xDVQma7E?showinfo=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        <br>
    
        <strong>تبي تعرف كيف طريقة البيتزا الإيطالية من العجين لين لصلصة؟ تابع شيف ورد تميم:</strong><br>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/ygrD7ghGo8k?showinfo=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        <br>
      `,
      jobqqX: `
       <br>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/YOLVDGPJMSs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="">
    </iframe>
    <br>
    <br>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/M9SMoCmfEW8" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="">
    </iframe>
    <br>
    `,
    OqRXoEK:`
    
        <br>
      <iframe src="https://www.youtube.com/embed/GeaV-xzf6A0?si=BtOhcs3IXXBu39c0" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe>
      <br>
      <iframe src="https://www.youtube.com/embed/esHfuyWhjtE?si=eOCCkzVFNT6KVqDC" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe>
      <br>
      <iframe src="https://youtube.com/embed/vYSJEIQ5HNk?si=r079VJhQ-QDgss4c" width="315" height="560" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe>
      <br>
    `,
    ydlpGEx:`
       <br>
      <iframe src="https://www.youtube.com/embed/YkC4QTgO2mw" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe>
      <br>
      <iframe src="https://www.youtube.com/embed/By5felwmsn0" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe>
      <br>
     <iframe width="560" height="315" src="https://www.youtube.com/embed/LBhlCG1HyXA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen=""></iframe>
      <br>
    `,
    vrXWao:`
       <br>
      <strong> مقطع فيديو يوضح طريقة تركيب الشواية :</strong><br>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/spLCo5cmci4?si=bhzwyfGrtGxo8t4o" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe>
      <br>
      <strong> استعراض شواية الغاز:</strong><br>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/Vfp2wyeEBJ0?si=trqF8tbHIgHCWugE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe>
      <br>
    
    `,
    XzWwZwY:`
    
      <strong>مقطع فيديو لاستعراض الشواية بشكل تفصيلي:</strong><br>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/VN9qp7g7D3k" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe>
      <br>
    `
    };
  
    const BLOCK_ID = 'bk-desc-videos';
  
    function getVideosContent() {
      const url = window.location.pathname + window.location.search;
  
      for (const [productId, content] of Object.entries(PRODUCT_VIDEOS)) {
        if (url.includes(productId)) return content;
      }
  
      return null;
    }
  
    function createAccordion(contentHtml) {
      const lang = (document.documentElement.lang || 'ar').toLowerCase();
      const title = lang.startsWith('en') ? 'Product Review Videos' : 'فيديوهات استعراض المنتج';
  
      const wrapper = document.createElement('div');
      wrapper.id = BLOCK_ID;
      wrapper.className = 'bk-desc-videos';
  
      wrapper.innerHTML = `
        <button type="button" class="bk-desc-videos__trigger" aria-expanded="true">
          <span>${title}</span>
          <span class="bk-desc-videos__icon" aria-hidden="true">-</span>
        </button>
  
        <div class="bk-desc-videos__panel" >
          <div class="bk-desc-videos__inner">
            ${contentHtml}
          </div>
        </div>
      `;
  
      const trigger = wrapper.querySelector('.bk-desc-videos__trigger');
      const panel = wrapper.querySelector('.bk-desc-videos__panel');
      const icon = wrapper.querySelector('.bk-desc-videos__icon');
  
      trigger.addEventListener('click', function () {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
  
        trigger.setAttribute('aria-expanded', String(!isOpen));
        panel.hidden = isOpen;
        icon.textContent = isOpen ? '+' : '−';
        wrapper.classList.toggle('is-open', !isOpen);
      });
  
      return wrapper;
    }
  
    function mount() {
      if (document.getElementById(BLOCK_ID)) return true;
  
      const contentHtml = getVideosContent();
      if (!contentHtml) return true; // no videos for this product
  
      const details = document.querySelector('#details_table');
      if (!details) return false;
  
      const accordion = createAccordion(contentHtml);
      details.appendChild(accordion);
  
      return true;
    }
  
    function boot() {
      const isProduct =
        document.querySelector('.product-single') ||
        document.querySelector('.product-detail') ||
        (window.dataLayer &&
          window.dataLayer.some(i => i.page && i.page.pageName === 'productShow'));
  
      if (!isProduct) return;
  
      if (mount()) return;
  
      const mo = new MutationObserver(() => {
        if (mount()) mo.disconnect();
      });
  
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === 'complete') boot();
    else window.addEventListener('load', boot, { once: true });
  })();
  
  
  (function () {
    const PRODUCT_SAFETY = {
      // Pizza oven
      AVEYGQ: `
        <p>
          <a href="https://blog.bckyrdbbq.com/2022/10/blog-post.html" target="_blank" style="color: rgb(23, 137, 200);">
            <strong>طريقة استخدام فرن البيتزا وتعليمات السلامة</strong>
          </a>
        </p>
        <br/>
  
        <img
          src="https://cdn.salla.sa/form-builder/MVYXtnbW0dALtaNzsKQd1GX1ihD62GXcx1wNgtsS.jpg"
          alt="تعليمات السلامة"
          loading="lazy"
        >
      `,
  
      // Gas grills
      vrXWao: `
       <a href="https://grill.bckyrdbbq.com/2024/06/4356.html" target="_blank" style="color: rgb(23, 137, 200);">
          <strong>طريقة استخدام شواية الغاز وتعليمات السلامة</strong>
        </a>
      `,
  
      XzWwZwY: `
       <a href="https://grill.bckyrdbbq.com/2024/06/4356.html" target="_blank" style="color: rgb(23, 137, 200);">
          <strong>طريقة استخدام شواية الغاز وتعليمات السلامة</strong>
        </a>
      `
    };
  
    const BLOCK_ID = 'bk-desc-safety';
  
    function getSafetyContent() {
      const url = window.location.pathname + window.location.search;
  
      for (const [productId, content] of Object.entries(PRODUCT_SAFETY)) {
        if (url.includes(productId)) return content;
      }
  
      return null;
    }
  
    function createAccordion(contentHtml) {
      const lang = (document.documentElement.lang || 'ar').toLowerCase();
      const title = lang.startsWith('en') ? 'Safety Instructions' : 'تعليمات السلامة';
  
      const wrapper = document.createElement('div');
      wrapper.id = BLOCK_ID;
      wrapper.className = 'bk-desc-safety';
  
      wrapper.innerHTML = `
        <button type="button" class="bk-desc-safety__trigger" aria-expanded="false">
          <span>${title}</span>
          <span class="bk-desc-safety__icon" aria-hidden="true">+</span>
        </button>
  
        <div class="bk-desc-safety__panel" hidden>
          <div class="bk-desc-safety__inner">
            ${contentHtml}
          </div>
        </div>
      `;
  
      const trigger = wrapper.querySelector('.bk-desc-safety__trigger');
      const panel = wrapper.querySelector('.bk-desc-safety__panel');
      const icon = wrapper.querySelector('.bk-desc-safety__icon');
  
      trigger.addEventListener('click', function () {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
  
        trigger.setAttribute('aria-expanded', String(!isOpen));
        panel.hidden = isOpen;
        icon.textContent = isOpen ? '+' : '−';
        wrapper.classList.toggle('is-open', !isOpen);
      });
  
      return wrapper;
    }
  
    function mount() {
      if (document.getElementById(BLOCK_ID)) return true;
  
      const contentHtml = getSafetyContent();
      if (!contentHtml) return true; // not one of the target products
  
      const details = document.querySelector('#details_table');
      if (!details) return false;
  
      const accordion = createAccordion(contentHtml);
      details.appendChild(accordion);
  
      return true;
    }
  
    function boot() {
      const isProduct =
        document.querySelector('.product-single') ||
        document.querySelector('.product-detail') ||
        (window.dataLayer &&
          window.dataLayer.some(i => i.page && i.page.pageName === 'productShow'));
  
      if (!isProduct) return;
  
      if (mount()) return;
  
      const mo = new MutationObserver(() => {
        if (mount()) mo.disconnect();
      });
  
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === 'complete') boot();
    else window.addEventListener('load', boot, { once: true });
  })();
  (function () {
    const START_TEXT = 'هنا يبدأ الوصف المخفي';
    const END_TEXT = 'هنا ينتهي الوصف المخفي';
  
    function isProductPage() {
      return (
        document.querySelector('.product-single') ||
        document.querySelector('.product-detail') ||
        (window.dataLayer &&
          window.dataLayer.some(i => i.page && i.page.pageName === 'productShow'))
      );
    }
  
    function getDirectChildUnderRoot(node, root) {
      let current = node;
      while (current && current.parentElement !== root) {
        current = current.parentElement;
      }
      return current && current.parentElement === root ? current : null;
    }
  
    function findMarkerDirectChild(root, text) {
      const all = root.querySelectorAll('p, div, li, strong, span');
      for (const el of all) {
        const value = (el.textContent || '').trim();
        if (value.includes(text)) {
          return getDirectChildUnderRoot(el, root);
        }
      }
      return null;
    }
  
    function hideMarkedContent() {
      const details = document.querySelector('#details_table');
      if (!details) return false;
  
      const startNode = findMarkerDirectChild(details, START_TEXT);
      const endNode = findMarkerDirectChild(details, END_TEXT);
  
      if (!startNode || !endNode) return true;
  
      const children = Array.from(details.children);
      const startIndex = children.indexOf(startNode);
      const endIndex = children.indexOf(endNode);
  
      if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return true;
  
      for (let i = startIndex; i <= endIndex; i++) {
        children[i].style.display = 'none';
      }
  
      return true;
    }
  
    function boot() {
      if (!isProductPage()) return;
  
      if (hideMarkedContent()) return;
  
      const mo = new MutationObserver(() => {
        if (hideMarkedContent()) mo.disconnect();
      });
  
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === 'complete') boot();
    else window.addEventListener('load', boot, { once: true });
  })();
  
  
  (() => {
    const BEFORE_SEL = "#details_table";
    const SECTION_CLASS = "ge-section";
  
      const PRODUCT_SECTIONS = {
      jobqqX: {
        sectionId: "ge-section-jobqqX",
        theme: "light",
        title: "استكشف مميزات الشواية",
        intro: "اضغط على المؤشرات على الشواية لتتعرف على كل ميزة.",
        mainImage:
          "https://cdn.files.salla.network/homepage/1333909099/9a7a2e49-46e5-412d-88ef-951e341bc2c4.webp",
        mainImageAlt: "شواية الفحم الاحترافية",
        features: [
          {
            title: "تحكم كامل في حرارة الفحم بـ ٥ مستويات",
            desc: "ارفع أو خفّض سلة الفحم بسهولة من خلال ذراع التعديل الجانبي، عشان تضبط حرارة الشوي حسب نوع اللحم والوقت المتاح بدون ما تفتح الغطاء بالكامل.",
            img: "https://cdn.files.salla.network/homepage/1333909099/0cac11ab-f189-4ea3-841f-d629a7b42e43.webp",
            aria: "ميزة التحكم في حرارة الفحم",
            top: "40%",
            right: "23%",
          },
          {
            title: "باب أمامي لإدارة الفحم أثناء الشواء",
            desc: "باب أمامي يتيح لك زيادة الفحم أو تقليله أثناء الشواء بدون ما ترفع الشبك — تحكم أسرع وحرارة أدق.",
            img: "https://cdn.files.salla.network/homepage/1333909099/16114e9b-cda3-43a9-b6da-c47e438b75df.webp",
            aria: "باب أمامي يُمكنك من زيادة الفحم أو تقليله أثناء الشواء",
            top: "45%",
            right: "50%",
          },
          {
            title: "شبك واسع ومساحة شواء أكبر",
            desc: "شبك واسع يساعدك تشوي كميات أكثر بشكل متوازن مع توزيع حرارة أفضل داخل الشواية.",
            img: "https://cdn.files.salla.network/homepage/1333909099/d9bd1e50-634f-4499-92c0-56e31fecc526.webp",
            aria: "شبك واسع",
            top: "22%",
            right: "45%",
          },
          {
            title: "رف جانبي عملي للتحضير والتقديم",
            desc: "رف جانبي ثابت لوضع الأدوات، التتبيلة، الصحون — يخليك مرتّب وسريع أثناء الشواء.",
            img: "https://cdn.files.salla.network/homepage/1333909099/532ca894-58ea-42a4-8718-70991a744dbb.webp",
            aria: "الرف الجانبي",
            top: "40%",
            right: "80%",
          },
          {
            title: "عجلات قوية وتخزين سفلي",
            desc: "سهولة نقل الشواية + مساحة تخزين سفلية لأكياس الفحم والأدوات.",
            img: "https://cdn.files.salla.network/homepage/1333909099/fe952c11-7f54-4f43-833f-a26069ec37b5.webp",
            aria: "العجلات والتخزين السفلي",
            top: "82%",
            right: "22%",
          },
        ],
      },
      AVEYGQ: {
    sectionId: "ge-section-AVEYGQ",
    theme: "light",
    title: "استكشف مميزات فرن البيتزا",
    intro: "اضغط على المؤشرات على الفرن لتتعرف على كل ميزة.",
    mainImage: "https://cdn.files.salla.network/homepage/1333909099/590b3c71-7bb6-426f-a829-af6046cab37d.webp",
    mainImageAlt: "فرن البيتزا",
    features: [
      {
        title: "هيكل مصمم للحرارة العالية",
        desc: "هيكل متين من الستانلس ستيل يحتفظ بالحرارة بكفاءة ويسمح للفرن بالوصول إلى 500 درجة مئوية، لخبز البيتزا بسرعة فائقة خلال 60 ثانية.",
        img: "https://cdn.files.salla.network/homepage/1333909099/7742a664-52ae-40df-9770-49dc2dbb55e6.webp",
        aria: "هيكل مصمم للحرارة العالية",
        top: "6%",
        right: "24%",
      },
      {
        title: "فتحات تهوية متطورة",
        desc: "نظام تهوية جانبي مصمم لتوزيع الحرارة وسحب الرطوبة الزائدة من الداخل، لتضمن الحصول على أطراف بيتزا مقرمشة ومخبوزات هشة.",
        img: "https://cdn.files.salla.network/homepage/1333909099/61cedf50-4429-4e02-8a8e-528c586eca72.webp",
        aria: "فتحات التهوية المتطورة",
        top: "30%",
        right: "52%",
      },
      {
        title: "حجر دوّار بعجلة تحكم",
        desc: "حجر كورديريت احترافي يمتص الرطوبة، مع قاعدة دوّارة يتم التحكم بها عبر عجلة جانبية، مما يجعل البيتزا تستوي من جميع الجهات دون الحاجة لتقليبها يدوياً.",
        img: "https://cdn.files.salla.network/homepage/1333909099/78420381-a1eb-443d-a091-16e73be1b82b.webp",
        aria: "الحجر الدوار بعجلة تحكم",
        top: "62%",
        right: "18%",
      },
      {
        title: "زر تشغيل ذاتي بمستويات حرارة",
        desc: "مفتاح إشعال مدمج بخاصية الأمان يتيح لك تشغيل الفرن فوراً، مع مستويات متعددة تمنحك تحكماً دقيقاً وسهلاً في درجة الحرارة لنتائج خبز مثالية.",
        img: "https://cdn.files.salla.network/homepage/1333909099/c900ed71-ab0e-405d-a0f3-de630ed7a4e9.webp",
        aria: "زر التشغيل الذاتي بمستويات حرارة",
        top: "44%",
        right: "2%",
      },
      {
        title: "أرجل قابلة للطي",
        desc: "تصميم عملي ومحمول بهيكل متين وخفيف الوزن مع أرجل قابلة للطي، لتستمتع بالخبز في الحديقة أو السطح أو أي مكان آخر بسهولة.",
        img: "https://cdn.files.salla.network/homepage/1333909099/aac524a4-8ceb-4a81-9057-7c051ec2c1a0.webp",
        aria: "الأرجل القابلة للطي",
        top: "67%",
        right: "78%",
      },
    ],
    },
    OqRXoEK: {
    sectionId: "ge-section-OqRXoEK",
    theme: "light",
    title: "استكشف مميزات الشواية",
    intro: "اضغط على المؤشرات على الشواية لتتعرف على كل ميزة.",
    mainImage: "https://cdn.files.salla.network/homepage/1333909099/b7884876-6826-4e53-9464-aa797830a1f0.webp",
    mainImageAlt: "شواية الفحم الاحترافية",
    features: [
      {
        title: "مقبض(هندل) للتحكم بالحرارة بارتفاع الفحم",
        desc: "مقبض رفع على الجانب الأيسر والأيمن، يمكنك تدوير المقبض لرفع أو خفض صاجة الفحم و تغيير الحرارة على الفور دون الحاجة إلى التلاعب بالشواية أو الفحم.",
        img: "https://cdn.files.salla.network/homepage/1333909099/a6404ac9-f105-4992-b053-4c93ee130890.webp",
        aria: "ميزة التحكم في حرارة الفحم",
        top: "46%",
        right: "22%",
      },
      {
        title: "صاجيتن مزدوجة",
        desc: "صاجتين فحم مزدوجة لشواء وجبتين في نفس الوقت",
        img: "https://cdn.files.salla.network/homepage/1333909099/ff7479ab-a114-4f1d-bc17-8231dbabe85f.webp",
        aria: "باب أمامي يُمكنك من زيادة الفحم أو تقليله أثناء الشواء",
        top: "49%",
        right: "50%",
      },
      {
        title: "شبك واسع ومساحة شواء أكبر",
        desc: "شبك واسع يساعدك تشوي كميات أكثر بشكل متوازن مع توزيع حرارة أفضل داخل الشواية.",
        img: "https://cdn.files.salla.network/homepage/1333909099/5c64a542-42b3-49ed-bb85-1096a93e1bf7.webp",
        aria: "شبك واسع",
        top: "22%",
        right: "45%",
      },
      {
        title: "رف جانبي عملي للتحضير والتقديم",
        desc: "رف خشبي جانبي لوضع الأطباق، وخطافات لتعليق أدوات الشواء عليها — تخليك مرتّب وسريع أثناء الشواء",
        img: "https://cdn.files.salla.network/homepage/1333909099/5f827fe1-7d40-4867-97b4-bc263f48b5d5.webp",
        aria: "الرف الجانبي",
        top: "40%",
        right: "80%",
      },
      {
        title: "عجلات قوية وتخزين سفلي",
        desc: "سهولة نقل الشواية + مساحة تخزين سفلية لأكياس الفحم والأدوات.",
        img: "https://cdn.files.salla.network/homepage/1333909099/fe952c11-7f54-4f43-833f-a26069ec37b5.webp",
        aria: "العجلات والتخزين السفلي",
        top: "82%",
        right: "22%",
      },
    ],
    },
    ydlpGEx: {
      sectionId: "ge-section-ydlpGEx",
      theme: "light",
      title: "استكشف صاج الشواء الكهربائي",
      intro: "اضغط على المؤشرات على الصاج لتتعرف على كل ميزة.",
      mainImage: "https://cdn.files.salla.network/homepage/1333909099/24d0a911-4b15-43ec-8d06-afb3dfaaa992.webp", 
      mainImageAlt: "صاج الشواء الكهربائي",
      features: [
        {
          title: "سطح طهي واسع",
          desc: "سطح كبير يتيح تحضير عدة أصناف في نفس الوقت بدون انتظار أو تقسيم مراحل الطهي.",
          img: "https://cdn.files.salla.network/homepage/1333909099/168a9744-0ce2-48fd-a887-3d5029b58629.webp",
          aria: "سطح الطهي الواسع",
          top: "45%",
          right: "62%",
        },
        {
          title: "تحكم في درجة الحرارة",
          desc: "مقبض تحكم عملي لضبط الحرارة حسب نوع الطعام، يوفر طهي متوازن ونتائج دقيقة.",
          img: "https://cdn.files.salla.network/homepage/1333909099/ca45f29d-6670-4a11-83e5-bcf5ad7ee54b.webp",
          aria: "مقبض التحكم في درجة الحرارة",
          top: "62%",
          right: "2%",
        },
        {
          title: "صينية تنقيط قابلة للإزالة",
          desc: "تجمع الزيوت والسوائل أثناء الطهي، سهلة الفك والتنظيف للحفاظ على نظافة الصاج.",
          img: "https://cdn.files.salla.network/homepage/1333909099/5af515ed-0c3f-4602-9cc7-6f02313e917c.webp",
          aria: "صينية التنقيط القابلة للإزالة",
          top: "60%",
          right: "48%",
        },
        {
          title: "مقابض للحمل والتنقل",
          desc: "مقابض جانبية متينة تسهل حمل الصاج، مناسبة للنقل والاستخدام في أي مكان.",
          img: "https://cdn.files.salla.network/homepage/1333909099/ce4225d7-ddda-44de-b1d1-07433e78ba32.webp",
          aria: "مقابض الحمل والتنقل",
          top: "30%",
          right: "86%",
        },
      ],
    },
       vrXWao: {
            sectionId: "ge-section-vrXWao",
            theme: "light",
            title: "استكشف مميزات شواية الغاز",
            intro: "اضغط على المؤشرات على الشواية لتتعرف على كل ميزة.",
            mainImage: "https://cdn.files.salla.network/homepage/1333909099/8d7bebf6-7adb-4ea0-a185-20946f492e3e.webp",
            mainImageAlt: "شواية الغاز",
            features: [
                {
                    title: "شبك كاست آيرون مانع للالتصاق",
                    desc: " مساحة واسعة تتيح لك شوي عدة أصناف في وقت واحد، شبك من حديد الزهر يوزّع الحرارة بالتساوي ويمنع التصاق اللحم، مع رف علوي للتسخين",
                    img: "https://cdn.files.salla.network/homepage/1333909099/1f0077f0-00a9-4eee-8965-117191684c3a.webp",
                    aria: "شبك كاست آيرون مانع للالتصاق",
                    top: "31%",
                    right: "40%",
                },
                {
                    title: "4 عيون غاز قوية الاشتعال ",
                    desc: " 4 عيون رئيسية مخصصة للشواء وعين جانبية للطبخ، كلها بإشعال أوتوماتيكي مع مقابض من الفولاذ المجلفن مدعّمة بالمطاط لقبضة مريحة وآمنة.",
                    img: "https://cdn.files.salla.network/homepage/1333909099/bbf0b968-cb5b-45d9-87cf-2220f9049cef.webp",
                    aria: "4 عيون غاز قوية الاشتعال ",
                    top: "50%",
                    right: "52%",
                },
                {
                    title: "عين جانبية بغطاء",
                    desc: "عين إضافية على الجنب تقدر تطبخ بنفس وقت الشواء. وإذا ما تحتاجها، اقفل الغطاء وتتحول لطاولة جانبية إضافية تحط عليها الصحون والأدوات.",
                    img: "https://cdn.files.salla.network/homepage/1333909099/6adc1ae4-fd07-465c-ba59-6d33df3b15cf.webp",
                    aria: "عين جانبية بغطاء",
                    top: "50%",
                    right: "2%",
                },
                {
                    title: "حجرة تخزين سفلية",
                    desc: "دولاب تخزين بمساحة واسعة يخفي أسطوانة الغاز بالكامل داخله، يحافظ على ترتيب المكان ويعطي الشواية شكل احترافي ونظيف.",
                    img: "https://cdn.files.salla.network/homepage/1333909099/75f33c9c-c092-4b03-b8b6-b35e654330d4.webp",
                    aria: "حجرة تخزين سفلية",
                    top: "69%",
                    right: "20%",
                },
                {
                    title: "عجلات بأقفال",
                    desc: " عجلات متينة تسهّل عليك تحريك الشواية لأي مكان ووقت ما توصل للمكان المناسب، ثبّتها بالأقفال عشان ما تتحرك أثناء الاستخدام.",
                    img: "https://cdn.files.salla.network/homepage/1333909099/fc085b6c-5f22-48a4-b363-6fb106a982bd.webp",
                    aria: "عجلات بأقفال",
                    top: "93%",
                    right: "60%",
                },
                
            ],
        },
        XzWwZwY: {
          sectionId: "ge-section-XzWwZwY",
          theme: "light",
          title: "استكشف مميزات شواية الغاز",
          intro: "اضغط على المؤشرات على الشواية لتتعرف على كل ميزة.",
          mainImage: "https://cdn.files.salla.network/homepage/1333909099/fac72c91-aab5-4665-81c2-66eefcd723ed.webp",
          mainImageAlt: "شواية الغاز",
          features: [
              {
                  title: "شبك كاست آيرون مانع للالتصاق",
                  desc: " مساحة واسعة تتيح لك شوي عدة أصناف في وقت واحد، شبك من حديد الزهر يوزّع الحرارة بالتساوي ويمنع التصاق اللحم، مع رف علوي للتسخين",
                  img: "https://cdn.files.salla.network/homepage/1333909099/78ae881a-9b82-47bc-a43e-09ea0608e8ec.webp",
                  aria: "شبك كاست آيرون مانع للالتصاق",
                  top: "36%",
                  right: "22%",
              },
              {
                  title: "سيخ شواء كهربائي",
                  desc: "سيخ شواء كهربائي دوّار سيخ من الستانلس ستيل يشيل حتى 2 كيلو ويدور أوتوماتيك — حضّر شاورما على أصولها وأنت مرتاح.",
                  img: "https://cdn.files.salla.network/homepage/1333909099/f16fbea3-e412-4b63-b53c-c260e584583d.webp",
                  aria: "سيخ شواء كهربائي",
                  top: "30%",
                  right: "47%",
              },
              {
                  title: "5 عيون غاز قوية الاشتعال ",
                  desc: " 5 عيون رئيسية مخصصة للشواء وعين جانبية للطبخ، كلها بإشعال أوتوماتيكي مع مقابض من الفولاذ المجلفن مدعّمة بالمطاط لقبضة مريحة وآمنة.",
                  img: "https://cdn.files.salla.network/homepage/1333909099/935dd0b5-80d6-4bfb-86e8-c653e3e9fef6.webp",
                  aria: "4 عيون غاز قوية الاشتعال ",
                  top: "47%",
                  right: "50%",
              },
              {
                  title: "عين جانبية بغطاء",
                  desc: "عين إضافية على الجنب تقدر تطبخ بنفس وقت الشواء. وإذا ما تحتاجها، اقفل الغطاء وتتحول لطاولة جانبية إضافية تحط عليها الصحون والأدوات.",
                  img: "https://cdn.files.salla.network/homepage/1333909099/2cf2d45c-e60d-4d3a-b674-39c0833f528d.webp",
                  aria: "عين جانبية بغطاء",
                  top: "40%",
                  right: "83%",
              },
              {
                  title: "حجرة تخزين سفلية",
                  desc: "دولاب تخزين بمساحة واسعة يخفي أسطوانة الغاز بالكامل داخله، يحافظ على ترتيب المكان ويعطي الشواية شكل احترافي ونظيف.",
                  img: "https://cdn.files.salla.network/homepage/1333909099/5726804b-84ab-48ab-a67c-d03a3dde4a51.webp",
                  aria: "حجرة تخزين سفلية",
                  top: "68%",
                  right: "32%",
              },
            
              
          ],
      },
       NDyNoG: {
          sectionId: "ge-section-NDyNoG",
          theme: "light",
          title: "استكشف مميزات شوايةالتدخين",
          intro: "اضغط على المؤشرات على الشواية لتتعرف على كل ميزة.",
          mainImage: "https://cdn.files.salla.network/homepage/1333909099/81ee85fd-b8c6-4648-947e-06b1d2c66212.webp",
          mainImageAlt: "شواية التدخين",
          features: [
              {
                  title: "شبكتين ستانلس ستيل بقطر 45 سم",
                  desc: "شبكتين فوق بعض من الستانلس ستيل المقاوم للحرارة والمانع للالتصاق، مساحة تكفي قطعتين بريسكت (5-7 كيلو للقطعة) أو 3-4 أرجل غنم كاملة.",
                  img: "https://cdn.files.salla.network/homepage/1333909099/02503313-6b75-4288-bff3-b429ef4ef986.webp",
                  aria: "شبكتين ستانلس ستيل بقطر 45 سم",
                  top: "24%",
                  right: "19%",
              },
              {
                  title: "وعاء مياه داخلي",
                  desc: "وعاء مخصص للمياه يحافظ على رطوبة السموكر من الداخل — عشان اللحم يطلع طري وما يجف أثناء التدخين الطويل.",
                  img: "https://cdn.files.salla.network/homepage/1333909099/4c8a01f8-9dea-4d1d-971b-1ab20c736c07.webp",
                  aria: "وعاء مياه داخلي",
                  top: "46%",
                  right: "36%",
              },
              {
                  title: "حجرة الفحم والحطب",
                  desc: "حجرة سفلية واسعة تحط فيها الفحم أو خشب التدخين بسهولة، مع فتحات تهوية تتحكم من خلالها بكمية الهواء الداخل — ترفع الحرارة أو تنزلها بدون ما تفتح الغطاء.",
                  img: "https://cdn.files.salla.network/homepage/1333909099/e6e4d6d6-1187-4355-ab18-3c4aeabd07e6.webp",
                  aria: "حجرة الفحم والحطب",
                  top: "78%",
                  right: "44%",
              },
              {
                  title: "مقياس حرارة مدمج",
                  desc: "مقياس حرارة على الغطاء يعطيك قراءة دقيقة للحرارة الداخلية — تتابع التدخين بدون ما تفتح وتخسر الدخان والحرارة.",
                  img: "https://cdn.files.salla.network/homepage/1333909099/9c1cc569-8ff0-4a8e-8ce2-78044bc643be.webp",
                  aria: "مقياس حرارة مدمج",
                  top: "11%",
                  right: "42%",
              },   
              
          ],
      },
    
    };
  
    function escapeHtml(str) {
      return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  
    function getCurrentProductEntry() {
      const url = window.location.pathname + window.location.search;
      for (const [productId, config] of Object.entries(PRODUCT_SECTIONS)) {
        if (url.includes(productId)) return { productId, config };
      }
      return null;
    }
  
    function preloadImages(config) {
      [config.mainImage, ...config.features.map((f) => f.img)].forEach((src) => {
        if (!src) return;
        const img = new Image();
        img.src = src;
      });
    }
  
    function cleanupOtherSections(currentSectionId) {
      document.querySelectorAll(`.${SECTION_CLASS}`).forEach((el) => {
        if (el.id !== currentSectionId) el.remove();
      });
    }
  
    function sectionHTML(productId, config) {
      const sectionId = config.sectionId || `ge-section-${productId}`;
      const theme = config.theme === "dark" ? "theme-dark" : "theme-light";
      const first = config.features[0];
  
      const hotspots = config.features
        .map((f, i) => {
          const label = f.aria || f.title || `ميزة ${i + 1}`;
          return `
            <button
              class="ge-hotspot"
              data-index="${i}"
              aria-label="${escapeHtml(label)}"
              aria-pressed="false"
              style="--hs-top:${f.top}; --hs-right:${f.right};"
            >
              ${i + 1}
            </button>
          `;
        })
        .join("");
  
      const pills = config.features
        .map(
          (_, i) => `
            <button class="ge-nav-pill" data-index="${i}" aria-label="الميزة رقم ${i + 1}">
              ${i + 1}
            </button>
          `
        )
        .join("");
  
      return `
        <section
          id="${escapeHtml(sectionId)}"
          class="${SECTION_CLASS} ${theme}"
          data-product-id="${escapeHtml(productId)}"
          aria-label="${escapeHtml(config.title)}"
        >
          <header class="ge-header">
            <h2>${escapeHtml(config.title)}</h2>
            <p>${escapeHtml(config.intro)}</p>
          </header>
  
          <div class="ge-content">
            <div class="ge-image-wrap">
              <img src="${config.mainImage}" alt="${escapeHtml(config.mainImageAlt || config.title)}">
              ${hotspots}
            </div>
  
            <div class="ge-details">
              <div class="ge-details-image">
                <img class="ge-details-img" src="${first.img}" alt="${escapeHtml(first.title)}">
              </div>
  
              <h3 class="ge-details-title">${escapeHtml(first.title)}</h3>
              <p class="ge-details-desc">${escapeHtml(first.desc)}</p>
  
              <div class="ge-nav-pills">
                ${pills}
              </div>
            </div>
          </div>
        </section>
      `.trim();
    }
  
    function wireUp(section, features) {
      const hotspots = Array.from(section.querySelectorAll(".ge-hotspot"));
      const pills = Array.from(section.querySelectorAll(".ge-nav-pill"));
      const imgEl = section.querySelector(".ge-details-img");
      const titleEl = section.querySelector(".ge-details-title");
      const descEl = section.querySelector(".ge-details-desc");
  
      function setActive(idx, fromUser = false) {
        const feat = features[idx];
        if (!feat) return;
  
        if (fromUser) {
          const btn = section.querySelector(`.ge-hotspot[data-index="${idx}"]`);
          if (btn) {
            btn.classList.remove("clicked");
            void btn.offsetWidth;
            btn.classList.add("clicked");
            setTimeout(() => btn.classList.remove("clicked"), 650);
          }
        }
  
        imgEl?.classList.add("changing");
        titleEl?.classList.add("changing");
        descEl?.classList.add("changing");
  
        setTimeout(() => {
          if (imgEl) {
            imgEl.src = feat.img;
            imgEl.alt = feat.title || "صورة الميزة";
          }
          if (titleEl) titleEl.textContent = feat.title;
          if (descEl) descEl.textContent = feat.desc;
  
          imgEl?.classList.remove("changing");
          titleEl?.classList.remove("changing");
          descEl?.classList.remove("changing");
        }, 180);
  
        hotspots.forEach((btn) => {
          const isActive = Number(btn.dataset.index) === idx;
          btn.classList.toggle("active", isActive);
          btn.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
  
        pills.forEach((btn) => {
          btn.classList.toggle("active", Number(btn.dataset.index) === idx);
        });
      }
  
      hotspots.forEach((btn) => {
        btn.addEventListener("click", () => setActive(Number(btn.dataset.index), true));
      });
  
      pills.forEach((btn) => {
        btn.addEventListener("click", () => setActive(Number(btn.dataset.index), true));
      });
  
      setActive(0);
  
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              section.classList.add("ge-visible");
              io.unobserve(section);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -5%" }
      );
  
      io.observe(section);
    }
  
    function mountOnce() {
      const entry = getCurrentProductEntry();
      if (!entry) return true;
  
      const { productId, config } = entry;
      const sectionId = config.sectionId || `ge-section-${productId}`;
  
      cleanupOtherSections(sectionId);
  
      if (document.getElementById(sectionId)) return true;
  
      const details = document.querySelector(BEFORE_SEL);
      if (!details) return false;
  
      const wrap = document.createElement("div");
      wrap.innerHTML = sectionHTML(productId, config);
      const node = wrap.firstElementChild;
  
      details.prepend(node); // top of description
  
      wireUp(node, config.features);
      preloadImages(config);
      return true;
    }
  
    function boot() {
      if (mountOnce()) return;
  
      const mo = new MutationObserver(() => {
        if (mountOnce()) mo.disconnect();
      });
  
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
  
    document.addEventListener("salla:pageUpdated", () => setTimeout(mountOnce, 300));
    document.addEventListener("salla::product.single.initialized", () => setTimeout(mountOnce, 200));
  })();
  
  (() => {
    const TARGET_PRODUCT_ID = "jobqqX";
    const SECTION_ID = "bento-features";
    const DESCRIPTION_SEL = "#details_table";
    const AFTER_SECTION_ID = "ge-section-jobqqX";
  
    const ASSETS = {
      grillLines:
        "https://cdn.files.salla.network/homepage/1333909099/92567fa7-ca85-42b9-82a6-33527c97783b.webp",
      ashAnimated:
        "https://cdn.files.salla.network/homepage/1333909099/1c3be367-1392-4931-a52a-0ff4bf03e2c3.gif",
      smokerGif:
        "https://cdn.files.salla.network/homepage/1333909099/2a7f2444-c2dc-4fd7-b65a-6c17641da961.gif",
      tempIcon:
        "https://cdn.files.salla.network/homepage/1333909099/80c42f91-97c1-43dd-9306-08d1b2a8e2bd.webp",
      sideGif:
        "https://cdn.files.salla.network/homepage/1333909099/823b54be-9550-48d4-904e-8ba19f71b972.gif",
    };
  
    function isTargetProduct() {
      return (window.location.pathname + window.location.search).includes(TARGET_PRODUCT_ID);
    }
  
    function sectionHTML() {
      return `
        <section id="${SECTION_ID}" class="bento-product-${TARGET_PRODUCT_ID}" data-product-id="${TARGET_PRODUCT_ID}" aria-label="Bento Features">
          <header class="bento-header">
            <span class="bento-label">مزايا أكثر</span>
            <h2>ليش تختار شوايتنا؟</h2>
            <p>مهتمين بكل التفاصيل الي تعطيك افضل تجربة شواء</p>
          </header>
  
          <div class="bento-grid">
            <div class="bento-card card-large card-heat">
              <h3>تحكم بمستوى حرارة الشواية في ٥ درجات</h3>
  
              <div class="heat-image-container">
                <img src="${ASSETS.grillLines}" alt="شبك الشواية" class="heat-grill-image" loading="lazy" decoding="async">
                <div class="coal-glow" data-level="3"></div>
                <p class="heat-level-label">مستوى 3 – حرارة متوسطة</p>
              </div>
  
              <div class="heat-slider-container">
                <div class="heat-slider-steps" data-level="3">
                  <div class="heat-slider-track"></div>
                  <div class="heat-slider-fill"></div>
                  <button class="heat-step passed" data-level="1" type="button">1</button>
                  <button class="heat-step passed" data-level="2" type="button">2</button>
                  <button class="heat-step active" data-level="3" type="button">3</button>
                  <button class="heat-step" data-level="4" type="button">4</button>
                  <button class="heat-step" data-level="5" type="button">5</button>
                </div>
              </div>
            </div>
  
            <div class="bento-card card-media-bottom">
              <h3>درج تنظيف رماد سريع</h3>
              <img class="bento-card-media-bottom" src="${ASSETS.ashAnimated}" alt="درج تنظيف الرماد" loading="lazy" decoding="async">
            </div>
  
            <div class="bento-card card-media">
              <img class="bento-card-media-top" src="${ASSETS.smokerGif}" alt="شواية وسموكر" loading="lazy" decoding="async">
              <div class="bento-card-content">
                <h3>شواية وسموكر في نفس الوقت</h3>
              </div>
            </div>
  
            <div class="bento-card card-thermometer">
              <div class="thermometer-content">
                <h3>جهاز قياس حرارة مدمج</h3>
                <div class="temp-counter">
                  <span class="temp-number" data-target="350">0</span>
                  <span class="temp-unit">°C</span>
                </div>
              </div>
              <div class="thermometer-image">
                <img src="${ASSETS.tempIcon}" alt="جهاز قياس الحرارة" loading="lazy" decoding="async">
              </div>
            </div>
  
            <div class="bento-card card-side-by-side">
              <div class="card-side-text">
                <h3>فُتحات تهوية جانبية</h3>
              </div>
              <div class="card-side-media">
                <img src="${ASSETS.sideGif}" alt="فُتحات تهوية جانبية" class="card-side-gif" loading="lazy" decoding="async">
              </div>
            </div>
          </div>
        </section>
      `.trim();
    }
  
    function mountOnce() {
      if (!isTargetProduct()) return true;
  
      const details = document.querySelector(DESCRIPTION_SEL);
      if (!details) return false;
  
      const existing = document.getElementById(SECTION_ID);
      if (existing) {
        if (details.contains(existing)) return true;
        existing.remove();
      }
  
      const wrap = document.createElement("div");
      wrap.innerHTML = sectionHTML();
      const node = wrap.firstElementChild;
  
      const afterSection = details.querySelector(`#${AFTER_SECTION_ID}`);
      if (afterSection) {
        afterSection.insertAdjacentElement("afterend", node);
      } else {
        details.appendChild(node);
      }
  
      wireUp(node);
      return true;
    }
  
    function wireUp(section) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              section.classList.add("bento-visible");
              io.unobserve(section);
            }
          });
        },
        { threshold: 0.15 }
      );
      io.observe(section);
  
      const heatLabels = {
        1: "مستوى 1 – نار هادئة",
        2: "مستوى 2 – شوي خفيف",
        3: "مستوى 3 – حرارة متوسطة",
        4: "مستوى 4 – حرارة عالية",
        5: "مستوى 5 – تسوية سريعة وتشويح قوي",
      };
  
      const coalGlow = section.querySelector(".coal-glow");
      const sliderSteps = section.querySelector(".heat-slider-steps");
      const label = section.querySelector(".heat-level-label");
      const steps = Array.from(section.querySelectorAll(".heat-step"));
  
      function setHeatLevel(level) {
        if (coalGlow) coalGlow.setAttribute("data-level", String(level));
        if (sliderSteps) sliderSteps.setAttribute("data-level", String(level));
        if (label) label.textContent = heatLabels[level] || label.textContent;
  
        steps.forEach((btn) => {
          const l = Number(btn.dataset.level);
          btn.classList.toggle("active", l === level);
          btn.classList.toggle("passed", l < level);
        });
      }
  
      steps.forEach((btn) => {
        btn.addEventListener("click", () => {
          const level = Number(btn.dataset.level);
          if (level >= 1 && level <= 5) setHeatLevel(level);
        });
      });
  
      const tempEl = section.querySelector(".temp-number");
      if (tempEl) {
        let started = false;
        let currentTemp = 0;
        const base = Number(tempEl.dataset.target || 350);
        const range = 30;
  
        function rampToBase() {
          const start = performance.now();
          const duration = 2000;
  
          const tick = (t) => {
            const p = Math.min((t - start) / duration, 1);
            const easeOut = 1 - Math.pow(1 - p, 3);
            currentTemp = Math.floor(easeOut * base);
            tempEl.textContent = String(currentTemp);
            if (p < 1) requestAnimationFrame(tick);
            else fluctuate();
          };
  
          requestAnimationFrame(tick);
        }
  
        function fluctuate() {
          let goingUp = false;
  
          const loop = () => {
            const target = goingUp
              ? base + Math.random() * range
              : base - Math.random() * range;
  
            const from = currentTemp;
            const start = performance.now();
            const duration = 1500 + Math.random() * 1000;
  
            const tick = (t) => {
              const p = Math.min((t - start) / duration, 1);
              const ease = 0.5 - Math.cos(p * Math.PI) / 2;
              currentTemp = Math.floor(from + (target - from) * ease);
              tempEl.textContent = String(currentTemp);
  
              if (p < 1) requestAnimationFrame(tick);
              else {
                goingUp = !goingUp;
                setTimeout(loop, 500 + Math.random() * 500);
              }
            };
  
            requestAnimationFrame(tick);
          };
  
          loop();
        }
  
        const startTempIO = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting && !started) {
                started = true;
                setTimeout(rampToBase, 500);
                startTempIO.unobserve(section);
              }
            });
          },
          { threshold: 0.2 }
        );
  
        startTempIO.observe(section);
      }
  
      setHeatLevel(3);
    }
  
    function boot() {
      if (mountOnce()) return;
  
      const mo = new MutationObserver(() => {
        if (mountOnce()) mo.disconnect();
      });
  
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
  
    document.addEventListener("salla:pageUpdated", () => {
      setTimeout(mountOnce, 120);
    });
  
    document.addEventListener("salla::product.single.initialized", () => {
      setTimeout(mountOnce, 120);
    });
  })();
  (() => {
    const TARGET_PRODUCT_ID = "OqRXoEK";
    const SECTION_ID = "bento-features";
    const VERSION = "v2-dual-handles-fixed-direction-2026-01-04";
    const DESCRIPTION_SEL = "#details_table";
    const AFTER_SECTION_ID = "ge-section-OqRXoEK";
  
    const ASSETS = {
      grillLines:
        "https://cdn.files.salla.network/homepage/1333909099/4155606e-0b0c-4a62-a351-15d6a696a7d9.webp",
      ashAnimated:
        "https://cdn.files.salla.network/homepage/1333909099/1c3be367-1392-4931-a52a-0ff4bf03e2c3.gif",
      smokerGif:
        "https://cdn.files.salla.network/homepage/1333909099/4b5b78a8-7322-4b18-a7a9-79865142d101.gif",
      tempIcon:
        "https://cdn.files.salla.network/homepage/1333909099/80c42f91-97c1-43dd-9306-08d1b2a8e2bd.webp",
      sideGif:
        "https://cdn.files.salla.network/homepage/1333909099/823b54be-9550-48d4-904e-8ba19f71b972.gif",
    };
  
    function isTargetProduct() {
      return (window.location.pathname + window.location.search).includes(TARGET_PRODUCT_ID);
    }
  
    function sectionHTML() {
      return `
        <section id="${SECTION_ID}" class="bento bento-product-${TARGET_PRODUCT_ID}" data-salla-inject="1" data-bento-version="${VERSION}" data-product-id="${TARGET_PRODUCT_ID}" aria-label="Bento Features" dir="rtl">
          <header class="bento-header">
            <span class="bento-label">مزايا أكثر</span>
            <h2>ليش تختار شوايتنا؟</h2>
            <p>مهتمين بكل التفاصيل الي تعطيك افضل تجربة شواء</p>
          </header>
  
          <div class="bento-grid">
            <div class="bento-card card-large card-heat">
              <h3>صاجتين فحم مزدوجة لشواء وجبتين في نفس الوقت</h3>
              <p class="heat-subtext">صاجتين فحم منفصلتين بمقابض رفع مستقلة – ارفع أو أنزل كل جهة على حدة</p>
  
              <div class="heat-image-container">
                <img src="${ASSETS.grillLines}" alt="شبك الشواية" class="heat-grill-image" loading="lazy" decoding="async">
  
                <div class="coal-glow coal-glow-left" aria-hidden="true"></div>
                <div class="coal-glow coal-glow-right" aria-hidden="true"></div>
  
                <div class="heat-labels-overlay" aria-hidden="true">
                  <div class="heat-label heat-label-right">
                    يمين
                    <span class="heat-label-value" data-side="right">متوسط</span>
                  </div>
                  <div class="heat-label heat-label-left">
                    يسار
                    <span class="heat-label-value" data-side="left">متوسط</span>
                  </div>
                </div>
              </div>
  
              <div class="dual-controls-container">
                <div class="handle-control" data-side="right">
                  <div class="handle-header">
                    <div class="handle-title">المقبض اليمين</div>
                    <span class="handle-value" data-side="right">متوسط</span>
                  </div>
                  <div class="handle-slider-wrap">
                    <span class="slider-label">قريب</span>
                    <input type="range" class="handle-slider" data-side="right" min="0" max="100" value="50">
                    <span class="slider-label">بعيد</span>
                  </div>
                </div>
  
                <div class="handle-control" data-side="left">
                  <div class="handle-header">
                    <div class="handle-title">المقبض اليسار</div>
                    <span class="handle-value" data-side="left">متوسط</span>
                  </div>
                  <div class="handle-slider-wrap">
                    <span class="slider-label">قريب</span>
                    <input type="range" class="handle-slider" data-side="left" min="0" max="100" value="50">
                    <span class="slider-label">بعيد</span>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="bento-card card-media-bottom">
              <h3>درج تنظيف رماد سريع</h3>
              <img class="bento-card-media-bottom" src="${ASSETS.ashAnimated}" alt="درج تنظيف الرماد" loading="lazy" decoding="async">
            </div>
  
            <div class="bento-card card-media">
              <img class="bento-card-media-top" src="${ASSETS.smokerGif}" alt="شواية وسموكر" loading="lazy" decoding="async">
              <div class="bento-card-content">
                <h3>رفوف جانبية قابلة للسفط</h3>
              </div>
            </div>
  
            <div class="bento-card card-thermometer">
              <div class="thermometer-content">
                <h3>جهاز قياس حرارة مدمج</h3>
                <div class="temp-counter">
                  <span class="temp-number" data-target="350">0</span>
                  <span class="temp-unit">°C</span>
                </div>
              </div>
              <div class="thermometer-image">
                <img src="${ASSETS.tempIcon}" alt="جهاز قياس الحرارة" loading="lazy" decoding="async">
              </div>
            </div>
  
            <div class="bento-card card-side-by-side">
              <div class="card-side-text">
                <h3>فُتحات تهوية جانبية</h3>
              </div>
              <div class="card-side-media">
                <img src="${ASSETS.sideGif}" alt="فُتحات تهوية جانبية" class="card-side-gif" loading="lazy" decoding="async">
              </div>
            </div>
          </div>
        </section>
      `.trim();
    }
  
    function upsert() {
      if (!isTargetProduct()) return true;
  
      const details = document.querySelector(DESCRIPTION_SEL);
      if (!details) return false;
  
      const existing = document.getElementById(SECTION_ID);
      if (existing && existing.getAttribute("data-bento-version") === VERSION && details.contains(existing)) {
        return true;
      }
  
      const wrap = document.createElement("div");
      wrap.innerHTML = sectionHTML();
      const node = wrap.firstElementChild;
  
      if (existing) {
        existing.remove();
      }
  
      const afterSection = details.querySelector(`#${AFTER_SECTION_ID}`);
      if (afterSection) {
        afterSection.insertAdjacentElement("afterend", node);
      } else {
        details.appendChild(node);
      }
  
      wireUp(node);
      return true;
    }
  
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  
    function wireUp(section) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            section.classList.add("bento-visible");
            io.unobserve(section);
          });
        },
        { threshold: 0.15 }
      );
      io.observe(section);
  
      const glowLeft = section.querySelector(".coal-glow-left");
      const glowRight = section.querySelector(".coal-glow-right");
  
      const valueLeft = section.querySelector('.handle-value[data-side="left"]');
      const valueRight = section.querySelector('.handle-value[data-side="right"]');
  
      const labelLeftValue = section.querySelector('.heat-label-value[data-side="left"]');
      const labelRightValue = section.querySelector('.heat-label-value[data-side="right"]');
  
      const sliders = Array.from(section.querySelectorAll(".handle-slider"));
  
      function getHeatLabelFromValue(v) {
        if (v <= 20) return "بعيد";
        if (v <= 40) return "منخفض";
        if (v <= 60) return "متوسط";
        if (v <= 80) return "مرتفع";
        return "قريب جداً";
      }
  
      function getGlowStylesByIntensity(intensity) {
        const i = clamp(intensity, 0, 1);
  
        const baseSize = 35;
        const maxSize = 90;
        const size = baseSize + (maxSize - baseSize) * i;
  
        let glowColor, outerGlow, boxShadow, pulseOpacity;
  
        if (i <= 0.2) {
          glowColor = "radial-gradient(circle, #6b3a1a 0%, #3a1f0f 50%, transparent 100%)";
          outerGlow = "radial-gradient(circle, rgba(107, 58, 26, 0.15) 0%, transparent 70%)";
          boxShadow = `0 0 ${10 + i * 20}px rgba(107, 58, 26, 0.3)`;
          pulseOpacity = 0.1;
        } else if (i <= 0.4) {
          glowColor = "radial-gradient(circle, #8b4513 0%, #5a2d0a 50%, transparent 100%)";
          outerGlow = "radial-gradient(circle, rgba(139, 69, 19, 0.25) 0%, transparent 70%)";
          boxShadow = `0 0 ${15 + i * 25}px rgba(139, 69, 19, 0.4)`;
          pulseOpacity = 0.2;
        } else if (i <= 0.6) {
          glowColor = "radial-gradient(circle, #e64a19 0%, #bf360c 50%, transparent 100%)";
          outerGlow = "radial-gradient(circle, rgba(230, 74, 25, 0.35) 0%, transparent 70%)";
          boxShadow = `0 0 ${25 + i * 30}px rgba(230, 74, 25, 0.5)`;
          pulseOpacity = 0.4;
        } else if (i <= 0.8) {
          glowColor = "radial-gradient(circle, #ff6d00 0%, #e65100 50%, transparent 100%)";
          outerGlow = "radial-gradient(circle, rgba(255, 109, 0, 0.45) 0%, transparent 70%)";
          boxShadow = `0 0 ${40 + i * 35}px rgba(255, 109, 0, 0.6)`;
          pulseOpacity = 0.6;
        } else {
          glowColor =
            "radial-gradient(circle, #ffab00 0%, #ff6d00 40%, #e65100 70%, transparent 100%)";
          outerGlow = "radial-gradient(circle, rgba(255, 171, 0, 0.6) 0%, transparent 70%)";
          boxShadow = `0 0 ${60 + i * 40}px rgba(255, 171, 0, 0.7)`;
          pulseOpacity = 0.85;
        }
  
        return { size, glowColor, outerGlow, boxShadow, pulseOpacity };
      }
  
      function applyGlow(glowEl, sliderValue) {
        if (!glowEl) return;
        const v = clamp(Number(sliderValue) || 0, 0, 100);
        const intensity = v / 100;
  
        const styles = getGlowStylesByIntensity(intensity);
  
        glowEl.style.width = `${styles.size}px`;
        glowEl.style.height = `${styles.size}px`;
        glowEl.style.setProperty("--glow-color", styles.glowColor);
        glowEl.style.setProperty("--glow-outer", styles.outerGlow);
        glowEl.style.setProperty("--glow-pulse-opacity", styles.pulseOpacity);
        glowEl.style.boxShadow = styles.boxShadow;
      }
  
      function updateSide(side, sliderValue) {
        const v = clamp(Number(sliderValue) || 0, 0, 100);
        const label = getHeatLabelFromValue(v);
  
        if (side === "left") {
          if (valueLeft) valueLeft.textContent = label;
          if (labelLeftValue) labelLeftValue.textContent = label;
          applyGlow(glowLeft, v);
        } else {
          if (valueRight) valueRight.textContent = label;
          if (labelRightValue) labelRightValue.textContent = label;
          applyGlow(glowRight, v);
        }
      }
  
      sliders.forEach((s) => {
        s.setAttribute("dir", "ltr");
        s.style.direction = "ltr";
  
        const side = s.getAttribute("data-side");
        const onInput = () => updateSide(side, s.value);
  
        s.addEventListener("input", onInput, { passive: true });
        onInput();
      });
  
      const tempEl = section.querySelector(".temp-number");
      if (tempEl) {
        let started = false;
        let currentTemp = 0;
        const base = Number(tempEl.dataset.target || 350);
        const range = 30;
  
        function rampToBase() {
          const start = performance.now();
          const duration = 2000;
  
          const tick = (t) => {
            const p = Math.min((t - start) / duration, 1);
            const easeOut = 1 - Math.pow(1 - p, 3);
            currentTemp = Math.floor(easeOut * base);
            tempEl.textContent = String(currentTemp);
  
            if (p < 1) requestAnimationFrame(tick);
            else fluctuate();
          };
  
          requestAnimationFrame(tick);
        }
  
        function fluctuate() {
          let goingUp = false;
  
          const loop = () => {
            const target = goingUp
              ? base + Math.random() * range
              : base - Math.random() * range;
  
            const from = currentTemp;
            const start = performance.now();
            const duration = 1500 + Math.random() * 1000;
  
            const tick = (t) => {
              const p = Math.min((t - start) / duration, 1);
              const ease = 0.5 - Math.cos(p * Math.PI) / 2;
              currentTemp = Math.floor(from + (target - from) * ease);
              tempEl.textContent = String(currentTemp);
  
              if (p < 1) requestAnimationFrame(tick);
              else {
                goingUp = !goingUp;
                setTimeout(loop, 500 + Math.random() * 500);
              }
            };
  
            requestAnimationFrame(tick);
          };
  
          loop();
        }
  
        const tempIO = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (!e.isIntersecting || started) return;
              started = true;
              setTimeout(rampToBase, 600);
              tempIO.unobserve(section);
            });
          },
          { threshold: 0.2 }
        );
  
        tempIO.observe(section);
      }
    }
  
    function boot() {
      if (upsert()) return;
      const mo = new MutationObserver(() => {
        if (upsert()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
  
    document.addEventListener("salla:pageUpdated", () => {
      setTimeout(upsert, 120);
    });
  
    document.addEventListener("salla::product.single.initialized", () => {
      setTimeout(upsert, 120);
    });
  })();
  
  
  
  (() => {
    const LINK = "https://bckyrdbbq.com/p/gWywE";
    const HOTZONE_HEIGHT = "24%";
    const IMAGES = [
      "https://cdn.salla.sa/xQmPP/MCzmqzXXSj6gU5FIVRL944uu84TQlDbfzQiUDXtE.webp",
      "https://cdn.salla.sa/xQmPP/products/CSbTgQH0xFGq8kdq9GnsZSq6Nw1zmUlg0C1y35Da.webp",
    ];
  
    function mount() {
      let allMounted = true;
      IMAGES.forEach((src) => {
        const img = document.querySelector(`img[src="${src}"]`);
        if (!img) { allMounted = false; return; }
        const parent = img.parentElement;
        if (parent.querySelector(".bckyard-hotzone")) return;
        parent.style.position = "relative";
        parent.style.display = "inline-block";
        const hotzone = document.createElement("a");
        hotzone.href = LINK;
        hotzone.className = "bckyard-hotzone";
        hotzone.style.cssText = `
          position:absolute;
          bottom:0;
          right:0;
          width:30%;
          height:${HOTZONE_HEIGHT};
          z-index:10;
          cursor:pointer;
        `;
        parent.appendChild(hotzone);
      });
      return allMounted;
    }
  
    function boot() {
      if (mount()) return;
      const mo = new MutationObserver(() => {
        if (mount()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
    document.addEventListener("salla:pageUpdated", boot);
  })();