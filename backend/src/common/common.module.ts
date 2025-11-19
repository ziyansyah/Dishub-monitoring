import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';

@Module({
  providers: [
    HttpExceptionFilter,
    LoggingInterceptor,
    TransformInterceptor,
  ],
  exports: [
    HttpExceptionFilter,
    LoggingInterceptor,
    TransformInterceptor,
  ],
})
export class CommonModule {}