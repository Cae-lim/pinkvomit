import pino from 'pino';
import { User, DecodedJWT, Blog, SummaryBlog } from '../../types.ts';

declare global {
  namespace Express {
    interface Request {
      user?: User | null,
      token?: DecodedJWT | null,
      authed?: boolean,
      blogs?: SummaryBlog[],
      selectedBlog?: SummaryBlog | null,
      logger: pino.Logger,
      requestId: string
      startTime: number
    };
    interface Locals {
      nonce: string
    };
  }
}
