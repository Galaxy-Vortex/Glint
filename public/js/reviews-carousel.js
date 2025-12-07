(function() {
  const grid = document.querySelector('.reviews-grid');
  if (!grid) return;

  const wrapper = document.querySelector('.reviews-wrapper');
  const speed = 0.15; 
  let position = 0;
  let isPaused = false;

  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => isPaused = true);
    wrapper.addEventListener('mouseleave', () => isPaused = false);
  }

  function cycle() {
    if (!isPaused) {
      position += speed;
      
      const firstCard = grid.firstElementChild;
      if (!firstCard) return;
      
      const cardWidth = firstCard.offsetWidth;
      const gap = 16; 
      
      if (position >= cardWidth + gap) {
        position -= (cardWidth + gap);
        grid.appendChild(firstCard);
      }
      
      grid.style.transform = `translateX(-${position}px)`;
    }
    requestAnimationFrame(cycle);
  }

  requestAnimationFrame(cycle);
})();
