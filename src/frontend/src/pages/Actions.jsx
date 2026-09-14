import { useState } from 'react'
import {
  Zap,
  CheckCircle2,
  Clock,
  Truck,
  Snowflake,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Check,
  ShieldCheck,
} from 'lucide-react'

const ACTIONS_QUEUE = [
  {
    id: 'ACT-01',
    priority: 'PRIORITY 1',
    urgency: 'HIGH URGENCY',
    title: 'Emergency Air Reroute: SHP-104 (Vaccines - Mumbai to Delhi)',
    carrier: 'BlueDart Aviation / Air India Cargo',
    costDelta: '+₹1,18,000',
    delaySaved: 'Save 3.5 Days',
    riskReduction: '-58% Risk',
    co2Delta: '+120 kg CO2',
    cargoValue: '₹35 Lakh',
    whyNow: 'Port of Mumbai (JNPT) terminal gate lockdown. Cold chain battery backup expiring in 3h.',
    type: 'Emergency Reroute',
    status: 'Pending',
  },
  {
    id: 'ACT-02',
    priority: 'PRIORITY 2',
    urgency: 'URGENT',
    title: 'Fleet Absorption: Deploy Reefer Truck FL-201 to Pune Hub',
    carrier: 'Internal Reefer Fleet (FL-201)',
    costDelta: '-₹65,000 (Saved spot rate)',
    delaySaved: 'Same-day pickup',
    riskReduction: '-40% Risk',
    co2Delta: '-45 kg CO2',
    cargoValue: '₹15 Lakh',
    whyNow: 'Vehicle currently idle for 34h at Pune Depot; can absorb stranded perishables from SHP-106.',
    type: 'Fleet Absorption',
    status: 'Pending',
  },
  {
    id: 'ACT-03',
    priority: 'PRIORITY 3',
    urgency: 'MEDIUM',
    title: 'Intermodal Rail Shift: SHP-101 (Electronics to Bangalore)',
    carrier: 'CONCOR Intermodal Rail Express',
    costDelta: '+₹25,000',
    delaySaved: 'Save 2 Days',
    riskReduction: '-35% Risk',
    co2Delta: '-85 kg CO2',
    cargoValue: '₹8 Lakh',
    whyNow: 'NH-48 highway maintenance creating 24h bottleneck; rail bypasses road gridlock.',
    type: 'Intermodal Rail',
    status: 'Pending',
  },
  {
    id: 'ACT-04',
    priority: 'PRIORITY 4',
    urgency: 'MEDIUM',
    title: 'Cold-Chain Protocol Activation: SHP-108 (Oncology Biologics)',
    carrier: 'DHL Express Reefer Ground',
    costDelta: '+₹14,500',
    delaySaved: 'Zero delay',
    riskReduction: '-65% Risk',
    co2Delta: 'Neutral',
    cargoValue: '₹26 Lakh',
    whyNow: 'Internal sensor temp reached 7.8°C (upper limit 8.0°C). Dispatch secondary cooling unit.',
    type: 'Cold Chain Guard',
    status: 'Pending',
  },
]

