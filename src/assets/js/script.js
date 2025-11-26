!(function () {
  const $ = (selector) => document.querySelector(selector),
    $$ = (selector) => document.querySelectorAll(selector),
    CONFIG_KEYS = {
      THEME: "theme",
      ANIMATION: "animations",
      CONSENT: "ymu_privacy_consent",
      DL_CACHE: "ymu_github_dl_data",
      SCROLL: "ymu_scroll_pos_restore",
    },
    CONFIG_GITHUB = { USER: "NiiV3AU", REPO: "YMU", CACHE_MINUTES: 5 },
    CONFIG_SELECTORS = {
      THEME_BTN: "#theme-toggle-btn",
      ANIM_BTN: "#animation-toggle-btn",
      LANG_BTN: "#lang-toggle-btn",
      LANG_OPTS: "#lang-options",
      LANG_LINKS: ".lang-options a",
      DL_TEXT: "#github-downloads",
      DL_BADGE: "#github-downloads-badge",
      DL_BTN: "#download-btn-main",
    },
    ICONS = {
      sun: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="theme-toggle-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="5" /><line x1="12" x2="12" y1="1" y2="3" /><line x1="12" x2="12" y1="21" y2="23" /><line x1="4.22" x2="5.64" y1="4.22" y2="5.64" /><line x1="18.36" x2="19.78" y1="18.36" y2="19.78" /><line x1="1" x2="3" y1="12" y2="12" /><line x1="21" x2="23" y1="12" y2="12" /><line x1="4.22" x2="5.64" y1="19.78" y2="18.36" /><line x1="18.36" x2="19.78" y1="5.64" y2="4.22" /></svg>',
      moon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="theme-toggle-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>',
      motion:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="animation-toggle-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>',
      noMotion:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  class="animation-toggle-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="10" x2="10" y1="15" y2="9" /><line x1="14" x2="14" y1="15" y2="9" /></svg>',
    };
  document.addEventListener("DOMContentLoaded", () => {
    !(function () {
      const savedPos = sessionStorage.getItem(CONFIG_KEYS.SCROLL);
      savedPos &&
        ((document.documentElement.style.scrollBehavior = "auto"),
        window.scrollTo(0, parseInt(savedPos, 10)),
        sessionStorage.removeItem(CONFIG_KEYS.SCROLL),
        setTimeout(() => {
          document.documentElement.style.scrollBehavior = "";
        }, 0));
    })(),
      (function () {
        const btn = $(CONFIG_SELECTORS.THEME_BTN),
          applyTheme = (theme) => {
            document.documentElement.setAttribute("data-theme", theme),
              btn &&
                (btn.innerHTML = "dark" === theme ? ICONS.sun : ICONS.moon),
              localStorage.setItem(CONFIG_KEYS.THEME, theme),
              (function (theme) {
                $$("img.theme-img").forEach((img) => {
                  const targetSrc =
                    "light" === theme ? img.dataset.light : img.dataset.dark;
                  if (targetSrc && !img.src.endsWith(targetSrc)) {
                    img.classList.add("is-swap");
                    const loader = new Image();
                    (loader.onload = () => {
                      (img.src = targetSrc), img.classList.remove("is-swap");
                    }),
                      (loader.src = targetSrc);
                  }
                });
              })(theme);
          },
          saved = localStorage.getItem(CONFIG_KEYS.THEME),
          systemDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
        applyTheme(saved || (systemDark ? "dark" : "light")),
          btn &&
            btn.addEventListener("click", () => {
              const isDark =
                "dark" === document.documentElement.getAttribute("data-theme");
              applyTheme(isDark ? "light" : "dark");
            });
      })(),
      (function () {
        const btn = $(CONFIG_SELECTORS.ANIM_BTN),
          tooltip = $("#animation-tooltip"),
          applyAnim = (state) => {
            "disabled" === state
              ? (document.body.classList.add("animations-disabled"),
                btn && (btn.innerHTML = ICONS.motion))
              : (document.body.classList.remove("animations-disabled"),
                btn && (btn.innerHTML = ICONS.noMotion)),
              localStorage.setItem(CONFIG_KEYS.ANIMATION, state);
          },
          saved = localStorage.getItem(CONFIG_KEYS.ANIMATION),
          prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;
        applyAnim(saved || (prefersReduced ? "disabled" : "enabled")),
          btn &&
            (btn.addEventListener("click", () => {
              const isDisabled = document.body.classList.contains(
                "animations-disabled"
              );
              applyAnim(isDisabled ? "enabled" : "disabled");
            }),
            tooltip &&
              (btn.addEventListener("mouseenter", () =>
                tooltip.classList.add("is-visible")
              ),
              btn.addEventListener("mouseleave", () =>
                tooltip.classList.remove("is-visible")
              ),
              btn.addEventListener("focus", () =>
                tooltip.classList.add("is-visible")
              ),
              btn.addEventListener("blur", () =>
                tooltip.classList.remove("is-visible")
              )));
      })(),
      (function () {
        const langBtn = $(CONFIG_SELECTORS.LANG_BTN),
          langOpts = $(CONFIG_SELECTORS.LANG_OPTS);
        langBtn &&
          langOpts &&
          document.addEventListener("click", (e) => {
            const isInside =
              langBtn.contains(e.target) || langOpts.contains(e.target);
            if (langBtn.contains(e.target)) {
              const isVisible = langOpts.classList.toggle("is-visible");
              langBtn.setAttribute("aria-expanded", isVisible);
            } else
              isInside ||
                (langOpts.classList.remove("is-visible"),
                langBtn.setAttribute("aria-expanded", "false"));
          });
        $$(CONFIG_SELECTORS.LANG_LINKS).forEach((link) => {
          link.addEventListener("click", () => {
            sessionStorage.setItem(CONFIG_KEYS.SCROLL, window.scrollY);
          });
        });
        const menuToggle = $(".mobile-menu-toggle"),
          mainNav = $("#main-navigation");
        menuToggle &&
          mainNav &&
          (menuToggle.addEventListener("click", () => {
            const isOpen = mainNav.classList.toggle("is-open");
            menuToggle.classList.toggle("is-active"),
              menuToggle.setAttribute("aria-expanded", isOpen);
          }),
          mainNav.addEventListener("click", (e) => {
            "A" === e.target.tagName &&
              (mainNav.classList.remove("is-open"),
              menuToggle.classList.remove("is-active"),
              menuToggle.setAttribute("aria-expanded", "false"));
          }));
      })(),
      $$(".changelog-summary, .faq-question").forEach((header) => {
        header.addEventListener("click", () => {
          const isOpen = header.parentElement.classList.toggle("is-open");
          header.setAttribute("aria-expanded", isOpen);
        }),
          header.addEventListener("keydown", (e) => {
            ("Enter" !== e.key && " " !== e.key) ||
              (e.preventDefault(), header.click());
          });
      }),
      (function () {
        const overlay = $("#lightbox-overlay"),
          img = $("#lightbox-image"),
          closeBtn = $("#lightbox-close"),
          cards = $$(".look-card");
        if (!overlay || !img || !cards.length) return;
        const open = (src) => {
            (img.src = src),
              overlay.classList.add("is-visible"),
              closeBtn.focus();
          },
          close = () => overlay.classList.remove("is-visible");
        cards.forEach((card) => {
          card.addEventListener("click", () => {
            const targetImg = card.querySelector("img");
            targetImg && open(targetImg.src);
          }),
            card.addEventListener("keydown", (e) => {
              if ("Enter" === e.key || " " === e.key) {
                e.preventDefault();
                const targetImg = card.querySelector("img");
                targetImg && open(targetImg.src);
              }
            });
        }),
          closeBtn.addEventListener("click", close),
          overlay.addEventListener("click", (e) => {
            e.target === overlay && close();
          }),
          document.addEventListener("keydown", (e) => {
            "Escape" === e.key &&
              overlay.classList.contains("is-visible") &&
              close();
          });
      })(),
      (function () {
        const banner = $("#cookie-consent-banner"),
          acceptBtn = $("#cookie-accept-btn"),
          modalOverlay = $("#privacy-modal-overlay"),
          closeBtn = $("#privacy-modal-close"),
          triggerLinks = $$(
            "#privacy-policy-link, #cookie-banner-privacy-link"
          );
        banner &&
          !localStorage.getItem(CONFIG_KEYS.CONSENT) &&
          setTimeout(() => banner.classList.add("is-visible"), 500);
        acceptBtn &&
          acceptBtn.addEventListener("click", () => {
            localStorage.setItem(CONFIG_KEYS.CONSENT, "true"),
              banner.classList.remove("is-visible");
          });
        const toggleModal = (show) => {
          modalOverlay && modalOverlay.classList.toggle("is-visible", show);
        };
        triggerLinks.forEach((link) =>
          link.addEventListener("click", (e) => {
            e.preventDefault(), toggleModal(!0);
          })
        ),
          closeBtn && closeBtn.addEventListener("click", () => toggleModal(!1));
        modalOverlay &&
          modalOverlay.addEventListener("click", (e) => {
            e.target === modalOverlay && toggleModal(!1);
          });
      })(),
      (function () {
        const buttons = $$(".btn");
        if (!buttons.length) return;
        const calculateShimmer = (btn) => {
          const w = btn.offsetWidth,
            overshoot = 60,
            endX = w + overshoot,
            duration = ((w + 120 + 2 * overshoot) / 420).toFixed(3);
          btn.style.setProperty("--shim-end-x", `${endX}px`),
            btn.style.setProperty("--shim-dur", `${duration}s`);
        };
        if ("ResizeObserver" in window) {
          const ro = new ResizeObserver((entries) => {
            entries.forEach((entry) => calculateShimmer(entry.target));
          });
          buttons.forEach((btn) => ro.observe(btn));
        } else
          window.addEventListener("resize", () =>
            buttons.forEach(calculateShimmer)
          ),
            buttons.forEach(calculateShimmer);
      })(),
      $$(".logo-text-link, .logo-text-short, .logo-separator").forEach((el) => {
        el.classList.add("logo-shimmer"),
          el.setAttribute("data-shimmer", (el.textContent || "").trim());
      }),
      (async function () {
        const textEl = $(CONFIG_SELECTORS.DL_TEXT),
          badgeEl = $(CONFIG_SELECTORS.DL_BADGE),
          dlBtn = $(CONFIG_SELECTORS.DL_BTN);
        if (!textEl) return;
        let hasIncremented = !1;
        dlBtn &&
          dlBtn.addEventListener("click", () => {
            if (!hasIncremented) {
              const current = parseInt(
                textEl.textContent.replace(/[,.]/g, ""),
                10
              );
              isNaN(current) ||
                ((textEl.textContent = (current + 1).toLocaleString()),
                (hasIncremented = !0),
                textEl.classList.add("count-updated"));
            }
          });
        const showFallback = () => {
            textEl && (textEl.style.display = "none"),
              badgeEl &&
                ((badgeEl.src = `https://badgen.net/github/assets-dl/${CONFIG_GITHUB.USER}/${CONFIG_GITHUB.REPO}?label=&labelColor=black&color=black&cache=300`),
                (badgeEl.style.display = "inline"));
          },
          cached = sessionStorage.getItem(CONFIG_KEYS.DL_CACHE);
        if (cached)
          try {
            const data = JSON.parse(cached);
            if (
              (Date.now() - data.timestamp) / 6e4 <
              CONFIG_GITHUB.CACHE_MINUTES
            )
              return void (textEl.textContent = data.count.toLocaleString());
          } catch (e) {}
        try {
          const res = await fetch(
            `https://api.github.com/repos/${CONFIG_GITHUB.USER}/${CONFIG_GITHUB.REPO}/releases`
          );
          if (!res.ok) throw new Error("API Error");
          const releases = await res.json();
          let total = 0;
          Array.isArray(releases) &&
            (releases.forEach((r) => {
              r.assets && r.assets.forEach((a) => (total += a.download_count));
            }),
            (textEl.textContent = total.toLocaleString()),
            (textEl.style.display = "inline"),
            badgeEl && (badgeEl.style.display = "none"),
            sessionStorage.setItem(
              CONFIG_KEYS.DL_CACHE,
              JSON.stringify({ count: total, timestamp: Date.now() })
            ));
        } catch (e) {
          showFallback();
        }
      })(),
      (function () {
        const elements = $$(".fade-in"),
          observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                entry.target.classList.toggle(
                  "is-visible",
                  entry.isIntersecting
                );
              });
            },
            { threshold: 0.1 }
          );
        elements.forEach((el) => observer.observe(el));
      })(),
      $$('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          const href = this.getAttribute("href");
          if ("#" === href) return;
          const target = $(href);
          if (target) {
            e.preventDefault();
            const header = $(".header-sticky"),
              offset = header ? header.offsetHeight : 0,
              targetPos =
                target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: targetPos, behavior: "smooth" });
          }
        });
      });
  });
})();
