import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FAQsSection from './faqsSection';

vi.mock('@/hooks/use-faq-content', () => ({
  useFAQContent: () => ({
    data: {
      title: 'Frequently Asked Questions',
      subtitle: 'Helpful answers',
      topics: [{ id: 'general', label: 'General' }],
      questions: [
        {
          category: 'general',
          question: 'What is CICT?',
          answer: 'A technology-focused college.',
        },
      ],
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe('FAQsSection', () => {
  it('renders FAQ content from the API-backed hook', () => {
    render(<FAQsSection />);

    expect(screen.getByText('Frequently Asked Questions')).toBeTruthy();
    expect(screen.getByText('Helpful answers')).toBeTruthy();
    expect(screen.getAllByText('General')).toHaveLength(2);
    expect(screen.getByText('What is CICT?')).toBeTruthy();
  });
});
