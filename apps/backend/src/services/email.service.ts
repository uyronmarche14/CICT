import nodemailer from 'nodemailer'
import logger from '../utils/logger'

let transporter: nodemailer.Transporter | null = null

const getTransporter = (): nodemailer.Transporter => {
  if (transporter) {return transporter}

  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
      },
    })
  } else {
    // Development fallback — log instead of sending
    transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      ignoreTLS: true,
    })
  }

  return transporter
}

const FROM_ADDRESS = process.env.SMTP_FROM ?? 'noreply@cict.edu.ph'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export const sendEmail = async (params: SendEmailParams): Promise<void> => {
  const { to, subject, html, text } = params

  if (!to) {
    logger.warn('Email not sent: no recipient address')
    return
  }

  try {
    const transport = getTransporter()
    await transport.sendMail({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, ''),
    })
    logger.info(`Email sent to ${to}: ${subject}`)
  } catch (err) {
    logger.error(`Failed to send email to ${to}:`, err)
    // Don't throw — email failure should not break the request
  }
}

// ——— Template helpers ———

export const buildPasswordResetEmail = (resetUrl: string): { subject: string; html: string } => ({
  subject: 'CICT — Password Reset Request',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a56db;">CICT Password Reset</h2>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}"
           style="background: #1a56db; color: white; padding: 12px 28px; border-radius: 6px;
                  text-decoration: none; display: inline-block; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        If you didn't request this, you can ignore this email.
        This link expires in 1 hour.
      </p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">CICT — College of Information and Communication Technology</p>
    </div>
  `,
})

export const buildAccountActivatedEmail = (firstName: string): { subject: string; html: string } => ({
  subject: 'CICT — Your Account Has Been Activated',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a56db;">Welcome, ${firstName}!</h2>
      <p>Your CICT student account has been activated by an administrator.</p>
      <p>You can now log in to access your student dashboard, register for events, and manage your memberships.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.FRONTEND_URL ?? 'https://cict.edu.ph'}/student/login"
           style="background: #1a56db; color: white; padding: 12px 28px; border-radius: 6px;
                  text-decoration: none; display: inline-block; font-weight: bold;">
          Log In
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">CICT — College of Information and Communication Technology</p>
    </div>
  `,
})

export const buildContentPublishedEmail = (
  contentType: string,
  title: string,
  url: string
): { subject: string; html: string } => ({
  subject: `CICT — New ${contentType}: ${title}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a56db;">New ${contentType}</h2>
      <p><strong>${title}</strong> has been published on CICT.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}"
           style="background: #1a56db; color: white; padding: 12px 28px; border-radius: 6px;
                  text-decoration: none; display: inline-block; font-weight: bold;">
          View ${contentType}
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">CICT — College of Information and Communication Technology</p>
    </div>
  `,
})
