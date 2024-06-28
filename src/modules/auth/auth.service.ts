import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginPayload } from './dto/login.payload';
import { RegisterPayload } from './dto/register.payload';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}

  async validateUser(payload: LoginPayload): Promise<any> {
    const user = await this.usersService.findByEmail(payload.email);
    if (user) {
      const isMatch = await bcrypt.compare(payload.password, user.password);
      if (isMatch) {
        const tokens = await this.getTokens({
          _id: user._id,
          fullName: user.fullName,
        });
        return { tokens };
      }
    }
    throw new UnauthorizedException(
      'Could not authenticate. Please try again.',
    );
  }

  async register(payload: RegisterPayload) {
    return await this.usersService.create(payload);
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

  async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }
}
