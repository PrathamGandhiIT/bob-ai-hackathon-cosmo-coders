import { useState, useEffect } from 'react'
import { fetchColdChain } from '../services/api'
import {
  Snowflake,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Zap,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts'

export default function ColdChain() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchColdChain()
      .then((res) => {
        setData(res)
        if (res.shipments?.length > 0) {
          setSelected(res.shipments[0].shipment_id)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="skeleton" style={{ height: 120, borderRadius: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    )
  }

  const { shipments = [], alert_count = 0, total = 0 } = data || {}
  const selectedShipment = selected ? shipments.find((s) => s.shipment_id === selected) : shipments[0]

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
                backgroundColor: 'rgba(6, 182, 212, 0.12)',
                color: 'var(--brand-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Snowflake size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Cold Chain Compliance Guard
                </h1>
                <span
                  style={{
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--brand-cyan)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  IoT Telemetry Live
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {total} sensitive biologics & pharma shipments •{' '}
                <strong style={{ color: 'var(--brand-pink)' }}>{alert_count} active thermal excursion alerts</strong> requiring intervention.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Shipments Grid (Selectable) ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {shipments.map((s) => {
          const isSelected = selected === s.shipment_id
          const hasAlert = s.excursion_count > 0

          return (
            <div
              key={s.shipment_id}
              className="glass-card"
              onClick={() => setSelected(s.shipment_id)}
              style={{
                padding: '18px',
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--brand-primary)' : hasAlert ? 'rgba(236, 72, 153, 0.4)' : undefined,
                backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.2)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {s.shipment_id}
                    </span>
                    {hasAlert && (
                      <span
                        style={{
                          backgroundColor: 'rgba(236, 72, 153, 0.15)',
                          color: 'var(--brand-pink)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <AlertTriangle size={10} /> Excursion
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                    {s.cargo_description}
                  </div>
                </div>

                <span
                  style={{
                    backgroundColor:
                      s.status === 'Critical'
                        ? 'rgba(236, 72, 153, 0.15)'
                        : s.status === 'Warning'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(16, 185, 129, 0.15)',
                    color:
                      s.status === 'Critical'
                        ? 'var(--brand-pink)'
                        : s.status === 'Warning'
                        ? 'var(--brand-amber)'
                        : 'var(--brand-emerald)',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {s.status}
                </span>
              </div>

              {/* Metrics row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: '12px', marginTop: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Latest Temp: </span>
                  <strong style={{ color: hasAlert ? 'var(--brand-pink)' : 'var(--brand-emerald)' }}>
                    {s.latest_temperature !== null ? `${s.latest_temperature}°C` : 'N/A'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Allowed: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {s.temperature_min}°C – {s.temperature_max}°C
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Humidity: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {s.latest_humidity !== null ? `${s.latest_humidity}%` : 'N/A'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Excursions: </span>
                  <strong style={{ color: hasAlert ? 'var(--brand-pink)' : 'var(--text-secondary)' }}>
                    {s.excursion_count || 0}
                  </strong>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 3. Interactive Temperature History Chart ─────────────── */}
      {selectedShipment && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Thermometer size={18} color="var(--brand-cyan)" />
                <span>Real-Time Temperature History: {selectedShipment.shipment_id}</span>
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Guarded Band: {selectedShipment.temperature_min}°C to {selectedShipment.temperature_max}°C (Safe Shaded Zone)
              </p>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'var(--bg-tag)',
                border: '1px solid var(--border-subtle)',
                padding: '4px 10px',
                borderRadius: '6px',
                color: 'var(--text-muted)',
              }}
            >
              IoT Sensor Beacon active
            </span>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedShipment.readings || []}>
                <XAxis dataKey="timestamp" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={11}
                  domain={['auto', 'auto']}
                  tickLine={false}
                  unit="°C"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                {/* Safe Temperature Area */}
                <ReferenceArea
                  y1={selectedShipment.temperature_min}
                  y2={selectedShipment.temperature_max}
                  fill="rgba(16, 185, 129, 0.08)"
                  stroke="rgba(16, 185, 129, 0.2)"
                />
                <ReferenceLine
                  y={selectedShipment.temperature_max}
                  stroke="var(--brand-pink)"
                  strokeDasharray="3 3"
                  label={{ value: 'Max Limit', fill: 'var(--brand-pink)', fontSize: 10 }}
                />
                <ReferenceLine
                  y={selectedShipment.temperature_min}
                  stroke="var(--brand-cyan)"
                  strokeDasharray="3 3"
                  label={{ value: 'Min Limit', fill: 'var(--brand-cyan)', fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="var(--brand-primary-light)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
