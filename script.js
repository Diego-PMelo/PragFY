const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const body = document.body;

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        if (savedTheme === 'light') {
            body.classList.add('light-mode');
        }
    } else if (!prefersDark) {
        body.classList.add('light-mode');
    }
}

// Alternar tema
themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    
    // Salvar preferência
    if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
});

// Funcionalidade de Mostrar/Ocultar Senha
const passwordToggle = document.getElementById('passwordToggle');
const passwordInput = document.querySelector('.password-input');

passwordToggle.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
});

// Inicializar tema ao carregar a página
document.addEventListener('DOMContentLoaded', initializeTheme);
