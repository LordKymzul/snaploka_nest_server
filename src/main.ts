import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    exposedHeaders: ['Authorization'],
  });
  app.setGlobalPrefix('/');
  app.useGlobalPipes(new ValidationPipe());


  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json', limit: '50mb' }));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


  const config = new DocumentBuilder()
    .setTitle('SNAPLOKA')
    .setDescription('SNAPLOKA API')
    .setVersion('1.0')
    .addTag('snaploka', 'SNAPLOKA API')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(process.env.PORT ?? 5151);
  console.log(`🚀 Server is running on port ${process.env.PORT ?? 5151}`);
  console.log(`🔗 Swagger UI: /api`);
  console.log(`🔍 Environment: ${process.env.NODE_ENV}`);

}
bootstrap();
