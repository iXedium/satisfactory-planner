import React from 'react';
import './ItemIcon.css';
import '../styles/components/_item-icon.scss';

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
        marginRight: '8px',
      }}
      title={iconId}
    />
  );
};
