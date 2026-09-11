import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimiter from 'express-rate-limit';
import { AllExceptionsFilter } from './common/helper/global-error-handler';
import metadata from './metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter()); // handle internal server errors

  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  // validates every @Body/@Query/@Param that declares a `schema` (see the zod schemas in dto folders)
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Example Api')
    .setDescription('A documentation from example api')
    .setVersion('1.0')
    .build();
  app.use(helmet());
  app.use(cookieParser());
  app.use(
    rateLimiter({
      windowMs: 60 * 1000, // 1 minute
      limit: 50, // limit each IP to 50 requests per windowMs
    }),
  );
  await SwaggerModule.loadPluginMetadata(metadata);

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(configService.get('PORT'), '0.0.0.0');
  console.log(`Application running at ${await app.getUrl()}`);
}
bootstrap();
