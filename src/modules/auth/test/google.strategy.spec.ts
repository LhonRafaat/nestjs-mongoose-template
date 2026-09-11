import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';
import { GoogleStrategy } from '../strategies/google.strategy';
import { EnvConfig } from '../../../config.type';

describe('GoogleStrategy', () => {
  const configService = {
    get: (key: string) => `test-${key}`,
  } as unknown as ConfigService<EnvConfig>;
  const strategy = new GoogleStrategy(configService);

  it('should map the google profile to an oauth user', () => {
    const profile = {
      id: 'google-id',
      displayName: 'John Doe',
      emails: [{ value: 'john@example.com', verified: true }],
      photos: [{ value: 'https://example.com/avatar.png' }],
    } as unknown as Profile;

    expect(strategy.validate('access', 'refresh', profile)).toEqual({
      fullName: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.png',
      oauthProvider: 'google',
      oauthProviderId: 'google-id',
    });
  });

  it('should reject a profile without an email', () => {
    const profile = { id: 'google-id', displayName: 'John' } as Profile;

    expect(() => strategy.validate('access', 'refresh', profile)).toThrow(
      UnauthorizedException,
    );
  });
});
