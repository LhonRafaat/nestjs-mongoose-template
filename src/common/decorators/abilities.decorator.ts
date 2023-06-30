import { SetMetadata } from '@nestjs/common';
import { RequiredRule } from '../helper/common-types';

export const CHECK_ABILITY = 'check_ability';

export const checkAbilities = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);
