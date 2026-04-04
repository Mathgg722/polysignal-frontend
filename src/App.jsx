import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Sinais from './pages/Sinais'

const BASE = 'https://polymarket-backend-bis2.onrender.com'
export { BASE }

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#0d0d0f', color: '#f5f5f7', fontFamily: '-apple-system, sans-serif' }}>
        
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em' }}>
            Poly<span style={{ color: '#0a84ff' }}>Signal</span>
          </div>
          <nav style={{ display: 'flex', gap: 4 }}>
            {[
              { to: '/', label: 'Dashboard' },
              { to: '/sinais', label: 'Sinais' },
            ].map(({ to, label }) => (
              <NavLink key={to} to={to} end style={({ isActive }) => ({
                padding: '5px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
                color: isActive ? '#f5f5f7' : 'rgba(255,255,255,0.45)',
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
              })}>{label}</NavLink>
            ))}
          </nav>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sinais" element={<Sinais />} />
        </Routes>

      </div>
    </BrowserRouter>
  )
}