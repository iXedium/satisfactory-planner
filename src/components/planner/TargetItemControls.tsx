import React from 'react';
import { Item, TargetItem } from '../../types/types';

interface TargetItemControlsProps {
  targetItems: TargetItem[];
  items: Item[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof TargetItem, value: string | number) => void;
  onCalculate: () => void;
}

export function TargetItemControls({
  targetItems,
  items,
  onAdd,
  onRemove,
  onUpdate,
  onCalculate
}: TargetItemControlsProps) {
  const getProductionItems = (items: Item[]) => {
    return items.filter(item => 
      ['parts', 'components'].includes(item.category)
    ).sort((a, b) => a.name.localeCompare(b.name));
  };

  return (
    <div className="targets-container">
      {targetItems.map((target, index) => (
        <div key={index} className="target-item">
          <select
            value={target.id}
            onChange={e => onUpdate(index, 'id', e.target.value)}
          >
            <option value="">Select item...</option>
            {getProductionItems(items).map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={target.rate}
            onChange={e => onUpdate(index, 'rate', Number(e.target.value))}
            min="0.01"
            step="0.01"
          />

          <button 
            className="remove-button"
            onClick={() => onRemove(index)}
            disabled={targetItems.length === 1}
            title="Remove item"
          >
            ×
          </button>
        </div>
      ))}

      <div className="target-controls">
        <button className="add-button" onClick={onAdd}>
          Add Item
        </button>
        <button className="calculate-button" onClick={onCalculate}>
          Calculate
        </button>
      </div>
    </div>
  );
} 