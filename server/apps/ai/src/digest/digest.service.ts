import { PrismaService } from '@libs/shared';
import { Injectable, OnModuleInit } from '@nestjs/common';
import dayjs from 'dayjs';
import { createAgent } from 'langchain';
import { createDeepSeek } from '../llm/llm.config';
import { tool } from '@langchain/core/tools';
import marked from 'marked';
import { Queue } from 'bullmq';
import { digestQueueName } from './digest.queue';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class DigestService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(digestQueueName.name) private readonly digestQueue: Queue,
  ) {}
  //普通的大模型只能输出文本，不能做到比如查看代码，查看图片，连接数据库等操作，所以需要工具

  private queryTool() {
    return tool(
      async ({ userId }: { userId: string }) => {
        const user = await this.prismaService.user.findFirst({
          where: {
            id: userId,
          },
          select: {
            email: true,
            name: true,
            wordNumber: true,
            wordBookRecords: {
              where: {
                createdAt: {
                  gte: dayjs().startOf('day').toDate(),
                  lte: dayjs().add(1, 'day').startOf('day').toDate(),
                },
              },
              select: {
                word: {
                  select: {
                    word: true,
                  },
                },
              },
            },
          },
        });
        return user;
      },
      {
        name: 'queryTool', //名字一定要语义化,唯一不能重复
        description: '根据用户id查询用户学习的单词记录', //他会通过desc 和 name 选择要不要调用这个工具
        //数据结构 给大模型看的
        schema: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: '用户id' },
          },
          required: ['userId'],
        },
      },
    );
  }
  async onModuleInit() {
    await this.digestQueue.add(
      digestQueueName.task.everyDayDigest,
      {},
      {
        repeat: {
          pattern: '0 0 * * *', //每天0点执行
        },
      },
    );
  }

  async handleEmailDigest() {
    console.log('定时任务开始执行了');
    //筛选高质量用户（打开定时任务 + 定时任务有时间 + 今天学过的单词 + 邮箱不为空）
    const userIds = await this.prismaService.user.findMany({
      where: {
        isTimingTask: true, //开启了定时任务
        timingTaskTime: { not: '' }, //定时任务时间不为空
        email: { not: null }, //邮箱不为空
        wordBookRecords: {
          //some:表示至少有一个
          //createdAt:表示创建时间00:00:00 - 明天的00:00:00
          some: {
            createdAt: {
              gte: dayjs().startOf('day').toDate(),
              lte: dayjs().add(1, 'day').startOf('day').toDate(),
            },
          },
        },
      },
      select: {
        id: true,
        timingTaskTime: true,
        email: true,
      },
    });
    for (const user of userIds) {
      const agent = createAgent({
        model: createDeepSeek(),
        tools: [this.queryTool()],
        systemPrompt:
          '你是一个单词记忆助手，根据用户信息和单词记录，生成单词记忆报告',
      });
      const result = await agent.invoke({
        messages: [
          {
            role: 'user',
            content: `查询用户信息，并且根据用户id关联单词记录表，查询用户今天的单词记录，用户id：${user.id},过滤掉敏感信息`,
          },
        ],
      });
      const content = result.messages.at(-1)?.content;
      if (content) {
        const html = await marked.parse(content as string);
        const [hour, minute, second] = user.timingTaskTime
          .split(':')
          .map(Number);
        const target = dayjs()
          .startOf('day')
          .set('hour', hour)
          .set('minute', minute)
          .set('second', second);
        let delay = target.diff(dayjs());
        if (delay < 0) {
          delay = 0;
        }
        console.log(delay);

        await this.digestQueue.add(
          digestQueueName.task.emailDigest,
          {
            userId: user.id,
            text: html,
            email: user.email,
          },
          {
            delay,
          },
        );
      }
    }
  }
}
