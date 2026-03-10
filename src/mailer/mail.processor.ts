import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { Resend } from 'resend';
import { EmailData } from 'src/queue/queue.service';

import path from 'node:path';
import fs from 'fs';
import { Logger } from '@nestjs/common';

@Processor('default')
export class MailProcessor extends WorkerHost {
  private resend: Resend;
  private emailDomain: string;
  private frontendUrl: string | undefined;

  constructor(private readonly configService: ConfigService) {
    super();
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.emailDomain = this.configService.get<string>(
      'EMAIL_DOMAIN',
      'resend.dev',
    );
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL');
    this.resend = new Resend(apiKey);
  }

  private generateTemplate(template: string, url: string, token: string) {
    const templatePath = path.join(__dirname, 'templates', template);
    let htmlTemplate: string = fs.readFileSync(templatePath, 'utf-8');
    // replace placeholders
    htmlTemplate = htmlTemplate.replace(
      '{{verify_url}}',
      `${this.frontendUrl}/${url}?token=${token}`,
    );

    return htmlTemplate;
  }

  async process(job: Job) {
    try {
      switch (job.name) {
        case 'register_email':
          await this.handleRegisterationMail(job.data as EmailData);
          break;
        case 'password_reset':
          await this.handlePasswordReset(job.data as EmailData);
          break;
        case 'update_email':
          await this.handleUpdateEmail(job.data as EmailData);
          break;
      }
    } catch (error: unknown) {
      Logger.error(error);
    }
  }

  async handleRegisterationMail(data: EmailData) {
    const { email, token } = data;

    await this.resend.emails.send({
      from: `TeamFlow <noreply@${this.emailDomain}>`,
      to: email,
      subject: 'Verify your email',
      html: this.generateTemplate('registerEmail.html', 'register', token),
    });
  }

  async handlePasswordReset(data: { email: string; token: string }) {
    const { email, token } = data;
    await this.resend.emails.send({
      from: `TeamFlow <noreply@${this.emailDomain}>`,
      to: email,
      subject: 'Reset you Password',
      html: this.generateTemplate(
        'passwordReset.html',
        'reset-password',
        token,
      ),
    });
  }

  async handleUpdateEmail(data: { email: string; token: string }) {
    const { email, token } = data;
    await this.resend.emails.send({
      from: `TeamFlow <noreply@${this.emailDomain}>`,
      to: email,
      subject: 'Update you email',
      html: this.generateTemplate('updateEmail.html', 'verify-email', token),
    });
  }
}
