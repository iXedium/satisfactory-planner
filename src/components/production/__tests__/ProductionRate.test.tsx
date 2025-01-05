import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductionRate } from '../ProductionRate';

describe('ProductionRate', () => {
  const defaultProps = {
    totalRate: 30,
    manualRate: 0,
    onManualRateChange: jest.fn(),
    onOptimalRateClick: jest.fn(),
    onClearRate: jest.fn(),
    detailLevel: 'normal' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders total rate', () => {
    render(<ProductionRate {...defaultProps} />);
    expect(screen.getByText('30.00/min')).toBeInTheDocument();
  });

  it('shows manual rate controls in normal mode', () => {
    render(<ProductionRate {...defaultProps} />);
    const input = screen.getByPlaceholderText('Add rate...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('manual-rate-input');
  });

  it('hides manual rate controls in compact mode', () => {
    render(<ProductionRate {...defaultProps} detailLevel="compact" />);
    expect(screen.queryByPlaceholderText('Add rate...')).not.toBeInTheDocument();
  });

  it('calls onManualRateChange when input changes', () => {
    render(<ProductionRate {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Add rate...');
    fireEvent.change(input, { target: { value: '15' } });
    
    expect(defaultProps.onManualRateChange).toHaveBeenCalledWith(15);
  });

  it('shows optimal rate button', () => {
    render(<ProductionRate {...defaultProps} />);
    const button = screen.getByTitle('Set manual rate to achieve 100% efficiency');
    expect(button).toBeInTheDocument();
  });

  it('calls onOptimalRateClick when optimal rate button is clicked', () => {
    render(<ProductionRate {...defaultProps} />);
    
    const button = screen.getByTitle('Set manual rate to achieve 100% efficiency');
    fireEvent.click(button);
    
    expect(defaultProps.onOptimalRateClick).toHaveBeenCalled();
  });

  it('shows clear rate button', () => {
    render(<ProductionRate {...defaultProps} manualRate={10} />);
    const button = screen.getByTitle('Clear manual rate');
    expect(button).toBeInTheDocument();
  });

  it('calls onClearRate when clear rate button is clicked', () => {
    render(<ProductionRate {...defaultProps} manualRate={10} />);
    
    const button = screen.getByTitle('Clear manual rate');
    fireEvent.click(button);
    
    expect(defaultProps.onClearRate).toHaveBeenCalled();
  });

  it('displays zero when manual rate is zero', () => {
    render(<ProductionRate {...defaultProps} manualRate={0} />);
    const input = screen.getByPlaceholderText('Add rate...');
    expect(input).toHaveValue(0);
  });

  it('shows only rate value in compact mode', () => {
    render(<ProductionRate {...defaultProps} detailLevel="compact" />);
    expect(screen.getByText('30.00/min')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Add rate...')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Set manual rate to achieve 100% efficiency')).not.toBeInTheDocument();
  });

  it('prevents wheel event on manual rate input', () => {
    render(<ProductionRate {...defaultProps} />);
    const input = screen.getByPlaceholderText('Add rate...') as HTMLInputElement;
    const mockBlur = jest.fn();
    input.blur = mockBlur;
    
    fireEvent.wheel(input);
    
    expect(mockBlur).toHaveBeenCalled();
  });

  it('selects input content on click', () => {
    render(<ProductionRate {...defaultProps} manualRate={10} />);
    const input = screen.getByPlaceholderText('Add rate...') as HTMLInputElement;
    const mockSelect = jest.fn();
    input.select = mockSelect;
    
    fireEvent.click(input);
    
    expect(mockSelect).toHaveBeenCalled();
  });
}); 