const themes = {
  dark: {
    name: 'Dark',
    colors: {
      '--bg-primary': '#000000',
      '--bg-secondary': '#0a0a0a',
      '--bg-tertiary': '#151515',
      '--bg-content': '#000000',
      '--bg-header': '#0a0a0a',
      '--bg-active': '#000000',
      '--bg-hover': '#1a1a1a',
      '--bg-card': '#0f0f0f',
      '--bg-card-hover': '#191919',
      '--bg-input': '#0a0a0a',
      '--bg-dropdown': '#050505',
      '--bg-gradient': 'none',
      '--text-primary': '#ffffff',
      '--text-secondary': '#cccccc',
      '--text-tertiary': '#888888',
      '--text-muted': 'rgba(255, 255, 255, 0.4)',
      '--border-color': 'rgba(255, 255, 255, 0.06)',
      '--border-hover': 'rgba(255, 255, 255, 0.12)',
      '--shadow': 'rgba(0, 0, 0, 0.5)',
      '--accent': '#4c8bf5',
      '--accent-hover': '#7aafff',
      '--success': '#4CAF50',
      '--logo-filter': 'brightness(0) invert(1)',
      '--bg-grid-line': 'rgba(255, 255, 255, 0.08)',
      '--aurora-gradient': 'linear-gradient(90deg, #00ff87 0%, #60efff 25%, #b967ff 50%, #ff6b9d 75%, #00ff87 100%)',
      '--aurora-glow': '0 0 10px rgba(0, 255, 135, 0.8), 0 0 20px rgba(96, 239, 255, 0.6), 0 0 30px rgba(185, 103, 255, 0.5), 0 0 40px rgba(185, 103, 255, 0.3)'
    }
  },
  blue: {
    name: 'Blue',
    colors: {
      '--bg-primary': '#0d1b2a',
      '--bg-secondary': '#1b263b',
      '--bg-tertiary': '#415a77',
      '--bg-content': '#0a1625',
      '--bg-header': '#1b263b',
      '--bg-active': '#0d1b2a',
      '--bg-hover': '#415a77',
      '--bg-card': 'rgba(27, 38, 59, 0.6)',
      '--bg-card-hover': 'rgba(65, 90, 119, 0.7)',
      '--bg-input': '#1b263b',
      '--bg-dropdown': '#0d1b2a',
      '--bg-gradient': 'linear-gradient(135deg, rgba(27, 38, 59, 0.4) 0%, rgba(10, 22, 37, 0.6) 100%)',
      '--text-primary': '#e0e1dd',
      '--text-secondary': '#c9c9c9',
      '--text-tertiary': '#a0a0a0',
      '--text-muted': 'rgba(224, 225, 221, 0.6)',
      '--border-color': 'rgba(224, 225, 221, 0.15)',
      '--border-hover': 'rgba(224, 225, 221, 0.25)',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--accent': '#4a90e2',
      '--accent-hover': '#6ba3f0',
      '--success': '#4CAF50',
      '--logo-filter': 'brightness(0) invert(1)',
      '--bg-grid-line': 'rgba(255, 255, 255, 0.05)',
      '--aurora-gradient': 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 25%, #7dd3fc 50%, #38bdf8 75%, #0ea5e9 100%)',
      '--aurora-glow': '0 0 10px rgba(14, 165, 233, 0.8), 0 0 20px rgba(56, 189, 248, 0.6), 0 0 30px rgba(125, 211, 252, 0.5), 0 0 40px rgba(56, 189, 248, 0.3)'
    }
  },
  purple: {
    name: 'Purple',
    colors: {
      '--bg-primary': '#1a0d2e',
      '--bg-secondary': '#2d1b3d',
      '--bg-tertiary': '#4a2c5a',
      '--bg-content': '#140a1f',
      '--bg-header': '#2d1b3d',
      '--bg-active': '#1a0d2e',
      '--bg-hover': '#4a2c5a',
      '--bg-card': 'rgba(45, 27, 61, 0.6)',
      '--bg-card-hover': 'rgba(74, 44, 90, 0.7)',
      '--bg-input': '#2d1b3d',
      '--bg-dropdown': '#1a0d2e',
      '--bg-gradient': 'linear-gradient(135deg, rgba(45, 27, 61, 0.4) 0%, rgba(20, 10, 31, 0.6) 100%)',
      '--text-primary': '#e8d5ff',
      '--text-secondary': '#d4b3ff',
      '--text-tertiary': '#b380ff',
      '--text-muted': 'rgba(232, 213, 255, 0.6)',
      '--border-color': 'rgba(232, 213, 255, 0.15)',
      '--border-hover': 'rgba(232, 213, 255, 0.25)',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--accent': '#9d4edd',
      '--accent-hover': '#b77ee8',
      '--success': '#4CAF50',
      '--logo-filter': 'brightness(0) invert(1)',
      '--bg-grid-line': 'rgba(255, 255, 255, 0.05)',
      '--aurora-gradient': 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 25%, #c4b5fd 50%, #a78bfa 75%, #8b5cf6 100%)',
      '--aurora-glow': '0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(167, 139, 250, 0.6), 0 0 30px rgba(196, 181, 253, 0.5), 0 0 40px rgba(167, 139, 250, 0.3)'
    }
  },
  green: {
    name: 'Green',
    colors: {
      '--bg-primary': '#0d2e1a',
      '--bg-secondary': '#1b3d2d',
      '--bg-tertiary': '#2d5a3d',
      '--bg-content': '#0a1f14',
      '--bg-header': '#1b3d2d',
      '--bg-active': '#0d2e1a',
      '--bg-hover': '#2d5a3d',
      '--bg-card': 'rgba(27, 61, 45, 0.6)',
      '--bg-card-hover': 'rgba(45, 90, 61, 0.7)',
      '--bg-input': '#1b3d2d',
      '--bg-dropdown': '#0d2e1a',
      '--bg-gradient': 'linear-gradient(135deg, rgba(27, 61, 45, 0.4) 0%, rgba(10, 31, 20, 0.6) 100%)',
      '--text-primary': '#d4ffd5',
      '--text-secondary': '#b3ffb5',
      '--text-tertiary': '#80ff85',
      '--text-muted': 'rgba(212, 255, 213, 0.6)',
      '--border-color': 'rgba(212, 255, 213, 0.15)',
      '--border-hover': 'rgba(212, 255, 213, 0.25)',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--accent': '#4caf50',
      '--accent-hover': '#6bc76f',
      '--success': '#66bb6a',
      '--logo-filter': 'brightness(0) invert(1)',
      '--bg-grid-line': 'rgba(255, 255, 255, 0.05)',
      '--aurora-gradient': 'linear-gradient(90deg, #22c55e 0%, #4ade80 25%, #86efac 50%, #4ade80 75%, #22c55e 100%)',
      '--aurora-glow': '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(74, 222, 128, 0.6), 0 0 30px rgba(134, 239, 172, 0.5), 0 0 40px rgba(74, 222, 128, 0.3)'
    }
  },
  orange: {
    name: 'Orange',
    colors: {
      '--bg-primary': '#2e1a0d',
      '--bg-secondary': '#3d2d1b',
      '--bg-tertiary': '#5a4a2c',
      '--bg-content': '#1f140a',
      '--bg-header': '#3d2d1b',
      '--bg-active': '#2e1a0d',
      '--bg-hover': '#5a4a2c',
      '--bg-card': 'rgba(61, 45, 27, 0.6)',
      '--bg-card-hover': 'rgba(90, 74, 44, 0.7)',
      '--bg-input': '#3d2d1b',
      '--bg-dropdown': '#2e1a0d',
      '--bg-gradient': 'linear-gradient(135deg, rgba(61, 45, 27, 0.4) 0%, rgba(31, 20, 10, 0.6) 100%)',
      '--text-primary': '#ffd5c4',
      '--text-secondary': '#ffb3a0',
      '--text-tertiary': '#ff8066',
      '--text-muted': 'rgba(255, 213, 196, 0.6)',
      '--border-color': 'rgba(255, 213, 196, 0.15)',
      '--border-hover': 'rgba(255, 213, 196, 0.25)',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--accent': '#ff6b35',
      '--accent-hover': '#ff8c5a',
      '--success': '#4CAF50',
      '--logo-filter': 'brightness(0) invert(1)',
      '--bg-grid-line': 'rgba(255, 255, 255, 0.05)',
      '--aurora-gradient': 'linear-gradient(90deg, #f97316 0%, #fb923c 25%, #fdba74 50%, #fb923c 75%, #f97316 100%)',
      '--aurora-glow': '0 0 10px rgba(249, 115, 22, 0.8), 0 0 20px rgba(251, 146, 60, 0.6), 0 0 30px rgba(253, 186, 116, 0.5), 0 0 40px rgba(251, 146, 60, 0.3)'
    }
  },
  pink: {
    name: 'Pink',
    colors: {
      '--bg-primary': '#2e0d1a',
      '--bg-secondary': '#3d1b2d',
      '--bg-tertiary': '#5a2c4a',
      '--bg-content': '#1f0a14',
      '--bg-header': '#3d1b2d',
      '--bg-active': '#2e0d1a',
      '--bg-hover': '#5a2c4a',
      '--bg-card': 'rgba(61, 27, 45, 0.6)',
      '--bg-card-hover': 'rgba(90, 44, 74, 0.7)',
      '--bg-input': '#3d1b2d',
      '--bg-dropdown': '#2e0d1a',
      '--bg-gradient': 'linear-gradient(135deg, rgba(61, 27, 45, 0.4) 0%, rgba(31, 10, 20, 0.6) 100%)',
      '--text-primary': '#ffd5e8',
      '--text-secondary': '#ffb3d4',
      '--text-tertiary': '#ff80b8',
      '--text-muted': 'rgba(255, 213, 232, 0.6)',
      '--border-color': 'rgba(255, 213, 232, 0.15)',
      '--border-hover': 'rgba(255, 213, 232, 0.25)',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--accent': '#e91e63',
      '--accent-hover': '#f06292',
      '--success': '#4CAF50',
      '--logo-filter': 'brightness(0) invert(1)',
      '--bg-grid-line': 'rgba(255, 255, 255, 0.05)',
      '--aurora-gradient': 'linear-gradient(90deg, #ec4899 0%, #f472b6 25%, #f9a8d4 50%, #f472b6 75%, #ec4899 100%)',
      '--aurora-glow': '0 0 10px rgba(236, 72, 153, 0.8), 0 0 20px rgba(244, 114, 182, 0.6), 0 0 30px rgba(249, 168, 212, 0.5), 0 0 40px rgba(244, 114, 182, 0.3)'
    }
  }
};

