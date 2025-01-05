import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ProductionRate } from '../ProductionRate';

describe('ProductionRate', () => {
  const defaultProps = {
    totalRate: 10,
    manualRate: 0,
    onManualRateChange: jest.fn(),
    onOptimalRateClick: jest.fn(),
    onClearRate: jest.fn(),
    detailLevel: 'normal' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<ProductionRate {...defaultProps} />);
    expect(screen.getByText('10.00/min')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(0);
  });

  it('handles manual rate changes', () => {
    render(<ProductionRate {...defaultProps} />);
    const input = screen.getByRole('spinbutton');
    
    fireEvent.change(input, { target: { value: '5' } });
    expect(defaultProps.onManualRateChange).toHaveBeenCalledWith(5);
  });

  it('handles optimal rate click', () => {
    render(<ProductionRate {...defaultProps} />);
    const optimalButton = screen.getByTitle('Set manual rate to achieve 100% efficiency');
    
    fireEvent.click(optimalButton);
    expect(defaultProps.onOptimalRateClick).toHaveBeenCalled();
  });

  it('handles clear rate click', () => {
    render(<ProductionRate {...defaultProps} />);
    const clearButton = screen.getByTitle('Clear manual rate');
    
    fireEvent.click(clearButton);
    expect(defaultProps.onClearRate).toHaveBeenCalled();
  });

  it('respects detail level prop', () => {
    const { rerender } = render(<ProductionRate {...defaultProps} detailLevel="compact" />);
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();

    rerender(<ProductionRate {...defaultProps} detailLevel="normal" />);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('formats total rate correctly', () => {
    const { rerender } = render(<ProductionRate {...defaultProps} />);
    expect(screen.getByText('10.00/min')).toBeInTheDocument();

    rerender(<ProductionRate {...defaultProps} totalRate={5.123} />);
    expect(screen.getByText('5.12/min')).toBeInTheDocument();
  });
}); 