/* ============================================================
   NEXORA AGENCY — script.js  v3
   Fonctionnel & robuste : theme, header, nav mobile,
   scroll reveal, smooth scroll, form, active nav
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     UTILITAIRES
  ---------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ----------------------------------------------------------
     1. THÈME DARK / LIGHT
  ---------------------------------------------------------- */
  const html        = document.documentElement;
  const themeBtn    = $('#theme-toggle');
  const THEME_KEY   = 'nexora-theme';

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  // Init : préférence sauvegardée ou système
  const saved   = localStorage.getItem(THEME_KEY);
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (sysDark ? 'dark' : 'light'));

  themeBtn?.addEventListener('click', () => {
    setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  // Réagir aux changements système si aucune préférence sauvegardée
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(THEME_KEY)) setTheme(e.matches ? 'dark' : 'light');
  });


  /* ----------------------------------------------------------
     2. HEADER — fond au scroll
  ---------------------------------------------------------- */
  const header = $('#site-header');

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();


  /* ----------------------------------------------------------
     3. NAVIGATION MOBILE
  ---------------------------------------------------------- */
  const navToggle = $('#nav-toggle');
  const mainNav   = $('#main-nav');
  let navOpen     = false;

  function openNav() {
  navOpen = true;
  mainNav.classList.add('open');
  navToggle.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Fermer le menu');
  document.body.style.overflow = 'hidden';
  header?.classList.add('nav-is-open'); // ← ajouter
}

  function closeNav() {
  navOpen = false;
  mainNav.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Ouvrir le menu');
  document.body.style.overflow = '';
  header?.classList.remove('nav-is-open'); // ← ajouter
}

  navToggle?.addEventListener('click', () => navOpen ? closeNav() : openNav());

  // Fermer sur clic d'un lien
  $$('.nav__link').forEach(link => link.addEventListener('click', closeNav));

  // Fermer sur Échap
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navOpen) closeNav();
  });

  // Fermer si on redimensionne au-delà du breakpoint mobile
  window.addEventListener('resize', () => {
    if (window.innerWidth > 640 && navOpen) closeNav();
  }, { passive: true });


  /* ----------------------------------------------------------
     4. SMOOTH SCROLL (avec offset header)
  ---------------------------------------------------------- */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const offset = (header?.offsetHeight ?? 70) + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ----------------------------------------------------------
     5. SCROLL REVEAL (IntersectionObserver)
  ---------------------------------------------------------- */
  const revealEls = $$('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }


  /* ----------------------------------------------------------
     6. ACTIVE NAV LINK au scroll
  ---------------------------------------------------------- */
  const sections = $$('section[id]');
  const navLinks = $$('.nav__link');

  if (sections.length && navLinks.length) {
    const sectionIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(l => l.classList.remove('active'));
        const active = $$(`.nav__link[href="#${entry.target.id}"]`);
        active.forEach(l => l.classList.add('active'));
      });
    }, { threshold: 0.35 });

    sections.forEach(s => sectionIO.observe(s));
  }


  /* ----------------------------------------------------------
     7. FORMULAIRE — validation & feedback
  ---------------------------------------------------------- */
  const form = $('#contact-form');

  if (form) {
    const submitBtn = form.querySelector('[type="submit"]');
    const origLabel = submitBtn.innerHTML;

    // Feedback d'erreur par champ
    function setFieldError(field, hasError) {
      field.style.borderColor = hasError
        ? 'rgba(160,72,30,0.7)'
        : '';
      field.style.boxShadow = hasError
        ? '0 0 0 3px rgba(160,72,30,0.12)'
        : '';
    }

    // Effacer erreur quand l'utilisateur corrige
    $$('[required]', form).forEach(field => {
      field.addEventListener('input', () => setFieldError(field, false));
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const required = $$('[required]', form);
      let allValid = true;

      required.forEach(field => {
        const empty = !field.value.trim();
        const emailInvalid = field.type === 'email' && field.value && !field.value.includes('@');
        const invalid = empty || emailInvalid;
        setFieldError(field, invalid);
        if (invalid) allValid = false;
      });

      if (!allValid) {
        submitBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Veuillez compléter les champs requis';
        setTimeout(() => { submitBtn.innerHTML = origLabel; }, 2800);
        // Focus sur le premier champ en erreur
        const first = required.find(f => !f.value.trim());
        first?.focus();
        return;
      }

      // Simuler envoi
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours…';

      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Message envoyé !';
        submitBtn.style.background = 'var(--grad-sage)';
        form.reset();

        setTimeout(() => {
          submitBtn.innerHTML = origLabel;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 4000);
      }, 1800);
    });
  }


  /* ----------------------------------------------------------
     8. ANIMATION COMPTEURS (stats)
  ---------------------------------------------------------- */
  function animateCounter(el) {
    const raw    = el.textContent.trim();
    const hasPlus = raw.startsWith('+');
    const hasPct  = raw.endsWith('%');
    const hasSuffix = raw.match(/[a-zA-Z]+$/);
    const suffix = hasSuffix ? hasSuffix[0] : '';
    const num    = parseInt(raw.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) return;

    const duration = 1400;
    const start    = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current  = Math.round(eased * num);
      el.textContent = (hasPlus ? '+' : '') + current + (hasPct ? '%' : suffix);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Déclencher quand les stats entrent dans le viewport
  const statValues = $$('.stat__value');
  if (statValues.length && 'IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterIO.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    statValues.forEach(el => counterIO.observe(el));
  }

})();

(function () {
    const sections = document.querySelectorAll('.ml-section[id]');
    const navLinks = document.querySelectorAll('.ml-nav__item a');

    if (!sections.length || !navLinks.length) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
        if (!entry.isIntersecting) return;
            navLinks.forEach(l => l.classList.remove('active'));
            const active = document.querySelector(`.ml-nav__item a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
        });
    }, { threshold: 0.3, rootMargin: '-80px 0px -60% 0px' });

    sections.forEach(s => io.observe(s));
})();