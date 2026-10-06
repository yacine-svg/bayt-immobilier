#!/usr/bin/env node
/* ==========================================================================
   BAYT IMMOBILIER · génération du site
   Lit src/data.js et écrit toutes les pages dans dist/ (une page par annonce).
   Aucune dépendance : `node build.js`. Vercel lance cette commande tout seul.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const PUB = path.join(ROOT, "public");
const OUT = path.join(ROOT, "dist");

/* ---------- charger les données et les fonctions partagées ---------- */
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["data.js", "core.js"]) vm.runInContext(fs.readFileSync(path.join(SRC, f), "utf8"), ctx, { filename: f });
const { SITE, QUARTIERS, BIENS, AGENTS, TEMOIGNAGES, BAYT: B } = ctx.window;
const esc = B.esc, I = B.icon;
const BASE = SITE.url.replace(/\/$/, "");

/* ---------- vérifications simples des données ---------- */
const problems = [];
const slugs = new Set(), refs = new Set();
BIENS.forEach(b => {
  if (slugs.has(b.slug)) problems.push(`slug en double : ${b.slug}`); slugs.add(b.slug);
  if (refs.has(b.ref)) problems.push(`référence en double : ${b.ref}`); refs.add(b.ref);
  if (!B.quartier(b.quartier)) problems.push(`${b.ref} : quartier inconnu "${b.quartier}"`);
  if (!b.photos || !b.photos.length) problems.push(`${b.ref} : aucune photo`);
  if (!/^[a-z0-9-]+$/.test(b.slug)) problems.push(`${b.ref} : slug invalide "${b.slug}" (minuscules, chiffres et tirets)`);
});
if (problems.length) { console.error("Erreurs dans src/data.js :\n- " + problems.join("\n- ")); process.exit(1); }

