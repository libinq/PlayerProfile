import { useState, useEffect, useRef } from 'react';
import './App.css';
import { athletes, SPORTS, TEAMS, SPORT_METRICS } from './athleteData';

// ─── Helpers ─────────────────────────────────────────────
const avgFit = (f) => Math.round(Object.values(f).reduce((a, b) => a + b, 0) / Object.keys(f).length);

const computeRadarFitness = (f) => ({
  Endurance: Math.round(((f.endurance || 0) + (f.stamina || 0)) / 2),
  Power:     Math.round(((f.strength  || 0) + (f.power   || 0)) / 2),
  Speed:     Math.round(((f.speed     || 0) + (f.agility || 0)) / 2),
  Mobility:  Math.round(((f.flexibility || 0) + (f.balance || 0)) / 2),
  Mental:    Math.round(((f.reaction  || 0) + (f.coordination || 0)) / 2),
});

const INJ_META = {
  healthy:    { label: 'Healthy',    cls: 'healthy',    color: '#22c55e' },
  minor:      { label: 'Minor',      cls: 'minor',      color: '#eab308' },
  recovering: { label: 'Recovering', cls: 'recovering', color: '#3b82f6' },
  injured:    { label: 'Injured',    cls: 'injured',    color: '#ef4444' },
};

