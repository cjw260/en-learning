import { Controller, Get, Post, Body, Res, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import type { ChatDto, ChatRoleType } from '@en/common/chat';
import type { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async create(@Body() createChatDto: ChatDto, @Res() res: Response) {
    //设置返回的格式SSE 流失输出
    res.setHeader('Content-Type', 'text/event-stream'); //SSE 流式输出
    res.setHeader('Cache-Control', 'no-cache'); //不缓存
    res.setHeader('Connection', 'keep-alive'); //保持连接
    const stream = await this.chatService.streamCompletion(createChatDto); //调用服务层的方法
    for await (const chunk of stream) {
      const [msg] = chunk;
      //深度思考返回的内容不在content
      const thinkMsg = msg.additional_kwargs?.reasoning_content ?? '';
      if (thinkMsg) {
        res.write(
          `data: ${JSON.stringify({ content: thinkMsg, role: 'ai', type: 'reasoning' })}\n\n`,
        );
      }
      const content = msg.content ?? ''; //普通对话的内容
      if (content) {
        res.write(
          `data: ${JSON.stringify({ content: content, role: 'ai', type: 'chat' })}\n\n`,
        ); //将数据写入响应流
      }
    }
    res.end(); //结束响应
  }

  @Get('history')
  findAll(@Query('userId') userId: string, @Query('role') role: ChatRoleType) {
    return this.chatService.findAll(userId, role);
  }
}
