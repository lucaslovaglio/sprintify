/**
 * Streaming utilities for real-time updates
 * This can be enhanced with Vercel AI SDK streaming in the future
 */

export interface StreamEvent {
  type: "log" | "progress" | "complete" | "error";
  message: string;
  data?: any;
}

/**
 * Create a server-sent events stream
 * Future enhancement: integrate with Vercel AI SDK's streaming
 */
export function createEventStream() {
  const encoder = new TextEncoder();

  return new TransformStream({
    transform(chunk: StreamEvent, controller) {
      const message = `data: ${JSON.stringify(chunk)}\n\n`;
      controller.enqueue(encoder.encode(message));
    },
  });
}

/**
 * Log helper for console-style output
 */
export function createLogger() {
  const logs: string[] = [];

  return {
    log: (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      const formattedLog = `[${timestamp}] ${message}`;
      logs.push(formattedLog);
      console.log(formattedLog);
    },
    getLogs: () => logs,
    clear: () => {
      logs.length = 0;
    },
  };
}

