import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import User from '../models/User'
import Student from '../models/Student'
import { AppError } from '../middleware/errorHandler'
import { sendEmail, buildPasswordResetEmail } from './email.service'
import logger from '../utils/logger'

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

const generateResetToken = (): string => crypto.randomBytes(32).toString('hex')

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex')

// ——— Admin User Password Reset ———

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email })
  if (!user) {
    logger.info(`Password reset requested for unknown email: ${email}`)
    return
  }

  const resetToken = generateResetToken()
  const hashedToken = hashToken(resetToken)

  const u = user as any
  u.resetPasswordToken = hashedToken
  u.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS)
  await u.save()

  logger.info(`Password reset token generated for admin user ${email}`)

  const resetUrl = `${process.env.FRONTEND_URL ?? 'https://cict.edu.ph'}/auth/reset-password?token=${resetToken}`
  const emailContent = buildPasswordResetEmail(resetUrl)
  await sendEmail({ to: email, ...emailContent })
}

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const hashedToken = hashToken(token)
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password')

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400)
  }

  const u = user as any
  u.password = newPassword
  u.resetPasswordToken = undefined
  u.resetPasswordExpires = undefined
  await u.save()

  logger.info(`Password reset successful for admin user: ${u.email}`)
}

// ——— Student Password Reset ———

export const forgotStudentPassword = async (studentNumber: string, email?: string): Promise<void> => {
  const query: Record<string, unknown> = { studentNumber: studentNumber.trim().toUpperCase() }
  if (email) {query.email = email.toLowerCase()}

  const student = await Student.findOne(query).select('+passwordHash')
  if (!student) {
    logger.info(`Password reset requested for unknown student: ${studentNumber}`)
    return
  }

  const resetToken = generateResetToken()
  const hashedToken = hashToken(resetToken)

  const s = student as any
  s.resetPasswordToken = hashedToken
  s.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS)
  await s.save()

  logger.info(`Password reset token generated for student ${studentNumber}`)

  if (s.email) {
    const resetUrl = `${process.env.FRONTEND_URL ?? 'https://cict.edu.ph'}/student/auth/reset-password?token=${resetToken}`
    const emailContent = buildPasswordResetEmail(resetUrl)
    await sendEmail({ to: s.email, ...emailContent })
  }
}

export const resetStudentPassword = async (token: string, newPassword: string): Promise<void> => {
  const hashedToken = hashToken(token)
  const student = await Student.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+passwordHash')

  if (!student) {
    throw new AppError('Invalid or expired reset token', 400)
  }

  const s = student as any
  const rounds = parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10)
  s.passwordHash = await bcrypt.hash(newPassword, rounds)
  s.resetPasswordToken = undefined
  s.resetPasswordExpires = undefined
  await s.save()

  logger.info(`Password reset successful for student: ${s.studentNumber}`)
}
