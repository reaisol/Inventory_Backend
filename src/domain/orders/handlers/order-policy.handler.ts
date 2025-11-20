import { IPolicyHandler } from '@app/authentication';
import { AppAbility } from '@app/authentication/interfaces/casl';
import { ForbiddenWithReasonError } from '@app/authentication/interfaces/casl';

export class CreateOrderPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'create', 'orders');
    return true;
  }
}

export class ReadOrderPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'read', 'orders');
    return true;
  }
}

export class UpdateOrderPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'update', 'orders');
    return true;
  }
}

export class CancelOrderPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'update', 'orders');
    return true;
  }
}
