const SETTINGS = {
  contactUrl: "index.html#contacto",
  dataUrl: "assets/data/artworks.json"
};

const grid = document.querySelector("#grid");
const tabs = document.querySelectorAll(".tab");
const search = document.querySelector("#search");
const sort = document.querySelector("#sort");
const resetBtn = document.querySelector("#resetFilters");
const resultsText = document.querySelector("#resultsText");
const emptyState = document.querySelector("#emptyState");

let all = [];
let filter = "all";

const params = new URLSearchParams(location.search);
const typeParam = params.get("type");
if (typeParam) filter = typeParam;

function showError(msg){
  if (!grid) return;
  grid.innerHTML = `
    <div class="card">
      <h3>❌ Error en Galería</h3>
      <p class="lead">${msg}</p>
      <p style="color: var(--muted); font-size: 14px; margin-top: 12px;">
        Verifica que el archivo <code>assets/data/artworks.json</code> exista y sea válido.
      </p>
    </div>
  `;
}

function showLoading() {
  if (!grid) return;
  grid.innerHTML = `
    <div class="card" style="text-align:center; padding:40px;">
      <div style="font-size:48px; margin-bottom:16px;"></div>
      <p class="lead">Cargando galería...</p>
    </div>
  `;
}

function updateStats() {
  const totalCount = document.querySelector("#totalCount");
  const availableCount = document.querySelector("#availableCount");
  
  if (totalCount) totalCount.textContent = all.length;
  if (availableCount) {
    const available = all.filter(item => item.available).length;
    availableCount.textContent = available;
  }
}

function applyTitle() {
  const title = document.querySelector("#galleryTitle");
  const desc = document.querySelector("#galleryDesc");
  const badge = document.querySelector("#galleryBadge");
  
  if (!title || !desc) return;

  if (typeParam === "pintura") { 
    if (badge) badge.textContent = "Colección de Pinturas";
    title.textContent = "Pinturas Originales"; 
    desc.textContent = "Explora mi colección de pinturas únicas. Cada obra es original y hecha a mano con acrílicos y óleos de alta calidad."; 
  } else if (typeParam === "ceramica") { 
    if (badge) badge.textContent = "Colección de Cerámicas";
    title.textContent = "Cerámicas Artesanales"; 
    desc.textContent = "Descubre piezas cerámicas únicas hechas a mano. Cada pieza es horneada y esmaltada con técnicas tradicionales."; 
  } else { 
    if (badge) badge.textContent = "Explorar Colección";
    title.textContent = "Galería Completa"; 
    desc.textContent = "Descubre mi colección de obras originales. Haz clic en cualquier pieza para ver detalles completos, precio y disponibilidad."; 
  }
}

function safePrice(item){
  return (typeof item.price === "number")
    ? `$${item.price.toLocaleString("es-MX")} MXN`
    : "Precio a consulta";
}

function statusPill(item){
  const isAvail = !!item.available;
  return `<span class="status-pill ${isAvail ? "available" : "sold"}">${isAvail ? " Disponible" : " Vendida"}</span>`;
}

function cardHTML(item){
  const subtitle = [
    item.year ? String(item.year) : "",
    item.medium || "",
    item.size || ""
  ].filter(Boolean).join(" • ");

  const price = safePrice(item);
  const description = (item.description || "").trim();
  const typeIcon = item.type === "pintura" ? "" : "";

  return `
    <article class="art-card" data-id="${item.id}">
      <button class="art-summary" type="button" aria-expanded="false">
        <img class="art-thumb" src="${item.image}" alt="${item.title}" loading="lazy"
             onerror="this.src='assets/img/placeholder-1.jpg'; this.onerror=null;" />

        <div class="art-main">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span style="font-size:20px;">${typeIcon}</span>
            <span class="art-type">${item.type === "pintura" ? "Pintura" : "Cerámica"}</span>
          </div>
          <h3 class="art-title">${item.title}</h3>
          <p class="art-sub">${subtitle}</p>
        </div>

        <div class="art-status">
          ${statusPill(item)}
          <span class="art-chevron">⌄</span>
        </div>
      </button>

      <div class="art-panel" hidden>
        <div class="panel-grid">
          <div class="panel-image-wrapper">
            <img class="panel-img" src="${item.image}" alt="${item.title}" loading="lazy"
                 onerror="this.src='assets/img/placeholder-1.jpg'; this.onerror=null;" />
          </div>

          <div class="panel-info">
            <div class="panel-header">
              <h3 style="margin:0 0 8px; font-size:24px;">${item.title}</h3>
              ${statusPill(item)}
            </div>

            <div class="panel-details">
              <div class="detail-row">
                <span class="detail-label"> Tipo</span>
                <span class="detail-value">${item.type === "pintura" ? "Pintura" : "Cerámica"}</span>
              </div>
              
              ${item.year ? `
                <div class="detail-row">
                  <span class="detail-label"> Año</span>
                  <span class="detail-value">${item.year}</span>
                </div>
              ` : ''}
              
              ${item.medium ? `
                <div class="detail-row">
                  <span class="detail-label"> Técnica</span>
                  <span class="detail-value">${item.medium}</span>
                </div>
              ` : ''}
              
              ${item.size ? `
                <div class="detail-row">
                  <span class="detail-label"> Dimensiones</span>
                  <span class="detail-value">${item.size}</span>
                </div>
              ` : ''}
              
              <div class="detail-row detail-row--highlight">
                <span class="detail-label"> Precio</span>
                <span class="detail-value" style="font-weight:700; font-size:18px;">${price}</span>
              </div>
            </div>

            ${description ? `
              <div class="panel-description">
                <strong>Descripción</strong>
                <p>${description}</p>
              </div>
            ` : ""}

            <div class="panel-actions">
              <a class="btn btn--large" href="${SETTINGS.contactUrl}">
                 Preguntar por esta pieza
              </a>
              
            </div>

            <small class="fineprint">
               Escríbenos por Instagram o email para más información sobre esta obra.
            </small>
          </div>
        </div>
      </div>
    </article>
  `;
}

