import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Package, AlertTriangle, Truck, Snowflake, Bot, ArrowRight } from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Overview Dashboard', path: '/', category: 'Navigation', icon: Package },
  { label: 'Disruptions Radar (Active Port Strikes & Storms)', path: '/disruptions', category: 'Incidents', icon: AlertTriangle },
  { label: 'Shipment SHP-104 (Vaccines - Mumbai to Delhi)', path: '/shipments', category: 'Shipments', icon: Package },
  { label: 'Shipment SHP-101 (Electronics - JNPT Blocked)', path: '/shipments', category: 'Shipments', icon: Package },
  { label: 'Fleet Asset FL-201 (Idle Reefer Truck - Pune Hub)', path: '/fleet', category: 'Fleet Assets', icon: Truck },
  { label: 'Cold Chain Guard (5 Active Excursions)', path: '/cold-chain', category: 'Sensors', icon: Snowflake },
  { label: 'Ask AI Copilot for Recovery Plan', path: '/copilot', category: 'AI Intelligence', icon: Bot },
]

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filtered = QUICK_LINKS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560, padding: 0 }}>
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-card)', gap: 12 }}>
          <Search size={18} color="var(--brand-primary)" />
          <input
            autoFocus
            type="text"
            placeholder="Search shipments, disruptions, fleet assets, or actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No matching records or actions found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--brand-primary)',
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              )
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-card)',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-muted)',
            borderRadius: '0 0 20px 20px',
          }}
        >
          <span>Use <strong>Esc</strong> to close</span>
          <span><strong>SupplyGuard AI</strong> Command Palette</span>
        </div>
      </div>
    </div>
  )
}
