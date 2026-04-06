import { useEffect, useState } from 'react'
import { BASE } from '../App'

// ─── helpers ────────────────────────────────────────────────────────────────

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

// ─── sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ emoji, title, subtitle, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 16 }}>{emoji}</span>
      <div>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</span>
        {subtitle && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>{subtitle}</span>}
      </div>
      {count != null && (
        <span style={{
          marginLeft: 'auto', fontSize: 11, fontWeight: 600,
          background: 'rgba(255,255,255,0.06)', borderRadius: 6,
          padding: '2px 8px', color: 'rgba(255,255,255,0.4)',
        }}>{count}</span>
      )}
    </div>
  )
}

function MarketCard({ m, highlight }) {
  const side = m.yes_price >= 50 ? 'YES' : 'NO'
  const conf = Math.max(m.yes_price || 0, m.no_price || 0)
  const cc   = confColor(conf)
  const uc   = urgencyColor(m.days_to_close)
  const vol  = shortVol(m.volume_24h)

  return (
    <a
      href={`https://polymarket.com/market/${m.slug}`}
      target="_blank" rel="noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div style={{
        background: highlight ? 'rgba(10,132,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${highlight ? 'rgba(10,132,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 12, padding: '12px 14px', marginBottom: 8,
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = highlight ? 'rgba(10,132,255,0.25)' : 'rgba(255,255,255,0.07)'}
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
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: uc }}>
            ● {m.days_to_close <= 1 ? 'fecha hoje' : m.days_to_close <= 7 ? `fecha em ${m.days_to_close}d` : `${m.days_to_close} dias`}
          </span>
          {vol && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{vol}/24h</span>}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#0a84ff' }}>Ver →</span>
        </div>
      </div>
    </a>
  )
}

function SignalCard({ s }) {
  const dirColor = s.direction === 'bullish' ? '#30d158' : s.direction === 'bearish' ? '#ff453a' : '#ff9f0a'
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, padding: '11px 14px', marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          flexShrink: 0, width: 28, height: 28, borderRadius: 7,
          background: dirColor + '20', color: dirColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700,
        }}>
          {s.direction === 'bullish' ? '↑' : s.direction === 'bearish' ? '↓' : '→'}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 500, color: '#f5f5f7', lineHeight: 1.35 }}>
            {s.market || s.question || s.title || 'Sinal detectado'}
          </p>
          {s.reason && <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{s.reason}</p>}
        </div>
        {s.confidence != null && (
          <span style={{ fontSize: 11, fontWeight: 600, color: confColor(s.confidence), flexShrink: 0 }}>
            {s.confidence}%
          </span>
        )}
      </div>
    </div>
  )
}

// ─── main ────────────────────────────────────────────────────────────────────

export default function Radar() {
  const [markets,  setMarkets]  = useState([])
  const [signals,  setSignals]  = useState([])
  const [anomalies,setAnomalies]= useState([])
  const [recs,     setRecs]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [now] = useState(new Date())

  useEffect(() => {
    Promise.allSettled([
      fetch(`${BASE}/markets?max_days=365`).then(r => r.json()),
      fetch(`${BASE}/signals`).then(r => r.json()),
      fetch(`${BASE}/anomalies`).then(r => r.json()),
      fetch(`${BASE}/recommendations`).then(r => r.json()),
    ]).then(([mRes, sRes, aRes, rRes]) => {
      if (mRes.status === 'fulfilled') setMarkets(Array.isArray(mRes.value) ? mRes.value : [])
      if (sRes.status === 'fulfilled') setSignals(Array.isArray(sRes.value) ? sRes.value : (sRes.value?.signals || []))
      if (aRes.status === 'fulfilled') setAnomalies(Array.isArray(aRes.value) ? aRes.value : (aRes.value?.anomalies || []))
      if (rRes.status === 'fulfilled') setRecs(Array.isArray(rRes.value) ? rRes.value : (rRes.value?.recommendations || []))
      setLoading(false)
    })
  }, [])

  // derived data
  const urgent     = markets.filter(m => m.days_to_close <= 7).sort((a,b) => a.days_to_close - b.days_to_close)
  const highConf   = markets.filter(m => Math.max(m.yes_price||0, m.no_price||0) >= 85 && m.days_to_close <= 60)
                            .sort((a,b) => Math.max(b.yes_price||0,b.no_price||0) - Math.max(a.yes_price||0,a.no_price||0))
                            .slice(0, 5)
  const topVolume  = [...markets].sort((a,b) => (b.volume_24h||0) - (a.volume_24h||0)).slice(0, 4)
  const totalOpps  = markets.filter(m => Math.max(m.yes_price||0,m.no_price||0) >= 80).length

  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Carregando dados...</p>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 60px' }}>

      {/* ── cabeçalho ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
            Radar <span style={{ color: '#0a84ff' }}>PolySignal</span>
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, textTransform: 'capitalize' }}>
            {dateStr} · atualizado às {timeStr}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Mercados ativos', value: markets.length },
            { label: 'Alta confiança', value: totalOpps },
            { label: 'Fechando em 7d', value: urgent.length },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, padding: '8px 14px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── layout 2 colunas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* COLUNA ESQUERDA */}
        <div>

          {/* Apostar agora */}
          <div style={{ marginBottom: 28 }}>
            <SectionHeader emoji="🎯" title="Apostar agora" subtitle="alta confiança · prazo razoável" count={highConf.length} />
            {highConf.length === 0
              ? <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', padding: '12px 0' }}>Nenhum mercado no momento.</p>
              : highConf.map(m => <MarketCard key={m.slug} m={m} highlight />)
            }
          </div>

          {/* Sinais */}
          <div style={{ marginBottom: 28 }}>
            <SectionHeader emoji="⚡" title="Sinais detectados" count={signals.length} />
            {signals.length === 0
              ? <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', padding: '12px 0' }}>Nenhum sinal ativo no momento.</p>
              : signals.slice(0, 5).map((s, i) => <SignalCard key={i} s={s} />)
            }
          </div>

        </div>

        {/* COLUNA DIREITA */}
        <div>

          {/* Fechando em breve */}
          <div style={{ marginBottom: 28 }}>
            <SectionHeader emoji="🔥" title="Fechando em breve" subtitle="máx. 7 dias" count={urgent.length} />
            {urgent.length === 0
              ? <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', padding: '12px 0' }}>Nenhum mercado fechando esta semana.</p>
              : urgent.slice(0, 5).map(m => <MarketCard key={m.slug} m={m} />)
            }
          </div>

          {/* Maior volume */}
          <div style={{ marginBottom: 28 }}>
            <SectionHeader emoji="💰" title="Maior volume 24h" count={topVolume.length} />
            {topVolume.map(m => <MarketCard key={m.slug} m={m} />)}
          </div>

          {/* Anomalias */}
          {anomalies.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <SectionHeader emoji="🔍" title="Anomalias" count={anomalies.length} />
              {anomalies.slice(0, 3).map((a, i) => <SignalCard key={i} s={a} />)}
            </div>
          )}

        </div>
      </div>

      {/* ── rodapé ── */}
      <div style={{
        marginTop: 8, paddingTop: 20,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: 11, color: 'rgba(255,255,255,0.2)',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>PolySignal · dados via Polymarket API</span>
        <span>Não é conselho financeiro</span>
      </div>
    </div>
  )
}