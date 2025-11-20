import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationService } from './authentication.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JWT_CONSTANTS } from './constants';
import { DatabaseModule } from '@app/database';
import { Role } from '@app/database';
import { CaslAbilityFactory } from './factories/casl-ability.factory';
import { PoliciesGuard } from './guards/policies.guard';

@Module({
  imports: [
    PassportModule,
    DatabaseModule,
    TypeOrmModule.forFeature([Role]),
    JwtModule.register({
      privateKey: JWT_CONSTANTS.privateKey,
      publicKey: JWT_CONSTANTS.publicKey,
      signOptions: {
        expiresIn: JWT_CONSTANTS.expiresIn as any,
        issuer: 'https://api.example.com',
        algorithm: 'RS256',
      },
    }),
  ],
  providers: [
    AuthenticationService,
    JwtStrategy,
    CaslAbilityFactory,
    PoliciesGuard,
  ],
  exports: [AuthenticationService, CaslAbilityFactory, PoliciesGuard],
})
export class AuthenticationModule {}
