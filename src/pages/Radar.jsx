import { useEffect, useState, useCallback } from 'react'
import { BASE } from '../App'

function urgencyColor(days) {
  if (days <= 3)  return '#ff453a'
  if (days <= 7)  return '#ff9f0a'
  if (days <= 30) return '#ffd60a'
  return '#30d158'
}

function confColor(conf) {
  if (conf >= 90) return '#30d158'
  if (conf >= 80) return '#0a84ff'
  return '#ff9f0a'
}

function shortVol(v) {
  if (!v) return null
  if (v >= 1_000_000) return '$' + (v / 1_000_000).toFixed(1) + 'M'
  if (v >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k'
  return '$' + v.toFixed(0)
}

function calcReturn(price) {
  if (!price || price <= 0 || price >= 100) return null
  return ((100 / price - 1) * 100).toFixed(1)
}

function SectionHeader({ emoji, title, subtitle, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 15 }}>{emoji}</span>
      <div>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</span>
        {subtitle && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>{subtitle}</span>}
      </div>
      {count != null && (
        <span style={{
          marginLeft: 'auto', fontSize: 11, fontWeight: 600,
          background: 'rgba(255,255,255,0.06)', borderRadius: 6,
          padding: '2px 8px', color: 'rgba(255,255,255,0.35)',
        }}>{count}</span>
      )}
    </div>
  )
}

function MarketCard({ m, showReturn }) {
  const isBuy     = m.yes_price >= 50
  const side      = isBuy ? 'YES' : 'NO'
  const sidePrice = isBuy ? m.yes_price : m.no_price
  const conf      = Math.max(m.yes_price || 0, m.no_price || 0)
  const cc        = confColor(conf)
  const uc        = urgencyColor(m.days_to_close)
  const vol       = shortVol(m.volume_24h)
  const ret       = showReturn ? calcReturn(sidePrice) : null

  return (
    <a
      href={`https://polymarket.com/market/${m.slug}`}
      target="_blank" rel="noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          background: showReturn ? 'rgba(10,132,255,0.05)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${showReturn ? 'rgba(10,132,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 12, padding: '12px 14px', marginBottom: 8,
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = showReturn ? 'rgba(10,132,255,0.2)' : 'rgba(255,255,255,0.07)'}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
          <p style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.4, margin: 0, color: '#f5f5f7' }}>
            {m.question}
          </p>
          <div style={{
            flexShrink: 0, fontSize: 12, fontWeight: 700,
            background: cc + '20', color: cc,
            border: `1px solid ${cc}44`,
            borderRadius: 7, padding: '3px 9px',
          }}>
            {side} {conf}%
          </div>
        </div>
        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, marginBottom: 9 }}>
          <div style={{ height: 2, width: conf + '%', background: cc, borderRadius: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: uc }}>
            ● {m.days_to_close <= 1 ? 'fecha hoje' : m.days_to_close <= 7 ? `fecha em ${m.days_to_close}d` : `${m.days_to_close} dias`}
          </span>
          {vol && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{vol}/24h</span>}
          {ret && (
            <span style={{
              marginLeft: 'auto', fontSize: 11, fontWeight: 600,
              color: '#30d158', background: 'rgba(48,209,88,0.1)',
              border: '1px solid rgba(48,209,88,0.2)',
              borderRadius: 6, padding: '2px 7px',
            }}>
              $100 → ${(100 + parseFloat(ret)).toFixed(0)} (+{ret}%)
            </span>
          )}
          {!ret && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#0a84ff' }}>Ver →</span>}
        </div>
      </div>
    </a>
  )
}

function SignalCard({ s }) {
  const isBuy  = s.signal === 'BUY' || s.direction === 'bullish'
  const isSell = s.signal === 'SELL' || s.direction === 'bearish'
  const color  = isBuy ? '#30d158' : isSell ? '#ff453a' : '#ff9f0a'
  const arrow  = isBuy ? '↑' : isSell ? '↓' : '→'
  const label  = isBuy ? 'COMPRAR' : isSell ? 'VENDER' : 'NEUTRO'
  const price  = isBuy ? s.yes_price : s.no_price
  const ret    = price ? calcReturn(price) : null

  return (
    <a
      href={s.slug ? `https://polymarket.com/market/${s.slug}` : '#'}
      target="_blank" rel="noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, padding: '11px 14px', marginBottom: 8,
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{
            flexShrink: 0, width: 30, height: 30, borderRadius: 8,
            background: color + '18', color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700,
          }}>{arrow}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 500, color: '#f5f5f7', lineHeight: 1.35 }}>
              {s.question || s.market || s.title || 'Sinal detectado'}
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color, background: color + '18', borderRadius: 5, padding: '1px 6px' }}>
                {label}
              </span>
              {ret && <span style={{ fontSize: 11, color: '#30d158' }}>+{ret}%</span>}
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}

const REFRESH_INTERVAL = 60 // segundos

