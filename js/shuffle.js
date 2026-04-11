/* ============================================================
   shuffle.js — FLIP shuffle animation for acknowledgments
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('ack-grid');
  const btn = document.getElementById('shuffle-btn');
  if (!grid) return;

  try {
    const resp = await fetch('data/acknowledgments.json');
    const data = await resp.json();
    if (!data.length) return;

    let items = shuffleArray([...data]);

    function render(items) {
      grid.innerHTML = '';
      items.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = 'ack-card';
        card.innerHTML = `
          <div class="ack-person">${item.person}</div>
          <div class="ack-text">${item.text}</div>
        `;
        grid.appendChild(card);
      });
    }

    render(items);

    if (btn) {
      btn.addEventListener('click', () => {
        const cards = [...grid.children];
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // FLIP: First — record positions
        const firstRects = cards.map(c => c.getBoundingClientRect());

        // Shuffle data and re-render
        items = shuffleArray([...items]);
        render(items);

        if (prefersReduced) return;

        // FLIP: Last — get new positions
        const newCards = [...grid.children];
        const lastRects = newCards.map(c => c.getBoundingClientRect());

        // FLIP: Invert + Play
        newCards.forEach((card, i) => {
          // Map by index — since we re-rendered, positions are based on new order
          if (i < firstRects.length) {
            const dx = firstRects[i].left - lastRects[i].left;
            const dy = firstRects[i].top - lastRects[i].top;

            if (dx !== 0 || dy !== 0) {
              card.style.transform = `translate(${dx}px, ${dy}px)`;
              card.style.transition = 'none';

              requestAnimationFrame(() => {
                card.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                card.style.transform = '';
              });
            }
          }
        });
      });
    }
  } catch (e) {
    grid.innerHTML = '<p>Content could not be loaded.</p>';
  }
});
