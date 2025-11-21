const themes = {
  dark: {
    name: 'Dark',
    colors: {
      '--bg-primary': '#1a1a1a',
      '--bg-secondary': '#2c2c2c',
      '--bg-tertiary': '#3a3a3a',
      '--bg-content': '#121212',
      '--bg-header': '#2c2c2c',
      '--bg-active': '#1a1a1a',
      '--bg-hover': '#3a3a3a',
      '--bg-card': 'rgba(30, 30, 30, 0.5)',
      '--bg-card-hover': 'rgba(40, 40, 40, 0.6)',
      '--bg-input': '#2c2c2c',
      '--bg-dropdown': '#1a1a1a',
      '--bg-gradient': 'linear-gradient(135deg, rgba(30, 30, 30, 0.3) 0%, rgba(10, 10, 10, 0.5) 100%)',
      '--text-primary': '#ffffff',
      '--text-secondary': '#e0e0e0',
      '--text-tertiary': '#a0a0a0',
      '--text-muted': 'rgba(255, 255, 255, 0.5)',
      '--border-color': 'rgba(255, 255, 255, 0.1)',
      '--border-hover': 'rgba(255, 255, 255, 0.2)',
      '--shadow': 'rgba(0, 0, 0, 0.25)',
      '--accent': '#4c8bf5',
      '--accent-hover': '#7aafff',
      '--success': '#4CAF50',
      '--logo-filter': 'brightness(0) invert(1)'
    }
  },
  light: {
    name: 'Light',
    colors: {
      '--bg-primary': '#f8f9fa',
      '--bg-secondary': '#e9ecef',
      '--bg-tertiary': '#dee2e6',
      '--bg-content': '#f1f3f5',
      '--bg-header': '#e9ecef',
      '--bg-active': '#ffffff',
      '--bg-hover': '#dee2e6',
      '--bg-card': 'rgba(255, 255, 255, 0.95)',
      '--bg-card-hover': 'rgba(248, 249, 250, 0.98)',
      '--bg-input': '#ffffff',
      '--bg-dropdown': '#ffffff',
      '--bg-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(241, 243, 245, 0.6) 100%)',
      '--text-primary': '#212529',
      '--text-secondary': '#495057',
      '--text-tertiary': '#6c757d',
      '--text-muted': 'rgba(33, 37, 41, 0.6)',
      '--border-color': 'rgba(0, 0, 0, 0.08)',
      '--border-hover': 'rgba(0, 0, 0, 0.15)',
      '--shadow': 'rgba(0, 0, 0, 0.08)',
      '--accent': '#4c8bf5',
      '--accent-hover': '#357abd',
      '--success': '#4CAF50',
      '--logo-filter': 'none'
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
      '--logo-filter': 'brightness(0) invert(1)'
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
      '--logo-filter': 'brightness(0) invert(1)'
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
      '--logo-filter': 'brightness(0) invert(1)'
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
      '--logo-filter': 'brightness(0) invert(1)'
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
      '--logo-filter': 'brightness(0) invert(1)'
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

