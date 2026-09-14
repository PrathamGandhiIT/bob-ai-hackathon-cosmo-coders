import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Search, Sun, Moon, Bell, ChevronDown, Compass, Home } from 'lucide-react'

const ROUTE_LABELS = {
  '/': 'Overview Dashboard',
  '/disruptions': 'Disruptions Radar',
  '/shipments': 'Shipments & Rerouting',
  '/fleet': 'Fleet Optimization',
  '/cold-chain': 'Cold Chain Guard',
  '/copilot': 'AI Copilot Assistant',
  '/actions': 'Supply Action Center',
  '/analytics': 'Pipeline & ESG Analytics',
}

export default function TopHeader({ onOpenSearch }) {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const currentTitle = ROUTE_LABELS[location.pathname] || 'Supply Chain Workspace'

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        onOpenSearch?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onOpenSearch])

  return (
    <header className="top-header">
      {/* Left: Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Home"
        >
          <Home size={15} />
        </button>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>/</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {currentTitle}
        </span>
      </div>

      {/* Right: Search, Theme Toggle, Notifications, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search Bar with shortcut */}
        <div
          onClick={() => onOpenSearch?.()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '9999px',
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            minWidth: '220px',
            transition: 'border-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-card)')}
        >
          <Search size={14} color="var(--text-muted)" />
          <span style={{ flex: 1 }}>Search or command...</span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '2px 5px',
              color: 'var(--text-muted)',
            }}
          >
            Ctrl K
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: '1px solid var(--border-card)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Moon size={16} color="#facc15" /> : <Sun size={16} color="#f59e0b" />}
        </button>

        {/* Notification Bell with pulse */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid var(--border-card)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="4 Urgent Supply Chain Alerts"
          >
            <Bell size={16} />
          </button>
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-pink)',
              boxShadow: '0 0 8px var(--brand-pink)',
            }}
          />
        </div>

        {/* User Profile Avatar Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '9999px',
            padding: '4px 12px 4px 6px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            HD
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Harshit Dhanani
          </span>
          <ChevronDown size={12} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  )
}
