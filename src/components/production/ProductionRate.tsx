import React from 'react';

interface ProductionRateProps {
  totalRate: number;
  manualRate: number;
  onManualRateChange: (rate: number) => void;
  onOptimalRateClick: () => void;
  onClearRate: () => void;
  detailLevel: 'compact' | 'normal' | 'detailed';
}

export function ProductionRate({
  totalRate,
  manualRate,
  onManualRateChange,
  onOptimalRateClick,
  onClearRate,
  detailLevel
}: ProductionRateProps) {
  return (
    <div className="production-rate" onClick={e => e.stopPropagation()}>
      <div className="rate-value">
        {totalRate.toFixed(2)}/min
      </div>
      {detailLevel !== 'compact' && (
        <div className="machine-controls manual-rate-controls">
          <button
            className="machine-adjust"
            onClick={onClearRate}
            title="Clear manual rate"
          >
            ×
          </button>
          <input
            type="number"
            className="manual-rate-input"
            value={manualRate || 0}
            onChange={(e) => onManualRateChange(parseFloat(e.target.value) || 0)}
            onWheel={(e) => e.currentTarget.blur()}
            onClick={(e) => e.currentTarget.select()}
            placeholder="Add rate..."
            min="0"
            step="0.1"
          />
          <button
            className="machine-adjust"
            onClick={onOptimalRateClick}
            title="Set manual rate to achieve 100% efficiency"
          >
            ↑
          </button>
        </div>
      )}
    </div>
  );
} 