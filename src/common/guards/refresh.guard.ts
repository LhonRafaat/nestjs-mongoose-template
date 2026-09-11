import { Injectable, Optional } from '@nestjs/common';
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh') {
  // Nest 12 only reads @Optional() from the class's own constructor, so it has to be re-declared
  constructor(@Optional() options?: AuthModuleOptions) {
    super(options);
  }
}
