// ====== CONFIG (CAMBIA SOLO EL EMAIL) ======
const SETTINGS = {
  email: "artista@correo.com",
  instagramUrl: "https://www.instagram.com/artedelulu",
  linktreeUrl: "https://linktr.ee/lulucardenas?utm_source=linktree_profile_share&ltsid=c105b71a-f330-43ba-a84f-3cb85dae8ddf"
};

// Menú mobile + año footer
const toggle = document.querySelector(".nav__toggle");
const nav = document.querySelector("#navMenu");
const backdrop = document.querySelector("#navBackdrop");
const closeBtn = nav?.querySelector(".nav__close");

function openNav(){
  if (!nav) return;
  nav.classList.add("is-open");
  backdrop?.classList.add("is-open");
  document.body.classList.add("nav-open");
  toggle?.setAttribute("aria-expanded", "true");
  if (backdrop) backdrop.hidden = false;
}

function closeNav(){
  if (!nav) return;
  nav.classList.remove("is-open");
  backdrop?.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  toggle?.setAttribute("aria-expanded", "false");
  if (backdrop) backdrop.hidden = true;
}

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-open");
    isOpen ? closeNav() : openNav();
  });
}

backdrop?.addEventListener("click", closeNav);
closeBtn?.addEventListener("click", closeNav);

// cerrar con ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav?.classList.contains("is-open")) closeNav();
});

// cerrar al tocar un link
nav?.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a) closeNav();
});


const yearEl = document.querySelector("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Featured (en home)
async function loadFeatured() {
  const grid = document.querySelector("#featuredGrid");
  if (!grid) return;

  const res = await fetch("assets/data/artworks.json");
  const data = await res.json();

  const featured = data.slice(0, 6);
  grid.innerHTML = featured.map(featuredCardHTML).join("");
}

function featuredCardHTML(item) {
  const meta = `${item.year} • ${item.medium}`;
  const badge = item.available ? "Available" : "Sold";
  const badgeClass = item.available ? "badge--available" : "badge--sold";

  return `
    <a class="tile" href="gallery.html?open=${encodeURIComponent(item.id)}">
      <div class="tile__top">
        <span class="badge ${badgeClass}">${badge}</span>
      </div>
      <img class="tile__img" src="${item.image}" alt="${item.title}" loading="lazy" />
      <div class="tile__body">
        <p class="tile__title">${item.title}</p>
        <p class="tile__meta">${meta}</p>
      </div>
    </a>
  `;
}
loadFeatured();

async function loadHeroCarousel() {
  const track = document.querySelector("#heroCarouselTrack");
  const prevBtn = document.querySelector("#heroPrev");
  const nextBtn = document.querySelector("#heroNext");
  const dotsWrap = document.querySelector("#heroDots");
  if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

  try {
    const res = await fetch("assets/data/artworks.json");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return;

    const items = data.slice(0, 6);
    let current = 0;
    let timer = null;

    track.innerHTML = items.map((item, index) => `
      <article class="hero-carousel__slide ${index === 0 ? "is-active" : ""}" data-slide="${index}">
        <img src="${item.image}" alt="${item.title}" loading="${index === 0 ? "eager" : "lazy"}" />
        <div class="hero-carousel__caption">
          <strong>${item.title}</strong>
          <span>${item.type === "ceramica" ? "Cerámica" : "Pintura"}${item.year ? ` · ${item.year}` : ""}</span>
        </div>
      </article>
    `).join("");

    dotsWrap.innerHTML = items.map((_, index) => `
      <button class="hero-carousel__dot ${index === 0 ? "is-active" : ""}" type="button" data-dot="${index}" aria-label="Ir a obra ${index + 1}"></button>
    `).join("");

    const slides = Array.from(track.querySelectorAll(".hero-carousel__slide"));
    const dots = Array.from(dotsWrap.querySelectorAll(".hero-carousel__dot"));

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
    }

    function next() { showSlide(current + 1); }
    function prev() { showSlide(current - 1); }

    function startAuto() {
      stopAuto();
      timer = setInterval(next, 4200);
    }
    function stopAuto() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    prevBtn.addEventListener("click", () => { prev(); startAuto(); });
    nextBtn.addEventListener("click", () => { next(); startAuto(); });
    dotsWrap.addEventListener("click", (e) => {
      const dot = e.target.closest("[data-dot]");
      if (!dot) return;
      showSlide(Number(dot.dataset.dot));
      startAuto();
    });

    track.addEventListener("mouseenter", stopAuto);
    track.addEventListener("mouseleave", startAuto);
    track.addEventListener("touchstart", stopAuto, { passive: true });
    track.addEventListener("touchend", startAuto, { passive: true });

    startAuto();
  } catch (_) {
    // Si falla la carga, el hero mantiene estructura sin carrusel.
  }
}
loadHeroCarousel();

// Contact form (mailto)
const contactForm = document.querySelector("#contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.querySelector("#name")?.value?.trim() || "";
    const email = document.querySelector("#emailC")?.value?.trim() || "";
    const message = document.querySelector("#msg")?.value?.trim() || "";

    const subject = encodeURIComponent(`Contact Us — ${name}`);
    const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`);

    window.location.href = `mailto:${SETTINGS.email}?subject=${subject}&body=${body}`;
  });
}
let lastScroll = 0;
const header = document.querySelector(".header");
const threshold = 10; // Cantidad de pixeles de tolerancia

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  // Si el scroll es menor a 0 (rebote en iOS) no hace nada
  if (currentScroll <= 0) {
    header.style.transform = "translateY(0)";
    return;
  }

  // Si el movimiento es muy pequeño, lo ignoramos para mayor suavidad
  if (Math.abs(currentScroll - lastScroll) < threshold) return;

  if (currentScroll > lastScroll && currentScroll > 150) {
    // Bajando: Escondemos el header
    header.style.transform = "translateY(-100%)";
  } else {
    // Subiendo: Mostramos el header
    header.style.transform = "translateY(0)";
  }

  lastScroll = currentScroll;
}, { passive: true }); // Mejora el rendimiento del scroll
