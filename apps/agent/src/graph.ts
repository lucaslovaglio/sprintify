import { StateGraph, END } from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";
import type { GraphState, ParseDocumentInput } from "./types.js";
import type { StreamCallback } from "./index.js";
import { parseDocument } from "./tools/parseDocument.js";
import { runSecurityChecks } from "./tools/security.js";
import { extractRequirements } from "./tools/extractRequirements.js";
import { generateTickets } from "./tools/generateTickets.js";
import { validateTickets } from "./tools/validateTickets.js";
import { persistProject } from "./tools/persistProject.js";
import { ragSearch } from "./tools/ragSearch.js";
import { initCostTracker } from "./tools/costTracker.js";

// Global stream callback
let globalStreamCallback: StreamCallback | undefined;

/**
 * Parse document node
 */
async function parseNode(state: GraphState): Promise<Partial<GraphState>> {
  try {
    console.log("📄 Parsing document...");
    const rawText = state.rawText;
    return { rawText };
  } catch (error) {
    return { error: `Parse error: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

/**
 * Security check node
 */
async function securityNode(state: GraphState): Promise<Partial<GraphState>> {
  try {
    console.log("🔒 Running security checks...");
    globalStreamCallback?.({ type: 'status', message: '🔒 Running security checks...' });
    
    const result = runSecurityChecks(state.rawText);
    
    if (!result.passed) {
      return { error: `Security check failed: ${result.reason}` };
    }

    return { rawText: result.sanitized || state.rawText };
  } catch (error) {
    return { error: `Security check error: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

/**
 * Extract requirements node
 */
async function extractNode(state: GraphState): Promise<Partial<GraphState>> {
  try {
    console.log("📋 Extracting requirements...");
    globalStreamCallback?.({ type: 'status', message: '📋 Extracting requirements...' });
    
    const requirements = await extractRequirements(state.rawText);
    console.log(`   Extracted requirements: ${requirements.projectName}`);
    globalStreamCallback?.({ 
      type: 'progress', 
      message: `✅ Requirements extracted: ${requirements.projectName}`,
      data: { requirements }
    });
    
    return { requirements };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error("   Extract node error:", error);
    globalStreamCallback?.({ type: 'error', message: errorMsg });
    return { error: errorMsg };
  }
}

/**
 * RAG search node (optional)
 */
async function ragNode(state: GraphState): Promise<Partial<GraphState>> {
  // Skip if there's already an error
  if (state.error) {
    return {};
  }

  try {
    console.log("🔍 Searching for similar projects...");
    globalStreamCallback?.({ type: 'status', message: '🔍 Searching for similar projects...' });
    
    if (!state.requirements) {
      return {};
    }

    const suggestions = await ragSearch(state.requirements.summary);
    if (suggestions.length > 0) {
      console.log(`💡 Found ${suggestions.length} similar project(s)`);
      globalStreamCallback?.({ 
        type: 'progress', 
        message: `💡 Found ${suggestions.length} similar project(s)`,
        data: { suggestions }
      });
    }
    return {};
  } catch (error) {
    // RAG is optional, don't fail on error
    console.warn("RAG search failed:", error);
    return {};
  }
}

/**
 * Generate tickets node
 */
async function generateNode(state: GraphState): Promise<Partial<GraphState>> {
  // Skip if there's already an error
  if (state.error) {
    return {};
  }

  try {
    console.log("🎫 Generating tickets...");
    globalStreamCallback?.({ type: 'status', message: '🎫 Generating tickets...' });
    
    console.log(`   State has requirements: ${!!state.requirements}`);
    if (!state.requirements) {
      console.error("   ERROR: Requirements missing in generate node!");
      return { error: "Requirements not available for ticket generation" };
    }

    const result = await generateTickets(
      state.requirements, 
      undefined,
      // Progress callback for batch processing
      (batchInfo) => {
        console.log(`   📦 Batch ${batchInfo.batch}/${batchInfo.total}: Generated ${batchInfo.tickets.length} tickets`);
        globalStreamCallback?.({ 
          type: 'progress', 
          message: `📦 Batch ${batchInfo.batch}/${batchInfo.total}: Generated ${batchInfo.tickets.length} tickets for this section`,
          data: { 
            batch: batchInfo.batch,
            totalBatches: batchInfo.total,
            batchTickets: batchInfo.tickets.length
          }
        });

        // Stream each ticket from this batch
        batchInfo.tickets.forEach((ticket, idx) => {
          globalStreamCallback?.({ 
            type: 'progress', 
            message: `  🎫 ${ticket.title}`,
            data: { ticket }
          });
        });
      }
    );
    console.log(`   Generated ${result.tickets.length} total tickets`);

    
    globalStreamCallback?.({ 
      type: 'progress', 
      message: `✅ All ${result.tickets.length} ticket(s) generated`,
      data: { ticketCount: result.tickets.length }
    });
    
    return {
      tickets: result.tickets,
    };
  } catch (error) {
    console.error("   Generate node error:", error);
    globalStreamCallback?.({ type: 'error', message: `❌ Failed to generate tickets: ${error instanceof Error ? error.message : 'Unknown error'}` });
    return { error: `Generate error: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

/**
 * Validate tickets node
 */
async function validateNode(state: GraphState): Promise<Partial<GraphState>> {
  // Skip if there's already an error
  if (state.error) {
    return {};
  }

  try {
    console.log("✅ Validating tickets...");
    globalStreamCallback?.({ type: 'status', message: '✅ Validating tickets...' });
    
    console.log(`   DEBUG: requirements present: ${!!state.requirements}, tickets count: ${state.tickets?.length || 0}`);
    
    if (!state.requirements || !state.tickets || state.tickets.length === 0) {
      console.warn(`   Validation check failed: requirements=${!!state.requirements}, tickets=${state.tickets?.length || 0}`);
      return { error: "Requirements or tickets not available for validation" };
    }

    const result = await validateTickets(state.tickets, state.requirements);
    
    if (!result.valid && result.issues.length > 0) {
      console.warn(`⚠️ Found ${result.issues.length} validation issue(s)`);
      result.issues.forEach(issue => {
        console.warn(`  - ${issue.type}: ${issue.description}`);
      });
      globalStreamCallback?.({ 
        type: 'progress', 
        message: `⚠️ Found ${result.issues.length} validation issue(s)`,
        data: { issues: result.issues }
      });
    } else {
      console.log("✅ All tickets validated successfully");
      globalStreamCallback?.({ type: 'progress', message: '✅ All tickets validated successfully' });
    }

    return {};
  } catch (error) {
    // Validation is best-effort, don't fail the whole process
    console.warn("Validation failed:", error);
    return {};
  }
}

/**
 * Persist project node
 */
async function persistNode(state: GraphState): Promise<Partial<GraphState>> {
  // Skip if there's already an error
  if (state.error) {
    return {};
  }

  try {
    console.log("💾 Persisting project...");
    globalStreamCallback?.({ type: 'status', message: '💾 Persisting project...' });
    
    const projectId = state.projectId || uuidv4();
    const now = new Date().toISOString();

    const projectState = {
      id: projectId,
      rawText: state.rawText,
      requirements: state.requirements!,
      tickets: state.tickets,
      cost: state.cost,
      createdAt: state.projectId ? state.createdAt || now : now,
      updatedAt: now,
    };

    await persistProject(projectState);
    
    console.log(`✅ Project saved: ${projectId}`);
    globalStreamCallback?.({ 
      type: 'progress', 
      message: `✅ Project saved: ${projectId}`,
      data: { projectId }
    });
    
    return { projectId };
  } catch (error) {
    globalStreamCallback?.({ type: 'error', message: `❌ Failed to persist project: ${error instanceof Error ? error.message : 'Unknown error'}` });
    return { error: `Persist error: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

/**
 * Build the agent graph
 */
export function buildGraph(streamCallback?: StreamCallback) {
  // Set the global stream callback
  globalStreamCallback = streamCallback;
  const workflow = new StateGraph<GraphState>({
    channels: {
      projectId: {
        value: (x: string | undefined, y?: string | undefined) => {
          if (y !== undefined) return y;
          if (x !== undefined) return x;
          return undefined;
        },
        default: () => undefined,
      },
      rawText: {
        value: (x: string, y?: string) => y !== undefined ? y : x,
        default: () => "",
      },
      requirements: {
        value: (x: any, y?: any) => {
          if (y !== undefined) {
            console.log("   REDUCER: Updating requirements");
            return y;
          }
          return x;
        },
        default: () => undefined,
      },
      tickets: {
        value: (x: any[], y?: any[]) => {
          if (y !== undefined) {
            console.log(`   REDUCER: Updating tickets (${y.length} tickets)`);
            return y;
          }
          return x;
        },
        default: () => [],
      },
      cost: {
        value: (x: any, y?: any) => y !== undefined ? y : x,
        default: () => ({ tokensIn: 0, tokensOut: 0, usd: 0 }),
      },
      error: {
        value: (x: string | undefined, y?: string | undefined) => y !== undefined ? y : x,
        default: () => undefined,
      },
      createdAt: {
        value: (x: string | undefined, y?: string | undefined) => y !== undefined ? y : x,
        default: () => undefined,
      },
    },
  });

  // Add nodes
  workflow.addNode("parse", parseNode);
  workflow.addNode("security", securityNode);
  workflow.addNode("extract", extractNode);
  workflow.addNode("rag", ragNode);
  workflow.addNode("generate", generateNode);
  workflow.addNode("validate", validateNode);
  workflow.addNode("persist", persistNode);

  // Define edges
  // @ts-ignore - StateGraph type inference issue with channels
  workflow.setEntryPoint("parse");
  // @ts-ignore
  workflow.addEdge("parse", "security");
  // @ts-ignore
  workflow.addEdge("security", "extract");
  // @ts-ignore
  workflow.addEdge("extract", "rag");
  // @ts-ignore
  workflow.addEdge("rag", "generate");
  // @ts-ignore
  workflow.addEdge("generate", "validate");
  // @ts-ignore
  workflow.addEdge("validate", "persist");
  // @ts-ignore
  workflow.addEdge("persist", END);

  return workflow.compile();
}

