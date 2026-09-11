import { Injectable, Optional } from '@nestjs/common';
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  // Nest 12 only reads @Optional() from the class's own constructor, so it has to be re-declared
  constructor(@Optional() options?: AuthModuleOptions) {
    super(options);
  }
}