/* ---------- fichiers statiques ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
const hash = s => crypto.createHash("md5").update(s).digest("hex").slice(0, 8);
const V = {};
for (const f of ["styles.css", "data.js", "core.js", "app.js"]) {
  const s = fs.readFileSync(path.join(SRC, f), "utf8");
  fs.writeFileSync(path.join(OUT, "assets", f), s);
  V[f] = hash(s);
}
(function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    e.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
})(PUB, OUT);

/* ---------- morceaux communs ---------- */
const LOGO = `<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="currentColor"/><path fill="#fff" d="M5.5 25.5V16h7.5v9.5zM14 25.5V10h7.5v15.5zM22.5 25.5V14.5h4v11z"/><path fill="currentColor" d="M16.5 25.5v-4.2h2.5v4.2zM7.5 19h3v2.4h-3zM16.3 13h2.9v2.6h-2.9z"/></svg>`;
const waText = `Bonjour ${SITE.name}, `;
const NAV = [
  ["/annonces/?t=vente", "Acheter", "vente"],
  ["/annonces/?t=location", "Louer", "location"],
  ["/estimer/", "Estimer mon bien", "estimer"],
  ["/agence/", "L'agence", "agence"]
];
function header(active) {
  return `<header class="hd" id="hd">
  <div class="wrap hd-in">
    <a class="logo" href="/" aria-label="${SITE.name}, accueil">${LOGO}<span class="logo-word"><b>Bayt</b> Immobilier</span></a>
    <nav class="nav" aria-label="Navigation principale">
      ${NAV.map(([h, t, k]) => `<a href="${h}" data-nav="${k}"${active === k ? ' aria-current="page"' : ""}>${t}</a>`).join("")}
    </nav>
    <div class="hd-tools">
      <div class="cur" role="group" aria-label="Afficher les prix en">
        <button type="button" data-cur="cts" aria-pressed="true">Centimes</button><button type="button" data-cur="da" aria-pressed="false">DA</button>
      </div>
      <a class="hd-fav" href="/favoris/" aria-label="Mes favoris">${I("heart")}<span class="fav-count" data-fav-count hidden>0</span></a>
      <a class="btn btn-primary hd-wa" href="${B.wa(waText)}" target="_blank" rel="noopener">${I("wa")}<span>WhatsApp</span></a>
      <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Ouvrir le menu"><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" inert data-lenis-prevent>
  <div class="wrap menu-in">
    <nav aria-label="Navigation mobile">
      <a class="menu-lk" href="/">Accueil</a>
      ${NAV.map(([h, t]) => `<a class="menu-lk" href="${h}">${t}</a>`).join("")}
      <a class="menu-lk" href="/favoris/">Mes favoris <span class="fav-count" data-fav-count hidden>0</span></a>
    </nav>
    <div class="menu-foot">
      <div class="cur cur-lg" role="group" aria-label="Afficher les prix en">
        <button type="button" data-cur="cts" aria-pressed="true">Prix en centimes</button><button type="button" data-cur="da" aria-pressed="false">Prix en DA</button>
      </div>
      <a class="btn btn-primary btn-block" href="${B.wa(waText)}" target="_blank" rel="noopener">${I("wa")}Écrire sur WhatsApp</a>
      <a class="btn btn-line btn-block" href="tel:${SITE.phone.replace(/\s/g, "")}">${I("phone")}${SITE.phone}</a>
    </div>
  </div>
</div>`;
}
function footer() {
  return `<footer class="ft">
  <div class="wrap">
    <div class="ft-top">
      <div class="ft-brand">
        <a class="logo logo-light" href="/">${LOGO}<span class="logo-word"><b>Bayt</b> Immobilier</span></a>
        <p>Vente et location d'appartements, de villas, de terrains et de bureaux à Alger, Oran et Tipaza.</p>
        <a class="btn btn-light" href="${B.wa(waText)}" target="_blank" rel="noopener">${I("wa")}Écrire sur WhatsApp</a>
      </div>
      <div class="ft-col"><h2>Annonces</h2><ul>
        <li><a href="/annonces/?t=vente&amp;l=w:alger">Acheter à Alger</a></li>
        <li><a href="/annonces/?t=location&amp;l=w:alger">Louer à Alger</a></li>
        <li><a href="/annonces/?t=vente&amp;l=w:oran">Acheter à Oran</a></li>
        <li><a href="/annonces/?t=vente&amp;k=villa">Villas</a></li>
        <li><a href="/annonces/?t=vente&amp;k=terrain">Terrains</a></li>
      </ul></div>
      <div class="ft-col"><h2>L'agence</h2><ul>
        <li><a href="/estimer/">Estimer mon bien</a></li>
        <li><a href="/agence/">Nos bureaux</a></li>
        <li><a href="/favoris/">Mes favoris</a></li>
        <li><a href="tel:${SITE.phone.replace(/\s/g, "")}">${SITE.phone}</a></li>
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
      </ul></div>
      <div class="ft-col"><h2>Bureaux</h2>${SITE.offices.map(o => `<p><b>${o.city}</b><br>${esc(o.address)}<br>${esc(o.hours)}</p>`).join("")}</div>
    </div>
    <div class="ft-bottom">
      <p>© <span data-year>2026</span> ${SITE.name}. Site de démonstration : annonces, prix et avis sont fictifs. ${esc(SITE.agrement)}.</p>
      <p>Site réalisé par Nova Web Dz · @nova_webdz</p>
    </div>
  </div>
</footer>
<a class="fab" href="${B.wa(waText)}" target="_blank" rel="noopener" aria-label="Écrire sur WhatsApp">${I("wa")}</a>`;
}
function layout({ page, active, path: p, title, description, image, main, noindex }) {
  const url = BASE + p;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#1F4F9E">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_DZ">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${esc(image || BASE + "/og-image.jpg")}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sofia+Sans:ital,wght@0,300..800;1,400..600&family=Sofia+Sans+Condensed:wght@600;700;800&family=Noto+Kufi+Arabic:wght@500;700&display=swap">
<link rel="stylesheet" href="/assets/styles.css?v=${V["styles.css"]}">
<script>document.documentElement.classList.add("js")</script>
</head>
<body data-page="${page}">
${B.sprite()}
<a class="skip" href="#contenu">Aller au contenu</a>
${header(active)}
<main id="contenu">
${main}
</main>
${footer()}
<script src="/assets/data.js?v=${V["data.js"]}"></script>
<script src="/assets/core.js?v=${V["core.js"]}"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js" defer></script>
<script src="/assets/app.js?v=${V["app.js"]}" defer></script>
</body>
</html>
`;
}
function write(rel, html) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
const byDate = [...BIENS].sort((a, b) => b.date.localeCompare(a.date));
const sel = (opts, value) => opts.map(([v, t]) => `<option value="${esc(v)}"${String(v) === String(value) ? " selected" : ""}>${esc(t)}</option>`).join("");
const placeOpts = B.places();
const quartierOptions = (value, allowEmpty) => {
  let h = allowEmpty ? `<option value="">Choisir le quartier</option>` : "";
  ["Alger", "Oran", "Tipaza"].forEach(wl => {
    h += `<optgroup label="${wl}">${QUARTIERS.filter(q => q.wilaya === wl).map(q => `<option value="${q.id}"${q.id === value ? " selected" : ""}>${esc(q.name)}</option>`).join("")}</optgroup>`;
  });
  return h;
};
const fmtDate = d => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const photoAttrs = (src, wd, ratio, sizes) => `src="${B.img(src, wd, ratio ? Math.round(wd * ratio) : 0)}" srcset="${B.srcset(src, ratio, [640, 960, 1400, 2000].filter(x => x <= Math.max(wd * 1.6, 960)))}" sizes="${sizes}"`;

/* simulateur de crédit (accueil et pages de vente) */
function simulator(price, id = "sim") {
  const L = SITE.loan;
  return `<form class="sim" id="${id}" data-sim novalidate>
  <div class="sim-in">
    <div class="sim-row">
      <label for="${id}-price">Prix du bien</label>
      <output data-out="price">${B.priceHTML(price, false)}</output>
      <input type="range" id="${id}-price" name="price" min="5000000" max="200000000" step="500000" value="${price}">
    </div>
    <div class="sim-row">
      <label for="${id}-down">Apport personnel</label>
      <output data-out="down"></output>
      <input type="range" id="${id}-down" name="down" min="10" max="80" step="5" value="${L.downPct}" aria-valuetext="${L.downPct} %">
    </div>
    <div class="sim-two">
      <div><label for="${id}-years">Durée</label>
        <select class="field" id="${id}-years" name="years">${[10, 15, 20, 25, 30].map(y => `<option value="${y}"${y === L.years ? " selected" : ""}>${y} ans</option>`).join("")}</select></div>
      <div><label for="${id}-rate">Taux annuel</label>
        <div class="suffix"><input class="field" type="number" id="${id}-rate" name="rate" min="0" max="15" step="0.05" value="${L.rate}" inputmode="decimal"><span>%</span></div></div>
    </div>
  </div>
  <div class="sim-out" aria-live="polite">
    <p class="sim-label">Mensualité estimée</p>
    <p class="sim-big" data-out="monthly">–</p>
    <dl class="sim-dl">
      <div><dt>Montant emprunté</dt><dd data-out="loan">–</dd></div>
      <div><dt>Coût des intérêts</dt><dd data-out="interest">–</dd></div>
      <div><dt>Revenu mensuel conseillé</dt><dd data-out="income">–</dd></div>
    </dl>
    <p class="sim-note">Calcul indicatif. Les banques demandent en général que la mensualité ne dépasse pas ${Math.round(L.incomeRatio * 100)} % des revenus du ménage. Le taux dépend de votre banque et de votre dossier.</p>
  </div>
</form>`;
}

/* carte « coup de cœur » affichée dans l'en-tête de l'accueil */
function heroCard() {
  const f = byDate.find(b => b.coupDeCoeur) || byDate[0];
  const q = B.quartier(f.quartier), rent = f.transaction === "location";
  const [src, alt] = f.photos[0];
  return `<aside class="hero-side" aria-label="Coup de cœur de l'agence">
      <a class="hero-card" href="${B.url(f)}">
        <span class="hc-media"><img ${photoAttrs(src, 720, 0.7, "360px")} width="720" height="504" alt="${esc(alt)}">${B.plaque(q, "plaque-sm")}</span>
        <span class="hc-body">
          <span class="hc-label">${I("heart")}Coup de cœur de l'agence</span>
          ${B.priceHTML(f.prix, rent, "hc-price")}
          <span class="hc-title">${esc(B.typeLabel(f))} à ${esc(q.name)}</span>
          <span class="hc-sub">${esc(f.titre)}</span>
        </span>
      </a>
    </aside>`;
}

/* ==========================================================================
   ACCUEIL
   ========================================================================== */
function pageHome() {
  const t0 = "vente";
  const counts = id => BIENS.filter(b => b.quartier === id).length;
  const qs = [...QUARTIERS].sort((a, b) => counts(b.id) - counts(a.id) || b.m2 - a.m2);
  const main = `
<section class="hero" aria-labelledby="hero-h">
  <div class="hero-bg" aria-hidden="true">
    <img ${photoAttrs("photo-1706002027900-a1be40d0627e", 2000, 0.6, "100vw")} width="2000" height="1200" alt="" fetchpriority="high">
    <div class="shutters"><i></i><i></i></div>
  </div>
  <div class="wrap hero-in">
    <div class="hero-copy">
      <h1 id="hero-h" class="sr-only">${SITE.name} : appartements, villas et terrains à vendre et à louer à Alger et Oran</h1>
      <p class="hero-kicker">${B.plaque({ name: "Alger", ar: "الجزائر" }, "plaque-sm")}<span>Agence immobilière à Alger et à Oran, depuis 2011</span></p>
      <form class="sentence" id="sentence" action="/annonces/" method="get">
        <p class="sentence-text">
          Je cherche <span class="pick"><select name="k" aria-label="Type de bien">${sel(B.KINDS, "appartement")}</select></span>
          à <span class="pick"><select name="t" aria-label="Acheter ou louer"><option value="vente" selected>acheter</option><option value="location">louer</option></select></span>
          <span class="pick"><select name="l" aria-label="Où">${sel(placeOpts, "w:alger")}</select></span>,
          <span class="pick"><select name="max" aria-label="Budget maximum">${sel(B.BUDGETS[t0].map(v => [v || "", B.budgetLabel(v, t0)]), "")}</select></span>.
        </p>
        <div class="sentence-go">
          <button class="btn btn-mimosa btn-lg" type="submit"><span data-hero-count>Voir les annonces</span>${I("chev")}</button>
          <p class="sentence-hint" data-hero-hint aria-live="polite"></p>
        </div>
      </form>
      <nav class="hero-chips" aria-label="Recherches fréquentes">
        <a href="/annonces/?t=vente&amp;l=q:hydra">Acheter à Hydra</a>
        <a href="/annonces/?t=location&amp;l=w:alger">Louer à Alger</a>
        <a href="/annonces/?t=vente&amp;vue=1">Avec vue mer</a>
        <a href="/annonces/?t=vente&amp;k=villa">Villas</a>
        <a href="/annonces/?t=vente&amp;k=terrain">Terrains</a>
        <a href="/annonces/?t=vente&amp;l=w:oran">Oran</a>
      </nav>
    </div>
    ${heroCard()}
  </div>
</section>

<section class="sec latest" aria-labelledby="latest-h">
  <div class="wrap">
    <div class="sec-head">
      <h2 id="latest-h">Nouvelles annonces</h2>
      <div class="sec-tools">
        <a class="link" href="/annonces/">Voir les ${BIENS.length} annonces</a>
        <div class="scroll-btns"><button type="button" class="round" data-scroll="-1" aria-label="Annonces précédentes">${I("chevl")}</button><button type="button" class="round" data-scroll="1" aria-label="Annonces suivantes">${I("chev")}</button></div>
      </div>
    </div>
  </div>
  <div class="rail" data-rail tabindex="0" aria-label="Nouvelles annonces, faites défiler">
    ${byDate.slice(0, 8).map(b => B.cardHTML(b)).join("")}
  </div>
</section>

<section class="sec quartiers" aria-labelledby="q-h">
  <div class="wrap">
    <div class="sec-head">
      <h2 id="q-h">Par quartier</h2>
      <p class="sec-lead">Le prix moyen au mètre carré, d'après les ventes suivies par l'agence, et le nombre d'annonces en ce moment.</p>
    </div>
    <ul class="q-grid">
      ${qs.map(q => {
        const n = counts(q.id);
        return `<li><a class="q-item" href="/annonces/?l=q:${q.id}">
        ${B.plaque(q)}
        <span class="q-meta"><span class="q-price">${B.priceHTML(q.m2, false, "pr-inline", "cts", " le m²")}</span>
        <span class="q-count">${n ? `${n} ${n > 1 ? "annonces" : "annonce"}` : "Aucune annonce pour l'instant"}</span></span>
      </a></li>`;
      }).join("")}
    </ul>
  </div>
</section>

<section class="sec sell" aria-labelledby="sell-h">
  <div class="wrap sell-in">
    <div class="sell-copy">
      <h2 id="sell-h">Vous vendez ou vous mettez en location ?</h2>
      <p class="sec-lead">Nous estimons votre bien, nous nous occupons des photos et des visites, et nous vous accompagnons jusqu'au notaire.</p>
      <ol class="steps">
        <li><b>Estimation</b><span>Une première fourchette en ligne en une minute, puis une visite d'estimation gratuite sous 48 h.</span></li>
        <li><b>Annonce</b><span>Photos, plan et vérification des papiers : acte, livret foncier, permis.</span></li>
        <li><b>Visites</b><span>Nous filtrons les demandes et accompagnons chaque visite. Vous n'ouvrez qu'aux acheteurs sérieux.</span></li>
        <li><b>Signature</b><span>Promesse de vente, puis acte chez le notaire de votre choix.</span></li>
      </ol>
      <div class="btn-row">
        <a class="btn btn-mimosa" href="/estimer/">Estimer mon bien</a>
        <a class="btn btn-ghost-light" href="${B.wa(`${waText}je souhaite vendre ou louer mon bien.`)}" target="_blank" rel="noopener">${I("wa")}En parler sur WhatsApp</a>
      </div>
    </div>
    <figure class="sell-photo">
      <img loading="lazy" ${photoAttrs("photo-1723103639391-f4a06d660b20", 960, 1.2, "(min-width:1000px) 40vw, 100vw")} width="960" height="1152" alt="Immeuble blanc aux volets bleus, vu d'en bas">
    </figure>
  </div>
</section>

<section class="sec credit" aria-labelledby="credit-h">
  <div class="wrap credit-in">
    <div class="credit-copy">
      <h2 id="credit-h">Combien coûtera votre crédit ?</h2>
      <p class="sec-lead">Déplacez les curseurs pour voir la mensualité. Le même calcul est proposé sur chaque annonce à vendre, avec son prix.</p>
    </div>
    ${simulator(30000000, "simHome")}
  </div>
</section>

<section class="sec avis" aria-labelledby="avis-h">
  <div class="wrap">
    <div class="sec-head"><h2 id="avis-h">Ce que disent nos clients</h2><p class="sec-lead">Avis fictifs, pour la démonstration.</p></div>
    <div class="quotes">
      ${TEMOIGNAGES.map(t => `<figure class="quote"><blockquote>${esc(t.text)}</blockquote><figcaption><b>${esc(t.names)}</b><span>${esc(t.place)}</span></figcaption></figure>`).join("")}
    </div>
  </div>
</section>

<section class="sec band" aria-labelledby="band-h">
  <div class="wrap band-in">
    <h2 id="band-h">Une question sur une annonce ? Nous répondons sur WhatsApp, du samedi au jeudi.</h2>
    <div class="btn-row">
      <a class="btn btn-primary" href="${B.wa(`${waText}j'ai une question.`)}" target="_blank" rel="noopener">${I("wa")}Écrire sur WhatsApp</a>
      <a class="btn btn-line" href="tel:${SITE.phone.replace(/\s/g, "")}">${I("phone")}${SITE.phone}</a>
    </div>
  </div>
</section>`;
  write("index.html", layout({ page: "home", active: "", path: "/", title: `${SITE.name} · Appartements, villas et terrains à Alger et Oran`, description: SITE.description, main }));
}

/* ==========================================================================
   ANNONCES (liste + carte)
   ========================================================================== */
function pageList() {
  const main = `
<section class="list-top">
  <div class="list-band">
    <div class="wrap list-head">
      <div>
        <h1 id="listTitle">Biens à vendre et à louer</h1>
        <p class="list-count" id="listCount" aria-live="polite">${BIENS.length} annonces</p>
      </div>
      <p class="list-note">Chaque annonce est visitée par l'agence et ses papiers sont vérifiés. Le bouton Centimes / DA, en haut de la page, change l'affichage des prix.</p>
    </div>
  </div>
  <form class="filters" id="filters" action="/annonces/" method="get" data-lenis-prevent>
    <div class="wrap filters-in">
      <div class="seg" role="radiogroup" aria-label="Acheter ou louer">
        <label><input type="radio" name="t" value="vente" checked><span>Acheter</span></label>
        <label><input type="radio" name="t" value="location"><span>Louer</span></label>
      </div>
      <div class="filters-fields" id="filterFields">
        <div class="sheet-head"><p>Filtres</p><button type="button" class="round" data-close-sheet aria-label="Fermer les filtres">${I("close")}</button></div>
        <label class="f"><span>Type</span><select name="k">${sel(B.KINDS.map(([v, t]) => [v, v ? t.replace(/^(un|une|des) /, "").replace(/^./, c => c.toUpperCase()) : "Tous les types"]), "")}</select></label>
        <label class="f"><span>Où</span><select name="l">${sel(placeOpts.map(([v, t]) => [v, !v ? "Partout" : v.startsWith("w:") ? `${t.replace(/^à /, "")}, tous les quartiers` : t.replace(/^à /, "")]), "")}</select></label>
        <label class="f"><span>Budget</span><select name="max" data-budget></select></label>
        <details class="more">
          <summary>Plus de critères <span class="badge" data-more-count hidden></span></summary>
          <div class="more-in">
            <label class="f"><span>Surface minimum</span><select name="smin">${sel([["", "Toutes"], [50, "50 m² et plus"], [80, "80 m² et plus"], [100, "100 m² et plus"], [150, "150 m² et plus"], [300, "300 m² et plus"]], "")}</select></label>
            <fieldset class="checks"><legend>Avec</legend>
              ${[["ascenseur", "Ascenseur"], ["parking", "Parking"], ["vue", "Vue mer"], ["meuble", "Meublé"], ["livret", "Livret foncier"], ["neuf", "Neuf"]].map(([n, t]) => `<label class="chk"><input type="checkbox" name="${n}" value="1"><span>${t}</span></label>`).join("")}
            </fieldset>
          </div>
        </details>
        <div class="sheet-foot"><button type="button" class="btn btn-line" data-reset>Tout effacer</button><button type="button" class="btn btn-primary" data-close-sheet data-show-count>Voir les annonces</button></div>
      </div>
      <button type="button" class="btn btn-line btn-sm open-sheet" data-open-sheet aria-controls="filterFields" aria-expanded="false">${I("filter")}Filtres <span class="badge" data-filter-count hidden></span></button>
      <label class="f f-sort"><span class="sr-only">Trier</span><select name="sort" aria-label="Trier les annonces">${sel([["recent", "Plus récentes"], ["prix-asc", "Prix croissant"], ["prix-desc", "Prix décroissant"], ["surface", "Plus grandes"]], "recent")}</select></label>
      <button type="button" class="btn btn-line btn-sm map-btn" data-map-toggle aria-pressed="false">${I("map")}<span>Carte</span></button>
    </div>
  </form>
</section>
<div class="split">
  <div class="results">
    <div class="grid" id="results">${byDate.map(b => B.cardHTML(b)).join("")}</div>
    <div class="empty" id="empty" hidden>
      <p class="empty-t">Aucune annonce ne correspond à ces critères.</p>
      <p>Élargissez le budget ou le quartier, ou dites-nous ce que vous cherchez : nous vous écrivons dès qu'un bien correspond.</p>
      <div class="btn-row"><button type="button" class="btn btn-line" data-reset>Effacer les filtres</button><a class="btn btn-primary" id="alertWa" href="${B.wa(`${waText}je cherche un bien.`)}" target="_blank" rel="noopener">${I("wa")}Recevoir les nouvelles annonces</a></div>
    </div>
  </div>
  <aside class="map-col" aria-label="Carte des annonces">
    <div class="map" id="map" data-lenis-prevent><p class="map-msg">Chargement de la carte…</p></div>
    <button type="button" class="btn btn-primary map-close" data-map-toggle>${I("list")}Voir la liste</button>
  </aside>
</div>`;
  write("annonces/index.html", layout({ page: "list", active: "list", path: "/annonces/", title: `Annonces à vendre et à louer · ${SITE.name}`, description: `${BIENS.length} appartements, villas, terrains et bureaux à vendre ou à louer à Alger, Oran et Tipaza, avec carte et filtres.`, main }));
}

/* ==========================================================================
   PAGE D'UNE ANNONCE
   ========================================================================== */
function similar(b) {
  const group = x => x.type === "terrain" ? "terrain" : x.type === "local" ? "local" : "logement";
  const near = (x, y) => Math.abs(Math.log(x.prix / b.prix)) - Math.abs(Math.log(y.prix / b.prix));
  const pool = BIENS.filter(x => x.ref !== b.ref && x.transaction === b.transaction);
  const same = pool.filter(x => group(x) === group(b)).sort(near);
  const rest = pool.filter(x => group(x) !== group(b)).sort(near);
  return same.concat(rest).slice(0, 3);
}
function facts(b) {
  const f = [];
  f.push(["area", "Surface", `${B.num(b.surface)} m²`]);
  if (b.terrain) f.push(["plot", "Terrain", `${B.num(b.terrain)} m²`]);
  if (b.pieces) f.push(["grid", "Pièces", `F${b.pieces}`]);
  if (b.chambres) f.push(["bed", "Chambres", b.chambres]);
  if (b.sdb) f.push(["bath", "Salles de bains", b.sdb]);
  if (b.etage != null) f.push(["floor", "Étage", `${B.floorLabel(b)}${b.etages ? ` sur ${b.etages}` : ""}`]);
  else if (b.type === "villa" && b.etages) f.push(["floor", "Niveaux", b.etages]);
  if (b.type !== "terrain") {
    if (b.etage != null) f.push(["lift", "Ascenseur", b.ascenseur ? "Oui" : "Non"]);
    f.push(["car", "Parking", b.parking ? "Oui" : "Non"]);
  }
  if (b.vueMer) f.push(["sea", "Vue", "Mer"]);
  if (b.transaction === "location") f.push(["sofa", "Meublé", b.meuble ? "Oui" : "Non"]);
  if (b.annee) f.push(["key", b.annee > 2026 ? "Livraison" : "Construction", b.annee]);
  return f;
}
function pageBien(b) {
  const q = B.quartier(b.quartier), ag = B.agent(b.agent);
  const rent = b.transaction === "location";
  const typ = B.typeLabel(b);
  const h1 = `${typ} à ${q.name}`;
  const visitDays = 10;
  const msgInterest = `Bonjour ${SITE.name}, je suis intéressé(e) par l'annonce ${b.ref} : ${typ} à ${q.name} (${B.cts(b.prix)}${rent ? " par mois" : ""}). ${BASE}${B.url(b)}`;
  const ph = b.photos;
  const pricePerM2 = !rent && b.type !== "local" ? `<p class="per-m2">${B.priceHTML(b.prix / b.surface, false, "pr-inline", "cts", " le m²")}</p>` : "";
  const gallery = `
<section class="gallery wrap" aria-label="Photos">
  <div class="gal-grid gal-${Math.min(ph.length, 5)}">
    ${ph.slice(0, 5).map(([src, alt], i) => `<button type="button" class="gal-item${i === 0 ? " gal-main" : ""}" data-photo="${i}" aria-label="Agrandir la photo ${i + 1} sur ${ph.length} : ${esc(alt)}">
      <img ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} ${photoAttrs(src, i === 0 ? 1400 : 700, 0.68, i === 0 ? "(min-width:900px) 60vw, 100vw" : "(min-width:900px) 20vw, 50vw")} width="1400" height="952" alt="${esc(alt)}">
    </button>`).join("")}
    <span class="gal-count">${I("grid")}${ph.length} photos</span>
  </div>
</section>
</div>`;
  const sideCard = `
<div class="contact-card" id="contactCard">
  <div class="cc-price">${B.priceHTML(b.prix, rent, "pr-lg")}${pricePerM2}${rent && b.conditions ? `<p class="cc-cond">${esc(b.conditions)}</p>` : ""}</div>
  <div class="agent"><span class="avatar" aria-hidden="true">${B.initials(ag.name)}</span><div><p class="agent-n">${esc(ag.name)}</p><p class="agent-r">${esc(ag.role)}</p></div></div>
  <a class="btn btn-primary btn-block" href="${B.wa(msgInterest)}" target="_blank" rel="noopener">${I("wa")}Je suis intéressé(e)</a>
  <button type="button" class="btn btn-line btn-block" data-visit-open aria-expanded="false" aria-controls="visitForm">${I("cal")}Planifier une visite</button>
  <form class="visit" id="visitForm" hidden novalidate>
    <label class="f"><span>Jour</span><select name="day" data-days="${visitDays}"></select></label>
    <label class="f"><span>Moment</span><select name="slot"><option>Matin (9 h – 12 h)</option><option selected>Après-midi (14 h – 17 h)</option><option>Fin de journée (17 h – 18 h 30)</option></select></label>
    <label class="f"><span>Votre nom</span><input class="field" name="name" autocomplete="name" placeholder="Ex. Amine Belaïd"></label>
    <p class="err" data-err hidden></p>
    <button class="btn btn-primary btn-block" type="submit">${I("wa")}Envoyer la demande de visite</button>
    <p class="hint">La demande s'ouvre dans WhatsApp, déjà rédigée. L'adresse exacte vous est donnée à la confirmation.</p>
  </form>
  <div class="cc-row">
    <a class="btn btn-line btn-sm" href="tel:${SITE.phone.replace(/\s/g, "")}">${I("phone")}Appeler</a>
    <button type="button" class="btn btn-line btn-sm" data-fav="${b.ref}" aria-pressed="false">${I("heart")}<span>Favori</span></button>
    <button type="button" class="btn btn-line btn-sm" data-share>${I("share")}<span>Partager</span></button>
  </div>
  <p class="cc-ref">Réf. ${b.ref}, publiée le ${fmtDate(b.date)}</p>
</div>`;
  const main = `
<div class="bien-top">
<nav class="crumbs wrap" aria-label="Fil d'Ariane">
  <a href="/annonces/?t=${b.transaction}">${rent ? "Louer" : "Acheter"}</a><span aria-hidden="true">/</span>
  ${q.wilaya !== q.name ? `<a href="/annonces/?t=${b.transaction}&amp;l=w:${q.wilaya.toLowerCase()}">${q.wilaya}</a><span aria-hidden="true">/</span>` : ""}
  <a href="/annonces/?t=${b.transaction}&amp;l=q:${q.id}">${esc(q.name)}</a>
</nav>
${gallery}
<div class="wrap bien">
  <article class="bien-main">
    <header class="bien-head">
      ${B.plaque(q)}
      <h1>${esc(h1)}</h1>
      <p class="bien-sub">${esc(b.titre)}</p>
      <div class="bien-price">${B.priceHTML(b.prix, rent, "pr-lg")}${pricePerM2}</div>
    </header>
    <ul class="facts">${facts(b).map(([i, k, v]) => `<li>${I(i)}<span class="fk">${k}</span><span class="fv">${v}</span></li>`).join("")}</ul>
    <div class="papers">
      <p>${I("doc")}<span><b>Papiers</b>${esc(b.papiers)}</span></p>
      <p>${I("check")}<span><b>État</b>${esc(b.etat)}</span></p>
      ${rent && b.conditions ? `<p>${I("key")}<span><b>Conditions</b>${esc(b.conditions)}</span></p>` : ""}
    </div>
    <section class="bien-sec"><h2>Description</h2><p class="desc">${esc(b.description)}</p></section>
    <section class="bien-sec"><h2>Les plus</h2><ul class="atouts">${b.atouts.map(a => `<li>${I("check")}${esc(a)}</li>`).join("")}</ul></section>
    <section class="bien-sec"><h2>Plan indicatif</h2><div class="plan-box">${B.planSVG(b)}</div><p class="note"><span class="plan-hint">Faites glisser le plan pour le voir en entier. </span>Plan simplifié pour se repérer. Le plan exact est remis lors de la visite.</p></section>
    <section class="bien-sec"><h2>Emplacement</h2>
      <div class="minimap" id="minimap" data-lat="${b.lat}" data-lng="${b.lng}" data-lenis-prevent><p class="map-msg">Chargement de la carte…</p></div>
      <p class="note">${esc(q.name)}, ${q.wilaya}. Le cercle indique le secteur ; l'adresse exacte est communiquée quand la visite est confirmée.</p>
    </section>
    ${rent ? "" : `<section class="bien-sec"><h2>Simuler le crédit</h2>${simulator(Math.min(Math.max(Math.round(b.prix / 500000) * 500000, 5000000), 200000000), "simBien")}</section>`}
  </article>
  <aside class="bien-side" aria-label="Contacter l'agence">${sideCard}</aside>
</div>
<section class="sec similar" aria-labelledby="sim-h">
  <div class="wrap">
    <div class="sec-head"><h2 id="sim-h">${rent ? "Autres biens à louer" : "Dans la même gamme de prix"}</h2><a class="link" href="/annonces/?t=${b.transaction}">Toutes les annonces</a></div>
    <div class="grid grid-3">${similar(b).map(x => B.cardHTML(x)).join("")}</div>
  </div>
</section>
<div class="mbar" id="mbar">
  <div class="mbar-price">${B.priceHTML(b.prix, rent)}</div>
  <a class="btn btn-primary" href="${B.wa(msgInterest)}" target="_blank" rel="noopener">${I("wa")}WhatsApp</a>
  <button type="button" class="btn btn-line" data-visit-jump>${I("cal")}Visite</button>
</div>
<dialog class="lightbox" id="lightbox" aria-label="Photos de l'annonce" data-lenis-prevent>
  <div class="lb-in">
    <div class="lb-bar"><span data-lb-count></span><button type="button" class="round round-light" data-lb-close aria-label="Fermer">${I("close")}</button></div>
    <div class="lb-stage"><img data-lb-img alt=""></div>
    <p class="lb-cap" data-lb-cap></p>
    <button type="button" class="round round-light lb-prev" data-lb-step="-1" aria-label="Photo précédente">${I("chevl")}</button>
    <button type="button" class="round round-light lb-next" data-lb-step="1" aria-label="Photo suivante">${I("chev")}</button>
  </div>
</dialog>
<script type="application/json" id="bienData">${JSON.stringify({ ref: b.ref, photos: ph, url: BASE + B.url(b), title: h1, interest: msgInterest }).replace(/</g, "\\u003c")}</script>`;
  const cover = ph[0][0];
  const image = cover.startsWith("photo-") ? B.img(cover, 1200, 630, 80) : BASE + cover;
  const desc = `${B.cts(b.prix)}${rent ? " par mois" : ""} (${B.num(b.prix)} DA). ${B.num(b.surface)} m²${b.chambres ? `, ${b.chambres} ${b.chambres > 1 ? "chambres" : "chambre"}` : ""}. ${b.papiers}. ${b.titre}.`;
  write(`bien/${b.slug}/index.html`, layout({ page: "bien", active: rent ? "location" : "vente", path: B.url(b), title: `${h1} · ${B.cts(b.prix)}${rent ? " par mois" : ""} · ${SITE.name}`, description: desc, image, main }));
}

