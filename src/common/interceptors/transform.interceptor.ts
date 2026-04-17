import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { SKIP_TRANSFORM_KEY } from '../decorators/skip-transform.decorator';

export interface ApiResponse<T> {
  data: T;
  message: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    ctx: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const skipTransform =
      this.reflector.get<boolean>(SKIP_TRANSFORM_KEY, ctx.getHandler()) ?? false;
    if (skipTransform) {
      return next.handle() as Observable<ApiResponse<T>>;
    }

    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, ctx.getHandler()) ?? '';
    return next.handle().pipe(map((data) => ({ data, message })));
  }
}
