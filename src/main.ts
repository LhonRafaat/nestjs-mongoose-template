import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimiter from 'express-rate-limit';
import { AllExceptionsFilter } from './common/helper/global-error-handler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter()); // handle internal server errors

  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // set to true to throw an error if extra fields were sent by client
      forbidNonWhitelisted: true, // use with whitelist
      disableErrorMessages: false, // set to true if you do not want to send detailed error messages back to client
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Example Api')
    .setDescription('A documentation from example api')
    .setVersion('1.0')
    .build();
  app.use(helmet());
  app.use(
    rateLimiter({
      windowMs: 60, // 1 minutes
      max: 50, // limit each IP to 100 requests per windowMs
    }),
  );
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(configService.get('PORT'), '0.0.0.0');
  console.log(`Application running at ${await app.getUrl()}`);
}
bootstrap();
