/* ============================================================
   Shantanu Kashyap, portfolio motion layer
   No dependencies. ~4KB. Everything is transform/opacity only so it
   stays on the compositor; nothing here can cause layout thrash.

   Rule followed throughout: motion is either a REVEAL (content arriving)
   or a RESPONSE (to the user's own input). Nothing loops, nothing
   autoplays past first paint, nothing delays reading.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ----------------------------------------------------------
     -1. Always land at the top on a fresh navigation. No link in this
         site points at a mid-page anchor on load (checked), so a page
         opening scrolled down is the browser's own scroll-restoration
         guessing wrong, especially with cross-document view transitions
         enabled. Turning restoration off and forcing (0,0) makes this
         page's start state deterministic regardless of browser quirk.
  ---------------------------------------------------------- */
  if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
  window.scrollTo(0, 0);

  /* ----------------------------------------------------------
     0. Load state: unlocks the hero line reveal and figure draw.
     rAF so first paint happens with the "before" state applied.
  ---------------------------------------------------------- */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.add('is-loaded'); });
  });

  /* ----------------------------------------------------------
     1. SVG path draw-on. Measure each path so the dash animation
        is proportional to its real length (uniform speed, not
        uniform duration). Skipped entirely under reduced-motion.
  ---------------------------------------------------------- */
  if (!reduce) {
    document.querySelectorAll('.fig-draw').forEach(function (p) {
      try {
        var len = Math.ceil(p.getTotalLength());
        p.style.setProperty('--len', len);
      } catch (e) { /* non-path element, ignore */ }
    });
  }

  /* ----------------------------------------------------------
     2. Reveal on scroll. One shared observer. Elements unobserve
        after firing so nothing re-animates on scroll-back.
  ---------------------------------------------------------- */
  var revealables = document.querySelectorAll('[data-reveal], .mk:not(.mk--load)');

  if (reduce || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------
     3. Count-up on the outcome numbers.
        Reads data-to / data-prefix / data-suffix. Uses the same
        easing curve as the CSS reveals so it feels like one system.
        Falls back to the final value instantly under reduced-motion.
  ---------------------------------------------------------- */
  var counters = document.querySelectorAll('[data-to]');

  function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }

  function runCount(el) {
    var to = parseFloat(el.getAttribute('data-to'));
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var dur = 1100;
    var t0 = null;

    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var v = to * easeOutQuint(p);
      el.textContent = pre + v.toLocaleString('en-US', {
        minimumFractionDigits: dec, maximumFractionDigits: dec
      }) + suf;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function settle(el) {
    var to = parseFloat(el.getAttribute('data-to'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    el.textContent = (el.getAttribute('data-prefix') || '') +
      to.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) +
      (el.getAttribute('data-suffix') || '');
  }

  if (reduce || !('IntersectionObserver' in window)) {
    counters.forEach(settle);
  } else {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCount(entry.target);
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ----------------------------------------------------------
     4. Nav border on scroll. Cheap, no listener thrash.
  ---------------------------------------------------------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        nav.classList.toggle('is-stuck', !e[0].isIntersecting);
      }, { threshold: 0 }).observe(sentinel);
    }

    /* 4b. Measure the nav's real rendered height and expose it as --nav-h,
       so .rail's sticky top can dock flush underneath it instead of using
       a hand-guessed px value. That guess (73px desktop / 68px mobile) was
       measured once against one nav content state and drifted, leaving a
       gap where whatever scrolls past underneath briefly shows through
       between the nav's true bottom edge and where the rail actually
       sticks. Re-measured on resize since the nav's height changes at the
       breakpoint where mark-name and nav-cta padding shift. CSS keeps the
       old px values as a fallback (var(--nav-h, 73px)) for the instant
       before this runs and for no-JS. */
    var setNavH = function () {
      root.style.setProperty('--nav-h', nav.getBoundingClientRect().height + 'px');
    };
    setNavH();
    window.addEventListener('resize', setNavH);
  }

  /* 4c. Same treatment for the rail, exposed as --rail-h. The rail docks
     sticky *underneath* the nav, so anything that scrolls to an anchor has
     to clear nav + rail, not just nav. Chapter scroll-margin-top was
     accounting for the nav only, which meant every deep link from the home
     page (index.html#scale and friends) landed with the chapter's own
     number chip and part of its headline hidden behind the rail, the exact
     thing those tiles exist to deliver. Measured rather than guessed for
     the same reason --nav-h is: the rail's height changes at the mobile
     breakpoint and would drift from any hardcoded value. CSS keeps
     var(--rail-h, 56px) as the no-JS fallback. */
  var railEl = document.querySelector('.rail');
  if (railEl) {
    var setRailH = function () {
      root.style.setProperty('--rail-h', railEl.getBoundingClientRect().height + 'px');
    };
    setRailH();
    window.addEventListener('resize', setRailH);
  }

  /* ----------------------------------------------------------
     5. Scroll progress rail (case-study pages only).
        rAF-throttled; reads scrollHeight once per frame at most.
  ---------------------------------------------------------- */
  var bar = document.querySelector('.progress');
  if (bar && !reduce) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var p = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
        bar.style.transform = 'scaleX(' + p + ')';
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------
     6. Sticky section rail. Highlights the beat you are reading.

        Session 15, rewritten twice: the original approach compared
        window.scrollY + a fixed viewport-fraction "look-ahead" against
        each target's offsetTop. That worked while every rail-linked
        section was a full beat, but broke once a short "Context" section
        was added, the look-ahead distance was tuned against typical
        section heights, not this one, so the next section's offsetTop
        kept falling inside the look-ahead window before Context's own
        content had scrolled through. Tightening the fraction (0.32 to
        0.1) reduced but didn't eliminate it, still guessing a pixel
        distance against unknown, variable section heights.

        Replaced with IntersectionObserver against a thin trigger band
        near the top of the viewport, just below the sticky nav. A
        section is "active" while any part of it overlaps that band,
        i.e. while its top has scrolled up to reading position but
        hasn't fully passed it yet. This is proportional to the actual
        rendered layout on every recalculation, not a fixed guess, so it
        holds regardless of how tall or short a given section is.

        The rail is a horizontal scroll strip (v3), so highlighting the
        active chip isn't enough on its own, it can be scrolled off to
        the right and invisible. When the active section changes, scroll
        the strip (not the page) so the active chip stays in view.
  ---------------------------------------------------------- */
  var railLinks = Array.prototype.slice.call(document.querySelectorAll('.rail a[href^="#"]'));
  if (railLinks.length && 'IntersectionObserver' in window) {
    var targets = railLinks
      .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
      .filter(Boolean);
    var linkById = {};
    railLinks.forEach(function (a) { linkById[a.getAttribute('href').slice(1)] = a; });

    // Scrolls only the rail's own horizontal strip, never the page. Deliberately
    // not using scrollIntoView here: even with block:'nearest', it was found to
    // fight the page's own vertical scroll while the rail is mid-dock (sticky
    // top:73px), reported as "can't scroll past the section nav." Setting
    // scrollLeft directly on the <ol> makes it structurally impossible for this
    // code to touch the vertical axis.
    var scrollChipIntoView = function (link) {
      var ol = link.closest('ol');
      if (!ol) return;
      var target = link.offsetLeft - (ol.clientWidth - link.offsetWidth) / 2;
      target = Math.max(0, Math.min(target, ol.scrollWidth - ol.clientWidth));
      if (ol.scrollTo) {
        ol.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' });
      } else {
        ol.scrollLeft = target;
      }
    };

    var currentId = null;
    var firstSync = true;
    var setActiveId = function (id) {
      if (id === currentId) return;
      currentId = id;
      railLinks.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) { a.setAttribute('aria-current', 'location'); }
        else { a.removeAttribute('aria-current'); }
      });
      if (!firstSync && linkById[id]) { scrollChipIntoView(linkById[id]); }
      firstSync = false;
    };

    // Trigger band anchored to the real nav height (measured in section 4
    // above, exposed as --nav-h) rather than a guessed viewport fraction,
    // so it tracks the actual sticky offset even if the nav's height
    // changes at a breakpoint. Spans from just under the nav down to 30%
    // of the viewport, generous enough that short sections still register.
    var buildObserver = function () {
      var navH = nav ? nav.getBoundingClientRect().height : 68;
      var top = Math.round(navH + 8);
      return new IntersectionObserver(function (entries) {
        var visible = entries.filter(function (e) { return e.isIntersecting; });
        if (!visible.length) return;
        // Multiple sections can overlap a wide band; the one whose top is
        // closest to (but not below) the band's top edge is the one the
        // reader is actually at.
        visible.sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
        setActiveId(visible[0].target.id);
      }, { rootMargin: '-' + top + 'px 0px -70% 0px', threshold: 0 });
    };

    var railIO = buildObserver();
    targets.forEach(function (t) { railIO.observe(t); });

    // Rebuild on resize since the trigger band's top edge depends on the
    // nav's real height, which itself changes at the mobile breakpoint.
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        railIO.disconnect();
        railIO = buildObserver();
        targets.forEach(function (t) { railIO.observe(t); });
      }, 150);
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     6b. Rail edge feathering. The rail's chip strip can overflow
         horizontally, this fades whichever edge still has more chips to
         scroll to, and hides the fade on an edge that's already fully
         scrolled. Separate from syncRail above: that one reacts to page
         scroll, this one reacts to the rail's own horizontal scroll.
  ---------------------------------------------------------- */
  var railScrollEl = document.querySelector('.rail-scroll');
  var railOl = railScrollEl ? railScrollEl.querySelector('ol') : null;
  if (railScrollEl && railOl) {
    var updateRailFade = function () {
      var atStart = railOl.scrollLeft <= 2;
      var atEnd = railOl.scrollLeft + railOl.clientWidth >= railOl.scrollWidth - 2;
      railScrollEl.classList.toggle('is-scrolled', !atStart);
      railScrollEl.classList.toggle('is-end', atEnd);
    };
    railOl.addEventListener('scroll', updateRailFade, { passive: true });
    window.addEventListener('resize', updateRailFade, { passive: true });
    updateRailFade();
  }

  /* Hero illustration tilt was tried here and cut: at a comfortable max
     angle (6deg) it read as too subtle to notice, not worth the code or
     the "why is this here" risk. No cursor-tracking effect remains on
     the site currently. */
})();
