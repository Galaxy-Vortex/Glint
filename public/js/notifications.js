document.addEventListener('DOMContentLoaded', () => {
  const notificationsBtn = document.querySelector('.notifications-btn');
  const notificationsPanel = document.getElementById('notifications-panel');
  const notificationsClose = document.querySelector('.notifications-close');

  let overlay = document.querySelector('.notifications-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'notifications-overlay';
    document.body.appendChild(overlay);
  }

  function openNotifications() {
    notificationsPanel.classList.add('active');
    overlay.classList.add('active');
  }

  function closeNotifications() {
    notificationsPanel.classList.remove('active');
    overlay.classList.remove('active');
  }

  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openNotifications();
    });
  }

  if (notificationsClose) {
    notificationsClose.addEventListener('click', closeNotifications);
  }

  if (overlay) {
    overlay.addEventListener('click', closeNotifications);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && notificationsPanel.classList.contains('active')) {
      closeNotifications();
    }
  });
});
