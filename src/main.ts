import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // set to true to throw an error if extra fields were sent by client
      forbidNonWhitelisted: true, // use with whitelist
      disableErrorMessages: true, // use this for production if you do not want to send detailed error messages back to client
    }),
  );
  await app.listen(3000);
}
bootstrap();
