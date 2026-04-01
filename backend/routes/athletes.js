const express = require('express');
const OpenAI  = require('openai');

const router = express.Router();

router.post('/analyze', async (req, res) => {

  const { athlete } = req.body;
  if (!athlete) return res.status(400).json({ message: 'Missing athlete data' });

  const sportNames = { soccer: 'Soccer', basketball: 'Basketball', football: 'American Football' };
  const injNames   = { healthy: 'Healthy', minor: 'Minor Injury', recovering: 'Recovering', injured: 'Injured' };

  const prompt = `You are a professional university sports medicine and sports science analyst. Based on the following athlete profile, provide a professional and detailed comprehensive analysis in English.

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

## Fitness Metrics (out of 100)
- Endurance: ${athlete.fitness?.endurance}
- Strength: ${athlete.fitness?.strength}
- Speed: ${athlete.fitness?.speed}
- Flexibility: ${athlete.fitness?.flexibility}
- Overall Average: ${Math.round(Object.values(athlete.fitness || {}).reduce((a,b)=>a+b,0)/4)}

## Injury Status
- Current Status: ${injNames[athlete.injury?.status] || 'Healthy'}
${athlete.injury?.detail ? `- Details: ${athlete.injury.detail}` : ''}

## Recent Training Log
${(athlete.training || []).map(t => `- ${t.date}: ${t.type}, ${t.duration} min — ${t.notes}`).join('\n')}

---

Please analyze the following four dimensions in detail, providing specific and targeted professional advice for each:

## Development Potential
Analyze the athlete's room for growth based on age, current fitness level, and positional demands. Assess their potential to become an elite athlete, highlighting strengths and areas for improvement.

## Injury Risk Analysis
Based on BMI, fitness weaknesses, sport-specific demands, and current injury status, identify the main injury risks this athlete faces, with particular focus on vulnerable areas.

## Recovery & Health Recommendations
If injured, provide detailed rehabilitation advice and a recovery timeline. If healthy, provide preventive protection recommendations including training load management and recovery strategies.

## Training Optimization
Based on fitness deficiencies and the specific demands of their position, provide a concrete training improvement plan including focus areas and recommended methods.`;

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

    const client = new OpenAI({
      apiKey,
      baseURL,
    });

    const stream = await client.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 1500,
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
