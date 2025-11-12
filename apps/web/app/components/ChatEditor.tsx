"use client";

import { useState } from "react";

interface ChatEditorProps {
  onEdit: (instruction: string) => void;
  isLoading: boolean;
}

export function ChatEditor({ onEdit, isLoading }: ChatEditorProps) {
  const [instruction, setInstruction] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instruction.trim()) {
      onEdit(instruction.trim());
      setInstruction("");
    }
  };

  const suggestions = [
    "Split ticket 3 into frontend and backend tasks",
    "Add more acceptance criteria to ticket 5",
    "Increase detail on ticket 2",
    "Merge tickets 4 and 6",
    "Change priority of ticket 7 to P1",
  ];

  return (
    <div className="w-full mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Edit Tickets via Chat</h3>
      
      {/* Suggestions */}
      <div className="mb-4">
        <p className="text-xs text-gray-600 mb-2">Try these commands:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInstruction(suggestion)}
              disabled={isLoading}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g., Split ticket 3 into two smaller tickets..."
          disabled={isLoading}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!instruction.trim() || isLoading}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            instruction.trim() && !isLoading
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Editing..." : "Send"}
        </button>
      </form>
    </div>
  );
}

