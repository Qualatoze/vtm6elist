import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DotRating } from '../components/DotRating';

describe('DotRating', () => {
  it('renders correct number of dots', () => {
    render(<DotRating total={5} value={3} />);
    const container = document.body;
    const buttons = Array.from(container.querySelectorAll('button'));
    expect(buttons.length).toBe(5);
  });

  it('renders diamond shape for humanity path', () => {
    render(<DotRating total={7} value={4} shape="diamond" />);
    const container = document.body;
    const buttons = Array.from(container.querySelectorAll('button'));
    expect(buttons.length).toBe(7);
  });

  it('calls onChange when clicking a dot', () => {
    const onChange = vi.fn();
    render(<DotRating total={5} value={2} onChange={onChange} />);

    const container = document.body;
    const buttons = Array.from(container.querySelectorAll('button'));

    fireEvent.click(buttons[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('toggles off when clicking current position', () => {
    const onChange = vi.fn();
    render(<DotRating total={5} value={3} onChange={onChange} />);

    const container = document.body;
    const buttons = Array.from(container.querySelectorAll('button'));

    fireEvent.click(buttons[2]);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('renders filled dots for values below total', () => {
    render(<DotRating total={5} value={3} />);

    const container = document.body;
    const buttons = Array.from(container.querySelectorAll('button'));

    expect(buttons[0].style.background).toBe('var(--dot-color)');
    expect(buttons[1].style.background).toBe('var(--dot-color)');
    expect(buttons[2].style.background).toBe('var(--dot-color)');
    expect(buttons[3].style.background).toBe('transparent');
    expect(buttons[4].style.background).toBe('transparent');
  });

  it('uses correct size for squares (16px default)', () => {
    render(<DotRating total={5} value={0} />);

    const container = document.body;
    const buttons = Array.from(container.querySelectorAll('button'));

    expect(buttons[0].style.width).toBe('16px');
    expect(buttons[0].style.height).toBe('16px');
    expect(buttons[0].style.borderRadius).toBe('2px');
  });

  it('uses correct size for diamonds (14px)', () => {
    render(<DotRating total={7} value={0} shape="diamond" size={14} />);

    const container = document.body;
    const buttons = Array.from(container.querySelectorAll('button'));

    expect(buttons[0].style.width).toBe('14px');
    expect(buttons[0].style.height).toBe('14px');
    expect(buttons[0].style.borderRadius).toBe('0px');
    expect(buttons[0].style.transform).toBe('rotate(45deg)');
  });

  it('triggers haptic feedback on click', () => {
    const mockVibrate = vi.fn();
    Object.defineProperty(window.navigator, 'vibrate', {
      writable: true,
      value: mockVibrate
    });

    render(<DotRating total={5} value={0} />);

    const container = document.body;
    const buttons = Array.from(container.querySelectorAll('button'));

    fireEvent.click(buttons[0]);

    expect(mockVibrate).toHaveBeenCalledWith(10);
  });
});
