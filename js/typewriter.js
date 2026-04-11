/* ============================================================
   typewriter.js — Random quote with typewriter effect
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.quote-container');
  if (!container) return;

  try {
    const resp = await fetch('data/quotes.json');
    const quotes = await resp.json();
    if (!quotes.length) return;

    const quote = pickRandom(quotes);
    const color = pickRandom(ACCENT_COLORS);
    container.style.color = color;
    document.querySelectorAll('.section-divider').forEach(d => {
      d.style.background = color;
      d.style.opacity = '0.4';
    });

    // Build the full text - convert literal \n to actual newlines
    let rawText = quote.text.replace(/\\n/g, '\n');
    let fullText = '\u201C' + rawText + '\u201D';
    let attribution = ' \u2014 ';
    
    // Build attribution: "— Source, Author" or "— Author"
    if (quote.source) {
      if (quote.url) {
        attribution += '<a href="' + quote.url + '" target="_blank" style="color:' + color + '; border-bottom: 1px solid currentColor"><em>' + quote.source + '</em></a>, <em>' + quote.author + '</em>';
      } else {
        attribution += '<em>' + quote.source + '</em>, <em>' + quote.author + '</em>';
      }
    } else {
      if (quote.url) {
        attribution += '<a href="' + quote.url + '" target="_blank" style="color:' + color + '; border-bottom: 1px solid currentColor"><em>' + quote.author + '</em></a>';
      } else {
        attribution += '<em>' + quote.author + '</em>';
      }
    }

    // Check reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      container.innerHTML = fullText.replace(/\n/g, '<br>') + attribution;
      return;
    }

    // Typewriter animation
    const textSpan = document.createElement('span');
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    container.appendChild(textSpan);
    container.appendChild(cursor);

    const chars = fullText.split('');
    let i = 0;

    function typeNext() {
      if (i < chars.length) {
        if (chars[i] === '\n') {
          textSpan.appendChild(document.createElement('br'));
        } else {
          textSpan.appendChild(document.createTextNode(chars[i]));
        }
        i++;
        setTimeout(typeNext, 40);
      } else {
        // After typing the quote, add attribution instantly
        const attrSpan = document.createElement('span');
        attrSpan.innerHTML = attribution;
        container.insertBefore(attrSpan, cursor);
        // Remove cursor after a moment
        setTimeout(() => cursor.remove(), 2000);
      }
    }

    typeNext();
  } catch (e) {
    // Silently fail — quote is decorative
  }
});
