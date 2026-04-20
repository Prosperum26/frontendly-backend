import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { CommonConfig } from '@/common/config';
import { CustomDecoratorKey } from '@/common/constants';

export const MatchEnv = (envs: CommonConfig['nodeEnv'][]): CustomDecorator =>
  SetMetadata(CustomDecoratorKey.API_ENV, envs);
