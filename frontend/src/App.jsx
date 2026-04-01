import { useState, useEffect, useRef } from 'react';
import './App.css';
import { athletes, SPORTS, TEAMS } from './athleteData';

// ─── Helpers ─────────────────────────────────────────────
const avgFit = (f) => Math.round(Object.values(f).reduce((a, b) => a + b, 0) / Object.keys(f).length);

const INJ_META = {
  healthy:    { label: 'Healthy',    cls: 'healthy',    color: '#22c55e' },
  minor:      { label: 'Minor',      cls: 'minor',      color: '#eab308' },
  recovering: { label: 'Recovering', cls: 'recovering', color: '#3b82f6' },
  injured:    { label: 'Injured',    cls: 'injured',    color: '#ef4444' },
};

const TYPE_COLORS = { cardio:'#ff6b6b', strength:'#ffd93d', speed:'#4ecdc4', flexibility:'#95e1d3', tactical:'#a78bfa', shooting:'#fb923c', blocking:'#f87171', dribbling:'#34d399' };
const TYPE_ICONS  = { cardio:'🏃', strength:'💪', speed:'⚡', flexibility:'🤸', tactical:'🎯', shooting:'🏹', blocking:'🛡️', dribbling:'🏀' };
const FIT_COLORS  = { endurance:'#ff6b6b', strength:'#ffd93d', speed:'#4ecdc4', flexibility:'#95e1d3' };

