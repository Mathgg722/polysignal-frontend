import { useState, useEffect, useCallback } from 'react'
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

const SORT_OPTIONS = [
  { key: 'volume', label: '💰 Volume' },
  { key: 'conf', label: '🎯 Confiança' },
  { key: 'days', label: '⏳ Fechando logo' },
  { key: 'change', label: '📈 Variação 24h' },
]

function getCategoria(question) {
  const q = question.toLowerCase()
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => q.includes(w))) return cat
  }
  return 'outros'
}

function urgencyColor(days) {
  if (!days && days !== 0) return 'rgba(255,255,255,0.25)'
  if (days <= 3)  return '#ff453a'
  if (days <= 7)  return '#ff9f0a'
  if (days <= 30) return '#ffd60a'
  return 'rgba(255,255,255,0.3)'
}

function fmtVol(v) {
  if (!v || isNaN(v)) return '—'
  if (v >= 1_000_000) return '$' + (v / 1_000_000).toFixed(1) + 'M'
  if (v >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k'
  return '$' + v.toFixed(0)
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
      <polyline points={coords} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

function HistoryChart({ points }) {
  if (!points || points.length < 2) return (
    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: '12px 0' }}>Histórico insuficiente</div>
  )
  const W = 600, H = 80
  const prices = points.map(p => p.yes_price)
  const min = Math.min(...prices) - 0.5
  const max = Math.max(...prices) + 0.5
  const range = max - min || 1
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
  const gradId = `grad-${Math.round(first * 100)}`
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
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={`0,${H} ${coords} ${W},${H}`} fill={`url(#${gradId})`} />
        <polyline points={coords} fill="none" stroke={color} strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{points[0]?.time?.slice(11, 16)}</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{points[points.length - 1]?.time?.slice(11, 16)}</span>
      </div>
    </div>
  )
}