function getFiltered(){
  const q = (search?.value || "").trim().toLowerCase();
  let items = [...all];

  if (filter === "pintura" || filter === "ceramica") {
    items = items.filter(x => x.type === filter);
  }
  if (filter === "disponible") {
    items = items.filter(x => !!x.available);
  }

  if (q) {
    items = items.filter(x =>
      [x.title, x.medium, String(x.year ?? ""), x.size, x.type].join(" ").toLowerCase().includes(q)
    );
  }

  const mode = sort?.value || "newest";
  items.sort((a,b) => {
    const ay = Number(a.year || 0), by = Number(b.year || 0);
    const ap = typeof a.price === "number" ? a.price : Number.POSITIVE_INFINITY;
    const bp = typeof b.price === "number" ? b.price : Number.POSITIVE_INFINITY;

    if (mode === "oldest") return ay - by;
    if (mode === "priceAsc") return ap - bp;
    if (mode === "priceDesc") return bp - ap;
    return by - ay;
  });

  return items;
}

function updateResultsInfo(count) {
  if (!resultsText) return;
  
  const filterName = filter === "all" ? "todas las obras" : 
                     filter === "pintura" ? "pinturas" :
                     filter === "ceramica" ? "cerámicas" : "obras disponibles";
  
  resultsText.textContent = count === 0 
    ? `No se encontraron resultados` 
    : `Mostrando ${count} ${count === 1 ? 'obra' : 'obras'} ${filter !== "all" ? `en ${filterName}` : ''}`;
}

function render(){
  const items = getFiltered();
  const hasResults = items.length > 0;
  
  if (hasResults) {
    grid.innerHTML = items.map(cardHTML).join("");
    grid.style.display = "grid";
    if (emptyState) emptyState.style.display = "none";
    
    
    setTimeout(observeCards, 50); 
    
  } else {
    grid.style.display = "none";
    if (emptyState) emptyState.style.display = "flex";
  }

  updateResultsInfo(items.length);
  tabs.forEach(t => t.classList.toggle("is-active", t.dataset.filter === filter));
}

function closeAllExcept(id){
  document.querySelectorAll(".art-card.is-open").forEach(card => {
    if (card.dataset.id !== id) closeCard(card);
  });
}

