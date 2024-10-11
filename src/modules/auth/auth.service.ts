import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginPayload } from './dto/login.payload';
import { RegisterPayload } from './dto/register.payload';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config.type';
import { TAuthResponse } from './types/auth.response';
import { IRequest } from '../../common/helper/common-types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}

  async validateUser(payload: LoginPayload): Promise<TAuthResponse> {
    const user = await this.usersService.findByEmail(payload.email);
    if (user) {
      const isMatch = await bcrypt.compare(payload.password, user.password);
      if (isMatch) {
        const tokens = await this.getTokens({
          _id: user._id,
          fullName: user.fullName,
        });

        await this.updateRefreshToken(user._id, tokens.refreshToken);
        return tokens;
      }
    }
    throw new UnauthorizedException(
      'Could not authenticate. Please try again.',
    );
  }

  async register(payload: RegisterPayload): Promise<TAuthResponse> {
    const user = await this.usersService.create(payload);

    const tokens = await this.getTokens({
      _id: user._id,
      fullName: user.fullName,
    });

    await this.updateRefreshToken(user._id, tokens.refreshToken);

    return tokens;
  }

  async handleGoogleCallback(req: IRequest): Promise<TAuthResponse> {
    let user = await this.usersService.findByEmail(req.user.email);

    if (!user) {
      user = await this.usersService.createWithProvider(
        req.user as Omit<RegisterPayload, 'password' | 'isAdmin'> & {
          oauthProvider: string;
          oauthProviderId: string;
        },
      );
    }

    const tokens = await this.getTokens({
      _id: user._id,
      fullName: user.fullName,
    });

    await this.updateRefreshToken(user._id, tokens.refreshToken);
    return tokens;
  }

  async getTokens(payload: { _id: string; fullName: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('ACCESS_SECRET'),
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('REFRESH_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    return await this.usersService.updateRefreshToken(id, hashedRefreshToken);
  }

  async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }

  async refreshTokens(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Access Denied');

    const tokens = await this.getTokens({
      _id: user._id,
      fullName: user.fullName,
    });
    await this.updateRefreshToken(user._id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    return await this.usersService.updateRefreshToken(userId, null);
  }
}
