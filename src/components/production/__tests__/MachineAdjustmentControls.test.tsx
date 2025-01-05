import { render, screen, fireEvent } from '@testing-library/react';
import { MachineAdjustmentControls } from '..//MachineAdjustmentControls';

test('prevents machine count from going below minimum', () => {
  const defaultProps = {
    machineCount: 1, // Minimum allowed count
    onMachineCountChange: jest.fn(),
  };

  render(<MachineAdjustmentControls efficiency={''} detailLevel={'compact'} {...defaultProps} />);

  // Simulate decrement
  const decrementButton = screen.getByText('-');
  fireEvent.click(decrementButton);

  // Ensure `onMachineCountChange` is NOT called
  expect(defaultProps.onMachineCountChange).not.toHaveBeenCalled();

  // Verify that the cursor change behavior is implemented
  expect(decrementButton).toHaveStyle('cursor: not-allowed');
});
