import { INestApplication, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';

export function configApp(app: INestApplication): INestApplication {
  app.use(
    compression({
      threshold: 0,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
    }),
  );
  app.use(
    helmet({ contentSecurityPolicy: true, crossOriginEmbedderPolicy: true }),
  );
  app.enableCors({
    credentials: true,
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.setGlobalPrefix('api', {
    exclude: ['health', 'metrics', 'api-docs', 'swagger/yaml'],
  });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  const config = new DocumentBuilder()
    .setTitle('Fessior template')
    .setDescription('Fessior template API description')
    .setVersion('1.0')
    .addTag('Fessior template')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    yamlDocumentUrl: 'swagger/yaml',
  });

  return app;
}
