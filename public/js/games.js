document.addEventListener('DOMContentLoaded', () => {
  const gamesPage = document.getElementById('games-page');
  const newTabPage = document.querySelector('.new-tab-page');
  const openGamesBtn = document.getElementById('open-games-btn');
  const gamesBackBtn = document.getElementById('games-back-btn');
  const gamesGrid = document.getElementById('games-grid');
  const gamesSearchInput = document.getElementById('games-search-input');
  const gamesEmpty = document.getElementById('games-empty');

  const games = [
   
  ];

  function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.dataset.name = game.name.toLowerCase();
    card.dataset.category = game.category.toLowerCase();

    card.innerHTML = `
      <div class="game-image-container">
        <div class="game-placeholder">
          <i class="fas ${game.icon || 'fa-gamepad'}"></i>
        </div>
        <div class="game-play-overlay">
          <div class="game-play-btn">
            <i class="fas fa-play"></i>
          </div>
        </div>
      </div>
      <div class="game-info">
        <h3 class="game-name">${game.name}</h3>
        <p class="game-category">
          <i class="fas fa-tag"></i>
          ${game.category}
        </p>
      </div>
    `;

    card.addEventListener('click', () => {
      playGame(game);
    });

    return card;
  }

  function playGame(game) {
    window.dispatchEvent(new CustomEvent('glint:search', {
      detail: { searchTerm: game.url, searchUrl: game.url }
    }));
    
    closeGamesPage();
  }

  function renderGames(filter = '') {
    gamesGrid.innerHTML = '';
    const filterLower = filter.toLowerCase();
    
    const filteredGames = games.filter(game => 
      game.name.toLowerCase().includes(filterLower) ||
      game.category.toLowerCase().includes(filterLower)
    );

    if (filteredGames.length === 0) {
      gamesEmpty.classList.add('active');
      gamesGrid.style.display = 'none';
    } else {
      gamesEmpty.classList.remove('active');
      gamesGrid.style.display = 'grid';
      
      filteredGames.forEach(game => {
        gamesGrid.appendChild(createGameCard(game));
      });
    }
  }

  function openGamesPage() {
    newTabPage.style.display = 'none';
    gamesPage.classList.add('active');
    gamesSearchInput.value = '';
    renderGames();
    gamesSearchInput.focus();
  }

  function closeGamesPage() {
    gamesPage.classList.remove('active');
    newTabPage.style.display = 'flex';
  }

  if (openGamesBtn) {
    openGamesBtn.addEventListener('click', openGamesPage);
  }

  if (gamesBackBtn) {
    gamesBackBtn.addEventListener('click', closeGamesPage);
  }

  if (gamesSearchInput) {
    gamesSearchInput.addEventListener('input', (e) => {
      renderGames(e.target.value);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gamesPage.classList.contains('active')) {
      closeGamesPage();
    }
  });

  window.openGamesPage = openGamesPage;
  window.closeGamesPage = closeGamesPage;
});

