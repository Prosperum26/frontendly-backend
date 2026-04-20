/* eslint-disable import/no-extraneous-dependencies */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Quick sugar for req.user
 * Using this decorator, user can be easily accessed without injecting the
 * request object
 */
export const ReqUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<Request>();
    return req.user;
  },
);
