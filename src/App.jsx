import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Radar from './pages/Radar'
import Mercados from './pages/Mercados'
import Resolution from './pages/Resolution'
import Dashboard from './pages/Dashboard'
import Sinais from './pages/Sinais'
import Reversion from './pages/Reversion'
import Anomalies from './pages/Anomalies'
import Recommendations from './pages/Recommendations'
import ClosingSoon from './pages/ClosingSoon'
import HighConfidence from './pages/HighConfidence'

const BASE = 'https://polysignal-backend.onrender.com'
export { BASE }

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#0d0d0f', color: '#f5f5f7', fontFamily: '-apple-system, sans-serif' }}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px', height: 52,
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em', flexShrink: 0 }}>
            Poly<span style={{ color: '#0a84ff' }}>Signal</span>
          </div>
          <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { to: '/',           label: '⚡ Radar'   },
              { to: '/mercados',   label: 'Mercados'   },
              { to: '/resolution', label: '⚠️ Regras'  },
            ].map(({ to, label }) => (
              <NavLink key={to} to={to} end style={({ isActive }) => ({
                padding: '5px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
                color: isActive ? '#f5f5f7' : 'rgba(255,255,255,0.4)',
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                transition: 'all 0.15s',
              })}>{label}</NavLink>
            ))}
          </nav>
        </div>
        <Routes>
          <Route path="/"             element={<Radar />} />
          <Route path="/mercados"     element={<Mercados />} />
          <Route path="/resolution"   element={<Resolution />} />
          {/* rotas legadas */}
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/recommendations"element={<Recommendations />} />
          <Route path="/closing"        element={<ClosingSoon />} />
          <Route path="/high-confidence"element={<HighConfidence />} />
          <Route path="/sinais"         element={<Sinais />} />
          <Route path="/anomalies"      element={<Anomalies />} />
          <Route path="/reversion"      element={<Reversion />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}