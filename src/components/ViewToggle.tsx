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
      data-mode={mode}
      title={`Switch to ${mode === 'tree' ? 'list' : 'tree'} view`}
    >
      {mode === 'tree' ? 'Tree View' : 'List View'}
    </button>
  );
}
