/* ============================================================
   PAWFECT STUDIO — MAIN JAVASCRIPT
   script.js
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────
   1. DOM READY HELPER
───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNavbar();
  initHamburger();
  initScrollReveal();
  initServicesDrag();
  initGalleryTilt();
  initBeforeAfterSlider();
  initBATabSwitch();
  initContactForm();
  initNewsletterForm();
  initParallaxBlobs();
  initSmoothScrollLinks();
});

/* ─────────────────────────────────────────────────
   2. SCROLL PROGRESS BAR
───────────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
  }, { passive: true });
}

/* ─────────────────────────────────────────────────
   3. NAVBAR — Scroll state
───────────────────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const threshold = 60;

  window.addEventListener('scroll', () => {
    if (window.scrollY > threshold) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────────────
   4. HAMBURGER / MOBILE MENU
───────────────────────────────────────────────── */
function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      btn.classList.remove('open');
    }
  });
}

/* ─────────────────────────────────────────────────
   5. SCROLL REVEAL — IntersectionObserver
───────────────────────────────────────────────── */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after animation to free resources
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  targets.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────────
   6. SERVICES STRIP — Drag to scroll
───────────────────────────────────────────────── */
function initServicesDrag() {
  const track = document.getElementById('servicesTrack');
  const outer = track ? track.parentElement : null;
  if (!outer) return;

  let isDown   = false;
  let startX   = 0;
  let scrollLeft = 0;

  outer.addEventListener('mousedown', (e) => {
    isDown = true;
    outer.classList.add('dragging');
    startX    = e.pageX - outer.offsetLeft;
    scrollLeft = outer.scrollLeft;
    e.preventDefault();
  });

  outer.addEventListener('mouseleave', () => {
    isDown = false;
    outer.classList.remove('dragging');
  });

  outer.addEventListener('mouseup', () => {
    isDown = false;
    outer.classList.remove('dragging');
  });

  outer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - outer.offsetLeft;
    const walk = (x - startX) * 1.4;
    outer.scrollLeft = scrollLeft - walk;
  });

  // Touch support
  let touchStartX    = 0;
  let touchScrollLeft = 0;

  outer.addEventListener('touchstart', (e) => {
    touchStartX     = e.touches[0].pageX;
    touchScrollLeft = outer.scrollLeft;
  }, { passive: true });

  outer.addEventListener('touchmove', (e) => {
    const x    = e.touches[0].pageX;
    const walk = (touchStartX - x) * 1.2;
    outer.scrollLeft = touchScrollLeft + walk;
  }, { passive: true });
}

/* ─────────────────────────────────────────────────
   7. GALLERY — 3D tilt on mousemove
───────────────────────────────────────────────── */
function initGalleryTilt() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect   = item.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotateY = ((x - cx) / cx) * 8;
      const rotateX = ((cy - y) / cy) * 8;
      item.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
}

/* ─────────────────────────────────────────────────
   8. BEFORE / AFTER SLIDER
───────────────────────────────────────────────── */
function initBeforeAfterSlider() {
  const container = document.getElementById('baContainer');
  const before    = document.getElementById('baBefore');
  const handle    = document.getElementById('baHandle');
  if (!container || !before || !handle) return;

  let isDragging = false;
  let position   = 50; // percent

  function updatePosition(pct) {
    position = Math.max(2, Math.min(98, pct));
    const pxLeft = `${position}%`;
    before.style.clipPath  = `inset(0 ${100 - position}% 0 0)`;
    handle.style.left      = pxLeft;
  }

  // Init
  updatePosition(50);

  function getPercentFromEvent(e) {
    const rect  = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x     = clientX - rect.left;
    return (x / rect.width) * 100;
  }

  // Mouse
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    updatePosition(getPercentFromEvent(e));
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updatePosition(getPercentFromEvent(e));
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  // Touch
  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    updatePosition(getPercentFromEvent(e));
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    updatePosition(getPercentFromEvent(e));
  }, { passive: true });

  window.addEventListener('touchend', () => { isDragging = false; });
}

