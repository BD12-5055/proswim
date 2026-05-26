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
const loader = document.getElementById("loader");
const count = document.getElementById("count");
let n = 0;
const tick = setInterval(() => {
  n += Math.floor(Math.random() * 6) + 2;
  if (n >= 100) {
    n = 100;
    clearInterval(tick);
    setTimeout(() => loader.classList.add("is-done"), 350);
    setTimeout(() => loader.classList.add("is-gone"), 1500);
  }
  count.textContent = n;
}, 60);

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

// ---------- DUPLICATE MARQUEE FOR SEAMLESS LOOP ----------
const track = document.querySelector(".marquee__track");
if (track) track.innerHTML += track.innerHTML;