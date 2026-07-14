document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Navbar scroll state + progress bar ---------- */
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('progressBar');

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : '0%';

    backToTop.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksEl.classList.toggle('open');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinksEl.classList.remove('open');
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(section => sectionObserver.observe(section));

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-reveal]').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 0.08}s`;
    revealObserver.observe(el);
  });

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.stat-num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const tick = () => {
        current += step;
        if (current >= target) {
          el.textContent = target;
        } else {
          el.textContent = current;
          requestAnimationFrame(tick);
        }
      };
      tick();
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Typing effect for hero role ---------- */
  const roles = [
    'AI & ML Student',
    'AI Intern',
    'Full-Stack Developer',
    'Aspiring Entrepreneur'
  ];
  const typedEl = document.getElementById('typedRole');
  let roleIndex = 0, charIndex = 0, deleting = false;

  const typeLoop = () => {
    const current = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(typeLoop, 1400);
        return;
      }
    } else {
      charIndex--;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }
    setTimeout(typeLoop, deleting ? 45 : 90);
  };
  typeLoop();

  /* ---------- Theme toggle ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme');

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', theme);
  };

  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const submitBtn = document.getElementById('contactSubmit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      formNote.textContent = 'Please fill in all fields.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    formNote.textContent = '';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json();

      if (result.success) {
        formNote.textContent = "Thanks! Your message has been sent.";
        form.reset();
      } else {
        formNote.textContent = "Something went wrong. Please email me directly instead.";
      }
    } catch (err) {
      formNote.textContent = "Something went wrong. Please email me directly instead.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });

  /* ---------- Certificate images: fallback + lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('.cert-item img').forEach(img => {
    img.addEventListener('error', () => {
      img.classList.add('broken');
      const placeholder = document.createElement('div');
      placeholder.className = 'cert-placeholder';
      placeholder.textContent = '📜';
      img.after(placeholder);
    }, { once: true });
  });

  document.querySelectorAll('.cert-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img.classList.contains('broken')) return;
      lightboxImg.src = item.dataset.cert;
      lightboxCaption.textContent = item.dataset.name;
      lightbox.classList.add('open');
    });
  });

  const closeLightbox = () => lightbox.classList.remove('open');
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  onScroll();
});
