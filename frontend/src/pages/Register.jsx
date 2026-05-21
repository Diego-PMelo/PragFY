import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('As senhas não coincidem')
      return
    }
    setLoading(true)
    try {
      await authService.register(form.name, form.email, form.password)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta')
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
            <i className="bi bi-person input-icon" style={{ fontSize: '1.1rem', color: '#333' }} />
            <input
              name="name"
              type="text"
              placeholder="Nome completo"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input-wrap">
            <img src="/assets/Mail.png" className="input-icon" alt="" style={{ transform: 'scaleX(-1)' }} />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input-wrap">
            <img src="/assets/Locker.png" className="input-icon" alt="" style={{ transform: 'scaleX(-1)' }} />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
            <button type="button" className="btn-eye" onClick={() => setShowPassword(v => !v)}>
              <img src="/assets/Eye.png" alt="" width={22} style={{ transform: 'scaleX(-1)' }} />
            </button>
          </div>

          <div className="auth-input-wrap">
            <img src="/assets/Locker.png" className="input-icon" alt="" style={{ transform: 'scaleX(-1)' }} />
            <input
              name="confirm"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirmar senha"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : 'CRIAR CONTA'}
          </button>

          <div className="auth-links" style={{ justifyContent: 'center' }}>
            <Link to="/login">Já tem conta? Faça login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
