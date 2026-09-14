import { useState, useEffect } from 'react'
import { fetchDisruptions, fetchDisruption, simulateDisruption, resetSimulation } from '../services/api'
import {
  Radar,
  AlertTriangle,
  Clock,
  MapPin,
  X,
  Package,
  Compass,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'

export default function Disruptions() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [severityFilter, setSeverityFilter] = useState('all')
  const [simulating, setSimulating] = useState(false)

  const loadDisruptions = async () => {
    try {
      setLoading(true)
      const res = await fetchDisruptions()
      setData(res)
    } catch (err) {
      console.error('Failed to load disruptions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDisruptions()
  }, [])

  const openDetail = async (id) => {
    setSelected(id)
    try {
      const d = await fetchDisruption(id)
      setDetail(d)
    } catch (e) {
      console.error('Failed to fetch detail:', e)
    }
  }

  const handleSimulate = async () => {
    setSimulating(true)
    try {
      if (data?.simulation_active) {
        await resetSimulation()
      } else {
        await simulateDisruption()
      }
      await loadDisruptions()
    } catch (e) {
      console.error('Simulation error:', e)
    } finally {
      setSimulating(false)
    }
  }

  const disruptionsList = data?.disruptions || []
  const filtered = disruptionsList.filter((d) => {
    if (severityFilter === 'all') return true
    return d.severity?.toLowerCase() === severityFilter.toLowerCase()
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
                backgroundColor: 'rgba(236, 72, 153, 0.12)',
                color: 'var(--brand-pink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Radar size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Disruptions Radar
                </h1>
                <span
                  style={{
                    backgroundColor: 'rgba(236, 72, 153, 0.15)',
                    color: 'var(--brand-pink)',
                    border: '1px solid rgba(236, 72, 153, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Live Interception
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {disruptionsList.length} active maritime, geopolitical & port bottlenecks correlated against global cargo.
              </p>
            </div>
          </div>

          {/* Simulation Button */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="btn-primary"
            style={{
              background: data?.simulation_active
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
            }}
          >
            <Compass size={15} />
            <span>
              {simulating
                ? 'Updating...'
                : data?.simulation_active
                ? 'Reset Simulation'
                : 'Simulate JNPT Port Strike'}
            </span>
          </button>
        </div>

        {/* Severity Filter Pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {['all', 'critical', 'high', 'medium'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className="btn-pill"
              style={{
                textTransform: 'capitalize',
                background: severityFilter === sev ? 'var(--text-primary)' : 'transparent',
                color: severityFilter === sev ? 'var(--bg-app)' : 'var(--text-secondary)',
              }}
            >
              {sev === 'all' ? 'All Severities' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Disruption Incident Cards ────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading disruption feed...
          </div>
        ) : filtered.map((d) => {
          const isCrit = d.severity === 'Critical'
          return (
            <div
              key={d.disruption_id}
              className="glass-card"
              style={{
                padding: '20px',
                borderLeft: `4px solid ${isCrit ? 'var(--brand-pink)' : 'var(--brand-amber)'}`,
                cursor: 'pointer',
              }}
              onClick={() => openDetail(d.disruption_id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span
                      style={{
                        backgroundColor: isCrit ? 'rgba(236, 72, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: isCrit ? 'var(--brand-pink)' : 'var(--brand-amber)',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {d.severity}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.disruption_id}</span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {d.disruption_type} — {d.affected_region}
                  </h3>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 12, maxWidth: '800px' }}>
                    {d.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} color="var(--brand-primary)" />
                      {d.affected_region}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} color="var(--brand-amber)" />
                      Est. Delay: {d.delay_estimate_hours || 48} hours
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Package size={13} color="var(--brand-pink)" />
                      <strong>{d.affected_shipment_count || 0} shipments impacted</strong>
                    </span>
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  <span>Impacted Cargo</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 3. Disruption Detail Modal ───────────────────────────── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Disruption Analysis: {selected}
              </h3>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {detail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{detail.description}</p>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>
                  Impacted Shipments ({detail.affected_shipments?.length || 0})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '240px', overflowY: 'auto' }}>
                  {(detail.affected_shipments || []).map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {s.shipment_id} — {s.cargo_description}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.route}</div>
                      </div>
                      <span
                        style={{
                          backgroundColor: 'rgba(236, 72, 153, 0.15)',
                          color: 'var(--brand-pink)',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '10px',
                          fontWeight: 700,
                        }}
                      >
                        {s.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
