"use client";

import { useState } from "react";

interface ClarifyPanelProps {
  questions: string[];
  onSubmit: (answers: Record<string, string>) => void;
  isLoading: boolean;
}

export function ClarifyPanel({ questions, onSubmit, isLoading }: ClarifyPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(questions.map(q => [q, ""]))
  );

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const canSubmit = Object.values(answers).every(a => a.trim().length > 0) && !isLoading;

  if (questions.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-yellow-50 border border-yellow-200 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-yellow-900">
        📋 Clarification Needed
      </h3>
      <p className="text-sm text-yellow-800 mb-4">
        Please answer these questions to generate more accurate tickets:
      </p>
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={index}>
            <label className="block text-sm font-medium mb-2 text-yellow-900">
              {index + 1}. {question}
            </label>
            <input
              type="text"
              className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Your answer..."
              value={answers[question]}
              onChange={(e) =>
                setAnswers({ ...answers, [question]: e.target.value })
              }
              disabled={isLoading}
            />
          </div>
        ))}
        
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            canSubmit
              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Processing..." : "Submit Answers"}
        </button>
      </div>
    </div>
  );
}

