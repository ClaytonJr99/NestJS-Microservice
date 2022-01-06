import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllexceptionsFilter } from './common/filters/http-exception.filter';
import * as momentTimezone from 'moment-timezone'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllexceptionsFilter)

  Date.prototype.toJSON = function(): any {
    return momentTimezone(this)
    .tz('America/Sao_Paulo')
    .format('YYY-MM-DDD HH:mm:ss.SSS')
  }

  await app.listen(8000);
}
bootstrap();
