import { ForbiddenError, MongoAbility, MongoQuery } from '@casl/ability';
import { ForbiddenException } from '@nestjs/common';

export type Action =
  | 'manage' // All actions
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | string;

export type Subjects = 'all' | string;

export type AppAbility = MongoAbility<[Action, Subjects], MongoQuery>;

export enum Effect {
  Allow = 'Allow',
  Deny = 'Deny',
}

export class ForbiddenWithReasonError {
  static throwUnlessCan(
    ability: AppAbility,
    action: Action,
    subject: Subjects,
  ) {
    try {
      // run CASL’s native check
      ForbiddenError.from(ability).throwUnlessCan(action, subject);
    } catch (err) {
      const subjectType = ability.detectSubjectType(subject);
      const rule = ability.relevantRuleFor(action, subjectType);
      const message =
        rule?.reason ||
        `You are not allowed to execute "${action}" on "${subjectType}"`;

      throw new ForbiddenException(message);
    }
  }
}
