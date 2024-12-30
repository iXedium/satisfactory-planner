import React from 'react';

interface ViewToggleProps {
  mode: 'tree' | 'list';
  onToggle: () => void;
}

export function ViewToggle({ mode, onToggle }: ViewToggleProps) {
  return (
    <button 
      className="view-toggle-button" 
      onClick={onToggle}
    >
      Switch to {mode === 'tree' ? 'List' : 'Tree'} View
    </button>
  );
}
