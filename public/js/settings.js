document.addEventListener('DOMContentLoaded', async () => {
  const menuBtn = document.querySelector('.menu-btn');
  const optionsDropdown = document.getElementById('options-dropdown');

  let isDropdownOpen = false;
  let settings = {};

  // Load settings from /js/settings.json
  async function loadSettingsJSON() {
    try {
      const response = await fetch('/js/settings.json');
      settings = await response.json();
    } catch (err) {
      console.error('Failed to load /js/settings.json', err);
      settings = { sections: {} };
    }
  }

  // Build dropdown dynamically from JSON
  function buildDropdown() {
    optionsDropdown.innerHTML = ''; // clear previous

    Object.entries(settings.sections || {}).forEach(([sectionKey, sectionData]) => {
      const sectionHeader = document.createElement('div');
      sectionHeader.classList.add('dropdown-section-header');
      sectionHeader.innerHTML = `<i class="${sectionData.icon}"></i><span>${sectionData.title}</span>`;

      const sectionWrapper = document.createElement('div');
      sectionWrapper.classList.add('dropdown-section');

      const optionsContainer = document.createElement('div');
      optionsContainer.classList.add(`${sectionKey}-options`);

      // Build options dynamically
      Object.entries(sectionData.options).forEach(([optionKey, optionValue]) => {
        const optionDiv = document.createElement('div');
				optionDiv.classList.add(
					'dropdown-item',
					`${sectionKey.replace(/-.*/, '')}-option`
			);
        optionDiv.dataset.option = optionKey;

        const input = document.createElement('input');
        input.type = 'radio';
        input.id = `dropdown-${optionKey}`;
        input.name = `dropdown-${sectionKey}`;
        input.value = optionKey;

        const label = document.createElement('label');
        label.setAttribute('for', `dropdown-${optionKey}`);
        label.textContent =
          typeof optionValue === 'string' && optionValue.startsWith('http')
            ? optionKey.charAt(0).toUpperCase() + optionKey.slice(1) // prettify name for URLs
            : optionValue;

        optionDiv.appendChild(input);
        optionDiv.appendChild(label);
        optionsContainer.appendChild(optionDiv);

        // Listen for changes
        input.addEventListener('change', () => {
          localStorage.setItem(`glint_${sectionKey}`, optionKey);
          updateGlobalSettings();
        });
      });

      sectionWrapper.appendChild(optionsContainer);
      optionsDropdown.appendChild(sectionHeader);
      optionsDropdown.appendChild(sectionWrapper);
    });
  }

  // Load saved user settings
  function loadUserSettings() {
    Object.keys(settings.sections || {}).forEach(sectionKey => {
      const saved = localStorage.getItem(`glint_${sectionKey}`);
      if (saved) {
        const radio = document.querySelector(`input[name="dropdown-${sectionKey}"][value="${saved}"]`);
        if (radio) radio.checked = true;
      }
    });
    updateGlobalSettings();
  }

  function updateGlobalSettings() {
    window.glintSettings = window.glintSettings || {};
    window.glintSettings.sections = {};

    Object.entries(settings.sections || {}).forEach(([sectionKey, sectionData]) => {
      window.glintSettings.sections[sectionKey] = {
        selected: localStorage.getItem(`glint_${sectionKey}`) || null,
        options: sectionData.options
      };
    });

    window.dispatchEvent(new CustomEvent('glint:settings-updated'));
  }

  // Dropdown toggling
  function toggleDropdown(event) {
    event.stopPropagation();
    isDropdownOpen ? closeDropdown() : openDropdown();
  }

  function openDropdown() {
    optionsDropdown.style.display = 'block';
    isDropdownOpen = true;
  }

  function closeDropdown() {
    optionsDropdown.style.display = 'none';
    isDropdownOpen = false;
  }

  function handleOutsideClick(event) {
    if (isDropdownOpen && !optionsDropdown.contains(event.target) && !menuBtn.contains(event.target)) {
      closeDropdown();
    }
  }

  // --- Init ---
  await loadSettingsJSON();
  buildDropdown();
  loadUserSettings();

  menuBtn.addEventListener('click', toggleDropdown);
  document.addEventListener('click', handleOutsideClick);
});

