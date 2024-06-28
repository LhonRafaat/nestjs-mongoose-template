import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LoginPayload } from './dto/login.payload';
import { AuthService } from './auth.service';
import { RegisterPayload } from './dto/register.payload';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TAuthResponse } from './types/auth.response';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from '../../common/helper/common-types';
import { AccessTokenGuard } from '../../common/guards/jwt.guard';
import { RefreshTokenGuard } from '../../common/guards/refresh.guard';

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({
    type: TAuthResponse,
  })
  async login(@Body() payload: LoginPayload) {
    return await this.authService.validateUser(payload);
  }

  @Post('register')
  @ApiOkResponse({
    type: TAuthResponse,
  })
  async register(@Body() payload: RegisterPayload) {
    return await this.authService.register(payload);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@Req() req: IRequest) {
    await this.authService.logout(req.user._id);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshToken(@Req() req: IRequest) {
    return await this.authService.refreshTokens(req.user._id);
  }
}
