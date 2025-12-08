(function() {
  const ONBOARDING_KEY = 'glint_onboarding_complete';
  
  if (localStorage.getItem(ONBOARDING_KEY)) return;

  const themeColors = {
    dark: { primary: '#0a0a0a', accent: '#ffffff', name: 'Dark' },
    midnight: { primary: '#0f0f1a', accent: '#6366f1', name: 'Midnight' },
    ocean: { primary: '#0a1f2e', accent: '#0ea5e9', name: 'Ocean' },
    forest: { primary: '#0c2912', accent: '#22c55e', name: 'Forest' },
    sunset: { primary: '#2e1a0d', accent: '#ff6b35', name: 'Sunset' },
    rose: { primary: '#2a0f1c', accent: '#f43f5e', name: 'Rose' },
    lavender: { primary: '#1e1528', accent: '#a78bfa', name: 'Lavender' },
    gold: { primary: '#2a2008', accent: '#eab308', name: 'Gold' },
    cherry: { primary: '#2b0f14', accent: '#f87171', name: 'Cherry' },
    mint: { primary: '#0d2a22', accent: '#34d399', name: 'Mint' },
    violet: { primary: '#1d0f2e', accent: '#8b5cf6', name: 'Violet' },
    coral: { primary: '#2c1410', accent: '#fb923c', name: 'Coral' }
  };

  const themeKeys = Object.keys(themeColors);
  let currentIndex = 0;
  let selectedTheme = null;

  function createOnboarding() {
    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.innerHTML = `
      <div class="onboarding-bg"></div>
      <div class="onboarding-particles"></div>
      
      <div class="onboarding-container">
        <div class="onboarding-header">
          <img src="images/logo.png" alt="Glint" class="onboarding-logo">
          <h1 class="onboarding-title">Welcome to <span class="title-gradient">Glint</span></h1>
          <p class="onboarding-subtitle">Select your vibe</p>
        </div>
        
        <div class="onboarding-carousel">
          <button class="carousel-arrow left" aria-label="Previous">
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="carousel-track">
            ${themeKeys.map((key, i) => {
              const theme = themeColors[key];
              return `
                <div class="theme-card ${i === 0 ? 'active' : ''}" data-theme="${key}" data-index="${i}">
                  <div class="card-glow" style="background: ${theme.accent}"></div>
                  <div class="card-inner" style="background: ${theme.primary}; border-color: ${theme.accent}"></div>
                </div>
              `;
            }).join('')}
          </div>
          
          <button class="carousel-arrow right" aria-label="Next">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div class="carousel-dots">
          ${themeKeys.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
        </div>
        
        <div class="onboarding-actions">
          <button class="onboarding-skip">Skip for now</button>
          <button class="onboarding-continue">
            <span>Let's Go</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const particlesContainer = overlay.querySelector('.onboarding-particles');
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 5 + 's';
      particle.style.animationDuration = (5 + Math.random() * 10) + 's';
      particlesContainer.appendChild(particle);
    }

    const bg = overlay.querySelector('.onboarding-bg');
    const cards = overlay.querySelectorAll('.theme-card');
    const dots = overlay.querySelectorAll('.carousel-dots .dot');
    const leftArrow = overlay.querySelector('.carousel-arrow.left');
    const rightArrow = overlay.querySelector('.carousel-arrow.right');
    const continueBtn = overlay.querySelector('.onboarding-continue');
    const skipBtn = overlay.querySelector('.onboarding-skip');
    const titleGradient = overlay.querySelector('.title-gradient');

    function updateCarousel(index, animate = true) {
      currentIndex = index;
      const theme = themeColors[themeKeys[index]];
      selectedTheme = themeKeys[index];
      
      cards.forEach((card, i) => {
        card.classList.remove('active', 'prev', 'next');
        if (i === index) card.classList.add('active');
        else if (i === index - 1 || (index === 0 && i === cards.length - 1)) card.classList.add('prev');
        else if (i === index + 1 || (index === cards.length - 1 && i === 0)) card.classList.add('next');
      });
      
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
      
      bg.style.background = `radial-gradient(ellipse at 50% 0%, ${theme.accent}15 0%, transparent 50%), 
                             radial-gradient(ellipse at 80% 100%, ${theme.accent}10 0%, transparent 40%),
                             ${theme.primary}`;
      
      titleGradient.style.background = `linear-gradient(135deg, ${theme.accent}, ${theme.accent}aa)`;
      titleGradient.style.webkitBackgroundClip = 'text';
      titleGradient.style.webkitTextFillColor = 'transparent';
      
      continueBtn.style.background = theme.accent;
      continueBtn.style.color = isLightColor(theme.accent) ? '#000' : '#fff';
      
      if (window.applyTheme) {
        window.applyTheme(selectedTheme);
      }
    }

    function isLightColor(color) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 > 155;
    }

    function navigate(direction) {
      let newIndex = currentIndex + direction;
      if (newIndex < 0) newIndex = themeKeys.length - 1;
      if (newIndex >= themeKeys.length) newIndex = 0;
      updateCarousel(newIndex);
    }

    leftArrow.addEventListener('click', () => navigate(-1));
    rightArrow.addEventListener('click', () => navigate(1));
    
    cards.forEach(card => {
      card.addEventListener('click', () => {
        updateCarousel(parseInt(card.dataset.index));
      });
    });
    
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        updateCarousel(parseInt(dot.dataset.index));
      });
    });

    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'Enter' && selectedTheme) {
        finishOnboarding();
        document.removeEventListener('keydown', handler);
      }
    });

    function finishOnboarding() {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      overlay.classList.add('closing');
      setTimeout(() => overlay.remove(), 500);
    }

    continueBtn.addEventListener('click', finishOnboarding);
    skipBtn.addEventListener('click', () => {
      if (window.applyTheme) window.applyTheme('dark');
      finishOnboarding();
    });

    updateCarousel(0);
    
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createOnboarding);
  } else {
    createOnboarding();
  }
})();

