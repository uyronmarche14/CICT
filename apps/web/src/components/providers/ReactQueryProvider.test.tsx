import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactQueryProvider } from './ReactQueryProvider';

describe('ReactQueryProvider', () => {
  it('renders children', () => {
    render(
      <ReactQueryProvider>
        <div data-testid="child">Hello</div>
      </ReactQueryProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('provides query client context for useQuery', () => {
    function TestComponent() {
      return <div data-testid="provided">Works</div>;
    }

    render(
      <ReactQueryProvider>
        <TestComponent />
      </ReactQueryProvider>
    );

    expect(screen.getByTestId('provided')).toHaveTextContent('Works');
  });
});
