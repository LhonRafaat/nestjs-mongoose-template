import { Body, Controller, Post } from '@nestjs/common';
import { LoginPayload } from './dto/login.payload';
import { AuthService } from './auth.service';

Controller('auth');

export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async login(@Body() payload: LoginPayload) {
    return await this.authService.validateUser(payload);
  }

  @Post('register')
  register() {}
}
