import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllexceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllexceptionsFilter)

  await app.listen(8000);
}
bootstrap();
