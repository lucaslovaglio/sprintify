import { NextRequest, NextResponse } from "next/server";
import { runWithClarifications } from "agent";
import { ClarifyRequestSchema } from "../../../lib/schemas";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ClarifyRequestSchema.parse(body);

    // Re-run agent with clarifications
    const projectState = await runWithClarifications(
      validated.projectId,
      validated.answers as Record<string, string>
    );

    return NextResponse.json(projectState);
  } catch (error) {
    console.error("Clarify error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process clarifications",
      },
      { status: 500 }
    );
  }
}

