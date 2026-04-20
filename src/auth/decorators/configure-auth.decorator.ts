import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { AuthOption } from '../types';
import { CustomDecoratorKey } from '@/common/constants';

/**
 * Enable configuration of how request authentication is handled (the actual
 * authentication logic is handled by `{@link AuthGuard}`)
 */
export const ConfigureAuth = (opt: AuthOption): CustomDecorator =>
  SetMetadata(CustomDecoratorKey.AUTH_OPTION, opt);
