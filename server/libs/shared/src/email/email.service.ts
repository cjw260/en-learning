import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer'; //引入邮件服务的库
import { ConfigService } from '@nestjs/config'; //读取环境变量
@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter | null = null; //声明一个变量用于存储邮件服务
  constructor(private readonly configService: ConfigService) {}
  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: Number(this.configService.get<string>('EMAIL_PORT')),
      secure: !!Number(this.configService.get<string>('EMAIL_USE_SSL')),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }
  async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.transporter?.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to,
        subject,
        html: text,
      });
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
