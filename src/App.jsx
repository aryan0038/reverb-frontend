import React, { useState, useEffect } from 'react';
import { useUser, SignIn, UserButton, useAuth } from '@clerk/clerk-react';

const App = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [page, setPage] = useState('rephrase');
  const [history, setHistory] = useState([]);
  const [originalText, setOriginalText] = useState('');
  const [rephrasedResult, setRephrasedResult] = useState('');
  const [tone, setTone] = useState('formal');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const MAX_CHARS = 2000;
  const API_BASE = 'https://reverb-backend-production.up.railway.app';

  useEffect(() => {
    if (isSignedIn) fetchHistory();
  }, [isSignedIn]);

  // ── ALL hooks above this line ──────────────────────────

  if (!isLoaded) return null;

  if (!isSignedIn) return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#030712',
      backgroundImage: 'linear-gradient(rgba(0, 242, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 255, 0.03) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '1.8rem',
        fontWeight: '900',
        color: '#00f2ff',
        textShadow: '0 0 20px #00f2ff',
        letterSpacing: '6px',
        marginBottom: '8px',
      }}>REVERB</div>
      <div style={{
        fontSize: '0.65rem',
        color: 'rgba(226,232,240,0.4)',
        letterSpacing: '3px',
        marginBottom: '36px',
      }}>AI REPHRASING ENGINE</div>
      <SignIn />
    </div>
  );

  // ── Functions (after auth check, before main return) ───

  const fetchHistory = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(data);
    } catch (err) { console.error("History sync failed", err); }
  };

  const handleTextChange = (e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setOriginalText(e.target.value);
      setCharCount(e.target.value.length);
    }
  };

  const handleRephrase = async () => {
    if (!originalText) return;
    setLoading(true);
    setRephrasedResult('');
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/rephrase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ originalText, tone }),
      });
      const data = await res.json();
      setRephrasedResult(data.rephrasedText);
      fetchHistory();
    } catch (err) { console.error("Rephrase failed", err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      const token = await getToken();
      await fetch(`${API_BASE}/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHistory();
    } catch (err) { console.error("Delete failed", err); }
  };

  const handleCopy = () => {
    if (!rephrasedResult) return;
    navigator.clipboard.writeText(rephrasedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setOriginalText('');
    setRephrasedResult('');
    setCharCount(0);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Inter:wght@300;400;500&display=swap');

        :root {
          --cyan: #00f2ff;
          --purple: #bc13fe;
          --bg: #030712;
          --surface: rgba(15, 23, 42, 0.8);
          --border: rgba(0, 242, 255, 0.15);
          --text: #e2e8f0;
          --muted: rgba(226, 232, 240, 0.4);
          --sidebar-w: 260px;
          --danger: #f43f5e;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root {
          height: 100%;
          width: 100%;
        }

        body {
          background: var(--bg);
          background-image:
            linear-gradient(rgba(0, 242, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 242, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          color: var(--text);
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
        }

        .layout {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }

        /* SIDEBAR */
        .sidebar {
          width: var(--sidebar-w);
          min-height: 100vh;
          background: rgba(10, 16, 30, 0.95);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 30px 20px;
          position: fixed;
          top: 0; left: 0;
          backdrop-filter: blur(20px);
          z-index: 100;
        }

        .logo {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.4rem;
          font-weight: 900;
          color: var(--cyan);
          text-shadow: 0 0 15px var(--cyan);
          letter-spacing: 3px;
          margin-bottom: 8px;
        }

        .logo-sub {
          font-size: 0.65rem;
          color: var(--muted);
          letter-spacing: 2px;
          margin-bottom: 40px;
        }

        .nav { display: flex; flex-direction: column; gap: 6px; }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--muted);
          transition: all 0.2s;
          border: 1px solid transparent;
          letter-spacing: 1px;
        }

        .nav-item:hover {
          color: var(--text);
          background: rgba(0, 242, 255, 0.05);
          border-color: var(--border);
        }

        .nav-item.active {
          color: var(--cyan);
          background: rgba(0, 242, 255, 0.08);
          border-color: rgba(0, 242, 255, 0.3);
          text-shadow: 0 0 8px rgba(0, 242, 255, 0.5);
        }

        .nav-icon { font-size: 1rem; width: 20px; text-align: center; }

        .sidebar-divider {
          height: 1px;
          background: var(--border);
          margin: 25px 0;
        }

        .sidebar-label {
          font-size: 0.65rem;
          color: var(--muted);
          letter-spacing: 2px;
          margin-bottom: 12px;
          padding: 0 4px;
        }

        .tone-btn {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(188, 19, 254, 0.3);
          color: var(--muted);
          padding: 9px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
          text-align: left;
          margin-bottom: 6px;
          letter-spacing: 1px;
        }

        .tone-btn:hover { color: var(--text); border-color: var(--purple); }
        .tone-btn.active {
          background: rgba(188, 19, 254, 0.15);
          border-color: var(--purple);
          color: #e879f9;
          box-shadow: 0 0 10px rgba(188, 19, 254, 0.2);
        }

        .char-counter {
          margin-top: auto;
          padding: 15px;
          background: rgba(0, 242, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .char-label { font-size: 0.65rem; color: var(--muted); letter-spacing: 2px; margin-bottom: 8px; }

        .char-bar {
          height: 3px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .char-fill {
          height: 100%;
          background: var(--cyan);
          transition: width 0.2s;
          box-shadow: 0 0 6px var(--cyan);
        }

        .char-nums { font-size: 0.7rem; color: var(--muted); text-align: right; }

        .dev-credit {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.2);
          text-align: center;
          letter-spacing: 1px;
          line-height: 1.6;
        }

        .dev-credit span { color: var(--cyan); opacity: 0.6; }

        /* MAIN */
        .main {
          margin-left: var(--sidebar-w);
          flex: 1;
          padding: 50px;
          min-height: 100vh;
          width: calc(100% - var(--sidebar-w));
          overflow-x: hidden;
        }

        .page-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
          letter-spacing: 2px;
        }

        .page-subtitle {
          font-size: 0.8rem;
          color: var(--muted);
          margin-bottom: 35px;
          letter-spacing: 1px;
        }

        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 28px;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
          width: 100%;
        }

        .card-label {
          font-size: 0.65rem;
          color: var(--muted);
          letter-spacing: 3px;
          margin-bottom: 14px;
          display: block;
          text-transform: uppercase;
        }

        textarea {
          width: 100%;
          height: 220px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: var(--text);
          padding: 16px;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          line-height: 1.7;
          outline: none;
          resize: vertical;
          transition: border-color 0.2s;
          display: block;
        }
        textarea:focus { border-color: rgba(0, 242, 255, 0.4); }
        textarea::placeholder { color: rgba(255,255,255,0.2); }

        .action-bar {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 16px;
        }

        .btn {
          padding: 10px 24px;
          border-radius: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.5px;
        }

        .btn-ghost {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: var(--muted);
        }
        .btn-ghost:hover { border-color: var(--danger); color: var(--danger); }

        .btn-primary {
          background: var(--cyan);
          border: none;
          color: #000;
          font-weight: 600;
          box-shadow: 0 0 20px rgba(0, 242, 255, 0.3);
        }
        .btn-primary:hover { box-shadow: 0 0 30px rgba(0, 242, 255, 0.5); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          width: 100%;
        }

        .pane {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 20px;
          min-height: 160px;
          position: relative;
          line-height: 1.7;
          font-size: 0.9rem;
          color: var(--muted);
          width: 100%;
        }

        .pane.output { border-color: rgba(0, 242, 255, 0.2); color: var(--text); }

        .pane-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .btn-copy {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
          font-size: 0.7rem;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .btn-copy:hover { border-color: var(--cyan); color: var(--cyan); }

        .loading-dots::after {
          content: '...';
          animation: dots 1.2s infinite;
        }
        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }

        /* HISTORY */
        .history-grid { display: flex; flex-direction: column; gap: 16px; width: 100%; }

        .history-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px 24px;
          position: relative;
          transition: border-color 0.2s;
          animation: fadeIn 0.3s ease;
          width: 100%;
        }

        .history-card:hover { border-color: rgba(0, 242, 255, 0.3); }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .history-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .tone-badge {
          font-size: 0.6rem;
          padding: 3px 10px;
          border-radius: 20px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .tone-badge.formal { background: rgba(0, 242, 255, 0.1); color: var(--cyan); border: 1px solid rgba(0, 242, 255, 0.3); }
        .tone-badge.casual { background: rgba(251, 191, 36, 0.1); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); }
        .tone-badge.creative { background: rgba(188, 19, 254, 0.1); color: #e879f9; border: 1px solid rgba(188, 19, 254, 0.3); }

        .history-time { font-size: 0.7rem; color: var(--muted); margin-left: auto; }

        .history-texts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .history-text-block { font-size: 0.85rem; line-height: 1.6; }
        .history-text-label { font-size: 0.6rem; letter-spacing: 2px; color: var(--muted); margin-bottom: 6px; display: block; }

        .btn-delete {
          position: absolute; top: 16px; right: 16px;
          background: transparent; border: none;
          color: rgba(255,255,255,0.15); cursor: pointer;
          font-size: 0.75rem; transition: color 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .btn-delete:hover { color: var(--danger); }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255,255,255,0.15);
          font-size: 0.85rem;
          letter-spacing: 2px;
        }

        /* ABOUT */
        .about-hero { text-align: center; padding: 40px 20px 50px; }

        .about-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 3rem;
          font-weight: 900;
          color: var(--cyan);
          text-shadow: 0 0 20px var(--cyan), 0 0 40px rgba(0,242,255,0.3);
          letter-spacing: 6px;
          margin-bottom: 16px;
        }

        .about-desc {
          color: var(--muted);
          font-size: 0.95rem;
          line-height: 1.8;
          max-width: 600px;
          margin: 0 auto 40px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .feature-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: border-color 0.2s;
        }
        .feature-card:hover { border-color: rgba(0,242,255,0.3); }

        .feature-icon { font-size: 2rem; margin-bottom: 12px; }
        .feature-title { font-family: 'Orbitron', sans-serif; font-size: 0.8rem; color: var(--cyan); margin-bottom: 8px; letter-spacing: 1px; }
        .feature-desc { font-size: 0.8rem; color: var(--muted); line-height: 1.6; }

        .dev-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
        }

        .dev-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          color: var(--cyan);
          letter-spacing: 3px;
          margin-bottom: 8px;
        }

        .dev-tag { font-size: 0.8rem; color: var(--muted); }
        /* --- MOBILE RESPONSIVE FIXES --- */
        @media (max-width: 768px) {
          .layout { flex-direction: column; }
          
          .sidebar {
            position: relative;
            width: 100%;
            min-height: auto;
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding: 15px;
            display: block; 
            text-align: center;
          }
          
          .nav {
            display: flex;
            flex-direction: row;
            justify-content: center;
            gap: 8px;
            margin-top: 15px;
            margin-bottom: 15px;
          }
          .nav-item { padding: 8px 12px; font-size: 0.8rem; }
          .logo { margin-bottom: 0; }
          
          .sidebar-label { margin-top: 10px; margin-bottom: 10px; }
          .tone-btn {
            width: 31%;
            display: inline-block;
            margin: 0 1%;
            padding: 8px 0;
            font-size: 0.75rem;
          }
          
          .char-counter, .dev-credit, .logo-sub, .sidebar-divider {
            display: none;
          }
          
          .main {
            margin-left: 0;
            width: 100%;
            padding: 20px 15px;
          }
          
          .comparison-grid, .history-texts, .features-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          textarea { height: 150px; font-size: 1rem; }
          .about-title { font-size: 2rem; }
        }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <div className="logo">REVERB</div>
          <div className="logo-sub">AI REPHRASING ENGINE</div>

          <nav className="nav">
            {[
              { id: 'rephrase', icon: '⟳', label: 'Rephrase' },
              { id: 'history', icon: '◷', label: 'History' },
              { id: 'about', icon: '◈', label: 'About' },
            ].map(item => (
              <div
                key={item.id}
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>

          <div className="sidebar-divider" />

          <div className="sidebar-label">TONE</div>
          {['formal', 'casual', 'creative'].map(t => (
            <button
              key={t}
              className={`tone-btn ${tone === t ? 'active' : ''}`}
              onClick={() => setTone(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}

          <div className="char-counter">
            <div className="char-label">CHARACTERS</div>
            <div className="char-bar">
              <div className="char-fill" style={{ width: `${(charCount / MAX_CHARS) * 100}%` }} />
            </div>
            <div className="char-nums">{charCount} / {MAX_CHARS}</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <UserButton afterSignOutUrl="/" showName />
          </div>
          <div className="dev-credit">
            Developed by<br />
            <span>Sujal Das</span><br />
            © 2026
          </div>
        </aside>

        <main className="main">
          {page === 'rephrase' && (
            <>
              <div className="page-title">Rephrase</div>
              <div className="page-subtitle">Paste your text and let AI rewrite it in your chosen tone</div>

              <div className="card">
                <span className="card-label">Original Text</span>
                <textarea
                  placeholder="Paste your text here..."
                  value={originalText}
                  onChange={handleTextChange}
                />
                <div className="action-bar">
                  <button className="btn btn-ghost" onClick={handleClear}>Clear</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleRephrase}
                    disabled={loading || !originalText}
                  >
                    {loading ? 'Processing...' : 'Rephrase'}
                  </button>
                </div>
              </div>

              {(originalText || rephrasedResult) && (
                <div className="card">
                  <div className="comparison-grid">
                    <div className="pane">
                      <div className="pane-header">
                        <span className="card-label" style={{margin:0}}>Original</span>
                      </div>
                      {originalText || '—'}
                    </div>
                    <div className="pane output">
                      <div className="pane-header">
                        <span className="card-label" style={{margin:0, color:'var(--cyan)'}}>Output</span>
                        {rephrasedResult && (
                          <button className="btn-copy" onClick={handleCopy}>
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        )}
                      </div>
                      {loading ? <span className="loading-dots">Generating</span> : rephrasedResult || '—'}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {page === 'history' && (
            <>
              <div className="page-title">History</div>
              <div className="page-subtitle">{history.length} rephrasings saved</div>
              <div className="history-grid">
                {history.length === 0 ? (
                  <div className="empty-state">No history yet — start rephrasing!</div>
                ) : (
                  history.map(item => (
                    <div key={item._id} className="history-card">
                      <button className="btn-delete" onClick={() => handleDelete(item._id)}>✕</button>
                      <div className="history-meta">
                        <span className={`tone-badge ${item.tone}`}>{item.tone}</span>
                        <span className="history-time">{timeAgo(item.createdAt)}</span>
                      </div>
                      <div className="history-texts">
                        <div className="history-text-block">
                          <span className="history-text-label">ORIGINAL</span>
                          {item.originalText}
                        </div>
                        <div className="history-text-block">
                          <span className="history-text-label" style={{color:'var(--cyan)'}}>REPHRASED</span>
                          {item.rephrasedText}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {page === 'about' && (
            <>
              <div className="about-hero">
                <div className="about-title">REVERB AI</div>
                <p className="about-desc">
                  Reverb AI is an intelligent text rephrasing engine that transforms your writing
                  into any tone you need — formal, casual, or creative. Powered by Llama 3.3 70B
                  via Groq's ultra-fast inference API.
                </p>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <div className="feature-title">Lightning Fast</div>
                  <div className="feature-desc">Powered by Groq's inference engine for near-instant results</div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎭</div>
                  <div className="feature-title">3 Tones</div>
                  <div className="feature-desc">Formal, casual, and creative modes for every context</div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📜</div>
                  <div className="feature-title">Full History</div>
                  <div className="feature-desc">Every rephrase saved and accessible anytime</div>
                </div>
              </div>

              <div className="dev-section">
                <div className="dev-name">SUJAL DAS</div>
                <div className="dev-tag">Full Stack Developer · Built with MERN + Docker + Groq AI</div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default App;
