import { Body, Controller, Post } from '@nestjs/common';
import { LoginPayload } from './dto/login.payload';
import { AuthService } from './auth.service';
import { RegisterPayload } from './dto/register.payload';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() payload: LoginPayload) {
    return await this.authService.validateUser(payload);
  }

  @Post('register')
  async register(@Body() payload: RegisterPayload) {
    return await this.authService.register(payload);
  }
}
