import { ChatOpenAI } from "@langchain/openai";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { TicketSchema, type Ticket, type Requirements, type Justification } from "../types.js";
import { getGlobalCostTracker } from "./costTracker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GenerateTicketsResponseSchema = z.object({
  tickets: z.array(TicketSchema),
  justification: z.object({
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    alternatives: z.array(z.string()),
  }),
});

/**
 * Generate development tickets from requirements
 */
export async function generateTickets(
  requirements: Requirements,
  answers?: Record<string, string>
): Promise<{ tickets: Ticket[]; justification: Justification }> {
  const systemPrompt = readFileSync(
    join(__dirname, "../prompts/generateTickets.system.txt"),
    "utf-8"
  );

  // Build user prompt with requirements and optional answers
  let userPrompt = `Generate development tickets for this project:\n\n`;
  userPrompt += `Project: ${requirements.projectName}\n`;
  userPrompt += `Summary: ${requirements.summary}\n\n`;
  userPrompt += `Goals:\n${requirements.goals.map(g => `- ${g}`).join("\n")}\n\n`;
  userPrompt += `Constraints:\n${requirements.constraints.map(c => `- ${c}`).join("\n")}\n\n`;
  userPrompt += `Features:\n${requirements.features.map(f => `- ${f}`).join("\n")}\n\n`;
  userPrompt += `Stakeholders:\n${requirements.stakeholders.map(s => `- ${s}`).join("\n")}\n\n`;

  if (requirements.techHints && requirements.techHints.length > 0) {
    userPrompt += `Tech Hints:\n${requirements.techHints.map(t => `- ${t}`).join("\n")}\n\n`;
  }

  if (requirements.scope) {
    userPrompt += `Scope: ${requirements.scope}\n\n`;
  }

  if (answers && Object.keys(answers).length > 0) {
    userPrompt += `Additional Clarifications:\n`;
    Object.entries(answers).forEach(([question, answer]) => {
      userPrompt += `Q: ${question}\nA: ${answer}\n\n`;
    });
  }

  const model = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
    temperature: 0.3,
  });

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  // Track costs
  const tracker = getGlobalCostTracker();
  if (response.usage_metadata) {
    tracker.track(
      response.usage_metadata.input_tokens || 0,
      response.usage_metadata.output_tokens || 0
    );
  }

  // Parse and validate response
  const content = response.content as string;
  
  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return GenerateTicketsResponseSchema.parse(parsed);
  } catch (error) {
    throw new Error(`Failed to parse tickets: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