/* ==========================================================================
   ESTIMER MON BIEN
   ========================================================================== */
function pageEstimer() {
  const main = `
<section class="sec est">
  <div class="wrap est-in">
    <div class="est-intro">
      <h1>Combien vaut votre bien ?</h1>
      <p class="sec-lead">Répondez à quelques questions pour obtenir une première fourchette, calculée à partir des prix au mètre carré que l'agence suit dans chaque quartier.</p>
      <ul class="ticks">
        <li>${I("check")}Gratuit et sans engagement</li>
        <li>${I("check")}Visite d'estimation sous 48 h si vous le souhaitez</li>
        <li>${I("check")}Vos informations ne sont envoyées qu'à l'agence, sur WhatsApp</li>
      </ul>
    </div>
    <form class="est-form" id="estForm" novalidate>
      <ol class="est-steps" aria-label="Étapes">
        <li aria-current="step">Le bien</li><li>Les détails</li><li>L'estimation</li>
      </ol>
      <fieldset class="est-step" data-step="1">
        <legend class="sr-only">Le bien</legend>
        <div class="f-group"><p class="f-label" id="lbl-goal">Votre projet</p>
          <div class="tiles" role="radiogroup" aria-labelledby="lbl-goal">
            <label class="tile"><input type="radio" name="goal" value="vente" checked><span>Vendre</span></label>
            <label class="tile"><input type="radio" name="goal" value="location"><span>Mettre en location</span></label>
          </div></div>
        <div class="f-group"><p class="f-label" id="lbl-type">Type de bien</p>
          <div class="tiles tiles-3" role="radiogroup" aria-labelledby="lbl-type">
            ${[["appartement", "Appartement"], ["villa", "Villa"], ["niveau", "Niveau de villa"], ["duplex", "Duplex"], ["terrain", "Terrain"], ["local", "Local ou bureaux"]].map(([v, t], i) => `<label class="tile"><input type="radio" name="type" value="${v}"${i === 0 ? " checked" : ""}><span>${t}</span></label>`).join("")}
          </div></div>
        <label class="f"><span>Quartier</span><select name="quartier" required>${quartierOptions("", true)}</select></label>
        <p class="err" data-err hidden></p>
      </fieldset>
      <fieldset class="est-step" data-step="2" hidden>
        <legend class="sr-only">Les détails</legend>
        <div class="f-two">
          <label class="f"><span>Surface (m²)</span><input class="field" type="number" name="surface" min="15" max="5000" inputmode="numeric" placeholder="Ex. 95" required></label>
          <label class="f" data-only="bati"><span>Pièces</span><select name="pieces">${[1, 2, 3, 4, 5, 6].map(n => `<option value="${n}"${n === 3 ? " selected" : ""}>F${n}${n === 6 ? " et plus" : ""}</option>`).join("")}</select></label>
          <label class="f" data-only="appart"><span>Étage</span><select name="etage"><option value="0">Rez-de-chaussée</option>${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}"${n === 2 ? " selected" : ""}>${n}${n === 1 ? "er" : "e"} étage${n === 10 ? " et plus" : ""}</option>`).join("")}</select></label>
          <label class="f"><span>Papiers</span><select name="papiers"><option value="1">Acte et livret foncier</option><option value="0.95">Acte notarié seul</option><option value="0.85">Autre situation</option></select></label>
        </div>
        <div class="f-group" data-only="bati"><p class="f-label" id="lbl-etat">État</p>
          <div class="tiles tiles-4" role="radiogroup" aria-labelledby="lbl-etat">
            ${[["1.08", "Neuf"], ["1", "Bon état"], ["0.92", "À rafraîchir"], ["0.82", "À rénover"]].map(([v, t], i) => `<label class="tile"><input type="radio" name="etat" value="${v}"${i === 1 ? " checked" : ""}><span>${t}</span></label>`).join("")}
          </div></div>
        <fieldset class="checks"><legend>Avec</legend>
          <label class="chk" data-only="appart"><input type="checkbox" name="ascenseur" value="1"><span>Ascenseur</span></label>
          <label class="chk"><input type="checkbox" name="parking" value="1"><span>Parking ou garage</span></label>
          <label class="chk"><input type="checkbox" name="vue" value="1"><span>Vue mer</span></label>
        </fieldset>
        <p class="err" data-err hidden></p>
      </fieldset>
      <fieldset class="est-step" data-step="3" hidden>
        <legend class="sr-only">L'estimation</legend>
        <div class="est-result" aria-live="polite">
          <p class="est-label" data-est-label>Estimation de prix de vente</p>
          <p class="est-range" data-est-range>–</p>
          <p class="est-da" data-est-da></p>
          <p class="note" data-est-note></p>
        </div>
        <div class="f-two">
          <label class="f"><span>Votre nom</span><input class="field" name="name" autocomplete="name" placeholder="Ex. Hassiba Ait Ali"></label>
          <label class="f"><span>Téléphone</span><input class="field" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="05, 06 ou 07…"></label>
        </div>
        <p class="err" data-err hidden></p>
        <button class="btn btn-primary" type="submit">${I("wa")}Demander une visite d'estimation</button>
        <p class="hint">Le message s'ouvre dans WhatsApp, déjà rédigé avec vos réponses.</p>
      </fieldset>
      <div class="est-nav">
        <button type="button" class="btn btn-line" data-est-prev hidden>${I("chevl")}Retour</button>
        <button type="button" class="btn btn-primary" data-est-next>Continuer${I("chev")}</button>
      </div>
    </form>
  </div>
