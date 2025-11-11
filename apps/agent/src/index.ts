import { v4 as uuidv4 } from "uuid";
import { buildGraph } from "./graph.js";
import { parseDocument } from "./tools/parseDocument.js";
import { loadProject, persistProject } from "./tools/persistProject.js";
import { initCostTracker, getGlobalCostTracker } from "./tools/costTracker.js";
import { ChatOpenAI } from "@langchain/openai";
import type { ProjectState, ParseDocumentInput, GraphState } from "./types.js";

export type StreamEvent = {
  type: 'status' | 'progress' | 'error' | 'complete';
  message: string;
  data?: any;
};

export type StreamCallback = (event: StreamEvent) => void;

/**
 * Run the agent workflow
 */
export async function runAgent(input: {
  file?: { buffer: Buffer; mime: string };
  text?: string;
  projectId?: string;
  onStream?: StreamCallback;
}): Promise<ProjectState> {
  // Initialize cost tracker
  initCostTracker(process.env.OPENAI_MODEL || "gpt-4-turbo-preview");

  // Stream parsing status
  input.onStream?.({ type: 'status', message: '📄 Parsing document...' });

  // Parse document first
  const parseInput: ParseDocumentInput = {
    fileBuffer: input.file?.buffer,
    mime: input.file?.mime,
    pastedText: input.text,
  };

  const rawText = await parseDocument(parseInput);

  // Build initial state
  const initialState: GraphState = {
    projectId: input.projectId,
    rawText,
    clarifications: [],
    answers: {},
    tickets: [],
    cost: { tokensIn: 0, tokensOut: 0, usd: 0 },
  };

  // Run the graph with streaming
  const graph = buildGraph(input.onStream);
  const result = await graph.invoke(initialState);

  if (result.error) {
    throw new Error(result.error);
  }

  // Get final cost
  const tracker = getGlobalCostTracker();
  const cost = tracker.getCost();

  // Build and return project state
  const projectState: ProjectState = {
    id: result.projectId || uuidv4(),
    rawText: result.rawText,
    requirements: result.requirements!,
    clarifications: result.clarifications,
    answers: result.answers,
    tickets: result.tickets,
    justification: result.justification!,
    cost,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Send completion event
  input.onStream?.({ 
    type: 'complete', 
    message: '✨ Tickets generated successfully!',
    data: projectState
  });

  return projectState;
}

/**
 * Re-run agent with clarification answers
 */
export async function runWithClarifications(
  projectId: string,
  answers: Record<string, string>
): Promise<ProjectState> {
  const existingState = await loadProject(projectId);
  if (!existingState) {
    throw new Error(`Project ${projectId} not found`);
  }

  // Merge answers
  const mergedAnswers: Record<string, string> = { ...existingState.answers, ...answers };

  // Re-run from generate step
  initCostTracker(process.env.OPENAI_MODEL || "gpt-4-turbo-preview");

  const { generateTickets } = await import("./tools/generateTickets.js");
  const { validateTickets } = await import("./tools/validateTickets.js");

  const result = await generateTickets(existingState.requirements, mergedAnswers);
  await validateTickets(result.tickets, existingState.requirements);

  const tracker = getGlobalCostTracker();
  const additionalCost = tracker.getCost();

  const updatedState: ProjectState = {
    ...existingState,
    answers: mergedAnswers,
    tickets: result.tickets,
    justification: result.justification,
    cost: {
      tokensIn: existingState.cost.tokensIn + additionalCost.tokensIn,
      tokensOut: existingState.cost.tokensOut + additionalCost.tokensOut,
      usd: existingState.cost.usd + additionalCost.usd,
    },
    updatedAt: new Date().toISOString(),
  };

  await persistProject(updatedState);
  return updatedState;
}

/**
 * Edit tickets based on natural language instruction
 */
export async function editTickets(
  projectId: string,
  instruction: string
): Promise<ProjectState> {
  const existingState = await loadProject(projectId);
  if (!existingState) {
    throw new Error(`Project ${projectId} not found`);
  }

  initCostTracker(process.env.OPENAI_MODEL || "gpt-4-turbo-preview");

  // Use LLM to interpret the edit instruction
  const model = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
    temperature: 0.2,
  });

  const systemPrompt = `You are a ticket editor. Given a list of tickets and a user instruction, apply the requested changes and return the updated tickets in JSON format.

Possible instructions include:
- "Split ticket X into Y and Z"
- "Merge tickets X and Y"
- "Add acceptance criteria to ticket X"
- "Increase detail on ticket X"
- "Change priority of ticket X to P1"
- "Add dependency from X to Y"

Return the complete updated tickets array in JSON format.`;

  const userPrompt = `Current tickets:\n${JSON.stringify(existingState.tickets, null, 2)}\n\nInstruction: ${instruction}`;

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  const tracker = getGlobalCostTracker();
  if (response.usage_metadata) {
    tracker.track(
      response.usage_metadata.input_tokens || 0,
      response.usage_metadata.output_tokens || 0
    );
  }

  // Parse response
  const content = response.content as string;
  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  const updatedTickets = JSON.parse(jsonStr);
  const additionalCost = tracker.getCost();

  const updatedState: ProjectState = {
    ...existingState,
    tickets: updatedTickets,
    cost: {
      tokensIn: existingState.cost.tokensIn + additionalCost.tokensIn,
      tokensOut: existingState.cost.tokensOut + additionalCost.tokensOut,
      usd: existingState.cost.usd + additionalCost.usd,
    },
    updatedAt: new Date().toISOString(),
  };

  await persistProject(updatedState);
  return updatedState;
}

// Export types and tools
export * from "./types.js";
export { loadProject } from "./tools/persistProject.js";

