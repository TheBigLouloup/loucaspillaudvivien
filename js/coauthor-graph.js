/* ============================================================
   coauthor-graph.js — Cytoscape co-author graph
   Dark theme, fcose layout, edges between coauthors
   ============================================================ */

let coauthorCy = null;

async function initCoauthorGraph(containerEl, panelEl) {
  const [coauthorsResp, papersResp] = await Promise.all([
    fetch('data/coauthors.json'),
    fetch('data/papers.json')
  ]);
  const coauthors = await coauthorsResp.json();
  const papers = await papersResp.json();

  const paperMap = {};
  papers.forEach(p => { paperMap[p.id] = p; });

  // Build paper-to-coauthors map (which coauthors worked on each paper)
  const paperToCoauthors = {};
  coauthors.forEach(ca => {
    ca.papers.forEach(pid => {
      if (!paperToCoauthors[pid]) paperToCoauthors[pid] = [];
      paperToCoauthors[pid].push(ca.id);
    });
  });

  // Compute paper-paper similarity (reuse paper graph formula)
  function paperSimilarity(a, b) {
    const sharedThemes = (a.themes || []).filter(t => (b.themes || []).includes(t)).length;
    const sharedSub = (a.subthemes || []).filter(t => (b.subthemes || []).includes(t)).length;
    const sharedModels = (a.models || []).filter(t => (b.models || []).includes(t)).length;
    const isExplicit = (a.connections || []).includes(b.id) || (b.connections || []).includes(a.id);
    return sharedThemes * 0.5 + sharedSub * 0.3 + sharedModels * 5.0 + (isExplicit ? 1.0 : 0);
  }

  // Build coauthor-coauthor edge weights
  const caEdgeWeights = {};

  // 1. Direct co-authorship: both on the same paper
  Object.values(paperToCoauthors).forEach(caList => {
    for (let i = 0; i < caList.length; i++) {
      for (let j = i + 1; j < caList.length; j++) {
        const key = [caList[i], caList[j]].sort().join('|');
        if (!caEdgeWeights[key]) caEdgeWeights[key] = 0;
        caEdgeWeights[key] += 5.0;
      }
    }
  });

  // 2. Paper proximity: coauthor A's papers connected to coauthor B's papers
  for (let i = 0; i < coauthors.length; i++) {
    for (let j = i + 1; j < coauthors.length; j++) {
      const a = coauthors[i];
      const b = coauthors[j];
      const key = [a.id, b.id].sort().join('|');

      let proxScore = 0;
      a.papers.forEach(pidA => {
        b.papers.forEach(pidB => {
          if (pidA === pidB) return; // already counted as direct
          const pA = paperMap[pidA];
          const pB = paperMap[pidB];
          if (pA && pB) {
            const sim = paperSimilarity(pA, pB);
            if (sim > 0) proxScore += 0.5;
          }
        });
      });

      if (proxScore > 0) {
        if (!caEdgeWeights[key]) caEdgeWeights[key] = 0;
        caEdgeWeights[key] += proxScore;
      }
    }
  }

  // Colors by region
  const periodColors = {
    'france': '#7AACDB',      // France - blue
    'europe': '#E0A98A',      // Europe - warm
    'usa': '#8FC09A'          // USA - green
  };

  const elements = [];
  const weakEdges = [];
  const maxPapers = Math.max(...coauthors.map(c => c.papers.length));

  // Loucas node — included visually but his edges are added after layout
  elements.push({
    group: 'nodes',
    data: {
      id: 'loucas',
      label: 'Loucas Pillaud-Vivien',
      nodeColor: '#fff',
      size: 65,
      isCenter: true,
      affiliation: ''
    }
  });

  // Coauthor nodes
  coauthors.forEach(ca => {
    const nodeColor = periodColors[ca.period] || '#999';
    const size = 30 + (ca.papers.length / maxPapers) * 45;

    elements.push({
      group: 'nodes',
      data: {
        id: ca.id,
        label: ca.name,
        nodeColor: nodeColor,
        size: size,
        isCenter: false,
        url: ca.url,
        role: ca.role,
        affiliation: ca.affiliation,
        period: ca.period,
        paperIds: ca.papers,
        paperCount: ca.papers.length
      }
    });

    // Loucas edges — added after layout so they don't collapse clusters
    weakEdges.push({
      group: 'edges',
      data: {
        id: 'edge-loucas-' + ca.id,
        source: 'loucas',
        target: ca.id,
        weight: ca.papers.length,
        edgeWidth: Math.min(4, 0.5 + ca.papers.length * 0.6),
        edgeOpacity: Math.min(0.5, 0.1 + ca.papers.length * 0.06)
      }
    });
  });

  // Coauthor-coauthor edges — strong ones for layout, weak ones added after
  Object.entries(caEdgeWeights).forEach(([key, weight]) => {
    const [srcId, tgtId] = key.split('|');
    const width = Math.min(5, 0.5 + weight * 0.4);
    const opacity = Math.min(0.7, 0.1 + weight * 0.06);

    const target = weight >= 2.0 ? elements : weakEdges;
    target.push({
      group: 'edges',
      data: {
        id: 'ca-edge-' + key,
        source: srcId,
        target: tgtId,
        weight: weight,
        edgeWidth: width,
        edgeOpacity: opacity
      }
    });
  });

  coauthorCy = cytoscape({
    container: containerEl,
    elements: elements,
    style: [
      {
        selector: 'node',
        style: {
          'background-color': 'data(nodeColor)',
          'label': 'data(label)',
          'width': 'data(size)',
          'height': 'data(size)',
          'font-size': 20,
          'font-family': 'Inter, sans-serif',
          'text-valign': 'bottom',
          'text-margin-y': 6,
          'color': 'rgba(255,255,255,0.85)',
          'text-wrap': 'wrap',
          'text-max-width': 150,
          'border-width': 1.5,
          'border-color': 'rgba(255,255,255,0.3)',
          'transition-property': 'width, height, border-width',
          'transition-duration': '0.12s'
        }
      },
      {
        selector: 'node[?isCenter]',
        style: {
          'font-size': 22,
          'font-weight': 'bold',
          'color': '#fff',
          'text-margin-y': 8,
          'border-color': 'rgba(255,255,255,0.6)'
        }
      },
      {
        selector: 'node:active, node:grabbed',
        style: { 'overlay-opacity': 0 }
      },
      {
        selector: 'edge',
        style: {
          'line-color': 'rgba(255,255,255,0.4)',
          'width': 'data(edgeWidth)',
          'opacity': 'data(edgeOpacity)',
          'curve-style': 'bezier',
          'events': 'no'
        }
      },
      {
        selector: 'node.ca-highlighted',
        style: {
          'border-width': 2.5,
          'border-color': '#fff',
          'color': '#fff'
        }
      },
      {
        selector: 'node.ca-dimmed',
        style: { 'opacity': 0.1 }
      },
      {
        selector: 'edge.ca-dimmed',
        style: { 'opacity': 0.02 }
      },
      {
        selector: 'edge.ca-highlighted',
        style: {
          'line-color': '#fff',
          'opacity': 0.8
        }
      }
    ],
    layout: {
      name: 'fcose',
      quality: 'default',
      randomize: true,
      animate: false,
      padding: 60,
      nodeDimensionsIncludeLabels: true,
      nodeRepulsion: 3000000,
      idealEdgeLength: function(edge) {
        return Math.max(20, 400 - edge.data('weight') * 40);
      },
      edgeElasticity: function(edge) {
        return 0.003 + edge.data('weight') * 0.25;
      },
      gravity: 0.002,
      gravityRange: 2.0,
      numIter: 2500,
      tilingPaddingVertical: 30,
      tilingPaddingHorizontal: 30
    },
    minZoom: 0.3,
    maxZoom: 3
  });

  // Add weak edges after layout — visible but didn't affect clustering
  if (weakEdges.length > 0) {
    coauthorCy.add(weakEdges);
  }

  // Position Loucas at center of all coauthors
  const allPos = coauthorCy.nodes('[!isCenter]').map(n => n.position());
  const cx = allPos.reduce((s, p) => s + p.x, 0) / allPos.length;
  const cy = allPos.reduce((s, p) => s + p.y, 0) / allPos.length;
  coauthorCy.getElementById('loucas').position({ x: cx, y: cy });

  // Fit graph to container
  coauthorCy.fit(undefined, 40);

  coauthorCy.nodes().grabify();

  // Hover — grow node and change cursor
  coauthorCy.on('mouseover', 'node', (e) => {
    const node = e.target;
    containerEl.style.cursor = 'pointer';
    const baseSize = node.data('size');
    node.style({ 
      'width': baseSize * 1.3, 
      'height': baseSize * 1.3,
      'border-width': 2.5, 
      'border-color': '#fff'
    });
  });
  coauthorCy.on('mouseout', 'node', (e) => {
    const node = e.target;
    containerEl.style.cursor = 'default';
    if (!node.hasClass('ca-highlighted')) {
      const baseSize = node.data('size');
      node.style({ 
        'width': baseSize, 
        'height': baseSize,
        'border-width': node.data('isCenter') ? 1.5 : 1.5, 
        'border-color': node.data('isCenter') ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' 
      });
    }
  });

  // Disable edge clicks
  coauthorCy.on('tap', 'edge', (e) => {
    e.preventDefault();
  });

  // Click coauthor -> show shared papers
  coauthorCy.on('tap', 'node', (e) => {
    const node = e.target;
    const data = node.data();

    const paperIds = data.paperIds || [];
    const sharedPapers = paperIds
      .map(id => paperMap[id])
      .filter(Boolean);

    const papersHTML = sharedPapers.map(p => {
      const link = p.arxiv
        ? `<a href="https://arxiv.org/abs/${p.arxiv}" target="_blank">${p.title}</a>`
        : p.title;
      return `<li style="margin-bottom:8px; font-size:0.85rem">${link}<br><span style="color:#888; font-size:0.8rem">${p.venue}</span></li>`;
    }).join('');

    const urlHTML = data.url
      ? `<p><a class="panel-link" href="${data.url}" target="_blank">Homepage</a></p>`
      : '';

    panelEl.innerHTML = `
      <div class="panel-title">${data.label}</div>
      <div class="panel-venue">${data.role || 'Collaborator'} — ${data.affiliation || ''}</div>
      <p style="font-size:0.85rem; margin-top:12px"><strong>${sharedPapers.length} shared paper${sharedPapers.length !== 1 ? 's' : ''}:</strong></p>
      <ul style="list-style:none; padding:0; margin-top:8px">${papersHTML}</ul>
      ${urlHTML}
    `;

    coauthorCy.elements().removeClass('ca-highlighted ca-dimmed');
    const connected = node.closedNeighborhood();
    connected.addClass('ca-highlighted');
    coauthorCy.elements().not(connected).addClass('ca-dimmed');
  });

  coauthorCy.on('tap', (e) => {
    if (e.target === coauthorCy) {
      coauthorCy.elements().removeClass('ca-highlighted ca-dimmed');
    }
  });

  return coauthorCy;
}
