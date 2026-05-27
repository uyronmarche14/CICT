import Event from '../../models/Event';
import EventAttendanceLog from '../../models/EventAttendanceLog';
import ActivityLog from '../../models/ActivityLog';
import logger from '../../utils/logger';

export async function up(): Promise<void> {
  logger.info('Running migration 001: Adding missing indexes...');

  // Event: compound index for upcoming events filter ({ status, endDate })
  await Event.collection.createIndex(
    { status: 1, endDate: 1 },
    { background: true, name: 'event_status_endDate' }
  );
  logger.info('  ✓ Created event_status_endDate index');

  // EventAttendanceLog: compound index for stats by result
  await EventAttendanceLog.collection.createIndex(
    { eventId: 1, result: 1 },
    { background: true, name: 'attendance_event_result' }
  );
  logger.info('  ✓ Created attendance_event_result index');

  // EventAttendanceLog: compound index for stats by scanType
  await EventAttendanceLog.collection.createIndex(
    { eventId: 1, scanType: 1 },
    { background: true, name: 'attendance_event_scanType' }
  );
  logger.info('  ✓ Created attendance_event_scanType index');

  // ActivityLog: compound index for filtering by resource + action
  await ActivityLog.collection.createIndex(
    { resource: 1, action: 1, createdAt: -1 },
    { background: true, name: 'activity_resource_action' }
  );
  logger.info('  ✓ Created activity_resource_action index');

  logger.info('Migration 001 complete.');
}

export async function down(): Promise<void> {
  logger.info('Rolling back migration 001...');

  await Event.collection.dropIndex('event_status_endDate').catch(() => {});
  await EventAttendanceLog.collection.dropIndex('attendance_event_result').catch(() => {});
  await EventAttendanceLog.collection.dropIndex('attendance_event_scanType').catch(() => {});
  await ActivityLog.collection.dropIndex('activity_resource_action').catch(() => {});

  logger.info('Migration 001 rolled back.');
}
