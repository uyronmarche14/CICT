import { getCalendarFeed } from './calendar-feed.service';

export async function generateICalFeed(user: any): Promise<string> {
  const result = await getCalendarFeed(user, {
    limit: 200,
    offset: 0,
  });

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CICT Portal//Calendar Feed//EN',
    'X-WR-CALNAME:CICT Calendar',
  ];

  for (const item of result.items) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${item.id}@cict`);
    lines.push(`DTSTART:${formatICalDate(item.startsAt)}`);
    if (item.endsAt) {lines.push(`DTEND:${formatICalDate(item.endsAt)}`);}
    lines.push(`SUMMARY:${item.title}`);
    if (item.description) {lines.push(`DESCRIPTION:${item.description}`);}
    lines.push(`END:VEVENT`);
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function formatICalDate(isoString: string): string {
  return isoString.replace(/[-:]/g, '').split('.')[0] + 'Z';
}
