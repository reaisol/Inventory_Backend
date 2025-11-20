import { IPolicyHandler } from '@app/authentication';
import { AppAbility } from '@app/authentication/interfaces/casl';
import { ForbiddenWithReasonError } from '@app/authentication/interfaces/casl';

export class CreateUserPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'create', 'users');
    return true;
  }
}

export class ReadUserPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'read', 'users');
    return true;
  }
}

export class UpdateUserPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'update', 'users');
    return true;
  }
}

export class DeleteUserPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'delete', 'users');
    return true;
  }
}

export class AssignRolePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'update', 'users');
    return true;
  }
}
