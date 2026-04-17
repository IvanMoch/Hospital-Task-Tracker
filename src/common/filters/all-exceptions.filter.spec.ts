import { ArgumentsHost, BadRequestException, ConflictException } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

const createHost = () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const response = { status, json };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  } as ArgumentsHost;

  return { host, status, json };
};

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  it('should serialize HttpException responses', () => {
    const { host, status, json } = createHost();

    filter.catch(new BadRequestException('Invalid payload'), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Invalid payload',
      error: 'Bad Request',
    });
  });

  it('should preserve explicit error payloads from HttpException', () => {
    const { host, json } = createHost();

    filter.catch(new ConflictException({ message: ['Duplicated code'], error: 'Conflict' }), host);

    expect(json).toHaveBeenCalledWith({
      statusCode: 409,
      message: ['Duplicated code'],
      error: 'Conflict',
    });
  });

  it('should map known Prisma errors', () => {
    const { host, json } = createHost();

    filter.catch({ code: 'P2002' }, host);

    expect(json).toHaveBeenCalledWith({
      statusCode: 409,
      message: 'A record with that value already exists',
      error: 'Conflict',
    });
  });

  it('should hide internal error details in production', () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const { host, json } = createHost();

    filter.catch(new Error('database exploded'), host);

    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal Server Error',
      error: 'Internal Server Error',
    });
    process.env.NODE_ENV = previous;
  });

  it('should return a generic payload for unknown exceptions', () => {
    const { host, json } = createHost();

    filter.catch('unexpected-string', host);

    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  });
});
