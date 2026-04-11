const express = require('express');
const OpenAI  = require('openai');

const router = express.Router();

router.post('/analyze', async (req, res) => {

  const { athlete, analysisType = 'overall' } = req.body;
  if (!athlete) return res.status(400).json({ message: 'Missing athlete data' });

  const sportNames = { soccer: 'Soccer', basketball: 'Basketball', football: 'American Football' };
  const injNames   = { healthy: 'Healthy', minor: 'Minor Injury', recovering: 'Recovering', injured: 'Injured' };

  const fitnessBlock = `
## Fitness Metrics (out of 100)
### Physical Capacity
- Endurance: ${athlete.fitness?.endurance}
- Stamina: ${athlete.fitness?.stamina}
- Strength: ${athlete.fitness?.strength}
- Power: ${athlete.fitness?.power}

### Athletic Performance
- Speed: ${athlete.fitness?.speed}
- Agility: ${athlete.fitness?.agility}
- Balance: ${athlete.fitness?.balance}
- Flexibility: ${athlete.fitness?.flexibility}

### Neuromuscular
- Reaction Time: ${athlete.fitness?.reaction}
- Coordination: ${athlete.fitness?.coordination}

Overall Average: ${Math.round(Object.values(athlete.fitness || {}).reduce((a,b)=>a+b,0)/Object.keys(athlete.fitness||{a:1}).length)}`.trim();

  const profileBlock = `
## Athlete Profile
- Name: ${athlete.name}
- Age: ${athlete.age}
- Sport: ${sportNames[athlete.sport] || athlete.sport}
- Team: ${athlete.team}
- Position: ${athlete.position}, Jersey #${athlete.number}

## Physical Data
- Height: ${athlete.physicalData?.height} cm
- Weight: ${athlete.physicalData?.weight} kg
- BMI: ${athlete.physicalData?.bmi}

${fitnessBlock}

## Injury Status
- Current Status: ${injNames[athlete.injury?.status] || 'Healthy'}
${athlete.injury?.detail ? `- Details: ${athlete.injury.detail}` : ''}

## Recent Training Log
${(athlete.training || []).slice(0, 5).map(t => `- ${t.date}: [${t.type}] ${t.duration} min (${t.intensity || 'medium'} intensity) — ${t.notes}`).join('\n')}`.trim();

  const prompts = {
    overall: `You are a professional sports medicine and sports science analyst. Based on the following athlete profile, provide a comprehensive professional analysis in English.

${profileBlock}

---

Please provide a detailed analysis covering all four dimensions below:

## Development Potential
Analyze the athlete's room for growth based on age, current fitness level, and positional demands. Identify strengths and areas for improvement. Assess realistic ceiling and timeline.

## Injury Risk Analysis
Based on BMI, fitness imbalances (check all 10 metrics), sport-specific demands, and current injury status, identify main injury risks and vulnerable areas.

## Recovery & Health Recommendations
Provide rehabilitation advice if injured, or preventive recommendations if healthy. Include training load management and recovery strategies.

## Training Optimization
Based on the 10-metric fitness profile and positional demands, provide a concrete training improvement plan with focus areas and recommended methods.`,

    potential: `You are an elite sports talent evaluation specialist. Analyze this athlete's development potential in depth.

${profileBlock}

---

Please provide a focused Potential Analysis covering:

## Talent Assessment
Evaluate raw athletic attributes across all 10 fitness dimensions. Identify standout strengths relative to age and position benchmarks.

## Development Ceiling
Based on age (${athlete.age}), current metrics, and sport-specific elite benchmarks, project the realistic performance ceiling this athlete can reach.

## Key Growth Areas
Identify the 3–5 metrics with the highest improvement potential and explain the reasoning.

## Development Timeline
Provide a phased development plan (short-term 6 months, mid-term 1–2 years, long-term 3+ years) with specific milestones.

## Competitive Potential
Assess the athlete's potential to compete at higher levels, with specific recommendations for career progression.`,

    injury: `You are a sports medicine physician specializing in injury prevention and risk assessment.

${profileBlock}

---

Please provide a comprehensive Injury Risk Analysis:

## Current Status Assessment
Evaluate the current injury status and any ongoing conditions in detail.

## Biomechanical Risk Factors
Analyze height, weight, BMI, and fitness imbalances (compare all 10 metrics) to identify structural and functional risk factors for injury.

## High-Risk Areas
Identify the body regions and types of injuries this athlete is most vulnerable to based on their sport, position, and fitness profile.

## Fitness Imbalance Risks
Highlight any significant disparities between paired metrics (e.g., strength vs. power, speed vs. agility, endurance vs. stamina) that could lead to injury.

## Prevention Protocols
Provide specific injury prevention strategies, screening recommendations, and training load guidelines to minimize risk.

## Return-to-Play Guidance
${athlete.injury?.status !== 'healthy' ? 'Provide a detailed rehabilitation plan and return-to-play criteria.' : 'Outline maintenance protocols to keep this healthy athlete injury-free.'}`,

    training: `You are a professional strength & conditioning coach and athletic performance specialist.

${profileBlock}

---

Please design a comprehensive Training Optimization Plan:

## Current Fitness Profile Analysis
Evaluate the 10-metric fitness profile against elite benchmarks for this position in ${sportNames[athlete.sport] || athlete.sport}. Identify the top priorities for improvement.

## Weekly Training Structure
Recommend a weekly training schedule (days, session types, volume, intensity) tailored to this athlete's needs and current fitness level.

## Priority Training Blocks
For each of the top 3–4 deficiency areas identified, provide:
- Specific drills and exercises
- Sets, reps, or duration recommendations
- Progression guidelines

## Recovery & Periodization
Recommend recovery methods, rest days, and how to periodize training across a season.

## Performance Monitoring
Suggest key performance indicators (KPIs) to track progress and criteria for reassessing the plan.`,

    performance: `You are a sports analytics expert specializing in athletic performance profiling.

${profileBlock}

---

Please provide a detailed Performance Analysis:

## Fitness Profile Benchmarking
Compare all 10 fitness metrics against elite-level benchmarks for this position (${athlete.position}) in ${sportNames[athlete.sport] || athlete.sport}. Rate each metric as Below Average / Average / Above Average / Elite.

## Strengths & Competitive Advantages
Identify the top 3–4 fitness attributes that give this athlete a competitive edge. Explain how these translate to on-field/court performance.

## Performance Gaps
Identify the 3–4 most critical metrics holding this athlete back. Quantify the gap from positional standards and estimate performance impact.

## Composite Scores
Analyze the 5 composite dimensions (Endurance, Power, Speed, Mobility, Mental) and provide an overall performance tier assessment.

## Competition Readiness
Based on current fitness status${athlete.injury?.status !== 'healthy' ? ' and injury condition' : ''}, assess readiness for competition and provide specific recommendations for peak performance.`,
  };

  const prompt = prompts[analysisType] || prompts.overall;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    const baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

    if (!apiKey) {
      throw new Error('Missing AI API key. Set DEEPSEEK_API_KEY (recommended) or OPENAI_API_KEY in backend/.env');
    }

    const client = new OpenAI({ apiKey, baseURL });

    const stream = await client.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 1800,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ text: `\n\n⚠️ Analysis failed: ${err.message}` })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

module.exports = router;
