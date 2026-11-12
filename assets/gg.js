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

    // Footer language selector (only rendered when 2+ languages are published)
    document.querySelectorAll('[data-gg-lang-select]').forEach(function (select) {
      select.addEventListener('change', function () {
        var current = select.options[select.selectedIndex];
        if (current) select.setAttribute('title', current.title || current.textContent);
        var form = select.closest('form');
        if (form) form.submit();
      });
    });

    // Footer newsletter: show the subscribe result (success / error) after the
    // customer form posts back and reloads the page.
    const ggFooterForm = document.querySelector('.gg-footer__form');
    if (ggFooterForm) {
      const ggFooterMessage = ggFooterForm.querySelector('.gg-footer__form-message');
      if (ggFooterMessage) {
        ggFooterMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (ggFooterMessage.classList.contains('gg-footer__form-message--error')) {
          const ggInvalid = ggFooterForm.querySelector('[aria-invalid="true"]');
          if (ggInvalid) ggInvalid.focus();
        }
      }
    }

    // "Select Your Team" collection dropdown
    document.querySelectorAll('.gg-team-select').forEach(function (select) {
      const trigger = select.querySelector('.gg-team-select__trigger');
      const panel = select.querySelector('.gg-team-select__panel');
      if (!trigger || !panel) return;

      // Open upward when there is not enough room below the trigger so the
      // list is never clipped off-screen on short viewports.
      const position = function () {
        select.classList.remove('gg-team-select--up');
        if (!select.classList.contains('is-open')) return;
        const room = window.innerHeight - trigger.getBoundingClientRect().bottom;
        if (room < panel.offsetHeight + 24) select.classList.add('gg-team-select--up');
      };

      const setOpen = function (open) {
        select.classList.toggle('is-open', open);
        panel.hidden = !open;
        trigger.setAttribute('aria-expanded', String(open));
        position();
      };

      const closeAll = function (except) {
        document.querySelectorAll('.gg-team-select').forEach(function (other) {
          if (other === except) return;
          const p = other.querySelector('.gg-team-select__panel');
          const t = other.querySelector('.gg-team-select__trigger');
          other.classList.remove('is-open', 'gg-team-select--up');
          if (p) p.hidden = true;
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      };

      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        closeAll(select);
        setOpen(panel.hidden === true);
      });

      document.addEventListener('click', function (e) {
        if (!select.contains(e.target)) setOpen(false);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (!select.classList.contains('is-open')) return;
        setOpen(false);
        trigger.focus();
      });

      window.addEventListener('resize', function () {
        if (select.classList.contains('is-open')) position();
      });
    });

    // FAQ accordion — keep one item open at a time
    document.querySelectorAll('.gg-faq__list').forEach(function (list) {
      const items = list.querySelectorAll('.gg-faq__item');
      items.forEach(function (item) {
        item.addEventListener('toggle', function () {
          if (!item.open) return;
          items.forEach(function (other) {
            if (other !== item) other.open = false;
          });
        });
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
        if (w < 560) return 3;
        if (w < 900) return 4;
        if (w < 1500) return 5;
        return 6;
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
        // Dots are a progress indicator, so spread the teams evenly over them
        // instead of assuming one dot per team.
        const active = Math.floor((toReal(pos) * dots.length) / realCount);
        dots.forEach(function (dot, i) {
          dot.classList.toggle('gg-dot--on', i === active);
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
      applySizes();
      window.addEventListener('resize', onResize);
      update(false);
      syncDots();
    });

    // Shop by Team — in-page team filtering strictly by selected collection
    document.querySelectorAll('.gg-shopteam').forEach(function (section) {
      const logos = section.querySelectorAll('.gg-team-logos__item[data-gg-team-filter]');
      const grid = section.querySelector('[data-gg-load-grid]');
      const showAll = section.querySelector('[data-gg-team-showall]');
      const cards = grid ? grid.querySelectorAll('.gg-card') : [];
      let activeFilter = null;

      const cardCollections = new Map();
      cards.forEach(function (c) {
        const rawTags = (c.getAttribute('data-gg-team-tags') || '').trim().toLowerCase();
        const tokens = rawTags ? rawTags.split(/\s+/).filter(Boolean) : [];
        cardCollections.set(c, tokens);
      });

      const applyFilter = function (filterKey) {
        const f = filterKey ? filterKey.toString().trim().toLowerCase() : '';
        activeFilter = f || null;
        let visibleCount = 0;

        cards.forEach(function (c) {
          const isMore = c.hasAttribute('data-gg-more');
          let shouldShow;

          if (f) {
            if (f.indexOf('__none__') === 0) {
              shouldShow = false;
            } else {
              const tokens = cardCollections.get(c) || [];
              shouldShow = tokens.indexOf(f) !== -1;
            }
          } else {
            shouldShow = !isMore || c.getAttribute('data-gg-more-shown') === '1';
          }

          if (shouldShow) {
            c.removeAttribute('hidden');
            visibleCount += 1;
          } else {
            c.setAttribute('hidden', '');
          }
        });

        logos.forEach(function (el) {
          const ef = (el.getAttribute('data-gg-team-filter') || '').trim().toLowerCase();
          el.classList.toggle('is-active', Boolean(f && ef === f));
          el.setAttribute('aria-pressed', f && ef === f ? 'true' : 'false');
        });
        if (showAll) {
          showAll.classList.toggle('is-active', !f);
        }

        const empty = section.querySelector('[data-gg-empty]');
        if (empty) empty.hidden = !(f && visibleCount === 0);

        const moreBtn = section.querySelector('[data-gg-load-more]');
        if (moreBtn) moreBtn.hidden = Boolean(f);
      };

      logos.forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          const f = (el.getAttribute('data-gg-team-filter') || '').trim().toLowerCase();
          if (activeFilter && f === activeFilter) {
            applyFilter(null);
          } else {
            applyFilter(f);
          }
        });
      });
      if (showAll) {
        showAll.addEventListener('click', function (e) {
          e.preventDefault();
          applyFilter(null);
        });
      }
    });

    // Shop by Team grid — "Load More ..." reveals the hidden cards on this page,
    // and once nothing is left the button is swapped for the Amazon CTA.
    document.querySelectorAll('[data-gg-load-more]').forEach(function (btn) {
      const section = btn.closest('.gg-shopteam');
      const grid = section ? section.querySelector('[data-gg-load-grid]') : null;
      if (!grid) return;
      const batch = parseInt(btn.getAttribute('data-gg-batch'), 10) || 4;

      const showDoneCta = function () {
        const href = btn.getAttribute('data-gg-done-href') || '';
        const label = btn.getAttribute('data-gg-done-label') || '';
        if (!href || !label) {
          btn.remove();
          return;
        }
        const link = document.createElement('a');
        link.className = btn.className;
        link.href = href;
        link.textContent = label;
        if (/amazon\./i.test(href)) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
        btn.replaceWith(link);
      };

      if (!grid.querySelector('[data-gg-more][hidden]')) {
        showDoneCta();
        return;
      }

      btn.addEventListener('click', function () {
        const hidden = grid.querySelectorAll('[data-gg-more][hidden]');
        for (let i = 0; i < hidden.length && i < batch; i++) {
          hidden[i].removeAttribute('hidden');
          hidden[i].setAttribute('data-gg-more-shown', '1');
        }
        if (!grid.querySelector('[data-gg-more][hidden]')) showDoneCta();
      });
    });

    // Social marquee — the −50% loop needs a track at least twice the
    // viewport wide, so repeat each row's set until that holds. Also hides
    // rows that have no images so they don't leave a stray grid gap.
    const ggStripBlockAttrs = function (el) {
      const els = [el].concat(Array.prototype.slice.call(el.querySelectorAll('*')));
      els.forEach(function (node) {
        Array.prototype.slice.call(node.attributes).forEach(function (attr) {
          if (attr.name.indexOf('data-block') === 0) node.removeAttribute(attr.name);
        });
      });
    };

    const ggFillMarqueeTrack = function (track) {
      let nodes = Array.prototype.slice.call(track.children);
      if (!nodes.length) return;

      // Collapse back to a single group (half of the children) so the
      // fill below stays idempotent on resize / repeated calls.
      if (nodes.length % 2 === 0) {
        const half = nodes.length / 2;
        for (let i = nodes.length - 1; i >= half; i--) {
          track.removeChild(nodes[i]);
        }
        nodes = Array.prototype.slice.call(track.children);
      }

      const setWidth = track.scrollWidth;
      if (!setWidth) return;

      let copies = Math.max(2, Math.ceil((window.innerWidth * 2) / setWidth));
      if (copies % 2) copies += 1;

      track.textContent = '';
      for (let i = 0; i < copies; i++) {
        nodes.forEach(function (node) {
          const clone = node.cloneNode(true);
          if (i > 0) ggStripBlockAttrs(clone);
          track.appendChild(clone);
        });
      }
    };

    const initGgMarquee = function (scope) {
      (scope || document).querySelectorAll('.gg-social__row').forEach(function (row) {
        const track = row.querySelector('[data-gg-track]');
        if (track && track.children.length) ggFillMarqueeTrack(track);
        row.classList.toggle('is-hidden', !track || !track.children.length);
      });
    };

    // Social section — Instagram feed. The server renders the image blocks
    // as a fallback; once the feed arrives they are replaced.
    const initGgInstagramFeed = function (scope) {
      (scope || document).querySelectorAll('[data-gg-instagram]').forEach(function (grid) {
        if (grid.getAttribute('data-gg-insta-ready') === '1') return;

        const token = grid.getAttribute('data-gg-instagram');
        const count = parseInt(grid.getAttribute('data-gg-instagram-count'), 10) || 8;
        const fallbackLink = grid.getAttribute('data-gg-instagram-link') || '#';
        const tracks = grid.querySelectorAll('[data-gg-track]');
        if (!token || tracks.length < 2) return;
        grid.setAttribute('data-gg-insta-ready', '1');

        const escapeHtml = function (value) {
          return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
          });
        };

        fetch('https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink&limit=' + count, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then(function (res) {
            if (!res.ok) throw new Error('Instagram request failed');
            return res.json();
          })
          .then(function (data) {
            const posts = (data && data.data ? data.data : [])
              .filter(function (post) {
                return post && post.media_url;
              })
              .slice(0, count);
            if (!posts.length) throw new Error('No Instagram posts');

            const half = Math.ceil(posts.length / 2);
            const rows = [posts.slice(0, half), posts.slice(half)];

            tracks.forEach(function (track, i) {
              const row = rows[i].length ? rows[i] : posts;
              const html = row
                .map(function (post) {
                  const alt = String(post.caption || 'Instagram post')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 120);
                  const href = post.permalink || fallbackLink;
                  return (
                    '<a href="' +
                    escapeHtml(href) +
                    '" aria-label="' +
                    escapeHtml(alt) +
                    '" target="_blank" rel="noopener noreferrer"><img src="' +
                    escapeHtml(post.media_url) +
                    '" alt="' +
                    escapeHtml(alt) +
                    '" loading="lazy" width="440" height="440"></a>'
                  );
                })
                .join('');
              track.innerHTML = html + html;
            });

            grid.classList.add('is-gg-insta');
            initGgMarquee(grid);
          })
          .catch(function () {
            // Keep the server-rendered image blocks visible.
            initGgMarquee(grid);
          });
      });
    };

    initGgMarquee(document);
    initGgInstagramFeed(document);
    document.addEventListener('shopify:section:load', function (event) {
      initGgMarquee(event.target);
      initGgInstagramFeed(event.target);
    });

    let ggMarqueeResizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(ggMarqueeResizeTimer);
      ggMarqueeResizeTimer = window.setTimeout(function () {
        initGgMarquee(document);
      }, 150);
    });
  });
})();