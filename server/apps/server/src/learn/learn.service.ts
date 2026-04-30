import { Injectable } from '@nestjs/common';
import { CreateLearnDto } from './dto/create-learn.dto';
import { UpdateLearnDto } from './dto/update-learn.dto';
import { PrismaService, ResponseService } from '@libs/shared';

@Injectable()
export class LearnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) {}
  //读取单词列表
  async getWordList(id: string, userId: string) {
    //查询课程
    const courseRecord = await this.prisma.courseRecord.findFirst({
      where: {
        userId: userId,
        courseId: id,
        isPurchased: true,
      },
      include: {
        course: true,
      },
    });
    if (!courseRecord) {
      return this.response.error(null, '课程未购买');
    }
    const courseType = courseRecord.course.value;
    const words = await this.prisma.wordBook.findMany({
      where: {
        [courseType]: true,
        //掌握的单词不能被查出来
        wordBookRecords: {
          none: {
            userId: userId,
          },
        },
      },
      skip: 0, //跳过多少条
      take: 10, //取多少条
      orderBy: {
        frq: 'desc', //按频率排序
      },
    });
    return this.response.success(words);
  }
  //保存单词到wordBookRecord
  async saveWordMaster(wordIds: string[], userId: string) {
    const wordBookRecords = wordIds.map((wordId) => ({
      wordId,
      userId,
      isMaster: true,
    }));
    await this.prisma.wordBookRecord.createMany({
      data: wordBookRecords,
    });
    //更新用户学习单词的数量
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        wordNumber: {
          increment: wordIds.length,
        },
      },
    });
    return this.response.success({
      wordNumber: user.wordNumber,
    });
  }
}
