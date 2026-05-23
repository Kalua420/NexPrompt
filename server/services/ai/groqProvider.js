export const groqProvider = {
  name: 'groq',
  async streamComplete(prompt, onToken, onDone, onError, signal) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return onError(new Error('Groq API key not configured on server'));
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], stream: true }),
        signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        if (signal?.aborted) return;
        return onError(new Error(`Groq returned ${res.status}: ${text}`));
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
          } catch { /* skip parse errors */ }
        }
      }
      onDone();
    } catch (err) {
      if (err.name === 'AbortError') return;
      onError(err);
    }
  },
};
