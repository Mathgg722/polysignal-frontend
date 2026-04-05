import { useState, useEffect } from 'react'
import { BASE } from '../App'

export default function Orphans() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  const load = async () => {
    try {
      const r = await fetch(`${BASE}/orphans`)
      const d = await r.json()
      setData(Array.isArray(d) ? d : [])
      setLastUpdate(new Date())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [])

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Mercados Orfaos</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>Motor #44 · Volume abaixo de $50k · Maxima ineficiencia · Maior edge potencial</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff9f0a', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '—'}</span>
          <button onClick={load} style={{ background: 'rgba(10,132,255,0.15)', color: '#0a84ff', border: '1px solid rgba(10,132,255,0.3)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>↻</button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>Carregando mercados orfaos...</div>
      ) : data.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>
          Nenhum mercado orfao encontrado agora.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.map((m, i) => {
            const tierColor = m.tier === 'orfao' ? '#ff9f0a' : '#bf5af2'
            const change = m.change_24h
            const changeColor = change > 0 ? '#30d158' : change < 0 ? '#ff453a' : 'rgba(255,255,255,0.3)'
            return (
              <div key={i} style={{
                background: '#111114', border: '1px solid rgba(255,255,255,0.06)',
                borderLeft: `3px solid ${tierColor}`,
                borderRadius: 14, padding: '16px 18px',
                animation: `fadeUp 0.2s ease ${i * 0.03}s both`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ background: `${tierColor}20`, color: tierColor, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, flexShrink: 0, textTransform: 'uppercase' }}>{m.tier}</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#f5f5f7', lineHeight: 1.4 }}>{m.question}</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: changeColor, flexShrink: 0 }}>{change > 0 ? '+' : ''}{change}%</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {[
                    { label: 'Ineficiencia', value: `${m.ineficiencia_score}`, color: tierColor },
                    { label: 'YES', value: `${m.yes_price}%`, color: '#30d158' },
                    { label: 'NO', value: `${m.no_price}%`, color: '#ff453a' },
                    { label: 'Vol Total', value: `$${(m.volume / 1000).toFixed(1)}k`, color: 'rgba(255,255,255,0.5)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}