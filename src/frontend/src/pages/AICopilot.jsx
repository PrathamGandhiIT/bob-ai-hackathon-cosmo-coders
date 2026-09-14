import { useState, useRef, useEffect } from 'react'
import { askCopilot } from '../services/api'
import { Send, Bot, User, Sparkles, Zap, ArrowRight } from 'lucide-react'

const SUGGESTIONS = [
  'What should I do about shipment SHP-104?',
  'Which shipments are most at risk right now?',
  'Which fleet assets can be redeployed to Pune/Mumbai?',
  'Give me a recovery plan for critical cold-chain cargo.',
  'What is the estimated impact of the JNPT port strike?',
  'Give me an operational executive overview.',
]

export default function AICopilot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEnd = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const query = text || input.trim()
    if (!query || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: query }])
    setLoading(true)

    try {
      const res = await askCopilot(query)
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: res.response,
          provider: res.provider,
          actions: res.structured_actions,
        },
      ])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `Error: ${e.message}. Please verify the FastAPI backend is running on port 8000.`,
          provider: 'Error',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── 1. Page Header (Vidur Style) ────────────────────────── */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
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
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  SupplyGuard AI Copilot
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
                  watsonx.ai Engine
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Conversational supply chain intelligence, operational trade-off diagnosis & recovery playbooks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Chat Area Container ───────────────────────────────── */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '620px',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Messages feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', margin: 'auto', maxWidth: 640, padding: '20px 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--brand-primary)',
                }}
              >
                <Bot size={28} />
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                How can I assist your logistics operations today?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: 24 }}>
                Ask me to diagnose affected cargo, suggest multi-modal reroutes, assess cold-chain integrity, or redeploy idle fleet assets.
              </p>

              {/* Suggestions Grid */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '9999px',
                      border: '1px solid var(--border-card)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--brand-primary)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-card)'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }}
                  >
                    <Zap size={12} color="var(--brand-primary)" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rendered Messages */}
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user'

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', color: 'var(--text-muted)' }}>
                  {isUser ? (
                    <>
                      <span>You (Dispatcher)</span>
                      <User size={13} />
                    </>
                  ) : (
                    <>
                      <Bot size={13} color="var(--brand-primary)" />
                      <span>SupplyGuard Copilot</span>
                      {msg.provider && (
                        <span style={{ fontSize: '10px', color: 'var(--brand-primary-light)' }}>
                          • via {msg.provider}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div
                  style={{
                    maxWidth: '80%',
                    padding: '14px 18px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: isUser ? 'var(--brand-primary)' : 'var(--bg-subtle)',
                    color: isUser ? '#ffffff' : 'var(--text-primary)',
                    border: isUser ? 'none' : '1px solid var(--border-card)',
                    fontSize: '13px',
                    lineHeight: '1.6',
                  }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
              </div>
            )
          })}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand-primary)' }}>
              <Bot size={16} />
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                Analyzing supply chain data with watsonx.ai...
              </span>
            </div>
          )}

          <div ref={messagesEnd} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-card)',
            backgroundColor: 'var(--bg-app)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <input
            type="text"
            placeholder="Ask about shipments, disruptions, fleet capacity, cold-chain..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              opacity: !input.trim() ? 0.5 : 1,
            }}
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/## (.*?)$/gm, '<h3 style="font-size: 14px; font-weight: 700; margin: 8px 0 4px;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*?)$/gm, '<li style="margin-left: 16px;">$1</li>')
    .replace(/\n/g, '<br />')
}
