/* Hanna Megaouel — Portfolio interactions
   Preloader, custom cursor, Lenis smooth scroll, GSAP scroll reveals,
   parallax hero, magnetic buttons, marquee, counters, nav scrollspy. */

document.documentElement.classList.remove("no-js");

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const isTouch = matchMedia("(hover: none), (pointer: coarse)").matches;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

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

/* ---------- Lenis smooth scroll ---------- */
let lenis = null;
if (!reduceMotion && window.Lenis) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on("scroll", () => {
    updateProgress();
    if (window.ScrollTrigger) ScrollTrigger.update();
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/* ---------- Custom cursor ---------- */
if (!isTouch) {
  document.body.classList.add("has-custom-cursor");
  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  document.body.append(dot, ring);

  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });
  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll("a, button, [data-magnetic]").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
    el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
  });
}

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