</section>
<section class="sec m2" aria-labelledby="m2-h">
  <div class="wrap">
    <div class="sec-head"><h2 id="m2-h">Prix moyens au mètre carré</h2><p class="sec-lead">Appartements en bon état, d'après les ventes suivies par l'agence. Valeurs de démonstration.</p></div>
    <table class="m2-table">
      <thead><tr><th scope="col">Quartier</th><th scope="col">Wilaya</th><th scope="col">Prix moyen au m²</th><th scope="col">Pour un F3 de 90 m²</th></tr></thead>
      <tbody>${[...QUARTIERS].sort((a, b) => b.m2 - a.m2).map(q => `<tr><th scope="row">${esc(q.name)}</th><td>${q.wilaya}</td><td>${B.priceHTML(q.m2, false, "pr-inline")}</td><td>${B.priceHTML(q.m2 * 90, false, "pr-inline")}</td></tr>`).join("")}</tbody>
    </table>
  </div>
</section>`;
  write("estimer/index.html", layout({ page: "estimer", active: "estimer", path: "/estimer/", title: `Estimer mon bien gratuitement · ${SITE.name}`, description: "Obtenez en une minute une fourchette de prix pour votre appartement, villa ou terrain à Alger, Oran ou Tipaza, puis une visite d'estimation gratuite.", main }));
}

/* ==========================================================================
   L'AGENCE
   ========================================================================== */
function pageAgence() {
  const faq = [
    ["Quels papiers vérifiez-vous avant de publier une annonce ?", "Nous demandons l'acte de propriété et, quand il existe, le livret foncier. Pour une maison ou un terrain, nous regardons aussi le permis de construire et le certificat de conformité. Les papiers de chaque bien sont indiqués sur son annonce."],
    ["Combien d'avance faut-il prévoir pour une location ?", "Cela dépend du propriétaire. Le nombre de mois d'avance est indiqué sur chaque annonce de location, et le contrat est signé chez le notaire."],
    ["Puis-je acheter depuis l'étranger ?", "Oui. Nous faisons les visites en vidéo sur WhatsApp, nous vous envoyons les papiers à l'avance et nous organisons la signature chez le notaire pendant votre séjour, ou par procuration."],
    ["Combien coûtent vos services ?", "Nos honoraires sont affichés à l'agence et vous sont précisés par écrit avant la première visite. L'estimation de votre bien est gratuite."]
  ];
  const main = `
