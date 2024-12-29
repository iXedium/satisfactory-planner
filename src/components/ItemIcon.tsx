import React from 'react';

interface ItemIconProps {
  iconId: string;
  size?: number;
  className?: string;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ iconId, size = 64, className = '' }) => {
  return (
    <div
      className={`item-icon item-icon-${iconId} ${className}`}
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        marginRight: '8px',
      }}
      title={iconId}
    />
  );
};
