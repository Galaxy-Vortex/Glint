(function() {
  const grid = document.querySelector('.reviews-grid');
  if (!grid) return;

  const speed = 0.3; 
  let position = 0;

  function cycle() {
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
    requestAnimationFrame(cycle);
  }

  requestAnimationFrame(cycle);
})();
