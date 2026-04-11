# Loucas Pillaud-Vivien — Personal Academic Website

Live at: **https://thebiglouloup.github.io/loucaspillaudvivien/**

---

## Research Philosophy & The Joy of Graphs

Faire de la recherche, c'est tisser des fils entre des idées qui, au premier abord, semblent n'avoir rien à voir les unes avec les autres. Gradient flows, online learning, variational inference, supervised learning... autant de territoires que j'ai eu le bonheur d'explorer, et qui — surprise ! — se parlent, se répondent, s'entrelacent joyeusement.

Pour donner à voir ces intrications secrètes, j'ai créé un **graphe interactif de mes papiers** sur la page Research Map. Chaque nœud est un article, chaque arête une connexion thématique. C'est un peu mon cerveau mis à plat, une carte au trésor de mes obsessions scientifiques. Cliquez, explorez, perdez-vous : c'est fait pour ça !

Et puis il y a les gens. Ah, les gens ! Depuis le début de ma carrière, j'ai eu l'immense chance de collaborer avec des co-auteurs formidables, de Paris à New York en passant par Lausanne. Je suis ridiculement fier de ce petit réseau humain, de ces amitiés scientifiques qui font que la recherche n'est jamais solitaire. Le **graphe des co-auteurs** est là pour célébrer tout ça : un joyeux spaghetti de collaborations, coloré par continent, où chaque nœud est une personne extraordinaire avec qui j'ai eu le privilège de réfléchir, de me tromper, et parfois même d'avoir raison.

Bref : les maths, c'est collectif. Et c'est beau.

---

## Project Structure

```
├── index.html              # Homepage with bio, photo, random quote
├── about.html              # CV/About page (loads data/about.md)
├── research-map.html       # Interactive paper graph (Cytoscape.js)
├── teaching.html           # Teaching info (loads data/teaching.md)
├── blog.html               # Blog page (loads from data/blog/)
├── minimax_animations.html # Minimax research animations
├── acknowledgments.html    # Acknowledgments (hidden from nav)
│
├── css/
│   └── style.css           # All site styling
│
├── js/
│   ├── main.js             # Shared utilities (markdown renderer, loadMarkdown)
│   ├── typewriter.js       # Animated quote display
│   ├── shuffle.js          # Paper list shuffling/filtering
│   ├── research-graph.js   # Paper graph visualization
│   ├── coauthor-graph.js   # Coauthor network visualization
│   ├── accordion.js        # Expandable sections
│   └── topo-separator.js   # Decorative SVG separators
│
├── data/
│   ├── papers.json         # All publications with metadata
│   ├── coauthors.json      # Coauthor network data
│   ├── quotes.json         # Random quotes for homepage
│   ├── about.md            # CV content (markdown)
│   ├── bio.md              # Short bio for homepage
│   ├── teaching.md         # Teaching content (markdown)
│   ├── acknowledgments.json# Acknowledgments data
│   └── blog/               # Blog posts (markdown files)
│
├── img/
│   └── photo.jpg           # Profile photo
│
├── Articles/               # PDF files of papers
├── Figures/                # Research figures/videos
│   └── minimax/            # Minimax animation videos
│
└── old_site/               # Legacy site (archived)
```

---

## Data Files Reference

### papers.json
Each paper object:
```json
{
  "id": "unique-id",
  "shortTitle": "Acronym",        // Displayed in graph nodes
  "title": "Full Paper Title",
  "authors": ["Author 1", "Author 2"],
  "venue": "Journal/Conference, Year",
  "year": 2025,
  "arxiv": "2310.19793",          // ArXiv ID (optional)
  "themes": ["gradient-flows"],   // Main categories
  "subthemes": ["convergence"],   // Subcategories
  "models": ["index-models"],     // Model types
  "type": "theoretical",          // theoretical | applied
  "selected": true,               // Featured paper?
  "abstract": "...",
  "connections": ["other-paper-id"]  // Related papers (for graph edges)
}
```

**Themes** (node colors in graph):
- `gradient-flows` → Blue
- `supervised-learning` → Green  
- `online-learning` → Orange
- `variational-inference` → Purple

### coauthors.json
Each coauthor object:
```json
{
  "id": "firstname-lastname",
  "name": "Full Name",
  "url": "https://...",
  "role": "PhD advisor",          // Optional description
  "period": "france",             // france | europe | usa (determines color)
  "affiliation": "Lab/University",
  "papers": ["paper-id-1", "paper-id-2"]  // Joint papers
}
```

**Period colors** (coauthor graph):
- `france` → Blue (#3b82f6)
- `europe` → Orange (#f59e0b)
- `usa` → Green (#10b981)

### quotes.json
```json
{
  "text": "Quote text here",
  "author": "Author Name",        // Use "JeséplusKiadissa" for unknown
  "source": "Context/Source",
  "url": ""                       // Optional link
}
```
- Use `\n` for line breaks in poems/multi-line quotes

### Markdown files (about.md, teaching.md, bio.md)
- Standard markdown with `**bold**`, `*italic*`, `[links](url)`
- Headings: `## Section`, `### Subsection`
- Lists: `- item`
- Rendered by `renderMarkdown()` in main.js

---

## JavaScript Components

### typewriter.js
- Displays random quote with typewriter animation on all pages
- Handles `\n` → `<br>` for line breaks
- Shows source and author (author in italics)

### research-graph.js
- Cytoscape.js graph showing paper relationships
- fcose layout with custom spacing
- Nodes: 70px diameter, 40px font
- Click node → opens paper details
- Hover: node grows 1.1x
- Search bar filters nodes
- Legend toggles theme visibility

### coauthor-graph.js
- Cytoscape.js graph showing coauthor network
- Nodes colored by period (france/europe/usa)
- Hover: node grows 1.3x
- Click → opens coauthor URL
- Auto-fits to container

### main.js
- `renderMarkdown(md)` — converts markdown to HTML
- `inlineFormat(text)` — handles bold/italic/links
- `loadMarkdown(url, containerId)` — fetches and renders markdown file

---

## How to Update Content

### Add a new paper
1. Edit `data/papers.json`
2. Add new object with all required fields
3. Add `shortTitle` for graph display
4. List `connections` to related papers
5. Optionally add PDF to `Articles/`

### Add a new coauthor
1. Edit `data/coauthors.json`
2. Add object with `period` field (france/europe/usa)
3. List joint `papers` by ID

### Add a quote
1. Edit `data/quotes.json`
2. Use `\n` for line breaks
3. Use "JeséplusKiadissa" for unknown author

### Update CV/Teaching
1. Edit `data/about.md` or `data/teaching.md`
2. Use standard markdown syntax

### Add blog post
1. Create new `.md` file in `data/blog/`
2. Blog page will load it automatically

---

## Styling Notes

### Colors (in style.css)
- Primary: `#1e3a8a` (dark blue)
- Accent: `#3b82f6` (bright blue)
- Background: `#fafafa`
- Text: `#1f2937`

### Navigation
- Acknowledgments page exists but is hidden from nav (remove from nav when ready to show)
- All pages share same header/footer structure

### Graphs
- Both use Cytoscape.js with fcose layout
- Paper graph: theme-based colors, clickable nodes
- Coauthor graph: period-based colors

---

## Deployment

1. Commit changes: `git add -A && git commit -m "message"`
2. Push to GitHub: `git push origin main`
3. Site auto-deploys via GitHub Pages

---

## Dependencies (loaded via CDN)

- **Cytoscape.js** — Graph visualization
- **cytoscape-fcose** — Force-directed layout
- No build step required — pure HTML/CSS/JS