export default function Mercados() {
  const [markets,       setMarkets]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [lastUpdate,    setLastUpdate]    = useState(null)
  const [categoria,     setCategoria]     = useState('all')
  const [busca,         setBusca]         = useState('')
  const [expandido,     setExpandido]     = useState(null)
  const [historicos,    setHistoricos]    = useState({})
  const [loadingHist,   setLoadingHist]   = useState({})
  const [miniCharts,    setMiniCharts]    = useState({})
  const [sortBy,        setSortBy]        = useState('volume')

  const loadMiniCharts = useCallback(async (mlist) => {
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
  }, [])

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/markets`)
      const data = await r.json()
      setMarkets(data)
      setLastUpdate(new Date())
      loadMiniCharts(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [loadMiniCharts])

  const loadHistory = async (slug) => {
    if (historicos[slug]) return
    setLoadingHist(prev => ({ ...prev, [slug]: true }))
    try {
      const r = await fetch(`${BASE}/history/${slug}`)
      const d = await r.json()
      setHistoricos(prev => ({ ...prev, [slug]: d }))
    } catch (e) { console.error(e) }
    finally { setLoadingHist(prev => ({ ...prev, [slug]: false })) }
  }

  const toggleExpand = (slug, i) => {
    if (expandido === i) { setExpandido(null) }
    else { setExpandido(i); loadHistory(slug) }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [load])

  const sorted = [...markets]
    .filter(m => {
      const cat = getCategoria(m.question)
      const matchCat = categoria === 'all' || cat === categoria
      const matchBusca = m.question.toLowerCase().includes(busca.toLowerCase())
      return matchCat && matchBusca
    })
    .sort((a, b) => {
      if (sortBy === 'volume') return (b.volume_24h || 0) - (a.volume_24h || 0)
      if (sortBy === 'conf')   return Math.max(b.yes_price||0,b.no_price||0) - Math.max(a.yes_price||0,a.no_price||0)
      if (sortBy === 'days')   return (a.days_to_close || 9999) - (b.days_to_close || 9999)
      if (sortBy === 'change') return Math.abs(b.change_24h || 0) - Math.abs(a.change_24h || 0)
      return 0
    })

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Mercados ao Vivo</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            {sorted.length} mercados · clique para ver histórico
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#30d158', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '—'}</span>
          <button onClick={load} style={{ background: 'rgba(10,132,255,0.15)', color: '#0a84ff', border: '1px solid rgba(10,132,255,0.3)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>↻</button>
        </div>
      </div>

      {/* busca */}
      <input
        placeholder="Buscar mercado..."
        value={busca}
        onChange={e => { setBusca(e.target.value); setExpandido(null) }}
        style={{
          width: '100%', background: '#111114',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: '10px 14px',
          color: '#f5f5f7', fontSize: 13, outline: 'none',
          marginBottom: 12, boxSizing: 'border-box',
        }}
      />

      {/* categorias */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {CATEGORIAS.map(({ key, label }) => (
          <button key={key} onClick={() => { setCategoria(key); setExpandido(null) }} style={{
            padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
            background: categoria === key ? '#0a84ff' : 'rgba(255,255,255,0.05)',
            color: categoria === key ? '#fff' : 'rgba(255,255,255,0.45)',
            border: `1px solid ${categoria === key ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
          }}>{label}</button>
        ))}
      </div>

      {/* ordenação */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginRight: 2 }}>Ordenar:</span>
        {SORT_OPTIONS.map(({ key, label }) => (
          <button key={key} onClick={() => setSortBy(key)} style={{
            padding: '4px 11px', borderRadius: 8, fontSize: 12, fontWeight: 500,
            border: '1px solid',
            borderColor: sortBy === key ? '#30d158' : 'rgba(255,255,255,0.1)',
            background: sortBy === key ? 'rgba(48,209,88,0.1)' : 'transparent',
            color: sortBy === key ? '#30d158' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      {/* lista */}
      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>Carregando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((m, i) => {
            const change      = m.change_24h
            const changeColor = change > 0 ? '#30d158' : change < 0 ? '#ff453a' : 'rgba(255,255,255,0.3)'
            const changeLabel = change != null ? `${change > 0 ? '+' : ''}${(change * 100).toFixed(1)}%` : '—'
            const isOpen      = expandido === i
            const hist        = historicos[m.slug]
            const mini        = miniCharts[m.slug]
            const conf        = Math.max(m.yes_price || 0, m.no_price || 0)
            const uc          = urgencyColor(m.days_to_close)

            return (
              <div key={m.slug || i} onClick={() => toggleExpand(m.slug, i)} style={{
                background: '#111114',
                border: `1px solid ${isOpen ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 14, padding: '13px 16px',
                cursor: 'pointer', transition: 'border-color 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {/* número */}
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', minWidth: 22, fontFamily: 'monospace', flexShrink: 0 }}>{i + 1}</div>

                  {/* pergunta */}
                  <div style={{ flex: 1, fontSize: 13, color: '#f5f5f7', lineHeight: 1.4, minWidth: 160 }}>{m.question}</div>

                  {/* mini chart */}
                  {mini && !isOpen && (
                    <div style={{ flexShrink: 0 }}>
                      <MiniChart points={mini} color={changeColor} />
                    </div>
                  )}

                  {/* dias para fechar */}
                  {m.days_to_close != null && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: uc, flexShrink: 0, minWidth: 60, textAlign: 'right' }}>
                      {m.days_to_close <= 1 ? 'hoje' : m.days_to_close <= 7 ? `${m.days_to_close}d ●` : `${m.days_to_close}d`}
                    </span>
                  )}

                  {/* variação */}
                  <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: changeColor, minWidth: 48, textAlign: 'right', flexShrink: 0 }}>{changeLabel}</div>

                  {/* preços */}
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <span style={{ background: 'rgba(48,209,88,0.12)', color: '#30d158', padding: '3px 8px', borderRadius: 7, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>YES {m.yes_price}%</span>
                    <span style={{ background: 'rgba(255,69,58,0.12)', color: '#ff453a', padding: '3px 8px', borderRadius: 7, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>NO {m.no_price}%</span>
                  </div>

                  {/* volume */}
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', minWidth: 60, textAlign: 'right', fontFamily: 'monospace', flexShrink: 0 }}>
                    {fmtVol(m.volume_24h)}
                  </div>

                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
                </div>

                {/* expandido */}
                {isOpen && (
                  <div style={{ animation: 'fadeUp 0.2s ease' }}>
                    {loadingHist[m.slug] ? (
                      <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: '12px 0', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>Carregando histórico...</div>
                    ) : hist ? (
                      <>
                        <HistoryChart points={hist.points} />
                        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                            Confiança: <b style={{ color: conf >= 85 ? '#30d158' : '#0a84ff' }}>{conf}%</b>
                          </span>
                          {m.days_to_close != null && (
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                              Fecha em: <b style={{ color: uc }}>{m.days_to_close} dias</b>
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                            Volume total: <b style={{ color: '#f5f5f7' }}>{fmtVol(m.volume)}</b>
                          </span>
                          <a
                            href={`https://polymarket.com/market/${m.slug}`}
                            target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ marginLeft: 'auto', fontSize: 12, color: '#0a84ff', textDecoration: 'none', fontWeight: 600 }}
                          >
                            Ver no Polymarket →
                          </a>
                        </div>
                      </>
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