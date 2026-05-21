import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { profileService } from '../services/profileService'
import Sidebar from '../components/layout/Sidebar'

const QUESTIONS = [
  {
    id: 'renda_mensal',
    label: 'Qual é a sua renda mensal aproximada?',
    type: 'select',
    options: [
      { value: 'ate_2k',    label: 'Até R$ 2.000' },
      { value: '2k_5k',     label: 'R$ 2.001 a R$ 5.000' },
      { value: '5k_10k',    label: 'R$ 5.001 a R$ 10.000' },
      { value: 'acima_10k', label: 'Acima de R$ 10.000' }
    ]
  },
  {
    id: 'gasto_mensal',
    label: 'Qual percentual da sua renda você gasta mensalmente?',
    type: 'select',
    options: [
      { value: 'ate_50',  label: 'Até 50%' },
      { value: '50_80',   label: 'Entre 50% e 80%' },
      { value: '80_100',  label: 'Entre 80% e 100%' },
      { value: 'acima',   label: 'Mais do que ganha (endividado)' }
    ]
  },
  {
    id: 'dividas',
    label: 'Você possui dívidas atualmente?',
    type: 'select',
    options: [
      { value: 'nao',           label: 'Não' },
      { value: 'sim_controle',  label: 'Sim, mas estão sob controle' },
      { value: 'sim_pesadas',   label: 'Sim, e estão pesando no orçamento' }
    ]
  },
  {
    id: 'objetivo',
    label: 'Qual é o seu principal objetivo financeiro?',
    type: 'select',
    options: [
      { value: 'emergencia',     label: 'Montar reserva de emergência' },
      { value: 'aposentadoria',  label: 'Aposentadoria / independência financeira' },
      { value: 'compra_bem',     label: 'Comprar um bem (imóvel, carro, etc.)' },
      { value: 'renda_extra',    label: 'Gerar renda passiva' },
      { value: 'outros',         label: 'Outros' }
    ]
  },
  {
    id: 'horizonte',
    label: 'Em quanto tempo deseja atingir seu objetivo principal?',
    type: 'select',
    options: [
      { value: 'curto',  label: 'Curto prazo (até 2 anos)' },
      { value: 'medio',  label: 'Médio prazo (2 a 5 anos)' },
      { value: 'longo',  label: 'Longo prazo (mais de 5 anos)' }
    ]
  },
  {
    id: 'ja_investe',
    label: 'Você já investe atualmente?',
    type: 'select',
    options: [
      { value: 'nao',             label: 'Não, nunca investi' },
      { value: 'sim_basico',      label: 'Sim, apenas poupança' },
      { value: 'sim_diversificado', label: 'Sim, tenho investimentos diversificados' }
    ]
  },
  {
    id: 'reacao_perdas',
    label: 'Se seu investimento perdesse 20% do valor em 1 mês, você:',
    type: 'select',
    options: [
      { value: 'venderia',     label: 'Venderia tudo para evitar mais perdas' },
      { value: 'preocupado',   label: 'Ficaria preocupado, mas esperaria recuperar' },
      { value: 'tranquilo',    label: 'Aproveitaria para investir mais' }
    ]
  },
  {
    id: 'poupanca_mensal',
    label: 'Quanto do seu salário consegue poupar mensalmente?',
    type: 'select',
    options: [
      { value: 'nada',    label: 'Nada por enquanto' },
      { value: 'ate_10',  label: 'Menos de 10%' },
      { value: '10_30',   label: 'Entre 10% e 30%' },
      { value: 'acima_30', label: 'Mais de 30%' }
    ]
  }
]

const RISK_LABELS = {
  CONSERVADOR: { label: 'Conservador', cls: 'conservador', icon: 'bi-shield-check',   desc: 'Você prefere segurança. Indicado: Tesouro Direto, CDB, LCI/LCA.' },
  MODERADO:    { label: 'Moderado',    cls: 'moderado',    icon: 'bi-balance-scale',  desc: 'Equilíbrio entre segurança e crescimento. Indicado: Fundos mistos, Tesouro IPCA, FIIs.' },
  ARROJADO:    { label: 'Arrojado',    cls: 'arrojado',    icon: 'bi-graph-up-arrow', desc: 'Você aceita riscos por maiores retornos. Indicado: Ações, ETFs, FIIs, Cripto (parcial).' }
}

export default function InvestorProfile() {
  const { user } = useAuth()
  const [answers, setAnswers]     = useState({})
  const [saved, setSaved]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    profileService.get(user.id)
      .then(data => { setSaved(data); setSubmitted(true) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user.id])

  function handleChange(id, value) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = await profileService.save({ userId: user.id, answers })
      setSaved(data)
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  const answered = QUESTIONS.filter(q => answers[q.id]).length
  const progress  = Math.round((answered / QUESTIONS.length) * 100)

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content d-flex align-items-center justify-content-center">
          <div className="spinner-border" style={{ color: 'var(--color-accent)' }} />
        </main>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        <div className="page-header">
          <h1 className="page-title">Perfil de Investidor</h1>
          <p className="page-subtitle">Responda o questionário para descobrir seu perfil e receber um plano personalizado</p>
        </div>

        {submitted && saved && (
          <div className="card-section mb-4">
            <h2 className="section-title">Seu perfil atual</h2>
            {(() => {
              const r = RISK_LABELS[saved.riskProfile]
              return r ? (
                <div className="d-flex flex-column gap-3">
                  <div className={`risk-badge ${r.cls}`}>
                    <i className={`bi ${r.icon} fs-5`} />
                    {r.label}
                  </div>
                  <p className="mb-0 text-muted">{r.desc}</p>
                  <button className="btn btn-outline-secondary align-self-start"
                    onClick={() => { setSubmitted(false); setAnswers({}) }}>
                    <i className="bi bi-arrow-repeat me-1" /> Refazer questionário
                  </button>
                </div>
              ) : null
            })()}
          </div>
        )}

        {!submitted && (
          <div className="question-card">
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted">{answered} de {QUESTIONS.length} perguntas respondidas</small>
                <small className="fw-semibold" style={{ color: 'var(--color-accent)' }}>{progress}%</small>
              </div>
              <div className="progress" style={{ height: 6, borderRadius: 10 }}>
                <div className="progress-bar" role="progressbar"
                  style={{ width: `${progress}%`, background: 'var(--color-accent)', borderRadius: 10 }} />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {QUESTIONS.map((q, i) => (
                <div key={q.id} className="question-step">
                  <div className="step-number">{i + 1}</div>
                  <div className="flex-grow-1">
                    <label className="form-label fw-semibold mb-2">{q.label}</label>
                    <select className="form-select" required
                      value={answers[q.id] || ''}
                      onChange={e => handleChange(q.id, e.target.value)}>
                      <option value="">Selecione...</option>
                      {q.options.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              <div className="d-flex justify-content-end mt-3">
                <button type="submit" className="btn btn-primary-custom px-4" disabled={saving || answered < QUESTIONS.length}>
                  {saving
                    ? <span className="spinner-border spinner-border-sm" />
                    : <><i className="bi bi-check-circle me-2" />Descobrir meu perfil</>}
                </button>
              </div>

              {answered < QUESTIONS.length && (
                <p className="text-muted small text-end mt-2">
                  Responda todas as {QUESTIONS.length} perguntas para continuar
                </p>
              )}
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
