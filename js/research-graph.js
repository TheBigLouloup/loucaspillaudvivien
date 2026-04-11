/* ============================================================
   research-graph.js — Cytoscape paper graph
   Clean single-tone design, edges only where papers share tags
   ============================================================ */

let paperCy = null;

async function initPaperGraph(containerEl, panelEl) {
  const resp = await fetch('data/papers.json');
  const papers = await resp.json();

  const elements = [];
  const paperMap = {};
  papers.forEach(p => { paperMap[p.id] = p; });

  // Node color: single refined tone, slight variation by year
  const minYear = Math.min(...papers.map(p => p.year));
  const maxYear = Math.max(...papers.map(p => p.year));
  const yearSpan = maxYear - minYear || 1;

  papers.forEach(paper => {
    let shape = 'ellipse';
    if (paper.type === 'experimental') shape = 'rectangle';
    if (paper.type === 'mixed') shape = 'diamond';

    // Subtle lightness variation by year: older = lighter, newer = darker
    const t = (paper.year - minYear) / yearSpan;
    const l = 55 + t * 20; // 55% (muted) → 75% (bright) — lighter = newer
    const nodeColor = `hsl(215, 40%, ${l}%)`;

    const shortTitle = paper.shortTitle || paper.title.split(/\s+/).slice(0, 3).join(' ');

    const allTags = [
      ...(paper.themes || []),
      ...(paper.subthemes || []),
      ...(paper.models || [])
    ].join(' ');

    elements.push({
      group: 'nodes',
      data: {
        id: paper.id,
        label: shortTitle,
        nodeColor: nodeColor,
        shape: shape,
        themes: paper.themes || [],
        subthemes: paper.subthemes || [],
        models: paper.models || [],
        fullTitle: paper.title,
        authors: paper.authors.join(', '),
        venue: paper.venue,
        abstract: paper.abstract || '',
        arxiv: paper.arxiv,
        type: paper.type,
        year: paper.year,
        selected: paper.selected,
        searchText: (paper.title + ' ' + paper.authors.join(' ') + ' ' + allTags).toLowerCase()
      }
    });
  });

  // Edges: ONLY between papers that actually share tags or have explicit connections
  const explicitSet = new Set();
  papers.forEach(paper => {
    (paper.connections || []).forEach(targetId => {
      explicitSet.add(paper.id + '|' + targetId);
      explicitSet.add(targetId + '|' + paper.id);
    });
  });

  const edgeSet = new Set();
  const weakEdges = [];

  for (let i = 0; i < papers.length; i++) {
    for (let j = i + 1; j < papers.length; j++) {
      const a = papers[i];
      const b = papers[j];

      const sharedThemes = (a.themes || []).filter(t => (b.themes || []).includes(t)).length;
      const sharedSub = (a.subthemes || []).filter(t => (b.subthemes || []).includes(t)).length;
      const sharedModels = (a.models || []).filter(t => (b.models || []).includes(t)).length;
      const isExplicit = explicitSet.has(a.id + '|' + b.id);

      const totalShared = sharedThemes + sharedSub + sharedModels;

      // Only create edge if papers actually share something or are explicitly connected
      if (totalShared === 0 && !isExplicit) continue;

      const weight = sharedThemes * 0.5 + sharedSub * 0.3 + sharedModels * 5.0 + (isExplicit ? 1.0 : 0);

      const width = Math.min(3.5, 0.4 + weight * 0.4);
      const opacity = Math.min(0.6, 0.08 + weight * 0.08);

      const key = a.id + '|' + b.id;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        const edgeData = {
          group: 'edges',
          data: {
            id: `e-${key}`,
            source: a.id,
            target: b.id,
            weight: weight,
            edgeWidth: width,
            edgeOpacity: opacity
          }
        };
        // Strong edges: used for layout. Weak edges: added after layout for visual only.
        if (weight >= 1.5) {
          elements.push(edgeData);
        } else {
          weakEdges.push(edgeData);
        }
      }
    }
  }

  paperCy = cytoscape({
    container: containerEl,
    elements: elements,
    style: [
      {
        selector: 'core',
        style: {
          'active-bg-opacity': 0
        }
      },
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'shape': 'data(shape)',
          'background-color': 'data(nodeColor)',
          'border-color': '#fff',
          'border-width': 2,
          'font-size': 40,
          'font-family': "'Inter', sans-serif",
          'text-wrap': 'wrap',
          'text-max-width': 220,
          'text-valign': 'bottom',
          'text-margin-y': 10,
          'width': 70,
          'height': 70,
          'color': 'rgba(255,255,255,0.85)',
          'transition-property': 'width, height, border-width',
          'transition-duration': '0.12s'
        }
      },
      {
        selector: 'node[?selected]',
        style: {
          'width': 85,
          'height': 85,
          'border-width': 3,
          'font-weight': 'bold',
          'color': '#fff'
        }
      },
      {
        selector: 'node:active, node:grabbed',
        style: { 'overlay-opacity': 0 }
      },
      {
        selector: 'edge',
        style: {
          'line-color': 'rgba(255,255,255,0.5)',
          'width': 'data(edgeWidth)',
          'curve-style': 'bezier',
          'opacity': 'data(edgeOpacity)',
          'events': 'no'
        }
      },
      {
        selector: 'node.highlighted',
        style: {
          'background-color': '#fff',
          'border-color': '#fff',
          'border-width': 3,
          'width': 90,
          'height': 90
        }
      },
      {
        selector: 'edge.highlighted',
        style: {
          'line-color': '#fff',
          'width': 2,
          'opacity': 0.6
        }
      },
      {
        selector: 'node.dimmed',
        style: { 'opacity': 0.1 }
      },
      {
        selector: 'edge.dimmed',
        style: { 'opacity': 0.02 }
      },
      {
        selector: '.filtered-out',
        style: { 'display': 'none' }
      }
    ],
    layout: {
      name: 'fcose',
      quality: 'default',
      randomize: true,
      animate: false,
      padding: 100,
      nodeDimensionsIncludeLabels: true,
      nodeRepulsion: 4000000,
      idealEdgeLength: function(edge) {
        return Math.max(50, 600 - edge.data('weight') * 120);
      },
      edgeElasticity: function(edge) {
        return 0.003 + edge.data('weight') * 0.15;
      },
      gravity: 0.002,
      gravityRange: 2.5,
      numIter: 2500,
      tilingPaddingVertical: 50,
      tilingPaddingHorizontal: 50
    },
    minZoom: 0.08,
    maxZoom: 3
  });

  // Add weak edges after layout — visible but didn't affect node positions
  if (weakEdges.length > 0) {
    paperCy.add(weakEdges);
  }

  // Fit graph to container
  paperCy.fit(undefined, 40);

  // Hover
  paperCy.on('mouseover', 'node', (e) => {
    containerEl.style.cursor = 'pointer';
    e.target.style({ 'width': 90, 'height': 90, 'border-width': 3, 'border-color': '#fff' });
  });
  paperCy.on('mouseout', 'node', (e) => {
    containerEl.style.cursor = 'default';
    if (!e.target.hasClass('highlighted')) {
      const sel = e.target.data('selected');
      e.target.style({
        'width': sel ? 85 : 70,
        'height': sel ? 85 : 70,
        'border-width': sel ? 3 : 2,
        'border-color': e.target.data('nodeColor')
      });
    }
  });

  // Click: panel + highlight neighborhood
  paperCy.on('tap', 'node', (e) => {
    const node = e.target;
    const d = node.data();

    const makeTags = (arr, bg, fg) => (arr || []).map(t =>
      `<span class="tag" style="background:${bg};color:${fg}">${t}</span>`
    ).join(' ');

    const themeTags = makeTags(d.themes, 'rgba(45,48,56,0.08)', '#2D3038');
    const subTags = makeTags(d.subthemes, 'rgba(90,124,165,0.1)', '#5A7CA5');
    const modelTags = makeTags(d.models, 'rgba(158,142,120,0.1)', '#7A6E5C');

    const arxivLink = d.arxiv
      ? `<a class="panel-link" href="https://arxiv.org/abs/${d.arxiv}" target="_blank">arXiv:${d.arxiv}</a>`
      : '';

    panelEl.innerHTML = `
      <div class="panel-title">${d.fullTitle}</div>
      <div class="panel-authors">${d.authors}</div>
      <div class="panel-venue">${d.venue}</div>
      ${d.abstract ? '<div class="panel-abstract">' + d.abstract + '</div>' : ''}
      <div class="panel-tags">${themeTags}${subTags ? ' ' + subTags : ''}${modelTags ? ' ' + modelTags : ''}</div>
      ${arxivLink}
    `;

    paperCy.elements().removeClass('highlighted dimmed');
    const connected = node.closedNeighborhood();
    connected.addClass('highlighted');
    paperCy.elements().not(connected).addClass('dimmed');
  });

  paperCy.on('tap', (e) => {
    if (e.target === paperCy) {
      paperCy.elements().removeClass('highlighted dimmed');
    }
  });

  return paperCy;
}

function filterPaperGraph(activeThemes, searchQuery) {
  if (!paperCy) return;

  paperCy.nodes().forEach(node => {
    const matchesSearch = !searchQuery || node.data('searchText').includes(searchQuery.toLowerCase());
    if (matchesSearch) {
      node.removeClass('filtered-out');
    } else {
      node.addClass('filtered-out');
    }
  });

  paperCy.edges().forEach(edge => {
    if (edge.source().hasClass('filtered-out') || edge.target().hasClass('filtered-out')) {
      edge.addClass('filtered-out');
    } else {
      edge.removeClass('filtered-out');
    }
  });
}
