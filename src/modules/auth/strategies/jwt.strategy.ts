import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { EnvConfig } from '../../../config.type';
import { IRequest } from '../../../common/helper/common-types';
import { TUser } from '../../users/user.model';

/**
 * Jwt Strategy Class
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    readonly configService: ConfigService<EnvConfig>,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtStrategy.extractFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('ACCESS_SECRET'),
    });
  }

  private static extractFromCookie(req: IRequest): string | null {
    return req?.cookies?.access_token || null;
  }

  // the returned user becomes req.user
  async validate({
    iat,
    exp,
    _id,
  }: {
    iat: number;
    exp: number;
    _id: string;
  }): Promise<TUser> {
    const timeDiff = exp - iat;
    if (timeDiff <= 0) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne(_id);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
