/**
 * 许哲安 · AI 产品经理 · 作品集
 * Filtering, keyboard nav, and accessibility enhancements.
 * Zero dependencies — works by opening index.html directly.
 */

(function () {
  'use strict';

  /* ---- State ---- */
  let activeFilter = 'all';

  /* ---- DOM refs ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const miniCards = document.querySelectorAll('.mini-card');
  const supplementaryGroup = document.querySelector('.supplementary-group');

  /* ---- Filter function ---- */
  function applyFilter(filter) {
    activeFilter = filter;

    // Update button states
    filterBtns.forEach(function (btn) {
      const isActive = btn.getAttribute('data-filter') === filter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Cards are shared by core and supplementary sections.
    projectCards.forEach(function (card) {
      const matches = filter === 'all' || card.getAttribute('data-category') === filter;
      card.classList.toggle('hidden', !matches);
      card.setAttribute('aria-hidden', matches ? 'false' : 'true');
    });

    // Show/hide supplementary area
    if (supplementaryGroup) {
      const matches = filter === 'all' || filter === 'supplementary';
      supplementaryGroup.classList.toggle('hidden', !matches);
      supplementaryGroup.setAttribute('aria-hidden', matches ? 'false' : 'true');
    }

    // Show/hide individual mini cards
    miniCards.forEach(function (card) {
      const matches = filter === 'all' || filter === 'supplementary';
      card.classList.toggle('hidden', !matches);
      card.setAttribute('aria-hidden', matches ? 'false' : 'true');
    });
  }

  /* ---- Event listeners ---- */
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      const filter = btn.getAttribute('data-filter');
      applyFilter(filter);
    });
  });

  /* ---- Keyboard: Enter / Space on filter buttons ---- */
  filterBtns.forEach(function (btn) {
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  /* ---- Keyboard: Arrow key navigation within filter bar ---- */
  const filterNav = document.querySelector('.filter-nav');
  if (filterNav) {
    filterNav.addEventListener('keydown', function (e) {
      const btns = Array.from(filterNav.querySelectorAll('.filter-btn'));
      const currentIdx = btns.indexOf(document.activeElement);
      if (currentIdx === -1) return;

      let nextIdx;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextIdx = (currentIdx + 1) % btns.length;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIdx = (currentIdx - 1 + btns.length) % btns.length;
      } else {
        return;
      }

      btns[nextIdx].focus();
    });
  }

  /* ---- Print: show all projects before printing ---- */
  if (window.matchMedia) {
    var mq = window.matchMedia('print');
    mq.addListener(function (mql) {
      if (mql.matches) {
        // Temporarily show all for printing
        projectCards.forEach(function (card) {
          card.classList.remove('hidden');
          card.setAttribute('aria-hidden', 'false');
        });
        miniCards.forEach(function (card) {
          card.classList.remove('hidden');
          card.setAttribute('aria-hidden', 'false');
        });
        if (supplementaryGroup) {
          supplementaryGroup.classList.remove('hidden');
          supplementaryGroup.setAttribute('aria-hidden', 'false');
        }
      } else {
        // Restore filter when print dialog closes
        applyFilter(activeFilter);
      }
    });
  }

  /* ---- Initialize ---- */
  applyFilter('all');

})();
