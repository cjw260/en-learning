import { Module } from '@nestjs/common';
import { DigestService } from './digest.service';
import { BullModule } from '@nestjs/bullmq';
import { digestQueueName } from './digest.queue';
import { DigestProcessor } from './digest.processor';
@Module({
  imports: [
    BullModule.registerQueue({
      name: digestQueueName.name,
    }),
  ],
  providers: [DigestService, DigestProcessor],
})
export class DigestModule {}
