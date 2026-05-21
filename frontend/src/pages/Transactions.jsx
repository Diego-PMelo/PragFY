import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { transactionService } from '../services/transactionService'
import { categoryService } from '../services/categoryService'
import Sidebar from '../components/layout/Sidebar'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function formatBRL(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const EMPTY_FORM = {
  amount: '', description: '', date: new Date().toISOString().slice(0,10),
  type: 'EXPENSE', categoryId: ''
}

export default function Transactions() {
  const { user } = useAuth()
  const now = new Date()
  const [month, setMonth]               = useState(now.getMonth() + 1)
  const [year, setYear]                 = useState(now.getFullYear())
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [editId, setEditId]             = useState(null)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [t, c] = await Promise.all([
        transactionService.list(user.id, month, year),
        categoryService.list(user.id)
      ])
      setTransactions(t)
      setCategories(c)
    } finally {
      setLoading(false)
    }
  }, [user.id, month, year])

  useEffect(() => { fetchAll() }, [fetchAll])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function openModal(t = null) {
    setError('')
    if (t) {
      setEditId(t.id)
      setForm({
        amount: t.amount, description: t.description || '',
        date: t.date, type: t.type, categoryId: t.categoryId || ''
      })
    } else {
      setEditId(null)
      setForm(EMPTY_FORM)
    }
    new window.bootstrap.Modal(document.getElementById('txModal')).show()
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      userId: user.id,
      amount: Number(form.amount),
      description: form.description,
      date: form.date,
      type: form.type,
      categoryId: form.categoryId || null
    }
    try {
      if (editId) await transactionService.update(editId, payload)
      else        await transactionService.create(payload)
      window.bootstrap.Modal.getInstance(document.getElementById('txModal')).hide()
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta transação?')) return
    await transactionService.remove(id)
    fetchAll()
  }

  const filteredCategories = categories.filter(c => c.type === form.type)

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="page-title">Transações</h1>
            <p className="page-subtitle">Gerencie suas receitas e despesas</p>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="month-picker">
              <button onClick={prevMonth}><i className="bi bi-chevron-left" /></button>
              <span>{MONTHS[month - 1]} {year}</span>
              <button onClick={nextMonth}><i className="bi bi-chevron-right" /></button>
            </div>
            <button className="btn btn-primary-custom" onClick={() => openModal()}>
              <i className="bi bi-plus-lg me-1" /> Nova transação
            </button>
          </div>
        </div>

        <div className="card-section">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: 'var(--color-accent)' }} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2" />
              <p>Nenhuma transação em {MONTHS[month - 1]} {year}</p>
              <button className="btn btn-primary-custom mt-2" onClick={() => openModal()}>
                Adicionar primeira transação
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Data</th>
                    <th className="text-end">Valor</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td>
                        <span className={`badge rounded-pill ${t.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                          {t.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td>{t.description || '—'}</td>
                      <td>{t.categoryName || '—'}</td>
                      <td>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                      <td className={`text-end fw-semibold ${t.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>
                        {t.type === 'INCOME' ? '+' : '-'} {formatBRL(t.amount)}
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openModal(t)}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(t.id)}>
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <div className="modal fade" id="txModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header" style={{ background: 'var(--color-primary)', color: '#fff' }}>
              <h5 className="modal-title">{editId ? 'Editar transação' : 'Nova transação'}</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-danger py-2">{error}</div>}

                <div className="mb-3">
                  <label className="form-label fw-semibold">Tipo</label>
                  <div className="d-flex gap-3">
                    {['EXPENSE', 'INCOME'].map(t => (
                      <div key={t} className="form-check">
                        <input className="form-check-input" type="radio" name="type"
                          id={`type_${t}`} value={t}
                          checked={form.type === t}
                          onChange={e => setForm(f => ({ ...f, type: e.target.value, categoryId: '' }))} />
                        <label className="form-check-label" htmlFor={`type_${t}`}>
                          {t === 'INCOME' ? 'Receita' : 'Despesa'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Valor (R$)</label>
                  <input className="form-control" type="number" step="0.01" min="0.01"
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Descrição</label>
                  <input className="form-control" type="text" maxLength={255}
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Data</label>
                  <input className="form-control" type="date"
                    value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Categoria</label>
                  <select className="form-select"
                    value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                    <option value="">Sem categoria</option>
                    {filteredCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
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
