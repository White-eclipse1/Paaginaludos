// ====== CONFIG (CAMBIA SOLO EL EMAIL) ======
const SETTINGS = {
  email: "artista@correo.com",
  instagramUrl: "https://www.instagram.com/artedelulu",
  linktreeUrl: "https://linktr.ee/lulucardenas?utm_source=linktree_profile_share&ltsid=c105b71a-f330-43ba-a84f-3cb85dae8ddf"
};

const grid = document.querySelector("#grid");
const tabs = document.querySelectorAll(".tab");
const search = document.querySelector("#search");
const sort = document.querySelector("#sort");

let all = [];
let filter = "all";

const params = new URLSearchParams(location.search);
const typeParam = params.get("type"); // pintura | ceramica
const openParam = params.get("open"); // id para abrir modal directo
if (typeParam) filter = typeParam;

function applyTitle() {
  const title = document.querySelector("#galleryTitle");
  const desc = document.querySelector("#galleryDesc");
  if (!title || !desc) return;

  if (typeParam === "pintura") { title.textContent = "Pinturas"; desc.textContent = "Obras en papel y lienzo."; }
  else if (typeParam === "ceramica") { title.textContent = "Cerámicas"; desc.textContent = "Piezas únicas hechas a mano."; }
  else { title.textContent = "Galería"; desc.textContent = "Explora las obras por tipo y disponibilidad."; }
}

function cardHTML(item) {
  const meta = `${item.year} • ${item.medium}`;
  const price = item.price ? `$${item.price.toLocaleString("es-MX")} MXN` : "Precio a consulta";

  const badge = item.available
    ? `<span class="badge badge--available">Available</span>`
    : `<span class="badge badge--sold">Sold</span>`;

  return `
    <button class="tile tile-btn" data-id="${item.id}" aria-label="Ver ${item.title}">
      <div class="tile__top">${badge}</div>
      <img class="tile__img" src="${item.image}" alt="${item.title}" loading="lazy" />
      <div class="tile__body">
        <p class="tile__title">${item.title}</p>
        <p class="tile__meta">${meta}</p>
        <p class="tile__meta">${price}</p>
      </div>
    </button>
  `;
}

function getFiltered() {
  const q = (search?.value || "").trim().toLowerCase();
  let items = [...all];

  if (filter === "pintura" || filter === "ceramica") items = items.filter(x => x.type === filter);
  if (filter === "disponible") items = items.filter(x => x.available);

  if (q) {
    items = items.filter(x =>
      [x.title, x.medium, String(x.year), x.size, x.type].join(" ").toLowerCase().includes(q)
    );
  }

  const mode = sort?.value || "newest";
  items.sort((a,b) => {
    if (mode === "oldest") return a.year - b.year;
    if (mode === "priceAsc") return (a.price||0) - (b.price||0);
    if (mode === "priceDesc") return (b.price||0) - (a.price||0);
    return b.year - a.year;
  });

  return items;
}

function render() {
  const items = getFiltered();
  grid.innerHTML = items.map(cardHTML).join("") || `<p class="lead">No hay resultados.</p>`;
  tabs.forEach(t => t.classList.toggle("is-active", t.dataset.filter === filter));
}

tabs.forEach(t => t.addEventListener("click", () => { filter = t.dataset.filter; render(); }));
search?.addEventListener("input", render);
sort?.addEventListener("change", render);

// ====== MODAL ======
const modal = document.querySelector("#artModal");
const modalImg = document.querySelector("#modalImg");
const modalTitle = document.querySelector("#modalTitle");
const modalMeta = document.querySelector("#modalMeta");
const modalDetails = document.querySelector("#modalDetails");
const modalAvailability = document.querySelector("#modalAvailability");
const modalEmail = document.querySelector("#modalEmail");
const modalIg = document.querySelector("#modalIg");
const modalLinks = document.querySelector("#modalLinks");

let lastFocused = null;

function openModal(item){
  if (!modal) return;
  lastFocused = document.activeElement;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (modalImg){ modalImg.src = item.image; modalImg.alt = item.title; }
  if (modalTitle) modalTitle.textContent = item.title;
  if (modalMeta) modalMeta.textContent = `${item.year} • ${item.medium} • ${item.size}`;

  const price = item.price ? `$${item.price.toLocaleString("es-MX")} MXN` : "Precio a consulta";
  const status = item.available ? "Available" : "Sold";

  if (modalDetails){
    modalDetails.innerHTML = `
      <p>${item.description || ""}</p>
      <p><strong>Type:</strong> ${item.type}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Price:</strong> ${price}</p>
    `;
  }

  if (modalAvailability){
    modalAvailability.textContent = item.available
      ? "Available. Escríbeme para comprar o separar."
      : "Sold. Puedo hacer una pieza similar por comisión (opcional).";
  }

  if (modalEmail){
    const subject = encodeURIComponent(`Consulta — ${item.title}`);
    modalEmail.href = `mailto:${SETTINGS.email}?subject=${subject}`;
  }
  if (modalIg) modalIg.href = SETTINGS.instagramUrl;
  if (modalLinks) modalLinks.href = SETTINGS.linktreeUrl;

  modal.querySelector(".modal__close")?.focus();
}

function closeModal(){
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lastFocused?.focus();
}

document.addEventListener("click", (e) => {
  const tileBtn = e.target.closest(".tile-btn");
  if (tileBtn){
    const id = tileBtn.dataset.id;
    const item = all.find(x => x.id === id);
    if (item) openModal(item);
  }

  if (modal?.classList.contains("is-open")) {
    const close = e.target?.dataset?.close === "true";
    if (close) closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
});

// ====== INIT ======
(async function init(){
  applyTitle();
  const res = await fetch("assets/data/artworks.json");
  all = await res.json();
  render();

  // abrir directo si vienes con ?open=id
  if (openParam) {
    const item = all.find(x => x.id === openParam);
    if (item) openModal(item);
  }
})();
