import { NextRequest, NextResponse } from "next/server";
import { editTickets } from "agent";
import { EditRequestSchema } from "../../../lib/schemas";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = EditRequestSchema.parse(body);

    // Edit tickets based on instruction
    const projectState = await editTickets(
      validated.projectId,
      validated.instruction
    );

    return NextResponse.json(projectState);
  } catch (error) {
    console.error("Edit error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to edit tickets",
      },
      { status: 500 }
    );
  }
}

