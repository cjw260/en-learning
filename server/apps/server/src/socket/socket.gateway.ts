import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;
  //连接成功后会自动进入这个钩子会传入一个socket对象
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      //加判断 因为热更新的时候有时候没有id
      client.join(`user_${userId}`); //加入房间
    }
  }
  //支付成功后通知前端
  emitPaymentSuccess(userId: string) {
    //通知房间内的用户触发事件
    this.server.to(`user_${userId}`).emit('paymentSuccess', userId);
  }
}
