import { useState, useEffect } from 'react'
import { BASE } from '../App'

export default function Sinais() {
  const [sinais, setSinais] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [filtro, setFiltro] = useState('ALL')

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

  const filtrados = sinais.filter(s => filtro === 'ALL' || s.sinal === filtro)
  const buys = sinais.filter(s => s.sinal === 'BUY').length
  const sells = sinais.filter(s => s.sinal === 'SELL').length

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
            const isBuy = s.sinal === 'BUY'
            const cor = isBuy ? '#30d158' : '#ff453a'
            const conf = s.confianca || 0
            const kelly = s.kelly_pct || 0

            return (
              <div key={i} style={{
                background: '#111114',
                border: `1px solid rgba(255,255,255,0.06)`,
                borderLeft: `3px solid ${cor}`,
                borderRadius: 14, padding: '16px 18px',
                animation: `fadeUp 0.2s ease ${i * 0.03}s both`,
              }}>
                {/* Linha 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{
                    background: `${cor}20`, color: cor,
                    padding: '3px 10px', borderRadius: 6,
                    fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', flexShrink: 0,
                  }}>{s.sinal}</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#f5f5f7', lineHeight: 1.4 }}>{s.question}</span>
                  <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: cor, flexShrink: 0 }}>
                    {s.change_24h > 0 ? '+' : ''}{s.change_24h}%
                  </span>
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
                    <span style={{ fontSize: 9, fontFamily: 'monospace', color: cor }}>{conf}%</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${conf}%`, background: cor, borderRadius: 2, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}