// ========== Marquee Factory Function ==========
// Creates a draggable, pausable marquee with infinite scroll

function createDraggableMarquee(trackSelector, options = {}) {
  const track = document.querySelector(trackSelector);
  if (!track) return null;

  const config = {
    animationName: options.animationName || 'marquee',
    animationDuration: options.animationDuration || 40,
    reverse: options.reverse || false,
    ...options
  };

  // Clone all items for seamless infinite scroll
  const items = track.querySelectorAll('.marquee-item');
  items.forEach(item => {
    const clone = item.cloneNode(true);
    track.appendChild(clone);
  });

  // Set animation direction if reversed
  if (config.reverse) {
    track.style.animationDirection = 'reverse';
  }

  // State
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let animationPaused = false;

  // Get current transform value from the animation
  function getCurrentTranslate() {
    const style = window.getComputedStyle(track);
    const matrix = new DOMMatrix(style.transform);
    return matrix.m41;
  }

  // Apply manual translate
  function setTranslate(x) {
    track.style.transform = `translateX(${x}px)`;
  }

  // Resume animation from current position
  function resumeAnimation() {
    animationPaused = false;
    isDragging = false;

    const trackWidth = track.scrollWidth / 2;
    const progress = Math.abs(currentTranslate) / trackWidth;

    track.style.transform = '';
    track.style.animation = `${config.animationName} ${config.animationDuration}s linear infinite`;
    track.style.animationDelay = `-${progress * config.animationDuration}s`;

    if (config.reverse) {
      track.style.animationDirection = 'reverse';
    }
  }

  // Pause animation and enable dragging
  track.addEventListener('mouseenter', () => {
    animationPaused = true;
    currentTranslate = getCurrentTranslate();
    track.style.animation = 'none';
    setTranslate(currentTranslate);
  });

  // Resume animation from current position
  track.addEventListener('mouseleave', () => {
    if (isDragging) return;
    resumeAnimation();
  });

  // Mouse drag handlers
  track.addEventListener('mousedown', (e) => {
    if (!animationPaused) return;
    isDragging = true;
    startX = e.clientX;
    currentTranslate = getCurrentTranslate();
    track.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !animationPaused) return;
    const deltaX = e.clientX - startX;
    let newTranslate = currentTranslate + deltaX;

    const trackWidth = track.scrollWidth / 2;
    if (newTranslate > 0) {
      newTranslate = -trackWidth + newTranslate;
    } else if (newTranslate < -trackWidth) {
      newTranslate = newTranslate + trackWidth;
    }

    setTranslate(newTranslate);
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    currentTranslate = getCurrentTranslate();
    track.style.cursor = 'grab';

    if (!track.matches(':hover')) {
      resumeAnimation();
    }
  });

  // Touch support
  track.addEventListener('touchstart', (e) => {
    animationPaused = true;
    currentTranslate = getCurrentTranslate();
    track.style.animation = 'none';
    setTranslate(currentTranslate);

    isDragging = true;
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    let newTranslate = currentTranslate + deltaX;

    const trackWidth = track.scrollWidth / 2;
    if (newTranslate > 0) {
      newTranslate = -trackWidth + newTranslate;
    } else if (newTranslate < -trackWidth) {
      newTranslate = newTranslate + trackWidth;
    }

    setTranslate(newTranslate);
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    currentTranslate = getCurrentTranslate();

    setTimeout(() => {
      resumeAnimation();
    }, 100);
  }, { passive: true });

  // Touchpad/wheel scroll support
  track.parentElement?.addEventListener('wheel', (e) => {
    if (!animationPaused) return;
    if (Math.abs(e.deltaX) < 1 || Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;

    e.preventDefault();

    currentTranslate = getCurrentTranslate();
    let newTranslate = currentTranslate - e.deltaX;

    const trackWidth = track.scrollWidth / 2;
    if (newTranslate > 0) {
      newTranslate = -trackWidth + newTranslate;
    } else if (newTranslate < -trackWidth) {
      newTranslate = newTranslate + trackWidth;
    }

    currentTranslate = newTranslate;
    setTranslate(newTranslate);
  }, { passive: false });

  // Set initial cursor style
  track.style.cursor = 'grab';

  return { track, resumeAnimation };
}

// ========== Simple Pause-on-Hover Marquee ==========
function createSimpleMarquee(trackSelector, options = {}) {
  const track = document.querySelector(trackSelector);
  if (!track) return null;

  // Clone all items for seamless infinite scroll
  const items = track.querySelectorAll('.marquee-item');
  items.forEach(item => {
    const clone = item.cloneNode(true);
    track.appendChild(clone);
  });

  // Set animation direction if reversed
  if (options.reverse) {
    track.style.animationDirection = 'reverse';
  }

  // Pause on hover
  track.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });

  track.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });

  return { track };
}

// ========== Mobile Snap Swipe ==========
(function initMobileSnapSwipe() {
  const isMobile = window.innerWidth <= 767;
  if (!isMobile) return;

  const marqueeContainer = document.querySelector('.home-marquee .marquee-track');
  if (!marqueeContainer) return;

  const items = marqueeContainer.querySelectorAll('.marquee-item');
  if (items.length <= 1) return;

  let currentIndex = 0;
  let autoAdvanceInterval;
  const pauseDuration = 5000;

  function getItemOffset(index) {
    const itemWidth = window.innerWidth - 32;
    const gap = 16;
    return index * (itemWidth + gap);
  }

  function moveToItem(index, smooth = true) {
    if (index >= items.length) index = 0;
    else if (index < 0) index = items.length - 1;

    currentIndex = index;
    const offset = getItemOffset(currentIndex);

    marqueeContainer.style.transition = smooth ? 'transform 0.8s ease-out' : 'none';
    marqueeContainer.style.transform = `translateX(-${offset}px)`;
  }

  function autoAdvance() {
    moveToItem(currentIndex + 1);
  }

  function startAutoAdvance() {
    stopAutoAdvance();
    autoAdvanceInterval = setInterval(autoAdvance, pauseDuration);
  }

  function stopAutoAdvance() {
    if (autoAdvanceInterval) clearInterval(autoAdvanceInterval);
  }

  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50;

  marqueeContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoAdvance();
  }, { passive: true });

  marqueeContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const distance = touchStartX - touchEndX;

    if (Math.abs(distance) > minSwipeDistance) {
      moveToItem(distance > 0 ? currentIndex + 1 : currentIndex - 1);
    }

    startAutoAdvance();
  }, { passive: true });

  marqueeContainer.addEventListener('touchmove', () => {
    stopAutoAdvance();
  }, { passive: true });

  // Initialize
  moveToItem(0, false);
  startAutoAdvance();

  // Handle resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const nowMobile = window.innerWidth <= 767;
      if (nowMobile) {
        moveToItem(currentIndex, false);
      } else {
        marqueeContainer.style.transform = '';
        marqueeContainer.style.transition = '';
        stopAutoAdvance();
      }
    }, 250);
  });
})();

// ========== Initialize Marquees ==========
// Only run on desktop for draggable marquees
if (window.innerWidth > 767) {
  createDraggableMarquee('#signature-marquee');
  createDraggableMarquee('#projects-marquee');
}

// Brands marquee - simple pause on hover, reversed direction
createSimpleMarquee('#brands-marquee', { reverse: true });