<section class="ag-hero">
  <div class="hero-bg" aria-hidden="true"><img ${photoAttrs("photo-1789498883061-667d68fc365d", 2000, 0.6, "100vw")} width="2000" height="1200" alt="" fetchpriority="high"></div>
  <div class="wrap ag-hero-in">
    <div class="ag-copy">
      <h1>Une agence à Hydra, une autre à Oran</h1>
      <p class="sec-lead">Depuis 2011, ${SITE.name} accompagne les familles qui achètent, vendent ou louent à Alger et à Oran. Nous visitons chaque bien avant de le publier et nous vérifions ses papiers.</p>
      <div class="btn-row"><a class="btn btn-mimosa" href="${B.wa(`${waText}je souhaite prendre rendez-vous à l'agence.`)}" target="_blank" rel="noopener">${I("wa")}Prendre rendez-vous</a><a class="btn btn-ghost-light" href="tel:${SITE.phone.replace(/\s/g, "")}">${I("phone")}${SITE.phone}</a></div>
    </div>
  </div>
</section>
<section class="sec offices" aria-labelledby="off-h">
  <div class="wrap">
    <div class="sec-head"><h2 id="off-h">Nos bureaux</h2></div>
    <div class="off-grid">
      ${SITE.offices.map(o => `<div class="office">
        ${B.plaque({ name: o.city, ar: o.city === "Alger" ? "الجزائر" : "وهران" }, "plaque-lg")}
        <p class="off-addr">${esc(o.address)}</p>
        <p class="off-hours">${esc(o.hours)}</p>
        <a class="link" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(o.address)}" target="_blank" rel="noopener">${I("pin")}Itinéraire</a>
      </div>`).join("")}
    </div>
  </div>