// ─── RadarChart ───────────────────────────────────────────
function RadarChart({ fitness }) {
  const cx = 120, cy = 120, maxR = 85;
  const metrics = [
    { key: 'endurance',   label: 'Endurance', angle: -Math.PI / 2 },
    { key: 'speed',       label: 'Speed',     angle: 0 },
    { key: 'strength',    label: 'Strength',  angle: Math.PI / 2 },
    { key: 'flexibility', label: 'Flex',      angle: Math.PI },
  ];
  const pt   = (a, r) => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = metrics.map(m => pt(m.angle, maxR * ((fitness[m.key] || 0) / 100)));
  return (
    <svg viewBox="0 0 240 240" className="radar-chart">
      {gridLevels.map((lvl, i) => (
        <path key={i} d={path(metrics.map(m => pt(m.angle, maxR * lvl)))}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      {metrics.map((m, i) => {
        const e = pt(m.angle, maxR);
        return <line key={i} x1={cx} y1={cy} x2={e.x.toFixed(1)} y2={e.y.toFixed(1)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
      })}
      <path d={path(dataPoints)} fill="rgba(108,99,255,0.25)" stroke="#6c63ff" strokeWidth="2" className="radar-fill" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="5" fill="#6c63ff" stroke="white" strokeWidth="1.5" />
      ))}
      {metrics.map((m, i) => {
        const lp = pt(m.angle, maxR + 22);
        return (
          <text key={i} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle" fontSize="11"
            fill="rgba(255,255,255,0.5)" fontFamily="inherit">{m.label}</text>
        );
      })}
      {metrics.map((m, i) => {
        const v  = fitness[m.key] || 0;
        const vp = pt(m.angle, maxR * (v / 100) * 0.55);
        return (
          <text key={`v${i}`} x={vp.x.toFixed(1)} y={vp.y.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle" fontSize="10"
            fill="white" fontWeight="700" fontFamily="inherit">{v}</text>
        );
      })}
    </svg>
  );
}

// ─── StatBar ──────────────────────────────────────────────
function StatBar({ label, value, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    setW(0);
    const t = setTimeout(() => setW(value), 80 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="stat-bar">
      <div className="stat-bar-head"><span>{label}</span><span style={{ color }}>{value}</span></div>
      <div className="stat-bar-track"><div className="stat-bar-fill" style={{ width: `${w}%`, background: color }} /></div>
    </div>
  );
}

// ─── AIPanel ──────────────────────────────────────────────
function AIPanel({ athlete, onClose }) {
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [exporting, setExporting]   = useState(false);
  const scrollRef             = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setText(''); setError(''); setIsComplete(false);
    const analyzeAthlete = async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
        const res = await fetch(`${apiBase}/api/athletes/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ athlete }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Server error ${res.status}`);
        }
        setLoading(false);
        if (!res.body) throw new Error('Response body is empty');
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') { setIsComplete(true); return; }
            try { const { text: t } = JSON.parse(data); if (t) setText(prev => prev + t); } catch (err) { void err; }
          }
        }
        if (!cancelled) setIsComplete(true);
      } catch (e) {
        if (!cancelled) {
          setLoading(false);
          setIsComplete(false);
          setError(e.message.includes('Failed to fetch')
            ? 'Cannot connect to backend. Please make sure the backend is running (cd backend && npm run dev), or set VITE_API_BASE_URL for your deployed backend.'
            : e.message);
        }
      }
    };
    analyzeAthlete();
    return () => { cancelled = true; };
  }, [athlete]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [text]);

  const handleExportPdf = async () => {
    if (!text || loading || !isComplete || error) return;
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });

      const marginX = 48;
      const marginY = 56;
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const maxWidth = pageW - marginX * 2;

      let y = marginY;
      const ensureSpace = (needed) => {
        if (y + needed > pageH - marginY) {
          doc.addPage();
          y = marginY;
        }
      };

      const title = 'AI Athlete Analysis';
      const subTitle = `${athlete.name} · ${athlete.position} · ${athlete.team}`;
      const generatedAt = new Date().toLocaleString('en-US');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(title, marginX, y);
      y += 22;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(subTitle, marginX, y);
      y += 16;

      doc.setTextColor(120);
      doc.text(`Generated: ${generatedAt}`, marginX, y);
      doc.setTextColor(0);
      y += 26;

      const rawLines = text.replace(/\r/g, '').split('\n');
      for (const raw of rawLines) {
        const line = raw.trimEnd();
        if (!line) {
          ensureSpace(16);
          y += 16;
          continue;
        }

        if (line.startsWith('## ')) {
          ensureSpace(24);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          const heading = line.slice(3);
          const wrapped = doc.splitTextToSize(heading, maxWidth);
          for (const w of wrapped) {
            ensureSpace(18);
            doc.text(w, marginX, y);
            y += 18;
          }
          y += 6;
          continue;
        }

        if (line.startsWith('### ')) {
          ensureSpace(20);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          const heading = line.slice(4);
          const wrapped = doc.splitTextToSize(heading, maxWidth);
          for (const w of wrapped) {
            ensureSpace(16);
            doc.text(w, marginX, y);
            y += 16;
          }
          y += 4;
          continue;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const content = line.startsWith('- ') ? `• ${line.slice(2)}` : line;
        const wrapped = doc.splitTextToSize(content, maxWidth);
        for (const w of wrapped) {
          ensureSpace(14);
          doc.text(w, marginX, y);
          y += 14;
        }
      }

      const safeName = String(athlete.name || 'athlete').replace(/[<>:"/\\|?*]+/g, '-').trim() || 'athlete';
      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`${safeName}-AI-Analysis-${dateStr}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="ai-overlay" onClick={onClose}>
      <div className="ai-panel" onClick={e => e.stopPropagation()}>
        <div className="ai-panel-header">
          <div className="ai-panel-title">
            <span className="ai-icon">🤖</span>
            <div>
              <h3>AI Athlete Analysis</h3>
              <p>{athlete.name} · {athlete.position} · {athlete.team}</p>
            </div>
          </div>
          <div className="ai-actions">
            <button className="ai-export" disabled={!text || loading || !isComplete || exporting || !!error} onClick={handleExportPdf}>
              {exporting ? 'Exporting…' : 'Export PDF'}
            </button>
            <button className="ai-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="ai-panel-body" ref={scrollRef}>
          {loading && (
            <div className="ai-loading">
              <div className="ai-dots"><span/><span/><span/></div>
              <p>AI is analyzing athlete data…</p>
            </div>
          )}
          {error && <div className="ai-error">⚠️ {error}</div>}
          {text && (
            <div className="ai-text">
              {text.split('\n').map((line, i) => {
                if (line.startsWith('## '))  return <h4 key={i} className="ai-section">{line.slice(3)}</h4>;
                if (line.startsWith('### ')) return <h5 key={i} className="ai-subsection">{line.slice(4)}</h5>;
                if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="ai-bold">{line.slice(2,-2)}</strong>;
                if (line.startsWith('- '))  return <li key={i}>{line.slice(2)}</li>;
                if (line.trim() === '')     return <br key={i} />;
                return <p key={i}>{line}</p>;
              })}
              {!isComplete && !error && <span className="ai-cursor" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── OverviewPage ─────────────────────────────────────────
function OverviewPage({ onSelectAthlete }) {
  const totalTeams  = Object.keys(TEAMS).length;
  const overallAvg  = Math.round(athletes.reduce((s, a) => s + avgFit(a.fitness), 0) / athletes.length);
  const injCounts   = athletes.reduce((acc, a) => {
    const s = a.injury?.status || 'healthy';
    acc[s]  = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const healthyRate = Math.round(((injCounts.healthy || 0) / athletes.length) * 100);

  const bySport = Object.entries(SPORTS).map(([key, meta]) => {
    const group      = athletes.filter(a => a.sport === key);
    const sportTeams = [...new Set(group.map(a => a.team))];
    const avg        = Math.round(group.reduce((s, a) => s + avgFit(a.fitness), 0) / group.length);
    return { key, ...meta, count: group.length, teamCount: sportTeams.length, avg };
  });

  const topPlayers = [...athletes]
    .sort((a, b) => avgFit(b.fitness) - avgFit(a.fitness))
    .slice(0, 8);

  const teamLeaderboard = Object.entries(
    athletes.reduce((acc, a) => {
      if (!acc[a.team]) acc[a.team] = { total: 0, count: 0, sport: a.sport };
      acc[a.team].total += avgFit(a.fitness);
      acc[a.team].count += 1;
      return acc;
    }, {})
  )
    .map(([name, d]) => ({ name, avg: Math.round(d.total / d.count), count: d.count, sport: d.sport, color: TEAMS[name]?.color }))
    .sort((a, b) => b.avg - a.avg);

  return (
    <div className="overview">
      <div className="ov-header">
        <h1 className="ov-title">Dashboard</h1>
        <p className="ov-subtitle">Real-time overview of all athletes · {new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="ov-stats">
        {[
          { icon: '👥', value: athletes.length, label: 'Total Athletes', unit: '', color: '#a78bfa' },
          { icon: '🏟️', value: totalTeams,      label: 'Total Teams',   unit: '', color: '#4ecdc4' },
          { icon: '💪', value: overallAvg,       label: 'Avg Fitness Score', unit: '', color: '#ffd93d' },
          { icon: '❤️', value: healthyRate,       label: 'Health Rate',  unit: '%', color: '#22c55e' },
        ].map((s, i) => (
          <div className="ov-stat-card glass" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="ov-stat-icon" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
            <div className="ov-stat-body">
              <div className="ov-stat-val">
                <span style={{ color: s.color }}>{s.value}</span>
                <span className="ov-stat-unit">{s.unit}</span>
              </div>
              <div className="ov-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sports + Injury ── */}
      <div className="ov-mid">
        <div className="glass-panel">
          <h3 className="panel-title">Sports Distribution</h3>
          <div className="ov-sports">
            {bySport.map((s, i) => (
              <div className="ov-sport-card" key={s.key} style={{ '--sport-c': s.color, animationDelay: `${0.2 + i * 0.1}s` }}>
                <div className="ov-sport-icon">{s.icon}</div>
                <div className="ov-sport-label">{s.label}</div>
                <div className="ov-sport-count">{s.count} athletes</div>
                <div className="ov-sport-meta">{s.teamCount} teams · avg {s.avg}</div>
                <div className="ov-sport-bar-track">
                  <div className="ov-sport-bar-fill" style={{ width: `${(s.count / athletes.length) * 100}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel">
          <h3 className="panel-title">Injury Status</h3>
          <div className="ov-inj-list">
            {Object.entries(INJ_META).map(([key, meta]) => {
              const count = injCounts[key] || 0;
              const pct   = Math.round((count / athletes.length) * 100);
              return (
                <div className="ov-inj-row" key={key}>
                  <div className="ov-inj-dot" style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
                  <span className="ov-inj-label">{meta.label}</span>
                  <div className="ov-inj-bar-track">
                    <div className="ov-inj-bar-fill" style={{ width: `${pct}%`, background: meta.color + '99' }} />
                  </div>
                  <span className="ov-inj-pct" style={{ color: meta.color }}>{pct}%</span>
                  <span className="ov-inj-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Top performers + Team leaderboard ── */}
      <div className="ov-bottom">
        <div className="glass-panel">
          <h3 className="panel-title">Top Performers</h3>
          <div className="ov-top-list">
            {topPlayers.map((a, i) => {
              const score = avgFit(a.fitness);
              const inj   = INJ_META[a.injury?.status] || INJ_META.healthy;
              const sc    = SPORTS[a.sport];
              return (
                <div className="ov-top-row" key={a._id} onClick={() => onSelectAthlete(a)}
                  style={{ animationDelay: `${0.3 + i * 0.05}s` }}>
                  <span className="ov-rank" style={{ color: i < 3 ? ['#ffd700','#c0c0c0','#cd7f32'][i] : 'rgba(255,255,255,0.25)' }}>
                    {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                  </span>
                  <img src={a.avatar} alt={a.name} className="ov-top-avatar" />
                  <div className="ov-top-info">
                    <span className="ov-top-name">{a.name}</span>
                    <span className="ov-top-sub">{sc?.icon} {a.position} · {a.team}</span>
                  </div>
                  <div className={`ov-inj-pip inj-${inj.cls}`} title={inj.label} />
                  <span className="ov-top-score" style={{ color: score >= 90 ? '#4ecdc4' : score >= 85 ? '#a78bfa' : '#ffd93d' }}>{score}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel">
          <h3 className="panel-title">Team Rankings</h3>
          <div className="ov-team-list">
            {teamLeaderboard.map((t, i) => (
              <div className="ov-team-row" key={t.name} style={{ animationDelay: `${0.3 + i * 0.04}s` }}>
                <span className="ov-team-rank">{i + 1}</span>
                <div className="ov-team-dot" style={{ background: t.color, boxShadow: `0 0 6px ${t.color}` }} />
                <div className="ov-team-info">
                  <span className="ov-team-name">{t.name}</span>
                  <span className="ov-team-sub">{SPORTS[t.sport]?.icon} {t.count} players</span>
                </div>
                <div className="ov-team-bar-track">
                  <div className="ov-team-bar-fill" style={{ width: `${Math.max(0, ((t.avg - 70) / 25) * 100)}%`, background: t.color + 'aa' }} />
                </div>
                <span className="ov-team-avg" style={{ color: t.color }}>{t.avg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────
export default function App() {
  const [view, setView]                       = useState('overview');
  const [selectedAthlete, setSelectedAthlete] = useState(athletes[0]);
  const [sportFilter, setSportFilter]         = useState('all');
  const [teamFilter, setTeamFilter]           = useState('all');
  const [search, setSearch]                   = useState('');
  const [animKey, setAnimKey]                 = useState(0);
  const [showAI, setShowAI]                   = useState(false);

  const availableTeams = sportFilter === 'all'
    ? []
    : [...new Set(athletes.filter(a => a.sport === sportFilter).map(a => a.team))];

  const filtered = athletes.filter(a => {
    if (sportFilter !== 'all' && a.sport !== sportFilter) return false;
    if (teamFilter !== 'all' && a.team !== teamFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) &&
        !a.position.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, a) => {
    if (!acc[a.team]) acc[a.team] = [];
    acc[a.team].push(a);
    return acc;
  }, {});

  const handleSelect = (a) => {
    setSelectedAthlete(a);
    setAnimKey(k => k + 1);
    setShowAI(false);
    setView('detail');
  };

  const handleSportFilter = (s) => { setSportFilter(s); setTeamFilter('all'); };

  const score     = avgFit(selectedAthlete.fitness);
  const scoreColor = score >= 90 ? '#4ecdc4' : score >= 80 ? '#a78bfa' : '#ffd93d';
  const sportMeta  = SPORTS[selectedAthlete.sport];
  const injMeta    = INJ_META[selectedAthlete.injury?.status] || INJ_META.healthy;

  return (
    <div className="app">
      {/* Background orbs */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">⚡</div>
          <span className="brand-name">AthleteHub</span>
        </div>

        <div className="sidebar-nav">
          <button className={`nav-btn ${view === 'overview' ? 'active' : ''}`} onClick={() => setView('overview')}>
            <span className="nav-icon">📊</span> Dashboard
          </button>
          <button className={`nav-btn ${view === 'detail' ? 'active' : ''}`} onClick={() => { if (selectedAthlete) setView('detail'); }}>
            <span className="nav-icon">👤</span> Player Detail
          </button>
        </div>

        <div className="sport-tabs">
          <button className={`sport-tab ${sportFilter === 'all' ? 'active' : ''}`} onClick={() => handleSportFilter('all')}>All</button>
          {Object.entries(SPORTS).map(([key, s]) => (
            <button key={key} className={`sport-tab ${sportFilter === key ? 'active' : ''}`}
              onClick={() => handleSportFilter(key)}
              style={sportFilter === key ? { borderColor: s.color, color: s.color } : {}}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {availableTeams.length > 0 && (
          <div className="team-filter">
            <button className={`team-chip ${teamFilter === 'all' ? 'active' : ''}`} onClick={() => setTeamFilter('all')}>All Teams</button>
            {availableTeams.map(t => (
              <button key={t} className={`team-chip ${teamFilter === t ? 'active' : ''}`}
                onClick={() => setTeamFilter(t)}
                style={teamFilter === t ? { background: TEAMS[t]?.color + '30', borderColor: TEAMS[t]?.color } : {}}>
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" type="text" placeholder="Search players or positions…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>

        <p className="list-label">Players · {filtered.length}</p>

        <div className="athlete-list">
          {Object.entries(grouped).map(([team, members]) => (
            <div key={team} className="team-group">
              <div className="team-group-header" style={{ '--team-color': TEAMS[team]?.color || '#6c63ff' }}>
                <span className="team-dot" />
                <span>{team}</span>
                <span className="team-count">{members.length}</span>
              </div>
              {members.map(a => {
                const avg   = avgFit(a.fitness);
                const inj   = INJ_META[a.injury?.status] || INJ_META.healthy;
                const isAct = selectedAthlete._id === a._id && view === 'detail';
                return (
                  <div key={a._id} className={`athlete-card ${isAct ? 'active' : ''}`} onClick={() => handleSelect(a)}>
                    <div className="card-avatar-wrap">
                      <img src={a.avatar} alt={a.name} className="card-avatar" loading="lazy" />
                      <span className={`inj-dot inj-${inj.cls}`} title={inj.label} />
                    </div>
                    <div className="card-info">
                      <span className="card-name">{a.name}</span>
                      <span className="card-sub">{a.position} · #{a.number}</span>
                    </div>
                    <span className="card-score" style={{ color: avg >= 90 ? '#4ecdc4' : avg >= 80 ? '#a78bfa' : '#ffd93d' }}>{avg}</span>
                  </div>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && <p className="no-results">No players found</p>}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main">
        {view === 'overview' ? (
          <OverviewPage onSelectAthlete={handleSelect} />
        ) : (
          <div className="detail-view" key={animKey}>
            {/* Hero */}
            <div className="hero glass" style={{ '--sport-color': sportMeta?.color || '#6c63ff' }}>
              <div className="hero-glow" style={{ background: `radial-gradient(circle, ${sportMeta?.color || '#6c63ff'}22 0%, transparent 70%)` }} />
              <div className="hero-avatar-wrap">
                <img src={selectedAthlete.avatar} alt={selectedAthlete.name} className="hero-avatar-img" />
              </div>
              <div className="hero-info">
                <div className="hero-badges">
                  <span className="sport-badge" style={{ background: sportMeta?.color + '20', color: sportMeta?.color, borderColor: sportMeta?.color + '50' }}>
                    {sportMeta?.icon} {sportMeta?.label}
                  </span>
                  <span className={`inj-badge inj-badge-${injMeta.cls}`}>{injMeta.label}</span>
                </div>
                <h1 className="hero-name">{selectedAthlete.name}</h1>
                <p className="hero-sub">
                  {selectedAthlete.position} · #{selectedAthlete.number} · {selectedAthlete.team} · Age {selectedAthlete.age}
                </p>
                {selectedAthlete.injury?.detail && (
                  <p className="hero-inj-detail">⚕️ {selectedAthlete.injury.detail}</p>
                )}
              </div>
              <div className="hero-right">
                <div className="hero-score">
                  <span className="hero-score-val" style={{ color: scoreColor }}>{score}</span>
                  <span className="hero-score-label">Overall Score</span>
                </div>
                <button className="ai-btn" onClick={() => setShowAI(true)}>
                  <span>🤖</span> AI Analysis
                </button>
              </div>
            </div>

            {/* Physical */}
            <div className="cards-row">
              {[
                { icon:'📏', value: selectedAthlete.physicalData?.height, unit:'cm',  label:'Height' },
                { icon:'⚖️', value: selectedAthlete.physicalData?.weight, unit:'kg',  label:'Weight' },
                { icon:'📊', value: selectedAthlete.physicalData?.bmi,    unit:'BMI', label:'Body Mass Index' },
              ].map((s, i) => (
                <div className="metric-card glass" key={i} style={{ animationDelay:`${i * 0.07}s` }}>
                  <span className="metric-icon">{s.icon}</span>
                  <div className="metric-vals">
                    <span className="metric-num">{s.value}</span>
                    <span className="metric-unit">{s.unit}</span>
                  </div>
                  <span className="metric-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Fitness */}
            <div className="fitness-row">
              <div className="glass-panel radar-panel">
                <h3 className="panel-title">Fitness Radar</h3>
                <RadarChart fitness={selectedAthlete.fitness} />
              </div>
              <div className="glass-panel bars-panel">
                <h3 className="panel-title">Fitness Metrics</h3>
                <div className="bars-list">
                  {Object.entries(selectedAthlete.fitness).map(([key, val], i) => (
                    <StatBar key={`${animKey}-${key}`}
                      label={{ endurance:'Endurance', strength:'Strength', speed:'Speed', flexibility:'Flexibility' }[key] || key}
                      value={val} color={FIT_COLORS[key]} delay={i * 120} />
                  ))}
                </div>
              </div>
            </div>

            {/* Training */}
            <div className="glass-panel training-panel">
              <h3 className="panel-title">Training Log</h3>
              <div className="timeline">
                {selectedAthlete.training?.map((t, i) => (
                  <div className="timeline-item" key={i} style={{ animationDelay:`${0.2 + i * 0.1}s` }}>
                    <div className="timeline-dot" style={{ background: TYPE_COLORS[t.type] || '#6c63ff', boxShadow: `0 0 10px ${TYPE_COLORS[t.type] || '#6c63ff'}88` }} />
                    <div className="timeline-body">
                      <div className="timeline-head">
                        <span className="timeline-type" style={{ color: TYPE_COLORS[t.type] || '#6c63ff' }}>
                          {TYPE_ICONS[t.type] || '📋'} {t.type}
                        </span>
                        <span className="timeline-badge">{t.duration} min</span>
                      </div>
                      <p className="timeline-notes">{t.notes}</p>
                      <span className="timeline-date">{t.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {showAI && <AIPanel athlete={selectedAthlete} onClose={() => setShowAI(false)} />}
    </div>
  );
}
