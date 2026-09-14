import { Link, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  Radar,
  PackageSearch,
  Truck,
  Snowflake,
  Bot,
  Zap,
  BarChart3,
  ShieldCheck,
} from 'lucide-react'

const DOCK_ITEMS = [
  { path: '/', label: 'Overview Dashboard', icon: LayoutGrid },
  { path: '/disruptions', label: 'Disruptions Radar', icon: Radar },
  { path: '/shipments', label: 'Shipments & Rerouting', icon: PackageSearch },
  { path: '/fleet', label: 'Fleet Assets', icon: Truck },
  { path: '/cold-chain', label: 'Cold Chain Guard', icon: Snowflake },
  { path: '/copilot', label: 'AI Copilot', icon: Bot },
  { path: '/actions', label: 'Action Center', icon: Zap, badge: '4' },
  { path: '/analytics', label: 'Pipeline Analytics', icon: BarChart3 },
]

export default function FloatingDock() {
  const location = useLocation()

  return (
    <nav className="floating-dock" aria-label="Quick Navigation">
      {/* Brand Chip */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          borderRadius: '9999px',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          marginRight: '6px',
        }}
      >
        <ShieldCheck size={14} color="#6366f1" />
        <span>SupplyGuard</span>
      </Link>

      {/* Dock Icon Buttons */}
      {DOCK_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.path

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`dock-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <Icon size={18} />

            {/* Badge count (e.g. for Action Center) */}
            {item.badge && !isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  fontSize: '9px',
                  fontWeight: 700,
                  backgroundColor: 'var(--brand-pink)',
                  color: '#ffffff',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.badge}
              </span>
            )}

            {/* Active Indicator Dot */}
            {isActive && <span className="dock-dot" />}

            {/* Tooltip on hover */}
            <span className="dock-tooltip">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
