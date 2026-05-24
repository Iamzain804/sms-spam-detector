import { useState, useEffect, useRef } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000/api/predict'

// Heatmap Gauge Component
function HeatGauge({ value }) {
  const radius = 80
  const stroke = 14
  const normalizedRadius = radius - stroke / 2
  const circumference = Math.PI * normalizedRadius // half circle
  const progress = (value / 100) * circumference
  const dashOffset = circumference - progress

  const getColor = (v) => {
    if (v < 30) return '#22c55e'
    if (v < 60) return '#f59e0b'
    if (v < 80) return '#f97316'
    return '#ef4444'
  }

  const getLabel = (v) => {
    if (v < 30) return { text: 'SAFE', cls: 'safe' }
    if (v < 60) return { text: 'SUSPICIOUS', cls: 'suspicious' }
    if (v < 80) return { text: 'LIKELY SPAM', cls: 'likely' }
    return { text: 'SPAM!', cls: 'danger' }
  }

  const color = getColor(value)
  const label = getLabel(value)

  return (
    <div className="gauge-wrap">
      <svg width={radius * 2} height={radius + stroke} viewBox={`0 0 ${radius * 2} ${radius + stroke / 2}`}>
        {/* Background arc */}
        <path
          d={`M ${stroke / 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - stroke / 2} ${radius}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d={`M ${stroke / 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - stroke / 2} ${radius}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
        />
      </svg>
      <div className="gauge-center">
        <div className="gauge-value" style={{ color }}>{value}%</div>
        <div className={`gauge-label ${label.cls}`}>{label.text}</div>
      </div>
    </div>
  )
}

// Word Heatmap Component
function WordHeatmap({ original, processed }) {
  if (!processed) return null
  const processedWords = processed.split(' ')
  const originalWords = original.toLowerCase().split(/\s+/)

  return (
    <div className="word-heatmap">
      <div className="heatmap-title">🔥 Word Heatmap</div>
      <div className="heatmap-words">
        {originalWords.map((word, i) => {
          const clean = word.replace(/[^a-z0-9]/g, '')
          const isHighlighted = processedWords.some(p => clean.includes(p) || p.includes(clean))
          return (
            <span key={i} className={`heatword ${isHighlighted ? 'hot' : 'cold'}`}>
              {word}
            </span>
          )
        })}
      </div>
      <div className="heatmap-legend">
        <span className="legend-hot">■ Key words detected</span>
        <span className="legend-cold">■ Filtered out</span>
      </div>
    </div>
  )
}

export default function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [animVal, setAnimVal] = useState(0)
  const resultRef = useRef(null)

  useEffect(() => {
    if (result) {
      setAnimVal(0)
      const timer = setTimeout(() => setAnimVal(result.spam_probability), 100)
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      return () => clearTimeout(timer)
    }
  }, [result])

  const checkSpam = async () => {
    if (!text.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('Server error')
      setResult(await res.json())
    } catch {
      setError('Backend connect nahi hua. Server chalu karo.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setText(''); setResult(null); setError(null); setAnimVal(0) }
  const isSpam = result?.prediction === 'Spam'

  return (
    <div className="page">
      {/* BG blobs */}
      <div className="blob blob1" />
      <div className="blob blob2" />

      <div className="wrapper">
        {/* Top Badge */}
        <div className="top-badge">🛡️ AI-Powered SMS Shield</div>

        {/* Main Card */}
        <div className="card">
          <div className="card-header">
            <div className="header-icon">📱</div>
            <h1>SMS Spam Detector</h1>
            <p>Paste any message — our AI will analyze it instantly</p>
          </div>

          {/* Textarea */}
          <div className="input-wrap">
            <textarea
              className="textarea"
              rows={5}
              placeholder="e.g. Congratulations! You've won a FREE prize..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <div className="textarea-footer">
              <span className={`char-count ${text.length > 160 ? 'over' : ''}`}>
                {text.length} / 160
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="btn-row">
            <button className="btn-analyze" onClick={checkSpam} disabled={loading || !text.trim()}>
              {loading
                ? <><span className="spinner" /> Analyzing...</>
                : <><span>🔍</span> Analyze Message</>
              }
            </button>
            <button className="btn-clear" onClick={reset} disabled={!text && !result}>✕</button>
          </div>

          {/* Error */}
          {error && (
            <div className="alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div ref={resultRef} className={`result-panel ${isSpam ? 'is-spam' : 'is-ham'}`}>

              {/* Top strip */}
              <div className={`result-strip ${isSpam ? 'strip-spam' : 'strip-ham'}`}>
                <span className="strip-icon">{isSpam ? '🚨' : '✅'}</span>
                <span className="strip-text">{isSpam ? 'SPAM DETECTED' : 'MESSAGE IS SAFE'}</span>
                <span className="strip-badge">{isSpam ? 'DANGER' : 'CLEAN'}</span>
              </div>

              <div className="result-body">
                {/* Gauge */}
                <div className="gauge-section">
                  <HeatGauge value={animVal} />
                  <p className="gauge-desc">Spam Probability Score</p>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-info">
                      <div className="stat-val" style={{ color: isSpam ? '#ef4444' : '#22c55e' }}>
                        {result.prediction}
                      </div>
                      <div className="stat-key">Verdict</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                      <div className="stat-val">{result.spam_probability}%</div>
                      <div className="stat-key">Confidence</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🔤</div>
                    <div className="stat-info">
                      <div className="stat-val">{text.trim().split(/\s+/).length}</div>
                      <div className="stat-key">Words</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⚙️</div>
                    <div className="stat-info">
                      <div className="stat-val">{result.transformed_text.split(' ').length}</div>
                      <div className="stat-key">Key Tokens</div>
                    </div>
                  </div>
                </div>

                {/* Heatmap */}
                <WordHeatmap original={text} processed={result.transformed_text} />

                {/* Gradient bar */}
                <div className="heatbar-section">
                  <div className="heatbar-track">
                    <div className="heatbar-fill" style={{ width: `${animVal}%` }} />
                    <div className="heatbar-needle" style={{ left: `${animVal}%` }} />
                  </div>
                  <div className="heatbar-labels">
                    <span>🟢 Safe</span>
                    <span>🟡 Suspicious</span>
                    <span>🔴 Spam</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="footer-text">Naive Bayes · TF-IDF · FastAPI · React</p>
      </div>
    </div>
  )
}
