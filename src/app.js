/* ==========================================================================
   BAYT IMMOBILIER · interactions (navigateur)
   ========================================================================== */
(function () {
  "use strict";
  const B = window.BAYT, SITE = window.SITE, BIENS = window.BIENS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page;
  const LEAFLET_JS = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet-src.esm.js";
  const LEAFLET_CSS = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
  const TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  const TILES_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
  };
  const openLink = href => { const a = document.createElement("a"); a.href = href; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove(); };
  const emit = name => document.dispatchEvent(new CustomEvent(name));
  $$("[data-year]").forEach(e => { e.textContent = new Date().getFullYear(); });

  /* ======================================================================
     Prix en centimes ou en DA
     ====================================================================== */
  let mode = store.get("bayt:cur", "cts") === "da" ? "da" : "cts";
  B.mode = () => mode;
  function applyCurrency(root) {
    $$(".pr[data-da]", root || document).forEach(el => {
      const p = B.priceParts(+el.dataset.da, el.dataset.rent === "1", mode, el.dataset.suffix || "");
      const m = el.querySelector(".pr-main"), s = el.querySelector(".pr-sub");
      if (m) m.textContent = p.main;
      if (s) s.textContent = p.sub;
    });
  }
  function setMode(m) {
    mode = m; store.set("bayt:cur", m);
    $$("[data-cur]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.cur === mode)));
    applyCurrency();
    emit("bayt:currency");
  }
  document.addEventListener("click", e => { const b = e.target.closest("[data-cur]"); if (b) setMode(b.dataset.cur); });
  $$("[data-cur]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.cur === mode)));
  if (mode !== "cts") applyCurrency();

  /* ======================================================================
     Favoris (enregistrés sur l'appareil)
     ====================================================================== */
  let favs = store.get("bayt:fav", []);
  if (!Array.isArray(favs)) favs = [];
  favs = favs.filter(r => B.bien(r));
  function syncFavs(root) {
    $$("[data-fav]", root || document).forEach(b => b.setAttribute("aria-pressed", String(favs.includes(b.dataset.fav))));
    $$("[data-fav-count]").forEach(c => { c.textContent = favs.length; c.hidden = !favs.length; });
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-fav]"); if (!b) return;
    e.preventDefault();
    const r = b.dataset.fav;
    favs = favs.includes(r) ? favs.filter(x => x !== r) : favs.concat(r);
    store.set("bayt:fav", favs);
    syncFavs();
    if (!reduce && favs.includes(r)) { $$(`[data-fav="${r}"]`).forEach(x => { x.classList.remove("pop"); void x.offsetWidth; x.classList.add("pop"); }); }
    emit("bayt:favs");
  });
  syncFavs();

  /* ======================================================================
     Défilement doux (Lenis) — ordinateurs ; défilement natif au doigt
     ====================================================================== */
  let lenis = null;
  if (!reduce && typeof window.Lenis === "function") {
    try {
      lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false });
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } catch (e) { lenis = null; }
  }
  const hdH = () => ($("#hd") ? $("#hd").offsetHeight : 72);
  function scrollToEl(el, extra = 16) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -(hdH() + extra), duration: 1.1 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - hdH() - extra, behavior: reduce ? "auto" : "smooth" });
  }
  const lock = on => { document.documentElement.style.overflow = on ? "hidden" : ""; if (lenis) on ? lenis.stop() : lenis.start(); };

  /* ======================================================================
     En-tête et menu mobile
     ====================================================================== */
  const hd = $("#hd"), burger = $("#burger"), menu = $("#menu");
  const onScroll = () => hd && hd.classList.toggle("scrolled", window.scrollY > 8);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  function openMenu() {
    menu.classList.add("open"); menu.inert = false; hd.classList.add("menu-open");
    burger.setAttribute("aria-expanded", "true"); burger.setAttribute("aria-label", "Fermer le menu");
    lock(true);
    setTimeout(() => { const a = menu.querySelector("a"); if (a) a.focus({ preventScroll: true }); }, 200);
  }
  function closeMenu(focusBurger) {
    if (!menu.classList.contains("open")) return;
    menu.classList.remove("open"); menu.inert = true; hd.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Ouvrir le menu");
    lock(false);
    if (focusBurger) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener("click", () => menu.classList.contains("open") ? closeMenu() : openMenu());
    menu.addEventListener("click", e => { if (e.target.closest("a")) closeMenu(); });
    matchMedia("(min-width: 1140px)").addEventListener("change", e => { if (e.matches) closeMenu(); });
  }
  document.addEventListener("keydown", e => { if (e.key === "Escape" && menu && menu.classList.contains("open")) closeMenu(true); });

  // lien actif "Acheter" / "Louer" selon la recherche
  if (page === "list") {
    const t = new URLSearchParams(location.search).get("t") === "location" ? "location" : "vente";
    $$(".nav [data-nav]").forEach(a => a.toggleAttribute("aria-current", a.dataset.nav === t));
    $$(".nav [data-nav]").forEach(a => { if (a.dataset.nav === t) a.setAttribute("aria-current", "page"); });
  }

  /* ======================================================================
     Leaflet (carte), chargé seulement quand une carte devient visible
     ====================================================================== */
  let leafletP = null;
  function loadLeaflet() {
    if (!leafletP) {
      const css = document.createElement("link"); css.rel = "stylesheet"; css.href = LEAFLET_CSS; document.head.appendChild(css);
      leafletP = import(LEAFLET_JS);
    }
    return leafletP;
  }
  function onVisible(el, fn, margin = "300px") {
    if (!el) return;
    if (!("IntersectionObserver" in window)) return fn();
    const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: margin });
    io.observe(el);
  }
  function mapFailed(el) {
    el.innerHTML = '<p class="map-msg">La carte n\'a pas pu se charger. Vérifiez votre connexion, ou demandez l\'emplacement sur WhatsApp.</p>';
  }

  /* ======================================================================
     Rails horizontaux (accueil)
     ====================================================================== */
  $$("[data-scroll]").forEach(btn => {
    const sec = btn.closest("section"), rail = sec && sec.querySelector("[data-rail]");
    if (!rail) return;
    const step = () => { const c = rail.querySelector(".card"); return c ? (c.offsetWidth + 20) * Math.max(1, Math.floor(rail.clientWidth / (c.offsetWidth + 20))) : rail.clientWidth * 0.8; };
    btn.addEventListener("click", () => rail.scrollBy({ left: step() * +btn.dataset.scroll, behavior: reduce ? "auto" : "smooth" }));
    const upd = () => {
      const max = rail.scrollWidth - rail.clientWidth - 2;
      $$("[data-scroll]", sec).forEach(b => { b.disabled = b.dataset.scroll === "-1" ? rail.scrollLeft <= 2 : rail.scrollLeft >= max; });
    };
    rail.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd); upd();
  });

  /* ======================================================================
     Simulateur de crédit
     ====================================================================== */
  $$("[data-sim]").forEach(form => {
    const el = n => form.elements[n];
    const out = n => form.querySelector(`[data-out="${n}"]`);
    function update() {
      const price = +el("price").value, down = +el("down").value, years = +el("years").value;
      const rate = Math.min(Math.max(parseFloat(String(el("rate").value).replace(",", ".")) || 0, 0), 15);
      const principal = price * (1 - down / 100);
      const r = B.loan(principal, rate, years);
      out("price").innerHTML = B.priceHTML(price, false, "", mode);
      out("down").textContent = `${down} % (${mode === "da" ? B.da(price * down / 100) : B.cts(price * down / 100)})`;
      out("monthly").innerHTML = B.priceHTML(r.monthly, false, "", mode);
      out("loan").innerHTML = B.priceHTML(principal, false, "pr-inline", mode);
      out("interest").innerHTML = B.priceHTML(r.interest, false, "pr-inline", mode);
      out("income").innerHTML = B.priceHTML(r.monthly / (SITE.loan.incomeRatio || 0.3), false, "pr-inline", mode);
      el("price").setAttribute("aria-valuetext", `${B.cts(price)}, soit ${B.da(price)}`);
      el("down").setAttribute("aria-valuetext", `${down} %`);
    }
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("submit", e => e.preventDefault());
    document.addEventListener("bayt:currency", update);
    update();
  });

  /* ======================================================================
     ACCUEIL : la recherche en une phrase
     ====================================================================== */
  if (page === "home") {
    const f = $("#sentence");
    const ctx = document.createElement("canvas").getContext("2d");
    const fit = sel => {
      const cs = getComputedStyle(sel);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const txt = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : "";
      const fs = parseFloat(cs.fontSize);
      // letter-spacing négatif : on le retire de la largeur mesurée
      const ls = parseFloat(cs.letterSpacing) || 0;
      sel.style.width = Math.ceil(ctx.measureText(txt).width + ls * txt.length + fs * 0.62) + "px";
    };
    const fitAll = () => $$("select", f).forEach(fit);
    const budget = f.elements.max;
    function fillBudget(t, keep) {
      const list = B.BUDGETS[t];
      budget.innerHTML = list.map(v => `<option value="${v || ""}">${B.budgetLabel(v, t)}</option>`).join("");
      if (keep && list.includes(+keep)) budget.value = keep;
    }
    function update() {
      const fl = { t: f.elements.t.value, k: f.elements.k.value, l: f.elements.l.value, max: +budget.value || 0 };
      const n = BIENS.filter(b => B.matches(b, fl)).length;
      $("[data-hero-count]").textContent = n === 0 ? "Voir toutes les annonces" : n === 1 ? "Voir le bien" : `Voir les ${n} biens`;
      const hint = $("[data-hero-hint]");
      if (n === 0) hint.textContent = "Aucun bien ne correspond pour l'instant. Changez un mot de la phrase, ou laissez-nous votre recherche sur WhatsApp.";
      else hint.textContent = fl.max ? `Soit ${B.da(fl.max)} au maximum${fl.t === "location" ? " par mois" : ""}.` : "";
      fitAll();
    }
    f.addEventListener("change", e => {
      if (e.target.name === "t") fillBudget(e.target.value, "");
      update();
    });
    f.addEventListener("submit", e => {
      // n'envoyer que les critères remplis
      e.preventDefault();
      const p = new URLSearchParams();
      ["t", "k", "l", "max"].forEach(n => { const v = f.elements[n].value; if (v) p.set(n, v); });
      const n = BIENS.filter(b => B.matches(b, { t: f.elements.t.value, k: f.elements.k.value, l: f.elements.l.value, max: +budget.value || 0 })).length;
      location.href = "/annonces/?" + (n ? p.toString() : `t=${f.elements.t.value}`);
    });
    update();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
    window.addEventListener("resize", fitAll);
    window.addEventListener("pageshow", update); // retour arrière : le navigateur peut restaurer les choix
  }

  /* ======================================================================
     ANNONCES : filtres, liste et carte
     ====================================================================== */
  if (page === "list") {
    const form = $("#filters"), results = $("#results"), empty = $("#empty");
    const budget = $("[data-budget]", form);
    const moreBox = $(".more", form);
    const checks = ["ascenseur", "parking", "vue", "meuble", "livret", "neuf"];
    const mqDesk = matchMedia("(min-width: 1000px)");
    const params = new URLSearchParams(location.search);
    const place = B.places();

    function budgetOptions(t, keep) {
      budget.innerHTML = B.BUDGETS[t].map(v => {
        const txt = !v ? "Tous les budgets" : `Jusqu'à ${mode === "da" ? B.da(v) : B.cts(v)}${t === "location" ? " / mois" : ""}`;
        return `<option value="${v || ""}">${txt}</option>`;
      }).join("");
      if (keep && B.BUDGETS[t].includes(+keep)) budget.value = String(keep);
    }
    // état initial depuis l'adresse
    const t0 = params.get("t") === "location" ? "location" : "vente";
    form.elements.t.value = t0;
    budgetOptions(t0, params.get("max"));
    if (params.get("k") && B.KINDS.some(([v]) => v === params.get("k"))) form.elements.k.value = params.get("k");
    if (params.get("l") && place.some(([v]) => v === params.get("l"))) form.elements.l.value = params.get("l");
    if (params.get("smin")) form.elements.smin.value = params.get("smin");
    if (params.get("sort")) form.elements.sort.value = params.get("sort");
    checks.forEach(n => { form.elements[n].checked = params.get(n) === "1"; });
    if (!mqDesk.matches && moreBox) moreBox.open = true;
    // ordinateur : le panneau « Plus de critères » se ferme en cliquant ailleurs ou avec Échap
    document.addEventListener("click", e => { if (mqDesk.matches && moreBox && moreBox.open && !moreBox.contains(e.target)) moreBox.open = false; });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && mqDesk.matches && moreBox && moreBox.open) { moreBox.open = false; moreBox.querySelector("summary").focus(); } });
    mqDesk.addEventListener("change", e => { if (moreBox) moreBox.open = !e.matches; if (e.matches) closeSheet(); });

    const state = () => {
      const s = { t: form.elements.t.value, k: form.elements.k.value, l: form.elements.l.value, max: +budget.value || 0, smin: +form.elements.smin.value || 0, sort: form.elements.sort.value };
      checks.forEach(n => { s[n] = form.elements[n].checked; });
      return s;
    };
    const sorters = {
      recent: (a, b) => b.date.localeCompare(a.date),
      "prix-asc": (a, b) => a.prix - b.prix,
      "prix-desc": (a, b) => b.prix - a.prix,
      surface: (a, b) => b.surface - a.surface
    };
    let current = [];
    function describe(s) {
      const k = B.KINDS.find(([v]) => v === s.k);
      const l = place.find(([v]) => v === s.l);
      const extra = [["ascenseur", "avec ascenseur"], ["parking", "avec parking"], ["vue", "avec vue mer"], ["meuble", "meublé"], ["livret", "avec livret foncier"], ["neuf", "neuf"]].filter(([c]) => s[c]).map(([, t]) => t);
      if (s.smin) extra.push(`d'au moins ${s.smin} m²`);
      const head = [k && s.k ? k[1] : "un bien", `à ${s.t === "location" ? "louer" : "acheter"}`, l && s.l ? l[1] : ""].filter(Boolean).join(" ");
      return [head, s.max ? B.budgetLabel(s.max, s.t) : ""].concat(extra).filter(Boolean).join(", ");
    }
    function render(push) {
      const s = state();
      current = BIENS.filter(b => B.matches(b, s)).sort(sorters[s.sort] || sorters.recent);
      results.innerHTML = current.map(b => B.cardHTML(b)).join("");
      applyCurrency(results); syncFavs(results);
      const n = current.length;
      empty.hidden = n > 0;
      results.hidden = n === 0;
      $("#listCount").textContent = n ? `${n} ${n > 1 ? "annonces" : "annonce"}` : "Aucune annonce";
      const l = place.find(([v]) => v === s.l);
      $("#listTitle").textContent = `Biens ${s.t === "location" ? "à louer" : "à vendre"}${l && s.l ? " " + l[1] : ""}`;
      $("#alertWa").href = B.wa(`Bonjour ${SITE.name}, je cherche ${describe(s)}. Pouvez-vous me prévenir quand un bien correspond ?`);
      const active = (s.k ? 1 : 0) + (s.l ? 1 : 0) + (s.max ? 1 : 0) + (s.smin ? 1 : 0) + checks.filter(c => s[c]).length;
      const moreN = (s.smin ? 1 : 0) + checks.filter(c => s[c]).length;
      $$("[data-filter-count]").forEach(b => { b.textContent = active; b.hidden = !active; });
      $$("[data-more-count]").forEach(b => { b.textContent = moreN; b.hidden = !moreN; });
      $$("[data-show-count]").forEach(b => { b.textContent = n ? `Voir ${n > 1 ? `les ${n} annonces` : "l'annonce"}` : "Aucune annonce"; });
      // adresse partageable
      const p = new URLSearchParams();
      p.set("t", s.t);
      ["k", "l"].forEach(x => { if (s[x]) p.set(x, s[x]); });
      if (s.max) p.set("max", s.max);
      if (s.smin) p.set("smin", s.smin);
      checks.forEach(c => { if (s[c]) p.set(c, "1"); });
      if (s.sort !== "recent") p.set("sort", s.sort);
      history.replaceState(null, "", "?" + p.toString());
      $$(".nav [data-nav]").forEach(a => { if (a.dataset.nav === s.t) a.setAttribute("aria-current", "page"); else if (a.dataset.nav === "vente" || a.dataset.nav === "location") a.removeAttribute("aria-current"); });
      updateMarkers();
      if (push && !mqDesk.matches) { /* rien : la liste est déjà visible derrière la feuille */ }
    }
    form.addEventListener("change", e => {
      if (e.target.name === "t") budgetOptions(e.target.value, "");
      render();
    });
    form.addEventListener("submit", e => e.preventDefault());
    $$("[data-reset]").forEach(b => b.addEventListener("click", () => {
      form.elements.k.value = ""; form.elements.l.value = ""; budget.value = ""; form.elements.smin.value = "";
      checks.forEach(n => { form.elements[n].checked = false; });
      render();
    }));
    document.addEventListener("bayt:currency", () => { const keep = budget.value; budgetOptions(form.elements.t.value, keep); updateMarkers(); });
    document.addEventListener("bayt:favs", () => syncFavs(results));

    // feuille de filtres (téléphone)
    const sheetBtn = $("[data-open-sheet]");
    function openSheet() { document.body.classList.add("sheet-open"); sheetBtn.setAttribute("aria-expanded", "true"); lock(true); setTimeout(() => { const s = $("#filterFields select"); if (s) s.focus({ preventScroll: true }); }, 250); }
    function closeSheet() { if (!document.body.classList.contains("sheet-open")) return; document.body.classList.remove("sheet-open"); sheetBtn.setAttribute("aria-expanded", "false"); lock(false); }
    sheetBtn.addEventListener("click", openSheet);
    $$("[data-close-sheet]").forEach(b => b.addEventListener("click", () => { closeSheet(); if (b.hasAttribute("data-show-count")) scrollToEl($(".results"), 80); }));
    document.addEventListener("keydown", e => { if (e.key === "Escape") { closeSheet(); closeMap(); } });

    // survol carte <-> carte d'annonce
    let map = null, L = null, layer = null, cityBox = null;
    const markers = new Map();
    function hot(ref, on) {
      const m = markers.get(ref);
      if (m && m.getElement()) { const p = m.getElement().querySelector(".pin"); if (p) p.classList.toggle("hot", on); if (on) m.setZIndexOffset(1000); else m.setZIndexOffset(0); }
      const c = results.querySelector(`.card[data-ref="${ref}"]`); if (c) c.classList.toggle("is-hot", on);
    }
    results.addEventListener("mouseover", e => { const c = e.target.closest(".card"); if (c) hot(c.dataset.ref, true); });
    results.addEventListener("mouseout", e => { const c = e.target.closest(".card"); if (c && !c.contains(e.relatedTarget)) hot(c.dataset.ref, false); });
    results.addEventListener("focusin", e => { const c = e.target.closest(".card"); if (c) hot(c.dataset.ref, true); });
    results.addEventListener("focusout", e => { const c = e.target.closest(".card"); if (c) hot(c.dataset.ref, false); });

    const popup = b => {
      const q = B.quartier(b.quartier);
      const p = B.priceParts(b.prix, b.transaction === "location", mode);
      return `<div class="pop"><a href="${B.url(b)}"><img src="${B.img(b.photos[0][0], 480, 300)}" alt=""><div><b>${p.main}</b><span>${B.esc(B.typeLabel(b))} à ${B.esc(q.name)}</span></div></a></div>`;
    };
    function updateMarkers() {
      if (!map || !L) return;
      layer.clearLayers(); markers.clear();
      current.forEach(b => {
        const icon = L.divIcon({ className: "pin-wrap", html: `<span class="pin">${B.short(b.prix, mode)}</span>`, iconSize: [0, 0] });
        const m = L.marker([b.lat, b.lng], { icon, title: `${B.typeLabel(b)} à ${B.quartier(b.quartier).name}`, riseOnHover: true }).bindPopup(popup(b), { closeButton: false, offset: [0, -30] });
        m.on("mouseover", () => hot(b.ref, true));
        m.on("mouseout", () => hot(b.ref, false));
        m.addTo(layer); markers.set(b.ref, m);
      });
      // Alger, Oran et Tipaza sont loin les unes des autres : on cadre la ville
      // qui a le plus d'annonces et on propose des boutons pour passer aux autres.
      const groups = {};
      current.forEach(b => { const w = B.quartier(b.quartier).wilaya; (groups[w] = groups[w] || []).push(b); });
      const names = Object.keys(groups).sort((x, y) => groups[y].length - groups[x].length);
      const fit = list => map.fitBounds(L.latLngBounds(list.map(b => [b.lat, b.lng])).pad(0.2), { maxZoom: 14, animate: false });
      if (names.length) fit(groups[names[0]]);
      cityBox.innerHTML = names.length > 1 ? names.map((w, i) => `<button type="button" data-city="${w}" aria-pressed="${i === 0}">${w} <span>${groups[w].length}</span></button>`).join("") : "";
      cityBox.hidden = names.length < 2;
      cityBox.onclick = e => {
        const btn = e.target.closest("[data-city]"); if (!btn) return;
        fit(groups[btn.dataset.city]);
        $$("[data-city]", cityBox).forEach(x => x.setAttribute("aria-pressed", String(x === btn)));
      };
    }
    const mapEl = $("#map");
    async function initMap() {
      if (map) return;
      try {
        L = await loadLeaflet();
        mapEl.innerHTML = "";
        map = L.map(mapEl, { zoomControl: true, scrollWheelZoom: true, attributionControl: true }).setView([36.74, 3.05], 11);
        L.tileLayer(TILES, { attribution: TILES_ATTR, subdomains: "abcd", maxZoom: 19 }).addTo(map);
        layer = L.layerGroup().addTo(map);
        const Cities = L.Control.extend({ onAdd() { const d = L.DomUtil.create("div", "map-cities"); d.setAttribute("role", "group"); d.setAttribute("aria-label", "Aller à la ville"); L.DomEvent.disableClickPropagation(d); return d; } });
        cityBox = new Cities({ position: "topright" }).addTo(map).getContainer();
        updateMarkers();
      } catch (e) { mapFailed(mapEl); }
    }
    const mqMap = matchMedia("(min-width: 1100px)");
    if (mqMap.matches) onVisible(mapEl, initMap, "0px");
    mqMap.addEventListener("change", e => { if (e.matches) { closeMap(); initMap().then(() => map && map.invalidateSize()); } });
    function openMap() {
      document.body.classList.add("map-open"); lock(true);
      $$("[data-map-toggle]").forEach(b => b.setAttribute("aria-pressed", "true"));
      initMap().then(() => { if (map) { map.invalidateSize(); updateMarkers(); } });
    }
    function closeMap() {
      if (!document.body.classList.contains("map-open")) return;
      document.body.classList.remove("map-open"); lock(false);
      $$("[data-map-toggle]").forEach(b => b.setAttribute("aria-pressed", "false"));
    }
    $$("[data-map-toggle]").forEach(b => b.addEventListener("click", () => document.body.classList.contains("map-open") ? closeMap() : openMap()));

    render();
  }

  /* ======================================================================
     PAGE D'UNE ANNONCE
     ====================================================================== */
  if (page === "bien") {
    const data = JSON.parse($("#bienData").textContent);
    // galerie
    const lb = $("#lightbox"), lbImg = $("[data-lb-img]", lb);
    let idx = 0, opener = null;
    function show(i) {
      idx = (i + data.photos.length) % data.photos.length;
      const [src, alt] = data.photos[idx];
      lbImg.src = B.img(src, 1800, 0, 80); lbImg.alt = alt;
      $("[data-lb-cap]", lb).textContent = alt;
      $("[data-lb-count]", lb).textContent = `${idx + 1} / ${data.photos.length}`;
    }
    $$("[data-photo]").forEach(b => b.addEventListener("click", () => {
      opener = b; show(+b.dataset.photo);
      if (typeof lb.showModal === "function") { lb.showModal(); lock(true); } else openLink(lbImg.src);
    }));
    $$("[data-lb-step]", lb).forEach(b => b.addEventListener("click", () => show(idx + +b.dataset.lbStep)));
    $("[data-lb-close]", lb).addEventListener("click", () => lb.close());
    lb.addEventListener("click", e => { if (e.target === lb || e.target.classList.contains("lb-stage")) lb.close(); });
    lb.addEventListener("keydown", e => { if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1); });
    lb.addEventListener("close", () => { lock(false); if (opener) opener.focus(); });
    let sx = null;
    lb.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); sx = null; });

    // demande de visite
    const vf = $("#visitForm"), vOpen = $("[data-visit-open]");
    const days = vf.elements.day, n = +days.dataset.days || 10;
    const fmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let opts = "", added = 0;
    for (let k = 1; added < n && k < 30; k++) {
      const d = new Date(today); d.setDate(today.getDate() + k);
      if (d.getDay() === 5) continue; // fermé le vendredi
      const t = fmt.format(d);
      opts += `<option>${k === 1 ? "Demain, " + t : t.charAt(0).toUpperCase() + t.slice(1)}</option>`; added++;
    }
    days.innerHTML = opts;
    function openVisit(focus) {
      vf.hidden = false; vOpen.setAttribute("aria-expanded", "true");
      if (focus) setTimeout(() => days.focus({ preventScroll: true }), 50);
    }
    vOpen.addEventListener("click", () => { if (vf.hidden) openVisit(true); else { vf.hidden = true; vOpen.setAttribute("aria-expanded", "false"); } });
    const jump = $("[data-visit-jump]");
    if (jump) jump.addEventListener("click", () => { openVisit(false); scrollToEl($("#contactCard"), 20); setTimeout(() => days.focus({ preventScroll: true }), 900); });
    vf.addEventListener("submit", e => {
      e.preventDefault();
      const name = vf.elements.name.value.trim();
      const err = $("[data-err]", vf);
      if (name.length < 2) { err.textContent = "Indiquez votre nom pour que l'agent sache qui il reçoit."; err.hidden = false; vf.elements.name.setAttribute("aria-invalid", "true"); vf.elements.name.focus(); return; }
      err.hidden = true; vf.elements.name.removeAttribute("aria-invalid");
      openLink(B.wa(`Bonjour ${SITE.name}, je souhaite visiter le bien ${data.ref} (${data.title}).\n• Jour : ${days.value}\n• Moment : ${vf.elements.slot.value}\n• Nom : ${name}\n${data.url}`));
    });

    // partager
    const shareBtn = $("[data-share]");
    if (shareBtn) shareBtn.addEventListener("click", async () => {
      if (navigator.share) { try { await navigator.share({ title: data.title, url: data.url }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
      const label = shareBtn.querySelector("span");
      try { await navigator.clipboard.writeText(data.url); label.textContent = "Lien copié"; setTimeout(() => { label.textContent = "Partager"; }, 2200); }
      catch (e) { openLink(`https://wa.me/?text=${encodeURIComponent(data.title + " " + data.url)}`); }
    });

    // barre du bas (téléphone) : masquée quand la fiche contact ou le pied de page est visible
    const bar = $("#mbar");
    if (bar && "IntersectionObserver" in window) {
      const seen = new Set();
      const io = new IntersectionObserver(es => { es.forEach(x => x.isIntersecting ? seen.add(x.target) : seen.delete(x.target)); bar.classList.toggle("away", seen.size > 0); });
      [$("#contactCard"), $(".ft")].forEach(x => x && io.observe(x));
    }

    // petite carte du secteur
    const mm = $("#minimap");
    onVisible(mm, async () => {
      try {
        const L = await loadLeaflet();
        mm.innerHTML = "";
        const ll = [+mm.dataset.lat, +mm.dataset.lng];
        const touch = matchMedia("(pointer: coarse)").matches;
        const map = L.map(mm, { scrollWheelZoom: false, dragging: !touch, tap: false, zoomControl: true }).setView(ll, 14);
        L.tileLayer(TILES, { attribution: TILES_ATTR, subdomains: "abcd", maxZoom: 19 }).addTo(map);
        L.circle(ll, { radius: 380, color: "#1F4F9E", weight: 2, fillColor: "#1F4F9E", fillOpacity: 0.15 }).addTo(map);
      } catch (e) { mapFailed(mm); }
    });
  }

  /* ======================================================================
     ESTIMER MON BIEN
     ====================================================================== */
  if (page === "estimer") {
    const f = $("#estForm"), steps = $$(".est-step", f), dots = $$(".est-steps li", f);
    const prev = $("[data-est-prev]", f), next = $("[data-est-next]", f);
    let step = 1;
    const val = n => { const e = f.elements[n]; return e ? (e.value != null ? e.value : "") : ""; };
    const radio = n => { const c = f.querySelector(`input[name="${n}"]:checked`); return c ? c.value : ""; };
    function applyType() {
      const t = radio("type");
      const bati = t !== "terrain", appart = ["appartement", "duplex", "niveau"].includes(t);
      $$("[data-only]", f).forEach(x => { x.hidden = x.dataset.only === "bati" ? !bati : !appart; });
    }
    function err(st, msg, field) {
      const e = $("[data-err]", steps[st - 1]);
      e.textContent = msg || ""; e.hidden = !msg;
      if (field) { field.setAttribute("aria-invalid", msg ? "true" : "false"); if (msg) field.focus(); }
      return !msg;
    }
    function validate(st) {
      if (st === 1) return err(1, val("quartier") ? "" : "Choisissez le quartier du bien.", f.elements.quartier);
      if (st === 2) { const s = +val("surface"); return err(2, s >= 15 && s <= 5000 ? "" : "Indiquez la surface en m² (entre 15 et 5 000).", f.elements.surface); }
      return true;
    }
    function rangeText(lo, hi, rent) {
      const per = rent ? " par mois" : "";
      if (mode === "da") return `Entre ${B.num(lo)} et ${B.num(hi)} DA${per}`;
      const a = B.cts(lo), b = B.cts(hi);
      const ua = a.replace(/^[\d,\s ]+/, ""), ub = b.replace(/^[\d,\s ]+/, "");
      const unit = u => u.replace(/^milliard$/, "milliards").replace(/^million$/, "millions");
      if (unit(ua) === unit(ub)) return `Entre ${a.replace(ua, "").trim()} et ${b.replace(ub, "").trim()} ${unit(ub)}${per}`;
      return `Entre ${a} et ${b}${per}`;
    }
    function estimate() {
      const q = B.quartier(val("quartier")); if (!q) return;
      const t = radio("type"), goal = radio("goal"), s = +val("surface");
      const typeK = { appartement: 1, duplex: 1.05, villa: 1.12, niveau: 0.92, terrain: 0.6, local: 1.1 }[t] || 1;
      let v = q.m2 * typeK * s;
      if (t !== "terrain") v *= +radio("etat") || 1;
      if (["appartement", "duplex", "niveau"].includes(t)) {
        const et = +val("etage"), lift = f.elements.ascenseur.checked;
        if (et === 0) v *= 0.95;
        if (et >= 4 && !lift) v *= 0.93;
        if (lift) v *= 1.02;
      }
      v *= +val("papiers") || 1;
      if (f.elements.parking.checked) v *= 1.03;
      if (f.elements.vue.checked) v *= 1.08;
      const rent = goal === "location";
      if (rent) v *= 0.0034;
      const round = rent ? 1000 : 100000;
      const lo = Math.round(v * 0.92 / round) * round, hi = Math.round(v * 1.08 / round) * round;
      $("[data-est-label]", f).textContent = rent ? "Estimation du loyer mensuel" : "Estimation du prix de vente";
      $("[data-est-range]", f).textContent = rangeText(lo, hi, rent);
      $("[data-est-da]", f).textContent = mode === "da" ? `Soit ${B.cts(lo)} à ${B.cts(hi)}${rent ? " par mois" : ""}` : `Soit ${B.num(lo)} à ${B.num(hi)} DA${rent ? " par mois" : ""}`;
      $("[data-est-note]", f).textContent = `Calculé avec un prix moyen de ${B.num(q.m2)} DA le m² à ${q.name}${t === "terrain" ? " (corrigé pour un terrain)" : ""}. La visite permet d'affiner : vue, exposition, travaux, voisinage.`;
      f.dataset.lo = lo; f.dataset.hi = hi;
    }
    function go(n) {
      step = n;
      steps.forEach((s, i) => { s.hidden = i !== n - 1; });
      dots.forEach((d, i) => { d.classList.toggle("done", i < n - 1); if (i === n - 1) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current"); });
      prev.hidden = n === 1; next.hidden = n === 3;
      if (n === 3) estimate();
      const first = steps[n - 1].querySelector("input:not([type=hidden]), select");
      if (first && n !== 1) setTimeout(() => first.focus({ preventScroll: true }), 30);
      if (f.getBoundingClientRect().top < hdH()) scrollToEl(f, 20);
    }
    next.addEventListener("click", () => { if (validate(step)) go(step + 1); });
    prev.addEventListener("click", () => go(step - 1));
    f.addEventListener("change", e => { if (e.target.name === "type") applyType(); if (step === 3) estimate(); });
    f.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.tagName === "INPUT" && step < 3) { e.preventDefault(); next.click(); } });
    document.addEventListener("bayt:currency", () => { if (step === 3) estimate(); });
    f.addEventListener("submit", e => {
      e.preventDefault();
      const name = val("name").trim(), phone = val("phone").replace(/[\s.-]/g, "").replace(/^\+213/, "0").replace(/^00213/, "0");
      if (name.length < 2) return err(3, "Indiquez votre nom.", f.elements.name);
      f.elements.name.setAttribute("aria-invalid", "false");
      if (!/^0[567]\d{8}$/.test(phone)) return err(3, "Numéro mobile : 10 chiffres commençant par 05, 06 ou 07.", f.elements.phone);
      err(3, "", f.elements.phone);
      const q = B.quartier(val("quartier")), t = radio("type");
      const typeTxt = { appartement: "Appartement", duplex: "Duplex", villa: "Villa", niveau: "Niveau de villa", terrain: "Terrain", local: "Local ou bureaux" }[t];
      const lines = [
        `Bonjour ${SITE.name}, je souhaite ${radio("goal") === "location" ? "mettre en location" : "vendre"} mon bien et demander une visite d'estimation.`,
        `• Bien : ${typeTxt}${t !== "terrain" && t !== "local" && t !== "villa" ? " F" + val("pieces") : ""}, ${val("surface")} m²`,
        `• Quartier : ${q.name} (${q.wilaya})`,
        ["appartement", "duplex", "niveau"].includes(t) ? `• Étage : ${f.elements.etage.options[f.elements.etage.selectedIndex].text}${f.elements.ascenseur.checked ? ", avec ascenseur" : ""}` : null,
        t !== "terrain" ? `• État : ${f.querySelector('input[name="etat"]:checked').nextElementSibling.textContent}` : null,
        `• Papiers : ${f.elements.papiers.options[f.elements.papiers.selectedIndex].text}`,
        (f.elements.parking.checked || f.elements.vue.checked) ? `• Avec : ${[f.elements.parking.checked && "parking", f.elements.vue.checked && "vue mer"].filter(Boolean).join(", ")}` : null,
        `• Estimation en ligne : ${B.cts(+f.dataset.lo)} à ${B.cts(+f.dataset.hi)}${radio("goal") === "location" ? " par mois" : ""}`,
        `• Nom : ${name}`, `• Téléphone : ${phone}`
      ].filter(Boolean);
      openLink(B.wa(lines.join("\n")));
    });
    applyType();
  }

  /* ======================================================================
     L'AGENCE : formulaire de contact
     ====================================================================== */
  if (page === "agence") {
    const f = $("#contactForm");
    f.addEventListener("submit", e => {
      e.preventDefault();
      const name = f.elements.name.value.trim(), e1 = $("[data-err]", f);
      if (name.length < 2) { e1.textContent = "Indiquez votre nom."; e1.hidden = false; f.elements.name.setAttribute("aria-invalid", "true"); f.elements.name.focus(); return; }
      e1.hidden = true; f.elements.name.removeAttribute("aria-invalid");
      const msg = f.elements.msg.value.trim();
      openLink(B.wa(`Bonjour ${SITE.name}, je suis ${name}.\n${f.elements.topic.value}.${msg ? "\n" + msg : ""}`));
    });
  }

  /* ======================================================================
     FAVORIS
     ====================================================================== */
  if (page === "favoris") {
    const grid = $("#favGrid"), emptyEl = $("#favEmpty"), actions = $("#favActions");
    function renderFavs() {
      const list = favs.map(r => B.bien(r)).filter(Boolean);
      grid.innerHTML = list.map(b => B.cardHTML(b)).join("");
      applyCurrency(grid); syncFavs(grid);
      emptyEl.hidden = list.length > 0; actions.hidden = list.length === 0; grid.hidden = list.length === 0;
      $("[data-fav-lead]").textContent = list.length ? `${list.length} ${list.length > 1 ? "annonces enregistrées" : "annonce enregistrée"} sur cet appareil.` : "Les annonces que vous enregistrez avec le cœur apparaissent ici, sur cet appareil.";
      $("#favShare").href = B.wa(`Bonjour ${SITE.name}, voici les annonces qui m'intéressent :\n${list.map(b => `• ${b.ref} : ${B.typeLabel(b)} à ${B.quartier(b.quartier).name}, ${B.cts(b.prix)}${b.transaction === "location" ? " par mois" : ""}\n  ${location.origin}${B.url(b)}`).join("\n")}`);
    }
    document.addEventListener("bayt:favs", renderFavs);
    $("#favClear").addEventListener("click", () => { favs = []; store.set("bayt:fav", favs); syncFavs(); renderFavs(); });
    renderFavs();
  }
})();
