import React from 'react';
import { Recipe, Item } from '../types/types';
import { ItemIcon } from './ItemIcon';
import '../styles/components/_tooltip.scss';

interface TooltipProps {
  recipe: Recipe;
  items: Map<string, Item>;
  show: boolean;
  style: React.CSSProperties;
  className?: string;
}

export function Tooltip({ recipe, items, show, style, className = '' }: TooltipProps) {
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
    <div className={`c-tooltip ${className}`} style={style}>
      <div className="c-tooltip__header">
        <h3 className="c-tooltip__title">{recipe.name}</h3>
        <span className="c-tooltip__time">{recipe.time}s</span>
      </div>
      <div className="c-tooltip__content">
        <div className="c-tooltip__section">
          <h4 className="c-tooltip__section-title">Inputs</h4>
          {inputRates.map(({ id, rate, item }) => (
            <div key={id} className="c-tooltip__item">
              <ItemIcon iconId={id} size={16} />
              <span className="c-tooltip__item-name">{item?.name || id}</span>
              <span className="c-tooltip__item-rate">{rate.toFixed(1)}/min</span>
            </div>
          ))}
        </div>
        <div className="c-tooltip__section">
          <h4 className="c-tooltip__section-title">Outputs</h4>
          {outputRates.map(({ id, rate, item }) => (
            <div key={id} className="c-tooltip__item">
              <ItemIcon iconId={id} size={16} />
              <span className="c-tooltip__item-name">{item?.name || id}</span>
              <span className="c-tooltip__item-rate">{rate.toFixed(1)}/min</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
