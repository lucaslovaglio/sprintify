"use client";

import type { Ticket } from "@/lib/schemas";
import { TicketCard } from "./TicketCard";

interface TicketsBoardProps {
  tickets: Ticket[];
  projectName?: string;
}

export function TicketsBoard({ tickets, projectName }: TicketsBoardProps) {
  const p1Tickets = tickets.filter((t) => t.priority === "P1");
  const p2Tickets = tickets.filter((t) => t.priority === "P2");
  const p3Tickets = tickets.filter((t) => t.priority === "P3");

  const totalPoints = tickets.reduce((sum, t) => sum + t.effortPoints, 0);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {projectName || "Development Tickets"}
        </h2>
        <div className="flex gap-4 mt-2 text-sm text-gray-600">
          <span>
            <strong>{tickets.length}</strong> tickets
          </span>
          <span>
            <strong>{totalPoints}</strong> story points
          </span>
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* P1 Column */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Priority 1
              <span className="text-sm font-normal text-gray-500">
                ({p1Tickets.length})
              </span>
            </h3>
          </div>
          <div className="space-y-4">
            {p1Tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
            {p1Tickets.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-8">
                No P1 tickets
              </div>
            )}
          </div>
        </div>

        {/* P2 Column */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-yellow-700 flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              Priority 2
              <span className="text-sm font-normal text-gray-500">
                ({p2Tickets.length})
              </span>
            </h3>
          </div>
          <div className="space-y-4">
            {p2Tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
            {p2Tickets.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-8">
                No P2 tickets
              </div>
            )}
          </div>
        </div>

        {/* P3 Column */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Priority 3
              <span className="text-sm font-normal text-gray-500">
                ({p3Tickets.length})
              </span>
            </h3>
          </div>
          <div className="space-y-4">
            {p3Tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
            {p3Tickets.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-8">
                No P3 tickets
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

