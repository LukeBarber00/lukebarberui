// /theme.js
(function () {
  const root = document.documentElement;

  // apply saved theme (if any)
  const stored = localStorage.getItem('theme');
  if (stored) root.dataset.theme = stored;

  const toggle = () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  };

  // Single delegated click handler:
  // - theme toggle button
  // - smooth anchor scroll
  document.addEventListener('click', (e) => {
    // Theme toggle (works if you click the button or its child icons)
    if (e.target.closest('button.mode-toggle') || e.target.closest('.toggle-block button')) {
      toggle();
      return;
    }

    // Smooth anchor scroll — 240ms, always animated
const DURATION = 240; // tweak to 200–300ms if you like

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href');
  const m = href && href.match(/^[./]*\/?#([^?&#\s]+)/); // "#id", "/#id", "./#id"
  if (!m) return;

  const url = new URL(link.href, location.href);
  if (url.pathname !== location.pathname) return; // only same-page

  const id = m[1];
  const target = document.getElementById(id);
  if (!target) return;

  e.preventDefault();
  smoothScrollToTarget(target);
  history.replaceState(null, '', '#' + id); // update URL without jump
});

// ---- helpers ----
function getScrollParent(node) {
  for (let p = node.parentElement; p; p = p.parentElement) {
    const s = getComputedStyle(p);
    if (/(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight) return p;
  }
  return document.scrollingElement || document.documentElement;
}

function smoothScrollToTarget(target) {
  const scroller = getScrollParent(target);

  // account for fixed header only when scrolling the page
  const header = document.querySelector('.site-header');
  const headerH = (scroller === document.scrollingElement && header)
    ? header.getBoundingClientRect().height
    : 0;

  const scRect = scroller === document.scrollingElement ? { top: 0 } : scroller.getBoundingClientRect();
  const tRect  = target.getBoundingClientRect();

  const start = scroller.scrollTop;
  const goal  = start + (tRect.top - scRect.top) - headerH - 8; // a bit of breathing room
  const end   = Math.max(0, goal);

  const startTime = performance.now();
  const ease = (t) => t < 0.5
    ? 2 * t * t                  // easeInOutQuad
    : 1 - Math.pow(-2 * t + 2, 2) / 2;

  function step(now) {
    const t = Math.min(1, (now - startTime) / DURATION);
    const y = start + (end - start) * ease(t);
    scroller.scrollTop = y;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

  });
})();

