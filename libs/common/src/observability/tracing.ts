import { NodeSDK, logs as sdkLogs } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { HostMetrics } from '@opentelemetry/host-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

let sdk: NodeSDK | undefined;

export interface ObservabilityOptions {
  /**
   * Port on which the Prometheus `/metrics` endpoint is exposed for this
   * service. Prometheus scrapes it (pull model). Each service needs its own
   * port since they run side by side on the same host in local dev.
   * Defaults to `OTEL_PROMETHEUS_PORT` env, then 9464.
   */
  metricsPort?: number;
}

/**
 * Bootstraps OpenTelemetry for a service. Must run BEFORE any instrumented
 * module (http, pg, amqplib/nestjs-rmq) is required — so each service imports a
 * side-effect `./tracing` file as the very first line of its `main.ts`.
 *
 * Traces (push) — auto-instrumentation gives distributed traces for free: HTTP
 * spans at the gateway, AMQP publish/consume spans (with trace context
 * propagated through RabbitMQ message headers), Postgres query spans, and Nest
 * handler spans. Spans are always created (so logs can be correlated via
 * traceId/spanId even with no collector running); export over OTLP/HTTP is
 * enabled only when `OTEL_EXPORTER_OTLP_ENDPOINT` (or the traces-specific
 * variant) is set, keeping local dev quiet when no collector is up.
 *
 * Metrics (pull) — a Prometheus exporter opens a `/metrics` HTTP endpoint that
 * Prometheus scrapes. The same auto-instrumentations emit request metrics, and
 * `HostMetrics` adds process/system metrics (CPU, memory, event loop) so even
 * the HTTP-less RMQ consumers are observable.
 */
export function initObservability(
  serviceName: string,
  options: ObservabilityOptions = {},
): void {
  if (sdk) return;

  const otlpEndpoint =
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  const metricsPort =
    options.metricsPort ??
    (process.env['OTEL_PROMETHEUS_PORT']
      ? Number(process.env['OTEL_PROMETHEUS_PORT'])
      : 9464);

  // Starts its own HTTP server on `metricsPort` and serves `/metrics`,
  // independent of Nest — so RMQ-only services can expose metrics too.
  const metricReader = new PrometheusExporter({ port: metricsPort });

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    ...(otlpEndpoint ? { traceExporter: new OTLPTraceExporter() } : {}),
    // Logs are pushed over OTLP (to the collector -> Loki). The active trace
    // context is attached automatically, so each log record carries its
    // traceId/spanId. Enabled only when a collector endpoint is configured.
    ...(otlpEndpoint
      ? {
          logRecordProcessors: [
            new sdkLogs.BatchLogRecordProcessor(new OTLPLogExporter()),
          ],
        }
      : {}),
    metricReader,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Filesystem spans are extremely noisy and rarely useful.
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  sdk.start();

  // Uses the global MeterProvider registered by `sdk.start()`.
  new HostMetrics({ name: serviceName }).start();

  const shutdown = () => {
    sdk
      ?.shutdown()
      .catch(() => undefined)
      .finally(() => process.exit(0));
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
