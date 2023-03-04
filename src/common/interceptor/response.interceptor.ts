import {
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Injectable,
} from '@nestjs/common';
import {map} from 'rxjs/operators';
import {RCode} from '../constant/rcode';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): import('rxjs').Observable<any> | Promise<import('rxjs').Observable<any>> {
        return next.handle().pipe(
            map(content => {
                console.log(content)
                let data = {};
                let code = RCode.OK;
                let msg = null;
                if (content) {
                    data = content.data || {};
                    code = content.code || RCode.OK;
                    msg = content.msg || null;
                }
                return {data: data, code: code, msg: msg}
            }),
        );
    }
}