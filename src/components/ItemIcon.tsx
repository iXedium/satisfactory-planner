import React from 'react';

interface ItemIconProps {
  iconId: string;
  size?: 16 | 32 | 64;
  className?: string;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ iconId, size = 32, className = '' }) => {
  return (
    <div
      className={`item-icon item-icon-${iconId} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`, // Prevent shrinking
        fontSize: `${size / 4}px`, // Scale font with icon size
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        marginRight: '8px',
      }}
      title={iconId}
    />
  );
};
