// ========== Smooth scroll for anchor links ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetEl = document.querySelector(this.getAttribute("href"));
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ========== Scroll animations for product cards ==========
const observerOptions = {
  threshold: 0.2,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.product-card').forEach(card => {
  observer.observe(card);
});

// ========== Infinite Carousel functionality for Home Page ==========
function initializeCarousel(trackId, prevSelector, nextSelector, thumbId) {
  const carouselTrack = document.querySelector(`#${trackId}`);
  const carouselPrev = document.querySelector(`${prevSelector}`);
  const carouselNext = document.querySelector(`${nextSelector}`);
  const carouselThumb = document.querySelector(`#${thumbId}`);

  if (!carouselTrack) return;

  // Get original items
  const originalItems = Array.from(carouselTrack.querySelectorAll('.carousel-item:not([data-cloned])'));
  if (originalItems.length === 0) return;

  let currentIndex = 0;
  let isAnimating = false;
  const transitionDuration = 700;

  // Clear any existing clones
  const existingClones = carouselTrack.querySelectorAll('.carousel-item[data-cloned]');
  existingClones.forEach(clone => clone.remove());

  // Create clones for infinite scrolling
  function createClones() {
    // Clone first few items and append to the end
    for (let i = 0; i < Math.min(3, originalItems.length); i++) {
      const clone = originalItems[i].cloneNode(true);
      clone.setAttribute('data-cloned', 'true');
      clone.setAttribute('aria-hidden', 'true');
      carouselTrack.appendChild(clone);
    }

    // Clone last few items and prepend to the beginning
    for (let i = Math.max(0, originalItems.length - 3); i < originalItems.length; i++) {
      const clone = originalItems[i].cloneNode(true);
      clone.setAttribute('data-cloned', 'true');
      clone.setAttribute('aria-hidden', 'true');
      carouselTrack.insertBefore(clone, carouselTrack.firstChild);
    }
  }

  // Move carousel to specific position
  function moveToIndex(index, animate = true) {
    if (isAnimating) return;
    isAnimating = true;

    currentIndex = index;
    
    // Calculate position
    const itemWidth = originalItems[0].offsetWidth;
    const gap = 32;
    const offset = (currentIndex + 3) * (itemWidth + gap); // +3 because we prepended 3 items
    
    // Apply transformation
    if (animate) {
      carouselTrack.style.transform = `translateX(-${offset}px)`;
    } else {
      carouselTrack.style.transition = 'none';
      carouselTrack.style.transform = `translateX(-${offset}px)`;
      carouselTrack.offsetHeight; // Force reflow
      carouselTrack.style.transition = '';
    }
    
    // Handle loop transitions
    setTimeout(() => {
      if (currentIndex >= originalItems.length) {
        // Went past last item, jump to first
        currentIndex = 0;
        const resetOffset = (currentIndex + 3) * (itemWidth + gap);
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = `translateX(-${resetOffset}px)`;
        carouselTrack.offsetHeight; // Force reflow
        carouselTrack.style.transition = '';
      } else if (currentIndex < 0) {
        // Went before first item, jump to last
        currentIndex = originalItems.length - 1;
        const resetOffset = (currentIndex + 3) * (itemWidth + gap);
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = `translateX(-${resetOffset}px)`;
        carouselTrack.offsetHeight; // Force reflow
        carouselTrack.style.transition = '';
      }
      
      // Reset animation flag after a small delay to ensure everything is settled
      setTimeout(() => {
        isAnimating = false;
      }, 50);
    }, animate ? transitionDuration : 0);
  }

  // Navigation functions
  function next() {
    if (isAnimating) return;
    moveToIndex(currentIndex + 1);
  }

  function prev() {
    if (isAnimating) return;
    moveToIndex(currentIndex - 1);
  }

  // Event listeners
  carouselNext?.addEventListener('click', next);
  carouselPrev?.addEventListener('click', prev);

  // Touch support
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 30;

  carouselTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carouselTrack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const distance = touchStartX - touchEndX;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        next();
      } else {
        prev();
      }
    }
  }, { passive: true });

  // Trackpad/wheel support
  let wheelTimeout = null;
  let accumulatedDelta = 0;
  const wheelThreshold = 30;

  carouselTrack.parentElement.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 1) {
      e.preventDefault();
      accumulatedDelta += e.deltaX;

      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (Math.abs(accumulatedDelta) > wheelThreshold) {
          if (accumulatedDelta > 0) {
            next();
          } else {
            prev();
          }
        }
        accumulatedDelta = 0;
      }, 50);
    }
  }, { passive: false });

  // Initialize carousel
  createClones();
  moveToIndex(0, false); // Position at start without animation
}