const TYPE_COLORS = { cardio:'#ff6b6b', strength:'#ffd93d', speed:'#4ecdc4', flexibility:'#95e1d3', tactical:'#a78bfa', shooting:'#fb923c', blocking:'#f87171', dribbling:'#34d399' };
const TYPE_ICONS  = { cardio:'🏃', strength:'💪', speed:'⚡', flexibility:'🤸', tactical:'🎯', shooting:'🏹', blocking:'🛡️', dribbling:'🏀' };
const INTENSITY_META = {
  low:    { label: 'Low',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  medium: { label: 'Medium', color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  high:   { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const FIT_COLORS = {
  endurance:    '#ff6b6b',
  strength:     '#ffd93d',
  speed:        '#4ecdc4',
  flexibility:  '#95e1d3',
  agility:      '#a78bfa',
  power:        '#fb923c',
  stamina:      '#f87171',
  balance:      '#34d399',
  reaction:     '#60a5fa',
  coordination: '#e879f9',
};

const FIT_LABELS = {
  endurance:    'Endurance',
  strength:     'Strength',
  speed:        'Speed',
  flexibility:  'Flexibility',
  agility:      'Agility',
  power:        'Power',
  stamina:      'Stamina',
  balance:      'Balance',
  reaction:     'Reaction',
  coordination: 'Coordination',
};

const ANALYSIS_TYPES = [
  { key: 'overall',     label: 'Overall',      icon: '🔍' },
  { key: 'potential',   label: 'Potential',     icon: '🚀' },
  { key: 'injury',      label: 'Injury Risk',   icon: '🏥' },
  { key: 'training',    label: 'Training Plan', icon: '📋' },
  { key: 'performance', label: 'Performance',   icon: '📈' },
];

const TRAINING_TYPES = ['cardio', 'strength', 'speed', 'flexibility', 'tactical', 'shooting', 'blocking', 'dribbling'];

// ─── Injury Risk Rules Engine ─────────────────────────────
function computeInjuryRisks(athlete) {
  const f   = athlete.fitness;
  const p   = athlete.physicalData;
  const sport    = athlete.sport;
  const position = athlete.position;
  const age      = athlete.age;
  const injStatus = athlete.injury?.status || 'healthy';

  const risks = [];

  // Rule 1: Current injury status
  if (injStatus !== 'healthy') {
    const levelMap = { minor: 'medium', recovering: 'medium', injured: 'high' };
    risks.push({
      category: 'Active Injury Status',
      level: levelMap[injStatus] || 'medium',
      rule: `Current status is "${injStatus}"`,
      dataPoints: [`Status: ${injStatus.charAt(0).toUpperCase() + injStatus.slice(1)}`, athlete.injury?.detail || 'No further details recorded'],
      explanation: 'Active injuries elevate risk of re-injury and compensatory stress injuries in adjacent muscle groups.',
      recommendation: 'Follow full medical clearance protocol before returning to contact or high-intensity training.',
    });
  }

  // Rule 2: BMI
  if (p.bmi > 30) {
    risks.push({
      category: 'Joint & Cardiovascular Overload',
      level: 'high',
      rule: 'BMI > 30 (obese/overweight range)',
      dataPoints: [`BMI: ${p.bmi}`, `Height: ${p.height} cm`, `Weight: ${p.weight} kg`],
      explanation: 'Elevated BMI places excessive mechanical stress on knee, hip, and ankle joints and raises cardiovascular injury risk.',
      recommendation: 'Initiate body composition program; consult sports nutritionist; substitute high-impact sessions with pool or bike work.',
    });
  } else if (p.bmi > 27) {
    risks.push({
      category: 'Elevated Joint Load',
      level: 'medium',
      rule: 'BMI 27–30 (elevated range)',
      dataPoints: [`BMI: ${p.bmi}`],
      explanation: 'Slightly elevated BMI increases mechanical load on lower-limb joints during high-intensity movement.',
      recommendation: 'Monitor body composition; avoid excessive high-impact volume; include low-impact conditioning days.',
    });
  }

  // Rule 3: Low flexibility
  if (f.flexibility < 60) {
    risks.push({
      category: 'Muscle Strain & Soft Tissue',
      level: 'high',
      rule: 'Flexibility score < 60',
      dataPoints: [`Flexibility: ${f.flexibility}`, `Balance: ${f.balance}`],
      explanation: 'Critically low flexibility dramatically increases risk of muscle strains (hamstrings, groin, hip flexors) especially at sprint and change-of-direction moments.',
      recommendation: 'Daily mobility work mandatory: 20+ min of static + dynamic stretching. Consider yoga or dedicated flexibility block.',
    });
  } else if (f.flexibility < 70) {
    risks.push({
      category: 'Soft Tissue Strain Risk',
      level: 'medium',
      rule: 'Flexibility score 60–70 (below average)',
      dataPoints: [`Flexibility: ${f.flexibility}`],
      explanation: 'Below-average flexibility increases strain risk during explosive acceleration, deceleration, or directional change.',
      recommendation: 'Add dedicated flexibility sessions 3× per week; dynamic warm-up before every session.',
    });
  }

  // Rule 4: Strength–Flexibility imbalance
  const strFlexGap = f.strength - f.flexibility;
  if (strFlexGap > 25) {
    risks.push({
      category: 'Muscle Tear Risk (Power–Flexibility Mismatch)',
      level: 'high',
      rule: 'Strength exceeds Flexibility by > 25 points',
      dataPoints: [`Strength: ${f.strength}`, `Flexibility: ${f.flexibility}`, `Gap: +${strFlexGap} pts`],
      explanation: 'Strong but inflexible muscles generate high eccentric forces without adequate tissue extensibility — prime condition for Grade 2–3 muscle tears.',
      recommendation: 'Immediately prioritise eccentric flexibility (Nordic hamstring curls, PNF stretching). Reduce maximal strength load until gap closes.',
    });
  } else if (strFlexGap > 15) {
    risks.push({
      category: 'Muscle Strain Risk (Power–Flexibility Mismatch)',
      level: 'medium',
      rule: 'Strength exceeds Flexibility by 15–25 points',
      dataPoints: [`Strength: ${f.strength}`, `Flexibility: ${f.flexibility}`, `Gap: +${strFlexGap} pts`],
      explanation: 'Moderate strength–flexibility gap creates soft tissue strain risk, particularly under fatigue during late-game efforts.',
      recommendation: 'Increase weekly flexibility volume; prioritise dynamic stretching in warm-ups.',
    });
  }

  // Rule 5: Speed–Balance imbalance (ankle/knee ligament risk)
  const spdBalGap = f.speed - f.balance;
  if (spdBalGap > 25) {
    risks.push({
      category: 'Ankle Sprain & ACL Risk',
      level: 'high',
      rule: 'Speed exceeds Balance by > 25 points',
      dataPoints: [`Speed: ${f.speed}`, `Balance: ${f.balance}`, `Gap: +${spdBalGap} pts`],
      explanation: 'Fast athletes with poor proprioception and balance are at very high risk of ankle sprains and ACL injuries during rapid direction changes.',
      recommendation: 'Implement proprioception programme: balance board, single-leg RDL, lateral bounds. Taping/bracing during competition.',
    });
  } else if (spdBalGap > 15) {
    risks.push({
      category: 'Lower Limb Ligament Risk',
      level: 'medium',
      rule: 'Speed exceeds Balance by 15–25 points',
      dataPoints: [`Speed: ${f.speed}`, `Balance: ${f.balance}`, `Gap: +${spdBalGap} pts`],
      explanation: 'Speed–balance imbalance elevates stress on ankle and knee ligaments during explosive movements.',
      recommendation: 'Add proprioceptive and balance drills 3× per week; include deceleration mechanics training.',
    });
  }

  // Rule 6: Low stamina (fatigue / overtraining)
  if (f.stamina < 65) {
    risks.push({
      category: 'Fatigue & Overtraining Injury',
      level: 'high',
      rule: 'Stamina score < 65',
      dataPoints: [`Stamina: ${f.stamina}`, `Endurance: ${f.endurance}`],
      explanation: 'Low stamina means the athlete reaches fatigue threshold early. Fatigued athletes show a 3× higher injury incidence — impaired neuromuscular control and decision-making under load.',
      recommendation: 'Build aerobic base with low-intensity long-duration sessions. Reduce high-intensity volume by 20–30% until stamina reaches 75+.',
    });
  } else if (f.stamina < 75) {
    risks.push({
      category: 'Late-Game Fatigue Risk',
      level: 'low',
      rule: 'Stamina 65–75 (moderate)',
      dataPoints: [`Stamina: ${f.stamina}`],
      explanation: 'Moderate stamina may lead to late-game fatigue and elevated injury risk in the final 15–20 minutes of competition.',
      recommendation: 'Include sport-specific endurance work to extend high-intensity performance window.',
    });
  }

  // Rule 7: Low reaction (contact risk)
  if (f.reaction < 65) {
    risks.push({
      category: 'Contact & Collision Injury',
      level: 'medium',
      rule: 'Reaction time score < 65',
      dataPoints: [`Reaction: ${f.reaction}`, `Coordination: ${f.coordination}`],
      explanation: 'Slow reaction time reduces ability to brace for or avoid impacts, elevating contact injury risk.',
      recommendation: 'Integrate reactive drills, visual response training, and agility ladder work into daily warm-up.',
    });
  }

  // Rule 8: Age factors
  if (age < 20) {
    risks.push({
      category: 'Youth Growth Plate Risk',
      level: 'medium',
      rule: 'Age < 20 (developing athlete)',
      dataPoints: [`Age: ${age}`],
      explanation: 'Athletes under 20 have open or recently closed epiphyseal (growth) plates that are vulnerable to apophyseal avulsion fractures and Osgood-Schlatter disease under heavy load.',
      recommendation: 'Limit early specialisation. Avoid excessive high-impact/heavy-load sessions. Emphasise technique over maximum intensity.',
    });
  } else if (age > 30) {
    risks.push({
      category: 'Age-Related Tissue Degeneration',
      level: 'medium',
      rule: 'Age > 30',
      dataPoints: [`Age: ${age}`],
      explanation: 'After age 30, tendon elasticity, cartilage recovery, and muscle regeneration capacity decline meaningfully, increasing chronic and overuse injury risk.',
      recommendation: 'Increase recovery periods between high-intensity sessions; prioritise sleep, nutrition, and soft-tissue maintenance (massage, cryotherapy).',
    });
  }

  // Rule 9: Sport-specific
  if (sport === 'soccer') {
    if (f.endurance < 70) {
      risks.push({
        category: 'Soccer-Specific: Hamstring & ACL',
        level: 'medium',
        rule: 'Soccer player with Endurance < 70',
        dataPoints: [`Endurance: ${f.endurance}`, `Sport: Soccer`],
        explanation: 'Soccer demands sustained high-intensity running (10–13 km per match). Low endurance leads to fatigue-related hamstring strains and ACL injuries in the later stages of play.',
        recommendation: 'Prioritise aerobic conditioning and eccentric hamstring programme (Nordic curl protocol).',
      });
    }
    if (['CB', 'LB', 'RB'].includes(position) && f.strength < 72) {
      risks.push({
        category: 'Defender Contact & Aerial Duel Risk',
        level: 'low',
        rule: `Defensive position (${position}) with Strength < 72`,
        dataPoints: [`Position: ${position}`, `Strength: ${f.strength}`],
        explanation: 'Defenders engage in frequent physical duels. Lower strength increases risk in aerial and body-contact confrontations.',
        recommendation: 'Add resistance training focused on lower-body and core strength (trap bar deadlift, Bulgarian split squat).',
      });
    }
  }

  if (sport === 'basketball') {
    if (f.agility < 70) {
      risks.push({
        category: 'Basketball-Specific: Ankle & Knee',
        level: 'medium',
        rule: 'Basketball player with Agility < 70',
        dataPoints: [`Agility: ${f.agility}`, `Sport: Basketball`],
        explanation: 'Basketball requires rapid multi-directional cuts on hardwood. Low agility increases lateral ankle sprain and patellar tendon stress.',
        recommendation: 'Focus on lateral movement drills, ankle stability work, and plyometric deceleration training.',
      });
    }
    if ((position === 'C' || position === 'PF') && f.balance < 70) {
      risks.push({
        category: 'Big Man: Paint Contact Lower Body Risk',
        level: 'medium',
        rule: `Big man position (${position}) with Balance < 70`,
        dataPoints: [`Position: ${position}`, `Balance: ${f.balance}`],
        explanation: 'Centers and power forwards play under significant contact in the paint. Poor balance under load elevates knee and ankle stress.',
        recommendation: 'Implement single-leg balance training and hip abductor stabilisation exercises.',
      });
    }
  }

  if (sport === 'football') {
    if (['OL', 'DL'].includes(position) && p.bmi > 29) {
      risks.push({
        category: 'Lineman: Joint Overload',
        level: 'medium',
        rule: `Lineman (${position}) with BMI > 29`,
        dataPoints: [`Position: ${position}`, `BMI: ${p.bmi}`],
        explanation: 'Linemen carry high body mass and execute explosive blocking. High BMI combined with repetitive low-stance work stresses knee and hip joints.',
        recommendation: 'Regular physiotherapy screening; monitor joint health closely; include hip mobility work daily.',
      });
    }
    if (position === 'QB' && f.reaction < 75) {
      risks.push({
        category: 'QB Pocket Awareness & Sack Risk',
        level: 'medium',
        rule: 'QB with Reaction time < 75',
        dataPoints: [`Position: QB`, `Reaction: ${f.reaction}`],
        explanation: 'QBs need fast reaction to read the blitz and avoid sacks. Lower reaction increases risk of taking unnecessary hits and shoulder/head injuries.',
        recommendation: 'Improve pocket awareness through reaction training, eye discipline drills, and rapid pre-snap read sessions.',
      });
    }
  }

  return risks;
}

// ─── RadarChart (5 aggregated dimensions) ────────────────
function RadarChart({ fitness, color = '#6c63ff' }) {
  const cx = 130, cy = 130, maxR = 90;
  const radarData = computeRadarFitness(fitness);
  const keys = Object.keys(radarData);
  const n = keys.length;
  const metrics = keys.map((key, i) => ({
    key,
    label: key,
    angle: -Math.PI / 2 + i * (2 * Math.PI / n),
  }));
  const pt   = (a, r) => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = metrics.map(m => pt(m.angle, maxR * ((radarData[m.key] || 0) / 100)));
  return (
    <svg viewBox="0 0 260 260" className="radar-chart">
      {gridLevels.map((lvl, i) => (
        <path key={i} d={path(metrics.map(m => pt(m.angle, maxR * lvl)))}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      {metrics.map((m, i) => {
        const e = pt(m.angle, maxR);
        return <line key={i} x1={cx} y1={cy} x2={e.x.toFixed(1)} y2={e.y.toFixed(1)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
      })}
      <path d={path(dataPoints)} fill={`${color}38`} stroke={color} strokeWidth="2" className="radar-fill" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="5" fill={color} stroke="white" strokeWidth="1.5" />
      ))}
      {metrics.map((m, i) => {
        const lp = pt(m.angle, maxR + 26);
        return (
          <text key={i} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle" fontSize="10.5"
            fill="rgba(255,255,255,0.5)" fontFamily="inherit">{m.label}</text>
        );
      })}
      {metrics.map((m, i) => {
        const v  = radarData[m.key] || 0;
        const vp = pt(m.angle, maxR * (v / 100) * 0.58);
        return (
          <text key={`v${i}`} x={vp.x.toFixed(1)} y={vp.y.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle" fontSize="10"
            fill="white" fontWeight="700" fontFamily="inherit">{v}</text>
        );
      })}
    </svg>
  );
}

// ─── DualRadarChart (comparison overlay) ─────────────────
function DualRadarChart({ fitness1, fitness2, color1 = '#6c63ff', color2 = '#f59e0b' }) {
  const cx = 130, cy = 130, maxR = 90;
  const rd1 = computeRadarFitness(fitness1);
  const rd2 = computeRadarFitness(fitness2);
  const keys = Object.keys(rd1);
  const n = keys.length;
  const metrics = keys.map((key, i) => ({ key, label: key, angle: -Math.PI / 2 + i * (2 * Math.PI / n) }));
  const pt   = (a, r) => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dp1 = metrics.map(m => pt(m.angle, maxR * ((rd1[m.key] || 0) / 100)));
  const dp2 = metrics.map(m => pt(m.angle, maxR * ((rd2[m.key] || 0) / 100)));
  return (
    <svg viewBox="0 0 260 260" className="radar-chart">
      {gridLevels.map((lvl, i) => (
        <path key={i} d={path(metrics.map(m => pt(m.angle, maxR * lvl)))}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      {metrics.map((m, i) => {
        const e = pt(m.angle, maxR);
        return <line key={i} x1={cx} y1={cy} x2={e.x.toFixed(1)} y2={e.y.toFixed(1)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
      })}
      <path d={path(dp1)} fill={`${color1}28`} stroke={color1} strokeWidth="2" />
      <path d={path(dp2)} fill={`${color2}28`} stroke={color2} strokeWidth="2" />
      {metrics.map((m, i) => {
        const lp = pt(m.angle, maxR + 26);
        return (
          <text key={i} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle" fontSize="10.5"
            fill="rgba(255,255,255,0.5)" fontFamily="inherit">{m.label}</text>
        );
      })}
    </svg>
  );
}

// ─── StatBar ──────────────────────────────────────────────
function StatBar({ label, value, color, delay = 0, isKey = false }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    setW(0);
    const t = setTimeout(() => setW(value), 80 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className={`stat-bar ${isKey ? 'stat-bar-key' : ''}`}>
      <div className="stat-bar-head">
        <span>{label}{isKey && <span className="key-metric-star">★</span>}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div className="stat-bar-track"><div className="stat-bar-fill" style={{ width: `${w}%`, background: color }} /></div>
    </div>
  );
}

// ─── TrainingMaintainModal ────────────────────────────────
function TrainingMaintainModal({ athleteName, onClose, onSave }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    date: today,
    type: 'cardio',
    duration: 45,
    intensity: 'medium',
    notes: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.notes.trim()) { setError('Please enter training notes.'); return; }
    if (!form.duration || form.duration < 5) { setError('Duration must be at least 5 minutes.'); return; }
    onSave({ ...form, duration: Number(form.duration) });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">📝</span>
            <div>
              <h3>Add Training Session</h3>
              <p>{athleteName}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Training Type</label>
              <select className="modal-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {TRAINING_TYPES.map(t => (
                  <option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="modal-field">
              <label className="modal-label">Intensity</label>
              <select className="modal-select" value={form.intensity} onChange={e => setForm({ ...form, intensity: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Date</label>
              <input className="modal-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="modal-field">
              <label className="modal-label">Duration (min)</label>
              <input className="modal-input" type="number" value={form.duration} min="5" max="300"
                onChange={e => setForm({ ...form, duration: e.target.value })} />
            </div>
          </div>
          <div className="modal-field">
            <label className="modal-label">Notes</label>
            <textarea className="modal-textarea" rows="3" value={form.notes}
              placeholder="Describe the training session content and goals…"
              onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-btn-save">Save Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── AIPanel (on-demand generation) ──────────────────────
function AIPanel({ athlete, onClose }) {
  const [analysisType, setAnalysisType] = useState('overall');
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [generated, setGenerated]   = useState(false);
  const [exporting, setExporting]   = useState(false);
  const scrollRef = useRef(null);
  const cancelRef = useRef(false);

  // Reset when type changes (but don't auto-start)
  const handleTypeChange = (key) => {
    cancelRef.current = true;
    setAnalysisType(key);
    setText('');
    setError('');
    setIsComplete(false);
    setGenerated(false);
    setLoading(false);
    setTimeout(() => { cancelRef.current = false; }, 50);
  };

  const runAnalysis = async () => {
    cancelRef.current = false;
    setGenerated(true);
    setLoading(true);
    setText('');
    setError('');
    setIsComplete(false);
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
      const res = await fetch(`${apiBase}/api/athletes/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athlete, analysisType }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${res.status}`);
      }
      setLoading(false);
      if (!res.body) throw new Error('Response body is empty');
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      while (!cancelRef.current) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') { setIsComplete(true); return; }
          try { const { text: t } = JSON.parse(data); if (t) setText(prev => prev + t); } catch { /* ignore */ }
        }
      }
      if (!cancelRef.current) setIsComplete(true);
    } catch (e) {
      if (!cancelRef.current) {
        setLoading(false);
        setIsComplete(false);
        setError(e.message.includes('Failed to fetch')
          ? 'Cannot connect to backend. Please make sure the backend is running (cd backend && npm run dev).'
          : e.message);
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [text]);

  const handleExportPdf = async () => {
    if (!text || loading || !isComplete || error) return;
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const marginX = 48, marginY = 56;
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const maxWidth = pageW - marginX * 2;
      let y = marginY;
      const ensureSpace = (needed) => {
        if (y + needed > pageH - marginY) { doc.addPage(); y = marginY; }
      };
      const typeMeta = ANALYSIS_TYPES.find(t => t.key === analysisType) || ANALYSIS_TYPES[0];
      doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
      doc.text(`AI Athlete Analysis — ${typeMeta.label}`, marginX, y); y += 22;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
      doc.text(`${athlete.name} · ${athlete.position} · ${athlete.team}`, marginX, y); y += 16;
      doc.setTextColor(120);
      doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, marginX, y);
      doc.setTextColor(0); y += 26;
      for (const raw of text.replace(/\r/g, '').split('\n')) {
        const line = raw.trimEnd();
        if (!line) { ensureSpace(16); y += 16; continue; }
        if (line.startsWith('## ')) {
          ensureSpace(24); doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
          for (const w of doc.splitTextToSize(line.slice(3), maxWidth)) { ensureSpace(18); doc.text(w, marginX, y); y += 18; }
          y += 6; continue;
        }
        if (line.startsWith('### ')) {
          ensureSpace(20); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
          for (const w of doc.splitTextToSize(line.slice(4), maxWidth)) { ensureSpace(16); doc.text(w, marginX, y); y += 16; }
          y += 4; continue;
        }
        doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
        const content = line.startsWith('- ') ? `• ${line.slice(2)}` : line;
        for (const w of doc.splitTextToSize(content, maxWidth)) { ensureSpace(14); doc.text(w, marginX, y); y += 14; }
      }
      const safeName = String(athlete.name || 'athlete').replace(/[<>:"/\\|?*]+/g, '-').trim() || 'athlete';
      doc.save(`${safeName}-${analysisType}-Analysis-${new Date().toISOString().slice(0,10)}.pdf`);
    } finally { setExporting(false); }
  };

  const currentType = ANALYSIS_TYPES.find(t => t.key === analysisType) || ANALYSIS_TYPES[0];

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

        <div className="ai-type-bar">
          {ANALYSIS_TYPES.map(t => (
            <button key={t.key}
              className={`ai-type-btn ${analysisType === t.key ? 'active' : ''}`}
              onClick={() => handleTypeChange(t.key)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        <div className="ai-panel-body" ref={scrollRef}>
          <div className="ai-type-badge">{currentType.icon} {currentType.label} Analysis</div>

          {!generated && !loading && (
            <div className="ai-generate-prompt">
              <div className="ai-generate-icon">🤖</div>
              <p className="ai-generate-title">Ready to Analyze</p>
              <p className="ai-generate-sub">
                Select an analysis type above, then click <strong>Generate</strong> to run the AI analysis for <strong>{athlete.name}</strong>.
              </p>
              <button className="ai-generate-btn" onClick={runAnalysis}>
                <span>✨</span> Generate {currentType.label} Analysis
              </button>
            </div>
          )}

          {loading && (
            <div className="ai-loading">
              <div className="ai-dots"><span/><span/><span/></div>
              <p>Generating {currentType.label.toLowerCase()} analysis…</p>
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
          {isComplete && !error && text && (
            <div className="ai-regenerate-row">
              <button className="ai-regen-btn" onClick={runAnalysis}>
                ↺ Regenerate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── InjuryPredictionPanel ────────────────────────────────
function InjuryPredictionPanel({ athlete, onClose }) {
  const risks = computeInjuryRisks(athlete);
  const highCount   = risks.filter(r => r.level === 'high').length;
  const mediumCount = risks.filter(r => r.level === 'medium').length;
  const overallLevel = highCount > 0 ? 'high' : mediumCount > 1 ? 'medium' : mediumCount === 1 ? 'low-medium' : 'low';
  const overallMeta = {
    high:         { label: 'HIGH RISK',        color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)' },
    medium:       { label: 'MODERATE RISK',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
    'low-medium': { label: 'LOW-MODERATE RISK',color: '#eab308', bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.3)' },
    low:          { label: 'LOW RISK',         color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)' },
  };
  const levelMeta = {
    high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'HIGH' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'MEDIUM' },
    low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  label: 'LOW' },
  };
  const om = overallMeta[overallLevel];

  return (
    <div className="ai-overlay" onClick={onClose}>
      <div className="inj-pred-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="inj-pred-header">
          <div className="ai-panel-title">
            <span className="ai-icon">🩺</span>
            <div>
              <h3>Injury Risk Prediction</h3>
              <p>{athlete.name} · {athlete.position} · {athlete.team}</p>
            </div>
          </div>
          <button className="ai-close" onClick={onClose}>✕</button>
        </div>

        {/* Methodology disclaimer */}
        <div className="inj-pred-methodology">
          <div className="inj-method-badge">📊 Rule-Based Prediction</div>
          <p>
            This prediction is <strong>not AI-generated</strong>. It uses a transparent, deterministic rule engine based on
            sports science and physiotherapy research. Each risk is triggered by specific measurable data thresholds.
            Rules applied: <strong>BMI thresholds</strong>, <strong>fitness metric imbalances</strong>,
            <strong> age factors</strong>, and <strong>sport/position-specific patterns</strong>.
          </p>
        </div>

        <div className="inj-pred-body">
          {/* Overall risk */}
          <div className="inj-overall-card" style={{ background: om.bg, borderColor: om.border }}>
            <div className="inj-overall-left">
              <span className="inj-overall-label" style={{ color: om.color }}>Overall Injury Risk</span>
              <span className="inj-overall-level" style={{ color: om.color }}>{om.label}</span>
            </div>
            <div className="inj-overall-stats">
              <span className="inj-stat-badge" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                {highCount} HIGH
              </span>
              <span className="inj-stat-badge" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
                {mediumCount} MEDIUM
              </span>
              <span className="inj-stat-badge" style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                {risks.filter(r => r.level === 'low').length} LOW
              </span>
            </div>
          </div>

          {/* Data inputs summary */}
          <div className="inj-data-summary">
            <p className="inj-data-title">📋 Data Inputs Used for This Prediction</p>
            <div className="inj-data-grid">
              <div className="inj-data-item"><span className="inj-data-key">Age</span><span className="inj-data-val">{athlete.age} yrs</span></div>
              <div className="inj-data-item"><span className="inj-data-key">BMI</span><span className="inj-data-val">{athlete.physicalData.bmi}</span></div>
              <div className="inj-data-item"><span className="inj-data-key">Flexibility</span><span className="inj-data-val">{athlete.fitness.flexibility}</span></div>
              <div className="inj-data-item"><span className="inj-data-key">Strength</span><span className="inj-data-val">{athlete.fitness.strength}</span></div>
              <div className="inj-data-item"><span className="inj-data-key">Speed</span><span className="inj-data-val">{athlete.fitness.speed}</span></div>
              <div className="inj-data-item"><span className="inj-data-key">Balance</span><span className="inj-data-val">{athlete.fitness.balance}</span></div>
              <div className="inj-data-item"><span className="inj-data-key">Stamina</span><span className="inj-data-val">{athlete.fitness.stamina}</span></div>
              <div className="inj-data-item"><span className="inj-data-key">Reaction</span><span className="inj-data-val">{athlete.fitness.reaction}</span></div>
              <div className="inj-data-item"><span className="inj-data-key">Sport</span><span className="inj-data-val">{SPORTS[athlete.sport]?.label}</span></div>
              <div className="inj-data-item"><span className="inj-data-key">Position</span><span className="inj-data-val">{athlete.position}</span></div>
              <div className="inj-data-item"><span className="inj-data-key">Injury Status</span><span className="inj-data-val">{athlete.injury?.status}</span></div>
            </div>
          </div>

          {/* Risk list */}
          {risks.length === 0 ? (
            <div className="inj-no-risks">
              <span>✅</span>
              <p>No significant risk factors detected based on current data. Maintain regular monitoring.</p>
            </div>
          ) : (
            <div className="inj-risks-list">
              <p className="inj-risks-title">{risks.length} Risk Factor{risks.length !== 1 ? 's' : ''} Identified</p>
              {risks.map((r, i) => {
                const lm = levelMeta[r.level] || levelMeta.low;
                return (
                  <div className="inj-risk-card" key={i} style={{ borderColor: lm.color + '44' }}>
                    <div className="inj-risk-head">
                      <span className="inj-risk-cat">{r.category}</span>
                      <span className="inj-risk-badge" style={{ color: lm.color, background: lm.bg }}>{lm.label}</span>
                    </div>
                    <div className="inj-risk-rule">
                      <span className="inj-rule-label">Rule Triggered:</span>
                      <span className="inj-rule-text">{r.rule}</span>
                    </div>
                    <div className="inj-risk-data">
                      <span className="inj-rule-label">Data Points:</span>
                      <div className="inj-data-chips">
                        {r.dataPoints.filter(d => d).map((d, j) => (
                          <span key={j} className="inj-data-chip">{d}</span>
                        ))}
                      </div>
                    </div>
                    <p className="inj-risk-explanation">{r.explanation}</p>
                    <div className="inj-risk-rec">
                      <span className="inj-rec-icon">💡</span>
                      <span>{r.recommendation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="inj-disclaimer">
            ⚠️ This prediction is for informational purposes only and does not constitute medical advice.
            Consult a qualified sports medicine professional for diagnosis and treatment.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ComparePanel ──────────────────────────────────────────
function ComparePanel({ athlete1, athlete2, onClose }) {
  const sport = SPORTS[athlete1.sport];
  const sportMetrics = SPORT_METRICS[athlete1.sport];
  const ALL_FIT_KEYS = ['endurance','strength','speed','flexibility','agility','power','stamina','balance','reaction','coordination'];

  const inj1 = INJ_META[athlete1.injury?.status] || INJ_META.healthy;
  const inj2 = INJ_META[athlete2.injury?.status] || INJ_META.healthy;
  const score1 = avgFit(athlete1.fitness);
  const score2 = avgFit(athlete2.fitness);

  return (
    <div className="ai-overlay" onClick={onClose}>
      <div className="compare-panel" onClick={e => e.stopPropagation()}>
        <div className="compare-header">
          <div className="compare-title">
            <span className="ai-icon">{sport?.icon}</span>
            <div>
              <h3>Athlete Comparison</h3>
              <p>{sport?.label} — Side-by-Side Analysis</p>
            </div>
          </div>
          <button className="ai-close" onClick={onClose}>✕</button>
        </div>

        <div className="compare-body">
          {/* Athlete headers */}
          <div className="compare-athletes">
            {[athlete1, athlete2].map((a, idx) => {
              const sc = avgFit(a.fitness);
              const inj = INJ_META[a.injury?.status] || INJ_META.healthy;
              const color = idx === 0 ? '#6c63ff' : '#f59e0b';
              return (
                <div className="compare-athlete-card" key={a._id} style={{ borderColor: color + '44' }}>
                  <div className="compare-player-legend" style={{ background: color }}>{idx === 0 ? 'A' : 'B'}</div>
                  <img src={a.avatar} alt={a.name} className="compare-avatar" />
                  <div className="compare-player-info">
                    <span className="compare-player-name">{a.name}</span>
                    <span className="compare-player-sub">{a.position} · #{a.number} · {a.team}</span>
                    <span className="compare-player-sub">Age {a.age} · {a.physicalData.height}cm / {a.physicalData.weight}kg</span>
                  </div>
                  <div className="compare-player-score" style={{ color }}>
                    <span className="compare-score-val">{sc}</span>
                    <span className="compare-score-label">Overall</span>
                  </div>
                  <div className={`inj-badge inj-badge-${inj.cls}`} style={{ fontSize: '10px' }}>{inj.label}</div>
                </div>
              );
            })}
          </div>

          {/* Radar comparison */}
          <div className="compare-section">
            <p className="compare-section-title">Fitness Radar Comparison</p>
            <div className="compare-radar-wrap">
              <DualRadarChart fitness1={athlete1.fitness} fitness2={athlete2.fitness} color1="#6c63ff" color2="#f59e0b" />
              <div className="compare-radar-legend">
                <span className="compare-legend-dot" style={{ background: '#6c63ff' }}></span>
                <span className="compare-legend-name">{athlete1.name}</span>
                <span className="compare-legend-dot" style={{ background: '#f59e0b' }}></span>
                <span className="compare-legend-name">{athlete2.name}</span>
              </div>
            </div>
          </div>

          {/* Fitness metric bars side by side */}
          <div className="compare-section">
            <p className="compare-section-title">
              Fitness Metrics
              {sportMetrics && <span className="compare-key-note">★ = Key metric for {sport?.label}</span>}
            </p>
            <div className="compare-bars">
              {ALL_FIT_KEYS.map((key) => {
                const v1 = athlete1.fitness[key] || 0;
                const v2 = athlete2.fitness[key] || 0;
                const isKey = sportMetrics?.keyMetrics.includes(key);
                const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;
                return (
                  <div className={`compare-bar-row ${isKey ? 'compare-bar-key' : ''}`} key={key}>
                    <div className="compare-bar-val-left" style={{ color: winner === 1 ? '#6c63ff' : 'rgba(255,255,255,0.45)' }}>
                      {v1}{winner === 1 && <span className="compare-winner">▲</span>}
                    </div>
                    <div className="compare-bar-center">
                      <div className="compare-bar-label">{FIT_LABELS[key]}{isKey && <span className="key-metric-star">★</span>}</div>
                      <div className="compare-dual-bar">
                        <div className="compare-bar-half compare-bar-left">
                          <div className="compare-bar-fill-left" style={{ width: `${v1}%`, background: '#6c63ff' }} />
                        </div>
                        <div className="compare-bar-half compare-bar-right">
                          <div className="compare-bar-fill-right" style={{ width: `${v2}%`, background: '#f59e0b' }} />
                        </div>
                      </div>
                    </div>
                    <div className="compare-bar-val-right" style={{ color: winner === 2 ? '#f59e0b' : 'rgba(255,255,255,0.45)' }}>
                      {winner === 2 && <span className="compare-winner">▲</span>}{v2}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Physical data */}
          <div className="compare-section">
            <p className="compare-section-title">Physical Data</p>
            <div className="compare-physical">
              {[
                { label: 'Height', v1: `${athlete1.physicalData.height} cm`, v2: `${athlete2.physicalData.height} cm`, numV1: athlete1.physicalData.height, numV2: athlete2.physicalData.height },
                { label: 'Weight', v1: `${athlete1.physicalData.weight} kg`, v2: `${athlete2.physicalData.weight} kg`, numV1: athlete1.physicalData.weight, numV2: athlete2.physicalData.weight },
                { label: 'BMI',    v1: `${athlete1.physicalData.bmi}`,       v2: `${athlete2.physicalData.bmi}`,       numV1: athlete1.physicalData.bmi,    numV2: athlete2.physicalData.bmi },
                { label: 'Overall Score', v1: `${score1}`, v2: `${score2}`, numV1: score1, numV2: score2 },
              ].map(row => (
                <div className="compare-phys-row" key={row.label}>
                  <span className="compare-phys-val" style={{ color: row.numV1 >= row.numV2 ? '#6c63ff' : 'rgba(255,255,255,0.4)' }}>{row.v1}</span>
                  <span className="compare-phys-label">{row.label}</span>
                  <span className="compare-phys-val" style={{ color: row.numV2 >= row.numV1 ? '#f59e0b' : 'rgba(255,255,255,0.4)' }}>{row.v2}</span>
                </div>
              ))}
            </div>
          </div>
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

// ─── ComparePage ──────────────────────────────────────────
function ComparePage({ initialAthlete }) {
  const [sportFilter, setSportFilter]   = useState(initialAthlete?.sport || 'soccer');
  const [athlete1, setAthlete1]         = useState(initialAthlete || null);
  const [athlete2, setAthlete2]         = useState(null);
  const [selectingSlot, setSelectingSlot] = useState(athlete1 ? 2 : 1);

  const sportAthletes = athletes.filter(a => a.sport === sportFilter);

  const handleSelectAthlete = (a) => {
    if (selectingSlot === 1) {
      setAthlete1(a);
      if (athlete2 && athlete2.sport !== a.sport) setAthlete2(null);
      setSelectingSlot(2);
    } else {
      if (a._id === athlete1?._id) return;
      setAthlete2(a);
      setSelectingSlot(0);
    }
  };

  return (
    <div className="compare-page">
      <div className="compare-page-header">
        <h1 className="ov-title">Compare Players</h1>
        <p className="ov-subtitle">Select two athletes from the same sport for a detailed side-by-side comparison</p>
      </div>

      {/* Sport filter */}
      <div className="compare-sport-tabs">
        {Object.entries(SPORTS).map(([key, s]) => (
          <button key={key}
            className={`compare-sport-btn ${sportFilter === key ? 'active' : ''}`}
            style={sportFilter === key ? { borderColor: s.color, color: s.color, background: s.color + '18' } : {}}
            onClick={() => { setSportFilter(key); setAthlete1(null); setAthlete2(null); setSelectingSlot(1); }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Selection slots */}
      <div className="compare-slots">
        <div className={`compare-slot ${selectingSlot === 1 ? 'selecting' : ''} ${athlete1 ? 'filled' : ''}`}
          onClick={() => setSelectingSlot(1)}>
          {athlete1 ? (
            <>
              <img src={athlete1.avatar} alt={athlete1.name} className="compare-slot-avatar" />
              <div className="compare-slot-info">
                <span className="compare-slot-name">{athlete1.name}</span>
                <span className="compare-slot-sub">{athlete1.position} · {athlete1.team}</span>
              </div>
              <span className="compare-slot-score" style={{ color: '#6c63ff' }}>{avgFit(athlete1.fitness)}</span>
              <span className="compare-slot-legend" style={{ background: '#6c63ff' }}>A</span>
            </>
          ) : (
            <div className="compare-slot-empty">
              <span className="compare-slot-legend" style={{ background: '#6c63ff' }}>A</span>
              <span>Click to select Player A</span>
            </div>
          )}
          {selectingSlot === 1 && <div className="compare-slot-indicator">Selecting…</div>}
        </div>

        <div className="compare-vs">VS</div>

        <div className={`compare-slot ${selectingSlot === 2 ? 'selecting' : ''} ${athlete2 ? 'filled' : ''}`}
          onClick={() => { if (athlete1) setSelectingSlot(2); }}>
          {athlete2 ? (
            <>
              <img src={athlete2.avatar} alt={athlete2.name} className="compare-slot-avatar" />
              <div className="compare-slot-info">
                <span className="compare-slot-name">{athlete2.name}</span>
                <span className="compare-slot-sub">{athlete2.position} · {athlete2.team}</span>
              </div>
              <span className="compare-slot-score" style={{ color: '#f59e0b' }}>{avgFit(athlete2.fitness)}</span>
              <span className="compare-slot-legend" style={{ background: '#f59e0b' }}>B</span>
            </>
          ) : (
            <div className="compare-slot-empty">
              <span className="compare-slot-legend" style={{ background: '#f59e0b' }}>B</span>
              <span>{athlete1 ? 'Click to select Player B' : 'Select Player A first'}</span>
            </div>
          )}
          {selectingSlot === 2 && <div className="compare-slot-indicator">Selecting…</div>}
        </div>
      </div>

      {/* Inline comparison if both selected */}
      {athlete1 && athlete2 ? (
        <div className="compare-inline">
          {/* Radar */}
          <div className="compare-inline-section glass-panel">
            <p className="panel-title">Fitness Radar</p>
            <div className="compare-radar-wrap">
              <DualRadarChart fitness1={athlete1.fitness} fitness2={athlete2.fitness} color1="#6c63ff" color2="#f59e0b" />
              <div className="compare-radar-legend">
                <span className="compare-legend-dot" style={{ background: '#6c63ff' }}></span>
                <span className="compare-legend-name">{athlete1.name}</span>
                <span className="compare-legend-dot" style={{ background: '#f59e0b' }}></span>
                <span className="compare-legend-name">{athlete2.name}</span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="compare-inline-section glass-panel">
            <p className="panel-title">
              Fitness Metrics
              <span className="compare-key-note"> ★ = Key metric for {SPORTS[sportFilter]?.label}</span>
            </p>
            <div className="compare-bars">
              {['endurance','strength','speed','flexibility','agility','power','stamina','balance','reaction','coordination'].map((key) => {
                const v1 = athlete1.fitness[key] || 0;
                const v2 = athlete2.fitness[key] || 0;
                const isKey = SPORT_METRICS[sportFilter]?.keyMetrics.includes(key);
                const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;
                return (
                  <div className={`compare-bar-row ${isKey ? 'compare-bar-key' : ''}`} key={key}>
                    <div className="compare-bar-val-left" style={{ color: winner === 1 ? '#6c63ff' : 'rgba(255,255,255,0.45)' }}>
                      {v1}{winner === 1 && <span className="compare-winner">▲</span>}
                    </div>
                    <div className="compare-bar-center">
                      <div className="compare-bar-label">{FIT_LABELS[key]}{isKey && <span className="key-metric-star">★</span>}</div>
                      <div className="compare-dual-bar">
                        <div className="compare-bar-half compare-bar-left">
                          <div className="compare-bar-fill-left" style={{ width: `${v1}%`, background: '#6c63ff' }} />
                        </div>
                        <div className="compare-bar-half compare-bar-right">
                          <div className="compare-bar-fill-right" style={{ width: `${v2}%`, background: '#f59e0b' }} />
                        </div>
                      </div>
                    </div>
                    <div className="compare-bar-val-right" style={{ color: winner === 2 ? '#f59e0b' : 'rgba(255,255,255,0.45)' }}>
                      {winner === 2 && <span className="compare-winner">▲</span>}{v2}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Athlete picker list */}
      <div className="compare-picker glass-panel">
        <p className="panel-title">
          {selectingSlot === 0 ? 'Select a slot above to change players' :
           selectingSlot === 1 ? 'Select Player A' : 'Select Player B'}
        </p>
        <div className="compare-picker-grid">
          {sportAthletes.map(a => {
            const score = avgFit(a.fitness);
            const inj   = INJ_META[a.injury?.status] || INJ_META.healthy;
            const isA1  = athlete1?._id === a._id;
            const isA2  = athlete2?._id === a._id;
            return (
              <div key={a._id}
                className={`compare-pick-card ${isA1 ? 'pick-selected-a' : ''} ${isA2 ? 'pick-selected-b' : ''}`}
                onClick={() => handleSelectAthlete(a)}>
                <div className="card-avatar-wrap">
                  <img src={a.avatar} alt={a.name} className="card-avatar" loading="lazy" />
                  <span className={`inj-dot inj-${inj.cls}`} />
                </div>
                <div className="card-info">
                  <span className="card-name">{a.name}</span>
                  <span className="card-sub">{a.position} · {a.team}</span>
                </div>
                <span className="card-score" style={{ color: score >= 90 ? '#4ecdc4' : score >= 80 ? '#a78bfa' : '#ffd93d' }}>{score}</span>
                {isA1 && <span className="pick-badge" style={{ background: '#6c63ff' }}>A</span>}
                {isA2 && <span className="pick-badge" style={{ background: '#f59e0b' }}>B</span>}
              </div>
            );
          })}
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
  const [showMaintain, setShowMaintain]       = useState(false);
  const [showInjury, setShowInjury]           = useState(false);
  const [localTrainings, setLocalTrainings]   = useState({});

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
    setShowInjury(false);
    setView('detail');
  };

  const handleSportFilter = (s) => { setSportFilter(s); setTeamFilter('all'); };

  const handleSaveTraining = (entry) => {
    setLocalTrainings(prev => ({
      ...prev,
      [selectedAthlete._id]: [entry, ...(prev[selectedAthlete._id] || [])],
    }));
  };

  const score      = avgFit(selectedAthlete.fitness);
  const scoreColor = score >= 90 ? '#4ecdc4' : score >= 80 ? '#a78bfa' : '#ffd93d';
  const sportMeta  = SPORTS[selectedAthlete.sport];
  const injMeta    = INJ_META[selectedAthlete.injury?.status] || INJ_META.healthy;

  const sportMetricsConfig = SPORT_METRICS[selectedAthlete.sport];
  const positionTags = sportMetricsConfig?.positionTags[selectedAthlete.position] || [];

  const allTraining = [
    ...(localTrainings[selectedAthlete._id] || []),
    ...(selectedAthlete.training || []),
  ];

  // Fitness metric groups for display
  const fitGroups = [
    { group: 'Physical Capacity', keys: ['endurance', 'stamina', 'strength', 'power'] },
    { group: 'Athletic Performance', keys: ['speed', 'agility', 'balance', 'flexibility'] },
    { group: 'Neuromuscular', keys: ['reaction', 'coordination'] },
  ];

  return (
    <div className="app">
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
          <button className={`nav-btn ${view === 'compare' ? 'active' : ''}`} onClick={() => setView('compare')}>
            <span className="nav-icon">⚖️</span> Compare Players
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
        ) : view === 'compare' ? (
          <ComparePage initialAthlete={selectedAthlete} />
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
                {/* Position-specific tags */}
                {positionTags.length > 0 && (
                  <div className="position-tags">
                    {positionTags.map((tag, i) => (
                      <span key={i} className="position-tag" style={{ borderColor: sportMeta?.color + '60', color: sportMeta?.color }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="hero-right">
                <div className="hero-score">
                  <span className="hero-score-val" style={{ color: scoreColor }}>{score}</span>
                  <span className="hero-score-label">Overall Score</span>
                </div>
                <div className="hero-action-btns">
                  <button className="ai-btn" onClick={() => setShowAI(true)}>
                    <span>🤖</span> AI Analysis
                  </button>
                  <button className="inj-pred-btn" onClick={() => setShowInjury(true)}>
                    <span>🩺</span> Injury Risk
                  </button>
                </div>
              </div>
            </div>

            {/* Sport-specific key metrics highlight */}
            {sportMetricsConfig && (
              <div className="sport-profile-bar glass-panel">
                <p className="sport-profile-title">
                  {sportMeta?.icon} {sportMeta?.label} Key Metrics
                  <span className="sport-profile-note">Highlighted metrics are most critical for this sport</span>
                </p>
                <div className="sport-key-metrics">
                  {sportMetricsConfig.keyMetrics.map(key => (
                    <div className="sport-key-metric" key={key} style={{ borderColor: sportMeta?.color + '40', background: sportMeta?.color + '0d' }}>
                      <span className="sport-key-label" style={{ color: sportMeta?.color }}>{FIT_LABELS[key]}</span>
                      <span className="sport-key-value" style={{ color: scoreColor }}>{selectedAthlete.fitness[key] || 0}</span>
                      <div className="sport-key-bar-track">
                        <div className="sport-key-bar-fill" style={{ width: `${selectedAthlete.fitness[key] || 0}%`, background: sportMeta?.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                <div className="radar-legend">
                  {Object.keys(computeRadarFitness(selectedAthlete.fitness)).map(k => (
                    <span key={k} className="radar-legend-item">
                      <span className="radar-legend-dot" style={{ background: '#6c63ff' }} />{k}
                    </span>
                  ))}
                </div>
                <RadarChart fitness={selectedAthlete.fitness} color={sportMeta?.color || '#6c63ff'} />
                <p className="radar-note">Each axis is an aggregate of 2 related metrics</p>
              </div>
              <div className="glass-panel bars-panel">
                <h3 className="panel-title">Fitness Metrics</h3>
                <div className="bars-groups">
                  {fitGroups.map(g => (
                    <div key={g.group} className="bars-group">
                      <p className="bars-group-label">{g.group}</p>
                      <div className="bars-list">
                        {g.keys.map((key, i) => (
                          <StatBar key={`${animKey}-${key}`}
                            label={FIT_LABELS[key]}
                            value={selectedAthlete.fitness[key] || 0}
                            color={FIT_COLORS[key]}
                            delay={i * 80}
                            isKey={sportMetricsConfig?.keyMetrics.includes(key)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Training */}
            <div className="glass-panel training-panel">
              <div className="training-panel-header">
                <h3 className="panel-title" style={{ marginBottom: 0 }}>Training Log</h3>
                <div className="training-header-right">
                  <span className="training-count-badge">{allTraining.length} sessions</span>
                  <button className="maintain-btn" onClick={() => setShowMaintain(true)}>
                    <span>✏️</span> Maintain
                  </button>
                </div>
              </div>
              <div className="timeline">
                {allTraining.map((t, i) => {
                  const im = INTENSITY_META[t.intensity] || INTENSITY_META.medium;
                  const isNew = i < (localTrainings[selectedAthlete._id]?.length || 0);
                  return (
                    <div className="timeline-item" key={i} style={{ animationDelay:`${0.1 + i * 0.07}s` }}>
                      <div className="timeline-dot" style={{ background: TYPE_COLORS[t.type] || '#6c63ff', boxShadow: `0 0 10px ${TYPE_COLORS[t.type] || '#6c63ff'}88` }} />
                      <div className={`timeline-body ${isNew ? 'timeline-body-new' : ''}`}>
                        <div className="timeline-head">
                          <div className="timeline-head-left">
                            <span className="timeline-type" style={{ color: TYPE_COLORS[t.type] || '#6c63ff' }}>
                              {TYPE_ICONS[t.type] || '📋'} {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                            </span>
                            {isNew && <span className="timeline-new-badge">New</span>}
                          </div>
                          <div className="timeline-head-right">
                            <span className="timeline-intensity" style={{ color: im.color, background: im.bg }}>
                              {im.label}
                            </span>
                            <span className="timeline-badge">⏱ {t.duration} min</span>
                          </div>
                        </div>
                        <p className="timeline-notes">{t.notes}</p>
                        <div className="timeline-footer">
                          <span className="timeline-date">📅 {t.date}</span>
                          <div className="timeline-intensity-bar">
                            <div className="timeline-intensity-fill"
                              style={{ width: t.intensity === 'high' ? '100%' : t.intensity === 'medium' ? '60%' : '30%',
                                background: im.color }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {allTraining.length === 0 && (
                  <p className="no-results">No training sessions recorded yet. Click Maintain to add one.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {showAI && <AIPanel athlete={selectedAthlete} onClose={() => setShowAI(false)} />}
      {showInjury && <InjuryPredictionPanel athlete={selectedAthlete} onClose={() => setShowInjury(false)} />}
      {showMaintain && (
        <TrainingMaintainModal
          athleteName={selectedAthlete.name}
          onClose={() => setShowMaintain(false)}
          onSave={handleSaveTraining}
        />
      )}
    </div>
  );
}
