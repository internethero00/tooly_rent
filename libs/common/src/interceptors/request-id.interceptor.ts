import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class RequestIdInterceptor  implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();

    const requestId = req.headers['x-request-id'] || uuidv4();
    req.requestId = requestId;

    const response = context.switchToHttp().getResponse();
    response.setHeader('x-request-id', requestId);

    return next.handle();
  }
}
