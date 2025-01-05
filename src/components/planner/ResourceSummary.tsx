import React from 'react';
import { Item, ResourceSummary as ResourceSummaryType } from '../../types/types';
import { ItemIcon } from '../ui/ItemIcon';

interface ResourceSummaryProps {
  resourceSummary: ResourceSummaryType;
  items: Item[];
  summaryMode: 'normal' | 'compact';
  onToggleMode: () => void;
}

export function ResourceSummary({
  resourceSummary,
  items,
  summaryMode,
  onToggleMode
}: ResourceSummaryProps) {
  if (!resourceSummary) return null;

  return (
    <div className={`resource-summary ${summaryMode}`}>
      <div className="summary-header">
        <h2>Summary</h2>
        <button
          className="view-mode-button"
          onClick={onToggleMode}
        >
          {summaryMode === 'normal' ? 'Compact' : 'Normal'}
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Resource</th>
            <th>Rate (/min)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(resourceSummary)
            .sort(([, a], [, b]) => b - a)
            .map(([itemId, rate]) => {
              const item = items.find(i => i.id === itemId);
              if (!item) return null;
              return (
                <tr key={itemId}>
                  <td>
                    <ItemIcon iconId={item.id} />
                    {item.name}
                  </td>
                  <td>{rate.toFixed(2)}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
} 