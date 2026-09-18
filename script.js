// Header scroll state
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
  });

  // Mobile menu
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  function toggleMenu(){
    burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  }
  burger.addEventListener('click', toggleMenu);
  burger.addEventListener('keypress', e => { if(e.key === 'Enter') toggleMenu(); });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', toggleMenu));

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  document.querySelectorAll('.gallery-grid figure').forEach(fig => {
    fig.addEventListener('click', () => {
      lightboxImg.src = fig.dataset.full;
      lightboxImg.alt = fig.querySelector('img').alt;
      lightbox.classList.add('open');
    });
  });
  document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', (e) => { if(e.target === lightbox) lightbox.classList.remove('open'); });
