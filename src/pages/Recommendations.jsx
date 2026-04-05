import { useState, useEffect } from 'react'
import { BASE } from '../App'

export default function Recommendations() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [expandido, setExpandido] = useState(null)

  const load = async () => {
    try {
      const r = await fetch(`${BASE}/recommendations`)
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
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Melhores Apostas</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            Motor #6 · Score composto: Sinais + Anomalias + Reversao · Consenso entre motores
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0a84ff', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '—'}</span>
          <button onClick={load} style={{ background: 'rgba(10,132,255,0.15)', color: '#0a84ff', border: '1px solid rgba(10,132,255,0.3)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>↻</button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>Calculando melhores apostas...</div>
      ) : data.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>
          Nenhuma aposta com consenso entre motores agora. Volte em alguns minutos.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.map((m, i) => {
            const cor = m.direcao_cor
            const isOpen = expandido === i
            const forcaCor = m.forca === 'FORTE' ? '#30d158' : m.forca === 'MEDIA' ? '#ff9f0a' : '#ff453a'
            const rank = i + 1

            return (
              <div key={i} onClick={() => setExpandido(isOpen ? null : i)} style={{
                background: '#111114',
                border: `1px solid ${isOpen ? cor + '50' : rank === 1 ? cor + '30' : 'rgba(255,255,255,0.06)'}`,
                borderLeft: `3px solid ${cor}`,
                borderRadius: 14, padding: '18px 20px',
                animation: `fadeUp 0.2s ease ${i * 0.05}s both`,
                cursor: 'pointer', transition: 'border-color 0.2s',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: rank === 1 ? cor : 'rgba(255,255,255,0.08)',
                    color: rank === 1 ? '#fff' : 'rgba(255,255,255,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, flexShrink: 0,
                  }}>#{rank}</div>
                  <span style={{
                    background: `${cor}20`, color: cor,
                    padding: '3px 10px', borderRadius: 6,
                    fontSize: 11, fontWeight: 800, flexShrink: 0,
                  }}>{m.direcao}</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#f5f5f7', lineHeight: 1.4, fontWeight: 500 }}>{m.question}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{isOpen ? '▲' : '▼'}</span>
                </div>

                {/* Acao em destaque */}
                <div style={{
                  background: `${cor}10`, border: `1px solid ${cor}25`,
                  borderRadius: 10, padding: '10px 14px', marginBottom: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: cor }}>{m.acao}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                    Kelly {m.kelly}% · Vol ${(m.volume_24h / 1000).toFixed(0)}k
                  </span>
                </div>

                {/* Scores dos motores */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
                  {[
                    { label: 'Score Total', value: m.score_total, color: forcaCor },
                    { label: 'Sinal', value: m.sinal_score, color: '#0a84ff' },
                    { label: 'Anomalia', value: m.anomalia_score, color: '#ff9f0a' },
                    { label: 'Reversao', value: m.reversao_score, color: '#bf5af2' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Motores que confirmam */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  {m.motores.map(motor => (
                    <span key={motor} style={{
                      background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
                      padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                    }}>✓ {motor}</span>
                  ))}
                </div>

                {/* Barra de score */}
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(m.score_total * 1.5, 100)}%`, background: cor, borderRadius: 2, transition: 'width 0.6s ease' }} />
                </div>

                {/* Expandido */}
                {isOpen && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'fadeUp 0.15s ease' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Detalhes do Trade</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                      {[
                        { label: 'YES', value: `${m.yes_price}%`, color: '#30d158' },
                        { label: 'NO', value: `${m.no_price}%`, color: '#ff453a' },
                        { label: 'Media Hist.', value: m.yes_price_media ? `${m.yes_price_media}%` : '—', color: '#bf5af2' },
                        { label: 'Variacao 24h', value: `${m.change_24h > 0 ? '+' : ''}${m.change_24h}%`, color: m.change_24h > 0 ? '#30d158' : '#ff453a' },
                        { label: 'Kelly', value: `${m.kelly}% banca`, color: '#ff9f0a' },
                        { label: 'Forca', value: m.forca, color: forcaCor },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: `${cor}08`, border: `1px solid ${cor}15`, borderRadius: 10, padding: '10px 12px' }}>
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