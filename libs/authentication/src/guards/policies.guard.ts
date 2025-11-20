import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_POLICIES_KEY } from '../constants';
import { CaslAbilityFactory } from '../factories/casl-ability.factory';
import { IPolicyHandler } from '../handler-definition';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const policyHandlers =
      this.reflector.get<IPolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    if (policyHandlers.length === 0) {
      return true; // No policies required - allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Create ability for user
    const { ability } = await this.caslAbilityFactory.createForUser(user);
    // store the policy conditions in the request context
    request.ability = ability;
    // Execute all handlers
    for (const handler of policyHandlers) {
      const result = handler.handle(ability, request);
      // Handle both sync and async handlers
      const resolvedResult = result instanceof Promise ? await result : result;
      if (!resolvedResult) {
        throw new ForbiddenException(
          'Access denied, please ask your administrator to assign the required permissions',
        );
      }
    }

    return true;
  }
}
