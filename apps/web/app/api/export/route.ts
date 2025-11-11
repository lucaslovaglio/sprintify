import { NextRequest, NextResponse } from "next/server";
import { loadProject } from "agent";
import { ExportRequestSchema } from "../../../lib/schemas";
import { exportJSON, exportCSV, exportMarkdown } from "../../../lib/exports";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ExportRequestSchema.parse(body);

    // Load project
    const projectState = await loadProject(validated.projectId);
    if (!projectState) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Export based on format
    let content: string;
    let contentType: string;
    let filename: string;

    switch (validated.format) {
      case "json":
        content = exportJSON(projectState);
        contentType = "application/json";
        filename = `${projectState.requirements.projectName || "project"}.json`;
        break;
      case "csv":
        content = exportCSV(projectState);
        contentType = "text/csv";
        filename = `${projectState.requirements.projectName || "project"}.csv`;
        break;
      case "md":
        content = exportMarkdown(projectState);
        contentType = "text/markdown";
        filename = `${projectState.requirements.projectName || "project"}.md`;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid format" },
          { status: 400 }
        );
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to export",
      },
      { status: 500 }
    );
  }
}

