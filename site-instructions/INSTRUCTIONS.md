# Instructions pour le site personnel de Loucas Pillaud-Vivien

## Vue d'ensemble

Créer un site personnel académique statique (HTML/CSS/JS pur, pas de framework) hébergé sur GitHub Pages. Le site doit être **moderniste, joyeux et très graphique** — inspiré du design suisse et des éditions Bauhaus/Taschen, mais avec des couleurs vives et une énergie chaleureuse. On doit arriver sur le site et se dire "ce mec a du goût et il a l'air sympa".

**URL actuelle :** https://thebiglouloup.github.io/loucaspillaudvivien/
**Google Scholar :** https://scholar.google.com/citations?hl=fr&user=ioI9xpwAAAAJ

---

## Architecture des pages

### 1. Page d'accueil (`index.html`)

Contenu, dans cet ordre :
- **Header** : nom "Loucas Pillaud-Vivien", titre "Maître de conférences — ENPC / CERMICS", navigation
- **Citation aléatoire** : piochée dans `data/quotes.json`, affichée avec un **effet machine à écrire** (typewriter). La couleur de la citation est tirée aléatoirement parmi la palette d'accent. Change à chaque rechargement.
- **Briefly** : paragraphe de présentation (contenu dans `data/bio.md`)
- **Séparateur topographique** (voir section Composants spéciaux)
- **Contact** : email, adresse physique, liens Scholar/arxiv
- **Séparateur topographique**
- **Research Interests** : liste des thèmes de recherche
- **Séparateur topographique**
- **Selected Publications** : les papiers marqués `"selected": true` dans `data/papers.json`. Chaque papier affiche titre, auteurs, venue, lien arxiv, et un abstract en **accordéon** (clic pour déplier avec animation fluide). Un lien "See all papers →" renvoie vers la Research Map.

### 2. Research Map (`research-map.html`)

Page avec **deux onglets/vues** :

#### a) Graphe des papiers
- Visualisation interactive avec **Cytoscape.js** (force-directed layout)
- Chaque nœud = un papier. Données dans `data/papers.json`
- **Couleur du nœud** = thème principal (voir palette des thèmes ci-dessous)
- **Forme du nœud** : rond = théorique, carré = expérimental, losange = les deux
- Les arêtes proviennent de deux sources :
  - **Automatiques** : les papiers partageant au moins un tag sont connectés (arête fine, gris clair)
  - **Explicites** : les connexions `"connections"` dans le JSON (arête plus épaisse, colorée)
- **Interaction** : clic sur un nœud → panneau latéral avec titre, auteurs, abstract, lien arxiv, tags. Survol → le nœud pulse doucement.
- **Filtrage** : boutons pour filtrer par thème (toggle on/off), search bar par titre/auteur
- Légende des couleurs et formes visible

#### b) Graphe des co-auteurs
- Chaque nœud = un co-auteur. Données dans `data/coauthors.json`
- Taille du nœud proportionnelle au nombre de papiers en commun
- Couleur du nœud = période de collaboration (SIERRA/PhD = bleu électrique, EPFL = corail, NYU/Flatiron = vert émeraude, ENPC = violet)
- Loucas est le nœud central
- Clic sur un co-auteur → liste des papiers en commun

### 3. Enseignement (`teaching.html`)
- Contenu dans `data/teaching.md`
- Page simple, même design system

### 4. Blog / Pensées (`blog.html` + `blog/post-slug.html`)
- Liste des entrées, les plus récentes en haut
- Chaque entrée : date, titre, début du texte, lien "lire la suite"
- Les posts sont des fichiers markdown dans `data/blog/`. Le build les convertit en HTML.
- Design épuré, bonne typographie de lecture

### 5. Remerciements (`acknowledgments.html`)
- Données dans `data/acknowledgments.json` : un tableau de `{ "person": "Prénom Nom", "text": "paragraphe de remerciement" }`
- À chaque chargement de la page, **l'ordre des paragraphes est aléatoire** (shuffle JS)
- Les blocs se réorganisent avec une **animation fluide** (CSS transition sur position, durée ~600ms)
- Un bouton "🎲 Remélanger" permet de re-shuffler sans recharger
- En haut, un petit texte expliquant le concept : "Ces remerciements se réordonnent aléatoirement à chaque visite — chaque lecture compose un texte différent."

### 6. About (`about.html`)
- Bio détaillée, parcours, photo
- Contenu dans `data/about.md`

---

## Design System

### Typographie

- **Titres** : une typo display géométrique avec du caractère — ne PAS utiliser Space Grotesk ni Inter. Explorer des choix comme Syne, Outfit, Unbounded, Familjen Grotesk, ou une autre typo distinctive disponible sur Google Fonts. Font-weight 200 à 700 selon les niveaux.
- **Corps** : une sans-serif lisible et élégante, différente de la typo de titre. ~15px, line-height 1.6.
- **Citations / code** : JetBrains Mono ou IBM Plex Mono, en plus petit.
- **Taille générale** : plus petit que le site actuel. Texte de corps en 15px max, pas 18px.

