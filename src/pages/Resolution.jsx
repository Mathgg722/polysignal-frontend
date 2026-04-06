import { useEffect, useState } from 'react'
import { BASE } from '../App'

const NIVEL_CONFIG = {
  'ARMADILHA': { cor: '#ff453a', bg: 'rgba(255,69,58,0.1)',  emoji: '🚨', label: 'ARMADILHA' },
  'ATENÇÃO':   { cor: '#ff9f0a', bg: 'rgba(255,159,10,0.1)', emoji: '⚠️', label: 'ATENÇÃO'   },
  'SEGURO':    { cor: '#30d158', bg: 'rgba(48,209,88,0.1)',  emoji: '✅', label: 'SEGURO'    },
}

function ResolutionCard({ item, expanded, onToggle }) {
  const r      = item.resolution
  const config = NIVEL_CONFIG[r.nivel] || NIVEL_CONFIG['SEGURO']

  return (
    <div style={{
      background: '#111114',
      border: `1px solid ${expanded ? config.cor + '55' : 'rgba(255,255,255,0.07)'}`,
      borderLeft: `3px solid ${config.cor}`,
      borderRadius: 14, marginBottom: 10,
      transition: 'border-color 0.15s',
      overflow: 'hidden',
    }}>
      {/* header clicável */}
      <div
        onClick={onToggle}
        style={{ padding: '13px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}
      >
        <div style={{
          flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '3px 8px',
          borderRadius: 6, background: config.bg, color: config.cor,
          border: `1px solid ${config.cor}44`, marginTop: 1,
        }}>
          {config.emoji} {config.label}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 500, color: '#f5f5f7', lineHeight: 1.4 }}>
            {item.question}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              YES {item.yes_price}% · NO {item.no_price}%
            </span>
            {item.days_to_close != null && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                {item.days_to_close} dias
              </span>
            )}
            {item.tier_label && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{item.tier_label}</span>
            )}
            {r.total_riscos > 0 && (
              <span style={{ fontSize: 11, color: config.cor }}>
                {r.total_riscos} cláusula{r.total_riscos > 1 ? 's' : ''} especial{r.total_riscos > 1 ? 'is' : ''}
              </span>
            )}
          </div>
        </div>

        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* detalhes expandidos */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

          {/* teses de cada lado */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '14px 0' }}>
            <div style={{ background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#30d158', marginBottom: 4 }}>SE COMPRAR YES</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{r.yes_tese}</div>
            </div>
            <div style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#ff453a', marginBottom: 4 }}>SE COMPRAR NO</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{r.no_tese}</div>
            </div>
          </div>

          {/* riscos encontrados */}
          {r.risks && r.risks.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Cláusulas especiais detectadas
              </div>
              {r.risks.map((risk, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '8px 10px', borderRadius: 8,
                  background: risk.cor + '10', border: `1px solid ${risk.cor}30`,
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>
                    {risk.level === 'ARMADILHA' ? '🚨' : '⚠️'}
                  </span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: risk.cor, marginBottom: 2 }}>{risk.level}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{risk.risco}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {r.risks && r.risks.length === 0 && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
              ✅ Nenhuma cláusula especial de risco detectada nas regras.
            </div>
          )}

          {/* link polymarket */}
          <a
            href={`https://polymarket.com/market/${item.slug}`}
            target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: '#0a84ff', textDecoration: 'none' }}
          >
            Ver mercado completo no Polymarket →
          </a>
        </div>
      )}
    </div>
  )
}

export default function Resolution() {
  const [markets,   setMarkets]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('all')
  const [expanded,  setExpanded]  = useState(null)
  const [busca,     setBusca]     = useState('')
  const [maxDays,   setMaxDays]   = useState(90)

  useEffect(() => {
    setLoading(true)
    fetch(`${BASE}/resolution?top=100&max_days=${maxDays}`)
      .then(r => r.json())
      .then(data => {
        setMarkets(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [maxDays])

  const filtered = markets.filter(m => {
    if (filter !== 'all' && m.resolution?.nivel !== filter) return false
    if (busca && !m.question.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const counts = {
    all:        markets.length,
    ARMADILHA:  markets.filter(m => m.resolution?.nivel === 'ARMADILHA').length,
    'ATENÇÃO':  markets.filter(m => m.resolution?.nivel === 'ATENÇÃO').length,
    SEGURO:     markets.filter(m => m.resolution?.nivel === 'SEGURO').length,
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 60px' }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
          ⚠️ Regras de Resolução
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>
          Antes de apostar, entenda o que resolve YES ou NO em cada mercado. Pegadinhas identificadas automaticamente.
        </p>
      </div>

      {/* métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: '🚨 Armadilhas', value: counts['ARMADILHA'], cor: '#ff453a' },
          { label: '⚠️ Atenção',    value: counts['ATENÇÃO'],   cor: '#ff9f0a' },
          { label: '✅ Seguros',    value: counts['SEGURO'],    cor: '#30d158' },
        ].map(({ label, value, cor }) => (
          <div key={label} style={{ background: cor + '10', border: `1px solid ${cor}30`, borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: cor }}>{value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* busca */}
      <input
        placeholder="Buscar mercado..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        style={{
          width: '100%', background: '#111114',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
          padding: '10px 14px', color: '#f5f5f7', fontSize: 13, outline: 'none',
          marginBottom: 12, boxSizing: 'border-box',
        }}
      />

      {/* filtros */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
        {[
          { key: 'all',       label: `Todos (${counts.all})` },
          { key: 'ARMADILHA', label: `🚨 Armadilhas (${counts['ARMADILHA']})` },
          { key: 'ATENÇÃO',   label: `⚠️ Atenção (${counts['ATENÇÃO']})` },
          { key: 'SEGURO',    label: `✅ Seguros (${counts['SEGURO']})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
            border: '1px solid',
            borderColor: filter === key ? '#0a84ff' : 'rgba(255,255,255,0.12)',
            background: filter === key ? 'rgba(10,132,255,0.15)' : 'transparent',
            color: filter === key ? '#0a84ff' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
          }}>{label}</button>
        ))}
        <label style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
          Prazo máx: <b style={{ color: '#f5f5f7' }}>{maxDays === 365 ? '∞' : maxDays + 'd'}</b>
          <input type="range" min={7} max={365} step={7} value={maxDays}
            onChange={e => setMaxDays(+e.target.value)}
            style={{ width: 80, accentColor: '#0a84ff' }} />
        </label>
      </div>

      {/* lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
          Analisando regras de resolução...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
          Nenhum mercado encontrado.
        </div>
      ) : filtered.map((item, i) => (
        <ResolutionCard
          key={item.slug}
          item={item}
          expanded={expanded === i}
          onToggle={() => setExpanded(expanded === i ? null : i)}
        />
      ))}
    </div>
  )
}