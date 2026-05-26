'use strict';

window.ClaudeAI = (() => {
  const API_URL = 'https://api.anthropic.com/v1/messages';
  const MODEL = 'claude-sonnet-4-5';
  const MAX_TOKENS = 4096;
  const ANTHROPIC_VERSION = '2023-06-01';

  let _apiKey = null;

  const SOUKAINA_CONTEXT = `You are Sovereign AI, a personal intelligent assistant for Soukaina — a 31-year-old IELTS teacher living in Vietnam (Ho Chi Minh City area). She is also an ambitious learner on a 2.5-3 year journey to become a job-ready full-stack web developer, starting May 27, 2026.

About Soukaina:
- IELTS teacher for B1+ learners (current profession)
- Total beginner in coding (knows basic HTML/CSS only, no JavaScript yet)
- Lives in Vietnam: tropical climate, hot and humid, high UV exposure
- Health goals: better skincare (addressing humidity+sun damage), hair loss and dryness treatment, healthier nutrition, weight management
- Has Claude Pro and Cursor Pro subscriptions
- Schedule: Until June 7, 2026 → weekdays work 3-9PM, mornings free for study. From June 8, 2026 → Mondays OFF (deep study+self-care day, wakes 10AM), Tues-Sun work 7:30-11AM and 2:30-9PM

Your tone: warm, encouraging, sophisticated, personal. Address her by name occasionally. Celebrate her progress. Be practical and specific. For wellness, always consider Vietnamese climate and locally available ingredients. For coding, explain things clearly for a complete beginner using vivid analogies.`;

  function init(key) {
    if (!key || typeof key !== 'string') return;
    _apiKey = key.trim();
  }

  function isReady() {
    return !!_apiKey;
  }

  async function chat(messages, systemPrompt = '') {
    if (!_apiKey) {
      throw new Error('API key not set. Please add your Claude API key in Settings.');
    }

    const system = systemPrompt
      ? `${SOUKAINA_CONTEXT}\n\n${systemPrompt}`
      : SOUKAINA_CONTEXT;

    const body = {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': _apiKey,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `HTTP ${response.status}`;
      if (response.status === 401) throw new Error('Invalid API key. Please check your key in Settings.');
      if (response.status === 429) throw new Error('Rate limit reached. Please wait a moment and try again.');
      if (response.status === 500) throw new Error('Claude is temporarily unavailable. Please try again shortly.');
      throw new Error(`API Error: ${msg}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  async function stream(messages, systemPrompt = '', onChunk = () => {}, onDone = () => {}) {
    if (!_apiKey) {
      throw new Error('API key not set. Please add your Claude API key in Settings.');
    }

    const system = systemPrompt
      ? `${SOUKAINA_CONTEXT}\n\n${systemPrompt}`
      : SOUKAINA_CONTEXT;

    const body = {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': _apiKey,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `HTTP ${response.status}`;
      if (response.status === 401) throw new Error('Invalid API key. Please check your key in Settings.');
      if (response.status === 429) throw new Error('Rate limit reached. Please wait a moment and try again.');
      throw new Error(`API Error: ${msg}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const event = JSON.parse(data);
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            const chunk = event.delta.text || '';
            fullText += chunk;
            onChunk(chunk, fullText);
          }
        } catch {}
      }
    }

    onDone(fullText);
    return fullText;
  }

  // ─── Specialized Methods ──────────────────────────────────────────────────

  async function generateDailyPlan(date, scheduleInfo) {
    const today = new Date(date);
    const dateStr = SovereignUtils.formatDate(today);
    const schedule = scheduleInfo || SovereignUtils.getScheduleForDate(today);
    const user = SovereignStorage.get('user') || {};
    const wellness = SovereignStorage.get('wellness') || {};

    const systemPrompt = `You are generating a detailed daily schedule for Soukaina's life management app.
Output ONLY a valid JSON array of schedule blocks — no markdown, no explanation.

Block format:
{
  "id": "unique-string",
  "type": "study|work|wellness|meal|break|sleep|journal|water|skincare|haircare",
  "title": "Block title",
  "subtitle": "Brief description",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "color": "#hexcolor",
  "icon": "emoji",
  "completed": false,
  "reminderMinutes": 10,
  "notes": "optional tips or details"
}

Color guide: study=#6B5B95, work=#4A8B7B, wellness=#C9886C, meal=#7A9B6C, break=#9B7E8C, sleep=#3D1F2D, skincare=#E8A598, water=#4A90D9`;

    const prompt = `Generate a complete daily schedule for ${dateStr}.

Schedule type: ${schedule.type}
${schedule.isMondayOff ? 'TODAY IS MONDAY — Soukaina\'s deep study & self-care day. No work. Full morning sleep until 10AM.' : ''}
Work sessions: ${JSON.stringify(schedule.workSessions)}
Study blocks: ${JSON.stringify(schedule.studyBlocks)}
Wake time: ${schedule.wakeTime}

Requirements:
- Include wake-up + morning skincare (7-step AM routine after wake)
- Breakfast at appropriate time
- Water reminders every 90 minutes
- Study blocks for web development
${schedule.isWorkDay ? '- Work sessions as specified above' : '- Extra study blocks and self-care activities'}
- Lunch break
- PM skincare routine around 8 PM
- Dinner
- Evening wind-down
- Sleep by 11:30 PM
- Journal time around 9:30 PM
- Stretch/movement break after every 90 min study
- Include specific topics for study blocks (current week: HTML basics, CSS fundamentals)

Make it realistic, encouraging, and well-balanced for a busy 31-year-old woman in Vietnam's tropical climate.`;

    try {
      const result = await chat([{ role: 'user', content: prompt }], systemPrompt);
      // Extract JSON from response
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const blocks = JSON.parse(jsonMatch[0]);
        return blocks.map(b => ({
          ...b,
          id: b.id || SovereignUtils.generateId(),
          completed: false
        }));
      }
    } catch (e) {
      console.warn('[Claude] generateDailyPlan error:', e);
    }
    return null;
  }

  async function generateStudyLesson(weekNum, dayNum) {
    const curriculum = SovereignStorage.get('curriculum_progress') || {};
    const systemPrompt = `You are Soukaina's personal full-stack web development instructor in her Sovereign life app.
She is a complete beginner who knows basic HTML/CSS only and started her coding journey on May 27, 2026.
Generate engaging, clear lesson content perfect for a beginner. Use practical Vietnam-relevant examples where possible.
Output valid JSON only — no markdown wrappers.`;

    const prompt = `Generate a detailed daily lesson for Week ${weekNum}, Day ${dayNum} of the full-stack curriculum.

Curriculum structure:
- Weeks 1-12: HTML & CSS Mastery
- Weeks 13-28: JavaScript Fundamentals
- Weeks 29-44: Advanced JS & Tooling (Git, npm)
- Weeks 45-60: React.js
- Weeks 61-76: Node.js & Express
- Weeks 77-92: Databases (SQL, PostgreSQL, MongoDB)
- Weeks 93-108: Full-Stack Projects
- Weeks 109-130: Job Prep (TypeScript, Next.js, deployment)

Return JSON format:
{
  "topic": "Lesson topic title",
  "objectives": ["objective 1", "objective 2", "objective 3"],
  "theory": "Detailed explanation in simple, friendly language. Use HTML formatting (<p>, <strong>, <code>, <ul>). Use real-world analogies. Approximately 300-500 words.",
  "codeExample": "Complete working code example (just the code, no markdown)",
  "language": "html|css|javascript|etc",
  "exercises": [
    {
      "id": "ex-1",
      "title": "Exercise title",
      "instructions": "Clear step-by-step instructions",
      "starterCode": "starter code here",
      "hint": "A helpful hint",
      "solution": "complete solution code"
    }
  ],
  "funFact": "An interesting fun fact related to today's topic",
  "nextPreview": "Brief preview of tomorrow's lesson"
}`;

    try {
      const result = await chat([{ role: 'user', content: prompt }], systemPrompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('[Claude] generateStudyLesson error:', e);
    }
    return null;
  }

  async function gradeCode(code, exercise, weekContext = '') {
    const systemPrompt = `You are a supportive, expert coding instructor grading Soukaina's work.
She is a complete beginner. Be encouraging, specific, and constructive.
Grade fairly but generously for effort. Output valid JSON only.`;

    const prompt = `Grade this code submission for the following exercise.

Exercise: ${exercise.title}
Instructions: ${exercise.instructions}
Expected outcome: ${exercise.hint || 'Complete the exercise as described'}
Week context: ${weekContext}

Submitted code:
\`\`\`
${code}
\`\`\`

Return JSON:
{
  "score": 85,
  "grade": "B+",
  "passed": true,
  "summary": "One encouraging sentence about what she did well",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "detailedFeedback": "2-3 paragraph detailed feedback in friendly tone, using her name",
  "correctedCode": "If there are errors, provide corrected version",
  "xpEarned": 50,
  "encouragement": "Personal encouraging message to Soukaina"
}`;

    try {
      const result = await chat([{ role: 'user', content: prompt }], systemPrompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('[Claude] gradeCode error:', e);
    }
    return null;
  }

  async function gradeWeeklyTest(answers, test, weekNum) {
    const systemPrompt = `You are grading Soukaina's weekly coding test. Be thorough, encouraging, and specific.
This is Week ${weekNum} of her full-stack development journey. Output valid JSON only.`;

    const prompt = `Grade this weekly test for Week ${weekNum}.

Multiple Choice Answers: ${JSON.stringify(answers.multipleChoice)}
Practical Code Submission:
\`\`\`
${answers.practicalCode || '(No code submitted)'}
\`\`\`

Test: ${JSON.stringify(test)}

Return JSON:
{
  "totalScore": 78,
  "mcScore": 45,
  "practicalScore": 33,
  "maxScore": 100,
  "grade": "B",
  "passed": true,
  "mcCorrect": [true, false, true, ...],
  "mcFeedback": ["feedback for q1", "feedback for q2", ...],
  "practicalFeedback": "Detailed feedback on the practical code",
  "weekSummary": "Summary of the week's learning and assessment",
  "areasForReview": ["topic to review", "another topic"],
  "readyForNextWeek": true,
  "xpEarned": 150,
  "streakBonus": 20,
  "personalMessage": "Personal message to Soukaina about her progress"
}`;

    try {
      const result = await chat([{ role: 'user', content: prompt }], systemPrompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('[Claude] gradeWeeklyTest error:', e);
    }
    return null;
  }

  async function generateMealPlan(dateStr) {
    const systemPrompt = `You are generating a meal plan for Soukaina, a 31-year-old woman in Vietnam.
Focus on Vietnamese ingredients, tropical climate nutrition, and weight-loss-friendly, healthy meals.
Output valid JSON only — no markdown.`;

    const day = new Date(dateStr || Date.now()).toLocaleDateString('en-US', { weekday: 'long' });

    const prompt = `Generate a full day meal plan for ${day} for Soukaina in Vietnam.

Goals: healthy eating, weight management, balanced nutrition for an active woman
Climate: hot and humid tropical weather in Vietnam
Availability: Vietnamese supermarkets, local markets, street food

Return JSON:
{
  "breakfast": {
    "name": "Cháo gà (Chicken congee)",
    "englishName": "Chicken Congee",
    "description": "Light, nutritious Vietnamese rice porridge with ginger",
    "imageQuery": "vietnamese chicken congee rice porridge",
    "calories": 320,
    "protein": "18g",
    "ingredients": ["rice", "chicken breast", "ginger", "green onion", "fish sauce"],
    "time": "08:00",
    "prepTime": "5 minutes",
    "tip": "Add fresh herbs for extra nutrition",
    "whyGood": "Light on the stomach, anti-inflammatory ginger helps with tropical climate"
  },
  "lunch": { (same format) },
  "dinner": { (same format) },
  "snacks": [
    {
      "name": "Trái cây nhiệt đới",
      "englishName": "Tropical Fruit Mix",
      "description": "Fresh dragon fruit, papaya, and watermelon",
      "calories": 150,
      "time": "15:00",
      "imageQuery": "vietnamese tropical fruit dragon fruit papaya"
    }
  ],
  "hydrationTip": "In Vietnam's heat, aim for 2.5L water today. Add lime to help with absorption.",
  "totalCalories": 1650,
  "nutritionNote": "This plan is balanced for weight management in tropical climate"
}`;

    try {
      const result = await chat([{ role: 'user', content: prompt }], systemPrompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('[Claude] generateMealPlan error:', e);
    }
    return null;
  }

  async function generateWellnessTips() {
    const systemPrompt = `You are a wellness advisor for Soukaina in Vietnam. Be specific, practical, and encouraging.
Focus on Vietnamese climate, local ingredients, and her specific skin/hair concerns.`;

    const prompt = `Generate personalized wellness tips for Soukaina today.

Her concerns:
- Skincare: tropical humidity, high UV, needs hydration + SPF protection
- Hair: hair loss and dryness — needs rosemary oil, castor oil treatments, gentle care
- Nutrition: healthy weight management in tropical climate
- Exercise: limited time but needs movement breaks

Provide tips as JSON:
{
  "skincareTip": "Specific tip for today's skincare",
  "haircareTip": "Specific tip for hair loss/dryness treatment",
  "nutritionTip": "Specific Vietnamese food recommendation",
  "hydrationTip": "Hydration reminder for tropical weather",
  "movementTip": "Quick exercise or stretch to do today",
  "mindfulnessTip": "Mental wellness tip",
  "morningAffirmation": "Personal affirmation for Soukaina",
  "eveningReflection": "Evening reflection prompt"
}`;

    try {
      const result = await chat([{ role: 'user', content: prompt }], systemPrompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('[Claude] generateWellnessTips error:', e);
    }
    return null;
  }

  async function summarizeDocument(text, title = '') {
    const systemPrompt = `You are summarizing a document for Soukaina's personal knowledge vault. Be concise and insightful.`;

    const prompt = `Summarize this document${title ? ` titled "${title}"` : ''} in a structured way.

Document content:
${text.slice(0, 6000)}${text.length > 6000 ? '\n[...truncated...]' : ''}

Return JSON:
{
  "summary": "2-3 sentence overview",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "tags": ["tag1", "tag2", "tag3"],
  "category": "study|work|wellness|personal|reference",
  "readingTime": "2 min",
  "relevanceNote": "How this is relevant to Soukaina's goals"
}`;

    try {
      const result = await chat([{ role: 'user', content: prompt }], systemPrompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('[Claude] summarizeDocument error:', e);
    }
    return null;
  }

  async function suggestIELTSLesson(context) {
    const systemPrompt = `You are an IELTS teaching assistant helping Soukaina plan engaging lessons for her B1+ students in Vietnam.`;

    const prompt = `Suggest an IELTS lesson activity based on this context: ${context}

Return JSON:
{
  "lessonTitle": "Engaging lesson title",
  "targetSkill": "reading|writing|listening|speaking",
  "level": "B1+",
  "duration": "45 minutes",
  "objectives": ["objective 1", "objective 2"],
  "warmUp": "5-minute warm-up activity",
  "mainActivity": "Detailed main activity description",
  "practice": "Practice exercise for students",
  "homework": "Suggested homework assignment",
  "tips": ["teaching tip 1", "teaching tip 2"]
}`;

    try {
      const result = await chat([{ role: 'user', content: prompt }], systemPrompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('[Claude] suggestIELTSLesson error:', e);
    }
    return null;
  }

  return {
    init,
    isReady,
    chat,
    stream,
    generateDailyPlan,
    generateStudyLesson,
    gradeCode,
    gradeWeeklyTest,
    generateMealPlan,
    generateWellnessTips,
    summarizeDocument,
    suggestIELTSLesson
  };
})();
