import { useState } from 'react'
import {
  BarChart2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Leaf,
  Clock,
  Package,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const FUNNEL_DATA = [
  { stage: 'Disrupted Incidents', count: 18, fill: '#ec4899' },
  { stage: 'Impacted Cargo', count: 18, fill: '#f97316' },
  { stage: 'Alternatives Evaluated', count: 16, fill: '#f59e0b' },
  { stage: 'Reroutes Dispatched', count: 14, fill: '#6366f1' },
  { stage: 'SLA Recovered On-Time', count: 13, fill: '#10b981' },
]

const MONTHLY_SAVINGS = [
  { month: 'Jan', costSaved: 42, co2Saved: 850 },
  { month: 'Feb', costSaved: 58, co2Saved: 1120 },
  { month: 'Mar', costSaved: 85, co2Saved: 1420 },
]

export default function Analytics() {
  const [period, setPeriod] = useState('30d')

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
              <BarChart2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Supply Chain Analytics
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
                  Intelligence
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Understand what's driving route recoveries, SLA compliance, and carrier emissions.
              </p>
            </div>
          </div>

          {/* Timeframe Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: '1px solid var(--border-card)',
                  background: period === tab.id ? 'var(--brand-primary)' : 'transparent',
                  color: period === tab.id ? '#ffffff' : 'var(--text-secondary)',
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

      {/* ── 2. Metric Cards Grid (Vidur Style) ──────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Shipments Monitored
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>142</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-emerald)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp size={12} />
              +14%
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
            Active across 8 global hubs
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Disruptions Intercepted
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--brand-pink)' }}>18</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-pink)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp size={12} />
              +28%
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
            Average detection: 12 minutes
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            SLA Recovery Yield
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--brand-emerald)' }}>94.2%</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-emerald)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <ShieldCheck size={12} />
              High SLA
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
            Up from 68% manual benchmark
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            CO2 Emissions Averted
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--brand-cyan)' }}>1,420 kg</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-emerald)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Leaf size={12} />
              ESG Positive
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
            Optimized multimodal routing
          </div>
        </div>
      </div>

      {/* ── 3. Funnel & Performance Charts ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        {/* Funnel Conversion */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Incident-to-Recovery Funnel
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Conversion yield from active alert detection to on-time customer delivery
          </p>

          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FUNNEL_DATA} layout="vertical">
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis dataKey="stage" type="category" width={140} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {FUNNEL_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost & Carbon Savings Trend */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Resilience Value Preserved (₹ Lakh)
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Saved cargo spoilage and reduced spot-rate freight spend
          </p>

          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_SAVINGS}>
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="costSaved"
                  name="Value Preserved (₹ Lakh)"
                  stroke="var(--brand-emerald)"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
