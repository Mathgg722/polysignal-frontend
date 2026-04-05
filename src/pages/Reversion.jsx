import { useState, useEffect } from 'react'
import { BASE } from '../App'

export default function Reversion() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [filtro, setFiltro] = useState('ALL')
  const [expandido, setExpandido] = useState(null)

  const load = async () => {
    try {
      const r = await fetch(`${BASE}/reversion`)
      const d = await r.json()
      setData(Array.isArray(d) ? d : [])
      setLastUpdate(new Date())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [])

  const filtrados = data.filter(m => filtro === 'ALL' || m.direcao === filtro)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Reversão à Média</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            Motor #3 · Preço atual vs média histórica do banco · Z-Score + Desvio %
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#bf5af2', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '—'}</span>
          <button onClick={load} style={{ background: 'rgba(10,132,255,0.15)', color: '#0a84ff', border: '1px solid rgba(10,132,255,0.3)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>↻</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[{ k: 'ALL', l: 'Todos' }, { k: 'BUY', l: '▲ Comprar YES' }, { k: 'SELL', l: '▼ Comprar NO' }].map(({ k, l }) => (
          <button key={k} onClick={() => setFiltro(k)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: filtro === k ? '#0a84ff' : 'rgba(255,255,255,0.05)',
            color: filtro === k ? '#fff' : 'rgba(255,255,255,0.45)',
            border: `1px solid ${filtro === k ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
          }}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>Calculando reversões...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>Nenhuma reversão detectada.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtrados.map((m, i) => {
            const cor = m.direcao_cor
            const isOpen = expandido === i
            const forcaCor = m.forca === 'FORTE' ? '#30d158' : m.forca === 'MEDIA' ? '#ff9f0a' : '#ff453a'

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
                  <span style={{ background: `${cor}20`, color: cor, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{m.direcao}</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#f5f5f7', lineHeight: 1.4 }}>{m.question}</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: forcaCor, flexShrink: 0 }}>{m.forca}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{isOpen ? '▲' : '▼'}</span>
                </div>

                {/* Métricas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
                  {[
                    { label: 'Score', value: m.score, color: forcaCor },
                    { label: 'Atual', value: `${m.yes_price_atual}%`, color: '#f5f5f7' },
                    { label: 'Média Hist.', value: `${m.yes_price_media}%`, color: '#bf5af2' },
                    { label: 'Desvio', value: `${m.desvio_pct > 0 ? '+' : ''}${m.desvio_pct}%`, color: cor },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginBottom: 8 }}>{m.interpretacao}</div>

                {/* Barra de score */}
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.score}%`, background: cor, borderRadius: 2, transition: 'width 0.6s ease' }} />
                </div>

                {/* Expandido */}
                {isOpen && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'fadeUp 0.15s ease' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>⚡ Trade Setup</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
                      {[
                        { label: 'Acao', value: m.acao, color: cor },
                        { label: 'Z-Score', value: m.zscore, color: '#bf5af2' },
                        { label: 'Snapshots', value: m.total_snaps, color: 'rgba(255,255,255,0.5)' },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: `${cor}08`, border: `1px solid ${cor}20`, borderRadius: 10, padding: '10px 12px' }}>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 800, color }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                      {[
                        { label: 'Mínimo Hist.', value: `${m.yes_price_min}%`, color: '#ff453a' },
                        { label: 'Média Hist.', value: `${m.yes_price_media}%`, color: '#bf5af2' },
                        { label: 'Máximo Hist.', value: `${m.yes_price_max}%`, color: '#30d158' },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px' }}>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 800, color }}>{value}</div>
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