function openCard(card){
  const btn = card.querySelector(".art-summary");
  const panel = card.querySelector(".art-panel");
  card.classList.add("is-open");
  btn?.setAttribute("aria-expanded", "true");
  if (panel) panel.hidden = false;
  
  // Scroll suave a la tarjeta
  setTimeout(() => {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function closeCard(card){
  const btn = card.querySelector(".art-summary");
  const panel = card.querySelector(".art-panel");
  card.classList.remove("is-open");
  btn?.setAttribute("aria-expanded", "false");
  if (panel) panel.hidden = true;
}

function resetFilters() {
  filter = "all";
  if (search) search.value = "";
  if (sort) sort.value = "newest";
  
  // Actualizar URL sin recargar
  window.history.pushState({}, '', 'gallery.html');
  
  render();
}

// Event Listeners
document.addEventListener("click", (e) => {
  const summaryBtn = e.target.closest(".art-summary");
  if (!summaryBtn) return;
  const card = summaryBtn.closest(".art-card");
  if (!card) return;

  const isOpen = card.classList.contains("is-open");
  closeAllExcept(card.dataset.id);
  if (isOpen) closeCard(card);
  else openCard(card);
});

tabs.forEach(t => t.addEventListener("click", () => {
  filter = t.dataset.filter;
  render();
}));

search?.addEventListener("input", render);
sort?.addEventListener("change", render);
resetBtn?.addEventListener("click", resetFilters);

// Initialize
(async function init(){
  applyTitle();

  if (!grid) {
    console.error("❌ No existe #grid en gallery.html");
    return;
  }

  showLoading();

  try{
    console.log("🔄 Cargando artworks desde:", SETTINGS.dataUrl);
    
    const res = await fetch(SETTINGS.dataUrl, { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("📡 Response status:", res.status, res.statusText);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: No se pudo cargar ${SETTINGS.dataUrl}`);
    }
    
    const data = await res.json();
    console.log("📦 Datos recibidos:", data);

    if (!Array.isArray(data)) {
      throw new Error("El archivo artworks.json no contiene un array válido");
    }
    
    if (data.length === 0) {
      throw new Error("El archivo artworks.json está vacío");
    }
    
    all = data;
    console.log("✅ Gallery items cargados:", all.length);
    
    updateStats();
    render();
    
  } catch(err) {
    console.error("❌ Error completo:", err);
    showError(`No se pudo cargar la galería: ${err.message}`);
  }
})();
// ===== Swipe left/right para cambiar tabs =====
(function enableSwipeTabs(){
  const swipeArea = document.querySelector(".filters-section") || document.querySelector("#grid");
  if (!swipeArea || !tabs?.length) return;

  const order = ["all", "pintura", "ceramica", "disponible"];
  let startX = 0, startY = 0, tracking = false;

  function idxOfFilter(f){ return Math.max(0, order.indexOf(f)); }

  swipeArea.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length !== 1) return;

    // evita swipes cuando estás interactuando con input/select
    const t = e.target;
    if (t.closest("input, textarea, select, button")) return;

    tracking = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  swipeArea.addEventListener("touchend", (e) => {
    if (!tracking) return;
    tracking = false;

    const touch = e.changedTouches?.[0];
    if (!touch) return;

    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    // si es más vertical que horizontal, ignora
    if (Math.abs(dy) > Math.abs(dx)) return;

    const threshold = 55; // sensibilidad
    if (Math.abs(dx) < threshold) return;

    let i = idxOfFilter(filter);
    if (dx < 0) i = Math.min(order.length - 1, i + 1); // swipe left -> siguiente
    else i = Math.max(0, i - 1); // swipe right -> anterior

    filter = order[i];
    render();

    // feedback ligero (haptics no disponible web, pero un micro highlight sí)
    const activeTab = Array.from(tabs).find(t => t.dataset.filter === filter);
    activeTab?.scrollIntoView?.({ behavior: "smooth", inline: "center", block: "nearest" });
  }, { passive: true });
})();
// ===== Gestos: swipe up para cerrar / swipe L/R para navegar en modo "open" =====
(function enableCardGestures(){
  const root = document.querySelector("#grid");
  if (!root) return;

  let sx=0, sy=0, cardId=null, tracking=false;

  function openedCards(){
    return Array.from(document.querySelectorAll(".art-card"));
  }
  function openByIndex(nextIndex){
    const cards = openedCards();
    const clamped = Math.max(0, Math.min(cards.length - 1, nextIndex));
    const card = cards[clamped];
    if (!card) return;
    closeAllExcept(card.dataset.id);
    openCard(card);
  }
  function currentOpenIndex(){
    const cards = openedCards();
    const open = cards.findIndex(c => c.classList.contains("is-open"));
    return open;
  }

  root.addEventListener("touchstart", (e) => {
    if (e.touches?.length !== 1) return;
    const targetCard = e.target.closest(".art-card");
    if (!targetCard) return;

    // no gestos si tocan controles
    if (e.target.closest("a, button, input, textarea, select")) return;

    tracking = true;
    cardId = targetCard.dataset.id;
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });

  root.addEventListener("touchend", (e) => {
    if (!tracking) return;
    tracking = false;

    const t = e.changedTouches?.[0];
    if (!t) return;

    const dx = t.clientX - sx;
    const dy = t.clientY - sy;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // Solo actuar si hay una tarjeta abierta
    const openIdx = currentOpenIndex();
    if (openIdx === -1) return;

    // swipe up (cerrar)
    if (absY > absX && dy < -70) {
      const openCardEl = openedCards()[openIdx];
      if (openCardEl) closeCard(openCardEl);
      return;
    }

    // swipe left/right (navegar)
    if (absX > absY && absX > 70) {
      if (dx < 0) openByIndex(openIdx + 1); // siguiente
      else openByIndex(openIdx - 1); // anterior
    }
  }, { passive: true });
})();
// ===== Reveal on scroll =====
function observeCards(){
  const cards = document.querySelectorAll(".art-card:not(.is-visible)");
  
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting){
        
        setTimeout(() => {
          entry.target.classList.add("is-visible");
        }, index * 100); 
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => io.observe(c));
}
