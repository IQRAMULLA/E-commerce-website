/* ============================================================
   MAISON COVE — main.js
   Header scroll, mega menu accessibility, cart, toast,
   wishlist, newsletter, mobile nav, scroll reveals
   ============================================================ */

'use strict';

/* ── Utility ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. STICKY HEADER — add .scrolled class on scroll
   ============================================================ */
const header = $('#site-header');
const SCROLL_THRESHOLD = 30;

function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

/* ============================================================
   2. MEGA MENU — keyboard + ARIA accessibility
   ============================================================ */
$$('.nav-item.has-mega-menu').forEach(item => {
  const link = $('a.nav-link', item);
  const menu = $('.mega-menu', item);
  if (!menu) return;

  link.setAttribute('aria-haspopup', 'true');
  link.setAttribute('aria-expanded', 'false');

  function open() {
    link.setAttribute('aria-expanded', 'true');
    item.classList.add('active');
  }
  function close() {
    link.setAttribute('aria-expanded', 'false');
    item.classList.remove('active');
  }

  // Mouse
  item.addEventListener('mouseenter', open);
  item.addEventListener('mouseleave', close);

  // Keyboard — Enter/Space to toggle
  link.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const isOpen = link.getAttribute('aria-expanded') === 'true';
      isOpen ? close() : open();
    }
    if (e.key === 'Escape') close();
  });

  // Close on Escape anywhere inside
  menu.addEventListener('keydown', e => {
    if (e.key === 'Escape') { close(); link.focus(); }
  });

  // Close when focus leaves the item
  item.addEventListener('focusout', e => {
    if (!item.contains(e.relatedTarget)) close();
  });
});

/* ============================================================
   3. MOBILE NAV TOGGLE
   ============================================================ */
const hamburger = $('#hamburger');
const overlay   = $('#mobile-overlay');

function closeMobileNav() {
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}
function openMobileNav() {
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

hamburger?.addEventListener('click', () => {
  const isOpen = hamburger.classList.contains('open');
  isOpen ? closeMobileNav() : openMobileNav();
});
overlay?.addEventListener('click', closeMobileNav);

/* ============================================================
   4. TOAST NOTIFICATION
   ============================================================ */
const toast = $('#toast');
let toastTimer;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ============================================================
   5. ADD TO BAG
   ============================================================ */
let cartCount = 3;
const cartCountEl = $('.cart-count');

$$('.add-to-bag').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.product || 'Item';
    cartCount++;
    cartCountEl.textContent = cartCount;

    // Animate cart icon
    cartCountEl.parentElement.classList.add('bounce');
    setTimeout(() => cartCountEl.parentElement.classList.remove('bounce'), 400);

    showToast(`${name} added to your bag`);
  });
});

/* Cart icon bounce keyframe (injected once) */
const bounceStyle = document.createElement('style');
bounceStyle.textContent = `
  @keyframes cartBounce {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.25); }
    70%  { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
  .cart-btn.bounce { animation: cartBounce 0.4s ease; }
`;
document.head.appendChild(bounceStyle);

/* ============================================================
   6. WISHLIST TOGGLE
   ============================================================ */
$$('.wishlist-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const isActive = btn.classList.toggle('active');
    const card = btn.closest('.product-card');
    const name = card ? ($('.product-name', card)?.textContent ?? 'Item') : 'Item';
    showToast(isActive ? `${name} saved to wishlist` : `${name} removed from wishlist`);

    // Swap icon fill to show loved state
    const svg = btn.querySelector('path');
    if (svg) svg.style.fill = isActive ? 'currentColor' : 'none';
  });
});

/* ============================================================
   7. NEWSLETTER FORM
   ============================================================ */
const newsletterForm    = $('#newsletter-form');
const newsletterSuccess = $('#newsletter-success');
const newsletterEmail   = $('#newsletter-email');

newsletterForm?.addEventListener('submit', e => {
  e.preventDefault();
  const email = newsletterEmail.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newsletterEmail.focus();
    newsletterEmail.style.borderColor = '#E8604C';
    setTimeout(() => (newsletterEmail.style.borderColor = ''), 1800);
    return;
  }
  // Simulate submission
  newsletterSuccess.hidden = false;
  newsletterForm.querySelector('.newsletter-input-group').style.opacity = '0.4';
  newsletterForm.querySelector('.newsletter-input-group').style.pointerEvents = 'none';
  showToast('Welcome to the Maison Cove edit!');
});

/* ============================================================
   8. SCROLL REVEAL — fade-up cards on viewport entry
   ============================================================ */
const revealItems = [
  '.category-card',
  '.product-card',
  '.seo-inner',
  '.promo-inner',
];

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

// Inject reveal CSS once
const revealStyle = document.createElement('style');
revealStyle.textContent = `
  .category-card,
  .product-card {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.55s ease, transform 0.55s ease;
  }
  .category-card.revealed,
  .product-card.revealed {
    opacity: 1;
    transform: translateY(0);
  }
  /* Stagger siblings */
  .category-card:nth-child(2), .product-card:nth-child(2) { transition-delay: 0.1s; }
  .category-card:nth-child(3), .product-card:nth-child(3) { transition-delay: 0.2s; }
  .category-card:nth-child(4), .product-card:nth-child(4) { transition-delay: 0.3s; }

  @media (prefers-reduced-motion: reduce) {
    .category-card, .product-card {
      opacity: 1; transform: none; transition: none;
    }
  }
`;
document.head.appendChild(revealStyle);

revealItems.forEach(selector => {
  $$(selector).forEach(el => revealObserver.observe(el));
});

/* ============================================================
   9. HERO SMOOTH SCROLL CTA
   ============================================================ */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'));
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   10. QUICK VIEW (placeholder — wire up your modal here)
   ============================================================ */
$$('.quickview-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.product-card');
    const name = card ? ($('.product-name', card)?.textContent ?? 'Product') : 'Product';
    showToast(`Quick view: ${name} — coming soon`);
  });
});

/* ============================================================
   11. LOG LOAD
   ============================================================ */
console.log('%cMaison Cove — Ready', 'color:#E8604C;font-weight:bold;font-size:14px;');
