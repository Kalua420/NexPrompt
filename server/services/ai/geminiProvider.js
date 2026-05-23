export const geminiProvider = {
  name: 'gemini',
  async streamComplete(prompt, onToken, onDone, onError, signal) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return onError(new Error('Gemini API key not configured on server'));
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        if (signal?.aborted) return;
        return onError(new Error(`Gemini returned ${res.status}: ${text}`));
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
          if (!cleaned) continue;
          try {
            const json = JSON.parse(cleaned);
            const token = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
