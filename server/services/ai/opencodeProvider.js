let cachedModel = null;

async function findModel(apiKey) {
  if (cachedModel) return cachedModel;
  try {
    const res = await fetch('https://opencode.ai/zen/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const data = await res.json();
      const models = data.data || data;
      if (Array.isArray(models) && models.length > 0) {
        cachedModel = models[0].id || models[0];
      }
    }
  } catch { /* fall back to default */ }
  return cachedModel || 'opencode/deepseek-v4-flash-free';
}

export const opencodeProvider = {
  name: 'opencode',
  async streamComplete(prompt, onToken, onDone, onError, signal) {
    const apiKey = process.env.OPENCODE_API_KEY;
    if (!apiKey) return onError(new Error('OpenCode API key not configured on server'));
    try {
      const model = await findModel(apiKey);
      const res = await fetch('https://opencode.ai/zen/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], stream: true }),
        signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        if (signal?.aborted) return;
        return onError(new Error(`OpenCode returned ${res.status}: ${text}`));
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (signal?.aborted) { reader.cancel(); return; }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          const cleaned = line.replace(/^data: /, '').trim();
          if (!cleaned || cleaned === '[DONE]') continue;
          try {
            const json = JSON.parse(cleaned);
            const token = json.choices?.[0]?.delta?.content || '';
            if (token) onToken(token);
          } catch { /* skip */ }
        }
      }
      onDone();
    } catch (err) {
      if (err.name === 'AbortError') return;
      onError(err);
    }
  },
};
