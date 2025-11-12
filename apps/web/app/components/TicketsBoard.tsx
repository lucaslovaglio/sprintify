"use client";

import type { Ticket } from "../../lib/schemas";
import { TicketCard } from "./TicketCard";

interface TicketsBoardProps {
  tickets: Ticket[];
  projectName?: string;
}

const priorityOrder: Record<string, number> = { P1: 1, P2: 2, P3: 3 };

export function TicketsBoard({ tickets, projectName }: TicketsBoardProps) {
  // Sort tickets by priority (P1 first, then P2, then P3)
  const sortedTickets = [...tickets].sort((a, b) => {
    return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
  });

  const p1Count = tickets.filter((t) => t.priority === "P1").length;
  const p2Count = tickets.filter((t) => t.priority === "P2").length;
  const p3Count = tickets.filter((t) => t.priority === "P3").length;
  const totalPoints = tickets.reduce((sum, t) => sum + t.effortPoints, 0);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {projectName || "Development Tickets"}
        </h2>
        <div className="flex gap-6 mt-3 text-sm">
          <span className="text-gray-600">
            <strong className="text-gray-900">{tickets.length}</strong> tickets
          </span>
          <span className="text-gray-600">
            <strong className="text-gray-900">{totalPoints}</strong> story points
          </span>
          <div className="flex gap-4 ml-auto">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              <span className="text-gray-600">P1: <strong className="text-red-700">{p1Count}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600">P2: <strong className="text-yellow-700">{p2Count}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">P3: <strong className="text-green-700">{p3Count}</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Tickets (sorted by priority) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}

