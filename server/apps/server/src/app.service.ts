import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  getHello(): string {
    return '123';
  }
}
