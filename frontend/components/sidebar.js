// Sidebar component — plain React.createElement (sem JSX) para ser reutilizado em todas as páginas
function Sidebar({ active }) {
  const e = React.createElement;
  const user = storage.getUser();

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

  return e('aside', { className: 'sidebar' },
    e('div', { className: 'sidebar-logo' },
      e('img', { src: 'assets/PragFY_Logo.svg', alt: 'PragFY' }),
      e('span', null, 'ragFY')
    ),
    e('nav', { className: 'sidebar-nav' },
      navItems.map(item =>
        e('a', { key: item.href, href: item.href,
                 className: 'sidebar-link' + (active === item.href ? ' active' : '') },
          e('i', { className: 'bi ' + item.icon }),
          ' ' + item.label
        )
      )
    ),
    e('div', { className: 'sidebar-footer' },
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
}
