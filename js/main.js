// ===== NAVIGATION & PAGE ROUTING =====
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('[data-page]');

function showPage(pageId) {
  pages.forEach(p => p.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));

  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  document.querySelectorAll(`[data-page="${pageId}"]`).forEach(l => l.classList.add('active'));
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile menu
  document.getElementById('mobile-nav').classList.remove('open');
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ===== MOBILE MENU =====
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');

mobileMenuBtn.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
  const isOpen = mobileNav.classList.contains('open');
  mobileMenuBtn.setAttribute('aria-expanded', isOpen);
  // Toggle icon
  mobileMenuBtn.querySelector('.icon-menu').style.display = isOpen ? 'none' : 'block';
  mobileMenuBtn.querySelector('.icon-close').style.display = isOpen ? 'block' : 'none';
});

// ===== GALLERY FILTER =====
// Filters are wired by `setupGalleryFilters()` which is called after gallery renders.

// ===== LIGHTBOX =====
const lightboxOverlay = document.getElementById('lightbox-overlay');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(src) {
  lightboxImg.src = src;
  lightboxOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    if (img) openLightbox(img.src);
  });
});

lightboxOverlay.addEventListener('click', e => {
  if (e.target === lightboxOverlay) closeLightbox();
});

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// ===== NOTICE FILTER =====
const noticeChips = document.querySelectorAll('.chip-btn');
const noticeCards = document.querySelectorAll('.notice-card');

noticeChips.forEach(chip => {
  chip.addEventListener('click', () => {
    noticeChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.filter;

    noticeCards.forEach(card => {
      if (filter === 'all' || card.dataset.type === filter) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ===== NOTICE SEARCH =====
const searchInput = document.getElementById('notice-search');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    noticeCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(query) ? 'block' : 'none';
    });
  });
}

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('[type="submit"]');
    btn.textContent = 'Message Sent!';
    btn.style.background = 'var(--secondary)';
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      contactForm.reset();
    }, 3000);
  });
}

// ===== ANIMATE ON SCROLL =====
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

function setupAnimations() {
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Initialize
showPage('home');
setupAnimations();
// Wire filters for any static content present before dynamic load
if (typeof setupGalleryFilters === 'function') setupGalleryFilters();
if (typeof setupNoticeFiltersAndSearch === 'function') setupNoticeFiltersAndSearch();

// ------------------------------
// Decap CMS - client data loader
// Loads JSON files in /data/*.json (managed by Decap CMS admin)
// ------------------------------

async function fetchJSON(path) {
  try {
    const res = await fetch(path, {cache: 'no-store'});
    if (!res.ok) throw new Error('Fetch error ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn('Could not load', path, err);
    return null;
  }
}

function createGalleryItem(item) {
  const div = document.createElement('div');
  div.className = 'gallery-item animate-on-scroll';
  div.dataset.category = item.category || 'all';

  const img = document.createElement('img');
  img.src = item.image || '';
  img.alt = item.title || item.caption || '';
  img.loading = 'lazy';

  const overlay = document.createElement('div');
  overlay.className = 'gallery-item-overlay';
  overlay.innerHTML = `<span>${item.title || item.caption || ''}</span>`;

  div.appendChild(img);
  div.appendChild(overlay);
  div.addEventListener('click', () => openLightbox(item.image));
  return div;
}

function renderGallery(items) {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach(it => {
    const node = createGalleryItem(it);
    grid.appendChild(node);
  });
  setupAnimations();
  setupGalleryFilters();
}

function setupGalleryFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('#gallery-grid .gallery-item').forEach(item => {
        item.style.display = (filter === 'all' || item.dataset.category === filter) ? 'block' : 'none';
      });
    };
  });
}

function renderNotices(items) {
  const list = document.getElementById('notices-list');
  if (!list) return;
  list.innerHTML = '';
  items.forEach(n => {
    const card = document.createElement('div');
    card.className = 'notice-card animate-on-scroll' + (n.type === 'urgent' ? ' urgent' : '');
    card.dataset.type = n.type || 'announcement';

    const header = document.createElement('div');
    header.className = 'notice-card-header';
    const tag = document.createElement('span');
    tag.className = 'notice-tag ' + (n.type || 'announcement');
    tag.textContent = (n.type || 'Announcement').charAt(0).toUpperCase() + (n.type || 'announcement').slice(1);
    const date = document.createElement('span');
    date.className = 'notice-date';
    date.textContent = n.date || '';
    header.appendChild(tag);
    header.appendChild(date);

    const h2 = document.createElement('h2');
    h2.textContent = n.title || '';
    const p = document.createElement('p');
    p.textContent = n.body || '';
    const a = document.createElement('a');
    a.className = 'notice-read-link';
    a.href = n.url || '#';
    a.innerHTML = `${n.cta || 'Read More'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;

    card.appendChild(header);
    card.appendChild(h2);
    card.appendChild(p);
    card.appendChild(a);
    list.appendChild(card);
  });
  setupAnimations();
  setupNoticeFiltersAndSearch();
}

function setupNoticeFiltersAndSearch() {
  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.onclick = () => {
      document.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      document.querySelectorAll('#notices-list .notice-card').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.type === filter) ? 'block' : 'none';
      });
    };
  });

  const searchInputDynamic = document.getElementById('notice-search');
  if (searchInputDynamic) {
    searchInputDynamic.oninput = () => {
      const query = searchInputDynamic.value.toLowerCase();
      document.querySelectorAll('#notices-list .notice-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
      });
    };
  }
}

function renderMembers(items) {
  const leadership = document.getElementById('team-leadership');
  const regional = document.getElementById('team-regional');
  if (leadership) leadership.innerHTML = '';
  if (regional) regional.innerHTML = '';

  items.forEach(m => {
    const card = document.createElement('div');
    card.className = 'value-card animate-on-scroll';
    card.style.textAlign = 'center';
    card.style.padding = '20px';

    const img = document.createElement('img');
    img.src = m.photo || '';
    img.alt = m.name || '';
    img.style.width = '80px';
    img.style.height = '80px';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';
    img.style.margin = '0 auto 16px';

    const h3 = document.createElement('h3');
    h3.style.fontSize = '18px';
    h3.style.marginBottom = '4px';
    h3.textContent = m.name || '';

    const role = document.createElement('p');
    role.style.fontSize = '13px';
    role.style.color = 'var(--secondary)';
    role.style.fontWeight = '600';
    role.style.marginBottom = '8px';
    role.textContent = m.role || '';

    const bio = document.createElement('p');
    bio.style.fontSize = '13px';
    bio.style.color = 'var(--on-surface-variant)';
    bio.textContent = m.bio || '';

    card.appendChild(img);
    card.appendChild(h3);
    card.appendChild(role);
    card.appendChild(bio);

    if ((m.type || '').toLowerCase() === 'leadership') {
      leadership && leadership.appendChild(card);
    } else {
      regional && regional.appendChild(card);
    }
  });
  setupAnimations();
}

async function loadGallery() {
  const data = await fetchJSON('/data/gallery.json');
  if (data && Array.isArray(data.items)) renderGallery(data.items);
}

async function loadNotices() {
  const data = await fetchJSON('/data/notifications.json');
  if (data && Array.isArray(data.items)) renderNotices(data.items);
}

async function loadMembers() {
  const data = await fetchJSON('/data/members.json');
  if (data && Array.isArray(data.items)) renderMembers(data.items);
}

async function loadData() {
  await Promise.all([loadGallery(), loadMembers(), loadNotices()]);
}

// Load CMS-managed data after initial page setup
loadData();
