import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginPayload } from './dto/login.payload';
import { RegisterPayload } from './dto/register.payload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(payload: LoginPayload): Promise<any> {
    const user = await this.usersService.findByEmail(payload.email);
    if (user) {
      const isMatch = await bcrypt.compare(payload.password, user.password);
      if (isMatch) {
        const payload = { id: user._id, fullName: user.fullName };
        return { token: this.jwtService.sign(payload) };
      }
    }
    throw new UnauthorizedException(
      'Could not authenticate. Please try again.',
    );
  }

  async register(payload: RegisterPayload) {
    return await this.usersService.create(payload);
  }
}
