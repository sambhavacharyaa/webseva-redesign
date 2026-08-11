(function () {
  'use strict';

  var doc = document;

  /* ---------------- Promo banner dismiss ---------------- */
  var promoBanner = doc.getElementById('promoBanner');
  var promoBannerClose = doc.getElementById('promoBannerClose');
  var PROMO_KEY = 'webseva_promo_dismissed';
  if (promoBanner) {
    try {
      if (sessionStorage.getItem(PROMO_KEY) === '1') {
        promoBanner.classList.add('is-hidden');
      }
    } catch (e) { /* storage unavailable — banner just stays visible */ }
    if (promoBannerClose) {
      promoBannerClose.addEventListener('click', function () {
        promoBanner.classList.add('is-hidden');
        try { sessionStorage.setItem(PROMO_KEY, '1'); } catch (e) { /* ignore */ }
      });
    }
  }

  /* ---------------- Header scroll state ---------------- */
  var header = doc.getElementById('siteHeader');
  var lastTicking = false;
  function updateHeader() {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
    lastTicking = false;
  }
  window.addEventListener('scroll', function () {
    if (!lastTicking) {
      window.requestAnimationFrame(updateHeader);
      lastTicking = true;
    }
  }, { passive: true });
  updateHeader();

  /* ---------------- Mobile drawer ---------------- */
  var navToggle = doc.getElementById('navToggle');
  var navClose = doc.getElementById('navClose');
  var drawer = doc.getElementById('mobileDrawer');
  var backdrop = doc.getElementById('drawerBackdrop');

  function openDrawer() {
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    doc.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    doc.body.style.overflow = '';
  }
  if (navToggle) navToggle.addEventListener('click', openDrawer);
  if (navClose) navClose.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeDrawer);
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ---------------- Dropdown (tap support on touch) ---------------- */
  var dropdownToggle = doc.querySelector('.dropdown-toggle');
  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', function () {
      var parent = dropdownToggle.closest('.has-dropdown');
      var isOpen = parent.classList.toggle('is-open');
      dropdownToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      var menu = parent.querySelector('.dropdown-menu');
      if (isOpen) {
        menu.style.opacity = '1';
        menu.style.visibility = 'visible';
        menu.style.transform = 'translateY(0)';
      } else {
        menu.style.opacity = '';
        menu.style.visibility = '';
        menu.style.transform = '';
      }
    });
  }

  /* ---------------- Pricing: product switch + billing switch ---------------- */
  // Real plan data fetched from webseva.com's live cPanel and DirectAdmin
  // reseller hosting pages.
  var PRICING_DATA = {
    cpanel: [
      { name: 'Reseller Starter', desc: 'Perfect for launching your first hosting brand.', monthly: 3.99,
        url: 'https://my.bisup.com/store/reseller-hosting/reseller-50',
        features: ['10 cPanel Accounts', '100 GB NVMe SSD', 'Unlimited Bandwidth'],
        resources: [['RAM', '2 GB'], ['vCPU', '2 Cores'], ['I/O', '1 GB/s'], ['Inodes', '250,000']] },
      { name: 'Reseller Business', desc: 'Most hosting entrepreneurs start here.', monthly: 11.99,
        url: 'https://my.bisup.com/store/reseller-hosting/reseller-500',
        features: ['25 cPanel Accounts', '500 GB NVMe SSD', 'Unlimited Bandwidth'],
        resources: [['RAM', '4 GB'], ['vCPU', '2 Cores'], ['I/O', '2 GB/s'], ['Inodes', '250,000']] },
      { name: 'Reseller Enterprise', desc: 'For growing hosting businesses with more clients.', monthly: 23.99,
        url: 'https://my.bisup.com/store/reseller-hosting/reseller-unlimited',
        features: ['50 cPanel Accounts', '500 GB NVMe SSD', 'Unlimited Bandwidth'],
        resources: [['RAM', '4 GB'], ['vCPU', '2 Cores'], ['I/O', '2 GB/s'], ['Inodes', '250,000']] },
      { name: 'Reseller TOP', desc: 'Maximum resources for serious scale.', monthly: 47.99,
        url: 'https://my.bisup.com/store/reseller-hosting/top',
        features: ['100 cPanel Accounts', '1000 GB NVMe SSD', 'Unlimited Bandwidth'],
        resources: [['RAM', '4 GB'], ['vCPU', '4 Cores'], ['I/O', '4 GB/s'], ['Inodes', '250,000']] }
    ],
    directadmin: [
      { name: 'DA Starter', desc: 'Perfect for testing the waters with your first hosting brand.', monthly: 2.04,
        url: 'https://my.bisup.com/store/directadmin-reseller/directadmin-reseller-starter',
        features: ['50 DirectAdmin Accounts', '100 GB NVMe SSD', 'Unlimited Bandwidth'],
        resources: [['RAM', '4 GB'], ['vCPU', '2 Cores'], ['I/O', '1 GB/s'], ['Backups', 'Weekly']] },
      { name: 'DA Professional', desc: 'Most resellers start here — room to grow from day one.', monthly: 11.31,
        url: 'https://my.bisup.com/store/directadmin-reseller/directadmin-reseller-professional',
        features: ['100 DirectAdmin Accounts', '500 GB NVMe SSD', 'Unlimited Bandwidth'],
        resources: [['RAM', '4 GB'], ['vCPU', '2 Cores'], ['I/O', '2 GB/s'], ['Backups', 'Daily']] },
      { name: 'DA Ultimate', desc: 'For established resellers managing a growing client base.', monthly: 26.66,
        url: 'https://my.bisup.com/store/directadmin-reseller/directadmin-reseller-ultimate',
        features: ['200 DirectAdmin Accounts', '500 GB NVMe SSD', 'Unlimited Bandwidth'],
        resources: [['RAM', '4 GB'], ['vCPU', '2 Cores'], ['I/O', '2 GB/s'], ['Backups', 'Daily']] },
      { name: 'DA TOP', desc: 'Maximum headroom for high-volume hosting businesses.', monthly: 44.44,
        url: 'https://my.bisup.com/store/directadmin-reseller/directadmin-reseller-top',
        features: ['Unlimited DirectAdmin Accounts', '100 GB SSD Storage', 'Unlimited Bandwidth'],
        resources: [['RAM', '4 GB'], ['vCPU', '2 Cores'], ['CDN', 'Free'], ['DDoS Protection', 'Included']] }
    ]
  };

  var billingSwitch = doc.getElementById('billingSwitch');
  var billingLabels = doc.querySelectorAll('[data-billing-label]');
  var pricingGrid = doc.getElementById('pricingGrid');
  var productButtons = doc.querySelectorAll('.product-switch-btn');
  var YEARLY_DISCOUNT = 0.2;

  function formatCurrency(n) {
    return n.toFixed(2);
  }

  if (pricingGrid && productButtons.length) {
    var priceCards = pricingGrid.querySelectorAll('.price-card');
    var currentProduct = 'cpanel';
    var isYearly = false;

    var renderPricing = function () {
      var plans = PRICING_DATA[currentProduct];
      priceCards.forEach(function (card, i) {
        var plan = plans[i];
        if (!plan) return;
        card.querySelector('.price-name').textContent = plan.name;
        card.querySelector('.price-desc').textContent = plan.desc;
        var numberEl = card.querySelector('.price-number');
        numberEl.setAttribute('data-monthly', plan.monthly);
        var value = isYearly ? plan.monthly * (1 - YEARLY_DISCOUNT) : plan.monthly;
        numberEl.textContent = formatCurrency(value);
        var noteEl = card.querySelector('[data-note]');
        if (noteEl) {
          noteEl.textContent = isYearly
            ? 'Billed yearly · save ' + Math.round(YEARLY_DISCOUNT * 100) + '%'
            : 'Billed monthly';
        }
        card.querySelector('.price-features').innerHTML = plan.features.map(function (f) {
          return '<li><svg width="16" height="16"><use href="#icon-check"/></svg>' + f + '</li>';
        }).join('');
        card.querySelector('.price-resources').innerHTML = plan.resources.map(function (r) {
          return '<div><span>' + r[0] + '</span><strong>' + r[1] + '</strong></div>';
        }).join('');
        var ctaEl = card.querySelector('.btn');
        if (ctaEl && plan.url) {
          ctaEl.setAttribute('href', plan.url);
          ctaEl.setAttribute('target', '_blank');
          ctaEl.setAttribute('rel', 'noopener noreferrer');
        }
      });
      billingLabels.forEach(function (el) {
        var isYearlyLabel = el.getAttribute('data-billing-label') === 'yearly';
        el.classList.toggle('is-active', isYearlyLabel === isYearly);
      });
      if (billingSwitch) billingSwitch.setAttribute('aria-checked', isYearly ? 'true' : 'false');
      productButtons.forEach(function (btn) {
        var isActive = btn.getAttribute('data-product') === currentProduct;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      var sourceEl = doc.getElementById('pricingSource');
      if (sourceEl) {
        var productLabel = currentProduct === 'cpanel' ? 'cPanel' : 'DirectAdmin';
        sourceEl.textContent = "Live pricing sourced from webseva.com's " + productLabel + ' reseller hosting plans.';
      }
    };

    productButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentProduct = btn.getAttribute('data-product');
        renderPricing();
      });
    });

    if (billingSwitch) {
      billingSwitch.addEventListener('click', function () {
        isYearly = billingSwitch.getAttribute('aria-checked') !== 'true';
        renderPricing();
      });
    }

    renderPricing();
  }

  /* ---------------- FAQ accordion ---------------- */
  doc.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      // Close all
      doc.querySelectorAll('.faq-item').forEach(function (other) {
        var otherBtn = other.querySelector('.faq-question');
        var otherAnswer = other.querySelector('.faq-answer');
        otherBtn.setAttribute('aria-expanded', 'false');
        otherAnswer.style.maxHeight = null;
        other.classList.remove('is-open');
      });
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ---------------- Scroll reveal ---------------- */
  doc.documentElement.classList.add('reveal-ready');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    doc.querySelectorAll('[data-reveal]').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    doc.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('in-view');
    });
  }

  /* ---------------- Close mobile drawer on resize to desktop ---------------- */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) closeDrawer();
  });
})();
