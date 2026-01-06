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
