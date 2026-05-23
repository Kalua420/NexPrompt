export const anthropicProvider = {
  name: 'anthropic',
  async streamComplete(prompt, onToken, onDone, onError, signal) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return onError(new Error('Anthropic API key not configured on server'));
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-3-5-sonnet-20241022', max_tokens: 4096, messages: [{ role: 'user', content: prompt }], stream: true }),
        signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        if (signal?.aborted) return;
        return onError(new Error(`Anthropic returned ${res.status}: ${text}`));
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
            if (json.type === 'content_block_delta' && json.delta?.text) onToken(json.delta.text);
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
