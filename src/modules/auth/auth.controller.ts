import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginPayload } from './dto/login.payload';
import { AuthService } from './auth.service';
import { RegisterPayload } from './dto/register.payload';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TAuthResponse } from './types/auth.response';
import { IRequest } from '../../common/helper/common-types';
import { AccessTokenGuard } from '../../common/guards/jwt.guard';
import { RefreshTokenGuard } from '../../common/guards/refresh.guard';
import { GoogleAuthGuard } from '../../common/guards/google.guard';
import { Response } from 'express';

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({
    type: TAuthResponse,
  })
  async login(
    @Body() payload: LoginPayload,
    @Res() res: Response,
  ): Promise<Response> {
    const authRes = await this.authService.validateUser(payload);
    this.setCookies(res, authRes.accessToken, authRes.refreshToken);
    return res.json(authRes);
  }

  @Post('register')
  @ApiOkResponse({
    type: TAuthResponse,
  })
  async register(
    @Body() payload: RegisterPayload,
    @Res() res: Response,
  ): Promise<Response> {
    const authRes = await this.authService.register(payload);
    this.setCookies(res, authRes.accessToken, authRes.refreshToken);

    return res.json(authRes);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req,
    @Res() res: Response,
  ): Promise<Response> {
    const authRes = await this.authService.handleGoogleCallback(req);

    this.setCookies(res, authRes.accessToken, authRes.refreshToken);

    return res.json(authRes);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@Req() req: IRequest) {
    await this.authService.logout(req.user._id);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshToken(
    @Req() req: IRequest,
    @Res() res: Response,
  ): Promise<Response> {
    const authRes = await this.authService.refreshTokens(req.user._id);

    this.setCookies(res, authRes.accessToken, authRes.refreshToken);

    return res.json(authRes);
  }

  setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict', // Prevent CSRF
      maxAge: 3600000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
