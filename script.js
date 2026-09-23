// ---------- LANGUAGE AUTO-DETECT (first visit only) ----------
/*
(function () {
  const KEY = "lang-pref";
  const stored = localStorage.getItem(KEY);
  const path = window.location.pathname;
  const onEnglishPage = path.startsWith("/en");

  // remember the page they're on if they explicitly click the toggle
  document.querySelectorAll(".lang a").forEach((a) => {
    a.addEventListener("click", () => {
      localStorage.setItem(KEY, a.textContent.trim().toLowerCase());
    });
  });

  // first visit, no preference saved → check browser language
  if (!stored) {
    const browser = (navigator.language || "nl").slice(0, 2).toLowerCase();
    if (browser !== "nl" && !onEnglishPage) {
      localStorage.setItem(KEY, "en");
      window.location.replace("/en/");
    }
    return;
  }

  // returning visitor: respect their last choice
  if (stored === "en" && !onEnglishPage) window.location.replace("/en/");
  if (stored === "nl" && onEnglishPage) window.location.replace("/");
})();
*/
// ---------- INTRO LOADER ----------
// ---------- WAVE LOADER ----------
(function () {
  const loader = document.getElementById("loader");

  // The inline script in <head> adds "skip-intro" to <html> (before this
  // page ever paints) whenever the animated intro shouldn't play: any
  // page other than the homepage, or a homepage visit that already
  // played it earlier this browser session. CSS already hides #loader
  // in that case, so here we just reveal the hero content (if present)
  // immediately and skip building/animating the wave entirely.
  if (document.documentElement.classList.contains("skip-intro")) {
    document.querySelector(".hero__title")?.classList.add("is-ready");
    document.querySelector(".hero__foot")?.classList.add("is-ready");
    document.querySelector(".hero__accent")?.classList.add("is-ready");
    return;
  }

  const svg = document.getElementById("loaderSvg");
  const wavePath = document.getElementById("loaderWavePath");
  const clipLeftPath = document.getElementById("clipLeftPath");
  const clipRightPath = document.getElementById("clipRightPath");

  const W = window.innerWidth;
  const H = window.innerHeight;

  // Size the SVG to the viewport so coordinates match
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);

  /* ---- WAVE MODEL ----
   * Sum of sine layers (harmonic synthesis) to mimic water surface.
   * Each layer: { wavelength (px), amplitude (px), phase (radians) }
   *
   * TUNING GUIDE:
   *   Calmer water → fewer layers, smaller amplitudes, larger wavelengths
   *   Choppier    → more layers, bigger amplitudes, smaller wavelengths
   *   Phase       → shifts each layer horizontally; spread values for
   *                 more interference, cluster them for gentler look
   */
  const WAVE_LAYERS = [
    { wavelength: H * 1.85, amplitude: 25, phase: 0.0 },
    { wavelength: H * 0.38, amplitude: 20, phase: 1.7 },
    { wavelength: H * 0.25, amplitude: 3, phase: 3.1 },
    /*{ wavelength: H * 0.09, amplitude: 6,  phase: 0.6 },*/
  ];

  function waveOffset(t) {
    // t: 0 (bottom) → 1 (top) — normalized position along screen height
    // Multiply by H so the sine argument is in pixel-space
    return WAVE_LAYERS.reduce((sum, layer) => {
      const angle =
        ((t * H) / layer.wavelength) * Math.PI * 2 + layer.phase;
      return sum + layer.amplitude * Math.sin(angle);
    }, 0);
  }

  /* ---- BUILD POINTS ---- */
  const SEGMENTS = 100; // resolution of the curve
  const TOP_PAD = 40; // extend beyond viewport top
  const BOT_PAD = 40; // extend beyond viewport bottom
  const totalH = H + TOP_PAD + BOT_PAD;
  const segH = totalH / SEGMENTS;
  const cx = W / 2;

  const pts = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const y = -TOP_PAD + i * segH;
    const x = cx + waveOffset(t);
    pts.push({ x, y });
  }

  /* ---- STROKE PATH (the visible white line) ----
   * Use polyline-style L commands for simplicity and reliability.
   * With 80 segments the curve is smooth enough.
   */
  let strokeD = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    strokeD += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
  }
  wavePath.setAttribute("d", strokeD);

  /* ---- CLIP PATHS (jagged panel edges = same wave) ----
   * LEFT: everything from x=0 to the wave
   * RIGHT: everything from the wave to x=W
   * Both share the same wave edge — perfectly complementary.
   */
  function buildClip(side) {
    const edgeX = side === "left" ? 0 : W;
    let d = `M ${edgeX} ${(-TOP_PAD).toFixed(1)}`;
    // Trace the wave
    for (let i = 0; i < pts.length; i++) {
      d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    }
    // Close along the opposite screen edge
    const closeX = side === "left" ? 0 : W;
    d += ` L ${closeX} ${(H + BOT_PAD).toFixed(1)}`;
    d += ` L ${edgeX} ${(-TOP_PAD).toFixed(1)}`;
    d += " Z";
    return d;
  }

  clipLeftPath.setAttribute("d", buildClip("left"));
  clipRightPath.setAttribute("d", buildClip("right"));

  /* ---- STROKE-DASHOFFSET ANIMATION (line draws upward) ---- */
  const len = wavePath.getTotalLength();
  wavePath.style.strokeDasharray = `${len}`;
  wavePath.style.strokeDashoffset = `${len}`;

  // Double rAF ensures initial state is painted before transition fires
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      wavePath.style.transition =
        "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s";
      wavePath.style.strokeDashoffset = "0";
    })
  );

  /* ---- SPLIT ----
   * 0.2s delay + 1.5s draw + 0.15s pause ≈ 1.85s
   */
  /* ---- SPLIT ---- */
  setTimeout(() => {
    loader.classList.add("is-splitting");
    setTimeout(() => {
      loader.classList.add("is-gone");

      // Trigger hero animations now that loader is gone
      document.querySelector(".hero__title")?.classList.add("is-ready");
      document.querySelector(".hero__foot")?.classList.add("is-ready");
      document.querySelector(".hero__accent")?.classList.add("is-ready");
    }, 1150);
  }, 1850);
})();

// ---------- CUSTOM CURSOR ----------
const cursor = document.getElementById("cursor");
let cx = 0, cy = 0, tx = 0, ty = 0;
window.addEventListener("mousemove", (e) => {
  tx = e.clientX;
  ty = e.clientY;
});
function loop() {
  cx += (tx - cx) * 0.18;
  cy += (ty - cy) * 0.18;
  cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
  requestAnimationFrame(loop);
}
loop();

document.querySelectorAll("a, button, .service").forEach((el) => {
  el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
});

// ---------- SCROLL REVEALS ----------
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ---------- QUOTE CAROUSEL (SINGLE ROW, EXPAND ON HOVER/CLICK) ----------
const quoteTrack = document.getElementById("quoteTrack");

if (quoteTrack) {
  // Each review shows once — no cloning, no auto-scroll. The row is
  // sized to its content and centered in the section (see styles.css),
  // and hover/focus expansion is handled entirely by CSS. This just
  // adds click-to-toggle so the expanded state also works on touch.
  const quoteItems = quoteTrack.querySelectorAll(".quote__item");

  quoteItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = item.classList.contains("is-active");

      // Collapse all cards
      quoteItems.forEach((el) => el.classList.remove("is-active"));

      // Expand clicked card
      if (!isActive) {
        item.classList.add("is-active");
      }
    });
  });

  // Clicking outside the carousel collapses any open card
  document.addEventListener("click", () => {
    quoteItems.forEach((item) => item.classList.remove("is-active"));
  });
}

