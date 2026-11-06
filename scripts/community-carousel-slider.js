/*
 * File: community-carousel-slider.js
 * 
 * The JavaScript that causes the contributor community carousel to slide.
 * 
 * Programmer: Neil Ghugare
 * 
 * Revision History:
 * 10/22/2026 - Created initial version.
 * 
 * Notes:
 */


document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const nextButton = document.querySelector('.next-btn');
  const prevButton = document.querySelector('.prev-btn');
  const dotsNav = document.querySelector('.carousel-nav');

  if (!slides.length) return;

  let currentIndex = 0;

  // 1. Clear any existing static dots and dynamically create new ones
  dotsNav.innerHTML = '';
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.classList.add('indicator');
    if (index === 0) dot.classList.add('current-slide');
    dot.setAttribute('aria-label', `Slide ${index + 1}`);
    dotsNav.appendChild(dot);
  });

  const dots = Array.from(dotsNav.children);

  // 2. Function to move to slide by index
  const moveToSlide = (targetIndex) => {
    // Force recalculation of width to support responsive resizing
    const slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${targetIndex * slideWidth}px)`;

    // Update dot active state
    dots.forEach(dot => dot.classList.remove('current-slide'));
    if (dots[targetIndex]) {
      dots[targetIndex].classList.add('current-slide');
    }

    currentIndex = targetIndex;
  };

  // 3. Next Button Click
  nextButton.addEventListener('click', () => {
    const nextIndex = (currentIndex + 1) % slides.length;
    moveToSlide(nextIndex);
  });

  // 4. Previous Button Click
  prevButton.addEventListener('click', () => {
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    moveToSlide(prevIndex);
  });

  // 5. Indicator Dot Click
  dotsNav.addEventListener('click', (e) => {
    const targetDot = e.target.closest('button');
    if (!targetDot) return;
    const targetIndex = dots.findIndex(dot => dot === targetDot);
    if (targetIndex !== -1) {
      moveToSlide(targetIndex);
    }
  });

  // 6. Recalculate layout if screen size changes
  window.addEventListener('resize', () => {
    moveToSlide(currentIndex);
  });
});
