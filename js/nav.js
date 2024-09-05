function toggleMenu() {
  var menu = document.getElementById('operator-menu');
  menu.classList.toggle('active');
}

window.toggleMenu = toggleMenu;

// Close the menu when clicking outside
document.addEventListener('click', function(event) {
  var isClickInside = document.querySelector('#operator-menu-button').contains(event.target) ||
                      document.querySelector('#operator-menu').contains(event.target);
  if (!isClickInside) {
    document.getElementById('operator-menu').classList.remove('active');
  }
});
