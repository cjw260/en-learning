const data = [
  {
    name: '高考单词',
    value: 'gk',
    description: '覆盖高考大纲核心词汇，按考频与题型分类，助力考前冲刺提分。',
    teacher: '小余同学',
    url: '',
    price: 100,
  },
  {
    name: '中考单词',
    value: 'zk',
    description: '紧扣中考考纲，初中三年词汇一站式掌握，打好英语基础。',
    teacher: '小满zs',
    url: '',
    price: 35,
  },
  {
    name: 'GRE单词',
    value: 'gre',
    description: 'GRE 核心词汇与同反义词拓展，适合留学备考与高阶阅读。',
    teacher: '初心哥',
    url: '',
    price: 80,
  },
  {
    name: '托福词汇',
    value: 'toefl',
    description: '托福听说读写高频词 + 学术场景词汇，提升备考效率。',
    teacher: '枫竹',
    url: '',
    price: 80000,
  },
  {
    name: '雅思词汇',
    value: 'ielts',
    description: '雅思考试常考词汇与同义替换，兼顾移民与留学需求。',
    teacher: 'ouka',
    url: '',
    price: 7000,
  },
  {
    name: '大学英语六级单词',
    value: 'cet6',
    description: '六级大纲词汇与真题高频词，配合阅读与写作场景记忆。',
    teacher: '章政',
    url: '',
    price: 5,
  },
  {
    name: '大学英语四级单词',
    value: 'cet4',
    description: '四级核心词汇与考点搭配，适合在校生系统备考。',
    teacher: '小余同学',
    url: '',
    price: 8,
  },
  {
    name: '考研单词',
    value: 'ky',
    description: '考研英语一/二通用词汇，结合真题与长难句场景记忆。',
    teacher: '远方',
    url: '',
    price: 9.99,
  },
];
import * as Minio from 'minio';
import dotenv from 'dotenv';
import { PrismaClient } from '../libs/shared/src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'node:fs';
dotenv.config();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
  });
  await prisma.$connect();
  //创建bucket
  const minio = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    port: Number(process.env.MINIO_PORT),
    useSSL: !!Number(process.env.MINIO_USE_SSL!),
    accessKey: process.env.MINIO_ACCESS_KEY!,
    secretKey: process.env.MINIO_SECRET_KEY!,
  });
  const bucket = 'course';
  const exists = await minio.bucketExists(bucket);
  if (!exists) {
    await minio.makeBucket(bucket);
    await minio.setBucketPolicy(
      bucket,
      JSON.stringify({
        Version: '2012-10-17', //策略语言版本版本 类似于http版本 例如http1.1 http2.0 这个值固定即可
        Statement: [
          {
            Sid: 'CourseReadObjects', //给这个规则起一个名字
            Effect: 'Allow', //允许打开这个规则 Allow 允许 Deny 拒绝
            Principal: '*', //所有人
            Action: ['s3:GetObject'], //允许浏览器获取对象
            Resource: ['arn:aws:s3:::course/*'], //允许读取 course桶内的所有资源
          },
        ],
      }),
    );
  }
  for (const item of data) {
    const file = fs.readFileSync(`./prisma/assets/${item.value}.png`);
    await minio.putObject(bucket, `${item.value}.png`, file, file.length, {
      'Content-Type': 'image/png',
    });
    await prisma.course.create({
      data: {
        name: item.name,
        value: item.value,
        description: item.description,
        teacher: item.teacher,
        url: `/course/${item.value}.png`,
        price: item.price,
      },
    });
    console.log(`${item.value}.png 上传成功`);
  }
  await prisma.$disconnect();
}

main();
