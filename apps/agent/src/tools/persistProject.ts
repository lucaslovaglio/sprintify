import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { ProjectState } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Data directory is at the root of the monorepo
const DATA_DIR = join(__dirname, "../../../../data/projects");

/**
 * Ensure data directory exists
 */
function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Save project state to file
 */
export async function persistProject(state: ProjectState): Promise<void> {
  ensureDataDir();
  
  const filePath = join(DATA_DIR, `${state.id}.json`);
  writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
}

/**
 * Load project state from file
 */
export async function loadProject(projectId: string): Promise<ProjectState | null> {
  ensureDataDir();
  
  const filePath = join(DATA_DIR, `${projectId}.json`);
  
  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as ProjectState;
}

/**
 * Check if project exists
 */
export function projectExists(projectId: string): boolean {
  ensureDataDir();
  const filePath = join(DATA_DIR, `${projectId}.json`);
  return existsSync(filePath);
}

