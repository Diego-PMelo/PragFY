import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { categoryService } from '../services/categoryService'
import Sidebar from '../components/layout/Sidebar'

const COLORS = ['#0426b0','#1a9e5c','#e55353','#f59e0b','#8b5cf6','#0891b2','#db2777','#65a30d']
const ICONS  = [
  { value: 'bi-house',         label: 'Casa' },
  { value: 'bi-cart',          label: 'Mercado' },
  { value: 'bi-car-front',     label: 'Transporte' },
  { value: 'bi-heart-pulse',   label: 'Saúde' },
  { value: 'bi-book',          label: 'Educação' },
  { value: 'bi-controller',    label: 'Lazer' },
  { value: 'bi-phone',         label: 'Telefone' },
  { value: 'bi-lightning',     label: 'Serviços' },
  { value: 'bi-briefcase',     label: 'Salário' },
  { value: 'bi-graph-up',      label: 'Investimento' },
  { value: 'bi-gift',          label: 'Presente' },
  { value: 'bi-three-dots',    label: 'Outros' },
]

const EMPTY_FORM = { name: '', type: 'EXPENSE', color: '#0426b0', icon: 'bi-three-dots' }

export default function Categories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [editId, setEditId]         = useState(null)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [filter, setFilter]         = useState('ALL')

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const data = await categoryService.list(user.id)
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  function openModal(c = null) {
    setError('')
    if (c) {
      setEditId(c.id)
      setForm({ name: c.name, type: c.type, color: c.color || '#0426b0', icon: c.icon || 'bi-three-dots' })
    } else {
      setEditId(null)
      setForm(EMPTY_FORM)
    }
    new window.bootstrap.Modal(document.getElementById('catModal')).show()
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = { userId: user.id, ...form }
    try {
      if (editId) await categoryService.update(editId, payload)
      else        await categoryService.create(payload)
      window.bootstrap.Modal.getInstance(document.getElementById('catModal')).hide()
      fetchCategories()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta categoria?')) return
    await categoryService.remove(id)
    fetchCategories()
  }

  const filtered = filter === 'ALL' ? categories : categories.filter(c => c.type === filter)

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="page-title">Categorias</h1>
            <p className="page-subtitle">Organize suas receitas e despesas</p>
          </div>
          <button className="btn btn-primary-custom" onClick={() => openModal()}>
            <i className="bi bi-plus-lg me-1" /> Nova categoria
          </button>
        </div>

        <div className="card-section">
          <div className="d-flex gap-2 mb-3">
            {['ALL','INCOME','EXPENSE'].map(f => (
              <button key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary-custom' : 'btn-outline-secondary'}`}
                onClick={() => setFilter(f)}>
                {f === 'ALL' ? 'Todas' : f === 'INCOME' ? 'Receitas' : 'Despesas'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" style={{ color: 'var(--color-accent)' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-tag fs-1 d-block mb-2" />
              <p>Nenhuma categoria encontrada</p>
              <button className="btn btn-primary-custom mt-2" onClick={() => openModal()}>
                Criar categoria
              </button>
            </div>
          ) : (
            <div className="row g-3">
              {filtered.map(c => (
                <div key={c.id} className="col-sm-6 col-md-4 col-lg-3">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                    <div className="card-body d-flex align-items-center gap-3 py-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 44, height: 44, background: c.color || '#0426b0' }}>
                        <i className={`bi ${c.icon || 'bi-tag'} text-white`} />
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-semibold text-truncate">{c.name}</div>
                        <span className={`badge rounded-pill small ${c.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                          {c.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </span>
                      </div>
                      <div className="d-flex flex-column gap-1">
                        <button className="btn btn-sm btn-outline-secondary p-1" onClick={() => openModal(c)}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn btn-sm btn-outline-danger p-1" onClick={() => handleDelete(c.id)}>
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <div className="modal fade" id="catModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header" style={{ background: 'var(--color-primary)', color: '#fff' }}>
              <h5 className="modal-title">{editId ? 'Editar categoria' : 'Nova categoria'}</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-danger py-2">{error}</div>}

                <div className="mb-3">
                  <label className="form-label fw-semibold">Nome</label>
                  <input className="form-control" type="text" maxLength={80}
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Tipo</label>
                  <div className="d-flex gap-3">
                    {['EXPENSE','INCOME'].map(t => (
                      <div key={t} className="form-check">
                        <input className="form-check-input" type="radio" name="catType"
                          id={`catType_${t}`} value={t}
                          checked={form.type === t}
                          onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
                        <label className="form-check-label" htmlFor={`catType_${t}`}>
                          {t === 'INCOME' ? 'Receita' : 'Despesa'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Cor</label>
                  <div className="d-flex gap-2 flex-wrap">
                    {COLORS.map(color => (
                      <button key={color} type="button"
                        onClick={() => setForm(f => ({ ...f, color }))}
                        style={{
                          width: 32, height: 32, background: color, border: 'none',
                          borderRadius: '50%', cursor: 'pointer',
                          outline: form.color === color ? `3px solid ${color}` : 'none',
                          outlineOffset: 2
                        }} />
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Ícone</label>
                  <div className="d-flex gap-2 flex-wrap">
                    {ICONS.map(icon => (
                      <button key={icon.value} type="button" title={icon.label}
                        onClick={() => setForm(f => ({ ...f, icon: icon.value }))}
                        className={`btn btn-sm ${form.icon === icon.value ? 'btn-primary-custom' : 'btn-outline-secondary'}`}
                        style={{ width: 40, height: 40 }}>
                        <i className={`bi ${icon.value}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
                  <div className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 40, height: 40, background: form.color }}>
                    <i className={`bi ${form.icon} text-white`} />
                  </div>
                  <span className="fw-semibold">{form.name || 'Prévia'}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" className="btn btn-primary-custom" disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm" /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
