import { Injectable, Logger } from '@nestjs/common';
import {
  createMongoAbility,
  AbilityBuilder,
  ExtractSubjectType,
} from '@casl/ability';
import { Repository } from 'typeorm';
import { AppAbility, Effect, Subjects } from '../interfaces/casl';
import { In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@app/database';
import { CurrentUser } from '../interfaces/user.interface';
import { PERMISSIONS } from '../permissions';

export interface AbilityPolicy {
  name: string;
  effect: Effect;
  actions: string[];
  resources: string[];
}

@Injectable()
export class CaslAbilityFactory {
  private readonly logger = new Logger(CaslAbilityFactory.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Create ability from user ID
   */
  async createForUser(user: CurrentUser): Promise<{
    ability: AppAbility;
  }> {
    // Handle both user.id and user.sub for compatibility
    const userId = user.id || (user as any).sub;
    const userRoles = user.roles || [];

    if (!userRoles || userRoles.length === 0) {
      return { ability: this.createEmptyAbility() };
    }

    const roles = await this.roleRepository.find({
      where: { id: In(userRoles) },
    });

    if (!roles || roles.length === 0) {
      return { ability: this.createEmptyAbility() };
    }

    const permissionNames = roles.flatMap((role) => role.permissions);
    const policies: AbilityPolicy[] = [];
    for (const permissionName of permissionNames) {
      const permission = PERMISSIONS[permissionName];
      if (permission) {
        policies.push({
          name: permissionName,
          effect: Effect.Allow,
          actions: [permission.action],
          resources: [permission.resource],
        });
      }
    }

    return { ability: this.createWithPolicies({ policies }) };
  }

  /**
   * Create ability from policies
   */
  createWithPolicies(withPolicies: { policies: AbilityPolicy[] }): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    if (!withPolicies.policies || withPolicies.policies.length === 0) {
      return build();
    }

    const policies = withPolicies.policies;
    policies.sort((a, b) => {
      return a.effect === Effect.Deny && b.effect === Effect.Allow
        ? -1
        : a.effect === Effect.Allow && b.effect === Effect.Deny
          ? 1
          : 0;
    });

    policies.forEach((p) => {
      p.actions.forEach((actionStr) => {
        let subject: string;
        let action: string;
        if (actionStr === '*') {
          action = 'manage';
          subject = 'all';
        } else if (actionStr === 'manage') {
          this.logger.error(
            "Error creating policy: 'manage' is a reserved keyword",
          );
          return;
        } else {
          if (p.resources.length > 0) {
            subject = p.resources[0];
            if (subject === 'all') {
              this.logger.error(
                "Error creating policy: 'all' is a reserved keyword",
              );
              return;
            }
          } else {
            subject = 'all';
          }
          action = actionStr;
        }
        // Build rule
        if (p.effect === Effect.Allow) {
          can(action as any, subject);
        } else {
          cannot(action as any, subject);
        }
      });
    });
    return build({
      detectSubjectType: (item) => {
        if (typeof item === 'string') {
          return item;
        }
        return 'all' as ExtractSubjectType<Subjects>;
      },
    });
  }

  private createEmptyAbility(): AppAbility {
    const { build } = new AbilityBuilder<AppAbility>(createMongoAbility);
    return build();
  }
}
