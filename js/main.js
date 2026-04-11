/* ============================================================
   main.js — Shared utilities
   ============================================================ */

/* Simple markdown → HTML converter
   Handles: **bold**, *italic*, [text](url), ## headings, - lists, \n\n → <p> */
function renderMarkdown(md) {
  if (!md) return '';
  let html = md
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Split into blocks by double newlines
  const blocks = html.split(/\n\n+/);
  const result = [];

  for (let block of blocks) {
    block = block.trim();
    if (!block) continue;

    // Already a heading tag
    if (/^<h[1-3]>/.test(block)) {
      result.push(block);
      continue;
    }

    // List block
    if (/^[-*] /m.test(block)) {
      const items = block.split(/\n/).filter(l => l.trim());
      const lis = items.map(item => {
        const text = item.replace(/^[-*] /, '');
        return '<li>' + inlineFormat(text) + '</li>';
      }).join('');
      result.push('<ul>' + lis + '</ul>');
      continue;
    }

    // Paragraph
    result.push('<p>' + inlineFormat(block.replace(/\n/g, ' ')) + '</p>');
  }

  return result.join('\n');
}

function inlineFormat(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
}

/* Fetch markdown and render into an element */
async function loadMarkdown(url, el) {
  try {
    const resp = await fetch(url);
    const md = await resp.text();
    el.innerHTML = renderMarkdown(md);
  } catch (e) {
    el.innerHTML = '<p>Content could not be loaded.</p>';
  }
}

/* Mobile sidebar toggle */
document.addEventListener('DOMContentLoaded', () => {
  // Close mobile sidebar when a link is clicked
  const sidebarLinks = document.querySelectorAll('.sidebar__nav a');
  const toggle = document.getElementById('sidebar-toggle');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (toggle) toggle.checked = false;
    });
  });

  // Scroll reveal with IntersectionObserver
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      reveals.forEach(el => el.classList.add('visible'));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(el => observer.observe(el));
    }
  }
});

/* Utility functions */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ACCENT_COLORS = ['#5A7CA5', '#C2907A', '#7E9E87', '#9A8BB5', '#B5A67D'];

const THEME_COLORS = {
  'kernel-methods': '#5A7CA5',
  'sgd-dynamics':   '#C2907A',
  'gradient-flows': '#7E9E87',
  'index-models':   '#9A8BB5',
  'variational':    '#B5A67D'
};

const THEME_LABELS = {
  'kernel-methods': 'Kernel Methods',
  'sgd-dynamics':   'SGD Dynamics',
  'gradient-flows': 'Gradient Flows',
  'index-models':   'Index Models',
  'variational':    'Variational'
};

const PERIOD_COLORS = {
  'sierra': '#5A7CA5',
  'epfl':   '#C2907A',
  'nyu':    '#7E9E87',
  'enpc':   '#9A8BB5'
};
