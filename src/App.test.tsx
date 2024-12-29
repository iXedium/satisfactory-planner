import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders app component', () => {
  render(<App />);
  const element = screen.getByRole('main');
  expect(element).toBeInTheDocument();
});
