import React from 'react';
import { Recipe } from '../../../types/types';
import { ItemIcon } from '../../ItemIcon';
import './MachineAdjustmentControls.css';

interface MachineAdjustmentControlsProps {
  machineCount: number;
  efficiency: string;
  onMachineCountChange: (count: number) => void;
  producer?: string;
  nominalRate?: number;
  detailLevel: 'compact' | 'normal' | 'detailed';
}

export function MachineAdjustmentControls({
  machineCount,
  efficiency,
  onMachineCountChange,
  producer,
  nominalRate,
  detailLevel
}: MachineAdjustmentControlsProps) {
  const getEfficiencyClass = (efficiency: number): string => {
    if (efficiency === 100) return 'efficiency-optimal';
    if (efficiency < 100) return 'efficiency-under';
    return 'efficiency-over';
  };

  const formatBuildingName = (name: string): string => {
    return name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (detailLevel === 'compact') return null;

  return (
    <div className="building-container" onClick={e => e.stopPropagation()}>
      {detailLevel === 'detailed' && producer && (
        <ItemIcon iconId={producer.toLowerCase()} size={32} />
      )}
      <div className="building-info">
        {producer && <span className="producer-name">{formatBuildingName(producer)}</span>}
        {nominalRate && <span className="nominal-rate">({nominalRate.toFixed(2)}/min)</span>}
        <div className="machine-controls">
          <button 
            className="machine-adjust" 
            onClick={() => onMachineCountChange(machineCount - 1)}
            disabled={machineCount <= 1}
          >
            -
          </button>
          <input
            type="number"
            value={machineCount}
            onChange={(e) => {
              const count = Math.max(1, parseInt(e.target.value) || 1);
              onMachineCountChange(count);
            }}
            onClick={(e) => e.currentTarget.select()}
            min="1"
            className="machine-count-input"
          />
          <button 
            className="machine-adjust" 
            onClick={() => onMachineCountChange(machineCount + 1)}
          >
            +
          </button>
          <div 
            className={`efficiency-value ${getEfficiencyClass(parseFloat(efficiency))}`}
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(efficiency);
            }}
            title="Click to copy value"
          >
            ({efficiency}%)
          </div>
        </div>
      </div>
    </div>
  );
} 