import { useEffect, useState } from 'react'
import { BASE } from '../App'

const CATEGORIES = {
  esportes: /(nba|nfl|nhl|mlb|fifa|premier|champions|serie a|ligue|la liga|masters|golf|spurs|celtics|thunder|nuggets|arsenal|barcelona|psg|inter|liverpool|real madrid|bayern|napoli|wembanyama|gilgeous|flagg|knueppel|scheffler|mcilroy|rahm|dechambeau|aberg|schauffele)/i,
  politica: /(president|election|senate|house|republican|democrat|nomination|trump|vance|rubio|ocasio|newsom|ossoff|paxton|cornyn|midterm|scotus)/i,
  geopolitica: /(china|taiwan|russia|ukraine|putin|xi jinping|netanyahu|zelenskyy|erdogan|hungary|orban|magyar|ceasefire|invad|war)/i,
}

function getCategory(q) {
  for (const [cat, rx] of Object.entries(CATEGORIES)) {
    if (rx.test(q)) return cat
  }
  return 'outro'
}

const CAT_LABELS = {
  esportes: '🏆 Esportes',
  politica: '🗳️ Política',
  geopolitica: '🌍 Geopolítica',
  outro: '📊 Outro',
}

const SORT_OPTIONS = [
  { key: 'conf', label: '🎯 Confiança' },
  { key: 'days', label: '⏳ Fechando logo' },
  { key: 'volume', label: '💰 Volume 24h' },
]

function urgencyColor(days) {
  if (days <= 7) return '#ff453a'
  if (days <= 30) return '#ff9f0a'
  return '#30d158'
}

export default function HighConfidence() {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [minConf, setMinConf] = useState(80)
  const [maxDays, setMaxDays] = useState(365)
  const [sortBy, setSortBy] = useState('conf')

  useEffect(() => {
    setLoading(true)
    fetch(`${BASE}/markets?max_days=365`)
      .then(r => r.json())
      .then(data => {
        const filtered = data.filter(m => Math.max(m.yes_price, m.no_price) >= 80)
        setMarkets(filtered)
      })
      .catch(() => setMarkets([]))
      .finally(() => setLoading(false))
  }, [])

  const displayed = markets
    .filter(m => {
      const conf = Math.max(m.yes_price, m.no_price)
      if (conf < minConf) return false
      if (m.days_to_close > maxDays) return false
      if (filter !== 'all' && getCategory(m.question) !== filter) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'conf') return Math.max(b.yes_price, b.no_price) - Math.max(a.yes_price, a.no_price)
      if (sortBy === 'days') return a.days_to_close - b.days_to_close
      if (sortBy === 'volume') return (b.volume_24h || 0) - (a.volume_24h || 0)
      return 0
    })

  const urgent = displayed.filter(m => m.days_to_close <= 7).length
  const avgConf = displayed.length
    ? (displayed.reduce((s, m) => s + Math.max(m.yes_price, m.no_price), 0) / displayed.length).toFixed(1)
    : '—'

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>
          🎯 High Confidence
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
          Mercados com probabilidade alta de resolução conhecida — baixo risco, retorno previsível
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Oportunidades', value: displayed.length },
          { label: 'Confiança média', value: avgConf + '%' },
          { label: '⚡ Fechando em 7d', value: urgent },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '12px 16px',
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filtros categoria */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {['all', 'esportes', 'politica', 'geopolitica'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
            border: '1px solid',
            borderColor: filter === f ? '#0a84ff' : 'rgba(255,255,255,0.12)',
            background: filter === f ? 'rgba(10,132,255,0.15)' : 'transparent',
            color: filter === f ? '#0a84ff' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
          }}>
            {f === 'all' ? 'Todos' : CAT_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Ordenação + Sliders */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginRight: 2 }}>Ordenar:</span>
          {SORT_OPTIONS.map(({ key, label }) => (
            <button key={key} onClick={() => setSortBy(key)} style={{
              padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              border: '1px solid',
              borderColor: sortBy === key ? '#30d158' : 'rgba(255,255,255,0.12)',
              background: sortBy === key ? 'rgba(48,209,88,0.12)' : 'transparent',
              color: sortBy === key ? '#30d158' : 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Conf. mín: <b style={{ color: '#f5f5f7', minWidth: 32 }}>{minConf}%</b>
            <input type="range" min={70} max={95} step={5} value={minConf}
              onChange={e => setMinConf(+e.target.value)}
              style={{ width: 80, accentColor: '#0a84ff' }} />
          </label>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Prazo: <b style={{ color: '#f5f5f7', minWidth: 28 }}>{maxDays === 365 ? '∞' : maxDays + 'd'}</b>
            <input type="range" min={7} max={365} step={7} value={maxDays}
              onChange={e => setMaxDays(+e.target.value)}
              style={{ width: 80, accentColor: '#0a84ff' }} />
          </label>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
          Carregando mercados...
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
          Nenhum mercado com esses filtros.
        </div>
      ) : displayed.map((m, i) => {
        const side = m.yes_price >= 50 ? 'YES' : 'NO'
        const conf = Math.max(m.yes_price, m.no_price)
        const confColor = conf >= 90 ? '#30d158' : conf >= 80 ? '#0a84ff' : '#ff9f0a'
        const cat = getCategory(m.question)
        const vol24 = m.volume_24h ? '$' + (m.volume_24h / 1000).toFixed(0) + 'k/24h' : null

        return (
          <div
            key={m.slug}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: '14px 18px', marginBottom: 10,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 600, minWidth: 20, paddingTop: 2 }}>
                {i + 1}
              </span>
              <p style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.45, margin: 0 }}>
                {m.question}
              </p>
              <div style={{
                flexShrink: 0,
                background: confColor + '22',
                color: confColor,
                border: `1px solid ${confColor}55`,
                borderRadius: 8, padding: '4px 10px',
                fontSize: 13, fontWeight: 700,
              }}>
                {side} {conf}%
              </div>
            </div>

            <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, marginBottom: 10 }}>
              <div style={{ height: 3, width: conf + '%', background: confColor, borderRadius: 2 }} />
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{CAT_LABELS[cat]}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: urgencyColor(m.days_to_close) }}>
                ●{' '}
                {m.days_to_close <= 1 ? 'fecha hoje'
                  : m.days_to_close <= 7 ? `fecha em ${m.days_to_close}d`
                  : `${m.days_to_close} dias`}
              </span>
              {vol24 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{vol24}</span>}
              <a
                href={`https://polymarket.com/market/${m.slug}`}
                target="_blank" rel="noreferrer"
                style={{ marginLeft: 'auto', fontSize: 11, color: '#0a84ff', textDecoration: 'none' }}
              >
                Ver no Polymarket →
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}