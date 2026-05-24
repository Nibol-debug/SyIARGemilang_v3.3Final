import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Terjadi kesalahan database';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[])?.join(', ') || 'field';
        message = `Data dengan ${target} tersebut sudah ada`;
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Data yang dimaksud tidak ditemukan';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Data masih digunakan oleh data lain, tidak dapat dihapus';
        break;
      case 'P2014':
        status = HttpStatus.BAD_REQUEST;
        message = 'Perubahan akan melanggar relasi data yang ada';
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
    });
  }
}
