import type { Requirements } from "../types.js";

/**
 * Determine if clarifying questions are needed based on missing data
 */
export async function clarifyMissing(requirements: Requirements): Promise<string[]> {
  const questions: string[] = [];

  // Check for missing critical information
  const hasBudget = requirements.constraints.some(c => 
    c.toLowerCase().includes("budget") || c.toLowerCase().includes("cost") || c.toLowerCase().includes("$")
  );

  const hasTimeline = requirements.constraints.some(c =>
    c.toLowerCase().includes("deadline") || 
    c.toLowerCase().includes("timeline") || 
    c.toLowerCase().includes("week") ||
    c.toLowerCase().includes("month")
  );

  const hasTeamInfo = requirements.constraints.some(c =>
    c.toLowerCase().includes("team") || 
    c.toLowerCase().includes("developer") ||
    c.toLowerCase().includes("resource")
  ) || requirements.stakeholders.some(s =>
    s.toLowerCase().includes("team") || s.toLowerCase().includes("developer")
  );

  const hasTrafficOrScale = requirements.constraints.some(c =>
    c.toLowerCase().includes("user") || 
    c.toLowerCase().includes("traffic") ||
    c.toLowerCase().includes("scale") ||
    c.toLowerCase().includes("concurrent")
  ) || (requirements.scope && (
    requirements.scope.toLowerCase().includes("user") ||
    requirements.scope.toLowerCase().includes("scale")
  ));

  // Generate up to 3 targeted questions (in Spanish)
  if (!hasBudget && questions.length < 3) {
    questions.push("¿Cuál es el presupuesto del proyecto o restricción de costos? (ej: $X/mes para hosting, $Y presupuesto total)");
  }

  if (!hasTimeline && questions.length < 3) {
    questions.push("¿Cuál es el plazo o fecha límite objetivo para este proyecto? (ej: lanzamiento en 6 semanas, MVP en 3 meses)");
  }

  if (!hasTrafficOrScale && questions.length < 3) {
    questions.push("¿Cuál es la escala de usuarios o tráfico esperado? (ej: 100 usuarios, 10K usuarios activos diarios, 1M visitas/mes)");
  }

  if (!hasTeamInfo && questions.length < 3) {
    questions.push("¿Cuál es la composición y nivel de experiencia del equipo? (ej: 2 desarrolladores full-stack, 1 diseñador, equipo junior)");
  }

  // Return max 3 questions
  return questions.slice(0, 3);
}

