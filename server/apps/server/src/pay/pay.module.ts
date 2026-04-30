import { Module } from '@nestjs/common';
import { PayService } from './pay.service';
import { PayController } from './pay.controller';
import { SocketModule } from '../socket/socket.module';
@Module({
  imports: [SocketModule],
  controllers: [PayController],
  providers: [PayService],
})
export class PayModule {}
