import StudentSession from '../models/StudentSession'
import logger from '../utils/logger'

export const cleanupExpiredSessions = async (): Promise<number> => {
  const result = await StudentSession.deleteMany({
    $or: [
      { expiresAt: { $lte: new Date() } },
      { revokedAt: { $ne: null } },
    ],
  })

  if (result.deletedCount > 0) {
    logger.info(`Cleaned up ${result.deletedCount} expired/revoked session(s)`)
  }

  return result.deletedCount
}
