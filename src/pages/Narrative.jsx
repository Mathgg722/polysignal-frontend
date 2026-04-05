import { useState, useEffect } from 'react'
import { BASE } from '../App'

export default function Narrative() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [filtro, setFiltro] = useState('ALL')

  const load = async () => {
    try {
      const r = await fetch(`${BASE}/narrative`)
      const d = await r.json()
      setData(Array.isArray(d) ? d : [])
      setLastUpdate(new Date())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [])

  const filtrados = data.filter(m => filtro === 'ALL' || m.direction === filtro)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Narrative Drift Engine</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>Forca e direcao da narrativa · Motor inspirado em 1984 + Superprevisoes</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#30d158', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '—'}</span>
          <button onClick={load} style={{ background: 'rgba(10,132,255,0.15)', color: '#0a84ff', border: '1px solid rgba(10,132,255,0.3)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>↻</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[{ k: 'ALL', l: 'Todos' }, { k: 'BULLISH', l: '▲ Bullish' }, { k: 'BEARISH', l: '▼ Bearish' }].map(({ k, l }) => (
          <button key={k} onClick={() => setFiltro(k)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: filtro === k ? '#0a84ff' : 'rgba(255,255,255,0.05)',
            color: filtro === k ? '#fff' : 'rgba(255,255,255,0.45)',
            border: `1px solid ${filtro === k ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
          }}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>Carregando narrativas...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtrados.map((m, i) => {
            const cor = m.direction === 'BULLISH' ? '#30d158' : '#ff453a'
            return (
              <div key={i} style={{
                background: '#111114', border: `1px solid rgba(255,255,255,0.06)`,
                borderLeft: `3px solid ${m.forca_color}`,
                borderRadius: 14, padding: '16px 18px',
                animation: `fadeUp 0.2s ease ${i * 0.03}s both`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ background: `${cor}20`, color: cor, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{m.direction}</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#f5f5f7', lineHeight: 1.4 }}>{m.question}</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: m.forca_color, flexShrink: 0 }}>{m.forca}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
                  {[
                    { label: 'Score', value: m.narrative_score, color: m.forca_color },
                    { label: 'Momentum', value: m.momentum, color: '#0a84ff' },
                    { label: 'Convicao', value: `${m.convicao}%`, color: '#bf5af2' },
                    { label: 'Vol 24h', value: `$${(m.volume_24h / 1000).toFixed(0)}k`, color: 'rgba(255,255,255,0.5)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>{m.interpretacao}</div>

                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.narrative_score}%`, background: m.forca_color, borderRadius: 2, transition: 'width 0.6s ease' }} />
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