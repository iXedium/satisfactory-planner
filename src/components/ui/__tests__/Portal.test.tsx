import React from 'react';
import { render, screen } from '@testing-library/react';
import { Portal } from '../Portal';

describe('Portal', () => {
  it('renders children in a portal', () => {
    render(
      <Portal>
        <div data-testid="portal-content">Portal Content</div>
      </Portal>
    );
    
    const content = screen.getByTestId('portal-content');
    expect(content).toBeInTheDocument();
    expect(content.parentElement?.parentElement).toBe(document.body);
  });

  it('removes portal from DOM on unmount', () => {
    const { unmount } = render(
      <Portal>
        <div data-testid="portal-content">Portal Content</div>
      </Portal>
    );
    
    const content = screen.getByTestId('portal-content');
    const portalRoot = content.parentElement;
    
    unmount();
    
    expect(document.body.contains(portalRoot)).toBe(false);
  });

  it('renders multiple portals independently', () => {
    render(
      <>
        <Portal>
          <div data-testid="portal-1">Portal 1</div>
        </Portal>
        <Portal>
          <div data-testid="portal-2">Portal 2</div>
        </Portal>
      </>
    );
    
    const portal1 = screen.getByTestId('portal-1');
    const portal2 = screen.getByTestId('portal-2');
    
    expect(portal1.parentElement).not.toBe(portal2.parentElement);
    expect(portal1.parentElement?.parentElement).toBe(document.body);
    expect(portal2.parentElement?.parentElement).toBe(document.body);
  });

  it('preserves event handlers on portaled content', () => {
    const handleClick = jest.fn();
    
    render(
      <Portal>
        <button data-testid="portal-button" onClick={handleClick}>
          Click Me
        </button>
      </Portal>
    );
    
    const button = screen.getByTestId('portal-button');
    button.click();
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('updates portal content on prop changes', () => {
    const { rerender } = render(
      <Portal>
        <div data-testid="portal-content">Initial Content</div>
      </Portal>
    );
    
    expect(screen.getByText('Initial Content')).toBeInTheDocument();
    
    rerender(
      <Portal>
        <div data-testid="portal-content">Updated Content</div>
      </Portal>
    );
    
    expect(screen.getByText('Updated Content')).toBeInTheDocument();
  });
}); 