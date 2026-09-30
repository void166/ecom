import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request & { id?: string }>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : null;
    const details = typeof body === 'object' && body !== null ? body : undefined;
    const message = typeof body === 'string' ? body : (details as { message?: string | string[] } | undefined)?.message ?? 'Unexpected server error';
    response.status(status).json({
      error: {
        code: exception instanceof HttpException ? exception.name.replace(/Exception$/, '').toUpperCase() : 'INTERNAL_ERROR',
        message: Array.isArray(message) ? 'Validation failed' : message,
        ...(Array.isArray(message) ? { details: { violations: message } } : {}),
        requestId: request.id,
      },
    });
  }
}
