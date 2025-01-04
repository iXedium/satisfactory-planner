import React from 'react';
import '../styles/components/_machine-adjustment-controls.scss';

interface MachineAdjustmentControlsProps {
  actualMachineCount: number;
  efficiency: string;
  onMachineCountChange: (count: number) => void;
  disabled?: boolean;
  actualCapacity: number;
  totalRate: number;
}

export function MachineAdjustmentControls({
  actualMachineCount,
  efficiency,
  onMachineCountChange,
  disabled = false,
  actualCapacity,
  totalRate
}: MachineAdjustmentControlsProps) {
  const getEfficiencyClass = (efficiency: number): string => {
    if (efficiency === 100) return 'machine-controls__efficiency--optimal';
    if (efficiency < 100) return 'machine-controls__efficiency--under';
    return 'machine-controls__efficiency--over';
  };

  return (
    <div className="machine-controls">
      <button 
        className="machine-controls__adjust" 
        onClick={() => onMachineCountChange(actualMachineCount - 1)}
        disabled={actualMachineCount <= 1 || disabled}
      >
        -
      </button>
      <input
        type="number"
        value={actualMachineCount}
        onChange={(e) => {
          const count = Math.max(1, parseInt(e.target.value) || 1);
          onMachineCountChange(count);
        }}
        onClick={(e) => e.currentTarget.select()}
        min="1"
        className="machine-controls__input"
        disabled={disabled}
      />
      <button 
        className="machine-controls__adjust" 
        onClick={() => onMachineCountChange(actualMachineCount + 1)}
        disabled={disabled}
      >
        +
      </button>
      <div 
        className={`machine-controls__efficiency ${getEfficiencyClass(parseFloat(efficiency))}`}
        onClick={(e) => {
          e.stopPropagation();
          const actualEfficiency = (totalRate / actualCapacity).toFixed(6);
          navigator.clipboard.writeText(actualEfficiency);
        }}
        title="Click to copy actual value"
      >
        ({efficiency}%)
      </div>
    </div>
  );
} 