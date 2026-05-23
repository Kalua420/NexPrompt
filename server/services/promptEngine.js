import { imageStrategy } from './promptStrategies/imageStrategy.js';
import { codingStrategy } from './promptStrategies/codingStrategy.js';
import { writingStrategy } from './promptStrategies/writingStrategy.js';
import { chatbotStrategy } from './promptStrategies/chatbotStrategy.js';
import { researchStrategy } from './promptStrategies/researchStrategy.js';

const strategies = {
  image: imageStrategy,
  coding: codingStrategy,
  writing: writingStrategy,
  chatbot: chatbotStrategy,
  research: researchStrategy,
};

export async function promptEngine(useCase, content, provider) {
  const strategy = strategies[useCase];
  if (!strategy) throw new Error(`Unsupported use case: ${useCase}`);
  return strategy.optimize(content, provider);
}
