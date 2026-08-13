/* Hanna Megaouel — Portfolio interactions
   Preloader, GSAP scroll reveals, parallax hero, magnetic buttons,
   marquee, counters, nav scrollspy, case-study modals. Scrolling itself
   is left entirely to the browser (no smooth-scroll library) so it's
   always native and responsive on trackpads. */

document.documentElement.classList.remove("no-js");

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const isTouch = matchMedia("(hover: none), (pointer: coarse)").matches;

/* ---------- Preloader ---------- */
const preloader = document.querySelector(".preloader");
function hidePreloader() {
  if (!preloader || preloader.classList.contains("is-hidden")) return;
  preloader.classList.add("is-hidden");
}
window.addEventListener("load", () => setTimeout(hidePreloader, 350));
setTimeout(hidePreloader, 2500); /* safety net if a resource hangs (slow network, blocked CDN) */

/* ---------- Mobile nav ---------- */
const navToggle = document.getElementById("navToggle");
const navList = document.getElementById("navList");
if (navToggle && navList) {
  navToggle.addEventListener("click", () => {
    const isOpen = navList.classList.toggle("is-open");
    navToggle.classList.toggle("is-active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  navList.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navList.classList.remove("is-open");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- Active nav link ---------- */
(() => {
  const current = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".site-nav a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      a.classList.add("is-active");
    }
  });
})();

/* ---------- Scroll progress bar ---------- */
const progressBar = document.querySelector(".scroll-progress");
function updateProgress() {
  if (!progressBar) return;
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const max = h.scrollHeight - h.clientHeight;
  progressBar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + "%";
}
document.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

/* ---------- Magnetic buttons ---------- */
if (!isTouch) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });
}

/* ---------- GSAP scroll reveals ---------- */
if (window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  const groups = document.querySelectorAll("[data-reveal-group]");
  groups.forEach((group) => {
    const items = group.querySelectorAll("[data-reveal]");
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: group, start: "top 82%" },
    });
  });

  document.querySelectorAll("[data-reveal]:not([data-reveal-group] [data-reveal])").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  /* Hero parallax */
  const heroImg = document.querySelector(".hero-frame img");
  if (heroImg) {
    gsap.to(heroImg, {
      yPercent: -10,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  /* Animated counters */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const raw = el.getAttribute("data-count");
    const target = parseFloat(raw);
    const suffix = raw.replace(/^-?[\d.]+/, "");
    const counter = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          val: target,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = (Number.isInteger(target) ? Math.round(counter.val) : counter.val.toFixed(1)) + suffix;
          },
        });
      },
    });
  });
} else {
  /* Fallback: plain IntersectionObserver reveal + counters if GSAP fails to load */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const raw = el.getAttribute("data-count");
    const target = parseFloat(raw);
    const suffix = raw.replace(/^-?[\d.]+/, "");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          const start = performance.now();
          const duration = 1000;
          (function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const val = target * (1 - Math.pow(1 - p, 3));
            el.textContent = (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          })(start);
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
  });

  const targets = document.querySelectorAll("[data-reveal]");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.transition = "opacity 0.7s ease, transform 0.7s ease";
          entry.target.style.opacity = 1;
          entry.target.style.transform = "none";
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  targets.forEach((el) => io.observe(el));
}

/* ---------- Case-study horizontal scroll ---------- */
document.querySelectorAll("[data-case-scroll]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const track = btn.parentElement.querySelector(".case-scroll");
    if (!track) return;
    const card = track.querySelector(".case-card");
    const step = card ? card.getBoundingClientRect().width + 24 : 360;
    track.scrollBy({ left: step * Number(btn.getAttribute("data-case-scroll")), behavior: "smooth" });
  });
});

/* Prevent horizontally-scrollable card rows from hijacking vertical page scroll
   (browsers redirect vertical wheel input to the only available scroll axis
   when an element only overflows horizontally). */
document.querySelectorAll(".case-scroll").forEach((track) => {
  track.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        window.scrollBy(0, e.deltaY);
      }
    },
    { passive: false }
  );
});

/* ---------- Case-study modals ---------- */
const caseCards = document.querySelectorAll("[data-case]");
if (caseCards.length) {
  const openModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
  };
  const closeModal = (modal) => {
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
  };

  caseCards.forEach((card) => {
    card.addEventListener("click", () => openModal(card.getAttribute("data-case")));
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(card.getAttribute("data-case"));
      }
    });
  });

  document.querySelectorAll(".case-modal-overlay").forEach((overlay) => {
    overlay.querySelector(".case-modal-close")?.addEventListener("click", () => closeModal(overlay));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".case-modal-overlay.is-open").forEach(closeModal);
    }
  });
}
