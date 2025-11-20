import { AppAbility } from './interfaces/casl';

export interface IPolicyHandler {
  handle(ability: AppAbility, params?: any): Promise<boolean> | boolean;
}
