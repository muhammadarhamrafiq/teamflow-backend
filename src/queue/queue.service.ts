import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

export type EmailData = {
  email: string;
  token: string;
};

@Injectable()
export class QueueService {
  constructor(@InjectQueue('default') private queue: Queue) {}

  async addEmailVerification(data: EmailData) {
    return this.queue.add('email_verification', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async addPasswordReset(data: EmailData) {
    return this.queue.add('password_reset', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  async updateEmail(data: EmailData) {
    return this.queue.add('update_email', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 100 },
    });
  }
}
