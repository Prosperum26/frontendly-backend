import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { ApiEnvGuard } from './common/api-env/guards';
import {
  authConfigObj,
  CommonConfig,
  commonConfigObj,
  observabilityConfigObj,
} from './common/config';
import { MetricsInterceptor } from './common/observability/interceptors';
import { ObservabilityModule } from './common/observability/observability.module';
import { EditorModule } from './editor/editor_module/editor.module';
import { UserModule } from './users/user.module';
import { LearningPathModule } from './learning-path/learning_path_module/learning_path.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [commonConfigObj, authConfigObj, observabilityConfigObj],
    }),
    MongooseModule.forRootAsync({
      useFactory: ({ dbUri }: CommonConfig) => ({ uri: dbUri }),
      inject: [commonConfigObj.KEY],
    }),
    ObservabilityModule,
    AuthModule,
    UserModule,
    EditorModule,
    LearningPathModule,
  ],
  providers: [
    {
      // Enable global validation of requests
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true, whitelist: true }),
    },
    { provide: APP_GUARD, useClass: ApiEnvGuard },
    // { provide: APP_GUARD, useClass: AuthGuard },
    {
      // Enable global response serialization
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
  ],
})
export class AppModule {}
