import { useState, useEffect } from 'react'
import { BASE } from '../App'

const CATEGORIAS = [
  { key: 'all', label: 'Todos' },
  { key: 'politica', label: '🏛️ Política' },
  { key: 'esporte', label: '⚽ Esporte' },
  { key: 'crypto', label: '₿ Crypto' },
  { key: 'entretenimento', label: '🎬 Entretenimento' },
  { key: 'geopolitica', label: '🌍 Geopolítica' },
]

const KEYWORDS = {
  politica: ['election', 'president', 'senate', 'house', 'democrat', 'republican', 'primary', 'nomination', 'impeach', 'resign', 'midterm', 'vote', 'governor', 'congress'],
  esporte: ['win the', 'nba', 'nhl', 'nfl', 'mlb', 'fifa', 'world cup', 'champions league', 'premier league', 'la liga', 'serie a', 'ligue', 'masters', 'tournament', 'finals', 'playoff', 'mvp', 'rookie'],
  crypto: ['bitcoin', 'btc', 'eth', 'crypto', 'token', 'blockchain', 'defi', 'nft', 'solana', '$1m', 'coinbase'],
  entretenimento: ['album', 'gta', 'movie', 'oscar', 'grammy', 'taylor', 'rihanna', 'carti', 'drake', 'jesus', 'netflix'],
  geopolitica: ['russia', 'ukraine', 'china', 'taiwan', 'iran', 'israel', 'putin', 'xi', 'zelensky', 'netanyahu', 'nato', 'war', 'ceasefire', 'invasion', 'erdogan'],
}

function getCategoria(question) {
  const q = question.toLowerCase()
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => q.includes(w))) return cat
  }
  return 'outros'
}

function MiniChart({ points, color }) {
  if (!points || points.length < 2) return null

  const W = 120, H = 36
  const prices = points.map(p => p.yes_price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1

  const coords = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * W
    const y = H - ((p - min) / range) * H
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <polyline
        points={coords}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  )
}

function HistoryChart({ points, question }) {
  if (!points || points.length < 2) return (
    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: '12px 0' }}>Histórico insuficiente</div>
  )

  const W = 600, H = 80
  const prices = points.map(p => p.yes_price)
  const min = Math.min(...prices) - 0.5
  const max = Math.max(...prices) + 0.5
  const range = max - min || 1

  // Reduz pontos para no máximo 200
  const step = Math.ceil(points.length / 200)
  const reduced = points.filter((_, i) => i % step === 0)

  const coords = reduced.map((p, i) => {
    const x = (i / (reduced.length - 1)) * W
    const y = H - ((p.yes_price - min) / range) * H
    return `${x},${y}`
  }).join(' ')

  const first = prices[0]
  const last = prices[prices.length - 1]
  const up = last >= first
  const color = up ? '#30d158' : '#ff453a'
  const changePct = (((last - first) / first) * 100).toFixed(1)

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Histórico YES · {points.length} pontos</span>
        <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color }}>
          {first}% → {last}% ({up ? '+' : ''}{changePct}%)
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`grad-${first}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={`0,${H} ${coords} ${W},${H}`}
          fill={`url(#grad-${first})`}
        />
        <polyline
          points={coords}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{points[0]?.time?.slice(11, 16)}</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{points[points.length - 1]?.time?.slice(11, 16)}</span>
      </div>
    </div>
  )
}

