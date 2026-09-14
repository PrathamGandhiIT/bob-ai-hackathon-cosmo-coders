import { useState, useEffect } from 'react'
import { fetchShipments, fetchShipment } from '../services/api'
import {
  Package,
  Search,
  Zap,
  ArrowRight,
  Truck,
  Snowflake,
  AlertTriangle,
  X,
  CheckCircle2,
  Filter,
} from 'lucide-react'

export default function Shipments() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  const [reroutedSuccess, setReroutedSuccess] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const params = {}
        if (statusFilter) params.status = statusFilter
        if (priorityFilter) params.priority = priorityFilter
        const res = await fetchShipments(params)
        setData(res)
      } catch (err) {
        console.error('Failed to load shipments:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [statusFilter, priorityFilter])

  const openDetail = async (shipmentId) => {
    setSelectedShipment(shipmentId)
    setDetailLoading(true)
    setReroutedSuccess(false)
    try {
      const res = await fetchShipment(shipmentId)
      setDetail(res)
    } catch (err) {
      console.error('Failed to fetch shipment detail:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  const shipmentsList = data?.shipments || []
  const filteredShipments = shipmentsList.filter((s) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      s.shipment_id?.toLowerCase().includes(q) ||
      s.cargo_description?.toLowerCase().includes(q) ||
      s.origin?.toLowerCase().includes(q) ||
      s.destination?.toLowerCase().includes(q)
    )
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
              <Package size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Shipments & Rerouting
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
                  Manifest Intelligence
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {data?.total || 0} multimodal shipments monitored across active global logistics lanes.
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-card)',
              borderRadius: '9999px',
              padding: '6px 14px',
              minWidth: '260px',
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search ID, cargo, origin, destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '12px',
                color: 'var(--text-primary)',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Filter size={12} /> Status:
          </span>
          {['', 'In Transit', 'Delayed', 'Delivered', 'At Origin'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="btn-pill"
              style={{
                background: statusFilter === st ? 'var(--text-primary)' : 'transparent',
                color: statusFilter === st ? 'var(--bg-app)' : 'var(--text-secondary)',
              }}
            >
              {st || 'All Statuses'}
            </button>
          ))}

          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
            Priority:
          </span>
          {['', 'Critical', 'High', 'Standard'].map((pr) => (
            <button
              key={pr}
              onClick={() => setPriorityFilter(pr)}
              className="btn-pill"
              style={{
                background: priorityFilter === pr ? 'var(--text-primary)' : 'transparent',
                color: priorityFilter === pr ? 'var(--bg-app)' : 'var(--text-secondary)',
              }}
            >
              {pr || 'All Priorities'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Shipments Table / Cards ───────────────────────────── */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading shipments...
          </div>
        ) : filteredShipments.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No shipments match the current filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Shipment ID</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Cargo Description</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Corridor</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Priority</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Risk Level</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((s) => {
                  const isCritical = s.priority === 'Critical' || s.risk_level === 'Critical'
                  return (
                    <tr
                      key={s.shipment_id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {s.is_cold_chain && <Snowflake size={13} color="var(--brand-cyan)" />}
                          <span>{s.shipment_id}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-primary)' }}>
                        <div>{s.cargo_description}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {s.carrier_code} • <span style={{ color: 'var(--brand-emerald)', fontWeight: 600 }}>{s.value_inr_display || `₹${(((s.value_usd || 100000) * 83) / 100000).toFixed(1)} Lakh`}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {s.origin} ➔ {s.destination}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            backgroundColor:
                              s.priority === 'Critical'
                                ? 'rgba(236, 72, 153, 0.15)'
                                : s.priority === 'High'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'var(--bg-subtle)',
                            color:
                              s.priority === 'Critical'
                                ? 'var(--brand-pink)'
                                : s.priority === 'High'
                                ? 'var(--brand-amber)'
                                : 'var(--text-secondary)',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {s.priority}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            backgroundColor:
                              s.risk_level === 'Critical'
                                ? 'rgba(236, 72, 153, 0.15)'
                                : s.risk_level === 'High'
                                ? 'rgba(249, 115, 22, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                            color:
                              s.risk_level === 'Critical'
                                ? 'var(--brand-pink)'
                                : s.risk_level === 'High'
                                ? '#f97316'
                                : 'var(--brand-emerald)',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          {s.risk_level} ({s.risk_score || 0})
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {s.status}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => openDetail(s.shipment_id)}
                          style={{
                            backgroundColor: isCritical ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-subtle)',
                            border: '1px solid var(--border-card)',
                            color: isCritical ? 'var(--brand-primary-light)' : 'var(--text-primary)',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span>Reroute Options</span>
                          <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 3. Detail & Reroute Modal ────────────────────────────── */}
      {selectedShipment && (
        <div className="modal-overlay" onClick={() => setSelectedShipment(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Package size={20} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Shipment {selectedShipment} Details & Trade-offs
                </h3>
              </div>
              <button
                onClick={() => setSelectedShipment(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                Calculating trade-off recommendations...
              </div>
            ) : detail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Meta summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, backgroundColor: 'var(--bg-subtle)', padding: 14, borderRadius: 10 }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CARGO</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{detail.cargo_description}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>LANE</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{detail.origin} ➔ {detail.destination}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CARGO VALUE</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-emerald)' }}>
                      {detail.value_inr_display || `₹${(((detail.value_usd || 120000) * 83) / 100000).toFixed(1)} Lakh`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RISK INDEX</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-pink)' }}>{detail.risk_score} / 100 ({detail.risk_level})</div>
                  </div>
                </div>

                {/* Disruption Warning */}
                {detail.disruption && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      backgroundColor: 'rgba(236, 72, 153, 0.1)',
                      borderLeft: '4px solid var(--brand-pink)',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-pink)', marginBottom: 2 }}>
                      ACTIVE CORRIDOR DISRUPTION: {detail.disruption.disruption_type}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {detail.disruption.description}
                    </div>
                  </div>
                )}

                {/* Section 1: Multi-Modal Rerouting Alternatives (Pareto Trade-offs) */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={16} color="var(--brand-pink)" />
                      <span>Multi-Objective Carrier & Modal Alternatives</span>
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--brand-primary-light)', fontWeight: 600 }}>
                      Pareto Trade-off Matrix
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(detail.reroute_alternatives || []).map((alt) => (
                      <div
                        key={alt.option_id}
                        style={{
                          padding: '16px',
                          borderRadius: 12,
                          backgroundColor: 'var(--bg-subtle)',
                          border: alt.is_pareto_recommended
                            ? '1px solid rgba(236, 72, 153, 0.4)'
                            : '1px solid var(--border-card)',
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {alt.mode} — {alt.carrier_name}
                              </span>
                              {alt.is_pareto_recommended && (
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
                                  Recommended
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                              {alt.route_path}
                            </div>
                          </div>

                          <button
                            onClick={() => setReroutedSuccess(alt.option_id)}
                            className="btn-primary"
                            style={{ padding: '6px 14px', fontSize: '11px' }}
                          >
                            {reroutedSuccess === alt.option_id ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={13} /> Selected
                              </span>
                            ) : (
                              <span>Approve Reroute</span>
                            )}
                          </button>
                        </div>

                        {/* Trade-off Metrics Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, margin: '12px 0' }}>
                          <div style={{ backgroundColor: 'var(--bg-card)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-card)' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cost Delta</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: (alt.cost_delta_inr || alt.cost_delta_usd * 83) > 40000 ? 'var(--brand-pink)' : 'var(--brand-emerald)' }}>
                              {alt.cost_delta_display || `+₹${(alt.cost_delta_inr || Math.round(alt.cost_delta_usd * 83)).toLocaleString('en-IN')}`}
                            </div>
                          </div>

                          <div style={{ backgroundColor: 'var(--bg-card)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-card)' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ETA Variance</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-emerald)' }}>
                              {alt.eta_display}
                            </div>
                          </div>

                          <div style={{ backgroundColor: 'var(--bg-card)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-card)' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk Index</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: alt.risk_index < 30 ? 'var(--brand-emerald)' : 'var(--brand-amber)' }}>
                              {alt.risk_index} / 100
                            </div>
                          </div>

                          <div style={{ backgroundColor: 'var(--bg-card)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-card)' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CO2 Delta</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: alt.co2_delta_kg <= 0 ? 'var(--brand-emerald)' : 'var(--brand-amber)' }}>
                              {alt.co2_delta_kg > 0 ? `+${alt.co2_delta_kg} kg` : `${alt.co2_delta_kg} kg`}
                            </div>
                          </div>
                        </div>

                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 4 }}>
                          {alt.tradeoff_summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Internal Fleet Absorption Recommendations */}
                <div style={{ marginTop: 8 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Truck size={16} color="var(--brand-primary)" />
                    <span>Internal Fleet Vehicle Absorption</span>
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(detail.fleet_recommendations || []).map((rec, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '14px',
                          borderRadius: 10,
                          backgroundColor: 'var(--bg-subtle)',
                          border: '1px solid var(--border-card)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Vehicle {rec.vehicle_id} • {rec.vehicle_type}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                            Location: {rec.location || rec.current_location || 'Regional Depot'} • Load Factor: {rec.utilization_pct}%
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--brand-emerald)', marginTop: 2 }}>
                            {rec.reason}
                          </div>
                        </div>

                        <div>
                          {reroutedSuccess === rec.vehicle_id ? (
                            <span style={{ fontSize: '12px', color: 'var(--brand-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={14} /> Assigned
                            </span>
                          ) : (
                            <button
                              onClick={() => setReroutedSuccess(rec.vehicle_id)}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '11px' }}
                            >
                              <Truck size={12} />
                              <span>Assign Fleet</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
