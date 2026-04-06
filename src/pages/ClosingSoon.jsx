import { useState, useEffect } from 'react'
import { BASE } from '../App'

export default function ClosingSoon() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [maxDays, setMaxDays] = useState(7)

  const load = async () => {
    try {
      const r = await fetch(`${BASE}/closing_soon?max_days=${maxDays}`)
      const d = await r.json()
      setData(Array.isArray(d) ? d : [])
      setLastUpdate(new Date())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [maxDays])

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Fechando em Breve</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            Mercados com resolucao proxima · Maior urgencia = maior edge potencial
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff453a', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '—'}</span>
          <button onClick={load} style={{ background: 'rgba(10,132,255,0.15)', color: '#0a84ff', border: '1px solid rgba(10,132,255,0.3)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>↻</button>
        </div>
      </div>

      {/* Filtro de prazo */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[
          { days: 1, label: 'Hoje/Amanhã' },
          { days: 3, label: '3 dias' },
          { days: 7, label: '7 dias' },
          { days: 30, label: '30 dias' },
        ].map(({ days, label }) => (
          <button key={days} onClick={() => setMaxDays(days)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: maxDays === days ? '#ff453a' : 'rgba(255,255,255,0.05)',
            color: maxDays === days ? '#fff' : 'rgba(255,255,255,0.45)',
            border: `1px solid ${maxDays === days ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
          }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>Buscando mercados...</div>
      ) : data.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60 }}>
          Nenhum mercado fechando em {maxDays} dias agora.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.map((m, i) => (
            <div key={i} style={{
              background: '#111114',
              border: `1px solid ${m.urgencia_cor}30`,
              borderLeft: `3px solid ${m.urgencia_cor}`,
              borderRadius: 14, padding: '16px 18px',
              animation: `fadeUp 0.2s ease ${i * 0.04}s both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{
                  background: `${m.urgencia_cor}20`, color: m.urgencia_cor,
                  padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, flexShrink: 0,
                }}>{m.urgencia_label}</span>
                <span style={{ flex: 1, fontSize: 13, color: '#f5f5f7', lineHeight: 1.4 }}>{m.question}</span>
                {m.change_24h !== 0 && (
                  <span style={{
                    fontSize: 12, fontFamily: 'monospace', fontWeight: 700, flexShrink: 0,
                    color: m.change_24h > 0 ? '#30d158' : '#ff453a',
                  }}>{m.change_24h > 0 ? '+' : ''}{m.change_24h}%</span>
                )}
              </div>

              {/* Acao */}
              <div style={{
                background: `${m.acao_cor}10`, border: `1px solid ${m.acao_cor}25`,
                borderRadius: 10, padding: '10px 14px', marginBottom: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: m.acao_cor }}>{m.acao}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                  Vol ${(m.volume_24h / 1000).toFixed(0)}k · Score {m.score}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {[
                  { label: 'YES', value: `${m.yes_price}%`, color: '#30d158' },
                  { label: 'NO', value: `${m.no_price}%`, color: '#ff453a' },
                  { label: 'Fecha em', value: `${m.days_to_close}d`, color: m.urgencia_cor },
                  { label: 'Vol 24h', value: `$${(m.volume_24h / 1000).toFixed(0)}k`, color: 'rgba(255,255,255,0.5)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}