import { Injectable } from '@nestjs/common';
//import { Business } from '@en/common/business';
@Injectable()
export class ResponseService {
  success(data: any) {
    return {
      data,
      code: /* Business.SUCCESS.code */ 0,
      message: /* Business.SUCCESS.message */ 'Success',
    };
  }
  error(
    data = null,
    message: string,
    code: number = /* Business.ERROR.code */ -1,
  ) {
    return {
      data,
      code,
      message: message || /* Business.ERROR.message */ 'Error',
    };
  }
}
