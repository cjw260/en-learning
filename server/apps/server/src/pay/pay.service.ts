import { Injectable } from '@nestjs/common';
import type { CreatePayDto } from '@en/common/pay';
import type { TokenPayload } from '@en/common/user';
import {
  PrismaService,
  PayService as SharedPayService,
  ResponseService,
} from '@libs/shared';
import * as nanoid from 'nanoid';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { TradeStatus } from '@libs/shared/generated/prisma/enums';
import { SocketGateway } from '../socket/socket.gateway';
@Injectable()
export class PayService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedPayService: SharedPayService,
    private readonly responseService: ResponseService,
    private readonly configService: ConfigService,
    private readonly socketGateway: SocketGateway,
  ) {}
  private createTradeNo() {
    const prifix = 'CJW'; //订单前缀
    return `${prifix}-${nanoid.nanoid(12)}`;
  }
  async create(createPayDto: CreatePayDto, user: TokenPayload) {
    //购买过的课程不能重复购买
    const courseRecord = await this.prismaService.courseRecord.findFirst({
      where: {
        courseId: createPayDto.courseId,
        userId: user.userId,
      },
    });
    if (courseRecord) {
      return this.responseService.error(null, '课程已购买');
    }
    const result = await this.prismaService.$transaction(async (tx) => {
      //创建订单表 但是状态还是未支付
      const outTradeNo = this.createTradeNo();
      await tx.paymentRecord.create({
        data: {
          userId: user.userId, //用户id
          outTradeNo: outTradeNo, //订单编号
          amount: createPayDto.total_amount,
          subject: createPayDto.subject,
          body: createPayDto.body,
        },
      });
      //支付宝sdk
      const dataTime = dayjs().add(1, 'minute'); //当前时间加1分钟
      const payUrl = this.sharedPayService
        .getAlipaySdk()
        .pageExecute('alipay.trade.page.pay', 'GET', {
          bizContent: {
            out_trade_no: outTradeNo, //订单编号
            total_amount: createPayDto.total_amount, //订单金额
            subject: createPayDto.subject, //订单标题
            body: JSON.stringify({
              courseId: createPayDto.courseId, //课程id
              userId: user.userId, //用户id
            }), //订单描述
            product_code: 'FAST_INSTANT_TRADE_PAY', //产品编码
            time_expire: dataTime.format('YYYY-MM-DD HH:mm:ss'), //订单过期时间
          },
          notify_url: `${this.configService.get<string>('ALIPAY_NOTIFY_URL')!}/api/v1/pay/notify`, //异步通知地址
        });
      return {
        payUrl,
        timeExpire: dataTime.toDate().getTime(),
      };
    });
    return this.responseService.success(result);
  }
  async notify(req: Request) {
    await this.prismaService.$transaction(async (tx) => {
      //更新支付库 支付时间+支付状态+支付流水号
      const paymentRecord = await tx.paymentRecord.update({
        where: {
          outTradeNo: req.body.out_trade_no,
        },
        data: {
          tradeNo: req.body.trade_no, //支付流水号
          tradeStatus: TradeStatus.TRADE_SUCCESS, //交易状态
          sendPayTime: dayjs(req.body.gmt_payment).toDate(), //支付时间
        },
      });
      //创建我的课程
      const body = JSON.parse(req.body.body) as {
        courseId: string;
        userId: string;
      };
      await tx.courseRecord.create({
        data: {
          courseId: body.courseId, //课程id
          userId: body.userId, //用户id
          isPurchased: true, //是否购买
          paymentRecordId: paymentRecord.id, //支付订单id
        },
      });
      //通知前端socket
      this.socketGateway.emitPaymentSuccess(body.userId);
    });
    return true;
  }
}
