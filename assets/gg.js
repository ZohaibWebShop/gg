(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // Scroll reveal
    const targets = document.querySelectorAll('.gg-reveal');
    if ('IntersectionObserver' in window && targets.length) {
      const io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('gg-reveal--in');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 },
      );
      targets.forEach(function (t) {
        return io.observe(t);
      });
    } else {
      targets.forEach(function (t) {
        t.classList.add('gg-reveal--in');
      });
    }

    // Sticky header: transparent on top, solid on scroll, hide on scroll
    // down / reveal on scroll up with smooth slide animation
    const siteHeader = document.querySelector('.gg-header');
    if (siteHeader) {
      let lastScrollY = window.scrollY;

      const onHeaderScroll = function () {
        const y = window.scrollY;

        siteHeader.classList.toggle('is-scrolled', y > 60);

        if (y <= 60) {
          siteHeader.classList.remove('is-hidden');
          lastScrollY = y;
          return;
        }

        const scrollingDown = y > lastScrollY;
        lastScrollY = y;

        if (scrollingDown) {
          siteHeader.classList.add('is-hidden');
        } else {
          siteHeader.classList.remove('is-hidden');
        }
      };

      window.addEventListener('scroll', onHeaderScroll, { passive: true });
      onHeaderScroll();
    }

    // Mobile menu drawer
    const burger = document.querySelector('.gg-header__burger');
    const mobileMenu = document.querySelector('.gg-header__menu');

    const closeMobileMenu = function () {
      document.body.classList.remove('gg-menu-open');
      if (burger) burger.setAttribute('aria-expanded', 'false');
    };

    const openMobileMenu = function () {
      document.body.classList.add('gg-menu-open');
      if (burger) burger.setAttribute('aria-expanded', 'true');
      if (siteHeader) siteHeader.classList.remove('is-hidden');
    };

    if (burger && mobileMenu) {
      burger.addEventListener('click', function () {
        const isOpen = document.body.classList.contains('gg-menu-open');
        if (isOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });

      document.querySelectorAll('[data-gg-menu-close]').forEach(function (el) {
        el.addEventListener('click', closeMobileMenu);
      });

      mobileMenu.querySelectorAll('.gg-header__menu-nav a').forEach(function (link) {
        link.addEventListener('click', closeMobileMenu);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('gg-menu-open')) {
          closeMobileMenu();
        }
      });
    }

    // Wishlist hearts
    document.querySelectorAll('.gg-card__heart').forEach(function (heart) {
      heart.addEventListener('click', function (e) {
        e.preventDefault();
        const filled = heart.getAttribute('data-filled') === 'true';
        heart.setAttribute('data-filled', String(!filled));
        heart.style.fill = filled ? 'none' : 'currentColor';
      });
    });

    // "Who Are You Repping?" team logo carousel (auto-play, infinite loop)
    document.querySelectorAll('.gg-team-logos').forEach(function (carousel) {
      const track = carousel.querySelector('.gg-team-logos__track');
      const arrows = carousel.querySelectorAll('.gg-team-logos__arrow');
      const section = carousel.closest('.gg-shopteam');
      const dots = section ? section.querySelectorAll('.gg-teams-meta__dots span') : [];
      if (!track || arrows.length < 2) return;

      const realItems = Array.prototype.slice.call(track.children);
      if (!realItems.length) return;
      const realCount = realItems.length;

      // Wrap the track in a viewport so it can be translated.
      // Without JS the track still scrolls natively as a fallback.
      let viewport = carousel.querySelector('.gg-team-logos__viewport');
      if (!viewport) {
        viewport = document.createElement('div');
        viewport.className = 'gg-team-logos__viewport';
        track.parentNode.insertBefore(viewport, track);
        viewport.appendChild(track);
      }

      // Rebuild the track as [copy][real][copy] so there is always at least a
      // full page of runway behind and ahead — no blank space near the ends.
      const copyGroup = function (nodes) {
        return nodes.map(function (node) {
          return node.cloneNode(true);
        });
      };

      const leadCopies = copyGroup(realItems);
      const trailCopies = copyGroup(realItems);
      leadCopies.forEach(function (node) {
        track.insertBefore(node, track.firstChild);
      });
      trailCopies.forEach(function (node) {
        track.appendChild(node);
      });
      const allItems = Array.prototype.slice.call(track.children); // 3 * realCount

      const gap = parseFloat(getComputedStyle(track).columnGap) || 34;
      let pos = realCount; // first real item of the middle (real) group
      let busy = false; // blocks re-entry while a wrap-around is settling

      const perView = function () {
        const w = viewport.clientWidth;
        if (w < 560) return 2;
        if (w < 900) return 3;
        if (w < 1500) return 4;
        return 5;
      };

      const itemWidth = function () {
        const pv = perView();
        return Math.max(0, (viewport.clientWidth - (pv - 1) * gap) / pv);
      };

      const applySizes = function () {
        const w = itemWidth();
        allItems.forEach(function (el) {
          el.style.width = w + 'px';
        });
      };

      const step = function () {
        return itemWidth() + gap;
      };

      const update = function (animate) {
        track.classList.toggle('is-animless', !animate);
        track.style.transform = 'translate3d(' + -1 * pos * step() + 'px, 0, 0)';
      };

      const animateTo = function (i) {
        pos = i;
        update(true);
      };

      const snapTo = function (i) {
        pos = i;
        update(false);
        busy = false;
      };

      const waitTransition = function (cb) {
        let fired = false;
        const done = function () {
          if (fired) return;
          fired = true;
          track.removeEventListener('transitionend', done);
          cb();
        };
        track.addEventListener('transitionend', done);
        window.setTimeout(done, 650); // safety net if transitionend never fires
      };

      const toReal = function (index) {
        return ((index - realCount) % realCount + realCount) % realCount;
      };

      const lastReal = 2 * realCount - 1; // last real item of the middle group

      const next = function () {
        if (busy) return;
        if (pos === lastReal) {
          busy = true;
          animateTo(pos + 1); // slide onto the trailing copy of the first item
          waitTransition(function () {
            snapTo(realCount);
          });
          return;
        }
        animateTo(pos + 1);
      };

      const prev = function () {
        if (busy) return;
        if (pos === realCount) {
          busy = true;
          animateTo(pos - 1); // slide onto the leading copy of the last item
          waitTransition(function () {
            snapTo(lastReal);
          });
          return;
        }
        animateTo(pos - 1);
      };

      const syncDots = function () {
        dots.forEach(function (dot, i) {
          dot.classList.toggle('gg-dot--on', i === toReal(pos));
        });
      };

      arrows.forEach(function (arrow, i) {
        arrow.addEventListener('click', function (e) {
          e.preventDefault();
          if (i === 0) prev();
          else next();
          syncDots();
        });
      });

      // Auto-play (3.2s), paused while hovering / touching
      let paused = false;
      window.setInterval(function () {
        if (paused || document.hidden) return;
        next();
        syncDots();
      }, 3200);

      carousel.addEventListener('mouseenter', function () {
        paused = true;
      });
      carousel.addEventListener('mouseleave', function () {
        paused = false;
      });
      carousel.addEventListener('touchstart', function () {
        paused = true;
      }, { passive: true });
      carousel.addEventListener('touchend', function () {
        paused = false;
      });

      const onResize = function () {
        applySizes();
        busy = false;
        snapTo(pos);
      };

      applySizes();
      window.addEventListener('resize', onResize);
      update(false);
      syncDots();
    });
  });
})();