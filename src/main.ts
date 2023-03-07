import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { init } from './main.base';
import {ResponseInterceptor} from "./common/interceptor/response.interceptor";
import {HttpExceptionFilter} from "./common/filters/http-exception.filter";
import {logger} from "./common/middleware/logger.middleware";
import {NestExpressApplication} from "@nestjs/platform-express";
import * as hbs from 'hbs';
const path = require('path');
let setting = require('./common/config/setting.json');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 全局中间件
  app.use(logger);

  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 配置全局拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 配置静态资源
  app.useStaticAssets(path.join(__dirname, '..', 'public'),{
    prefix: "/static/",
    setHeaders: res => {
      res.set('Cache-Control', 'max-age=2592000')
    }
  });

  app.setBaseViewsDir(path.join(__dirname, '..', 'views')); // 这是配置基于模板引擎存放的模板文件

  app.setViewEngine('hbs'); // 这是设置模板引擎, 我们可以选择我们熟悉的ejs

  hbs.registerPartials(path.join(__dirname, '..', 'views/components'));

  await app.listen(setting['port']);

  // @ts-ignore
  if (module.hot) {
    // @ts-ignore
    module.hot.accept();
    // @ts-ignore
    module.hot.dispose(() => app.close());
  }

  init();
}
bootstrap();

