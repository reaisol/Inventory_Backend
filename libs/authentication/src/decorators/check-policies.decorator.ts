import { SetMetadata } from '@nestjs/common';
import { IPolicyHandler } from '../handler-definition';
import { CHECK_POLICIES_KEY } from '../constants';

export const CheckPolicies = (...handlers: IPolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
