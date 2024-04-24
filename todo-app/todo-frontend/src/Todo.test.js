import { render, screen } from '@testing-library/react';
import Todo from './Todo';

test('renders Todo component with text', () => {
    render(<Todo text="Learn Docker" done={false} />);
    const todoElement = screen.getByText(/Learn Docker/i);
    expect(todoElement).toBeInTheDocument();
});