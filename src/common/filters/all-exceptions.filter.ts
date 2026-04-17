import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

type ErrorPayload = {
  statusCode: number;
  message: string | string[];
  error: string;
};

const PRISMA_ERROR_MAP: Record<string, { status: number; message: string; error: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: 'A record with that value already exists', error: 'Conflict' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Record not found', error: 'Not Found' },
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const payload = this.buildPayload(exception);
    res.status(payload.statusCode).json(payload);
  }

  private buildPayload(exception: unknown): ErrorPayload {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return {
          statusCode: status,
          message: response,
          error: this.statusToText(status),
        };
      }

      const body = response as {
        message?: string | string[];
        error?: string;
      };
      return {
        statusCode: status,
        message: body.message ?? exception.message,
        error: body.error ?? this.statusToText(status),
      };
    }

    if (this.isPrismaError(exception)) {
      const mapped = PRISMA_ERROR_MAP[exception.code];
      if (mapped) {
        return { statusCode: mapped.status, message: mapped.message, error: mapped.error };
      }
    }

    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      const isProd = process.env.NODE_ENV === 'production';
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: isProd ? 'Internal Server Error' : exception.message,
        error: 'Internal Server Error',
      };
    }

    this.logger.error('Unknown exception', exception);
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private isPrismaError(exception: unknown): exception is { code: string } {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      typeof (exception as { code: unknown }).code === 'string'
    );
  }

  private statusToText(status: number): string {
    const raw = HttpStatus[status];
    if (typeof raw !== 'string') return 'Error';
    return raw
      .toLowerCase()
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}
