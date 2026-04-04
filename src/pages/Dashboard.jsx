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

export default function Dashboard() {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [categoria, setCategoria] = useState('all')
  const [busca, setBusca] = useState('')

  const load = async () => {
    try {
      const r = await fetch(`${BASE}/markets`)
      const data = await r.json()
      setMarkets(data)
      setLastUpdate(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
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
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Mercados ao Vivo</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            {filtrados.length} mercados · ordenados por volume 24h
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#30d158', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            {lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '—'}
          </span>
          <button onClick={load} style={{
            background: 'rgba(10,132,255,0.15)', color: '#0a84ff',
            border: '1px solid rgba(10,132,255,0.3)', borderRadius: 8,
            padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
          }}>↻</button>
        </div>
      </div>

      {/* Busca */}
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

      {/* Filtros */}
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

      {/* Lista */}
      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>Carregando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtrados.map((m, i) => {
            const change = m.change_24h
            const changeColor = change > 0 ? '#30d158' : change < 0 ? '#ff453a' : 'rgba(255,255,255,0.3)'
            const changeLabel = change != null ? `${change > 0 ? '+' : ''}${(change * 100).toFixed(1)}%` : '—'

            return (
              <div key={i} style={{
                background: '#111114',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', minWidth: 24, fontFamily: 'monospace' }}>{i + 1}</div>
                <div style={{ flex: 1, fontSize: 13, color: '#f5f5f7', lineHeight: 1.4 }}>{m.question}</div>
                <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: changeColor, minWidth: 50, textAlign: 'right' }}>{changeLabel}</div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <span style={{ background: 'rgba(48,209,88,0.12)', color: '#30d158', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>YES {m.yes_price}%</span>
                  <span style={{ background: 'rgba(255,69,58,0.12)', color: '#ff453a', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>NO {m.no_price}%</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', minWidth: 70, textAlign: 'right', fontFamily: 'monospace' }}>${(m.volume_24h / 1000).toFixed(0)}k</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}