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

// ========== Dual Carousel functionality for Home Page ==========
function initializeCarousel(trackId, prevSelector, nextSelector, thumbId) {
  const carouselTrack = document.querySelector(`#${trackId}`);
  const carouselPrev = document.querySelector(`${prevSelector}`);
  const carouselNext = document.querySelector(`${nextSelector}`);
  const carouselThumb = document.querySelector(`#${thumbId}`);

  if (!carouselTrack) return; // Exit if carousel doesn't exist

  let currentIndex = 0;
  const activeItems = Array.from(carouselTrack.querySelectorAll('.carousel-item'));

  // Update carousel position
  function updateCarousel() {
    if (activeItems.length === 0) return;

    const firstItem = activeItems[0];
    const itemWidth = firstItem ? firstItem.offsetWidth : 280;
    const gap = 32;

    // Calculate how many items fit in the visible area
    const containerWidth = carouselTrack.parentElement.offsetWidth;
    const itemsToShow = Math.max(1, Math.floor(containerWidth / (itemWidth + gap)));

    const offset = currentIndex * (itemWidth + gap);
    const maxIndex = Math.max(0, activeItems.length - itemsToShow);

    // Ensure currentIndex doesn't exceed maxIndex
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    // Apply transform
    carouselTrack.style.transform = `translateX(-${offset}px)`;

    // Update scrollbar
    if (carouselThumb) {
      if (maxIndex > 0) {
        const visibleRatio = itemsToShow / activeItems.length;
        const thumbWidth = Math.max(10, visibleRatio * 100);
        carouselThumb.style.width = `${thumbWidth}%`;

        const scrollProgress = currentIndex / maxIndex;
        const maxLeft = 100 - thumbWidth;
        const thumbLeft = scrollProgress * maxLeft;

        carouselThumb.style.left = `${thumbLeft}%`;
        carouselThumb.style.display = 'block';
      } else {
        carouselThumb.style.display = 'none';
      }
    }

    // Update button states
    if (carouselPrev) {
      carouselPrev.style.opacity = currentIndex === 0 ? '0.3' : '1';
      carouselPrev.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
    }
    if (carouselNext) {
      carouselNext.style.opacity = currentIndex >= maxIndex ? '0.3' : '1';
      carouselNext.style.pointerEvents = currentIndex >= maxIndex ? 'none' : 'auto';
    }
  }

  // Button navigation
  carouselNext?.addEventListener('click', () => {
    const firstItem = activeItems[0];
    const itemWidth = firstItem ? firstItem.offsetWidth : 280;
    const gap = 32;
    const containerWidth = carouselTrack.parentElement.offsetWidth;
    const itemsToShow = Math.max(1, Math.floor(containerWidth / (itemWidth + gap)));

    const maxIndex = Math.max(0, activeItems.length - itemsToShow);

    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  });

  carouselPrev?.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  // Initialize
  setTimeout(updateCarousel, 100);
  window.addEventListener('resize', () => {
    updateCarousel();
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50;

  carouselTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carouselTrack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const distance = touchStartX - touchEndX;

    if (Math.abs(distance) > minSwipeDistance) {
      const firstItem = activeItems[0];
      const itemWidth = firstItem ? firstItem.offsetWidth : 280;
      const gap = 32;
      const containerWidth = carouselTrack.parentElement.offsetWidth;
      const itemsToShow = Math.max(1, Math.floor(containerWidth / (itemWidth + gap)));
      const maxIndex = Math.max(0, activeItems.length - itemsToShow);

      if (distance > 0 && currentIndex < maxIndex) {
        // Swipe left - next
        currentIndex++;
        updateCarousel();
      } else if (distance < 0 && currentIndex > 0) {
        // Swipe right - previous
        currentIndex--;
        updateCarousel();
      }
    }
  }

  // Trackpad/wheel horizontal scroll support
  let wheelTimeout = null;
  let accumulatedDelta = 0;
  const wheelThreshold = 70;

  carouselTrack.parentElement.addEventListener('wheel', (e) => {
    // Check if horizontal scroll (trackpad gesture)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 3) {
      e.preventDefault();
      accumulatedDelta += e.deltaX;

      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (Math.abs(accumulatedDelta) > wheelThreshold) {
          const firstItem = activeItems[0];
          const itemWidth = firstItem ? firstItem.offsetWidth : 280;
          const gap = 32;
          const containerWidth = carouselTrack.parentElement.offsetWidth;
          const itemsToShow = Math.max(1, Math.floor(containerWidth / (itemWidth + gap)));
          const maxIndex = Math.max(0, activeItems.length - itemsToShow);

          if (accumulatedDelta > 0 && currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
          } else if (accumulatedDelta < 0 && currentIndex > 0) {
            currentIndex--;
            updateCarousel();
          }
        }
        accumulatedDelta = 0;
      }, 30);
    }
  }, { passive: false });
}

// Initialize both carousels
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

initializeCarousel(
  'signature-carousel-track',
  '[data-carousel="signature"].carousel-prev',
  '[data-carousel="signature"].carousel-next',
  'signature-thumb'
);

initializeCarousel(
  'similar-sets-carousel-track',
  '[data-carousel="similar-sets"].carousel-prev',
  '[data-carousel="similar-sets"].carousel-next',
  null // No scrollbar for similar sets
);

// ========== Auto-scroll for Signature Pieces ==========
(function initAutoScroll() {
  const signatureTrack = document.querySelector('#signature-carousel-track');
  if (!signatureTrack) return;

  const items = signatureTrack.querySelectorAll('.carousel-item');
  if (items.length <= 1) return;

  let autoScrollIndex = 0;
  const autoScrollDuration = 25000; // 25 seconds for full cycle
  const itemDuration = autoScrollDuration / items.length;

  function autoScroll() {
    const containerWidth = signatureTrack.parentElement.offsetWidth;
    const itemWidth = items[0].offsetWidth;
    const gap = 32;
    const itemsVisible = Math.floor(containerWidth / (itemWidth + gap));
    const maxIndex = Math.max(0, items.length - itemsVisible);

    autoScrollIndex++;
    if (autoScrollIndex > maxIndex) {
      autoScrollIndex = 0;
    }

    const offset = autoScrollIndex * (itemWidth + gap);
    signatureTrack.style.transform = `translateX(-${offset}px)`;
  }

  // Start auto-scroll
  setInterval(autoScroll, itemDuration);

  // Pause on hover
  signatureTrack.addEventListener('mouseenter', () => {
    signatureTrack.dataset.paused = 'true';
  });

  signatureTrack.addEventListener('mouseleave', () => {
    signatureTrack.dataset.paused = 'false';
  });
})();