export default function Radar() {
  const [markets,   setMarkets]   = useState([])
  const [signals,   setSignals]   = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [lastUpdate,setLastUpdate]= useState(null)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)
  const [refreshing,setRefreshing]= useState(false)

  const fetchData = useCallback((isManual = false) => {
    if (isManual) setRefreshing(true)
    Promise.allSettled([
      fetch(`${BASE}/markets?max_days=365`).then(r => r.json()),
      fetch(`${BASE}/signals`).then(r => r.json()),
      fetch(`${BASE}/anomalies`).then(r => r.json()),
    ]).then(([mRes, sRes, aRes]) => {
      if (mRes.status === 'fulfilled') setMarkets(Array.isArray(mRes.value) ? mRes.value : [])
      if (sRes.status === 'fulfilled') {
        const v = sRes.value
        setSignals(Array.isArray(v) ? v : (v?.signals || []))
      }
      if (aRes.status === 'fulfilled') {
        const v = aRes.value
        setAnomalies(Array.isArray(v) ? v : (v?.anomalies || []))
      }
      setLastUpdate(new Date())
      setCountdown(REFRESH_INTERVAL)
      setLoading(false)
      setRefreshing(false)
    })
  }, [])

  // fetch inicial
  useEffect(() => { fetchData() }, [fetchData])

  // auto-refresh a cada 60s
  useEffect(() => {
    const interval = setInterval(() => fetchData(), REFRESH_INTERVAL * 1000)
    return () => clearInterval(interval)
  }, [fetchData])

  // countdown visual
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(c => c <= 1 ? REFRESH_INTERVAL : c - 1)
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  const urgent   = markets.filter(m => m.days_to_close <= 7).sort((a,b) => a.days_to_close - b.days_to_close)
  const highConf = markets
    .filter(m => Math.max(m.yes_price||0, m.no_price||0) >= 85 && m.days_to_close <= 90)
    .sort((a,b) => Math.max(b.yes_price||0,b.no_price||0) - Math.max(a.yes_price||0,a.no_price||0))
    .slice(0, 5)
  const topVol   = [...markets].sort((a,b) => (b.volume_24h||0) - (a.volume_24h||0)).slice(0, 4)
  const totalHC  = markets.filter(m => Math.max(m.yes_price||0,m.no_price||0) >= 80).length

  const timeStr = lastUpdate
    ? lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—'

  const dateStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>⚡</div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Carregando dados de mercado...</p>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '28px 20px 60px' }}>

      {/* cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
            Radar <span style={{ color: '#0a84ff' }}>PolySignal</span>
          </h1>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0, textTransform: 'capitalize' }}>
            {dateStr}
          </p>
        </div>

        {/* status + refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
            <div>atualizado às {timeStr}</div>
            <div style={{ color: countdown <= 10 ? '#ff9f0a' : 'rgba(255,255,255,0.2)' }}>
              próximo em {countdown}s
            </div>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.6)',
              fontSize: 12, cursor: refreshing ? 'default' : 'pointer',
              opacity: refreshing ? 0.5 : 1, transition: 'opacity 0.2s',
            }}
          >
            {refreshing ? '...' : '↻ Atualizar'}
          </button>
        </div>
      </div>

      {/* métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
        {[
          { label: 'mercados ativos', value: markets.length },
          { label: 'alta confiança', value: totalHC },
          { label: 'fechando em 7d', value: urgent.length },
          { label: 'sinais ativos', value: signals.length },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '8px 12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* grid responsivo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 24,
      }}>

        {/* APOSTAR AGORA */}
        <div>
          <div style={{ marginBottom: 28 }}>
            <SectionHeader emoji="🎯" title="Apostar agora" subtitle="confiança ≥85% · retorno calculado" count={highConf.length} />
            {highConf.length === 0
              ? <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Nenhum mercado no momento.</p>
              : highConf.map(m => <MarketCard key={m.slug} m={m} showReturn />)
            }
          </div>

          <div style={{ marginBottom: 28 }}>
            <SectionHeader emoji="⚡" title="Sinais de compra/venda" count={signals.length} />
            {signals.length === 0
              ? <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Nenhum sinal ativo.</p>
              : signals.slice(0, 5).map((s, i) => <SignalCard key={i} s={s} />)
            }
          </div>
        </div>

        {/* FECHANDO + VOLUME */}
        <div>
          <div style={{ marginBottom: 28 }}>
            <SectionHeader emoji="🔥" title="Fechando esta semana" count={urgent.length} />
            {urgent.length === 0
              ? <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Nenhum mercado fechando em 7 dias.</p>
              : urgent.slice(0, 5).map(m => <MarketCard key={m.slug} m={m} />)
            }
          </div>

          <div style={{ marginBottom: 28 }}>
            <SectionHeader emoji="💰" title="Maior volume 24h" />
            {topVol.map(m => <MarketCard key={m.slug} m={m} />)}
          </div>

          {anomalies.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <SectionHeader emoji="🔍" title="Anomalias detectadas" count={anomalies.length} />
              {anomalies.slice(0, 3).map((a, i) => <SignalCard key={i} s={a} />)}
            </div>
          )}
        </div>
      </div>

      <div style={{
        marginTop: 8, paddingTop: 18,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontSize: 11, color: 'rgba(255,255,255,0.18)',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>PolySignal · dados via Polymarket</span>
        <span>Não é conselho financeiro</span>
      </div>
    </div>
  )
}