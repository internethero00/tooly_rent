// Side-effect import: must be the FIRST import in main.ts so OpenTelemetry
// instrumentation is registered before http / pg / amqplib are required.
//
// We load the env file here (not just in main.ts) because this runs before
// main.ts's own dotenv.config — initObservability needs OTEL_* vars now.
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), 'envs', '.api-gateway.env') });

import { initObservability } from '@tooly-rent/observability';

initObservability('tooly_rent-api', { metricsPort: 9464 });
