import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginPayload } from './dto/login.payload';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(payload: LoginPayload): Promise<any> {
    const user = await this.usersService.findByEmail(payload.email);
    if (user) {
      const isMatch = await bcrypt.compare(payload.password, user.password);

      if (isMatch) return user;
    }
    throw new UnauthorizedException(
      'Could not authenticate. Please try again.',
    );
  }
}