// Initialize all carousels when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    initializeCarousel(
      'items-carousel-track',
      '[data-carousel="items"].carousel-prev',
      '[data-carousel="items"].carousel-next',
      'items-thumb'
    );

    initializeCarousel(
      'sets-carousel-track',
      '[data-carousel="sets"].carousel-prev',
      '[data-carousel="sets"].carousel-next',
      'sets-thumb'
    );
  }, 100);
});

// ========== Auto-scroll for Signature Pieces ==========
(function initAutoScroll() {
  const signatureTrack = document.querySelector('#signature-carousel-track');
  if (!signatureTrack) return;

  const items = signatureTrack.querySelectorAll('.carousel-item');
  if (items.length <= 1) return;

  let autoScrollIndex = 0;
  const autoScrollDuration = 25000;
  const itemDuration = autoScrollDuration / items.length;

  function autoScroll() {
    const containerWidth = signatureTrack.parentElement.offsetWidth;
    const firstItem = items[0];
    const itemWidth = firstItem ? firstItem.offsetWidth : 280;
    const gap = 32;
    const itemsToShow = Math.max(1, Math.floor(containerWidth / (itemWidth + gap)));
    
    autoScrollIndex = (autoScrollIndex + 1) % items.length;
    const offset = autoScrollIndex * (itemWidth + gap);
    
    signatureTrack.style.transform = `translateX(-${offset}px)`;
  }

  setInterval(autoScroll, itemDuration);
})();

// ========== Auto-scroll for Recent Projects ==========
(function initProjectsAutoScroll() {
  const projectsTrack = document.querySelector('#projects-marquee');
  if (!projectsTrack) return;

  // Clone all items for seamless infinite scroll
  const items = projectsTrack.querySelectorAll('.marquee-item');
  items.forEach(item => {
    const clone = item.cloneNode(true);
    projectsTrack.appendChild(clone);
  });

  // Pause on hover
  projectsTrack.addEventListener('mouseenter', () => {
    projectsTrack.style.animationPlayState = 'paused';
  });

  projectsTrack.addEventListener('mouseleave', () => {
    projectsTrack.style.animationPlayState = 'running';
  });
})();

// ========== Auto-scroll for Brands ==========
(function initBrandsAutoScroll() {
  const brandsTrack = document.querySelector('#brands-marquee');
  if (!brandsTrack) return;

  // Clone all items for seamless infinite scroll
  const items = brandsTrack.querySelectorAll('.marquee-item');
  items.forEach(item => {
    const clone = item.cloneNode(true);
    brandsTrack.appendChild(clone);
  });

  // Make brands scroll in opposite direction
  brandsTrack.style.animationDirection = 'reverse';

  // Pause on hover
  brandsTrack.addEventListener('mouseenter', () => {
    brandsTrack.style.animationPlayState = 'paused';
  });

  brandsTrack.addEventListener('mouseleave', () => {
    brandsTrack.style.animationPlayState = 'running';
  });
})();

// ========== FAQ Accordion functionality for Contact Page ==========
function initializeFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // Toggle current item without affecting others
      item.classList.toggle('active');
    });
  });
}

// Initialize FAQ accordion when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeFAQAccordion();
});
