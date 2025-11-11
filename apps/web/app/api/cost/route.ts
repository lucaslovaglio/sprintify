import { NextRequest, NextResponse } from "next/server";
import { loadProject } from "agent";
import { CostRequestSchema } from "../../../lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CostRequestSchema.parse(body);

    // Load project
    const projectState = await loadProject(validated.projectId);
    if (!projectState) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tokensIn: projectState.cost.tokensIn,
      tokensOut: projectState.cost.tokensOut,
      usd: projectState.cost.usd,
    });
  } catch (error) {
    console.error("Cost error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get cost",
      },
      { status: 500 }
    );
  }
}

