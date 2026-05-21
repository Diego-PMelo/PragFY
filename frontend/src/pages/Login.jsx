import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await authService.login(email, password)
      login(user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <img src="/assets/LogoBg.png" className="gear-bg" alt="" />

      <div className="auth-card fade-in">
        <div className="auth-logo">
          <img src="/assets/PragFY_Logo.svg" alt="PragFY" />
          <span>ragFY</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger py-2 px-3" role="alert" style={{ borderRadius: 10 }}>
              <i className="bi bi-exclamation-circle me-2" />
              {error}
            </div>
          )}

          <div className="auth-input-wrap">
            <img src="/assets/Mail.png" className="input-icon" alt="" style={{ transform: 'scaleX(-1)' }} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-input-wrap">
            <img src="/assets/Locker.png" className="input-icon" alt="" style={{ transform: 'scaleX(-1)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button type="button" className="btn-eye" onClick={() => setShowPassword(v => !v)}>
              <img src="/assets/Eye.png" alt="" width={22} style={{ transform: 'scaleX(-1)' }} />
            </button>
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : 'LOGIN'}
          </button>

          <div className="auth-links">
            <Link to="/register">Crie sua conta</Link>
            <a href="#">Esqueceu sua senha?</a>
          </div>
        </form>
      </div>
    </div>
  )
}
