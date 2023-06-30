import {
  AbilityBuilder,
  ExtractSubjectType,
  MongoAbility,
  createMongoAbility,
} from '@casl/ability';
import { TUser } from '../../users/user.model';
import { Injectable } from '@nestjs/common';
import { Action, Subjects } from '../../../common/helper/common-types';

export type AppAbility = MongoAbility<[Action, Subjects]>; // create new AppAbility that concludes the subjects and actions we defined.

@Injectable()
export class CaslAbilityFactory {
  defineAbility(user: TUser) {
    const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user?.isAdmin) builder.can(Action.Manage, 'all');
    else builder.can(Action.Read, 'all');

    return builder.build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>, // see https://casl.js.org/v6/en/guide/subject-type-detection
    });
  }
}
