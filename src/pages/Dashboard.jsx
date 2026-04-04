import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BASE } from '../App'

export default function Dashboard() {
  const [markets, setMarkets] = useState([])
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        fetch(`${BASE}/markets`),
        fetch(`${BASE}/signals`),
      ])
      const m = await mRes.json()
      const s = await sRes.json()
      setMarkets(m)
      setSignals(s)
      setLastUpdate(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [])

  const buys = signals.filter(s => s.signal === 'BUY')
  const sells = signals.filter(s => s.signal === 'SELL')
  const topMarket = [...markets].sort((a, b) => (b.volume_24h || 0) - (a.volume_24h || 0))[0]
  const topSignal = signals[0]

  const Card = ({ label, value, sub, color, onClick }) => (
    <div onClick={onClick} style={{
      background: '#111114', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, padding: '20px 24px', cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
    >
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: color || '#f5f5f7' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>{sub}</div>}
    </div>
  )

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Dashboard</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            Visão geral do sistema
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

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 80 }}>Carregando...</div>
      ) : (
        <>
          {/* Cards de status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
            <Card label="Mercados Ativos" value={markets.length} sub="via Polymarket Gamma API" onClick={() => navigate('/mercados')} />
            <Card label="Sinais Detectados" value={signals.length} sub="BUY + SELL com Kelly" onClick={() => navigate('/sinais')} />
            <Card label="BUY" value={buys.length} color="#30d158" sub="sinal de alta" onClick={() => navigate('/sinais')} />
            <Card label="SELL" value={sells.length} color="#ff453a" sub="sinal de baixa" onClick={() => navigate('/sinais')} />
          </div>

          {/* Top mercado */}
          {topMarket && (
            <div style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>🔥 Maior Volume 24h</div>
              <div style={{ fontSize: 14, color: '#f5f5f7', marginBottom: 12, lineHeight: 1.4 }}>{topMarket.question}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ background: 'rgba(48,209,88,0.12)', color: '#30d158', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>YES {topMarket.yes_price}%</span>
                <span style={{ background: 'rgba(255,69,58,0.12)', color: '#ff453a', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>NO {topMarket.no_price}%</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto', fontFamily: 'monospace' }}>${(topMarket.volume_24h / 1000).toFixed(0)}k vol 24h</span>
              </div>
            </div>
          )}

          {/* Top sinal */}
          {topSignal && (
            <div style={{ background: '#111114', border: `1px solid ${topSignal.signal === 'BUY' ? 'rgba(48,209,88,0.2)' : 'rgba(255,69,58,0.2)'}`, borderRadius: 16, padding: '20px 24px' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>⚡ Sinal Mais Forte</div>
              <div style={{ fontSize: 14, color: '#f5f5f7', marginBottom: 12, lineHeight: 1.4 }}>{topSignal.question}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{
                  background: topSignal.signal === 'BUY' ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)',
                  color: topSignal.signal === 'BUY' ? '#30d158' : '#ff453a',
                  padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 800,
                }}>{topSignal.signal}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                  Kelly {topSignal.kelly?.toFixed(1)}% · Conf {(topSignal.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}