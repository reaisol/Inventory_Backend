import { IPolicyHandler } from '@app/authentication';
import { AppAbility } from '@app/authentication/interfaces/casl';
import { ForbiddenWithReasonError } from '@app/authentication/interfaces/casl';

export class CreateCustomerPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'create', 'customers');
    return true;
  }
}

export class ReadCustomerPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'read', 'customers');
    return true;
  }
}

export class UpdateCustomerPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'update', 'customers');
    return true;
  }
}

export class DeleteCustomerPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'delete', 'customers');
    return true;
  }
}
