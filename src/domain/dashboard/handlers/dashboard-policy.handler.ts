import { IPolicyHandler, AppAbility } from '@app/authentication';

export class ReadDashboardPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can('read', 'dashboard');
  }
}
