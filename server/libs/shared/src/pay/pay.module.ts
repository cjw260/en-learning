import { Module } from '@nestjs/common';
import { PayService } from './pay.service';

@Module({
  providers: [PayService],
  exports: [PayService],
})
export class PayModule {}