function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) {
    console.warn(`Theme "${themeName}" not found, using default dark theme`);
    themeName = 'dark';
  }

  const root = document.documentElement;
  const themeColors = themes[themeName].colors;

  Object.entries(themeColors).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  const logoFilter = themeColors['--logo-filter'];
  const logos = document.querySelectorAll('.main-logo, .tab-logo');
  logos.forEach(logo => {
    if (logo) {
      if (logo.classList.contains('main-logo')) {
        logo.style.filter = `${logoFilter} drop-shadow(0 8px 24px var(--shadow))`;
      } else {
        logo.style.filter = logoFilter;
      }
    }
  });

  localStorage.setItem('glint_theme', themeName);

  window.dispatchEvent(new CustomEvent('glint:theme-changed', { detail: { theme: themeName } }));
}

function updateLogosForTheme() {
  const currentTheme = getCurrentTheme();
  const themeColors = themes[currentTheme].colors;
  const logoFilter = themeColors['--logo-filter'];
  
  const logos = document.querySelectorAll('.main-logo, .tab-logo');
  logos.forEach(logo => {
    if (logo) {
      if (logo.classList.contains('main-logo')) {
        logo.style.filter = `${logoFilter} drop-shadow(0 8px 24px var(--shadow))`;
      } else {
        logo.style.filter = logoFilter;
      }
    }
  });
}

function getCurrentTheme() {
  return localStorage.getItem('glint_theme') || 'dark';
}

function initTheme() {
  const savedTheme = getCurrentTheme();
  applyTheme(savedTheme);
}

window.themes = themes;
window.applyTheme = applyTheme;
window.getCurrentTheme = getCurrentTheme;
window.updateLogosForTheme = updateLogosForTheme;

window.addEventListener('glint:theme-changed', () => {
  updateLogosForTheme();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

