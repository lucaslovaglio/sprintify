"use client";

import type { Cost } from "../../lib/schemas";

interface CostMeterProps {
  cost: Cost;
}

export function CostMeter({ cost }: CostMeterProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">💰 Cost Tracker</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tokens In:</span>
          <span className="font-medium">{cost.tokensIn.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tokens Out:</span>
          <span className="font-medium">{cost.tokensOut.toLocaleString()}</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-sm">
          <span className="text-gray-700 font-medium">Total Cost:</span>
          <span className="font-bold text-blue-600">
            ${cost.usd.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}

