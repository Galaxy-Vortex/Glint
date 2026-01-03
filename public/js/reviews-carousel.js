(function () {
  const grid = document.querySelector('.reviews-grid');
  if (!grid) return;

  const wrapper = document.querySelector('.reviews-wrapper');
  const speed = 0.15;
  let position = 0;
  let isPaused = false;

  let isDragging = false;
  let isMouseOver = false;
  let startX = 0;
  let dragOffset = 0;

  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => {
      isMouseOver = true;
      if (!isDragging) isPaused = true;
    });
    wrapper.addEventListener('mouseleave', () => {
      isMouseOver = false;
      if (!isDragging) isPaused = false;
    });

    wrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      isPaused = true;
      startX = e.clientX;
      dragOffset = 0;
      wrapper.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaX = startX - e.clientX;
      dragOffset = deltaX;
      startX = e.clientX;

      position += dragOffset;

      const firstCard = grid.firstElementChild;
      const lastCard = grid.lastElementChild;
      if (!firstCard || !lastCard) return;

      const cardWidth = firstCard.offsetWidth;
      const gap = 16;

      if (position >= cardWidth + gap) {
        position -= (cardWidth + gap);
        grid.appendChild(firstCard);
      }

      if (position < 0) {
        position += (cardWidth + gap);
        grid.insertBefore(lastCard, firstCard);
      }

      grid.style.transform = `translateX(-${position}px)`;
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        wrapper.style.cursor = 'grab';
        isPaused = isMouseOver;
      }
    });

    wrapper.style.cursor = 'grab';
  }

  function cycle() {
    if (!isPaused && !isDragging) {
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
