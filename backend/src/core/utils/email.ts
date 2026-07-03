import nodemailer from 'nodemailer';
import env from '../config/environment.js';
import logger from './logger.js';

export type ApplicationStatus =
  | 'Applied'
  | 'Shortlisted'
  | 'Interviewed'
  | 'Rejected'
  | 'Hired';

const statusMessages: Record<ApplicationStatus, string> = {
  Applied: 'Your application has been successfully submitted.',
  Shortlisted: 'Congratulations! You have been shortlisted.',
  Interviewed: 'You have been selected for an interview.',
  Rejected:
    'Thank you for applying. We have decided to move forward with other candidates.',
  Hired:
    'Congratulations! You have been selected for this position.',
};

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true for 465, false for 587
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  logger.info(`--------------------------------------------------`);
  logger.info(`PASSWORD RESET REQUESTED FOR: ${email}`);
  logger.info(`URL: ${resetUrl}`);
  logger.info(`--------------------------------------------------`);

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn('SMTP user or password not configured in .env. Email was NOT sent via SMTP (logged above instead).');
    return;
  }

  try {
    const mailOptions = {
      from: `"Job Portal" <${env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please click on the link below or copy-paste it into your browser to reset your password:\n\n${resetUrl}\n\nThis link is valid for 10 minutes. If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-bottom: 16px;">Reset Your Password</h2>
          <p style="color: #475569; line-height: 1.5;">You requested a password reset for your Job Portal account. Please click the button below to set a new password:</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">If the button doesn't work, copy and paste this URL into your browser:</p>
          <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${resetUrl}</p>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">This link will expire in 10 minutes. If you did not request this password reset, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email successfully sent to ${email} (Message ID: ${info.messageId})`);
  } catch (error) {
    logger.error(`Failed to send password reset email via SMTP: ${error instanceof Error ? error.message : error}`);
  }
}

export async function sendApplicationStatusEmail(email: string,
  candidateName: string,
  jobTitle: string,
  status: ApplicationStatus): Promise<void> {


  logger.info('--------------------------------------------------');
  logger.info(`APPLICATION STATUS EMAIL FOR: ${email}`);
  logger.info(`JOB: ${jobTitle}`);
  logger.info(`STATUS: ${status}`);
  logger.info('--------------------------------------------------');

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn('SMTP user or password not configured in .env. Email was NOT sent via SMTP (logged above instead).');
    return;
  }

  const message = statusMessages[status];

  try {
    const mailOptions = {
      from: `"Job Portal" <${env.SMTP_USER}>`,
      to: email,
      subject: `${jobTitle} - Status Changed to ${status}`,
      text: `
            Hi ${candidateName},
            ${message}
            Job: ${jobTitle}
            Current Status: ${status}
            Please log in to your account for more details.
            Regards,
            Job Portal Team
      `,
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
              <h2 style="color: #0f172a; margin-bottom: 16px;">
                Application Status Updated
              </h2>

              <p style="color: #475569; line-height: 1.5;">
                Hi <strong>${candidateName}</strong>,
              </p>

              <p style="color: #475569; line-height: 1.5;">
                Your application for
                <strong>${jobTitle}</strong>
                has been updated.
              </p>

              <div style="margin: 24px 0; padding: 16px; background: #f8fafc; border-radius: 8px;">
                <p style="margin: 0; color: #475569;">
                  Current Status:
                  <strong>${status}</strong>
                </p>
              </div>

              <p style="color: #475569;">
                Please log in to your account for more details.
              </p>

              <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />

              <p style="color: #94a3b8; font-size: 12px;">
                This is an automated message from Job Portal.
              </p>
            </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Application status email successfully sent to ${email} (Message ID: ${info.messageId})`);
  } catch (error) {
    logger.error(
      `Failed to send application status email via SMTP: ${error instanceof Error ? error.message : error
      }`
    );
  }
}
