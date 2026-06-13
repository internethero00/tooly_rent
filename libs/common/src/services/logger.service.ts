import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

const SEVERITY: Record<LogLevel, SeverityNumber> = {
  log: SeverityNumber.INFO,
  error: SeverityNumber.ERROR,
  warn: SeverityNumber.WARN,
  debug: SeverityNumber.DEBUG,
  verbose: SeverityNumber.TRACE,
};

/**
 * Structured (JSON-per-line) logger with automatic trace correlation.
 *
 * Every entry carries the active OpenTelemetry `traceId`/`spanId` (when a span
 * is in context), so logs can be tied back to a distributed trace. The legacy
 * `requestId` is kept for correlation across the HTTP edge until traces fully
 * cover every hop. Method signatures are unchanged, so existing call sites keep
 * working — only the output format moved from a `[ts][rid][ctx]` string to JSON.
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(private readonly context: string) {}

  private write(
    level: LogLevel,
    message: string,
    requestId?: string,
    stack?: string,
  ) {
    const spanContext = trace.getActiveSpan()?.spanContext();

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      requestId: requestId ?? 'system',
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
      ...(stack ? { stack } : {}),
    };

    const line = JSON.stringify(entry);

    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }

    // Also emit through the OpenTelemetry Logs API. The active trace context is
    // attached automatically, so the record is correlated with its trace in
    // Loki/Grafana. No-op when no LoggerProvider is registered (e.g. no
    // collector configured), so console output above always stands on its own.
    logs.getLogger('tooly-rent').emit({
      severityNumber: SEVERITY[level],
      severityText: level.toUpperCase(),
      body: message,
      attributes: {
        context: this.context,
        requestId: requestId ?? 'system',
        ...(stack ? { stack } : {}),
      },
    });
  }

  log(message: string, requestId?: string) {
    this.write('log', message, requestId);
  }

  error(message: string, stack?: string, requestId?: string) {
    this.write('error', message, requestId, stack);
  }

  warn(message: string, requestId?: string) {
    this.write('warn', message, requestId);
  }

  debug(message: string, requestId?: string) {
    this.write('debug', message, requestId);
  }

  verbose(message: string, requestId?: string) {
    this.write('verbose', message, requestId);
  }
}
