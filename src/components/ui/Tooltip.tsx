import React from 'react';
import { Recipe, Item } from '../../types/types';
import { ItemIcon } from './ItemIcon';
import './Tooltip.css';

interface TooltipProps {
  recipe: Recipe;
  items: Map<string, Item>;
  show: boolean;
  style: React.CSSProperties;
}

export function Tooltip({ recipe, items, show, style }: TooltipProps) {
  if (!show) return null;

  // Calculate rates per minute
  const minuteMultiplier = 60 / recipe.time;
  const inputRates = Object.entries(recipe.in).map(([id, amount]) => ({
    id,
    rate: amount * minuteMultiplier,
    item: items.get(id)
  }));
  const outputRates = Object.entries(recipe.out).map(([id, amount]) => ({
    id,
    rate: amount * minuteMultiplier,
    item: items.get(id)
  }));

  return (
    <div className="recipe-tooltip" style={style}>
      <div className="tooltip-header">
        <h3>{recipe.name}</h3>
        <span className="tooltip-time">{recipe.time}s</span>
      </div>
      <div className="tooltip-content">
        <div className="tooltip-section">
          <h4>Inputs</h4>
          {inputRates.map(({ id, rate, item }) => (
            <div key={id} className="tooltip-item">
              <ItemIcon iconId={id} size={16} />
              <span className="tooltip-item-name">{item?.name || id}</span>
              <span className="tooltip-item-rate">{rate.toFixed(1)}/min</span>
            </div>
          ))}
        </div>
        <div className="tooltip-section">
          <h4>Outputs</h4>
          {outputRates.map(({ id, rate, item }) => (
            <div key={id} className="tooltip-item">
              <ItemIcon iconId={id} size={16} />
              <span className="tooltip-item-name">{item?.name || id}</span>
              <span className="tooltip-item-rate">{rate.toFixed(1)}/min</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 