import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { SKIP_TRANSFORM_KEY } from '../decorators/skip-transform.decorator';

describe('TransformInterceptor', () => {
  const createContext = () => ({ getHandler: () => 'handler' } as unknown as ExecutionContext);
  const createNext = <T>(value: T) => ({ handle: () => of(value) }) as CallHandler<T>;

  it('should wrap responses with data and message', async () => {
    const reflector = {
      get: jest.fn((key: string) => (key === RESPONSE_MESSAGE_KEY ? 'ok' : false)),
    } as unknown as Reflector;
    const interceptor = new TransformInterceptor(reflector);

    const result = await lastValueFrom(interceptor.intercept(createContext(), createNext({ id: 1 })));

    expect(result).toEqual({ data: { id: 1 }, message: 'ok' });
  });

  it('should bypass wrapping when skip metadata is set', async () => {
    const reflector = {
      get: jest.fn((key: string) => key === SKIP_TRANSFORM_KEY),
    } as unknown as Reflector;
    const interceptor = new TransformInterceptor(reflector);

    const result = await lastValueFrom(interceptor.intercept(createContext(), createNext({ status: 'ok' })));

    expect(result).toEqual({ status: 'ok' });
  });
});
