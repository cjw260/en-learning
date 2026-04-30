import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SharedModule } from '@libs/shared';
@Module({
  imports: [SharedModule], //JWTService
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
