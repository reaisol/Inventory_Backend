import { IPolicyHandler } from '@app/authentication';
import { AppAbility } from '@app/authentication/interfaces/casl';
import { ForbiddenWithReasonError } from '@app/authentication/interfaces/casl';

export class CreateProductPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'create', 'products');
    return true;
  }
}

export class ReadProductPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'read', 'products');
    return true;
  }
}

export class UpdateProductPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'update', 'products');
    return true;
  }
}

export class DeleteProductPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    ForbiddenWithReasonError.throwUnlessCan(ability, 'delete', 'products');
    return true;
  }
}
