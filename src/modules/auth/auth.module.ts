import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { EnvConfig } from '../../config.type';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshStrategy,
    {
      // Google login is optional, the strategy is only registered when all of its variables are set
      provide: GoogleStrategy,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfig>) => {
        const configured = (
          [
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'GOOGLE_CALLBACK_URL',
          ] as const
        ).every((key) => configService.get(key));

        if (!configured) {
          new Logger(AuthModule.name).warn(
            'Google login is disabled, set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_CALLBACK_URL to enable it',
          );
          return null;
        }

        return new GoogleStrategy(configService);
      },
    },
  ],
  controllers: [AuthController],
  exports: [PassportModule],
})
export class AuthModule {}
