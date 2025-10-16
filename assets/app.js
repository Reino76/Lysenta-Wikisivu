/**
 * Lysentan Nielemät - app.js
 * Version: 3.1 (Scroll Animations Added)
 */
document.addEventListener('DOMContentLoaded', () => {

  /**
   * MODULE 1: Active Sidebar Link on Scroll
   */
  const sidebarLinks = document.querySelectorAll('.sidebar a[href^="#"]');
  if (sidebarLinks.length > 0) {
    const sections = Array.from(sidebarLinks).map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if (sections.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            sidebarLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
          }
        });
      }, { rootMargin: '-40% 0px -60% 0px' });
      sections.forEach(section => observer.observe(section));
    }
  }

  /**
   * MODULE 2: Session Table Row Click Effect
   */
  const sessionRows = document.querySelectorAll('.session-row');
  if (sessionRows.length > 0) {
    sessionRows.forEach(row => {
      row.addEventListener('click', (event) => {
        const link = row.querySelector('a');
        if (!link || event.ctrlKey || event.metaKey || event.which > 1) return;
        event.preventDefault();
        row.classList.add('row-flash');
        setTimeout(() => { window.location.href = link.href; }, 150);
      });
    });
  }

  /**
   * MODULE 3: Interactive World Map Tooltip
   */
  const mapWrap = document.querySelector('.map-wrap');
  if (mapWrap) {
    const tooltip = document.getElementById('map-tooltip');
    const tooltipTitle = document.getElementById('tooltip-title');
    const tooltipButton = document.getElementById('tooltip-button');
    const mapPins = document.querySelectorAll('.map-pin');
    let hideTimeout;
    const showTooltip = (pin) => {
      clearTimeout(hideTimeout);
      const mapRect = mapWrap.getBoundingClientRect();
      const pinRect = pin.getBoundingClientRect();
      tooltipTitle.textContent = pin.getAttribute('title');
      tooltip.style.top = `${pinRect.top + window.scrollY}px`;
      tooltip.style.left = `${pinRect.left + window.scrollX}px`;
      tooltip.dataset.target = pin.getAttribute('href');
      tooltip.classList.add('visible');
    };
    const hideTooltip = () => {
      hideTimeout = setTimeout(() => { tooltip.classList.remove('visible'); }, 200);
    };
    mapPins.forEach(pin => {
      pin.addEventListener('mouseenter', () => showTooltip(pin));
      pin.addEventListener('mouseleave', hideTooltip);
    });
    tooltip.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
    tooltip.addEventListener('mouseleave', hideTooltip);
    tooltipButton.addEventListener('click', () => {
      const targetCard = document.querySelector(tooltip.dataset.target);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.add('highlight-target');
        setTimeout(() => { targetCard.classList.remove('highlight-target'); }, 1500);
      }
      tooltip.classList.remove('visible');
    });
  }

  /**
   * MODULE 4: Animate Elements on Scroll
   */
  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.animate-on-scroll').forEach(element => {
    scrollObserver.observe(element);
  });

});