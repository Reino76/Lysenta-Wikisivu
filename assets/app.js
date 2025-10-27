/**
 * Lysenta Wiki - app.js
 * Version: 3.4 (Enhanced Map Tooltips)
 * 
 * This file contains all the JavaScript functionality for the Lysenta Wiki project.
 * It is organized into modules that are initialized when the DOM is fully loaded.
 */

// Wait for the entire HTML document to be loaded and parsed before running the script.
document.addEventListener('DOMContentLoaded', () => {

  /**
   * MODULE 1: Active Sidebar Link on Scroll
   * 
   * This module highlights the corresponding link in the sidebar when the user scrolls
   * to a new section on a page. It uses the IntersectionObserver API for performance.
   */
  // Select all sidebar links that point to an anchor on the same page.
  const sidebarLinks = document.querySelectorAll('.sidebar a[href^="#"]');
  if (sidebarLinks.length > 0) {
    // Get the actual section elements these links point to.
    const sections = Array.from(sidebarLinks).map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    
    if (sections.length > 0) {
      // Create an observer that watches for sections entering the middle of the viewport.
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // When a section is intersecting with the viewport...
          if (entry.isIntersecting) {
            // ...loop through all sidebar links...
            sidebarLinks.forEach(link => {
              // ...and toggle the 'active' class if its href matches the intersecting section's id.
              link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
          }
        });
      }, { rootMargin: '-40% 0px -60% 0px' }); // Defines the "trigger zone" in the middle of the screen.
      
      // Start observing each section.
      sections.forEach(section => observer.observe(section));
    }
  }

  /**
   * MODULE 2: Session Table Row Click Effect
   * 
   * This module makes entire rows in the session table clickable and adds a brief
   * visual effect before navigating to the session's page.
   */
  const sessionRows = document.querySelectorAll('.session-row');
  if (sessionRows.length > 0) {
    sessionRows.forEach(row => {
      row.addEventListener('click', (event) => {
        // Find the link within the row.
        const link = row.querySelector('a');
        // Don't interfere with right-clicks, ctrl/cmd-clicks, or if there's no link.
        if (!link || event.ctrlKey || event.metaKey || event.which > 1) return;
        
        event.preventDefault(); // Prevent the browser from navigating immediately.
        row.classList.add('row-flash'); // Add a CSS class for a visual flash effect.
        
        // Wait a short moment for the effect to be visible, then navigate.
        setTimeout(() => { window.location.href = link.href; }, 150);
      });
    });
  }

  /**
   * MODULE 3: Interactive World Map Tooltip
   * 
   * This module controls the behavior of the interactive map, showing a detailed
   * tooltip when a user hovers over or clicks a map pin.
   */
  const mapWrap = document.querySelector('.map-wrap');
  if (mapWrap) {
    // Get all necessary elements for the map and its tooltip.
    const tooltip = document.getElementById('map-tooltip');
    const tooltipTitle = document.getElementById('tooltip-title');
    const tooltipDescription = document.getElementById('tooltip-description');
    const tooltipButton = document.getElementById('tooltip-button');
    const mapPins = document.querySelectorAll('.map-pin');
    let hideTimeout; // Used to manage the delay before hiding the tooltip.
    
    // Function to display and position the tooltip.
    const showTooltip = (pin) => {
      clearTimeout(hideTimeout); // Cancel any pending hide actions.
      const pinRect = pin.getBoundingClientRect(); // Get pin's position.

      // 1. Populate content
      tooltipTitle.textContent = pin.getAttribute('title');
      tooltipDescription.textContent = pin.getAttribute('data-description');
      
      // 2. Reset classes and prepare for measurement
      tooltip.classList.remove('visible', 'adjust-left', 'adjust-right');
      tooltip.style.transition = 'none';

      // 3. Position and measure
      tooltip.style.top = `${pinRect.top + window.scrollY}px`;
      tooltip.style.left = `${pinRect.left + window.scrollX + (pinRect.width / 2)}px`;
      
      // Temporarily make it visible but transparent to measure its rendered width
      tooltip.classList.add('visible'); 
      const tooltipWidth = tooltip.offsetWidth;
      tooltip.classList.remove('visible'); // Hide it again before animation

      // 4. Check for clipping and add adjustment classes
      const viewportMargin = 10;
      const pinCenter = pinRect.left + pinRect.width / 2;

      if (pinCenter + (tooltipWidth / 2) > window.innerWidth - viewportMargin) {
        tooltip.classList.add('adjust-left');
      } else if (pinCenter - (tooltipWidth / 2) < viewportMargin) {
        tooltip.classList.add('adjust-right');
      }

      // 5. Re-enable transitions and show the tooltip
      tooltip.style.transition = '';
      // Use a timeout to ensure the classes are applied before the transition starts
      setTimeout(() => {
        tooltip.dataset.target = pin.getAttribute('href');
        tooltip.classList.add('visible'); // Make the tooltip visible
      }, 10);
    };

    // Function to hide the tooltip after a short delay.
    const hideTooltip = () => {
      hideTimeout = setTimeout(() => { tooltip.classList.remove('visible'); }, 200);
    };
    
    // Add event listeners to each map pin.
    mapPins.forEach(pin => {
      pin.addEventListener('mouseenter', () => showTooltip(pin)); // Show on hover.
      pin.addEventListener('mouseleave', hideTooltip); // Hide when mouse leaves.
      pin.addEventListener('click', (e) => { // Also show on click.
        e.preventDefault();
        showTooltip(pin);
      });
    });

    // Keep the tooltip visible if the user moves their mouse over it.
    tooltip.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
    tooltip.addEventListener('mouseleave', hideTooltip);

    // Handle clicks on the button inside the tooltip.
    tooltipButton.addEventListener('click', () => {
      const targetCard = document.querySelector(tooltip.dataset.target);
      if (targetCard) {
        // Scroll to the corresponding content card.
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary highlight effect to the card.
        targetCard.classList.add('highlight-target');
        setTimeout(() => { targetCard.classList.remove('highlight-target'); }, 1500);
      }
      tooltip.classList.remove('visible'); // Hide the tooltip.
    });

    // Hide the tooltip if the user clicks anywhere else on the page.
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.map-pin') && !tooltip.contains(event.target)) {
        tooltip.classList.remove('visible');
      }
    });
  }

  /**
   * MODULE 4: Animate Elements on Scroll
   * 
   * This module adds a fade-in-and-up animation to elements as they are scrolled
   * into the viewport. It uses the IntersectionObserver API for efficiency.
   */
  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      // When an element becomes visible...
      if (entry.isIntersecting) {
        // ...add the 'is-visible' class to trigger the CSS animation.
        entry.target.classList.add('is-visible');
        // Stop observing the element to prevent re-animation.
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 }); // Trigger when 10% of the element is visible.
  
  // Apply this observer to all elements with the 'animate-on-scroll' class.
  document.querySelectorAll('.animate-on-scroll').forEach(element => {
    scrollObserver.observe(element);
  });
  
  /**
   * MODULE 5: Wiki Page Tab System
   * 
   * This module powers the tabbed content sections found on some wiki pages.
   * It handles switching between tabs and updating their state.
   */
  document.querySelectorAll('.tab-container').forEach(container => {
    // Get all parts of the tab system within this container.
    const tabs = container.querySelectorAll('.tab-navigation .tab-btn');
    const panels = container.querySelectorAll('.tab-content-panel');
    const prevButton = container.querySelector('.prev-tab-btn');
    const nextButton = container.querySelector('.next-tab-btn');
    let currentIndex = 0; // Keep track of the currently active tab.

    // Function to show a specific tab and hide others.
    const updateTabs = (index) => {
      currentIndex = index;
      // Toggle 'active' class for tab buttons.
      tabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
      // Toggle 'active' class for content panels.
      panels.forEach((panel, i) => panel.classList.toggle('active', i === index));
      
      // Enable/disable previous/next buttons based on the current index.
      if (prevButton && nextButton) {
        prevButton.disabled = index === 0;
        nextButton.disabled = index === tabs.length - 1;
      }
    };

    // Add click listeners to each tab button.
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => updateTabs(index));
    });

    // Add click listener for the "Previous" button.
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        if (currentIndex > 0) updateTabs(currentIndex - 1);
      });
    }
    
    // Add click listener for the "Next" button.
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        if (currentIndex < tabs.length - 1) updateTabs(currentIndex + 1);
      });
    }

    // Initialize the tab system by showing the first tab.
    updateTabs(0);
  });
});
