(() => {
  const root = document.getElementById('eco-gallery');
  if (!root) return;

  const track   = root.querySelector('.gallery-track');
  const slides  = Array.from(root.querySelectorAll('.gallery-slide'));
  const prevBtn = root.querySelector('.gallery-nav.prev');
  const nextBtn = root.querySelector('.gallery-nav.next');
  const dotsBox = root.querySelector('.gallery-dots');

  let i = 0;

  // Build dots
  slides.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
    dot.setAttribute('aria-selected', idx === i ? 'true' : 'false');
    dot.addEventListener('click', () => go(idx));
    dotsBox.appendChild(dot);
  });
  const dots = Array.from(dotsBox.querySelectorAll('button'));

  function update() {
    track.style.transform = `translateX(${-i * 100}%)`;
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    dots.forEach((d, idx) => d.setAttribute('aria-selected', idx === i ? 'true' : 'false'));
    prevBtn.disabled = (i === 0);
    nextBtn.disabled = (i === slides.length - 1);
  }

  function go(next) {
    i = Math.max(0, Math.min(slides.length - 1, next));
    update();
  }

  prevBtn.addEventListener('click', () => go(i - 1));
  nextBtn.addEventListener('click', () => go(i + 1));

  // Keyboard support
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  go(i - 1);
    if (e.key === 'ArrowRight') go(i + 1);
  });

  // Touch swipe
  let startX = null;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchmove', (e) => {
    if (startX === null) return;
    const dx = e.touches[0].clientX - startX;
    if (Math.abs(dx) > 60) { go(i + (dx < 0 ? 1 : -1)); startX = null; }
  }, { passive: true });

  // Init
  update();
})();

