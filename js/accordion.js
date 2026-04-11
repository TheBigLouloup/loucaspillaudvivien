/* ============================================================
   accordion.js — Accessible accordion expand/collapse
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.accordion-trigger');
    if (!trigger) return;

    const contentId = trigger.getAttribute('aria-controls');
    const content = document.getElementById(contentId);
    if (!content) return;

    const isOpen = trigger.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      trigger.setAttribute('aria-expanded', 'false');
      content.style.maxHeight = '0';
      content.classList.remove('open');
    } else {
      trigger.setAttribute('aria-expanded', 'true');
      content.style.maxHeight = content.scrollHeight + 'px';
      content.classList.add('open');
    }
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const trigger = e.target.closest('.accordion-trigger');
      if (trigger) {
        e.preventDefault();
        trigger.click();
      }
    }
  });
});
