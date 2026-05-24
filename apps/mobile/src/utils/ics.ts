import { Paths, File } from 'expo-file-system';

export function generateIcsContent(event: {
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
}): string {
  const formatICSDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const now = formatICSDate(new Date().toISOString());
  const dtstart = formatICSDate(event.startDate);
  const dtend = formatICSDate(event.endDate);
  const uid = `cict-event-${event.title.replace(/\s+/g, '-')}-${Date.now()}@cict`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CICT//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${event.title}`,
    event.location ? `LOCATION:${event.location}` : '',
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    `DTSTAMP:${now}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

export async function writeIcsFile(content: string): Promise<string> {
  const fileName = `event-${Date.now()}.ics`;
  const file = new File(Paths.cache, fileName);
  file.write(content);
  return file.uri;
}
