import { IPolicyHandler } from '@app/authentication';
import { AppAbility } from '@app/authentication/interfaces/casl';
import { ForbiddenWithReasonError } from '@app/authentication/interfaces/casl';

export class CreateRolePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'create', 'roles');
    return true;
  }
}

export class ReadRolePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'read', 'roles');
    return true;
  }
}

export class UpdateRolePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'update', 'roles');
    return true;
  }
}

export class DeleteRolePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'delete', 'roles');
    return true;
  }
}

export class ListPermissionsPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'read', 'roles');
    return true;
  }
}