export default function Actions() {
  const [filter, setFilter] = useState('all')
  const [actions, setActions] = useState(ACTIONS_QUEUE)
  const [executedIds, setExecutedIds] = useState([])

  const handleExecute = (id) => {
    setExecutedIds((prev) => [...prev, id])
  }

  const handleExecuteAll = () => {
    setExecutedIds(actions.map((a) => a.id))
  }

  const filtered = actions.filter((a) => {
    if (filter === 'all') return true
    if (filter === 'critical') return a.priority === 'PRIORITY 1'
    if (filter === 'reroute') return a.type === 'Emergency Reroute'
    if (filter === 'fleet') return a.type === 'Fleet Absorption'
    return true
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
              <Zap size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Supply Action Center
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
                  Orchestration Hub
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Intelligent next best actions prioritized by delay risk, cold-chain excursion & SLA penalties.
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[
              { id: 'all', label: 'All Actions' },
              { id: 'critical', label: 'Critical' },
              { id: 'reroute', label: 'Reroutes' },
              { id: 'fleet', label: 'Fleet' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: '1px solid var(--border-card)',
                  background: filter === tab.id ? 'var(--text-primary)' : 'transparent',
                  color: filter === tab.id ? 'var(--bg-app)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Stepper Progress Pipeline (Vidur Signature) ─────── */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          {/* Steps */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {[
              { label: 'DETECT', completed: true },
              { label: 'CORRELATE', completed: true },
              { label: 'EVALUATE', completed: true },
              { label: 'EXECUTE', active: true, count: 4 },
              { label: 'RECOVER', completed: false },
            ].map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: step.completed
                      ? 'var(--brand-emerald)'
                      : step.active
                      ? '#6366f1'
                      : 'var(--bg-card)',
                    border: step.completed || step.active ? 'none' : '2px solid var(--border-card)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px',
                    boxShadow: step.active ? '0 0 16px rgba(99, 102, 241, 0.5)' : 'none',
                  }}
                >
                  {step.completed ? <Check size={18} /> : step.count || idx + 1}
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: step.completed || step.active ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Right Circular Rating */}
          <div
            style={{
              paddingLeft: '24px',
              borderLeft: '1px solid var(--border-card)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                border: '3px solid var(--brand-emerald)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-emerald)',
                fontWeight: 800,
                fontSize: '14px',
              }}
            >
              <span>89</span>
              <span style={{ fontSize: '8px', textTransform: 'uppercase' }}>Ready</span>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Queue Value
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹15.2 Cr
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Urgency Mini Cards ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Urgent Reroutes Due
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-pink)' }}>4</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-pink)' }}>₹9.8 Cr value</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>Action window &lt; 2h</p>
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Cold Chain Excursions
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-amber)' }}>3</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-amber)' }}>Critical SLA</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>2°C–8°C guard window</p>
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Idle Fleet Candidates
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-primary-light)' }}>2</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-primary-light)' }}>Reefer Ready</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>Redeployment available</p>
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Disruption Signals
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-emerald)' }}>1</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-emerald)' }}>JNPT Strike</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>Automated correlate active</p>
        </div>
      </div>

      {/* ── 4. Action Queue Cards ────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Next Best Action Queue ({filtered.length})</span>
          <span style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', color: 'var(--brand-pink)', padding: '2px 8px', borderRadius: '9999px', fontSize: '10px' }}>
            High Urgency
          </span>
        </h2>

        <button
          onClick={handleExecuteAll}
          className="btn-primary"
          style={{ padding: '6px 14px', fontSize: '12px' }}
        >
          <Zap size={14} />
          <span>Execute All Next Actions</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((item) => {
          const isDone = executedIds.includes(item.id)

          return (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: '20px',
                borderLeft: `4px solid ${
                  item.priority === 'PRIORITY 1' ? 'var(--brand-pink)' : 'var(--brand-primary)'
                }`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  {/* Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span
                      style={{
                        backgroundColor:
                          item.priority === 'PRIORITY 1'
                            ? 'rgba(236, 72, 153, 0.15)'
                            : 'rgba(99, 102, 241, 0.15)',
                        color:
                          item.priority === 'PRIORITY 1'
                            ? 'var(--brand-pink)'
                            : 'var(--brand-primary-light)',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
                      {item.priority}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.type}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-emerald)' }}>
                      Cargo: {item.cargoValue}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {item.title}
                  </h3>

                  {/* Why Now */}
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 12 }}>
                    <strong>Why Now:</strong> {item.whyNow}
                  </p>

                  {/* Trade-off Pill Stats */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ backgroundColor: 'var(--bg-tag)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Carrier: <strong>{item.carrier}</strong>
                    </span>
                    <span style={{ backgroundColor: 'var(--bg-tag)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--brand-pink)' }}>
                      Cost: <strong>{item.costDelta}</strong>
                    </span>
                    <span style={{ backgroundColor: 'var(--bg-tag)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--brand-emerald)' }}>
                      ETA: <strong>{item.delaySaved}</strong>
                    </span>
                    <span style={{ backgroundColor: 'var(--bg-tag)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--brand-primary-light)' }}>
                      Risk: <strong>{item.riskReduction}</strong>
                    </span>
                  </div>
                </div>

                {/* Right Action */}
                <div>
                  {isDone ? (
                    <div
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid var(--brand-emerald)',
                        color: 'var(--brand-emerald)',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Action Dispatched</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleExecute(item.id)}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      <Zap size={14} />
                      <span>Approve & Dispatch →</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
