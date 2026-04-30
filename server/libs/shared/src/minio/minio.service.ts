import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config'; //操作环境变量
@Injectable()
export class MinioService implements OnModuleInit {
  private readonly minioClient: Minio.Client; //Minio客户端
  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT')!,
      port: Number(this.configService.get<number>('MINIO_PORT')),
      useSSL: !!Number(this.configService.get<boolean>('MINIO_USE_SSL')),
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY')!,
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY')!,
    });
  }
  //Nestjs的生命周期钩子函数，在模块初始化时调用
  async onModuleInit() {
    //读取bucket
    const bucket = this.configService.get<string>('MINIO_BUCKET')!;
    //判断bucket是否存在
    const exists = await this.minioClient.bucketExists(bucket);
    //如果不存在
    if (!exists) {
      //创建bucket
      await this.minioClient.makeBucket(bucket);
      await this.minioClient.setBucketPolicy(
        bucket,
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicReadGetObject', //给规则起个名字
              Effect: 'Allow', //允许打开这个规则
              Principal: '*', //所有人
              Action: ['s3:GetObject'], //允许的操作
              Resource: [`arn:aws:s3:::avatar/*`],
            },
          ],
        }),
      );
    }
  }
  getClient() {
    return this.minioClient;
  }
  getBucket() {
    return this.configService.get<string>('MINIO_BUCKET')!;
  }
}
