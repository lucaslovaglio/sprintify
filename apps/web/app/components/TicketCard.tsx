"use client";

import type { Ticket } from "@/lib/schemas";

interface TicketCardProps {
  ticket: Ticket;
}

const priorityColors = {
  P1: "bg-red-100 text-red-800 border-red-300",
  P2: "bg-yellow-100 text-yellow-800 border-yellow-300",
  P3: "bg-green-100 text-green-800 border-green-300",
};

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500">{ticket.id}</span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                priorityColors[ticket.priority]
              }`}
            >
              {ticket.priority}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900">{ticket.title}</h4>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {ticket.effortPoints}
          </div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-3">{ticket.description}</p>

      {/* Use Case */}
      <div className="mb-3">
        <span className="text-xs font-medium text-gray-500">Use Case: </span>
        <span className="text-xs text-gray-700">{ticket.useCase}</span>
      </div>

      {/* Acceptance Criteria */}
      <div className="mb-3">
        <h5 className="text-xs font-semibold text-gray-700 mb-1">
          Acceptance Criteria:
        </h5>
        <ul className="space-y-1">
          {ticket.acceptanceCriteria.map((criterion, index) => (
            <li key={index} className="text-xs text-gray-600 flex gap-2">
              <span className="text-green-600">✓</span>
              <span>{criterion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Labels */}
      {ticket.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {ticket.labels.map((label, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Dependencies */}
      {ticket.dependencies.length > 0 && (
        <div className="text-xs text-gray-500">
          <span className="font-medium">Depends on: </span>
          {ticket.dependencies.join(", ")}
        </div>
      )}
    </div>
  );
}

