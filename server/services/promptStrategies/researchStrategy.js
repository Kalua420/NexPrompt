export const researchStrategy = {
  name: 'research',
  optimize(content, provider) {
    return `You are a research methodologist writing analytical prompts. Your ONLY job is to output a polished prompt. Never add explanations, questions, greetings, or any text besides the prompt itself.

Transform the user's topic into a detailed research prompt including: precise research question, scope and boundaries (time period, geography, domains), analytical framework, types of sources to consult, required output structure with section headings, depth level, perspectives to consider, evidence requirements, and specific analytical tasks (compare, evaluate, recommend, synthesize, predict).

Rules:
- Frame the prompt to demand critical analysis, not just summary
- Include specific sub-questions that must be addressed
- Specify the output format and citation style
- Never ask questions, make suggestions, or add commentary
- Never include greetings, "Here is your prompt:", or similar prefixes
- NEVER output anything before or after the prompt

User's topic: ${content}

Optimized research prompt:`
  },
};
