import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchDashboard,
  simulateDisruption,
  resetSimulation,
} from '../services/api'
import {
  ShieldAlert,
  Zap,
  TrendingUp,
  Truck,
  Snowflake,
  AlertTriangle,
  ArrowRight,
  Compass,
  FileText,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart2,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'

export default function Overview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [filterMode, setFilterMode] = useState('all')
  const [reroutedSuccess, setReroutedSuccess] = useState(false)
  const navigate = useNavigate()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchDashboard()
      setData(res)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSimulateToggle = async () => {
    setSimulating(true)
    try {
      if (data?.simulation_active) {
        await resetSimulation()
      } else {
        await simulateDisruption()
      }
      await loadData()
    } catch (err) {
      console.error('Simulation toggle failed:', err)
    } finally {
      setSimulating(false)
    }
  }

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="skeleton" style={{ height: 120, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    )
  }

  const kpis = data?.kpis || {}
  const isSimActive = Boolean(data?.simulation_active)
  const riskDist = data?.risk_distribution || { Low: 12, Medium: 8, High: 6, Critical: 4 }
  const riskChartData = [
    { name: 'Low', count: riskDist.Low || 0, color: '#10b981' },
    { name: 'Medium', count: riskDist.Medium || 0, color: '#f59e0b' },
    { name: 'High', count: riskDist.High || 0, color: '#f97316' },
    { name: 'Critical', count: riskDist.Critical || 0, color: '#ec4899' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── 1. Page Header (Vidur Style) ────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Supply Chain Workspace
            </h1>
            <span
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--brand-primary-light)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              SupplyGuard Pro
            </span>
            <span
              style={{
                backgroundColor: 'rgba(250, 204, 21, 0.12)',
                color: '#facc15',
                border: '1px solid rgba(250, 204, 21, 0.25)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Autonomous Tower
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {kpis.active_disruptions || 1} active global disruptions detected in last 24h requiring action •{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {kpis.affected_shipments || 18} at-risk shipments
            </strong>{' '}
            • {kpis.cold_chain_alerts || 5} cold-chain excursion warnings
          </p>
        </div>

        {/* Filter Pills + Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '9999px',
              padding: '4px',
              display: 'flex',
              gap: 4,
            }}
          >
            {[
              { id: 'all', label: 'All Critical' },
              { id: 'disrupted', label: 'Disrupted Corridors' },
              { id: 'cold', label: 'Cold Chain Due' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id)}
                style={{
                  border: 'none',
                  background: filterMode === tab.id ? 'var(--text-primary)' : 'transparent',
                  color: filterMode === tab.id ? 'var(--bg-app)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '12px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleSimulateToggle}
            disabled={simulating}
            className="btn-primary"
            style={{
              background: isSimActive
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            }}
          >
            <Compass size={15} />
            <span>
              {simulating
                ? 'Simulating...'
                : isSimActive
                ? 'Reset Simulation'
                : 'Scan & Simulate Disruption'}
            </span>
          </button>
        </div>
      </div>

      {/* ── 2. Resilience Command Center Banner (Vidur Style) ────── */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          backgroundColor: 'var(--bg-card)',
          borderLeft: '4px solid var(--brand-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
              Resilience Command Center • {kpis.affected_shipments || 18} Shipments & 4 Urgent Reroutes Pending
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              ₹15.2 Cr Active Cargo Value Protected • 92% Automated watsonx.ai Recovery Rating
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/shipments')}
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-primary)',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
        >
          <span>Open Resilience Command Center</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* ── 3. Priority 1 Focus Hero Card (Vidur signature component) ── */}
      <div className="priority-hero-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: '320px' }}>
            {/* Priority Tag & Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span
                style={{
                  backgroundColor: 'rgba(236, 72, 153, 0.12)',
                  color: 'var(--brand-pink)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  textTransform: 'uppercase',
                }}
              >
                <Zap size={12} />
                <span>Priority 1 Alert</span>
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} />
                <span>Triggered 38m ago</span>
              </span>
            </div>

            {/* Shipment Title */}
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              SHP-104 • Temperature-Sensitive Vaccines & Biologics
            </h2>

            {/* Tags: Risk, Officer, Cargo Value */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <span
                style={{
                  backgroundColor: 'rgba(236, 72, 153, 0.15)',
                  color: 'var(--brand-pink)',
                  border: '1px solid rgba(236, 72, 153, 0.25)',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                94 / 100 Risk Index
              </span>
              <span
                style={{
                  backgroundColor: 'var(--bg-tag)',
                  border: '1px solid var(--border-subtle)',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                }}
              >
                Mumbai (JNPT) ➔ Delhi Central Depot
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--brand-emerald)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                ₹35 Lakh Cargo Valuation
              </span>
            </div>

            {/* WHY NOW block */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderLeft: '3px solid var(--brand-pink)',
                borderRadius: '0 8px 8px 0',
                padding: '12px 16px',
                marginBottom: 12,
                fontSize: '13px',
              }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>WHY NOW:</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                JNPT Port strike is causing a 72-hour terminal gate lockdown. Shipment is cold-chain constrained (2°C–8°C)
                with 3 hours before internal battery reserve exhaustion.
              </span>
            </div>

            {/* RECOMMENDED ACTION */}
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>ACTION HOOK:</strong>{' '}
              <em>
                "Immediate modal shift from Ocean/Road to Air Express via BOM cargo terminal, backed by Reefer Truck FL-201
                for end-point absorption."
              </em>
            </div>
          </div>

          {/* Action CTAs on right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: '220px' }}>
            {reroutedSuccess ? (
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid var(--brand-emerald)',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                  color: 'var(--brand-emerald)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={18} style={{ margin: '0 auto 4px' }} />
                Reroute Dispatched to Carrier!
              </div>
            ) : (
              <button
                onClick={() => setReroutedSuccess(true)}
                className="btn-primary"
                style={{ justifyContent: 'center' }}
              >
                <Zap size={15} />
                <span>Dispatch Emergency Reroute →</span>
              </button>
            )}

            <button
              onClick={() => navigate('/shipments')}
              className="btn-secondary"
              style={{ justifyContent: 'center' }}
            >
              <FileText size={14} />
              <span>Review Trade-off Brief</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. KPI Stat Grid (Vidur Style) ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {/* Card 1: Active Disruptions */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Disruptions
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(236, 72, 153, 0.12)',
                color: 'var(--brand-pink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {kpis.active_disruptions || 1}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-pink)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp size={12} />
              +14% vs normal
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 6 }}>
            {isSimActive ? 'JNPT strike active' : 'Normal monitoring'}
          </div>
        </div>

        {/* Card 2: High-Risk Shipments */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              At-Risk Cargo
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: 'var(--brand-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {kpis.affected_shipments || 18}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-amber)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp size={12} />
              +3 new in 4h
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 6 }}>
            {kpis.critical_shipments || 4} critical priority
          </div>
        </div>

        {/* Card 3: Idle Fleet Capacity */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Idle Fleet Assets
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {kpis.idle_fleet_assets || 6}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-emerald)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircle2 size={12} />
              28% capacity ready
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 6 }}>
            Ready for local absorption
          </div>
        </div>

        {/* Card 4: Cold Chain Alerts */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cold Chain Excursions
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(6, 182, 212, 0.12)',
                color: 'var(--brand-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Snowflake size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {kpis.cold_chain_alerts || 5}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-cyan)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Activity size={12} />
              2°C–8°C guarded
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 6 }}>
            IoT telemetry synchronized
          </div>
        </div>
      </div>

      {/* ── 5. Analytics & Live Corridors Section ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        {/* Left: Risk Distribution Chart */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Shipment Risk Distribution
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Composite index across delay, value, and temperature
              </p>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'var(--bg-tag)',
                border: '1px solid var(--border-subtle)',
                padding: '3px 8px',
                borderRadius: '6px',
                color: 'var(--text-muted)',
              }}
            >
              watsonx.ai Model
            </span>
          </div>

          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Active Disruption Corridors Stream */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Active Disruption Corridors
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Live geospatial and maritime impact zones
              </p>
            </div>
            <button
              onClick={() => navigate('/disruptions')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--brand-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data?.active_disruptions || []).slice(0, 3).map((dis, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {dis.disruption_type} — {dis.affected_region}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                    {dis.affected_shipment_count || 0} shipments affected • Est. {dis.delay_estimate_hours || 48}h delay
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor:
                      dis.severity === 'Critical'
                        ? 'rgba(236, 72, 153, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)',
                    color: dis.severity === 'Critical' ? 'var(--brand-pink)' : 'var(--brand-amber)',
                    border: '1px solid var(--border-subtle)',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  {dis.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
