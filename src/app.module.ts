import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { FilterationMiddleware } from './common/helper/filteration-middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { CaslModule } from './modules/casl/casl.module';
import { EnvConfig } from './config.type';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //we use the global config so it does not required to import in every module we use

      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DB_URL: Joi.string().required(),
        ACCESS_SECRET: Joi.string().required(),
        REFRESH_SECRET: Joi.string().required(),
        ACCESS_TOKEN_EXPIRATION: Joi.string().required(),
        REFRESH_TOKEN_EXPIRATION: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService<EnvConfig>],
      useFactory: (configService: ConfigService<EnvConfig>) => ({
        uri: configService.get('DB_URL'),
      }),
    }),

    UsersModule,
    AuthModule,
    CaslModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FilterationMiddleware).forRoutes('*');
  }
}
