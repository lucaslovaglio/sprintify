"use client";

import { useState } from "react";
import type { ProjectState } from "./lib/schemas";
import { Upload } from "./components/Upload";
import { ClarifyPanel } from "./components/ClarifyPanel";
import { TicketsBoard } from "./components/TicketsBoard";
import { ChatEditor } from "./components/ChatEditor";
import { CostMeter } from "./components/CostMeter";

type AppState = "upload" | "clarify" | "tickets";

export default function Home() {
  const [state, setState] = useState<AppState>("upload");
  const [projectState, setProjectState] = useState<ProjectState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleGenerate = async (data: {
    text?: string;
    fileData?: string;
    fileName?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setLogs([]);
    addLog("Starting ticket generation...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate tickets");
      }

      // Check if it's a streaming response
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("text/event-stream")) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No reader available");
        }

        let buffer = "";
        let hasError = false;
        let errorMessage = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6));
                
                // Handle different event types
                if (event.type === "status") {
                  addLog(event.message);
                } else if (event.type === "progress") {
                  addLog(event.message);
                } else if (event.type === "error") {
                  hasError = true;
                  errorMessage = event.message;
                  setError(event.message);
                  addLog(event.message);
                } else if (event.type === "complete") {
                  setProjectState(event.data);
                  addLog("🎉 Tickets generated successfully!");
                  
                  if (event.data.clarifications.length > 0) {
                    addLog(`Need ${event.data.clarifications.length} clarifications`);
                    setState("clarify");
                  } else {
                    setState("tickets");
                  }
                }
              } catch (e) {
                console.error("Failed to parse event:", e);
              }
            }
          }
        }

        // If there was an error during streaming, throw it to stop execution
        if (hasError) {
          throw new Error(errorMessage);
        }
      } else {
        // Fallback to non-streaming response
        const result = await response.json();
        setProjectState(result);
        addLog("✅ Requirements extracted successfully");
        addLog(`Found ${result.tickets.length} tickets`);

        if (result.clarifications.length > 0) {
          addLog(`Need ${result.clarifications.length} clarifications`);
          setState("clarify");
        } else {
          addLog("🎉 Tickets generated successfully!");
          setState("tickets");
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      addLog(`❌ Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClarify = async (answers: Record<string, string>) => {
    if (!projectState) return;

    setIsLoading(true);
    setError(null);
    addLog("Processing clarifications...");

    try {
      const response = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectState.id,
          answers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process clarifications");
      }

      const result = await response.json();
      setProjectState(result);
      addLog("✅ Clarifications processed");
      addLog(`Generated ${result.tickets.length} tickets`);
      setState("tickets");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      addLog(`❌ Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (instruction: string) => {
    if (!projectState) return;

    setIsLoading(true);
    setError(null);
    addLog(`Editing tickets: "${instruction}"`);

    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectState.id,
          instruction,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to edit tickets");
      }

      const result = await response.json();
      setProjectState(result);
      addLog("✅ Tickets updated successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      addLog(`❌ Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: "json" | "csv" | "md") => {
    if (!projectState) return;

    addLog(`Exporting as ${format.toUpperCase()}...`);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectState.id,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectState.requirements.projectName || "project"}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      addLog("✅ Export completed");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      addLog(`❌ Export error: ${errorMessage}`);
    }
  };

  const handleReset = () => {
    setState("upload");
    setProjectState(null);
    setError(null);
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🚀 Sprintify
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered development ticket generation
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">❌ Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Progress Logs (show during loading) */}
          {isLoading && logs.length > 0 && (
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm space-y-1 shadow-lg">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-700">
                <div className="animate-spin h-4 w-4 border-2 border-green-400 border-t-transparent rounded-full"></div>
                <span className="font-semibold">Processing...</span>
              </div>
              {logs.map((log, i) => (
                <div key={i} className="animate-fadeIn">{log}</div>
              ))}
            </div>
          )}

          {/* Upload State */}
          {state === "upload" && (
            <Upload onGenerate={handleGenerate} isLoading={isLoading} />
          )}

          {/* Clarify State */}
          {state === "clarify" && projectState && (
            <ClarifyPanel
              questions={projectState.clarifications}
              onSubmit={handleClarify}
              isLoading={isLoading}
            />
          )}

          {/* Tickets State */}
          {state === "tickets" && projectState && (
            <>
              {/* Action Bar */}
              <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport("json")}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport("md")}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Export Markdown
                  </button>
                </div>
                <div className="flex gap-2">
                  <CostMeter cost={projectState.cost} />
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    New Project
                  </button>
                </div>
              </div>

              {/* Tickets Board */}
              <TicketsBoard
                tickets={projectState.tickets}
                projectName={projectState.requirements.projectName}
              />

              {/* Chat Editor */}
              <ChatEditor onEdit={handleEdit} isLoading={isLoading} />

              {/* Justification */}
              {projectState.justification && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">📊 Justification</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">✅ Pros</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {projectState.justification.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-700 mb-2">⚠️ Cons</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {projectState.justification.cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">💡 Alternatives</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {projectState.justification.alternatives.map((alt, i) => (
                          <li key={i}>• {alt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Console Logs (show when not loading and have logs) */}
          {!isLoading && logs.length > 0 && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-48">
              <div className="font-semibold mb-2">📜 Log History</div>
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p>
          Built with Next.js, LangGraph, and OpenAI • Open source on GitHub
        </p>
      </footer>
    </div>
  );
}

