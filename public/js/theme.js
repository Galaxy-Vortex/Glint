function createTheme(name, primary, accent, accentHover) {
  const r = parseInt(primary.slice(1, 3), 16);
  const g = parseInt(primary.slice(3, 5), 16);
  const b = parseInt(primary.slice(5, 7), 16);
  
  const lighten = (hex, amt) => {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, (num >> 16) + amt);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const b = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  };
  
  return {
    name,
    colors: {
      '--bg-primary': primary,
      '--bg-secondary': lighten(primary, 15),
      '--bg-tertiary': lighten(primary, 35),
      '--bg-content': primary,
      '--bg-header': lighten(primary, 15),
      '--bg-active': primary,
      '--bg-hover': lighten(primary, 30),
      '--bg-card': `rgba(${r + 15}, ${g + 15}, ${b + 15}, 0.6)`,
      '--bg-card-hover': `rgba(${r + 30}, ${g + 30}, ${b + 30}, 0.7)`,
      '--bg-input': lighten(primary, 15),
      '--bg-dropdown': primary,
      '--bg-gradient': `linear-gradient(135deg, rgba(${r + 20}, ${g + 20}, ${b + 20}, 0.4) 0%, rgba(${r}, ${g}, ${b}, 0.6) 100%)`,
      '--text-primary': '#ffffff',
      '--text-secondary': '#cccccc',
      '--text-tertiary': '#999999',
      '--text-muted': 'rgba(255, 255, 255, 0.5)',
      '--border-color': 'rgba(255, 255, 255, 0.1)',
      '--border-hover': 'rgba(255, 255, 255, 0.2)',
      '--shadow': 'rgba(0, 0, 0, 0.4)',
      '--accent': accent,
      '--accent-hover': accentHover,
      '--success': '#4CAF50',
      '--logo-filter': 'brightness(0) invert(1)',
      '--bg-grid-line': 'rgba(255, 255, 255, 0.06)',
      '--aurora-gradient': `linear-gradient(90deg, ${accent} 0%, ${accentHover} 50%, ${accent} 100%)`,
      '--aurora-glow': `0 0 10px ${accent}cc, 0 0 20px ${accent}99, 0 0 30px ${accent}66`
    }
  };
}

const themes = {
  dark: createTheme('Dark', '#0a0a0a', '#ffffff', '#e0e0e0'),
  midnight: createTheme('Midnight', '#0f0f1a', '#6366f1', '#818cf8'),
  charcoal: createTheme('Charcoal', '#1a1a1a', '#a1a1aa', '#d4d4d8'),
  slate: createTheme('Slate', '#1e293b', '#64748b', '#94a3b8'),
  graphite: createTheme('Graphite', '#27272a', '#71717a', '#a1a1aa'),
  onyx: createTheme('Onyx', '#18181b', '#52525b', '#71717a'),
  
  pink: createTheme('Pink', '#2e0d1a', '#ec4899', '#f472b6'),
  rose: createTheme('Rose', '#2a0f1c', '#f43f5e', '#fb7185'),
  magenta: createTheme('Magenta', '#2d0a2e', '#d946ef', '#e879f9'),
  fuchsia: createTheme('Fuchsia', '#2e0d29', '#e879f9', '#f0abfc'),
  blush: createTheme('Blush', '#2b1215', '#fb7185', '#fda4af'),
  coral: createTheme('Coral', '#2c1410', '#fb923c', '#fdba74'),
  
  gold: createTheme('Gold', '#2a2008', '#eab308', '#facc15'),
  amber: createTheme('Amber', '#2c1d08', '#f59e0b', '#fbbf24'),
  yellow: createTheme('Yellow', '#2a2506', '#facc15', '#fde047'),
  honey: createTheme('Honey', '#2b2109', '#fbbf24', '#fcd34d'),
  mustard: createTheme('Mustard', '#292006', '#ca8a04', '#eab308'),
  orange: createTheme('Orange', '#2e1a0d', '#ff6b35', '#ff8c5a'),
  
  green: createTheme('Green', '#0d2e1a', '#22c55e', '#4ade80'),
  emerald: createTheme('Emerald', '#0a2920', '#10b981', '#34d399'),
  mint: createTheme('Mint', '#0d2a22', '#34d399', '#6ee7b7'),
  lime: createTheme('Lime', '#152e0d', '#84cc16', '#a3e635'),
  forest: createTheme('Forest', '#0c2912', '#16a34a', '#22c55e'),
  sage: createTheme('Sage', '#1a2e1d', '#4ade80', '#86efac'),
  
  red: createTheme('Red', '#2e0d0d', '#ef4444', '#f87171'),
  crimson: createTheme('Crimson', '#2a0a0f', '#dc2626', '#ef4444'),
  ruby: createTheme('Ruby', '#2c0d12', '#e11d48', '#f43f5e'),
  maroon: createTheme('Maroon', '#250c0c', '#b91c1c', '#dc2626'),
  cherry: createTheme('Cherry', '#2b0f14', '#f87171', '#fca5a5'),
  wine: createTheme('Wine', '#2a0d14', '#be123c', '#e11d48'),
  
  blue: createTheme('Blue', '#0d1b2e', '#3b82f6', '#60a5fa'),
  ocean: createTheme('Ocean', '#0a1f2e', '#0ea5e9', '#38bdf8'),
  teal: createTheme('Teal', '#0d2929', '#14b8a6', '#2dd4bf'),
  cyan: createTheme('Cyan', '#0c2a2e', '#22d3d1', '#5eead4'),
  navy: createTheme('Navy', '#0d1424', '#6366f1', '#818cf8'),
  purple: createTheme('Purple', '#1a0d2e', '#a855f7', '#c084fc'),
  lavender: createTheme('Lavender', '#1e1528', '#a78bfa', '#c4b5fd'),
  violet: createTheme('Violet', '#1d0f2e', '#8b5cf6', '#a78bfa')
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

