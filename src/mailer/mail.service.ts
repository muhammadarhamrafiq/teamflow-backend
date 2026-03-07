import { Injectable } from '@nestjs/common';
import { QueueService } from 'src/queue/queue.service';

@Injectable()
export class MailService {
  constructor(private readonly queueService: QueueService) {}

  async sendVerificationEmail(email: string, token: string) {
    await this.queueService.addEmailVerification({ email, token });
  }

  async sendPasswordReset(email: string, token: string) {
    await this.queueService.addPasswordReset({ email, token });
  }

  async sendUpdateEmail(email: string, token: string) {
    await this.queueService.updateEmail({ email, token });
  }
}
