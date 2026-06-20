import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter?: nodemailer.Transporter;

  private readonly logger: Logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.configService.get<number>('MAIL_PORT'),
        secure: this.configService.get<boolean>('MAIL_SECURE'),
        auth: {
          user: this.configService.get<string>('MAIL_USER'),
          pass: this.configService.get<string>('MAIL_PASS'),
        },
      });
    } else {
      this.logger.warn(
        'EmailService: MAIL_HOST is not configured. Emails will not be sent.',
      );
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    this.logger.log(`Attempting to send password reset email to ${to}`);

    if (!this.transporter) {
      this.logger.error(
        `Password reset email skipped for ${to}: MAIL_HOST is not configured. MAIL_HOST=${this.configService.get<string>('MAIL_HOST')}`,
      );
      return;
    }

    const resetUrl = `${this.configService.get<string>(
      'FRONTEND_URL',
    )}/reset-password?token=${token}`;

    this.logger.log(`Reset URL: ${resetUrl}`);

    const mailOptions = {
      from: `"FrontEndly Support" <${this.configService.get<string>(
        'MAIL_FROM',
      )}>`,
      to,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    this.logger.log(`Mail options: ${JSON.stringify({ to, from: mailOptions.from, subject: mailOptions.subject })}`);

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
