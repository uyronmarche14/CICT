import { render, fireEvent } from '@testing-library/react-native';

const mockColors = {
  text: '#000',
  textMuted: '#666',
  surfaceMuted: '#eee',
};

jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: mockColors,
    isDark: false,
    preference: 'light' as const,
    setPreference: jest.fn(),
    toggleDark: jest.fn(),
  }),
}));

jest.mock('@/utils/format', () => ({
  formatDate: jest.fn((date: string) => `Formatted: ${date}`),
}));

import { EventCard } from '@/components/events/EventCard';
import type { StudentEvent } from '@/types/models';

const baseEvent: StudentEvent = {
  _id: 'evt-1',
  title: 'Sample Event',
  excerpt: 'This is a sample event excerpt.',
  startDate: '2026-03-15T10:00:00Z',
  endDate: '2026-03-15T12:00:00Z',
  location: 'Room 101',
  status: 'published',
  bodyHtml: '<p>Event body</p>',
  registration: null,
};

describe('EventCard', () => {
  it('renders event title, date, location, and excerpt', () => {
    const { getByText } = render(<EventCard event={baseEvent} />);

    expect(getByText('Sample Event')).toBeTruthy();
    expect(getByText('This is a sample event excerpt.')).toBeTruthy();
    expect(getByText('Formatted: 2026-03-15T10:00:00Z • Room 101')).toBeTruthy();
  });

  it('renders image when coverImage.imageUrl is present', () => {
    const event: StudentEvent = {
      ...baseEvent,
      coverImage: { imageUrl: 'https://example.com/cover.jpg' },
    };

    const { toJSON } = render(<EventCard event={event} />);

    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('https://example.com/cover.jpg');
  });

  it('renders StatusPill when registration status exists', () => {
    const event: StudentEvent = {
      ...baseEvent,
      registration: {
        _id: 'reg-1',
        eventId: 'evt-1',
        studentId: 'st-1',
        status: 'registered',
        registeredAt: '2026-03-10T08:00:00Z',
        source: 'self',
      },
    };

    const { getByText } = render(<EventCard event={event} />);

    expect(getByText('registered')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <EventCard event={baseEvent} onPress={onPress} />,
    );

    fireEvent.press(getByText('Sample Event'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not render image when no coverImage or imageUrl', () => {
    const { toJSON } = render(<EventCard event={baseEvent} />);

    const tree = JSON.stringify(toJSON());
    expect(tree).not.toContain('"type":"Image"');
  });

  it('does not render StatusPill when no registration', () => {
    const { queryByText } = render(<EventCard event={baseEvent} />);

    expect(queryByText('registered')).toBeNull();
    expect(queryByText('checked_in')).toBeNull();
    expect(queryByText('cancelled')).toBeNull();
  });
});
