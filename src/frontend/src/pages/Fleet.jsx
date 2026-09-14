import { useState, useEffect } from 'react'
import { fetchFleet } from '../services/api'
import {
  Truck,
  Snowflake,
  MapPin,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react'

export default function Fleet() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchFleet()
      .then(setData)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="skeleton" style={{ height: 120, borderRadius: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    )
  }

  const { vehicles = [], summary = {} } = data || {}
  const filtered = vehicles.filter((v) => {
    if (statusFilter === 'all') return true
    return v.status?.toLowerCase() === statusFilter.toLowerCase()
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── 1. Page Header (Vidur Style) ────────────────────────── */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Fleet Asset Optimization
                </h1>
                <span
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--brand-primary-light)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Absorption Engine
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {summary.total_vehicles || 0} commercial transport assets •{' '}
                <strong style={{ color: 'var(--brand-emerald)' }}>{summary.idle || 0} idle units ready</strong> for cargo absorption.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'idle', 'in transit', 'maintenance'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="btn-pill"
                style={{
                  textTransform: 'capitalize',
                  background: statusFilter === s ? 'var(--text-primary)' : 'transparent',
                  color: statusFilter === s ? 'var(--bg-app)' : 'var(--text-secondary)',
                }}
              >
                {s === 'all' ? 'All Vehicles' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Metric Cards Grid ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Vehicles
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {summary.total_vehicles || 0}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>Dedicated fleet assets</div>
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Idle & Ready
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--brand-emerald)', marginTop: 4 }}>
            {summary.idle || 0}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--brand-emerald)', marginTop: 2 }}>Ready for spot absorption</div>
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Idle Reefer Trucks
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--brand-cyan)', marginTop: 4 }}>
            {summary.refrigerated_idle || 2}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--brand-cyan)', marginTop: 2 }}>Active cold-chain ready</div>
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Avg. Fleet Utilization
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--brand-primary-light)', marginTop: 4 }}>
            {summary.average_utilization || 74}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>Target benchmark &gt;80%</div>
        </div>
      </div>

      {/* ── 3. Vehicle Cards Grid ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map((v) => {
          const isIdle = v.status === 'Idle'
          const isReefer = v.is_refrigerated

          return (
            <div
              key={v.vehicle_id}
              className="glass-card"
              style={{
                padding: '20px',
                borderTop: isIdle ? '3px solid var(--brand-emerald)' : '1px solid var(--border-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {v.vehicle_id}
                    </span>
                    {isReefer && (
                      <span
                        style={{
                          backgroundColor: 'rgba(6, 182, 212, 0.15)',
                          color: 'var(--brand-cyan)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <Snowflake size={10} /> Reefer
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                    {v.vehicle_type} • {v.capacity_tons} Tons Capacity
                  </div>
                </div>

                <span
                  style={{
                    backgroundColor:
                      isIdle
                        ? 'rgba(16, 185, 129, 0.15)'
                        : v.status === 'In Transit'
                        ? 'rgba(99, 102, 241, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)',
                    color:
                      isIdle
                        ? 'var(--brand-emerald)'
                        : v.status === 'In Transit'
                        ? 'var(--brand-primary-light)'
                        : 'var(--brand-amber)',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {v.status}
                </span>
              </div>

              {/* Location & Depot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 14 }}>
                <MapPin size={13} color="var(--text-muted)" />
                <span>Stationed at: <strong>{v.location || v.current_location || 'Regional Hub'}</strong></span>
              </div>

              {/* Utilization Bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>Capacity Load</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.utilization_pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, backgroundColor: 'var(--bg-subtle)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${v.utilization_pct}%`,
                      backgroundColor:
                        v.utilization_pct > 80
                          ? 'var(--brand-pink)'
                          : v.utilization_pct > 40
                          ? 'var(--brand-primary)'
                          : 'var(--brand-emerald)',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>

              {/* Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {isIdle ? (
                  <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }}>
                    <Zap size={12} />
                    <span>Assign to Reroute</span>
                  </button>
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    ETA: {v.eta || 'In Transit'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
