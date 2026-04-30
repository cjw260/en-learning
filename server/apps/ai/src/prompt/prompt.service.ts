import { Injectable } from '@nestjs/common';
import { chatMode } from './prompt.mode';
import { ResponseService } from '@libs/shared';
@Injectable()
export class PromptService {
  constructor(private readonly responseService: ResponseService) {}
  findAll() {
    //返回左侧列表 并且过滤提示词
    return this.responseService.success(
      chatMode.map((item) => ({
        id: item.id,
        label: item.label,
        role: item.role,
      })),
    );
  }
}
