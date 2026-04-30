import type { TokenPayload } from '@en/common/user';

declare module 'express' {
  interface Request {
    user: TokenPayload;
  }
}