export default function Mercados() {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [categoria, setCategoria] = useState('all')
  const [busca, setBusca] = useState('')
  const [expandido, setExpandido] = useState(null)
  const [historicos, setHistoricos] = useState({})
  const [loadingHistory, setLoadingHistory] = useState({})
  const [miniCharts, setMiniCharts] = useState({})

  const load = async () => {
    try {
      const r = await fetch(`${BASE}/markets`)
      const data = await r.json()
      setMarkets(data)
      setLastUpdate(new Date())
      // Carrega mini charts para todos os mercados em background
      loadMiniCharts(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const loadMiniCharts = async (mlist) => {
    const top = mlist.slice(0, 20)
    for (const m of top) {
      try {
        const r = await fetch(`${BASE}/history/${m.slug}`)
        const d = await r.json()
        if (d.points && d.points.length > 1) {
          setMiniCharts(prev => ({ ...prev, [m.slug]: d.points }))
        }
      } catch (e) {}
    }
  }

  const loadHistory = async (slug) => {
    if (historicos[slug]) return
    setLoadingHistory(prev => ({ ...prev, [slug]: true }))
    try {
      const r = await fetch(`${BASE}/history/${slug}`)
      const d = await r.json()
      setHistoricos(prev => ({ ...prev, [slug]: d }))
    } catch (e) { console.error(e) }
    finally { setLoadingHistory(prev => ({ ...prev, [slug]: false })) }
  }

  const toggleExpand = (slug, i) => {
    if (expandido === i) {
      setExpandido(null)
    } else {
      setExpandido(i)
      loadHistory(slug)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  const filtrados = markets.filter(m => {
    const cat = getCategoria(m.question)
    const matchCat = categoria === 'all' || cat === categoria
    const matchBusca = m.question.toLowerCase().includes(busca.toLowerCase())
    return matchCat && matchBusca
  })

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Mercados ao Vivo</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            {filtrados.length} mercados · clique para ver histórico
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#30d158', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '—'}</span>
          <button onClick={load} style={{ background: 'rgba(10,132,255,0.15)', color: '#0a84ff', border: '1px solid rgba(10,132,255,0.3)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>↻</button>
        </div>
      </div>

      <input
        placeholder="Buscar mercado..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        style={{
          width: '100%', background: '#111114',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: '10px 14px',
          color: '#f5f5f7', fontSize: 13, outline: 'none',
          marginBottom: 12, boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIAS.map(({ key, label }) => (
          <button key={key} onClick={() => setCategoria(key)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
            background: categoria === key ? '#0a84ff' : 'rgba(255,255,255,0.05)',
            color: categoria === key ? '#fff' : 'rgba(255,255,255,0.45)',
            border: `1px solid ${categoria === key ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
          }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>Carregando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtrados.map((m, i) => {
            const change = m.change_24h
            const changeColor = change > 0 ? '#30d158' : change < 0 ? '#ff453a' : 'rgba(255,255,255,0.3)'
            const changeLabel = change != null ? `${change > 0 ? '+' : ''}${(change * 100).toFixed(1)}%` : '—'
            const isOpen = expandido === i
            const hist = historicos[m.slug]
            const mini = miniCharts[m.slug]

            return (
              <div key={i} onClick={() => toggleExpand(m.slug, i)} style={{
                background: '#111114',
                border: `1px solid ${isOpen ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 14, padding: '14px 18px',
                cursor: 'pointer', transition: 'border-color 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', minWidth: 24, fontFamily: 'monospace' }}>{i + 1}</div>
                  <div style={{ flex: 1, fontSize: 13, color: '#f5f5f7', lineHeight: 1.4 }}>{m.question}</div>

                  {/* Mini chart */}
                  {mini && !isOpen && (
                    <div style={{ flexShrink: 0 }}>
                      <MiniChart points={mini} color={changeColor} />
                    </div>
                  )}

                  <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: changeColor, minWidth: 50, textAlign: 'right', flexShrink: 0 }}>{changeLabel}</div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <span style={{ background: 'rgba(48,209,88,0.12)', color: '#30d158', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>YES {m.yes_price}%</span>
                    <span style={{ background: 'rgba(255,69,58,0.12)', color: '#ff453a', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>NO {m.no_price}%</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', minWidth: 70, textAlign: 'right', fontFamily: 'monospace', flexShrink: 0 }}>${(m.volume_24h / 1000).toFixed(0)}k</div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
                </div>

                {isOpen && (
                  <div style={{ animation: 'fadeUp 0.2s ease' }}>
                    {loadingHistory[m.slug] ? (
                      <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: '12px 0', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>Carregando histórico...</div>
                    ) : hist ? (
                      <HistoryChart points={hist.points} question={m.question} />
                    ) : null}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}