import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { digestQueueName } from './digest.queue';
import { DigestService } from './digest.service';
import { EmailService } from '@libs/shared';
@Processor(digestQueueName.name)
export class DigestProcessor extends WorkerHost {
  constructor(
    private readonly digestService: DigestService,
    private readonly emailService: EmailService,
  ) {
    super();
  }
  async process(job: Job) {
    if (job.name === digestQueueName.task.emailDigest) {
      const { text, email } = job.data;
      await this.emailService.sendEmail(email, '每日单词记忆报告', text);
      console.log('邮件发送成功');
    }
    if (job.name === digestQueueName.task.everyDayDigest) {
      await this.digestService.handleEmailDigest();
      console.log('每天任务消费成功');
    }
  }
}
