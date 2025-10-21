/**
 * Lysentan Nielemät - app.js
 * * Handles dynamic site features, such as the active sidebar link
 * based on the user's scroll position.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Find all sidebar links that point to an anchor on the current page.
  const sidebarLinks = document.querySelectorAll('.sidebar a[href^="#"]');
  const sections = [];
  
  sidebarLinks.forEach(link => {
    const selector = link.getAttribute('href');
    try {
      const section = document.querySelector(selector);
      if (section) {
        sections.push(section);
      }
    } catch (e) {
      // This catches invalid CSS selectors in href attributes
      console.warn(`Sidebar link has an invalid selector and will be ignored: ${selector}`);
    }
  });

  // If there are no sections to observe, do nothing.
  if (sections.length === 0 || sidebarLinks.length === 0) {
    return;
  }

  // Create an observer that watches for sections entering the viewport.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // When a section is intersecting with the viewport...
      if (entry.isIntersecting) {
        // ...update all sidebar links.
        sidebarLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { 
    // This defines the "trigger zone" in the viewport.
    // The active link will change when a section is between 40% from the top
    // and 60% from the bottom of the screen.
    rootMargin: '-40% 0px -60% 0px' 
  });

  // Tell the observer to watch each of the sections.
  sections.forEach(section => {
    observer.observe(section);
  });
});

// Performance logging to diagnose initial load times
window.addEventListener('load', () => {
  if (performance.getEntriesByType) {
    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const fontEntries = performance.getEntriesByType("resource").filter(r => r.initiatorType === 'link' && r.name.includes('fonts.googleapis.com'));

    if (navigationEntry) {
      console.log(`Page loaded in: ${navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime}ms`);
    }

    if (fontEntries.length > 0) {
      console.log(`Found ${fontEntries.length} blocking font request(s).`);
      fontEntries.forEach(font => {
        console.log(`- ${font.name}, Download time: ${font.duration}ms`);
      });
    }
  } else {
    console.log("Performance API not supported.");
  }
});