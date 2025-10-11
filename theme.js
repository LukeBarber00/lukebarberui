// /theme.js
(function () {
  const root = document.documentElement;

  // ===== Theme: apply saved theme (if any)
  const stored = localStorage.getItem('theme');
  if (stored) root.dataset.theme = stored;

  const toggleTheme = () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  };

  // ===== Mobile nav refs (safe if not present)
  const nav = document.getElementById('site-nav');
  const burger = document.querySelector('.nav-toggle');

  const openMenu = () => {
    if (!nav || !burger) return;
    nav.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
  };
  const closeMenu = () => {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  };
  const toggleMenu = () => {
    if (!nav) return;
    (nav.classList.contains('is-open') ? closeMenu : openMenu)();
  };

  // ===== Smooth anchor scroll
  const DURATION = 240; // tweak to 200–300ms if you like

  function getScrollParent(node) {
    for (let p = node && node.parentElement; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (/(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight) return p;
    }
    return document.scrollingElement || document.documentElement;
  }

  function smoothScrollToTarget(target) {
    const scroller = getScrollParent(target);

    // account for fixed header only when scrolling the page
    const header = document.querySelector('.site-header');
    const headerH =
      (scroller === document.scrollingElement || scroller === document.documentElement) && header
        ? header.getBoundingClientRect().height
        : 0;

    const scRect = scroller === document.scrollingElement || scroller === document.documentElement
      ? { top: 0 }
      : scroller.getBoundingClientRect();
    const tRect  = target.getBoundingClientRect();

    const start = scroller.scrollTop;
    const goal  = start + (tRect.top - scRect.top) - headerH - 8; // a bit of breathing room
    const end   = Math.max(0, goal);

    const startTime = performance.now();
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2); // easeInOutQuad

    function step(now) {
      const t = Math.min(1, (now - startTime) / DURATION);
      const y = start + (end - start) * ease(t);
      scroller.scrollTop = y;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ===== Single delegated click handler
  document.addEventListener('click', (e) => {
    const target = e.target;

    // Theme toggle (works if you click the button or its child icons)
    if (target.closest('button.mode-toggle') || target.closest('.toggle-block button')) {
      toggleTheme();
      return;
    }

    // Hamburger toggle
    if (target.closest('.nav-toggle')) {
      toggleMenu();
      return;
    }

    // Close when clicking a nav link (mobile)
    if (target.closest('#site-nav .navlink')) {
      closeMenu();
      return;
    }

    // Click outside closes menu (mobile)
    if (nav && nav.classList.contains('is-open')) {
      const clickedInsideMenu = target.closest('#site-nav');
      const clickedBurger = target.closest('.nav-toggle');
      if (!clickedInsideMenu && !clickedBurger) {
        closeMenu();
        // don't return; allow smooth-scroll to run if the click was on an in-page link outside
      }
    }

    // Smooth anchor scroll — same-page links only
    const link = target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    const m = href && href.match(/^[./]*\/?#([^?&#\s]+)/); // "#id", "/#id", "./#id"
    if (!m) return;

    const url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname) return; // only same-page

    const id = m[1];
    const anchorTarget = document.getElementById(id);
    if (!anchorTarget) return;

    e.preventDefault();
    smoothScrollToTarget(anchorTarget);
    history.replaceState(null, '', '#' + id); // update URL without jump
  });

  // Esc to close menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) closeMenu();
  });

document.addEventListener('DOMContentLoaded', () => {
  const navLinks   = document.querySelectorAll('.navlink');
  const brand      = document.querySelector('.brand');       // <a class="brand">
  const brandGrid  = document.querySelector('.brand-grid');  // <span class="brand-grid">
  const currentPath = window.location.pathname;
  const isHome = currentPath === '/' || currentPath.endsWith('/index.html') || currentPath === '/index.html';

  // 1) Home page: highlight brand only
  if (isHome) {
    brand?.classList.add('active');
    brandGrid?.classList.add('active');
  }

  // 2) Non-home pages: highlight the matching nav link
  navLinks.forEach(link => {
    const url = new URL(link.getAttribute('href'), location.origin);
    const linkPath = url.pathname;
    const linkHash = url.hash;

    // Skip "Projects" on home (/#projects)
    if (isHome && linkHash === '#projects') return;

    if (!isHome && linkPath === currentPath) {
      link.classList.add('active');
    }
  });
});

// Back to top button
const backToTop = document.querySelector('.back-to-top');

if (backToTop) {
  const toggle = () => {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };

  // Show correct state on load & when scrolling (passive for perf)
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });

  // --- Custom smooth scroll animation (ease-in) ---
  function scrollToTop(duration = 200) {
    // Respect reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, 0);
      return;
    }

    const startY = window.scrollY || window.pageYOffset;
    const startT = performance.now();
    const easeInCubic = t => t * t * t; // slow start → fast finish

    function step(now) {
      const t = Math.min(1, (now - startT) / duration);
      const y = Math.round(startY * (1 - easeInCubic(t)));
      window.scrollTo(0, y);
      if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Trigger scroll animation on click
  backToTop.addEventListener('click', e => {
    e.preventDefault();
    scrollToTop(200); // adjust duration (ms) for speed
  });
}


})();


