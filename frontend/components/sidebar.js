// Sidebar component — plain React.createElement (sem JSX) para ser reutilizado em todas as páginas
function Sidebar({ active }) {
  const e = React.createElement;
  const { useState, useEffect } = React;
  const user = storage.getUser();

  const [open,  setOpen]  = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('pragfy_theme') || 'dark');

  const navItems = [
    { href: 'dashboard.html',    icon: 'bi-grid-fill',           label: 'Dashboard' },
    { href: 'transactions.html', icon: 'bi-arrow-left-right',    label: 'Transações' },
    { href: 'categories.html',   icon: 'bi-tag-fill',            label: 'Categorias' },
    { href: 'profile.html',      icon: 'bi-bar-chart-line-fill', label: 'Perfil Investidor' },
  ];

  function logout() {
    storage.clearUser();
    window.location.href = 'index.html';
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('pragfy_theme', next);
    document.documentElement.setAttribute('data-bs-theme', next);
    if (next === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }

  function closeSidebar() { setOpen(false); }

  // Topbar visível apenas no mobile
  const mobileTopbar = e('div', { className: 'mobile-topbar' },
    e('button', { className: 'hamburger', onClick: () => setOpen(o => !o), 'aria-label': 'Menu' },
      e('i', { className: open ? 'bi bi-x-lg' : 'bi bi-list' })
    ),
    e('div', { className: 'mobile-logo' },
      e('img', { src: 'assets/PragFY_Logo.svg', alt: 'PragFY', height: 28 }),
      e('span', null, 'ragFY')
    ),
    e('button', { className: 'btn-theme-toggle', onClick: toggleTheme, 'aria-label': 'Alternar tema' },
      e('i', { className: theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill' })
    )
  );

  // Overlay para fechar o sidebar no mobile
  const overlay = open
    ? e('div', { className: 'sidebar-overlay', onClick: closeSidebar })
    : null;

  const sidebar = e('aside', { className: 'sidebar' + (open ? ' sidebar-open' : '') },
    e('div', { className: 'sidebar-logo' },
      e('img', { src: 'assets/PragFY_Logo.svg', alt: 'PragFY' }),
      e('span', null, 'ragFY')
    ),
    e('nav', { className: 'sidebar-nav' },
      navItems.map(item =>
        e('a', {
          key: item.href,
          href: item.href,
          className: 'sidebar-link' + (active === item.href ? ' active' : ''),
          onClick: closeSidebar,
        },
          e('i', { className: 'bi ' + item.icon }),
          ' ' + item.label
        )
      )
    ),
    e('div', { className: 'sidebar-footer' },
      e('button', { className: 'btn-theme-toggle sidebar-theme-btn', onClick: toggleTheme, 'aria-label': 'Alternar tema' },
        e('i', { className: theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill' }),
        ' ' + (theme === 'dark' ? 'Modo claro' : 'Modo escuro')
      ),
      e('div', { className: 'sidebar-user' },
        e('i', { className: 'bi bi-person-circle' }),
        e('span', null, ' ' + (user ? user.name : ''))
      ),
      e('button', { className: 'btn-logout', onClick: logout },
        e('i', { className: 'bi bi-box-arrow-left' }),
        ' Sair'
      )
    )
  );

  return e(React.Fragment, null, mobileTopbar, overlay, sidebar);
}
