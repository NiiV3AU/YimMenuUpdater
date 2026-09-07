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
      DL_TEXT: "#github-downloads",
      DL_BADGE: "#github-downloads-badge",
      DL_BTN: "#download-btn-main",
    },
    ICONS = {
      sun: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="theme-toggle-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>',
      moon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="theme-toggle-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" /></svg>',
      motion:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="animation-toggle-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" /></svg>',
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
            }            ));
      })(),
      (function () {
        $$(".lang-bar-item").forEach((link) => {
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
      (function () {
        const banner = $("#cookie-consent-banner"),
          acceptBtn = $("#cookie-accept-btn");
        banner &&
          !localStorage.getItem(CONFIG_KEYS.CONSENT) &&
          setTimeout(() => banner.classList.add("is-visible"), 500);
        acceptBtn &&
          acceptBtn.addEventListener("click", () => {
            localStorage.setItem(CONFIG_KEYS.CONSENT, "true"),
              banner.classList.remove("is-visible");
          });
      })(),
      (function () {
        const buttons = $$(".btn");
        if (!buttons.length) return;
        const overshoot = 60,
          applyShimmer = (btn, w) => {
            const endX = w + overshoot,
              duration = ((w + 120 + 2 * overshoot) / 420).toFixed(3);
            btn.style.setProperty("--shim-end-x", `${endX}px`),
              btn.style.setProperty("--shim-dur", `${duration}s`);
          },
          measureAndApply = (els) => {
            const widths = els.map((el) => el.offsetWidth);
            els.forEach((el, i) => applyShimmer(el, widths[i]));
          };
        if ("ResizeObserver" in window) {
          const ro = new ResizeObserver((entries) => {
            measureAndApply(entries.map((entry) => entry.target));
          });
          buttons.forEach((btn) => ro.observe(btn));
        } else {
          const all = Array.from(buttons);
          window.addEventListener("resize", () => measureAndApply(all)),
            measureAndApply(all);
        }
      })(),
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
      (function () {
        const clean = () =>
            history.replaceState(null, "", location.pathname + location.search),
          onOverlay = () => {
            const el =
              location.hash.length > 1
                ? document.getElementById(location.hash.slice(1))
                : null;
            return el && el.classList.contains("lightbox-overlay");
          };
        document.addEventListener("click", (e) => {
          const link = e.target.closest('a[href^="#"]');
          if (!link || link.closest(".lightbox-overlay")) return;
          const href = link.getAttribute("href"),
            target =
              href.length > 1 ? document.getElementById(href.slice(1)) : null;
          if (target && target.classList.contains("lightbox-overlay")) return;
          e.preventDefault();
          target ? target.scrollIntoView() : window.scrollTo({ top: 0 });
          clean();
        });
        window.addEventListener("hashchange", () => {
          onOverlay() || clean();
        });
      })();
      (function () {
        const toggle = $(".lang-toggle"),
          bar = $("#lang-bar");
        if (!toggle || !bar) return;
        const setOpen = (open) =>
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.addEventListener("click", () => {
          setOpen(toggle.getAttribute("aria-expanded") !== "true");
        });
        document.addEventListener("click", (e) => {
          toggle.contains(e.target) ||
            bar.contains(e.target) ||
            setOpen(false);
        });
        document.addEventListener("keydown", (e) => {
          "Escape" === e.key &&
            "true" === toggle.getAttribute("aria-expanded") &&
            (setOpen(false), toggle.focus());
        });
      })();
  });
})();
