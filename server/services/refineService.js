const fallbackQuestions = {
  chatbot: [
    { id: 'tone', text: 'What tone should the chatbot use?', options: ['Friendly & casual', 'Professional & formal', 'Witty & humorous', 'Empathetic & supportive'] },
    { id: 'length', text: 'How detailed should responses be?', options: ['Short & concise', 'Balanced', 'Thorough & detailed'] },
  ],
  coding: [
    { id: 'language', text: 'Which programming language?', options: ['JavaScript', 'Python', 'TypeScript', 'Java', 'Go', 'Rust'] },
    { id: 'style', text: 'What coding style?', options: ['Functional', 'Object-oriented', 'Procedural', 'Clean & minimal'] },
  ],
  writing: [
    { id: 'tone', text: 'What tone should the writing have?', options: ['Professional & formal', 'Conversational', 'Persuasive', 'Academic', 'Creative'] },
    { id: 'audience', text: 'Who is the target audience?', options: ['General readers', 'Industry experts', 'Students', 'Executives'] },
  ],
  research: [
    { id: 'depth', text: 'How deep should the analysis be?', options: ['Quick overview', 'Moderate depth', 'Comprehensive analysis'] },
    { id: 'format', text: 'How should results be structured?', options: ['Bullet-point summary', 'Full report with sections', 'Compare & contrast'] },
  ],
  image: [
    { id: 'style', text: 'What art style?', options: ['Photorealistic', 'Digital art', 'Oil painting', 'Anime / manga', 'Minimalist', '3D render'] },
    { id: 'mood', text: 'What mood should the image convey?', options: ['Bright & energetic', 'Dark & moody', 'Serene & calm', 'Dramatic', 'Surreal'] },
  ],
  video: [
    { id: 'format', text: 'What type of video?', options: ['Tutorial / how-to', 'Explainer', 'Story / narrative', 'Presentation', 'Short form'] },
    { id: 'style', text: 'What visual style?', options: ['Live action', 'Animated', 'Screen recording', 'Whiteboard', 'Talking head'] },
  ],
};

const systemPrompt = `You are a prompt refinement assistant. Analyze the user's prompt and its use case, then generate 3-5 clarifying questions that help improve it based on what they actually wrote.

Rules:
- Questions must be SPECIFIC to the user's content, not generic.
- If they mention a technology (React, Python, AWS), ask about it specifically.
- Each question must have 4-6 predefined answer options relevant to their content.
- Options should be practical, specific choices — not vague.
- Keep questions concise and actionable.

Return ONLY a valid JSON array (no markdown, no wrapping):
[
  { "id": "short_slug", "text": "Question text here?", "options": ["Option A", "Option B", "Option C", "Option D"] }
]`;

async function callAiForQuestions(content, useCase, provider = 'groq') {
  const envKeys = {
    groq: process.env.GROQ_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    opencode: process.env.OPENCODE_API_KEY,
  };
  const apiKey = envKeys[provider];
  if (!apiKey) return null;

  const endpoints = {
    groq: { url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile' },
    openai: { url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o' },
    anthropic: { url: 'https://api.anthropic.com/v1/messages', model: 'claude-3-5-sonnet-20241022' },
    opencode: { url: 'https://opencode.ai/zen/v1/chat/completions', model: 'opencode/deepseek-v4-flash-free' },
  };

  const ep = endpoints[provider] || endpoints.groq;
  const userPrompt = `Use case: ${useCase}\n\nUser prompt:\n${content}`;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const body = provider === 'anthropic'
      ? { model: ep.model, max_tokens: 2000, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] }
      : { model: ep.model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], temperature: 0.7, max_tokens: 2000 };

    const res = await fetch(ep.url, { method: 'POST', headers, body: JSON.stringify(body) });

    if (!res.ok) return null;

    const json = await res.json();
    const text = provider === 'anthropic'
      ? json.content?.[0]?.text
      : json.choices?.[0]?.message?.content;
    if (!text) return null;

    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.slice(0, 5).map((q, i) => ({
      id: q.id || `q${i}`,
      text: q.text,
      options: Array.isArray(q.options) ? q.options : [],
    }));
  } catch {
    return null;
  }
}

export async function generateQuestions(useCase, content, provider) {
  const ai = await callAiForQuestions(content, useCase, provider);
  if (ai) return ai;

  const specific = fallbackQuestions[useCase] || [];
  return specific;
}