/* ─────────────────────────────────────────────────
   9. BEFORE / AFTER TAB SWITCH (Dog / Cat)
───────────────────────────────────────────────── */
function initBATabSwitch() {
  const tabs = document.querySelectorAll('.ba-tab');
  if (!tabs.length) return;

  const images = {
    dog: {
      before: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=900&q=80',
      after:  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&q=80'
    },
    cat: {
      before: 'https://images.unsplash.com/photo-1518155317743-a8ff43ea6a5f?w=900&q=80',
      after:  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=900&q=80'
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const key = tab.dataset.tab;
      const beforeImg = document.getElementById('baBeforeImg');
      const afterImg  = document.getElementById('baAfterImg');
      const container = document.getElementById('baContainer');
      const baBefore  = document.getElementById('baBefore');
      const handle    = document.getElementById('baHandle');

      if (!beforeImg || !afterImg) return;

      // Fade transition
      container.style.opacity = '0.5';
      container.style.transition = 'opacity 0.25s ease';

      setTimeout(() => {
        beforeImg.src = images[key].before;
        afterImg.src  = images[key].after;

        // Reset slider to center
        baBefore.style.clipPath = 'inset(0 50% 0 0)';
        handle.style.left = '50%';

        container.style.opacity = '1';
      }, 250);
    });
  });
}

/* ─────────────────────────────────────────────────
   10. CONTACT FORM
───────────────────────────────────────────────── */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const submit  = document.getElementById('formSubmit');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const fname  = form.fname.value.trim();
    const femail = form.femail.value.trim();

    if (!fname || !femail) {
      shakeElement(submit);
      return;
    }

    if (!isValidEmail(femail)) {
      shakeElement(form.femail);
      return;
    }

    // Simulate async submission
    const textEl    = submit.querySelector('.submit-text');
    const loadingEl = submit.querySelector('.submit-loading');

    submit.disabled = true;
    textEl.style.display    = 'none';
    loadingEl.style.display = 'inline';

    setTimeout(() => {
      submit.disabled = false;
      textEl.style.display    = 'inline';
      loadingEl.style.display = 'none';

      if (success) {
        success.style.display = 'block';
        success.style.animation = 'fadeSlideUp 0.4s ease';
      }

      form.reset();

      // Hide success after 5s
      setTimeout(() => {
        if (success) success.style.display = 'none';
      }, 5000);

    }, 1800);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function shakeElement(el) {
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => { el.style.animation = ''; }, 400);
}

/* ─────────────────────────────────────────────────
   11. NEWSLETTER FORM
───────────────────────────────────────────────── */
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const btn   = form.querySelector('button');
    if (!input || !input.value.trim()) return;

    const orig = btn.textContent;
    btn.textContent = '✓';
    btn.style.background = '#4caf88';

    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      input.value = '';
    }, 2500);
  });
}

/* ─────────────────────────────────────────────────
   12. PARALLAX BLOBS on scroll
───────────────────────────────────────────────── */
function initParallaxBlobs() {
  const blobs = document.querySelectorAll('.blob');
  if (!blobs.length) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    blobs.forEach((blob, i) => {
      const speed = (i + 1) * 0.12;
      const dir   = i % 2 === 0 ? 1 : -1;
      blob.style.transform = `translateY(${scrollY * speed * dir}px)`;
    });
  }, { passive: true });
}

/* ─────────────────────────────────────────────────
   13. SMOOTH SCROLL — nav & CTA links
───────────────────────────────────────────────── */
function initSmoothScrollLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
      const targetY   = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    });
  });
}

/* ─────────────────────────────────────────────────
   14. CSS KEYFRAME INJECTION (shake, fadeSlideUp)
   These are used by JS-triggered animations
───────────────────────────────────────────────── */
(function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();
