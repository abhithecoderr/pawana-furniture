// Scroll-triggered animations for sections
document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    threshold: 0.1, // Trigger when 10% of the section is visible
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before fully in view
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target); // Stop observing once animated
      }
    });
  }, observerOptions);

  // Observe the about section
  const aboutSection = document.querySelector('.about-section');
  if (aboutSection) {
    observer.observe(aboutSection);
  }
});
