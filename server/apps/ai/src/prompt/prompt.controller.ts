import { Controller, Get } from '@nestjs/common';
import { PromptService } from './prompt.service';

@Controller('prompt')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Get('list')
  findAll() {
    return this.promptService.findAll();
  }
}
