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
        requireTLS: true,
        auth: {
          user: this.configService.get<string>('MAIL_USER'),
          pass: this.configService.get<string>('MAIL_PASS'),
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
      });

      // Verify connection on startup
      this.transporter.verify(error => {
        if (error) {
          this.logger.error(
            `Email service connection failed: ${error.message}`,
          );
        } else {
          this.logger.log('Email service connection established successfully');
        }
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
        `Password reset email skipped: MAIL_HOST is not configured. MAIL_HOST=${this.configService.get<string>('MAIL_HOST')}`,
      );
      return;
    }

    const resetUrl = `${this.configService.get<string>(
      'FRONTEND_URL',
    )}/reset-password?token=${token}`;

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

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Password reset email sent successfully: ${info.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email: ${error.message}`,
      );
      this.logger.error(`Error details: ${JSON.stringify(error, null, 2)}`);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
}
