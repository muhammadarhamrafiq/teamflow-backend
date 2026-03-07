import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { Resend } from 'resend';
import { EmailData } from 'src/queue/queue.service';

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

  async process(job: Job) {
    switch (job.name) {
      case 'email_verification':
        await this.handleEmailVerification(job.data as EmailData);
        break;
      case 'password_reset':
        await this.handlePasswordReset(job.data as EmailData);
        break;
      case 'update_email':
        await this.handleUpdateEmail(job.data as EmailData);
        break;
    }
  }

  async handleEmailVerification(data: EmailData) {
    const { email, token } = data;

    await this.resend.emails.send({
      from: `TeamFlow <noreply@${this.emailDomain}>`,
      to: email,
      subject: 'Verify your email',
      html: `<a href="${this.frontendUrl}/verify?token=${token}">Verify Email</a>`,
    });
  }

  async handlePasswordReset(data: { email: string; token: string }) {
    const { email, token } = data;
    await this.resend.emails.send({
      from: `TeamFlow <noreply@${this.emailDomain}>`,
      to: email,
      subject: 'Reset you Password',
      html: `<a href="${this.frontendUrl}/verify?token=${token}">Verify Email</a>`,
    });
  }

  async handleUpdateEmail(data: { email: string; token: string }) {
    const { email, token } = data;
    await this.resend.emails.send({
      from: `TeamFlow <noreply@${this.emailDomain}>`,
      to: email,
      subject: 'Update you email',
      html: `<a href="${this.frontendUrl}/verify?token=${token}">Verify Email</a>`,
    });
  }
}
