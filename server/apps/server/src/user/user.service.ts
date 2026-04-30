import { Injectable } from '@nestjs/common';
import type {
  UserLogin,
  UserRegister,
  Token,
  RefreshTokenPayload,
  UserUpdate,
} from '@en/common/user';
import { PrismaService, ResponseService } from '@libs/shared';
import type { Prisma } from '@libs/shared/generated/prisma/client';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { userSelect, updateUserSelect } from './user.select';
import { MinioService } from '@libs/shared/minio/minio.service';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
  ) {}
  //登录
  async login(createUserDto: UserLogin) {
    //phone password
    //1. 检查是手机号是否存在
    const user = await this.prisma.user.findUnique({
      where: {
        phone: createUserDto.phone, //查询手机号
      },
    });
    if (!user) {
      return this.responseService.error(null, '手机号不存在');
    }
    //2. 检查密码是否正确
    if (user.password !== createUserDto.password) {
      return this.responseService.error(null, '密码不正确');
    }
    //3. 查询用户信息 更新最后登录时间
    const updateUser = await this.prisma.user.update({
      where: {
        id: user.id, //查询用户ID
      },
      data: {
        lastLoginAt: new Date(), //最后登录时间
      },
      select: userSelect,
    });
    //4. 生成token {userId,name,email}
    const token = this.authService.generateToken({
      userId: updateUser.id,
      name: updateUser.name,
      email: updateUser.email,
    });
    return this.responseService.success({ ...updateUser, token });
  }
  //注册 Primsa他所有的API都是异步的
  async register(createUserDto: UserRegister) {
    const data: Prisma.UserCreateInput = {
      name: createUserDto.name,
      phone: createUserDto.phone,
      password: createUserDto.password,
      lastLoginAt: new Date(), //最后登录时间
    };
    //name email? phone password
    //1. 如果手机号已经存在则返回错误
    //findUnique 返回单个数据 也就是返回一个对象 findUnique 他只能查询数据是唯一的 并且返回单个数据
    const user = await this.prisma.user.findUnique({
      where: {
        phone: createUserDto.phone, //查询手机号
      },
    });
    if (user) {
      return this.responseService.error(null, '手机号已经存在');
    }
    //2. 判断一下邮箱如果他传入了 并且存在了也不行的说明重复了
    if (createUserDto.email) {
      const emailUser = await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email, //查询邮箱
        },
      });
      if (emailUser) {
        return this.responseService.error(null, '邮箱已经存在');
      }
      data.email = createUserDto.email;
    }
    //3. 创建用户 默认他是把所有的值全部返回包括密码 排除掉密码
    const newUser = await this.prisma.user.create({
      data,
      select: userSelect,
    });
    //4. 生成token {userId,name,email}
    const token = this.authService.generateToken({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
    return this.responseService.success({ ...newUser, token });
  }
  //刷新token
  async refreshToken(createUserDto: Omit<Token, 'accessToken'>) {
    //1. 验证refreshToken是否有效 verify检查token是否有效 并且返回解码后的数据 sign生成token
    try {
      const decoded = this.jwtService.verify<RefreshTokenPayload>(
        createUserDto.refreshToken,
      );
      //2.为什么增加这么一个判断 accessToken 冒充refreshToken 进行攻击
      if (decoded.tokenType !== 'refresh') {
        return this.responseService.error(null, 'refreshToken已过期或无效');
      }
      const user = await this.prisma.user.findUnique({
        where: {
          id: decoded.userId, //查询用户ID
        },
      });
      //3.如果查不出来说明userId是伪造的
      if (!user) {
        return this.responseService.error(null, '用户不存在');
      }
      const token = this.authService.generateToken({
        userId: user.id,
        name: user.name,
        email: user.email,
      });
      return this.responseService.success(token);
    } catch (error) {
      return this.responseService.error(null, 'refreshToken已过期或无效');
    }
  }
  //上传头像
  async uploadAvatar(file: Express.Multer.File) {
    if (!file) {
      return this.responseService.error(null, '文件不存在');
    }
    if (file.size > 1024 * 1024 * 5) {
      return this.responseService.error(null, '文件大小不能超过5MB');
    }
    //获取minio客户端
    const client = this.minioService.getClient();
    //获取bucket桶名
    const bucket = this.minioService.getBucket();
    //资源的名称
    const fileName = `${Date.now()}-${file.originalname}`;
    //上传资源到minio
    await client.putObject(bucket, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    //返回文件url
    const isHttps = !!Number(this.configService.get('MINIO_USE_SSL')); //是否启用SSL
    const baseUrl = isHttps ? 'https' : 'http'; //前缀http
    const port = this.configService.get<string>('MINIO_PORT')!; //端口9000
    const databaseUrl = `/${bucket}/${fileName}`; //数据库url /avatar/1234567890-xiaomansdas.jpg
    const previewUrl = `${baseUrl}://${this.configService.get('MINIO_ENDPOINT')}:${port}${databaseUrl}`;
    //previewUrl->http://192.168.2.100:9000/avatar/1234567890-xiaomansdas.jpg
    //databaseUrl->/avatar/1234567890-xiaomansdas.jpg
    return this.responseService.success({
      previewUrl,
      databaseUrl,
    });
  }
  //更新用户信息
  async updateUser(createUserDto: UserUpdate, user: Request['user']) {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.userId,
      },
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        address: createUserDto.address,
        avatar: createUserDto.avatar,
        bio: createUserDto.bio,
        isTimingTask: createUserDto.isTimingTask,
        timingTaskTime: createUserDto.timingTaskTime,
      },
      select: updateUserSelect,
    });
    return this.responseService.success(updatedUser);
  }
}
