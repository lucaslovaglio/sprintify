import type { Cost } from "../types.js";

/**
 * Token cost tracking for LLM calls
 */

// OpenAI pricing (as of 2024, adjust as needed)
const PRICING = {
  "gpt-4": { input: 0.03 / 1000, output: 0.06 / 1000 },
  "gpt-4-turbo": { input: 0.01 / 1000, output: 0.03 / 1000 },
  "gpt-3.5-turbo": { input: 0.0005 / 1000, output: 0.0015 / 1000 },
  "default": { input: 0.01 / 1000, output: 0.03 / 1000 },
};

export class CostTracker {
  private cost: Cost = {
    tokensIn: 0,
    tokensOut: 0,
    usd: 0,
  };

  private model: string = "default";

  constructor(model: string = "default") {
    this.model = model;
  }

  /**
   * Track a single LLM call
   */
  track(tokensIn: number, tokensOut: number): void {
    this.cost.tokensIn += tokensIn;
    this.cost.tokensOut += tokensOut;

    const pricing = PRICING[this.model as keyof typeof PRICING] || PRICING.default;
    const costDelta = tokensIn * pricing.input + tokensOut * pricing.output;
    this.cost.usd += costDelta;
  }

  /**
   * Get current cost
   */
  getCost(): Cost {
    return { ...this.cost };
  }

  /**
   * Reset cost tracking
   */
  reset(): void {
    this.cost = {
      tokensIn: 0,
      tokensOut: 0,
      usd: 0,
    };
  }

  /**
   * Estimate tokens for text (rough approximation: 1 token ≈ 4 characters)
   */
  static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

// Global cost tracker instance
let globalTracker: CostTracker | null = null;

export function initCostTracker(model: string = "default"): CostTracker {
  globalTracker = new CostTracker(model);
  return globalTracker;
}

export function getGlobalCostTracker(): CostTracker {
  if (!globalTracker) {
    globalTracker = new CostTracker();
  }
  return globalTracker;
}

