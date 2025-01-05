import React from 'react';

interface ProductionRateProps {
  totalRate: number;
  manualRate?: number;
  nodeId?: string;
  detailLevel?: 'compact' | 'normal' | 'detailed';
  onManualRateChange: (nodeId: string, rate: number) => void;
  actualCapacity?: number;
}

export function ProductionRate({
  totalRate,
  manualRate = 0,
  nodeId,
  detailLevel = 'normal',
  onManualRateChange,
  actualCapacity
}: ProductionRateProps) {
  const clearManualRate = () => {
    if (nodeId) {
      onManualRateChange(nodeId, 0);
    }
  };

  const calculateOptimalManualRate = () => {
    if (!nodeId || !actualCapacity) return;
    const optimalManualRate = actualCapacity - (totalRate - manualRate);
    onManualRateChange(nodeId, Math.max(0, optimalManualRate));
  };

  return (
    <div className="c-production-rate">
      <div className="c-production-rate__value">
        {totalRate.toFixed(2)}/min
      </div>
      {detailLevel !== 'compact' && (
        <div className="c-production-rate__controls">
          <button
            className="c-production-rate__button"
            onClick={clearManualRate}
            title="Clear manual rate"
          >
            ×
          </button>
          <input
            type="number"
            className="c-production-rate__input"
            value={manualRate}
            onChange={(e) => nodeId && onManualRateChange(nodeId, parseFloat(e.target.value) || 0)}
            onWheel={(e) => e.currentTarget.blur()}
            onClick={(e) => e.currentTarget.select()}
            placeholder="Add rate..."
            min="0"
            step="0.1"
          />
          <button
            className="c-production-rate__button"
            onClick={calculateOptimalManualRate}
            title="Set manual rate to achieve 100% efficiency"
          >
            ↑
          </button>
        </div>
      )}
    </div>
  );
} 