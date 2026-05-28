import Announcement from '../models/Announcement'
import logger from '../utils/logger'

export const archiveExpiredAnnouncements = async (): Promise<number> => {
  const now = new Date()

  const result = await Announcement.updateMany(
    {
      status: 'published',
      isActive: true,
      expiresAt: { $exists: true, $ne: null, $lte: now },
    },
    {
      $set: {
        status: 'archived',
        isActive: false,
        archivedAt: now,
      },
    }
  )

  if (result.modifiedCount > 0) {
    logger.info(`Archived ${result.modifiedCount} expired announcement(s)`)
  }

  return result.modifiedCount
}
