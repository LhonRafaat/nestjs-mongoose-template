import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../../config.type';
import { OAuthRegisterPayload } from '../dto/oauth-register-payload';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(readonly configService: ConfigService<EnvConfig>) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  // called with (accessToken, refreshToken, profile), the returned value becomes req.user
  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): OAuthRegisterPayload {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Your Google account has no email');
    }

    return {
      fullName: profile.displayName,
      email,
      avatar: profile.photos?.[0]?.value,
      oauthProvider: 'google',
      oauthProviderId: profile.id,
    };
  }
}
