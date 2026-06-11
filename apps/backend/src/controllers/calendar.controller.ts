import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getCalendarFeed as getCalendarFeedService } from '../services/calendar-feed.service';
import { generateICalFeed as generateICalFeedService } from '../services/calendar-ical.service';

export const getCalendarFeed = async (req: AuthRequest, res: Response) => {
  const {
    startDate, endDate, sourceTypes: sourceTypesStr,
    orgId, limit: limitStr, offset: offsetStr,
  } = req.query as Record<string, string | undefined>;

  const sourceTypes = sourceTypesStr
    ? sourceTypesStr.split(',').filter(Boolean)
    : undefined;

  const result = await getCalendarFeedService(req.user, {
    startDate,
    endDate,
    sourceTypes,
    orgId,
    limit: limitStr ? parseInt(limitStr, 10) : 50,
    offset: offsetStr ? parseInt(offsetStr, 10) : 0,
  });

  res.json({ success: true, data: result });
};

export const getICalExport = async (req: AuthRequest, res: Response) => {
  const ical = await generateICalFeedService(req.user);
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="cict-calendar.ics"');
  res.send(ical);
};
