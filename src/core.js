/* ==========================================================================
   BAYT IMMOBILIER · fonctions partagées
   Utilisées à la fois par build.js (génération des pages) et par le navigateur.
   ========================================================================== */
(function (w) {
  const B = (w.BAYT = w.BAYT || {});
  const SITE = w.SITE, QUARTIERS = w.QUARTIERS, BIENS = w.BIENS, AGENTS = w.AGENTS;

  /* ---------- petits outils ---------- */
  B.esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  B.quartier = id => QUARTIERS.find(q => q.id === id);
  B.agent = id => AGENTS.find(a => a.id === id);
  B.bien = ref => BIENS.find(b => b.ref === ref);
  B.url = b => `/bien/${b.slug}/`;
  B.wa = text => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
  B.initials = name => name.split(/\s+/).map(p => p[0]).slice(0, 2).join("");

  // 54000000 -> "54 000 000"
  B.num = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  // 1.95 -> "1,95" ; 5.40 -> "5,4"
  const dec = (x, d = 2) => {
    const r = Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
    return String(r).replace(".", ",");
  };
  B.dec = dec;

  /* ---------- prix : dinars et centimes ----------
     1 DA = 100 centimes. 54 000 000 DA = 5,4 milliards (de centimes). */
  B.cts = da => {
    const c = da * 100;
    if (c >= 1e9) { const v = c / 1e9; return `${dec(v)} ${v < 2 ? "milliard" : "milliards"}`; }
    if (c >= 1e6) { const v = c / 1e6; return `${dec(v)} ${v < 2 ? "million" : "millions"}`; }
    return `${B.num(c)} centimes`;
  };
  B.da = da => `${B.num(da)} DA`;
  // texte principal / secondaire selon le mode choisi par le visiteur ("cts" ou "da")
  B.priceParts = (da, rent, mode, suffix) => {
    const per = rent ? " / mois" : (suffix || "");
    const cts = B.cts(da) + per, dz = B.da(da) + per;
    return mode === "da" ? { main: dz, sub: cts } : { main: cts, sub: dz };
  };
  B.priceHTML = (da, rent, cls = "", mode = "cts", suffix = "") => {
    const p = B.priceParts(da, rent, mode, suffix);
    return `<span class="pr ${cls}" data-da="${Math.round(da)}"${rent ? ' data-rent="1"' : ""}${suffix ? ` data-suffix="${B.esc(suffix)}"` : ""}><span class="pr-main">${p.main}</span><span class="pr-sub">${p.sub}</span></span>`;
  };
  // libellé court pour les marqueurs de la carte
  B.short = (da, mode) => {
    if (mode === "da") return da >= 1e6 ? `${dec(da / 1e6, 1)} M DA` : `${Math.round(da / 1000)} k DA`;
    const c = da * 100;
    return c >= 1e9 ? `${dec(c / 1e9, 2)} Md` : `${dec(c / 1e6, 1)} M`;
  };

  /* ---------- images ----------
     "photo-…" = photo Unsplash ; tout autre texte = chemin vers votre propre fichier */
  B.img = (src, wd, h, q = 72) => src.startsWith("photo-")
    ? `https://images.unsplash.com/${src}?auto=format&fit=crop&w=${wd}${h ? `&h=${h}` : ""}&q=${q}`
    : src;
  B.srcset = (src, ratio, widths = [480, 800, 1200]) => src.startsWith("photo-")
    ? widths.map(wd => `${B.img(src, wd, ratio ? Math.round(wd * ratio) : 0)} ${wd}w`).join(", ")
    : "";

  /* ---------- libellés ---------- */
  B.typeLabel = b => ({
    appartement: `Appartement F${b.pieces}`,
    duplex: `Duplex F${b.pieces}`,
    niveau: `Niveau de villa F${b.pieces}`,
    villa: "Villa",
    terrain: "Terrain",
    local: "Bureaux"
  })[b.type] + (b.meuble ? " meublé" : "");
  B.floorLabel = b => b.etage == null ? "" : b.etage === 0 ? "Rez-de-chaussée" : `${b.etage}${b.etage === 1 ? "er" : "e"} étage`;
  B.isNew = b => b.etat === "Neuf";

  /* ---------- icônes (sprite injecté dans chaque page) ---------- */
  const I = {
    area: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/><path d="M8 8h8v8H8z" opacity=".35"/>',
    bed: '<path d="M3 18v-6.5A2.5 2.5 0 0 1 5.5 9h13a2.5 2.5 0 0 1 2.5 2.5V18M3 15h18M3 18v2M21 18v2"/><path d="M6 9V6.5A1.5 1.5 0 0 1 7.5 5h3A1.5 1.5 0 0 1 12 6.5V9"/>',
    bath: '<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM6 12V6a2 2 0 0 1 3.6-1.2M7 19l-1 2M17 19l1 2"/>',
    floor: '<path d="M4 20h4v-4h4v-4h4V8h4"/>',
    lift: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9.5 9.5 12 7l2.5 2.5M9.5 14.5 12 17l2.5-2.5"/>',
    car: '<path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3zM7 19v1.5M17 19v1.5"/><circle cx="8" cy="13.5" r=".9"/><circle cx="16" cy="13.5" r=".9"/>',
    sea: '<path d="M3 15c1.5 0 1.5-1.5 3-1.5s1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5M3 19c1.5 0 1.5-1.5 3-1.5s1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5"/><circle cx="16" cy="7" r="2.5"/>',
    doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 15.5h5"/>',
    sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M2.5 13a1.5 1.5 0 0 1 3 0v1h13v-1a1.5 1.5 0 0 1 3 0V18h-19zM5 18v2M19 18v2"/>',
    plot: '<path d="M4 7l6-3 10 4-2 12-12-2z"/><path d="M10 4l-1 15" opacity=".4"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    wa: '<path d="M12.04 2a9.93 9.93 0 0 0-8.5 15.05L2 22l5.08-1.5A9.93 9.93 0 1 0 12.04 2zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.02.9.9-2.94-.2-.3a8.18 8.18 0 1 1 6.8 3.67zm4.5-6.12c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.77.96-.14.17-.28.19-.53.06a6.7 6.7 0 0 1-3.32-2.9c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.86 2.04c0 1.2.88 2.37 1 2.53.12.17 1.73 2.64 4.2 3.7 1.56.67 2.17.73 2.95.62.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.17-.47-.29z" fill="currentColor" stroke="none"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8 15.8 7.2M8.2 13.2l7.6 3.6"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    chevl: '<path d="M15 5l-7 7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6zM9 4v14M15 6v14"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 7h8M8 11h2M12 11h0M14 11h2M8 15h2M14 15h2M8 18h2M14 18h2"/>'
  };
  B.ICONS = I;
  B.sprite = () => `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${Object.entries(I).map(([k, v]) =>
    `<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${v}</symbol>`).join("")}</svg>`;
  B.icon = (k, cls = "ic") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${k}"/></svg>`;

  /* ---------- plaque de rue (bleu émaillé, comme à Alger) ---------- */
  B.plaque = (q, cls = "") => q ? `<span class="plaque ${cls}"><b>${B.esc(q.name)}</b><i lang="ar" dir="rtl">${q.ar}</i></span>` : "";

  /* ---------- caractéristiques courtes (cartes) ---------- */
  B.specs = b => {
    const s = [];
    if (b.type === "terrain") s.push(["plot", `${B.num(b.surface)} m²`]);
    else s.push(["area", `${B.num(b.surface)} m²`]);
    if (b.chambres) s.push(["bed", `${b.chambres} ${b.chambres > 1 ? "chambres" : "chambre"}`]);
    if (b.type === "villa" && b.terrain) s.push(["plot", `Terrain ${B.num(b.terrain)} m²`]);
    else if (b.etage != null) s.push(["floor", B.floorLabel(b)]);
    return s;
  };

  /* ---------- carte d'annonce ---------- */
  B.cardHTML = (b, opts = {}) => {
    const q = B.quartier(b.quartier) || {};
    const rent = b.transaction === "location";
    const cover = b.photos[0];
    const tag = b.etat === "Neuf" && b.annee > 2026 ? "Sur plan" : b.nouveau ? "Nouveau" : b.coupDeCoeur ? "Coup de cœur" : "";
    const lazy = opts.eager ? 'fetchpriority="high"' : 'loading="lazy"';
    return `<article class="card" data-ref="${b.ref}">
  <div class="card-media">
    <img ${lazy} decoding="async" src="${B.img(cover[0], 800, 600)}" srcset="${B.srcset(cover[0], 0.75, [420, 640, 900])}" sizes="(min-width:1200px) 30vw, (min-width:700px) 45vw, 92vw" width="800" height="600" alt="${B.esc(cover[1])}">
    ${B.plaque(q, "plaque-sm")}
    ${tag ? `<span class="tag">${tag}</span>` : ""}
  </div>
  <button class="fav" type="button" data-fav="${b.ref}" aria-pressed="false" aria-label="Favori : ${B.esc(B.typeLabel(b))} à ${B.esc(q.name)}">${B.icon("heart")}</button>
  <div class="card-body">
    <p class="card-price">${B.priceHTML(b.prix, rent)}</p>
    <h3 class="card-title"><a href="${B.url(b)}">${B.esc(B.typeLabel(b))} <span class="card-place">à ${B.esc(q.name)}</span></a></h3>
    <p class="card-sub">${B.esc(b.titre)}</p>
    <ul class="specs">${B.specs(b).map(([i, t]) => `<li>${B.icon(i)}${t}</li>`).join("")}</ul>
  </div>
</article>`;
  };

  /* ---------- plan indicatif (SVG) ----------
     Chaque modèle décrit les pièces sur une grille ; les surfaces affichées sont
     recalculées pour correspondre à la surface de l'annonce. */
  const PLANS = {
    f2: { levels: [{ w: 10, h: 7, rooms: [
      ["Séjour", 0, 0, 6, 4.2], ["Chambre", 6, 0, 4, 4.2], ["Cuisine", 0, 4.2, 3.4, 2.8], ["Entrée", 3.4, 4.2, 2.8, 2.8], ["Sdb", 6.2, 4.2, 3.8, 2.8]
    ], extra: [["Balcon", 0, -1.3, 6, 1.3]] }] },
    f3: { levels: [{ w: 12, h: 8, rooms: [
      ["Séjour", 0, 0, 6.5, 4.5], ["Chambre 1", 6.5, 0, 5.5, 4.5], ["Cuisine", 0, 4.5, 3.5, 3.5], ["Couloir", 3.5, 4.5, 2, 3.5], ["Sdb", 5.5, 4.5, 2.5, 3.5], ["Chambre 2", 8, 4.5, 4, 3.5]
    ], extra: [["Balcon", 0, -1.3, 6.5, 1.3]] }] },
    f4: { levels: [{ w: 14, h: 9, rooms: [
      ["Séjour", 0, 0, 7, 4.6], ["Chambre 1", 7, 0, 3.6, 4.6], ["Chambre 2", 10.6, 0, 3.4, 4.6], ["Cuisine", 0, 4.6, 3.5, 4.4], ["Couloir", 3.5, 4.6, 2, 4.4], ["Sdb", 5.5, 4.6, 2.6, 2.4], ["WC", 5.5, 7, 2.6, 2], ["Chambre 3", 8.1, 4.6, 5.9, 4.4]
    ], extra: [["Balcon", 0, -1.3, 7, 1.3]] }] },
    f5: { levels: [{ w: 16, h: 10, rooms: [
      ["Séjour", 0, 0, 8, 5], ["Chambre 1", 8, 0, 4, 5], ["Chambre 2", 12, 0, 4, 5], ["Cuisine", 0, 5, 4, 5], ["Couloir", 4, 5, 2, 5], ["Sdb", 6, 5, 3, 2.5], ["Salle d'eau", 6, 7.5, 3, 2.5], ["Chambre 3", 9, 5, 3.5, 5], ["Chambre 4", 12.5, 5, 3.5, 5]
    ], extra: [["Terrasse", 0, -1.6, 8, 1.6]] }] },
    villa: { levels: [
      { label: "Rez-de-chaussée", w: 12, h: 10, rooms: [["Salon", 0, 0, 7, 5], ["Salle à manger", 7, 0, 5, 5], ["Cuisine", 0, 5, 4.5, 5], ["Hall", 4.5, 5, 3, 5], ["Studio", 7.5, 5, 4.5, 5]], extra: [["Terrasse", 0, -1.6, 12, 1.6]] },
      { label: "Étage", w: 12, h: 10, rooms: [["Suite", 0, 0, 6, 5], ["Chambre 2", 6, 0, 6, 5], ["Chambre 3", 0, 5, 4.5, 5], ["Sdb", 4.5, 5, 3, 2.6], ["Dressing", 4.5, 7.6, 3, 2.4], ["Chambre 4", 7.5, 5, 4.5, 5]] }
    ] },
    local: { levels: [{ w: 13, h: 9, rooms: [
      ["Open space", 0, 0, 9, 6.5], ["Bureau 1", 9, 0, 4, 3.25], ["Bureau 2", 9, 3.25, 4, 3.25], ["Accueil", 0, 6.5, 6, 2.5], ["Kitchenette", 6, 6.5, 3.5, 2.5], ["WC", 9.5, 6.5, 3.5, 2.5]
    ] }] }
  };
  B.planSVG = b => {
    if (b.plan === "terrain") return terrainSVG(b);
    const P = PLANS[b.plan]; if (!P) return "";
    const U = 34, pad = 18, gap = 46;
    let total = 0;
    P.levels.forEach(l => l.rooms.forEach(r => { total += r[3] * r[4]; }));
    const k = b.surface / total;
    let x0 = pad, maxH = 0, out = "";
    const top = (P.levels.some(l => l.extra) ? 1.6 * U : 0) + pad;
    const labelH = P.levels.some(l => l.label) ? 26 : 0;
    P.levels.forEach(l => {
      const ox = x0, oy = top + labelH;
      const topY = (l.extra || []).reduce((m, e) => Math.min(m, e[2]), 0);
      if (l.label) out += `<text class="pl-lvl" x="${ox}" y="${oy + topY * U - 10}">${l.label}</text>`;
      (l.extra || []).forEach(([n, x, y, rw, rh]) => {
        out += `<rect class="pl-ext" x="${ox + x * U}" y="${oy + y * U}" width="${rw * U}" height="${rh * U}"/><text class="pl-n" x="${ox + (x + rw / 2) * U}" y="${oy + (y + rh / 2) * U + 4}">${n}</text>`;
      });
      l.rooms.forEach(([n, x, y, rw, rh]) => {
        const cx = ox + (x + rw / 2) * U, cy = oy + (y + rh / 2) * U;
        const fs = Math.max(9, Math.min(13, (rw * U - 8) / (n.length * 0.58)));
        const area = Math.round(rw * rh * k);
        out += `<rect class="pl-room" x="${ox + x * U}" y="${oy + y * U}" width="${rw * U}" height="${rh * U}"/>`;
        out += `<text class="pl-n" x="${cx}" y="${cy - (rh * U > 50 ? 2 : -4)}" style="font-size:${fs.toFixed(1)}px">${n}</text>`;
        if (rh * U > 50) out += `<text class="pl-a" x="${cx}" y="${cy + 14}">${area} m²</text>`;
      });
      out += `<rect class="pl-wall" x="${ox}" y="${oy}" width="${l.w * U}" height="${l.h * U}"/>`;
      x0 += l.w * U + gap; maxH = Math.max(maxH, oy + l.h * U);
    });
    const W = x0 - gap + pad, H = maxH + pad;
    return `<svg class="plan" viewBox="0 0 ${W} ${H}" role="img" aria-label="Plan indicatif : ${B.esc(B.typeLabel(b))}, ${b.surface} m²">${out}</svg>`;
  };
  function terrainSVG(b) {
    return `<svg class="plan" viewBox="0 0 460 340" role="img" aria-label="Plan du terrain de ${b.surface} m²">
  <rect class="pl-street" x="0" y="282" width="460" height="40"/><text class="pl-a" x="210" y="307">Rue principale</text>
  <rect class="pl-street" x="388" y="0" width="40" height="282"/><text class="pl-a" x="408" y="150" transform="rotate(-90 408 150)">Rue secondaire</text>
  <path class="pl-wall pl-plot" d="M60 40 L370 40 L370 270 L60 270 Z"/>
  <text class="pl-n" x="215" y="150" style="font-size:20px">${B.num(b.surface)} m²</text>
  <text class="pl-a" x="215" y="172">Terrain constructible</text>
  <text class="pl-a" x="215" y="262">25 m</text><text class="pl-a" x="360" y="160" transform="rotate(-90 360 160)">20 m</text>
  <g transform="translate(30 70)"><path d="M0 18 L8 -6 L16 18 L8 12 Z" class="pl-north"/><text class="pl-a" x="8" y="36">N</text></g>
</svg>`;
  }

  /* ---------- recherche : options partagées ---------- */
  B.KINDS = [
    ["", "un bien"], ["appartement", "un appartement"], ["f2", "un F2"], ["f3", "un F3"], ["f4", "un F4"], ["f5", "un F5 ou plus"],
    ["villa", "une villa"], ["niveau", "un niveau de villa"], ["terrain", "un terrain"], ["local", "des bureaux"]
  ];
  // budgets maximum en DA
  B.BUDGETS = {
    vente: [0, 15000000, 20000000, 30000000, 40000000, 60000000, 100000000, 200000000],
    location: [0, 60000, 90000, 120000, 160000, 250000]
  };
  B.budgetLabel = (da, t) => da ? `jusqu'à ${B.cts(da)}${t === "location" ? " par mois" : ""}` : "quel que soit le budget";
  B.places = () => {
    const out = [["", "partout"]];
    ["Alger", "Oran", "Tipaza"].forEach(wl => {
      const qs = QUARTIERS.filter(q => q.wilaya === wl && BIENS.some(b => b.quartier === q.id));
      if (wl !== "Tipaza") out.push([`w:${wl.toLowerCase()}`, `à ${wl}`]);
      qs.forEach(q => out.push([`q:${q.id}`, `à ${q.name}`]));
    });
    return out;
  };

  /* ---------- filtre des annonces ---------- */
  B.matches = (b, f) => {
    if (f.t && b.transaction !== f.t) return false;
    if (f.k) {
      if (/^f\d$/.test(f.k)) {
        const n = +f.k.slice(1);
        if (!b.pieces || !["appartement", "duplex", "niveau"].includes(b.type)) return false;
        if (n === 5 ? b.pieces < 5 : b.pieces !== n) return false;
      } else if (f.k === "appartement") { if (!["appartement", "duplex"].includes(b.type)) return false; }
      else if (b.type !== f.k) return false;
    }
    if (f.l) {
      const [kind, id] = f.l.split(":");
      const q = B.quartier(b.quartier);
      if (kind === "q" && b.quartier !== id) return false;
      if (kind === "w" && (!q || q.wilaya.toLowerCase() !== id)) return false;
    }
    if (f.max && b.prix > f.max) return false;
    if (f.min && b.prix < f.min) return false;
    if (f.smin && b.surface < f.smin) return false;
    if (f.ascenseur && !b.ascenseur) return false;
    if (f.parking && !b.parking) return false;
    if (f.vue && !b.vueMer) return false;
    if (f.meuble && !b.meuble) return false;
    if (f.livret && !/livret/i.test(b.papiers)) return false;
    if (f.neuf && b.etat !== "Neuf") return false;
    return true;
  };

  /* ---------- crédit immobilier ---------- */
  B.loan = (principal, ratePct, years) => {
    const n = years * 12, r = ratePct / 100 / 12;
    if (principal <= 0) return { monthly: 0, total: 0, interest: 0 };
    const m = r === 0 ? principal / n : principal * r / (1 - Math.pow(1 + r, -n));
    return { monthly: m, total: m * n, interest: m * n - principal };
  };
})(typeof window !== "undefined" ? window : globalThis);
