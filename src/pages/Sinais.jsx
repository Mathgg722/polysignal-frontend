import { useState, useEffect } from 'react'
import { BASE } from '../App'

export default function Sinais() {
  const [sinais, setSinais] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [filtro, setFiltro] = useState('ALL')
  const [expandido, setExpandido] = useState(null)

  const load = async () => {
    try {
      const r = await fetch(`${BASE}/signals`)
      const data = await r.json()
      setSinais(Array.isArray(data) ? data : [])
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

  const filtrados = sinais.filter(s => filtro === 'ALL' || s.signal === filtro)
  const buys = sinais.filter(s => s.signal === 'BUY').length
  const sells = sinais.filter(s => s.signal === 'SELL').length

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Sinais</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            Movimentos detectados · Kelly Fracionado · atualiza a cada 60s
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

      {/* Stats */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total Sinais', value: sinais.length, color: '#0a84ff' },
            { label: 'BUY', value: buys, color: '#30d158' },
            { label: 'SELL', value: sells, color: '#ff453a' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: '#111114', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '14px 18px',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { k: 'ALL', l: 'Todos' },
          { k: 'BUY', l: '↑ Comprar' },
          { k: 'SELL', l: '↓ Vender' },
        ].map(({ k, l }) => (
          <button key={k} onClick={() => setFiltro(k)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            cursor: 'pointer',
            background: filtro === k ? '#0a84ff' : 'rgba(255,255,255,0.05)',
            color: filtro === k ? '#fff' : 'rgba(255,255,255,0.45)',
            border: `1px solid ${filtro === k ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
          }}>{l}</button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>Carregando sinais...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>
          Nenhum sinal detectado agora.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtrados.map((s, i) => {
            const isBuy = s.signal === 'BUY'
            const cor = isBuy ? '#30d158' : '#ff453a'
            const conf = Math.round((s.confidence || 0) * 100)
            const kelly = s.kelly != null ? Number(s.kelly).toFixed(1) : '—'
            const entryPrice = isBuy ? s.yes_price : s.no_price
            const entryLabel = isBuy ? 'Entrar YES' : 'Entrar NO'
            const isOpen = expandido === i

            // Nível de confiança
            const confColor = conf >= 70 ? '#30d158' : conf >= 40 ? '#ff9f0a' : '#ff453a'
            const confLabel = conf >= 70 ? 'Alta' : conf >= 40 ? 'Média' : 'Baixa'

            return (
              <div key={i} onClick={() => setExpandido(isOpen ? null : i)} style={{
                background: '#111114',
                border: `1px solid ${isOpen ? cor + '40' : 'rgba(255,255,255,0.06)'}`,
                borderLeft: `3px solid ${cor}`,
                borderRadius: 14, padding: '16px 18px',
                animation: `fadeUp 0.2s ease ${i * 0.03}s both`,
                cursor: 'pointer', transition: 'border-color 0.2s',
              }}>
                {/* Linha 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{
                    background: `${cor}20`, color: cor,
                    padding: '3px 10px', borderRadius: 6,
                    fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', flexShrink: 0,
                  }}>{s.signal}</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#f5f5f7', lineHeight: 1.4 }}>{s.question}</span>
                  <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: cor, flexShrink: 0 }}>
                    {s.change_24h > 0 ? '+' : ''}{s.change_24h}%
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{isOpen ? '▲' : '▼'}</span>
                </div>

                {/* Linha 2 — métricas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {[
                    { label: 'YES', value: `${s.yes_price}%`, color: '#30d158' },
                    { label: 'NO', value: `${s.no_price}%`, color: '#ff453a' },
                    { label: 'Kelly', value: `${kelly}%`, color: '#ff9f0a' },
                    { label: 'Vol 24h', value: `$${(s.volume_24h / 1000).toFixed(0)}k`, color: 'rgba(255,255,255,0.5)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px',
                    }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Barra de confiança */}
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Confiança</span>
                    <span style={{ fontSize: 9, fontFamily: 'monospace', color: confColor }}>{conf}% · {confLabel}</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${conf}%`, background: confColor, borderRadius: 2, transition: 'width 0.6s ease' }} />
                  </div>
                </div>

                {/* Expandido — Trade Setup */}
                {isOpen && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'fadeUp 0.15s ease' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>⚡ Trade Setup</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                      {[
                        { label: entryLabel, value: `${entryPrice}%`, color: cor, desc: 'preço de entrada' },
                        { label: 'Stop Loss', value: `${Math.max(5, entryPrice - 12).toFixed(0)}%`, color: '#ff453a', desc: '12% contra posição' },
                        { label: 'Posição Max', value: `${kelly}% banca`, color: '#ff9f0a', desc: 'Kelly fracionado 25%' },
                      ].map(({ label, value, color, desc }) => (
                        <div key={label} style={{
                          background: `${color}08`, border: `1px solid ${color}20`,
                          borderRadius: 10, padding: '10px 12px',
                        }}>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 15, fontFamily: 'monospace', fontWeight: 800, color, marginBottom: 2 }}>{value}</div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>{desc}</div>
                        </div>
                      ))}
                    </div>
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