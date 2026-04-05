import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BASE } from '../App'

export default function Dashboard() {
  const [markets, setMarkets] = useState([])
  const [signals, setSignals] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const [mRes, sRes, rRes, aRes, stRes] = await Promise.all([
        fetch(`${BASE}/markets`),
        fetch(`${BASE}/signals`),
        fetch(`${BASE}/recommendations`),
        fetch(`${BASE}/anomalies`),
        fetch(`${BASE}/status`),
      ])
      setMarkets(await mRes.json())
      setSignals(await sRes.json())
      setRecommendations(await rRes.json())
      setAnomalies(await aRes.json())
      setStatus(await stRes.json())
      setLastUpdate(new Date())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [])

  const buys = signals.filter(s => s.signal === 'BUY')
  const sells = signals.filter(s => s.signal === 'SELL')
  const topAnomaly = anomalies[0]
  const topRec = recommendations[0]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Dashboard</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>Centro de comando · PolySignal</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#30d158', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '—'}</span>
          <button onClick={load} style={{ background: 'rgba(10,132,255,0.15)', color: '#0a84ff', border: '1px solid rgba(10,132,255,0.3)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>↻</button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 80 }}>Carregando...</div>
      ) : (
        <>
          {/* Cards de status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Mercados', value: markets.length, sub: 'ativos', color: '#f5f5f7', path: '/mercados' },
              { label: 'Sinais', value: signals.length, sub: 'detectados', color: '#0a84ff', path: '/sinais' },
              { label: 'BUY', value: buys.length, sub: 'alta', color: '#30d158', path: '/sinais' },
              { label: 'SELL', value: sells.length, sub: 'baixa', color: '#ff453a', path: '/sinais' },
            ].map(({ label, value, sub, color, path }) => (
              <div key={label} onClick={() => navigate(path)} style={{
                background: '#111114', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Status do banco */}
          {status && (
            <div style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 18px', marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { label: 'Snapshots', value: status.total_snapshots?.toLocaleString(), color: '#bf5af2' },
                { label: 'Banco', value: status.db_connected ? 'Conectado' : 'Offline', color: status.db_connected ? '#30d158' : '#ff453a' },
                { label: 'Worker', value: status.worker_healthy ? 'Ativo' : 'Parado', color: status.worker_healthy ? '#30d158' : '#ff453a' },
                { label: 'Alertas Enviados', value: status.alerts_sent, color: '#ff9f0a' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'monospace' }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Top Recomendacao */}
          {topRec && (
            <div onClick={() => navigate('/recommendations')} style={{
              background: '#111114',
              border: `1px solid ${topRec.direcao_cor}40`,
              borderLeft: `3px solid ${topRec.direcao_cor}`,
              borderRadius: 14, padding: '18px 20px', marginBottom: 12, cursor: 'pointer',
              animation: 'fadeUp 0.2s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚡ Melhor Aposta Agora</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>ver todas →</span>
              </div>
              <div style={{ fontSize: 14, color: '#f5f5f7', marginBottom: 10, lineHeight: 1.4, fontWeight: 500 }}>{topRec.question}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: `${topRec.direcao_cor}20`, color: topRec.direcao_cor, padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 800 }}>{topRec.acao}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>Kelly {topRec.kelly}% · Score {topRec.score_total}</span>
                <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                  {topRec.motores.map(m => (
                    <span key={m} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 600 }}>✓ {m}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top Anomalia */}
          {topAnomaly && (
            <div onClick={() => navigate('/anomalies')} style={{
              background: '#111114',
              border: `1px solid ${topAnomaly.tipo_cor}30`,
              borderLeft: `3px solid ${topAnomaly.tipo_cor}`,
              borderRadius: 14, padding: '18px 20px', marginBottom: 12, cursor: 'pointer',
              animation: 'fadeUp 0.25s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🚨 Anomalia Mais Forte</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>ver todas →</span>
              </div>
              <div style={{ fontSize: 14, color: '#f5f5f7', marginBottom: 10, lineHeight: 1.4, fontWeight: 500 }}>{topAnomaly.question}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ background: `${topAnomaly.tipo_cor}20`, color: topAnomaly.tipo_cor, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>{topAnomaly.tipo}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>Score {topAnomaly.anomaly_score} · Z {topAnomaly.preco_zscore}</span>
              </div>
            </div>
          )}

          {/* Top 3 Recomendacoes */}
          {recommendations.length > 0 && (
            <div style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Top Apostas do Momento</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recommendations.slice(0, 3).map((r, i) => (
                  <div key={i} onClick={() => navigate('/recommendations')} style={{
                    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                    padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', minWidth: 20, fontFamily: 'monospace' }}>#{i + 1}</span>
                    <span style={{ background: `${r.direcao_cor}20`, color: r.direcao_cor, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{r.direcao}</span>
                    <span style={{ flex: 1, fontSize: 12, color: '#f5f5f7', lineHeight: 1.3 }}>{r.question}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', flexShrink: 0 }}>Kelly {r.kelly}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}