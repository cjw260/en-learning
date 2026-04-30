import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import type { RefreshTokenPayload } from '@en/common/user';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

type AuthenticatedRequest = Request & { user?: RefreshTokenPayload };
//守卫，用于保护路由，只有通过验证的请求才能访问路由
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>(); //获取请求对象
    const headers = request.headers; //获取请求头
    const authorization = headers.authorization;
    if (typeof authorization !== 'string') {
      throw new UnauthorizedException('请先登录'); //401状态码 未授权
    }
    const token = authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('请先登录');
    }
    try {
      const decoded = this.jwtService.verify<RefreshTokenPayload>(token);
      if (decoded.tokenType !== 'access') {
        throw new UnauthorizedException('token已失效');
      }
      request.user = decoded; //存储到自定义属性
      return true;
    } catch (error) {
      throw new UnauthorizedException('token已失效');
    }
  }
}
