import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button component', () => {
  it('renders children and responds to click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeTruthy();

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );

    const btn = screen.getByRole('button', { name: /disabled/i });
    expect(btn.getAttribute('disabled')).not.toBeNull();

    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards props to child when using asChild (renders anchor)', () => {
    render(
      <Button asChild>
        <a href="/about">Go</a>
      </Button>
    );

    const link = screen.getByRole('link', { name: /go/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/about');
    expect(link.getAttribute('data-slot')).toBe('button');
  });
});
