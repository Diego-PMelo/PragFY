import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { transactionService } from '../services/transactionService'
import Sidebar from '../components/layout/Sidebar'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Dashboard() {
  const { user } = useAuth()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear]   = useState(now.getFullYear())
  const [summary, setSummary]           = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [s, t] = await Promise.all([
        transactionService.summary(user.id, month, year),
        transactionService.list(user.id, month, year)
      ])
      setSummary(s)
      setTransactions(t.slice(0, 5))
    } catch {
      setSummary(null)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [user.id, month, year])

  useEffect(() => { fetchData() }, [fetchData])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Visão geral das suas finanças</p>
          </div>
          <div className="month-picker">
            <button onClick={prevMonth}><i className="bi bi-chevron-left" /></button>
            <span>{MONTHS[month - 1]} {year}</span>
            <button onClick={nextMonth}><i className="bi bi-chevron-right" /></button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--color-accent)' }} />
          </div>
        ) : (
          <>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="summary-card income d-flex justify-content-between align-items-center">
                  <div>
                    <div className="label">Receitas</div>
                    <div className="amount">{formatBRL(summary?.totalIncome)}</div>
                  </div>
                  <i className="bi bi-arrow-up-circle-fill" />
                </div>
              </div>
              <div className="col-md-4">
                <div className="summary-card expense d-flex justify-content-between align-items-center">
                  <div>
                    <div className="label">Despesas</div>
                    <div className="amount">{formatBRL(summary?.totalExpense)}</div>
                  </div>
                  <i className="bi bi-arrow-down-circle-fill" />
                </div>
              </div>
              <div className="col-md-4">
                <div className="summary-card balance d-flex justify-content-between align-items-center">
                  <div>
                    <div className="label">Saldo</div>
                    <div className="amount">{formatBRL(summary?.balance)}</div>
                  </div>
                  <i className="bi bi-wallet2" />
                </div>
              </div>
            </div>

            <div className="card-section">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="section-title mb-0">Últimas transações</h2>
                <Link to="/transactions" className="btn btn-sm btn-primary-custom">Ver todas</Link>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox fs-2 d-block mb-2" />
                  Nenhuma transação neste mês
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Data</th>
                        <th className="text-end">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(t => (
                        <tr key={t.id}>
                          <td>{t.description || '—'}</td>
                          <td>
                            <span className="badge rounded-pill" style={{ background: '#e9ecef', color: '#495057' }}>
                              {t.categoryName || 'Sem categoria'}
                            </span>
                          </td>
                          <td>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                          <td className="text-end fw-600">
                            <span className={t.type === 'INCOME' ? 'text-success' : 'text-danger'}>
                              {t.type === 'INCOME' ? '+' : '-'} {formatBRL(t.amount)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
