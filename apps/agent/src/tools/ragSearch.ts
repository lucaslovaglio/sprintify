import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { ProjectState } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, "../../../../data/projects");

/**
 * Simple RAG search for similar past projects
 * This is a basic implementation - can be enhanced with proper embeddings
 */
export async function ragSearch(requirements: string): Promise<string[]> {
  try {
    // Get all project files
    const files = readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
    
    if (files.length === 0) {
      return [];
    }

    const suggestions: string[] = [];
    const reqLower = requirements.toLowerCase();

    // Simple keyword matching (can be replaced with vector similarity)
    for (const file of files.slice(0, 5)) { // Check max 5 past projects
      const content = readFileSync(join(DATA_DIR, file), "utf-8");
      const project: ProjectState = JSON.parse(content);

      // Check for keyword overlap
      const projectText = `${project.requirements.summary} ${project.requirements.features.join(" ")}`.toLowerCase();
      
      // Simple similarity check
      const commonWords = reqLower.split(/\s+/).filter(word => 
        word.length > 4 && projectText.includes(word)
      );

      if (commonWords.length > 2) {
        suggestions.push(
          `Similar project "${project.requirements.projectName}" had ${project.tickets.length} tickets covering: ${project.requirements.features.slice(0, 3).join(", ")}`
        );
      }
    }

    return suggestions.slice(0, 2); // Return top 2 suggestions
  } catch (error) {
    // If RAG fails, just return empty (it's optional)
    return [];
  }
}