### Palette de couleurs

Fond blanc pur (`#ffffff`) avec beaucoup d'espace blanc. Texte en gris très foncé (`#1a1a1a`), pas noir pur.

**5 couleurs d'accent vives** (à ajuster mais dans cet esprit) :
- **Bleu électrique** `#2563EB` → thème "kernel methods" + période SIERRA
- **Corail** `#F97316` → thème "implicit bias / SGD" + période EPFL  
- **Vert émeraude** `#10B981` → thème "gradient flows / dynamics" + période NYU/Flatiron
- **Violet** `#8B5CF6` → thème "single/multi-index models" + période ENPC
- **Jaune moutarde** `#EAB308` → thème "variational inference / other"

Ces couleurs sont utilisées partout : liserés de section, nœuds du graphe, couleur aléatoire des citations, hover states des liens, bullets stylisés.

### Mise en page

- **Grille stricte** avec de grandes marges (min 15% de chaque côté sur desktop)
- **Asymétrie maîtrisée** : le contenu n'est pas toujours centré, parfois décalé à gauche avec de l'air à droite
- Beaucoup d'**espace blanc** — le site respire
- **Responsive** : fonctionne bien sur mobile (marges réduites, navigation hamburger)
- Pas de sidebar permanente

### Navigation

- **Barre de navigation** en haut, fixe au scroll, minimale : nom à gauche, liens à droite
- Les liens de navigation ont un **soulignement coloré animé** au hover (la couleur vient de la palette d'accent, différente pour chaque lien)
- Navigation : Accueil · Research Map · Enseignement · Blog · Remerciements · About

---

## Composants spéciaux

### 1. Citation aléatoire (typewriter)

- Au chargement de la page d'accueil, une citation est tirée aléatoirement de `data/quotes.json`
- Elle s'affiche caractère par caractère (effet machine à écrire), ~40ms par caractère
- La couleur du texte est tirée aléatoirement parmi les 5 couleurs d'accent
- Format affiché : `"texte de la citation" — Auteur`
- Typo monospace pour la citation
- L'animation ne se relance pas au scroll, elle se joue une fois au chargement

### 2. Séparateurs topographiques

- Entre chaque section de la page d'accueil, un séparateur SVG/canvas généré en JS
- Il dessine des **lignes de niveau** (courbes concentriques irrégulières, comme sur une carte topographique / un paysage d'énergie)
- **Colorées** : les lignes utilisent un dégradé entre 2-3 couleurs de la palette d'accent
- Hauteur ~80-120px, pleine largeur
- Chaque séparateur est **différent** (seed aléatoire) — générés procéduralement avec du bruit de Perlin ou simplex
- Subtils, pas envahissants — opacity ~0.3 à 0.6
- Ils ajoutent du rythme visuel entre les sections

### 3. Accordéons d'abstracts

- Clic sur un papier → l'abstract se déplie avec une animation CSS fluide (max-height transition, ~300ms ease)
- Petit indicateur visuel (chevron qui tourne, ou signe +/−)
- L'abstract est en typo légèrement plus petite et en gris moyen

### 4. Graphes interactifs (Cytoscape.js)

- Utiliser Cytoscape.js (CDN) avec le layout `cose` ou `cola` (force-directed)
- Style des nœuds : border coloré selon thème, fond blanc, label = titre court du papier
- Hover : le nœud grossit légèrement + ombre
- Clic : panneau d'info à droite (ou en overlay sur mobile)
- Les arêtes automatiques (tags partagés) sont fines et grises
- Les arêtes explicites (connexions directes) sont plus épaisses et colorées
- Prévoir un bouton "reset zoom" et des contrôles de zoom

### 5. Page remerciements (shuffle animé)

- Les paragraphes sont dans des blocs `<div>` avec `position` gérée par JS
- Au shuffle : calculer les nouvelles positions, appliquer `transform: translate()` avec `transition: transform 0.6s ease`
- Ou utiliser une approche CSS Grid avec `order` animé via FLIP technique
- Bouton "Remélanger" bien visible, stylisé avec une des couleurs d'accent

---

## Structure des fichiers

```
/
├── index.html
├── research-map.html
├── teaching.html
├── blog.html
├── acknowledgments.html
├── about.html
├── css/
│   └── style.css          # tout le CSS (variables, grille, composants)
├── js/
│   ├── typewriter.js       # effet citation machine à écrire
│   ├── topo-separator.js   # génération des séparateurs topographiques
│   ├── accordion.js        # accordéons abstracts
│   ├── shuffle.js          # shuffle des remerciements
│   ├── research-graph.js   # graphe Cytoscape des papiers
│   └── coauthor-graph.js   # graphe Cytoscape des co-auteurs
├── data/
│   ├── quotes.json         # citations favorites (à remplir par Loucas)
│   ├── papers.json         # articles avec métadonnées et connexions
│   ├── coauthors.json      # co-auteurs avec métadonnées
│   ├── acknowledgments.json # remerciements (à remplir par Loucas)
│   ├── bio.md              # texte "Briefly"
│   ├── about.md            # bio détaillée
│   ├── teaching.md         # contenu enseignement
│   └── blog/               # posts markdown
│       └── YYYY-MM-DD-slug.md
├── img/
│   ├── photo.jpg           # photo de profil
│   └── drawings/           # dessins pour les papiers (optionnel, futur)
└── Articles/               # PDFs des présentations (garder du site actuel)
    └── ...
```

---

## Fichiers de données — schémas

### `data/quotes.json`
```json
[
  {
    "text": "J'emmerde l'IA, moi, j'suis plutôt bêtise naturelle",
    "author": "JeanJass",
    "source": "Très à propos",
    "url": "https://www.youtube.com/watch?v=BDT5LEKLmQA"
  }
]
```
Loucas : remplis ce fichier avec tes citations préférées (10-30 idéalement).

### `data/papers.json`
Voir le fichier `data/papers.json` pré-rempli fourni séparément. Schéma par entrée :
```json
{
  "id": "multipass-sgd-2018",
  "title": "Statistical Optimality of SGD through Multiple Passes",
  "authors": ["L. Pillaud-Vivien", "A. Rudi", "F. Bach"],
  "venue": "NeurIPS 2018",
  "year": 2018,
  "arxiv": "1805.10074",
  "themes": ["kernel-methods", "sgd-dynamics"],
  "type": "theoretical",
  "selected": true,
  "abstract": "We consider stochastic gradient descent...",
  "connections": ["expo-convergence-2018"],
  "talks": [
    { "title": "Slides NeurIPS", "url": "Presentations/Multipass_SGD/..." },
    { "title": "Poster", "url": "Posters/poster_NIPS2018.pdf" }
  ]
}
```

### `data/coauthors.json`
Voir le fichier pré-rempli fourni. Schéma :
```json
{
  "id": "francis-bach",
  "name": "Francis Bach",
  "url": "https://www.di.ens.fr/~fbach/",
  "period": "sierra",
  "papers": ["expo-convergence-2018", "multipass-sgd-2018", "poincare-2019", "kernelized-diffusion-2023", "laplacian-ssl-2021", "relu-weakly-2025"]
}
```

### `data/acknowledgments.json`
```json
[
  {
    "person": "Prénom Nom",
    "text": "Paragraphe de remerciement pour cette personne..."
  }
]
```
Loucas : remplis ce fichier.

---

## Mapping des thèmes et couleurs

| Thème | Couleur | ID |
|---|---|---|
| Kernel methods & spectral | Bleu électrique | `kernel-methods` |
| Implicit bias / SGD dynamics | Corail | `sgd-dynamics` |  
| Gradient flows / mean-field | Vert émeraude | `gradient-flows` |
| Single/multi-index models | Violet | `index-models` |
| Variational inference / other | Jaune moutarde | `variational` |

## Mapping des périodes (co-auteurs)

| Période | Couleur | Années |
|---|---|---|
| SIERRA / PhD (INRIA/ENS) | Bleu électrique | 2017-2020 |
| EPFL | Corail | 2020-2022 |
| NYU / Flatiron | Vert émeraude | 2023-2024 |
| ENPC | Violet | 2024-présent |

---

## Contenu à reprendre du site actuel

Tout le contenu textuel du site actuel (https://thebiglouloup.github.io/loucaspillaudvivien/) doit être conservé :
- Le texte "Briefly" et la bio
- La liste des publications avec leurs abstracts
- La liste des présentations avec les liens vers les slides/posters/vidéos
- Les infos de contact
- Les activités de reviewing
- Les liens vers la thèse et les slides de soutenance
- La photo de profil (la tortue)

Les PDFs des présentations doivent rester accessibles aux mêmes URLs relatives.

---

## Contraintes techniques

- **Pas de framework JS** (pas de React, Vue, etc.) — HTML/CSS/JS vanilla
- **Pas de build step** — le site doit fonctionner tel quel sur GitHub Pages
- Cytoscape.js chargé depuis CDN
- Google Fonts chargées depuis CDN
- Le blog peut être en markdown avec un mini-convertisseur JS côté client, ou les posts peuvent être pré-convertis en HTML
- **Performance** : le site doit charger vite. Les séparateurs topo et le typewriter ne doivent pas bloquer le rendu.
- **Accessibilité** : contraste suffisant, navigation clavier, alt text sur les images
- Les animations doivent respecter `prefers-reduced-motion`

---

## Pour commencer

1. Scraper Google Scholar (https://scholar.google.com/citations?hl=fr&user=ioI9xpwAAAAJ) pour construire `data/papers.json` à jour avec tous les papiers, ou utiliser le fichier pré-rempli et le compléter
2. Construire `data/coauthors.json` à partir des papiers
3. Commencer par la page d'accueil : layout, typo, couleurs, séparateurs topo, citation typewriter
4. Puis la Research Map avec les deux graphes
5. Puis les pages secondaires
6. En dernier : le blog (Loucas fournira le contenu plus tard)
