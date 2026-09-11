import {
  ExecutionContext,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport';
import { GoogleStrategy } from '../../modules/auth/strategies/google.strategy';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  // Nest 12 only reads @Optional() from the class's own constructor, so it has to be re-declared
  constructor(
    @Optional() options?: AuthModuleOptions,
    // null when Google login is not configured (see AuthModule)
    @Optional() private readonly googleStrategy?: GoogleStrategy,
  ) {
    super(options);
  }

  canActivate(context: ExecutionContext) {
    if (!this.googleStrategy) {
      throw new NotFoundException('Google login is not configured');
    }
    return super.canActivate(context);
  }
}
