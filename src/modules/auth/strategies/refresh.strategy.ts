import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { EnvConfig } from '../../../config.type';
import { IRequest } from '../../../common/helper/common-types';

/**
 * Jwt Strategy Class
 */
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    readonly configService: ConfigService<EnvConfig>,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        RefreshStrategy.extractFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('REFRESH_SECRET'),
    });
  }

  private static extractFromCookie(req: IRequest): string | null {
    return req?.cookies?.access_token || null;
  }

  async validate({ iat, exp, _id }, done): Promise<boolean> {
    const timeDiff = exp - iat;
    if (timeDiff <= 0) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne(_id);
    if (!user) {
      throw new UnauthorizedException();
    }

    done(null, user);

    return true;
  }
}
