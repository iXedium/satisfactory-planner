import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MachineAdjustmentControls } from '../machineAdjustmentControls/MachineAdjustmentControls';

describe('MachineAdjustmentControls', () => {
  const defaultProps = {
    machineCount: 2,
    efficiency: '85.5',
    onMachineCountChange: jest.fn(),
    producer: 'constructor',
    nominalRate: 30,
    detailLevel: 'normal' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders machine count', () => {
    render(<MachineAdjustmentControls {...defaultProps} />);
    const input = screen.getByDisplayValue('2');
    expect(input).toBeInTheDocument();
  });

  it('renders efficiency percentage', () => {
    render(<MachineAdjustmentControls {...defaultProps} />);
    expect(screen.getByText('(85.5%)')).toBeInTheDocument();
  });

  it('shows producer name', () => {
    render(<MachineAdjustmentControls {...defaultProps} />);
    expect(screen.getByText('Constructor')).toBeInTheDocument();
  });

  it('calls onMachineCountChange when increasing machines', () => {
    render(<MachineAdjustmentControls {...defaultProps} />);
    
    const increaseButton = screen.getByText('+');
    fireEvent.click(increaseButton);
    
    expect(defaultProps.onMachineCountChange).toHaveBeenCalledWith(3);
  });

  it('calls onMachineCountChange when decreasing machines', () => {
    render(<MachineAdjustmentControls {...defaultProps} />);
    
    const decreaseButton = screen.getByText('-');
    fireEvent.click(decreaseButton);
    
    expect(defaultProps.onMachineCountChange).toHaveBeenCalledWith(1);
  });

  it('prevents decreasing machine count below 1', () => {
    render(<MachineAdjustmentControls {...defaultProps} machineCount={1} />);
    
    const decreaseButton = screen.getByText('-');
    expect(decreaseButton).toBeDisabled();
    
    fireEvent.click(decreaseButton);
    expect(defaultProps.onMachineCountChange).not.toHaveBeenCalled();
  });

  it('shows nominal rate when provided', () => {
    render(<MachineAdjustmentControls {...defaultProps} />);
    expect(screen.getByText('(30.00/min)')).toBeInTheDocument();
  });

  it('shows efficiency with correct class based on value', () => {
    render(<MachineAdjustmentControls {...defaultProps} efficiency="100" />);
    const efficiencyElement = screen.getByText('(100%)');
    expect(efficiencyElement.parentElement).toHaveClass('efficiency-optimal');

    render(<MachineAdjustmentControls {...defaultProps} efficiency="85.5" />);
    const underEfficiencyElement = screen.getByText('(85.5%)');
    expect(underEfficiencyElement.parentElement).toHaveClass('efficiency-under');

    render(<MachineAdjustmentControls {...defaultProps} efficiency="120" />);
    const overEfficiencyElement = screen.getByText('(120%)');
    expect(overEfficiencyElement.parentElement).toHaveClass('efficiency-over');
  });

  it('renders nothing in compact mode', () => {
    const { container } = render(<MachineAdjustmentControls {...defaultProps} detailLevel="compact" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows producer icon in detailed mode', () => {
    render(<MachineAdjustmentControls {...defaultProps} detailLevel="detailed" />);
    const icon = screen.getByAltText('constructor');
    expect(icon).toBeInTheDocument();
  });

  it('handles manual machine count input', () => {
    render(<MachineAdjustmentControls {...defaultProps} />);
    const input = screen.getByDisplayValue('2');
    
    fireEvent.change(input, { target: { value: '5' } });
    expect(defaultProps.onMachineCountChange).toHaveBeenCalledWith(5);
  });

  it('prevents invalid machine count input', () => {
    render(<MachineAdjustmentControls {...defaultProps} />);
    const input = screen.getByDisplayValue('2');
    
    fireEvent.change(input, { target: { value: '-1' } });
    expect(defaultProps.onMachineCountChange).toHaveBeenCalledWith(1);

    fireEvent.change(input, { target: { value: '0' } });
    expect(defaultProps.onMachineCountChange).toHaveBeenCalledWith(1);
  });
});
