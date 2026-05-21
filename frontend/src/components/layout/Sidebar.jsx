import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard',    icon: 'bi-grid-fill',         label: 'Dashboard' },
  { to: '/transactions', icon: 'bi-arrow-left-right',  label: 'Transações' },
  { to: '/categories',   icon: 'bi-tag-fill',          label: 'Categorias' },
  { to: '/profile',      icon: 'bi-bar-chart-line-fill', label: 'Perfil Investidor' }
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/assets/PragFY_Logo.svg" alt="PragFY" />
        <span>ragFY</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <i className={`bi ${item.icon}`} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <i className="bi bi-person-circle" />
          <span>{user?.name}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-left" />
          Sair
        </button>
      </div>
    </aside>
  )
}