</section>
<section class="sec team" aria-labelledby="team-h">
  <div class="wrap">
    <div class="sec-head"><h2 id="team-h">Vos interlocuteurs</h2><p class="sec-lead">Une personne suit votre dossier du premier message à la signature.</p></div>
    <ul class="team-grid">${AGENTS.map(a => `<li class="member"><span class="avatar avatar-lg" aria-hidden="true">${B.initials(a.name)}</span><div><p class="agent-n">${esc(a.name)}</p><p class="agent-r">${esc(a.role)}</p><p class="agent-l">${esc(a.langs)}</p></div></li>`).join("")}</ul>
  </div>
</section>
<section class="sec faq" aria-labelledby="faq-h">
  <div class="wrap faq-in">
    <h2 id="faq-h">Questions fréquentes</h2>
    <div class="faq-list">${faq.map(([qq, a]) => `<details><summary>${esc(qq)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
  </div>
</section>
<section class="sec contact" aria-labelledby="ct-h">
  <div class="wrap contact-in">
    <div><h2 id="ct-h">Écrivez-nous</h2><p class="sec-lead">Décrivez ce que vous cherchez ou ce que vous vendez. Le message s'ouvre dans WhatsApp, prêt à envoyer.</p></div>
    <form class="contact-form" id="contactForm" novalidate>
      <div class="f-two">
        <label class="f"><span>Votre nom</span><input class="field" name="name" autocomplete="name" required placeholder="Ex. Karima Mansouri"></label>
        <label class="f"><span>Votre demande</span><select name="topic"><option>Je cherche à acheter</option><option>Je cherche à louer</option><option>Je vends un bien</option><option>Je mets un bien en location</option><option>Autre question</option></select></label>
      </div>
      <label class="f"><span>Message</span><textarea class="field" name="msg" rows="4" placeholder="Ex. F3 à Hydra ou Ben Aknoun, budget 3 milliards, avec ascenseur."></textarea></label>
      <p class="err" data-err hidden></p>
      <button class="btn btn-primary" type="submit">${I("wa")}Envoyer sur WhatsApp</button>
    </form>
  </div>
</section>`;
  write("agence/index.html", layout({ page: "agence", active: "agence", path: "/agence/", title: `L'agence · ${SITE.name}, Alger et Oran`, description: "Nos bureaux à Hydra et à Oran, notre équipe et les réponses aux questions fréquentes. Rendez-vous sur WhatsApp.", main }));
}

/* ==========================================================================
   FAVORIS et 404
   ========================================================================== */
function pageFavoris() {
  const main = `
<section class="sec fav-page">
  <div class="wrap">
    <div class="sec-head"><h1>Mes favoris</h1><p class="sec-lead" data-fav-lead>Les annonces que vous enregistrez avec le cœur apparaissent ici, sur cet appareil.</p></div>
    <div class="grid grid-3" id="favGrid"></div>
    <div class="empty" id="favEmpty" hidden>
      <p class="empty-t">Vous n'avez pas encore de favori.</p>
      <p>Touchez le cœur sur une annonce pour la retrouver ici et la partager plus tard.</p>
      <div class="btn-row"><a class="btn btn-primary" href="/annonces/">Voir les annonces</a></div>
    </div>
    <div class="btn-row fav-actions" id="favActions" hidden>
      <a class="btn btn-primary" id="favShare" href="#" target="_blank" rel="noopener">${I("wa")}Envoyer ma sélection à l'agence</a>
      <button type="button" class="btn btn-line" id="favClear">Vider les favoris</button>
    </div>
  </div>
</section>`;
  write("favoris/index.html", layout({ page: "favoris", active: "", path: "/favoris/", title: `Mes favoris · ${SITE.name}`, description: "Vos annonces enregistrées.", main, noindex: true }));
}
function page404() {
  const main = `
<section class="sec nf">
  <div class="wrap nf-in">
    ${B.plaque({ name: "Impasse", ar: "طريق مسدود" }, "plaque-lg")}
    <h1>Cette page n'existe pas</h1>
    <p class="sec-lead">L'annonce a peut-être été vendue ou retirée. Les autres biens sont toujours en ligne.</p>
    <div class="btn-row"><a class="btn btn-primary" href="/annonces/">Voir les annonces</a><a class="btn btn-line" href="/">Retour à l'accueil</a></div>
  </div>
</section>`;
  write("404.html", layout({ page: "404", active: "", path: "/404", title: `Page introuvable · ${SITE.name}`, description: "Cette page n'existe pas.", main, noindex: true }));
}

/* ---------- générer ---------- */
pageHome();
pageList();
BIENS.forEach(pageBien);
pageEstimer();
pageAgence();
pageFavoris();
page404();

const urls = ["/", "/annonces/", "/estimer/", "/agence/", ...BIENS.map(B.url)];
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${BASE}${u}</loc></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);

console.log(`Site généré dans dist/ : ${urls.length + 2} pages (${BIENS.length} annonces).`);
