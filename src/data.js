/* ==========================================================================
   BAYT IMMOBILIER · données du site
   Tout ce qui change d'une agence à l'autre est ici : coordonnées, quartiers,
   annonces, équipe. Les prix sont en dinars (DA). Le site affiche aussi
   l'équivalent en centimes (« 5,4 milliards »).
   ========================================================================== */
(function (w) {

w.SITE = {
  name: "Bayt Immobilier",
  // Adresse du site en ligne (sert aux aperçus WhatsApp / Facebook et au plan du site)
  url: "https://bayt-immobilier.vercel.app",
  description: "Appartements, villas et terrains à vendre et à louer à Alger, Oran et Tipaza. Visites sur rendez-vous, réponse rapide sur WhatsApp.",
  whatsapp: "213561913869",          // format international, sans + ni espaces
  phone: "+213 561 91 38 69",
  email: "contact@bayt-immobilier.dz",
  agrement: "Agrément n° 16/0427 (démonstration)",
  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    tiktok: "https://www.tiktok.com/"
  },
  offices: [
    { city: "Alger", address: "9, chemin Abdelkader Gadouche, Hydra", lat: 36.7442, lng: 3.0366,
      hours: "Samedi au jeudi, 9 h – 18 h" },
    { city: "Oran", address: "Boulevard de l'ALN, front de mer, Oran", lat: 35.7006, lng: -0.6402,
      hours: "Samedi au jeudi, 9 h – 17 h" }
  ],
  // Simulateur de crédit (valeurs par défaut, modifiables par le visiteur)
  loan: { rate: 6.5, years: 20, downPct: 20, incomeRatio: 0.30 }
};

/* Quartiers : prix moyen de vente au m² (DA), utilisé par la page « Estimer mon bien ».
   lat/lng = centre approximatif du quartier. */
w.QUARTIERS = [
  { id: "hydra",          name: "Hydra",           ar: "حيدرة",           wilaya: "Alger",  m2: 450000, lat: 36.7442, lng: 3.0366 },
  { id: "said-hamdine",   name: "Saïd Hamdine",    ar: "سعيد حمدين",      wilaya: "Alger",  m2: 330000, lat: 36.7385, lng: 3.0460 },
  { id: "ben-aknoun",     name: "Ben Aknoun",      ar: "بن عكنون",        wilaya: "Alger",  m2: 350000, lat: 36.7605, lng: 3.0120 },
  { id: "el-biar",        name: "El Biar",         ar: "الأبيار",         wilaya: "Alger",  m2: 340000, lat: 36.7685, lng: 3.0290 },
  { id: "dely-ibrahim",   name: "Dely Ibrahim",    ar: "دالي إبراهيم",    wilaya: "Alger",  m2: 300000, lat: 36.7530, lng: 2.9870 },
  { id: "alger-centre",   name: "Alger-Centre",    ar: "الجزائر الوسطى", wilaya: "Alger",  m2: 280000, lat: 36.7700, lng: 3.0560 },
  { id: "cheraga",        name: "Chéraga",         ar: "الشراقة",         wilaya: "Alger",  m2: 260000, lat: 36.7600, lng: 2.9560 },
  { id: "kouba",          name: "Kouba",           ar: "القبة",           wilaya: "Alger",  m2: 240000, lat: 36.7270, lng: 3.0840 },
  { id: "draria",         name: "Draria",          ar: "الدرارية",        wilaya: "Alger",  m2: 230000, lat: 36.7160, lng: 2.9990 },
  { id: "ouled-fayet",    name: "Ouled Fayet",     ar: "أولاد فايت",      wilaya: "Alger",  m2: 220000, lat: 36.7330, lng: 2.9500 },
  { id: "bab-ezzouar",    name: "Bab Ezzouar",     ar: "باب الزوار",      wilaya: "Alger",  m2: 210000, lat: 36.7210, lng: 3.1830 },
  { id: "bordj-el-kiffan",name: "Bordj El Kiffan", ar: "برج الكيفان",     wilaya: "Alger",  m2: 190000, lat: 36.7480, lng: 3.1930 },
  { id: "akid-lotfi",     name: "Akid Lotfi",      ar: "العقيد لطفي",     wilaya: "Oran",   m2: 230000, lat: 35.7140, lng: -0.5880 },
  { id: "canastel",       name: "Canastel",        ar: "كناستال",         wilaya: "Oran",   m2: 260000, lat: 35.7300, lng: -0.5600 },
  { id: "tipaza",         name: "Tipaza",          ar: "تيبازة",          wilaya: "Tipaza", m2: 170000, lat: 36.5920, lng: 2.4470 }
];

w.AGENTS = [
  { id: "yasmine", name: "Yasmine Belkacem", role: "Ventes, Alger", langs: "Français, arabe, anglais" },
  { id: "karim",   name: "Karim Hadjadj",    role: "Locations et bureaux, Alger", langs: "Français, arabe" },
  { id: "nadia",   name: "Nadia Sebbah",     role: "Agence d'Oran", langs: "Français, arabe, espagnol" }
];

/* Annonces
   transaction : "vente" ou "location" (prix par mois)
   type : appartement, duplex, villa, niveau (niveau de villa), terrain, local
   pieces : 3 pour un F3 (laisser null pour villa, terrain, local)
   photos : identifiants Unsplash (photo-…) ou chemins vers vos fichiers (/images/…)
   plan : f2, f3, f4, f5, villa, local, terrain */
w.BIENS = [
  {
    ref: "BY-2041", slug: "f4-hydra-vue-baie", transaction: "vente", type: "appartement", pieces: 4,
    titre: "F4 traversant avec vue sur la baie", quartier: "hydra", lat: 36.7468, lng: 3.0402,
    surface: 128, chambres: 3, sdb: 2, etage: 4, etages: 6, ascenseur: true, parking: true, vueMer: true, meuble: false,
    papiers: "Acte et livret foncier", etat: "Très bon état", annee: 2014, prix: 54000000,
    photos: [
      ["photo-1612419299101-6c294dc2901d", "Séjour lumineux avec canapé et parquet"],
      ["photo-1556911220-bff31c812dba", "Cuisine blanche avec îlot en marbre"],
      ["photo-1616594039964-ae9021a400a0", "Chambre parentale avec vue sur la ville"],
      ["photo-1620626011761-996317b8d101", "Salle de bains avec baignoire"],
      ["photo-1702830499141-a0634d87d6af", "Balcon avec vue sur la mer"]
    ],
    plan: "f4", agent: "yasmine", date: "2026-10-03", coupDeCoeur: true,
    atouts: ["Double exposition est-ouest", "Vue dégagée sur la baie depuis le séjour", "Place de parking en sous-sol", "Gardien et caméras", "Cuisine équipée", "Climatisation dans chaque pièce"],
    description: "Au quatrième étage d'une résidence calme, à cinq minutes du parc de Hydra. Le séjour double ouvre sur un balcon filant avec vue sur la baie d'Alger. Les trois chambres donnent côté jardin. L'appartement a été refait en 2023 : électricité, sols et cuisine. Papiers en règle, disponible à la signature."
  },
  {
    ref: "BY-2038", slug: "f3-bab-ezzouar-residence", transaction: "vente", type: "appartement", pieces: 3,
    titre: "F3 dans une résidence fermée", quartier: "bab-ezzouar", lat: 36.7192, lng: 3.1797,
    surface: 82, chambres: 2, sdb: 1, etage: 7, etages: 12, ascenseur: true, parking: true, vueMer: false, meuble: false,
    papiers: "Livret foncier", etat: "Neuf", annee: 2023, prix: 19500000,
    photos: [
      ["photo-1629042306558-7d1e15cc02fa", "Séjour avec canapé gris"],
      ["photo-1588854337221-4cf9fa96059c", "Cuisine blanche équipée"],
      ["photo-1625334782252-da92af3ad887", "Chambre avec lit double"],
      ["photo-1650894622076-e09ab837c502", "Salle de bains moderne"],
      ["photo-1545324418-cc1a3fa10c00", "Façade de la résidence"]
    ],
    plan: "f3", agent: "yasmine", date: "2026-10-01", nouveau: true,
    atouts: ["Résidence fermée avec gardiennage", "Proche tramway et USTHB", "Ascenseurs neufs", "Place de parking privative"],
    description: "Appartement jamais habité dans une promotion livrée en 2023, à deux pas du tramway et de l'université. Séjour ouvert sur une loggia, deux chambres, cuisine équipée et rangements. Idéal pour un premier achat ou un investissement locatif."
  },
  {
    ref: "BY-2035", slug: "villa-dely-ibrahim-piscine", transaction: "vente", type: "villa", pieces: null,
    titre: "Villa R+2 avec piscine et jardin", quartier: "dely-ibrahim", lat: 36.7552, lng: 2.9838,
    surface: 380, terrain: 420, chambres: 6, sdb: 4, etage: null, etages: 3, ascenseur: false, parking: true, vueMer: false, meuble: false,
    papiers: "Acte et livret foncier", etat: "Très bon état", annee: 2012, prix: 165000000,
    photos: [
      ["photo-1613977257363-707ba9348227", "Villa blanche avec piscine"],
      ["photo-1600596542815-ffad4c1539a9", "Façade de la villa"],
      ["photo-1600489000022-c2086d79f9d4", "Grande cuisine"],
      ["photo-1601993957728-1e56ab70c5a8", "Escalier intérieur"],
      ["photo-1616486029423-aaa4789e8c9a", "Chambre ensoleillée"],
      ["photo-1733426107854-ee00a25d72a7", "Salle de bains avec grande fenêtre"]
    ],
    plan: "villa", agent: "yasmine", date: "2026-09-26", coupDeCoeur: true,
    atouts: ["Piscine et jardin arboré", "Garage pour deux voitures", "Suite parentale à l'étage", "Studio indépendant au rez-de-jardin", "Quartier résidentiel calme"],
    description: "Villa familiale sur un terrain de 420 m², dans une rue calme de Dely Ibrahim. Au rez-de-chaussée, deux salons, une salle à manger et une cuisine ouverte sur la terrasse et la piscine. Quatre chambres à l'étage dont une suite, deux chambres et une terrasse au deuxième. Un studio indépendant peut loger les parents ou un gardien."
  },
  {
    ref: "BY-2033", slug: "f3-meuble-ben-aknoun", transaction: "location", type: "appartement", pieces: 3,
    titre: "F3 meublé près de la forêt de Ben Aknoun", quartier: "ben-aknoun", lat: 36.7621, lng: 3.0098,
    surface: 95, chambres: 2, sdb: 1, etage: 3, etages: 5, ascenseur: true, parking: true, vueMer: false, meuble: true,
    papiers: "Contrat de location notarié", etat: "Très bon état", annee: 2010, prix: 130000,
    conditions: "6 mois d'avance, contrat notarié d'un an",
    photos: [
      ["photo-1600493505873-cddd69453072", "Séjour meublé avec table basse"],
      ["photo-1617228069096-4638a7ffc906", "Cuisine avec îlot et grande fenêtre"],
      ["photo-1600210491305-7396500b5b31", "Chambre avec linge bleu et blanc"],
      ["photo-1576698483491-8c43f0862543", "Lavabo de la salle de bains"]
    ],
    plan: "f3", agent: "karim", date: "2026-10-04", nouveau: true,
    atouts: ["Entièrement meublé et équipé", "Climatisation et chauffage central", "Place de parking", "À 10 minutes de Hydra"],
    description: "Appartement meublé avec goût, prêt à habiter : électroménager, literie et vaisselle inclus. Il convient à une famille ou à un cadre en mission. Le parc de Ben Aknoun et les commerces sont à pied."
  },
  {
    ref: "BY-2030", slug: "duplex-said-hamdine-terrasse", transaction: "vente", type: "duplex", pieces: 5,
    titre: "Duplex F5 avec terrasse de 40 m²", quartier: "said-hamdine", lat: 36.7398, lng: 3.0489,
    surface: 186, chambres: 4, sdb: 3, etage: 5, etages: 6, ascenseur: true, parking: true, vueMer: true, meuble: false,
    papiers: "Acte et livret foncier", etat: "Très bon état", annee: 2017, prix: 78000000,
    photos: [
      ["photo-1665249934445-1de680641f50", "Séjour avec grande baie vitrée"],
      ["photo-1705095605806-4b2936e90471", "Terrasse avec salon et vue mer"],
      ["photo-1697032217861-46327ba5f5d2", "Escalier en bois du duplex"],
      ["photo-1602028915047-37269d1a73f7", "Cuisine avec îlot et suspensions"],
      ["photo-1648634158203-199accfd7afc", "Grande chambre"],
      ["photo-1754574741164-a41418029cfb", "Salle de bains élégante"]
    ],
    plan: "f5", agent: "yasmine", date: "2026-09-29",
    atouts: ["Terrasse de 40 m² avec vue mer", "Deux places de parking", "Suite parentale", "Résidence avec concierge"],
    description: "Un duplex rare sur les deux derniers étages : en bas, le séjour, la cuisine et une chambre d'amis ; en haut, trois chambres et une terrasse de 40 m² face à la mer. Résidence récente et soignée, à côté du centre commercial et des ambassades."
  },
  {
    ref: "BY-2027", slug: "f2-alger-centre-haussmannien", transaction: "vente", type: "appartement", pieces: 2,
    titre: "F2 de caractère, immeuble haussmannien", quartier: "alger-centre", lat: 36.7693, lng: 3.0528,
    surface: 64, chambres: 1, sdb: 1, etage: 3, etages: 5, ascenseur: false, parking: false, vueMer: false, meuble: false,
    papiers: "Acte notarié", etat: "Bon état", annee: 1930, prix: 17000000,
    photos: [
      ["photo-1789498882146-148552903024", "Immeuble blanc à balcons en fer forgé"],
      ["photo-1663756915301-2ba688e078cf", "Séjour avec haute fenêtre blanche"],
      ["photo-1630699144867-37acec97df5a", "Fenêtre à petits carreaux"],
      ["photo-1722650272764-08d92d193a9c", "Chambre vide avec parquet"],
      ["photo-1588854337236-6889d631faa8", "Cuisine grise et plan de travail en marbre"]
    ],
    plan: "f2", agent: "karim", date: "2026-09-22",
    atouts: ["Hauteur sous plafond de 3,60 m", "Balcon sur rue", "Parquet et moulures d'origine", "Métro et commerces au pied de l'immeuble"],
    description: "Au cœur d'Alger, à deux minutes de la rue Didouche-Mourad. Un F2 aux volumes généreux dans un immeuble d'époque : grandes fenêtres, moulures et balcon en fer forgé. Idéal pour habiter en ville ou pour un cabinet."
  },
  {
    ref: "BY-2024", slug: "niveau-villa-el-biar", transaction: "location", type: "niveau", pieces: 4,
    titre: "Niveau de villa F4 avec entrée indépendante", quartier: "el-biar", lat: 36.7701, lng: 3.0262,
    surface: 140, chambres: 3, sdb: 2, etage: 1, etages: 2, ascenseur: false, parking: true, vueMer: false, meuble: false,
    papiers: "Contrat de location notarié", etat: "Bon état", annee: 2005, prix: 160000,
    conditions: "12 mois d'avance, garage inclus",
    photos: [
      ["photo-1721815693498-cc28507c0ba2", "Maison à deux étages avec balcons"],
      ["photo-1654506012740-09321c969dc2", "Salon avec table et chaises"],
      ["photo-1745794621090-d856c53b0cc2", "Salle à manger ouverte sur la cuisine"],
      ["photo-1696762932825-2737db830bbe", "Chambre avec fauteuil"],
      ["photo-1643949700215-e61cdca053f7", "Salle de bains avec douche"]
    ],
    plan: "f4", agent: "karim", date: "2026-09-30",
    atouts: ["Entrée indépendante", "Garage et cour", "Quartier résidentiel", "Écoles à proximité"],
    description: "Premier étage d'une villa dans une rue calme d'El Biar, avec sa propre entrée et un garage. Trois chambres, un grand salon et une cuisine séparée. Le propriétaire habite le rez-de-chaussée."
  },
  {
    ref: "BY-2021", slug: "terrain-ouled-fayet-500m2", transaction: "vente", type: "terrain", pieces: null,
    titre: "Terrain constructible de 500 m²", quartier: "ouled-fayet", lat: 36.7352, lng: 2.9471,
    surface: 500, chambres: null, sdb: null, etage: null, etages: null, ascenseur: false, parking: false, vueMer: false, meuble: false,
    papiers: "Acte et livret foncier", etat: "Viabilisé", annee: null, prix: 70000000,
    photos: [
      ["photo-1747854805840-9be7d5e360e6", "Parcelles viabilisées"],
      ["photo-1764222233275-87dc016c11dc", "Vue aérienne de la colline"],
      ["photo-1773215023063-e662ea91a69c", "Lotissement en construction"]
    ],
    plan: "terrain", agent: "yasmine", date: "2026-09-18",
    atouts: ["Deux façades de 20 m et 25 m", "Eau, gaz et électricité en limite", "Permis de construire R+2 possible", "Lotissement calme"],
    description: "Terrain plat dans un lotissement viabilisé d'Ouled Fayet, avec deux façades sur rue. Les papiers sont en règle et un certificat d'urbanisme est disponible. Idéal pour une villa familiale."
  },
  {
    ref: "BY-2018", slug: "f3-oran-akid-lotfi-vue-mer", transaction: "vente", type: "appartement", pieces: 3,
    titre: "F3 vue mer au 9e étage", quartier: "akid-lotfi", lat: 35.7152, lng: -0.5903,
    surface: 98, chambres: 2, sdb: 2, etage: 9, etages: 14, ascenseur: true, parking: true, vueMer: true, meuble: false,
    papiers: "Livret foncier", etat: "Très bon état", annee: 2019, prix: 26000000,
    photos: [
      ["photo-1769869173719-997e7be14a56", "Balcon donnant sur la mer"],
      ["photo-1629042306547-c1d7c6c85ffa", "Séjour avec canapé d'angle"],
      ["photo-1622372738946-62e02505feb3", "Cuisine en bois avec tabourets"],
      ["photo-1633948393301-d43e3ec0e5cd", "Chambre avec bureau"],
      ["photo-1737233523182-99e287258d58", "Salle de bains"]
    ],
    plan: "f3", agent: "nadia", date: "2026-10-02", nouveau: true,
    atouts: ["Vue sur la mer et le front de mer", "Deux salles de bains", "Parking en sous-sol", "Groupe électrogène et bâche à eau"],
    description: "Dans une tour récente d'Akid Lotfi, un F3 lumineux avec une vue dégagée sur la mer. Deux chambres, deux salles de bains et un grand séjour. Le front de mer et les commerces sont à cinq minutes."
  },
  {
    ref: "BY-2015", slug: "bureaux-cheraga-120m2", transaction: "location", type: "local", pieces: null,
    titre: "Plateau de bureaux de 120 m²", quartier: "cheraga", lat: 36.7612, lng: 2.9578,
    surface: 120, chambres: null, sdb: 1, etage: 2, etages: 4, ascenseur: true, parking: true, vueMer: false, meuble: false,
    papiers: "Bail commercial", etat: "Neuf", annee: 2022, prix: 220000,
    conditions: "Bail commercial de 3 ans, 6 mois d'avance",
    photos: [
      ["photo-1631193816258-28b44b21e78b", "Plateau de bureaux ouvert"],
      ["photo-1641159930908-e9eb9ccdc002", "Bureau vide aux murs blancs"],
      ["photo-1637665627832-dcd730049fbb", "Salle de réunion"],
      ["photo-1564605503978-7650b149b9c0", "Façade de l'immeuble"]
    ],
    plan: "local", agent: "karim", date: "2026-09-25",
    atouts: ["Open space et deux bureaux fermés", "Fibre optique", "Climatisation", "Trois places de parking"],
    description: "Plateau neuf et lumineux sur l'axe principal de Chéraga, déjà câblé et climatisé. Il accueille une équipe de 10 à 15 personnes. Accès facile depuis la rocade et parking réservé."
  },
  {
    ref: "BY-2012", slug: "villa-tipaza-piscine-vue-mer", transaction: "vente", type: "villa", pieces: null,
    titre: "Villa avec piscine face au Chenoua", quartier: "tipaza", lat: 36.5979, lng: 2.4214,
    surface: 300, terrain: 800, chambres: 5, sdb: 3, etage: null, etages: 2, ascenseur: false, parking: true, vueMer: true, meuble: false,
    papiers: "Acte et livret foncier", etat: "Très bon état", annee: 2016, prix: 120000000,
    photos: [
      ["photo-1596178067639-5c6e68aea6dc", "Maison blanche et piscine"],
      ["photo-1582610116397-edb318620f90", "Villa et piscine en journée"],
      ["photo-1627357059324-0346e7f7fb7e", "Piscine entourée d'arbres"],
      ["photo-1632583824020-937ae9564495", "Cuisine avec bar"],
      ["photo-1631048501851-4aa85ffc3be8", "Chambre claire"],
      ["photo-1642755622932-d1e0cb783dc5", "Salle de bains avec baignoire"]
    ],
    plan: "villa", agent: "yasmine", date: "2026-09-20", coupDeCoeur: true,
    atouts: ["Vue mer et montagne", "Piscine de 10 × 4 m", "Terrain de 800 m²", "À 1 h d'Alger par l'autoroute"],
    description: "Une maison de vacances ou de famille, à quelques minutes des plages du Chenoua. Grand séjour ouvert sur la piscine, cinq chambres et un jardin planté d'oliviers. L'autoroute met Alger à une heure."
  },
  {
    ref: "BY-2009", slug: "f4-kouba-a-rafraichir", transaction: "vente", type: "appartement", pieces: 4,
    titre: "F4 à rafraîchir, beaux volumes", quartier: "kouba", lat: 36.7262, lng: 3.0873,
    surface: 105, chambres: 3, sdb: 1, etage: 2, etages: 4, ascenseur: false, parking: false, vueMer: false, meuble: false,
    papiers: "Acte notarié", etat: "À rafraîchir", annee: 1985, prix: 23000000,
    photos: [
      ["photo-1630699375895-fe5996d163ee", "Porte blanche et mur clair"],
      ["photo-1722650362309-2f2fdffbfbf1", "Pièce vide avec parquet"],
      ["photo-1721395286594-8913b06056eb", "Chambre vide lumineuse"],
      ["photo-1628745277862-bc0b2d68c50c", "Cuisine à moderniser"],
      ["photo-1644421439741-712c7fde7e95", "Salle de bains"]
    ],
    plan: "f4", agent: "karim", date: "2026-09-15",
    atouts: ["Grandes pièces", "Double exposition", "Proche du métro", "Prix en dessous du marché"],
    description: "Un F4 familial au deuxième étage d'un petit immeuble, avec de grandes pièces et une double exposition. Il demande un rafraîchissement : peinture, cuisine et salle de bains. Un bon rapport qualité-prix pour qui veut l'aménager à son goût."
  },
  {
    ref: "BY-2006", slug: "f2-meuble-oran-canastel", transaction: "location", type: "appartement", pieces: 2,
    titre: "F2 meublé avec balcon vue mer", quartier: "canastel", lat: 35.7318, lng: -0.5581,
    surface: 70, chambres: 1, sdb: 1, etage: 5, etages: 8, ascenseur: true, parking: true, vueMer: true, meuble: true,
    papiers: "Contrat de location notarié", etat: "Très bon état", annee: 2018, prix: 85000,
    conditions: "6 mois d'avance",
    photos: [
      ["photo-1689717887631-088197cdc2ca", "Balcon avec table face à la mer"],
      ["photo-1613575831056-0acd5da8f085", "Séjour avec coin bureau"],
      ["photo-1507089947368-19c1da9775ae", "Cuisine blanche"],
      ["photo-1720420021124-4e18564e070f", "Chambre avec bureau"],
      ["photo-1691036365036-71da57ac5919", "Salle de bains avec douche"]
    ],
    plan: "f2", agent: "nadia", date: "2026-09-28",
    atouts: ["Balcon face à la mer", "Meublé et équipé", "Internet inclus", "Résidence gardée"],
    description: "Un F2 meublé à Canastel, avec un balcon où l'on prend le café face à la mer. Il convient à un couple ou à un professionnel en poste à Oran. Plages et corniche à quelques minutes."
  },
  {
    ref: "BY-2003", slug: "f5-draria-residence-gardee", transaction: "vente", type: "appartement", pieces: 5,
    titre: "F5 de 150 m² en résidence gardée", quartier: "draria", lat: 36.7148, lng: 2.9972,
    surface: 150, chambres: 4, sdb: 2, etage: 1, etages: 5, ascenseur: true, parking: true, vueMer: false, meuble: false,
    papiers: "Acte et livret foncier", etat: "Très bon état", annee: 2020, prix: 42000000,
    photos: [
      ["photo-1628012209120-d9db7abf7eab", "Résidence blanche sous le ciel bleu"],
      ["photo-1649083048337-4aeb6dda80bb", "Séjour ouvert sur la cuisine"],
      ["photo-1649083048597-d7b4f1e8a386", "Cuisine avec grand îlot"],
      ["photo-1663811397207-418a92396ad5", "Chambre avec grand miroir"],
      ["photo-1742134131017-44d377a611b1", "Salle de bains moderne"]
    ],
    plan: "f5", agent: "yasmine", date: "2026-09-12",
    atouts: ["Résidence gardée 24 h/24", "Aire de jeux pour enfants", "Deux places de parking", "Écoles et mosquée à pied"],
    description: "Grand appartement familial dans une résidence récente et sécurisée de Draria. Quatre chambres, deux salles de bains, un double séjour et une cuisine spacieuse. Calme, verdure et accès rapide à l'autoroute."
  },
  {
    ref: "BY-1998", slug: "f3-neuf-bordj-el-kiffan-promotion", transaction: "vente", type: "appartement", pieces: 3,
    titre: "F3 neuf sur plan, livraison 2027", quartier: "bordj-el-kiffan", lat: 36.7493, lng: 3.1972,
    surface: 88, chambres: 2, sdb: 1, etage: 3, etages: 9, ascenseur: true, parking: true, vueMer: false, meuble: false,
    papiers: "Vente sur plan (VSP)", etat: "Neuf", annee: 2027, prix: 17600000,
    conditions: "Paiement échelonné jusqu'à la livraison",
    photos: [
      ["photo-1624204386084-dd8c05e32226", "Immeuble moderne aux balcons vitrés"],
      ["photo-1757742690834-aa581b9f53b2", "Pièce vide avec grande fenêtre"],
      ["photo-1600684388091-627109f3cd60", "Cuisine moderne aux façades noires"]
    ],
    plan: "f3", agent: "yasmine", date: "2026-10-05", nouveau: true,
    atouts: ["Paiement échelonné", "À 800 m de la plage", "Livraison prévue fin 2027", "Choix des finitions"],
    description: "Programme neuf de 9 étages à Bordj El Kiffan, à quelques minutes de la plage. Le F3 se compose d'un séjour avec balcon, de deux chambres et d'une cuisine séparée. Réservation avec un premier versement, puis paiement échelonné jusqu'aux clés."
  }
];

w.TEMOIGNAGES = [
  { names: "Samir et Lamia", text: "Nous cherchions un F4 à Hydra depuis un an. Yasmine nous a montré trois biens en une matinée, avec tous les papiers déjà vérifiés.", place: "Achat à Hydra" },
  { names: "Mourad, depuis Lyon", text: "J'ai acheté sans faire l'aller-retour pour chaque visite : vidéo sur WhatsApp, puis rendez-vous chez le notaire pendant mes vacances.", place: "Achat à Oran" },
  { names: "Hassiba", text: "Mon appartement a été loué en douze jours, avec un contrat notarié et un locataire sérieux.", place: "Mise en location à Ben Aknoun" }
];

})(typeof window !== "undefined" ? window : globalThis);
