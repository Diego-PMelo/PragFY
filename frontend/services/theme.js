// Aplicado imediatamente no <head> para evitar flash de tema errado
(function () {
  var t = localStorage.getItem('pragfy_theme') || 'dark';
  document.documentElement.setAttribute('data-bs-theme', t);
  if (t === 'light') document.documentElement.classList.add('light-mode');
})();
