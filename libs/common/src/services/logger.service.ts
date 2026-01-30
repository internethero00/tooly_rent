import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(requestId: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}][${requestId}][${this.context}] ${message}`;
  }

  log(message: string, requestId?: string) {
    console.log(this.formatMessage(requestId || 'system', message));
  }

  error(message: string, trace?: string, requestId?: string) {
    console.error(this.formatMessage(requestId || 'system', message));
    if (trace) console.error(trace);
  }

  warn(message: string, requestId?: string) {
    console.warn(this.formatMessage(requestId || 'system', message));
  }

  debug(message: string, requestId?: string) {
    console.debug(this.formatMessage(requestId || 'system', message));
  }

  verbose(message: string, requestId?: string) {
    console.log(this.formatMessage(requestId || 'system', message));
  }
}
